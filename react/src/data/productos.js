import imagenColombia from "../assets/colombia.svg";
import imagenEtiopia from "../assets/etiopia.svg";
import imagenBlend from "../assets/blend.svg";
import imagenDripper from "../assets/dripper.svg";
import imagenPrensa from "../assets/prensa.svg";
import imagenTaza from "../assets/taza.svg";

export const productos = [
  {
    id: 1,
    nombre: "Origen Colombia",
    categoria: "Café en grano",
    descripcion: "Notas de cacao y caramelo.",
    detalle: "Café de tueste medio, dulce y equilibrado. Bolsa de 250 g.",
    precio: 12990,
    stock: 12,
    critico: 3,
    imagen: imagenColombia,
  },
  {
    id: 2,
    nombre: "Origen Etiopía",
    categoria: "Café en grano",
    descripcion: "Aroma floral y notas cítricas.",
    detalle: "Café de tueste claro y perfil frutal. Bolsa de 250 g.",
    precio: 14990,
    stock: 8,
    critico: 2,
    imagen: imagenEtiopia,
  },
  {
    id: 3,
    nombre: "Blend de la casa",
    categoria: "Café en grano",
    descripcion: "Una mezcla dulce para todos los días.",
    detalle: "Mezcla de tueste medio y cuerpo redondo. Bolsa de 250 g.",
    precio: 11990,
    stock: 15,
    critico: 3,
    imagen: imagenBlend,
  },
  {
    id: 4,
    nombre: "Dripper cerámico",
    categoria: "Métodos",
    descripcion: "Una pausa, una taza.",
    detalle: "Filtro de cerámica para preparar una o dos tazas.",
    precio: 18990,
    stock: 6,
    critico: 2,
    imagen: imagenDripper,
  },
  {
    id: 5,
    nombre: "Prensa francesa",
    categoria: "Métodos",
    descripcion: "600 ml para compartir.",
    detalle: "Prensa de vidrio con filtro de acero para preparar café por inmersión.",
    precio: 24990,
    stock: 5,
    critico: 2,
    imagen: imagenPrensa,
  },
  {
    id: 6,
    nombre: "Taza de cerámica",
    categoria: "Accesorios",
    descripcion: "Tu compañera de cada mañana.",
    detalle: "Taza color arena con capacidad para 250 ml.",
    precio: 8990,
    stock: 10,
    critico: 3,
    imagen: imagenTaza,
  },
];
