# Grano

Tienda de café de especialidad, métodos de preparación y accesorios.

## Abrir el sitio

Abre `index.html` en el navegador. El menú principal lleva a Inicio, Nuestro café, Nosotros, Contacto e Iniciar sesión.

La página `login.html` presenta los campos de correo y contraseña y permite volver al catálogo. Por ahora es una pantalla de diseño: el botón no autentica usuarios ni envía los datos.

El carrito usa `localStorage` para guardar los productos en el navegador. Solo permite agregar, ver y quitar productos; no incluye compra ni pago.

El JavaScript está separado por tarea: `js/carrito.js` guarda los datos del carrito, `js/carrito-interfaz.js` conecta sus botones y muestra los productos, y `js/validar-rut.js` valida el RUT en el registro.

## Archivos

- Las páginas están en archivos HTML.
- `css/estilos.css` contiene los estilos comunes y las otras hojas separan inicio, productos, formularios y carrito.
- `assets/` contiene las ilustraciones.
- `docs/` contiene las planillas de requisitos y la ERS.

Bootstrap se carga mediante un enlace a su CSS. Se necesita internet para cargarlo. Se usa JavaScript solo para el carrito y la validación del RUT; no se necesitan instalaciones ni herramientas de compilación.

Esta versión presenta las pantallas y la navegación. No procesa compras, cuentas ni envíos de formularios.
