<script lang="ts">
  import ThemeSwitch from "./ThemeSwitch.svelte";
  import { BASE_PATH } from "../router.ts";
</script>

<header
  class="backdrop-blur border-b transition-colors duration-300 bg-[var(--header-bg)] border-[var(--border-color)]"
>
  <div class="px-4 sm:px-6 lg:px-8">
    <div class="flex justify-between items-center py-3">
      <a
        class="font-semibold text-lg flex items-center space-x-3 text-[var(--text-color)]"
        href="{BASE_PATH}/"
      >
        <img
          src="{BASE_PATH}/popper.svg"
          alt="logo"
          class="size-6"
          width="20"
          height="20"
        />
        <h1>Programing Party</h1>
      </a>
      <ThemeSwitch />
    </div>
  </div>
</header>
