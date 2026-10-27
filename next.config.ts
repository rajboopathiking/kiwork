import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Prototype: pages render per-request (auth in navbar + live DB reads).
  // Re-enable cacheComponents + Suspense boundaries in a later perf pass.
  cacheComponents: false,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
