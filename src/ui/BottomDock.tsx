import React from 'react';
import type { Language } from '../logic/i18n';
import { t } from '../logic/i18n';

export interface DockActionItem {
  id: string;
  icon: React.ReactNode;
  labelKey: string;
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
  // Sort actions by priority and show top 3 on mobile
  const sortedActions = [...actions].sort((a, b) => b.priority - a.priority).slice(0, 3);

  return (
    <nav
      style={{
        backgroundColor: 'var(--md-sys-color-surface-container-high)',
        borderRadius: '28px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
      }}
      className="sm:hidden fixed bottom-3 left-4 right-4 h-[64px] z-50 flex items-center justify-around px-2 mb-[env(safe-area-inset-bottom)]"
    >
      {sortedActions.map((act) => {
        const isFilled = act.isPrimary;
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
            className={`flex items-center gap-2 px-3 py-2 text-xs font-semibold cursor-pointer transition-[border-radius,transform,background-color] duration-200 active:scale-95 active:rounded-[12px] ${
              isFilled ? 'px-4 shadow-xs' : ''
            }`}
          >
            {act.icon}
            <span>{t(act.labelKey, lang)}</span>
          </button>
        );
      })}
    </nav>
  );
};
