import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "MIMS — Deal pricing & negotiation",
    short_name: "MIMS",
    description: "Pricing and deal-prep support for creative freelancers.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    display_override: ["standalone", "browser"],
    background_color: "#0B0B0F",
    theme_color: "#0B0B0F",
    categories: ["business", "productivity", "finance"],
    icons: [
      {
        src: "/mims-icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/mims-icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
  };
}
