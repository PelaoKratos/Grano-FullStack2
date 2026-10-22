import { cpSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const carpetaProyecto = fileURLToPath(new URL(".", import.meta.url));
const carpetaReact = resolve(carpetaProyecto, "react");
const paginasActuales = readdirSync(carpetaProyecto)
  .filter((archivo) => archivo.endsWith(".html"))
  .map((archivo) => [archivo.replace(".html", ""), resolve(carpetaProyecto, archivo)]);

export default defineConfig({
  plugins: [
    react(),
    {
      name: "copiar-scripts-de-la-version-actual",
      closeBundle() {
        cpSync(resolve(carpetaProyecto, "js"), resolve(carpetaReact, "dist/js"), {
          recursive: true,
        });
        cpSync(resolve(carpetaProyecto, "assets"), resolve(carpetaReact, "dist/assets"), {
          recursive: true,
        });
      },
    },
  ],
  appType: "mpa",
  build: {
    outDir: resolve(carpetaReact, "dist"),
    emptyOutDir: true,
    rollupOptions: {
      input: Object.fromEntries([
        ...paginasActuales,
        ["react", resolve(carpetaReact, "index.html")],
        ["reactCatalogo", resolve(carpetaReact, "productos.html")],
        ["reactProducto", resolve(carpetaReact, "producto.html")],
      ]),
    },
  },
});
