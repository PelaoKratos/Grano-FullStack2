import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { instrumentarCobertura } from "./tests/ayudas/cobertura.js";

// Prepara los componentes JSX para que Karma los ejecute en un navegador real.
export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    ...(mode === "cobertura" ? [instrumentarCobertura()] : []),
  ],
  define: { "process.env.NODE_ENV": JSON.stringify("development") },
  build: {
    outDir: "tmp/pruebas",
    emptyOutDir: true,
    minify: false,
    sourcemap: mode === "cobertura",
    lib: {
      entry:
        mode === "cobertura"
          ? "tests/inicio-cobertura.js"
          : "tests/inicio-pruebas.js",
      name: "PruebasGrano",
      formats: ["iife"],
      fileName: () => "pruebas.spec.js",
    },
  },
}));
