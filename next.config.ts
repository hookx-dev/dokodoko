import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
});

const nextConfig: NextConfig = {
  output: "export",
  images: { unoptimized: true },
  allowedDevOrigins: ['192.168.1.4'],
  turbopack: {}, // @ducanh2912/next-pwa がwebpack設定を追加するため、Turbopack環境でのエラーを回避
};

export default withPWA(nextConfig);
