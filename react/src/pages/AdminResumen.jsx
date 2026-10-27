function AdminResumen({ productos, pedidos, usuarios, mensajes }) {
  const stockCritico = productos.filter((producto) => producto.stock <= producto.critico);

  return (
    <section className="panel-formulario">
      <h2>Resumen</h2>
      <div className="resumen-admin">
        <p><strong>{productos.length}</strong> productos</p>
        <p><strong>{pedidos.length}</strong> pedidos</p>
        <p><strong>{usuarios.length}</strong> usuarios</p>
        <p><strong>{mensajes.length}</strong> mensajes</p>
      </div>
      <h3>Stock que necesita atención</h3>
      {stockCritico.length === 0 ? (
        <p>No hay productos en stock crítico.</p>
      ) : (
        <ul>{stockCritico.map((producto) => <li key={producto.id}>{producto.nombre}: {producto.stock} unidades</li>)}</ul>
      )}
      <a href="#admin/productos">Administrar productos</a>
    </section>
  );
}

export default AdminResumen;
