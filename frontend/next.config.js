const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    poweredByHeader: false,
    compress: true,
    output: 'standalone',
    experimental: {
        optimizePackageImports: ['react-icons', '@fortawesome/free-solid-svg-icons'],
    },
    turbopack: {
        root: path.resolve(__dirname),
    },
};

module.exports = nextConfig;
