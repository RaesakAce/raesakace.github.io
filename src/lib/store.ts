import { writable, get } from "svelte/store";
import type { Seat, TableState, HandInput, HandResult, Side, Wind } from "./riichi";
import { seats, sides, calcPayments, nextSeatCCW, nextWind } from "./riichi";

const LS_KEY = "riichi.helper.state.v2";
const LEGACY_KEYS = ["riichi.helper.state.v1"];
const hasStorage = typeof localStorage !== "undefined";

// Seats stay fixed around the table; this map assigns the opening wind to each seat.
const initialWinds: Record<Side, Seat> = {
  south: "E",
  east: "S",
  north: "W",
  west: "N"
};

function createPlayers(startPoints: number, names?: Partial<Record<Side, string>>): TableState["players"] {
  return {
    south: { id: "south", name: names?.south ?? "Player 1", points: startPoints, riichi: false, wind: initialWinds.south },
    east: { id: "east", name: names?.east ?? "Player 2", points: startPoints, riichi: false, wind: initialWinds.east },
    north: { id: "north", name: names?.north ?? "Player 3", points: startPoints, riichi: false, wind: initialWinds.north },
    west: { id: "west", name: names?.west ?? "Player 4", points: startPoints, riichi: false, wind: initialWinds.west }
  };
}

function clonePlayers(players: TableState["players"]): TableState["players"] {
  return {
    south: { ...players.south },
    west: { ...players.west },
    north: { ...players.north },
    east: { ...players.east }
  };
}

function cloneResult(result: HandResult): HandResult {
  return {
    ...result,
    payments: result.payments.map(p => ({ ...p })),
    deltaBySeat: { ...result.deltaBySeat },
    tenpai: result.tenpai ? [...result.tenpai] : result.tenpai
  };
}

function defaultState(): TableState {
  return {
    roundWind: "E",
    hand: 1,
    honba: 0,
    riichiPot: 0,
    players: createPlayers(25000),
    history: [],
    supportDraws: true,
    kiriage: false,
    startPoints: 25000
  };
}

function isLegacyPlayers(value: unknown): value is Record<Seat, { name?: string; points?: number; riichi?: boolean }> {
  if (!value || typeof value !== "object") return false;
  return seats.every(seat => Object.prototype.hasOwnProperty.call(value, seat));
}

// Normalise whatever we read from storage into the current player structure.
function normalizePlayers(source: unknown, base: TableState): TableState["players"] {
  const next = clonePlayers(base.players);
  if (!source || typeof source !== "object") return next;

  if (isLegacyPlayers(source)) {
    const legacy = source as Record<Seat, { name?: string; points?: number; riichi?: boolean }>;
    const mapping: Array<{ wind: Seat; side: Side }> = [
      { wind: "E", side: "south" },
      { wind: "S", side: "east" },
      { wind: "W", side: "north" },
      { wind: "N", side: "west" }
    ];
    for (const { wind, side } of mapping) {
      const info = legacy[wind];
      if (!info) continue;
      next[side] = {
        ...next[side],
        name: info.name ?? next[side].name,
        points: info.points ?? next[side].points,
        riichi: info.riichi ?? false,
        wind
      };
    }
    return next;
  }

  for (const side of sides) {
    const entry = (source as Record<string, unknown>)[side];
    if (entry && typeof entry === "object") {
      const data = entry as Partial<TableState["players"][Side]>;
      next[side] = {
        ...next[side],
        ...data,
        wind: data.wind ?? next[side].wind,
        riichi: data.riichi ?? false,
        points: data.points ?? next[side].points,
        name: data.name ?? next[side].name
      };
    }
  }
  return next;
}

function mergeState(base: TableState, raw: Partial<TableState>): TableState {
  const players = normalizePlayers(raw.players, base);
  const history = (raw.history ?? []).map(cloneResult);
  return {
    ...base,
    ...raw,
    players,
    history,
    supportDraws: raw.supportDraws ?? base.supportDraws,
    kiriage: raw.kiriage ?? base.kiriage,
    startPoints: raw.startPoints ?? base.startPoints
  };
}

// Load from localStorage (v2 format if available, otherwise fall back to legacy keys).
function load(): TableState {
  const base = defaultState();
  if (!hasStorage) return base;
  try {
    let raw = localStorage.getItem(LS_KEY);
    if (!raw) {
      for (const key of LEGACY_KEYS) {
        raw = localStorage.getItem(key);
        if (raw) break;
      }
    }
    if (!raw) return base;
    const parsed = JSON.parse(raw) as Partial<TableState>;
    return mergeState(base, parsed);
  } catch {
    return base;
  }
}

function findSideByWind(players: TableState["players"], wind: Seat): Side | null {
  for (const side of sides) {
    if (players[side].wind === wind) return side;
  }
  return null;
}

// Apply score deltas to whichever seat currently owns each wind.
function applyDelta(players: TableState["players"], result: HandResult): TableState["players"] {
  const next = clonePlayers(players);
  for (const wind of seats) {
    const side = findSideByWind(next, wind);
    if (!side) continue;
    next[side].points += result.deltaBySeat[wind];
  }
  return next;
}

// After a hand resolves, nobody remains in riichi – clear the flag on every seat.
function clearRiichiFlags(players: TableState["players"]): TableState["players"] {
  const next = clonePlayers(players);
  for (const side of sides) {
    next[side].riichi = false;
  }
  return next;
}

// Pass winds clockwise: S→E, W→S, N→W, E→N.
function rotatePlayerWinds(players: TableState["players"]): TableState["players"] {
  const next = clonePlayers(players);
  const ownerByWind: Partial<Record<Seat, Side>> = {};
  for (const side of sides) {
    ownerByWind[players[side].wind] = side;
  }

  const eastOwner = ownerByWind["E"];
  const southOwner = ownerByWind["S"];
  const westOwner = ownerByWind["W"];
  const northOwner = ownerByWind["N"];

  if (southOwner) next[southOwner].wind = "E";
  if (westOwner) next[westOwner].wind = "S";
  if (northOwner) next[northOwner].wind = "W";
  if (eastOwner) next[eastOwner].wind = "N";

  return next;
}

// Rebuild players with the configured starting points and opening winds.
function resetPlayersToStart(current: TableState): TableState["players"] {
  const players = clonePlayers(current.players);
  for (const side of sides) {
    players[side] = {
      ...players[side],
      points: current.startPoints,
      riichi: false,
      wind: initialWinds[side]
    };
  }
  return players;
}

// Update table state after resolving a single hand.
function applyResolvedResult(state: TableState, result: HandResult) {
  let players = applyDelta(state.players, result);
  players = clearRiichiFlags(players);

  let honba = state.honba;
  let roundWind: Wind = state.roundWind;
  let hand = state.hand;
  let rotated = false;

  if (result.kind === "draw") {
    const dealerTenpai = (result.tenpai ?? []).includes("E");
    honba += 1;
    if (!dealerTenpai) {
      players = rotatePlayerWinds(players);
      rotated = true;
    }
  } else if (result.winner === "E") {
    honba += 1;
  } else {
    players = rotatePlayerWinds(players);
    rotated = true;
    honba = 0;
  }

  if (rotated) {
    const nextHand = hand + 1;
    if (nextHand > 4) {
      hand = 1;
      roundWind = nextWind(roundWind);
    } else {
      hand = nextHand;
    }
  }

  return {
    ...state,
    players,
    honba,
    roundWind,
    hand
  } satisfies TableState;
}

export const state = writable<TableState>(load());
if (hasStorage) {
  state.subscribe(value => {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(value));
    } catch {
      /* ignore quota errors */
    }
  });
}

export const newHandOpen = writable(false);
export const newHandContext = writable<{ kind?: HandInput["kind"]; winner?: Seat; discarder?: Seat; facing?: Side } | null>(null);

export function openNewHand(context?: { kind?: HandInput["kind"]; winner?: Seat; discarder?: Seat; facing?: Side }) {
  newHandContext.set(context ?? null);
  newHandOpen.set(true);
}

export function closeNewHand() {
  newHandOpen.set(false);
  newHandContext.set(null);
}

export function rename(side: Side, name: string) {
  state.update(current => {
    const players = clonePlayers(current.players);
    players[side] = { ...players[side], name };
    return { ...current, players };
  });
}

export function toggleRiichi(side: Side) {
  state.update(current => {
    const players = clonePlayers(current.players);
    const player = players[side];

    if (!player.riichi) {
      if (player.points < 1000) return current;
      player.points -= 1000;
      player.riichi = true;
      return { ...current, players, riichiPot: current.riichiPot + 1 };
    }

    player.points += 1000;
    player.riichi = false;
    return { ...current, players, riichiPot: Math.max(0, current.riichiPot - 1) };
  });
}

export function setStartPoints(points: number) {
  state.update(current => {
    const players = clonePlayers(current.players);
    for (const side of sides) {
      players[side] = {
        ...players[side],
        points,
        riichi: false,
        wind: initialWinds[side]
      };
    }
    return {
      ...current,
      players,
      history: [],
      honba: 0,
      riichiPot: 0,
      roundWind: "E",
      hand: 1,
      startPoints: points
    };
  });
}

export function toggleDraws() {
  state.update(current => ({ ...current, supportDraws: !current.supportDraws }));
}

export function toggleKiriage() {
  state.update(current => ({ ...current, kiriage: !current.kiriage }));
}

export function previewPayment(input: Partial<HandInput>) {
  const current = get(state);
  const options = { kiriage: current.kiriage };
  try {
    if (input.kind === "draw") {
      if (!current.supportDraws) return { ok: false };
      const result = calcPayments({ kind: "draw", tenpai: input.tenpai ?? [] }, "E", current.honba, current.riichiPot, options);
      return { ok: true, result };
    }
    if (!input.kind || !input.winner) return { ok: false };
    const result = calcPayments({
      kind: input.kind,
      winner: input.winner,
      discarder: input.discarder,
      han: input.han ?? 1,
      fu: input.fu ?? 30
    }, "E", current.honba, current.riichiPot, options);
    return { ok: true, result };
  } catch (error) {
    return { ok: false, error: String(error) };
  }
}

// Translate partial wizard input into a concrete HandResult, or null if incomplete.
function resolveHandInput(current: TableState, input: Partial<HandInput>): HandResult | null {
  const options = { kiriage: current.kiriage };

  if (input.kind === "draw") {
    if (!current.supportDraws) return null;
    return calcPayments({ kind: "draw", tenpai: input.tenpai ?? [] }, "E", current.honba, current.riichiPot, options);
  }

  if (!input.kind || !input.winner) return null;

  return calcPayments({
    kind: input.kind,
    winner: input.winner,
    discarder: input.discarder,
    han: input.han ?? 1,
    fu: input.fu ?? 30
  }, "E", current.honba, current.riichiPot, options);
}

export function confirmHand(input: Partial<HandInput>) {
  state.update(current => {
    const result = resolveHandInput(current, input);
    if (!result) return current;

    let next = applyResolvedResult(current, result);
    const history = [...current.history, cloneResult(result)];
    let riichiPot = current.riichiPot;
    if (result.kind === "draw") {
      // riichi sticks remain
    } else {
      riichiPot = 0;
    }

    next = { ...next, history, riichiPot };
    return next;
  });
  closeNewHand();
}

export function undo() {
  state.update(current => {
    if (!current.history.length) return current;
    const history = current.history.slice(0, -1);
    // Rebuild state by replaying history
    let next: TableState = {
      ...current,
      players: resetPlayersToStart(current),
      history: [],
      honba: 0,
      riichiPot: 0,
      roundWind: "E",
      hand: 1
    };

    for (const result of history) {
      next = applyResolvedResult(next, result);
      next = {
        ...next,
        history: [...next.history, cloneResult(result)],
        riichiPot: result.kind === "draw" ? next.riichiPot : 0
      };
    }

    return next;
  });
}

export function reset() {
  const current = get(state);
  const players = createPlayers(current.startPoints, {
    south: current.players.south.name,
    west: current.players.west.name,
    north: current.players.north.name,
    east: current.players.east.name
  });
  state.set({
    ...defaultState(),
    players,
    startPoints: current.startPoints,
    supportDraws: current.supportDraws,
    kiriage: current.kiriage
  });
  closeNewHand();
}

export function currentPlayerWind(side: Side): Seat {
  const current = get(state);
  return current.players[side].wind;
}
