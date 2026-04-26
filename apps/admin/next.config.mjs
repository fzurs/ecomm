import webpackConfig from "@workspace/next-config/webpack"

/** @type {import('next').NextConfig} */
const nextConfig = {
  ...webpackConfig,
  transpilePackages: ["@workspace/ui"],
}

export default nextConfig