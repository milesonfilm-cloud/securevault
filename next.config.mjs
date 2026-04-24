import { imageHosts } from './image-hosts.config.mjs';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/index.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  /**
   * Dev-only: allow other hostnames (e.g. LAN IP) to load `/_next/*` without cross-origin warnings
   * when you open the app as http://192.168.x.x:4028 instead of localhost.
   * @see https://nextjs.org/docs/app/api-reference/config/next-config-js/allowedDevOrigins
   */
  allowedDevOrigins: [
    '192.168.1.6',
    ...(process.env.NEXT_ALLOWED_DEV_ORIGINS?.split(',')
      .map((s) => s.trim())
      .filter(Boolean) ?? []),
  ],
  /** Never ship TS/source maps to browsers in production — they make reverse engineering trivial. */
  productionBrowserSourceMaps: false,
  poweredByHeader: false,
  transpilePackages: ['hash-wasm'],
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  distDir: process.env.DIST_DIR || '.next',
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: imageHosts,
    minimumCacheTTL: 60,
  },
  async redirects() {
    return [
      {
        source: '/',
        destination: '/family-management',
        permanent: false,
      },
      {
        source: '/stack-board',
        destination: '/family-management',
        permanent: false,
      },
    ];
  },

  async headers() {
    const isProd = process.env.NODE_ENV === 'production';
    const baseHeaders = [
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'X-Frame-Options', value: 'DENY' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      {
        key: 'Permissions-Policy',
        value: 'camera=(self), microphone=(), geolocation=(), payment=(), usb=()',
      },
      { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
      { key: 'Cross-Origin-Resource-Policy', value: 'same-site' },
    ];

    const hsts = isProd
      ? [{ key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' }]
      : [];

    return [
      {
        source: '/:path*',
        headers: [...baseHeaders, ...hsts],
      },
    ];
  },

  webpack(config, { dev, isServer }) {
    /** Root layout is on the critical path; skipping the tagger here speeds dev compiles and avoids chunk load timeouts. */
    config.module.rules.push({
      test: /\.(jsx|tsx)$/,
      exclude: [/node_modules/, /[/\\]app[/\\]layout\.tsx$/],
      use: [
        {
          loader: '@dhiwise/component-tagger/nextLoader',
        },
      ],
    });
    if (!isServer && dev && config.output) {
      config.output.chunkLoadTimeout = 300000;
    }
    if (dev) {
      const ignoredPaths = (process.env.WATCH_IGNORED_PATHS || '')
        .split(',')
        .map((p) => p.trim())
        .filter(Boolean);
      config.watchOptions = {
        ignored: ignoredPaths.length
          ? ignoredPaths.map((p) => `**/${p.replace(/^\/+|\/+$/g, '')}/**`)
          : undefined,
      };
    }
    return config;
  },
};
export default withNextIntl(nextConfig);