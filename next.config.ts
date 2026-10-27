import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  // The TTS route reads verses and translations from disk at request time.
  outputFileTracingIncludes: {
    "/api/tts": ["./content/**/*"],
  },
};

export default nextConfig;
