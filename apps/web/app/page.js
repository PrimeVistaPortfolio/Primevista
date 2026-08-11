import { resolveRegionTheme } from "@primevista/shared";
import { getPage, getServices, getProjects, getTeamMembers, getSiteSettings, getClients } from "@/lib/data";
import { getBlock } from "@/lib/blocks";
import ThemedRegion from "@/components/layout/ThemedRegion";
import { resolveSeo, toNextMetadata } from "@/lib/seo";
import Hero from "@/components/sections/Hero";
import AboutStrip from "@/components/sections/AboutStrip";
import ServicesGrid from "@/components/sections/ServicesGrid";
import FeaturedProjects from "@/components/sections/FeaturedProjects";
import ProcessTimeline from "@/components/sections/ProcessTimeline";
import TeamPreview from "@/components/sections/TeamPreview";
import CtaInquiry from "@/components/sections/CtaInquiry";
import ClientMarquee from "@/components/sections/ClientMarquee";

export async function generateMetadata() {
  const [page, settings] = await Promise.all([getPage("home"), getSiteSettings()]);
  const seo = resolveSeo({ seo: page?.seo, fallbackName: settings.siteName, settings, pathname: "/" });
  return toNextMetadata(seo);
}

export default async function HomePage() {
  const [page, settings, services, featuredProjects, team, clients] = await Promise.all([
    getPage("home"),
    getSiteSettings(),
    getServices(),
    getProjects({ featured: true, limit: 6 }),
    getTeamMembers(),
    getClients(),
  ]);

  // Each band's light/dark treatment comes from Admin > Site Settings >
  // Appearance; <ThemedRegion> turns that choice into the token-redefining
  // class, so the section components below stay theme-agnostic.
  return (
    <>
      <ThemedRegion settings={settings} region="homeHero">
        <Hero
          data={getBlock(page, "hero")}
          accent={settings.themeColor}
          siteName={settings.siteName}
          theme={resolveRegionTheme(settings, "homeHero")}
        />
      </ThemedRegion>

      <ThemedRegion settings={settings} region="homeAbout">
        <AboutStrip data={getBlock(page, "aboutStrip")} />
      </ThemedRegion>

      <ThemedRegion settings={settings} region="homeClients">
        <ClientMarquee clients={clients} title={getBlock(page, "clients")?.title || "Trusted by"} />
      </ThemedRegion>

      <ThemedRegion settings={settings} region="homeServices">
        <ServicesGrid services={services.slice(0, 6)} index={1} />
      </ThemedRegion>

      <ThemedRegion settings={settings} region="homeProjects">
        <FeaturedProjects projects={featuredProjects} index={2} />
      </ThemedRegion>

      <ThemedRegion settings={settings} region="homeProcess">
        <ProcessTimeline data={getBlock(page, "processTimeline")} index={3} />
      </ThemedRegion>

      <ThemedRegion settings={settings} region="homeTeam">
        <TeamPreview team={team.slice(0, 4)} index={4} />
      </ThemedRegion>

      <ThemedRegion settings={settings} region="homeCta">
        <CtaInquiry
          data={getBlock(page, "cta")}
          siteName={settings.siteName}
          serviceOptions={settings.serviceInterestOptions}
          budgetOptions={settings.budgetRangeOptions}
        />
      </ThemedRegion>
    </>
  );
}
