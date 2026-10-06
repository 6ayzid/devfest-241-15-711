import type { DeltaInfo, PackageReadiness, RequirementStatusType } from './models';

export interface DeltaCause {
  type: 'match' | 'unmatch' | 'expiry_change' | 'file_upload' | 'file_remove' | 'auto_match' | 'load_requirements' | 'reset';
  documentTitle?: string;
  fromStatus?: RequirementStatusType;
  toStatus?: RequirementStatusType;
  fileName?: string;
}

export function describeDelta(
  prev: PackageReadiness | null,
  next: PackageReadiness,
  cause: DeltaCause
): DeltaInfo {
  if (!prev) {
    return {
      key: 'delta_initialized',
      params: { total: next.totalCount, blocking: next.blockingCount },
    };
  }

  if (cause.type === 'expiry_change' && cause.documentTitle) {
    if (cause.fromStatus && cause.toStatus && cause.fromStatus !== cause.toStatus) {
      return {
        key: 'delta_status_transition',
        params: {
          doc: cause.documentTitle,
          from: cause.fromStatus,
          to: cause.toStatus,
        },
      };
    }
    return {
      key: 'delta_expiry_updated',
      params: { doc: cause.documentTitle },
    };
  }

  if (cause.type === 'match' && cause.documentTitle) {
    if (next.blockingCount < prev.blockingCount) {
      return {
        key: 'delta_blocker_resolved',
        params: { doc: cause.documentTitle, remaining: next.blockingCount },
      };
    }
    return {
      key: 'delta_file_matched',
      params: { doc: cause.documentTitle },
    };
  }

  if (cause.type === 'unmatch' && cause.documentTitle) {
    return {
      key: 'delta_file_unmatched',
      params: { doc: cause.documentTitle, remaining: next.blockingCount },
    };
  }

  if (cause.type === 'auto_match') {
    const resolved = Math.max(0, prev.blockingCount - next.blockingCount);
    return {
      key: 'delta_auto_matched',
      params: { resolved, remaining: next.blockingCount },
    };
  }

  if (cause.type === 'file_upload') {
    return {
      key: 'delta_files_uploaded',
      params: { name: cause.fileName || '' },
    };
  }

  if (cause.type === 'file_remove') {
    return {
      key: 'delta_file_removed',
      params: { name: cause.fileName || '' },
    };
  }

  if (next.blockingCount === 0 && prev.blockingCount > 0) {
    return {
      key: 'delta_package_fully_ready',
      params: {},
    };
  }

  if (next.blockingCount !== prev.blockingCount) {
    return {
      key: 'delta_blocking_changed',
      params: { count: next.blockingCount },
    };
  }

  return {
    key: 'delta_unchanged',
    params: {},
  };
}
