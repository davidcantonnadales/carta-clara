export type Dish = {
  id: string;
  category: string;
  name: string;
  description: string;
  price: number | null;
  available: boolean;
};
export type Menu = {
  name: string;
  slug: string;
  description: string;
  address: string;
  items: Dish[];
};
export const sample: Menu = {
  name: "La Mesa del Sur",
  slug: "demo",
  description: "Cocina de temporada, conversaciones largas y un sitio para ti.",
  address: "Restaurante ficticio · datos de ejemplo",
  items: [
    {
      id: "salmorejo",
      category: "Para empezar",
      name: "Salmorejo de la casa",
      description:
        "Tomate, pan y aceite de oliva. Consulta los alérgenos con el personal.",
      price: 6.5,
      available: true,
    },
    {
      id: "ensalada",
      category: "Para empezar",
      name: "Ensalada del huerto",
      description: "Verduras de temporada y vinagreta de cítricos.",
      price: 8,
      available: true,
    },
    {
      id: "arroz",
      category: "De nuestra cocina",
      name: "Arroz de verduras",
      description: "Arroz al punto con verduras y un toque de azafrán.",
      price: 12.5,
      available: true,
    },
    {
      id: "tarta",
      category: "Algo dulce",
      name: "Tarta de queso",
      description: "Horneada despacio, con fruta de temporada.",
      price: 5,
      available: true,
    },
  ],
};
export const empty: Menu = {
  name: "Mi restaurante",
  slug: "",
  description: "",
  address: "",
  items: [],
};
export const money = (n: number) =>
  new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(
    n,
  );
