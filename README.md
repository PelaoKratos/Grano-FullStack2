# Grano

Tienda de café de especialidad, métodos de preparación y accesorios.

## Abrir el sitio

Abre `index.html` en el navegador. El menú principal lleva a Inicio, Nuestro café, Nosotros, Contacto e Iniciar sesión.

La página `login.html` permite iniciar sesión y registrar compradores en el navegador. El proyecto incluye una cuenta de demostración para revisar el panel de administración.

El carrito usa `localStorage` para guardar los productos en el navegador. Los compradores pueden confirmar un pedido desde el carrito y el administrador puede revisarlo en `admin.html`.

## Cuentas de prueba

- Administrador: `admin@duocuc.cl` / `1234`.
- Los nuevos registros creados en `login.html` tienen el rol de comprador.

Esta versión es una demostración estática: usuarios, contraseñas, sesión, mensajes y pedidos se guardan solo en el `localStorage` del navegador. El pedido no representa un pago real. Para publicar la tienda se necesitaría un backend que gestione esos datos de forma segura.

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


Bootstrap se carga mediante un enlace a su CSS, así que se necesita internet para verlo. Las páginas actuales usan JavaScript y `localStorage`; no tienen servidor.

El comportamiento del sitio está en `js/carrito.js`. Antes de migrar, conviene dividir sus responsabilidades en carrito, sesión y usuarios, formularios, panel de administración y componentes visuales.

## Inicio de la migración a React

La versión React está en `react/`. Para abrirla, ejecuta `npm install` y `npm run dev` desde la carpeta principal; Inicio está en `/react/`, el catálogo en `/react/productos.html` y los detalles en `/react/producto.html?id=colombia`. Las páginas HTML originales siguen disponibles. Inicio, el encabezado, el pie, las tarjetas y las fichas están hechos con componentes; todos leen los mismos datos desde `react/src/data/productos.js`.

El siguiente paso es migrar Carrito, Cuenta, Administración y Contacto. La demostración sigue guardando sus datos en `localStorage`; esta migración no agrega servidor ni pagos.
