<script lang="ts">
  import type { TableState } from "../lib/riichi";
  import { createEventDispatcher } from "svelte";
  const dispatch = createEventDispatcher();
  export let s: TableState;

  $: dealer = Object.values(s.players).find(p => p.wind === "E");
</script>

<div class="card row" style="justify-content: space-between">
  <div class="row" style="gap:14px">
    <div>
      <div class="h2">Round Wind</div>
      <div class="h1">{s.roundWind}</div>
    </div>
    <div>
      <div class="h2">Dealer</div>
      <div class="h1">{dealer ? `${dealer.wind}` : ""}</div>
      {#if dealer}<div>{dealer.name}</div>{/if}
    </div>
    <div>
      <div class="h2">Honba</div>
      <div class="h1">{s.honba}</div>
    </div>
    <div>
      <div class="h2">Riichi Pot</div>
      <div class="h1">{s.riichiPot}</div>
    </div>
  </div>

  <div class="row">
    <button on:click={() => dispatch("newHand")}>New Hand</button>
    <button on:click={() => dispatch("undo")} disabled={!s.history.length}>Undo</button>
    <button on:click={() => dispatch("reset")}>Reset</button>
  </div>
</div>
