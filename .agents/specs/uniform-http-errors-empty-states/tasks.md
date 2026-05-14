# Tasks: Manejo Uniforme de Errores HTTP y Estados Vacios

## Task 1: Levantar estados actuales

### Objetivo

Identificar donde se manejan errores, loading y vacios actualmente para evitar perder comportamiento existente.

### Archivos esperados

- Revisar `src/app/features/**`.
- Revisar `src/app/shared/**`.
- Revisar `src/app/layout/**`.

### Tests requeridos

- No aplica ejecucion de tests.
- Usar busquedas con `rg` para:
  - `isError`
  - `error()`
  - `console.error`
  - `MatSnackBar`
  - `empty-state`
  - `isPending`

### Criterio de finalizacion

- Queda claro que pantallas ya tienen estados y cuales no.
- Queda claro donde existen estilos locales reutilizables o duplicados.
- Queda claro que mutations muestran errores actualmente.

## Task 2: Crear contrato compartido de errores

### Objetivo

Definir el modelo comun de errores de aplicacion.

### Archivos esperados

- Crear `src/app/shared/http/app-error.model.ts`.

### Tests requeridos

- No se crean tests obligatorios.

### Criterio de finalizacion

- Existe `AppError`.
- Existe `AppErrorKind`.
- El modelo permite status, titulo, mensaje, detalle y raw error.

## Task 3: Crear normalizador de errores

### Objetivo

Implementar una funcion pura que convierta `unknown` a `AppError`.

### Archivos esperados

- Crear `src/app/shared/http/error-normalizer.ts`.

### Tests requeridos

- No se crean tests obligatorios.
- Validar manualmente los casos definidos en `spec.md`.

### Criterio de finalizacion

- Existe `toAppError(error: unknown): AppError`.
- Soporta `HttpErrorResponse`, `Error`, `string`, `{ message }`, `{ error }` y errores desconocidos.
- No lanza excepciones si recibe `null`, `undefined` u objetos inesperados.
- Mapea status `0`, `400`, `401`, `403`, `404`, `422` y `500+`.

## Task 4: Crear helper para snackbars de error

### Objetivo

Evitar que cada mutation repita logica de parseo y configuracion de snackbar.

### Archivos esperados

- Crear `src/app/shared/http/error-snackbar.ts`.

### Tests requeridos

- No se crean tests obligatorios.

### Criterio de finalizacion

- Existe helper similar a `showErrorSnack(snackBar, error, options?)`.
- Usa `toAppError`.
- Muestra `appError.message`.
- Permite sobrescribir `duration` y `panelClass` si hace falta.

## Task 5: Crear componente `empty-state`

### Objetivo

Crear un componente visual reusable para ausencia de datos.

### Archivos esperados

- Crear `src/app/shared/components/empty-state/empty-state.component.ts`.
- Crear `src/app/shared/components/empty-state/empty-state.component.html`.
- Crear `src/app/shared/components/empty-state/empty-state.component.css`.

### Tests requeridos

- No se crean tests.

### Criterio de finalizacion

- El componente es standalone.
- Recibe icono, titulo y mensaje.
- Soporta accion opcional mediante output.
- Usa Angular Material solo si ya esta disponible en el proyecto.

## Task 6: Crear componente `error-state`

### Objetivo

Crear un componente visual reusable para errores de queries o secciones.

### Archivos esperados

- Crear `src/app/shared/components/error-state/error-state.component.ts`.
- Crear `src/app/shared/components/error-state/error-state.component.html`.
- Crear `src/app/shared/components/error-state/error-state.component.css`.

### Tests requeridos

- No se crean tests.

### Criterio de finalizacion

- El componente es standalone.
- Recibe `unknown | AppError`.
- Usa `toAppError`.
- Permite titulo y mensaje custom.
- Soporta boton de reintento opcional mediante output.
- No abre snackbars.
- No navega.

## Task 7: Crear componente `loading-state`

### Objetivo

Crear un componente visual reusable para cargas iniciales o seccionales.

### Archivos esperados

- Crear `src/app/shared/components/loading-state/loading-state.component.ts`.
- Crear `src/app/shared/components/loading-state/loading-state.component.html`.
- Crear `src/app/shared/components/loading-state/loading-state.component.css`.

### Tests requeridos

- No se crean tests.

### Criterio de finalizacion

- El componente es standalone.
- Recibe mensaje.
- Muestra spinner o estado inline consistente.
- Puede usarse dentro de cards, tablas o paginas completas.

## Task 8: Migrar Auth y Shared

### Objetivo

Aplicar normalizacion de errores en login, perfil, navbar y user profile.

### Archivos esperados

- `src/app/features/auth/pages/login.page.component/login.page.component.ts`
- `src/app/features/auth/pages/login.page.component/login.page.component.html`
- `src/app/features/auth/data-access/auth.mutations.ts`
- `src/app/shared/components/user-profile/user-profile.ts`
- `src/app/shared/components/user-profile/user-profile.html`
- `src/app/layout/navbar/navbar.ts`
- `src/app/layout/navbar/navbar.html`

### Tests requeridos

- No se crean tests.
- Verificacion manual:
  - login fallido muestra mensaje legible
  - no aparece `[object Object]`
  - navbar no rompe si perfil falla

### Criterio de finalizacion

- Login usa error normalizado.
- Profile/navbar manejan ausencia o error de perfil de forma segura.
- No se muestran errores crudos en templates.

## Task 9: Migrar Admin

### Objetivo

Aplicar estados compartidos por seccion en la administracion.

### Archivos esperados

- `src/app/features/admin/pages/user-management.page.component/user-management.page.component.ts`
- `src/app/features/admin/pages/user-management.page.component/user-management.page.component.html`
- `src/app/features/admin/pages/user-management.page.component/user-management.page.component.css`

### Tests requeridos

- No se crean tests.
- Verificacion manual:
  - secciones cargan independientemente
  - error en usuarios no oculta cursos/asignaturas si ya cargaron
  - listas vacias muestran copy especifico
  - mutations fallidas muestran snackbar normalizado

### Criterio de finalizacion

- Usuarios, cursos, asignaturas, CAD, evaluaciones y estudiantes tienen loading/error/vacio.
- Las mutations usan helper de snackbar o `toAppError`.
- No quedan parseos manuales duplicados de error HTTP.

## Task 10: Migrar Docente

### Objetivo

Aplicar estados compartidos en home docente, asistencia, conducta y evaluaciones.

### Archivos esperados

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

### Tests requeridos

- No se crean tests.
- Verificacion manual:
  - sin cursos
  - sin alumnos
  - sin evaluaciones
  - sin curso/asignatura seleccionada
  - error parcial en evaluaciones/notas/alumnos
  - mutation fallida muestra snackbar normalizado

### Criterio de finalizacion

- Las pantallas docentes usan componentes compartidos para estados equivalentes.
- Los errores parciales no bloquean toda la pantalla cuando no corresponde.
- `console.error` no es el unico feedback visible de fallos.

## Task 11: Migrar Estudiante

### Objetivo

Aplicar estados compartidos en notas, asistencia, recursos y home estudiante.

### Archivos esperados

- `src/app/features/estudiante/pages/grades.page.component/grades.page.component.ts`
- `src/app/features/estudiante/pages/grades.page.component/grades.page.component.html`
- `src/app/features/estudiante/pages/attendance.page.component/attendance.page.component.ts`
- `src/app/features/estudiante/pages/attendance.page.component/attendance.page.component.html`
- `src/app/features/estudiante/pages/resources.page.component/resources.page.component.ts`
- `src/app/features/estudiante/pages/resources.page.component/resources.page.component.html`
- `src/app/features/estudiante/pages/estudiante-home.page.component/estudiante-home.page.component.ts`
- `src/app/features/estudiante/pages/estudiante-home.page.component/estudiante-home.page.component.html`

### Tests requeridos

- No se crean tests.
- Verificacion manual:
  - sin notas
  - sin asistencia
  - error de carga de notas/asistencia
  - ausencia segura de perfil

### Criterio de finalizacion

- Las pantallas de estudiante usan loading/error/vacio compartidos.
- No se duplican bloques locales de error si existe componente compartido equivalente.

## Task 12: Limpieza tecnica

### Objetivo

Eliminar duplicacion y confirmar que el patron quedo aplicado de forma uniforme.

### Archivos esperados

- Revisar todos los archivos modificados.

### Tests requeridos

- Usar `rg` para revisar:
  - `console.error`
  - `console.warn`
  - `[object Object]`
  - `HttpErrorResponse`
  - `empty-state`
  - `isError`

### Criterio de finalizacion

- No quedan errores crudos mostrados en UI.
- No quedan parseos duplicados de errores HTTP en componentes.
- Los `console.error` restantes son diagnosticos y no reemplazan feedback de UI.
- Los estilos locales de empty/error se reducen cuando fueron reemplazados por componentes compartidos.

## Task 13: Validacion final

### Objetivo

Confirmar que la aplicacion compila y documentar cualquier falla.

### Archivos esperados

- No aplica archivo nuevo.

### Tests requeridos

- Ejecutar:

```bash
npm run build
```

### Criterio de finalizacion

- `npm run build` termina correctamente.
- Si falla, se documenta:
  - comando ejecutado
  - archivo afectado
  - mensaje principal del error
  - si el error parece preexistente o causado por esta tarea
- La implementacion cumple los criterios de aceptacion de `spec.md`.
