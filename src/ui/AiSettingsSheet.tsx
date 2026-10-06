import React, { useEffect, useRef } from 'react';
import type { Language } from '../logic/i18n';
import { t } from '../logic/i18n';
import { shortModelName } from '../logic/ai/gemini';
import type { AiSettings } from './hooks/useAiSettings';
import { Button } from './Button';
import { IconButton } from './IconButton';
import { AlertCircleIcon, CheckCircleIcon, CloseIcon, KeyIcon, SparkleIcon } from './icons';

export interface AiSettingsSheetProps {
  open: boolean;
  onClose: () => void;
  lang: Language;
  ai: AiSettings;
  /** Set when the user tried to read PDFs before ticking consent. */
  consentHighlight: boolean;
}

const fieldClass =
  'w-full h-14 px-4 rounded-[16px] text-base font-normal focus:outline-none focus:ring-[3px] focus:ring-[var(--md-sys-color-primary)]';

const fieldStyle: React.CSSProperties = {
  backgroundColor: 'var(--md-sys-color-surface-container-highest)',
  color: 'var(--md-sys-color-on-surface)',
};

/** Right-side drawer on desktop, bottom sheet on mobile (< 640px). */
export const AiSettingsSheet: React.FC<AiSettingsSheetProps> = ({
  open,
  onClose,
  lang,
  ai,
  consentHighlight,
}) => {
  const keyInputRef = useRef<HTMLInputElement>(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCloseRef.current();
    };
    window.addEventListener('keydown', onKey);
    keyInputRef.current?.focus();
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  if (!open) return null;

  const { test } = ai;
  const statusParam = (s?: number) => (s === undefined ? '-' : String(s));

  return (
    <div className="fixed inset-0 z-[60]" role="presentation">
      {/* Scrim (solid, no blur) */}
      <div
        className="ai-scrim absolute inset-0"
        style={{ backgroundColor: 'rgba(0,0,0,0.32)' }}
        onClick={onClose}
        aria-hidden="true"
      />

      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="ai-settings-title"
        style={{ backgroundColor: 'var(--md-sys-color-surface-container-low)' }}
        className="ai-sheet absolute left-0 right-0 bottom-0 max-h-[85dvh] rounded-t-[28px] flex flex-col sm:left-auto sm:top-3 sm:right-3 sm:bottom-3 sm:w-[440px] sm:max-h-none sm:rounded-[28px]"
      >
        {/* Drag handle (mobile) */}
        <div className="sm:hidden flex justify-center pt-3" aria-hidden="true">
          <span
            className="block w-8 h-1 rounded-[2px]"
            style={{ backgroundColor: 'var(--md-sys-color-on-surface-variant)', opacity: 0.4 }}
          />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between gap-3 px-6 pt-4 pb-2">
          <div className="flex items-center gap-3 min-w-0">
            <span
              className="w-10 h-10 rounded-[14px] flex items-center justify-center shrink-0"
              style={{
                backgroundColor: 'var(--md-sys-color-primary-container)',
                color: 'var(--md-sys-color-on-primary-container)',
              }}
            >
              <SparkleIcon size={20} />
            </span>
            <h2 id="ai-settings-title" className="text-xl font-[650] truncate">
              {t('ai_settings_title', lang)}
            </h2>
          </div>
          <IconButton
            label={t('ai_close', lang)}
            onClick={onClose}
            style={{ color: 'var(--md-sys-color-on-surface-variant)' }}
          >
            <CloseIcon size={20} />
          </IconButton>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 pb-[calc(24px+env(safe-area-inset-bottom))] space-y-4">
          <p className="text-base text-[var(--md-sys-color-on-surface-variant)]">
            {t('ai_settings_intro', lang)}
          </p>

          {/* Key */}
          <div
            className="p-5 rounded-[20px] space-y-3"
            style={{ backgroundColor: 'var(--md-sys-color-surface-container-high)' }}
          >
            <label htmlFor="ai-key" className="flex items-center gap-2 text-sm font-semibold">
              <KeyIcon size={16} />
              {t('ai_key_label', lang)}
            </label>
            <input
              id="ai-key"
              ref={keyInputRef}
              type="password"
              autoComplete="off"
              spellCheck={false}
              data-lpignore="true"
              value={ai.apiKey}
              placeholder={t('ai_key_placeholder', lang)}
              onChange={(e) => ai.setApiKey(e.target.value)}
              className={fieldClass}
              style={fieldStyle}
            />
            <p className="text-sm text-[var(--md-sys-color-on-surface-variant)]">
              {t('ai_key_note', lang)}
            </p>
            <label className="flex items-start gap-3 min-h-[48px] py-2 cursor-pointer text-sm font-semibold">
              <input
                type="checkbox"
                checked={ai.rememberTab}
                onChange={(e) => ai.setRememberTab(e.target.checked)}
                className="w-5 h-5 mt-0.5 shrink-0 accent-[var(--md-sys-color-primary)] cursor-pointer"
              />
              <span>{t('ai_remember_tab', lang)}</span>
            </label>
            {ai.hasKey && (
              <Button variant="outlined" size="s" onClick={ai.forgetKey}>
                {t('ai_forget_key', lang)}
              </Button>
            )}
          </div>

          {/* Consent */}
          <div
            className="p-5 rounded-[20px] space-y-2"
            style={{
              backgroundColor: 'var(--md-sys-color-tertiary-container)',
              color: 'var(--md-sys-color-on-tertiary-container)',
            }}
          >
            <label className="flex items-start gap-3 min-h-[48px] cursor-pointer text-base font-semibold">
              <input
                type="checkbox"
                checked={ai.consent}
                onChange={(e) => ai.setConsent(e.target.checked)}
                className="w-5 h-5 mt-1 shrink-0 accent-[var(--md-sys-color-tertiary)] cursor-pointer"
              />
              <span>{t('ai_consent_label', lang)}</span>
            </label>
            {consentHighlight && !ai.consent && (
              <p className="text-sm font-semibold flex items-center gap-2">
                <AlertCircleIcon size={16} className="shrink-0" />
                {t('ai_consent_needed', lang)}
              </p>
            )}
          </div>

          {/* Model */}
          <div
            className="p-5 rounded-[20px] space-y-3"
            style={{ backgroundColor: 'var(--md-sys-color-surface-container-high)' }}
          >
            <p className="text-sm font-semibold">{t('ai_model_label', lang)}</p>
            <p className="text-base break-all">
              {ai.autoModel
                ? t('ai_model_auto', lang, { model: shortModelName(ai.autoModel) })
                : t('ai_model_none', lang)}
            </p>
            <label htmlFor="ai-model" className="block text-sm font-semibold pt-1">
              {t('ai_model_override_label', lang)}
            </label>
            <input
              id="ai-model"
              type="text"
              autoComplete="off"
              spellCheck={false}
              value={ai.modelOverride}
              placeholder={t('ai_model_override_placeholder', lang)}
              onChange={(e) => ai.setModelOverride(e.target.value)}
              className={fieldClass}
              style={fieldStyle}
              aria-invalid={ai.overrideInvalid}
            />
            {ai.overrideInvalid && (
              <p className="text-sm font-semibold text-[var(--md-sys-color-error)]">
                {t('ai_model_invalid', lang)}
              </p>
            )}
          </div>

          {/* Test connection */}
          <Button
            variant="primary"
            size="m"
            className="w-full"
            disabled={!ai.hasKey || test.kind === 'testing' || ai.overrideInvalid}
            onClick={() => void ai.testConnection()}
          >
            {test.kind === 'testing' ? t('ai_testing', lang) : t('ai_test_btn', lang)}
          </Button>

          {test.kind === 'ok' && (
            <div
              role="status"
              className="p-5 rounded-[20px] flex items-start gap-3 text-base font-semibold break-all"
              style={{
                backgroundColor: 'var(--md-sys-color-success-container)',
                color: 'var(--md-sys-color-on-success-container)',
              }}
            >
              <CheckCircleIcon size={22} className="shrink-0" />
              <span>{t('ai_status_ok', lang, { model: shortModelName(test.model) })}</span>
            </div>
          )}

          {test.kind === 'error' && (
            <div
              role="alert"
              className="p-5 rounded-[20px] flex items-start gap-3 text-base font-semibold"
              style={{
                backgroundColor: 'var(--md-sys-color-error-container)',
                color: 'var(--md-sys-color-on-error-container)',
              }}
            >
              <AlertCircleIcon size={22} className="shrink-0" />
              <span>{t(`ai_err_${test.code}`, lang, { status: statusParam(test.status) })}</span>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
