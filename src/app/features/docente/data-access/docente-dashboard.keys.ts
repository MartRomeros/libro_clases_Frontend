export const docenteDashboardKeys = {
  all: ['docente-dashboard'] as const,
  dashboard: () => [...docenteDashboardKeys.all, 'dashboard'] as const,
};
