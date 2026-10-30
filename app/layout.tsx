import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Noto_Serif } from "next/font/google";
import "./globals.css";
import CookieConsent from "@/components/cookie-consent";
import TopLoader from "@/components/top-loader";
import { SITE_URL } from "@/lib/site-url";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const notoSerif = Noto_Serif({
  variable: "--font-noto-serif",
  subsets: ["latin"],
});

// viewportFit cover: lets the phone tab bar sit above the iPhone home indicator (safe-area insets)
export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover" };

export const metadata: Metadata = {
  title: "Snippr — Premium Barber Booking",
  description: "Book your barber appointment in seconds.",
  // All links in tags point at the real address (SITE_URL), even when the site is opened
  // on another address such as the old *.vercel.app one. "./" = the current page's own path.
  metadataBase: new URL(SITE_URL),
  alternates: { canonical: "./" },
  openGraph: { url: "./", siteName: "Snippr", type: "website" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${notoSerif.variable} antialiased dark`}
      style={{ background: "#000000" }}
    >
      <body style={{ background: "#000000", color: "#ffffff", margin: 0 }}>
        <TopLoader />
        {children}
        <CookieConsent />
      </body>
    </html>
  );
}
