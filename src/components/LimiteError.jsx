import { Component } from "react";

// Un error de pantalla muestra una recuperación sin borrar los datos guardados.
export default class LimiteError extends Component {
  state = { error: false };
  // React llama a este método cuando falla una pantalla hija para activar la
  // vista de recuperación.
  static getDerivedStateFromError() {
    return { error: true };
  }
  // Muestra la tienda o el botón de recarga según el estado de error.
  render() {
    return this.state.error ? (
      <main className="container area-app">
        <h1>No pudimos abrir la tienda.</h1>
        <p>
          Recarga la página para volver a intentarlo. Los datos guardados
          permanecen en tu navegador.
        </p>
        <button className="btn btn-success" onClick={() => location.reload()}>
          Volver a intentar
        </button>
      </main>
    ) : (
      this.props.children
    );
  }
}
