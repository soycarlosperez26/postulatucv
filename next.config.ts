import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["unpdf"],
  experimental: {
    serverActions: {
      // El default es 1MB; un CV en PDF fácilmente lo supera.
      bodySizeLimit: "10mb",
      // allowedOrigins permite que el dominio custom (www.postulatucv.online)
      // pase el CSRF check de Next.js. Sin esto, los POST de Server Actions
      // desde el dominio custom reciben 403.
      allowedOrigins: [
        "postulatucv.online",
        "www.postulatucv.online",
        "*.vercel.app",
      ],
    },
    // proxyClientMaxBodySize debe estar presente junto con bodySizeLimit,
    // o el proxy interno de Next.js 16 truncará silenciosamente los uploads
    // binarios mayores a 1MB (aun si bodySizeLimit lo permite).
    proxyClientMaxBodySize: "10mb",
  },
};

export default nextConfig;
