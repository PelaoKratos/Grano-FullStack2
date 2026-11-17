# Pruebas de Grano

Organizamos las pruebas para poder explicar qué estamos comprobando en cada parte de la tienda. Jasmine define los casos y sus resultados esperados. Karma abre Chrome sin ventana y los ejecuta. Vite prepara el código React antes de esa ejecución.

## Cómo ejecutarlas

Desde la raíz del proyecto:

```sh
npm install
npm test
```

La instalación se necesita al descargar el proyecto o cambiar sus dependencias. Para repetir las pruebas basta con `npm test`.

| Comando                  | Qué ejecuta                                                                             |
| ------------------------ | --------------------------------------------------------------------------------------- |
| `npm test`               | Las 116 pruebas de Jasmine y las 11 pruebas de rutas                                    |
| `npm run test:jasmine`   | Las suites de reglas, componentes, formularios, hooks y flujos en Chrome mediante Karma |
| `npm run test:rutas`     | Las rutas de React usando Node y MemoryRouter                                           |
| `npm run test:cobertura` | Las suites de Jasmine instrumentadas y el informe de cobertura                          |
| `npm run build`          | La compilación de la tienda para publicar                                               |

Se conservaron dos comandos anteriores: `test:componentes` abre ahora todas las suites de Jasmine y `test:logica` ejecuta el mismo recorrido que `npm test`.

Requiere un navegador Chrome instalado. La configuración también busca Edge en Windows; si está en otra ubicación se puede indicar con la variable `CHROME_BIN`. El servidor de pruebas usa `127.0.0.1:9876` y se cierra al terminar.

## Dónde están los casos

```text
tests/
  componentes/       Botones, productos, filtros, contacto, checkout y errores
  paginas/           Validaciones del login y registro
  hooks/             useTienda y useAccionesTienda
  datos/             Almacenamiento, reglas de negocio y entrega
  integracion/       Acceso, compra y navegación
  ayudas/            Datos y funciones compartidas de las pruebas
  inicio-pruebas.js  Entrada que encuentra las suites de Jasmine
  inicio-cobertura.js
```

Un archivo nuevo con extensión `.spec.jsx` dentro de componentes, páginas, hooks o integración se incluye automáticamente. Las pruebas de reglas en datos usan `.spec.js`. Los archivos `.test.js` de integración se ejecutan con Node y no se cargan como Jasmine.

El reparto actual es de 35 casos de datos, 55 de componentes, 6 de formularios y perfil, 13 de hooks y 7 de flujos con Jasmine. Las otras 11 pruebas verifican rutas con Node. Hay pruebas unitarias y de integración: no llamamos unitarias a todas por igual.

## Ejemplo sencillo de Jasmine

```js
describe("Validación del RUT", () => {
  it("rechaza un dígito verificador incorrecto", () => {
    expect(esRutValido("12.345.678-9")).toBeFalse();
  });
});
```

`describe` agrupa casos relacionados, `it` explica el comportamiento esperado y `expect` comprueba el resultado. En los archivos de datos se conservaron los 30 casos anteriores y se adaptaron las aserciones de Node a las de Jasmine.

## Qué comprobamos

| Parte                  | Ejemplos de escenarios                                                                                           |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Acceso y registro      | Correo incorrecto, campos obligatorios, RUT, contraseñas diferentes, credenciales rechazadas y sesión automática |
| Productos y carrito    | Datos de la tarjeta, botones, stock agotado, cantidades y filtros                                                |
| Compra                 | Dirección incompleta, retiro, pago rechazado, comprobante y descuento de stock                                   |
| Reglas administrativas | Roles, productos, categorías, mensajes, usuarios y estados de pedidos                                            |
| Hooks                  | Persistencia tras volver a montar, cambios desde otra pestaña, cierre de sesión y navegación por rol             |
| Errores                | Guardado sin espacio y recuperación si falla una pantalla                                                        |
| Rutas                  | Accesos permitidos, accesos rechazados, enlaces anteriores y páginas ausentes                                    |

Las pruebas de formularios distinguen dos envíos. `enviarComoUsuario` usa `requestSubmit` para respetar `required` y el formato de correo del navegador. `enviar` permite comprobar directamente las validaciones JavaScript, como el RUT o la confirmación de contraseña.

En los hooks usamos componentes pequeños de prueba que los llaman y permiten observar su resultado. Los espías de Jasmine sustituyen acciones o simulan fallos, por ejemplo `spyOn(Storage.prototype, "setItem").and.throwError(...)`. Las pruebas restauran el almacenamiento y desmontan el componente al terminar cada caso.

## Leer el informe de cobertura

```sh
npm run test:cobertura
```

Después se abre `coverage/index.html`. La consola también muestra un resumen y se generan archivos JSON y LCOV para consultar los resultados. Esta carpeta se genera localmente y está excluida de Git.

El informe incluye los 53 archivos JavaScript y JSX de `src`, con sus nombres y líneas originales. Se excluye `main.jsx` porque monta la aplicación real; tampoco se cuentan bibliotecas, estilos, imágenes, archivos de pruebas ni el paquete generado por Vite. Los módulos sin pruebas también aparecen para mostrar lo que falta.

La medición corresponde a las 116 pruebas ejecutadas por Karma. Las 11 pruebas de rutas con Node se comprueban aparte y no suman porcentajes a este informe.

Resultado del 16 de noviembre de 2026, después de añadir 39 casos de administración, imágenes, carrito, perfiles y páginas públicas:

| Métrica    | Resultado           |
| ---------- | ------------------- |
| Líneas     | 90,25 %: 685 de 759 |
| Sentencias | 89,70 %: 706 de 787 |
| Funciones  | 88,23 %: 255 de 289 |
| Ramas      | 87,04 %: 645 de 741 |

El mínimo acordado para este proyecto es del 80 % global en las cuatro métricas. Se configura en `karma.cobertura.conf.cjs`: `npm run test:cobertura` termina con error si alguna baja de ese límite. El reporte mantiene los mismos 53 archivos; no se excluyeron pantallas para subir los porcentajes. La cobertura de líneas anterior era del 68,55 %.

Los colores del informe permiten abrir un archivo y ubicar los casos pendientes. Superar el mínimo no garantiza que todos los escenarios estén comprobados. Las nuevas pruebas ejercitan creación y edición, cancelaciones, errores de lectura de imágenes y guardado, protección de cuentas, límites de stock y navegación con teclado.

## Qué sigue después

El siguiente trabajo es revisar las ramas pendientes y sumar casos útiles cuando cambie la aplicación. Quedan para otra etapa la revisión automática de accesibilidad y las mediciones de rendimiento.

La base de datos en AWS se implementará más adelante. Actualmente la aplicación usa `localStorage`, y los datos de las pruebas son locales o simulados. Cuando exista una API se añadirán pruebas de respuestas correctas, rechazos y errores de red, manteniendo las pruebas de las reglas de negocio.

## Cómo mostrarlo en la presentación

1. Abrir un caso sencillo de `tests/datos/` y explicar entrada y resultado esperado.
2. Ejecutar `npm test` y distinguir los resultados de Jasmine y de Node.
3. Mostrar un espía y una prueba de un hook.
4. Ejecutar `npm run test:cobertura` y abrir un archivo con líneas pendientes.
5. Explicar qué escenario nuevo se escribiría para cubrir una de esas líneas.

## Validación de teléfonos

Checkout exige un teléfono chileno de nueve dígitos, con prefijo 56 o +56 opcional. Perfil y edición administrativa permiten omitirlo; si se informa debe ser válido. Se admiten espacios, guiones y paréntesis. Los nuevos casos están en `datos/telefono.spec.js`, `componentes/Cuenta.spec.jsx` y `componentes/Checkout.spec.jsx`. La comprobación valida formato, no existencia del número.
