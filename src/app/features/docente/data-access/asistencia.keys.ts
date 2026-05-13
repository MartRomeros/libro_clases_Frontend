export const attendanceKeys = {
    all: ['attendance'] as const,
    cursos: () => [...attendanceKeys.all, 'cursos'] as const,
    alumnos: () => [...attendanceKeys.all, 'alumnos'] as const,
    alumnosByCurso: (cursoId: number) => [...attendanceKeys.alumnos(), cursoId] as const,
    anotaciones: () => [...attendanceKeys.all, 'anotaciones'] as const,
    anotacionesByCurso: (cursoId: number) => [...attendanceKeys.anotaciones(), cursoId] as const,
    registrarAsistencia: () => [...attendanceKeys.all, 'registrar-asistencia'] as const,
};
