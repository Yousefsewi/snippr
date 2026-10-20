import type { Metadata } from "next";
import { Geist, Geist_Mono, Noto_Serif } from "next/font/google";
import "./globals.css";
import CookieConsent from "@/components/cookie-consent";
import TopLoader from "@/components/top-loader";

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

export const metadata: Metadata = {
  title: "Snippr — Premium Barber Booking",
  description: "Book your barber appointment in seconds.",
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
