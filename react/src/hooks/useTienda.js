import { useEffect, useState } from "react";
import { productos as productosIniciales } from "../data/productos.js";
import { usuariosDemostracion } from "../data/usuarios.js";
import imagenProductoNuevo from "../assets/producto-nuevo.svg";
import { guardarDato, leerDato } from "../utils/almacenamiento.js";

function cargarProductos() {
  const guardados = leerDato("granoProductosReact", []);
  const lista = Array.isArray(guardados) ? guardados : [];
  const catalogoCompleto = leerDato("granoCatalogoVersion", 0) === 2;
  const productos = catalogoCompleto ? lista : [...productosIniciales, ...lista];

  return productos.map((producto) => ({
    ...producto,
    stock: Number.isInteger(producto.stock) ? producto.stock : 10,
    critico: Number.isInteger(producto.critico) ? producto.critico : 3,
    imagen: producto.imagen?.startsWith("data:")
      ? producto.imagen
      : productosIniciales.find((inicial) => inicial.id === producto.id)?.imagen || imagenProductoNuevo,
  }));
}

function cargarUsuarios() {
  const guardados = leerDato("granoUsuariosReact", []);
  const usuarios = Array.isArray(guardados) ? guardados : [];
  const lista = usuarios.map((usuario) => ({
    ...usuario,
    activo: usuario.activo !== false,
  }));

  for (const usuarioDemo of usuariosDemostracion) {
    const existente = lista.find((usuario) => usuario.correo === usuarioDemo.correo);
    if (existente) Object.assign(existente, usuarioDemo);
    else lista.push(usuarioDemo);
  }

  return lista;
}

function cargarCarrito() {
  const guardados = leerDato("granoCarritoReact", []);
  if (!Array.isArray(guardados)) return [];

  const carrito = [];
  for (const item of guardados) {
    if (item?.id === undefined) continue;
    const existente = carrito.find((linea) => String(linea.id) === String(item.id));
    if (existente) {
      existente.cantidad += Number.isInteger(item.cantidad) && item.cantidad > 0 ? item.cantidad : 1;
    } else {
      carrito.push({ id: item.id, cantidad: Number.isInteger(item.cantidad) && item.cantidad > 0 ? item.cantidad : 1 });
    }
  }
  return carrito;
}

export default function useTienda() {
  const [productos, setProductos] = useState(cargarProductos);
  const [usuarios, setUsuarios] = useState(cargarUsuarios);
  const [sesion, setSesion] = useState(() => leerDato("granoSesionReact", null));
  const [carrito, setCarrito] = useState(cargarCarrito);
  const [pedidos, setPedidos] = useState(() => leerDato("granoPedidosReact", []));
  const [mensajes, setMensajes] = useState(() => leerDato("granoMensajesReact", []));

  useEffect(() => {
    if (guardarDato("granoProductosReact", productos)) {
      guardarDato("granoCatalogoVersion", 2);
    }
  }, [productos]);
  useEffect(() => { guardarDato("granoUsuariosReact", usuarios); }, [usuarios]);
  useEffect(() => { guardarDato("granoSesionReact", sesion); }, [sesion]);
  useEffect(() => { guardarDato("granoCarritoReact", carrito); }, [carrito]);
  useEffect(() => { guardarDato("granoPedidosReact", pedidos); }, [pedidos]);
  useEffect(() => { guardarDato("granoMensajesReact", mensajes); }, [mensajes]);

  function iniciarSesion(correo, contrasena) {
    const usuario = usuarios.find((item) =>
      item.correo === correo.trim().toLowerCase() &&
      item.contrasena === contrasena && item.activo !== false,
    );
    if (usuario) {
      setSesion({ nombre: usuario.nombre, correo: usuario.correo, rol: usuario.rol });
    }
    return usuario;
  }

  function registrarUsuario(usuario, entrar = false) {
    const correo = usuario.correo.trim().toLowerCase();
    if (usuarios.some((item) => item.correo === correo || (usuario.rut && item.rut === usuario.rut))) {
      return false;
    }
    const nuevo = { ...usuario, correo, activo: true };
    setUsuarios([...usuarios, nuevo]);
    if (entrar) setSesion({ nombre: nuevo.nombre, correo, rol: nuevo.rol });
    return true;
  }

  function cerrarSesion() {
    setSesion(null);
    setCarrito([]);
  }

  function guardarPerfil(datos) {
    setUsuarios(usuarios.map((usuario) => usuario.correo === datos.correo ? datos : usuario));
    setSesion({ ...sesion, nombre: datos.nombre });
  }

  function cambiarContrasena(correo, actual, nueva) {
    const usuario = usuarios.find((item) => item.correo === correo && item.contrasena === actual);
    if (!usuario || usuario.cuentaDemostracion) return false;
    setUsuarios(usuarios.map((item) => item.correo === correo ? { ...item, contrasena: nueva } : item));
    return true;
  }

  function agregarAlCarrito(id) {
    const producto = productos.find((item) => String(item.id) === String(id));
    const cantidad = carrito.find((item) => String(item.id) === String(id))?.cantidad || 0;
    if (!producto || cantidad >= producto.stock) return false;
    setCarrito(cantidad
      ? carrito.map((item) => String(item.id) === String(id) ? { ...item, cantidad: cantidad + 1 } : item)
      : [...carrito, { id, cantidad: 1 }]);
    return true;
  }

  function cambiarCantidad(id, cambio) {
    const producto = productos.find((item) => String(item.id) === String(id));
    if (!producto) return;
    setCarrito(carrito.map((item) => {
      if (String(item.id) !== String(id)) return item;
      return { ...item, cantidad: Math.max(1, Math.min(producto.stock, item.cantidad + cambio)) };
    }));
  }

  function quitarDelCarrito(id) {
    setCarrito(carrito.filter((item) => String(item.id) !== String(id)));
  }

  function confirmarPedido() {
    if (sesion?.rol !== "comprador" || carrito.length === 0) return false;
    const lineas = carrito.map((item) => ({
      ...item,
      producto: productos.find((producto) => String(producto.id) === String(item.id)),
    }));
    if (lineas.some((item) => !item.producto || item.cantidad > item.producto.stock)) return false;

    const pedido = {
      id: `GR-${Date.now()}`,
      comprador: sesion.correo,
      fecha: new Date().toLocaleDateString("es-CL"),
      estado: "Recibido",
      productos: lineas.map((item) => ({
        id: item.id,
        nombre: item.producto.nombre,
        precio: item.producto.precio,
        cantidad: item.cantidad,
      })),
      total: lineas.reduce((suma, item) => suma + item.producto.precio * item.cantidad, 0),
    };
    setProductos(productos.map((producto) => ({
      ...producto,
      stock: producto.stock - (carrito.find((item) => String(item.id) === String(producto.id))?.cantidad || 0),
    })));
    setPedidos([pedido, ...pedidos]);
    setCarrito([]);
    return pedido;
  }

  function guardarProducto(datos) {
    const nombre = datos.nombre.trim();
    const precio = Number(datos.precio);
    const stock = Number(datos.stock);
    const critico = Number(datos.critico);
    if (!nombre || !Number.isFinite(precio) || precio <= 0 ||
      !Number.isInteger(stock) || stock < 0 || !Number.isInteger(critico) || critico < 0 ||
      productos.some((item) => item.nombre.toLowerCase() === nombre.toLowerCase() && String(item.id) !== String(datos.id))) {
      return false;
    }
    const anterior = productos.find((item) => String(item.id) === String(datos.id));
    const producto = {
      id: anterior?.id || `nuevo-${Date.now()}`,
      nombre,
      categoria: datos.categoria,
      descripcion: datos.descripcion.trim(),
      detalle: datos.detalle.trim(),
      precio,
      stock,
      critico,
      imagen: datos.imagen || anterior?.imagen || imagenProductoNuevo,
    };
    const actualizados = anterior
      ? productos.map((item) => String(item.id) === String(datos.id) ? producto : item)
      : [...productos, producto];
    if (!guardarDato("granoProductosReact", actualizados)) return false;
    guardarDato("granoCatalogoVersion", 2);
    setProductos(actualizados);
    return true;
  }

  function eliminarProducto(id) {
    setProductos(productos.filter((item) => String(item.id) !== String(id)));
    setCarrito(carrito.filter((item) => String(item.id) !== String(id)));
  }

  function guardarUsuario(datos) {
    const usuarioActualizado = usuarios.find((item) => item.correo === datos.correo);
    if (usuarioActualizado?.cuentaDemostracion) return false;
    if (datos.correo === sesion?.correo && (datos.rol !== "admin" || datos.activo === false)) return false;
    setUsuarios(usuarios.map((item) => item.correo === datos.correo ? { ...item, ...datos } : item));
    return true;
  }

  function enviarMensaje(mensaje) {
    setMensajes([mensaje, ...mensajes]);
  }

  function marcarMensaje(indice) {
    setMensajes(mensajes.map((mensaje, posicion) => posicion === indice ? { ...mensaje, estado: "Leído" } : mensaje));
  }

  function cambiarEstadoPedido(id, estado) {
    setPedidos(pedidos.map((pedido) => pedido.id === id ? { ...pedido, estado } : pedido));
  }

  return {
    productos, usuarios, sesion, carrito, pedidos, mensajes,
    iniciarSesion, registrarUsuario, cerrarSesion, guardarPerfil, cambiarContrasena,
    agregarAlCarrito, cambiarCantidad, quitarDelCarrito, confirmarPedido,
    guardarProducto, eliminarProducto, guardarUsuario, enviarMensaje,
    marcarMensaje, cambiarEstadoPedido,
  };
}
