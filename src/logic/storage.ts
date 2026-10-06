export interface StoredSession {
  version: number;
  tenderId: string;
  matches: [string, string][]; // [reqId, fileId]
  expiryDates: [string, string][]; // [reqId, dateStr]
  includeIndexPage: boolean;
  theme: 'light' | 'dark' | 'system';
  language: 'en' | 'bn';
}

const STORAGE_PREFIX = 'app:v1:';
const SESSION_KEY = `${STORAGE_PREFIX}tender_session`;

export function loadSession(): StoredSession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as StoredSession;
    if (data && data.version === 1) {
      return data;
    }
  } catch {
    // Gracefully ignore corrupt local storage
  }
  return null;
}

export function saveSession(session: StoredSession): void {
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch {
    // Quota or access error handled silently
  }
}

export function clearSession(): void {
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch {
    // Handled silently
  }
}
