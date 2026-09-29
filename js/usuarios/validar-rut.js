// Estas funciones revisan el formato y el dígito verificador del RUT chileno.
window.Grano = window.Grano || {};

window.Grano.rut = (() => {
  function separar(rut) {
    const limpio = rut.replace(/[^0-9kK]/g, "").toUpperCase();
    return { cuerpo: limpio.slice(0, -1), digito: limpio.slice(-1) };
  }

  function calcularDigito(cuerpo) {
    let suma = 0;
    let multiplicador = 2;

    for (let posicion = cuerpo.length - 1; posicion >= 0; posicion -= 1) {
      suma += Number(cuerpo[posicion]) * multiplicador;
      multiplicador = multiplicador === 7 ? 2 : multiplicador + 1;
    }

    const resultado = 11 - (suma % 11);
    if (resultado === 11) return "0";
    if (resultado === 10) return "K";
    return String(resultado);
  }

  function esValido(rut) {
    const { cuerpo, digito } = separar(rut);
    return /^\d{7,8}$/.test(cuerpo) && /^[0-9K]$/.test(digito) && calcularDigito(cuerpo) === digito;
  }

  function formatear(rut) {
    const { cuerpo, digito } = separar(rut);
    return `${Number(cuerpo).toLocaleString("es-CL")}-${digito}`;
  }

  return { esValido, formatear };
})();
