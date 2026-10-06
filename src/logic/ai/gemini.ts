/**
 * Minimal Gemini REST client. Pure TypeScript, no React.
 *
 * Security rules:
 * - The API key is passed in per call and only ever sent in the `x-goog-api-key`
 *   request header. It is never placed in a URL, logged, or persisted here.
 * - No model id is hardcoded; models are discovered via GET /models.
 * - Every function returns a result union and never throws.
 */

export const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta';

export type AiErrorCode =
  | 'blocked' // fetch threw: offline, CORS, ad-blocker, firewall
  | 'invalid_key'
  | 'forbidden'
  | 'rate_limited'
  | 'server'
  | 'http'
  | 'bad_response'
  | 'no_flash_model'
  | 'invalid_model'
  | 'content_blocked'
  | 'aborted';

export type AiResult<T> =
  | { ok: true; data: T }
  | { ok: false; code: AiErrorCode; status?: number; retryAfterMs?: number };

export interface GeminiModelInfo {
  name: string; // e.g. "models/xyz"
  displayName: string;
  methods: string[];
}

export function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

export function safeJsonParse(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
}

function isAbortError(e: unknown): boolean {
  return isRecord(e) && e.name === 'AbortError';
}

type FetchOutcome = { ok: true; res: Response; text: string } | { ok: false; code: AiErrorCode };

/** fetch + read body, never throws. */
export async function safeFetch(url: string, init: RequestInit): Promise<FetchOutcome> {
  try {
    const res = await fetch(url, { ...init, credentials: 'omit', cache: 'no-store' });
    let text = '';
    try {
      text = await res.text();
    } catch (e) {
      if (isAbortError(e)) return { ok: false, code: 'aborted' };
      text = '';
    }
    return { ok: true, res, text };
  } catch (e) {
    if (isAbortError(e) || init.signal?.aborted) return { ok: false, code: 'aborted' };
    return { ok: false, code: 'blocked' };
  }
}

/** Parses Google's RetryInfo ("17s") from an error body, capped at 60s. */
export function parseRetryDelayMs(bodyText: string): number | undefined {
  const m = /"retryDelay"\s*:\s*"(\d+(?:\.\d+)?)s"/.exec(bodyText);
  if (!m) return undefined;
  const ms = Math.round(Number(m[1]) * 1000);
  if (!Number.isFinite(ms) || ms <= 0) return undefined;
  return Math.min(ms, 60_000);
}

export function classifyHttpError(status: number, bodyText: string): AiErrorCode {
  if (status === 429) return 'rate_limited';
  if (status === 401) return 'invalid_key';
  if (status === 400 && /API_KEY_INVALID|API key not valid|API key expired/i.test(bodyText)) {
    return 'invalid_key';
  }
  if (status === 403) return 'forbidden';
  if (status === 404) return 'invalid_model';
  if (status >= 500) return 'server';
  return 'http';
}

function errorFromResponse(res: Response, text: string): AiResult<never> {
  return {
    ok: false,
    code: classifyHttpError(res.status, text),
    status: res.status,
    retryAfterMs: parseRetryDelayMs(text),
  };
}

/** GET /models (paginated, max 5 pages). */
export async function listModels(
  apiKey: string,
  signal?: AbortSignal
): Promise<AiResult<GeminiModelInfo[]>> {
  const key = apiKey.trim();
  if (!key) return { ok: false, code: 'invalid_key' };

  const out: GeminiModelInfo[] = [];
  let pageToken = '';

  for (let page = 0; page < 5; page++) {
    const params = new URLSearchParams({ pageSize: '1000' });
    if (pageToken) params.set('pageToken', pageToken);

    const r = await safeFetch(`${GEMINI_API_BASE}/models?${params.toString()}`, {
      method: 'GET',
      headers: { 'x-goog-api-key': key },
      signal,
    });
    if (!r.ok) return { ok: false, code: r.code };
    if (!r.res.ok) return errorFromResponse(r.res, r.text);

    const json = safeJsonParse(r.text);
    if (!isRecord(json)) return { ok: false, code: 'bad_response' };

    const models = Array.isArray(json.models) ? json.models : [];
    for (const m of models) {
      if (!isRecord(m) || typeof m.name !== 'string') continue;
      const methods = Array.isArray(m.supportedGenerationMethods)
        ? m.supportedGenerationMethods.filter((s): s is string => typeof s === 'string')
        : [];
      out.push({
        name: m.name,
        displayName: typeof m.displayName === 'string' ? m.displayName : m.name,
        methods,
      });
    }

    pageToken = typeof json.nextPageToken === 'string' ? json.nextPageToken : '';
    if (!pageToken) break;
  }

  return { ok: true, data: out };
}

/**
 * First model (in API order) whose name contains "flash" and supports generateContent.
 * Variants that cannot read documents (tts / image / audio / live / embedding) are
 * skipped when a regular flash model exists.
 */
export function pickFlashModel(models: GeminiModelInfo[]): string | null {
  const candidates = models.filter(
    (m) => m.name.toLowerCase().includes('flash') && m.methods.includes('generateContent')
  );
  const nonDoc = /(tts|image|audio|live|embedding)/i;
  const best = candidates.find((m) => !nonDoc.test(m.name)) ?? candidates[0];
  return best ? best.name : null;
}

/**
 * Validates a user-typed model id and returns it as "models/<id>", or null.
 * Restricted charset keeps the value safe to place in the request path.
 */
export function normalizeModelId(input: string): string | null {
  const trimmed = input.trim().replace(/^models\//, '');
  if (!/^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/.test(trimmed)) return null;
  return `models/${trimmed}`;
}

/** Model name for display (strips the "models/" prefix). */
export function shortModelName(name: string): string {
  return name.replace(/^models\//, '');
}
