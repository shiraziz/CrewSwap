import Constants from 'expo-constants';

export type ApiEnvelope<T> = {
  success: boolean;
  message: string;
  data: T;
};

type ApiOptions = RequestInit & {
  auth?: boolean;
  retry?: boolean;
  timeoutMs?: number;
};

const extra = Constants.expoConfig?.extra as { apiBaseUrl?: string } | undefined;
const explicitApiBaseUrl = extra?.apiBaseUrl ?? process.env.EXPO_PUBLIC_API_URL;

function getDevApiBaseUrl() {
  if (typeof window !== 'undefined' && window.location.hostname) {
    const protocol = window.location.protocol === 'https:' ? 'https' : 'http';
    return `${protocol}://${window.location.hostname}:5000/api`;
  }

  const constants = Constants as typeof Constants & { manifest2?: { extra?: { expoGo?: { debuggerHost?: string } } } };
  const hostUri = Constants.expoConfig?.hostUri ?? constants.manifest2?.extra?.expoGo?.debuggerHost;
  const host = hostUri?.split(':')[0];

  return host ? `http://${host}:5000/api` : 'http://localhost:5000/api';
}

export const API_BASE_URL = explicitApiBaseUrl ?? getDevApiBaseUrl();
export const API_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, '');

let accessToken: string | null = null;
let refreshToken: string | null = null;

const storage = {
  get(key: string) {
    if (typeof localStorage === 'undefined') return null;
    return localStorage.getItem(key);
  },
  set(key: string, value: string) {
    if (typeof localStorage !== 'undefined') localStorage.setItem(key, value);
  },
  remove(key: string) {
    if (typeof localStorage !== 'undefined') localStorage.removeItem(key);
  },
};

export function loadStoredTokens() {
  accessToken = storage.get('crewswap.accessToken');
  refreshToken = storage.get('crewswap.refreshToken');
  return { accessToken, refreshToken };
}

export function setTokens(tokens: { accessToken: string; refreshToken: string }) {
  accessToken = tokens.accessToken;
  refreshToken = tokens.refreshToken;
  storage.set('crewswap.accessToken', tokens.accessToken);
  storage.set('crewswap.refreshToken', tokens.refreshToken);
}

export function clearTokens() {
  accessToken = null;
  refreshToken = null;
  storage.remove('crewswap.accessToken');
  storage.remove('crewswap.refreshToken');
}

async function refreshSession() {
  if (!refreshToken) return false;
  const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });
  if (!response.ok) return false;
  const json = (await response.json()) as ApiEnvelope<{ accessToken: string; refreshToken: string }>;
  setTokens(json.data);
  return true;
}

export async function api<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set('Accept', 'application/json');
  if (options.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
  if (options.auth !== false && accessToken) headers.set('Authorization', `Bearer ${accessToken}`);

  let response: Response;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), options.timeoutMs ?? 8000);
  try {
    response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers, signal: options.signal ?? controller.signal });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Network request failed';
    throw new Error(`Could not reach CrewSwap API at ${API_BASE_URL}. ${message}`);
  } finally {
    clearTimeout(timeout);
  }
  if (response.status === 401 && options.auth !== false && options.retry !== false && await refreshSession()) {
    return api<T>(path, { ...options, retry: false });
  }

  const text = await response.text();
  const json = text ? JSON.parse(text) as Partial<ApiEnvelope<T>> & {
    error?: string;
    errors?: Array<{ path?: Array<string | number>; message?: string }>;
  } : {};
  if (!response.ok) {
    const validationDetails = json.errors
      ?.map((issue) => {
        const path = issue.path?.join('.') ?? 'request';
        return issue.message ? `${path}: ${issue.message}` : path;
      })
      .join('; ');
    throw new Error(validationDetails ?? json.message ?? json.error ?? 'Request failed');
  }
  return json.data as T;
}

export function toIsoDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
}

export const formatDate = (value?: string) => value ? new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Not set';
export const formatTime = (value?: string) => value ? new Date(value).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }) : 'Not set';
export const mediaUrl = (value?: string | null) => value ? (value.startsWith('http') || value.startsWith('data:') ? value : `${API_ORIGIN}${value}`) : null;
