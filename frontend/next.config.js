/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    // Linting is run separately in CI; don't fail local builds on it.
    ignoreDuringBuilds: true,
  },
  webpack: (config) => {
    // pdfjs-dist statically references an optional `canvas` binding for
    // server-side rendering that this app never uses (PDF parsing only runs
    // in the browser, via Detector.tsx) — without this, webpack fails to
    // resolve it since the native package isn't installed.
    config.resolve.alias.canvas = false;
    return config;
  },
};

module.exports = nextConfig;
