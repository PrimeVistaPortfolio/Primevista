import Link from "next/link";
import Image from "next/image";
import { regionThemeClass } from "@primevista/shared";
import { getProjects, getSiteSettings } from "@/lib/data";
import { resolveSeo, toNextMetadata, breadcrumbJsonLd } from "@/lib/seo";
import AnimatedSection from "@/components/ui/AnimatedSection";
import PageHeader from "@/components/layout/PageHeader";

export async function generateMetadata() {
  const settings = await getSiteSettings();
  const seo = resolveSeo({ fallbackName: "Selected Work", settings, pathname: "/projects" });
  return toNextMetadata(seo);
}

export default async function ProjectsPage() {
  const [projects, settings] = await Promise.all([getProjects(), getSiteSettings()]);

  return (
    <div className={`pb-28 ${regionThemeClass(settings, "pageProjects")}`}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Work", path: "/projects" }])),
        }}
      />

      <PageHeader
        eyebrow="Selected work"
        title="Products we've designed, built, and"
        titleAccent="shipped."
        meta={[{ label: "Projects", value: String(projects.length).padStart(3, "0") }]}
      />

      <div className="mx-auto max-w-container px-6">
        {/* Alternating column offsets break the uniform grid rhythm. */}
        <div className="grid gap-x-6 gap-y-20 sm:grid-cols-2">
          {projects.map((project, i) => (
            <AnimatedSection key={project._id} delay={(i % 2) * 0.08} className={i % 2 === 1 ? "sm:mt-24" : ""}>
              <Link href={`/projects/${project.slug}`} data-cursor="hover" className="group block">
                <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-surface">
                  {project.coverImage?.url && (
                    <Image
                      src={project.coverImage.url}
                      alt={project.coverImage.alt || project.title}
                      fill
                      sizes="(max-width: 640px) 92vw, 45vw"
                      className="object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.04]"
                    />
                  )}
                  <span className="label absolute left-4 top-4 text-ink">{String(i + 1).padStart(3, "0")}</span>
                </div>

                <div className="mt-5 flex items-baseline justify-between gap-4 border-t border-rule pt-4">
                  <h2 className="text-xl text-ink transition-colors group-hover:text-accent">{project.title}</h2>
                  <span className="label shrink-0">{project.tags?.[0]}</span>
                </div>
              </Link>
            </AnimatedSection>
          ))}
        </div>

        {projects.length === 0 && <p className="text-ink-muted">No projects published yet.</p>}
      </div>
    </div>
  );
}
