/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    instrumentationHook: true, // only keep if you actually use instrumentation.js
  },
  reactStrictMode: true,
  swcMinify: true,
  basePath: "/fin-customer", // 👈 important
  assetPrefix: "/fin-customer/", // 👈 ensures JS/CSS chunks load correctly
};

export default nextConfig;
