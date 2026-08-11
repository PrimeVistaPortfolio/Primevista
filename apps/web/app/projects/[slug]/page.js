import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { regionThemeClass } from "@primevista/shared";
import { getProjectBySlug, getAllProjectSlugs, getSiteSettings } from "@/lib/data";
import { resolveSeo, toNextMetadata, breadcrumbJsonLd, projectJsonLd } from "@/lib/seo";
import AnimatedSection from "@/components/ui/AnimatedSection";
import Parallax from "@/components/ui/Parallax";
import PageHeader from "@/components/layout/PageHeader";
import ModelViewerCanvas from "@/components/three/ModelViewerCanvas";

export async function generateStaticParams() {
  const projects = await getAllProjectSlugs();
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const [project, settings] = await Promise.all([getProjectBySlug(slug), getSiteSettings()]);
  if (!project) return {};
  const seo = resolveSeo({ seo: project.seo, fallbackName: project.title, settings, pathname: `/projects/${project.slug}` });
  return toNextMetadata(seo);
}

export default async function ProjectDetailPage({ params }) {
  const { slug } = await params;
  const [project, settings] = await Promise.all([getProjectBySlug(slug), getSiteSettings()]);
  if (!project) notFound();

  const meta = [
    project.client && { label: "Client", value: project.client },
    project.tags?.length && { label: "Discipline", value: project.tags.join(", ") },
    project.techStack?.length && { label: "Stack", value: project.techStack.join(", ") },
  ].filter(Boolean);

  return (
    <div className={`pb-28 ${regionThemeClass(settings, "pageProjectDetail")}`}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd([
              { name: "Home", path: "/" },
              { name: "Work", path: "/projects" },
              { name: project.title, path: `/projects/${project.slug}` },
            ])
          ),
        }}
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(projectJsonLd(project)) }} />

      <PageHeader eyebrow="Selected work" title={project.title} description={project.description} meta={meta} />

      {project.coverImage?.url && (
        <div className="mx-auto max-w-container px-6">
          <div className="relative aspect-[16/9] overflow-hidden rounded-3xl bg-surface">
            <Parallax speed={6} className="absolute inset-0 scale-110">
              <Image
                src={project.coverImage.url}
                alt={project.coverImage.alt || project.title}
                fill
                sizes="100vw"
                priority
                className="object-cover"
              />
            </Parallax>
          </div>
        </div>
      )}

      {project.liveUrl && (
        <div className="mx-auto max-w-container px-6 pt-10">
          <a
            href={project.liveUrl}
            target="_blank"
            rel="noopener noreferrer"
            data-cursor="hover"
            className="link-underline text-sm text-ink hover:text-accent"
          >
            Visit live site →
          </a>
        </div>
      )}

      {project.content && (
        <section className="mx-auto max-w-container px-6 pt-24">
          <AnimatedSection className="grid gap-8 border-t border-rule pt-12 lg:grid-cols-12">
            <p className="label lg:col-span-3">The work</p>
            <div className="whitespace-pre-wrap text-pretty text-lg leading-relaxed text-ink-muted lg:col-span-8">
              {project.content}
            </div>
          </AnimatedSection>
        </section>
      )}

      {project.model3dUrl && (
        <section className="mx-auto max-w-container px-6 pt-24">
          <div className="flex items-baseline gap-4 border-t border-rule pb-8 pt-6">
            <span className="label text-accent">001</span>
            <h2 className="display text-2xl text-ink">Interactive model</h2>
          </div>
          <ModelViewerCanvas url={project.model3dUrl} />
        </section>
      )}

      {project.gallery?.length > 0 && (
        <section className="mx-auto max-w-container px-6 pt-24">
          <div className="grid gap-6 sm:grid-cols-2">
            {project.gallery.map((item, i) => (
              <AnimatedSection
                key={i}
                delay={(i % 2) * 0.08}
                className={i % 3 === 0 ? "sm:col-span-2" : ""}
              >
                {item.type === "video" ? (
                  <video src={item.url} controls className="w-full rounded-2xl bg-surface" />
                ) : (
                  <div className="relative aspect-video overflow-hidden rounded-2xl bg-surface">
                    <Image src={item.url} alt={item.alt || ""} fill sizes="(max-width: 640px) 92vw, 45vw" className="object-cover" />
                  </div>
                )}
              </AnimatedSection>
            ))}
          </div>
        </section>
      )}

      <section className="mx-auto max-w-container px-6 pt-28">
        <div className="flex flex-wrap items-center justify-between gap-6 border-t border-rule pt-8">
          <p className="text-pretty text-ink-muted">Want something like this?</p>
          <div className="flex gap-6">
            <Link href="/services" className="link-underline text-sm text-ink hover:text-accent" data-cursor="hover">
              Our services →
            </Link>
            <Link href="/projects" className="link-underline text-sm text-ink hover:text-accent" data-cursor="hover">
              All work →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
