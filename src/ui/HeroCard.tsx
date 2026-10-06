import React, { useEffect, useState, useRef } from 'react';
import type { PackageReadiness, DeltaInfo } from '../logic/models';
import type { Language } from '../logic/i18n';
import { t, formatNumber } from '../logic/i18n';
import { CheckCircleIcon, AlertCircleIcon, DownloadIcon } from './icons';
import { Button } from './Button';

export interface HeroCardProps {
  readiness: PackageReadiness;
  delta: DeltaInfo | null;
  changeId: number;
  tenderId: string;
  isGenerating: boolean;
  generatedBlobUrl: string | null;
  lang: Language;
  onGenerate: () => void;
  onDownload: () => void;
}

export const HeroCard: React.FC<HeroCardProps> = ({
  readiness,
  delta,
  changeId,
  tenderId,
  isGenerating,
  generatedBlobUrl,
  lang,
  onGenerate,
  onDownload,
}) => {
  const { totalCount, readyCount, blockingCount, blockingReasons, isReady } = readiness;

  // Animated tween for blocking number
  const [displayedBlocking, setDisplayedBlocking] = useState(blockingCount);
  const [displayedReady, setDisplayedReady] = useState(readyCount);
  const [expanded, setExpanded] = useState(false);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setDisplayedBlocking(blockingCount);
      setDisplayedReady(readyCount);
      return;
    }

    const startBlocking = displayedBlocking;
    const targetBlocking = blockingCount;
    const startReady = displayedReady;
    const targetReady = readyCount;

    const startTime = performance.now();
    const duration = 400; // 400ms per AGENTS.md

    const step = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      // Spring-like ease out
      const ease = 1 - Math.pow(1 - progress, 3);

      const currentB = Math.round(startBlocking + (targetBlocking - startBlocking) * ease);
      const currentR = Math.round(startReady + (targetReady - startReady) * ease);

      setDisplayedBlocking(currentB);
      setDisplayedReady(currentR);

      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(step);
      }
    };

    animFrameRef.current = requestAnimationFrame(step);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [blockingCount, readyCount]);

  // Card background and radius morph
  const isFullyReady = isReady && blockingCount === 0;

  const cardStyle = isFullyReady
    ? {
        backgroundColor: 'var(--md-sys-color-success-container)',
        color: 'var(--md-sys-color-on-success-container)',
        borderRadius: '28px',
      }
    : {
        backgroundColor: 'var(--md-sys-color-error-container)',
        color: 'var(--md-sys-color-on-error-container)',
        borderRadius: '28px',
      };

  const progressPercent = totalCount > 0 ? Math.round((displayedReady / totalCount) * 100) : 0;
  const visibleReasons = expanded ? blockingReasons : blockingReasons.slice(0, 3);
  const hiddenCount = Math.max(0, blockingReasons.length - 3);

  return (
    <div
      style={cardStyle}
      className="p-5 sm:p-6 transition-[background-color,color,border-radius] duration-[400ms] ease-[cubic-bezier(0.34,1.56,0.64,1)] shadow-sm relative overflow-hidden space-y-4"
    >
      {/* Delta Chip feedback */}
      {delta && (
        <div
          key={changeId}
          className="inline-flex max-w-full items-center gap-2 px-3 py-1 rounded-[16px] text-xs font-semibold bg-black/10 dark:bg-white/10 shadow-xs animate-[fadeIn_300ms_ease-out]"
        >
          <span className="w-2 h-2 shrink-0 rounded-full bg-current opacity-70 animate-pulse" />
          <span className="truncate">{t(delta.key, lang, delta.params)}</span>
        </div>
      )}

      {isFullyReady ? (
        // Ready State
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <CheckCircleIcon size={28} className="text-emerald-700 dark:text-emerald-300 shrink-0" />
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
              {t('hero_ready_title', lang)}
            </h2>
          </div>
          <p className="text-sm md:text-base opacity-90 max-w-2xl font-normal">
            {t('hero_ready_desc', lang, { ready: formatNumber(readyCount, lang) })}
          </p>
        </div>
      ) : (
        // Blocked State (Compact hero: 1 row with icon, blocking count, ready ratio, and thin progress bar)
        <div className="space-y-3">
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
            <div className="flex items-center gap-2 min-w-0 shrink-0">
              <AlertCircleIcon size={22} className="shrink-0" />
              <h2 className="text-base sm:text-lg font-bold tracking-tight whitespace-nowrap tabular-nums">
                {t(displayedBlocking === 1 ? 'hero_blocked_count_one' : 'hero_blocked_count', lang, {
                  blocking: formatNumber(displayedBlocking, lang),
                })}
              </h2>
            </div>

            <span className="text-xs sm:text-sm font-semibold opacity-90 whitespace-nowrap shrink-0 tabular-nums">
              {t('hero_ready_of_total', lang, {
                ready: formatNumber(displayedReady, lang),
                total: formatNumber(totalCount, lang),
              })}
            </span>

            <div className="flex-1 min-w-[80px] h-[6px] rounded-full overflow-hidden bg-black/10 dark:bg-white/15">
              <div
                className="h-full bg-current rounded-full transition-[width] duration-400 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          <p className="text-xs sm:text-sm font-medium opacity-90">
            {t('hero_fix_hint', lang)}
          </p>

          {/* Blockers list (max 3 with in-place expander) */}
          {blockingReasons.length > 0 && (
            <div className="space-y-1.5 pt-1">
              <ul className="space-y-1 text-xs sm:text-sm font-medium">
                {visibleReasons.map((b) => (
                  <li key={b.requirementId} className="flex items-center gap-2 min-w-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70 shrink-0" />
                    <span className="truncate">
                      {b.documentTitle}: {t(`status_${b.status}`, lang)}
                    </span>
                  </li>
                ))}
              </ul>
              {hiddenCount > 0 && (
                <button
                  type="button"
                  onClick={() => setExpanded(!expanded)}
                  className="text-xs font-bold underline hover:opacity-100 opacity-80 cursor-pointer pt-0.5 whitespace-nowrap"
                >
                  {expanded
                    ? t('hero_less_issues', lang)
                    : t('hero_more_issues', lang, { count: formatNumber(hiddenCount, lang) })}
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Action Button: sits inside the card */}
      <div className="pt-2 flex justify-end">
        {generatedBlobUrl ? (
          <Button
            variant="success"
            size="m"
            icon={<DownloadIcon size={20} />}
            onClick={onDownload}
            className="w-full sm:w-auto"
          >
            {t('btn_download_package', lang, { tenderId })}
          </Button>
        ) : (
          <Button
            variant="primary"
            size="m"
            disabled={!isFullyReady || isGenerating}
            onClick={onGenerate}
            className="w-full sm:w-auto"
          >
            {isGenerating ? t('btn_generating', lang) : t('btn_generate_package', lang)}
          </Button>
        )}
      </div>
    </div>
  );
};
