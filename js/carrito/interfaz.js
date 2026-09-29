// Esta parte muestra el carrito y escucha los botones de la página.
(() => {
  const carrito = window.Grano.carrito;

  function actualizarContador() {
    document.querySelectorAll(".contador-carrito").forEach((contador) => {
      contador.textContent = carrito.contar();
    });
  }

  function mostrar() {
    const lista = document.querySelector("#lista-carrito");

    if (!lista) {
      return;
    }

    const productos = carrito.obtener();
    lista.innerHTML = "";

    if (productos.length === 0) {
      lista.innerHTML = '<p class="mb-0">Todavía no agregas productos al carrito.</p>';
      return;
    }

    productos.forEach((producto) => {
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
    const agregar = evento.target.closest("[data-agregar-carrito]");
    const quitar = evento.target.closest("[data-quitar]");

    if (agregar) {
      carrito.agregar({
        id: agregar.dataset.id,
        nombre: agregar.dataset.nombre,
        precio: Number(agregar.dataset.precio),
        imagen: agregar.dataset.imagen,
      });
      actualizarContador();
      agregar.textContent = "Añadido";
      setTimeout(() => (agregar.textContent = "Añadir"), 900);
    }

    if (quitar) {
      carrito.quitar(quitar.dataset.quitar);
      actualizarContador();
      mostrar();
    }
  });

  actualizarContador();
  mostrar();
})();
