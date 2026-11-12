import "./inicio-pruebas.js";

// Incluimos también módulos que aún no tienen casos: deben aparecer en el reporte.
// main.jsx se excluye porque monta la aplicación real fuera de las pruebas.
import.meta.glob(["../src/**/*.{js,jsx}", "!../src/main.jsx"], { eager: true });
