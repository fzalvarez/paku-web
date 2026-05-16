import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/politica-de-privacidad",
        destination: "/politicas/privacidad",
        permanent: true,
      },
      {
        source: "/terminos-y-condiciones",
        destination: "/politicas/terminos-y-condiciones",
        permanent: true,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      // Fotos de mascotas desde la API (bucket S3, CDN, etc.)
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;
