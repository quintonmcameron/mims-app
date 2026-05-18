import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "MIMS",
    short_name: "MIMS",
    description: "Pricing and deal-prep support for creative freelancers.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#0B0B0F",
    theme_color: "#0B0B0F",
    icons: [
      {
        src: "/mims-icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
  };
}
