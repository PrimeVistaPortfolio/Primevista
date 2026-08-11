import { unstable_cache } from "next/cache";
import {
  dbConnect,
  SiteSettings,
  Page,
  Project,
  Service,
  TeamMember,
  Client,
  SERVICE_CATEGORIES,
} from "@primevista/shared";

// Server Components query the database directly (no self-HTTP round trip).
// Each fetcher is wrapped in unstable_cache with a tag that admin write routes
// call revalidateTag() on, so edits show up without a redeploy.

function serialize(doc) {
  return JSON.parse(JSON.stringify(doc));
}

export const getSiteSettings = unstable_cache(
  async () => {
    await dbConnect();
    let settings = await SiteSettings.findOne({ singletonKey: "site-settings" }).lean();
    if (!settings) {
      settings = await SiteSettings.create({});
      settings = settings.toObject();
    }
    return serialize(settings);
  },
  ["site-settings"],
  { tags: ["site-settings"] }
);

export const getPage = unstable_cache(
  async (slug) => {
    await dbConnect();
    const page = await Page.findOne({ slug }).lean();
    return page ? serialize(page) : null;
  },
  ["page"],
  { tags: ["pages"] }
);

export const getProjects = unstable_cache(
  async ({ featured, tag, limit } = {}) => {
    await dbConnect();
    const query = { status: "published" };
    if (featured) query.featured = true;
    if (tag) query.tags = tag;
    let cursor = Project.find(query).sort({ order: 1, createdAt: -1 });
    if (limit) cursor = cursor.limit(limit);
    const projects = await cursor.lean();
    return serialize(projects);
  },
  ["projects"],
  { tags: ["projects"] }
);

export const getProjectBySlug = unstable_cache(
  async (slug) => {
    await dbConnect();
    const project = await Project.findOne({ slug, status: "published" }).lean();
    return project ? serialize(project) : null;
  },
  ["project-by-slug"],
  { tags: ["projects"] }
);

export const getAllProjectSlugs = unstable_cache(
  async () => {
    await dbConnect();
    const projects = await Project.find({ status: "published" }, "slug updatedAt").lean();
    return serialize(projects);
  },
  ["project-slugs"],
  { tags: ["projects"] }
);

export const getServices = unstable_cache(
  async ({ category } = {}) => {
    await dbConnect();
    const query = { status: "published" };
    if (category) query.category = category;
    const services = await Service.find(query).sort({ category: 1, order: 1 }).lean();
    return serialize(services);
  },
  ["services"],
  { tags: ["services"] }
);

export const getServiceBySlug = unstable_cache(
  async (slug) => {
    await dbConnect();
    const service = await Service.findOne({ slug, status: "published" }).lean();
    return service ? serialize(service) : null;
  },
  ["service-by-slug"],
  { tags: ["services"] }
);

export const getAllServiceSlugs = unstable_cache(
  async () => {
    await dbConnect();
    const services = await Service.find({ status: "published" }, "slug updatedAt").lean();
    return serialize(services);
  },
  ["service-slugs"],
  { tags: ["services"] }
);

export const getTeamMembers = unstable_cache(
  async () => {
    await dbConnect();
    const members = await TeamMember.find({ visible: true }).sort({ order: 1 }).lean();
    return serialize(members);
  },
  ["team-members"],
  { tags: ["team"] }
);

export const getServiceCategories = unstable_cache(
  async () => {
    await dbConnect();
    const found = await Service.distinct("category", { status: "published" });
    // Present them in the catalogue's canonical order, with any admin-added
    // categories appended rather than dropped.
    const known = SERVICE_CATEGORIES.filter((c) => found.includes(c));
    const extra = found.filter((c) => !SERVICE_CATEGORIES.includes(c)).sort();
    return [...known, ...extra];
  },
  ["service-categories"],
  { tags: ["services"] }
);

export const getClients = unstable_cache(
  async () => {
    await dbConnect();
    const clients = await Client.find({ visible: true }).sort({ order: 1, createdAt: 1 }).lean();
    return serialize(clients);
  },
  ["clients"],
  { tags: ["clients"] }
);

export const getRelatedProjectsByTags = unstable_cache(
  async (tags = [], excludeSlug, limit = 3) => {
    if (!tags.length) return [];
    await dbConnect();
    const projects = await Project.find({
      status: "published",
      tags: { $in: tags },
      slug: { $ne: excludeSlug },
    })
      .limit(limit)
      .lean();
    return serialize(projects);
  },
  ["related-projects"],
  { tags: ["projects"] }
);
