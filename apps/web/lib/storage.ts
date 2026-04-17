const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';
const USER_KEY = 'user';
const THEME_KEY = 'theme';

function canUseStorage() {
  return typeof window !== 'undefined';
}

export type StoredUser = {
  id: number;
  email: string;
  status: string;
};

export function getAccessToken() {
  return canUseStorage() ? window.localStorage.getItem(ACCESS_TOKEN_KEY) : null;
}

export function getRefreshToken() {
  return canUseStorage()
    ? window.localStorage.getItem(REFRESH_TOKEN_KEY)
    : null;
}

export function getStoredUser(): StoredUser | null {
  if (!canUseStorage()) return null;

  const raw = window.localStorage.getItem(USER_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as StoredUser;
  } catch {
    window.localStorage.removeItem(USER_KEY);
    return null;
  }
}

export function setSession(session: {
  accessToken?: string;
  refreshToken?: string;
  user?: StoredUser;
}) {
  if (!canUseStorage()) return;

  if (session.accessToken) {
    window.localStorage.setItem(ACCESS_TOKEN_KEY, session.accessToken);
  }

  if (session.refreshToken) {
    window.localStorage.setItem(REFRESH_TOKEN_KEY, session.refreshToken);
  }

  if (session.user) {
    window.localStorage.setItem(USER_KEY, JSON.stringify(session.user));
  }
}

export type ThemePreference = 'light' | 'dark' | 'system';

export function getThemePreference(): ThemePreference | null {
  if (!canUseStorage()) return null;

  const value = window.localStorage.getItem(THEME_KEY);
  return value === 'light' || value === 'dark' || value === 'system'
    ? value
    : null;
}

export function setThemePreference(theme: ThemePreference) {
  if (!canUseStorage()) return;

  window.localStorage.setItem(THEME_KEY, theme);
}

export function clearSession() {
  if (!canUseStorage()) return;

  window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  window.localStorage.removeItem(REFRESH_TOKEN_KEY);
  window.localStorage.removeItem(USER_KEY);
}
