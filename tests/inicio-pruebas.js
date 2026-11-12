// Vite encuentra los archivos de Jasmine dentro de estas carpetas.
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
import.meta.glob(
  [
    "./componentes/**/*.spec.jsx",
    "./paginas/**/*.spec.jsx",
    "./hooks/**/*.spec.jsx",
    "./datos/**/*.spec.js",
    "./integracion/**/*.spec.jsx",
  ],
  { eager: true },
);
