# Trabajar con Grano sin Docker

Podemos seguir desarrollando y probando con H2. Los productos, categorías, cuentas, pedidos y mensajes del modo conectado quedan en `backend/data/grano.mv.db`. PostgreSQL y Docker siguen pendientes; estas mejoras no cambian la base actual.

## Abrir el proyecto en Windows

1. La primera vez, abre una terminal en la raíz y ejecuta `npm install`. No hace falta repetirlo cada vez que inicias.
2. Abre `backend/Iniciar Backend.cmd` y deja esa ventana abierta. Necesita JDK 17 y Maven.
3. Abre `Iniciar React con Backend.cmd` desde la raíz. Ese acceso inicia React en modo conectado y abre el navegador; el backend se inicia con el archivo del paso anterior.
4. Usa `http://127.0.0.1:5173/`. Mantén abiertas las dos terminales. Para detener cada servidor pulsa `Ctrl+C` en su ventana.

Antes de abrir otro frontend, detén el anterior. El modo conectado exige el puerto 5173 y muestra un error si ya está ocupado, para evitar abrir la tienda en otra dirección por accidente.

`Iniciar Grano.cmd` sigue abriendo la demostración local anterior. Desde una terminal puedes elegir `npm run dev` para esa demostración o `npm run dev:backend` para el modo conectado.

## Qué revisar a mano

Las tres cuentas de práctica aparecen debajo del login. Las cuentas nuevas del modo conectado se registran en H2.

| Recorrido     | Qué comprobar                                                                       |
| ------------- | ----------------------------------------------------------------------------------- |
| Público       | Inicio, catálogo, detalle, Nosotros y Contacto abren correctamente.                 |
| Registro      | Correo, RUT y confirmación de contraseña; la cuenta nueva inicia sesión.            |
| Comprador     | Agregar, ajustar cantidades, pago simulado aprobado o rechazado e historial propio. |
| Vendedor      | Consultar stock y pedidos y cambiar su estado.                                      |
| Administrador | Productos, imágenes, categorías, usuarios, pedidos y mensajes.                      |
| Stock         | Comprar descuenta unidades; un pedido rechazado conserva el inventario.             |
| Categorías    | Renombrar actualiza el catálogo; una categoría con productos no se elimina.         |
| Contacto      | El envío aparece en administración y se puede marcar como leído.                    |
| Sesión        | Cerrar sesión vacía el carrito de la cuenta y oculta las pantallas privadas.        |
| Persistencia  | Reiniciar el backend conserva los datos; después hay que iniciar sesión nuevamente. |

## Actualizar datos y recuperar una conexión

Los botones de actualización aparecen en las pantallas que los necesitan. Mientras se vuelve a consultar un recurso ya cargado, la pantalla permanece abierta. Puedes escribir el nombre de un producto, pulsar **Actualizar catálogo** y comprobar que el texto siga allí. Para guardar el producto usa **Agregar producto** o **Guardar cambios**.

Al abrir una página por primera vez, se esperan sus datos necesarios. Si falla esa carga se informa del error, en vez de mostrar un producto inexistente o una bandeja vacía. Contacto y Nosotros pueden abrirse aunque estén pendientes otras consultas de la tienda.

Para probar una desconexión, detén el backend, actualiza el catálogo y comprueba el mensaje. Inicia el backend otra vez y pulsa **Actualizar catálogo** o **Comprobar sesión**, según el aviso. Las peticiones tienen una espera máxima de diez segundos, también al leer la respuesta. Si estabas confirmando un pedido, revisa el historial antes de cambiar los datos del intento: los reintentos de la misma solicitud conservan su identificador.

## Comprobación automática

Desde la raíz:

```sh
npm run check
```

Ese comando comprueba formato, ejecuta Jasmine y Karma con el mínimo de cobertura del 80 %, verifica las rutas con Node y compila los modos local y conectado. Termina con error si falla un paso. Las peticiones de estas pruebas están simuladas y no requieren encender el backend.

Para Java, abre `backend/Probar Backend.cmd`. Usa JDK 17 y ejecuta `mvn test` con H2 temporal. No modifica la base habitual ni vuelve a empaquetar el JAR, por lo que puede usarse con el servidor abierto. La ventana queda esperando una tecla para que puedas leer el resultado.

Desde PowerShell también puedes ejecutarlo sin esa pausa:

```powershell
& '.\backend\Probar Backend.cmd' --sin-pausa
```

El informe de cobertura del frontend queda en `coverage/index.html`. Los resultados de Java quedan en `backend/target/surefire-reports/`. Los informes, la base de datos y las compilaciones están excluidos de Git.

## Cómo está organizado este ajuste

`App.jsx` reúne las partes comunes y las rutas. `EstadoConexion.jsx` presenta avisos y reintentos. `datos/cargaPaginas.js` decide qué datos necesita cada pantalla y distingue la carga inicial de una actualización. `clienteApi.js` comparte cookies, CSRF, cancelación y tiempo de espera entre los servicios.
