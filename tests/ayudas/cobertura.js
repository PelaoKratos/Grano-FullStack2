import path from "node:path";
import { normalizePath } from "vite";
import { createInstrumenter } from "istanbul-lib-instrument";

// Solo la compilación de pruebas añade los contadores para medir cobertura.
export function instrumentarCobertura() {
  const carpeta = normalizePath(path.resolve("src")) + "/";
  const instrumentador = createInstrumenter({
    esModules: true,
    produceSourceMap: true,
    compact: false,
  });
  return {
    name: "cobertura-de-grano",
    enforce: "post",
    transform(codigo, id) {
      const archivo = normalizePath(id.split("?")[0]);
      if (
        !archivo.startsWith(carpeta) ||
        !/\.(js|jsx)$/.test(archivo) ||
        archivo.endsWith("/main.jsx")
      )
        return null;
      const mapa = this.getCombinedSourcemap();
      return {
        code: instrumentador.instrumentSync(codigo, archivo, mapa),
        map: instrumentador.lastSourceMap(),
      };
    },
  };
}
