# Entrega 2 de Grano

Frontend de demostración con React, Vite, React Router DOM, Bootstrap local y persistencia en `localStorage`. Se mantiene el alcance sin backend, cobros ni despachos reales.

## Relación con la pauta

| Pauta                                                   | Implementación                                                                                        | Evidencia                                                           |
| ------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| Migración, datos JS, CRUD y persistencia, páginas 1 y 2 | Componentes, `useTienda`, `operar`, `cargarEstado` y `guardarEstado`                                  | Pruebas de almacenamiento y operaciones                             |
| Bootstrap y adaptación, página 2                        | Estilos locales existentes y grilla responsiva                                                        | Revisión visual de catálogo y compra en móvil, tableta y escritorio |
| Categorías, páginas 4 y 5                               | `/categorias`, filtros por URL y `/admin/categorias`                                                  | Pruebas de categorías, persistencia y rutas                         |
| Checkout y datos precargados, páginas 5 y 6             | `/checkout`, entrega a domicilio o retiro, validación de datos                                        | Jasmine y pruebas de reglas de compra                               |
| Resultado exitoso o fallido, páginas 7 y 8              | `/compra/confirmada/:id` y `/compra/error` con resumen y reintento                                    | Compra aprobada, pago rechazado y guardado fallido en Chrome        |
| Ofertas, página 8                                       | `/ofertas` y precio anterior configurable desde administración                                        | Persistencia, validación y filtrado de ofertas                      |
| Administración, páginas 9 y 10                          | Productos, stock, categorías, usuarios, historial, pedidos, comprobantes, mensajes, reportes y perfil | Rutas protegidas, operaciones y revisión del panel                  |
| Historias o blog del diagrama, páginas 3 y 4            | `/blog` y `/blog/:slug`                                                                               | Rutas del listado, artículo y artículo ausente                      |
| Jasmine y Karma, páginas 2 y 11                         | `karma.conf.cjs`, `vite.pruebas.config.js` y `tests/componentes.spec.jsx`                             | 17 casos de renderizado, props, estado y eventos                    |
| ERS y documento de testing, página 12                   | Documentos V2 en `docs/`                                                                              | ERS, planilla actualizada e informe de cobertura funcional          |

## Verificación

```sh
pnpm install --frozen-lockfile
pnpm test
pnpm build
pnpm format:check
pnpm dev
```

Resultado del 30 de octubre de 2026: 40 pruebas de lógica y rutas y 17 pruebas de componentes aprobadas. Chrome Headless ejecuta Jasmine mediante Karma. La suite conserva las 29 pruebas anteriores y añade los escenarios de esta entrega. El informe describe cobertura funcional y no afirma un porcentaje de líneas o ramas instrumentadas.

Para usar un navegador instalado en otra ruta, define `CHROME_BIN` antes de ejecutar las pruebas. Karma se limita a `127.0.0.1`; el navegador de pruebas se cierra al terminar.

## Preparar la entrega

- Repositorio público: https://github.com/PelaoKratos/Grano-FullStack2
- Rama con esta entrega: `probando-diseno-nuevo`. Comparte el enlace de la rama para que se revise la versión correcta.
- ERS V2: `Anexo 4 - ERS Grano.docx`.
- Requerimientos actualizados: `Anexo 3 - Requerimientos Grano.xlsx`.
- Documento de testing: `Cobertura del testing V2.docx`.
- ZIP del proyecto: copia del código y documentos, sin `node_modules`, `.git` ni archivos temporales. Instalar con el archivo de versiones incluido.

La visibilidad pública del repositorio fue verificada mediante la API de GitHub. El ZIP no incluye cuentas ni pedidos creados en otros navegadores: esos datos pertenecen a cada origen local.

## Recorrido para los 15 minutos de presentación

1. Durante 3 minutos, mostrar portada, catálogo, búsqueda, categorías, ofertas e historias del café. Para demostrar una oferta, configurar previamente un precio anterior mayor al vigente desde administración.
2. Durante 5 minutos, entrar como comprador, añadir productos y completar checkout. Simular un rechazo, comprobar que carrito y stock se mantienen y volver a intentar con aprobación. Abrir el comprobante desde Mi cuenta y recargar.
3. Durante 4 minutos, entrar como administrador y mostrar CRUD, stock, categorías, usuarios, historial, comprobantes, reportes y perfil. El vendedor tiene su panel de consulta existente.
4. Durante 3 minutos, ejecutar las pruebas y explicar la separación entre componentes, reglas y almacenamiento, y el papel de React Router, Jasmine y Karma.

Cada integrante debe poder explicar un componente con props, un estado que cambia por eventos y por qué una compra guarda inventario, pedido y carrito juntos. La pauta reserva otros 5 minutos para preguntas.

## Compatibilidad y límites

La clave `grano-tienda-react-v1`, el esquema 2 y las migraciones anteriores se conservan. Los nuevos campos de categorías, oferta y entrega son compatibles con los datos existentes. Las cuentas de prueba, pedidos anteriores e imágenes propias siguen disponibles. Las hojas de estilo, tipografías e imágenes no se sustituyen.

Las opciones de pago aprobado y rechazado pertenecen a la demostración. Los comprobantes no tienen validez tributaria y los reportes muestran únicamente datos guardados en el navegador actual.
