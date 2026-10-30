import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { rutasAnteriores } from "./src/datos/rutas.js";

// Cada archivo HTML antiguo envía al usuario a su ruta equivalente en React.
function crearRedireccionHtml(rutaDestino) {
  return `<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8">
    <meta http-equiv="refresh" content="0;url=${rutaDestino}">
    <title>Grano</title>
    <script>
      const destino = new URL(${JSON.stringify(rutaDestino)}, location.href);

      // Conserva filtros y destinos recibidos en la dirección antigua.
      if (location.search) {
        const separador = destino.hash.includes("?") ? "&" : "?";
        destino.hash += separador + location.search.slice(1);
      }

      location.replace(destino.href);
    </script>
  </head>
  <body>
    <a href="${rutaDestino}">Continuar en Grano</a>
  </body>
</html>`;
}

// Vite ejecuta este complemento al generar la carpeta dist para publicar.
function enlacesAnteriores() {
  return {
    name: "grano-enlaces-anteriores",
    generateBundle() {
      for (const [archivo, ruta] of Object.entries(rutasAnteriores)) {
        const destino = `./#${ruta}`;
        this.emitFile({
          type: "asset",
          fileName: archivo,
          source: crearRedireccionHtml(destino),
        });
      }
      this.emitFile({
        type: "asset",
        fileName: "react/index.html",
        source: `<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8">
    <meta http-equiv="refresh" content="0;url=../#/">
    <title>Grano</title>
  </head>
  <body>
    <a href="../#/">Abrir Grano</a>
  </body>
</html>`,
      });
    },
  };
}

export default defineConfig({
  base: "./",
  plugins: [react(), enlacesAnteriores()],
});
