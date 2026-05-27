import "./lib/load-env";
import { spawn } from "child_process";

function runScript(script: string, extraArgs: string[] = []) {
  return new Promise<void>((resolve, reject) => {
    const child = spawn("pnpm", ["--filter", "@molecular-match/importers", script, ...extraArgs], {
      stdio: "inherit",
      shell: true
    });

    child.on("exit", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${script} finalizou com codigo ${code}`));
    });
  });
}

async function main() {
  await runScript("import:pubchem", ["--start-cid=1", "--limit=5000"]);
  await runScript("import:chebi", ["--limit=5000"]);
  if ((process.env.HMDB_ENABLE_IMPORT ?? "true") === "true") {
    await runScript("import:hmdb", [`--file=${process.env.HMDB_XML_FILE ?? "./data/hmdb_metabolites.xml"}`]);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
