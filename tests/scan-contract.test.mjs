import { test } from "node:test";
import assert from "node:assert/strict";
import { scanImage } from "../src/lib/scan.mjs";
test("SDK serializa la imagen y el esquema; precio incierto queda null (proveedor simulado)", async () => {
  const original = globalThis.fetch,
    key = process.env.GEMINI_API_KEY;
  process.env.GEMINI_API_KEY = "local-test-not-a-real-key";
  let payload;
  globalThis.fetch = async (input, options) => {
    assert.match(
      String(input),
      /^https:\/\/generativelanguage.googleapis.com\//,
    );
    payload = JSON.parse(options.body);
    return new Response(
      JSON.stringify({
        candidates: [
          {
            content: {
              role: "model",
              parts: [
                {
                  text: JSON.stringify({
                    items: [
                      {
                        category: "Cocina",
                        name: "Plato de prueba",
                        description: "",
                        price: null,
                      },
                    ],
                  }),
                },
              ],
            },
            finishReason: "STOP",
          },
        ],
      }),
      { headers: { "Content-Type": "application/json" } },
    );
  };
  try {
    const dishes = await scanImage(Buffer.from("fixture-bytes"));
    assert.equal(dishes[0].price, null);
    assert.ok(payload.generationConfig.responseJsonSchema);
    assert.equal(payload.generationConfig.responseMimeType, "application/json");
    assert.equal(
      payload.contents[0].parts[1].inlineData.mimeType,
      "image/jpeg",
    );
    assert.equal(
      payload.contents[0].parts[1].inlineData.data,
      Buffer.from("fixture-bytes").toString("base64"),
    );
  } finally {
    globalThis.fetch = original;
    if (key === undefined) delete process.env.GEMINI_API_KEY;
    else process.env.GEMINI_API_KEY = key;
  }
});
