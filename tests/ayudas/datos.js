import { productos } from "../../src/datos/productos.js";

export const comprador = {
  nombre: "Cliente",
  correo: "comprador@duocuc.cl",
  telefono: "+56912345678",
  direccion: "Calle Café 123",
  comuna: "Santiago",
  region: "Metropolitana",
};
export const carrito = [{ ...productos[0], cantidad: 2 }];
