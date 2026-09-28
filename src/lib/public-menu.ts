import { db, document } from "./server";
import { sample, type Menu } from "./menu";
export function publicMenu(slug: string) {
  if (slug === "demo") return sample;
  const row = db().prepare("SELECT owner FROM slugs WHERE slug=?").get(slug) as
    { owner: string } | undefined;
  return row ? document<Menu>("menu:" + row.owner)?.value || null : null;
}
