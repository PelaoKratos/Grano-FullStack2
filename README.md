# Grano · React

Tienda de café de especialidad, métodos de preparación y accesorios. **La aplicación principal ahora está en React y Vite, desde la raíz del repositorio.** Conserva el diseño cálido y artesanal y las funciones de la tienda.

La carpeta `backend/` incorpora la API de productos y cuentas con Spring Boot, Java 17 y una base H2 persistente local. React consulta y administra el catálogo y usa registro, inicio de sesión, perfiles y permisos del servidor. La [guía del backend](backend/README.md) explica cómo iniciarlo y entender cada capa.

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

## Probar React con el backend

1. Abre `backend/Iniciar Backend.cmd` y mantén esa ventana abierta.
2. Detén el frontend anterior con `Ctrl+C`. Desde la raíz ejecuta `npm run dev:backend` y abre la dirección que indique Vite.
3. Entra como administrador: `admin@duocuc.cl` / `1234`. En **Administración → Productos**, crea un producto con su descripción, detalle, precio, stock e imagen opcional.
4. Comprueba el catálogo y su detalle, agrega el producto al carrito y recarga la página. Edita su precio o stock desde administración y verifica el resultado. Puedes quitar el producto al terminar.
5. Apaga el backend y pulsa **Actualizar catálogo** para comprobar el error. Enciéndelo de nuevo y vuelve a actualizar.

La base del servidor empieza vacía: los productos antiguos del navegador no se importan automáticamente. El ID lo genera Java al crear cada producto. Las imágenes propias se envían en el mismo JSON y quedan en H2; una edición sin archivo conserva la imagen existente. Actualizar el catálogo permite consultar cambios realizados por otro navegador.

`src/servicios/productosApi.js` reúne las peticiones GET, POST, PUT y DELETE y los mensajes de error. `src/hooks/useCatalogoApi.js` controla carga, reintento y actualización de la pantalla. Los formularios esperan al servidor antes de mostrar éxito y bloquean sus controles mientras guardan.

El modo conectado usa `.env.backend`, con `VITE_API_URL=/api`. Vite redirige esa ruta hacia `http://127.0.0.1:8080` para que el navegador trabaje con las cookies en el mismo origen. Es una dirección pública, sin credenciales. Usa `npm run build:backend` para compilar ese modo; al publicarlo necesitarás un proxy `/api` en el alojamiento. `npm run dev` y `npm run build` conservan la demostración local anterior.

Los **productos y cuentas** ya están en el backend. El carrito y los mensajes siguen en la clave separada del navegador `grano-tienda-api-v1`. Ese almacenamiento no guarda contraseñas ni la lista de usuarios del servidor. La sesión se comprueba mediante una cookie HttpOnly y `/api/auth/me`, y Java decide los permisos. Cambiar un rol en el navegador no concede acceso administrativo. El modo local anterior conserva sus datos.

El catálogo es público; solo el administrador puede modificar productos y gestionar usuarios. El vendedor y el comprador entran a sus propias pantallas. Al registrarse se crea un comprador y se inicia sesión automáticamente. El perfil y los cambios de contraseña se guardan en el servidor. Las claves se almacenan con hash BCrypt, y el RUT se valida también en Java. Se conservan las tres cuentas de práctica que aparecen debajo del login.

Para comprobarlo, registra un comprador con un RUT válido, recarga la página y verifica su sesión. Cierra sesión e inicia como administrador para consultar la cuenta nueva en **Administración → Usuarios**. Prueba crear un vendedor, cambiar el rol de una cuenta ordinaria y desactivarla. El servidor rechaza el acceso de una cuenta desactivada y los cambios administrativos realizados como comprador o vendedor. Cambiar la contraseña de una cuenta ordinaria termina sus sesiones anteriores. Las cuentas y el catálogo anteriores del navegador no se importan automáticamente.

En el modo conectado todavía no se confirman compras ni se administran categorías: eso necesita endpoints propios para guardar pedidos y descontar stock en una transacción. La siguiente etapa será conectar los pedidos; AWS queda para después.

## Comprobar y compilar

```sh
npm test
npm run test:cobertura
npm run build
npm run preview
```

`dist/` contiene los archivos para publicar. La compilación incluye páginas de redirección para los antiguos enlaces `.html`, sus filtros y el acceso anterior de `react/index.html`.

`npm test` ejecuta 145 pruebas con Jasmine y Karma y 11 pruebas de rutas con Node. Incluye reglas de negocio, componentes, formularios, hooks, flujos de compra, sesiones y comunicación con la API mediante respuestas simuladas. Requiere Chrome instalado; en Windows también se detecta Edge como alternativa mediante `CHROME_BIN`. Los comandos `npm run test:jasmine` y `npm run test:rutas` permiten ejecutar cada grupo por separado. No es necesario instalar pnpm para usar estos comandos.

`npm run test:cobertura` genera el informe real de líneas, sentencias, funciones y ramas en `coverage/index.html`, y falla si alguna de esas cuatro métricas globales queda por debajo del 80 %. La configuración de cobertura solo se aplica a las pruebas. La [guía de pruebas](docs/PRUEBAS.md) explica cómo ejecutar los casos, leer el reporte y presentar los resultados.

## Leer y explicar el código

La [guía del código](docs/GUIA_DEL_CODIGO.md) explica los archivos, el recorrido de una acción, React Router, el guardado y un guion para presentar el proyecto.

La indentación usa dos espacios. Para mantener el formato común:

```sh
pnpm format
pnpm format:check
```

Prettier ordena el código del proyecto; Bootstrap, imágenes y documentos originales conservan sus archivos existentes.

## Funciones

- Portada con selector de sabores y compra directa.
- Catálogo con búsqueda por nombre, filtros y fichas compartibles por URL.
- Carrito con controles de cantidad, validación de stock, total actualizado y persistencia.
- Inicio de sesión, registro con confirmación de contraseña, validación de RUT y cambio de contraseña de demostración.
- Inicio de sesión, registro y cambio de contraseña en páginas separadas. Los enlaces entre formularios conservan el regreso al carrito.
- Perfil, dirección, comuna, región e historial de pedidos.
- Contacto y mensajes que administración puede marcar como leídos.
- Administración por secciones: resumen, edición y eliminación del catálogo completo, stock crítico, roles y activación de usuarios, estados de pedidos y mensajes. Imágenes JPG, PNG o WebP de hasta 500 KB.
- Panel de vendedor para consultar productos, disponibilidad y pedidos.
- Navegación móvil, historial del navegador, recarga de rutas y páginas no encontradas.
- Categorías con acceso al catálogo filtrado y gestión desde administración.
- Checkout con datos precargados del perfil, envío a domicilio o retiro y aprobación o rechazo de pago de demostración.
- Resultados de compra y comprobantes recuperables desde el historial o administración.
- Ofertas configurables mediante un precio anterior mayor al vigente, sin alterar los precios iniciales.
- Historias del café, reportes administrativos, edición de usuarios ordinarios e historial por usuario.

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

El modo local conserva las cuentas de demostración del navegador. En el modo conectado, los productos y las cuentas viven en H2 y las contraseñas se guardan con hash; la sesión se verifica en Java. El carrito se mantiene en el navegador y se vacía al cerrar o perder la sesión de su dueño. Todavía no hay pagos reales y AWS se implementará después.

## Estructura

- `src/App.jsx`: composición de la aplicación y sus partes comunes: cabecera, contenido, pie de página y avisos.
- `src/routes/`: rutas con `Routes` y `Route`, accesos por rol y compatibilidad con enlaces antiguos.
- `src/pages/`: páginas independientes de login, registro y cambio de contraseña, detalle por ID y página no encontrada.
- `src/components/`: navegación, portada, catálogo, formularios y administración.
- `src/components/Boton.jsx`: botón común con variantes principal, secundaria y de control; recibe eventos y atributos como `type`, `disabled` y `aria-label`.
- `src/components/BotonAgregar.jsx`: reutiliza el botón común para añadir productos y mostrar su estado de agotado en inicio, catálogo y detalle.
- `src/main.jsx`: `HashRouter` de React Router DOM; conserva enlaces por hash en alojamiento estático.
- `src/components/Administracion.jsx`: subrutas de administración y navegación activa con `NavLink`.
- `src/hooks/useTienda.js`: operaciones de la tienda y guardado.
- `src/hooks/useSesionApi.js`: recupera la sesión y conecta registro, perfil, contraseña y administración de cuentas con el servidor.
- `src/servicios/clienteApi.js`: cookies, token CSRF y errores HTTP compartidos.
- `src/servicios/cuentasApi.js` y `productosApi.js`: peticiones de cada parte de la API.
- `src/hooks/useAccionesTienda.js`: acciones de acceso, carrito y compra que muestran avisos o cambian de pantalla.
- `src/hooks/useNavegacionPagina.js`: título de la página, desplazamiento y foco del teclado al navegar.
- `src/datos/`: catálogo, validación de RUT y migración de almacenamiento.
- `src/styles/diseno.css`: sistema visual artesanal; `react.css` adapta las pantallas React.
- `src/assets/`: imágenes, tipografías y licencias.
- `src/datos/operaciones.js`: validaciones y cambios de estado de la tienda.
- `tests/componentes/`, `tests/paginas/`, `tests/hooks/` y `tests/datos/`: suites Jasmine organizadas por responsabilidad.
- `tests/integracion/`: flujos de acceso y compra con Jasmine, y rutas con Node mediante `MemoryRouter`.
- `tests/ayudas/`: montaje de componentes, datos de prueba y preparación de la cobertura.
- `tests/inicio-pruebas.js`: encuentra automáticamente las suites de Jasmine para compilarlas con Vite.
- `karma.cobertura.conf.cjs`: añade informes HTML, JSON y LCOV al mismo entorno de Karma.
- `src/components/Checkout.jsx`, `ResultadoCompra.jsx` y `ResumenPedido.jsx`: datos de entrega y resultado de la compra simulada.
- `src/datos/categorias.js` y `compra.js`: categorías, validación de entrega, ofertas y resumen de ventas.

## Entrega de la evaluación 2

La [guía de entrega](docs/ENTREGA_2.md) relaciona la pauta con las pantallas y las pruebas y propone el recorrido de presentación. Los documentos actualizados son `docs/Anexo 4 - ERS Grano.docx`, `docs/Anexo 3 - Requerimientos Grano.xlsx` y `docs/Cobertura del testing V2.docx`.

Los nuevos enlaces se encuentran en el catálogo y el pie de página; la navegación principal y el sistema visual se conservan. Para demostrar ofertas, edita un producto desde administración e indica un precio anterior mayor al precio actual. El catálogo inicial no activa descuentos automáticamente.

`PRODUCT.md` y `DESIGN.md` documentan el producto y el diseño. La portada y las seis imágenes de producto son ilustrativas. Los productos usan WebP locales optimizados en `src/assets/fotografia/`, compartidos por el catálogo, los detalles y el carrito.

## Rama de diseño

La rama `probando-diseno-nuevo` en `PelaoKratos/Grano-FullStack2` incorpora la migración React y la paridad funcional del commit `e36a9fd`, más la serie fotográfica realista basada en la portada. Se conserva la identidad crema y verde con Bitter y Karla, así como el esquema 2 de `grano-tienda-react-v1`, las migraciones y la escritura conjunta de inventario, pedido y carrito. Las imágenes cargadas por el usuario permanecen intactas.
