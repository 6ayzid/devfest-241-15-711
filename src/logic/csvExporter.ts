import type { DocumentStatusInfo, UploadedFileRecord } from './models';

/**
 * Exports the tender document checklist as UTF-8 BOM CSV.
 */
export function generateChecklistCsv(
  documents: DocumentStatusInfo[],
  files: Map<string, UploadedFileRecord>,
  language: 'en' | 'bn'
): string {
  const headers = language === 'bn'
    ? ['ক্রম', 'ডকুমেন্ট নাম', 'ফাইলের নাম', 'পৃষ্ঠা সংখ্যা', 'মেয়াদ শেষ', 'স্ট্যাটাস', 'বাধ্যতামূলক']
    : ['Order', 'Document Title', 'File Name', 'Pages', 'Expiry Date', 'Status', 'Mandatory'];

  const rows: string[][] = [headers];

  for (const doc of documents) {
    const file = doc.matchedFileId ? files.get(doc.matchedFileId) : undefined;
    const title = language === 'bn' ? doc.title_bn : doc.title_en;
    const fileName = file ? file.name : (language === 'bn' ? 'কোন ফাইল নেই' : 'No file');
    const pages = file ? String(file.pageCount) : '-';
    const expiry = doc.expiryDate || (doc.has_expiry ? (language === 'bn' ? 'প্রয়োজন' : 'Needed') : 'N/A');
    const statusText = doc.status.toUpperCase();
    const mandatoryText = doc.mandatory ? (language === 'bn' ? 'হ্যাঁ' : 'Yes') : (language === 'bn' ? 'ঐচ্ছিক' : 'Optional');

    rows.push([
      String(doc.order),
      `"${title.replace(/"/g, '""')}"`,
      `"${fileName.replace(/"/g, '""')}"`,
      pages,
      expiry,
      statusText,
      mandatoryText,
    ]);
  }

  // UTF-8 BOM for Windows Excel compatibility
  const bom = '\uFEFF';
  const csvContent = rows.map((r) => r.join(',')).join('\r\n');
  return bom + csvContent;
}
