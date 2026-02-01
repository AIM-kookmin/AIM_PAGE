/** @type {import('next').NextConfig} */
const nextConfig = {
  // serverComponentsExternalPackages → serverExternalPackages (Next.js 15+)
  serverExternalPackages: ['@prisma/client'],

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.amazonaws.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.cloudfront.net',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.supabase.co',
        port: '',
        pathname: '/**',
      },
    ],
  },

  env: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
  },

  // React 19 호환성
  reactStrictMode: true,

  // 외부 패키지 최적화 제외 (Framer Motion, GSAP)
  transpilePackages: ['framer-motion', 'gsap', '@gsap/react'],

  // 성능 최적화
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // 번들 최적화
  experimental: {
    optimizePackageImports: ['framer-motion', 'gsap', '@react-three/fiber', '@react-three/drei'],
  },

  // Webpack 최적화
  webpack: (config, { isServer }) => {
    // 3D 라이브러리는 클라이언트에서만 사용
    if (!isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            three: {
              test: /[\\/]node_modules[\\/](three|@react-three)[\\/]/,
              name: 'three',
              priority: 10,
            },
            animations: {
              test: /[\\/]node_modules[\\/](framer-motion|gsap)[\\/]/,
              name: 'animations',
              priority: 9,
            },
          },
        },
      }
    }
    return config
  },
}

module.exports = nextConfig
