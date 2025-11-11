/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    DATABASE_URL: process.env.DATABASE_URL,
    DIRECT_URL: process.env.DIRECT_URL,
  },
  
  // Optimize chunk loading and caching
  // Helps prevent ChunkLoadError issues during deployments
  webpack: (config, { isServer, dev }) => {
    if (!isServer) {
      // Improve chunk loading reliability
      config.optimization = {
        ...config.optimization,
        runtimeChunk: 'single',
      }
      
      // Add chunk load error handler for better error recovery
      if (!dev) {
        config.output = {
          ...config.output,
          chunkLoadTimeout: 120000, // 2 minutes timeout
        }
      }
    }
    return config
  },
  
  // Add headers for better caching control - CRITICAL for chunk loading
  async headers() {
    return [
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: process.env.NODE_ENV === 'production'
              ? 'public, max-age=31536000, immutable'
              : 'public, max-age=0, must-revalidate', // No cache in dev
          },
        ],
      },
    ]
  },
  
  // Enable experimental features for better chunk handling
  experimental: {
    // Improve chunk loading stability
    optimizePackageImports: ['lucide-react'],
  },
}

module.exports = nextConfig
