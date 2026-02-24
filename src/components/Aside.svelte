<script lang="ts">
  import { sections, snippets } from "../generatedContent/tree.js";
  import { navigate, isActive, route, BASE_PATH } from "../router.ts";
</script>

<aside
  class="no-scroll hidden lg:block sticky flex-shrink-0 w-full overflow-y-auto top-0 border-r border-(--border-color) bg-[var(--aside-bg)] h-screen transition-colors duration-300"
>
  <nav class="w-full text-sm py-6 px-4 pb-20">
    <ul class="space-y-4">
      {#each sections as section (section.sectionId)}
        {@const isSectionActive =
          (route.params as any).sectionId === section.sectionDirName}
        <li>
          <div
            class={[
              "w-full text-left font-bold uppercase tracking-wider text-xs mb-3 px-4 flex items-center gap-2 transition-colors",
              isSectionActive
                ? "text-blue-600 dark:text-blue-400"
                : "text-gray-900 dark:text-gray-400",
            ]}
          >
            <span class="opacity-100 dark:opacity-70 transition-opacity">
              {section.title}
            </span>
          </div>
          <ul class="space-y-1 relative">
            <!-- Vertical line for hierarchy -->
            <div
              class="absolute left-4 top-0 bottom-0 w-px bg-gray-200/100 dark:bg-gray-700 transition-colors"
              aria-hidden="true"
            ></div>

            {#each snippets.filter((s: any) => s.sectionId === section.sectionId) as snippet (snippet.snippetId)}
              {@const isSnippetActive = (isActive as any)(
                `${BASE_PATH}/:sectionId/:snippetId`,
                {
                  sectionId: section.sectionDirName,
                  snippetId: snippet.snippetDirName,
                },
              )}
              <li>
                <button
                  class={[
                    "relative block w-[calc(100%-2rem)] ml-6 py-1.5 pl-3 pr-3 text-left transition-all duration-200 rounded-md text-sm",
                    isSnippetActive
                      ? "bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 font-medium"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-200/50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200",
                  ]}
                  onclick={() => {
                    (navigate as any)(
                      `${BASE_PATH}/${section.sectionDirName}/${snippet.snippetDirName}`,
                      {
                        search: route.search,
                      },
                    );
                  }}
                >
                  {snippet.title}
                </button>
              </li>
            {/each}
          </ul>
        </li>
      {/each}
    </ul>
  </nav>
</aside>
