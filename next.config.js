/** @type {import('next').NextConfig} */
const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});

const nextConfig = {
  images: {
    domains: ["bima-back-production.up.railway.app"],
    remotePatterns: [
      {
        protocol: "http",
        hostname: "bima-back-production.up.railway.app",
        port: '',
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "bima-back-production.up.railway.app",
        port: '',
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
    ],
    // Optimize image loading
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    formats: ["image/webp"],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    disableStaticImages: false,
    unoptimized: false,
  },
  // Enable Fast Refresh for faster development experience
  reactStrictMode: true,
  // Improve performance
  compress: true,
  // Configure image optimization
  swcMinify: true,
  // Disable React DevTools in production
  experimental: {
    optimizeCss: true,
    // Performance optimizations
    optimizeServerReact: true,
    optimizePackageImports: ["@heroui/button"],
    // Only enable this in development as needed
    // fastRefresh: process.env.NODE_ENV === 'development',
  },
  webpack: (config, { dev, isServer }) => {
    // Suppress deprecation warnings
    config.ignoreWarnings = [
      {
        message: /.*DeprecationWarning: The `punycode` module is deprecated.*/,
      },
    ];

    // Disable cache in development
    if (dev) {
      config.cache = false;
    }

    return config;
  },
};

module.exports = withBundleAnalyzer(nextConfig);
