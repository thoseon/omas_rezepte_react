import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
};
module.exports = {
  images: {
    remotePatterns: [{ protocol: "https", hostname: "*.supabase.co" }],
  },
};
export default nextConfig;
