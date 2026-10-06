import React, { useRef } from 'react';
import type { UploadedFileRecord } from '../logic/models';
import type { Language } from '../logic/i18n';
import type { AiDocumentAnalysis } from '../logic/ai/docReader';
import { t, formatFileSize } from '../logic/i18n';
import {
  FilePdfIcon,
  TrashIcon,
  UploadIcon,
  CopyIcon,
  AlertCircleIcon,
  SparkleIcon,
} from './icons';
import { Button } from './Button';

export interface FilePoolProps {
  files: UploadedFileRecord[];
  lang: Language;
  onUpload: (fileList: FileList | File[]) => void;
  onRemove: (fileId: string) => void;
  uploadError: string | null;
  onClearError: () => void;
  aiConfigured?: boolean;
  isReadingAllAi?: boolean;
  readingFileIds?: Set<string>;
  aiAnalyses?: Map<string, AiDocumentAnalysis>;
  onReadWithAi?: () => void;
  onReadFileAi?: (fileId: string) => void;
  requirements?: import('../logic/models').RequirementItem[];
  matches?: Map<string, string>;
  onAssignRequirement?: (fileId: string, reqId: string) => void;
}

export const FilePool: React.FC<FilePoolProps> = ({
  files,
  lang,
  onUpload,
  onRemove,
  uploadError,
  onClearError,
  aiConfigured = false,
  isReadingAllAi = false,
  readingFileIds,
  aiAnalyses,
  onReadWithAi,
  onReadFileAi,
  requirements,
  matches,
  onAssignRequirement,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFiles = Array.from(e.dataTransfer.files);
      onUpload(droppedFiles);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files);
      onUpload(selectedFiles);
      e.target.value = ''; // reset to permit selecting same file again
    }
  };

  const totalBytes = files.reduce((acc, f) => acc + f.size, 0);

  return (
    <div
      style={{
        backgroundColor: 'var(--md-sys-color-surface-container-low)',
        borderRadius: '28px',
      }}
      className="p-6 md:p-8 space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-xl font-bold tracking-tight text-[var(--md-sys-color-on-surface)]">
            {t('upload_title', lang)}
          </h3>
          <p className="text-xs md:text-sm text-[var(--md-sys-color-on-surface-variant)] mt-1">
            {t('upload_files_count', lang, {
              count: files.length,
              size: formatFileSize(totalBytes, lang),
            })}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {aiConfigured && files.length > 0 && (
            <Button
              variant="tonal"
              size="m"
              icon={<SparkleIcon size={18} className={isReadingAllAi ? 'animate-spin' : ''} />}
              disabled={isReadingAllAi}
              onClick={onReadWithAi}
            >
              {isReadingAllAi ? t('ai_reading_all', lang) : t('btn_read_with_ai', lang)}
            </Button>
          )}

          <input
            id="pdf-upload-input"
            type="file"
            ref={inputRef}
            multiple
            accept=".pdf,application/pdf"
            className="hidden"
            onChange={handleChange}
          />
          <Button
            variant="secondary"
            size="m"
            icon={<UploadIcon size={20} />}
            onClick={() => inputRef.current?.click()}
          >
            {lang === 'bn' ? 'ফাইল আপলোড করুন' : 'Upload Files'}
          </Button>
        </div>
      </div>

      {/* Upload error banner */}
      {uploadError && (
        <div
          style={{
            backgroundColor: 'var(--md-sys-color-error-container)',
            color: 'var(--md-sys-color-on-error-container)',
          }}
          className="p-4 rounded-[20px] flex items-center justify-between gap-3 text-sm font-semibold animate-[fadeIn_200ms_ease-out]"
        >
          <div className="flex items-center gap-2">
            <AlertCircleIcon size={20} className="shrink-0" />
            <span>{uploadError}</span>
          </div>
          <button
            onClick={onClearError}
            className="text-xs uppercase tracking-wider font-bold underline opacity-80 hover:opacity-100 cursor-pointer"
          >
            {lang === 'bn' ? 'বাতিল' : 'Dismiss'}
          </button>
        </div>
      )}

      {/* Dropzone */}
      <div
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        style={{
          backgroundColor: 'var(--md-sys-color-surface-container)',
          borderColor: 'var(--md-sys-color-outline-variant)',
        }}
        className="border-2 border-dashed rounded-[20px] p-6 text-center cursor-pointer transition-colors duration-200 hover:border-[var(--md-sys-color-primary)] flex flex-col items-center justify-center gap-2.5"
      >
        <div className="w-12 h-12 rounded-full bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] flex items-center justify-center">
          <UploadIcon size={24} />
        </div>
        <p className="font-semibold text-sm md:text-base text-[var(--md-sys-color-on-surface)]">
          {t('upload_dropzone_text', lang)}
        </p>
        <p className="text-xs text-[var(--md-sys-color-on-surface-variant)]">
          {t('upload_limits_hint', lang)}
        </p>
      </div>

      {/* Uploaded files grid */}
      {files.length > 0 && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {files.map((file) => {
              const isReadingThis = Boolean(readingFileIds?.has(file.id));
              const analysis = aiAnalyses?.get(file.id);
              const isOverAiLimit = file.size > 15 * 1024 * 1024;

              return (
                <div
                  key={file.id}
                  style={{
                    backgroundColor: 'var(--md-sys-color-surface)',
                  }}
                  className="p-4 rounded-[20px] flex flex-col justify-between gap-3 shadow-xs border border-transparent"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-[14px] bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)] flex items-center justify-center shrink-0">
                        <FilePdfIcon size={20} />
                      </div>
                      <div className="min-w-0 space-y-1">
                        <p
                          className="text-sm font-semibold truncate text-[var(--md-sys-color-on-surface)]"
                          title={file.name}
                        >
                          {file.name}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-[var(--md-sys-color-on-surface-variant)]">
                          <span>{t('pages_count', lang, { count: file.pageCount })}</span>
                          <span>•</span>
                          <span>{formatFileSize(file.size, lang)}</span>
                        </div>

                        {/* Flags */}
                        {file.isDuplicate && (
                          <div className="flex items-center gap-1.5 mt-1 text-[11px] font-semibold text-amber-700 dark:text-amber-400">
                            <CopyIcon size={14} className="shrink-0" />
                            <span>{t('badge_duplicate', lang)}</span>
                          </div>
                        )}

                        {file.error && (
                          <div className="flex items-center gap-1.5 mt-1 text-[11px] font-semibold text-rose-700 dark:text-rose-400">
                            <AlertCircleIcon size={14} className="shrink-0" />
                            <span>{t('badge_damaged', lang)}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => onRemove(file.id)}
                      className="p-2 rounded-full text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-error)] hover:bg-[var(--md-sys-color-error-container)] transition-colors duration-150 cursor-pointer"
                      title={t('btn_remove_file', lang)}
                    >
                      <TrashIcon size={16} />
                    </button>
                  </div>

                  {/* AI Status / Actions strip */}
                  {aiConfigured && (
                    <div className="pt-2.5 border-t border-[var(--md-sys-color-surface-container)] flex items-center justify-between gap-2 text-xs flex-wrap">
                      <div className="flex items-center gap-1.5 min-w-0">
                        {isOverAiLimit ? (
                          <span
                            className="px-2 py-0.5 rounded-[8px] font-semibold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-[11px]"
                            title="PDF exceeds 15MB AI reader limit"
                          >
                            {t('ai_skipped_size', lang)}
                          </span>
                        ) : isReadingThis ? (
                          <span className="flex items-center gap-1.5 text-[var(--md-sys-color-primary)] font-semibold text-[11px]">
                            <SparkleIcon size={13} className="animate-spin shrink-0" />
                            <span>{t('ai_reading_file', lang)}</span>
                          </span>
                        ) : analysis?.status === 'error' ? (
                          <span
                            className="px-2 py-0.5 rounded-[8px] font-semibold bg-[var(--md-sys-color-error-container)] text-[var(--md-sys-color-on-error-container)] text-[11px] truncate max-w-[200px]"
                            title={analysis.error}
                          >
                            {t('ai_error_badge', lang)}
                            {analysis.error ? `: ${analysis.error}` : ''}
                          </span>
                        ) : analysis?.status === 'skipped_size' ? (
                          <span className="px-2 py-0.5 rounded-[8px] font-semibold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-[11px]">
                            {t('ai_skipped_size', lang)}
                          </span>
                        ) : analysis?.status === 'done' ? (
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="px-1.5 py-0.5 rounded-[6px] bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] font-bold text-[10px]">
                              {t('ai_badge', lang)}
                            </span>
                            <span className="text-[11px] font-semibold text-[var(--md-sys-color-on-surface)] truncate max-w-[140px]">
                              {analysis.matched_requirement_id || (lang === 'bn' ? 'অজানা' : 'Unmatched')}
                            </span>
                            <span className="text-[10px] text-[var(--md-sys-color-on-surface-variant)]">
                              ({String(analysis.confidence)})
                            </span>
                          </div>
                        ) : (
                          <span className="text-[var(--md-sys-color-on-surface-variant)] text-[11px]">
                            {lang === 'bn' ? 'এআই দিয়ে পড়ার জন্য প্রস্তুত' : 'Ready for AI read'}
                          </span>
                        )}
                      </div>

                      {/* Per-file AI button */}
                      {!isOverAiLimit && !isReadingThis && (
                        <button
                          type="button"
                          onClick={() => onReadFileAi?.(file.id)}
                          disabled={isReadingAllAi}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-[12px] bg-[var(--md-sys-color-surface-container)] text-[var(--md-sys-color-on-surface)] hover:bg-[var(--md-sys-color-primary-container)] hover:text-[var(--md-sys-color-on-primary-container)] transition-colors duration-150 cursor-pointer font-semibold text-[11px] shrink-0"
                        >
                          <SparkleIcon size={12} />
                          <span>{t('btn_read_file_ai', lang)}</span>
                        </button>
                      )}
                    </div>
                  )}

                  {/* Manual assignment dropdown fallback */}
                  {requirements && onAssignRequirement && (
                    <div className="pt-2 border-t border-[var(--md-sys-color-surface-container)] flex items-center justify-between gap-2 text-xs">
                      <span className="text-[11px] text-[var(--md-sys-color-on-surface-variant)] shrink-0 font-medium">
                        {lang === 'bn' ? 'নথিতে মেলান:' : 'Assign to:'}
                      </span>
                      <select
                        value={
                          Array.from(matches?.entries() || []).find(([_, fId]) => fId === file.id)?.[0] || ''
                        }
                        onChange={(e) => onAssignRequirement(file.id, e.target.value)}
                        disabled={Boolean(file.error)}
                        style={{
                          backgroundColor: 'var(--md-sys-color-surface-container)',
                          color: 'var(--md-sys-color-on-surface)',
                        }}
                        className="text-[11px] h-8 px-2.5 rounded-[12px] font-semibold appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-[var(--md-sys-color-primary)] truncate max-w-[200px]"
                      >
                        <option value="">{lang === 'bn' ? 'কোনোটি নয়' : 'None (Unassigned)'}</option>
                        {requirements.map((r) => (
                          <option key={r.id} value={r.id}>
                            {lang === 'bn' ? r.title_bn : r.title_en}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};


