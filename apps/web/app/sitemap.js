import { getAllProjectSlugs, getAllServiceSlugs } from "@/lib/data";
import { SITE_URL } from "@/lib/seo";

const STATIC_ROUTES = ["", "/about", "/services", "/projects", "/contact"];

export default async function sitemap() {
  const [projects, services] = await Promise.all([getAllProjectSlugs(), getAllServiceSlugs()]);

  const staticEntries = STATIC_ROUTES.map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: path === "" ? 1 : 0.7,
  }));

  const serviceEntries = services.map((s) => ({
    url: `${SITE_URL}/services/${s.slug}`,
    lastModified: s.updatedAt,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  const projectEntries = projects.map((p) => ({
    url: `${SITE_URL}/projects/${p.slug}`,
    lastModified: p.updatedAt,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticEntries, ...serviceEntries, ...projectEntries];
}
