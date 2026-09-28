import { notFound } from "next/navigation";
import { publicMenu } from "@/lib/public-menu";
import { money } from "@/lib/menu";
export const dynamic = "force-dynamic";
export default async function Restaurant({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params,
    menu = publicMenu(slug);
  if (!menu) notFound();
  const dishes = menu.items.filter((d) => d.available);
  return (
    <main id="contenido" className="restaurant">
      <section className="hero">
        <p className="eyebrow">BIENVENIDOS A NUESTRA MESA</p>
        <h1 style={{ fontFamily: "Georgia,serif", fontWeight: 500 }}>
          {menu.name}
        </h1>
        <p className="lead">{menu.description}</p>
        <p>{menu.address}</p>
        {slug === "demo" && (
          <p className="notice">
            Carta de demostración. Restaurante y platos de ejemplo; no admite
            pedidos.
          </p>
        )}
      </section>
      <nav className="tabs">
        {[...new Set(dishes.map((d) => d.category))].map((c, i) => (
          <a className="button secondary" key={c} href={"#categoria-" + i}>
            {c}
          </a>
        ))}
      </nav>
      <div className="layout">
        <div>
          {[...new Set(dishes.map((d) => d.category))].map((c, i) => (
            <section
              key={c}
              id={"categoria-" + i}
              className="panel"
              style={{ marginBottom: 24 }}
            >
              <p className="eyebrow">NUESTRA CARTA</p>
              <h2>{c}</h2>
              {dishes
                .filter((d) => d.category === c)
                .map((d) => (
                  <article className="item" key={d.id}>
                    <div className="row">
                      <h3>{d.name}</h3>
                      <strong style={{ whiteSpace: "nowrap" }}>
                        {d.price === null ? "Consultar" : money(d.price)}
                      </strong>
                    </div>
                    <p className="muted">{d.description}</p>
                  </article>
                ))}
            </section>
          ))}
          {!dishes.length && <p>Todavía no hay platos disponibles.</p>}
        </div>
        <aside className="panel">
          <span className="eyebrow">LA CARTA, A MANO</span>
          <h2>Escanea y comparte.</h2>
          <img
            className="qr"
            src={"/api/qr/" + slug}
            alt={"Código QR que abre la carta de " + menu.name}
          />
          <p className="tiny">
            Consulta ingredientes y alérgenos directamente con el personal. Esta
            carta no sustituye esa información.
          </p>
          <a href={"/api/qr/" + slug + "?download=1"}>Descargar QR en SVG ↓</a>
        </aside>
      </div>
    </main>
  );
}
