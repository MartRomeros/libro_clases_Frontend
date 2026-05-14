export const comunicacionesKeys = {
  all: ['comunicaciones'] as const,
  conversaciones: (email: string) => [...comunicacionesKeys.all, 'conversaciones', email] as const,
  usuarios: () => [...comunicacionesKeys.all, 'usuarios'] as const,
};
