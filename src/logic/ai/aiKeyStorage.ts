/**
 * Optional "remember in this tab" storage for the user's Gemini key.
 * Uses sessionStorage ONLY (cleared when the tab closes). Never localStorage.
 * Off by default; the app writes here only when the user opts in.
 */
const TAB_KEY = 'app:v1:ai_key_tab';

export function loadTabKey(): string {
  try {
    const v = sessionStorage.getItem(TAB_KEY);
    return typeof v === 'string' ? v : '';
  } catch {
    return '';
  }
}

export function saveTabKey(key: string): void {
  try {
    sessionStorage.setItem(TAB_KEY, key);
  } catch {
    // storage unavailable: key simply stays in memory
  }
}

export function clearTabKey(): void {
  try {
    sessionStorage.removeItem(TAB_KEY);
  } catch {
    // ignore
  }
}
