import type { RequirementItem, UploadedFileRecord } from './models';

export interface CanMatchResult {
  canMatch: boolean;
  reasonKey?: string;
  duplicateOfName?: string;
}

/**
 * Checks if a given file can be matched to a requirement, taking duplicate groups and exclusivity into account.
 */
export function canMatchFile(
  fileId: string,
  targetRequirementId: string,
  matches: Map<string, string>, // reqId -> fileId
  files: Map<string, UploadedFileRecord>
): CanMatchResult {
  const file = files.get(fileId);
  if (!file) {
    return { canMatch: false, reasonKey: 'file_not_found' };
  }

  if (file.error) {
    return { canMatch: false, reasonKey: 'file_is_damaged' };
  }

  // Check if another copy from the same duplicate group is already matched to a DIFFERENT requirement
  if (file.isDuplicate && file.duplicateGroupId) {
    for (const [matchedReqId, matchedFileId] of matches.entries()) {
      if (matchedReqId !== targetRequirementId) {
        const otherFile = files.get(matchedFileId);
        if (otherFile && otherFile.hash === file.hash) {
          return {
            canMatch: false,
            reasonKey: 'duplicate_copy_already_matched',
            duplicateOfName: otherFile.name,
          };
        }
      }
    }
  }

  return { canMatch: true };
}

/**
 * Intelligent heuristic auto-matcher mapping available files to requirements.
 */
export function suggestAutoMatches(
  requirements: RequirementItem[],
  files: UploadedFileRecord[],
  currentMatches: Map<string, string>
): Map<string, string> {
  const newMatches = new Map<string, string>(currentMatches);
  const matchedFileIds = new Set<string>(newMatches.values());
  const matchedHashes = new Set<string>();

  for (const fId of matchedFileIds) {
    const f = files.find((item) => item.id === fId);
    if (f) matchedHashes.add(f.hash);
  }

  // Keywords dictionary for common procurement documents
  const keywordMap: Record<string, string[]> = {
    R01: ['trade', 'license', 'ট্রেড', 'লাইসেন্স'],
    R02: ['tin', 'taxpayer', 'টিআইএন'],
    R03: ['vat', 'ভ্যাট'],
    R04: ['bank', 'solvency', 'সচ্ছলতা', 'ব্যাংক'],
    R05: ['experience', 'অভিজ্ঞতা'],
    R06: ['audited', 'financial_statement', 'নিরীক্ষিত'],
    R07: ['manufacturer', 'authorization', 'প্রস্তুতকারক'],
    R08: ['technical', 'কারিগরি'],
    R09: ['financial_proposal', 'আর্থিক'],
    R10: ['declaration', 'scan', 'ঘোষণা', 'স্বাক্ষরিত'],
  };

  for (const req of requirements) {
    if (newMatches.has(req.id)) continue;

    const keywords = keywordMap[req.id] || [];
    const titleEnWords = req.title_en.toLowerCase().split(/\s+/).filter(w => w.length > 2);

    let bestCandidate: UploadedFileRecord | null = null;
    let highestScore = 0;

    for (const file of files) {
      if (file.error) continue;
      if (matchedFileIds.has(file.id)) continue;
      if (matchedHashes.has(file.hash)) continue;

      const nameLower = file.name.toLowerCase();
      let score = 0;

      // Prefer non-expired versions if years are indicated in filename
      if (nameLower.includes('2026') || nameLower.includes('2027')) score += 5;
      if (nameLower.includes('2024') || nameLower.includes('2025')) score -= 2;

      for (const kw of keywords) {
        if (nameLower.includes(kw)) score += 10;
      }

      for (const tw of titleEnWords) {
        if (nameLower.includes(tw)) score += 6;
      }

      if (score > highestScore && score >= 6) {
        highestScore = score;
        bestCandidate = file;
      }
    }

    if (bestCandidate) {
      newMatches.set(req.id, bestCandidate.id);
      matchedFileIds.add(bestCandidate.id);
      matchedHashes.add(bestCandidate.hash);
    }
  }

  return newMatches;
}
