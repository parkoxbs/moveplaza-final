import type { NextConfig } from "next";

// @ts-expect-error: next-pwa는 타입 정의 파일이 없어서 에러가 날 수 있음 (무시해도 됨)
const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
});

const nextConfig: NextConfig = {
  // 여기에 다른 설정이 있다면 추가 가능
};

export default withPWA(nextConfig);