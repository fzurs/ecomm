import process from "node:process"
import { fileURLToPath } from "node:url"

// Django, as the Next server reaches it. The browser never does: it talks to
// /api on this origin, so the session and CSRF cookies belong to the admin's
// domain (docs/architecture/auth.md). Read at build time: rewrites are baked
// into the build, so changing it means building again.
const apiUrl = process.env.API_URL ?? "http://localhost:8000"

// Where the images of products and customers are: Django's MEDIA_URL (the same
// value), a public URL. next/image fetches them from there to resize them
// (MediaAvatarImage). Read at build time.
const mediaUrl = new URL(
  process.env.MEDIA_URL ?? "http://localhost:8000/media/"
)

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Production runs the standalone server (apps/admin/Dockerfile). Traced from
  // the repo's root, so packages/* go in too.
  output: "standalone",
  outputFileTracingRoot: fileURLToPath(new URL("../..", import.meta.url)),
  transpilePackages: ["@workspace/ui"],
  // DRF routes end in a slash: Next's redirect from /x/ to /x would break them.
  skipTrailingSlashRedirect: true,
  images: {
    remotePatterns: [
      {
        protocol: mediaUrl.protocol.replace(":", ""),
        hostname: mediaUrl.hostname,
        port: mediaUrl.port,
        pathname: `${mediaUrl.pathname}**`,
      },
    ],
    // Next won't fetch images from a local address (localhost's Django in dev)
    // unless allowed; in production they come from a public one.
    dangerouslyAllowLocalIP: process.env.NODE_ENV === "development",
  },
  async rewrites() {
    return [
      // The slash on its own rule: `:path*` alone drops it.
      { source: "/api/:path*/", destination: `${apiUrl}/:path*/` },
      { source: "/api/:path*", destination: `${apiUrl}/:path*` },
    ]
  },
}

export default nextConfig
