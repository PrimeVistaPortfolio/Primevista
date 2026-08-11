const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

/**
 * Resolves a page/entity's meta title & description, falling back to a
 * generated default (name + site's configurable template) when the admin
 * hasn't filled in custom SEO fields — so nothing ships with blank meta.
 */
export function resolveSeo({ seo, fallbackName, settings, pathname }) {
  const template = settings?.metaTitleTemplate || "{name} | PrimeVista Technologies";
  const metaTitle = seo?.metaTitle?.trim() || template.replace("{name}", fallbackName);
  const metaDescription =
    seo?.metaDescription?.trim() ||
    settings?.defaultSeo?.metaDescription ||
    `${fallbackName} — built by PrimeVista Technologies.`;
  const canonicalUrl = seo?.canonicalUrl?.trim() || `${SITE_URL}${pathname || ""}`;
  const ogImage = seo?.ogImage?.url || settings?.defaultSeo?.ogImage?.url || null;

  return { metaTitle, metaDescription, canonicalUrl, ogImage, noIndex: !!seo?.noIndex };
}

export function toNextMetadata({ metaTitle, metaDescription, canonicalUrl, ogImage, noIndex }) {
  return {
    title: metaTitle,
    description: metaDescription,
    alternates: { canonical: canonicalUrl },
    robots: noIndex ? { index: false, follow: false } : { index: true, follow: true },
    openGraph: {
      title: metaTitle,
      description: metaDescription,
      url: canonicalUrl,
      type: "website",
      images: ogImage ? [{ url: ogImage }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: metaTitle,
      description: metaDescription,
      images: ogImage ? [ogImage] : [],
    },
  };
}

export function organizationJsonLd(settings) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: settings?.siteName || "PrimeVista Technologies",
    url: SITE_URL,
    logo: settings?.logoLight?.url || settings?.logoDark?.url || undefined,
    sameAs: Object.values(settings?.socialLinks || {}).filter(Boolean),
    contactPoint: settings?.contactEmail
      ? [
          {
            "@type": "ContactPoint",
            email: settings.contactEmail,
            telephone: settings.contactPhone || undefined,
            contactType: "customer service",
          },
        ]
      : undefined,
  };
}

export function breadcrumbJsonLd(items) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `${SITE_URL}${item.path}`,
    })),
  };
}

export function serviceJsonLd(service, settings) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.title,
    description: service.shortDescription,
    url: `${SITE_URL}/services/${service.slug}`,
    serviceType: service.title,
    provider: {
      "@type": "Organization",
      name: settings?.siteName || "PrimeVista Technologies",
      url: SITE_URL,
    },
  };
}

export function projectJsonLd(project) {
  return {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: project.title,
    description: project.description,
    url: `${SITE_URL}/projects/${project.slug}`,
    image: project.coverImage?.url,
    keywords: project.tags?.join(", "),
  };
}

export { SITE_URL };
