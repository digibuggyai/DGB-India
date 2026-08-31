import type { Metadata } from "next";
import { Suspense } from "react";
import { Geist, Geist_Mono, Space_Grotesk } from "next/font/google";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { RouteProgress } from "@/components/ui/RouteProgress";
import { getSiteSettings } from "@/lib/content";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  const title = settings?.defaultSeo?.title || `${settings?.siteName || "Digibuggy Enterprise"} — Your Workload. Our Infrastructure.`;
  const description =
    settings?.defaultSeo?.description ||
    "Digibuggy Enterprise designs, engineers and supports the compute, storage, networking and data-protection infrastructure behind demanding enterprise workloads.";
  return {
    title: {
      default: title,
      template: `%s — ${settings?.siteName || "Digibuggy Enterprise"}`,
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
    name: settings?.siteName || "Digibuggy Enterprise",
    alternateName: "DGB India",
    url: base,
    slogan: settings?.tagline || "Your Workload. Our Infrastructure.",
    ...(settings?.contact?.email ? { email: settings.contact.email } : {}),
    ...(settings?.contact?.phone ? { telephone: settings.contact.phone } : {}),
  };

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${spaceGrotesk.variable} h-full antialiased`}
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
      </body>
    </html>
  );
}
