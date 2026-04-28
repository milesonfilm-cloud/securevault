/**
 * Subscribe to a CSS media query; works on Safari & older WebViews that only have
 * MediaQueryList#addListener / removeListener (not addEventListener).
 */
export function subscribeMatchMedia(
  query: string,
  onChange: (matches: boolean) => void
): () => void {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return () => {};
  }

  let mq: MediaQueryList;
  try {
    mq = window.matchMedia(query);
  } catch {
    return () => {};
  }

  const handler = () => {
    try {
      onChange(mq.matches);
    } catch {
      /* ignore listener errors */
    }
  };

  try {
    onChange(mq.matches);
  } catch {
    /* ignore */
  }

  if (typeof mq.addEventListener === 'function') {
    mq.addEventListener('change', handler);
    return () => {
      try {
        mq.removeEventListener('change', handler);
      } catch {
        /* ignore */
      }
    };
  }

  const legacy = mq as MediaQueryList & {
    addListener?: (cb: (this: MediaQueryList, ev: MediaQueryListEvent) => void) => void;
    removeListener?: (cb: (this: MediaQueryList, ev: MediaQueryListEvent) => void) => void;
  };

  if (typeof legacy.addListener === 'function') {
    legacy.addListener(handler);
    return () => {
      try {
        legacy.removeListener?.(handler);
      } catch {
        /* ignore */
      }
    };
  }

  return () => {};
}
