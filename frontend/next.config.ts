import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/portfolio/:username',
        destination: 'http://127.0.0.1:8000/portfolio/:username',
      },
    ]
  }
};

export default nextConfig;
