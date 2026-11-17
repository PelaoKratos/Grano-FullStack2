import { crearClienteApi } from "../../src/servicios/clienteApi.js";

describe("Espera y cancelación de la API", () => {
  let peticion;
  const api = crearClienteApi("/api", { tiempoEspera: 100 });
  beforeEach(() => {
    jasmine.clock().install();
    peticion = spyOn(window, "fetch");
  });
  afterEach(() => jasmine.clock().uninstall());

  function esperar(signal) {
    return new Promise((_, rechazar) => {
      const cancelar = () =>
        rechazar(new DOMException("Cancelado", "AbortError"));
      if (signal.aborted) cancelar();
      else signal.addEventListener("abort", cancelar, { once: true });
    });
  }

  it("termina una petición que no responde y permite volver a intentar", async () => {
    peticion.and.callFake((_, opciones) => esperar(opciones.signal));
    const resultado = expectAsync(api("/productos")).toBeRejectedWithError(
      /tardó demasiado/,
    );
    jasmine.clock().tick(101);
    await resultado;
    peticion.and.resolveTo({ status: 200, ok: true, json: async () => [] });
    expect(await api("/productos")).toEqual([]);
  });

  it("aplica el límite también si se atasca la lectura del cuerpo", async () => {
    const leer = jasmine.createSpy("json");
    peticion.and.callFake(async (_, opciones) => {
      leer.and.callFake(() => esperar(opciones.signal));
      return { status: 200, ok: true, json: leer };
    });
    const resultado = expectAsync(api("/productos")).toBeRejectedWithError(
      /tardó demasiado/,
    );
    await Promise.resolve();
    expect(leer).toHaveBeenCalled();
    jasmine.clock().tick(101);
    await resultado;
  });

  it("respeta la cancelación de la pantalla sin confundirla con un fallo de red", async () => {
    peticion.and.callFake((_, opciones) => esperar(opciones.signal));
    const controlador = new AbortController();
    const quitar = spyOn(
      controlador.signal,
      "removeEventListener",
    ).and.callThrough();
    const resultado = expectAsync(
      api("/productos", { signal: controlador.signal }),
    ).toBeRejectedWith(jasmine.objectContaining({ name: "AbortError" }));
    controlador.abort();
    await resultado;
    expect(quitar).toHaveBeenCalledWith("abort", jasmine.any(Function));
  });

  it("una petición ya cancelada no queda esperando un temporizador", async () => {
    peticion.and.callFake((_, opciones) => esperar(opciones.signal));
    const controlador = new AbortController();
    controlador.abort();
    await expectAsync(
      api("/productos", { signal: controlador.signal }),
    ).toBeRejectedWith(jasmine.objectContaining({ name: "AbortError" }));
  });

  it("limpia el temporizador al responder y conserva las cookies", async () => {
    let signal;
    peticion.and.callFake(async (_, opciones) => {
      signal = opciones.signal;
      expect(opciones.credentials).toBe("include");
      return { status: 200, ok: true, json: async () => ["listo"] };
    });
    expect(await api("/productos")).toEqual(["listo"]);
    jasmine.clock().tick(1000);
    expect(signal.aborted).toBeFalse();
  });
});
