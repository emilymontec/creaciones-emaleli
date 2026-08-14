import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

/**
 * Fuente puente: Plus Jakarta Sans (Google Fonts) se usa como fallback real
 * y descargable mientras se incorporan los archivos .woff2 de las
 * tipografías de marca (Heroik / Qlassik) en /public/fonts.
 * Ver definición de @font-face en globals.css.
 */
const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-bridge",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Creaciones Emaleli",
    template: "%s | Creaciones Emaleli",
  },
  description:
    "Plataforma e-commerce a medida: catálogo, personalización de productos, pedidos y producción.",
  icons: {
    icon: "/brand/logo-emaleli.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={plusJakarta.variable}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
