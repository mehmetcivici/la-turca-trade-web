import type { NextConfig } from "next";

// Tamamen statik site: `npm run build` → out/ (cPanel public_html'e açılır).
// GitHub Pages önizlemesi: PAGES_BASE_PATH=/la-turca-trade-web PREVIEW=1 npm run build
const basePath = process.env.PAGES_BASE_PATH || "";

const nextConfig: NextConfig = {
  basePath,
  // Hostinger derlemesinde JS/CSS/fontlar GitHub Pages'ten (paylaşımlı sunucuya yük binmesin)
  assetPrefix: process.env.ASSET_PREFIX || undefined,
  distDir: process.env.NEXT_DIST_DIR || ".next",
  env: { NEXT_PUBLIC_BASE_PATH: basePath, NEXT_PUBLIC_PREVIEW: process.env.PREVIEW || "", NEXT_PUBLIC_ASSET_CDN: process.env.ASSET_CDN || "" },
  reactStrictMode: true,
  poweredByHeader: false,
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  experimental: { globalNotFound: true },
};

export default nextConfig;
