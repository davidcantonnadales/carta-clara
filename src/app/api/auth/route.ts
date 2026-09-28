import { NextRequest, NextResponse } from "next/server";
import { randomBytes, randomUUID } from "node:crypto";
import {
  db,
  origin,
  body,
  limit,
  hash,
  passwordHash,
  safeEqual,
  session,
  logout,
  user,
  baseUrl,
  failure,
  HttpError,
  type User,
} from "@/lib/server";
export const runtime = "nodejs";
export async function GET(req: NextRequest) {
  const u = user(req);
  return NextResponse.json(
    {
      authenticated: !!u,
      email: u?.email || null,
      aiConfigured: !!process.env.GEMINI_API_KEY,
      signup:
        process.env.ENABLE_SIGNUP === "true" ||
        (["127.0.0.1", "localhost", "[::1]"].includes(
          new URL(baseUrl()).hostname,
        ) &&
          process.env.ENABLE_SIGNUP !== "false"),
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
export async function POST(req: NextRequest) {
  try {
    origin(req);
    limit("auth-global", 60, 15 * 60_000);
    const data = await body(req, 3000);
    if (
      typeof data.email !== "string" ||
      !/^\S+@\S+\.\S+$/.test(data.email) ||
      data.email.length > 180 ||
      typeof data.password !== "string" ||
      data.password.length < 12 ||
      data.password.length > 128
    )
      throw new HttpError(
        400,
        "Indica un correo válido y una contraseña de 12–128 caracteres",
      );
    const email = data.email.toLowerCase().trim();
    limit("login:" + hash(email), 10, 15 * 60_000);
    if (data.action === "register") {
      const local = ["127.0.0.1", "localhost", "[::1]"].includes(
        new URL(baseUrl()).hostname,
      );
      if (
        process.env.ENABLE_SIGNUP !== "true" &&
        (!local || process.env.ENABLE_SIGNUP === "false")
      )
        throw new HttpError(
          403,
          "El registro está cerrado en esta instalación",
        );
      const salt = randomBytes(16).toString("hex"),
        id = randomUUID(),
        pass = await passwordHash(data.password, salt);
      try {
        db()
          .prepare("INSERT INTO users VALUES(?,?,?,?)")
          .run(id, email, pass, salt);
      } catch {
        throw new HttpError(
          409,
          "No se ha podido crear la cuenta con ese correo",
        );
      }
      return session(id);
    }
    const u = db().prepare("SELECT * FROM users WHERE email=?").get(email) as
      User | undefined;
    const calculated = await passwordHash(
      data.password,
      u?.salt || "absent-user-dummy-salt",
    );
    if (!u || !safeEqual(calculated, u.password))
      throw new HttpError(401, "Correo o contraseña incorrectos");
    return session(u.id);
  } catch (e) {
    return failure(e);
  }
}
export async function DELETE(req: NextRequest) {
  try {
    origin(req);
    return logout(req);
  } catch (e) {
    return failure(e);
  }
}
