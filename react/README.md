# Grano en React

Esta carpeta contiene la versión React de Grano. El sitio HTML original sigue en la raíz del repositorio; para probar React se usa Vite.

## Ejecutar

Desde `react/`:

```bash
npm install
npm run dev
```

`npm install` solo hace falta la primera vez o cuando cambian las dependencias. Después, abre en Chrome o Edge la dirección local que muestra Vite.

## Organización

```text
src/
├── components/  Elementos compartidos: menú, pie y tarjeta de producto
├── pages/       Pantallas de la tienda, cuenta y administración
├── data/        Productos y cuenta inicial de demostración
├── hooks/       Estado y acciones de la tienda
├── utils/       RUT, formato de precios y almacenamiento
└── assets/      Ilustraciones del proyecto
```

Las páginas se abren mediante la dirección después de `#`, por ejemplo `#productos`, `#registro` y `#admin/productos`. Así se puede volver atrás con el navegador sin agregar una librería de rutas.

## Funciones de prueba

- Buscar y filtrar productos por categoría, consultar su ficha y ver el stock disponible.
- Agregar unidades al carrito sin superar el stock. Al confirmar un pedido de prueba, se descuentan las unidades y se conserva un resumen en Mi cuenta.
- Registrarse con RUT válido y entrar automáticamente a la cuenta. También se puede iniciar sesión, cerrar sesión, editar el perfil y cambiar la contraseña.
- Iniciar sesión como comprador, vendedor o administrador. El vendedor consulta productos, stock y pedidos; el administrador gestiona productos, cuentas, pedidos y mensajes desde pantallas separadas.
- Agregar una imagen JPG, PNG o WebP de hasta 500 KB al crear o editar un producto.

En el inicio de sesión aparecen tres cuentas de prueba, con botones para copiar el correo y la contraseña. Los datos se guardan en `localStorage` del navegador. Esta versión no usa servidor, no cobra pagos y no comparte información entre equipos. Las contraseñas de prueba no deben ser contraseñas personales.

Al abrir la nueva estructura se conservan las cuentas, pedidos, mensajes y productos creados en la versión React anterior del mismo navegador. Los productos antiguos que no tenían stock reciben 10 unidades iniciales. El carrito anterior se convierte a cantidades por producto.
