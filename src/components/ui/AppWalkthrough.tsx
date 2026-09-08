'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ChevronRight } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { useVaultData } from '@/context/VaultDataContext';
import {
  hasSeenAppWalkthrough,
  isWalkthroughPending,
  markAppWalkthroughSeen,
  type WalkthroughStepId,
} from '@/lib/appWalkthrough';

type WalkthroughUiValue = {
  active: boolean;
  stepId: WalkthroughStepId | null;
};

const WalkthroughUiContext = createContext<WalkthroughUiValue>({
  active: false,
  stepId: null,
});

export function useWalkthroughUi() {
  return useContext(WalkthroughUiContext);
}

type StepDef = { id: WalkthroughStepId; targets: string[] };

const ALL_STEPS: StepDef[] = [
  { id: 'welcome', targets: [] },
  { id: 'family', targets: ['family-cards', 'family-empty'] },
  { id: 'add-member', targets: ['add-member'] },
  { id: 'add-document', targets: ['add-document'] },
  { id: 'search', targets: ['search'] },
  { id: 'documents', targets: ['member-docs', 'family-empty'] },
  { id: 'menu', targets: ['app-menu'] },
];

function isVisibleTarget(el: HTMLElement) {
  const style = window.getComputedStyle(el);
  if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') {
    return false;
  }
  const r = el.getBoundingClientRect();
  return r.width >= 2 && r.height >= 2;
}

function findWalkthroughTarget(ids: string[]): HTMLElement | null {
  for (const id of ids) {
    const nodes = document.querySelectorAll<HTMLElement>(`[data-walkthrough="${id}"]`);
    for (const el of nodes) {
      if (isVisibleTarget(el)) return el;
    }
  }
  return null;
}

function resolveSteps(): StepDef[] {
  return ALL_STEPS.filter(
    (s) => s.targets.length === 0 || findWalkthroughTarget(s.targets) !== null
  );
}

type Hole = {
  top: number;
  left: number;
  width: number;
  height: number;
  radius: string;
};

function measureHole(el: HTMLElement): Hole {
  const r = el.getBoundingClientRect();
  const pad = 8;
  const radius = window.getComputedStyle(el).borderRadius || '20px';
  return {
    top: r.top - pad,
    left: r.left - pad,
    width: r.width + pad * 2,
    height: r.height + pad * 2,
    radius,
  };
}

function placeTooltip(
  hole: Hole | null,
  tipW: number,
  tipH: number
): { top: number; left: number; width: number } {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const gutter = 16;
  const gap = 14;
  const width = Math.min(tipW, vw - gutter * 2);

  if (!hole) {
    return {
      top: Math.max(gutter, (vh - tipH) / 2 - 12),
      left: (vw - width) / 2,
      width,
    };
  }

  if (hole.height > vh * 0.42) {
    const rightLeft = hole.left + hole.width + gap;
    if (rightLeft + width <= vw - gutter) {
      return {
        top: Math.max(gutter, Math.min(hole.top + 24, vh - tipH - gutter)),
        left: rightLeft,
        width,
      };
    }
  }

  const left = Math.min(Math.max(gutter, hole.left), vw - width - gutter);
  const spaceBelow = vh - (hole.top + hole.height) - gutter;
  const spaceAbove = hole.top - gutter;
  let top: number;
  if (spaceBelow >= tipH + gap) {
    top = hole.top + hole.height + gap;
  } else if (spaceAbove >= tipH + gap) {
    top = hole.top - tipH - gap;
  } else {
    top = gutter;
  }
  top = Math.max(gutter, Math.min(top, vh - tipH - gutter));
  return { top, left, width };
}

type AppWalkthroughProps = {
  activePath: string;
  children: React.ReactNode;
};

export default function AppWalkthrough({ activePath, children }: AppWalkthroughProps) {
  const tw = useTranslations('walkthrough');
  const { loading, vaultData } = useVaultData();
  const hasMembers = vaultData.members.length > 0;
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const [steps, setSteps] = useState<StepDef[]>(ALL_STEPS);
  const [hole, setHole] = useState<Hole | null>(null);
  const [tipBox, setTipBox] = useState({ top: 24, left: 16, width: 320 });
  const tooltipRef = useRef<HTMLDivElement>(null);
  const missRef = useRef(0);

  const step = steps[index] ?? steps[0] ?? ALL_STEPS[0];
  const stepId = open ? step.id : null;

  const copy = useMemo(() => {
    switch (step.id) {
      case 'welcome':
        return { title: tw('welcomeTitle'), body: tw('welcomeBody') };
      case 'family':
        return {
          title: tw('familyTitle'),
          body: hasMembers ? tw('familyBody') : tw('familyEmptyBody'),
        };
      case 'add-member':
        return { title: tw('addTitle'), body: tw('addBody') };
      case 'add-document':
        return { title: tw('addDocTitle'), body: tw('addDocBody') };
      case 'search':
        return { title: tw('searchTitle'), body: tw('searchBody') };
      case 'menu':
        return { title: tw('menuTitle'), body: tw('menuBody') };
      default:
        return {
          title: tw('docsTitle'),
          body: hasMembers ? tw('docsBody') : tw('docsEmptyBody'),
        };
    }
  }, [step.id, hasMembers, tw]);

  const finish = useCallback(() => {
    markAppWalkthroughSeen();
    setOpen(false);
  }, []);

  const goNext = useCallback(() => {
    if (index >= steps.length - 1) finish();
    else setIndex((i) => i + 1);
  }, [index, steps.length, finish]);

  useEffect(() => {
    if (activePath !== '/family-management') {
      if (open) finish();
      return;
    }
    if (open || loading) return;
    if (hasSeenAppWalkthrough() && !isWalkthroughPending()) return;
    const start = window.setTimeout(() => {
      setSteps(resolveSteps());
      setIndex(0);
      setOpen(true);
    }, 750);
    return () => window.clearTimeout(start);
  }, [activePath, loading, open, finish]);

  useLayoutEffect(() => {
    if (!open) {
      setHole(null);
      missRef.current = 0;
      return;
    }
    let cancelled = false;
    const tick = () => {
      if (cancelled) return;
      if (step.targets.length === 0) {
        setHole(null);
        missRef.current = 0;
        return;
      }
      const el = findWalkthroughTarget(step.targets);
      if (!el) {
        missRef.current += 1;
        if (missRef.current >= 5) {
          missRef.current = 0;
          if (index >= steps.length - 1) finish();
          else setIndex((i) => i + 1);
        }
        return;
      }
      missRef.current = 0;
      el.scrollIntoView({ block: 'center', inline: 'nearest', behavior: 'auto' });
      if (step.id === 'menu') {
        const r = el.getBoundingClientRect();
        const padLeft = 240;
        const padRight = 20;
        const padTop = 260;
        setHole({
          top: r.top - padTop,
          left: r.left - padLeft,
          width: r.width + padLeft + padRight,
          height: r.height + padTop + 20,
          radius: '32px',
        });
      } else {
        setHole(measureHole(el));
      }
    };
    tick();
    const later = window.setTimeout(tick, 280);
    const onWin = () => tick();
    window.addEventListener('resize', onWin);
    window.addEventListener('scroll', onWin, true);
    const poll = window.setInterval(tick, 200);
    return () => {
      cancelled = true;
      window.clearTimeout(later);
      window.clearInterval(poll);
      window.removeEventListener('resize', onWin);
      window.removeEventListener('scroll', onWin, true);
    };
  }, [open, step, index, steps.length, finish]);

  useLayoutEffect(() => {
    if (!open) return;
    const tip = tooltipRef.current;
    const tipH = tip?.offsetHeight ?? 188;
    const tipW = 340;
    setTipBox(placeTooltip(hole, tipW, tipH));
  }, [open, hole, copy, index]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') finish();
      if (e.key === 'Enter' || e.key === 'ArrowRight') {
        e.preventDefault();
        goNext();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, finish, goNext]);

  const isLast = index === steps.length - 1;
  const ui = useMemo(() => ({ active: open, stepId }), [open, stepId]);

  return (
    <WalkthroughUiContext.Provider value={ui}>
      {children}
      <AnimatePresence>
        {open ? (
          <motion.div
            key="walkthrough"
            role="dialog"
            aria-modal="true"
            aria-labelledby="sv-walkthrough-title"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="fixed inset-0 z-[90] overscroll-none"
            style={{ touchAction: 'none' }}
          >
            <div className="absolute inset-0" aria-hidden />
            {hole ? (
              <div
                aria-hidden
                className="pointer-events-none absolute"
                style={{
                  top: hole.top,
                  left: hole.left,
                  width: hole.width,
                  height: hole.height,
                  borderRadius: hole.radius,
                  boxShadow: '0 0 0 3px #ffffff, 0 0 0 9999px rgba(15, 23, 42, 0.78)',
                }}
              />
            ) : (
              <div className="absolute inset-0 bg-[#12151c]/80" aria-hidden />
            )}

            <div
              ref={tooltipRef}
              className="absolute z-[91] px-4"
              style={{ top: tipBox.top, left: tipBox.left, width: tipBox.width }}
            >
              <motion.div
                key={step.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.22 }}
                className="sv-walkthrough-tip rounded-[20px] px-5 py-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="text-[10px] font-700 uppercase tracking-[0.22em] text-[#6B7280]">
                    {tw('stepOf', { current: index + 1, total: steps.length })}
                  </p>
                  <button
                    type="button"
                    onClick={finish}
                    className="rounded-[10px] px-2 py-1 text-xs font-600 text-[#6B7280] transition-colors hover:bg-black/5 hover:text-[#111]"
                  >
                    {tw('skip')}
                  </button>
                </div>
                <h2
                  id="sv-walkthrough-title"
                  className="mt-2 text-[18px] font-800 leading-tight text-[#111]"
                >
                  {copy.title}
                </h2>
                <p className="mt-2 text-[14px] leading-relaxed text-[#374151]">{copy.body}</p>
                <div className="mt-4 flex items-center justify-between gap-3">
                  <div className="flex gap-1.5">
                    {steps.map((s, i) => (
                      <span
                        key={s.id}
                        className="block h-1.5 rounded-full bg-black/10"
                        style={{
                          width: i === index ? 22 : 6,
                          backgroundColor: i === index ? '#212121' : 'rgba(15, 23, 42, 0.12)',
                        }}
                      />
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={goNext}
                    className="inline-flex items-center gap-1.5 rounded-[12px] bg-vault-text px-4 py-2.5 text-sm font-700 text-white shadow-[0_8px_20px_rgba(33,33,33,0.18)] active:scale-[0.98]"
                  >
                    {isLast ? tw('done') : tw('next')}
                    <ChevronRight className="h-4 w-4" strokeWidth={2.5} aria-hidden />
                  </button>
                </div>
              </motion.div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </WalkthroughUiContext.Provider>
  );
}
