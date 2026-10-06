import type { RequirementsData, RequirementItem, TenderMetadata } from './models';

export interface ValidationSuccess {
  ok: true;
  data: RequirementsData;
}

export interface ValidationFailure {
  ok: false;
  errors: string[];
}

export type ParseRequirementsResult = ValidationSuccess | ValidationFailure;

export function parseAndValidateRequirements(rawJson: unknown): ParseRequirementsResult {
  const errors: string[] = [];

  let obj: Record<string, unknown>;
  if (typeof rawJson === 'string') {
    try {
      obj = JSON.parse(rawJson) as Record<string, unknown>;
    } catch {
      return { ok: false, errors: ['invalid_json_format'] };
    }
  } else if (rawJson && typeof rawJson === 'object') {
    obj = rawJson as Record<string, unknown>;
  } else {
    return { ok: false, errors: ['invalid_payload_type'] };
  }

  // Tender metadata validation
  const tenderRaw = obj.tender as Record<string, unknown> | undefined;
  if (!tenderRaw || typeof tenderRaw !== 'object') {
    errors.push('missing_tender_metadata');
  }

  const tenderId = String(tenderRaw?.tender_id || '').trim();
  const title = String(tenderRaw?.title || '').trim();
  const procuringEntity = String(tenderRaw?.procuring_entity || '').trim();
  const bidder = String(tenderRaw?.bidder || '').trim();
  const submissionDeadline = String(tenderRaw?.submission_deadline || '').trim();

  if (!tenderId) errors.push('missing_tender_id');
  if (!title) errors.push('missing_tender_title');
  if (!procuringEntity) errors.push('missing_procuring_entity');
  if (!bidder) errors.push('missing_bidder');
  if (!submissionDeadline || !/^\d{4}-\d{2}-\d{2}$/.test(submissionDeadline)) {
    errors.push('invalid_submission_deadline');
  }

  // Requirements list validation
  const reqRaw = obj.requirements;
  if (!Array.isArray(reqRaw) || reqRaw.length === 0) {
    errors.push('empty_or_missing_requirements');
  }

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  const sanitizedRequirements: RequirementItem[] = [];
  const seenIds = new Set<string>();

  for (let i = 0; i < (reqRaw as unknown[]).length; i++) {
    const item = (reqRaw as Record<string, unknown>[])[i];
    if (!item || typeof item !== 'object') {
      errors.push(`invalid_requirement_at_index_${i}`);
      continue;
    }

    const id = String(item.id || '').trim();
    if (!id) {
      errors.push(`missing_id_at_index_${i}`);
    } else if (seenIds.has(id)) {
      errors.push(`duplicate_id_${id}`);
    } else {
      seenIds.add(id);
    }

    const orderNum = Number(item.order);
    if (!Number.isFinite(orderNum) || orderNum <= 0) {
      errors.push(`invalid_order_at_index_${i}`);
    }

    const titleEn = String(item.title_en || '').trim();
    let titleBn = String(item.title_bn || '').trim();
    if (!titleBn) {
      titleBn = titleEn; // Fallback to title_en if title_bn is missing
    }

    if (!titleEn) {
      errors.push(`missing_title_en_at_index_${i}`);
    }

    const mandatory = Boolean(item.mandatory);
    const hasExpiry = Boolean(item.has_expiry);

    sanitizedRequirements.push({
      id,
      order: orderNum,
      title_en: titleEn,
      title_bn: titleBn,
      mandatory,
      has_expiry: hasExpiry,
    });
  }

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  // Sort requirements strictly by numeric order
  sanitizedRequirements.sort((a, b) => a.order - b.order);

  const tender: TenderMetadata = {
    tender_id: tenderId,
    title,
    procuring_entity: procuringEntity,
    bidder,
    submission_deadline: submissionDeadline,
  };

  return {
    ok: true,
    data: {
      tender,
      requirements: sanitizedRequirements,
    },
  };
}
