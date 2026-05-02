# Design: Integrar TanStack Query en Angular

## Contexto

La aplicación ya tiene `@tanstack/angular-query-experimental` instalado y una integración parcial en auth, pero todavía conviven:

- `provideAngularQuery` en `app.config.ts`.
- Servicios que devuelven `Observable` desde `HttpClient`.
- Componentes que consumen HTTP con `.subscribe()`.
- Estados manuales de carga/error con `signal`.
- Un `forkJoin` HTTP en evaluaciones.
- Una llamada HTTP directa desde un componente.

El objetivo del diseño es migrar todas las peticiones HTTP actuales al patrón definido en la spec:

- `GET` con `queryOptions` + `injectQuery`.
- `POST`, `PUT`, `PATCH`, `DELETE` con `mutationOptions` + `injectMutation`.
- `HttpClient` se mantiene dentro de `queryFn`/`mutationFn`.
- `Observable` de `HttpClient` se convierte con `firstValueFrom`.
- Los componentes manejan carga/error/data desde TanStack Query.
- No quedan `.subscribe()` asociados a HTTP.

## Archivos que probablemente se modificarán

### Configuración

- `src/app/app.config.ts`
  - Reemplazar `provideAngularQuery` por `provideTanStackQuery`.
  - Configurar `QueryClient` con `staleTime`, `gcTime`, `retry` y `refetchOnWindowFocus` según spec.

### Auth

- `src/app/core/services/auth.service.ts`
  - Reemplazar queries definidas directamente en el servicio por métodos `queryOptions`.
  - Exponer `loginOptions()` como mutation.
  - Mantener `logout()` como operación local sin HTTP.
  - Mantener `token`, `currentUser` e `isAuthenticated`.
  - Centralizar guardado de sesión, limpieza de sesión y manejo de 401.
  - `forgot-password`, `register` y `reset-password` no se migran si quedan fuera de alcance o no existen actualmente.

- `src/app/core/models/auth.model.ts`
  - Ajustar tipos si las mutations necesitan payloads o responses más explícitas.

- `src/app/core/guards/auth.guard.ts`
  - Consumir la query de validación bajo el nuevo patrón.
  - Mantener redirección a `/login` cuando no hay token o la sesión no valida.

- `src/app/core/interceptors/auth.interceptor.ts`
  - Probablemente se mantiene.
  - Solo se ajustaría si se decide centralizar manejo de 401 ahí.

- `src/app/features/auth/login/login.ts`
  - Reemplazar `authService.login(...).subscribe()` por `injectMutation`.
  - Usar `isPending`, `error` y `mutateAsync`/`mutate`.
  - Mantener snackbar y redirección por rol.

- `src/app/features/auth/login/login.html`
  - Reflejar loading/error desde la mutation.
  - Deshabilitar submit mientras la mutation está pendiente.

### Servicios de dominio

- `src/app/core/services/admin.service.ts`
  - Convertir cada método HTTP en `queryOptions` o `mutationOptions`.
  - Definir query keys estables para usuarios, docentes, estudiantes, cursos, asignaturas, CAD y evaluaciones.
  - Definir invalidaciones reales en `onSuccess` de mutations.
  - Definir operaciones encadenadas como una sola mutation async cuando aplique.

- `src/app/core/services/docente.service.ts`
  - Convertir consultas de cursos, estudiantes, notas, anotaciones y evaluaciones a `queryOptions`.
  - Convertir guardados de notas, asistencias, anotaciones y evaluaciones a `mutationOptions`.
  - Definir invalidaciones relacionadas a notas, evaluaciones, asistencias y anotaciones.

- `src/app/features/attendance-conduct/services/attendance-conduct.service.ts`
  - Convertir consultas de cursos/alumnos a `queryOptions`.
  - Convertir registro de asistencia a `mutationOptions`.

### Componentes consumidores

- `src/app/features/admin-user-management/admin-user-management.ts`
  - Reemplazar cargas iniciales con `injectQuery`.
  - Reemplazar crear/editar/eliminar con `injectMutation`.
  - Cambiar operaciones encadenadas de usuario + docente/estudiante a una mutation async.
  - Reflejar pending/error en UI y snackbars.

- `src/app/features/evaluations/evaluations.ts`
  - Reemplazar `forkJoin` por queries independientes.
  - Reemplazar carga de cursos y creación de evaluación por query/mutation.
  - Calcular tabla a partir de `data()` de las queries.
  - Manejar errores parciales según spec.

- `src/app/features/student-grades/student-grades.ts`
  - Reemplazar carga de notas por `injectQuery`.

- `src/app/features/student-attendance/student-attendance.ts`
  - Mover la llamada HTTP directa a un servicio con `queryOptions`.
  - Consumir la query desde el componente.
  - Derivar totales y gráfico desde `data()`.

- `src/app/features/attendance-conduct/attendance-conduct.ts`
  - Reemplazar carga de cursos por `injectQuery`.

- `src/app/features/attendance-conduct/components/attendance/attendance.ts`
  - Reemplazar carga de alumnos por `injectQuery`.
  - Reemplazar registro de asistencia por `injectMutation`.
  - Mantener `dialogRef.afterClosed().subscribe(...)` porque no es HTTP.

- `src/app/features/attendance-conduct/components/conduct/conduct.ts`
  - Reemplazar carga de alumnos por `injectQuery`.

- `src/app/shared/components/user-profile/user-profile.ts`
  - Ajustar consumo de perfil si `AuthService.profileQuery` deja de ser propiedad directa y pasa a `profileOptions()`.

- `src/app/features/home/docente-home/docente-home.ts`
  - Ajustar consumo de perfil si depende de `authService.profileQuery`.

### Templates asociados

Se modificarán templates donde hoy existan loaders, errores, botones submit o datos derivados de llamadas HTTP:

- `src/app/features/admin-user-management/admin-user-management.html`
- `src/app/features/evaluations/evaluations.html`
- `src/app/features/student-grades/student-grades.html`
- `src/app/features/student-attendance/student-attendance.html`
- `src/app/features/attendance-conduct/attendance-conduct.html`
- `src/app/features/attendance-conduct/components/attendance/attendance.html`
- `src/app/features/attendance-conduct/components/conduct/conduct.html`
- `src/app/features/auth/login/login.html`
- `src/app/shared/components/user-profile/user-profile.html`
- `src/app/features/home/docente-home/docente-home.html`

## Arquitectura propuesta

### Patrón por servicio

Cada servicio mantiene la responsabilidad de endpoints, keys, options e invalidaciones.

Ejemplo conceptual:

```ts
getUsuariosOptions() {
  return queryOptions({
    queryKey: ['usuarios'],
    queryFn: () => firstValueFrom(this.http.get<Usuario[]>(`${this.apiUrl}/usuarios`)),
  });
}

crearUsuarioOptions() {
  return mutationOptions({
    mutationKey: ['crearUsuario'],
    mutationFn: (usuario: Usuario) =>
      firstValueFrom(this.http.post<Usuario>(`${this.apiUrl}/usuarios`, usuario)),
    onSuccess: () => {
      this.queryClient.invalidateQueries({ queryKey: ['usuarios'] });
    },
  });
}
```

### Patrón por componente

El componente crea la query o mutation:

```ts
usuariosQuery = injectQuery(() => this.adminService.getUsuariosOptions());
crearUsuarioMutation = injectMutation(() => this.adminService.crearUsuarioOptions());
```

El template consume señales del resultado:

- `usuariosQuery.data()`
- `usuariosQuery.isPending()`
- `usuariosQuery.isError()`
- `usuariosQuery.error()`
- `crearUsuarioMutation.isPending()`

### Query keys

Las keys deben ser estables, explícitas y parametrizadas cuando corresponda:

- `['usuarios']`
- `['docentes']`
- `['estudiantes']`
- `['cursos']`
- `['asignaturas']`
- `['cads']`
- `['evaluaciones', cadId]`
- `['estudiantes-curso', cursoId]`
- `['notas-curso-asignatura', cursoId, asignaturaId]`
- `['notas-estudiante', estudianteId]`
- `['asistencias-estudiante', estudianteId]`
- `['asistencia-conducta-cursos']`
- `['asistencia-conducta-alumnos', cursoId]`
- `['validateToken', token]`
- `['userProfile', token]`

La tabla de invalidaciones de la spec es orientativa. La implementación debe invalidar las keys reales creadas en este diseño.

## Flujo de datos

### Lecturas GET

```text
Componente
  -> injectQuery(() => service.someQueryOptions(params))
    -> queryFn
      -> firstValueFrom(HttpClient.get(...))
        -> Backend
    -> TanStack Query cachea resultado
  -> Template renderiza data/loading/error
```

Si faltan parámetros, la query debe quedar deshabilitada:

```ts
enabled: !!cursoId
```

### Escrituras POST/PUT/PATCH/DELETE

```text
Componente
  -> injectMutation(() => service.someMutationOptions())
    -> mutate/mutateAsync(payload)
      -> mutationFn
        -> firstValueFrom(HttpClient.post/put/delete(...))
      -> onSuccess
        -> invalidateQueries(keys relacionadas)
  -> Template/snackbar reflejan pending/error/success
```

### Auth

Login:

```text
LoginComponent
  -> loginMutation.mutateAsync(credentials)
    -> AuthService.loginOptions()
      -> POST /auth/login
      -> saveAuthData(token, user)
      -> invalidate validateToken/userProfile
  -> redirección por rol
```

Profile/validate:

```text
Componente/guard
  -> injectQuery(() => authService.profileOptions())
  -> injectQuery(() => authService.validateTokenOptions())
```

Logout:

```text
logout()
  -> limpiar localStorage/sessionStorage
  -> token.set(null)
  -> currentUser.set(null)
  -> queryClient.clear()
  -> navegar a /login donde corresponda
```

Error 401:

```text
queryFn/mutationFn o interceptor detecta 401
  -> limpiar sesión
  -> limpiar cache
  -> redirigir a /login
```

## Reemplazo de forkJoin

El `forkJoin` de evaluaciones debe desagruparse en queries independientes:

- `estudiantesPorCursoQuery`
- `evaluacionesPorCadQuery`
- `notasPorCursoAsignaturaQuery`

La tabla se calcula con `computed` a partir de `data()` de las tres queries.

Comportamiento esperado:

- Si todas cargan, se renderiza la tabla completa.
- Si una falla y las otras cargan, se muestran los datos disponibles y un mensaje de error para la sección afectada.
- Si la vista requiere todos los datos para funcionar, se muestra estado de error bloqueante para esa sección.
- La query de notas puede devolver `[]` como fallback solo si ese comportamiento ya existía y no oculta errores críticos.

## Cambios en base de datos

No aplica.

La migración es frontend y capa HTTP. No requiere modificar esquemas, tablas, índices ni migraciones.

## Dependencias nuevas

No se esperan dependencias nuevas.

La dependencia `@tanstack/angular-query-experimental` ya está instalada. Solo debe ajustarse la configuración para usar `provideTanStackQuery` y la configuración obligatoria del `QueryClient`.

## Riesgos

- La migración toca muchos componentes y puede producir cambios visibles de loading/error.
- Cambiar `forkJoin` por queries independientes cambia la semántica de error y carga.
- Las invalidaciones incompletas pueden dejar datos stale.
- Invalidaciones demasiado amplias pueden provocar refetch innecesario.
- `AuthService` hoy expone queries como propiedades; migrarlas a `queryOptions` puede requerir ajustar consumidores existentes.
- Si el manejo de 401 queda duplicado entre interceptor y query/mutation, puede haber navegaciones o snackbars duplicados.
- Las operaciones encadenadas pueden dejar datos parcialmente creados si falla la segunda petición.
- `@tanstack/angular-query-experimental` es experimental; conviene mantener el patrón simple y cercano a la documentación.
- Derivar gráficos/tablas desde `data()` puede requerir `computed` para evitar estado duplicado o desincronizado.

## Estrategia de testing

No se deben crear ni ejecutar tests automatizados según la spec.

Verificación obligatoria:

- Ejecutar `npm run build`.

Verificación manual recomendada:

- Login exitoso por rol:
  - admin
  - docente
  - estudiante
- Login fallido muestra snackbar/error amigable.
- Logout limpia sesión y cache.
- Perfil carga correctamente después de login y después de recargar.
- Guard redirige a `/login` sin token o con token inválido.
- Admin usuarios:
  - carga listas iniciales
  - crea/edita/elimina usuario
  - crea curso/asignatura/CAD/evaluación
  - invalidaciones refrescan datos
- Evaluaciones:
  - carga cursos
  - cambia curso
  - renderiza estudiantes/evaluaciones/notas
  - crea evaluación y refresca queries relacionadas
- Asistencia/conducta:
  - carga cursos/alumnos
  - registra asistencia
  - mantiene `dialogRef.afterClosed().subscribe(...)`
- Estudiante:
  - carga notas
  - carga asistencia
  - gráficos/totales se actualizan con data de query

Verificación técnica:

- Buscar que no queden llamadas HTTP directas en componentes.
- Buscar que no queden `.subscribe()` asociados a HTTP.
- Confirmar que los `.subscribe()` no HTTP se mantienen.
- Confirmar que servicios exponen `queryOptions`/`mutationOptions`.
- Confirmar que mutations invalidan queries relacionadas en `onSuccess`.
- Confirmar que `app.config.ts` usa `provideTanStackQuery`.

## Orden de implementación sugerido

1. Migrar configuración global a `provideTanStackQuery`.
2. Migrar `AuthService`, login, guard y consumidores de perfil.
3. Migrar servicios core (`admin.service.ts`, `docente.service.ts`).
4. Migrar servicios feature (`attendance-conduct.service.ts`).
5. Migrar componentes consumidores por feature.
6. Desagrupar `forkJoin` en evaluaciones.
7. Revisar llamadas HTTP directas y `.subscribe()` HTTP restantes.
8. Ejecutar `npm run build`.
