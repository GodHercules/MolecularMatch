import { spawn } from "child_process";

function run(command: string, args: string[]) {
  return new Promise<number>((resolve) => {
    const child = spawn(command, args, {
      cwd: process.cwd(),
      shell: true,
      env: process.env
    });
    child.on("exit", (code) => resolve(code ?? 1));
  });
}

describe("Importer CLI integration", () => {
  const hasMongo = Boolean(process.env.MONGODB_URI);

  (hasMongo ? it : it.skip)(
    "executa importador PubChem real com limite pequeno",
    async () => {
      const code = await run("pnpm", ["import:pubchem", "--start-cid=1", "--limit=1"]);
      expect(code).toBe(0);
    },
    180000
  );

  (hasMongo ? it : it.skip)(
    "executa importador ChEBI real com limite pequeno",
    async () => {
      const code = await run("pnpm", ["import:chebi", "--limit=1"]);
      expect(code).toBe(0);
    },
    180000
  );
});
