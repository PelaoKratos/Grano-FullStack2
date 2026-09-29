// Esta función limpia el texto y deja solo el cuerpo y un dígito verificador.
function separarRut(rut) {
  const rutLimpio = rut.replace(/[^0-9kK]/g, "").toUpperCase();

  return {
    cuerpo: rutLimpio.slice(0, -1),
    digito: rutLimpio.slice(-1),
  };
}

// Calculé el dígito con el algoritmo del RUT chileno.
function calcularDigitoVerificador(cuerpo) {
  let suma = 0;
  let multiplicador = 2;

  for (let posicion = cuerpo.length - 1; posicion >= 0; posicion -= 1) {
    suma += Number(cuerpo[posicion]) * multiplicador;
    multiplicador = multiplicador === 7 ? 2 : multiplicador + 1;
  }

  const resultado = 11 - (suma % 11);

  if (resultado === 11) {
    return "0";
  }

  if (resultado === 10) {
    return "K";
  }

  return String(resultado);
}

function formatearRut(cuerpo, digito) {
  return `${Number(cuerpo).toLocaleString("es-CL")}-${digito}`;
}

function validarRut() {
  const campoRut = document.querySelector("#rut");
  const mensaje = document.querySelector("#mensaje-rut");

  if (!campoRut || !mensaje) {
    return true;
  }

  const { cuerpo, digito } = separarRut(campoRut.value);
  const formatoCorrecto = /^\d{7,8}$/.test(cuerpo) && /^[0-9K]$/.test(digito);
  const esValido = formatoCorrecto && calcularDigitoVerificador(cuerpo) === digito;

  campoRut.classList.toggle("is-invalid", !esValido);
  campoRut.classList.toggle("is-valid", esValido);
  mensaje.classList.toggle("text-success", esValido);
  mensaje.classList.toggle("text-danger", !esValido);

  if (esValido) {
    campoRut.value = formatearRut(cuerpo, digito);
    mensaje.textContent = "RUT válido.";
  } else {
    mensaje.textContent = "Escribe un RUT válido con un solo dígito verificador. Ejemplo: 12.345.678-5.";
  }

  return esValido;
}

document.querySelector("#rut")?.addEventListener("blur", validarRut);

document.querySelector("#formulario-registro")?.addEventListener("submit", (evento) => {
  evento.preventDefault();
  validarRut();
});
