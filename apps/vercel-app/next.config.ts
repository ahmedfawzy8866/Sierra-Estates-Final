import type { NextConfig } from 'next';

// Next.js 16 removed `eslint` from the NextConfig type, but the runtime
// still honours it.  We type the core config with satisfies and spread
// the extra field in separately so tsc does not complain.
const coreConfig: NextConfig = {
  // Enable standalone output for Docker deployments
  output: 'standalone',
  // Enforce type-checking during build (never skip)
  typescript: {
    ignoreBuildErrors: false,
  },
  // Image domains for property photos
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
      },
      {
        protocol: 'https',
        hostname: 'storage.googleapis.com',
      },
    ],
  },
  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(self)' },
        ],
      },
    ];
  },
  // Rewrite heavy API routes to Firebase Admin app
  // These routes are handled by the Firebase Cloud Functions admin app
  async rewrites() {
    const firebaseAdminUrl = process.env.FIREBASE_ADMIN_URL || 'https://admin-api.sierra-estates.net';
    return [
      // Bot / scraper webhooks → Firebase Admin
      { source: '/api/webhooks/:path*', destination: `${firebaseAdminUrl}/api/webhooks/:path*` },
      { source: '/api/ingest/:path*', destination: `${firebaseAdminUrl}/api/ingest/:path*` },
      { source: '/api/telegram/:path*', destination: `${firebaseAdminUrl}/api/telegram/:path*` },
      { source: '/api/whatsapp/:path*', destination: `${firebaseAdminUrl}/api/whatsapp/:path*` },
      // Agent orchestration → Firebase Admin
      { source: '/api/orchestrate', destination: `${firebaseAdminUrl}/api/orchestrate` },
      { source: '/api/agent/:path*', destination: `${firebaseAdminUrl}/api/agent/:path*` },
      { source: '/api/closer/:path*', destination: `${firebaseAdminUrl}/api/closer/:path*` },
      { source: '/api/matching', destination: `${firebaseAdminUrl}/api/matching` },
      // Cron jobs → Firebase Admin
      { source: '/api/cron/:path*', destination: `${firebaseAdminUrl}/api/cron/:path*` },
      // Admin panel → Firebase Admin
      { source: '/api/admin/:path*', destination: `${firebaseAdminUrl}/api/admin/:path*` },
      // Sync / Property Finder → Firebase Admin
      { source: '/api/sync/:path*', destination: `${firebaseAdminUrl}/api/sync/:path*` },
      { source: '/api/properties/:path*', destination: `${firebaseAdminUrl}/api/properties/:path*` },
      { source: '/api/property-finder/:path*', destination: `${firebaseAdminUrl}/api/property-finder/:path*` },
      { source: '/api/proposals', destination: `${firebaseAdminUrl}/api/proposals` },
      { source: '/api/seed/:path*', destination: `${firebaseAdminUrl}/api/seed/:path*` },
    ];
  },
};

const nextConfig = {
  ...coreConfig,
  eslint: {
    ignoreDuringBuilds: false,
  },
// eslint-disable-next-line @typescript-eslint/no-explicit-any
} as any as NextConfig;

export default nextConfig;
