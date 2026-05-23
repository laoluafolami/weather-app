import type { NextConfig } from "next";
// @ts-ignore - next-pwa doesn't have types
import withPWA from "next-pwa";

const nextConfig: NextConfig = {
  output: "standalone",
  turbopack: {}, // Enable Turbopack explicitly
};

export default withPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
  buildExcludes: [/middleware-manifest\.json$/],
})(nextConfig);


