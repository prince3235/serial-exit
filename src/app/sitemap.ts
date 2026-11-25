import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

/** Single-page site → one canonical URL. (Hash fragments are ignored by search engines, so they are not listed.) */
const BUILD_DATE = new Date();

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: SITE_URL, lastModified: BUILD_DATE, changeFrequency: "monthly", priority: 1 },
    { url: `${SITE_URL}/privacy`, lastModified: BUILD_DATE, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/terms`, lastModified: BUILD_DATE, changeFrequency: "yearly", priority: 0.3 },
  ];
}
