/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'backend',
        port: '8000',
      },
      {
        protocol: 'https',
        hostname: '*.railway.app',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
    ],
  },
  // Proxy API requests to Django backend
  async rewrites() {
    const backendUrl = process.env.BACKEND_URL || 'http://backend:8000'
    return [
      {
        source: '/api/auth/:path*',
        destination: `${backendUrl}/api/auth/:path*`,
      },
      {
        source: '/api/todos',
        destination: `${backendUrl}/api/todos`,
      },
      {
        source: '/api/todos/:id',
        destination: `${backendUrl}/api/todos/:id`,
      },
      {
        source: '/media/:path*',
        destination: `${backendUrl}/media/:path*`,
      },
    ]
  },
}

export default nextConfig
