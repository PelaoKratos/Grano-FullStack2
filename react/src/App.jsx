import Encabezado from "./components/Encabezado.jsx";
import PiePagina from "./components/PiePagina.jsx";
import Catalogo from "./pages/Catalogo.jsx";
import DetalleProducto from "./pages/DetalleProducto.jsx";
import Inicio from "./pages/Inicio.jsx";
import "./App.css";

function App({ pagina }) {
  let contenido = <Inicio />;

  if (pagina === "productos") {
    contenido = <Catalogo />;
  } else if (pagina === "producto") {
    contenido = <DetalleProducto />;
  }

  return (
    <>
      <Encabezado pagina={pagina} />
      {contenido}
      <PiePagina />
    </>
  );
}

export default App;
