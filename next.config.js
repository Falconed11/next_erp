/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [process.env.MAIN_DOMAIN],
  },
};

module.exports = nextConfig;
