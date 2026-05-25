// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   images: {
//     domains: [process.env.MAIN_DOMAIN],
//   },
// };

// module.exports = nextConfig;

const allowedDevOrigins = process.env.ALLOWED_DEV_ORIGINS
  ? process.env.ALLOWED_DEV_ORIGINS.split(",")
  : [];
console.log("Allowed development origins:", allowedDevOrigins);
/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins,
  // basePath: process.env.BASE_PATH,
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
  async rewrites() {
    return [
      {
        source: "/api/express/:path*",
        destination: "http://127.0.0.1:3001/api/:path*",
      },
    ];
  },
};

export default nextConfig;
