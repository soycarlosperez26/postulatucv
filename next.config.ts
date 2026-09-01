import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["pdf-parse"],
  experimental: {
    serverActions: {
      // El default es 1MB; un CV en PDF fácilmente lo supera.
      bodySizeLimit: "10mb",
    },
  },
};

export default nextConfig;
