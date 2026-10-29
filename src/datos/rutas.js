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

export function leerRuta(hash) {
  const value = hash.replace(/^#\/?/, "") || "";
  let [ruta, query = ""] = value.split("?");
  const alias = { inicio: "", nuestrocafe: "productos", login: "acceso" };
  ruta = alias[ruta] ?? ruta;
  if (ruta.startsWith("producto/")) {
    const ids = ["colombia", "etiopia", "blend", "dripper", "prensa", "taza"];
    const id = ruta.slice(9);
    ruta = `producto/${ids[Number(id) - 1] || id}`;
  }
  return { path: `/${ruta}`, params: new URLSearchParams(query) };
}
