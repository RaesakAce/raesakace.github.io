import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";

// In CI (GitHub Actions) we detect repo and set base to "/<repo>/"
const repo = process.env.GITHUB_REPOSITORY?.split("/")[1] ?? "";
const isCI = process.env.CI === "true";

export default defineConfig({
  base: isCI && repo ? `/${repo}/` : "/",
  plugins: [svelte()],
});