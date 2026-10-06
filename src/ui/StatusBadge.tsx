import React from 'react';
import type { RequirementStatusType } from '../logic/models';
import type { Language } from '../logic/i18n';
import { t } from '../logic/i18n';
import { CheckCircleIcon, AlertCircleIcon, ClockIcon } from './icons';

export interface StatusBadgeProps {
  status: RequirementStatusType;
  lang: Language;
  showIcon?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  lang,
  showIcon = true,
}) => {
  const config = {
    ok: {
      bg: 'var(--md-sys-color-success-container)',
      color: 'var(--md-sys-color-on-success-container)',
      icon: <CheckCircleIcon size={16} />,
      labelKey: 'status_ok',
    },
    missing: {
      bg: 'var(--md-sys-color-error-container)',
      color: 'var(--md-sys-color-on-error-container)',
      icon: <AlertCircleIcon size={16} />,
      labelKey: 'status_missing',
    },
    expiry_needed: {
      bg: 'var(--md-sys-color-tertiary-container)',
      color: 'var(--md-sys-color-on-tertiary-container)',
      icon: <ClockIcon size={16} />,
      labelKey: 'status_expiry_needed',
    },
    expired: {
      bg: 'var(--md-sys-color-error-container)',
      color: 'var(--md-sys-color-on-error-container)',
      icon: <AlertCircleIcon size={16} />,
      labelKey: 'status_expired',
    },
    not_provided: {
      bg: 'var(--md-sys-color-surface-container-high)',
      color: 'var(--md-sys-color-on-surface-variant)',
      icon: null,
      labelKey: 'status_not_provided',
    },
  }[status];

  return (
    <span
      style={{
        backgroundColor: config.bg,
        color: config.color,
      }}
      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[16px] text-xs font-semibold whitespace-nowrap tracking-wide select-none transition-[background-color,color] duration-200"
    >
      {showIcon && config.icon}
      <span>{t(config.labelKey, lang)}</span>
    </span>
  );
};
