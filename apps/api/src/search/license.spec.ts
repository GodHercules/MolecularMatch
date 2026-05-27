import { canUseSource } from "@molecular-match/shared";

describe("license guard", () => {
  it("bloqueia HMDB no modo commercial", () => {
    expect(canUseSource("restricted_commercial_use", "commercial", true)).toBe(false);
  });
});

