import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  transpilePackages: ["@suistody/core"],
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "@mysten/sui/transactions": path.resolve(
        process.cwd(),
        "node_modules/@mysten/sui/dist/transactions/index.mjs"
      ),
    };
    return config;
  },
};

export default nextConfig;
