import type { Metadata } from "next";
import { Archivo, IBM_Plex_Sans } from "next/font/google";
import "../(frontend)/globals.css";

// Same pairing as the public site: Archivo for display, IBM Plex Sans for body.
const bodyFont = IBM_Plex_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const displayFont = Archivo({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Admin — DGB India Enterprise",
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${bodyFont.variable} ${displayFont.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-surface text-foreground">{children}</body>
    </html>
  );
}
