import { env } from './env';
import {
  clearSession,
  getAccessToken,
  getRefreshToken,
  getStoredUser,
  setSession,
} from './storage';
import type { ApiResponse, AuthPayload } from './types';

export class ApiError extends Error {
  code: number;
  status: number;

  constructor(message: string, code = 5000, status = 500) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
  }
}

function apiUrl(path: string) {
  return `${env.apiBaseUrl}${path}`;
}

async function parseJson<T>(response: Response): Promise<ApiResponse<T>> {
  const text = await response.text();

  if (!text) {
    throw new ApiError('服务返回了空响应', 5000, response.status);
  }

  try {
    return JSON.parse(text) as ApiResponse<T>;
  } catch {
    throw new ApiError('服务返回了无效响应', 5000, response.status);
  }
}

async function parseResponse<T>(response: Response): Promise<ApiResponse<T>> {
  const result = await parseJson<T>(response);

  if (result.code !== 0) {
    throw new ApiError(
      result.message || 'Request failed',
      result.code,
      response.status,
    );
  }

  return result;
}

async function refreshAccessToken() {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    clearSession();
    throw new ApiError('登录状态已失效', 4001, 401);
  }

  const response = await fetch(apiUrl('/api/auth/refresh'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ refreshToken }),
  });

  const result = await parseResponse<{
    accessToken: string;
    refreshToken: string;
  }>(response);
  const currentUser = getStoredUser();

  setSession({
    accessToken: result.data.accessToken,
    refreshToken: result.data.refreshToken,
    user: currentUser || undefined,
  });

  return result.data.accessToken;
}

export async function apiRequest<T>(
  path: string,
  init: RequestInit & { auth?: boolean; retry?: boolean } = {},
): Promise<ApiResponse<T>> {
  const headers = new Headers(init.headers || {});
  const token = init.auth === false ? null : getAccessToken();

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  if (init.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(apiUrl(path), {
    ...init,
    headers,
  });

  const result = await parseJson<T>(response);

  if (result.code === 0) {
    return result;
  }

  if (result.code === 4001 && init.auth !== false && init.retry !== false) {
    try {
      const refreshedToken = await refreshAccessToken();
      const retryHeaders = new Headers(init.headers || {});
      retryHeaders.set('Authorization', `Bearer ${refreshedToken}`);
      if (init.body && !retryHeaders.has('Content-Type')) {
        retryHeaders.set('Content-Type', 'application/json');
      }

      const retryResponse = await fetch(apiUrl(path), {
        ...init,
        headers: retryHeaders,
      });
      return parseResponse<T>(retryResponse);
    } catch {
      clearSession();
      throw new ApiError('登录状态已失效', 4001, 401);
    }
  }

  throw new ApiError(
    result.message || 'Request failed',
    result.code,
    response.status,
  );
}

export async function authRequest(
  path: '/api/auth/login' | '/api/auth/register',
  payload: { email: string; password: string },
) {
  const result = await apiRequest<AuthPayload>(path, {
    method: 'POST',
    auth: false,
    body: JSON.stringify(payload),
  });

  setSession({
    accessToken: result.data.accessToken,
    refreshToken: result.data.refreshToken,
    user: result.data.user,
  });

  return result.data;
}
