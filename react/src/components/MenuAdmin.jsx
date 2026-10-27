const enlaces = [
  ["Resumen", "#admin"],
  ["Productos", "#admin/productos"],
  ["Pedidos", "#admin/pedidos"],
  ["Usuarios", "#admin/usuarios"],
  ["Mensajes", "#admin/mensajes"],
];

function MenuAdmin() {
  return (
    <nav className="menu-admin" aria-label="Administración">
      {enlaces.map(([texto, ruta]) => <a key={ruta} href={ruta}>{texto}</a>)}
    </nav>
  );
}

export default MenuAdmin;
