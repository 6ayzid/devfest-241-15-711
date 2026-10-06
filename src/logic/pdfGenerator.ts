import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import type { TenderMetadata, DocumentStatusInfo, UploadedFileRecord } from './models';

export interface GeneratePdfOptions {
  tender: TenderMetadata;
  documents: DocumentStatusInfo[];
  files: Map<string, UploadedFileRecord>;
  includeIndexPage?: boolean;
}

export function sanitizeForHelvetica(str: string): string {
  // Replace characters outside basic printable ASCII (0x20 to 0x7E) with '?'
  // ensuring pdf-lib StandardFonts.Helvetica never throws on unexpected Unicode or Bangla characters
  return (str || '').replace(/[^\x20-\x7E]/g, '?');
}

/**
 * Builds the complete verified tender PDF package adhering to Section 6 and contest rules.
 */
export async function generateTenderPackage(options: GeneratePdfOptions): Promise<Uint8Array> {
  const { tender, documents, files, includeIndexPage = false } = options;

  // Filter included documents: only matched files in order, skip optional unprovided
  const includedDocs = documents
    .filter((doc) => doc.matchedFileId && files.has(doc.matchedFileId))
    .sort((a, b) => a.order - b.order);

  // Compute total pages across all included documents
  let contentPagesCount = 0;
  const docPageSpans: { doc: DocumentStatusInfo; startPage: number; pageCount: number }[] = [];

  const coverPageCount = 1;
  const indexPageCount = includeIndexPage ? 1 : 0;
  let currentStartPage = coverPageCount + indexPageCount + 1;

  for (const doc of includedDocs) {
    const file = files.get(doc.matchedFileId!)!;
    const pCount = file.pageCount > 0 ? file.pageCount : 1;
    docPageSpans.push({
      doc,
      startPage: currentStartPage,
      pageCount: pCount,
    });
    contentPagesCount += pCount;
    currentStartPage += pCount;
  }

  const totalPagesY = coverPageCount + indexPageCount + contentPagesCount;
  const tenderIdClean = sanitizeForHelvetica(tender.tender_id);

  // Initialize target PDF
  const outDoc = await PDFDocument.create();
  const helveticaFont = await outDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await outDoc.embedFont(StandardFonts.HelveticaBold);

  const drawFooter = (
    page: ReturnType<typeof outDoc.addPage>,
    pageNumberX: number,
    pageWidth: number
  ) => {
    const footerText = `${tenderIdClean}  |  Page ${pageNumberX} of ${totalPagesY}`;
    const fontSize = 9;
    const textWidth = helveticaFont.widthOfTextAtSize(footerText, fontSize);
    const x = Math.max(20, (pageWidth - textWidth) / 2);
    // Draw in the bottom 32pt band (at y = 11)
    page.drawText(footerText, {
      x,
      y: 11,
      size: fontSize,
      font: helveticaFont,
      color: rgb(0.25, 0.25, 0.3),
    });
  };

  // --- 1. COVER PAGE (in English) ---
  const coverWidth = 595.28; // Standard A4 points
  const coverHeight = 841.89;
  const coverPage = outDoc.addPage([coverWidth, coverHeight]);

  const todayStr = new Date().toISOString().split('T')[0];

  // Cover header
  coverPage.drawText('TENDER SUBMISSION PACKAGE', {
    x: 50,
    y: 770,
    size: 20,
    font: helveticaBold,
    color: rgb(0.08, 0.24, 0.48),
  });

  coverPage.drawText('Official Bid Document Bundle', {
    x: 50,
    y: 748,
    size: 11,
    font: helveticaFont,
    color: rgb(0.4, 0.45, 0.55),
  });

  // Tender Metadata Section
  const metaStartX = 50;
  let metaY = 705;
  const lineSpacing = 22;

  const metadataFields = [
    { label: 'Tender ID:', val: tender.tender_id },
    { label: 'Tender Title:', val: tender.title },
    { label: 'Procuring Entity:', val: tender.procuring_entity },
    { label: 'Bidder Name:', val: tender.bidder },
    { label: 'Submission Deadline:', val: tender.submission_deadline },
    { label: 'Package Date:', val: todayStr },
  ];

  for (const item of metadataFields) {
    coverPage.drawText(item.label, {
      x: metaStartX,
      y: metaY,
      size: 10,
      font: helveticaBold,
      color: rgb(0.2, 0.25, 0.35),
    });
    coverPage.drawText(sanitizeForHelvetica(item.val), {
      x: metaStartX + 140,
      y: metaY,
      size: 10,
      font: helveticaFont,
      color: rgb(0.1, 0.1, 0.1),
    });
    metaY -= lineSpacing;
  }

  // Included Documents List Section
  metaY -= 15;
  coverPage.drawText('Included Documents (in order):', {
    x: metaStartX,
    y: metaY,
    size: 12,
    font: helveticaBold,
    color: rgb(0.08, 0.24, 0.48),
  });
  metaY -= 20;

  // Determine font size to ensure list fits on single cover page
  const itemsCount = includedDocs.length;
  let docFontSize = 10;
  let docItemSpacing = 20;
  if (itemsCount > 15) {
    docFontSize = 8;
    docItemSpacing = 14;
  } else if (itemsCount > 10) {
    docFontSize = 9;
    docItemSpacing = 16;
  }

  let index = 1;
  for (const span of docPageSpans) {
    const numPrefix = `${index}. [Order ${span.doc.order}] `;
    const titleText = sanitizeForHelvetica(span.doc.title_en);
    const pageNote = `(${span.pageCount} ${span.pageCount === 1 ? 'page' : 'pages'})`;
    const fullLine = `${numPrefix}${titleText}  ${pageNote}`;

    coverPage.drawText(fullLine, {
      x: metaStartX + 10,
      y: metaY,
      size: docFontSize,
      font: helveticaFont,
      color: rgb(0.15, 0.15, 0.2),
    });
    metaY -= docItemSpacing;
    index++;
  }

  drawFooter(coverPage, 1, coverWidth);

  // --- BONUS: INDEX PAGE (if enabled) ---
  if (includeIndexPage) {
    const indexPage = outDoc.addPage([coverWidth, coverHeight]);
    indexPage.drawText('TABLE OF CONTENTS / INDEX', {
      x: 50,
      y: 770,
      size: 18,
      font: helveticaBold,
      color: rgb(0.08, 0.24, 0.48),
    });

    indexPage.drawText('Document Navigation & Starting Pages', {
      x: 50,
      y: 748,
      size: 11,
      font: helveticaFont,
      color: rgb(0.4, 0.45, 0.55),
    });

    let indexY = 700;
    indexPage.drawText('Document', { x: 50, y: indexY, size: 10, font: helveticaBold, color: rgb(0.3, 0.3, 0.3) });
    indexPage.drawText('Pages', { x: 380, y: indexY, size: 10, font: helveticaBold, color: rgb(0.3, 0.3, 0.3) });
    indexPage.drawText('Starts at', { x: 460, y: indexY, size: 10, font: helveticaBold, color: rgb(0.3, 0.3, 0.3) });
    indexY -= 20;

    let idx = 1;
    for (const span of docPageSpans) {
      const title = sanitizeForHelvetica(span.doc.title_en);
      indexPage.drawText(`${idx}. ${title}`, { x: 50, y: indexY, size: 9, font: helveticaFont, color: rgb(0.1, 0.1, 0.1) });
      indexPage.drawText(`${span.pageCount}`, { x: 385, y: indexY, size: 9, font: helveticaFont, color: rgb(0.1, 0.1, 0.1) });
      indexPage.drawText(`Page ${span.startPage}`, { x: 460, y: indexY, size: 9, font: helveticaBold, color: rgb(0.1, 0.3, 0.6) });
      indexY -= 22;
      idx++;
    }

    drawFooter(indexPage, 2, coverWidth);
  }

  // --- 2. APPEND INCLUDED DOCUMENT PAGES WITH 32pt BOTTOM BAND ---
  let currentPageNumber = coverPageCount + indexPageCount + 1;

  for (const docInfo of includedDocs) {
    const file = files.get(docInfo.matchedFileId!)!;
    let srcDoc: PDFDocument;
    try {
      srcDoc = await PDFDocument.load(file.bytes, { ignoreEncryption: true });
    } catch {
      continue;
    }

    const srcPages = srcDoc.getPages();
    for (let pIdx = 0; pIdx < srcPages.length; pIdx++) {
      const srcPage = srcPages[pIdx];
      const { width: origWidth, height: origHeight } = srcPage.getSize();

      // Embed the source page
      const [embedded] = await outDoc.embedPages([srcPage]);

      // Make new page taller by 32pt bottom band
      const outHeight = origHeight + 32;
      const outPage = outDoc.addPage([origWidth, outHeight]);

      // Draw original content in upper part (y = 32)
      outPage.drawPage(embedded, {
        x: 0,
        y: 32,
        width: origWidth,
        height: origHeight,
      });

      // Draw footer in the 32pt bottom band
      drawFooter(outPage, currentPageNumber, origWidth);
      currentPageNumber++;
    }
  }

  return await outDoc.save();
}
