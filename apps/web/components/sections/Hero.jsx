// Swap back to `@/components/three/HeroCanvas` for the glass knot.
import GlobeCanvas from "@/components/three/GlobeCanvas";
import SplitText from "@/components/ui/SplitText";
import MagneticButton from "@/components/ui/MagneticButton";
import AnimatedSection from "@/components/ui/AnimatedSection";
import SectionVideo from "@/components/ui/SectionVideo";

// `theme` is this section's resolved light/dark from Site Settings. The globe
// needs it explicitly — a WebGL canvas can't inherit the CSS colour tokens.
export default function Hero({ data, accent, siteName, theme = "dark" }) {
  const headline = data?.headline || "Digital products,";
  // Italic accent word — replaces what used to be a gradient fill.
  const headlineAccent = data?.headlineAccent || "built with intent.";
  const subheadline =
    data?.subheadline ||
    "Websites, platforms, and internal tools engineered for clarity, scale, and the long run.";
  const primaryCta = data?.primaryCta || { label: "Start a project", href: "/contact" };
  const secondaryCta = data?.secondaryCta || { label: "Selected work", href: "/projects" };
  const meta = data?.meta || { discipline: "Design · Engineering · Growth", since: "Est. 2018" };

  return (
    <section className="relative flex min-h-screen flex-col justify-between border-b border-rule pt-16">
      {/* Optional CMS-supplied backdrop. Renders nothing without a URL, so the
          section is unchanged until an editor adds one. */}
      <SectionVideo {...(data?.backgroundVideo || {})} />

      {/* Top rail */}
      {/* <AnimatedSection
        as="div"
        y={16}
        className="mx-auto flex w-full max-w-container items-center justify-between gap-4 px-6"
      >
        <p className="label flex items-center gap-3">
          <span className="inline-block h-px w-8 bg-accent" />
          Inspire · Innovate · Impact
        </p>
        <p className="label hidden sm:block">{meta.since}</p>
      </AnimatedSection> */}

      {/* Stage: type and object share the row, and the canvas gets a square
          area so the model is never squeezed by a tall narrow column. */}
      <div className="relative z-10 mx-auto grid w-full max-w-container items-center gap-10 px-6 sm:py-0 py-10  lg:grid-cols-12 lg:gap-3">
        <div className="order-2 lg:order-1 lg:col-span-7">
          <h3 className="display text-display-base text-ink">
            <SplitText as="span" className="block">
              {headline}
            </SplitText>
            <SplitText as="span" className="block italic text-accent" delay={0.12}>
              {headlineAccent}
            </SplitText>
          </h3>

          <AnimatedSection as="p" delay={0.25} className="mt-8 max-w-md text-pretty text-lg text-ink-muted">
            {subheadline}
          </AnimatedSection>

          <AnimatedSection as="div" delay={0.35} className="mt-10 flex flex-wrap items-center gap-4">
            <MagneticButton
              href={primaryCta.href}
              className="rounded-full bg-rule px-8 py-4 text-sm font-medium  transition-colors hover:bg-accent text-ink  hover:text-white"
            >
              {primaryCta.label}
            </MagneticButton>
            <MagneticButton
              href={secondaryCta.href}
              className="rounded-full border border-rule-strong px-8 py-4 text-sm font-medium text-ink transition-colors hover:border-accent hover:text-accent"
            >
              {secondaryCta.label}
            </MagneticButton>
          </AnimatedSection>
        </div>

        <div className="order-1 lg:order-2 lg:col-span-5">
          <div className="relative mx-auto aspect-square w-full max-w-[34rem]">
            {/* Ring framing the object — reads as a deliberate stage, and gives
                a visual boundary the glass can refract against. */}
            <div className="pointer-events-none absolute" aria-hidden="true" />
            <GlobeCanvas accent={accent} theme={theme} />
          </div>
        </div>
      </div>

      {/* Bottom metadata rail */}
      <div className="relative z-10 mx-auto w-full max-w-container px-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-rule py-6">
          <span className="label">{meta.discipline}</span>
          <span className="label hidden md:block">{siteName}</span>
          <span className="label flex items-center gap-2">
            Scroll
            <span className="inline-block h-3 w-px animate-pulse bg-accent" />
          </span>
        </div>
      </div>
    </section>
  );
}
