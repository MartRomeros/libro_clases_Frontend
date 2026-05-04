export const adminKeys = {
  all: ['admin'] as const,
  usuarios: () => [...adminKeys.all, 'usuarios'] as const,
  docentes: () => [...adminKeys.all, 'docentes'] as const,
  estudiantes: () => [...adminKeys.all, 'estudiantes'] as const,
  cursos: () => [...adminKeys.all, 'cursos'] as const,
  asignaturas: () => [...adminKeys.all, 'asignaturas'] as const,
  cads: () => [...adminKeys.all, 'cads'] as const,
  evaluaciones: () => [...adminKeys.all, 'evaluaciones'] as const,
  evaluacionesByCad: (cadId: number) => [...adminKeys.evaluaciones(), { cadId }] as const,
};
