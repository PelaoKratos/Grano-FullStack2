---
name: Grano
description: Una tienda cálida y artesanal de café y rituales.
colors:
  verde: "#244637"
  verde-oscuro: "#19362a"
  crema: "#f5f0e5"
  papel: "#fdfaf3"
  tinta: "#273a2e"
  texto-suave: "#626958"
  borde: "#d6d4c5"
  ambar: "#d4b26f"
  texto-inverso-suave: "#d4ddc9"
  imagen-fondo: "#e8e5d8"
  crema-hover: "#e4d9bc"
  campo-borde: "#b8beaa"
  foco: "#99732e"
typography:
  display:
    fontFamily: "Bitter, Georgia, serif"
    fontSize: "clamp(2.8rem, 5.85vw, 5.5rem)"
    fontWeight: 450
    lineHeight: 1.06
    letterSpacing: "-0.04em"
  headline:
    fontFamily: "Bitter, Georgia, serif"
    fontSize: "clamp(2rem, 3.5vw, 3.2rem)"
    fontWeight: 500
    lineHeight: 1.15
    letterSpacing: "-0.035em"
  title:
    fontFamily: "Bitter, Georgia, serif"
    fontSize: "24px"
    fontWeight: 500
    lineHeight: 1.2
    letterSpacing: "-0.02em"
  body:
    fontFamily: "Karla, sans-serif"
    fontSize: "17px"
    fontWeight: 400
    lineHeight: 1.55
  label:
    fontFamily: "Karla, sans-serif"
    fontSize: "14px"
    fontWeight: 600
  button:
    fontFamily: "Karla, sans-serif"
    fontSize: "15px"
    fontWeight: 600
    lineHeight: 1.25
rounded:
  etiqueta: "3px"
  control: "4px"
  compacto: "8px"
  superficie: "12px"
spacing:
  detalle: "8px"
  control: "12px"
  interior: "16px"
  grupo: "20px"
  panel: "24px"
  columna: "28px"
  amplio: "48px"
  editorial: "60px"
components:
  button-primary:
    backgroundColor: "{colors.verde}"
    textColor: "#fff"
    typography: "{typography.button}"
    rounded: "{rounded.control}"
    padding: "13px 20px"
  button-primary-hover:
    backgroundColor: "{colors.verde-oscuro}"
    textColor: "#fff"
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.verde}"
    typography: "{typography.button}"
    rounded: "{rounded.control}"
    padding: "13px 20px"
  button-outline-hover:
    backgroundColor: "{colors.verde}"
    textColor: "#fff"
  button-cream:
    backgroundColor: "{colors.crema}"
    textColor: "{colors.verde}"
    typography: "{typography.button}"
    rounded: "{rounded.control}"
    padding: "13px 20px"
  button-cream-hover:
    backgroundColor: "{colors.crema-hover}"
    textColor: "{colors.verde}"
  input:
    backgroundColor: "{colors.papel}"
    textColor: "{colors.tinta}"
    rounded: "{rounded.control}"
    padding: "12px 14px"
  flavor-tag:
    backgroundColor: "{colors.crema}"
    textColor: "{colors.verde}"
    rounded: "{rounded.etiqueta}"
    padding: "5px 11px"
  panel:
    backgroundColor: "{colors.papel}"
    textColor: "{colors.tinta}"
    rounded: "{rounded.superficie}"
    padding: "clamp(22px, 3vw, 38px)"
  coffee-counter:
    backgroundColor: "{colors.verde}"
    textColor: "{colors.crema}"
    rounded: "{rounded.compacto}"
    padding: "24px"
    width: "332px"
---

# Design System: Grano

## Overview

**Creative North Star: "El envoltorio de una tienda de barrio"**

Grano se siente como papel avena cuidadosamente impreso, una mesa de madera y una pausa para preparar café. El mundo cálido y artesanal confirmado por el usuario se expresa mediante tinta bosque, serifas con cuerpo, controles sólidos y fotografías tangibles. La fotografía aporta textura; la interfaz conserva calma y legibilidad.

La composición respira entre secciones y mantiene juntos sabor, nombre, precio y acción. El catálogo y Nosotros usan fotografía realista ilustrativa, coherente con la portada original: mesa de nogal, lino verde bosque, papel kraft, cerámica arena y luz cálida de ventana desde la izquierda. Este sistema describe la aplicación principal en React. La autoridad visual actual es `src/styles/diseno.css`, cargada después de los estilos anteriores.

**Key Characteristics:**
- Papel claro y tinta bosque, con inversión de color en zonas de ritual y compra.
- Bitter para titulares; Karla para lectura, navegación y controles.
- Fotografía cálida y objetos de catálogo con bordes suavemente redondeados.
- Productos abiertos sobre el fondo, con precio y compra visibles.
- Estados legibles, foco visible y movimiento reducido respetado.

## Colors

La paleta reúne papel avena, bosque, oliva y un ámbar reservado para la selección de texto.

### Primary

- **Bosque** (`verde`): acciones principales, enlaces, navegación y superficies de ritual y mostrador.
- **Bosque profundo** (`verde-oscuro`): pie de página, notificación del carrito y estados activos u oscuros de botones.

### Secondary

- **Ámbar** (`ambar`): selección de texto, acompañada por tinta bosque profundo.
- **Oro de foco** (`foco`): contorno de navegación por teclado; su función es identificar el elemento activo.

### Neutral

- **Papel avena** (`crema`): lienzo principal y controles invertidos sobre bosque.
- **Papel limpio** (`papel`): campos, paneles y tablas.
- **Tinta vegetal** (`tinta`): lectura principal.
- **Oliva gris** (`texto-suave`): descripciones y metadatos sobre fondos claros.
- **Fibra de papel** (`borde`): divisores y límites de panel.
- **Salvia clara** (`texto-inverso-suave`): lectura secundaria sobre bosque.
- **Soporte de imagen** (`imagen-fondo`): fondo de reserva detrás de las fotografías de producto.
- **Avena tostada** (`crema-hover`): respuesta de los botones crema.
- **Trazo de campo** (`campo-borde`): límites visibles de campos y selectores.

### Named Rules

**The Paper and Ink Rule.** Las superficies claras usan tinta vegetal u oliva gris; las superficies bosque usan crema o salvia clara.

## Typography

**Display Font:** Bitter, con Georgia y serif como respaldo.
**Body Font:** Karla, con sans-serif como respaldo.

Ambas familias se alojan en `src/assets/fonts`; Bitter aporta el carácter impreso y Karla mantiene claras las decisiones de compra. No hay una escala modular uniforme: los tamaños responden a funciones concretas.

### Hierarchy

- **Display:** titular de portada fluido, peso ligero respecto a los títulos de sección; véase `typography.display`. Entre 641 y 900 px cambia a `clamp(2.6rem, 6.5vw, 3.7rem)`; hasta 640 px usa `clamp(2.5rem, 9.6vw, 3.5rem)` y altura de línea de 1.08.
- **Headline:** títulos de sección según `typography.headline`; los títulos generales fuera de portada usan `clamp(2.4rem, 5.7vw, 4.8rem)` y altura de línea de 1.1. Hasta 640 px los títulos generales usan 38 px y 30 px, respectivamente.
- **Title:** nombres de producto según `typography.title`; la portada usa 21 px entre 641 y 900 px y 26 px hasta 640 px. El mostrador usa 25 px en escritorio y 27 px en móvil.
- **Body:** lectura según `typography.body`; hasta 640 px baja a 16 px. Los párrafos del ritual se limitan a 35ch; las descripciones de detalle a 58ch.
- **Label:** campos según `typography.label`; navegación de escritorio a 14 px, etiquetas de sabor a 12 px y notas de producto a 13–14 px.
- **Button:** Karla seminegrita según `typography.button`; las acciones compactas de producto usan 14 px.

### Named Rules

**The Printed Voice Rule.** Bitter identifica titulares y nombres; Karla explica, orienta y permite actuar. Conservar esta relación al ampliar el sitio.

## Layout

El contenedor llega a 1280 px. Deja 48 px por lado en escritorio, 32 px hasta 1100 px y 20 px hasta 640 px. Los pasos de `spacing` son medidas reutilizadas, no una cuadrícula matemática obligatoria.

La portada dispone titular e invitación en dos columnas y coloca debajo una imagen de ancho completo con un mostrador de compra. A 640 px la introducción se apila y el mostrador pasa al flujo bajo una fotografía de 280 px de alto. La colección usa tres columnas con separación de 28 px, baja a 20 px a 900 px y se convierte en una columna con separación de 34 px a 640 px. Las secciones principales usan aire vertical de aproximadamente 65–96 px en escritorio y 45–55 px en móvil.

La navegación se convierte en un menú desplegable a 900 px; Escape lo cierra y devuelve el foco al botón. El contador del carrito sigue visible. El pie usa tres columnas, y en móvil reserva una fila completa a la marca y dos columnas para enlaces. Conservar el canal de desplazamiento estable (`scrollbar-gutter: stable`) para que abrir o filtrar contenido no desplace el eje de la página.

## Elevation & Depth

La interfaz es plana: el contraste entre papel y bosque, los bordes finos y las imágenes crean profundidad. Las tarjetas de producto no usan marco ni sombra. Los paneles tampoco usan sombra; el token heredado de sombra suave no se aplica a estos contenedores y no es una invitación a elevarlos.

### Shadow Vocabulary

- **Notificación flotante** (`0 12px 30px rgb(25 54 42 / 20%)`): distingue el aviso fijo del carrito del contenido que queda debajo.
- **Leyenda sobre fotografía** (`text-shadow: 0 2px 8px #20251e`): sostiene la legibilidad de la nota de la mesa; desaparece con esa nota en móvil.

### Named Rules

**The Flat Shelf Rule.** Las tarjetas y paneles permanecen planos; reservar la sombra de interfaz para la notificación que flota sobre la página.

## Shapes

Los controles tienen esquinas apenas suavizadas, las etiquetas un radio menor y las fotografías y paneles un radio de superficie. Usar los valores de `rounded` para conservar esa diferencia. El mostrador y la notificación usan el radio compacto. En móvil el mostrador pierde sus esquinas propias y comparte la silueta de su contenedor; la mesa usa un radio de 10 px. El contador del carrito es circular.

Los separadores son trazos de un píxel. Los iconos son SVG de línea, normalmente de 22 px; las flechas de acciones compactas se reducen a 16–17 px. Las fotografías de producto se guardan como WebP de 1200 × 1200 px, con el objeto completo y margen suficiente para recortes. Las tarjetas conservan proporción 1.1 en escritorio y 1.2 en móvil, mientras que los métodos de preparación se presentan en cuadrados. La ficha de detalle muestra la fotografía cuadrada completa.

## Components

### Buttons

Sólidos y claros, con texto de acción y flechas SVG cuando están presentes. El botón general tiene una altura mínima de 48 px; la compra compacta de colección usa 43 px. El primario hereda texto blanco de Bootstrap, mientras que los controles sobre bosque invierten a crema con texto bosque. El secundario tiene borde bosque y se rellena al pasar el cursor; el botón crema se vuelve avena tostada.

Las transiciones de botón duran 160 ms con `ease-out`. El foco visible usa un contorno de 3 px con separación de 5 px. La portada revela la fotografía durante 900 ms con `cubic-bezier(.16,1,.3,1)`; la preferencia de movimiento reducido elimina esa animación, vuelve instantáneas las transiciones y desactiva el desplazamiento suave.

### Chips

Las etiquetas de sabor sobre las imágenes son descriptivas: crema, texto bosque, borde oliva y radio de etiqueta. Los filtros del catálogo sí son botones: el elegido se rellena de bosque con texto crema, y los demás conservan un fondo transparente con borde al pasar el cursor. No confundir etiqueta estática con filtro interactivo.

### Cards / Containers

Las fichas de producto se abren sobre el lienzo, con imagen redondeada y contenido debajo sin caja adicional. Los paneles de formularios usan papel limpio, borde de fibra y radio de superficie, con relleno fluido según `components.panel`. Los datos monetarios usan números tabulares y el código CLP pequeño junto al importe.

### Inputs / Fields

Campos de papel limpio con borde visible, radio de control y altura mínima de 48 px. Las etiquetas quedan encima, con nueve píxeles de separación. El foco cambia el borde a bosque y añade el halo `0 0 0 3px #d7dec7`; la navegación por teclado conserva además el contorno global. El cursor de edición es bosque. Las alertas existentes mantienen sus variantes de Bootstrap y no constituyen una nueva paleta de marca.

### Navigation

Navegación de Karla sobre papel avena, con una línea inferior que se dibuja en 180 ms y peso de 650 en el enlace actual. En móvil, los enlaces del menú pasan a filas con divisor superior y tipo de 16 px. La marca usa Bitter de peso 750; su descriptor en mayúsculas pertenece a la firma de marca.

### Mostrador de café

Un bloque bosque mantiene juntos tres botones de sabor, nombre, notas, precio y compra. El botón elegido usa crema y texto bosque; los otros usan salvia clara y un borde de respuesta al cursor. Cambiar sabor actualiza el producto, la descripción, el precio, el enlace y los datos de compra, con anuncio discreto para lectores de pantalla. El mostrador se superpone a la fotografía sólo cuando hay espacio.

La notificación del carrito aparece sin mover el foco, anuncia la adición y ofrece un enlace al carrito. Su posición pasa de la esquina inferior derecha a un margen de 16 px en móvil. El contenido no depende de una animación para hacerse visible.

## Do's and Don'ts

### Do:
- **Do** conservar papel avena y tinta bosque como base del mundo cálido y artesanal.
- **Do** mantener juntos nombre, sabor, precio y acción de compra.
- **Do** usar Bitter para titulares y Karla para lectura y controles.
- **Do** mantener el foco visible, los estados seleccionados y la preferencia de movimiento reducido.
- **Do** conservar la portada original y su lenguaje fotográfico en todo el catálogo y en Nosotros. Las seis imágenes de producto se encuentran en `src/assets/fotografia/`; sus archivos `.webp.json` conservan los prompts y la procedencia de generación con IA. No son fotos de productos físicos.

### Don't:
- **Don't** añadir sombras a las tarjetas de producto o a los paneles planos.
- **Don't** convertir las etiquetas descriptivas de sabor en controles sin una función real.
- **Don't** trasladar el mostrador superpuesto al móvil cuando la implementación lo coloca en el flujo.
- **Don't** tratar los valores anteriores sobrescritos por `src/styles/diseno.css` como la autoridad visual vigente.
