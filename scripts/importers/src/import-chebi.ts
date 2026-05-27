import "./lib/load-env";
import axios from "axios";
import { createReadStream, createWriteStream } from "fs";
import readline from "readline";
import { asNumber, asString, parseCliArgs } from "./lib/args";
import {
  connectMongo,
  createImportJob,
  disconnectMongo,
  patchImportJob,
  saveRawRecord,
  upsertSubstance
} from "./lib/db";
import { fetchWithRetry } from "./lib/http";
import { ImportLogger, wait } from "./lib/logger";
import { SubstanceInput } from "@molecular-match/shared";

const logger = new ImportLogger("chebi-import");

type ChebiResponse = {
  id?: number;
  chebi_accession?: string;
  name?: string;
  ascii_name?: string;
  definition?: string;
  names?: Record<string, Array<{ name: string; ascii_name?: string; source?: string; language_code?: string }>>;
  chemical_data?: {
    formula?: string;
    mass?: string;
    monoisotopic_mass?: string;
    charge?: number;
  };
  default_structure?: {
    smiles?: string;
    standard_inchi?: string;
    standard_inchi_key?: string;
  };
  roles_classification?: Array<{ name?: string }>;
  database_accessions?: Record<string, Array<{ source_name?: string; accession_number?: string; url?: string }>>;
};

async function loadIdsFromFile(filePath: string, limit: number): Promise<string[]> {
  const ids: string[] = [];
  const fileStream = createReadStream(filePath, { encoding: "utf8" });
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

  for await (const line of rl) {
    if (ids.length >= limit) break;
    const tokens = line.split(/[\s,;\t]+/).map((x) => x.trim()).filter(Boolean);
    for (const token of tokens) {
      const match = token.match(/(CHEBI:\d+|\b\d+\b)/i);
      if (!match) continue;
      const value = match[1]!.toUpperCase();
      ids.push(value.startsWith("CHEBI:") ? value : `CHEBI:${value}`);
      if (ids.length >= limit) break;
    }
  }

  return ids;
}

async function downloadIdsToTemp(url: string): Promise<string> {
  const temp = `${process.cwd()}/.chebi_ids_${Date.now()}.txt`;
  const response = await axios.get(url, { responseType: "stream", timeout: 60000 });
  await new Promise<void>((resolve, reject) => {
    const ws = createWriteStream(temp);
    response.data.pipe(ws);
    ws.on("finish", resolve);
    ws.on("error", reject);
  });
  return temp;
}

async function fetchChebiCompound(chebiId: string): Promise<ChebiResponse | null> {
  const url = `https://www.ebi.ac.uk/chebi/backend/api/public/compound/${encodeURIComponent(chebiId)}/`;
  try {
    const response = await axios.get<ChebiResponse>(url, { timeout: 45000 });
    return response.data;
  } catch (error: any) {
    if (error?.response?.status === 404) return null;
    throw error;
  }
}

function normalizeFromChebi(item: ChebiResponse): SubstanceInput {
  const chebiId = item.chebi_accession ?? (item.id ? `CHEBI:${item.id}` : "CHEBI:unknown");
  const now = new Date();

  const synonyms = Object.values(item.names ?? {})
    .flat()
    .slice(0, 25)
    .map((entry) => ({
      value: entry.ascii_name || entry.name,
      source: entry.source || "ChEBI",
      language: entry.language_code
    }));

  const biologicalRole = (item.roles_classification ?? []).map((role) => role.name).filter(Boolean) as string[];

  return {
    primaryName: item.name || item.ascii_name || chebiId,
    description: item.definition,
    molecularFormula: item.chemical_data?.formula,
    masses: {
      molecularWeight: item.chemical_data?.mass ? Number(item.chemical_data.mass) : undefined,
      monoisotopicMass: item.chemical_data?.monoisotopic_mass
        ? Number(item.chemical_data.monoisotopic_mass)
        : undefined,
      averageMass: item.chemical_data?.mass ? Number(item.chemical_data.mass) : undefined
    },
    identifiers: {
      chebiId,
      smiles: item.default_structure?.smiles,
      inchi: item.default_structure?.standard_inchi,
      inchikey: item.default_structure?.standard_inchi_key
    },
    synonyms,
    sources: [
      {
        name: "ChEBI",
        externalId: chebiId,
        externalUrl: `https://www.ebi.ac.uk/chebi/searchId.do?chebiId=${encodeURIComponent(chebiId)}`,
        licenseType: "open",
        importedAt: now,
        lastSeenAt: now,
        sourceReliabilityScore: 85,
        rawAvailable: true
      }
    ],
    categories: {
      biologicalRole,
      substanceType: "compound"
    },
    clinical: {},
    flags: {
      isDemo: false,
      hasRestrictedCommercialSource: false
    }
  };
}

async function main() {
  const args = parseCliArgs(process.argv.slice(2));
  const limit = asNumber(args.limit ?? process.env.npm_config_limit, 5000);
  const file = asString(args.file ?? process.env.npm_config_file, "");
  const jobId = asString(args["job-id"] ?? process.env.npm_config_job_id, "");
  const startId = asNumber(args["start-id"] ?? process.env.npm_config_start_id, 1);
  const sourceMode = process.env.CHEBI_SOURCE_MODE ?? "api_scan";
  const sourceUrl = process.env.CHEBI_DOWNLOAD_URL ?? "";

  const mongodbUri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB_NAME ?? "molecular_match";
  if (!mongodbUri) throw new Error("MONGODB_URI nao configurada");

  await connectMongo(mongodbUri, dbName);

  const job = await createImportJob({
    source: "ChEBI",
    totalRequested: limit,
    checkpoint: { sourceMode, sourceUrl, file, limit, startId },
    existingJobId: jobId || undefined
  });

  const counters = { totalRead: 0, created: 0, updated: 0, skipped: 0, failed: 0 };

  try {
    let ids: string[] = [];

    if (file) {
      ids = await loadIdsFromFile(file, limit);
    } else if (sourceMode === "download" && sourceUrl) {
      const tempPath = await downloadIdsToTemp(sourceUrl);
      ids = await loadIdsFromFile(tempPath, limit);
    }

    if (!ids.length) {
      logger.info("Modo api_scan ativo para ChEBI");
      let current = startId;
      let attempts = 0;
      const maxAttempts = limit * 40;

      while (ids.length < limit && attempts < maxAttempts) {
        ids.push(`CHEBI:${current}`);
        current += 1;
        attempts += 1;
      }
    }

    for (let i = 0; i < ids.length; i += 1) {
      if (counters.totalRead >= limit) break;

      const chebiId = ids[i]!;
      try {
        const entity = await fetchWithRetry(() => fetchChebiCompound(chebiId), 3, 400);
        if (!entity) {
          counters.skipped += 1;
          continue;
        }

        const normalized = normalizeFromChebi(entity);
        const op = await upsertSubstance(normalized);
        counters[op] += 1;
        counters.totalRead += 1;

        await saveRawRecord("ChEBI", chebiId, entity as unknown as Record<string, unknown>);

        if (counters.totalRead % 25 === 0) {
          await patchImportJob(String(job._id), {
            status: "running",
            totalRead: counters.totalRead,
            created: counters.created,
            updated: counters.updated,
            skipped: counters.skipped,
            failed: counters.failed,
            checkpoint: { cursor: i + 1, chebiId }
          });
        }

        await wait(90);
      } catch (error: any) {
        counters.failed += 1;
        await patchImportJob(String(job._id), {
          failed: counters.failed,
          $push: {
            errors: {
              externalId: chebiId,
              message: error?.message ?? "Falha ChEBI",
              stack: error?.stack,
              createdAt: new Date()
            }
          }
        });
      }
    }

    await patchImportJob(String(job._id), {
      status: counters.failed > 0 ? "partial" : "completed",
      finishedAt: new Date(),
      totalRead: counters.totalRead,
      created: counters.created,
      updated: counters.updated,
      skipped: counters.skipped,
      failed: counters.failed
    });

    logger.info("Importacao ChEBI finalizada", { jobId: String(job._id), ...counters });
  } catch (error: any) {
    await patchImportJob(String(job._id), {
      status: "failed",
      finishedAt: new Date(),
      failed: counters.failed + 1,
      $push: {
        errors: {
          message: error?.message ?? "Erro geral ChEBI",
          stack: error?.stack,
          createdAt: new Date()
        }
      }
    });

    logger.error("Falha no importador ChEBI", { message: error?.message });
    throw error;
  } finally {
    await disconnectMongo();
  }
}

main().catch((error) => {
  logger.error("Execucao encerrada com erro", { message: error?.message });
  process.exitCode = 1;
});


