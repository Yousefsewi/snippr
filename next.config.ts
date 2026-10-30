import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  // The site address is not secret: pass it to browser code too (read via lib/site-url.ts).
  env: { SITE_URL: process.env.SITE_URL ?? "" },
};

export default nextConfig;
