import process from "node:process"

// Django, as the Next server reaches it: the catalog and the session are read
// there on the server (src/lib/django.ts). The browser talks to /api on this
// origin, so the session and CSRF cookies belong to the store's domain
// (docs/architecture/auth.md). Read at build time: rewrites are baked into the
// build, so changing it means building again.
const apiUrl = process.env.API_URL ?? "http://localhost:8000"

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@workspace/ui"],
  cacheComponents: true,
  // DRF routes end in a slash: Next's redirect from /x/ to /x would break them.
  skipTrailingSlashRedirect: true,
  async rewrites() {
    return [
      // The slash on its own rule: `:path*` alone drops it.
      { source: "/api/:path*/", destination: `${apiUrl}/:path*/` },
      { source: "/api/:path*", destination: `${apiUrl}/:path*` },
    ]
  },
}

export default nextConfig
