// Acepta teléfonos chilenos de nueve dígitos, con prefijo 56 opcional.
// Los espacios, guiones y paréntesis solo se usan como separadores visuales.
export const AYUDA_TELEFONO =
  "Ingresa un teléfono chileno de 9 dígitos, por ejemplo 912345678 o +56 9 1234 5678.";

export function esTelefonoValido(valor) {
  const texto = String(valor ?? "").trim();
  if (!/^[+\d\s()\-]+$/.test(texto)) return false;
  const compacto = texto.replace(/[\s()\-]/g, "");
  return /^(?:\+?56)?[2-9]\d{8}$/.test(compacto);
}
