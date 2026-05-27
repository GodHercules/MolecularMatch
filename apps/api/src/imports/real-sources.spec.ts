describe("Real sources availability", () => {
  it(
    "PubChem endpoint real retorna propriedade para CID 1",
    async () => {
      const url =
        "https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/1/property/MolecularFormula,MolecularWeight,InChIKey/JSON";
      const response = await fetch(url);
      expect(response.ok).toBe(true);
      const json = await response.json();
      const first = json?.PropertyTable?.Properties?.[0];
      expect(first?.CID).toBe(1);
      expect(first?.MolecularWeight).toBeDefined();
    },
    30000
  );

  it(
    "ChEBI endpoint real retorna entidade completa",
    async () => {
      const url = "https://www.ebi.ac.uk/chebi/backend/api/public/compound/CHEBI:15377/";
      const response = await fetch(url);
      expect(response.ok).toBe(true);
      const json = await response.json();
      expect(json?.chebi_accession).toBe("CHEBI:15377");
    },
    30000
  );
});

