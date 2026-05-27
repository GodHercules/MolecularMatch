import "./lib/load-env";
import {
  SubstanceInput,
  roundMass
} from "@molecular-match/shared";
import { asBoolean, asNumber, parseCliArgs, asString } from "./lib/args";
import {
  connectMongo,
  createImportJob,
  disconnectMongo,
  getDbStats,
  patchImportJob,
  saveRawRecord,
  upsertSubstance
} from "./lib/db";
import { fetchWithRetry, httpGetJson } from "./lib/http";
import { ImportLogger, wait } from "./lib/logger";

interface PubchemProperty {
  CID: number;
  Title?: string;
  IUPACName?: string;
  MolecularFormula?: string;
  MolecularWeight?: number;
  ExactMass?: number;
  MonoisotopicMass?: number;
  CanonicalSMILES?: string;
  IsomericSMILES?: string;
  InChI?: string;
  InChIKey?: string;
  XLogP?: number;
  TPSA?: number;
  Charge?: number;
}

const logger = new ImportLogger("pubchem-import");

function toNumber(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const match = value.match(/-?\d+(?:\.\d+)?/);
    if (!match) return undefined;
    const parsed = Number(match[0]);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
}

async function getSynonyms(baseUrl: string, cid: number): Promise<string[]> {
  const url = `${baseUrl}/compound/cid/${cid}/synonyms/JSON`;
  const data = await fetchWithRetry(
    () => httpGetJson<any>(url, 45000),
    4,
    400
  );
  const synonyms = data?.InformationList?.Information?.[0]?.Synonym;
  if (!Array.isArray(synonyms)) return [];
  return synonyms.slice(0, 15);
}

async function main() {
  const args = parseCliArgs(process.argv.slice(2));

  const startCid = asNumber(
    args["start-cid"] ?? process.env.npm_config_start_cid,
    1
  );
  const limit = asNumber(
    args.limit ?? process.env.npm_config_limit,
    Number(process.env.PUBCHEM_DEFAULT_IMPORT_LIMIT ?? 50000)
  );
  const chunkSize = asNumber(args["chunk-size"] ?? process.env.npm_config_chunk_size, 100);
  const resume = asBoolean(args.resume ?? process.env.npm_config_resume, false);
  const jobId = asString(args["job-id"] ?? process.env.npm_config_job_id, "");
  const includeSynonyms = asBoolean(args["include-synonyms"], true);
  const rateLimitMs = Number(process.env.PUBCHEM_RATE_LIMIT_MS ?? 250);

  const mongodbUri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB_NAME ?? "molecular_match";

  if (!mongodbUri) {
    throw new Error("MONGODB_URI nao configurada");
  }

  await connectMongo(mongodbUri, dbName);

  const baseUrl = process.env.PUBCHEM_BASE_URL ?? "https://pubchem.ncbi.nlm.nih.gov/rest/pug";
  const safeFreeLimit = Number(process.env.PUBCHEM_SAFE_FREE_TIER_LIMIT ?? 5000);
  const parserVersion = "1.0.0";

  let cursor = startCid;
  const maxCid = startCid + limit - 1;

  const job = await createImportJob({
    source: "PubChem",
    totalRequested: limit,
    checkpoint: { cursor, startCid, limit, chunkSize, parserVersion },
    existingJobId: jobId || undefined
  });

  logger.info("Job iniciado", { jobId: String(job._id), startCid, limit, chunkSize, resume });

  const counters = {
    totalRead: 0,
    created: 0,
    updated: 0,
    skipped: 0,
    failed: 0
  };

  try {
    while (cursor <= maxCid) {
      const end = Math.min(cursor + chunkSize - 1, maxCid);
      const cids: number[] = [];
      for (let cid = cursor; cid <= end; cid += 1) cids.push(cid);

      const propertiesUrl =
        `${baseUrl}/compound/cid/${cids.join(",")}` +
        "/property/Title,IUPACName,MolecularFormula,MolecularWeight,ExactMass,MonoisotopicMass,CanonicalSMILES,IsomericSMILES,InChI,InChIKey,XLogP,TPSA,Charge/JSON";

      const payload = await fetchWithRetry(
        () => httpGetJson<any>(propertiesUrl, 50000),
        5,
        500
      );

      const rows = (payload?.PropertyTable?.Properties ?? []) as PubchemProperty[];
      counters.totalRead += rows.length;

      for (const row of rows) {
        try {
          await wait(rateLimitMs);

          const synonyms = includeSynonyms
            ? await fetchWithRetry(() => getSynonyms(baseUrl, row.CID), 2, 250)
            : [];

          const now = new Date();

          const normalized: SubstanceInput = {
            primaryName: row.Title || `CID ${row.CID}`,
            iupacName: row.IUPACName,
            molecularFormula: row.MolecularFormula,
            masses: {
              molecularWeight: toNumber(row.MolecularWeight),
              exactMass: toNumber(row.ExactMass),
              monoisotopicMass: toNumber(row.MonoisotopicMass),
              averageMass: toNumber(row.MolecularWeight)
            },
            identifiers: {
              pubchemCid: String(row.CID),
              inchi: row.InChI,
              inchikey: row.InChIKey,
              smiles: row.CanonicalSMILES,
              canonicalSmiles: row.CanonicalSMILES,
              isomericSmiles: row.IsomericSMILES
            },
            synonyms: synonyms.map((value) => ({ value, source: "PubChem" })),
            sources: [
              {
                name: "PubChem",
                externalId: String(row.CID),
                externalUrl: `https://pubchem.ncbi.nlm.nih.gov/compound/${row.CID}`,
                licenseType: "open",
                importedAt: now,
                lastSeenAt: now,
                sourceReliabilityScore: 90,
                rawAvailable: true
              }
            ],
            categories: {
              substanceType: "compound"
            },
            clinical: {},
            flags: {
              isDemo: false,
              hasRestrictedCommercialSource: false
            }
          };

          const op = await upsertSubstance(normalized);
          counters[op] += 1;

          await saveRawRecord("PubChem", String(row.CID), row as unknown as Record<string, unknown>);
        } catch (error: any) {
          counters.failed += 1;
          await patchImportJob(String(job._id), {
            $push: {
              errors: {
                externalId: String(row.CID),
                message: error?.message ?? "Erro desconhecido",
                stack: error?.stack,
                createdAt: new Date()
              }
            }
          });
        }
      }

      cursor = end + 1;

      const dbStats = await getDbStats();
      const usedBytes = Number(dbStats?.dataSize ?? 0) + Number(dbStats?.indexSize ?? 0);
      const usedMB = usedBytes / (1024 * 1024);

      await patchImportJob(String(job._id), {
        status: "running",
        totalRead: counters.totalRead,
        created: counters.created,
        updated: counters.updated,
        skipped: counters.skipped,
        failed: counters.failed,
        checkpoint: { cursor, startCid, limit, chunkSize, usedMB: Number(usedMB.toFixed(2)) }
      });

      logger.info("Chunk processado", {
        jobId: String(job._id),
        cursor,
        maxCid,
        totalRead: counters.totalRead,
        created: counters.created,
        updated: counters.updated,
        failed: counters.failed,
        usedMB: Number(usedMB.toFixed(2))
      });

      if (usedMB >= 480 || counters.created + counters.updated >= safeFreeLimit * 2) {
        logger.warn("Parada segura acionada por risco de limite free tier", {
          usedMB,
          safeFreeLimit,
          cursor
        });

        await patchImportJob(String(job._id), {
          status: "partial",
          finishedAt: new Date(),
          totalRead: counters.totalRead,
          created: counters.created,
          updated: counters.updated,
          skipped: counters.skipped,
          failed: counters.failed,
          checkpoint: { cursor, reason: "free_tier_limit_guard", usedMB: Number(usedMB.toFixed(2)) }
        });
        await disconnectMongo();
        return;
      }
    }

    await patchImportJob(String(job._id), {
      status: "completed",
      finishedAt: new Date(),
      totalRead: counters.totalRead,
      created: counters.created,
      updated: counters.updated,
      skipped: counters.skipped,
      failed: counters.failed,
      checkpoint: { cursor, completed: true }
    });

    logger.info("Importacao PubChem finalizada", { jobId: String(job._id), ...counters });
  } catch (error: any) {
    await patchImportJob(String(job._id), {
      status: "failed",
      finishedAt: new Date(),
      totalRead: counters.totalRead,
      created: counters.created,
      updated: counters.updated,
      skipped: counters.skipped,
      failed: counters.failed + 1,
      checkpoint: { cursor, failed: true },
      $push: {
        errors: {
          message: error?.message ?? "Falha inesperada",
          stack: error?.stack,
          createdAt: new Date()
        }
      }
    });

    logger.error("Falha no importador PubChem", { error: error?.message, cursor });
    throw error;
  } finally {
    await disconnectMongo();
  }
}

main().catch((error) => {
  logger.error("Execucao encerrada com erro", { message: error?.message });
  process.exitCode = 1;
});


