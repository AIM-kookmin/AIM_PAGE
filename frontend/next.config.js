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
}

module.exports = nextConfig
