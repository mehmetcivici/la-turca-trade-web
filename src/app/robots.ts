import type { MetadataRoute } from "next";
import { site } from "@/content/site";
import { IS_PREVIEW } from "@/lib/asset";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  if (IS_PREVIEW) return { rules: [{ userAgent: "*", disallow: "/" }] };
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/contact.php"] }],
    sitemap: `${site.url}/sitemap.xml`,
    host: site.url,
  };
}
