export const evaluationsKeys = {
  all: ['evaluations'] as const,
  cursos: () => [...evaluationsKeys.all, 'cursos'] as const,
  cursosByDocente: (docenteId: number) => [...evaluationsKeys.cursos(), { docenteId }] as const,
  estudiantes: () => [...evaluationsKeys.all, 'estudiantes'] as const,
  estudiantesByCurso: (cursoId: number) => [...evaluationsKeys.estudiantes(), { cursoId }] as const,
  evaluaciones: () => [...evaluationsKeys.all, 'evaluaciones'] as const,
  evaluacionesByCad: (cadId: number) => [...evaluationsKeys.evaluaciones(), { cadId }] as const,
  notas: () => [...evaluationsKeys.all, 'notas'] as const,
  notasByCursoAsignatura: (cursoId: number, asignaturaId: number) => 
    [...evaluationsKeys.notas(), { cursoId, asignaturaId }] as const,
};
