import { createRouter } from "sv-router";
import Index from "./Index.svelte";

export { searchParams } from "sv-router";
export const { p, navigate, isActive, route } = createRouter({
  "/": Index,
  "/:sectionId": Index,
  "/:sectionId/:snippetId": Index,
});
