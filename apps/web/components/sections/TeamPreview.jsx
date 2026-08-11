import Image from "next/image";
import AnimatedSection from "@/components/ui/AnimatedSection";
import SectionHeader from "@/components/ui/SectionHeader";

export default function TeamPreview({ team, index = 4, showHeader = true }) {
  if (!team?.length) return null;

  return (
    <section className="mx-auto max-w-container px-6 py-28 sm:py-16">
      {showHeader && (
        <SectionHeader index={index} label="The team" title="The people behind" titleAccent="the work." />
      )}

      <div className="mt-20 grid grid-cols-2 gap-x-6 gap-y-14 sm:grid-cols-3 lg:grid-cols-4">
        {team.map((member, i) => (
          <AnimatedSection key={member._id} delay={i * 0.06}>
            <div className="group relative aspect-[3/4] overflow-hidden rounded-2xl bg-surface" data-cursor="hover">
              {member.photo?.url ? (
                <Image
                  src={member.photo.url}
                  alt={member.photo.alt || member.name}
                  fill
                  sizes="(max-width: 640px) 45vw, 22vw"
                  className="object-cover grayscale transition-all duration-700 ease-out group-hover:scale-105 group-hover:grayscale-0"
                />
              ) : (
                <div className="h-full w-full bg-surface" />
              )}
            </div>

            <div className="mt-4 border-t border-rule pt-3">
              <p className="text-ink">{member.name}</p>
              <p className="label mt-1">{member.role}</p>
            </div>
          </AnimatedSection>
        ))}
      </div>
    </section>
  );
}
