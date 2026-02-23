import { createLocalStorage } from "./createLocaleStorage";

const themeStorage = createLocalStorage("theme-preference", "dark");

let _isDark = $state(themeStorage.get() === "dark");

export function toggleTheme() {
  const next = _isDark ? "light" : "dark";
  themeStorage.set(next);
  _isDark = next === "dark";
  applyTheme(next);
}

export function initTheme() {
  const stored = themeStorage.get();
  let theme = stored;

  if (!theme) {
    if (
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    ) {
      theme = "dark";
    } else {
      theme = "light";
    }
  }

  _isDark = theme === "dark";
  applyTheme(theme);
}

function applyTheme(theme: string) {
  const root = document.documentElement;
  if (theme === "dark") {
    // 基础颜色
    root.style.setProperty("--bg-color", "rgb(17 24 39)");
    root.style.setProperty("--text-color", "#ffffff");
    root.style.setProperty("--border-color", "rgb(55 65 81)");
    root.style.setProperty("--header-bg", "rgba(17, 24, 39, 0.8)");
    root.style.setProperty("--aside-bg", "#0d1117");

    // 代码块颜色 - 深黑色
    root.style.setProperty("--code-bg", "#0d1117");
    root.style.setProperty("--code-tab-bg", "#0d1117");
    root.style.setProperty("--code-tab-text", "#e5e7eb");
    root.style.setProperty("--code-text", "#e5e7eb");

    // 按钮颜色
    root.style.setProperty("--button-bg", "rgb(31 41 55)");
    root.style.setProperty("--button-bg-hover", "rgb(55 65 81)");
    root.style.setProperty("--button-border", "rgb(75 85 99)");
    root.style.setProperty("--button-text", "#e5e7eb");

    // 激活状态颜色
    root.style.setProperty("--button-active-bg", "rgb(30 58 138)");
    root.style.setProperty("--button-active-border", "rgb(59 130 246)");
    root.style.setProperty("--button-active-text", "rgb(147 197 253)");

    root.style.setProperty("color-scheme", "dark");
    root.classList.add("dark");
  } else {
    // 基础颜色
    root.style.setProperty("--bg-color", "#ffffff");
    root.style.setProperty("--text-color", "#111827");
    root.style.setProperty("--border-color", "#e5e7eb");
    root.style.setProperty("--header-bg", "rgba(255, 255, 255, 0.8)");
    root.style.setProperty("--aside-bg", "#f9fafb");

    // 代码块颜色
    root.style.setProperty("--code-bg", "#f3f4f6");
    root.style.setProperty("--code-tab-bg", "#e5e7eb");
    root.style.setProperty("--code-tab-text", "#374151");
    root.style.setProperty("--code-text", "#1f2937");

    // 按钮颜色
    root.style.setProperty("--button-bg", "#ffffff");
    root.style.setProperty("--button-bg-hover", "#f9fafb");
    root.style.setProperty("--button-border", "#d1d5db");
    root.style.setProperty("--button-text", "#374151");

    // 激活状态颜色
    root.style.setProperty("--button-active-bg", "#eff6ff");
    root.style.setProperty("--button-active-border", "#3b82f6");
    root.style.setProperty("--button-active-text", "#1d4ed8");

    root.style.setProperty("color-scheme", "light");
    root.classList.remove("dark");
  }
}

export const isDark = {
  get value() {
    return _isDark;
  },
};
