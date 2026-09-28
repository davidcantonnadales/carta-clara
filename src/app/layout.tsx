import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "Carta Clara · edición abierta",
  description: "Una aplicación abierta y configurable, de David Cantón.",
  icons: { icon: "/logo.svg" },
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body style={{ "--accent": "#116650" } as React.CSSProperties}>
        <a className="skip" href="#contenido">
          Saltar al contenido
        </a>
        <header>
          <a className="brand" href="/">
            <img src="/logo.svg" alt="" />
            Carta Clara
          </a>
          <nav>
            <a href="/demo">Ver ejemplo</a>
            <a href="/admin">Administración</a>
          </nav>
        </header>
        {children}
        <footer>
          <span>Carta Clara · Edición abierta · David Cantón</span>
          <a href="https://github.com/davidcantonnadales/carta-clara">
            Código y documentación ↗
          </a>
        </footer>
      </body>
    </html>
  );
}
