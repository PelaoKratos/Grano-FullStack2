import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { rutasAnteriores } from "./src/datos/rutas.js";

// Keep bookmarked HTML URLs working on static hosts as well as the dev server.
function enlacesAnteriores() {
  return {
    name: "grano-enlaces-anteriores",
    generateBundle() {
      for (const [file, route] of Object.entries(rutasAnteriores)) {
        const destination = `./#${route}`;
        this.emitFile({
          type: "asset",
          fileName: file,
          source: `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta http-equiv="refresh" content="0;url=${destination}"><title>Grano</title><script>const destino=new URL(${JSON.stringify(destination)},location.href);if(location.search)destino.hash+=(destino.hash.includes('?')?'&':'?')+location.search.slice(1);location.replace(destino.href)</script></head><body><a href="${destination}">Continuar en Grano</a></body></html>`,
        });
      }
      this.emitFile({
        type: "asset",
        fileName: "react/index.html",
        source:
          '<!doctype html><html lang="es"><head><meta charset="utf-8"><meta http-equiv="refresh" content="0;url=../#/"><title>Grano</title></head><body><a href="../#/">Abrir Grano</a></body></html>',
      });
    },
  };
}

export default defineConfig({
  base: "./",
  plugins: [react(), enlacesAnteriores()],
});
