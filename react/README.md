# Migración de Grano a React

Esta carpeta contiene la versión React en desarrollo. Inicio, el catálogo y los detalles de producto usan componentes y una única lista de productos. El carrito actual se mantiene conectado.

Desde la carpeta principal del proyecto, ejecuta:

```bash
npm install
npm run dev
```

Vite sirve el sitio completo desde la raíz del repositorio. Inicio está en `/react/`, el catálogo en `/react/productos.html` y un detalle en `/react/producto.html?id=colombia`. Las demás pantallas siguen disponibles como archivos HTML.

Para generar la versión de prueba desde la carpeta principal:

```bash
npm run build
```

El resultado queda en `react/dist/` e incluye las páginas HTML actuales y las pantallas migradas a React.
