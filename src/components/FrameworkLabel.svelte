<script lang="ts">
  import { frameworks } from "@frameworks";
  import type { Framework } from "@frameworks";

  interface Props {
    id: string;
    size?: number;
  }

  let { id, size = 20 }: Props = $props();

  const framework: Framework | undefined = $derived(
    frameworks.find((f) => f.id === id),
  );

  const baseURL = (import.meta.env.BASE_URL || "/").endsWith("/")
    ? import.meta.env.BASE_URL || "/"
    : `${import.meta.env.BASE_URL || "/"}/`;
</script>

<div class="flex items-center space-x-1.5">
  {#if framework?.img}
    <img
      src={baseURL + framework.img}
      width={size}
      height={size}
      class="flex-shrink-0"
      alt={`logo of ${framework.title}`}
    />
  {/if}
  <span class="flex-shrink-0 inline-block">{framework?.title || id}</span>
</div>
