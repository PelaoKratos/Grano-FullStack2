# Grano

## Platform

web

## Users

Personas que compran café de especialidad, métodos y accesorios para preparar café en casa. Compradores, vendedores y administradores tienen vistas propias.

## Product Purpose

Explorar los orígenes, consultar sus detalles y completar un pedido de demostración.

## Capabilities and Constraints

La aplicación principal es React 19 y Vite 8 desde la raíz. Bootstrap CSS local y el diseño artesanal se conservan. Carrito, cuentas, mensajes, pedidos y productos de demostración usan localStorage; no existe pago ni servidor. Mantener navegación, precios, formularios y roles.

El enrutamiento usa React Router DOM 7: `HashRouter`, `Routes`, `Route`, `Link`, `NavLink`, `useNavigate`, `useParams` y `useSearchParams`. Se conservan los enlaces con `#`, alias anteriores, filtros por URL y redirecciones HTML. Cuenta, administración y vendedor validan el rol antes de renderizar sus paneles. No se mantiene un segundo enrutador manual.

## Brand Commitments

La entrega V2 añade categorías, ofertas configurables, historias del café y checkout con datos del perfil, envío o retiro y pago simulado aprobado o rechazado. Los resultados incluyen resumen y comprobante recuperable. Administración incorpora categorías, reportes, perfil, edición de usuarios ordinarios e historial por usuario. La clave y el esquema 2 se mantienen; las ofertas no cambian los precios iniciales automáticamente. Jasmine y Karma verifican renderizado, props, estado y eventos en Chrome sin ventanas, junto a las pruebas de reglas y migraciones existentes.

Nombre Grano, café y rituales. Identidad cálida y artesanal, con colores crema y verde y tipografías Bitter y Karla. Los cambios de diseño conservan el contenido y las funciones de la tienda.

## Evidence on Hand

README.md, componentes React, catálogo e imágenes ilustrativas locales. La portada original fija el estilo realista y artesanal para todas las imágenes de la tienda. Los SVG se reservan para iconos y favicon. No inventar testimonios, premios, compromisos de envío, certificaciones ni datos de productores.

## Product Principles

Ayudar a elegir por sabor y origen. Dar protagonismo al café. Mantener clara la compra. Conservar la demostración funcional y accesible.

## Migración a React

El usuario solicitó convertir el proyecto a React después de aprobar el rediseño. La identidad visual se conserva. Estado único grano-tienda-react-v1, importación inicial desde claves anteriores sin borrarlas, rutas por hash y compatibilidad de enlaces HTML. La importación automática requiere el mismo origen del navegador; file:// y localhost son orígenes diferentes.

## Paridad funcional con Migracion-React-Base

Se mantienen las funciones de la rama base: stock y umbral crítico, cantidades del carrito, compra con descuento de inventario, catálogo editable completo, roles y activación de usuarios, estados de pedidos, mensajes leídos, panel de vendedor, búsqueda, confirmación de contraseña y tres cuentas de prueba. La escritura única incorpora inventario, pedido y carrito. El esquema 2 mantiene la clave existente e importa el catálogo completo y roles de la práctica React.
