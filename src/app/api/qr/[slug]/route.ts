import { NextRequest } from "next/server";
import QRCode from "qrcode";
import { baseUrl } from "@/lib/server";
import { publicMenu } from "@/lib/public-menu";
export const runtime = "nodejs";
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  if (!publicMenu(slug))
    return new Response("Carta no encontrada", { status: 404 });
  const svg = await QRCode.toString(
    baseUrl() + "/" + encodeURIComponent(slug),
    {
      type: "svg",
      errorCorrectionLevel: "M",
      margin: 4,
      width: 500,
      color: { dark: "#153d32", light: "#ffffff" },
    },
  );
  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Content-Disposition": req.nextUrl.searchParams.has("download")
        ? 'attachment; filename="carta-qr.svg"'
        : "inline",
      "Cache-Control": "no-store",
    },
  });
}
