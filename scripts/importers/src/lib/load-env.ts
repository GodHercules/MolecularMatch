import fs from "fs";
import path from "path";
import dotenv from "dotenv";

const candidates = [
  path.resolve(process.cwd(), ".env"),
  path.resolve(process.cwd(), "..", ".env"),
  path.resolve(process.cwd(), "..", "..", ".env"),
  path.resolve(process.cwd(), "..", "..", "..", ".env")
];

const envPath = candidates.find((p) => fs.existsSync(p));
if (envPath) {
  dotenv.config({ path: envPath });
} else {
  dotenv.config();
}
