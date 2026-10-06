import React, { useRef } from 'react';
import type { UploadedFileRecord } from '../logic/models';
import type { Language } from '../logic/i18n';
import { t, formatFileSize } from '../logic/i18n';
import { FilePdfIcon, TrashIcon, UploadIcon, CopyIcon, AlertCircleIcon } from './icons';
import { Button } from './Button';

export interface FilePoolProps {
  files: UploadedFileRecord[];
  lang: Language;
  onUpload: (fileList: FileList) => void;
  onRemove: (fileId: string) => void;
  uploadError: string | null;
  onClearError: () => void;
}

export const FilePool: React.FC<FilePoolProps> = ({
  files,
  lang,
  onUpload,
  onRemove,
  uploadError,
  onClearError,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onUpload(e.dataTransfer.files);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onUpload(e.target.files);
      e.target.value = ''; // reset to permit selecting same file again if removed
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

        <input
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
        onDragOver={(e) => e.preventDefault()}
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
            {files.map((file) => (
              <div
                key={file.id}
                style={{
                  backgroundColor: 'var(--md-sys-color-surface)',
                }}
                className="p-4 rounded-[20px] flex items-start justify-between gap-3 shadow-xs border border-transparent"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-[14px] bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)] flex items-center justify-center shrink-0">
                    <FilePdfIcon size={20} />
                  </div>
                  <div className="min-w-0 space-y-1">
                    <p className="text-sm font-semibold truncate text-[var(--md-sys-color-on-surface)]" title={file.name}>
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
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
