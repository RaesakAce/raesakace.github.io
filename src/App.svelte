<script lang="ts">
  import SeatCard from "./components/SeatCard.svelte";
  import HandWizard from "./components/HandWizard.svelte";
  import History from "./components/History.svelte";
  import Settings from "./components/Settings.svelte";
  import Modal from "./components/Modal.svelte";
  import { state, newHandOpen, openNewHand, undo, reset } from "./lib/store";
  import type { Side } from "./lib/riichi";

  $: s = $state;
  let historyOpen = false;
  let settingsOpen = false;

  $: roundLabel = `${s.roundWind}${s.hand}`;
  $: dealerPlayer = Object.values(s.players).find(p => p.wind === "E");

  function handleSeatWin(event: CustomEvent<{ side: Side }>) {
    const { side } = event.detail;
    const player = s.players[side];
    openNewHand({ winner: player.wind, facing: side });
  }
</script>

<div class="table-grid">
  <div class="seat north">
    <SeatCard side="north" orientation="north" on:win={handleSeatWin} />
  </div>

  <div class="seat west">
    <SeatCard side="west" orientation="west" on:win={handleSeatWin} />
  </div>

  <div class="table-center card">
    <div class="round-display">{s.roundWind}</div>
    <div class="round-info">
      <div>
        <div class="label">Round</div>
        <div class="value">{roundLabel}</div>
      </div>
      <div>
        <div class="label">Dealer</div>
        <div class="value">{dealerPlayer ? `${dealerPlayer.wind} · ${dealerPlayer.name}` : "—"}</div>
      </div>
      <div>
        <div class="label">Honba</div>
        <div class="value">{s.honba}</div>
      </div>
      <div>
        <div class="label">Riichi Pot</div>
        <div class="value">{s.riichiPot}</div>
      </div>
    </div>
    <div class="controls">
      <button class="primary" on:click={openNewHand}>New Hand</button>
      <button on:click={undo} disabled={!s.history.length}>Undo</button>
      <button on:click={() => historyOpen = true} disabled={!s.history.length}>History</button>
      <button on:click={() => settingsOpen = true}>Settings</button>
      <button class="ghost" on:click={reset}>Reset Match</button>
    </div>
  </div>

  <div class="seat east">
    <SeatCard side="east" orientation="east" on:win={handleSeatWin} />
  </div>

  <div class="seat south">
    <SeatCard side="south" orientation="south" on:win={handleSeatWin} />
  </div>
</div>

{#if historyOpen}
  <Modal title="Hand History" on:close={() => historyOpen = false}>
    <History />
  </Modal>
{/if}

{#if settingsOpen}
  <Modal title="Settings" on:close={() => settingsOpen = false}>
    <Settings />
  </Modal>
{/if}

{#if $newHandOpen}
  <HandWizard />
{/if}
