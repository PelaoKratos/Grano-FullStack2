# Grano

Maqueta de una tienda de café para Desarrollo FullStack II.

**Integrantes: Brian Bravo y Matías Guerra.**

## Cómo abrirla

Abre `index.html` con el navegador. No necesitas instalar nada ni ejecutar un servidor. Bootstrap, las ilustraciones y el video están guardados en el proyecto, así que también se puede revisar sin internet.

## Qué incluye

- Inicio, catálogo con seis productos y una ficha para cada uno.
- Bolsa vacía, inicio de sesión, registro y contacto como pantallas de muestra.
- Nosotros y un diario con dos artículos y un video.
- Administración con productos, usuarios, formularios de creación y edición, órdenes y mensajes de ejemplo.

Son 26 páginas conectadas por enlaces. Se puede entrar al panel desde el pie de cualquier página. El menú se mantiene visible en celular y escritorio.

Los botones de añadir, comprar, iniciar sesión, enviar y guardar están deshabilitados. Los campos se pueden completar como muestra, pero no envían ni guardan información. El panel tiene acceso libre y no implementa permisos. Región y comuna son opciones fijas de ejemplo.

## Tecnologías

HTML5, CSS propio y Bootstrap 5.3.8, usando solamente su CSS. No hay JavaScript, backend, almacenamiento local ni herramientas de compilación.

En el HTML dejamos comentarios sencillos sobre `container`, la grilla, `navbar`, `card`, `btn`, los formularios, las tablas y los otros componentes que usamos. En `css/estilos.css` explicamos los ajustes de color, espaciado y adaptación a celular. El archivo de Bootstrap se conserva como biblioteca de terceros.

La identidad visual, las ilustraciones SVG y el video vienen del proyecto anterior de Grano. Los productos, precios y registros son datos de muestra.

## Archivos de la evaluación

En `docs/` están:

- `Anexo 2 - Requerimientos Grano.xlsx`
- `Anexo 3 - Requerimientos Grano.xlsx`
- `Anexo 4 - ERS Grano.docx`

Cada Excel contiene los mismos 10 requisitos funcionales y 10 no funcionales, con actores, descripción, estado y criterio de aceptación. El segundo adapta las filas del ejemplo a Grano. Los originales de los anexos se mantienen intactos fuera del repositorio.

La hoja de instrucciones del anexo 3 original contiene texto repetido en columnas muy alejadas; se conserva esa hoja. Los requisitos de Grano están en `Requerimiento Inicial`, columnas A a H.

## Alcance frente a la pauta

Los PDF de la evaluación solicitan JavaScript, validaciones, carrito funcional y otras operaciones. Esta versión sigue el alcance pedido para la maqueta: únicamente HTML, CSS y Bootstrap, con navegación entre páginas. **No cubre los criterios de JavaScript o carrito funcional de esos documentos.** La ERS deja esa diferencia explícita y las funciones pendientes para una próxima versión.

## Revisión realizada

Se comprobaron las 26 páginas en Microsoft Edge sin interfaz, con anchos de 390 y 1440 píxeles. No se detectó desbordamiento horizontal de la página ni imágenes rotas. También se revisaron 536 enlaces y rutas de recursos, etiquetas de los campos, identificadores y ausencia de scripts. Se revisó visualmente una muestra de inicio, detalle, registro y administración en ambos tamaños.

## Trabajo en equipo

Proponemos que Brian revise las páginas de la tienda y Matías las de administración y los documentos. Ambos deberían recorrer las pantallas antes de integrar cambios. Es una distribución sugerida, no un registro de quién realizó cada parte.

Los commits se guardan con mensajes en español y se suben al repositorio configurado. Cada integrante debe trabajar con su propia identidad de Git; no se simulan aportes del otro integrante.

## Referencia de Bootstrap

[Documentación oficial](https://getbootstrap.com/docs/5.3/getting-started/introduction/). Bootstrap se distribuye bajo licencia MIT; se conserva el encabezado de licencia en `vendor/bootstrap.min.css`.
