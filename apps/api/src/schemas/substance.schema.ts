import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

export type SubstanceDocument = HydratedDocument<Substance>;

@Schema({ _id: false })
class Synonym {
  @Prop({ required: true })
  value!: string;

  @Prop({ required: true })
  source!: string;

  @Prop()
  language?: string;
}

@Schema({ _id: false })
class Source {
  @Prop({ required: true })
  name!: string;

  @Prop({ required: true })
  externalId!: string;

  @Prop()
  externalUrl?: string;

  @Prop({ enum: ["open", "restricted_commercial_use", "unknown"], default: "unknown" })
  licenseType!: "open" | "restricted_commercial_use" | "unknown";

  @Prop({ required: true })
  importedAt!: Date;

  @Prop({ required: true })
  lastSeenAt!: Date;

  @Prop({ default: 50 })
  sourceReliabilityScore!: number;

  @Prop({ default: false })
  rawAvailable!: boolean;
}

@Schema({ _id: false })
class RawRef {
  @Prop({ required: true })
  source!: string;

  @Prop({ required: true })
  rawCollection!: string;

  @Prop({ type: Types.ObjectId, required: true })
  rawDocumentId!: Types.ObjectId;

  @Prop({ required: true })
  importedAt!: Date;
}

@Schema({ timestamps: true, collection: "substances" })
export class Substance {
  @Prop({ required: true, index: true })
  primaryName!: string;

  @Prop()
  iupacName?: string;

  @Prop()
  description?: string;

  @Prop()
  molecularFormula?: string;

  @Prop({ type: Object, default: {} })
  masses!: {
    molecularWeight?: number;
    exactMass?: number;
    monoisotopicMass?: number;
    averageMass?: number;
  };

  @Prop({ type: Object, default: {} })
  normalizedMasses!: {
    molecularWeightRounded?: number;
    exactMassRounded?: number;
    monoisotopicMassRounded?: number;
    averageMassRounded?: number;
  };

  @Prop({ type: Object, default: {} })
  identifiers!: {
    pubchemCid?: string;
    chebiId?: string;
    hmdbId?: string;
    cas?: string[];
    inchi?: string;
    inchikey?: string;
    smiles?: string;
    canonicalSmiles?: string;
    isomericSmiles?: string;
  };

  @Prop({ type: [Synonym], default: [] })
  synonyms!: Synonym[];

  @Prop({ type: [Source], default: [] })
  sources!: Source[];

  @Prop({ type: Object, default: {} })
  categories!: {
    substanceType?: string;
    clinicalCategory?: string;
    toxicologyCategory?: string;
    pharmacologicalCategory?: string;
    biologicalRole?: string[];
    pathways?: string[];
    biospecimens?: string[];
  };

  @Prop({ type: Object, default: {} })
  clinical!: {
    notes?: string;
    diseases?: string[];
    normalConcentrations?: unknown[];
    abnormalConcentrations?: unknown[];
    biomarkers?: string[];
  };

  @Prop({ type: Object, default: {} })
  computed!: {
    sourceCount: number;
    synonymCount: number;
    identifierCompletenessScore: number;
    clinicalRelevanceScore: number;
    sourceReliabilityScore: number;
    totalCompletenessScore: number;
  };

  @Prop({ type: [RawRef], default: [] })
  rawRefs!: RawRef[];

  @Prop({ type: Object, default: {} })
  flags!: {
    isDemo: boolean;
    hasRestrictedCommercialSource: boolean;
    hasClinicalData: boolean;
    hasToxicologyData: boolean;
    hasIncompleteMassData: boolean;
  };
}

export const SubstanceSchema = SchemaFactory.createForClass(Substance);

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

SubstanceSchema.pre("save", function calculateFields(next) {
  const doc = this as SubstanceDocument;
  doc.normalizedMasses = {
    molecularWeightRounded: doc.masses.molecularWeight
      ? Number(doc.masses.molecularWeight.toFixed(6))
      : undefined,
    exactMassRounded: doc.masses.exactMass ? Number(doc.masses.exactMass.toFixed(6)) : undefined,
    monoisotopicMassRounded: doc.masses.monoisotopicMass
      ? Number(doc.masses.monoisotopicMass.toFixed(6))
      : undefined,
    averageMassRounded: doc.masses.averageMass
      ? Number(doc.masses.averageMass.toFixed(6))
      : undefined
  };

  const idFields = [
    doc.identifiers.pubchemCid,
    doc.identifiers.chebiId,
    doc.identifiers.hmdbId,
    doc.identifiers.inchi,
    doc.identifiers.inchikey,
    doc.identifiers.smiles
  ].filter(Boolean).length;

  const sourceRel =
    doc.sources.length > 0
      ? doc.sources.reduce((sum, s) => sum + (s.sourceReliabilityScore ?? 0), 0) / doc.sources.length
      : 0;

  const clinicalScore = doc.clinical?.diseases?.length ? Math.min(doc.clinical.diseases.length * 8, 30) : 0;

  doc.computed = {
    sourceCount: doc.sources.length,
    synonymCount: doc.synonyms.length,
    identifierCompletenessScore: idFields * 10,
    clinicalRelevanceScore: clinicalScore,
    sourceReliabilityScore: Number(sourceRel.toFixed(2)),
    totalCompletenessScore: Math.min(100, idFields * 10 + clinicalScore + doc.sources.length * 5)
  };

  doc.flags = {
    isDemo: doc.flags?.isDemo ?? false,
    hasRestrictedCommercialSource: doc.sources.some((s) => s.licenseType === "restricted_commercial_use"),
    hasClinicalData: Boolean(doc.clinical?.diseases?.length || doc.clinical?.notes),
    hasToxicologyData: Boolean(doc.categories?.toxicologyCategory),
    hasIncompleteMassData:
      !doc.masses.molecularWeight &&
      !doc.masses.exactMass &&
      !doc.masses.monoisotopicMass &&
      !doc.masses.averageMass
  };

  next();
});

