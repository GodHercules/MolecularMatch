import { BadRequestException } from "@nestjs/common";
import { SearchService } from "./search.service";

function modelChain(data: any[]) {
  return {
    find: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    lean: jest.fn().mockReturnThis(),
    exec: jest.fn().mockResolvedValue(data)
  };
}

describe("SearchService", () => {
  it("usa query indexada por intervalo e massType auto", async () => {
    const chain = modelChain([
      {
        _id: "6654f2b2f13f2a82d06dd001",
        primaryName: "Water",
        masses: { molecularWeight: 18.01528, exactMass: 18.01056 },
        identifiers: { inchikey: "XLYOFNOQVPJJNP-UHFFFAOYSA-N", pubchemCid: "962" },
        molecularFormula: "H2O",
        clinical: {},
        flags: {},
        computed: { sourceReliabilityScore: 90 },
        sources: [
          {
            name: "PubChem",
            externalId: "962",
            licenseType: "open"
          }
        ]
      }
    ]);

    const historyModel = {
      create: jest.fn().mockResolvedValue({ _id: "h1", searchResultIds: [], save: jest.fn() }),
      find: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      lean: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue([]),
      findById: jest.fn().mockReturnThis()
    } as any;

    const resultModel = {
      insertMany: jest.fn().mockResolvedValue([]),
      find: jest.fn().mockReturnThis(),
      lean: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue([])
    } as any;

    const service = new SearchService(chain as any, historyModel, resultModel);

    await service.searchBatch({
      masses: [18.01528],
      massType: "auto",
      toleranceType: "ppm",
      toleranceValue: 20,
      limitPerMass: 25,
      includeRestrictedSources: false,
      appMode: "internal_test"
    });

    const query = chain.find.mock.calls[0][0];
    expect(query.$or).toHaveLength(4);
    expect(query.$or[0]["masses.molecularWeight"]).toBeDefined();
  });

  it("rejeita lote sem massa valida", async () => {
    const chain = modelChain([]);
    const historyModel = {
      create: jest.fn(),
      find: jest.fn(),
      sort: jest.fn(),
      limit: jest.fn(),
      lean: jest.fn(),
      exec: jest.fn(),
      findById: jest.fn()
    } as any;
    const resultModel = { insertMany: jest.fn(), find: jest.fn(), lean: jest.fn(), exec: jest.fn() } as any;

    const service = new SearchService(chain as any, historyModel, resultModel);

    await expect(
      service.searchBatch({
        masses: [0, -1],
        massType: "exactMass",
        toleranceType: "ppm",
        toleranceValue: 10,
        limitPerMass: 10,
        includeRestrictedSources: false,
        appMode: "internal_test"
      })
    ).rejects.toThrow(BadRequestException);
  });
});

