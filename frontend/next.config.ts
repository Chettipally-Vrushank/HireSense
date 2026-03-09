import type { NextConfig } from "next";

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

const nextConfig: NextConfig = {
  output: "standalone",
  async rewrites() {
    return [
      {
        source: '/portfolio/:username',
        destination: `${apiUrl}/portfolio/:username`,
      },
    ]
  }
};

export default nextConfig;
