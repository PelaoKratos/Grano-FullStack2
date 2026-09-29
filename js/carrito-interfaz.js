// Esta parte conecta los botones y muestra los productos guardados.
function actualizarContador() {
  const cantidad = contarProductos();

  document.querySelectorAll(".contador-carrito").forEach((contador) => {
    contador.textContent = cantidad;
  });
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
    const producto = {
      id: botonAgregar.dataset.id,
      nombre: botonAgregar.dataset.nombre,
      precio: Number(botonAgregar.dataset.precio),
      imagen: botonAgregar.dataset.imagen,
    };

    agregarProducto(producto);
    actualizarContador();

    const textoOriginal = botonAgregar.textContent;
    botonAgregar.textContent = "Añadido";
    setTimeout(() => {
      botonAgregar.textContent = textoOriginal;
    }, 900);
  }

  if (botonQuitar) {
    quitarProducto(botonQuitar.dataset.quitar);
    actualizarContador();
    mostrarCarrito();
  }
});

actualizarContador();
mostrarCarrito();
