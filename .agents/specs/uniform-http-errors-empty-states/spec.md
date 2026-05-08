# Spec: Manejo Uniforme de Errores HTTP y Estados Vacios

## Objetivo

Centralizar y normalizar el manejo de errores HTTP y estados vacios en todas las features para que la aplicacion muestre mensajes consistentes, reduzca logica duplicada en componentes y conserve un flujo claro entre queries, mutations, templates y feedback visual.

---

## Alcance

- Crear utilidades compartidas para normalizar errores desconocidos, `HttpErrorResponse` y errores de TanStack Query.
- Crear componentes reutilizables para estados de UI:
  - estado de carga
  - estado de error
  - estado vacio
- Aplicar estos estados en las features existentes:
  - `auth`
  - `admin`
  - `docente`
  - `estudiante`
  - `shared`
- Unificar mensajes de error en queries y mutations.
- Unificar estados vacios para listas, tablas, cards y secciones sin datos.
- Mantener TanStack Query como fuente de estado para:
  - `isPending`
  - `isLoading`
  - `isError`
  - `error`
  - `data`
  - `mutate`
  - `mutateAsync`
- Mantener `MatSnackBar` para feedback transaccional de mutations.
- Evitar que los servicios de `data-access` dependan de componentes visuales o `MatSnackBar`.
- Eliminar `console.error`/`console.warn` usados como feedback principal al usuario, salvo logs justificados para diagnostico tecnico.

---

## Fuera de alcance

- No cambiar contratos del backend.
- No cambiar endpoints.
- No reemplazar TanStack Query.
- No implementar el interceptor global 401/403 de esta tarea; eso queda cubierto por la tarea separada de `notes.md`.
- No agregar dependencias nuevas.
- No redisenar visualmente las pantallas fuera de los estados de carga/error/vacio.
- No crear tests automatizados nuevos, salvo que el implementador decida agregar tests unitarios para utilidades puras sin ampliar el alcance.

---

## Reglas de arquitectura

- Las utilidades de errores deben vivir en `src/app/shared/http/` o una carpeta compartida equivalente.
- Los componentes de estado deben vivir en `src/app/shared/components/`.
- Las features deben consumir utilidades compartidas; no deben duplicar parseo de errores HTTP.
- Las queries deben mostrar errores en la UI de la seccion afectada.
- Las mutations deben mostrar errores mediante `MatSnackBar`.
- Las mutations no deben ocultar el error original si el componente necesita tomar decisiones; deben exponerlo o normalizarlo de forma reutilizable.
- Los componentes de estado deben ser standalone.
- Los componentes de estado no deben conocer detalles de dominio como usuarios, cursos, notas o evaluaciones.
- Los mensajes por defecto deben estar en espanol.
- Los estados vacios deben distinguir entre:
  - no hay datos iniciales
  - no hay resultados por filtro/busqueda
  - falta seleccionar una entidad previa, por ejemplo curso/asignatura
- Si una pantalla tiene varias queries independientes y una falla, la UI debe mostrar los datos disponibles y un error solo en la seccion afectada, salvo que la pantalla no pueda funcionar sin esa query.

---

## Contrato de errores

Crear un modelo compartido similar a:

```ts
export type AppErrorKind =
  | 'network'
  | 'unauthorized'
  | 'forbidden'
  | 'not-found'
  | 'validation'
  | 'server'
  | 'unknown';

export interface AppError {
  kind: AppErrorKind;
  status?: number;
  title: string;
  message: string;
  detail?: string;
  raw?: unknown;
}
```

La funcion principal debe aceptar `unknown`:

```ts
toAppError(error: unknown): AppError
```

Formatos minimos a soportar:

- `HttpErrorResponse`
- `Error`
- `string`
- objeto con `{ message }`
- objeto con `{ error: string }`
- objeto con `{ error: { message } }`
- objeto desconocido
- error nulo o `undefined`

## Mensajes minimos esperados

| Caso | Mensaje esperado |
| --- | --- |
| Sin conexion o status `0` | `No se pudo conectar con el servidor.` |
| `400` | `La solicitud no es valida.` |
| `401` | `Tu sesion expiro. Vuelve a iniciar sesion.` |
| `403` | `No tienes permisos para realizar esta accion.` |
| `404` | `No se encontro la informacion solicitada.` |
| `422` | `Hay datos invalidos. Revisa el formulario.` |
| `500+` | `Ocurrio un error en el servidor. Intenta nuevamente.` |
| Desconocido | `Ocurrio un error inesperado.` |

Los mensajes especificos del backend pueden usarse cuando sean seguros y legibles para usuario final.

---

## Componentes compartidos

Crear componentes standalone reutilizables.

### `app-empty-state`

Debe aceptar:

- `icon`
- `title`
- `message`
- accion opcional:
  - texto
  - evento

Uso esperado:

```html
<app-empty-state
  icon="inbox"
  title="No hay evaluaciones"
  message="Crea una evaluacion para comenzar a registrar notas."
/>
```

### `app-error-state`

Debe aceptar:

- `error` como `unknown` o `AppError`
- `title` opcional
- `message` opcional
- accion de reintento opcional

Uso esperado:

```html
<app-error-state
  [error]="usuariosQuery.error()"
  retryLabel="Reintentar"
  (retry)="usuariosQuery.refetch()"
/>
```

### `app-loading-state`

Debe aceptar:

- `message`
- `mode`, si resulta util:
  - `spinner`
  - `inline`
  - `skeleton`

Uso esperado:

```html
<app-loading-state message="Cargando usuarios..." />
```

---

## Regla de queries

Cada query visible en UI debe tener una rama clara:

```html
@if (query.isPending()) {
  <app-loading-state message="Cargando..." />
} @else if (query.isError()) {
  <app-error-state [error]="query.error()" (retry)="query.refetch()" />
} @else if ((query.data() ?? []).length === 0) {
  <app-empty-state title="Sin datos" message="No hay registros disponibles." />
} @else {
  <!-- contenido -->
}
```

Si la query devuelve objeto y no arreglo, el componente debe definir un computed explicito para saber si esta vacio.

---

## Regla de mutations

Las mutations deben usar una utilidad compartida para transformar el error antes de mostrar snackbar.

Ejemplo esperado:

```ts
catch (error) {
  const appError = toAppError(error);
  this.snackBar.open(appError.message, 'Cerrar', { duration: 5000 });
}
```

O mediante helper:

```ts
showErrorSnack(this.snackBar, error);
```

Los formularios y botones deben deshabilitarse mientras la mutation correspondiente esta pendiente.

---

## Features a cubrir

### Auth

- Login debe mostrar error normalizado.
- El mensaje de error en el template no debe renderizar objetos crudos.
- Si falla perfil o sesion, debe mostrarse un estado claro cuando aplique.

### Admin

- `user-management.page.component` debe mostrar loading/error/vacio por seccion:
  - usuarios
  - cursos
  - asignaturas
  - CAD
  - evaluaciones
  - estudiantes
- Las mutations deben usar snackbar con mensajes normalizados.
- No debe quedar una sola seccion bloqueando toda la pagina si otra query independiente falla.

### Docente

- `docente.page.component` debe reemplazar logs y fallbacks silenciosos por estados de UI donde aplique.
- `attendance.page.component` y sus sections deben mostrar:
  - sin cursos
  - sin alumnos
  - error al cargar cursos/alumnos
- `evaluations.page.component` debe mostrar estados para:
  - sin cursos
  - sin curso/asignatura seleccionada
  - sin estudiantes
  - sin evaluaciones
  - error parcial en estudiantes/evaluaciones/notas
- `conduct.component` debe mostrar errores normalizados y vacios consistentes.

### Estudiante

- `grades.page.component` debe mostrar loading/error/vacio con componentes compartidos.
- `attendance.page.component` debe usar `app-error-state` en vez de markup local duplicado.
- `resources.page.component` y home deben cubrir ausencia de datos si consumen queries.

### Shared

- `navbar` y `user-profile` deben tratar errores de perfil de forma segura.
- No deben romper el layout si `profileQuery` falla o devuelve `undefined`.

---

## Criterios de aceptacion

- Existe una utilidad compartida para convertir `unknown` a `AppError`.
- La utilidad soporta `HttpErrorResponse`, `Error`, `string`, `{ message }`, `{ error }` y errores desconocidos.
- Existen componentes standalone compartidos para loading, error y empty state.
- Todas las features usan los componentes compartidos o helpers compartidos para estados equivalentes.
- Las queries visibles tienen ramas explicitas de loading, error, empty y success.
- Las mutations muestran errores normalizados mediante `MatSnackBar`.
- No se muestran objetos crudos de error en templates.
- No quedan parseos duplicados de errores HTTP en componentes.
- No quedan `console.error` como unico feedback de un fallo visible al usuario.
- Las pantallas con queries independientes soportan errores parciales sin ocultar datos ya cargados.
- Los botones de submit o acciones destructivas quedan deshabilitados mientras la mutation relacionada esta pendiente.
- El estado vacio usa copy especifico por contexto, no mensajes genericos iguales en toda la aplicacion.
- La app compila correctamente con:

```bash
npm run build
```

- Si `npm run build` falla, se documenta claramente el error principal y si parece preexistente o causado por esta tarea.
