import LimiteError from "../../src/components/LimiteError.jsx";
import { CLAVE_TIENDA } from "../../src/datos/almacenamiento.js";
import { crearVista } from "../ayudas/renderizar.jsx";

describe("Recuperación ante errores de pantalla", () => {
  const vista = crearVista();

  it("muestra una salida para reintentar y conserva los datos guardados", async () => {
    function PantallaConError() {
      throw new Error("Error de prueba");
    }
    localStorage.setItem(CLAVE_TIENDA, "respaldo-de-prueba");
    spyOn(console, "error");
    await vista.mostrar(
      <LimiteError>
        <PantallaConError />
      </LimiteError>,
    );
    expect(vista.contenedor.textContent).toContain(
      "No pudimos abrir la tienda",
    );
    expect(vista.contenedor.querySelector("button").textContent).toBe(
      "Volver a intentar",
    );
    expect(localStorage.getItem(CLAVE_TIENDA)).toBe("respaldo-de-prueba");
  });
});
