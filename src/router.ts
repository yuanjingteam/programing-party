import { createRouter } from "sv-router";
import Index from "./Index.svelte";

// 获取 base path，用于 GitHub Pages 子路径部署
export const BASE_PATH = import.meta.env.BASE_URL?.replace(/\/$/, "") || "";

export { searchParams } from "sv-router";

// 直接使用硬编码的路由配置，确保 sv-router 可以正确初始化
// 使用 as any 来绕过 TypeScript 的严格类型检查
// 注意：需要同时支持带斜杠和不带斜杠的路径
const routes = {
  "/programing-party": Index,
  "/programing-party/": Index,
  "/programing-party/:sectionId": Index,
  "/programing-party/:sectionId/:snippetId": Index,
} as any;

export const { p, navigate, isActive, route } = createRouter(routes);
