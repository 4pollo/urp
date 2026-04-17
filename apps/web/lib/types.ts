export type ApiResponse<T> = {
  code: number;
  message: string;
  data: T;
};

export type AuthUser = {
  id: number;
  email: string;
  status: string;
  lastLoginAt?: string | null;
  roles?: Array<{ id: number; name: string; description?: string }>;
};

export type AuthPayload = {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
};

export type MyPermissions = {
  roles: string[];
  permissions: string[];
};

export type AdminSection = {
  href: '/admin/users' | '/admin/roles' | '/admin/permissions';
  label: string;
  permission: 'user:read' | 'role:read' | 'permission:read';
};

export type AuthNavItem =
  | {
      href: '/dashboard';
      label: string;
    }
  | AdminSection;

export type UserListItem = {
  id: number;
  email: string;
  status: string;
  lastLoginAt: string | null;
  createdAt: string;
  roles: Array<{ id: number; name: string }>;
};

export type UserListResponse = {
  items: UserListItem[];
  total: number;
  page: number;
  limit: number;
};

export type RoleListItem = {
  id: number;
  name: string;
  description: string;
  permissionCount: number;
  createdAt: string;
};

export type RoleListResponse = {
  items: RoleListItem[];
  total: number;
  page: number;
  limit: number;
};

export type RoleDetail = {
  id: number;
  name: string;
  description: string;
  userCount: number;
  permissions: PermissionItem[];
  createdAt: string;
  updatedAt: string;
};

export type PermissionItem = {
  id: number;
  key: string;
  group: string;
  description: string;
  createdAt?: string;
};

export type PermissionListResponse = {
  items: PermissionItem[];
  total: number;
  page: number;
  limit: number;
};
