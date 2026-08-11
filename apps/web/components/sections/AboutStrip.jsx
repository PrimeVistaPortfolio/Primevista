import AnimatedSection from "@/components/ui/AnimatedSection";
import SplitText from "@/components/ui/SplitText";
import Counter from "@/components/ui/Counter";
import SectionVideo from "@/components/ui/SectionVideo";

export default function AboutStrip({ data }) {
  const title = data?.title || "An independent studio for teams who care how it's";
  const titleAccent = data?.titleAccent || "made.";
  const body =
    data?.body ||
    "Strategy, design, and engineering in one room. We work in small senior teams, ship in short cycles, and stay on after launch.";

  // Zero-padded figures — the leading zero is the editorial device.
  const stats = data?.stats || [
    { label: "Projects delivered", value: 40, suffix: "+" },
    { label: "Years in practice", value: 8, suffix: "" },
    { label: "Client retention", value: 92, suffix: "%" },
  ];

  return (
    <section className="relative px-6 py-16 sm:py-16">
      {/* Optional CMS-supplied backdrop. Renders nothing without a URL. */}
      <SectionVideo {...(data?.backgroundVideo || {})} />

      <div className="relative z-10 mx-auto grid max-w-container gap-16 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <h2 className="display text-display-sm text-ink">
            <SplitText as="span">{title}</SplitText>{" "}
            <SplitText as="span" className="italic text-accent" delay={0.1}>
              {titleAccent}
            </SplitText>
          </h2>
        </div>

        <AnimatedSection className="flex items-end lg:col-span-5" delay={0.15}>
          <p className="max-w-sm text-pretty text-ink-muted">{body}</p>
        </AnimatedSection>
      </div>

      <div className="relative z-10 mx-auto mt-24 grid max-w-container grid-cols-1 border-t border-rule sm:grid-cols-3">
        {stats.map((stat, i) => (
          <AnimatedSection
            key={stat.label}
            delay={i * 0.1}
            className="border-b border-rule py-10 sm:border-b-0 sm:border-r sm:pr-8 sm:last:border-r-0 sm:[&:not(:first-child)]:pl-8 text-center"
          >
            <p className="display text-[clamp(3rem,7vw,5rem)] leading-none text-ink">
              <Counter  value={stat.value} suffix={stat.suffix} />
            </p>
            <p className="label mt-4">{stat.label}</p>
          </AnimatedSection>
        ))}
      </div>
    </section>
  );
}
