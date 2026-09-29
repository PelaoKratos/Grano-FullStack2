# Grano

Tienda de café de especialidad, métodos de preparación y accesorios.

## Abrir el sitio

Abre `index.html` en el navegador. El menú principal lleva a Inicio, Nuestro café, Nosotros, Contacto e Iniciar sesión.

La página `login.html` presenta los campos de correo y contraseña y permite volver al catálogo. Por ahora es una pantalla de diseño: el botón no autentica usuarios ni envía los datos.

El carrito usa `localStorage` para guardar los productos en el navegador. Solo permite agregar, ver y quitar productos; no incluye compra ni pago.

El JavaScript está separado por módulos: el carrito tiene datos e interfaz, los usuarios tienen validación de RUT y registro, y contacto guarda los mensajes.

El registro y el formulario de contacto guardan sus datos solo en el navegador. No hay servidor, autenticación ni envío de mensajes a un correo.

## Organización del JavaScript

- `js/carrito/`: almacenamiento y elementos visuales del carrito.
- `js/usuarios/`: validación del RUT y registro de usuarios.
- `js/contacto/`: guardado de mensajes del formulario.

## Archivos

- Las páginas están en archivos HTML.
- `css/estilos.css` contiene los estilos comunes y las otras hojas separan inicio, productos, formularios y carrito.
- `assets/` contiene las ilustraciones.
- `docs/` contiene las planillas de requisitos y la ERS.

Bootstrap se carga mediante un enlace a su CSS. Se necesita internet para cargarlo. Se usa JavaScript para el carrito, el registro de usuarios, la validación del RUT y el formulario de contacto. No se necesitan instalaciones ni herramientas de compilación.

La tienda todavía no procesa compras ni pagos. Las cuentas y los mensajes quedan guardados localmente en el navegador y no se comparten entre dispositivos.
