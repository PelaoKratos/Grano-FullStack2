const claves = { carrito: "carrito-grano", usuarios: "usuarios-grano", sesion: "sesion-grano", pedidos: "pedidos-grano", mensajes: "mensajes-grano" };
const leer = (clave, inicial) => JSON.parse(localStorage.getItem(clave)) || inicial;
const guardar = (clave, valor) => localStorage.setItem(clave, JSON.stringify(valor));
const mensaje = (id, texto, tipo = "success") => { const nodo = document.querySelector(id); if (nodo) { nodo.className = `alert alert-${tipo} mt-3 mb-0`; nodo.textContent = texto; nodo.hidden = false; } };

function prepararUsuarios() {
  const usuarios = leer(claves.usuarios, []);
  if (!usuarios.some((u) => u.correo === "admin@duocuc.cl")) { usuarios.push({ nombre: "Administrador", correo: "admin@duocuc.cl", contrasena: "1234", rol: "admin" }); guardar(claves.usuarios, usuarios); }
}
function carrito() { return leer(claves.carrito, []); }
function actualizarContador() { document.querySelectorAll(".contador-carrito").forEach((n) => { n.textContent = carrito().reduce((s, p) => s + p.cantidad, 0); }); }
function actualizarNavegacion() {
  const sesion = leer(claves.sesion, null), enlace = document.querySelector(".enlace-login");
  if (!sesion || !enlace) return;
  const cuentaAnterior = enlace.parentElement.querySelector(".cuenta-activa"); if (cuentaAnterior) cuentaAnterior.remove();
  enlace.hidden = true;
  const cuenta = document.createElement("div");
  cuenta.className = "cuenta-activa";
  cuenta.innerHTML = `<a href="${sesion.rol === "admin" ? "admin.html" : "cuenta.html"}" class="nombre-cuenta">${sesion.nombre}</a><button class="cerrar-sesion" type="button">Cerrar sesión</button>`;
  enlace.insertAdjacentElement("afterend", cuenta);
}

function cerrarSesion() {
  localStorage.removeItem(claves.sesion);
  window.location.href = "index.html";
}

function agregarProducto(boton) {
  const producto = { id: boton.dataset.id, nombre: boton.dataset.nombre, precio: Number(boton.dataset.precio), imagen: boton.dataset.imagen, cantidad: 1 }, productos = carrito(), encontrado = productos.find((p) => p.id === producto.id);
  if (encontrado) encontrado.cantidad += 1; else productos.push(producto);
  guardar(claves.carrito, productos); actualizarContador(); const original = boton.textContent; boton.textContent = "Añadido"; setTimeout(() => { boton.textContent = original; }, 900);
}
function mostrarCarrito() {
  const lista = document.querySelector("#lista-carrito"), resumen = document.querySelector("#resumen-carrito"); if (!lista) return;
  const productos = carrito(); lista.innerHTML = "";
  if (!productos.length) { lista.innerHTML = '<p class="mb-0">Todavía no agregas productos al carrito.</p>'; if (resumen) resumen.hidden = true; return; }
  productos.forEach((p) => { const item = document.createElement("article"); item.className = "item-carrito"; item.innerHTML = `<img src="${p.imagen}" alt="${p.nombre}"><div><h2 class="h5">${p.nombre}</h2><p class="mb-0">$${p.precio.toLocaleString("es-CL")} CLP · Cantidad: ${p.cantidad}</p></div><button class="btn btn-outline-success btn-sm" type="button" data-quitar="${p.id}">Quitar</button>`; lista.appendChild(item); });
  if (resumen) { resumen.hidden = false; resumen.querySelector("[data-total]").textContent = `$${productos.reduce((s, p) => s + p.precio * p.cantidad, 0).toLocaleString("es-CL")} CLP`; }
}
function crearPedido() {
  const sesion = leer(claves.sesion, null), productos = carrito(); if (!sesion || sesion.rol !== "comprador") { window.location.href = "login.html?destino=carrito"; return; } if (!productos.length) return;
  const pedidos = leer(claves.pedidos, []), total = productos.reduce((s, p) => s + p.precio * p.cantidad, 0);
  pedidos.unshift({ id: `GR-${String(Date.now()).slice(-6)}`, comprador: sesion.correo, fecha: new Date().toLocaleDateString("es-CL"), productos, total, estado: "Recibido" }); guardar(claves.pedidos, pedidos); guardar(claves.carrito, []); actualizarContador(); mostrarCarrito(); mensaje("#mensaje-compra", "Pedido recibido. Puedes revisar sus detalles con el administrador.");
}

function manejarLogin(form) { form.addEventListener("submit", (e) => { e.preventDefault(); const usuario = leer(claves.usuarios, []).find((u) => u.correo === form.correo.value.trim().toLowerCase() && u.contrasena === form.contrasena.value); if (!usuario) return mensaje("#mensaje-login", "Correo o contraseña incorrectos.", "danger"); guardar(claves.sesion, { nombre: usuario.nombre, correo: usuario.correo, rol: usuario.rol }); window.location.href = usuario.rol === "admin" ? "admin.html" : new URLSearchParams(location.search).get("destino") === "carrito" ? "carrito.html" : "productos.html"; }); }
function manejarRegistro(form) { form.addEventListener("submit", (e) => { e.preventDefault(); const rut = form.rut.value.trim(); if (!rut) { form.rut.focus(); return mensaje("#mensaje-registro", "Ingresa tu RUT para crear la cuenta.", "danger"); } const usuarios = leer(claves.usuarios, []), correo = form.correo.value.trim().toLowerCase(); if (usuarios.some((u) => u.correo === correo)) return mensaje("#mensaje-registro", "Ya existe una cuenta con este correo.", "danger"); usuarios.push({ nombre: form.nombre.value.trim(), rut, correo, contrasena: form.contrasena.value, rol: "comprador" }); guardar(claves.usuarios, usuarios); form.reset(); mensaje("#mensaje-registro", "Cuenta de comprador creada. Ya puedes iniciar sesión."); }); }
function manejarClave(form) { form.addEventListener("submit", (e) => { e.preventDefault(); const usuarios = leer(claves.usuarios, []), usuario = usuarios.find((u) => u.correo === form.correo.value.trim().toLowerCase() && u.contrasena === form.actual.value); if (!usuario) return mensaje("#mensaje-clave", "No pudimos validar tus datos.", "danger"); usuario.contrasena = form.nueva.value; guardar(claves.usuarios, usuarios); form.reset(); mensaje("#mensaje-clave", "Contraseña actualizada. Ya puedes iniciar sesión."); }); }
function mostrarAdmin() {
  const filasPedidos = document.querySelector("#filas-pedidos"); if (!filasPedidos) return; const sesion = leer(claves.sesion, null); if (!sesion || sesion.rol !== "admin") { location.href = "login.html"; return; }
  const pedidos = leer(claves.pedidos, []); filasPedidos.innerHTML = pedidos.length ? pedidos.map((p) => `<tr><td>${p.id}</td><td>${p.comprador}</td><td>${p.productos.map((x) => `${x.nombre} × ${x.cantidad}`).join("<br>")}</td><td>${p.fecha}</td><td>$${p.total.toLocaleString("es-CL")}</td><td>${p.estado}</td></tr>`).join("") : '<tr><td colspan="6" class="text-center">Aún no hay pedidos realizados.</td></tr>';
  document.querySelector("#filas-usuarios").innerHTML = leer(claves.usuarios, []).map((u) => `<tr><td>${u.nombre}</td><td>${u.correo}</td><td class="text-capitalize">${u.rol}</td></tr>`).join("");
  const filasMensajes = document.querySelector("#filas-mensajes");
  if (filasMensajes) { const mensajes = leer(claves.mensajes, []); filasMensajes.innerHTML = mensajes.length ? mensajes.map((m) => `<tr><td>${m.fecha}</td><td>${m.nombre}</td><td>${m.correo}</td><td>${m.texto}</td><td>${m.estado}</td></tr>`).join("") : '<tr><td colspan="5" class="text-center">Aún no hay mensajes recibidos.</td></tr>'; }
}
function manejarContacto(form) {
  const sesion = leer(claves.sesion, null), usuario = sesion ? leer(claves.usuarios, []).find((item) => item.correo === sesion.correo) : null;
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const mensajes = leer(claves.mensajes, []);
    mensajes.unshift({ fecha: new Date().toLocaleDateString("es-CL"), nombre: usuario?.nombre || "Cliente", correo: usuario?.correo || "No proporcionado", texto: form.mensaje.value.trim(), estado: "Nuevo" });
    guardar(claves.mensajes, mensajes); form.mensaje.value = ""; mensaje("#mensaje-contacto", "Mensaje enviado. Gracias por escribirnos.");
  });
}
function mostrarCuenta() {
  const tabla = document.querySelector("#filas-historial"); if (!tabla) return;
  const sesion = leer(claves.sesion, null);
  if (!sesion || sesion.rol !== "comprador") { location.href = "login.html"; return; }
  const usuario = leer(claves.usuarios, []).find((item) => item.correo === sesion.correo);
  if (usuario) {
    ["nombre", "correo", "telefono", "direccion", "comuna", "region"].forEach((campo) => { const input = document.querySelector(`#perfil-${campo}`); if (input) input.value = usuario[campo] || ""; });
  }
  const pedidos = leer(claves.pedidos, []).filter((pedido) => pedido.comprador === sesion.correo);
  tabla.innerHTML = pedidos.length ? pedidos.map((pedido) => `<tr><td>${pedido.id}</td><td>${pedido.fecha}</td><td>${pedido.productos.map((producto) => `${producto.nombre} × ${producto.cantidad}`).join("<br>")}</td><td>$${pedido.total.toLocaleString("es-CL")} CLP</td><td>${pedido.estado}</td></tr>`).join("") : '<tr><td colspan="5" class="text-center">Todavía no tienes compras registradas.</td></tr>';
}
function manejarPerfil(form) {
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const sesion = leer(claves.sesion, null); if (!sesion) return;
    const usuarios = leer(claves.usuarios, []), usuario = usuarios.find((item) => item.correo === sesion.correo); if (!usuario) return;
    ["nombre", "telefono", "direccion", "comuna", "region"].forEach((campo) => { usuario[campo] = form[campo].value.trim(); });
    guardar(claves.usuarios, usuarios); guardar(claves.sesion, { ...sesion, nombre: usuario.nombre }); actualizarNavegacion(); mensaje("#mensaje-perfil", "Tus datos se actualizaron correctamente.");
  });
}
function manejarUsuarioAdmin(form) { form.addEventListener("submit", (e) => { e.preventDefault(); const usuarios = leer(claves.usuarios, []), correo = form.correo.value.trim().toLowerCase(); if (usuarios.some((u) => u.correo === correo)) return mensaje("#mensaje-usuario", "Ya existe una cuenta con este correo.", "danger"); usuarios.push({ nombre: form.nombre.value.trim(), correo, contrasena: form.contrasena.value, rol: form.rol.value }); guardar(claves.usuarios, usuarios); form.reset(); mostrarAdmin(); mensaje("#mensaje-usuario", "Usuario creado correctamente."); }); }
function iniciarCarrusel() { const carrusel = document.querySelector("[data-carrusel]"); if (!carrusel) return; const diapositivas = [...carrusel.querySelectorAll(".diapositiva")]; let actual = 0; const mostrar = (i) => { actual = (i + diapositivas.length) % diapositivas.length; diapositivas.forEach((d, n) => { d.hidden = n !== actual; }); }; carrusel.querySelector("[data-anterior]").addEventListener("click", () => mostrar(actual - 1)); carrusel.querySelector("[data-siguiente]").addEventListener("click", () => mostrar(actual + 1)); mostrar(0); }

document.addEventListener("click", (e) => { const agregar = e.target.closest("[data-agregar-carrito]"), quitar = e.target.closest("[data-quitar]"), cerrar = e.target.closest(".cerrar-sesion"); if (agregar) agregarProducto(agregar); if (quitar) { guardar(claves.carrito, carrito().filter((p) => p.id !== quitar.dataset.quitar)); actualizarContador(); mostrarCarrito(); } if (cerrar) cerrarSesion(); });
prepararUsuarios(); actualizarContador(); actualizarNavegacion(); mostrarCarrito(); mostrarAdmin(); mostrarCuenta(); iniciarCarrusel();
[["#form-login", manejarLogin], ["#form-registro", manejarRegistro], ["#form-clave", manejarClave], ["#form-usuario-admin", manejarUsuarioAdmin]].forEach(([id, accion]) => { const form = document.querySelector(id); if (form) accion(form); });
const comprar = document.querySelector("#confirmar-compra"); if (comprar) comprar.addEventListener("click", crearPedido);
const perfil = document.querySelector("#form-perfil"); if (perfil) manejarPerfil(perfil);
const contacto = document.querySelector("#form-contacto"); if (contacto) manejarContacto(contacto);
