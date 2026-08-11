import AnimatedSection from "@/components/ui/AnimatedSection";
import SplitText from "@/components/ui/SplitText";
import InquiryForm from "@/components/forms/InquiryForm";
import Marquee from "@/components/ui/Marquee";
import SectionVideo from "@/components/ui/SectionVideo";

export default function CtaInquiry({ data, serviceOptions, budgetOptions, siteName = "Let's talk" }) {
  return (
    <section className="relative border-t border-rule">
      {/* Optional CMS-supplied backdrop. Renders nothing without a URL. */}
      <SectionVideo {...(data?.backgroundVideo || {})} />

      {/* Marquee band — a moving typographic rule between sections. */}
      <Marquee text={siteName} className="relative z-10 border-b border-rule py-8 text-ink-faint" duration={45} />

      <div className="relative z-10 mx-auto max-w-container px-6 py-28 sm:py-20">
        <div className="grid gap-16 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <h2 className="display text-display-sm text-ink">
              <SplitText as="span">{data?.title || "Have something in"}</SplitText>{" "}
              <SplitText as="span" className="italic text-accent" delay={0.1}>
                {data?.titleAccent || "mind?"}
              </SplitText>
            </h2>

            <AnimatedSection as="p" delay={0.15} className="mt-8 max-w-sm text-pretty text-ink-muted">
              {data?.subtitle || "Tell us what you're building. We reply within one business day."}
            </AnimatedSection>
          </div>

          <AnimatedSection delay={0.2} className="lg:col-span-7">
            <InquiryForm serviceOptions={serviceOptions} budgetOptions={budgetOptions} />
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
}
