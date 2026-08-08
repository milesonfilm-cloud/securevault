import { imageHosts } from './image-hosts.config.mjs';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/index.ts');

const isMobileBuild =
  process.env.MOBILE_BUILD === '1' || process.env.CAPACITOR_BUILD === '1';

const defaultLocale = 'en';

/** @type {import('next').NextConfig} */
const nextConfig = {
  ...(isMobileBuild
    ? {
        output: 'export',
        trailingSlash: true,
      }
    : {}),
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
    ...(isMobileBuild ? { unoptimized: true } : {}),
  },
  async redirects() {
    const home = `/${defaultLocale}/family-management`;
    return [
      { source: '/', destination: home, permanent: false },
      { source: '/stack-board', destination: home, permanent: false },
    ];
  },

  async headers() {
    if (isMobileBuild) return [];
    const isProd = process.env.NODE_ENV === 'production';
    const csp = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://accounts.google.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: blob: https:",
      "media-src 'self' blob:",
      `connect-src 'self' https://cdn.jsdelivr.net https://unpkg.com${isMobileBuild ? '' : ' https://www.googleapis.com https://oauth2.googleapis.com'}`,
      "worker-src 'self' blob:",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; ');

    const securityHeaders = [
      { key: 'X-DNS-Prefetch-Control', value: 'on' },
      ...(isProd
        ? [
            {
              key: 'Strict-Transport-Security',
              value: 'max-age=63072000; includeSubDomains; preload',
            },
          ]
        : []),
      { key: 'X-Frame-Options', value: 'DENY' },
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      {
        key: 'Permissions-Policy',
        value: 'camera=(self), microphone=(), geolocation=(), payment=(self), usb=()',
      },
      { key: 'Content-Security-Policy', value: csp },
    ];

    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },

  webpack(config, { dev, isServer }) {
    // Skip the tagger for mobile exports to reduce build memory.
    if (!isMobileBuild) {
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
    }
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