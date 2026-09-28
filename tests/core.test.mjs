import { test } from "node:test";
import assert from "node:assert/strict";
import { validateMenu, validateExtraction } from "../src/lib/validation.mjs";
const menu = {
  name: "Ejemplo",
  slug: "mi-mesa",
  description: "",
  address: "",
  items: [
    {
      id: "1",
      name: "Plato",
      category: "Cocina",
      description: "",
      price: 4.5,
      available: true,
    },
  ],
};
test("no publica un precio desconocido ni acepta monedas o valores imposibles", () => {
  for (const price of [null, NaN, Infinity, -1, 10001, "4.5"])
    assert.throws(() =>
      validateMenu({ ...menu, items: [{ ...menu.items[0], price }] }),
    );
  assert.equal(validateMenu(menu).items[0].price, 4.5);
});
test("valida slugs, tamaños y duplicados", () => {
  for (const slug of ["demo", "api", "../otro", "A B", "x"])
    assert.throws(() => validateMenu({ ...menu, slug }));
  assert.throws(() =>
    validateMenu({ ...menu, items: [...menu.items, ...menu.items] }),
  );
});
test("extracción mantiene precio null para revisión y no infiere información", () => {
  const d = validateExtraction({
    items: [
      { category: "Cocina", name: "Plato", description: "", price: null },
    ],
  });
  assert.equal(d[0].price, null);
  assert.equal(d[0].description, "");
  assert.throws(() => validateExtraction({ items: [] }));
  assert.throws(() =>
    validateExtraction({
      items: [{ name: "x", category: "x", price: "gratis" }],
    }),
  );
});
