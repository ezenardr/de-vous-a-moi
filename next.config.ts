import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  experimental: {
    serverActions: {
      bodySizeLimit: "4mb",
    },
  },
  images: {
    // AVIF first (usually 20-30% smaller than WebP for photos), WebP for browsers without it.
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      // Images uploaded before the move to S3; drop once they are migrated.
      {
        protocol: "https",
        hostname: "nyc.cloud.appwrite.io",
      },
      // S3 through CloudFront: only this site's folders of the shared bucket (see src/server/storage.ts).
      ...(process.env.AWS_CLOUDFRONT_URL
        ? [{ protocol: "https" as const, hostname: new URL(process.env.AWS_CLOUDFRONT_URL).hostname, pathname: "/*/de-vous-a-moi/**" }]
        : []),
    ],
  },
};

export default nextConfig;
