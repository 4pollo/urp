import {
  clearSession,
  getAccessToken,
  getStoredUser,
  setSession,
} from './storage';
import { getCurrentUser, getMyPermissions } from './auth';

export function hasSession() {
  return Boolean(getAccessToken());
}

export function requireSession() {
  return hasSession();
}

export function getInitialUser() {
  return getStoredUser();
}

export async function hydrateSession() {
  const [user, permissionState] = await Promise.all([
    getCurrentUser(),
    getMyPermissions(),
  ]);

  const accessToken = getAccessToken();
  if (accessToken) {
    setSession({
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        status: user.status,
      },
    });
  }

  return {
    user,
    permissions: permissionState.permissions,
    roles: permissionState.roles,
  };
}

export function destroySession() {
  clearSession();
}
