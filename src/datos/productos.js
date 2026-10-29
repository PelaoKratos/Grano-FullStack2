import imagenColombia from "../assets/colombia.svg";
import imagenEtiopia from "../assets/etiopia.svg";
import imagenBlend from "../assets/blend.svg";
import imagenDripper from "../assets/dripper.svg";
import imagenPrensa from "../assets/prensa.svg";
import imagenTaza from "../assets/taza.svg";

export const productos = [
  {
    id: "colombia",
    stock: 12,
    critico: 3,
    nombre: "Origen Colombia",
    categoria: "Café en grano",
    notas: "Cacao y caramelo",
    descripcion: "Notas de cacao y caramelo.",
    detalle:
      "Café de tueste medio, dulce y equilibrado. Bolsa de 250 g para acompañar tus mañanas.",
    precio: 12990,
    imagen: imagenColombia,
  },
  {
    id: "etiopia",
    stock: 8,
    critico: 2,
    nombre: "Origen Etiopía",
    categoria: "Café en grano",
    notas: "Flores y cítricos",
    descripcion: "Aroma floral y notas cítricas.",
    detalle:
      "Café de aroma floral y perfil frutal. Tueste claro, en una bolsa de 250 g.",
    precio: 14990,
    imagen: imagenEtiopia,
  },
  {
    id: "blend",
    stock: 15,
    critico: 3,
    nombre: "Blend de la casa",
    categoria: "Café en grano",
    notas: "Chocolate y avellanas",
    descripcion: "Una mezcla dulce para todos los días.",
    detalle:
      "Nuestra mezcla para todos los días. Tueste medio y cuerpo redondo. Bolsa de 250 g.",
    precio: 11990,
    imagen: imagenBlend,
  },
  {
    id: "dripper",
    stock: 6,
    critico: 2,
    nombre: "Dripper cerámico",
    categoria: "Métodos",
    descripcion: "Una pausa, una taza.",
    detalle:
      "Filtro de cerámica para preparar una o dos tazas. No incluye filtros de papel.",
    precio: 18990,
    imagen: imagenDripper,
  },
  {
    id: "prensa",
    stock: 5,
    critico: 2,
    nombre: "Prensa francesa",
    categoria: "Métodos",
    descripcion: "600 ml para compartir.",
    detalle:
      "Prensa de vidrio con filtro de acero. Una forma sencilla de preparar café por inmersión.",
    precio: 24990,
    imagen: imagenPrensa,
  },
  {
    id: "taza",
    stock: 10,
    critico: 3,
    nombre: "Taza de cerámica",
    categoria: "Accesorios",
    descripcion: "Tu compañera de cada mañana.",
    detalle: "Taza de cerámica color arena, con capacidad de 250 ml.",
    precio: 8990,
    imagen: imagenTaza,
  },
];
