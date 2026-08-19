import type { NextConfig } from "next";
import createBundleAnalyzer from "@next/bundle-analyzer";

const withBundleAnalyzer = createBundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

const contentSecurityPolicy = [
  "default-src 'self'",
  // 'unsafe-inline' en script-src es necesario por los scripts de
  // hidratación/inline que inyecta Next.js; 'unsafe-eval' se evita.
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  // Imágenes propias, de Supabase Storage y data: URIs (placeholders/blur).
  "img-src 'self' data: blob: https://*.supabase.co",
  "font-src 'self' data:",
  // Llamadas de cliente a Supabase (auth/storage) y WhatsApp.
  "connect-src 'self' https://*.supabase.co https://api.whatsapp.com",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
];

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
      {
        protocol: "http",
        hostname: "localhost",
      },
    ],
  },
  // Las subidas de avances de producción (fotos/videos) y archivos de
  // pedidos viajan por server actions. En Vercel el body de las funciones
  // está limitado a 4.5 MB (Hobby) — aquí se alinea con el máximo de
  // storage (50 MB) para que funcione donde la plataforma lo permita.
  experimental: {
    serverActions: {
      bodySizeLimit: "50mb",
    },
  },
  async headers() {
    return [
      {
        // Se aplica a toda la app; HSTS solo tiene efecto real cuando se
        // sirve por HTTPS (Vercel siempre lo hace en producción).
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default withBundleAnalyzer(nextConfig);
