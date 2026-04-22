'use client';

import React from 'react';
import { Home, Music, Heart, User } from 'lucide-react';

export type WellnessNavTab = 'home' | 'music' | 'heart' | 'profile';

export default function WellnessBottomNav({ active }: { active: WellnessNavTab }) {
  const items: { id: WellnessNavTab; icon: typeof Home }[] = [
    { id: 'home', icon: Home },
    { id: 'music', icon: Music },
    { id: 'heart', icon: Heart },
    { id: 'profile', icon: User },
  ];

  return (
    <nav
      className="absolute bottom-4 left-4 right-4 z-10 flex h-[60px] items-center justify-between rounded-full bg-wellness-nav px-6 py-3 shadow-wellness-card"
      aria-label="Wellness app navigation"
    >
      {items.map(({ id, icon: Icon }) => {
        const isActive = active === id;
        return (
          <button
            key={id}
            type="button"
            className={`flex items-center justify-center text-white transition-transform ${
              isActive ? 'scale-110' : 'opacity-85 hover:opacity-100'
            }`}
            aria-current={isActive ? 'true' : undefined}
          >
            <Icon
              size={isActive ? 24 : 22}
              strokeWidth={isActive ? 2.25 : 2}
              className="text-white"
            />
          </button>
        );
      })}
    </nav>
  );
}
