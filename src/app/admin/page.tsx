"use client";
import { useEffect, useState } from "react";
import { empty, sample, type Menu, type Dish, money } from "@/lib/menu";
export default function Admin() {
  const [auth, setAuth] = useState(false),
    [loaded, setLoaded] = useState(false),
    [signup, setSignup] = useState(false),
    [register, setRegister] = useState(false),
    [ai, setAi] = useState(false),
    [menu, setMenu] = useState<Menu>(empty),
    [saved, setSaved] = useState(""),
    [tab, setTab] = useState("menu"),
    [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false),
    [draft, setDraft] = useState<Dish[]>([]),
    [scanFile, setScanFile] = useState<File | null>(null),
    [preview, setPreview] = useState("");
  async function refresh() {
    const r = await fetch("/api/auth"),
      d = await r.json();
    setAuth(d.authenticated);
    setSignup(d.signup);
    setAi(d.aiConfigured);
    if (d.authenticated) {
      const m = await (await fetch("/api/menu")).json();
      setMenu(m);
      setSaved(m.slug);
    }
    setLoaded(true);
  }
  useEffect(() => {
    refresh();
  }, []);
  useEffect(() => {
    if (!scanFile) {
      setPreview("");
      return;
    }
    const url = URL.createObjectURL(scanFile);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [scanFile]);
  async function login(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setMessage("");
    const data = Object.fromEntries(new FormData(e.currentTarget));
    try {
      const r = await fetch("/api/auth", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...data,
            action: register ? "register" : "login",
          }),
        }),
        d = await r.json();
      if (!r.ok) throw Error(d.error);
      await refresh();
    } catch (e) {
      setMessage((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function save() {
    setBusy(true);
    try {
      const r = await fetch("/api/menu", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(menu),
        }),
        d = await r.json();
      if (!r.ok) throw Error(d.error);
      setSaved(d.slug);
      setMessage(
        "Carta guardada. La página pública de esta instalación ya muestra los cambios.",
      );
    } catch (e) {
      setMessage((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  function update(id: string, patch: Partial<Dish>, isDraft = false) {
    const change = (items: Dish[]) =>
      items.map((d) => (d.id === id ? { ...d, ...patch } : d));
    if (isDraft) setDraft(change);
    else setMenu((m) => ({ ...m, items: change(m.items) }));
  }
  async function scan() {
    if (!scanFile) return;
    setBusy(true);
    setMessage("Leyendo la foto con Gemini…");
    setDraft([]);
    try {
      if (scanFile.size > 5 * 1024 * 1024) throw Error("Máximo 5 MB");
      const r = await fetch("/api/scan", {
          method: "POST",
          headers: { "Content-Type": scanFile.type },
          body: scanFile,
        }),
        d = await r.json();
      if (!r.ok) throw Error(d.error);
      setDraft(d.items.map((i: Dish) => ({ ...i, id: crypto.randomUUID() })));
      setMessage(
        "Borrador recibido de Gemini. Revisa todos los campos; aún no se ha guardado ningún plato.",
      );
    } catch (e) {
      setMessage((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  function dishEditor(d: Dish, isDraft = false) {
    return (
      <article className="panel stack" key={d.id}>
        <div className="fields">
          <label>
            Plato
            <input
              value={d.name}
              maxLength={100}
              onChange={(e) => update(d.id, { name: e.target.value }, isDraft)}
            />
          </label>
          <label>
            Categoría
            <input
              value={d.category}
              maxLength={60}
              onChange={(e) =>
                update(d.id, { category: e.target.value }, isDraft)
              }
            />
          </label>
          <label>
            Precio (€)
            <input
              type="number"
              min="0"
              max="10000"
              step="0.01"
              required
              value={d.price ?? ""}
              placeholder="Revisar precio"
              onChange={(e) =>
                update(
                  d.id,
                  {
                    price:
                      e.target.value === "" ? null : Number(e.target.value),
                  },
                  isDraft,
                )
              }
            />
          </label>
          <label>
            Disponibilidad
            <select
              value={d.available ? "yes" : "no"}
              onChange={(e) =>
                update(d.id, { available: e.target.value === "yes" }, isDraft)
              }
            >
              <option value="yes">Disponible</option>
              <option value="no">Oculto / agotado</option>
            </select>
          </label>
        </div>
        <label>
          Descripción
          <textarea
            value={d.description}
            maxLength={400}
            onChange={(e) =>
              update(d.id, { description: e.target.value }, isDraft)
            }
          />
        </label>
        <button
          className="danger"
          onClick={() =>
            isDraft
              ? setDraft((x) => x.filter((i) => i.id !== d.id))
              : setMenu((m) => ({
                  ...m,
                  items: m.items.filter((i) => i.id !== d.id),
                }))
          }
        >
          Eliminar {d.name || "plato"}
        </button>
      </article>
    );
  }
  return (
    <main id="contenido">
      <p className="eyebrow">CARTA CLARA / TU PANEL</p>
      <h1>
        {auth
          ? "La cocina cambia.\nTu carta también."
          : "Una mesa para tus ideas."}
      </h1>
      {!loaded ? (
        <p>Cargando…</p>
      ) : !auth ? (
        <form className="panel auth stack" onSubmit={login}>
          <h2>
            {register
              ? "Crear cuenta de restaurante"
              : "Entrar en tu restaurante"}
          </h2>
          <label>
            Correo
            <input
              name="email"
              type="email"
              required
              maxLength={180}
              autoComplete="username"
            />
          </label>
          <label>
            Contraseña · mínimo 12 caracteres
            <input
              name="password"
              type="password"
              required
              minLength={12}
              maxLength={128}
              autoComplete={register ? "new-password" : "current-password"}
            />
          </label>
          <button disabled={busy}>
            {register ? "Crear cuenta" : "Entrar"}
          </button>
          {signup && (
            <button
              type="button"
              className="secondary"
              onClick={() => setRegister((v) => !v)}
            >
              {register ? "Ya tengo cuenta" : "Crear una cuenta"}
            </button>
          )}
          <p className="tiny">
            El registro es local a esta instalación. La edición inicial no envía
            correos de verificación ni recupera contraseñas por email; utiliza
            datos ficticios al probar.
          </p>
          <p role="status">{message}</p>
        </form>
      ) : (
        <>
          <div className="row">
            <p>
              {menu.items.length} platos ·{" "}
              {menu.items.filter((i) => i.available).length} disponibles
            </p>
            <button
              className="secondary"
              onClick={async () => {
                await fetch("/api/auth", { method: "DELETE" });
                setAuth(false);
                setMenu(empty);
                setMessage("");
              }}
            >
              Cerrar sesión
            </button>
          </div>
          <div className="tabs">
            {[
              ["menu", "Platos"],
              ["settings", "Restaurante"],
              ["scan", "Leer foto con IA"],
              ["qr", "Tu QR"],
            ].map(([id, label]) => (
              <button
                aria-pressed={tab === id}
                key={id}
                onClick={() => setTab(id)}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="notice">
            Los cambios del editor solo se publican en esta instalación al
            pulsar Guardar carta. Comprueba nombres, precios y disponibilidad.
          </div>
          <p role="status" className="status">
            {message}
          </p>
          {tab === "settings" && (
            <section className="panel stack">
              <label>
                Nombre del restaurante
                <input
                  maxLength={100}
                  value={menu.name}
                  onChange={(e) => setMenu({ ...menu, name: e.target.value })}
                />
              </label>
              <label>
                Identificador de la URL
                <input
                  value={menu.slug}
                  maxLength={40}
                  placeholder="mi-restaurante"
                  onChange={(e) =>
                    setMenu({ ...menu, slug: e.target.value.toLowerCase() })
                  }
                />
              </label>
              <p className="tiny">
                3–40 letras minúsculas, números o guiones. Si lo cambias, los QR
                antiguos dejarán de funcionar.
              </p>
              <label>
                Descripción
                <textarea
                  maxLength={400}
                  value={menu.description}
                  onChange={(e) =>
                    setMenu({ ...menu, description: e.target.value })
                  }
                />
              </label>
              <label>
                Dirección o información de ubicación
                <input
                  maxLength={200}
                  value={menu.address}
                  onChange={(e) =>
                    setMenu({ ...menu, address: e.target.value })
                  }
                />
              </label>
            </section>
          )}
          {tab === "menu" && (
            <>
              <div className="actions" style={{ margin: "20px 0" }}>
                <button
                  onClick={() =>
                    setMenu((m) => ({
                      ...m,
                      items: [
                        ...m.items,
                        {
                          id: crypto.randomUUID(),
                          category: "Nuestra cocina",
                          name: "",
                          description: "",
                          price: null,
                          available: true,
                        },
                      ],
                    }))
                  }
                >
                  + Añadir plato
                </button>
                {!menu.items.length && (
                  <button
                    className="secondary"
                    onClick={() =>
                      setMenu({ ...sample, slug: "mi-restaurante" })
                    }
                  >
                    Cargar carta de ejemplo
                  </button>
                )}
              </div>
              <div className="items">
                {menu.items.map((d) => dishEditor(d))}
              </div>
              {!menu.items.length && (
                <p className="empty">
                  Tu carta está en blanco. Añade el primer plato o carga el
                  ejemplo.
                </p>
              )}
            </>
          )}
          {tab === "scan" && (
            <section className="stack">
              <div className="panel stack">
                <h2>Una foto. Un borrador para revisar.</h2>
                <p>
                  La imagen se enviará a Google Gemini al pulsar Analizar.
                  Utiliza únicamente una carta sin datos personales. La IA puede
                  equivocarse: no confirma ingredientes ni alérgenos.
                </p>
                {!ai && (
                  <p className="notice">
                    Gemini no está configurado. Añade GEMINI_API_KEY en el
                    servidor y reinícialo. Puedes seguir editando a mano.
                  </p>
                )}
                <label>
                  Foto de la carta · JPEG, PNG o WebP · 5 MB
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(e) => setScanFile(e.target.files?.[0] || null)}
                  />
                </label>
                {preview && (
                  <img
                    className="preview-image"
                    src={preview}
                    alt="Foto seleccionada de la carta, antes de enviarla"
                  />
                )}
                <button disabled={!ai || !scanFile || busy} onClick={scan}>
                  {busy ? "Analizando…" : "Analizar con Gemini"}
                </button>
              </div>
              {draft.length > 0 && (
                <>
                  <h2>Revisa el borrador · {draft.length} platos</h2>
                  {draft.map((d) => dishEditor(d, true))}
                  <button
                    disabled={draft.some(
                      (d) =>
                        d.price === null ||
                        !d.name.trim() ||
                        !d.category.trim(),
                    )}
                    onClick={() => {
                      setMenu((m) => ({ ...m, items: [...m.items, ...draft] }));
                      setDraft([]);
                      setTab("menu");
                      setMessage(
                        "Platos incorporados al editor. Pulsa Guardar carta cuando hayas terminado de revisar.",
                      );
                    }}
                  >
                    Incorporar los platos revisados
                  </button>
                  <button className="secondary" onClick={() => setDraft([])}>
                    Descartar borrador
                  </button>
                </>
              )}
            </section>
          )}
          {tab === "qr" && (
            <section className="panel">
              {saved ? (
                <>
                  <h2>La dirección de tu restaurante</h2>
                  <p>
                    <a href={"/" + saved} target="_blank" rel="noreferrer">
                      Abrir carta /{saved} ↗
                    </a>
                  </p>
                  <img
                    className="qr"
                    src={"/api/qr/" + saved}
                    alt="Código QR de la carta guardada"
                  />
                  <p>
                    <a
                      className="button"
                      href={"/api/qr/" + saved + "?download=1"}
                    >
                      Descargar QR SVG
                    </a>
                  </p>
                  <p className="tiny">
                    En localhost, el QR solo abre la carta en el equipo que
                    ejecuta el servidor. Para clientes reales configura APP_URL
                    con tu dominio HTTPS y aloja la aplicación.
                  </p>
                </>
              ) : (
                <p>
                  Guarda la carta con un identificador antes de generar su QR.
                </p>
              )}
            </section>
          )}
          <div className="actions" style={{ marginTop: 28 }}>
            <button disabled={busy} onClick={save}>
              Guardar carta
            </button>
            {saved && (
              <a
                className="button secondary"
                href={"/" + saved}
                target="_blank"
                rel="noreferrer"
              >
                Ver carta guardada ↗
              </a>
            )}
          </div>
        </>
      )}
    </main>
  );
}
