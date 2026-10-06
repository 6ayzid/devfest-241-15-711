import React from 'react';
import type { Language } from '../logic/i18n';
import { t } from '../logic/i18n';
import { SunIcon, MoonIcon, MonitorIcon, FilePdfIcon } from './icons';

export interface TopBarProps {
  lang: Language;
  theme: 'light' | 'dark' | 'system';
  onLanguageChange: (lang: Language) => void;
  onThemeCycle: () => void;
  desktopActions?: React.ReactNode;
}

export const TopBar: React.FC<TopBarProps> = ({
  lang,
  theme,
  onLanguageChange,
  onThemeCycle,
  desktopActions,
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
      className="h-[56px] px-4 md:px-8 border-b border-opacity-30 sticky top-0 z-40 flex items-center justify-between gap-4 select-none backdrop-blur-none"
    >
      {/* Left: App icon + Truncated Title */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-8 h-8 rounded-[12px] bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] flex items-center justify-center shrink-0">
          <FilePdfIcon size={18} />
        </div>
        <h1 className="text-base md:text-lg font-bold tracking-tight truncate text-[var(--md-sys-color-on-surface)]">
          {t('app_title', lang)}
        </h1>
      </div>

      {/* Middle/Desktop Actions (shown only >= 640px) */}
      <div className="hidden sm:flex items-center gap-2">
        {desktopActions}
      </div>

      {/* Right: Language Segmented Pill + Theme Icon Button */}
      <div className="flex items-center gap-2 shrink-0">
        <div className="m3-pill-group">
          <button
            type="button"
            data-selected={lang === 'en'}
            onClick={() => onLanguageChange('en')}
            className="m3-pill-item"
          >
            EN
          </button>
          <button
            type="button"
            data-selected={lang === 'bn'}
            onClick={() => onLanguageChange('bn')}
            className="m3-pill-item"
          >
            বাং
          </button>
        </div>

        <button
          type="button"
          onClick={onThemeCycle}
          title={`Current theme: ${theme}. Click to cycle.`}
          aria-label="Cycle theme"
          className="m3-btn-icon flex items-center justify-center text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-container)] transition-colors cursor-pointer"
        >
          {themeIcon}
        </button>
      </div>
    </header>
  );
};
