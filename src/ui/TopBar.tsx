import React from 'react';
import type { Language } from '../logic/i18n';
import { t } from '../logic/i18n';
import { SunIcon, MoonIcon, MonitorIcon, FilePdfIcon } from './icons';
import { Button } from './Button';
import type { DockActionItem } from './BottomDock';

export interface TopBarProps {
  lang: Language;
  theme: 'light' | 'dark' | 'system';
  onLanguageChange: (lang: Language) => void;
  onThemeCycle: () => void;
  actions: DockActionItem[];
  desktopExtraActions?: React.ReactNode;
}

export const TopBar: React.FC<TopBarProps> = ({
  lang,
  theme,
  onLanguageChange,
  onThemeCycle,
  actions,
  desktopExtraActions,
}) => {
  const themeIcon = {
    light: <SunIcon size={18} />,
    dark: <MoonIcon size={18} />,
    system: <MonitorIcon size={18} />,
  }[theme];

  return (
    <header
      style={{
        backgroundColor: 'var(--md-sys-color-surface)',
        borderColor: 'var(--md-sys-color-outline-variant)',
      }}
      className="h-[56px] px-3 sm:px-4 md:px-8 border-b border-opacity-30 sticky top-0 z-40 flex flex-nowrap items-center justify-between gap-2 sm:gap-4 select-none overflow-hidden max-w-full backdrop-blur-none"
    >
      {/* Left: App icon + Truncated Title */}
      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1 overflow-hidden">
        <div className="w-8 h-8 rounded-[12px] bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] flex items-center justify-center shrink-0">
          <FilePdfIcon size={18} />
        </div>
        <h1 className="text-base md:text-lg font-bold tracking-tight truncate whitespace-nowrap text-[var(--md-sys-color-on-surface)] min-w-0">
          {t('app_title', lang)}
        </h1>
      </div>

      {/* Middle/Desktop Actions (shown only >= 1024px: all actions as text buttons) */}
      <div className="hidden lg:flex items-center gap-2 flex-nowrap shrink-0">
        {actions.map((act) => (
          <Button
            key={act.id}
            variant="outlined"
            size="s"
            icon={act.icon}
            disabled={act.disabled}
            onClick={act.onPress}
          >
            {t(act.labelKey, lang)}
          </Button>
        ))}
        {desktopExtraActions}
      </div>

      {/* Right: Language Segmented Pill + Theme Icon Button */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 flex-nowrap">
        <div className="m3-pill-group shrink-0">
          <button
            type="button"
            data-selected={lang === 'en'}
            onClick={() => onLanguageChange('en')}
            className="m3-pill-item whitespace-nowrap"
          >
            EN
          </button>
          <button
            type="button"
            data-selected={lang === 'bn'}
            onClick={() => onLanguageChange('bn')}
            className="m3-pill-item whitespace-nowrap"
          >
            বাং
          </button>
        </div>

        <button
          type="button"
          onClick={onThemeCycle}
          title={`Current theme: ${theme}. Click to cycle.`}
          aria-label="Cycle theme"
          className="m3-btn-icon shrink-0 flex items-center justify-center text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-container)] transition-colors cursor-pointer"
        >
          {themeIcon}
        </button>
      </div>
    </header>
  );
};
