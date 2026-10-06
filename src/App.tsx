import { useReducer, useEffect, useRef, useState } from 'react';
import type {
  RequirementsData,
  UploadedFileRecord,
  PackageReadiness,
} from './logic/models';
import type { Language } from './logic/i18n';
import type { DeltaCause } from './logic/deltaDescriber';
import { DEFAULT_SAMPLE_REQUIREMENTS } from './logic/sampleData';
import { parseAndValidateRequirements } from './logic/validation';
import {
  inspectPdfFile,
  recalculateDuplicates,
} from './logic/fileProcessor';
import { computeDocumentStatuses } from './logic/statusComputer';
import { describeDelta } from './logic/deltaDescriber';
import { suggestAutoMatches } from './logic/matcher';
import { generateTenderPackage } from './logic/pdfGenerator';
import { generateChecklistCsv } from './logic/csvExporter';
import { loadSession, saveSession } from './logic/storage';
import { t } from './logic/i18n';
import {
  type AiDocumentAnalysis,
  MAX_AI_FILE_SIZE,
  readDocumentWithGemini,
  isHighConfidence,
} from './logic/ai/docReader';

// UI Presentation
import { TopBar } from './ui/TopBar';
import { BottomDock, type DockActionItem } from './ui/BottomDock';
import { HeroCard } from './ui/HeroCard';
import { FilePool } from './ui/FilePool';
import { ChecklistTable } from './ui/ChecklistTable';
import { ErrorBoundary } from './ui/ErrorBoundary';
import { Button } from './ui/Button';
import { AiSettingsSheet } from './ui/AiSettingsSheet';
import { useAiSettings } from './ui/hooks/useAiSettings';
import {
  UploadIcon,
  FileSpreadsheetIcon,
  RefreshIcon,
  FileJsonIcon,
  SparkleIcon,
} from './ui/icons';

interface AppState {
  requirementsData: RequirementsData;
  files: Map<string, UploadedFileRecord>;
  matches: Map<string, string>; // reqId -> fileId
  expiryDates: Map<string, string>; // reqId -> YYYY-MM-DD
  includeIndexPage: boolean;
  uploadError: string | null;
  theme: 'light' | 'dark' | 'system';
  language: Language;

  // Morph & Result state (Rule: one useReducer holds result, prevResult, lastCause, changeId)
  result: PackageReadiness;
  prevResult: PackageReadiness | null;
  lastCause: DeltaCause | null;
  changeId: number;
  generatedBlobUrl: string | null;
  isGenerating: boolean;
}

type AppAction =
  | { type: 'LOAD_REQUIREMENTS'; data: RequirementsData }
  | { type: 'ADD_FILES'; newFiles: UploadedFileRecord[] }
  | { type: 'REMOVE_FILE'; fileId: string }
  | { type: 'MATCH_FILE'; reqId: string; fileId: string }
  | { type: 'UNMATCH_FILE'; reqId: string }
  | { type: 'SET_EXPIRY'; reqId: string; dateStr: string }
  | { type: 'AUTO_MATCH' }
  | { type: 'APPLY_AI_MATCH'; reqId: string; fileId: string; expiryDate?: string }
  | { type: 'UNDO_AI_MATCH'; reqId: string; prevFileId?: string; prevExpiryDate?: string }
  | { type: 'TOGGLE_INDEX'; value: boolean }
  | { type: 'SET_THEME'; theme: 'light' | 'dark' | 'system' }
  | { type: 'SET_LANGUAGE'; lang: Language }
  | { type: 'SET_UPLOAD_ERROR'; error: string | null }
  | { type: 'START_GENERATING' }
  | { type: 'FINISH_GENERATING'; blobUrl: string }
  | { type: 'RESET_DATA' };

function computeInitialState(): AppState {
  const session = loadSession();
  const requirementsData = DEFAULT_SAMPLE_REQUIREMENTS;
  const files = new Map<string, UploadedFileRecord>();
  const matches = new Map<string, string>();
  const expiryDates = new Map<string, string>();

  const theme = session?.theme || 'system';
  const language = session?.language || 'en';
  const includeIndexPage = session?.includeIndexPage ?? false;

  const { readiness } = computeDocumentStatuses({
    requirements: requirementsData.requirements,
    submissionDeadline: requirementsData.tender.submission_deadline,
    matches,
    expiryDates,
    files,
  });

  return {
    requirementsData,
    files,
    matches,
    expiryDates,
    includeIndexPage,
    uploadError: null,
    theme,
    language,
    result: readiness,
    prevResult: null,
    lastCause: null,
    changeId: 1,
    generatedBlobUrl: null,
    isGenerating: false,
  };
}

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'LOAD_REQUIREMENTS': {
      const newReqs = action.data;
      const newMatches = new Map<string, string>();
      const newExpiries = new Map<string, string>();

      // Drop stale IDs
      const validReqIds = new Set(newReqs.requirements.map((r) => r.id));
      for (const [rId, fId] of state.matches.entries()) {
        if (validReqIds.has(rId) && state.files.has(fId)) {
          newMatches.set(rId, fId);
        }
      }
      for (const [rId, dateStr] of state.expiryDates.entries()) {
        if (validReqIds.has(rId)) {
          newExpiries.set(rId, dateStr);
        }
      }

      const { readiness } = computeDocumentStatuses({
        requirements: newReqs.requirements,
        submissionDeadline: newReqs.tender.submission_deadline,
        matches: newMatches,
        expiryDates: newExpiries,
        files: state.files,
      });

      return {
        ...state,
        requirementsData: newReqs,
        matches: newMatches,
        expiryDates: newExpiries,
        prevResult: state.result,
        result: readiness,
        lastCause: { type: 'load_requirements' },
        changeId: state.changeId + 1,
        generatedBlobUrl: null,
      };
    }

    case 'ADD_FILES': {
      const allFilesList = Array.from(state.files.values()).concat(action.newFiles);
      const recalculated = recalculateDuplicates(allFilesList);
      const nextFilesMap = new Map<string, UploadedFileRecord>();
      for (const f of recalculated) nextFilesMap.set(f.id, f);

      const { readiness } = computeDocumentStatuses({
        requirements: state.requirementsData.requirements,
        submissionDeadline: state.requirementsData.tender.submission_deadline,
        matches: state.matches,
        expiryDates: state.expiryDates,
        files: nextFilesMap,
      });

      return {
        ...state,
        files: nextFilesMap,
        prevResult: state.result,
        result: readiness,
        lastCause: {
          type: 'file_upload',
          fileName: action.newFiles.map((f) => f.name).join(', '),
        },
        changeId: state.changeId + 1,
        uploadError: null,
        generatedBlobUrl: null,
      };
    }

    case 'REMOVE_FILE': {
      const targetFile = state.files.get(action.fileId);
      const remainingFiles = Array.from(state.files.values()).filter(
        (f) => f.id !== action.fileId
      );
      const recalculated = recalculateDuplicates(remainingFiles);
      const nextFilesMap = new Map<string, UploadedFileRecord>();
      for (const f of recalculated) nextFilesMap.set(f.id, f);

      // Revert matched requirement if using this file
      const nextMatches = new Map(state.matches);
      let removedFromDocTitle: string | undefined;

      for (const [rId, fId] of nextMatches.entries()) {
        if (fId === action.fileId) {
          nextMatches.delete(rId);
          const req = state.requirementsData.requirements.find((r) => r.id === rId);
          removedFromDocTitle = req?.title_en;
        }
      }

      const { readiness } = computeDocumentStatuses({
        requirements: state.requirementsData.requirements,
        submissionDeadline: state.requirementsData.tender.submission_deadline,
        matches: nextMatches,
        expiryDates: state.expiryDates,
        files: nextFilesMap,
      });

      return {
        ...state,
        files: nextFilesMap,
        matches: nextMatches,
        prevResult: state.result,
        result: readiness,
        lastCause: {
          type: 'file_remove',
          fileName: targetFile?.name,
          documentTitle: removedFromDocTitle,
        },
        changeId: state.changeId + 1,
        generatedBlobUrl: null,
      };
    }

    case 'MATCH_FILE': {
      const nextMatches = new Map(state.matches);
      // Ensure one document per file: remove file if used elsewhere
      for (const [rId, fId] of nextMatches.entries()) {
        if (fId === action.fileId && rId !== action.reqId) {
          nextMatches.delete(rId);
        }
      }
      nextMatches.set(action.reqId, action.fileId);

      const targetReq = state.requirementsData.requirements.find(
        (r) => r.id === action.reqId
      );

      const { readiness } = computeDocumentStatuses({
        requirements: state.requirementsData.requirements,
        submissionDeadline: state.requirementsData.tender.submission_deadline,
        matches: nextMatches,
        expiryDates: state.expiryDates,
        files: state.files,
      });

      return {
        ...state,
        matches: nextMatches,
        prevResult: state.result,
        result: readiness,
        lastCause: {
          type: 'match',
          documentTitle: targetReq?.title_en,
        },
        changeId: state.changeId + 1,
        generatedBlobUrl: null,
      };
    }

    case 'UNMATCH_FILE': {
      const nextMatches = new Map(state.matches);
      nextMatches.delete(action.reqId);

      const targetReq = state.requirementsData.requirements.find(
        (r) => r.id === action.reqId
      );

      const { readiness } = computeDocumentStatuses({
        requirements: state.requirementsData.requirements,
        submissionDeadline: state.requirementsData.tender.submission_deadline,
        matches: nextMatches,
        expiryDates: state.expiryDates,
        files: state.files,
      });

      return {
        ...state,
        matches: nextMatches,
        prevResult: state.result,
        result: readiness,
        lastCause: {
          type: 'unmatch',
          documentTitle: targetReq?.title_en,
        },
        changeId: state.changeId + 1,
        generatedBlobUrl: null,
      };
    }

    case 'SET_EXPIRY': {
      const nextExpiries = new Map(state.expiryDates);
      if (action.dateStr.trim()) {
        nextExpiries.set(action.reqId, action.dateStr.trim());
      } else {
        nextExpiries.delete(action.reqId);
      }

      const targetReq = state.requirementsData.requirements.find(
        (r) => r.id === action.reqId
      );

      // Old document status for transition description
      const oldStatuses = computeDocumentStatuses({
        requirements: state.requirementsData.requirements,
        submissionDeadline: state.requirementsData.tender.submission_deadline,
        matches: state.matches,
        expiryDates: state.expiryDates,
        files: state.files,
      });
      const oldDoc = oldStatuses.documents.find((d) => d.requirementId === action.reqId);

      const { documents: newDocs, readiness } = computeDocumentStatuses({
        requirements: state.requirementsData.requirements,
        submissionDeadline: state.requirementsData.tender.submission_deadline,
        matches: state.matches,
        expiryDates: nextExpiries,
        files: state.files,
      });
      const newDoc = newDocs.find((d) => d.requirementId === action.reqId);

      return {
        ...state,
        expiryDates: nextExpiries,
        prevResult: state.result,
        result: readiness,
        lastCause: {
          type: 'expiry_change',
          documentTitle: targetReq?.title_en,
          fromStatus: oldDoc?.status,
          toStatus: newDoc?.status,
        },
        changeId: state.changeId + 1,
        generatedBlobUrl: null,
      };
    }

    case 'AUTO_MATCH': {
      const autoMatched = suggestAutoMatches(
        state.requirementsData.requirements,
        Array.from(state.files.values()),
        state.matches
      );

      const { readiness } = computeDocumentStatuses({
        requirements: state.requirementsData.requirements,
        submissionDeadline: state.requirementsData.tender.submission_deadline,
        matches: autoMatched,
        expiryDates: state.expiryDates,
        files: state.files,
      });

      return {
        ...state,
        matches: autoMatched,
        prevResult: state.result,
        result: readiness,
        lastCause: { type: 'auto_match' },
        changeId: state.changeId + 1,
        generatedBlobUrl: null,
      };
    }

    case 'APPLY_AI_MATCH': {
      const nextMatches = new Map(state.matches);
      for (const [rId, fId] of nextMatches.entries()) {
        if (fId === action.fileId && rId !== action.reqId) {
          nextMatches.delete(rId);
        }
      }
      nextMatches.set(action.reqId, action.fileId);

      const nextExpiries = new Map(state.expiryDates);
      if (action.expiryDate) {
        nextExpiries.set(action.reqId, action.expiryDate);
      }

      const targetReq = state.requirementsData.requirements.find(
        (r) => r.id === action.reqId
      );

      const { readiness } = computeDocumentStatuses({
        requirements: state.requirementsData.requirements,
        submissionDeadline: state.requirementsData.tender.submission_deadline,
        matches: nextMatches,
        expiryDates: nextExpiries,
        files: state.files,
      });

      return {
        ...state,
        matches: nextMatches,
        expiryDates: nextExpiries,
        prevResult: state.result,
        result: readiness,
        lastCause: {
          type: 'match',
          documentTitle: targetReq?.title_en,
        },
        changeId: state.changeId + 1,
        generatedBlobUrl: null,
      };
    }

    case 'UNDO_AI_MATCH': {
      const nextMatches = new Map(state.matches);
      if (action.prevFileId) {
        nextMatches.set(action.reqId, action.prevFileId);
      } else {
        nextMatches.delete(action.reqId);
      }

      const nextExpiries = new Map(state.expiryDates);
      if (action.prevExpiryDate !== undefined) {
        nextExpiries.set(action.reqId, action.prevExpiryDate);
      } else {
        nextExpiries.delete(action.reqId);
      }

      const targetReq = state.requirementsData.requirements.find(
        (r) => r.id === action.reqId
      );

      const { readiness } = computeDocumentStatuses({
        requirements: state.requirementsData.requirements,
        submissionDeadline: state.requirementsData.tender.submission_deadline,
        matches: nextMatches,
        expiryDates: nextExpiries,
        files: state.files,
      });

      return {
        ...state,
        matches: nextMatches,
        expiryDates: nextExpiries,
        prevResult: state.result,
        result: readiness,
        lastCause: {
          type: 'unmatch',
          documentTitle: targetReq?.title_en,
        },
        changeId: state.changeId + 1,
        generatedBlobUrl: null,
      };
    }

    case 'TOGGLE_INDEX': {
      return {
        ...state,
        includeIndexPage: action.value,
        generatedBlobUrl: null,
      };
    }

    case 'SET_THEME': {
      return { ...state, theme: action.theme };
    }

    case 'SET_LANGUAGE': {
      return { ...state, language: action.lang };
    }

    case 'SET_UPLOAD_ERROR': {
      return { ...state, uploadError: action.error };
    }

    case 'START_GENERATING': {
      return { ...state, isGenerating: true };
    }

    case 'FINISH_GENERATING': {
      return {
        ...state,
        isGenerating: false,
        generatedBlobUrl: action.blobUrl,
      };
    }

    case 'RESET_DATA': {
      const resetReqs = DEFAULT_SAMPLE_REQUIREMENTS;
      const { readiness } = computeDocumentStatuses({
        requirements: resetReqs.requirements,
        submissionDeadline: resetReqs.tender.submission_deadline,
        matches: new Map(),
        expiryDates: new Map(),
        files: state.files,
      });

      return {
        ...state,
        requirementsData: resetReqs,
        matches: new Map(),
        expiryDates: new Map(),
        prevResult: state.result,
        result: readiness,
        lastCause: { type: 'reset' },
        changeId: state.changeId + 1,
        generatedBlobUrl: null,
      };
    }

    default:
      return state;
  }
}

export default function App() {
  const [state, dispatch] = useReducer(appReducer, null, computeInitialState);
  const requirementsFileInputRef = useRef<HTMLInputElement>(null);

  // Optional AI (React state only; never part of the localStorage session)
  const ai = useAiSettings();
  const [aiSheetOpen, setAiSheetOpen] = useState(false);

  // AI Document Reader state
  const [aiAnalyses, setAiAnalyses] = useState<Map<string, AiDocumentAnalysis>>(new Map());
  const [aiAssignedReqs, setAiAssignedReqs] = useState<Set<string>>(new Set());
  const [aiPreviousMatches, setAiPreviousMatches] = useState<
    Map<string, { prevFileId?: string; prevExpiry?: string }>
  >(new Map());
  const [readingFileIds, setReadingFileIds] = useState<Set<string>>(new Set());
  const [isReadingAllAi, setIsReadingAllAi] = useState(false);

  // Sync theme with DOM
  useEffect(() => {
    if (state.theme === 'system') {
      document.documentElement.removeAttribute('data-theme');
    } else {
      document.documentElement.setAttribute('data-theme', state.theme);
    }
  }, [state.theme]);

  // Sync language with DOM
  useEffect(() => {
    document.documentElement.lang = state.language;
  }, [state.language]);

  // Save session to localStorage
  useEffect(() => {
    saveSession({
      version: 1,
      tenderId: state.requirementsData.tender.tender_id,
      matches: Array.from(state.matches.entries()),
      expiryDates: Array.from(state.expiryDates.entries()),
      includeIndexPage: state.includeIndexPage,
      theme: state.theme,
      language: state.language,
    });
  }, [
    state.requirementsData,
    state.matches,
    state.expiryDates,
    state.includeIndexPage,
    state.theme,
    state.language,
  ]);

  // Compute full document statuses
  const { documents } = computeDocumentStatuses({
    requirements: state.requirementsData.requirements,
    submissionDeadline: state.requirementsData.tender.submission_deadline,
    matches: state.matches,
    expiryDates: state.expiryDates,
    files: state.files,
  });

  // Result Morph delta description
  const delta = state.lastCause
    ? describeDelta(state.prevResult, state.result, state.lastCause)
    : null;

  // Handle file uploads
  const handleFileUpload = async (fileList: FileList | File[]) => {
    const currentTotalFiles = state.files.size;
    const currentTotalBytes = Array.from(state.files.values()).reduce(
      (acc, f) => acc + f.size,
      0
    );

    const validNewRecords: UploadedFileRecord[] = [];
    let errorMsg: string | null = null;

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      const res = await inspectPdfFile(
        file,
        currentTotalFiles + validNewRecords.length,
        currentTotalBytes
      );

      if (res.ok) {
        validNewRecords.push(res.record);
      } else {
        if (res.errorCode === 'not_a_pdf') {
          errorMsg = t('error_not_a_pdf', state.language, { name: res.fileName });
        } else if (res.errorCode === 'file_empty') {
          errorMsg = t('error_file_empty', state.language, { name: res.fileName });
        } else if (res.errorCode === 'exceeds_size_limit') {
          errorMsg = t('error_exceeds_size', state.language);
        } else if (res.errorCode === 'exceeds_count_limit') {
          errorMsg = t('error_exceeds_count', state.language);
        }
        break; // Stop processing further on quota/type breach
      }
    }

    if (errorMsg) {
      dispatch({ type: 'SET_UPLOAD_ERROR', error: errorMsg });
    }

    if (validNewRecords.length > 0) {
      dispatch({ type: 'ADD_FILES', newFiles: validNewRecords });
    }
  };

  // Handle requirements JSON upload
  const handleRequirementsUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const res = parseAndValidateRequirements(text);
      if (res.ok) {
        dispatch({ type: 'LOAD_REQUIREMENTS', data: res.data });
      } else {
        alert(t('error_invalid_json', state.language) + ' ' + res.errors.join(', '));
      }
    } catch {
      alert(t('error_invalid_json', state.language));
    }
    e.target.value = '';
  };

  // Handle PDF Generation
  const handleGeneratePdf = async () => {
    if (!state.result.isReady || state.isGenerating) return;

    dispatch({ type: 'START_GENERATING' });
    try {
      const pdfBytes = await generateTenderPackage({
        tender: state.requirementsData.tender,
        documents,
        files: state.files,
        includeIndexPage: state.includeIndexPage,
      });

      const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      dispatch({ type: 'FINISH_GENERATING', blobUrl: url });
    } catch (err) {
      console.error('Failed to generate PDF:', err);
      alert('An error occurred during PDF generation.');
      dispatch({ type: 'SET_UPLOAD_ERROR', error: 'PDF generation failed' });
    }
  };

  // Handle PDF Download
  const handleDownloadPdf = () => {
    if (!state.generatedBlobUrl) return;
    const filename = `${state.requirementsData.tender.tender_id}_Package.pdf`;
    const a = document.createElement('a');
    a.href = state.generatedBlobUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Handle CSV Checklist Export
  const handleExportCsv = () => {
    const csvStr = generateChecklistCsv(documents, state.files, state.language);
    const blob = new Blob([csvStr], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${state.requirementsData.tender.tender_id}_Checklist.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Theme cycler
  const handleThemeCycle = () => {
    const nextTheme =
      state.theme === 'light' ? 'dark' : state.theme === 'dark' ? 'system' : 'light';
    dispatch({ type: 'SET_THEME', theme: nextTheme });
  };

  // AI Document Reader logic
  const processFileWithAi = async (
    fileRecord: UploadedFileRecord
  ): Promise<AiDocumentAnalysis | null> => {
    if (!ai.hasKey || !ai.consent) return null;

    if (fileRecord.size > MAX_AI_FILE_SIZE) {
      const skippedAnalysis: AiDocumentAnalysis = {
        fileId: fileRecord.id,
        status: 'skipped_size',
        error: t('ai_skipped_size', state.language),
        reviewed: false,
      };
      setAiAnalyses((prev) => new Map(prev).set(fileRecord.id, skippedAnalysis));
      return skippedAnalysis;
    }

    setReadingFileIds((prev) => new Set(prev).add(fileRecord.id));

    try {
      const res = await readDocumentWithGemini({
        apiKey: ai.apiKey,
        selectedModel: ai.effectiveModel,
        fileBytes: fileRecord.bytes,
        fileName: fileRecord.name,
        fileId: fileRecord.id,
        fileSize: fileRecord.size,
        requirements: state.requirementsData.requirements,
      });

      if (res.ok) {
        const analysis = res.data;
        setAiAnalyses((prev) => new Map(prev).set(fileRecord.id, analysis));

        if (analysis.matched_requirement_id) {
          const req = state.requirementsData.requirements.find(
            (r) => r.id === analysis.matched_requirement_id
          );
          if (req) {
            const currentMatch = state.matches.get(req.id);
            const isHigh = isHighConfidence(analysis.confidence);

            // High confidence + empty slot = auto-assign with an "AI" badge, Edit, and Undo
            if (isHigh && !currentMatch) {
              const prevMatch = state.matches.get(req.id);
              const prevExpiry = state.expiryDates.get(req.id);
              setAiPreviousMatches((prev) =>
                new Map(prev).set(req.id, { prevFileId: prevMatch, prevExpiry })
              );

              const expiryToSet =
                req.has_expiry && analysis.expiry_date ? analysis.expiry_date : undefined;

              dispatch({
                type: 'APPLY_AI_MATCH',
                reqId: req.id,
                fileId: fileRecord.id,
                expiryDate: expiryToSet,
              });

              setAiAssignedReqs((prev) => new Set(prev).add(req.id));
            }
          }
        }
        return analysis;
      } else {
        const errAnalysis: AiDocumentAnalysis = {
          fileId: fileRecord.id,
          status: 'error',
          error: res.error,
          reviewed: false,
        };
        setAiAnalyses((prev) => new Map(prev).set(fileRecord.id, errAnalysis));
        return errAnalysis;
      }
    } finally {
      setReadingFileIds((prev) => {
        const next = new Set(prev);
        next.delete(fileRecord.id);
        return next;
      });
    }
  };

  const handleReadFileAi = async (fileId: string) => {
    const fileRecord = state.files.get(fileId);
    if (!fileRecord) return;
    await processFileWithAi(fileRecord);
  };

  const handleReadWithAi = async () => {
    if (!ai.hasKey || !ai.consent || isReadingAllAi) return;
    setIsReadingAllAi(true);
    try {
      for (const fileRecord of state.files.values()) {
        const existing = aiAnalyses.get(fileRecord.id);
        if (existing && existing.status === 'done') continue;
        await processFileWithAi(fileRecord);
      }
    } finally {
      setIsReadingAllAi(false);
    }
  };

  const handleApplyAiSuggestion = (
    reqId: string,
    fileId: string,
    expiryDate?: string
  ) => {
    const prevMatch = state.matches.get(reqId);
    const prevExpiry = state.expiryDates.get(reqId);
    setAiPreviousMatches((prev) =>
      new Map(prev).set(reqId, { prevFileId: prevMatch, prevExpiry })
    );

    dispatch({
      type: 'APPLY_AI_MATCH',
      reqId,
      fileId,
      expiryDate,
    });

    setAiAssignedReqs((prev) => new Set(prev).add(reqId));

    setAiAnalyses((prev) => {
      const next = new Map(prev);
      const an = next.get(fileId);
      if (an) {
        next.set(fileId, { ...an, reviewed: true, applied: true });
      }
      return next;
    });
  };

  const handleUndoAiMatch = (reqId: string) => {
    const prev = aiPreviousMatches.get(reqId);
    dispatch({
      type: 'UNDO_AI_MATCH',
      reqId,
      prevFileId: prev?.prevFileId,
      prevExpiryDate: prev?.prevExpiry,
    });

    setAiAssignedReqs((prevSet) => {
      const next = new Set(prevSet);
      next.delete(reqId);
      return next;
    });
  };

  const handleMarkAllReviewed = () => {
    setAiAnalyses((prev) => {
      const next = new Map(prev);
      for (const [k, v] of next.entries()) {
        next.set(k, { ...v, reviewed: true });
      }
      return next;
    });
  };

  const aiSuggestions = new Map<
    string,
    { file: UploadedFileRecord; analysis: AiDocumentAnalysis }
  >();
  for (const analysis of aiAnalyses.values()) {
    if (analysis.status === 'done' && analysis.matched_requirement_id) {
      const file = state.files.get(analysis.fileId);
      if (file) {
        aiSuggestions.set(analysis.matched_requirement_id, { file, analysis });
      }
    }
  }

  let pendingReviewCount = 0;
  for (const analysis of aiAnalyses.values()) {
    if (
      analysis.status === 'done' &&
      analysis.matched_requirement_id &&
      !analysis.reviewed
    ) {
      pendingReviewCount++;
    }
  }

  // Single actions array for both TopBar (>= 1024px) and BottomDock (< 1024px)
  const appActions: DockActionItem[] = [
    {
      id: 'load-sample',
      icon: <FileJsonIcon size={18} />,
      labelKey: 'btn_load_sample_json',
      dockLabelKey: 'dock_load',
      priority: 80,
      onPress: () => requirementsFileInputRef.current?.click(),
    },
    {
      id: 'export-csv',
      icon: <FileSpreadsheetIcon size={18} />,
      labelKey: 'btn_export_csv',
      dockLabelKey: 'dock_csv',
      priority: 70,
      onPress: handleExportCsv,
    },
    {
      id: 'reset',
      icon: <RefreshIcon size={18} />,
      labelKey: 'btn_reset_demo',
      dockLabelKey: 'dock_reset',
      priority: 60,
      onPress: () => {
        dispatch({ type: 'RESET_DATA' });
        setAiAnalyses(new Map());
        setAiAssignedReqs(new Set());
        setAiPreviousMatches(new Map());
      },
    },
    {
      id: 'upload',
      icon: <UploadIcon size={18} />,
      labelKey: 'btn_upload',
      dockLabelKey: 'dock_upload',
      priority: 100,
      isPrimary: true,
      onPress: () => {
        const input = document.getElementById('pdf-upload-input') as HTMLInputElement | null;
        if (input) {
          input.click();
        } else {
          window.scrollTo({ top: 300, behavior: 'smooth' });
        }
      },
    },
  ];

  return (
    <ErrorBoundary>
      <div className="min-h-[100dvh] flex flex-col bg-[var(--md-sys-color-surface)] text-[var(--md-sys-color-on-surface)] selection:bg-[var(--md-sys-color-primary-container)] selection:text-[var(--md-sys-color-on-primary-container)]">
        {/* Hidden requirements JSON file input */}
        <input
          type="file"
          ref={requirementsFileInputRef}
          accept=".json"
          className="hidden"
          onChange={handleRequirementsUpload}
        />

        {/* TOP BAR */}
        <TopBar
          lang={state.language}
          theme={state.theme}
          onLanguageChange={(l) => dispatch({ type: 'SET_LANGUAGE', lang: l })}
          onThemeCycle={handleThemeCycle}
          actions={appActions}
          desktopExtraActions={
            <Button
              variant="secondary"
              size="s"
              icon={<SparkleIcon size={16} />}
              onClick={() => setAiSheetOpen(true)}
            >
              {t('ai_settings_btn', state.language)}
            </Button>
          }
        />

        {/* MAIN WORKSPACE */}
        <main className="flex-1 max-w-7xl w-full min-w-0 mx-auto p-4 md:p-8 space-y-6 pb-[calc(92px+env(safe-area-inset-bottom))] md:pb-[calc(92px+env(safe-area-inset-bottom))] lg:pb-12">
          {/* Tender Metadata Ribbon */}
          <section
            style={{
              backgroundColor: 'var(--md-sys-color-surface-container)',
              borderRadius: '20px',
            }}
            className="p-4 md:p-6 flex flex-wrap items-center justify-between gap-4 text-xs md:text-sm"
          >
            <div>
              <span className="font-bold text-[var(--md-sys-color-on-surface)] text-base md:text-lg block">
                {state.requirementsData.tender.title}
              </span>
              <span className="text-[var(--md-sys-color-on-surface-variant)]">
                {t('procuring_entity_label', state.language)}:{' '}
                {state.requirementsData.tender.procuring_entity}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <div className="bg-[var(--md-sys-color-surface)] px-3 py-1.5 rounded-[12px]">
                <span className="text-[var(--md-sys-color-on-surface-variant)] block text-[11px]">
                  {t('tender_id_label', state.language)}
                </span>
                <span className="font-bold text-[var(--md-sys-color-primary)]">
                  {state.requirementsData.tender.tender_id}
                </span>
              </div>

              <div className="bg-[var(--md-sys-color-surface)] px-3 py-1.5 rounded-[12px]">
                <span className="text-[var(--md-sys-color-on-surface-variant)] block text-[11px]">
                  {t('deadline_label', state.language)}
                </span>
                <span className="font-bold text-rose-600 dark:text-rose-400">
                  {state.requirementsData.tender.submission_deadline}
                </span>
              </div>

              <div className="bg-[var(--md-sys-color-surface)] px-3 py-1.5 rounded-[12px]">
                <span className="text-[var(--md-sys-color-on-surface-variant)] block text-[11px]">
                  {t('bidder_label', state.language)}
                </span>
                <span className="font-bold">
                  {state.requirementsData.tender.bidder}
                </span>
              </div>
            </div>
          </section>

          {/* CONTAINER 1: HERO READINESS CARD */}
          <section>
            <HeroCard
              readiness={state.result}
              delta={delta}
              changeId={state.changeId}
              tenderId={state.requirementsData.tender.tender_id}
              isGenerating={state.isGenerating}
              generatedBlobUrl={state.generatedBlobUrl}
              lang={state.language}
              onGenerate={handleGeneratePdf}
              onDownload={handleDownloadPdf}
            />
          </section>

          {/* Options Strip */}
          <section className="flex flex-wrap items-center justify-between gap-4 px-2">
            <label className="flex items-center gap-3 cursor-pointer select-none text-xs md:text-sm font-semibold">
              <input
                type="checkbox"
                checked={state.includeIndexPage}
                onChange={(e) =>
                  dispatch({ type: 'TOGGLE_INDEX', value: e.target.checked })
                }
                className="w-4 h-4 rounded text-[var(--md-sys-color-primary)] focus:ring-[var(--md-sys-color-primary)] cursor-pointer"
              />
              <span>{t('option_include_index', state.language)}</span>
            </label>

            {/* Mobile AI settings button (< 1024px) */}
            <div className="flex lg:hidden items-center gap-2">
              <Button
                variant="secondary"
                size="s"
                icon={<SparkleIcon size={16} />}
                onClick={() => setAiSheetOpen(true)}
              >
                {t('ai_settings_btn', state.language)}
              </Button>
            </div>
          </section>

          {/* CONTAINER 2: FILE POOL */}
          <section>
            <FilePool
              files={Array.from(state.files.values())}
              lang={state.language}
              onUpload={handleFileUpload}
              onRemove={(fId) => {
                dispatch({ type: 'REMOVE_FILE', fileId: fId });
                setAiAnalyses((prev) => {
                  const next = new Map(prev);
                  next.delete(fId);
                  return next;
                });
              }}
              uploadError={state.uploadError}
              onClearError={() => dispatch({ type: 'SET_UPLOAD_ERROR', error: null })}
              aiConfigured={Boolean(ai.hasKey && ai.consent)}
              isReadingAllAi={isReadingAllAi}
              readingFileIds={readingFileIds}
              aiAnalyses={aiAnalyses}
              onReadWithAi={handleReadWithAi}
              onReadFileAi={handleReadFileAi}
              requirements={state.requirementsData.requirements}
              matches={state.matches}
              onAssignRequirement={(fileId, reqId) => {
                if (reqId) {
                  dispatch({ type: 'MATCH_FILE', reqId, fileId });
                } else {
                  for (const [rId, fId] of state.matches.entries()) {
                    if (fId === fileId) {
                      dispatch({ type: 'UNMATCH_FILE', reqId: rId });
                    }
                  }
                }
              }}
            />
          </section>

          {/* CONTAINER 3: CHECKLIST TABLE */}
          <section>
            <ChecklistTable
              documents={documents}
              files={Array.from(state.files.values())}
              matches={state.matches}
              expiryDates={state.expiryDates}
              lang={state.language}
              onMatch={(rId, fId) =>
                dispatch({ type: 'MATCH_FILE', reqId: rId, fileId: fId })
              }
              onUnmatch={(rId) => dispatch({ type: 'UNMATCH_FILE', reqId: rId })}
              onExpiryChange={(rId, dateStr) =>
                dispatch({ type: 'SET_EXPIRY', reqId: rId, dateStr })
              }
              onAutoMatch={() => dispatch({ type: 'AUTO_MATCH' })}
              aiAssignedReqs={aiAssignedReqs}
              aiSuggestions={aiSuggestions}
              pendingReviewCount={pendingReviewCount}
              onUndoAiMatch={handleUndoAiMatch}
              onApplyAiSuggestion={handleApplyAiSuggestion}
              onMarkAllReviewed={handleMarkAllReviewed}
            />
          </section>
        </main>

        {/* MOBILE BOTTOM DOCK (< 1024px) */}
        <BottomDock actions={appActions} lang={state.language} />

        {/* OPTIONAL AI SETTINGS (drawer / bottom sheet) */}
        <AiSettingsSheet
          open={aiSheetOpen}
          onClose={() => setAiSheetOpen(false)}
          lang={state.language}
          ai={ai}
          consentHighlight={false}
        />
      </div>
    </ErrorBoundary>
  );
}
