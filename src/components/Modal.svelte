<script lang="ts">
  import { createEventDispatcher, onDestroy, onMount } from "svelte";

  export let title = "";
  export let width = "min(560px, 95vw)";
  export let bodyClass = "";
  export let bodyStyle: string | undefined;

  const dispatch = createEventDispatcher();
  let container: HTMLDivElement;
  let cleanup: (() => void) | null = null;

  function close() {
    dispatch("close");
  }

  onMount(() => {
    container?.focus();
    const handler = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
      }
    };
    window.addEventListener("keydown", handler);
    cleanup = () => window.removeEventListener("keydown", handler);
  });

  onDestroy(() => {
    cleanup?.();
  });
</script>

<div class="modal" role="presentation" on:mousedown|self={close}>
  <div
    class={`card panel ${bodyClass}`}
    role="dialog"
    aria-modal="true"
    aria-label={title}
    tabindex="-1"
    style={`width:${width};max-height:min(92vh, 92vw);${bodyStyle ?? ""}`}
    bind:this={container}
  >
    <div class="row modal-header">
      <div class="h1">{title}</div>
      <button class="ghost" on:click={close}>Close</button>
    </div>
    <slot />
  </div>
</div>
