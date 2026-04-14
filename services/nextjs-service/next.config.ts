import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  serverExternalPackages: ["prom-client", "@opentelemetry/sdk-node"],
};

export default nextConfig;
