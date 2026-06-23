/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Allow Next.js <Image> to serve from the same origin (Vercel)
    remotePatterns: [],
  },
};

module.exports = nextConfig;