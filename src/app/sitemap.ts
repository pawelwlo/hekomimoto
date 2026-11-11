import type { MetadataRoute } from "next";
import { siteConfig } from "@/content/site";

const paths = [
  "/",
  "/gallery",
  "/about",
  "/faq",
  "/contact",
  "/services/pdr",
  "/services/hail",
  "/services/parking-dents",
  "/services/vandalism",
  "/services/mobile",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];

  for (const path of paths) {
    const plUrl = `${siteConfig.url}${path === "/" ? "" : path}`;
    const enUrl = `${siteConfig.url}/en${path === "/" ? "" : path}`;
    entries.push({
      url: plUrl,
      lastModified: new Date(),
      alternates: {
        languages: {
          pl: plUrl,
          en: enUrl,
        },
      },
    });
    entries.push({
      url: enUrl,
      lastModified: new Date(),
      alternates: {
        languages: {
          pl: plUrl,
          en: enUrl,
        },
      },
    });
  }

  return entries;
}
