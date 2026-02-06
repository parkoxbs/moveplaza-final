import type { NextConfig } from "next";
// @ts-ignore: 라이브러리 타입 에러 무시
import withPWAInit from "next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
});

const nextConfig: NextConfig = {
  // 여기에 다른 설정이 있다면 추가
};

export default withPWA(nextConfig);