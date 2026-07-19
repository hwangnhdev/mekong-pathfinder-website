import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.*.*", "172.19.*.*", "*.ngrok-free.app", "*.ngrok.io"],
};

export default nextConfig;
