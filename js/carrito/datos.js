// En esta parte guardo y actualizo los productos del carrito.
window.Grano = window.Grano || {};

window.Grano.carrito = (() => {
  const clave = "carrito-grano";

  function obtener() {
    return JSON.parse(localStorage.getItem(clave)) || [];
  }

  function guardar(productos) {
    localStorage.setItem(clave, JSON.stringify(productos));
  }

  function contar() {
    return obtener().reduce((total, producto) => total + producto.cantidad, 0);
  }

  function agregar(producto) {
    const productos = obtener();
    const guardado = productos.find((item) => item.id === producto.id);

    if (guardado) {
      guardado.cantidad += 1;
    } else {
      productos.push({ ...producto, cantidad: 1 });
    }

    guardar(productos);
  }

  function quitar(id) {
    guardar(obtener().filter((producto) => producto.id !== id));
  }

  return { obtener, contar, agregar, quitar };
})();
