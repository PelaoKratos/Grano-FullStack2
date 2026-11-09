# Guía para entender y explicar Grano

Grano es una tienda de demostración hecha con React. Permite explorar productos, manejar un carrito, crear cuentas y administrar datos según el rol del usuario. Los datos se guardan en el navegador: no hay backend ni pagos reales.

## Por dónde empezar a leer

| Archivo o carpeta             | Responsabilidad                                                    |
| ----------------------------- | ------------------------------------------------------------------ |
| `index.html`                  | Contiene el elemento `root` donde se monta React.                  |
| `src/main.jsx`                | Carga los estilos y monta `App` dentro de `HashRouter`.            |
| `src/App.jsx`                 | Reúne la tienda, las rutas, los permisos y los avisos.             |
| `src/components/`             | Contiene las pantallas y piezas reutilizables de la interfaz.      |
| `src/components/admin/`       | Separa productos, usuarios, pedidos, mensajes y resumen.           |
| `src/hooks/useTienda.js`      | Conecta las pantallas con las operaciones y el guardado.           |
| `src/datos/operaciones.js`    | Valida cada acción y calcula el siguiente estado.                  |
| `src/datos/almacenamiento.js` | Lee, migra y guarda los datos de localStorage.                     |
| `src/datos/productos.js`      | Define el catálogo inicial y sus imágenes.                         |
| `src/datos/rut.js`            | Valida y formatea el RUT.                                          |
| `src/styles/`                 | Define colores, tipografías, componentes y adaptación a pantallas. |
| `tests/`                      | Comprueba las reglas de compra, los datos y las rutas.             |

Un orden útil de lectura es `main.jsx`, `App.jsx`, `TarjetaProducto.jsx`, `useTienda.js`, `operaciones.js` y `almacenamiento.js`.

## Cómo se reparten las responsabilidades

La pantalla muestra información y recibe la interacción del usuario. El hook `useTienda` coordina la acción. La función `operar` aplica las reglas. Finalmente, `guardarEstado` conserva el resultado completo.

```text
Interacción en un componente
    ↓
Función recibida mediante props
    ↓
useTienda: ejecutar(accion)
    ↓
operar: validar y calcular el nuevo estado
    ↓
guardarEstado: una escritura en localStorage
    ↓
setEstado: React actualiza la pantalla
```

Por eso un formulario no necesita escribir directamente en localStorage. Las operaciones pasan por el mismo proceso de validación y guardado.

## Ejemplo: añadir un café al carrito

1. `TarjetaProducto` recibe `producto` y `onAgregar` mediante props.
2. El botón llama a `onAgregar(producto)`.
3. En `App.jsx`, `agregarProducto` llama a `tienda.agregar(producto)`.
4. `useTienda` envía la acción `{ tipo: "AGREGAR", id: producto.id }` a `ejecutar`.
5. `operar` revisa el stock y aumenta la cantidad o crea una nueva línea.
6. Si el resultado es válido y se puede guardar, React actualiza el carrito y muestra el aviso.

## Qué ocurre al comprar

La acción `COMPRAR`, dentro de `operaciones.js`, comprueba que exista una sesión de comprador y que el carrito tenga productos. Después valida todas las cantidades contra el stock actual.

Si todo está correcto, crea un pedido con una copia de los nombres, precios y cantidades de ese momento. Descuenta las unidades del catálogo, agrega el pedido al historial y vacía el carrito. Estos tres cambios se devuelven juntos y se guardan en una sola escritura.

Si falta stock o falla el guardado, la tienda no muestra una compra exitosa. Las pruebas existentes comprueban esos casos.

## Cómo funciona React Router

`HashRouter` permite usar direcciones como `#/productos` en un alojamiento estático. En `App.jsx`, cada `Route` indica qué componente debe mostrarse.

| Elemento           | Para qué se usa en Grano                                     |
| ------------------ | ------------------------------------------------------------ |
| `Routes` y `Route` | Relacionan direcciones con pantallas.                        |
| `Link`             | Cambia de pantalla dentro de la aplicación.                  |
| `NavLink`          | Marca la sección activa en administración.                   |
| `useNavigate`      | Abre el panel correspondiente después de iniciar sesión.     |
| `useParams`        | Obtiene el `id` de `/producto/:id`.                          |
| `useSearchParams`  | Lee y cambia filtros como `?categoria=metodos`.              |
| `RutaProtegida`    | Renderiza un panel solo si la sesión tiene un rol permitido. |

`RutaProtegida` es un componente propio de Grano, no una exportación de React Router. En esta demostración los roles y las contraseñas viven en el navegador; una aplicación real necesitaría validarlos también en un backend.

## Conceptos que aparecen en los componentes

| Concepto    | Ejemplo y explicación                                                                  |
| ----------- | -------------------------------------------------------------------------------------- |
| Componente  | Una función como `Catalogo` que devuelve JSX para la pantalla.                         |
| JSX         | Sintaxis similar a HTML con expresiones JavaScript entre llaves.                       |
| Props       | Datos o funciones que un componente recibe de su padre, como `producto` y `onAgregar`. |
| `useState`  | Conserva un valor de la interfaz y permite volver a renderizar cuando cambia.          |
| `useEffect` | Ejecuta una tarea después del render, como suscribirse a cambios entre pestañas.       |
| `useRef`    | Conserva una referencia sin provocar un nuevo render por sí sola.                      |
| `map`       | Transforma una lista; por ejemplo, productos en tarjetas.                              |
| `filter`    | Selecciona elementos; por ejemplo, los productos de una categoría.                     |
| `find`      | Busca un elemento, como el producto cuyo ID viene en la URL.                           |
| `reduce`    | Acumula un resultado, como la suma de precios por cantidad.                            |
| `...objeto` | Copia propiedades para construir un objeto actualizado.                                |
| `?.`        | Permite consultar una propiedad cuando el objeto podría no existir.                    |

## Qué se guarda y qué no se transfiere con Git

`localStorage` conserva productos, usuarios, sesión, carrito, pedidos y mensajes bajo `grano-tienda-react-v1`, con esquema versión 2. El módulo de almacenamiento puede importar datos anteriores sin borrar las claves originales.

Git guarda el código y los recursos del proyecto. Las cuentas y pedidos creados en el navegador no se suben al repositorio. Además, cada navegador y origen —dominio y puerto— tiene su propio almacenamiento.

## Cómo mantener el código ordenado

El proyecto usa dos espacios por nivel, punto y coma, comillas dobles y líneas distribuidas con Prettier. Las condiciones y los bucles tienen llaves, aunque contengan una sola instrucción.

```sh
pnpm format
pnpm format:check
pnpm test
pnpm build
```

`format` ordena los archivos; `format:check` verifica el formato sin modificarlos. Las pruebas revisan el comportamiento y `build` comprueba la compilación. La copia local de Bootstrap se conserva como biblioteca externa.

## Guion breve para una presentación

El recorrido de compra ahora pasa por `Checkout.jsx`. El formulario precarga el perfil y entrega los datos a `realizarCompra` en `App.jsx`. `validarEntrega` comprueba los campos; `operar` valida stock y pago simulado y devuelve el nuevo estado. Solo una confirmación aprobada y guardada abre `/compra/confirmada/:id`. El rechazo muestra `/compra/error`, conserva el carrito y permite reintentar con los mismos datos.

`ResumenPedido` se reutiliza en checkout, resultados y administración. Los pedidos anteriores sin dirección siguen siendo válidos. Las categorías se guardan como una lista adicional en el mismo esquema 2; al renombrarlas se actualizan los productos, y los reportes suman los precios históricos de cada pedido.

Jasmine define los casos de componentes con `describe`, `it`, `expect` y espías de callbacks. Karma prepara un navegador Chrome sin ventanas y ejecuta esos casos; Vite convierte el JSX del archivo de pruebas. Los eventos se envían al DOM real y `act` permite comprobar la actualización de React antes de verificar el resultado.

1. Explicar que es una tienda React de demostración con persistencia local.
2. Mostrar `main.jsx` y las rutas de `App.jsx`.
3. Abrir `TarjetaProducto.jsx` y seguir el botón Añadir hasta `useTienda`.
4. Mostrar la acción `COMPRAR` y explicar por qué inventario, pedido y carrito se guardan juntos.
5. Mostrar los paneles por rol y las pruebas del proyecto.

Una explicación central que puedes adaptar: «Separamos la interfaz, las reglas y el almacenamiento. Los componentes reciben datos y funciones; las acciones se validan antes de guardar y React vuelve a mostrar el estado actualizado».
