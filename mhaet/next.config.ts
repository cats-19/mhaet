import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The sandbox preview proxies the dev server from a different host, so the
  // dev-only cross-origin check has to allow those origins.
  allowedDevOrigins: [
    "*.e2b.app",
    "*.arena.site",
    "localhost",
    "127.0.0.1",
  ],
};

export default nextConfig;
