export function leerDato(clave, valorInicial) {
  try {
    const texto = localStorage.getItem(clave);
    return texto ? JSON.parse(texto) : valorInicial;
  } catch {
    return valorInicial;
  }
}

export function guardarDato(clave, valor) {
  try {
    localStorage.setItem(clave, JSON.stringify(valor));
    return true;
  } catch {
    return false;
  }
}
