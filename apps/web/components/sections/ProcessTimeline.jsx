import AnimatedSection from "@/components/ui/AnimatedSection";
import SectionHeader from "@/components/ui/SectionHeader";

export default function ProcessTimeline({ data, index = 3 }) {
  const steps = data?.steps || [
    { title: "Discover", description: "We dig into your goals, users, and constraints before writing a line of code." },
    { title: "Design", description: "Wireframes and design systems, validated with the people who'll actually use them." },
    { title: "Build", description: "Iterative development with weekly demos and tight feedback loops." },
    { title: "Grow", description: "Ship, measure, and keep improving with ongoing support." },
  ];

  return (
    <section className="mx-auto max-w-container px-6 py-16">
      <SectionHeader index={index} label="How we work" title="No mystery," titleAccent="no theatre." />

      <div className="mt-20 grid gap-px bg-rule sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((step, i) => (
          <AnimatedSection key={step.title} delay={i * 0.08} className="bg-background p-8">
            <span className="label text-accent">{String(i + 1).padStart(2, "0")}</span>
            <h3 className="display mt-8 text-3xl text-ink">{step.title}</h3>
            <p className="mt-4 text-sm text-pretty text-ink-muted">{step.description}</p>
          </AnimatedSection>
        ))}
      </div>
    </section>
  );
}
