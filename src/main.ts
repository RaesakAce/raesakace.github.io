import "./app.css";
import App from "./App.svelte";

// Register a tiny service worker for offline (optional, safe if missing)
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js").catch(() => {});
  });
}

const app = new App({ target: document.getElementById("app")! });
export default app;