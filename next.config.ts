import type { NextConfig } from "next";

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
};

export default nextConfig;
