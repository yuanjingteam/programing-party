<script lang="ts">
  import copyToClipboard from "../lib/copyToClipboard.ts";

  interface File {
    fileName: string;
    contentHtml: string;
  }

  interface Props {
    files: File[];
    snippetEditHref?: string;
    "data-testid"?: string;
  }

  const {
    files = [],
    snippetEditHref,
    "data-testid": dataTestId,
  }: Props = $props();

  let codeSnippetEl: HTMLElement | undefined = $state();

  let filenameSelected: string | undefined = $state(
    files.length > 0 ? files[0]?.fileName : undefined,
  );

  $effect(() => {
    if (!filenameSelected && files.length > 0) {
      filenameSelected = files[0]?.fileName;
    }
  });

  const snippet: File | undefined = $derived(
    filenameSelected
      ? files.find((s) => s.fileName === filenameSelected)
      : undefined,
  );

  let copied = $state(false);
  let copyResetTimeout: ReturnType<typeof setTimeout> | undefined;

  function copySnippet(): void {
    if (codeSnippetEl) {
      copyToClipboard(codeSnippetEl.innerText);
      copied = true;
      if (copyResetTimeout) {
        clearTimeout(copyResetTimeout);
      }
      copyResetTimeout = setTimeout(() => {
        copied = false;
      }, 1200);
    }
  }
</script>

<div
  class="flex space-x-1 items-center ml-0 overflow-x-auto"
  data-testid={dataTestId}
>
  {#each files as file (file.fileName)}
    <button
      class="py-1.5 px-3 flex-shrink-0 text-xs rounded-t inline-block transition-all duration-200 hover:opacity-100"
      class:opacity-60={filenameSelected !== file.fileName}
      style="background-color: var(--code-tab-bg); color: var(--code-tab-text);"
      onclick={() => {
        filenameSelected = file.fileName;
      }}
    >
      {file.fileName}
    </button>
  {/each}
</div>

<div class="relative group">
  <div
    bind:this={codeSnippetEl}
    class="px-4 py-3 text-sm overflow-auto rounded-b rounded-tr"
    style="background-color: var(--code-bg); color: var(--code-text);"
  >
    {#if snippet}
      <!-- eslint-disable-next-line svelte/no-at-html-tags -->
      {@html snippet.contentHtml}
    {/if}
  </div>
  <div
    class="absolute hidden group-hover:block transition-all top-0 right-0 mt-2 mr-2"
  >
    <div class="flex items-center space-x-3">
      <a
        href={snippetEditHref}
        target="_blank"
        rel="noreferrer"
        aria-label="Edit on Github"
        title="Edit"
        class="action-btn"
      >
        <span class="iconify ph--pencil size-4" aria-hidden="true"></span>
      </a>
      <button
        class="action-btn copy-btn"
        data-copied={copied ? "true" : "false"}
        title={copied ? "Copied!" : "Copy to clipboard"}
        aria-label={copied ? "Copied!" : "Copy to clipboard"}
        onclick={copySnippet}
      >
        <span
          class="tooltip"
          data-text-initial="Copy to clipboard"
          data-text-end="Copied!"
          aria-hidden="true"
        ></span>
        <span class="iconify ph--clipboard size-4 clipboard" aria-hidden="true"
        ></span>
        <span class="iconify ph--check size-4 checkmark" aria-hidden="true"
        ></span>
      </button>
    </div>
  </div>
</div>

<style>
  .action-btn {
    --button-bg: var(--button-bg);
    --button-hover-bg: var(--button-bg-hover);
    --button-text-color: var(--button-text);
    --button-hover-text-color: #8bb9fe;
    --button-border-radius: 10px;
    --button-diameter: 36px;
    --button-outline-width: 1px;
    --button-outline-color: var(--button-border);
    --tooltip-bg: #f4f3f3;
    --toolptip-border-radius: 4px;
    --tooltip-font-family:
      Menlo, ui-monospace, SFMono-Regular, Monaco, Consolas, "Liberation Mono",
      "Courier New", monospace;
    --tooltip-font-size: 12px;
    --tootip-text-color: rgb(50, 50, 50);
    --tooltip-padding-x: 7px;
    --tooltip-padding-y: 7px;
    --tooltip-offset: 8px;
    box-sizing: border-box;
    width: var(--button-diameter);
    height: var(--button-diameter);
    border-radius: var(--button-border-radius);
    background-color: var(--button-bg);
    color: var(--button-text-color);
    border: 1px solid var(--button-border);
    cursor: pointer;
    position: relative;
    outline: none;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    opacity: 0.6;
    transition: opacity 200ms;
  }

  :global(.dark) .action-btn {
    --tooltip-bg: #111827;
    --tootip-text-color: #e5e7eb;
  }

  .copy-btn .tooltip {
    position: absolute;
    opacity: 0;
    visibility: hidden;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    white-space: nowrap;
    font: var(--tooltip-font-size) var(--tooltip-font-family);
    color: var(--tootip-text-color);
    background: var(--tooltip-bg);
    padding: var(--tooltip-padding-y) var(--tooltip-padding-x);
    border-radius: var(--toolptip-border-radius);
    pointer-events: none;
  }

  .copy-btn .tooltip::before {
    content: attr(data-text-initial);
  }

  .copy-btn .tooltip::after {
    content: "";
    position: absolute;
    bottom: calc(var(--tooltip-padding-y) / 2 * -1);
    width: var(--tooltip-padding-y);
    height: var(--tooltip-padding-y);
    background: inherit;
    left: 50%;
    transform: translateX(-50%) rotate(45deg);
    z-index: -1;
    pointer-events: none;
  }

  .action-btn:hover,
  .action-btn:focus {
    background-color: var(--button-hover-bg);
    opacity: 0.9;
  }

  .copy-btn:hover .tooltip,
  .copy-btn:focus:not(:focus-visible) .tooltip {
    opacity: 1;
    visibility: visible;
    top: calc((100% + var(--tooltip-offset)) * -1);
  }

  .action-btn:hover .iconify {
    color: var(--button-hover-text-color);
  }

  .action-btn:active {
    outline: var(--button-outline-width) solid var(--button-outline-color);
  }

  .clipboard {
    display: block;
  }

  .checkmark {
    display: none;
  }

  .copy-btn[data-copied="true"] .tooltip::before {
    content: attr(data-text-end);
  }

  .copy-btn[data-copied="true"] .clipboard {
    display: none;
  }

  .copy-btn[data-copied="true"] .checkmark {
    display: block;
  }
</style>
