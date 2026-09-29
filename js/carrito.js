// Estas funciones guardan y actualizan los productos del carrito.
const claveCarrito = "carrito-grano";

function obtenerCarrito() {
  return JSON.parse(localStorage.getItem(claveCarrito)) || [];
}

function guardarCarrito(carrito) {
  localStorage.setItem(claveCarrito, JSON.stringify(carrito));
}

function contarProductos() {
  return obtenerCarrito().reduce((total, producto) => total + producto.cantidad, 0);
}

function agregarProducto(producto) {
  const carrito = obtenerCarrito();
  const productoGuardado = carrito.find((item) => item.id === producto.id);

  if (productoGuardado) {
    productoGuardado.cantidad += 1;
  } else {
    carrito.push({ ...producto, cantidad: 1 });
  }

  guardarCarrito(carrito);
}

function quitarProducto(id) {
  const carrito = obtenerCarrito().filter((producto) => producto.id !== id);
  guardarCarrito(carrito);
}
