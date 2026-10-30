// Equivalencias para los enlaces HTML guardados antes de la migración a React.
export const rutasAnteriores = {
  "productos.html": "/productos",
  "carrito.html": "/carrito",
  "login.html": "/acceso",
  "registro.html": "/registro",
  "cuenta.html": "/cuenta",
  "admin.html": "/admin",
  "nosotros.html": "/nosotros",
  "contacto.html": "/contacto",
  "producto-colombia.html": "/producto/colombia",
  "producto-etiopia.html": "/producto/etiopia",
  "producto-blend.html": "/producto/blend",
  "producto-dripper.html": "/producto/dripper",
  "producto-prensa.html": "/producto/prensa",
  "producto-taza.html": "/producto/taza",
  "boceto-producto.html": "/productos",
};

// Solo normaliza enlaces antiguos; la navegación actual la realiza React Router.
export function leerRuta(hash) {
  const rutaSinHash = hash.replace(/^#\/?/, "") || "";
  let [ruta, consulta = ""] = rutaSinHash.split("?");
  const alias = { inicio: "", nuestrocafe: "productos", login: "acceso" };
  ruta = alias[ruta] ?? ruta;
  if (ruta.startsWith("producto/")) {
    const idsProductosBase = [
      "colombia",
      "etiopia",
      "blend",
      "dripper",
      "prensa",
      "taza",
    ];
    const idAnterior = ruta.slice(9);
    ruta = `producto/${idsProductosBase[Number(idAnterior) - 1] || idAnterior}`;
  }
  return { path: `/${ruta}`, params: new URLSearchParams(consulta) };
}
