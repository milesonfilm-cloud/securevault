'use client';

import React, { useEffect, useId, useState } from 'react';

import {
  loadWatchUiFonts,
  WATCH_UI_INTER as inter,
  WATCH_UI_MONO as mono,
} from '@/lib/watchUiFonts';
import {
  COVERFLOW_PERSPECTIVE,
  coverflowOffset,
  coverflowWrapperStyle,
  coverflowZIndex,
} from '@/lib/coverflowCarousel';

const ACCENTS = {
  sleep: '#39FF14',
  flight: '#39FF14',
  walk: '#D4FF00',
  stock: '#FFE600',
  record: '#FF4800',
  radio: '#FF2D78',
} as const;

type WatchCardProps = {
  accent: string;
  hoverGlow: string;
  children: React.ReactNode;
};

function WatchCard({ accent, hoverGlow, children }: WatchCardProps) {
  return (
    <div
      className="relative shrink-0 transition-transform duration-200 ease-out hover:scale-[1.02]"
      data-card-accent={accent}
      style={
        {
          width: 340,
          height: 300,
          backgroundColor: '#0d0d0d',
          borderRadius: 28,
          padding: 20,
          boxShadow: '0 8px 40px rgba(0,0,0,0.6)',
          fontFamily: inter,
        } as React.CSSProperties
      }
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = `0 12px 48px ${hoverGlow}`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = '0 8px 40px rgba(0,0,0,0.6)';
      }}
    >
      {/* Subtle Apple Watch–style bump on top-right corner */}
      <div
        className="pointer-events-none absolute -right-px -top-px h-7 w-10 rounded-bl-[20px] bg-[#141414]"
        aria-hidden
      />
      {children}
    </div>
  );
}

function CardMenuDots({ className = '' }: { className?: string }) {
  return (
    <div
      className={`absolute right-5 top-5 z-[2] flex gap-0.5 text-[#555] select-none ${className}`}
      style={{ fontFamily: inter, letterSpacing: '0.15em', fontSize: 14, lineHeight: 1 }}
      aria-hidden
    >
      <span>•</span>
      <span>•</span>
      <span>•</span>
    </div>
  );
}

function IconWifi({ className }: { className?: string }) {
  return (
    <svg className={className} width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 18.5L8.8 15.3M12 18.5l3.2-3.2M5.6 12.1l2.1 2.1M18.4 12.1l-2.1 2.1M2 8.5l3.5 3.5M22 8.5l-3.5 3.5M12 3.5l6.5 6.5M12 3.5L5.5 10"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconBluetooth({ className }: { className?: string }) {
  return (
    <svg className={className} width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M7 7l10 10-5 5V2l5 5L7 17"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconPlane({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M21 8.5L14 11V4l-2 2v5l-7 3-3-3 1.5-1.5L10 10V4L8 2h2l2 2h6l2-2h2l-1 2v4.5z" />
    </svg>
  );
}

function IconClock({ className }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
      <path d="M12 7v6l4 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function IconShoe({ className }: { className?: string }) {
  return (
    <span className={className} role="img" aria-hidden>
      👟
    </span>
  );
}

function NvidiaMark({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="10" fill="#76B900" />
      <ellipse cx="12" cy="12" rx="4" ry="6" fill="#0d0d0d" opacity="0.85" />
      <circle cx="12" cy="10" r="2" fill="#76B900" />
    </svg>
  );
}

const CARD_COUNT = 6;

const CARD_LABELS: { title: string; subtitle: string }[] = [
  { title: 'Clock & Sleep', subtitle: 'Time, sleep stages, and weather' },
  { title: 'Flight tracker', subtitle: 'EK426 · LHR to JFK' },
  { title: 'Walking / Health', subtitle: 'Steps, timeline, and vitals' },
  { title: 'Stock · Nvidia', subtitle: 'NVDA price and chart' },
  { title: 'Voice recording', subtitle: '.WAV capture and waveform' },
  { title: 'Radio', subtitle: 'FM tuning and now playing' },
];

const CARD_ACCENT_COLORS = [
  ACCENTS.sleep,
  ACCENTS.flight,
  ACCENTS.walk,
  ACCENTS.stock,
  ACCENTS.record,
  ACCENTS.radio,
] as const;

export default function SmartWidgetCards() {
  const gradId = useId().replace(/:/g, '');
  const chartGradId = `sg-${gradId}-chart`;
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    loadWatchUiFonts();
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setActiveIndex((i) => (i - 1 + CARD_COUNT) % CARD_COUNT);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        setActiveIndex((i) => (i + 1) % CARD_COUNT);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const activeAccent = CARD_ACCENT_COLORS[activeIndex];

  return (
    <>
      <style>{`
        @keyframes sv-pulse-rec {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        @keyframes sv-wave-bar {
          0%, 100% { transform: scaleY(0.35); }
          50% { transform: scaleY(1); }
        }
        @keyframes sv-chart-draw {
          to { stroke-dashoffset: 0; }
        }
        @keyframes sv-marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .sv-rec-dot { animation: sv-pulse-rec 1s ease-in-out infinite; }
        .sv-wave-bar-anim { transform-origin: bottom center; animation: sv-wave-bar 0.9s ease-in-out infinite; }
        .sv-chart-path-anim {
          stroke-dasharray: 400;
          stroke-dashoffset: 400;
          animation: sv-chart-draw 2.2s ease-out forwards;
        }
        .sv-marquee-track {
          display: inline-block;
          white-space: nowrap;
          animation: sv-marquee 12s linear infinite;
        }
        @keyframes sv-carousel-label-in {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .sv-carousel-label {
          animation: sv-carousel-label-in 420ms ease forwards;
        }
      `}</style>

      <div
        className="relative min-h-screen w-full overflow-x-hidden overflow-y-visible"
        style={{
          background: `radial-gradient(ellipse 85% 70% at 50% 38%, ${activeAccent}2e 0%, #111 62%, #0a0a0a 100%)`,
          transition: 'background 700ms ease',
        }}
      >
        <div
          className="pointer-events-none fixed inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          }}
          aria-hidden
        />
        <div className="relative flex min-h-screen w-full flex-col items-center justify-center p-8">
          <div
            className="pointer-events-none absolute left-1/2 top-[38%] h-[400px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-[50%]"
            style={{
              backgroundColor: activeAccent,
              opacity: 0.35,
              filter: 'blur(80px)',
              transition: 'background-color 600ms ease, opacity 600ms ease',
            }}
            aria-hidden
          />
          <div
            className="carousel-scene relative w-full overflow-visible"
            style={{
              height: 560,
              perspective: COVERFLOW_PERSPECTIVE,
              perspectiveOrigin: '50% 42%',
            }}
          >
            {/* Single 3D subspace — all card transforms compose here */}
            <div
              className="carousel-track absolute inset-0 [transform-style:preserve-3d]"
              style={{ transformStyle: 'preserve-3d' }}
            >
              {/* CARD 1 — Clock & Sleep */}
              <div
                className="card-wrapper absolute left-1/2 top-1/2 cursor-pointer [transform-style:preserve-3d] will-change-[transform,opacity]"
                style={{
                  width: 340,
                  height: 300,
                  zIndex: coverflowZIndex(coverflowOffset(0, activeIndex, CARD_COUNT)),
                  ...coverflowWrapperStyle(coverflowOffset(0, activeIndex, CARD_COUNT)),
                }}
                onClick={() => setActiveIndex(0)}
                role="presentation"
              >
                <WatchCard accent={ACCENTS.sleep} hoverGlow="rgba(57,255,20,0.35)">
                  <CardMenuDots />
                  <div className="relative z-[1] flex h-full flex-col text-white">
                    <div className="flex justify-between pr-14">
                      <div>
                        <p
                          className="text-[11px] uppercase tracking-[0.1em] text-[#888]"
                          style={{ fontFamily: inter }}
                        >
                          Saturday 17
                        </p>
                        <p
                          className="mt-1 text-[64px] font-bold leading-none tracking-[-2px] text-white"
                          style={{ fontFamily: mono }}
                        >
                          09:34
                          <sup className="align-super text-[22px] font-bold tracking-[-1px]">
                            53
                          </sup>
                        </p>
                      </div>
                      <div className="flex gap-1.5 pt-1 pr-1">
                        <button
                          type="button"
                          className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#2a2a2a] text-[#aaa]"
                          aria-label="WiFi"
                        >
                          <IconWifi />
                        </button>
                        <button
                          type="button"
                          className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#2a2a2a] text-[#aaa]"
                          aria-label="Bluetooth"
                        >
                          <IconBluetooth />
                        </button>
                      </div>
                    </div>

                    <div className="mt-3 flex-1">
                      <p
                        className="text-[11px] uppercase tracking-[0.1em] text-[#888]"
                        style={{ fontFamily: inter }}
                      >
                        Sleep
                      </p>
                      <div
                        className="mt-2 w-full rounded-full px-3 py-2"
                        style={{ backgroundColor: ACCENTS.sleep }}
                      >
                        <div
                          className="flex justify-between text-[11px] font-semibold text-[#111]"
                          style={{ fontFamily: mono }}
                        >
                          <span>08:23</span>
                          <span>12:44</span>
                        </div>
                        <div
                          className="mt-0.5 flex justify-between text-[10px] font-semibold uppercase tracking-wider text-[#111]/80"
                          style={{ fontFamily: inter }}
                        >
                          <span>REM</span>
                          <span>REM</span>
                        </div>
                      </div>
                      <p
                        className="mt-1 text-right text-[11px] font-semibold text-[#666]"
                        style={{ fontFamily: inter }}
                      >
                        8H 42M
                      </p>
                    </div>

                    <div
                      className="flex items-center gap-2 text-[18px] font-semibold"
                      style={{ fontFamily: inter }}
                    >
                      <span aria-hidden>🌤</span>
                      <span>19 °C</span>
                    </div>
                  </div>
                </WatchCard>
              </div>

              {/* CARD 2 — Flight */}
              <div
                className="card-wrapper absolute left-1/2 top-1/2 cursor-pointer [transform-style:preserve-3d] will-change-[transform,opacity]"
                style={{
                  width: 340,
                  height: 300,
                  zIndex: coverflowZIndex(coverflowOffset(1, activeIndex, CARD_COUNT)),
                  ...coverflowWrapperStyle(coverflowOffset(1, activeIndex, CARD_COUNT)),
                }}
                onClick={() => setActiveIndex(1)}
                role="presentation"
              >
                <WatchCard accent={ACCENTS.flight} hoverGlow="rgba(57,255,20,0.35)">
                  <CardMenuDots />
                  <div className="relative z-[1] flex h-full flex-col text-white">
                    <p className="text-[11px] text-[#666]" style={{ fontFamily: inter }}>
                      EK426
                    </p>
                    <div className="mt-1 flex items-center justify-center gap-2">
                      <span
                        className="text-[64px] font-bold tracking-[-2px]"
                        style={{ fontFamily: mono }}
                      >
                        LHR
                      </span>
                      <IconPlane className="text-[#39FF14]" />
                      <span
                        className="text-[64px] font-bold tracking-[-2px]"
                        style={{ fontFamily: mono }}
                      >
                        JFK
                      </span>
                    </div>
                    <div
                      className="flex justify-between text-[11px] text-[#666]"
                      style={{ fontFamily: inter }}
                    >
                      <span>London</span>
                      <span className="text-[#888]">7hrs 19mins</span>
                      <span>New York</span>
                    </div>

                    <div
                      className="mt-3 w-full rounded-full px-3 py-2"
                      style={{ backgroundColor: ACCENTS.flight }}
                    >
                      <div
                        className="flex items-center justify-between text-[10px] font-bold text-[#111]"
                        style={{ fontFamily: mono }}
                      >
                        <span>15:00</span>
                        <span className="flex items-center gap-1 opacity-80">
                          <span className="border-b border-dotted border-[#111]/50 px-2">
                            ···· ✈ ····
                          </span>
                        </span>
                        <span>19:22</span>
                      </div>
                      <div
                        className="mt-1 flex justify-between text-[9px] font-semibold uppercase tracking-wider text-[#111]/85"
                        style={{ fontFamily: inter }}
                      >
                        <span>London</span>
                        <span>Halifax</span>
                      </div>
                    </div>

                    <div
                      className="mt-auto flex flex-wrap items-center justify-between gap-x-2 gap-y-1 text-[10px] text-[#888]"
                      style={{ fontFamily: inter }}
                    >
                      <span>15:00 | 08 Jun, 2026</span>
                      <span className="text-[#666]">With transfer</span>
                      <span>22:19 | 08 Jun, 2026</span>
                    </div>
                  </div>
                </WatchCard>
              </div>

              {/* CARD 3 — Walking */}
              <div
                className="card-wrapper absolute left-1/2 top-1/2 cursor-pointer [transform-style:preserve-3d] will-change-[transform,opacity]"
                style={{
                  width: 340,
                  height: 300,
                  zIndex: coverflowZIndex(coverflowOffset(2, activeIndex, CARD_COUNT)),
                  ...coverflowWrapperStyle(coverflowOffset(2, activeIndex, CARD_COUNT)),
                }}
                onClick={() => setActiveIndex(2)}
                role="presentation"
              >
                <WatchCard accent={ACCENTS.walk} hoverGlow="rgba(212,255,0,0.35)">
                  <CardMenuDots />
                  <div className="relative z-[1] flex h-full flex-col text-white">
                    <div className="flex justify-between pr-14">
                      <div>
                        <p className="text-[18px] font-semibold" style={{ fontFamily: inter }}>
                          🚶 Walking
                        </p>
                        <p className="text-[11px] text-[#666]" style={{ fontFamily: inter }}>
                          5 Days
                        </p>
                      </div>
                      <div
                        className="flex items-center gap-1 pr-1 text-[11px] text-[#888]"
                        style={{ fontFamily: inter }}
                      >
                        <IconClock />
                        <span>8:46PM</span>
                      </div>
                    </div>

                    <div
                      className="mt-2 rounded-full py-2 pl-2 pr-2"
                      style={{ backgroundColor: `${ACCENTS.walk}33` }}
                    >
                      <div
                        className="flex justify-between px-1 text-[9px] font-semibold text-[#ccc]"
                        style={{ fontFamily: mono }}
                      >
                        <span>08:00</span>
                        <span>16:10</span>
                        <span>20:34</span>
                      </div>
                      <div className="mt-1 flex h-2 overflow-hidden rounded-full">
                        <div
                          className="h-full flex-1"
                          style={{ backgroundColor: ACCENTS.walk, opacity: 0.9 }}
                        />
                        <div className="h-full w-1 bg-[#0d0d0d]" />
                        <div
                          className="h-full flex-1"
                          style={{ backgroundColor: ACCENTS.walk, opacity: 0.65 }}
                        />
                        <div className="h-full w-1 bg-[#0d0d0d]" />
                        <div
                          className="h-full flex-1"
                          style={{ backgroundColor: ACCENTS.walk, opacity: 0.45 }}
                        />
                      </div>
                      <p
                        className="mt-1 text-center text-[9px] text-[#888]"
                        style={{ fontFamily: mono }}
                      >
                        2,251 | 841 | 1,340
                      </p>
                    </div>

                    <div className="mt-2 flex flex-1 items-start justify-between gap-2">
                      <div className="flex items-end gap-2">
                        <span
                          className="text-[64px] font-bold leading-none tracking-[-2px]"
                          style={{ fontFamily: mono }}
                        >
                          4,432
                        </span>
                        <IconShoe className="pb-3 text-3xl" />
                      </div>
                      <div className="flex min-w-0 flex-1 flex-col items-end text-right">
                        <p
                          className="text-[11px] uppercase tracking-[0.1em] text-[#888]"
                          style={{ fontFamily: inter }}
                        >
                          Steps Today
                        </p>
                        <svg
                          width="80"
                          height="32"
                          viewBox="0 0 80 32"
                          className="mt-1 text-[#D4FF00]"
                          aria-hidden
                        >
                          <path
                            d="M0 24 L14 16 L28 22 L40 6 L52 14 L66 8 L80 4"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <p
                          className="text-[11px] font-semibold text-[#D4FF00]"
                          style={{ fontFamily: mono }}
                        >
                          92 BPM
                        </p>
                      </div>
                    </div>

                    <div
                      className="flex justify-between text-[10px] text-[#888]"
                      style={{ fontFamily: inter }}
                    >
                      <span>🔄 7.20 km</span>
                      <span>⏰ 320 min</span>
                      <span>🔥 2,340 kCal</span>
                    </div>
                  </div>
                </WatchCard>
              </div>

              {/* CARD 4 — Stock */}
              <div
                className="card-wrapper absolute left-1/2 top-1/2 cursor-pointer [transform-style:preserve-3d] will-change-[transform,opacity]"
                style={{
                  width: 340,
                  height: 300,
                  zIndex: coverflowZIndex(coverflowOffset(3, activeIndex, CARD_COUNT)),
                  ...coverflowWrapperStyle(coverflowOffset(3, activeIndex, CARD_COUNT)),
                }}
                onClick={() => setActiveIndex(3)}
                role="presentation"
              >
                <WatchCard accent={ACCENTS.stock} hoverGlow="rgba(255,230,0,0.35)">
                  <CardMenuDots />
                  <div className="relative z-[1] flex h-full flex-col text-white">
                    <div className="flex items-start gap-2">
                      <NvidiaMark />
                      <div>
                        <p className="text-[18px] font-semibold" style={{ fontFamily: inter }}>
                          Nvidia
                        </p>
                        <p className="text-[11px] text-[#666]" style={{ fontFamily: inter }}>
                          NVDA
                        </p>
                      </div>
                    </div>

                    <div className="mt-2 flex flex-wrap items-end gap-2">
                      <span
                        className="text-[64px] font-bold leading-none tracking-[-2px]"
                        style={{ fontFamily: mono }}
                      >
                        $160
                        <sup className="align-super text-[22px] tracking-[-1px]">,08</sup>
                      </span>
                      <span
                        className="mb-2 rounded-full px-2 py-0.5 text-[11px] font-bold text-[#111]"
                        style={{ backgroundColor: ACCENTS.stock, fontFamily: mono }}
                      >
                        +$0,32
                      </span>
                      <span
                        className="mb-2 text-[11px] font-semibold"
                        style={{ color: ACCENTS.stock, fontFamily: mono }}
                      >
                        ● 1,24%
                      </span>
                    </div>

                    <div>
                      <p
                        className="text-[11px] font-semibold text-[#888]"
                        style={{ fontFamily: inter }}
                      >
                        Strong Buy
                      </p>
                      <p className="text-[10px] text-[#666]" style={{ fontFamily: inter }}>
                        Rating
                      </p>
                    </div>

                    <div className="relative mt-2 flex-1 min-h-0">
                      <span
                        className="absolute right-0 top-0 z-10 rounded-md bg-[#2a2a2a] px-1.5 py-0.5 text-[9px] text-[#aaa]"
                        style={{ fontFamily: mono }}
                      >
                        10 Sec
                      </span>
                      <svg
                        viewBox="0 0 280 56"
                        className="h-14 w-full"
                        preserveAspectRatio="none"
                        aria-hidden
                      >
                        <defs>
                          <linearGradient id={chartGradId} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={ACCENTS.stock} stopOpacity="0.35" />
                            <stop offset="100%" stopColor={ACCENTS.stock} stopOpacity="0" />
                          </linearGradient>
                        </defs>
                        <path
                          d="M0 40 L40 35 L80 42 L120 22 L160 30 L200 18 L240 25 L280 12 L280 56 L0 56 Z"
                          fill={`url(#${chartGradId})`}
                        />
                        <path
                          className="sv-chart-path-anim"
                          d="M0 40 L40 35 L80 42 L120 22 L160 30 L200 18 L240 25 L280 12"
                          fill="none"
                          stroke={ACCENTS.stock}
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <div
                        className="flex justify-between text-[9px] uppercase tracking-wider text-[#666]"
                        style={{ fontFamily: inter }}
                      >
                        {['10AM', '11AM', '12AM', '1PM', '2PM', '3PM'].map((t) => (
                          <span key={t}>{t}</span>
                        ))}
                      </div>
                    </div>

                    <div
                      className="mt-1 flex items-center justify-between text-[10px] text-[#888]"
                      style={{ fontFamily: inter }}
                    >
                      <span>☀ Open</span>
                      <span>$ USD</span>
                      <button
                        type="button"
                        className="rounded-full px-2 py-1 text-[10px] font-semibold text-[#111]"
                        style={{ backgroundColor: ACCENTS.stock }}
                      >
                        Key Events
                      </button>
                    </div>
                  </div>
                </WatchCard>
              </div>

              {/* CARD 5 — Recording */}
              <div
                className="card-wrapper absolute left-1/2 top-1/2 cursor-pointer [transform-style:preserve-3d] will-change-[transform,opacity]"
                style={{
                  width: 340,
                  height: 300,
                  zIndex: coverflowZIndex(coverflowOffset(4, activeIndex, CARD_COUNT)),
                  ...coverflowWrapperStyle(coverflowOffset(4, activeIndex, CARD_COUNT)),
                }}
                onClick={() => setActiveIndex(4)}
                role="presentation"
              >
                <WatchCard accent={ACCENTS.record} hoverGlow="rgba(255,72,0,0.35)">
                  <CardMenuDots />
                  <div className="relative z-[1] flex h-full flex-col text-white">
                    <div className="flex items-center justify-between pr-14">
                      <p
                        className="flex items-center gap-2 text-[18px] font-semibold"
                        style={{ fontFamily: inter }}
                      >
                        <span className="sv-rec-dot inline-block h-2 w-2 rounded-full bg-red-500" />
                        Recording
                      </p>
                      <span
                        className="mr-7 rounded-full bg-[#2a2a2a] px-2 py-0.5 text-[10px] text-[#ccc]"
                        style={{ fontFamily: mono }}
                      >
                        2.4 MB
                      </span>
                    </div>

                    <p
                      className="mt-2 text-[64px] font-bold leading-none tracking-[-2px]"
                      style={{ fontFamily: mono }}
                    >
                      02:52
                      <sup className="align-super text-[22px] font-bold">26</sup>
                    </p>
                    <p className="text-[11px] text-[#666]" style={{ fontFamily: mono }}>
                      .WAV
                    </p>

                    <div className="mt-2 flex justify-center gap-3">
                      {[
                        { label: 'Stop', sym: '⏹' },
                        { label: 'Pause', sym: '⏸' },
                        { label: 'Flag', sym: '🚩' },
                      ].map((c) => (
                        <button
                          key={c.label}
                          type="button"
                          className="flex h-[52px] w-[52px] items-center justify-center rounded-full bg-[#252525] text-lg text-white shadow-inner"
                          aria-label={c.label}
                        >
                          {c.sym}
                        </button>
                      ))}
                    </div>

                    <div
                      className="mt-auto flex h-10 items-end justify-center gap-px overflow-hidden rounded-full px-2"
                      style={{
                        background: `linear-gradient(90deg, ${ACCENTS.record}44, ${ACCENTS.record}99, ${ACCENTS.record}44)`,
                      }}
                    >
                      {[
                        3, 7, 4, 9, 5, 11, 6, 8, 4, 10, 5, 8, 6, 9, 4, 7, 5, 8, 6, 10, 7, 5, 9, 6,
                      ].map((h, i) => (
                        <div
                          key={i}
                          className="sv-wave-bar-anim w-1 rounded-t bg-[#111]/80"
                          style={{
                            height: `${h * 3}px`,
                            animationDelay: `${i * 0.05}s`,
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </WatchCard>
              </div>

              {/* CARD 6 — Radio */}
              <div
                className="card-wrapper absolute left-1/2 top-1/2 cursor-pointer [transform-style:preserve-3d] will-change-[transform,opacity]"
                style={{
                  width: 340,
                  height: 300,
                  zIndex: coverflowZIndex(coverflowOffset(5, activeIndex, CARD_COUNT)),
                  ...coverflowWrapperStyle(coverflowOffset(5, activeIndex, CARD_COUNT)),
                }}
                onClick={() => setActiveIndex(5)}
                role="presentation"
              >
                <WatchCard accent={ACCENTS.radio} hoverGlow="rgba(255,45,120,0.35)">
                  <CardMenuDots />
                  <div className="relative z-[1] flex h-full flex-col overflow-hidden text-white">
                    <div className="flex items-start justify-between pr-14">
                      <p
                        className="flex items-center gap-2 text-[16px] font-semibold leading-tight"
                        style={{ fontFamily: inter }}
                      >
                        <span className="inline-block h-2 w-2 rounded-full bg-red-500" />
                        Radio Hard™
                      </p>
                      <div className="flex rounded-lg bg-[#252525] p-0.5 text-[10px] font-semibold">
                        <button type="button" className="rounded-md px-2 py-1 text-[#888]">
                          AM
                        </button>
                        <button
                          type="button"
                          className="rounded-md bg-white px-2 py-1 text-[#111]"
                          style={{ fontFamily: inter }}
                        >
                          FM
                        </button>
                      </div>
                    </div>

                    <div className="mt-1 flex items-baseline gap-1">
                      <span
                        className="text-[56px] font-bold leading-none tracking-[-2px]"
                        style={{ fontFamily: mono }}
                      >
                        102.6
                      </span>
                      <span
                        className="text-[18px] font-semibold text-[#888]"
                        style={{ fontFamily: inter }}
                      >
                        MHz
                      </span>
                    </div>

                    <div className="relative mt-1 h-5 overflow-hidden text-[10px] text-[#888]">
                      <div className="sv-marquee-track">
                        <span className="pr-8" style={{ fontFamily: inter }}>
                          LANA DEL REY – SUMMERTIME SADNESS ··· LANA DEL REY – SUMMERTIME SADNESS
                          ···
                        </span>
                      </div>
                      <span
                        className="absolute right-0 top-0 rounded bg-[#2a2a2a] px-1 text-[9px]"
                        style={{ fontFamily: mono }}
                      >
                        .6
                      </span>
                    </div>

                    <div
                      className="mt-2 rounded-xl px-2 py-2"
                      style={{
                        background: `linear-gradient(90deg, ${ACCENTS.radio}22, ${ACCENTS.radio}66, ${ACCENTS.radio}22)`,
                      }}
                    >
                      <div
                        className="flex justify-between text-[9px] font-semibold text-white/90"
                        style={{ fontFamily: mono }}
                      >
                        {[99, 100, 101, 102, 103, 104, 105].map((n) => (
                          <span key={n}>{n}</span>
                        ))}
                      </div>
                      <div className="mx-auto mt-1 h-1 w-[45%] rounded-full bg-white shadow-[0_0_8px_#fff]" />
                    </div>

                    <div className="mt-auto flex justify-center gap-2 pt-2">
                      {[
                        { label: 'Favorite', sym: '★' },
                        { label: 'Prev', sym: '⏮' },
                        { label: 'Pause', sym: '⏸' },
                        { label: 'Next', sym: '⏭' },
                      ].map((c) => (
                        <button
                          key={c.label}
                          type="button"
                          className="flex h-11 w-11 items-center justify-center rounded-full bg-[#252525] text-sm text-white"
                          aria-label={c.label}
                        >
                          {c.sym}
                        </button>
                      ))}
                    </div>
                  </div>
                </WatchCard>
              </div>
            </div>
          </div>

          <div
            key={`carousel-label-${activeIndex}`}
            className="sv-carousel-label mt-6 max-w-md text-center"
            style={{
              background: 'rgba(0,0,0,0.55)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              borderRadius: 14,
              padding: '10px 20px',
              fontFamily: inter,
            }}
          >
            <p className="text-base font-semibold text-white">{CARD_LABELS[activeIndex].title}</p>
            <p className="mt-0.5 text-xs text-[#aaa]">{CARD_LABELS[activeIndex].subtitle}</p>
          </div>

          <div
            className="mt-5 flex justify-center gap-2"
            role="tablist"
            aria-label="Carousel slides"
          >
            {CARD_LABELS.map((_, i) => (
              <button
                key={`carousel-dot-${i}`}
                type="button"
                role="tab"
                aria-selected={i === activeIndex}
                aria-label={`Show slide ${i + 1}`}
                className="h-2 w-2 rounded-full transition-colors duration-300"
                style={{
                  backgroundColor:
                    i === activeIndex ? 'rgba(255,255,255,1)' : 'rgba(255,255,255,0.4)',
                }}
                onClick={() => setActiveIndex(i)}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
