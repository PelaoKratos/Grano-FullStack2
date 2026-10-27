export function esRutValido(rut) {
  const rutLimpio = rut.replace(/[^0-9kK]/g, "").toUpperCase();
  const cuerpo = rutLimpio.slice(0, -1);
  const digito = rutLimpio.slice(-1);

  if (!/^\d{7,8}$/.test(cuerpo)) {
    return false;
  }

  let suma = 0;
  let multiplicador = 2;

  for (let posicion = cuerpo.length - 1; posicion >= 0; posicion -= 1) {
    suma += Number(cuerpo[posicion]) * multiplicador;
    multiplicador = multiplicador === 7 ? 2 : multiplicador + 1;
  }

  const resultado = 11 - (suma % 11);
  let digitoCorrecto = String(resultado);

  if (resultado === 11) {
    digitoCorrecto = "0";
  } else if (resultado === 10) {
    digitoCorrecto = "K";
  }

  return digito === digitoCorrecto;
}

export function formatearRut(rut) {
  const rutLimpio = rut.replace(/[^0-9kK]/g, "").toUpperCase();
  const cuerpo = rutLimpio.slice(0, -1);
  const digito = rutLimpio.slice(-1);

  return `${Number(cuerpo).toLocaleString("es-CL")}-${digito}`;
}
