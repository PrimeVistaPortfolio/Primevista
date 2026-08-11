import Link from "next/link";

export default function Footer({ settings }) {
  const socials = Object.entries(settings?.socialLinks || {}).filter(([, v]) => v);
  const siteName = settings?.siteName || "PrimeVista Technologies";

  return (
    <footer className="border-t border-rule">
      <div className="mx-auto max-w-container px-6 py-20">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            {/* Availability status — a live signal, not just contact details. */}
            <span className="mb-8 inline-flex items-center gap-2 rounded-full border border-rule px-4 py-2">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-70" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
              </span>
              <span className="label !text-ink">Available for new projects</span>
            </span>

            <p className="label">Start a conversation</p>
            {settings?.contactEmail && (
              <a
                href={`mailto:${settings.contactEmail}`}
                data-cursor="hover"
                className="display mt-5 block text-[clamp(1.75rem,4vw,3rem)] leading-none text-ink transition-colors hover:text-accent"
              >
                {settings.contactEmail}
              </a>
            )}
            {settings?.contactPhone && <p className="mt-4 text-ink-muted">{settings.contactPhone}</p>}
          </div>

          <div className="lg:col-span-3 lg:col-start-7">
            <p className="label mb-5">Menu</p>
            <ul className="space-y-3 text-sm">
              {[
                { href: "/projects", label: "Work" },
                { href: "/services", label: "Services" },
                { href: "/about", label: "About" },
                { href: "/contact", label: "Contact" },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="link-underline text-ink-muted hover:text-ink" data-cursor="hover">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {socials.length > 0 && (
            <div className="lg:col-span-3">
              <p className="label mb-5">Elsewhere</p>
              <ul className="space-y-3 text-sm">
                {socials.map(([key, url]) => (
                  <li key={key}>
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      data-cursor="hover"
                      className="link-underline capitalize text-ink-muted hover:text-ink"
                    >
                      {key}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="mt-20 flex flex-wrap items-center justify-between gap-4 border-t border-rule pt-6">
          <span className="label">
            © {new Date().getFullYear()} {siteName}
          </span>
          {settings?.address && <span className="label hidden sm:block">{settings.address}</span>}
          <span className="label">All rights reserved</span>
        </div>
      </div>
    </footer>
  );
}
