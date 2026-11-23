import type { Metadata, Viewport } from "next";
import { geistSans, geistMono, notoSerif } from "@/lib/fonts";
import "./globals.css";
import CookieConsent from "@/components/cookie-consent";
import TopLoader from "@/components/top-loader";
import { SITE_URL } from "@/lib/site-url";


// viewportFit cover: lets the phone tab bar sit above the iPhone home indicator (safe-area insets)
export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover" };

export const metadata: Metadata = {
  title: "Snippr — Online Booking for Barbers & Salons",
  description: "Online booking for barbers and salons. Put your link in your bio or on Instagram, or hang up your QR code — clients book in seconds.",
  // All links in tags point at the real address (SITE_URL), even when the site is opened
  // on another address such as the old *.vercel.app one. "./" = the current page's own path.
  metadataBase: new URL(SITE_URL),
  alternates: { canonical: "./" },
  // Link previews on WhatsApp, Instagram, iMessage, Facebook and X: a 1200×630 picture
  // (public/og.jpg) and the large card on X. Booking pages set their own title (app/b/[slug]/layout.tsx).
  openGraph: {
    url: "./", siteName: "Snippr", type: "website",
    title: "Snippr — Online booking for barbers and salons",
    description: "Put your link in your bio or on Instagram, or hang up your QR code — clients book in seconds.",
    images: [{ url: "/og.jpg", width: 1200, height: 630, alt: "Snippr — Never miss a single client" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Snippr — Online booking for barbers and salons",
    description: "Put your link in your bio or on Instagram, or hang up your QR code — clients book in seconds.",
    images: ["/og.jpg"],
  },
};

const SITE_JSONLD = {
  "@context": "https://schema.org",
  "@graph": [
    { "@type": "Organization", "@id": `${SITE_URL}/#org`, name: "Snippr", url: SITE_URL, logo: `${SITE_URL}/icon-512.png`, email: "snipprcalendar@gmail.com" },
    { "@type": "WebSite", "@id": `${SITE_URL}/#site`, name: "Snippr", url: SITE_URL, publisher: { "@id": `${SITE_URL}/#org` }, inLanguage: ["en", "nl", "de", "tr", "ar"] },
  ],
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
        {/* Structured data for search engines: who runs the site and what it is called */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(SITE_JSONLD) }} />
        {children}
        <CookieConsent />
      </body>
    </html>
  );
}
