import imagenBlend from "../../../assets/blend.svg";
import imagenColombia from "../../../assets/colombia.svg";
import imagenDripper from "../../../assets/dripper.svg";
import imagenEtiopia from "../../../assets/etiopia.svg";
import imagenPrensa from "../../../assets/prensa.svg";
import imagenTaza from "../../../assets/taza.svg";

export const productos = [
  {
    id: "colombia",
    nombre: "Origen Colombia",
    categoria: "Café en grano",
    resumen: "Cacao y caramelo",
    precio: 12990,
    imagen: imagenColombia,
    pagina: "producto-colombia.html",
    destacado: true,
  },
  {
    id: "etiopia",
    nombre: "Origen Etiopía",
    categoria: "Café en grano",
    resumen: "Flores y cítricos",
    precio: 14990,
    imagen: imagenEtiopia,
    pagina: "producto-etiopia.html",
    destacado: true,
  },
  {
    id: "blend",
    nombre: "Blend de la casa",
    categoria: "Café en grano",
    resumen: "Chocolate y avellanas",
    precio: 11990,
    imagen: imagenBlend,
    pagina: "producto-blend.html",
    destacado: true,
  },
  {
    id: "dripper",
    nombre: "Dripper cerámico",
    categoria: "Métodos",
    resumen: "Una pausa, una taza",
    precio: 18990,
    imagen: imagenDripper,
    pagina: "producto-dripper.html",
    destacado: false,
  },
  {
    id: "prensa",
    nombre: "Prensa francesa",
    categoria: "Métodos",
    resumen: "600 ml para compartir",
    precio: 24990,
    imagen: imagenPrensa,
    pagina: "producto-prensa.html",
    destacado: false,
  },
  {
    id: "taza",
    nombre: "Taza de cerámica",
    categoria: "Accesorios",
    resumen: "Tu compañera de cada mañana",
    precio: 8990,
    imagen: imagenTaza,
    pagina: "producto-taza.html",
    destacado: false,
  },
];
