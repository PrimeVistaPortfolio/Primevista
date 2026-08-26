import Link from "next/link";
import AnimatedSection from "@/components/ui/AnimatedSection";
import SectionHeader from "@/components/ui/SectionHeader";
import ServiceIcon from "@/components/ui/ServiceIcon";

/**
 * Service cards — icon, title, short description, and a "Discover" link, in
 * the register of the reference sites. Colours come from tokens, so the same
 * component sits correctly on a dark section or a light band.
 */
export default function ServicesGrid({ services, index = 1 }) {
  if (!services?.length) return null;

  return (
    <section className="mx-auto max-w-container px-6 py-28 sm:py-16">
      <SectionHeader
        index={index}
        label="What we do"
        title="Different skills."
        titleAccent="One standard."
        link={{ href: "/services", label: "All services →" }}
      />

      <div className="mt-20 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((service, i) => (
          <AnimatedSection key={service._id} delay={i * 0.06}>
            <Link
              href={`/services/${service.slug}`}
              data-cursor="hover"
              className="group flex h-full flex-col rounded-3xl border border-rule bg-surface/40 p-8 transition-all duration-500 hover:-translate-y-1 hover:border-accent hover:bg-surface"
            >
              <div className="flex items-start justify-between">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-rule text-accent transition-colors duration-500 group-hover:border-accent">
                  <ServiceIcon name={service.icon} />
                </span>
                <span className="label">{String(i + 1).padStart(2, "0")}</span>
              </div>

              <h3 className="display mt-10 text-2xl text-ink">{service.title}</h3>
              <p className="mt-3 flex-1 text-sm text-pretty text-ink-muted">{service.shortDescription}</p>

              <span className="mt-8 inline-flex items-center gap-2 text-sm text-ink transition-colors group-hover:text-accent">
                Discover
                <span className="transition-transform duration-500 group-hover:translate-x-1">→</span>
              </span>
            </Link>
          </AnimatedSection>
        ))}
      </div>
    </section>
  );
}
