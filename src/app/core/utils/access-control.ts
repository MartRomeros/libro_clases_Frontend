export type AppRole = 'Administrador' | 'Docente' | 'Estudiante' | 'Apoderado';

export function normalizeRole(role: string | null | undefined): AppRole | null {
  if (!role) {
    return null;
  }

  const normalized = role.trim().toLowerCase();

  if (normalized.includes('admin')) return 'Administrador';
  if (normalized.includes('docente')) return 'Docente';
  if (normalized.includes('estudiante')) return 'Estudiante';
  if (normalized.includes('apoderado')) return 'Apoderado';

  return null;
}

export function getHomeRouteForRole(role: string | null | undefined): string {
  switch (normalizeRole(role)) {
    case 'Administrador':
      return '/admin';
    case 'Docente':
      return '/docente';
    case 'Estudiante':
      return '/estudiante';
    case 'Apoderado':
      return '/perfil';
    default:
      return '/auth/login';
  }
}

export function isRoleAllowed(
  role: string | null | undefined,
  allowedRoles: readonly string[] | undefined
): boolean {
  if (!allowedRoles || allowedRoles.length === 0) {
    return true;
  }

  const normalizedRole = normalizeRole(role);
  return normalizedRole ? allowedRoles.includes(normalizedRole) : false;
}
