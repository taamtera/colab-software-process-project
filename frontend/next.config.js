const { PHASE_DEVELOPMENT_SERVER } = require('next/constants');

/** @param {string} phase @returns {import('next').NextConfig} */
const nextConfig = (phase) => ({
  // Production builds must not overwrite a running dev server's manifests.
  distDir: phase === PHASE_DEVELOPMENT_SERVER ? '.next-dev' : process.env.NEXT_BUILD_DIR || '.next',
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
});

module.exports = nextConfig;
