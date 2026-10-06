import React from 'react';
import type { Language } from '../logic/i18n';
import { t } from '../logic/i18n';

export interface DockActionItem {
  id: string;
  icon: React.ReactNode;
  labelKey: string;
  dockLabelKey?: string;
  priority: number;
  isPrimary?: boolean;
  disabled?: boolean;
  onPress: () => void;
}

export interface BottomDockProps {
  actions: DockActionItem[];
  lang: Language;
}

export const BottomDock: React.FC<BottomDockProps> = ({ actions, lang }) => {
  // Sort actions by priority and show all actions (up to 4) on mobile (< 1024px)
  const sortedActions = [...actions].sort((a, b) => b.priority - a.priority).slice(0, 4);

  return (
    <nav
      style={{
        backgroundColor: 'var(--md-sys-color-surface-container-high)',
        borderRadius: '28px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
        bottom: 'calc(12px + env(safe-area-inset-bottom))',
      }}
      className="lg:hidden fixed left-3 right-3 sm:left-4 sm:right-4 h-[64px] z-50 flex items-center justify-around px-2 max-w-[560px] mx-auto select-none"
    >
      {sortedActions.map((act) => {
        const isFilled = act.isPrimary;
        const label = act.dockLabelKey ? t(act.dockLabelKey, lang) : t(act.labelKey, lang);

        return (
          <button
            key={act.id}
            type="button"
            disabled={act.disabled}
            onClick={act.onPress}
            style={{
              backgroundColor: isFilled
                ? 'var(--md-sys-color-primary-container)'
                : 'transparent',
              color: isFilled
                ? 'var(--md-sys-color-on-primary-container)'
                : 'var(--md-sys-color-on-surface)',
              borderRadius: isFilled ? '20px' : '16px',
              opacity: act.disabled ? 0.4 : 1,
            }}
            className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-2 text-xs font-semibold cursor-pointer whitespace-nowrap min-w-0 transition-[border-radius,transform,background-color] duration-200 active:scale-95 active:rounded-[12px] ${
              isFilled ? 'px-3.5 sm:px-4 shadow-xs shrink-0' : 'truncate'
            }`}
          >
            <span className="shrink-0 [&>svg]:shrink-0">{act.icon}</span>
            <span className="whitespace-nowrap truncate">{label}</span>
          </button>
        );
      })}
    </nav>
  );
};
