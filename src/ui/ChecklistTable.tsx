import React from 'react';
import type { DocumentStatusInfo, UploadedFileRecord } from '../logic/models';
import type { Language } from '../logic/i18n';
import { t, formatNumber } from '../logic/i18n';
import { StatusBadge } from './StatusBadge';
import { LinkIcon, WandIcon } from './icons';
import { Button } from './Button';

export interface ChecklistTableProps {
  documents: DocumentStatusInfo[];
  files: UploadedFileRecord[];
  matches: Map<string, string>;
  expiryDates: Map<string, string>;
  lang: Language;
  onMatch: (reqId: string, fileId: string) => void;
  onUnmatch: (reqId: string) => void;
  onExpiryChange: (reqId: string, dateStr: string) => void;
  onAutoMatch: () => void;
}

export const ChecklistTable: React.FC<ChecklistTableProps> = ({
  documents,
  files,
  matches,
  expiryDates,
  lang,
  onMatch,
  onUnmatch,
  onExpiryChange,
  onAutoMatch,
}) => {
  // Pre-calculate which hashes are matched to which requirements to disable duplicate copies
  const matchedHashesToReq = new Map<string, string>(); // hash -> reqId
  for (const [rId, fId] of matches.entries()) {
    const file = files.find((f) => f.id === fId);
    if (file) {
      matchedHashesToReq.set(file.hash, rId);
    }
  }

  return (
    <div
      style={{
        backgroundColor: 'var(--md-sys-color-surface-container-low)',
        borderRadius: '28px',
      }}
      className="p-6 md:p-8 space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold tracking-tight text-[var(--md-sys-color-on-surface)]">
            {t('checklist_title', lang)}
          </h3>
          <p className="text-xs md:text-sm text-[var(--md-sys-color-on-surface-variant)] mt-1">
            {lang === 'bn'
              ? 'প্রতিটি রিকোয়ারমেন্ট অনুযায়ী ফাইল মেলান এবং মেয়াদের তারিখ প্রবেশ করান'
              : 'Match uploaded files to requirements and enter required expiry dates'}
          </p>
        </div>

        <Button
          variant="tonal"
          size="m"
          icon={<WandIcon size={18} />}
          onClick={onAutoMatch}
          disabled={files.length === 0}
        >
          {t('btn_auto_match', lang)}
        </Button>
      </div>

      {/* Responsive document cards / table */}
      <div className="space-y-3.5">
        {documents.map((doc) => {
          const matchedFileId = matches.get(doc.requirementId) || '';
          const currentExpiry = expiryDates.get(doc.requirementId) || '';
          const title = lang === 'bn' ? doc.title_bn : doc.title_en;

          return (
            <div
              key={doc.requirementId}
              style={{
                backgroundColor: 'var(--md-sys-color-surface)',
              }}
              className="p-4 md:p-5 rounded-[20px] shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4 transition-all duration-200"
            >
              {/* Order & Title */}
              <div className="flex items-start gap-3 min-w-[240px] flex-1">
                <span className="w-8 h-8 rounded-full bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface)] font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  {formatNumber(doc.order, lang)}
                </span>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm md:text-base text-[var(--md-sys-color-on-surface)]">
                      {title}
                    </span>
                    <span
                      style={{
                        backgroundColor: doc.mandatory
                          ? 'var(--md-sys-color-primary-container)'
                          : 'var(--md-sys-color-surface-container)',
                        color: doc.mandatory
                          ? 'var(--md-sys-color-on-primary-container)'
                          : 'var(--md-sys-color-on-surface-variant)',
                      }}
                      className="px-2 py-0.5 rounded-[8px] text-[11px] font-semibold tracking-wide"
                    >
                      {doc.mandatory ? t('mandatory_badge', lang) : t('optional_badge', lang)}
                    </span>
                    {doc.has_expiry && (
                      <span className="px-2 py-0.5 rounded-[8px] text-[11px] font-semibold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300">
                        {t('expiry_required_badge', lang)}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[var(--md-sys-color-on-surface-variant)]">
                    ID: {doc.requirementId} • {t(`status_desc_${doc.status}`, lang)}
                  </p>
                </div>
              </div>

              {/* Match Select dropdown */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
                <div className="relative min-w-[220px]">
                  <select
                    value={matchedFileId}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val) {
                        onMatch(doc.requirementId, val);
                      } else {
                        onUnmatch(doc.requirementId);
                      }
                    }}
                    style={{
                      backgroundColor: 'var(--md-sys-color-surface-container)',
                      color: 'var(--md-sys-color-on-surface)',
                    }}
                    className="w-full h-11 px-3.5 pr-8 rounded-[16px] text-xs font-semibold appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--md-sys-color-primary)] transition-all"
                  >
                    <option value="">{t('select_file_placeholder', lang)}</option>
                    {files.map((f) => {
                      // Check if already matched to ANOTHER requirement
                      const isMatchedToOtherReq =
                        Array.from(matches.entries()).some(
                          ([rId, fId]) => fId === f.id && rId !== doc.requirementId
                        );

                      // Check if another copy of this duplicate is already matched
                      const matchedReqForHash = matchedHashesToReq.get(f.hash);
                      const isDuplicateConflict =
                        Boolean(matchedReqForHash && matchedReqForHash !== doc.requirementId && f.id !== matches.get(doc.requirementId));

                      const isDisabled = isMatchedToOtherReq || isDuplicateConflict || Boolean(f.error);

                      let suffix = '';
                      if (isMatchedToOtherReq) suffix = ` (${lang === 'bn' ? 'অন্য নথিতে যুক্ত' : 'Matched elsewhere'})`;
                      else if (isDuplicateConflict) suffix = ` (${lang === 'bn' ? 'ডুপ্লিকেট কপি ব্যবহৃত' : 'Duplicate copy used'})`;
                      else if (f.error) suffix = ` (${lang === 'bn' ? 'ক্ষতিগ্রস্ত' : 'Damaged'})`;

                      return (
                        <option
                          key={f.id}
                          value={f.id}
                          disabled={isDisabled}
                          className={isDisabled ? 'opacity-40 italic' : ''}
                        >
                          {f.name} {suffix}
                        </option>
                      );
                    })}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--md-sys-color-on-surface-variant)]">
                    <LinkIcon size={14} />
                  </div>
                </div>

                {/* Expiry Date Input (when has_expiry = true) */}
                {doc.has_expiry && (
                  <div className="relative">
                    <input
                      type="date"
                      value={currentExpiry}
                      disabled={!matchedFileId}
                      onChange={(e) => onExpiryChange(doc.requirementId, e.target.value)}
                      style={{
                        backgroundColor: matchedFileId
                          ? 'var(--md-sys-color-surface-container)'
                          : 'var(--md-sys-color-surface-container-high)',
                        color: 'var(--md-sys-color-on-surface)',
                      }}
                      className="h-11 px-3 rounded-[16px] text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[var(--md-sys-color-primary)] disabled:opacity-40 disabled:cursor-not-allowed"
                    />
                    {!matchedFileId && (
                      <span className="sr-only">Attach file first to set expiry</span>
                    )}
                  </div>
                )}

                {/* Status Badge */}
                <div className="min-w-[110px] flex justify-start sm:justify-end">
                  <StatusBadge status={doc.status} lang={lang} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
