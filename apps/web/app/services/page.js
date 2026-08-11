import Link from "next/link";
import { getServices, getSiteSettings } from "@/lib/data";
import { resolveSeo, toNextMetadata, breadcrumbJsonLd } from "@/lib/seo";
import AnimatedSection from "@/components/ui/AnimatedSection";
import PageHeader from "@/components/layout/PageHeader";
import HashScroll from "@/components/ui/HashScroll";
import { categoryId } from "@/lib/slug";
import { SERVICE_CATEGORIES, regionThemeClass } from "@primevista/shared";

export async function generateMetadata() {
  const settings = await getSiteSettings();
  const seo = resolveSeo({ fallbackName: "Services", settings, pathname: "/services" });
  return toNextMetadata(seo);
}

export default async function ServicesPage() {
  const [services, settings] = await Promise.all([getServices(), getSiteSettings()]);

  const grouped = {};
  services.forEach((s) => {
    grouped[s.category] = grouped[s.category] || [];
    grouped[s.category].push(s);
  });
  const categories = [...new Set([...SERVICE_CATEGORIES, ...Object.keys(grouped)])].filter((c) => grouped[c]?.length);

  return (
    <div className={`pb-28 ${regionThemeClass(settings, "pageServices")}`}>
      {/* Handles /services#category-… arrivals from the navbar dropdown. */}
      <HashScroll />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Services", path: "/services" }])),
        }}
      />

      <PageHeader
        eyebrow="What we do"
        title="Built end to end, from first sketch to"
        titleAccent="production."
        description="A single team for strategy, design, engineering, and everything that keeps it running afterwards."
        meta={[
          { label: "Disciplines", value: String(categories.length).padStart(2, "0") },
          { label: "Services", value: String(services.length).padStart(3, "0") },
        ]}
      />

      <div className="mx-auto max-w-container px-6">
        {categories.map((category, catIndex) => (
          <section key={category} id={categoryId(category)} className="mt-20 scroll-mt-28">
            <div className="flex items-baseline gap-4 border-t border-rule pt-6">
              <span className="label text-accent">{String(catIndex + 1).padStart(3, "0")}</span>
              <h2 className="display text-2xl text-ink sm:text-3xl">{category}</h2>
            </div>

            <ul className="mt-8">
              {grouped[category].map((service, i) => (
                <AnimatedSection as="li" key={service._id} delay={i * 0.03} y={20}>
                  <Link
                    href={`/services/${service.slug}`}
                    data-cursor="hover"
                    className="group grid grid-cols-12 items-baseline gap-4 border-b border-rule py-6 transition-colors hover:border-rule-strong"
                  >
                    <h3 className="col-span-11 text-lg text-ink transition-transform duration-500 ease-out group-hover:translate-x-2 sm:col-span-5 sm:text-xl">
                      {service.title}
                    </h3>
                    <p className="col-span-11 text-sm text-ink-muted sm:col-span-6">{service.shortDescription}</p>
                    <span className="col-span-1 text-right text-ink-faint transition-all duration-500 group-hover:translate-x-1 group-hover:text-accent">
                      →
                    </span>
                  </Link>
                </AnimatedSection>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
