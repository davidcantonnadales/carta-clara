export default function Home() {
  return (
    <main id="contenido">
      <section className="hero hero-split">
        <div>
          <p className="eyebrow">TU CARTA. TU RESTAURANTE.</p>
          <h1>
            Menos papel.
            <br />
            Más sobremesa.
          </h1>
          <p className="lead">
            Una carta que puedes cambiar cuando cambia tu cocina. Platos,
            precios y un QR para cada mesa.
          </p>
          <div className="actions">
            <a className="button" href="/admin">
              Crear mi carta →
            </a>
            <a className="button secondary" href="/demo">
              Ver un ejemplo
            </a>
          </div>
          <p className="tiny">
            Software abierto · administración propia · sin comisión por plato
          </p>
        </div>
        <div className="visual">
          <div className="paper">
            <p className="eyebrow">LA MESA DEL SUR</p>
            <h3>
              Cocina de aquí.
              <br />
              Para quedarte.
            </h3>
            <div className="row">
              <span>Salmorejo de la casa</span>
              <strong>6,50 €</strong>
            </div>
            <div className="row">
              <span>Arroz de verduras</span>
              <strong>12,50 €</strong>
            </div>
            <div className="row">
              <span>Tarta de queso</span>
              <strong>5,00 €</strong>
            </div>
            <p className="tiny">Carta ficticia de ejemplo</p>
          </div>
        </div>
      </section>
      <div className="grid">
        <article className="card">
          <span className="symbol">▤</span>
          <h2>Tu menú, al día.</h2>
          <p>
            Crea categorías, cambia precios y oculta platos agotados desde el
            panel.
          </p>
        </article>
        <article className="card">
          <span className="symbol">▦</span>
          <h2>Un QR de verdad.</h2>
          <p>
            Descarga el código de tu carta. Conserva la misma dirección para
            actualizar sin reimprimir.
          </p>
        </article>
        <article className="card">
          <span className="symbol">✦</span>
          <h2>De la foto al borrador.</h2>
          <p>
            Con una clave de Gemini configurada, extrae los platos. Revisa
            precios y nombres antes de incorporarlos.
          </p>
        </article>
      </div>
      <section className="panel" style={{ marginTop: 35 }}>
        <p className="eyebrow">EDICIÓN ABIERTA</p>
        <h2>La tecnología también puede sentarse a la mesa.</h2>
        <p>
          Esta edición incluye cuentas separadas por restaurante, almacenamiento
          SQLite y generación de QR. Puedes ejecutarla en tu equipo. El
          alojamiento y las llamadas opcionales a Gemini tienen sus propias
          condiciones y costes.
        </p>
        <a href="/admin">Abrir el panel →</a>
      </section>
    </main>
  );
}
