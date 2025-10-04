<script lang="ts">
  import Modal from "./Modal.svelte";
  import { closeNewHand, previewPayment, confirmHand, state, newHandContext } from "../lib/store";
  import type { HandInput, Seat, Side } from "../lib/riichi";

  const seatOptions: Seat[] = ["E", "S", "W", "N"];

  interface Draft {
    kind: HandInput["kind"];
    winner: Seat;
    discarder: Seat;
    han: number;
    fu: number;
    tenpai: Seat[];
  }

  // Build a complete draft from optional overrides (used for seat shortcuts & reset).
  function createDraft(defaults?: Partial<Draft>): Draft {
    const winner = defaults?.winner ?? "E";
    let discarder = defaults?.discarder ?? "W";
    if (defaults?.kind === "ron" && discarder === winner) {
      discarder = seatOptions.find(seat => seat !== winner) ?? discarder;
    }
    return {
      kind: defaults?.kind ?? "ron",
      winner,
      discarder,
      han: defaults?.han ?? 1,
      fu: defaults?.fu ?? 30,
      tenpai: defaults?.tenpai ?? []
    };
  }

  let draft: Draft = createDraft();
  let showPreview = false;
  let drawsEnabled = true;
  let facing: Side = "south";

  $: drawsEnabled = $state.supportDraws;
  $: if (!drawsEnabled && draft.kind === "draw") {
    draft = { ...draft, kind: "ron" };
  }
  $: previewState = previewPayment(toHandInput(draft));
  $: context = $newHandContext;
  let lastContext: typeof context = null;
  // When a seat presses "I Won" we feed their context in here.
  $: if (context !== lastContext) {
    draft = createDraft({
      kind: context?.kind,
      winner: context?.winner,
      discarder: context?.discarder
    });
    facing = context?.facing ?? "south";
    showPreview = false;
    lastContext = context;
  }

  function toHandInput(value: Draft): Partial<HandInput> {
    if (value.kind === "draw") {
      return { kind: "draw", tenpai: value.tenpai };
    }
    if (value.kind === "ron") {
      return {
        kind: "ron",
        winner: value.winner,
        discarder: value.discarder,
        han: value.han,
        fu: value.fu
      };
    }
    return {
      kind: "tsumo",
      winner: value.winner,
      han: value.han,
      fu: value.fu
    };
  }

  function setKind(kind: Draft["kind"]) {
    if (kind === draft.kind) return;
    if (kind === "draw" && !drawsEnabled) return;
    if (kind === "draw") {
      draft = { ...draft, kind, tenpai: [] };
    } else if (kind === "ron") {
      const fallback = draft.winner === draft.discarder
        ? seatOptions.find(seat => seat !== draft.winner) ?? draft.discarder
        : draft.discarder;
      draft = { ...draft, kind, discarder: fallback };
    } else {
      draft = { ...draft, kind };
    }
    showPreview = false;
  }

  function handleWinnerChange(event: Event) {
    const value = (event.target as HTMLSelectElement).value as Seat;
    let discarder = draft.discarder;
    if (draft.kind === "ron" && value === discarder) {
      discarder = seatOptions.find(seat => seat !== value) ?? discarder;
    }
    draft = { ...draft, winner: value, discarder };
  }

  function handleDiscarderChange(event: Event) {
    const value = (event.target as HTMLSelectElement).value as Seat;
    if (value === draft.winner) return;
    draft = { ...draft, discarder: value };
  }

  function handleHanChange(event: Event) {
    const value = Number((event.target as HTMLInputElement).value);
    draft = { ...draft, han: Math.max(1, Math.min(13, value || 1)) };
  }

  function handleFuChange(event: Event) {
    const value = Number((event.target as HTMLInputElement).value);
    draft = { ...draft, fu: Math.max(20, value || 20) };
  }

  function toggleTenpai(seat: Seat, event: Event) {
    const { checked } = event.target as HTMLInputElement;
    draft = {
      ...draft,
      tenpai: checked
        ? [...draft.tenpai, seat]
        : draft.tenpai.filter(value => value !== seat)
    };
  }

  function togglePreview() {
    showPreview = !showPreview;
  }

  function handleSubmit(event: Event) {
    event.preventDefault();
    if (!previewState.ok) {
      showPreview = true;
      return;
    }
    confirmHand(toHandInput(draft));
    draft = createDraft();
    showPreview = false;
  }

  function handleCancel() {
    closeNewHand();
    draft = createDraft();
    showPreview = false;
  }

  function formatDelta(value: number) {
    return value > 0 ? `+${value}` : `${value}`;
  }
</script>

<Modal title="New Hand" bodyClass={`panel-facing-${facing}`} on:close={handleCancel}>
  <form class="hand-wizard" on:submit={handleSubmit}>
    <fieldset class="result">
      <legend>Result</legend>
      <label>
        <input
          type="radio"
          name="kind"
          value="ron"
          checked={draft.kind === "ron"}
          on:change={() => setKind("ron")}
        />
        Ron
      </label>
      <label>
        <input
          type="radio"
          name="kind"
          value="tsumo"
          checked={draft.kind === "tsumo"}
          on:change={() => setKind("tsumo")}
        />
        Tsumo
      </label>
      <label class={drawsEnabled ? "" : "disabled"}>
        <input
          type="radio"
          name="kind"
          value="draw"
          checked={draft.kind === "draw"}
          disabled={!drawsEnabled}
          on:change={() => setKind("draw")}
        />
        Draw
      </label>
    </fieldset>

    {#if draft.kind !== "draw"}
      <div class="grid hand-inputs">
        <label class="field">
          <span class="label">Winner</span>
          <select value={draft.winner} on:change={handleWinnerChange}>
            {#each seatOptions as seat}
              <option value={seat}>{seat}</option>
            {/each}
          </select>
        </label>

        {#if draft.kind === "ron"}
          <label class="field">
            <span class="label">Discarder</span>
            <select value={draft.discarder} on:change={handleDiscarderChange}>
              {#each seatOptions.filter(seat => seat !== draft.winner) as seat}
                <option value={seat}>{seat}</option>
              {/each}
            </select>
          </label>
        {/if}

        <label class="field">
          <span class="label">Han</span>
          <input type="number" min="1" max="13" value={draft.han} on:change={handleHanChange} />
        </label>

        <label class="field">
          <span class="label">Fu</span>
          <input type="number" min="20" step="10" value={draft.fu} on:change={handleFuChange} />
        </label>
      </div>
    {/if}

    {#if draft.kind === "draw"}
      <div class="draw-inputs">
        <div class="label">Tenpai players</div>
        <div class="row">
          {#each seatOptions as seat}
            <label>
              <input
                type="checkbox"
                checked={draft.tenpai.includes(seat)}
                on:change={(event) => toggleTenpai(seat, event)}
              />
              {seat}
            </label>
          {/each}
        </div>
      </div>
    {/if}

    <div class="actions">
      <button type="button" class="ghost" on:click={togglePreview}>
        {showPreview ? "Hide preview" : "Show preview"}
      </button>
      <div class="spacer"></div>
      <button type="button" on:click={handleCancel}>Cancel</button>
      <button type="submit" class="primary" disabled={!previewState.ok}>Confirm</button>
    </div>

    {#if showPreview}
      <div class="preview card">
        {#if previewState.ok}
          <div class="preview-title">Projected changes</div>
          {#if previewState.result.kind === "draw"}
            <div class="detail">Tenpai: {previewState.result.tenpai?.join(", ") || "None"}</div>
          {:else}
            <div class="detail">{previewState.result.winner} {previewState.result.kind.toUpperCase()} · {previewState.result.han} han · {previewState.result.fu} fu</div>
            {#if previewState.result.limit}
              <div class="detail">Limit: {previewState.result.limit}</div>
            {/if}
            {#if previewState.result.payments.length}
              <ul>
                {#each previewState.result.payments as payment}
                  <li>{payment.from} → {payment.to}: {payment.amount.toLocaleString()}</li>
                {/each}
              </ul>
            {/if}
          {/if}
          <div class="delta-grid">
            {#each seatOptions as seat}
              <div>
                <span class="label">{seat}</span>
                <span class="value">{formatDelta(previewState.result.deltaBySeat[seat])}</span>
              </div>
            {/each}
          </div>
        {:else}
          <div class="warn">Select winner, discarder, han, and fu to calculate the result.</div>
        {/if}
      </div>
    {/if}
  </form>
</Modal>
