import { useCallback, useEffect, useRef, useState } from 'react';
import {
  listModels,
  pickFlashModel,
  normalizeModelId,
  type AiErrorCode,
} from '../../logic/ai/gemini';
import { loadTabKey, saveTabKey, clearTabKey } from '../../logic/ai/aiKeyStorage';

export type AiTestState =
  | { kind: 'idle' }
  | { kind: 'testing' }
  | { kind: 'ok'; model: string }
  | { kind: 'error'; code: AiErrorCode; status?: number };

/**
 * Holds the optional AI settings in React state only.
 * The key is never written to localStorage; sessionStorage is used only when
 * the user explicitly opts into "remember in this tab".
 */
export function useAiSettings() {
  const [apiKey, setApiKeyState] = useState<string>(() => loadTabKey());
  const [rememberTab, setRememberTab] = useState<boolean>(() => loadTabKey() !== '');
  const [consent, setConsent] = useState(false);
  const [modelOverride, setModelOverride] = useState('');
  const [autoModel, setAutoModel] = useState<string | null>(null);
  const [test, setTest] = useState<AiTestState>({ kind: 'idle' });
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (rememberTab && apiKey.trim()) saveTabKey(apiKey.trim());
    else clearTabKey();
  }, [rememberTab, apiKey]);

  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  const hasKey = apiKey.trim() !== '';
  const overrideTrim = modelOverride.trim();
  const overrideModel = overrideTrim ? normalizeModelId(overrideTrim) : null;
  const overrideInvalid = overrideTrim !== '' && overrideModel === null;
  const effectiveModel = overrideModel ?? autoModel;

  const setApiKey = useCallback((v: string) => {
    abortRef.current?.abort();
    setApiKeyState(v);
    setAutoModel(null);
    setTest({ kind: 'idle' });
  }, []);

  const forgetKey = useCallback(() => {
    abortRef.current?.abort();
    setApiKeyState('');
    setRememberTab(false);
    clearTabKey();
    setAutoModel(null);
    setTest({ kind: 'idle' });
  }, []);

  const testConnection = useCallback(async () => {
    const key = apiKey.trim();
    if (!key) return;
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setTest({ kind: 'testing' });

    const r = await listModels(key, ctrl.signal);
    if (ctrl.signal.aborted) return;
    if (!r.ok) {
      setTest({ kind: 'error', code: r.code, status: r.status });
      return;
    }

    const picked = pickFlashModel(r.data);
    setAutoModel(picked);

    if (overrideModel) {
      if (!r.data.some((m) => m.name === overrideModel)) {
        setTest({ kind: 'error', code: 'invalid_model' });
        return;
      }
      setTest({ kind: 'ok', model: overrideModel });
      return;
    }
    if (!picked) {
      setTest({ kind: 'error', code: 'no_flash_model' });
      return;
    }
    setTest({ kind: 'ok', model: picked });
  }, [apiKey, overrideModel]);

  return {
    apiKey,
    setApiKey,
    hasKey,
    rememberTab,
    setRememberTab,
    consent,
    setConsent,
    modelOverride,
    setModelOverride,
    overrideInvalid,
    autoModel,
    effectiveModel,
    test,
    testConnection,
    forgetKey,
  };
}

export type AiSettings = ReturnType<typeof useAiSettings>;
