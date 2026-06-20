import type { MetadataRoute } from "next";
import { getProperties } from "@/lib/get-properties";
import { blogPosts } from "@/data/blog-posts";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://rivieramayapass.com";
  const locales = ["es", "en"];
  const properties = await getProperties();

  const routes: MetadataRoute.Sitemap = [];

  // Home pages
  for (const locale of locales) {
    routes.push({
      url: `${baseUrl}/${locale}`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    });
  }

  // Property pages
  for (const locale of locales) {
    for (const property of properties) {
      routes.push({
        url: `${baseUrl}/${locale}/propiedad/${property.slug}`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.8,
      });
    }
  }

  // Blog listing pages
  for (const locale of locales) {
    routes.push({
      url: `${baseUrl}/${locale}/blog`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    });
  }

  // Términos y Condiciones + Aviso de Privacidad
  for (const locale of locales) {
    routes.push(
      {
        url: `${baseUrl}/${locale}/terminos`,
        lastModified: new Date(),
        changeFrequency: "yearly",
        priority: 0.3,
      },
      {
        url: `${baseUrl}/${locale}/privacidad`,
        lastModified: new Date(),
        changeFrequency: "yearly",
        priority: 0.3,
      }
    );
  }

  // Blog post pages
  for (const locale of locales) {
    for (const post of blogPosts) {
      routes.push({
        url: `${baseUrl}/${locale}/blog/${post.slug}`,
        lastModified: new Date(post.publishedAt),
        changeFrequency: "monthly",
        priority: 0.7,
      });
    }
  }

  return routes;
}
