import "./lib/load-env";
import { createReadStream } from "fs";
import sax from "sax";
import { asString, parseCliArgs } from "./lib/args";
import {
  connectMongo,
  createImportJob,
  disconnectMongo,
  patchImportJob,
  saveRawRecord,
  upsertSubstance
} from "./lib/db";
import { ImportLogger } from "./lib/logger";
import { SubstanceInput } from "@molecular-match/shared";

const logger = new ImportLogger("hmdb-import");

interface PartialMetabolite {
  hmdbId?: string;
  name?: string;
  iupacName?: string;
  description?: string;
  formula?: string;
  averageMass?: number;
  monoisotopicMass?: number;
  smiles?: string;
  inchi?: string;
  inchikey?: string;
  synonyms: string[];
  biospecimens: string[];
  pathways: string[];
  diseases: string[];
  normalConcentrations: string[];
  abnormalConcentrations: string[];
}

function emptyMetabolite(): PartialMetabolite {
  return {
    synonyms: [],
    biospecimens: [],
    pathways: [],
    diseases: [],
    normalConcentrations: [],
    abnormalConcentrations: []
  };
}

async function main() {
  const args = parseCliArgs(process.argv.slice(2));
  const file = asString(
    args.file ?? process.env.npm_config_file,
    process.env.HMDB_XML_FILE ?? "./data/hmdb_metabolites.xml"
  );
  const jobId = asString(args["job-id"] ?? process.env.npm_config_job_id, "");
  const hmdbEnableImport = (process.env.HMDB_ENABLE_IMPORT ?? "true") === "true";

  if (!hmdbEnableImport) {
    throw new Error("Importacao HMDB desabilitada por HMDB_ENABLE_IMPORT=false");
  }

  const mongodbUri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB_NAME ?? "molecular_match";
  if (!mongodbUri) throw new Error("MONGODB_URI nao configurada");

  await connectMongo(mongodbUri, dbName);

  const job = await createImportJob({
    source: "HMDB",
    totalRequested: 0,
    checkpoint: { file },
    existingJobId: jobId || undefined
  });

  const counters = { totalRead: 0, created: 0, updated: 0, skipped: 0, failed: 0 };

  try {
    const parser = sax.createStream(true, { trim: true, normalize: true });
    const stream = createReadStream(file, { encoding: "utf8" });

    let current: PartialMetabolite | null = null;
    let tagStack: string[] = [];
    let textBuffer = "";
    let queue = Promise.resolve();

    const maybePush = (arr: string[], value: string) => {
      if (!value) return;
      const cleaned = value.trim();
      if (!cleaned) return;
      if (!arr.includes(cleaned)) arr.push(cleaned);
    };

    const processMetabolite = async (metabolite: PartialMetabolite) => {
      if (!metabolite.hmdbId || !metabolite.name) return;

      const now = new Date();
      const normalized: SubstanceInput = {
        primaryName: metabolite.name,
        iupacName: metabolite.iupacName,
        description: metabolite.description,
        molecularFormula: metabolite.formula,
        masses: {
          averageMass: metabolite.averageMass,
          molecularWeight: metabolite.averageMass,
          monoisotopicMass: metabolite.monoisotopicMass
        },
        identifiers: {
          hmdbId: metabolite.hmdbId,
          inchi: metabolite.inchi,
          inchikey: metabolite.inchikey,
          smiles: metabolite.smiles
        },
        synonyms: metabolite.synonyms.map((value) => ({ value, source: "HMDB" })),
        sources: [
          {
            name: "HMDB",
            externalId: metabolite.hmdbId,
            externalUrl: `https://hmdb.ca/metabolites/${metabolite.hmdbId}`,
            licenseType: "restricted_commercial_use",
            importedAt: now,
            lastSeenAt: now,
            sourceReliabilityScore: 80,
            rawAvailable: true
          }
        ],
        categories: {
          biospecimens: metabolite.biospecimens,
          pathways: metabolite.pathways
        },
        clinical: {
          diseases: metabolite.diseases,
          normalConcentrations: metabolite.normalConcentrations,
          abnormalConcentrations: metabolite.abnormalConcentrations
        },
        flags: {
          isDemo: false,
          hasRestrictedCommercialSource: true
        }
      };

      const op = await upsertSubstance(normalized);
      counters[op] += 1;
      counters.totalRead += 1;

      await saveRawRecord("HMDB", metabolite.hmdbId, metabolite as unknown as Record<string, unknown>);

      if (counters.totalRead % 20 === 0) {
        await patchImportJob(String(job._id), {
          status: "running",
          totalRead: counters.totalRead,
          created: counters.created,
          updated: counters.updated,
          skipped: counters.skipped,
          failed: counters.failed,
          checkpoint: { lastExternalId: metabolite.hmdbId, count: counters.totalRead }
        });
      }
    };

    parser.on("opentag", (node) => {
      tagStack.push(node.name);
      textBuffer = "";
      if (node.name === "metabolite") {
        current = emptyMetabolite();
      }
    });

    parser.on("text", (text) => {
      textBuffer += text;
    });

    parser.on("closetag", (tag) => {
      if (!current) {
        tagStack.pop();
        textBuffer = "";
        return;
      }

      const path = tagStack.join("/");
      const value = textBuffer.trim();

      if (value) {
        if (path.endsWith("metabolite/accession")) current.hmdbId = value;
        else if (path.endsWith("metabolite/name")) current.name = value;
        else if (path.endsWith("metabolite/iupac_name")) current.iupacName = value;
        else if (path.endsWith("metabolite/description")) current.description = value;
        else if (path.endsWith("metabolite/chemical_formula")) current.formula = value;
        else if (path.endsWith("metabolite/average_molecular_weight")) current.averageMass = Number(value);
        else if (path.endsWith("metabolite/monisotopic_molecular_weight") || path.endsWith("metabolite/monoisotopic_molecular_weight")) current.monoisotopicMass = Number(value);
        else if (path.endsWith("metabolite/smiles")) current.smiles = value;
        else if (path.endsWith("metabolite/inchi")) current.inchi = value;
        else if (path.endsWith("metabolite/inchikey")) current.inchikey = value;
        else if (path.endsWith("metabolite/synonyms/synonym")) maybePush(current.synonyms, value);
        else if (path.endsWith("metabolite/biological_properties/biospecimen_locations/biospecimen")) maybePush(current.biospecimens, value);
        else if (path.endsWith("metabolite/biological_properties/pathways/pathway/name")) maybePush(current.pathways, value);
        else if (path.endsWith("metabolite/diseases/disease/name")) maybePush(current.diseases, value);
        else if (path.endsWith("metabolite/normal_concentrations/normal_concentration/concentration_value")) maybePush(current.normalConcentrations, value);
        else if (path.endsWith("metabolite/abnormal_concentrations/abnormal_concentration/concentration_value")) maybePush(current.abnormalConcentrations, value);
      }

      if (tag === "metabolite") {
        const snapshot = current;
        queue = queue
          .then(() => processMetabolite(snapshot))
          .catch(async (error) => {
            counters.failed += 1;
            await patchImportJob(String(job._id), {
              failed: counters.failed,
              $push: {
                errors: {
                  externalId: snapshot?.hmdbId,
                  message: error?.message ?? "Falha HMDB",
                  stack: error?.stack,
                  createdAt: new Date()
                }
              }
            });
          });
        current = null;
      }

      tagStack.pop();
      textBuffer = "";
    });

    const done = new Promise<void>((resolve, reject) => {
      parser.on("end", () => resolve());
      parser.on("error", (error) => reject(error));
    });

    stream.pipe(parser);
    await done;
    await queue;

    await patchImportJob(String(job._id), {
      status: counters.failed > 0 ? "partial" : "completed",
      finishedAt: new Date(),
      totalRead: counters.totalRead,
      created: counters.created,
      updated: counters.updated,
      skipped: counters.skipped,
      failed: counters.failed
    });

    logger.info("Importacao HMDB finalizada", { jobId: String(job._id), ...counters });
  } catch (error: any) {
    await patchImportJob(String(job._id), {
      status: "failed",
      finishedAt: new Date(),
      failed: counters.failed + 1,
      $push: {
        errors: {
          message: error?.message ?? "Erro HMDB",
          stack: error?.stack,
          createdAt: new Date()
        }
      }
    });

    logger.error("Falha no importador HMDB", { message: error?.message });
    throw error;
  } finally {
    await disconnectMongo();
  }
}

main().catch((error) => {
  logger.error("Execucao encerrada com erro", { message: error?.message });
  process.exitCode = 1;
});


