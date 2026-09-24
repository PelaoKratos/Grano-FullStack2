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

- `assets/` contiene las ilustraciones.
- `docs/` contiene las planillas de requisitos y la ERS.

## Plantilla para productos


`boceto-producto.html` es la base para crear fichas de producto con una estructura uniforme. Antes de publicar una copia, completa los campos `{{producto.id}}`, `{{producto.nombre}}`, `{{producto.categoria}}`, `{{producto.resumen}}`, `{{producto.descripcion}}`, `{{producto.detalle}}`, `{{producto.precio}}`, `{{producto.precio_formateado}}` y `{{producto.caracteristica_1}}` a `{{producto.caracteristica_3}}`. Reemplaza también `assets/producto-placeholder.svg` por la imagen del producto y actualiza su texto alternativo.

El botón de compra viene desactivado para evitar agregar un producto de ejemplo al carrito. Al integrar una ficha, habilítalo y configura sus atributos `data-agregar-carrito`, `data-id`, `data-nombre`, `data-precio` y `data-imagen`, que son los que utiliza `js/carrito.js`. Para mostrarlo en la colección, agrega su tarjeta correspondiente en `productos.html`. Estos campos estandarizados sirven como base para automatizar esos pasos después.


## CSS

- `css/estilos.css` define los estilos base, la paleta de colores y la tipografía.
- `css/componentes.css` reúne los estilos compartidos de botones, tarjetas, formularios y tablas.
- `css/paginas.css` contiene los estilos específicos de acceso, carrito y carrusel.
- `css/responsive.css` adapta la interfaz a pantallas pequeñas y respeta la preferencia de movimiento reducido.


Bootstrap se carga mediante un enlace a su CSS. Se necesita internet para cargarlo. No se usan JavaScript, Python, instalaciones de paquetes ni herramientas de compilación en el proyecto.

Esta versión presenta las pantallas y la navegación. No procesa compras, cuentas ni envíos de formularios.
