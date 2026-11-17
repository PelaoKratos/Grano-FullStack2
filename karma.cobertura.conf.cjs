const configurarPruebas = require("./karma.conf.cjs");

// Usamos las mismas pruebas y añadimos el reporte de cobertura.
module.exports = (config) => {
  configurarPruebas(config);
  config.set({
    plugins: ["karma-jasmine", "karma-chrome-launcher", "karma-coverage"],
    reporters: ["progress", "coverage"],
    coverageReporter: {
      dir: "coverage",
      subdir: ".",
      check: {
        global: { statements: 80, branches: 80, functions: 80, lines: 80 },
      },
      reporters: [
        { type: "html" },
        { type: "text-summary" },
        { type: "json-summary" },
        { type: "json" },
        { type: "lcovonly" },
      ],
    },
  });
};
