import type { Metadata } from "next";
import { Suspense } from "react";
import { Geist_Mono, Archivo, IBM_Plex_Sans } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { RouteProgress } from "@/components/ui/RouteProgress";
import { getSiteSettings } from "@/lib/content";
import "./globals.css";

const bodyFont = IBM_Plex_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const archivo = Archivo({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  const title = settings?.siteName || "DGB India Enterprise";
  const description =
    settings?.defaultSeo?.description ||
    "DGB India Enterprise designs, engineers and supports the compute, storage, networking and data-protection infrastructure behind demanding enterprise workloads.";
  return {
    title: {
      default: title,
      template: `%s — ${settings?.siteName || "DGB India Enterprise"}`,
    },
    description,
    metadataBase: new URL(process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000"),
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSiteSettings();
  const base = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000";

  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: settings?.siteName || "DGB India Enterprise",
    alternateName: "DGB India",
    url: base,
    slogan: settings?.tagline || "Your Workload. Our Infrastructure.",
    ...(settings?.contact?.email ? { email: settings.contact.email } : {}),
    ...(settings?.contact?.phone ? { telephone: settings.contact.phone } : {}),
  };

  return (
    <html
      lang="en"
      className={`${bodyFont.variable} ${geistMono.variable} ${archivo.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
        <Suspense fallback={null}>
          <RouteProgress />
        </Suspense>
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <Analytics />
      </body>
    </html>
  );
}
