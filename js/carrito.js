// Guardamos los productos aquí para que el carrito se conserve aunque cambie de página.
const claveCarrito = "carrito-grano";

function obtenerCarrito() {
  return JSON.parse(localStorage.getItem(claveCarrito)) || [];
}

function guardarCarrito(carrito) {
  localStorage.setItem(claveCarrito, JSON.stringify(carrito));
}

function actualizarContador() {
  const cantidad = obtenerCarrito().reduce((total, producto) => total + producto.cantidad, 0);

  document.querySelectorAll(".contador-carrito").forEach((contador) => {
    contador.textContent = cantidad;
  });
}

function agregarProducto(boton) {
  const producto = {
    id: boton.dataset.id,
    nombre: boton.dataset.nombre,
    precio: Number(boton.dataset.precio),
    imagen: boton.dataset.imagen,
    cantidad: 1,
  };
  const carrito = obtenerCarrito();
  const productoGuardado = carrito.find((item) => item.id === producto.id);

  if (productoGuardado) {
    productoGuardado.cantidad += 1;
  } else {
    carrito.push(producto);
  }

  guardarCarrito(carrito);
  actualizarContador();

  const textoOriginal = boton.textContent;
  boton.textContent = "Añadido";
  setTimeout(() => {
    boton.textContent = textoOriginal;
  }, 900);
}

function mostrarCarrito() {
  const lista = document.querySelector("#lista-carrito");

  if (!lista) {
    return;
  }

  const carrito = obtenerCarrito();
  lista.innerHTML = "";

  if (carrito.length === 0) {
    lista.innerHTML = '<p class="mb-0">Todavía no agregas productos al carrito.</p>';
    return;
  }

  carrito.forEach((producto) => {
    const item = document.createElement("article");
    item.className = "item-carrito";
    item.innerHTML = `
      <img src="${producto.imagen}" alt="${producto.nombre}">
      <div>
        <h2 class="h5">${producto.nombre}</h2>
        <p class="mb-0">$${producto.precio.toLocaleString("es-CL")} CLP · Cantidad: ${producto.cantidad}</p>
      </div>
      <button class="btn btn-outline-success btn-sm" type="button" data-quitar="${producto.id}">Quitar</button>
    `;
    lista.appendChild(item);
  });
}

document.addEventListener("click", (evento) => {
  const botonAgregar = evento.target.closest("[data-agregar-carrito]");
  const botonQuitar = evento.target.closest("[data-quitar]");

  if (botonAgregar) {
    agregarProducto(botonAgregar);
  }

  if (botonQuitar) {
    const carrito = obtenerCarrito().filter((producto) => producto.id !== botonQuitar.dataset.quitar);
    guardarCarrito(carrito);
    actualizarContador();
    mostrarCarrito();
  }
});

actualizarContador();
mostrarCarrito();
