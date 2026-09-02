import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/login", "/register", "/onboarding", "/dashboard"],
    },
    sitemap: "https://www.postulatucv.online/sitemap.xml",
  };
}
