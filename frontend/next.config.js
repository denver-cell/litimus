/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    // Linting is run separately in CI; don't fail local builds on it.
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
