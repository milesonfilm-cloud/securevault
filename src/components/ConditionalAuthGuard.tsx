'use client';

import { usePathname } from 'next/navigation';
import AuthGuard from './AuthGuard';

const PUBLIC_PATHS = ['/landing', '/voyager'];

export default function ConditionalAuthGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPublic = PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'));
  if (isPublic) return <>{children}</>;
  return <AuthGuard>{children}</AuthGuard>;
}
