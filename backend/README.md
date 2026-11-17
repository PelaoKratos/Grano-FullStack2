# Backend de Grano: productos y cuentas

La API usa Spring Boot, Java 17 y H2 para guardar productos, cuentas y pedidos. React se conecta al catálogo, registro, inicio de sesión, perfil, compras y administración. Spring Security comprueba los permisos en el servidor.

## Iniciar en Windows

Haz doble clic en `Iniciar Backend.cmd`, dentro de esta carpeta. Usa el JDK 17 de `C:\Program Files\Java\jdk-17` si está instalado allí; también respeta una configuración de `JAVA_HOME` en otros equipos. Requiere Maven en el PATH. La primera ejecución descarga las dependencias.

También se puede iniciar desde PowerShell, estando en la raíz del repositorio:

```powershell
cd backend
$env:JAVA_HOME = "C:\Program Files\Java\jdk-17"
$env:Path = "$env:JAVA_HOME\bin;$env:Path"
mvn spring-boot:run
```

Deja la terminal abierta mientras lo usas. Para detenerlo, pulsa `Ctrl+C`.

- API: <http://127.0.0.1:8080/api/productos>
- Swagger: <http://127.0.0.1:8080/swagger-ui/index.html>
- Descripción OpenAPI: <http://127.0.0.1:8080/v3/api-docs>

El catálogo empieza vacío. Los productos del modo local anterior no se importan automáticamente. Las tres cuentas de prueba se crean al iniciar si todavía no existen; las nuevas cuentas y los productos del modo conectado se guardan en H2.

## Cuentas, sesiones y permisos

En la práctica local se conservan estas cuentas, visibles también debajo del login:

| Rol           | Correo              | Contraseña |
| ------------- | ------------------- | ---------- |
| Administrador | admin@duocuc.cl     | 1234       |
| Vendedor      | vendedor@duocuc.cl  | Venta123   |
| Comprador     | comprador@duocuc.cl | Cliente123 |

El registro público crea compradores aunque alguien cambie el campo `rol` en la petición. El administrador puede crear cuentas con los tres roles y cambiar la activación de las cuentas ordinarias. No puede desactivarse a sí mismo ni cambiar los roles o contraseñas de las cuentas de prueba.

Las contraseñas se guardan con BCrypt y no se devuelven en el JSON. El correo se normaliza a minúsculas; el RUT se valida con módulo 11 y no puede repetirse usando otro formato. El perfil se actualiza a partir del usuario de la sesión, sin aceptar que el formulario elija otra cuenta o cambie su rol.

Al entrar, Spring guarda la sesión en el servidor y entrega una cookie `JSESSIONID` HttpOnly. React consulta `/api/auth/me` al recargar. La sesión vence tras 30 minutos sin actividad o al cerrar sesión. Reiniciar el backend termina las sesiones en memoria; las cuentas siguen en H2. Al cambiar la contraseña, un número de versión invalida las sesiones anteriores. La activación y los roles se consultan en la base en cada petición autenticada.

| Acción                                  | Acceso                          |
| --------------------------------------- | ------------------------------- |
| Consultar catálogo y detalle            | Público                         |
| Crear, editar o eliminar productos      | Administrador                   |
| Listar, crear o editar usuarios         | Administrador                   |
| Consultar o actualizar el perfil propio | Cualquier cuenta con sesión     |
| Registrarse                             | Público, siempre como comprador |

React envía las cookies con `credentials: "include"`. Antes de cada petición que modifica datos obtiene un token en `GET /api/auth/csrf` y lo manda como `X-CSRF-TOKEN`. Se pide uno nuevo porque Spring lo renueva al entrar y salir. No desactivamos CSRF. La configuración sigue el funcionamiento de [form login](https://docs.spring.io/spring-security/reference/6.5/servlet/authentication/passwords/form.html) y [protección CSRF](https://docs.spring.io/spring-security/reference/6.5/servlet/exploits/csrf.html) de Spring Security.

Para probar con Postman, conserva las cookies entre peticiones:

1. Haz `GET /api/auth/csrf` y copia `token`.
2. Haz `POST /api/auth/login`, con el encabezado `X-CSRF-TOKEN` y cuerpo **x-www-form-urlencoded** con `correo` y `contrasena`.
3. Vuelve a pedir el token después del login y úsalo en las peticiones POST, PUT o DELETE.
4. Haz `GET /api/auth/me` para verificar la cuenta y `POST /api/auth/logout` con token para salir.

Login y logout los atienden los filtros de Spring Security; no aparecen como métodos del controlador en Swagger. Las consultas públicas se pueden probar directamente en Swagger. Las escrituras se prueban desde React o Postman con sesión y token.

| Método     | Dirección            | Uso                                                  |
| ---------- | -------------------- | ---------------------------------------------------- |
| GET        | `/api/auth/csrf`     | Obtener token de seguridad                           |
| POST       | `/api/auth/login`    | Entrar con correo y contraseña en formato formulario |
| POST       | `/api/auth/logout`   | Cerrar la sesión                                     |
| GET        | `/api/auth/me`       | Recuperar el perfil de la sesión                     |
| POST       | `/api/auth/registro` | Crear comprador con nombre, correo, RUT y contraseña |
| PUT        | `/api/auth/perfil`   | Guardar nombre, teléfono y dirección propios         |
| POST       | `/api/auth/clave`    | Cambiar clave con `correo`, `actual` y `nueva`       |
| GET / POST | `/api/usuarios`      | Listar o crear cuentas desde administración          |
| PUT        | `/api/usuarios/{id}` | Editar una cuenta desde administración               |

## Probar el primer producto

Desde React entra como administrador y abre **Administración → Productos**. En Postman puedes usar `POST /api/productos` con sesión de administrador, el token CSRF actual y este cuerpo JSON:

```json
{
  "nombre": "Café de prueba",
  "categoria": "Café en grano",
  "notas": "Cacao y caramelo",
  "descripcion": "Café de tueste medio",
  "detalle": "Bolsa de 250 g",
  "precio": 12990,
  "stock": 12,
  "critico": 3,
  "imagen": ""
}
```

La respuesta debe ser **201** e incluir una ID como `nuevo-...`. Copia esa ID para consultar, editar o eliminar el producto. Las ID son texto para mantener compatibilidad con el catálogo de Grano. El servidor genera las nuevas y no permite cambiarlas mediante PUT.

| Método | Dirección             | Resultado esperado                             |
| ------ | --------------------- | ---------------------------------------------- |
| GET    | `/api/productos`      | 200 y una lista ordenada por nombre            |
| GET    | `/api/productos/{id}` | 200 y el producto                              |
| POST   | `/api/productos`      | 201, el producto creado y la cabecera Location |
| PUT    | `/api/productos/{id}` | 200 y el producto actualizado                  |
| DELETE | `/api/productos/{id}` | 204, sin cuerpo de respuesta                   |

PUT recibe todos los campos obligatorios, igual que POST. Para probarlo copia el JSON anterior y cambia, por ejemplo, `precio` o `stock`.

Los errores devuelven un objeto con `mensaje`. Una validación de campos añade también `campos`, para que React pueda explicar qué corregir:

- **400:** datos incompletos, JSON inválido, stock negativo o fraccionario, precios que no corresponden.
- **401:** necesitas iniciar sesión o la sesión terminó.
- **403:** el rol no tiene permiso o falta el token CSRF correcto.
- **404:** no existe el producto solicitado.
- **409:** otro producto tiene el mismo nombre, sin distinguir mayúsculas y después de quitar espacios de los extremos.

Los precios se guardan con `BigDecimal` y se reciben como pesos enteros. El stock y el nivel crítico deben ser enteros desde cero. `precioAnterior` es opcional; si se informa como oferta debe superar el precio actual. `notas` e `imagen` también son opcionales. `imagen` acepta una referencia o una cadena ya convertida a base64: este CRUD no incluye un endpoint de subida de archivos.

## Pedidos y stock

Solo los compradores pueden confirmar compras. El servidor toma el comprador de la sesión y calcula los precios y el total desde el catálogo; no acepta que el navegador los decida. La confirmación sigue siendo una simulación de pago, sin cobros reales.

| Método | Dirección                  | Acceso                                              |
| ------ | -------------------------- | --------------------------------------------------- |
| POST   | `/api/pedidos`             | Comprador activo                                    |
| GET    | `/api/pedidos`             | Comprador: propios; vendedor y administrador: todos |
| GET    | `/api/pedidos/{id}`        | Dueño del pedido, vendedor o administrador          |
| PUT    | `/api/pedidos/{id}/estado` | Vendedor o administrador                            |

El POST devuelve 201 y el comprobante. Recibe un identificador UUID para la solicitud, productos con ID y cantidad, datos de entrega y el resultado del pago de práctica. Reemplaza `id-del-producto` con una ID real:

```json
{
  "solicitudId": "123e4567-e89b-12d3-a456-426614174000",
  "productos": [{ "id": "id-del-producto", "cantidad": 1 }],
  "entrega": {
    "nombre": "Cliente de prueba",
    "correo": "comprador@duocuc.cl",
    "telefono": "912345678",
    "metodo": "retiro"
  },
  "resultadoPago": "aprobado"
}
```

Para domicilio también se exigen `direccion`, `comuna` y `region`. Se valida el teléfono chileno, el correo, el largo de los campos y las cantidades enteras entre 1 y 999, con hasta 100 productos distintos por pedido. Un resultado `rechazado` devuelve 400 sin modificar el stock. Un producto eliminado o sin unidades suficientes devuelve 409. Consultar un comprobante ajeno como comprador devuelve 404.

El cambio de estado recibe, por ejemplo, `{"estado":"En preparación"}`. Los estados permitidos son **Recibido**, **En preparación** y **Entregado**; cambiar el estado no vuelve a descontar stock. No se incluyen cancelaciones, devoluciones ni pagos bancarios en esta etapa.

`PedidoService.crear()` usa `@Transactional`: guarda el pedido y descuenta todos los productos juntos. Los productos se bloquean para que dos compradores no usen la misma última unidad, y se toman siempre en el mismo orden para evitar bloqueos cruzados. Si un producto falla, se revierte el pedido completo. La edición y eliminación administrativa también usan el bloqueo del producto.

La solicitud se identifica por comprador y `solicitudId`. Repetir el mismo cuerpo devuelve el pedido existente sin descontar de nuevo; usar ese identificador con otro contenido devuelve 409. React conserva el intento antes de enviarlo y lo elimina después de confirmar y limpiar su carrito. Si se pierde la respuesta, se puede reintentar la misma compra sin duplicarla.

Cada pedido guarda una copia del nombre, categoría, precio, cantidad e imagen de sus productos, junto con la entrega, la fecha y el estado. El comprobante se conserva aunque se elimine el producto del catálogo.

## Categorías y contacto

| Método       | Dirección                                  | Acceso                        |
| ------------ | ------------------------------------------ | ----------------------------- |
| GET          | `/api/categorias` y `/api/categorias/{id}` | Público                       |
| POST         | `/api/categorias`                          | Administrador                 |
| PUT / DELETE | `/api/categorias/{id}`                     | Administrador                 |
| POST         | `/api/mensajes`                            | Visitante o cuenta con sesión |
| GET          | `/api/mensajes` y `/api/mensajes/{id}`     | Administrador                 |
| PUT          | `/api/mensajes/{id}/leido`                 | Administrador                 |

Crear o renombrar una categoría recibe `{"nombre":"Cafeteras"}`. La respuesta incluye su ID, nombre y clave para filtros. Los nombres admiten 60 caracteres y se comparan sin distinguir mayúsculas ni acentos; nombres vacíos, sin una clave válida o reservados como `todos` se rechazan. Un producto debe usar una categoría existente. No se puede eliminar una categoría con productos: se devuelve 409.

`CategoriaService` guarda el cambio de nombre y los productos afectados en la misma transacción. Los productos se leen después de tomar su bloqueo para conservar el stock confirmado por compras recientes. Los comprobantes mantienen la categoría histórica. La primera ejecución crea Café en grano, Métodos y Accesorios y recupera categorías de productos anteriores. Una marca persistente evita recrear categorías eliminadas en los siguientes reinicios.

El contacto recibe, por ejemplo, `{"nombre":"Visita","correo":"visita@grano.cl","texto":"Quisiera consultar por un café."}`. Se validan nombre de hasta 80 caracteres, correo de hasta 120 y texto de hasta 500. Con sesión iniciada se usa el nombre y correo de la cuenta, aunque el cuerpo indique otra identidad. Java genera la fecha y el estado inicial **Nuevo**; el cliente no puede declararlo leído.

El administrador consulta la bandeja y marca por ID, sin depender de la posición de un mensaje en la lista. Marcar otra vez un mensaje leído es válido. No se envían correos ni se integran servicios de mensajería externos. Los nuevos mensajes viven en H2; los antiguos del navegador no se importan automáticamente y quedan como respaldo local.

En React, `useCategoriasApi` y `useMensajesApi` gestionan carga, errores y operaciones pendientes. Los formularios esperan la respuesta antes de limpiar sus campos, y la bandeja se oculta cuando cambia o termina la sesión administrativa.

## Dónde se guardan los datos

Al ejecutar desde `backend/`, H2 crea `data/grano.mv.db`. Ese archivo conserva los productos cuando se reinicia el servidor. La carpeta de datos queda excluida de Git; el repositorio guarda el código, no los registros creados al probarlo.

La configuración está en `src/main/resources/application.properties`. La URL comienza con `jdbc:h2:file:` para guardar en disco. Las pruebas usan `jdbc:h2:mem:` y una base temporal diferente.

Se pueden configurar estas variables al iniciar:

| Variable                 | Valor local predeterminado                    |
| ------------------------ | --------------------------------------------- |
| `GRANO_BACKEND_ADDRESS`  | `127.0.0.1`                                   |
| `GRANO_BACKEND_PORT`     | `8080`                                        |
| `GRANO_DB_URL`           | `jdbc:h2:file:./data/grano`                   |
| `GRANO_DB_USER`          | `sa`                                          |
| `GRANO_DB_PASSWORD`      | Vacío, para esta base local                   |
| `GRANO_FRONTEND_ORIGINS` | `http://127.0.0.1:5173,http://localhost:5173` |

El backend se inicia accesible solo desde el equipo local. Ya comprueba sesiones y permisos; AWS queda para una etapa posterior. CORS acepta cookies y el encabezado CSRF desde los orígenes indicados. Las cuentas públicas de práctica se crean con `GRANO_CUENTAS_DEMO=true`; ponerlo en `false` evita nuevas creaciones, pero no elimina cuentas existentes.

## Cómo se reparte el código

| Archivo                                                  | Qué hace                                                                           |
| -------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `GranoBackendApplication`                                | Inicia Spring Boot                                                                 |
| `model/Producto`                                         | Define los campos de la tabla y sus validaciones                                   |
| `repository/ProductoRepository`                          | Consulta y guarda productos mediante JPA                                           |
| `service/ProductoService`                                | Revisa duplicados y ofertas; prepara los datos que se guardan                      |
| `controller/ProductoController`                          | Relaciona las direcciones HTTP con las acciones del servicio                       |
| `exception/ManejadorErrores`                             | Devuelve mensajes de error en JSON                                                 |
| `config/CorsConfig`                                      | Configura los orígenes locales permitidos para React                               |
| `model/Usuario` y `repository/UsuarioRepository`         | Guardan cuentas y consultan por correo o RUT                                       |
| `dto/DatosCuenta`                                        | Define los campos que recibe cada formulario y la respuesta pública sin contraseña |
| `service/UsuarioService` y `controller/CuentaController` | Registro, perfil, cambio de contraseña y gestión de cuentas                        |
| `config/SeguridadConfig`                                 | Login, logout, hash de contraseñas y permisos por ruta                             |
| `config/FiltroCuentaActiva` y `CuentaAutenticada`        | Comprueban el rol actual, activación y versión de la sesión                        |
| `config/CuentasDemostracionConfig`                       | Crea las tres cuentas de práctica si todavía no existen                            |

Para seguir una petición empieza por `ProductoController.listar()`. Llama a `ProductoService.listar()` y este pide los datos al repositorio. JPA consulta H2 y Spring convierte la lista en JSON al responder.

En pedidos, `PedidoController` recibe la solicitud y `PedidoService` reúne validaciones, cálculo y descuento de stock. `PedidoRepository` consulta el historial. `Pedido`, `LineaPedido` y `EntregaPedido` guardan el comprobante y sus copias de productos y entrega; los DTO de `DatosPedido` definen lo que llega y lo que se devuelve a React.

Para crear un producto, el controlador valida el cuerpo con `@Valid`. El servicio comprueba el nombre y la oferta, genera la ID y entrega el producto al repositorio. La anotación `@Transactional` agrupa el trabajo del servicio en una transacción de base de datos.

## Ejecutar las pruebas

Desde esta carpeta y con Java 17 configurado:

Si el servidor se abrió con `java -jar`, detenlo antes con `Ctrl+C` para que Windows permita reemplazar el JAR al compilar.

```powershell
mvn verify
```

Hay 57 casos: 4 de `ProductoServiceTest`, 15 de `ProductoApiTest`, 15 de `CuentaApiTest`, 12 de `PedidoApiTest` y 11 de `ContenidoApiTest`. Comprueban productos, cuentas, pedidos, categorías, mensajes, permisos y transacciones con H2 temporal. Estas pruebas no modifican `backend/data`.

Maven deja sus resultados y el JAR en `target/`, que tampoco se sube a Git. Las pruebas de React siguen ejecutándose desde la raíz con `npm test` y `npm run test:cobertura`; la cobertura de Java se medirá por separado si se incorpora esa etapa.

## Conexión con React

Desde la raíz ejecuta `npm run dev:backend` mientras este servidor está encendido. La configuración pública está en `.env.backend`. El servicio `src/servicios/productosApi.js` envía las peticiones y `src/hooks/useCatalogoApi.js` maneja carga, errores, reintentos y cambios del catálogo. Consulta el recorrido de prueba en el README principal.

El catálogo empieza vacío; agrega productos desde administración. Las cuentas se guardan en H2 junto con los productos. El modo local anterior sigue disponible con `npm run dev`. El modo conectado conserva el carrito en una clave separada del navegador, sin guardar contraseñas ni la lista de usuarios. No importamos automáticamente las cuentas o el catálogo anteriores.

Vite usa `VITE_API_URL=/api` y un proxy hacia `http://127.0.0.1:8080`. Así el navegador mantiene las cookies en el mismo origen al abrir con localhost o 127.0.0.1. Para publicar habrá que configurar también el proxy `/api` del alojamiento.

El próximo paso será PostgreSQL con Docker. Después se preparará el despliegue en AWS. Productos, categorías, cuentas, pedidos y mensajes nuevos ya usan H2 persistente en el modo conectado.
