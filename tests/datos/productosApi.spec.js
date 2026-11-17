import { crearProductosApi } from "../../src/servicios/productosApi.js";

describe("Servicio de productos HTTP", () => {
  let peticion;
  let responderPeticion;
  const api = crearProductosApi("http://localhost:8080/api/");
  const responder = (datos, status = 200) =>
    new Response(JSON.stringify(datos), { status });

  beforeEach(() => {
    peticion = spyOn(window, "fetch").and.callFake((url) =>
      url.endsWith("/auth/csrf")
        ? Promise.resolve(
            responder({ headerName: "X-CSRF-TOKEN", token: "token-de-prueba" }),
          )
        : responderPeticion(),
    );
  });

  it("consulta el catálogo y permite cancelar la lectura", async () => {
    responderPeticion = async () => responder([{ id: "servidor-1" }]);
    const controlador = new AbortController();
    expect(await api.listar(controlador.signal)).toEqual([
      { id: "servidor-1" },
    ]);
    expect(peticion).toHaveBeenCalledOnceWith(
      "http://localhost:8080/api/productos",
      { signal: jasmine.any(AbortSignal), credentials: "include" },
    );
  });

  it("crea con POST sin inventar un identificador", async () => {
    responderPeticion = async () =>
      responder({ id: "nuevo-java", nombre: "Café" }, 201);
    const resultado = await api.guardar({ nombre: "Café" });
    expect(resultado.id).toBe("nuevo-java");
    const [url, opciones] = peticion.calls.mostRecent().args;
    expect(url).toBe("http://localhost:8080/api/productos");
    expect(opciones.method).toBe("POST");
    expect(JSON.parse(opciones.body)).toEqual({ nombre: "Café" });
    expect(opciones.headers["Content-Type"]).toBe("application/json");
    expect(opciones.headers["X-CSRF-TOKEN"]).toBe("token-de-prueba");
    expect(opciones.credentials).toBe("include");
  });

  it("edita con PUT y codifica el ID en la dirección", async () => {
    responderPeticion = async () => responder({ id: "café / 1" });
    await api.guardar({ id: "café / 1", nombre: "Otro café" });
    const [url, opciones] = peticion.calls.mostRecent().args;
    expect(url).toContain("/caf%C3%A9%20%2F%201");
    expect(opciones.method).toBe("PUT");
    expect(JSON.parse(opciones.body).id).toBeUndefined();
  });

  it("elimina sin intentar leer JSON en una respuesta 204", async () => {
    responderPeticion = async () => new Response(null, { status: 204 });
    expect(await api.eliminar("uno")).toBeNull();
    expect(peticion.calls.mostRecent().args[1].method).toBe("DELETE");
  });

  it("muestra las validaciones de campos enviadas por Java", async () => {
    responderPeticion = async () =>
      responder(
        {
          mensaje: "Revisa los datos.",
          campos: { stock: "Debe ser positivo." },
        },
        400,
      );
    await expectAsync(api.guardar({})).toBeRejectedWithError(
      "Revisa los datos. Debe ser positivo.",
    );
  });

  it("informa un error HTTP incluso cuando el servidor no devuelve JSON", async () => {
    peticion.and.resolveTo(new Response("Error del servidor", { status: 503 }));
    await expectAsync(api.listar()).toBeRejectedWithError(
      "La API respondió con error 503.",
    );
  });

  it("rechaza una respuesta exitosa que no se puede leer", async () => {
    peticion.and.resolveTo(new Response("No es JSON"));
    await expectAsync(api.listar()).toBeRejectedWithError(/no pudimos leer/);
  });

  it("explica una conexión fallida y conserva las cancelaciones", async () => {
    peticion.and.rejectWith(new TypeError("Failed to fetch"));
    await expectAsync(api.listar()).toBeRejectedWithError(
      /No pudimos conectar/,
    );
    const cancelado = new DOMException("Cancelado", "AbortError");
    peticion.and.rejectWith(cancelado);
    await expectAsync(api.listar()).toBeRejectedWith(cancelado);
  });
});
