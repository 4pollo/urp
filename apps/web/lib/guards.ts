import type { AdminSection, AuthNavItem } from './types';

export const dashboardNavItem: AuthNavItem = {
  href: '/dashboard',
  label: '用户面板',
};

export const adminSections: AdminSection[] = [
  {
    href: '/admin/users',
    label: '用户管理',
    permission: 'user:read',
  },
  {
    href: '/admin/roles',
    label: '角色管理',
    permission: 'role:read',
  },
  {
    href: '/admin/permissions',
    label: '权限管理',
    permission: 'permission:read',
  },
];

export function isSuperAdmin(
  roles: Array<string | { name: string }> | undefined,
) {
  if (!roles) return false;

  return roles.some((role) =>
    typeof role === 'string'
      ? role === 'SuperAdmin'
      : role.name === 'SuperAdmin',
  );
}

export function hasPermission(
  permissions: string[] | undefined,
  permission: AdminSection['permission'],
) {
  return Boolean(permissions?.includes(permission));
}

export function getAccessibleAdminSections(
  permissions: string[] | undefined,
  roles?: Array<string | { name: string }>,
) {
  if (isSuperAdmin(roles)) {
    return adminSections;
  }

  return adminSections.filter((section) =>
    hasPermission(permissions, section.permission),
  );
}

export function getAuthenticatedNavItems(
  permissions: string[] | undefined,
  roles?: Array<string | { name: string }>,
) {
  return [dashboardNavItem, ...getAccessibleAdminSections(permissions, roles)];
}
