import { authRequest, apiRequest } from './fetcher';
import { clearSession } from './storage';
import type { AuthPayload, AuthUser, MyPermissions } from './types';

export function login(email: string, password: string): Promise<AuthPayload> {
  return authRequest('/api/auth/login', { email, password });
}

export function register(
  email: string,
  password: string,
): Promise<AuthPayload> {
  return authRequest('/api/auth/register', { email, password });
}

export async function getCurrentUser() {
  const result = await apiRequest<AuthUser>('/api/auth/me');
  return result.data;
}

export async function getMyPermissions() {
  const result = await apiRequest<MyPermissions>('/api/permissions/me');
  return result.data;
}

export function logout() {
  clearSession();
}

export async function changePassword(oldPassword: string, newPassword: string) {
  const result = await apiRequest<{ message: string }>(
    '/api/auth/change-password',
    {
      method: 'POST',
      body: JSON.stringify({ oldPassword, newPassword }),
    },
  );
  return result.data;
}
