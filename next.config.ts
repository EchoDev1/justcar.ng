import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */

  // Optimize icon imports for better performance
  experimental: {
    optimizePackageImports: ['lucide-react'],
    // Enable optimized CSS loading
    optimizeCss: true,
  },

  // Enable compiler optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // Image optimization settings
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'bgwxyqjrljfieqifyeqf.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'api.dicebear.com',
        pathname: '/**',
      },
    ],
  },

  // Enable compression
  compress: true,

  // PoweredBy header removal for security
  poweredByHeader: false,

  // Production source maps
  productionBrowserSourceMaps: false,

  // React strict mode
  reactStrictMode: true,
};

export default nextConfig;
