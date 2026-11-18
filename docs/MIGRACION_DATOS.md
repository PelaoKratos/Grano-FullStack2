# Pasar los datos de H2 a PostgreSQL

Esta herramienta recupera cuentas, categorías, productos, pedidos con sus líneas e imágenes, mensajes y marcas de inicialización. Conserva las ID y los hashes de las contraseñas. No copia las sesiones abiertas ni el carrito del navegador.

## Preparación

1. Deja Docker Desktop abierto. PostgreSQL debe haberse iniciado al menos una vez con el backend para que existan sus tablas.
2. Detén el backend con `Ctrl+C`. Cierra también React mientras haces la migración.
3. Abre PowerShell en la carpeta `backend`. Necesitas Java 17, Maven y el comando `docker` disponibles.

La herramienta usa `backend/data/grano.mv.db` en modo lectura y PostgreSQL local en el puerto 5432, con las credenciales de desarrollo del proyecto. No borres esa base H2.

## Primero simular

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File '.\Migrar Datos.ps1'
```

La simulación muestra por tabla cuántos registros copiaría y cuántos ya existen. Hace los mismos INSERT dentro de una transacción y después los deshace. No confirma cambios. Si H2 está abierta en otra aplicación, ciérrala antes.

Los registros idénticos se omiten. Las cuentas de demostración se relacionan por correo y rol, manteniendo la cuenta de PostgreSQL; sus pedidos usan la ID de esa cuenta. Las demás diferencias o duplicados provocan la cancelación completa. No se suman stocks ni se reemplazan productos existentes. Si hay un conflicto, hay que decidir qué registro conservar antes de repetir.

## Aplicar después de revisar el resultado

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File '.\Migrar Datos.ps1' -Aplicar
```

Antes de copiar, el script guarda una copia del archivo H2 y un respaldo `pg_dump` de PostgreSQL en `backend/respaldos/fecha-hora/`. Esa carpeta está excluida de Git porque contiene datos privados. Si falla un respaldo, no continúa. La copia se confirma en una sola transacción; un error revierte todas sus inserciones.

Si usas otra base, puerto o credenciales, adapta primero el script y los respaldos para apuntar al mismo destino. La configuración de este acceso corresponde al Compose local sin personalizaciones.

## Comprobar después

Inicia `Iniciar Backend PostgreSQL.cmd` y luego `Iniciar React con Backend.cmd`. Comprueba el producto que ya existía en PostgreSQL y alguno de H2, con su imagen y stock. Entra con una cuenta antigua, revisa su historial y comprobantes, y consulta categorías y mensajes como administrador. Reinicia el backend y comprueba que siguen presentes.

Puedes volver a ejecutar la simulación: debería indicar que los registros copiados ya existen. Si después editaste esos datos en PostgreSQL, es correcto que avise de diferencias; no intentes sustituirlos automáticamente.

La herramienta está preparada para una migración local con ambos servidores detenidos. Antes de aplicarla por primera vez hay que revisar la simulación con tus datos. Las pruebas habituales del backend siguen usando H2 temporal y no comprueban por sí solas esta transferencia entre motores.
