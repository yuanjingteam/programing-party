import { defineConfig, type ViteDevServer } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import fs from "node:fs/promises";
import path from "node:path";
import { Eta } from "eta";
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
        templateData: {
          ...templateDataDefaults,
          navigations: footerNavigation,
        },
      },
      {
        outputPath: "404.html",
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
        drop_console: false, // 暂时保留 console 用于调试
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

      // Update manifest.json with correct base path
      const manifestPath = path.join(
        import.meta.dirname,
        "dist",
        "manifest.json",
      );
      const baseUrl = process.env.BASE_URL || "/";

      try {
        const manifestContent = await fs.readFile(manifestPath, "utf8");
        const manifest = JSON.parse(manifestContent);

        // Update all absolute paths in manifest
        const updatePath = (p: string) =>
          p.startsWith("/") && !p.startsWith(baseUrl)
            ? `${baseUrl.replace(/\/$/, "")}${p}`
            : p;

        if (manifest.start_url)
          manifest.start_url = updatePath(manifest.start_url);
        if (manifest.scope) manifest.scope = updatePath(manifest.scope);
        if (manifest.icons) {
          manifest.icons = manifest.icons.map((icon: any) => ({
            ...icon,
            src: updatePath(icon.src),
          }));
        }
        if (manifest.screenshots) {
          manifest.screenshots = manifest.screenshots.map(
            (screenshot: any) => ({
              ...screenshot,
              src: updatePath(screenshot.src),
            }),
          );
        }
        if (manifest.shortcuts) {
          manifest.shortcuts = manifest.shortcuts.map((shortcut: any) => ({
            ...shortcut,
            url: updatePath(shortcut.url),
            icons: shortcut.icons?.map((icon: any) => ({
              ...icon,
              src: updatePath(icon.src),
            })),
          }));
        }

        await fs.writeFile(
          manifestPath,
          JSON.stringify(manifest, null, 2),
          "utf8",
        );
      } catch (error) {
        console.error("Failed to update manifest.json:", error);
      }

      // Generate 404.html with redirect script for SPA routing
      const indexPath = path.join(import.meta.dirname, "dist", "index.html");
      const notFoundPath = path.join(import.meta.dirname, "dist", "404.html");

      try {
        let indexContent = await fs.readFile(indexPath, "utf8");

        // Add redirect script to index.html for restoring the path
        const indexRedirectScript = `
    <script>
      // GitHub Pages SPA redirect - 恢复路径
      (function() {
        var redirect = sessionStorage.redirect;
        delete sessionStorage.redirect;
        if (redirect && redirect !== location.pathname + location.search + location.hash) {
          history.replaceState(null, null, redirect);
        }
      })();
    </script>`;

        // Insert script before closing head tag in index.html
        indexContent = indexContent.replace(
          "</head>",
          indexRedirectScript + "\n  </head>",
        );

        // Write back to index.html
        await fs.writeFile(indexPath, indexContent, "utf8");

        // For 404.html, add script to store the path and redirect
        const notFoundScript = `
    <script>
      // GitHub Pages SPA redirect - 存储完整路径并重定向
      sessionStorage.redirect = location.pathname + location.search + location.hash;
      location.replace(location.origin + '/programing-party/');
    </script>`;

        // Create 404.html with redirect script
        let notFoundContent = await fs.readFile(indexPath, "utf8");
        notFoundContent = notFoundContent.replace(
          "</head>",
          notFoundScript + "\n  </head>",
        );

        await fs.writeFile(notFoundPath, notFoundContent, "utf8");
      } catch (error) {
        console.error("Failed to generate 404.html:", error);
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
