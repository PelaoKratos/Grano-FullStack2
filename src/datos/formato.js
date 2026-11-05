// Formatea el importe con separadores chilenos y el indicador de moneda CLP.
export function precioCLP(valor) {
  return `$${Number(valor).toLocaleString("es-CL")} CLP`;
}
