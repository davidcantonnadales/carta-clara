import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import { origin, requireUser, limit, failure, HttpError } from "@/lib/server";
import { scanImage } from "@/lib/scan.mjs";
export const runtime = "nodejs";
export async function POST(req: NextRequest) {
  try {
    origin(req);
    const u = requireUser(req);
    if (!process.env.GEMINI_API_KEY)
      throw new HttpError(
        503,
        "Configura GEMINI_API_KEY en el servidor para activar la lectura de fotos. No se ha enviado ninguna imagen.",
      );
    limit("scan:" + u.id, 10, 86400_000);
    limit("scan-global", 50, 86400_000);
    const reader = req.body?.getReader();
    if (!reader) throw new HttpError(400, "Falta la imagen");
    const chunks: Uint8Array[] = [];
    let size = 0;
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.length;
      if (size > 5 * 1024 * 1024) {
        await reader.cancel();
        throw new HttpError(413, "Máximo 5 MB por imagen");
      }
      chunks.push(value);
    }
    const bytes = Buffer.concat(chunks);
    let image: Buffer;
    try {
      const meta = await sharp(bytes, {
        limitInputPixels: 25_000_000,
      }).metadata();
      if (!["jpeg", "png", "webp"].includes(meta.format || "")) throw Error();
      image = await sharp(bytes, { limitInputPixels: 25_000_000 })
        .rotate()
        .resize({
          width: 1800,
          height: 1800,
          fit: "inside",
          withoutEnlargement: true,
        })
        .jpeg({ quality: 90 })
        .toBuffer();
    } catch {
      throw new HttpError(
        400,
        "Utiliza una imagen JPEG, PNG o WebP válida, de hasta 25 megapíxeles",
      );
    }
    try {
      return NextResponse.json(
        {
          items: await scanImage(image),
          provider: "Gemini",
          reviewRequired: true,
        },
        { headers: { "Cache-Control": "no-store" } },
      );
    } catch {
      throw new HttpError(
        502,
        "Gemini no ha devuelto una carta válida. Comprueba modelo, clave y cuota; puedes introducirla a mano.",
      );
    }
  } catch (e) {
    return failure(e);
  }
}
