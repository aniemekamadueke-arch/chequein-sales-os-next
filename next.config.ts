import type { NextConfig } from "next";

const repo = "chequein-sales-os-next";
const githubPages = process.env.GITHUB_PAGES === "true";

const nextConfig: NextConfig = {
  output: "export",
  allowedDevOrigins: ["127.0.0.1", "localhost", "192.168.1.188"],
  devIndicators: false,
  trailingSlash: true,
  images: { unoptimized: true },
  ...(githubPages ? { basePath: `/${repo}`, assetPrefix: `/${repo}/` } : {}),
};

export default nextConfig;
