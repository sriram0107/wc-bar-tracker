import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // react-map-gl pulls in mapbox-gl; transpile for Next bundler
  transpilePackages: ["react-map-gl"],
};

export default nextConfig;
