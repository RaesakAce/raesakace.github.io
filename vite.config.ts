import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";

// Detect GitHub Pages environment so assets resolve correctly for both project and user sites.
const repo = process.env.GITHUB_REPOSITORY?.split("/")[1] ?? "";
const isCI = process.env.CI === "true";
const isUserSite = repo.endsWith(".github.io");
const base = isCI ? (isUserSite ? "/" : `/${repo}/`) : "/";

export default defineConfig({
  base,
  plugins: [svelte()],
});
