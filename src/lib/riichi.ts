export type Seat = "E" | "S" | "W" | "N";
export type Wind = "E" | "S" | "W" | "N";
export type Side = "south" | "west" | "north" | "east";
export interface Player { id: string; name: string; points: number; riichi: boolean; wind: Seat; }
export interface Payment { from: Seat; to: Seat; amount: number; }
export type HandKind = "tsumo" | "ron" | "draw";
export interface HandInput { kind: HandKind; winner?: Seat; discarder?: Seat; han?: number; fu?: number; tenpai?: Seat[]; }
export interface HandResult extends HandInput {
  payments: Payment[];
  deltaBySeat: Record<Seat, number>;
  appliedHonba: number;
  appliedRiichi: number;
  limit?: "mangan" | "haneman" | "baiman" | "sanbaiman" | "yakuman";
  basePoints?: number;
}
export interface TableState {
  roundWind: Wind;
  hand: number;
  honba: number;
  riichiPot: number;
  players: Record<Side, Player>;
  history: HandResult[];
  supportDraws: boolean;
  kiriage: boolean;
  startPoints: number;
}

export const seats: Seat[] = ["E", "S", "W", "N"]; // counterclockwise order
// Physical seating order looking clockwise from the bottom edge of the table.
export const sides: Side[] = ["south", "east", "north", "west"];

export function nextSeatCCW(s: Seat): Seat {
  const i = seats.indexOf(s);
  return seats[(i + 1) % 4];
}

export function nextWind(w: Wind): Wind {
  return nextSeatCCW(w as Seat);
}

export interface ScoringOptions {
  limit: boolean;
  kiriage: boolean;
}

export const defaultScoring: ScoringOptions = { limit: true, kiriage: true };

export function calcBasePoints(
  fu: number,
  han: number,
  options: Partial<ScoringOptions> = {}
): { base: number; limit?: HandResult["limit"] } {
  const { limit, kiriage } = { ...defaultScoring, ...options };
  const raw = fu * Math.pow(2, 2 + han);

  if (limit) {
    if (han >= 13) return { base: 8000, limit: "yakuman" };
    if (han >= 11) return { base: 6000, limit: "sanbaiman" };
    if (han >= 8) return { base: 4000, limit: "baiman" };
    if (han >= 6) return { base: 3000, limit: "haneman" };
    if (han >= 5) return { base: 2000, limit: "mangan" };
    if (raw >= 2000) return { base: 2000, limit: "mangan" };
    if (kiriage && raw >= 1920) return { base: 2000, limit: "mangan" }; // 3 han 60 / 4 han 30 promotion
  }

  return { base: raw, limit: undefined };
}

function ceil100(x: number) { return Math.ceil(x / 100) * 100; }

export function calcRon(base: number, dealerWin: boolean): number {
  return ceil100((dealerWin ? 6 : 4) * base);
}

export function calcTsumoShares(base: number, dealerWin: boolean): { child: number; dealer: number } {
  if (dealerWin) {
    const each = ceil100(2 * base);
    return { child: each, dealer: 0 };
  }
  // child tsumo: dealer pays 2*base, each child pays 1*base
  return { child: ceil100(1 * base), dealer: ceil100(2 * base) };
}

export function calcPayments(
  input: HandInput,
  dealer: Seat,
  honba: number,
  riichiPot: number,
  options: Partial<ScoringOptions> = {}
): HandResult {
  const delta: Record<Seat, number> = { E: 0, S: 0, W: 0, N: 0 };
  const pays: Payment[] = [];

  if (input.kind === "draw") {
    const tenpai = new Set(input.tenpai ?? []);
    const nt = 4 - tenpai.size;
    const t = tenpai.size;
    if (t > 0 && nt > 0) {
      const fromEach = ceil100((3000 / nt) | 0); // round up by payer later: we’ll model as 100* increments total
      const toEach = ceil100((3000 / t) | 0);
      // Transfer from all no-tenpai to all tenpai evenly
      for (const s of seats) {
        if (tenpai.has(s)) delta[s] += toEach; else delta[s] -= fromEach;
      }
    }
    // honba +1, dealer repeats (handled by caller). No riichi pot moves.
    return {
      kind: "draw", tenpai: [...tenpai], payments: pays, deltaBySeat: delta, appliedHonba: 0, appliedRiichi: 0
    };
  }

  const winner = input.winner!;
  const dealerWin = winner === dealer;
  const { base, limit } = calcBasePoints(input.fu!, input.han!, options);

  if (input.kind === "ron") {
    const from = input.discarder!;
    let amt = calcRon(base, dealerWin);
    // honba: +300 to winner (all from discarder)
    amt += honba * 300;
    pays.push({ from, to: winner, amount: amt });
    delta[winner] += amt;
    delta[from] -= amt;
  } else if (input.kind === "tsumo") {
    const shares = calcTsumoShares(base, dealerWin);
    for (const s of seats) {
      if (s === winner) continue;
      let pay = s === dealer ? shares.dealer : shares.child;
      // honba: +100 from each payer
      pay += honba * 100;
      pays.push({ from: s, to: winner, amount: pay });
      delta[winner] += pay;
      delta[s] -= pay;
    }
  }

  // Riichi pot goes entirely to winner
  delta[winner] += riichiPot * 1000;

  return {
    ...input,
    payments: pays,
    deltaBySeat: delta,
    appliedHonba: honba,
    appliedRiichi: riichiPot * 1000,
    limit,
    basePoints: base
  };
}
