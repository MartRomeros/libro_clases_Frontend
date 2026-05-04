export const estudianteKeys = {
  all: ['estudiante'] as const,
  notas: (estudianteId: number) => [...estudianteKeys.all, 'notas', { estudianteId }] as const,
  asistencia: (estudianteId: number) => [...estudianteKeys.all, 'asistencia', { estudianteId }] as const,
};
