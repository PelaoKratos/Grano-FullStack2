import { esTelefonoValido } from "../../src/datos/telefono.js";
import { operar } from "../../src/datos/operaciones.js";
import { cargarEstado } from "../../src/datos/almacenamiento.js";

describe("Validación de teléfonos", () => {
  function preparar(rol = "comprador") {
    const estado = cargarEstado({ getItem: () => null }, []);
    estado.sesion = estado.usuarios.find((u) => u.rol === rol);
    return estado;
  }

  it("acepta números nacionales e internacionales y separadores habituales", () => {
    for (const numero of [
      "912345678",
      "223456789",
      "+56912345678",
      "56912345678",
      "+56 (9) 1234-5678",
      " 9 1234 5678 ",
    ]) {
      expect(esTelefonoValido(numero)).withContext(numero).toBeTrue();
    }
  });

  it("rechaza letras, números incompletos, prefijos incorrectos y signos fuera de lugar", () => {
    for (const numero of [
      undefined,
      "",
      "abc",
      "123",
      "91234567",
      "9123456789",
      "+54912345678",
      "012345678",
      "9+12345678",
      "9.1234.5678",
      "++56912345678",
    ]) {
      expect(esTelefonoValido(numero)).withContext(String(numero)).toBeFalse();
    }
  });

  it("rechaza un teléfono inválido en el perfil sin modificar el estado", () => {
    const estado = preparar();
    const antes = structuredClone(estado);
    const respuesta = operar(estado, {
      tipo: "PERFIL",
      usuario: { ...estado.sesion, telefono: "abc" },
    });
    expect(respuesta.resultado).toBeFalse();
    expect(respuesta.estado).toEqual(antes);
  });

  it("permite omitir el teléfono del perfil o guardar un formato válido", () => {
    const estado = preparar();
    for (const telefono of ["", "+56 9 1234 5678"]) {
      const respuesta = operar(estado, {
        tipo: "PERFIL",
        usuario: { ...estado.sesion, telefono },
      });
      expect(respuesta.resultado).toBeTrue();
      expect(
        respuesta.estado.usuarios.find((u) => u.correo === estado.sesion.correo)
          .telefono,
      ).toBe(telefono);
    }
  });

  it("impide que administración guarde un teléfono inválido en una cuenta ordinaria", () => {
    const estado = preparar("admin");
    const usuario = {
      nombre: "Cliente",
      correo: "cliente@example.test",
      rol: "comprador",
      activo: true,
      telefono: "912345678",
    };
    estado.usuarios.push(usuario);
    const respuesta = operar(estado, {
      tipo: "USUARIO_GUARDAR",
      usuario: { ...usuario, telefono: "abc" },
    });
    expect(respuesta.resultado).toBeFalse();
    expect(respuesta.estado.usuarios.at(-1).telefono).toBe("912345678");
  });
});
