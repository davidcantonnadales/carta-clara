import { test } from "node:test";
import assert from "node:assert/strict";
import QRCode from "qrcode";
import sharp from "sharp";
import jsQR from "jsqr";
test("el SVG QR se decodifica a la dirección exacta de la carta", async () => {
  const url = "https://carta.example/mi-restaurante";
  const svg = await QRCode.toString(url, {
    type: "svg",
    errorCorrectionLevel: "M",
    margin: 4,
    width: 500,
  });
  const { data, info } = await sharp(Buffer.from(svg))
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const result = jsQR(new Uint8ClampedArray(data), info.width, info.height);
  assert.equal(result?.data, url);
});
