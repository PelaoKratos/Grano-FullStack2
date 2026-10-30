const fs = require("node:fs");
const path = require("node:path");

// Usa Chrome instalado; también permite indicar otro ejecutable con CHROME_BIN.
if (!process.env.CHROME_BIN && process.platform === "win32") {
  const candidatos = [
    path.join(
      process.env.PROGRAMFILES || "C:/Program Files",
      "Google/Chrome/Application/chrome.exe",
    ),
    path.join(
      process.env.LOCALAPPDATA || "",
      "Google/Chrome/Application/chrome.exe",
    ),
    path.join(
      process.env["PROGRAMFILES(X86)"] || "C:/Program Files (x86)",
      "Microsoft/Edge/Application/msedge.exe",
    ),
  ];
  process.env.CHROME_BIN =
    candidatos.find((archivo) => fs.existsSync(archivo)) || "";
}

module.exports = (config) =>
  config.set({
    frameworks: ["jasmine"],
    files: [{ pattern: "tmp/pruebas/componentes.spec.js", watched: false }],
    plugins: ["karma-jasmine", "karma-chrome-launcher"],
    browsers: ["ChromeHeadless"],
    reporters: ["progress"],
    client: { jasmine: { random: false }, clearContext: false },
    hostname: "127.0.0.1",
    listenAddress: "127.0.0.1",
    port: 9876,
    singleRun: true,
    autoWatch: false,
    browserNoActivityTimeout: 30000,
  });
