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
