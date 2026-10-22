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
    descripcion: "Café de tueste medio, dulce y equilibrado. Bolsa de 250 g para acompañar tus mañanas.",
    precio: 12990,
    imagen: imagenColombia,
    destacado: true,
  },
  {
    id: "etiopia",
    nombre: "Origen Etiopía",
    categoria: "Café en grano",
    resumen: "Flores y cítricos",
    descripcion: "Café de aroma floral y perfil frutal. Tueste claro, en una bolsa de 250 g.",
    precio: 14990,
    imagen: imagenEtiopia,
    destacado: true,
  },
  {
    id: "blend",
    nombre: "Blend de la casa",
    categoria: "Café en grano",
    resumen: "Chocolate y avellanas",
    descripcion: "Nuestra mezcla para todos los días. Tueste medio y cuerpo redondo. Bolsa de 250 g.",
    precio: 11990,
    imagen: imagenBlend,
    destacado: true,
  },
  {
    id: "dripper",
    nombre: "Dripper cerámico",
    categoria: "Métodos",
    resumen: "Una pausa, una taza",
    descripcion: "Filtro de cerámica para preparar una o dos tazas. No incluye filtros de papel.",
    precio: 18990,
    imagen: imagenDripper,
    destacado: false,
  },
  {
    id: "prensa",
    nombre: "Prensa francesa",
    categoria: "Métodos",
    resumen: "600 ml para compartir",
    descripcion: "Prensa de vidrio con filtro de acero. Una forma sencilla de preparar café por inmersión.",
    precio: 24990,
    imagen: imagenPrensa,
    destacado: false,
  },
  {
    id: "taza",
    nombre: "Taza de cerámica",
    categoria: "Accesorios",
    resumen: "Tu compañera de cada mañana",
    descripcion: "Taza de cerámica color arena, con capacidad de 250 ml.",
    precio: 8990,
    imagen: imagenTaza,
    destacado: false,
  },
];
