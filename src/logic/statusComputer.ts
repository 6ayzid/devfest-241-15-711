import type {
  RequirementItem,
  RequirementStatusType,
  DocumentStatusInfo,
  PackageReadiness,
  UploadedFileRecord,
  BlockingReason,
} from './models';

export interface EvaluationInput {
  requirements: RequirementItem[];
  submissionDeadline: string; // YYYY-MM-DD
  matches: Map<string, string>; // requirementId -> fileId
  expiryDates: Map<string, string>; // requirementId -> YYYY-MM-DD
  files: Map<string, UploadedFileRecord>; // fileId -> UploadedFileRecord
}

/**
 * Pure evaluation function computing status for each requirement and overall package readiness.
 */
export function computeDocumentStatuses(input: EvaluationInput): {
  documents: DocumentStatusInfo[];
  readiness: PackageReadiness;
} {
  const { requirements, submissionDeadline, matches, expiryDates, files } = input;
  const deadline = submissionDeadline.trim();

  const documents: DocumentStatusInfo[] = [];
  const blockingReasons: BlockingReason[] = [];
  let readyCount = 0;

  // Requirements are guaranteed sorted by order
  for (const req of requirements) {
    const matchedFileId = matches.get(req.id);
    const matchedFile = matchedFileId ? files.get(matchedFileId) : undefined;
    const expiryDate = expiryDates.get(req.id)?.trim();

    let status: RequirementStatusType = 'missing';
    let blocking = false;
    let reasonKey: string | undefined = undefined;

    if (!matchedFile) {
      if (req.mandatory) {
        status = 'missing';
        blocking = true;
        reasonKey = 'reason_missing_mandatory';
      } else {
        status = 'not_provided';
        blocking = false;
        reasonKey = 'reason_optional_not_provided';
      }
    } else {
      // Check if the matched file itself has an unreadable/corrupt error
      if (matchedFile.error) {
        status = 'missing'; // blocked due to damaged file
        blocking = true;
        reasonKey = 'reason_file_damaged';
      } else if (req.has_expiry) {
        if (!expiryDate) {
          status = 'expiry_needed';
          blocking = true;
          reasonKey = 'reason_expiry_date_needed';
        } else if (expiryDate < deadline) {
          // Compare dates as YYYY-MM-DD strings directly
          status = 'expired';
          blocking = true;
          reasonKey = 'reason_document_expired';
        } else {
          status = 'ok';
          blocking = false;
          reasonKey = 'reason_ok';
        }
      } else {
        status = 'ok';
        blocking = false;
        reasonKey = 'reason_ok';
      }
    }

    if (blocking) {
      blockingReasons.push({
        requirementId: req.id,
        documentTitle: req.title_en,
        status,
      });
    } else {
      readyCount++;
    }

    documents.push({
      requirementId: req.id,
      order: req.order,
      title_en: req.title_en,
      title_bn: req.title_bn || req.title_en,
      mandatory: req.mandatory,
      has_expiry: req.has_expiry,
      status,
      blocking,
      matchedFileId: matchedFile?.id,
      matchedFileName: matchedFile?.name,
      expiryDate,
      reasonKey,
    });
  }

  const readiness: PackageReadiness = {
    totalCount: requirements.length,
    readyCount,
    blockingCount: blockingReasons.length,
    blockingReasons,
    isReady: blockingReasons.length === 0 && requirements.length > 0,
  };

  return { documents, readiness };
}
