import { regionThemeClass } from "@primevista/shared";
import { getPage, getTeamMembers, getSiteSettings } from "@/lib/data";
import { getBlock } from "@/lib/blocks";
import { resolveSeo, toNextMetadata, breadcrumbJsonLd } from "@/lib/seo";
import AnimatedSection from "@/components/ui/AnimatedSection";
import PageHeader from "@/components/layout/PageHeader";
import SectionHeader from "@/components/ui/SectionHeader";
import TeamPreview from "@/components/sections/TeamPreview";
import Marquee from "@/components/ui/Marquee";

export async function generateMetadata() {
  const [page, settings] = await Promise.all([getPage("about"), getSiteSettings()]);
  const seo = resolveSeo({ seo: page?.seo, fallbackName: "About Us", settings, pathname: "/about" });
  return toNextMetadata(seo);
}

export default async function AboutPage() {
  const [page, team, settings] = await Promise.all([getPage("about"), getTeamMembers(), getSiteSettings()]);
  const story = getBlock(page, "aboutStrip");
  const values = getBlock(page, "values")?.items || [
    { title: "Craft over shortcuts", description: "We sweat the details that make software feel effortless to use." },
    { title: "Plain speech", description: "Weekly demos, honest timelines, and no jargon in status updates." },
    { title: "Built to last", description: "We design for the maintainer who inherits it, not just for launch day." },
  ];

  return (
    <div className={`pb-28 ${regionThemeClass(settings, "pageAbout")}`}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "About", path: "/about" }])),
        }}
      />

      <PageHeader
        eyebrow="About"
        title={story?.title || "A small studio with a long"}
        titleAccent={story?.titleAccent || "memory."}
        description={
          story?.body ||
          "We're an independent product studio. Senior people, small teams, and a habit of staying involved long after the launch post."
        }
        meta={[
          { label: "Founded", value: "2018" },
          { label: "Team", value: String(team.length).padStart(2, "0") },
          { label: "Model", value: "Independent" },
        ]}
      />

      <Marquee text={settings.siteName} className="border-y border-rule py-8 text-ink-faint" duration={50} />

      <section className="mx-auto max-w-container px-6 pt-28">
        <SectionHeader index={1} label="What we value" title="Three things we don't" titleAccent="compromise on." />

        <div className="mt-16 grid gap-px bg-rule sm:grid-cols-3">
          {values.map((value, i) => (
            <AnimatedSection key={value.title} delay={i * 0.08} className="bg-background p-8">
              <span className="label text-accent">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="display mt-8 text-2xl text-ink">{value.title}</h3>
              <p className="mt-4 text-sm text-pretty text-ink-muted">{value.description}</p>
            </AnimatedSection>
          ))}
        </div>
      </section>

      <TeamPreview team={team} index={2} />
    </div>
  );
}
