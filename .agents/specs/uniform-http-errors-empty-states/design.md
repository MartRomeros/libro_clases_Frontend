# Design: Manejo Uniforme de Errores HTTP y Estados Vacios

## Contexto

La aplicacion ya usa TanStack Query como fuente principal para estado remoto, pero el manejo de errores y vacios esta distribuido entre templates, `MatSnackBar`, `console.error` y markup local repetido. Esto genera inconsistencias:

- Algunos templates renderizan errores directamente.
- Algunas mutations muestran snackbars desde servicios de data-access.
- Varias pantallas tienen estados vacios con estilos locales.
- Algunas queries no muestran error visible.
- Algunas secciones dependen de datos opcionales sin comunicar que falta seleccionar un curso/asignatura.

El objetivo del diseno es introducir una capa compartida minima que no cambie contratos ni endpoints, pero haga consistente la experiencia de usuario.

## Archivos que probablemente se agregaran

### Utilidades compartidas

- `src/app/shared/http/app-error.model.ts`
- `src/app/shared/http/error-normalizer.ts`
- `src/app/shared/http/error-snackbar.ts`

### Componentes compartidos

- `src/app/shared/components/empty-state/empty-state.component.ts`
- `src/app/shared/components/empty-state/empty-state.component.html`
- `src/app/shared/components/empty-state/empty-state.component.css`
- `src/app/shared/components/error-state/error-state.component.ts`
- `src/app/shared/components/error-state/error-state.component.html`
- `src/app/shared/components/error-state/error-state.component.css`
- `src/app/shared/components/loading-state/loading-state.component.ts`
- `src/app/shared/components/loading-state/loading-state.component.html`
- `src/app/shared/components/loading-state/loading-state.component.css`

## Archivos que probablemente se modificaran

### Auth

- `src/app/features/auth/pages/login.page.component/login.page.component.ts`
- `src/app/features/auth/pages/login.page.component/login.page.component.html`
- `src/app/features/auth/data-access/auth.mutations.ts`
- `src/app/shared/components/user-profile/user-profile.ts`
- `src/app/shared/components/user-profile/user-profile.html`
- `src/app/layout/navbar/navbar.ts`
- `src/app/layout/navbar/navbar.html`

### Admin

- `src/app/features/admin/pages/user-management.page.component/user-management.page.component.ts`
- `src/app/features/admin/pages/user-management.page.component/user-management.page.component.html`
- `src/app/features/admin/pages/user-management.page.component/user-management.page.component.css`

### Docente

- `src/app/features/docente/pages/docente.page.component/docente.page.component.ts`
- `src/app/features/docente/pages/docente.page.component/docente.page.component.html`
- `src/app/features/docente/pages/attendance.page.component/attendance.page.component.ts`
- `src/app/features/docente/pages/attendance.page.component/attendance.page.component.html`
- `src/app/features/docente/pages/evaluations.page.component/evaluations.page.component.ts`
- `src/app/features/docente/pages/evaluations.page.component/evaluations.page.component.html`
- `src/app/features/docente/sections/attendance.component/attendance.component.ts`
- `src/app/features/docente/sections/attendance.component/attendance.component.html`
- `src/app/features/docente/sections/conduct.component/conduct.component.ts`
- `src/app/features/docente/sections/conduct.component/conduct.component.html`
- `src/app/features/docente/data-access/docente.mutations.ts`
- `src/app/features/docente/data-access/evaluations.mutations.ts`

### Estudiante

- `src/app/features/estudiante/pages/grades.page.component/grades.page.component.ts`
- `src/app/features/estudiante/pages/grades.page.component/grades.page.component.html`
- `src/app/features/estudiante/pages/attendance.page.component/attendance.page.component.ts`
- `src/app/features/estudiante/pages/attendance.page.component/attendance.page.component.html`
- `src/app/features/estudiante/pages/resources.page.component/resources.page.component.ts`
- `src/app/features/estudiante/pages/resources.page.component/resources.page.component.html`
- `src/app/features/estudiante/pages/estudiante-home.page.component/estudiante-home.page.component.ts`
- `src/app/features/estudiante/pages/estudiante-home.page.component/estudiante-home.page.component.html`

## Arquitectura propuesta

```text
Query/Mutation error unknown
  -> toAppError(error)
    -> AppError { kind, status, title, message, detail, raw }
      -> app-error-state para queries
      -> showErrorSnack para mutations
```

Los servicios de API y queries se mantienen enfocados en datos. La normalizacion de errores vive en `shared/http` y puede usarse desde cualquier componente, mutation o helper.

## Modelo de error

`AppError` debe separar un titulo corto de un mensaje accionable.

```ts
export interface AppError {
  kind: AppErrorKind;
  status?: number;
  title: string;
  message: string;
  detail?: string;
  raw?: unknown;
}
```

`raw` se conserva para diagnostico, pero no debe mostrarse directamente en UI.

## Normalizacion

Orden sugerido de evaluacion en `toAppError`:

1. Si ya es `AppError`, retornarlo.
2. Si es `HttpErrorResponse`, mapear por `status`.
3. Extraer mensaje del backend si existe y es string legible:
   - `error.message`
   - `error.error.message`
   - `error.error`
4. Si es `Error`, usar `error.message` como detalle y mensaje solo si es user-friendly.
5. Si es `string`, usarlo como mensaje.
6. Fallback a error desconocido.

La funcion no debe lanzar excepciones.

## Componentes de UI

### Empty state

Responsabilidad:

- Mostrar icono, titulo, descripcion y accion opcional.
- No inferir dominio.
- Permitir estilos consistentes pero flexibles.

### Error state

Responsabilidad:

- Recibir `unknown | AppError`.
- Normalizar internamente si recibe `unknown`.
- Mostrar titulo y mensaje.
- Emitir `retry` si existe accion de reintento.

No debe navegar, limpiar sesion ni abrir snackbars.

### Loading state

Responsabilidad:

- Mostrar spinner o bloque inline simple.
- Evitar duplicacion de spinners locales.
- Permitir mensaje contextual.

## Patron por query

Cada template debe tratar la query localmente:

```html
@if (usuariosQuery.isPending()) {
  <app-loading-state message="Cargando usuarios..." />
} @else if (usuariosQuery.isError()) {
  <app-error-state
    [error]="usuariosQuery.error()"
    retryLabel="Reintentar"
    (retry)="usuariosQuery.refetch()"
  />
} @else if (usuarios().length === 0) {
  <app-empty-state
    icon="group_off"
    title="No hay usuarios"
    message="Crea el primer usuario para comenzar."
  />
} @else {
  <!-- contenido -->
}
```

Para pantallas con varias secciones, cada seccion debe tener su propio bloque. Evitar un unico `isLoading` global salvo que la pantalla dependa realmente de todas las queries.

## Patron por mutation

Las mutations pueden mantener `onSuccess` e invalidaciones en data-access, pero el feedback de error debe ser consistente:

```ts
try {
  await this.crearUsuarioMutation.mutateAsync(payload);
} catch (error) {
  showErrorSnack(this.snackBar, error);
}
```

Si existen mutations que actualmente inyectan `MatSnackBar` dentro de data-access, deben migrarse gradualmente para evitar acoplar capa de datos con UI. Si moverlo genera demasiados cambios, se permite usar el helper compartido en la mutation como paso intermedio, documentando la deuda.

## Estados vacios por dominio

Mensajes recomendados:

| Contexto | Titulo | Mensaje |
| --- | --- | --- |
| Usuarios admin | `No hay usuarios` | `Crea usuarios para administrar el acceso al sistema.` |
| Cursos admin | `No hay cursos` | `Crea un curso para asignar estudiantes y docentes.` |
| Asignaturas admin | `No hay asignaturas` | `Crea asignaturas para vincularlas a cursos.` |
| CAD admin | `No hay vinculaciones` | `Vincula curso, asignatura y docente para habilitar evaluaciones.` |
| Evaluaciones docente | `No hay evaluaciones` | `Crea una evaluacion para comenzar a registrar notas.` |
| Alumnos docente | `No hay alumnos` | `Este curso aun no tiene alumnos asignados.` |
| Sin seleccion docente | `Selecciona un curso` | `Elige un curso o asignatura para ver la informacion.` |
| Notas estudiante | `No hay notas` | `Aun no tienes calificaciones registradas.` |
| Asistencia estudiante | `No hay asistencia` | `Aun no existen registros de asistencia.` |

## Riesgos

- Cambiar todos los templates puede introducir errores de imports en componentes standalone.
- Algunas pantallas usan `*ngIf` y otras control flow `@if`; la implementacion debe respetar el estilo actual de cada archivo salvo que convenga una migracion acotada.
- Si se elimina `MatSnackBar` desde data-access sin mover feedback al componente, se puede perder feedback de mutations.
- Algunos errores 401/403 se solapan con la tarea de interceptores globales. En esta tarea solo se normalizan mensajes; la navegacion global queda fuera.
- Un empty state mal colocado puede ocultar un loading o error. El orden debe ser loading -> error -> empty -> success.

## Estrategia de validacion

Validacion tecnica:

```bash
npm run build
```

Validacion manual:

- Forzar error de API en una query y confirmar `app-error-state`.
- Forzar error de API en una mutation y confirmar snackbar normalizado.
- Revisar listas vacias en admin, docente y estudiante.
- Confirmar que una seccion con error no borra datos de otra seccion independiente.
- Confirmar que no se renderizan objetos `[object Object]` en UI.
- Confirmar que los botones de submit quedan deshabilitados durante mutations.
