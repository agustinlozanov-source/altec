import type { MetadataRoute } from "next";
import { locales, routes } from "@/lib/i18n";
import { siteUrl } from "@/lib/site";

/** Las páginas publicadas, en los dos idiomas, enlazadas entre sí. */
const published = ["home", "about", "virtualOffice", "contact"] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  return locales.flatMap((locale) =>
    published.map((route) => {
      const segment = routes[route];
      const suffix = segment ? `/${segment}` : "";

      return {
        url: new URL(`/${locale}${suffix}`, siteUrl).toString(),
        lastModified: new Date(),
        changeFrequency: "monthly" as const,
        priority: route === "home" ? 1 : 0.8,
        alternates: {
          languages: Object.fromEntries(
            locales.map((other) => [
              other,
              new URL(`/${other}${suffix}`, siteUrl).toString(),
            ]),
          ),
        },
      };
    }),
  );
}
