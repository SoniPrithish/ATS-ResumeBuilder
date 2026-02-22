import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /** Enable React strict mode for development best practices */
  reactStrictMode: true,

  /** Experimental features */
  experimental: {
    /** Server actions are enabled by default in Next 15+ */
    serverActions: {
      bodySizeLimit: "5mb",
    },
  },

  /** Image optimization config */
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
    ],
  },

  /** Turbopack config (Next 16 default bundler) */
  turbopack: {},

  /** Webpack fallback for pdf-parse in server environment */
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = [...(config.externals || []), "canvas"];
    }
    return config;
  },

  /** Redirect www to non-www */
  async redirects() {
    return [];
  },
};

export default nextConfig;
