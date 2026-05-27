import { registerAs } from "@nestjs/config";

export default registerAs("app", () => ({
  nodeEnv: process.env.NODE_ENV ?? "development",
  appMode: process.env.APP_MODE ?? "internal_test",
  apiPort: Number(process.env.API_PORT ?? process.env.PORT ?? 4000),
  corsOrigin: process.env.CORS_ORIGIN ?? "http://localhost:3000",
  mongodbUri: process.env.MONGODB_URI ?? "",
  mongodbDbName: process.env.MONGODB_DB_NAME ?? "molecular_match",
  adminPassword: process.env.ADMIN_PASSWORD ?? "",
  pubchemBaseUrl: process.env.PUBCHEM_BASE_URL ?? "https://pubchem.ncbi.nlm.nih.gov/rest/pug",
  pubchemRateLimitMs: Number(process.env.PUBCHEM_RATE_LIMIT_MS ?? 250),
  pubchemDefaultImportLimit: Number(process.env.PUBCHEM_DEFAULT_IMPORT_LIMIT ?? 50000),
  pubchemSafeFreeTierLimit: Number(process.env.PUBCHEM_SAFE_FREE_TIER_LIMIT ?? 5000),
  chebiSourceMode: process.env.CHEBI_SOURCE_MODE ?? "download",
  chebiDownloadUrl:
    process.env.CHEBI_DOWNLOAD_URL ??
    "https://ftp.ebi.ac.uk/pub/databases/chebi/Flat_file_tab_delimited/compounds.tsv.gz",
  hmdbXmlFile: process.env.HMDB_XML_FILE ?? "./data/hmdb_metabolites.xml",
  hmdbEnableImport: process.env.HMDB_ENABLE_IMPORT === "true",
  hmdbLicenseMode: process.env.HMDB_LICENSE_MODE ?? "restricted_commercial_use",
  requireRealData: process.env.DATABASE_REQUIRE_REAL_DATA !== "false"
}));

