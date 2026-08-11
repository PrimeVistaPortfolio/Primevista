import Link from "next/link";
import SplitText from "./SplitText";
import AnimatedSection from "./AnimatedSection";

/**
 * Editorial section header: zero-padded index, uppercase mono label, a display
 * heading whose last word can be set in italic serif, and an optional link.
 */
export default function SectionHeader({
  index,
  label,
  title,
  titleAccent,
  link,
  className = "",
  // Forwarded to the reveal animations; required when this header sits inside
  // a GSAP-pinned section.
  pinnedContainer,
}) {
  return (
    <div className={`border-t border-rule pt-6 ${className}`}>
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <div className="mb-6 flex items-center gap-4">
            {index != null && <span className="label text-accent">{String(index).padStart(3, "0")}</span>}
            {label && <span className="label">{label}</span>}
          </div>

          <h2 className="display max-w-2xl text-display-sm text-ink">
            <SplitText as="span" pinnedContainer={pinnedContainer}>
              {title}
            </SplitText>{" "}
            {titleAccent && (
              <SplitText as="span" className="text-ink-muted" delay={0.08} pinnedContainer={pinnedContainer}>
                {titleAccent}
              </SplitText>
            )}
          </h2>
        </div>

        {link && (
          <AnimatedSection as="div" delay={0.15} pinnedContainer={pinnedContainer}>
            <Link href={link.href} className="link-underline text-sm text-ink-muted hover:text-ink" data-cursor="hover">
              {link.label}
            </Link>
          </AnimatedSection>
        )}
      </div>
    </div>
  );
}
