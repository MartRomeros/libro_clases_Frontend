# Checklist De Mejoras

- [x] Corregir AuthStore.clearSession() usando localStorage.clear() o removiendo solo token y user.
- [x] Unificar la estrategia de autenticación: dejar una sola fuente de verdad entre AuthService y AuthStore.
- [x] Proteger rutas por rol: admin, docente, estudiante no deberían depender solo de que exista token.
- [x] Cambiar navegación de logout inconsistente: actualmente unas partes usan /login y otras /auth.
- [x] Evitar JSON.parse(localStorage.getItem('user') || ""); usar parse seguro o el AuthStore.
- [ ] Definir un BFF real o documentar explícitamente si el frontend consumirá API Gateway directo.
- [ ] Agregar OpenAPI/Swagger para los microservicios y versionar contratos.
- [ ] Documentar ADRs: autenticación JWT custom, BFF/API Gateway, separación de microservicios, cache frontend.
- [ ] Agregar lint script, porque el README menciona npm run lint pero package.json no lo define.
- [ ] Eliminar any en APIs y componentes críticos; crear DTOs para requests/responses.
- [ ] Agregar manejo uniforme de errores HTTP y estados vacíos en todas las features.
- [ ] Agregar interceptores para errores 401/403 globales, no solo header de autorización.
- [ ] Revisar seguridad del token en localStorage; para producción sería preferible cookie HttpOnly si el backend lo permite.
- [ ] Reemplazar float para notas por numeric(3,1) o equivalente para evitar errores de precisión.
- [ ] Corregir nombre sala_evaluacione_asistencia; parece typo y dificulta mantenibilidad.
- [ ] Agregar módulo real de comunicaciones/mensajería, requerido por el contexto pero no visible en frontend.
- [ ] Agregar pipeline CI con build, tests, lint y validación de formato.
- [ ] Definir estrategia Git Flow o GitHub Flow documentada, como exige el caso.