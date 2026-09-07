import type { Metadata } from "next";
import { IBM_Plex_Sans } from "next/font/google";
import "../(frontend)/globals.css";

const bodyFont = IBM_Plex_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Admin — DGB India Enterprise",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${bodyFont.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-ink-800 text-white">{children}</body>
    </html>
  );
}
