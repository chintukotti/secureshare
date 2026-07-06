const ACCESS_TOKEN_KEY = 'secureshare.accessToken';
const ID_TOKEN_KEY = 'secureshare.idToken';
const REFRESH_TOKEN_KEY = 'secureshare.refreshToken';
const USER_KEY = 'secureshare.user';

export function saveAuthSession({ accessToken, idToken, refreshToken, user }) {
  if (accessToken) localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  if (idToken) localStorage.setItem(ID_TOKEN_KEY, idToken);
  if (refreshToken) localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
}
export function getAccessToken() { return localStorage.getItem(ACCESS_TOKEN_KEY); }
export function getCurrentUserFromStorage() { try { return JSON.parse(localStorage.getItem(USER_KEY)); } catch { return null; } }
export function clearAuthSession() { localStorage.removeItem(ACCESS_TOKEN_KEY); localStorage.removeItem(ID_TOKEN_KEY); localStorage.removeItem(REFRESH_TOKEN_KEY); localStorage.removeItem(USER_KEY); }
