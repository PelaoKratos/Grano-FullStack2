# Backend de Grano: primer CRUD

Esta es la primera parte del backend. Permite administrar productos con una API Spring Boot y guardarlos en una base H2 local. El siguiente paso será conectar el catálogo y el formulario de administración de React con esta API.

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

Al comenzar, la lista está vacía: un `GET` devuelve `[]`. Los productos creados en React todavía pertenecen al almacenamiento del navegador y no se importan automáticamente.

## Probar el primer producto

En Swagger abre `POST /api/productos`, pulsa **Try it out**, reemplaza el cuerpo con este JSON y pulsa **Execute**. En Postman se usa la misma URL, método POST y un cuerpo raw de tipo JSON.

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

El backend se inicia accesible solo desde el equipo local. Esta etapa todavía no implementa autenticación ni permisos de cuentas en el servidor. Antes del despliegue se incorporarán esos controles y la conexión con la base de datos de AWS. CORS permite las peticiones del navegador desde Vite; no sustituye la autenticación.

## Cómo se reparte el código

| Archivo                         | Qué hace                                                      |
| ------------------------------- | ------------------------------------------------------------- |
| `GranoBackendApplication`       | Inicia Spring Boot                                            |
| `model/Producto`                | Define los campos de la tabla y sus validaciones              |
| `repository/ProductoRepository` | Consulta y guarda productos mediante JPA                      |
| `service/ProductoService`       | Revisa duplicados y ofertas; prepara los datos que se guardan |
| `controller/ProductoController` | Relaciona las direcciones HTTP con las acciones del servicio  |
| `exception/ManejadorErrores`    | Devuelve mensajes de error en JSON                            |
| `config/CorsConfig`             | Configura los orígenes locales permitidos para React          |

Para seguir una petición empieza por `ProductoController.listar()`. Llama a `ProductoService.listar()` y este pide los datos al repositorio. JPA consulta H2 y Spring convierte la lista en JSON al responder.

Para crear un producto, el controlador valida el cuerpo con `@Valid`. El servicio comprueba el nombre y la oferta, genera la ID y entrega el producto al repositorio. La anotación `@Transactional` agrupa el trabajo del servicio en una transacción de base de datos.

## Ejecutar las pruebas

Desde esta carpeta y con Java 17 configurado:

```powershell
mvn verify
```

Hay 19 casos: `ProductoServiceTest` usa JUnit y Mockito para probar las reglas del servicio con un repositorio simulado. `ProductoApiTest` usa Spring Boot, MockMvc y una base H2 temporal para comprobar los endpoints, las validaciones, CORS y la documentación OpenAPI. Estas pruebas no modifican `backend/data`.

Maven deja sus resultados y el JAR en `target/`, que tampoco se sube a Git. Las pruebas de React siguen ejecutándose desde la raíz con `npm test` y `npm run test:cobertura`; la cobertura de Java se medirá por separado si se incorpora esa etapa.

## Conexión con React

Desde la raíz ejecuta `npm run dev:backend` mientras este servidor está encendido. La configuración pública está en `.env.backend`. El servicio `src/servicios/productosApi.js` envía las peticiones y `src/hooks/useCatalogoApi.js` maneja carga, errores, reintentos y cambios del catálogo. Consulta el recorrido de prueba en el README principal.

La base empieza vacía; agrega productos desde administración. El modo local anterior sigue disponible con `npm run dev`. El modo conectado conserva sus datos de demostración en una clave separada del navegador. Los productos y sus imágenes se guardan en H2. No importamos automáticamente el catálogo anterior.

Los próximos pasos son autenticación y autorización en el backend, cuentas persistentes, categorías y pedidos con descuento de stock dentro de una transacción. Las compras del modo conectado quedan pendientes hasta contar con esos endpoints. Después se preparará una base externa y el despliegue en AWS.
