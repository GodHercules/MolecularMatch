import crypto from "crypto";
import mongoose, { Schema } from "mongoose";
import { MinimalSubstanceDoc, SubstanceInput, dedupeKey, mergeSubstance } from "@molecular-match/shared";

const SubstanceSchema = new Schema(
  {
    primaryName: { type: String, required: true, index: true },
    iupacName: String,
    description: String,
    molecularFormula: String,
    masses: {
      molecularWeight: Number,
      exactMass: Number,
      monoisotopicMass: Number,
      averageMass: Number
    },
    normalizedMasses: {
      molecularWeightRounded: Number,
      exactMassRounded: Number,
      monoisotopicMassRounded: Number,
      averageMassRounded: Number
    },
    identifiers: {
      pubchemCid: String,
      chebiId: String,
      hmdbId: String,
      cas: [String],
      inchi: String,
      inchikey: String,
      smiles: String,
      canonicalSmiles: String,
      isomericSmiles: String
    },
    synonyms: [{ value: String, source: String, language: String }],
    sources: [
      {
        name: String,
        externalId: String,
        externalUrl: String,
        licenseType: { type: String, enum: ["open", "restricted_commercial_use", "unknown"] },
        importedAt: Date,
        lastSeenAt: Date,
        sourceReliabilityScore: Number,
        rawAvailable: Boolean
      }
    ],
    categories: Schema.Types.Mixed,
    clinical: Schema.Types.Mixed,
    computed: Schema.Types.Mixed,
    rawRefs: [Schema.Types.Mixed],
    flags: Schema.Types.Mixed
  },
  { timestamps: true, collection: "substances" }
);

SubstanceSchema.index({ "masses.molecularWeight": 1 });
SubstanceSchema.index({ "masses.exactMass": 1 });
SubstanceSchema.index({ "masses.monoisotopicMass": 1 });
SubstanceSchema.index({ "masses.averageMass": 1 });
SubstanceSchema.index({ "identifiers.inchikey": 1 });
SubstanceSchema.index({ "identifiers.pubchemCid": 1 });
SubstanceSchema.index({ "identifiers.chebiId": 1 });
SubstanceSchema.index({ "identifiers.hmdbId": 1 });
SubstanceSchema.index({
  primaryName: "text",
  "synonyms.value": "text",
  molecularFormula: "text"
});
SubstanceSchema.index({ "sources.name": 1 });
SubstanceSchema.index({ "flags.hasRestrictedCommercialSource": 1 });
SubstanceSchema.index({ "computed.clinicalRelevanceScore": -1 });
SubstanceSchema.index({ "computed.sourceReliabilityScore": -1 });

const RawImportSchema = new Schema(
  {
    source: { type: String, enum: ["PubChem", "ChEBI", "HMDB"], required: true },
    externalId: { type: String, required: true },
    rawPayload: { type: Schema.Types.Mixed, required: true },
    importedAt: { type: Date, required: true },
    parserVersion: { type: String, required: true },
    checksum: { type: String, required: true }
  },
  { timestamps: false, collection: "raw_import_records" }
);
RawImportSchema.index({ source: 1, externalId: 1 }, { unique: true });

const ImportJobSchema = new Schema(
  {
    source: String,
    status: { type: String, enum: ["pending", "running", "completed", "failed", "partial"] },
    totalRequested: Number,
    totalRead: Number,
    created: Number,
    updated: Number,
    skipped: Number,
    failed: Number,
    checkpoint: Schema.Types.Mixed,
    errors: [Schema.Types.Mixed],
    startedAt: Date,
    finishedAt: Date
  },
  { timestamps: true, collection: "import_jobs" }
);

export const SubstanceModel = mongoose.model("Substance", SubstanceSchema);
export const RawImportRecordModel = mongoose.model("RawImportRecord", RawImportSchema);
export const ImportJobModel = mongoose.model("ImportJob", ImportJobSchema);

export interface ImportCounters {
  totalRead: number;
  created: number;
  updated: number;
  skipped: number;
  failed: number;
}

export async function connectMongo(uri: string, dbName: string) {
  await mongoose.connect(uri, { dbName });
}

export async function disconnectMongo() {
  await mongoose.disconnect();
}

export async function createImportJob(input: {
  source: string;
  totalRequested: number;
  checkpoint?: Record<string, unknown>;
  existingJobId?: string;
}) {
  if (input.existingJobId) {
    const updated = await ImportJobModel.findByIdAndUpdate(
      input.existingJobId,
      {
        $set: {
          source: input.source,
          status: "running",
          totalRequested: input.totalRequested,
          startedAt: new Date(),
          finishedAt: null,
          checkpoint: input.checkpoint ?? {}
        }
      },
      { new: true }
    );

    if (!updated) throw new Error("ImportJob informado nao encontrado");
    return updated;
  }

  return ImportJobModel.create({
    source: input.source,
    status: "running",
    totalRequested: input.totalRequested,
    totalRead: 0,
    created: 0,
    updated: 0,
    skipped: 0,
    failed: 0,
    checkpoint: input.checkpoint ?? {},
    errors: [],
    startedAt: new Date()
  });
}

export async function patchImportJob(
  id: string,
  patch: Record<string, unknown>
) {
  const hasOperator = Object.keys(patch).some((k) => k.startsWith("$"));
  const updateDoc = hasOperator ? patch : { $set: patch };
  await ImportJobModel.findByIdAndUpdate(id, updateDoc).exec();
}

export async function saveRawRecord(
  source: "PubChem" | "ChEBI" | "HMDB",
  externalId: string,
  rawPayload: Record<string, unknown>
) {
  const checksum = crypto
    .createHash("sha256")
    .update(JSON.stringify(rawPayload))
    .digest("hex");

  await RawImportRecordModel.updateOne(
    { source, externalId },
    {
      $set: {
        source,
        externalId,
        rawPayload,
        importedAt: new Date(),
        parserVersion: "1.0.0",
        checksum
      }
    },
    { upsert: true }
  );
}

function calcComputed(doc: any) {
  const idScore = [
    doc.identifiers?.pubchemCid,
    doc.identifiers?.chebiId,
    doc.identifiers?.hmdbId,
    doc.identifiers?.inchi,
    doc.identifiers?.inchikey,
    doc.identifiers?.smiles
  ].filter(Boolean).length;

  const sourceRel =
    doc.sources?.length > 0
      ? doc.sources.reduce((sum: number, s: any) => sum + (s.sourceReliabilityScore ?? 0), 0) /
        doc.sources.length
      : 0;

  const clinicalScore = doc.clinical?.diseases?.length
    ? Math.min(doc.clinical.diseases.length * 8, 30)
    : 0;

  return {
    sourceCount: doc.sources?.length ?? 0,
    synonymCount: doc.synonyms?.length ?? 0,
    identifierCompletenessScore: idScore * 10,
    clinicalRelevanceScore: clinicalScore,
    sourceReliabilityScore: Number(sourceRel.toFixed(2)),
    totalCompletenessScore: Math.min(100, idScore * 10 + clinicalScore + (doc.sources?.length ?? 0) * 5)
  };
}

export async function upsertSubstance(input: SubstanceInput): Promise<"created" | "updated" | "skipped"> {
  const keys = dedupeKey(input);
  if (!keys.length) return "skipped";

  const or: Record<string, unknown>[] = [];

  if (input.identifiers.inchikey) {
    or.push({ "identifiers.inchikey": input.identifiers.inchikey.toUpperCase() });
  }
  if (input.identifiers.pubchemCid) {
    or.push({ "identifiers.pubchemCid": input.identifiers.pubchemCid });
  }
  if (input.identifiers.chebiId) {
    or.push({ "identifiers.chebiId": input.identifiers.chebiId });
  }
  if (input.identifiers.hmdbId) {
    or.push({ "identifiers.hmdbId": input.identifiers.hmdbId });
  }
  if (input.molecularFormula && input.masses.monoisotopicMass) {
    or.push({
      molecularFormula: input.molecularFormula,
      "masses.monoisotopicMass": {
        $gte: input.masses.monoisotopicMass - 0.001,
        $lte: input.masses.monoisotopicMass + 0.001
      }
    });
  }
  if (input.primaryName && input.molecularFormula) {
    or.push({ primaryName: input.primaryName, molecularFormula: input.molecularFormula });
  }

  const existing = or.length ? await SubstanceModel.findOne({ $or: or }).lean() : null;

  const normalizedIncoming: MinimalSubstanceDoc = {
    primaryName: input.primaryName,
    molecularFormula: input.molecularFormula,
    masses: input.masses,
    identifiers: {
      pubchemCid: input.identifiers.pubchemCid,
      chebiId: input.identifiers.chebiId,
      hmdbId: input.identifiers.hmdbId,
      inchikey: input.identifiers.inchikey
    },
    synonyms: input.synonyms,
    sources: input.sources
  };

  const merged = existing
    ? mergeSubstance(existing as unknown as MinimalSubstanceDoc, input)
    : normalizedIncoming;

  const payload = {
    ...existing,
    ...input,
    ...merged,
    identifiers: {
      ...(existing as any)?.identifiers,
      ...input.identifiers,
      ...merged.identifiers,
      inchikey: merged.identifiers.inchikey?.toUpperCase()
    },
    normalizedMasses: {
      molecularWeightRounded: merged.masses.molecularWeight
        ? Number(merged.masses.molecularWeight.toFixed(6))
        : undefined,
      exactMassRounded: merged.masses.exactMass ? Number(merged.masses.exactMass.toFixed(6)) : undefined,
      monoisotopicMassRounded: merged.masses.monoisotopicMass
        ? Number(merged.masses.monoisotopicMass.toFixed(6))
        : undefined,
      averageMassRounded: merged.masses.averageMass
        ? Number(merged.masses.averageMass.toFixed(6))
        : undefined
    },
    flags: {
      isDemo: input.flags?.isDemo ?? false,
      hasRestrictedCommercialSource: merged.sources.some((s) => s.licenseType === "restricted_commercial_use"),
      hasClinicalData: Boolean(input.clinical?.diseases?.length || input.clinical?.notes),
      hasToxicologyData: Boolean(input.categories?.toxicologyCategory),
      hasIncompleteMassData:
        !merged.masses.molecularWeight &&
        !merged.masses.exactMass &&
        !merged.masses.monoisotopicMass &&
        !merged.masses.averageMass
    }
  };

  (payload as any).computed = calcComputed(payload);

  if (existing?._id) {
    await SubstanceModel.updateOne({ _id: existing._id }, { $set: payload }).exec();
    return "updated";
  }

  await SubstanceModel.create(payload);
  return "created";
}

export async function getDbStats() {
  const db = mongoose.connection.db;
  if (!db) {
    throw new Error("Conexao MongoDB indisponivel");
  }
  const stats = await db.stats();
  return stats;
}

