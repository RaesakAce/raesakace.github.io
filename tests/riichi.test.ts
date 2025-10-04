import { describe, it, expect } from "vitest";
import { calcBasePoints, calcRon, calcTsumoShares } from "../src/lib/riichi";

describe("riichi math", () => {
  it("base points and limits", () => {
    expect(calcBasePoints(30, 1)).toEqual({ base: 120, limit: undefined });
    expect(calcBasePoints(30, 5)).toEqual({ base: 2000, limit: "mangan" });
    expect(calcBasePoints(50, 6).limit).toBe("haneman");
    expect(calcBasePoints(30, 13).limit).toBe("yakuman");
  });
  it("kiriage mangan toggle", () => {
    expect(calcBasePoints(30, 4, { kiriage: true })).toEqual({ base: 2000, limit: "mangan" });
    expect(calcBasePoints(30, 4, { kiriage: false })).toEqual({ base: 1920, limit: undefined });
  });
  it("ron totals round up to 100", () => {
    expect(calcRon(120, false)).toBe(ceil(4 * 120)); // 480 → 500
    expect(calcRon(120, true)).toBe(ceil(6 * 120));  // 720 → 800
  });
  it("tsumo shares", () => {
    const child = calcTsumoShares(120, false);
    expect(child.child).toBe(ceil(120)); // 120 → 200
    expect(child.dealer).toBe(ceil(240)); // 240 → 300

    const dealer = calcTsumoShares(120, true);
    expect(dealer.child).toBe(ceil(240)); // each non-dealer pays 240 → 300
  });
});

function ceil(x: number) { return Math.ceil(x / 100) * 100; }
