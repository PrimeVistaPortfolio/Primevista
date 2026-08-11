import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { regionThemeClass } from "@primevista/shared";
import {
  getServiceBySlug,
  getAllServiceSlugs,
  getServices,
  getRelatedProjectsByTags,
  getSiteSettings,
} from "@/lib/data";
import { resolveSeo, toNextMetadata, breadcrumbJsonLd, serviceJsonLd } from "@/lib/seo";
import AnimatedSection from "@/components/ui/AnimatedSection";
import PageHeader from "@/components/layout/PageHeader";
import SectionHeader from "@/components/ui/SectionHeader";
import CtaInquiry from "@/components/sections/CtaInquiry";

export async function generateStaticParams() {
  const services = await getAllServiceSlugs();
  return services.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const [service, settings] = await Promise.all([getServiceBySlug(slug), getSiteSettings()]);
  if (!service) return {};
  const seo = resolveSeo({
    seo: service.seo,
    fallbackName: `${service.title} Company`,
    settings,
    pathname: `/services/${service.slug}`,
  });
  return toNextMetadata(seo);
}

export default async function ServiceDetailPage({ params }) {
  const { slug } = await params;
  const [service, settings] = await Promise.all([getServiceBySlug(slug), getSiteSettings()]);
  if (!service) notFound();

  const [relatedProjects, categoryServices] = await Promise.all([
    getRelatedProjectsByTags(service.relatedProjectTags, null, 3),
    getServices({ category: service.category }),
  ]);
  const relatedServices = categoryServices.filter((s) => s.slug !== service.slug).slice(0, 4);

  return (
    <div className={regionThemeClass(settings, "pageServiceDetail") || undefined}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd([
              { name: "Home", path: "/" },
              { name: "Services", path: "/services" },
              { name: service.title, path: `/services/${service.slug}` },
            ])
          ),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd(service, settings)) }}
      />

      <PageHeader
        eyebrow={service.category}
        title={service.title}
        description={service.shortDescription}
        meta={[
          { label: "Service", value: service.title },
          { label: "Category", value: service.category },
        ]}
      />

      {service.longDescription && (
        <section className="mx-auto max-w-container px-6">
          <AnimatedSection className="grid gap-8 border-t border-rule pt-12 lg:grid-cols-12">
            <p className="label lg:col-span-3">Overview</p>
            <div className="whitespace-pre-wrap text-pretty text-lg leading-relaxed text-ink-muted lg:col-span-8">
              {service.longDescription}
            </div>
          </AnimatedSection>
        </section>
      )}

      {relatedProjects.length > 0 && (
        <section className="mx-auto max-w-container px-6 pt-28">
          <SectionHeader index={1} label="Related work" title="Where we've done" titleAccent="this." />
          <div className="mt-16 grid gap-6 sm:grid-cols-3">
            {relatedProjects.map((project, i) => (
              <AnimatedSection key={project._id} delay={i * 0.07}>
                <Link href={`/projects/${project.slug}`} data-cursor="hover" className="group block">
                  <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-surface">
                    {project.coverImage?.url && (
                      <Image
                        src={project.coverImage.url}
                        alt={project.coverImage.alt || project.title}
                        fill
                        sizes="(max-width: 640px) 92vw, 30vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    )}
                  </div>
                  <p className="mt-4 border-t border-rule pt-3 text-ink group-hover:text-accent">{project.title}</p>
                </Link>
              </AnimatedSection>
            ))}
          </div>
        </section>
      )}

      {relatedServices.length > 0 && (
        <section className="mx-auto max-w-container px-6 pt-28">
          <SectionHeader index={relatedProjects.length > 0 ? 2 : 1} label="Related services" title="You might also" titleAccent="need." />
          <ul className="mt-12">
            {relatedServices.map((s, i) => (
              <AnimatedSection as="li" key={s._id} delay={i * 0.04}>
                <Link
                  href={`/services/${s.slug}`}
                  data-cursor="hover"
                  className="group flex items-baseline justify-between gap-4 border-b border-rule py-5 transition-colors hover:border-rule-strong"
                >
                  <span className="text-lg text-ink transition-transform duration-500 group-hover:translate-x-2">
                    {s.title}
                  </span>
                  <span className="text-ink-faint transition-all duration-500 group-hover:translate-x-1 group-hover:text-accent">
                    →
                  </span>
                </Link>
              </AnimatedSection>
            ))}
          </ul>
        </section>
      )}

      <div className="mt-28">
        <CtaInquiry
          data={{ title: "Ready to talk", titleAccent: `${service.title.toLowerCase()}?` }}
          siteName={settings.siteName}
          serviceOptions={settings.serviceInterestOptions}
          budgetOptions={settings.budgetRangeOptions}
        />
      </div>
    </div>
  );
}
