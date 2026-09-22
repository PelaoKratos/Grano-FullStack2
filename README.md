# Grano

Tienda de café de especialidad, métodos de preparación y accesorios.

## Abrir el sitio

Abre `index.html` en el navegador. El menú principal lleva a Inicio, Nuestro café, Nosotros, Contacto e Iniciar sesión.

La página `login.html` presenta los campos de correo y contraseña y permite volver al catálogo. Por ahora es una pantalla de diseño: el botón no autentica usuarios ni envía los datos.

El carrito usa `localStorage` para guardar los productos en el navegador. Los compradores pueden confirmar un pedido desde el carrito y el administrador puede revisarlo en `admin.html`.

## Cuentas de prueba

- Administrador: `admin@duocuc.cl` / `1234`.
- Los nuevos registros creados en `login.html` tienen el rol de comprador.

Esta versión es una demostración estática: usuarios, contraseñas, sesión y pedidos se guardan solo en el `localStorage` del navegador. Para un sitio publicado se requiere un backend que almacene datos de manera segura.

## Archivos

- Las páginas están en archivos HTML.
- `css/estilos.css` contiene los estilos propios.
- `assets/` contiene las ilustraciones.
- `docs/` contiene las planillas de requisitos y la ERS.

Bootstrap se carga mediante un enlace a su CSS. Se necesita internet para cargarlo. No se usan JavaScript, Python, instalaciones de paquetes ni herramientas de compilación en el proyecto.

Esta versión presenta las pantallas y la navegación. No procesa compras, cuentas ni envíos de formularios.
