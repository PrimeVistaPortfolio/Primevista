import { regionThemeClass } from "@primevista/shared";
import { getPage, getSiteSettings } from "@/lib/data";
import { resolveSeo, toNextMetadata, breadcrumbJsonLd } from "@/lib/seo";
import AnimatedSection from "@/components/ui/AnimatedSection";
import PageHeader from "@/components/layout/PageHeader";
import InquiryForm from "@/components/forms/InquiryForm";

export async function generateMetadata() {
  const [page, settings] = await Promise.all([getPage("contact"), getSiteSettings()]);
  const seo = resolveSeo({ seo: page?.seo, fallbackName: "Contact", settings, pathname: "/contact" });
  return toNextMetadata(seo);
}

export default async function ContactPage() {
  const settings = await getSiteSettings();

  return (
    <div className={`pb-28 ${regionThemeClass(settings, "pageContact")}`}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Contact", path: "/contact" }])),
        }}
      />

      <PageHeader eyebrow="Contact" title="Tell us what you're" titleAccent="building." />

      <div className="mx-auto max-w-container px-6">
        <div className="grid gap-16 border-t border-rule pt-16 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <div className="space-y-8">
              {settings.contactEmail && (
                <div>
                  <p className="label mb-2">Email</p>
                  <a
                    href={`mailto:${settings.contactEmail}`}
                    data-cursor="hover"
                    className="link-underline text-ink hover:text-accent"
                  >
                    {settings.contactEmail}
                  </a>
                </div>
              )}
              {settings.contactPhone && (
                <div>
                  <p className="label mb-2">Phone</p>
                  <p className="text-ink">{settings.contactPhone}</p>
                </div>
              )}
              {settings.address && (
                <div>
                  <p className="label mb-2">Studio</p>
                  <p className="text-pretty text-ink">{settings.address}</p>
                </div>
              )}
              <div>
                <p className="label mb-2">Response time</p>
                <p className="text-ink">Within one business day</p>
              </div>
            </div>

            {settings.mapEmbedUrl && (
              <div className="mt-10 overflow-hidden border border-rule">
                <iframe src={settings.mapEmbedUrl} className="h-56 w-full grayscale" loading="lazy" title="Studio location" />
              </div>
            )}
          </div>

          <AnimatedSection delay={0.15} className="lg:col-span-7 lg:col-start-6">
            <InquiryForm serviceOptions={settings.serviceInterestOptions} budgetOptions={settings.budgetRangeOptions} />
          </AnimatedSection>
        </div>
      </div>
    </div>
  );
}
