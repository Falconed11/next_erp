// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   images: {
//     domains: [process.env.MAIN_DOMAIN],
//   },
// };

// module.exports = nextConfig;

const allowedDevOrigins = [
  ...(process.env.ALLOWED_DEV_ORIGINS ? [process.env.ALLOWED_DEV_ORIGINS] : []),
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins,
  images: {
    remotePatterns: [
      {
        protocol: "http", // use https if your Express is behind SSL
        hostname: process.env.MAIN_DOMAIN,
        port: process.env.EXPRESS_PORT,
        pathname: "/logo/**",
      },
    ],
  },
};

module.exports = nextConfig;
