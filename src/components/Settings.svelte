<script lang="ts">
  import { state, setStartPoints, toggleDraws, toggleKiriage } from "../lib/store";
  $: s = $state;
  let startPoints = 25000;
  $: startPoints = s.startPoints;
</script>

<section class="settings">
  <div class="row" style="gap:16px">
    <label class="field">
      <span class="label">Start points</span>
      <input type="number" bind:value={startPoints} min="1000" step="1000" />
    </label>
    <button on:click={() => setStartPoints(startPoints)}>Apply</button>
  </div>
  <label class="toggle">
    <input type="checkbox" checked={s.supportDraws} on:change={() => toggleDraws()} />
    <span>Support draws (tenpai/ no-tenpai payments)</span>
  </label>
  <label class="toggle">
    <input type="checkbox" checked={s.kiriage} on:change={() => toggleKiriage()} />
    <span>Promote near-mangan (3 han 60 / 4 han 30) to mangan</span>
  </label>
</section>
