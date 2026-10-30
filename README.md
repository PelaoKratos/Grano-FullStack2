# Grano · React

Tienda de café de especialidad, métodos de preparación y accesorios. **La aplicación principal ahora está en React y Vite, desde la raíz del repositorio.** Conserva el diseño cálido y artesanal y las funciones de la tienda.

## Abrir en Windows

Haz doble clic en **`Iniciar Grano.cmd`**. Abre el servidor local y la tienda en tu navegador. Mantén esa ventana abierta mientras usas la aplicación; para detenerla, pulsa `Ctrl+C`.

Ya no se abre `index.html` directamente: Vite prepara los componentes React.

## Desarrollo

Requiere Node.js 22.12 o superior. Con npm:

```sh
npm install
npm run dev
```

También puedes usar pnpm y el archivo de versiones incluido:

```sh
pnpm install --frozen-lockfile
pnpm dev
```

La dirección habitual es `http://127.0.0.1:5173`; usa la dirección que indique la consola. La base `./` y las rutas con `#` permiten publicar en un alojamiento estático o una subcarpeta sin configurar redirecciones del servidor.

## Comprobar y compilar

```sh
npm test
npm run build
npm run preview
```

`dist/` contiene los archivos para publicar. La compilación incluye páginas de redirección para los antiguos enlaces `.html`, sus filtros y el acceso anterior de `react/index.html`.

## Funciones

- Portada con selector de sabores y compra directa.
- Catálogo con búsqueda por nombre, filtros y fichas compartibles por URL.
- Carrito con controles de cantidad, validación de stock, total actualizado y persistencia.
- Inicio de sesión, registro con confirmación de contraseña, validación de RUT y cambio de contraseña de demostración.
- Perfil, dirección, comuna, región e historial de pedidos.
- Contacto y mensajes que administración puede marcar como leídos.
- Administración por secciones: resumen, edición y eliminación del catálogo completo, stock crítico, roles y activación de usuarios, estados de pedidos y mensajes. Imágenes JPG, PNG o WebP de hasta 500 KB.
- Panel de vendedor para consultar productos, disponibilidad y pedidos.
- Navegación móvil, historial del navegador, recarga de rutas y páginas no encontradas.

Cuentas públicas de prueba (también visibles en la pantalla de acceso):

| Perfil        | Correo              | Contraseña |
| ------------- | ------------------- | ---------- |
| Administrador | admin@duocuc.cl     | 1234       |
| Vendedor      | vendedor@duocuc.cl  | Venta123   |
| Comprador     | comprador@duocuc.cl | Cliente123 |

Las cuentas de prueba conservan su rol, activación y contraseña. Puedes registrar compradores o crear usuarios desde administración. Al cerrar sesión se vacía el carrito.

## Datos del navegador

La aplicación guarda su estado en `localStorage`, bajo `grano-tienda-react-v1`. La primera vez importa los datos disponibles del sitio HTML y de la práctica React; mantiene cantidades, perfiles e historial y conserva las claves originales como respaldo. El esquema de datos es versión 2 y mantiene la misma clave para importar los datos existentes. El catálogo completo se guarda para conservar ediciones y eliminaciones. El descuento de stock, el pedido y el vaciado del carrito se guardan en una sola escritura. Se sincronizan cambios entre pestañas del mismo origen.

La importación requiere el **mismo navegador y origen**. Los datos abiertos antes mediante `file://`, otro dominio o un puerto distinto no son accesibles desde la nueva dirección; el navegador los conserva en su origen anterior. Esta migración no elimina esos datos.

Es una demostración local: no incluye servidor, pagos reales ni autenticación de producción. Las cuentas y contraseñas de prueba permanecen en el navegador.

## Estructura

- `src/App.jsx`: composición de la aplicación, rutas declaradas con `Routes` y `Route`, detalle con `useParams`, accesos por rol, compatibilidad con enlaces antiguos y página no encontrada.
- `src/components/`: navegación, portada, catálogo, formularios y administración.
- `src/main.jsx`: `HashRouter` de React Router DOM; conserva enlaces por hash en alojamiento estático.
- `src/components/Administracion.jsx`: subrutas de administración y navegación activa con `NavLink`.
- `src/hooks/useTienda.js`: operaciones de la tienda y guardado.
- `src/datos/`: catálogo, validación de RUT y migración de almacenamiento.
- `src/styles/diseno.css`: sistema visual artesanal; `react.css` adapta las pantallas React.
- `src/assets/`: imágenes, tipografías y licencias.
- `src/datos/operaciones.js`: validaciones y cambios de estado de la tienda.
- `tests/`: pruebas de migración, stock, compra, permisos, catálogo, persistencia, rutas y RUT. `enrutamiento.test.js` renderiza el árbol real con `MemoryRouter`, incluidas las pantallas diferidas, sin abrir un navegador.

`PRODUCT.md` y `DESIGN.md` documentan el producto y el diseño. La portada y las seis fotografías de producto son imágenes ilustrativas generadas con IA; no son fotos de productos físicos. La portada conserva su indicación de generación en el PNG y en `src/assets/ritual-grano.prompt.txt`. Los productos usan WebP locales optimizados en `src/assets/fotografia/`, con el prompt completo y su procedencia en cada archivo `.webp.json`.

## Rama de diseño

La rama `probando-diseno-nuevo` en `PelaoKratos/Grano-FullStack2` incorpora la migración React y la paridad funcional del commit `e36a9fd`, más la serie fotográfica realista basada en la portada. Se conserva la identidad crema y verde con Bitter y Karla, así como el esquema 2 de `grano-tienda-react-v1`, las migraciones y la escritura conjunta de inventario, pedido y carrito. Las imágenes cargadas por el usuario permanecen intactas.
