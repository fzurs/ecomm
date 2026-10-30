import process from "node:process"

// Django, as the Next server reaches it: the catalog and the session are read
// there on the server (src/lib/django.ts). The browser talks to /api on this
// origin, so the session and CSRF cookies belong to the store's domain
// (docs/architecture/auth.md). Read at build time: rewrites are baked into the
// build, so changing it means building again.
const apiUrl = process.env.API_URL ?? "http://localhost:8000"

// Where the product images are: Django's MEDIA_URL (the same value), a public
// URL. next/image fetches them from there to resize them. Read at build time.
const mediaUrl = new URL(process.env.MEDIA_URL ?? "http://localhost:8000/media/")

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@workspace/ui"],
  cacheComponents: true,
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
  // A brand is a filter of the listings, not a page: its old links keep working.
  async redirects() {
    return [
      { source: "/brands", destination: "/", permanent: true },
      { source: "/brands/:slug", destination: "/?brand=:slug", permanent: true },
    ]
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
