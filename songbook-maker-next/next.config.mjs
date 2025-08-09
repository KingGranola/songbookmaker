/** @type {import('next').NextConfig} */
import withPWA from 'next-pwa';

const nextConfig = {
  // App Router用の設定
  experimental: {
    // 実験的機能を有効化（必要に応じて）
  },
  
  // PWA設定
  ...withPWA({
    dest: 'public',
    register: true,
    skipWaiting: true,
    disable: process.env.NODE_ENV === 'development',
    runtimeCaching: [
      {
        urlPattern: /^https?.*/,
        handler: 'NetworkFirst',
        options: {
          cacheName: 'offlineCache',
          expiration: {
            maxEntries: 200,
          },
        },
      },
    ],
  }),

  // ビルド設定
  output: 'standalone',
  
  // 画像最適化
  images: {
    formats: ['image/webp', 'image/avif'],
  },

  // TypeScript設定
  typescript: {
    // 型チェックを厳密に
    ignoreBuildErrors: false,
  },

  // ESLint設定
  eslint: {
    // ビルド時のESLintを有効化
    ignoreDuringBuilds: false,
  },
};

export default nextConfig;
