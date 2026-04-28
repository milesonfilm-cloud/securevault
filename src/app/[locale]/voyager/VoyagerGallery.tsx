'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { subscribeMatchMedia } from '@/lib/matchMediaSubscribe';

export interface VoyagerCard {
  id: string;
  title: string;
  imageUrl: string;
}

const CARDS: VoyagerCard[] = [
  {
    id: '1',
    title: 'Getting that film look in the post',
    imageUrl: 'https://picsum.photos/seed/voyager-film/520/760',
  },
  {
    id: '2',
    title: 'Selected projects from the last month',
    imageUrl: 'https://picsum.photos/seed/voyager-projects/520/760',
  },
  {
    id: '3',
    title: 'Otherworldly places located on Earth',
    imageUrl: 'https://picsum.photos/seed/voyager-earth/520/760',
  },
  {
    id: '4',
    title: 'Visualizing distorted sound mixes',
    imageUrl: 'https://picsum.photos/seed/voyager-sound/520/760',
  },
  {
    id: '5',
    title: 'Pattern and color exploration',
    imageUrl: 'https://picsum.photos/seed/voyager-pattern/520/760',
  },
];

function mod(n: number, m: number): number {
  return ((n % m) + m) % m;
}

type SlotConfig = {
  offsetX: number;
  rotateY: number;
  scale: number;
  translateY: number;
  zIndex: number;
};

function getSlotConfigs(spread: number, inner: number): SlotConfig[] {
  const outerRot = 28;
  const innerRot = 15;
  return [
    { offsetX: -spread, rotateY: outerRot, scale: 0.72, translateY: 0, zIndex: 1 },
    { offsetX: -inner, rotateY: innerRot, scale: 0.88, translateY: 0, zIndex: 3 },
    { offsetX: 0, rotateY: 0, scale: 1, translateY: -10, zIndex: 10 },
    { offsetX: inner, rotateY: -innerRot, scale: 0.88, translateY: 0, zIndex: 3 },
    { offsetX: spread, rotateY: -outerRot, scale: 0.72, translateY: 0, zIndex: 1 },
  ];
}

const TRANSITION = 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)';

export default function VoyagerGallery() {
  const n = CARDS.length;
  const [activeIndex, setActiveIndex] = useState(0);
  const [wide, setWide] = useState(true);
  const dragRef = useRef<{ x: number; active: boolean }>({ x: 0, active: false });
  const carouselRef = useRef<HTMLDivElement>(null);
  const [carouselWidth, setCarouselWidth] = useState(0);

  useEffect(() => {
    const el = carouselRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(() => setCarouselWidth(el.clientWidth));
    ro.observe(el);
    setCarouselWidth(el.clientWidth);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    return subscribeMatchMedia('(min-width: 900px)', setWide);
  }, []);

  const { spread, inner } = useMemo(
    () => (wide ? { spread: 400, inner: 205 } : { spread: 155, inner: 78 }),
    [wide]
  );
  const slots = useMemo(() => getSlotConfigs(spread, inner), [spread, inner]);

  const go = useCallback(
    (delta: number) => {
      setActiveIndex((i) => mod(i + delta, n));
    },
    [n]
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        go(-1);
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        go(1);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [go]);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    dragRef.current = { x: e.clientX, active: true };
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
  };

  /** Keeps 3D carousel within narrow viewports without horizontal overflow. */
  const carouselScale = carouselWidth > 0 ? Math.min(1, (carouselWidth - 8) / 420) : 1;
  const scaledH = Math.round(380 * carouselScale);

  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current.active) return;
    dragRef.current.active = false;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
    const dx = e.clientX - dragRef.current.x;
    if (Math.abs(dx) > 42) {
      go(dx < 0 ? 1 : -1);
    }
  };

  return (
    <div
      className="min-h-screen bg-[#0a0a0a] text-white"
      style={{
        fontFamily: 'var(--font-pastel), ui-sans-serif, system-ui, sans-serif',
      }}
    >
      {/* Nav */}
      <header className="mx-auto flex max-w-6xl flex-col gap-5 px-4 py-6 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-6 sm:py-8 md:px-10">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium tracking-wide text-white/95">Voyager2</span>
          <span className="hidden h-px w-10 bg-white/35 sm:block" aria-hidden />
        </div>
        <nav className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-[11px] font-medium text-white/85 sm:justify-end sm:gap-8 sm:text-[13px]">
          {['Places', 'Authors', 'Navigator', 'About', 'Connect'].map((label) => (
            <a
              key={label}
              href="#"
              className="transition-colors hover:text-white"
              onClick={(e) => e.preventDefault()}
            >
              {label}
            </a>
          ))}
        </nav>
      </header>

      {/* Heading */}
      <div className="mx-auto max-w-5xl px-4 pb-8 pt-2 text-center sm:px-6 md:px-10 md:pb-14 md:pt-4">
        <p className="mb-4 inline-block rounded-full border border-amber-400/40 bg-amber-400/10 px-3 py-1 text-[11px] font-600 uppercase tracking-wider text-amber-100/95">
          Beta — travel & document gallery demo
        </p>
        <p className="mx-auto mb-6 max-w-2xl text-pretty text-sm leading-relaxed text-white/70">
          Voyager is a visual gallery for inspiration; use{' '}
          <span className="text-white/90 font-500">Document vault</span> in the main app to store
          real passports, visas, and tickets securely on your device.
        </p>
        <h1
          className="text-balance text-[clamp(1.5rem,6vw,3.75rem)] font-medium leading-[1.12] tracking-tight text-white"
          style={{ fontFamily: 'var(--font-wellness-serif), Georgia, serif' }}
        >
          Selected and popular posts on the social right now
        </h1>
      </div>

      {/* Carousel */}
      <div className="relative mx-auto max-w-[1600px] overflow-x-hidden px-3 pb-20 sm:px-4 md:px-8">
        <div
          ref={carouselRef}
          className="relative flex min-h-[min(260px,55vh)] touch-none sm:min-h-[min(420px,70vh)] items-center justify-center overflow-hidden py-4 select-none sm:py-6"
          style={{ perspective: '1400px', perspectiveOrigin: '50% 50%' }}
          onPointerDown={onPointerDown}
          onPointerUp={onPointerUp}
          onPointerCancel={() => {
            dragRef.current.active = false;
          }}
        >
          {/* Side arrows */}
          <button
            type="button"
            aria-label="Previous"
            onClick={(e) => {
              e.stopPropagation();
              go(-1);
            }}
            className="absolute top-1/2 left-1 z-20 flex h-10 w-10 -translate-y-[calc(50%+0.5rem)] items-center justify-center rounded-full border border-white/15 bg-black/40 text-white backdrop-blur-sm transition-colors hover:bg-white/10 min-[400px]:left-2 min-[400px]:h-11 min-[400px]:w-11 sm:left-2 md:left-6"
          >
            <ChevronLeft size={22} strokeWidth={1.75} />
          </button>
          <button
            type="button"
            aria-label="Next"
            onClick={(e) => {
              e.stopPropagation();
              go(1);
            }}
            className="absolute top-1/2 right-1 z-20 flex h-10 w-10 -translate-y-[calc(50%+0.5rem)] items-center justify-center rounded-full border border-white/15 bg-black/40 text-white backdrop-blur-sm transition-colors hover:bg-white/10 min-[400px]:right-2 min-[400px]:h-11 min-[400px]:w-11 sm:right-2 md:right-6"
          >
            <ChevronRight size={22} strokeWidth={1.75} />
          </button>

          <div
            className="relative mx-auto w-full max-w-[1200px] overflow-hidden"
            style={{ height: scaledH }}
          >
            <div
              className="relative h-[380px] w-full [transform-style:preserve-3d]"
              style={{
                transform: `scale(${carouselScale})`,
                transformOrigin: 'top center',
              }}
            >
              {slots.map((slot, s) => {
                const card = CARDS[mod(activeIndex + s - 2, n)]!;
                return (
                  <div
                    key={`${card.id}-${s}`}
                    className="absolute left-1/2 top-1/2 w-[260px] [transform-style:preserve-3d]"
                    style={{
                      transform: `translate(-50%, -50%) translateX(${slot.offsetX}px) translateY(${slot.translateY}px) rotateY(${slot.rotateY}deg) scale(${slot.scale})`,
                      transition: TRANSITION,
                      zIndex: slot.zIndex,
                    }}
                  >
                    <article
                      className={
                        s === 2
                          ? 'relative h-[380px] w-[260px] overflow-hidden rounded-2xl shadow-[0_28px_80px_rgba(0,0,0,0.65),0_0_0_1px_rgba(255,255,255,0.14),0_0_40px_rgba(255,255,255,0.06)]'
                          : 'relative h-[380px] w-[260px] overflow-hidden rounded-2xl shadow-[0_24px_60px_rgba(0,0,0,0.55),0_0_1px_rgba(255,255,255,0.1)]'
                      }
                      style={{ transform: 'translateZ(0)' }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={card.imageUrl}
                        alt=""
                        className="absolute inset-0 h-full w-full object-cover"
                        draggable={false}
                      />
                      <div
                        className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent"
                        aria-hidden
                      />
                      <div className="absolute inset-x-0 bottom-0 px-4 pb-4 pt-20">
                        <p
                          className="text-[14px] leading-snug text-white/95"
                          style={{ fontFamily: 'var(--font-pastel), system-ui, sans-serif' }}
                        >
                          {card.title}
                        </p>
                      </div>
                    </article>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <p className="px-2 text-center text-[11px] text-white/35 sm:text-[12px]">
          Drag horizontally, use arrows, or ← → keys to cycle
        </p>
      </div>
    </div>
  );
}
