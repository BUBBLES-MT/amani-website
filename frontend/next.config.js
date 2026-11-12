/** @type {import('next').NextConfig} */
const nextConfig = {
  // ===== TURBOPACK (Required for Next.js 16) =====
  turbopack: {},

  // ===== IMAGES =====
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
        pathname: '**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: '*.cloudinary.com',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
        pathname: '**',
      },
    ],
    unoptimized: process.env.NODE_ENV === 'development',
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // ===== TYPESCRIPT =====
  typescript: {
    ignoreBuildErrors: true,
  },

  // ===== EXPERIMENTAL =====
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000', 'localhost:3001', '*.vercel.app'],
      bodySizeLimit: '2mb',
    },
    optimizePackageImports: [
      'react-icons',
      'framer-motion',
      'date-fns',
      'lodash',
      'recharts',
      'react-hot-toast',
    ],
    // ✅ viewTransition imeondolewa - Next.js 16 haiitambui
    // optimizeCss imeondolewa - Next.js 16 haiitambui
  },

  // ===== ENVIRONMENT =====
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
    NEXT_PUBLIC_APP_NAME: 'Kanisa Letu',
    NEXT_PUBLIC_APP_VERSION: '1.0.0',
    NEXT_PUBLIC_APP_ENV: process.env.NODE_ENV || 'development',
  },

  // ===== COMPILER =====
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },

  // ===== PERFORMANCE =====
  compress: true,
  generateEtags: true,
  poweredByHeader: false,
  trailingSlash: false,

  // ✅ swcMinify imeondolewa - Next.js 16 inaitumia default
  reactStrictMode: true,

  // ===== LOGGING =====
  logging: {
    fetches: {
      fullUrl: true,
    },
  },

  // ===== DEV INDICATOR =====
  devIndicators: {
    buildActivity: true,
    buildActivityPosition: 'bottom-right',
  },

  // ===== REDIRECTS =====
  async redirects() {
    return [
      {
        source: '/admin',
        destination: '/admin/dashboard',
        permanent: true,
      },
      {
        source: '/login',
        destination: '/admin/login',
        permanent: true,
      },
    ]
  },

  // ===== REWRITES =====
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/:path*`,
      },
    ]
  },

  // ===== HEADERS =====
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig