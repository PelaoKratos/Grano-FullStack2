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
