import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'flagcdn.com',
        pathname: '/**',
      },
      {
        // Placeholder for player images hosted externally
        protocol: 'https',
        hostname: '*.githubusercontent.com',
        pathname: '/**',
      },
    ],
  },
  // Avoids que Prisma rompa el build en edge runtime
  serverExternalPackages: ['@prisma/client', '@prisma/adapter-pg', 'pg'],
}

export default nextConfig
