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
        borderRadius: '24px',
      }
    : {
        backgroundColor: 'var(--md-sys-color-error-container)',
        color: 'var(--md-sys-color-on-error-container)',
        borderRadius: '32px',
      };

  return (
    <div
      style={cardStyle}
      className="p-6 md:p-8 transition-[background-color,color,border-radius] duration-[400ms] ease-[cubic-bezier(0.34,1.56,0.64,1)] shadow-sm relative overflow-hidden"
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex-1 space-y-3">
          {/* Delta Chip feedback */}
          {delta && (
            <div
              key={changeId}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-[16px] text-xs font-semibold bg-white/40 dark:bg-black/20 shadow-xs animate-[fadeIn_300ms_ease-out]"
            >
              <span className="w-2 h-2 rounded-full bg-current opacity-70 animate-pulse" />
              <span>{t(delta.key, lang, delta.params)}</span>
            </div>
          )}

          {/* Hero Headline */}
          <div className="flex items-center gap-3">
            {isFullyReady ? (
              <CheckCircleIcon size={32} className="text-emerald-700 dark:text-emerald-300 shrink-0" />
            ) : (
              <AlertCircleIcon size={32} className="text-rose-700 dark:text-rose-300 shrink-0" />
            )}
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
              {isFullyReady
                ? t('hero_ready_title', lang)
                : t('hero_blocked_title', lang, { blocking: displayedBlocking })}
            </h2>
          </div>

          <p className="text-sm md:text-base opacity-90 max-w-2xl font-normal">
            {isFullyReady
              ? t('hero_ready_desc', lang, { ready: formatNumber(readyCount, lang) })
              : t('hero_blocked_desc', lang, {
                  ready: formatNumber(displayedReady, lang),
                  total: formatNumber(totalCount, lang),
                })}
          </p>

          {/* Blockers list when not ready */}
          {!isFullyReady && blockingReasons.length > 0 && (
            <div className="mt-4 pt-3 border-t border-current/15">
              <span className="text-xs font-bold uppercase tracking-wider block mb-2 opacity-80">
                {t('blockers_heading', lang)}
              </span>
              <ul className="space-y-1 text-xs md:text-sm font-medium">
                {blockingReasons.slice(0, 4).map((b) => (
                  <li key={b.requirementId} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
                    <span>
                      {b.documentTitle}: {t(`status_${b.status}`, lang)}
                    </span>
                  </li>
                ))}
                {blockingReasons.length > 4 && (
                  <li className="italic opacity-80 text-xs">
                    +{blockingReasons.length - 4} more issues below...
                  </li>
                )}
              </ul>
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
          {generatedBlobUrl ? (
            <Button
              variant="success"
              size="l"
              icon={<DownloadIcon size={24} />}
              onClick={onDownload}
              className="w-full shadow-md"
            >
              {t('btn_download_package', lang, { tenderId })}
            </Button>
          ) : (
            <Button
              variant={isFullyReady ? 'primary' : 'outlined'}
              size="l"
              disabled={!isFullyReady || isGenerating}
              onClick={onGenerate}
              className="w-full shadow-md"
            >
              {isGenerating ? t('btn_generating', lang) : t('btn_generate_package', lang)}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
