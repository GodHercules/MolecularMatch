/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@molecular-match/shared"],
  experimental: {
    typedRoutes: false,
    externalDir: true
  }
};

export default nextConfig;
