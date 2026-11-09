import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Prepara los componentes JSX para que Karma los ejecute en un navegador real.
export default defineConfig({
  plugins: [react()],
  define: { "process.env.NODE_ENV": JSON.stringify("development") },
  build: {
    outDir: "tmp/pruebas",
    emptyOutDir: true,
    minify: false,
    lib: {
      entry: "tests/componentes.spec.jsx",
      name: "PruebasGrano",
      formats: ["iife"],
      fileName: () => "componentes.spec.js",
    },
  },
});
