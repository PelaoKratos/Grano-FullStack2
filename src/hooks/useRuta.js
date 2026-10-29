import { useSyncExternalStore } from "react";
import { leerRuta } from "../datos/rutas.js";
const subscribe = (callback) => {
  window.addEventListener("hashchange", callback);
  return () => window.removeEventListener("hashchange", callback);
};
export const navegar = (ruta) => {
  window.location.hash = ruta;
};
export function useRuta() {
  return leerRuta(useSyncExternalStore(subscribe, () => window.location.hash));
}
