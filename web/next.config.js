/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    unoptimized: true, // For Hostinger compatibility
    domains: ['localhost', 'api.techwholesale.com']
  },
  env: {
    API_URL: process.env.NEXT_PUBLIC_API_URL
  },
  poweredByHeader: false,
  compress: true,
  generateEtags: true,
  pageExtensions: ['js', 'jsx'],
  productionBrowserSourceMaps: false,
  optimizeFonts: true,
  experimental: {}
};

module.exports = nextConfig;
