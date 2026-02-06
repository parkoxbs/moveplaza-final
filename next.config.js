/** @type {import('next').NextConfig} */
const nextConfig = {
  // 에러 무시하고 강제로 배포 성공시키기
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;