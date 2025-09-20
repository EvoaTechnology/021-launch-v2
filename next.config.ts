import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images:{
    domains:['i.pinimg.com'],
  },
  eslint: {
    // ✅ Skip ESLint errors during Vercel builds
    ignoreDuringBuilds: true,
  },

};

export default nextConfig;
