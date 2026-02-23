import generateContent from "./lib/generateContent";
import { createFsCache } from "micache";
import { hashElement } from "folder-hash";
import chokidar, { type FSWatcher } from "chokidar";
import { disposeHighlighter } from "./lib/highlighter.ts";

const contentDirFsCache = await createFsCache(
  "pluginGenerateFrameworkContentV2",
);

export default function pluginGenerateFrameworkContent() {
  const name = "generateFrameworkContent";

  function logInfo(...args: unknown[]) {
    console.info(`[${name}]`, ...args);
  }

  let buildIsRunning = false;

  async function build(): Promise<void> {
    if (buildIsRunning) {
      return;
    }
    buildIsRunning = true;
    logInfo("Generating framework content files...");
    await generateContent({ noCache: true });
    const contentDirHash =
      (await hashElement("content")).hash +
      (await hashElement("build-scripts")).hash +
      (await hashElement("frameworks.ts")).hash;
    await contentDirFsCache.set("contentDirHash", contentDirHash);
    logInfo(`done`);
    buildIsRunning = false;
  }

  let fsContentWatcher: FSWatcher | undefined;
  if (process.env.NODE_ENV === "development") {
    fsContentWatcher = chokidar.watch(["content"]).on("change", build);
  }

  return {
    name,
    async buildStart(): Promise<void> {
      try {
        await build();
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
    async buildEnd(): Promise<void> {
      await fsContentWatcher?.close();
      // Dispose of highlighter instances to prevent memory leaks
      await disposeHighlighter();
    },
  };
}
