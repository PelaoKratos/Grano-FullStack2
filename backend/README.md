# Backend de Grano: productos y cuentas

La API usa Spring Boot, Java 17 y H2 para guardar productos y cuentas. React se conecta al catálogo, registro, inicio de sesión, perfil y administración de usuarios. Spring Security comprueba los permisos en el servidor.

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

Para crear un producto, el controlador valida el cuerpo con `@Valid`. El servicio comprueba el nombre y la oferta, genera la ID y entrega el producto al repositorio. La anotación `@Transactional` agrupa el trabajo del servicio en una transacción de base de datos.

## Ejecutar las pruebas

Desde esta carpeta y con Java 17 configurado:

Si el servidor se abrió con `java -jar`, detenlo antes con `Ctrl+C` para que Windows permita reemplazar el JAR al compilar.

```powershell
mvn verify
```

Hay 34 casos: 4 de `ProductoServiceTest`, 15 de `ProductoApiTest` y 15 de `CuentaApiTest`. JUnit, Mockito y MockMvc comprueban el CRUD, registro, sesión, contraseñas, roles, perfil, CSRF real y CORS con una base H2 temporal. Estas pruebas no modifican `backend/data`.

Maven deja sus resultados y el JAR en `target/`, que tampoco se sube a Git. Las pruebas de React siguen ejecutándose desde la raíz con `npm test` y `npm run test:cobertura`; la cobertura de Java se medirá por separado si se incorpora esa etapa.

## Conexión con React

Desde la raíz ejecuta `npm run dev:backend` mientras este servidor está encendido. La configuración pública está en `.env.backend`. El servicio `src/servicios/productosApi.js` envía las peticiones y `src/hooks/useCatalogoApi.js` maneja carga, errores, reintentos y cambios del catálogo. Consulta el recorrido de prueba en el README principal.

El catálogo empieza vacío; agrega productos desde administración. Las cuentas se guardan en H2 junto con los productos. El modo local anterior sigue disponible con `npm run dev`. El modo conectado conserva el carrito en una clave separada del navegador, sin guardar contraseñas ni la lista de usuarios. No importamos automáticamente las cuentas o el catálogo anteriores.

Vite usa `VITE_API_URL=/api` y un proxy hacia `http://127.0.0.1:8080`. Así el navegador mantiene las cookies en el mismo origen al abrir con localhost o 127.0.0.1. Para publicar habrá que configurar también el proxy `/api` del alojamiento.

Los próximos pasos son categorías y pedidos con descuento de stock dentro de una transacción. Las compras del modo conectado quedan pendientes hasta contar con esos endpoints. Después se preparará una base externa y el despliegue en AWS.
