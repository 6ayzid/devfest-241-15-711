export interface TenderMetadata {
  tender_id: string;
  title: string;
  procuring_entity: string;
  bidder: string;
  submission_deadline: string; // YYYY-MM-DD
}

export interface RequirementItem {
  id: string;
  order: number;
  title_en: string;
  title_bn: string;
  mandatory: boolean;
  has_expiry: boolean;
}

export interface RequirementsData {
  tender: TenderMetadata;
  requirements: RequirementItem[];
}

export type RequirementStatusType =
  | 'missing'
  | 'expiry_needed'
  | 'expired'
  | 'not_provided'
  | 'ok';

export interface DocumentStatusInfo {
  requirementId: string;
  order: number;
  title_en: string;
  title_bn: string;
  mandatory: boolean;
  has_expiry: boolean;
  status: RequirementStatusType;
  blocking: boolean;
  matchedFileId?: string;
  matchedFileName?: string;
  expiryDate?: string; // YYYY-MM-DD
  reasonKey?: string;
}

export interface UploadedFileRecord {
  id: string;
  name: string;
  size: number;
  pageCount: number;
  hash: string;
  bytes: Uint8Array;
  isDuplicate: boolean;
  duplicateGroupId?: string;
  duplicateOfName?: string;
  error?: string; // e.g., 'encrypted' | 'corrupted' | 'empty'
}

export interface BlockingReason {
  requirementId: string;
  documentTitle: string;
  status: RequirementStatusType;
}

export interface PackageReadiness {
  totalCount: number;
  readyCount: number;
  blockingCount: number;
  blockingReasons: BlockingReason[];
  isReady: boolean;
}

export interface DeltaInfo {
  key: string;
  params: Record<string, string | number>;
}
