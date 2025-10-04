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

<div class="table-shell">
  <div class="table-frame">
    <div class="table-status card">
      <div class="status-main">
        <span class="status-round" aria-label="Round" title="Round">{roundLabel}</span>
        <span class="status-pill dealer" aria-label="Dealer" title="Dealer">
          D {dealerPlayer ? dealerPlayer.name : "—"}
        </span>
        <span class="status-pill" aria-label="Honba" title="Honba">H {s.honba}</span>
        <span class="status-pill" aria-label="Riichi pot" title="Riichi pot">R {s.riichiPot}</span>
      </div>
      <div class="status-actions">
        <button class="status-btn primary" on:click={openNewHand} aria-label="New hand" title="New hand">+</button>
        <button class="status-btn" on:click={undo} disabled={!s.history.length} aria-label="Undo" title="Undo">U</button>
        <button class="status-btn" on:click={() => historyOpen = true} disabled={!s.history.length} aria-label="History" title="History">H</button>
        <button class="status-btn" on:click={() => settingsOpen = true} aria-label="Settings" title="Settings">S</button>
        <button class="status-btn danger" on:click={reset} aria-label="Reset match" title="Reset match">R</button>
      </div>
    </div>

    <div class="table-grid">
      <div class="seat north">
        <SeatCard side="north" orientation="north" on:win={handleSeatWin} />
      </div>

      <div class="seat west">
        <SeatCard side="west" orientation="west" on:win={handleSeatWin} />
      </div>

      <div class="seat east">
        <SeatCard side="east" orientation="east" on:win={handleSeatWin} />
      </div>

      <div class="seat south">
        <SeatCard side="south" orientation="south" on:win={handleSeatWin} />
      </div>
    </div>
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
