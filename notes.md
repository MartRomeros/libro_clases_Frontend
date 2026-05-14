# Checklist De Mejoras

- [x] Corregir AuthStore.clearSession() usando localStorage.clear() o removiendo solo token y user.
- [x] Unificar la estrategia de autenticación: dejar una sola fuente de verdad entre AuthService y AuthStore.
- [x] Proteger rutas por rol: admin, docente, estudiante no deberían depender solo de que exista token.
- [x] Cambiar navegación de logout inconsistente: actualmente unas partes usan /login y otras /auth.
- [x] Evitar JSON.parse(localStorage.getItem('user') || ""); usar parse seguro o el AuthStore.
- [ ] Eliminar any en APIs y componentes críticos; crear DTOs para requests/responses.
- [x] Agregar manejo uniforme de errores HTTP y estados vacíos en todas las features.
- [ ] Agregar interceptores para errores 401/403 globales, no solo header de autorización.
- [x] Agregar pipeline CI con build.