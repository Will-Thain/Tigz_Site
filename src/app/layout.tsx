import type { Metadata } from "next";
import { Barlow_Condensed, IBM_Plex_Mono, Roboto_Condensed, Source_Sans_3 } from "next/font/google";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import "./globals.css";

const display = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
});

const sans = Source_Sans_3({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-sans",
});

const roboto = Roboto_Condensed({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-roboto",
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
const description =
  "Watch Tigz live on Twitch. Tarkov kit, quest board, schedule, FAQs, polls, and brand partnerships — then go to twitch.tv/tigz.";

export const metadata: Metadata = {
  title: {
    default: "Tigz — Tarkov hub",
    template: "%s · Tigz",
  },
  description,
  metadataBase: new URL(siteUrl),
  alternates: { canonical: "/" },
  keywords: ["Tigz", "Twitch", "Escape from Tarkov", "kit", "schedule", "polls"],
  openGraph: {
    title: "Tigz — Tarkov hub",
    description,
    url: siteUrl,
    siteName: "Tigz",
    type: "website",
    locale: "en_GB",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tigz — Tarkov hub",
    description,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${display.variable} ${sans.variable} ${mono.variable} ${roboto.variable} font-sans antialiased`}>
        <div className="flex min-h-screen flex-col">
          <SiteHeader />
          <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6">{children}</main>
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
