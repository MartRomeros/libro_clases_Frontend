# Tasks: Integrar TanStack Query en Angular

- [x]
## Task 1: Configurar TanStack Query global

### Objetivo

Reemplazar la configuración actual de TanStack Query por la configuración obligatoria definida en la spec.

### Archivos esperados

- `src/app/app.config.ts`

### Tests requeridos

- No se crean tests.
- Ejecutar `npm run build` al final de la tarea o al cierre del bloque de configuración/auth.

### Criterio de finalización

- `app.config.ts` usa `provideTanStackQuery`.
- Se elimina el uso de `provideAngularQuery`.
- `QueryClient` queda configurado con:
  - `staleTime: 5 * 60 * 1000`
  - `gcTime: 10 * 60 * 1000`
  - `retry: 1`
  - `refetchOnWindowFocus: false`
  - `mutations.retry: 0`

- [x]
## Task 2: Definir patrón base de errores y sesión en AuthService

### Objetivo

Preparar `AuthService` para exponer options de TanStack Query y centralizar guardado, limpieza de sesión y errores 401.

### Archivos esperados

- `src/app/core/services/auth.service.ts`
- `src/app/core/models/auth.model.ts`

### Tests requeridos

- No se crean tests.
- Validación manual posterior con login/logout.

### Criterio de finalización

- `AuthService` mantiene `token`, `currentUser` e `isAuthenticated`.
- Existe una forma reutilizable de guardar token/usuario.
- `logout()` limpia storage, signals y cache con `queryClient.clear()`.
- Existe manejo claro para error 401.
- `forgot-password`, `register` y `reset-password` no se incluyen.

- [x]
## Task 3: Migrar queries de auth

### Objetivo

Migrar validación de token y perfil al patrón `queryOptions` en servicio + `injectQuery` en consumidores.

### Archivos esperados

- `src/app/core/services/auth.service.ts`
- `src/app/core/guards/auth.guard.ts`
- `src/app/shared/components/user-profile/user-profile.ts`
- `src/app/shared/components/user-profile/user-profile.html`
- `src/app/features/home/docente-home/docente-home.ts`

### Tests requeridos

- No se crean tests.
- Verificación manual:
  - Perfil carga con sesión válida.
  - Guard redirige a `/login` sin token.
  - Token inválido limpia sesión.

### Criterio de finalización

- `AuthService` expone options para `validateToken` y `profile`.
- Los consumidores crean queries con `injectQuery`.
- No quedan `injectQuery` como propiedades directas dentro de `AuthService` para estas operaciones.
- Queries dependientes de token usan `enabled`.

- [x]
## Task 4: Migrar login a mutation

### Objetivo

Reemplazar el login basado en `Observable.subscribe()` por una mutation de TanStack Query.

### Archivos esperados

- `src/app/core/services/auth.service.ts`
- `src/app/features/auth/login/login.ts`
- `src/app/features/auth/login/login.html`

### Tests requeridos

- No se crean tests.
- Verificación manual:
  - Login exitoso por rol.
  - Login fallido muestra snackbar.
  - Submit queda deshabilitado mientras la mutation está pendiente.

### Criterio de finalización

- `AuthService` expone `loginOptions()` con `mutationOptions`.
- `Login` usa `injectMutation`.
- No queda `authService.login(...).subscribe()`.
- `onSuccess` guarda sesión e invalida `['validateToken']` y `['userProfile']`.
- La UI usa estado de la mutation para loading/error.

- [x]
## Task 5: Migrar AdminService a queryOptions y mutationOptions

### Objetivo

Convertir todas las operaciones HTTP de administración al patrón de TanStack Query.

### Archivos esperados

- `src/app/core/services/admin.service.ts`

### Tests requeridos

- No se crean tests.
- Verificación técnica posterior con búsqueda de `.get`, `.post`, `.put`, `.delete` dentro del servicio solo dentro de `queryFn`/`mutationFn`.

### Criterio de finalización

- Todas las lecturas exponen `queryOptions`.
- Todas las escrituras exponen `mutationOptions`.
- Las mutations definen `mutationKey`.
- Las mutations invalidan queries reales relacionadas en `onSuccess`.
- Operaciones encadenadas quedan modeladas como una sola mutation async cuando aplique.
- `HttpClient` se mantiene y se convierte con `firstValueFrom`.

- [x]
## Task 6: Migrar componente de administración de usuarios

### Objetivo

Reemplazar los `.subscribe()` HTTP del módulo de administración por queries y mutations.

### Archivos esperados

- `src/app/features/home/admin-home/components/admin-user-management/admin-user-management.ts`
- `src/app/features/home/admin-home/components/admin-user-management/admin-user-management.html`

### Tests requeridos

- No se crean tests.
- Verificación manual:
  - Carga usuarios, CAD, cursos, asignaturas y estudiantes.
  - Crear/editar/eliminar usuario funciona.
  - Crear/eliminar curso funciona.
  - Crear/eliminar asignatura funciona.
  - Vincular/eliminar CAD funciona.
  - Crear/editar/eliminar evaluación funciona.

### Criterio de finalización

- El componente usa `injectQuery` para cargas.
- El componente usa `injectMutation` para escrituras.
- No quedan `.subscribe()` asociados a HTTP.
- Los formularios se deshabilitan o protegen mientras la mutation correspondiente está pendiente.
- Los errores de mutations muestran snackbar.
- La UI refleja carga/error de queries.

- [x]
## Task 7: Migrar DocenteService a queryOptions y mutationOptions

### Objetivo

Convertir las operaciones HTTP docentes al patrón de TanStack Query.

### Archivos esperados

- `src/app/core/services/docente.service.ts`

### Tests requeridos

- No se crean tests.
- Verificación técnica posterior con búsqueda de métodos HTTP solo dentro de `queryFn`/`mutationFn`.

### Criterio de finalización

- Consultas de cursos, estudiantes, notas, anotaciones y evaluaciones exponen `queryOptions`.
- Guardados de notas, asistencias, anotaciones y evaluaciones exponen `mutationOptions`.
- Las mutations invalidan keys relacionadas reales.
- `HttpClient` se mantiene y se convierte con `firstValueFrom`.
- [x]
## Task 8: Migrar evaluaciones y desagrupar forkJoin

### Objetivo

Reemplazar el flujo de evaluaciones basado en `subscribe()` y `forkJoin` por queries independientes y mutations.

### Archivos esperados

- `src/app/features/evaluations/evaluations.ts`
- `src/app/features/evaluations/evaluations.html`

### Tests requeridos

- No se crean tests.
- Verificación manual:
  - Carga cursos.
  - Cambio de curso dispara datos correctos.
  - Tabla se renderiza con estudiantes, evaluaciones y notas.
  - Crear evaluación refresca datos relacionados.
  - Error parcial muestra datos disponibles cuando sea viable.

### Criterio de finalización

- No queda `forkJoin` asociado a HTTP.
- No quedan `.subscribe()` asociados a HTTP.
- Existen queries independientes para estudiantes, evaluaciones y notas.
- La tabla se deriva desde `data()` de las queries.
- La creación de evaluación usa `injectMutation`.
- Loading/error provienen de TanStack Query.
- [x]
## Task 9: Migrar StudentGrades

### Objetivo

Migrar la carga de notas del estudiante a TanStack Query.

### Archivos esperados

- `src/app/features/student-grades/student-grades.ts`
- `src/app/features/student-grades/student-grades.html`

### Tests requeridos

- No se crean tests.
- Verificación manual:
  - Carga notas del estudiante autenticado.
  - Muestra loading.
  - Muestra error amigable si falla.

### Criterio de finalización

- El componente usa `injectQuery`.
- No queda `.subscribe()` HTTP.
- Query dependiente de estudiante usa `enabled` si el ID no está disponible.
- La UI consume `data`, loading y error desde la query.
- [x]
## Task 10: Migrar StudentAttendance y eliminar HTTP directo en componente

### Objetivo

Eliminar la llamada directa a `HttpClient` desde el componente de asistencia de estudiante.

### Archivos esperados

- `src/app/features/student-attendance/student-attendance.ts`
- `src/app/features/student-attendance/student-attendance.html`
- Servicio existente o nuevo servicio dentro del alcance mínimo necesario.

### Tests requeridos

- No se crean tests.
- Verificación manual:
  - Carga asistencia del estudiante.
  - Totales y gráfico se calculan correctamente.
  - Error se muestra de forma amigable.

### Criterio de finalización

- No queda `HttpClient` directo en `StudentAttendance`.
- La petición se expone como `queryOptions` desde un servicio.
- El componente usa `injectQuery`.
- Totales y gráfico derivan de `data()` de la query.
- [x]
## Task 11: Migrar AttendanceConductService

### Objetivo

Convertir operaciones HTTP de asistencia/conducta a `queryOptions` y `mutationOptions`.

### Archivos esperados

- `src/app/features/attendance-conduct/services/attendance-conduct.service.ts`

### Tests requeridos

- No se crean tests.
- Verificación técnica posterior con búsqueda de métodos HTTP solo dentro de `queryFn`/`mutationFn`.

### Criterio de finalización

- Cursos y alumnos se exponen como `queryOptions`.
- Registro de asistencia se expone como `mutationOptions`.
- La mutation invalida queries relacionadas.
- `HttpClient` se mantiene y se convierte con `firstValueFrom`.
- [x]
## Task 12: Migrar componentes de asistencia/conducta

### Objetivo

Reemplazar suscripciones HTTP en componentes de asistencia/conducta por queries y mutations.

### Archivos esperados

- `src/app/features/attendance-conduct/attendance-conduct.ts`
- `src/app/features/attendance-conduct/attendance-conduct.html`
- `src/app/features/attendance-conduct/components/attendance/attendance.ts`
- `src/app/features/attendance-conduct/components/attendance/attendance.html`
- `src/app/features/attendance-conduct/components/conduct/conduct.ts`
- `src/app/features/attendance-conduct/components/conduct/conduct.html`

### Tests requeridos

- No se crean tests.
- Verificación manual:
  - Carga cursos.
  - Carga alumnos por curso.
  - Registra asistencia.
  - Conducta carga alumnos correctamente.

### Criterio de finalización

- Los componentes usan `injectQuery` para lecturas.
- Registro de asistencia usa `injectMutation`.
- No quedan `.subscribe()` HTTP.
- `dialogRef.afterClosed().subscribe(...)` se mantiene porque no es HTTP.
- Loading/error provienen de TanStack Query.
- Mutations muestran errores con snackbar.
- [x]
## Task 13: Revisar consumidores de perfil y home

### Objetivo

Asegurar que componentes que consumen perfil o sesión sigan funcionando con el nuevo patrón de auth.

### Archivos esperados

- `src/app/shared/components/user-profile/user-profile.ts`
- `src/app/shared/components/user-profile/user-profile.html`
- `src/app/features/home/docente-home/docente-home.ts`
- Otros componentes que consuman `authService.profileQuery` si aparecen durante la migración.

### Tests requeridos

- No se crean tests.
- Verificación manual:
  - Perfil carga.
  - Home docente muestra datos correctos.
  - Logout funciona desde vistas con sesión.

### Criterio de finalización

- No hay referencias rotas a `authService.profileQuery` si se reemplazó por `profileOptions()`.
- Los componentes usan `injectQuery` donde corresponda.
- UI muestra loading/error de perfil correctamente.
- [x]
## Task 14: Limpieza técnica de llamadas HTTP restantes

### Objetivo

Detectar y corregir cualquier llamada HTTP o `.subscribe()` HTTP que haya quedado fuera de la migración.

### Archivos esperados

- Cualquier archivo bajo `src/app` detectado por búsqueda.

### Tests requeridos

- No se crean tests.
- Ejecutar búsquedas técnicas:
  - `rg -n "HttpClient|\\.get<|\\.post<|\\.put<|\\.delete<|\\.patch<|subscribe\\(" src/app`
  - Revisar manualmente que los `subscribe()` restantes no sean HTTP.

### Criterio de finalización

- No quedan llamadas HTTP directas en componentes.
- No quedan `.subscribe()` asociados a llamadas HTTP.
- Los `subscribe()` restantes son de UI o no HTTP.
- Los métodos HTTP en servicios están encapsulados en `queryFn` o `mutationFn`.
- [x]
## Task 15: Validación final

### Objetivo

Verificar compilación y cumplimiento de la spec después de la migración completa.

### Archivos esperados

- Sin archivos nuevos esperados.
- Ajustes menores solo si la validación detecta errores.

### Tests requeridos

- Ejecutar `npm run build`.
- No ejecutar ni crear tests automatizados.

### Criterio de finalización

- `npm run build` finaliza correctamente.
- `app.config.ts` usa `provideTanStackQuery`.
- Servicios exponen `queryOptions` y `mutationOptions`.
- Componentes usan `injectQuery` e `injectMutation`.
- No quedan HTTP directos en componentes.
- No quedan `.subscribe()` HTTP.
- Mutations invalidan queries relacionadas en `onSuccess`.
- Login, logout, validación de sesión y limpieza de cache quedan funcionales.
