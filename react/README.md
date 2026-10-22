# Migración de Grano a React

Esta carpeta contiene el inicio de la versión React. La página de inicio ya usa componentes, una lista compartida de productos y conserva el carrito actual.

Desde la carpeta principal del proyecto, ejecuta:

```bash
npm install
npm run dev
```

Vite sirve el sitio completo desde la raíz del repositorio. La versión React está en `/react/` y las páginas que faltan migrar siguen disponibles como archivos HTML.

Para generar la versión de prueba desde la carpeta principal:

```bash
npm run build
```

El resultado queda en `react/dist/` e incluye las páginas HTML actuales junto a la nueva pantalla React.
