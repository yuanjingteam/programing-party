<script lang="ts">
  import { onMount } from "svelte";
  import { initTheme, isDark } from "./lib/theme.svelte";
  import { SvelteMap, SvelteSet } from "svelte/reactivity";
  import { frameworks, matchFrameworkId } from "@frameworks";
  import FrameworkLabel from "./components/FrameworkLabel.svelte";
  import { sections, snippets } from "./generatedContent/tree.js";
  import snippetsImporterByFrameworkId from "./generatedContent/framework/index.js";
  import CodeEditor from "./components/CodeEditor.svelte";
  import { createLocalStorage } from "./lib/createLocaleStorage.ts";
  import { watch } from "runed";
  import { fly } from "svelte/transition";
  import { cubicOut } from "svelte/easing";
  import Header from "./components/Header.svelte";
  import Aside from "./components/Aside.svelte";
  import {
    FRAMEWORK_IDS_FROM_URL_KEY,
    FRAMEWORK_SEPARATOR,
  } from "./constants.ts";
  import { searchParams, route, navigate } from "./router.ts";

  interface File {
    fileName: string;
    contentHtml: string;
    [key: string]: unknown;
  }

  interface FrameworkSnippet {
    frameworkId: string;
    snippetId: string;
    files: File[];
    playgroundURL: string;
    markdownFiles: File[];
    snippetEditHref: string;
  }

  const MAX_FRAMEWORK_NOBONUS = 9;
  const DEFAULT_FRAMEWORKS = frameworks.map((f) => f.id);
  const FRAMEWORKS_BONUS = frameworks.slice(MAX_FRAMEWORK_NOBONUS);
  const frameworkIdsStorage = createLocalStorage<string[]>(
    "framework_display",
    [],
  );

  const frameworkIdsSelected = new SvelteSet<string>();
  const frameworkIdsSelectedArr = $derived([...frameworkIdsSelected]);
  const frameworksSelected = $derived(
    frameworkIdsSelectedArr.map((id: string) => matchFrameworkId(id)),
  );
  const snippetsByFrameworkId = new SvelteMap<string, FrameworkSnippet[]>();
  let frameworkIdsSelectedInitialized = $state(false);
  const isVersusFrameworks = $derived(frameworksSelected.length === 2);
  const siteTitle = $derived(
    isVersusFrameworks
      ? `${frameworksSelected.map((f) => f!.title).join(" 对比 ")} - Programing Party`
      : "Programing Party",
  );
  const frameworkIdsFromSearchParam = $derived.by(() => {
    const value = searchParams.get(FRAMEWORK_IDS_FROM_URL_KEY);
    if (typeof value === "string") {
      return value.split(FRAMEWORK_SEPARATOR).filter(matchFrameworkId);
    }
    return [];
  });

  // handle on link click
  watch(
    [() => frameworkIdsFromSearchParam],
    () => {
      if (frameworkIdsFromSearchParam.length === 0) {
        selectFrameworks(DEFAULT_FRAMEWORKS);
      } else {
        selectFrameworks(frameworkIdsFromSearchParam);
      }
    },
    { lazy: true },
  );

  function selectFrameworks(frameworkIds: string[]) {
    frameworkIdsSelected.clear();
    const idsToSelect =
      frameworkIds.length === 0 ? DEFAULT_FRAMEWORKS : frameworkIds;

    for (const frameworkId of idsToSelect) {
      frameworkIdsSelected.add(frameworkId);
    }
    navigateWithFrameworkSelection();
  }

  function onInit() {
    const frameworkIdsFromStorage = frameworkIdsStorage
      .getJSON()
      .filter((id) => matchFrameworkId(id));

    // From search param
    if (frameworkIdsFromSearchParam.length > 0) {
      selectFrameworks(frameworkIdsFromSearchParam);
    } else if (frameworkIdsFromStorage.length > 0) {
      selectFrameworks(frameworkIdsFromStorage);
    } else {
      // Default frameworks (all)
      selectFrameworks(DEFAULT_FRAMEWORKS);
    }

    frameworkIdsSelectedInitialized = true;
  }

  onMount(() => {
    onInit();
    initTheme();
  });

  function toggleFrameworkId(frameworkId: string) {
    if (frameworkIdsSelected.has(frameworkId)) {
      frameworkIdsSelected.delete(frameworkId);
    } else {
      frameworkIdsSelected.add(frameworkId);
    }
    navigateWithFrameworkSelection();
  }

  async function navigateWithFrameworkSelection() {
    if (frameworkIdsSelected.size === 0) {
      searchParams.delete(FRAMEWORK_IDS_FROM_URL_KEY);
    } else {
      searchParams.set(
        FRAMEWORK_IDS_FROM_URL_KEY,
        frameworkIdsSelectedArr.join(FRAMEWORK_SEPARATOR),
      );
    }
  }

  let snippetsByFrameworkIdLoading = new SvelteSet<string>();
  let snippetsByFrameworkIdError = new SvelteSet<string>();

  watch([() => frameworkIdsSelected.entries()], () => {
    for (const frameworkId of frameworkIdsSelectedArr) {
      if (!snippetsByFrameworkId.has(frameworkId)) {
        snippetsByFrameworkIdError.delete(frameworkId);
        snippetsByFrameworkIdLoading.add(frameworkId);

        snippetsImporterByFrameworkId[frameworkId]()
          .then(
            ({
              default: frameworkSnippets,
            }: {
              default: FrameworkSnippet[];
            }) => {
              snippetsByFrameworkId.set(frameworkId, frameworkSnippets);
            },
          )
          .catch(() => {
            snippetsByFrameworkIdError.add(frameworkId);
          })
          .finally(() => {
            snippetsByFrameworkIdLoading.delete(frameworkId);
          });
      }
    }
  });

  let showBonusFrameworks = $state(false);
  const sidebarStorage = createLocalStorage<string>("sidebar_open", "true");
  let isSidebarOpen = $state(sidebarStorage.get() !== "false");

  function toggleSidebar() {
    isSidebarOpen = !isSidebarOpen;
    sidebarStorage.set(String(isSidebarOpen));
  }

  const bonusFrameworks = $derived(
    FRAMEWORKS_BONUS.filter(({ id }) => !frameworkIdsSelected.has(id)),
  );

  const frameworksNotSelected = $derived(
    frameworks.filter(({ id }) => id && !frameworkIdsSelected.has(id)),
  );

  const headerFrameworks = $derived(
    [
      ...frameworksSelected.filter((f) => f),
      ...frameworksNotSelected.filter(
        (f) => f && !bonusFrameworks.find((bf) => bf.id === f.id),
      ),
      ...(showBonusFrameworks ? bonusFrameworks : []),
    ].filter((f): f is NonNullable<typeof f> => !!f),
  );

  // Router logic
  const activeSectionDirName = $derived(route.params.sectionId);
  const activeSnippetDirName = $derived(route.params.snippetId);

  const currentSection = $derived(
    sections.find((s) => s.sectionDirName === activeSectionDirName),
  );
  const currentSnippet = $derived(
    snippets.find(
      (s) =>
        s.sectionDirName === activeSectionDirName &&
        s.snippetDirName === activeSnippetDirName,
    ),
  );

  $effect(() => {
    // If root, redirect to first section
    if (!activeSectionDirName && sections.length > 0) {
      // @ts-ignore
      navigate("/:sectionId", {
        params: { sectionId: sections[0].sectionDirName },
        replace: true,
        search: route.search,
      });
      return;
    }

    // If section but no snippet, redirect to first snippet of section
    if (activeSectionDirName && !activeSnippetDirName) {
      const firstSnippet = snippets.find(
        (s) => s.sectionDirName === activeSectionDirName,
      );
      if (firstSnippet) {
        // @ts-ignore
        navigate("/:sectionId/:snippetId", {
          params: {
            sectionId: activeSectionDirName,
            snippetId: firstSnippet.snippetDirName,
          },
          replace: true,
          search: route.search,
        });
      }
    }
  });
  $effect(() => {
    // Force dark mode class on html element if theme is dark
    // This is needed because some components might rely on the .dark class
    // being present on a parent element, but we want it globally.
    // The initTheme function already handles this, but we want to be reactive.
    if (isDark.value) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  });
</script>

<svelte:head>
  <title>{siteTitle}</title>
  <meta
    name="description"
    content={isVersusFrameworks
      ? `并排比较 ${frameworksSelected
          .map((f) => f?.title)
          .filter(Boolean)
          .join(" 和 ")} 框架。查看 ${frameworksSelected
          .map((f) => f?.title)
          .filter(Boolean)
          .join(" 和 ")} 的语法差异、功能和代码示例。`
      : "并排比较 JavaScript 框架：React, Vue, Angular, Svelte, Solid.js 等。查看 Web 开发框架的语法差异、功能和代码示例。"}
  />
  <meta
    name="keywords"
    content={isVersusFrameworks
      ? frameworksSelected
          .map((f) => f?.title)
          .filter(Boolean)
          .join(", ") +
        ", 框架比较, JavaScript 框架, Web 开发, 前端开发, 代码比较"
      : "JavaScript 框架, React, Vue, Angular, Svelte, Solid.js, 框架比较, Web 开发, 前端框架, 组件库, JavaScript 库, 代码比较, 编程工具, 开发者工具, Web 组件, JSX, TypeScript, 现代 JavaScript"}
  />
  {#if isVersusFrameworks}
    <meta property="og:title" content={siteTitle} />
    <meta
      property="og:description"
      content="并排比较 {frameworksSelected
        .map((f) => f?.title)
        .filter(Boolean)
        .join(' 和 ')} 框架。查看 {frameworksSelected
        .map((f) => f?.title)
        .filter(Boolean)
        .join(' 和 ')} 的语法差异、功能和代码示例。"
    />
    <meta property="twitter:title" content={siteTitle} />
    <meta
      property="twitter:description"
      content="并排比较 {frameworksSelected
        .map((f) => f?.title)
        .filter(Boolean)
        .join(' 和 ')} 框架。查看 {frameworksSelected
        .map((f) => f?.title)
        .filter(Boolean)
        .join(' 和 ')} 的语法差异、功能和代码示例。"
    />
  {/if}
</svelte:head>

<Header />

<div
  class="flex border-b border-[var(--border-color)] transition-colors duration-300"
>
  <div
    class="flex-shrink-0 transition-all duration-300 ease-in-out overflow-hidden"
    class:w-0={!isSidebarOpen}
    class:w-64={isSidebarOpen}
  >
    <Aside />
  </div>
  <div class="pb-8 w-10 grow">
    <div
      class="flex px-6 lg:px-20 py-2 sticky top-0 z-20 w-full backdrop-blur bg-[var(--header-bg)] border-b border-[var(--border-color)] whitespace-nowrap overflow-x-auto transition-colors duration-300"
      data-framework-id-selected-list={frameworkIdsSelectedArr.join(",")}
      data-testid="framework-selection-bar"
    >
      <button
        class="opacity-70 text-sm flex-shrink-0 rounded border px-3 py-1 border-opacity-50 transition-all mr-2 flex items-center justify-center hover:opacity-100 cursor-pointer"
        style="background-color: var(--button-bg); color: var(--button-text); border-color: var(--button-border);"
        onclick={toggleSidebar}
        title={isSidebarOpen ? "收起侧边栏" : "展开侧边栏"}
        aria-label={isSidebarOpen ? "收起侧边栏" : "展开侧边栏"}
      >
        <span
          class="iconify {isSidebarOpen
            ? 'ph--sidebar-simple'
            : 'ph--sidebar-simple'}"
          aria-hidden="true"
        ></span>
      </button>
      {#each headerFrameworks as framework (framework.id)}
        {#if framework}
          <button
            title={frameworkIdsSelected.has(framework.id)
              ? `隐藏 ${framework.title}`
              : `显示 ${framework.title}`}
            class={[
              "text-sm flex-shrink-0 rounded border px-3 py-1 mr-2 cursor-pointer select-none",
              "transition-all duration-300 ease-out active:scale-95",
              frameworkIdsSelected.has(framework.id)
                ? "text-[var(--button-active-text)] border-[var(--button-active-border)] shadow-sm"
                : "opacity-70 border-opacity-50 text-[var(--button-text)] border-[var(--button-border)] hover:opacity-100 hover:border-opacity-80",
            ]}
            style={frameworkIdsSelected.has(framework.id)
              ? "background-color: var(--button-active-bg);"
              : "background-color: var(--button-bg); &:hover { background-color: var(--button-bg-hover); }"}
            data-testid={`framework-button-${framework.id}`}
            onclick={() => {
              toggleFrameworkId(framework.id);
              if (frameworkIdsSelectedArr.length === 0) {
                frameworkIdsStorage.remove();
              } else {
                frameworkIdsStorage.setJSON(frameworkIdsSelectedArr);
              }
            }}
          >
            <FrameworkLabel id={framework.id} size={16} />
          </button>
        {/if}
      {/each}
      {#if bonusFrameworks.length > 0 && !showBonusFrameworks}
        <button
          title="显示更多框架"
          class="opacity-70 text-sm flex-shrink-0 rounded border px-3 py-1 border-opacity-50 transition-all mr-2 flex items-center justify-center hover:opacity-100"
          style="background-color: var(--button-bg); color: var(--button-text); border-color: var(--button-border);"
          data-testid="show-more-frameworks-button"
          onclick={() => {
            showBonusFrameworks = !showBonusFrameworks;
          }}
          aria-label="显示更多框架"
        >
          <span class="iconify ph--dots-three size-4" aria-hidden="true"></span>
        </button>
      {/if}
    </div>

    <main class="relative pt-6">
      <div>
        {#if frameworkIdsSelected.size === 0}
          <section
            class="space-y-4"
            data-testid="empty-state"
            aria-labelledby="empty-state-heading"
          >
            <div class="flex justify-center">
              <span
                class="iconify ph--arrow-up size-6 animate-bounce"
                aria-hidden="true"
              ></span>
            </div>
            <div class="flex justify-center">
              <h1 id="empty-state-heading" class="sr-only">选择要比较的框架</h1>
              <p
                class="text-lg opacity-80 flex items-center text-center space-x-3"
                data-testid="empty-state-message"
              >
                <img
                  src="/popper.svg"
                  alt="Programing Party logo"
                  class="size-6"
                  width="24"
                  height="24"
                />
                <span> 请选择一个框架以查看代码片段 </span>
                <img
                  src="/popper.svg"
                  alt="Programing Party logo"
                  class="size-6"
                  width="24"
                  height="24"
                />
              </p>
            </div>
          </section>
        {:else if currentSnippet && currentSection}
          {@const snippet = currentSnippet}
          {#key snippet.snippetId}
            <div
              class="px-6 md:px-14 lg:px-20 max-w-full"
              in:fly={{ y: 20, duration: 300, easing: cubicOut }}
            >
              <h2 class="text-2xl font-bold mb-6">
                <span class="opacity-50">{currentSection.title} /</span>
                {snippet.title}
              </h2>

              <div class="space-y-8 mt-2">
                <div
                  id={currentSection.sectionId + "." + snippet.snippetId}
                  data-snippet-id={currentSection.sectionId +
                    "." +
                    snippet.snippetId}
                  data-testid={`snippet-${currentSection.sectionId + "." + snippet.snippetId}`}
                >
                  {#if frameworkIdsSelectedInitialized}
                    <div class="columns-1 xl:columns-2 gap-10 mt-2 space-y-0">
                      {#each frameworkIdsSelectedArr as frameworkId (frameworkId)}
                        {@const framework = matchFrameworkId(frameworkId)}
                        {@const frameworkSnippet = snippetsByFrameworkId
                          .get(frameworkId)
                          ?.find(
                            (s: FrameworkSnippet) =>
                              s.snippetId === snippet.snippetId,
                          )}
                        {@const frameworkSnippetIsLoading =
                          snippetsByFrameworkIdLoading.has(frameworkId)}
                        {@const frameworkSnippetIsError =
                          snippetsByFrameworkIdError.has(frameworkId)}

                        {#if framework}
                          <div
                            class="break-inside-avoid mb-4 xl:mb-6"
                            data-testid={`framework-snippet-${frameworkId}-${snippet.snippetId}`}
                            transition:fly={{
                              y: 20,
                              duration: 300,
                              easing: cubicOut,
                            }}
                          >
                            <div
                              class="flex justify-between items-center space-x-3"
                            >
                              <h3
                                class="m-0"
                                data-testid={`framework-title-${frameworkId}-${snippet.snippetId}`}
                              >
                                <FrameworkLabel id={framework.id} />
                              </h3>
                              {#if frameworkSnippet}
                                <div class="flex items-center space-x-3">
                                  {#if frameworkSnippet.playgroundURL}
                                    <a
                                      href={frameworkSnippet.playgroundURL}
                                      target="_blank"
                                      rel="noreferrer"
                                      class="playground-btn"
                                      title={`打开 ${framework.title} 的 Playground`}
                                      aria-label={`打开 ${framework.title} 的 Playground`}
                                      data-testid={`playground-button-${frameworkId}-${snippet.snippetId}`}
                                    >
                                      <span
                                        class="iconify ph--play size-4 relative z-10"
                                        aria-hidden="true"
                                      ></span>
                                    </a>
                                  {/if}
                                </div>
                              {/if}
                            </div>
                            <div class="mt-2">
                              {#if frameworkSnippet}
                                {#if frameworkSnippet.files.length > 0}
                                  <CodeEditor
                                    files={frameworkSnippet.files}
                                    snippetEditHref={frameworkSnippet.snippetEditHref}
                                    data-testid={`code-editor-${frameworkId}-${snippet.snippetId}`}
                                  />
                                {:else}
                                  <div
                                    class="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-md mx-auto"
                                    data-testid={`missing-snippet-${frameworkId}-${snippet.snippetId}`}
                                  >
                                    <div class="text-center py-8 px-4 sm:px-6">
                                      <div>
                                        <span
                                          class="block text-2xl tracking-tight font-bold"
                                          data-testid="missing-snippet-title"
                                        >
                                          暂无示例
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                {/if}
                              {:else if frameworkSnippetIsLoading}
                                <div
                                  role="status"
                                  data-testid={`loading-snippet-${frameworkId}-${snippet.snippetId}`}
                                >
                                  <div
                                    class="w-75px h-23px py-3 px-4 rounded-t"
                                    style="background-color: var(--code-tab-bg);"
                                  >
                                    <div
                                      class="h-2.5 rounded-full bg-gray-300 dark:bg-gray-700 w-10 animate-pulse"
                                    ></div>
                                  </div>
                                  <div
                                    class="w-full h-164px px-4 py-7"
                                    style="background-color: var(--code-bg);"
                                  >
                                    <div class="max-w-sm animate-pulse">
                                      <div
                                        class="h-3.5 rounded-full bg-gray-300 dark:bg-gray-700 w-48 mb-4"
                                      ></div>
                                      <div
                                        class="h-3.5 rounded-full bg-gray-300 dark:bg-gray-700 max-w-[360px] mb-2.5"
                                      ></div>
                                      <div
                                        class="h-3.5 rounded-full bg-gray-300 dark:bg-gray-700 mb-4"
                                      ></div>
                                      <div
                                        class="h-3.5 rounded-full bg-gray-300 dark:bg-gray-700 max-w-[330px] mb-2.5"
                                      ></div>
                                      <span
                                        class="sr-only"
                                        data-testid="loading-text"
                                        >加载中...</span
                                      >
                                    </div>
                                  </div>
                                </div>
                              {:else if frameworkSnippetIsError}
                                <p
                                  class="text-orange-500"
                                  data-testid={`error-snippet-${frameworkId}-${snippet.snippetId}`}
                                >
                                  加载代码片段出错。请刷新页面。
                                </p>
                              {/if}
                            </div>
                          </div>
                        {/if}
                      {/each}
                    </div>
                  {/if}
                </div>
              </div>
            </div>
          {/key}
        {/if}
      </div>
    </main>
  </div>
</div>

<style>
  .playground-btn {
    --color: #3b82f6; /* blue-500 */
    --bg: #fff; /* Default white background for light mode */
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 2em;
    height: 2em;
    position: relative;
    cursor: pointer;
    overflow: hidden;
    border: 1px solid var(--color);
    transition:
      color 0.5s,
      background-color 0.5s;
    z-index: 1;
    border-radius: 6px;
    color: var(--color);
    background-color: var(--bg);
  }

  :global(.dark) .playground-btn {
    --color: #60a5fa; /* blue-400 */
    --bg: #1f2937; /* gray-800 for dark mode */
  }

  .playground-btn::before {
    content: "";
    position: absolute;
    z-index: 0; /* Changed from -1 to 0 to sit above the background color */
    background: var(--color);
    height: 150px;
    width: 200px;
    border-radius: 50%;
    top: 100%;
    left: 100%;
    transition: all 0.7s;
  }

  .playground-btn:hover {
    color: #fff;
  }

  :global(.dark) .playground-btn:hover {
    color: #fff;
  }

  .playground-btn:hover::before {
    top: -30px;
    left: -30px;
  }

  .playground-btn:active::before {
    background: #2563eb; /* blue-600 */
    transition: background 0s;
  }

  :global(.dark) .playground-btn:active::before {
    background: #3b82f6; /* blue-500 */
  }
</style>
