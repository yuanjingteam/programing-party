import { defineConfig, type ViteDevServer } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import fs from "node:fs/promises";
import path from "node:path";
import { Eta } from "eta";
import { minify as htmlMinify } from "html-minifier-terser";
import { frameworks } from "./frameworks";
import pluginGenerateFrameworkContent from "./build-scripts/generateContentVitePlugin";
import generateSitemap from "./scripts/generateSitemap";
import { svelteInspector } from "@sveltejs/vite-plugin-svelte-inspector";
import tailwindcss from "@tailwindcss/vite";
import { FRAMEWORK_SEPARATOR } from "./src/constants.ts";

// Helper function to create framework comparison URLs
const createFrameworkUrl = (frameworks: string[]) =>
  `/?f=${frameworks.join(FRAMEWORK_SEPARATOR)}`;

const footerNavigation = [
  {
    title: "新旧对决",
    links: [
      {
        name: "Java (1995) vs Go (2009)",
        url: createFrameworkUrl(["java", "go"]),
      },
      {
        name: "PHP (1995) vs Node.js (2009)",
        url: createFrameworkUrl(["php", "nodejs"]),
      },
    ],
  },
  {
    title: "热门语言",
    links: [
      { name: "Python vs Java", url: createFrameworkUrl(["python", "java"]) },
      { name: "Node.js vs Go", url: createFrameworkUrl(["nodejs", "go"]) },
      {
        name: "Python vs Node.js",
        url: createFrameworkUrl(["python", "nodejs"]),
      },
    ],
  },
  {
    title: "不同范式",
    links: [
      {
        name: "Java (OOP) vs Go (Structs)",
        url: createFrameworkUrl(["java", "go"]),
      },
      {
        name: "Python (Dynamic) vs Go (Static)",
        url: createFrameworkUrl(["python", "go"]),
      },
    ],
  },
];

const templateDataDefaults = {
  title: "Programing Party",
  url: "https://traeprograming-partydev-mainu7i9.vercel.app/",
  description: `并排比较编程语言：Java, Go, Node.js, Python, PHP。查看语法差异、功能和代码示例。`,
  keywords:
    "编程语言, Java, Go, Node.js, Python, PHP, 语言对比, 代码对比, 语法差异, 后端开发",
  image: "https://traeprograming-partydev-mainu7i9.vercel.app/banner2.png",
  frameworkCount: frameworks.length,
  navigations: footerNavigation, // Ensure navigations is available here too
};

// https://vitejs.dev/config/
export default defineConfig({
  base: process.env.BASE_URL || "/",
  resolve: {
    alias: {
      "@frameworks": path.resolve(import.meta.dirname, "frameworks"),
    },
  },
  plugins: [
    pluginGenerateFrameworkContent(),
    svelte(),
    svelteInspector(), // https://github.com/sveltejs/vite-plugin-svelte/blob/main/docs/inspector.md
    generateHtmlPagesPlugin([
      {
        outputPath: "index.html",
        template: "dist/index.html",
        templateData: {
          ...templateDataDefaults,
          navigations: footerNavigation,
        },
      },
      {
        outputPath: "404.html",
        template: "dist/index.html",
        templateData: {
          ...templateDataDefaults,
          navigations: footerNavigation,
        },
      },
    ]),
    tailwindcss(),
  ],
  optimizeDeps: {
    entries: ["src/**/*"],
  },
  build: {
    rollupOptions: {
      external: (id) => {
        if (id.includes("generateContentVitePlugin")) return true;
        return id.includes("/content/");
      },
      output: {
        manualChunks: {
          vendor: ["svelte"],
          frameworks: ["@frameworks"],
        },
      },
    },
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    sourcemap: false,
    target: "esnext",
  },
});

async function generateHtmlPagesPlugin(pages: unknown[]) {
  const eta = new Eta({ views: "." });
  const footerTemplatePath = path.resolve(
    import.meta.dirname,
    "build-scripts/template/footer.html",
  );

  const template = {
    footer: await fs.readFile(footerTemplatePath, "utf8"),
  };

  const htmlTransform = {
    include(html: string) {
      for (const [templateName, templateContent] of Object.entries(template)) {
        html = html.replace(
          `<!--template:${templateName}-->`,
          eta.renderString(templateContent, { navigations: footerNavigation }),
        );
      }
      return html;
    },
    render(htmlEta: string, data: unknown) {
      return eta.renderString(htmlEta, data as object);
    },
  };

  return {
    name: "generate-html-pages",
    configureServer(server: ViteDevServer) {
      server.watcher.add(footerTemplatePath);
      server.watcher.on("change", async (file) => {
        if (file === footerTemplatePath) {
          template.footer = await fs.readFile(footerTemplatePath, "utf8");
          server.ws.send({
            type: "full-reload",
            path: "*",
          });
        }
      });
    },
    transformIndexHtml(html: string, ctx: unknown) {
      html = htmlTransform.include(html);
      if ((ctx as { server?: unknown }).server) {
        const matchedPage = pages.find(
          (page: unknown) =>
            (ctx as { originalUrl?: string }).originalUrl ===
            filePathToUrl((page as { outputPath: string }).outputPath),
        );
        if (matchedPage) {
          html = htmlTransform.render(
            html,
            (matchedPage as { templateData: unknown }).templateData,
          );
        } else {
          html = htmlTransform.render(html, templateDataDefaults);
        }
      }
      return html;
    },
    async closeBundle() {
      // Generate sitemap
      await generateSitemap();

      for (const page of pages) {
        const template =
          (page as { template?: string }).template || "index.html";
        const templateData =
          (page as { templateData?: unknown }).templateData || {};
        const templatePath = path.join(import.meta.dirname, template);
        const outputPath = path.join(
          import.meta.dirname,
          "dist",
          (page as { outputPath: string }).outputPath,
        );

        const templateContent = await fs.readFile(templatePath, "utf8");
        const compiledHtml = eta.renderString(templateContent, templateData);
        const minifiedHtml = await htmlMinify(compiledHtml);
        const dirPath = path.dirname(outputPath);
        await fs.mkdir(dirPath, { recursive: true });
        await fs.writeFile(outputPath, minifiedHtml, "utf8");
      }
    },
  };
}

function filePathToUrl(filePath: string) {
  const normalizedPath = path.normalize(filePath);
  const baseName = path.basename(normalizedPath);

  if (baseName === "index.html") {
    return path.dirname(normalizedPath) === "."
      ? "/"
      : path.dirname(normalizedPath) + "/";
  } else {
    return normalizedPath.replace(/.html$/, "");
  }
}
