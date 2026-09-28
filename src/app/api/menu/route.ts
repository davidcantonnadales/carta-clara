import { NextRequest, NextResponse } from "next/server";
import {
  requireUser,
  origin,
  body,
  document,
  saveDocument,
  db,
  failure,
  HttpError,
} from "@/lib/server";
import { empty, type Menu } from "@/lib/menu";
import { validateMenu } from "@/lib/validation.mjs";
export const runtime = "nodejs";
export async function GET(req: NextRequest) {
  try {
    const u = requireUser(req);
    return NextResponse.json(document<Menu>("menu:" + u.id)?.value || empty, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (e) {
    return failure(e);
  }
}
export async function PUT(req: NextRequest) {
  try {
    origin(req);
    const u = requireUser(req);
    let data;
    try {
      data = validateMenu(await body(req, 200_000));
    } catch (e) {
      if (e instanceof HttpError) throw e;
      throw new HttpError(400, (e as Error).message);
    }
    const owner = db()
      .prepare("SELECT owner FROM slugs WHERE slug=?")
      .get(data.slug) as { owner: string } | undefined;
    if (owner && owner.owner !== u.id)
      throw new HttpError(
        409,
        "Ese identificador ya pertenece a otro restaurante",
      );
    db().exec("BEGIN IMMEDIATE");
    try {
      db().prepare("DELETE FROM slugs WHERE owner=?").run(u.id);
      db().prepare("INSERT INTO slugs VALUES(?,?)").run(data.slug, u.id);
      saveDocument("menu:" + u.id, u.id, data);
      db().exec("COMMIT");
    } catch (e) {
      db().exec("ROLLBACK");
      throw e;
    }
    return NextResponse.json({ ok: true, slug: data.slug });
  } catch (e) {
    return failure(e);
  }
}
