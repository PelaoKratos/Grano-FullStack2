# Grano

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Personas que compran café de especialidad, métodos y accesorios para preparar café en casa. Compradores, vendedores y administradores tienen vistas propias.

## Product Purpose

Explorar los orígenes, consultar sus detalles y completar un pedido de demostración.

## Capabilities and Constraints

La aplicación principal es React 19 y Vite 8 desde la raíz. Bootstrap CSS local y el diseño artesanal se conservan. Carrito, cuentas, mensajes, pedidos y productos de demostración usan localStorage; no existe pago ni servidor. Mantener navegación, precios, formularios y roles.

## Brand Commitments

Nombre Grano, café y rituales. El usuario eligió una tienda cálida y artesanal y autorizó un rediseño conservando contenido y funciones. Referencia de trabajo: https://github.com/anthropics/claude-cookbooks/blob/main/coding/prompting_for_frontend_aesthetics.ipynb

## Evidence on Hand

README.md, componentes React, catálogo e ilustraciones SVG locales. No inventar testimonios, premios, compromisos de envío, certificaciones ni datos de productores.

## Product Principles

Ayudar a elegir por sabor y origen. Dar protagonismo al café. Mantener clara la compra. Conservar la demostración funcional y accesible.

## Migración a React

El usuario solicitó convertir el proyecto a React después de aprobar el rediseño. La identidad visual se conserva. Estado único grano-tienda-react-v1, importación inicial desde claves anteriores sin borrarlas, rutas por hash y compatibilidad de enlaces HTML. La importación automática requiere el mismo origen del navegador; file:// y localhost son orígenes diferentes.

## Paridad funcional con Migracion-React-Base

Se mantienen las funciones de la rama base: stock y umbral crítico, cantidades del carrito, compra con descuento de inventario, catálogo editable completo, roles y activación de usuarios, estados de pedidos, mensajes leídos, panel de vendedor, búsqueda, confirmación de contraseña y tres cuentas de prueba. La escritura única incorpora inventario, pedido y carrito. El esquema 2 mantiene la clave existente e importa el catálogo completo y roles de la práctica React.
