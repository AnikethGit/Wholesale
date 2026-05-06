const path = require('path');

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
  pageExtensions: ['js', 'jsx'],
  webpack: (config) => {
    // Point all React imports to the single copy in the monorepo root node_modules
    const rootNodeModules = path.resolve(__dirname, '..', 'node_modules');
    config.resolve.alias = {
      ...config.resolve.alias,
      react: path.join(rootNodeModules, 'react'),
      'react-dom': path.join(rootNodeModules, 'react-dom'),
      'react/jsx-runtime': path.join(rootNodeModules, 'react', 'jsx-runtime'),
      'react/jsx-dev-runtime': path.join(rootNodeModules, 'react', 'jsx-dev-runtime'),
    };
    return config;
  },
};

module.exports = nextConfig;
