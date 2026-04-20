/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: 'http', hostname: 'localhost' },
      { protocol: 'https', hostname: 'api.techwholesale.com' }
    ]
  },
  env: {
    API_URL: process.env.NEXT_PUBLIC_API_URL
  },
  poweredByHeader: false,
  compress: true,
  pageExtensions: ['js', 'jsx']
};

module.exports = nextConfig;
