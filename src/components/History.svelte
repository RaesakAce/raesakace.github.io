<script lang="ts">
  import { state } from "../lib/store";
  $: s = $state;

  function formatDelta(value: number) {
    return value > 0 ? `+${value}` : `${value}`;
  }
</script>

<section class="history">
  {#if s.history.length === 0}
    <div class="h2">No hands yet.</div>
  {:else}
    <div class="history-list">
      {#each s.history.slice().reverse() as h, i}
        <div class="history-row">
          <div>
            <div class="h2">
              {#if h.kind === 'draw'}Draw{:else}{h.winner} {h.kind.toUpperCase()}{/if}
            </div>
            {#if h.kind !== 'draw'}
              <div class="detail">{h.han} han · {h.fu} fu {h.limit ? `(${h.limit})` : ''}</div>
            {/if}
            {#if h.appliedHonba || h.appliedRiichi}
              <div class="detail subtle">
                {#if h.appliedHonba}Honba +{h.appliedHonba}{/if}
                {#if h.appliedHonba && h.appliedRiichi} · {/if}
                {#if h.appliedRiichi}Riichi pot {h.appliedRiichi / 1000}k{/if}
              </div>
            {/if}
          </div>
          <div class="delta">
            <span>E {formatDelta(h.deltaBySeat.E)}</span>
            <span>S {formatDelta(h.deltaBySeat.S)}</span>
            <span>W {formatDelta(h.deltaBySeat.W)}</span>
            <span>N {formatDelta(h.deltaBySeat.N)}</span>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</section>
