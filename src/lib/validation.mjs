const text = (x, max, required = false) => {
  if (typeof x !== "string" || x.length > max || (required && !x.trim()))
    throw Error("Texto no válido");
  return x.trim();
};
export function validateMenu(data, { draft = false } = {}) {
  if (!data || typeof data !== "object") throw Error("Carta no válida");
  const slug = text(data.slug, 40, true);
  if (
    !/^[a-z0-9][a-z0-9-]{2,39}$/.test(slug) ||
    [
      "api",
      "admin",
      "demo",
      "login",
      "register",
      "public",
      "robots",
      "sitemap",
    ].includes(slug)
  )
    throw Error(
      "Identificador no válido: 3–40 letras minúsculas, números o guiones",
    );
  if (!Array.isArray(data.items) || data.items.length > 200)
    throw Error("Máximo 200 platos");
  const ids = new Set();
  const items = data.items.map((d) => {
    const id = text(d.id, 80, true);
    if (ids.has(id)) throw Error("Platos duplicados");
    ids.add(id);
    if (d.price === null && draft) {
    } else if (
      typeof d.price !== "number" ||
      !Number.isFinite(d.price) ||
      d.price < 0 ||
      d.price > 10000
    )
      throw Error("Revisa todos los precios (0–10000 €)");
    return {
      id,
      category: text(d.category, 60, true),
      name: text(d.name, 100, true),
      description: text(d.description || "", 400),
      price: d.price === null ? null : Math.round(d.price * 100) / 100,
      available: d.available !== false,
    };
  });
  return {
    name: text(data.name, 100, true),
    slug,
    description: text(data.description || "", 400),
    address: text(data.address || "", 200),
    items,
  };
}
export function validateExtraction(data) {
  if (
    !data ||
    !Array.isArray(data.items) ||
    !data.items.length ||
    data.items.length > 200
  )
    throw Error("La IA no devolvió una lista válida de platos");
  return data.items.map((d, i) => {
    if (
      d.price !== null &&
      (typeof d.price !== "number" ||
        !Number.isFinite(d.price) ||
        d.price < 0 ||
        d.price > 10000)
    )
      throw Error("Precio de IA no válido");
    return {
      id: `scan-${i}`,
      category: text(d.category, 60, true),
      name: text(d.name, 100, true),
      description: text(d.description || "", 400),
      price: d.price,
      available: true,
    };
  });
}
