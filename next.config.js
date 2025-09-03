// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   images: {
//     domains: [process.env.MAIN_DOMAIN],
//   },
// };

// module.exports = nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "http", // use https if your Express is behind SSL
        hostname: process.env.MAIN_DOMAIN,
        port: process.env.EXPRESS_PORT,
      },
    ],
  },
};

module.exports = nextConfig;
