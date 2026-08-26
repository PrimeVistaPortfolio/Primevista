import { Familjen_Grotesk } from "next/font/google";
import "./globals.css";
import { getSiteSettings, getServiceCategories } from "@/lib/data";
import { organizationJsonLd, toNextMetadata, resolveSeo, SITE_URL } from "@/lib/seo";
import { resolveBaseTheme } from "@primevista/shared";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ThemedRegion from "@/components/layout/ThemedRegion";
import Preloader from "@/components/layout/Preloader";
import SmoothScrollProvider from "@/components/providers/SmoothScrollProvider";
import CustomCursor from "@/components/ui/CustomCursor";
import ScrollToTop from "@/components/ui/ScrollToTop";

// A single typeface for the whole site. Variable weight + a true italic give
// enough range to build hierarchy without introducing a second family.
const familjen = Familjen_Grotesk({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-sans",
  display: "swap",
});

export async function generateMetadata() {
  const settings = await getSiteSettings();
  const seo = resolveSeo({ seo: settings.defaultSeo, fallbackName: settings.siteName, settings, pathname: "" });
  return {
    metadataBase: new URL(SITE_URL),
    ...toNextMetadata(seo),
    icons: settings.favicon?.url ? { icon: settings.favicon.url } : undefined,
  };
}

export default async function RootLayout({ children }) {
  const [settings, serviceCategories] = await Promise.all([getSiteSettings(), getServiceCategories()]);

  // Base theme lives on <html> so the token defaults cascade to everything,
  // including portals and the fixed header. Individual regions override it.
  const baseTheme = resolveBaseTheme(settings);

  return (
    <html lang="en" className={`${familjen.variable} theme-${baseTheme}`}>
      <body style={{ "--color-accent": settings.themeColor || "#3B82F6" }}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd(settings)) }}
        />
        {/* Sits behind the content layer; opaque .theme-light bands cover it,
            which keeps the effect to the dark sections only. */}
        {/* <div className="aurora" aria-hidden="true">
          <span />
          <span />
          <span />
        </div> */}

        <div className="grain-overlay animate-grain" aria-hidden="true" />
        <CustomCursor />
        <Preloader siteName={settings.siteName} />

        <SmoothScrollProvider>
          <div className="relative z-10">
            <ThemedRegion settings={settings} region="navbar">
              <Navbar settings={settings} categories={serviceCategories} />
            </ThemedRegion>
            <main>{children}</main>
            <ThemedRegion settings={settings} region="footer">
              <Footer settings={settings} />
            </ThemedRegion>
          </div>
          {/* Inside the provider so Lenis is already registered when it mounts. */}
          <ScrollToTop />
        </SmoothScrollProvider>
      </body>
    </html>
  );
}
