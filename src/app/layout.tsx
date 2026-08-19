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

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || "Creaciones Emaleli";

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: APP_NAME,
    template: `%s | ${APP_NAME}`,
  },
  description:
    "Productos personalizados: camisetas, tazas, termos y más, hechos a tu medida. Envíos a todo Colombia.",
  icons: {
    icon: "/brand/logo-emaleli.png",
  },
  openGraph: {
    type: "website",
    locale: "es_CO",
    siteName: APP_NAME,
    title: APP_NAME,
    description:
      "Productos personalizados: camisetas, tazas, termos y más, hechos a tu medida. Envíos a todo Colombia.",
    images: ["/brand/logo-emaleli.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: APP_NAME,
    description:
      "Productos personalizados: camisetas, tazas, termos y más, hechos a tu medida.",
    images: ["/brand/logo-emaleli.png"],
  },
  robots: {
    index: true,
    follow: true,
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
