import SplitText from "@/components/ui/SplitText";
import AnimatedSection from "@/components/ui/AnimatedSection";

/**
 * Shared editorial masthead for inner pages: mono eyebrow, oversized display
 * title with an optional italic accent word, and an optional metadata rail.
 */
export default function PageHeader({ eyebrow, title, titleAccent, description, meta = [] }) {
  return (
    <header className="mx-auto max-w-container px-6 pb-16 pt-40 sm:pt-48">
      {eyebrow && (
        <AnimatedSection as="p" className="label mb-8 flex items-center gap-3" y={16}>
          <span className="inline-block h-px w-8 bg-accent" />
          {eyebrow}
        </AnimatedSection>
      )}

      <h1 className="display text-display-md text-ink">
        <SplitText as="span">{title}</SplitText>{" "}
        {titleAccent && (
          <SplitText as="span" className="italic text-accent" delay={0.1}>
            {titleAccent}
          </SplitText>
        )}
      </h1>

      {description && (
        <AnimatedSection as="p" delay={0.2} className="mt-10 max-w-xl text-pretty text-lg text-ink-muted">
          {description}
        </AnimatedSection>
      )}

      {meta.length > 0 && (
        <div className="mt-16 flex flex-wrap gap-x-12 gap-y-4 border-t border-rule pt-6">
          {meta.map((item) => (
            <div key={item.label}>
              <p className="label">{item.label}</p>
              <p className="mt-1 text-sm text-ink">{item.value}</p>
            </div>
          ))}
        </div>
      )}
    </header>
  );
}
