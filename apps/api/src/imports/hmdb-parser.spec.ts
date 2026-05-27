import { promises as fs } from "fs";
import os from "os";
import path from "path";
import sax from "sax";

describe("HMDB parser from local XML", () => {
  it("processa metabolito em arquivo local", async () => {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<hmdb>
  <metabolite>
    <accession>HMDB00001</accession>
    <name>1-Methylhistidine</name>
    <chemical_formula>C7H11N3O2</chemical_formula>
    <average_molecular_weight>169.18</average_molecular_weight>
    <monoisotopic_molecular_weight>169.085127</monoisotopic_molecular_weight>
    <synonyms><synonym>N-methylhistidine</synonym></synonyms>
  </metabolite>
</hmdb>`;

    const tempFile = path.join(os.tmpdir(), `hmdb-test-${Date.now()}.xml`);
    await fs.writeFile(tempFile, xml, "utf8");

    const stream = sax.createStream(true, { trim: true, normalize: true });
    const rows: Array<{ accession?: string; name?: string; mw?: number }> = [];

    let stack: string[] = [];
    let text = "";
    let current: { accession?: string; name?: string; mw?: number } | null = null;

    stream.on("opentag", (node: sax.Tag) => {
      stack.push(node.name);
      text = "";
      if (node.name === "metabolite") current = {};
    });

    stream.on("text", (value: string) => {
      text += value;
    });

    stream.on("closetag", (tag: string) => {
      if (!current) {
        stack.pop();
        text = "";
        return;
      }

      const p = stack.join("/");
      const value = text.trim();
      if (p.endsWith("metabolite/accession")) current.accession = value;
      if (p.endsWith("metabolite/name")) current.name = value;
      if (p.endsWith("metabolite/average_molecular_weight")) current.mw = Number(value);

      if (tag === "metabolite") {
        rows.push(current);
        current = null;
      }

      stack.pop();
      text = "";
    });

    const done = new Promise<void>((resolve, reject) => {
      stream.on("end", resolve);
      stream.on("error", reject);
    });

    const fileStream = (await import("fs")).createReadStream(tempFile, { encoding: "utf8" });
    fileStream.pipe(stream);
    await done;

    await fs.unlink(tempFile);

    expect(rows).toHaveLength(1);
    expect(rows[0]?.accession).toBe("HMDB00001");
    expect(rows[0]?.mw).toBeCloseTo(169.18, 2);
  });
});

