# Programing Party

## 是什么

Programing Party 是一个「语言对比」站点：同一个知识点（变量、循环、条件判断、函数……）在不同语言下如何写，直接并排展示，帮助你用最短时间建立“语法地图”。

目前内置语言：

- Java
- Go
- Node.js
- Python
- PHP

## 功能

- 按章节浏览：基础语法 / 数据结构 / 面向对象 / Web
- 多语言并排对比：同一片段下不同语言代码并列展示
- 一键切换对比语言：支持多选与对决模式
- 主题切换：亮色 / 暗色

## 技术栈

- Vite + Svelte 5
- Tailwind CSS v4（含 Iconify 插件，用于 UI 小图标）
- 内容生成：TypeScript 脚本将 `content/` 编译到 `src/generatedContent/`

## 本地开发

要求：Node.js `>= 20.19.0`，推荐 pnpm。

```bash
pnpm i
pnpm dev
```

常用命令：

```bash
pnpm build
pnpm preview
pnpm build:content
pnpm build:sitemap
pnpm build:progress
```

## 内容目录

- `content/`：对比内容源（按章节/片段/语言组织）
- `frameworks.ts`：语言元信息（名称、图标路径、文件排序规则等）
- `public/framework/`：语言 Logo（SVG）
- `build-scripts/`：构建期脚本（生成内容、HTML 模板注入等）
- `src/generatedContent/`：自动生成内容（不要手改）

## 🔥 进度（自动生成）

该区域由脚本 `pnpm build:progress` 自动从 `content/` 与 `frameworks.ts` 生成，请勿手动维护。

<!-- progression start -->
<details>
  <summary>
    <img width="18" height="18" src="public/framework/java.svg" />
    <b>Java</b>
    <img src="https://us-central1-progress-markdown.cloudfunctions.net/progress/100" />
  </summary>

- [x] Basics
  - [x] Hello world
  - [x] Variables
  - [x] Loops
  - [x] Conditionals
  - [x] Functions
- [x] Data structures
  - [x] Arrays
  - [x] Maps
- [x] Oop
  - [x] Class definition
- [x] Web
  - [x] Http server
- [x] Concurrency
  - [x] Async basics
  - [x] Timeout cancel
- [x] Errors
  - [x] Errors basics
  - [x] Retry backoff

</details>
    
<details>
  <summary>
    <img width="18" height="18" src="public/framework/go.svg" />
    <b>Go</b>
    <img src="https://us-central1-progress-markdown.cloudfunctions.net/progress/100" />
  </summary>

- [x] Basics
  - [x] Hello world
  - [x] Variables
  - [x] Loops
  - [x] Conditionals
  - [x] Functions
- [x] Data structures
  - [x] Arrays
  - [x] Maps
- [x] Oop
  - [x] Class definition
- [x] Web
  - [x] Http server
- [x] Concurrency
  - [x] Async basics
  - [x] Timeout cancel
- [x] Errors
  - [x] Errors basics
  - [x] Retry backoff

</details>
    
<details>
  <summary>
    <img width="18" height="18" src="public/framework/nodejs.svg" />
    <b>Node.js</b>
    <img src="https://us-central1-progress-markdown.cloudfunctions.net/progress/100" />
  </summary>

- [x] Basics
  - [x] Hello world
  - [x] Variables
  - [x] Loops
  - [x] Conditionals
  - [x] Functions
- [x] Data structures
  - [x] Arrays
  - [x] Maps
- [x] Oop
  - [x] Class definition
- [x] Web
  - [x] Http server
- [x] Concurrency
  - [x] Async basics
  - [x] Timeout cancel
- [x] Errors
  - [x] Errors basics
  - [x] Retry backoff

</details>
    
<details>
  <summary>
    <img width="18" height="18" src="public/framework/python.svg" />
    <b>Python</b>
    <img src="https://us-central1-progress-markdown.cloudfunctions.net/progress/100" />
  </summary>

- [x] Basics
  - [x] Hello world
  - [x] Variables
  - [x] Loops
  - [x] Conditionals
  - [x] Functions
- [x] Data structures
  - [x] Arrays
  - [x] Maps
- [x] Oop
  - [x] Class definition
- [x] Web
  - [x] Http server
- [x] Concurrency
  - [x] Async basics
  - [x] Timeout cancel
- [x] Errors
  - [x] Errors basics
  - [x] Retry backoff

</details>
    
<details>
  <summary>
    <img width="18" height="18" src="public/framework/php.svg" />
    <b>PHP</b>
    <img src="https://us-central1-progress-markdown.cloudfunctions.net/progress/100" />
  </summary>

- [x] Basics
  - [x] Hello world
  - [x] Variables
  - [x] Loops
  - [x] Conditionals
  - [x] Functions
- [x] Data structures
  - [x] Arrays
  - [x] Maps
- [x] Oop
  - [x] Class definition
- [x] Web
  - [x] Http server
- [x] Concurrency
  - [x] Async basics
  - [x] Timeout cancel
- [x] Errors
  - [x] Errors basics
  - [x] Retry backoff

</details>

<!-- progression end -->
