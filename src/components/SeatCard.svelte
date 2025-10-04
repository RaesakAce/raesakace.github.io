<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { state, toggleRiichi, rename } from "../lib/store";
  import type { Side, Player, TableState } from "../lib/riichi";

  export let side: Side;
  export let orientation: "north" | "east" | "south" | "west" = "south";

  const dispatch = createEventDispatcher<{ win: { side: Side } }>();

  let tableState: TableState | undefined;
  $: tableState = $state;
  let currentPlayer: Player | undefined;
  $: currentPlayer = tableState?.players?.[side];

  function handleNameChange(event: Event) {
    const target = event.target as HTMLInputElement;
    rename(side, target.value);
  }

  function handleRiichi() {
    if (!currentPlayer) return;
    toggleRiichi(side);
  }

  function handleWin() {
    dispatch("win", { side });
  }
</script>

<div class={`card seat-card ${orientation}`}>
  <div class="seat-header">
    <div class="seat-wind">{currentPlayer?.wind ?? ""}</div>
    {#if currentPlayer?.wind === "E"}
      <span class="dealer-flag" title="Dealer" aria-label="Dealer">Dealer</span>
    {/if}
  </div>

  <input class="name" value={currentPlayer?.name ?? ""} on:change={handleNameChange} disabled={!currentPlayer} />

  <div class="points">{currentPlayer ? currentPlayer.points.toLocaleString() : ""}</div>

  <button
    class={`riichi ${currentPlayer?.riichi ? "active" : ""}`}
    aria-pressed={currentPlayer?.riichi ?? false}
    on:click={handleRiichi}
    disabled={!currentPlayer}
  >
    {currentPlayer?.riichi ? "Riichi Declared" : "Declare Riichi"}
  </button>

  <button class="win" on:click={handleWin} disabled={!currentPlayer}>I Won</button>
</div>
