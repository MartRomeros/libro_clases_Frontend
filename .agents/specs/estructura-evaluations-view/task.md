# Tasks: Estructurar Vista de Evaluaciones del Docente

## Task 1: Levantar referencias actuales

### Objetivo
Confirmar las dependencias reales de la vista actual de evaluaciones antes de mover codigo.

### Archivos esperados
- `src/app/features/evaluations/evaluations.ts`
- `src/app/features/evaluations/evaluations.html`
- `src/app/features/evaluations/evaluations.css`
- `src/app/core/services/docente.service.ts`
- `src/app/features/docente/docente.routes.ts`

### Tests requeridos
- No aplica ejecucion de tests.
- Revisar con `rg` imports/referencias a `features/evaluations` y `DocenteService`.

### Criterio de finalizacion
- Queda claro que metodos, interfaces, imports Angular Material y rutas usa la vista actual.
- Queda claro si `src/app/features/evaluations/` tiene referencias activas fuera de la vista legacy.

## Task 2: Crear modelos de evaluaciones

### Objetivo
Mover los contratos usados por la vista de evaluaciones desde `DocenteService` hacia modelos del feature `docente`.

### Archivos esperados
- Crear `src/app/features/docente/models/evaluations.model.ts`.
- Consultar `src/app/core/services/docente.service.ts`.

### Tests requeridos
- No aplica test automatizado.
- Validar que los modelos cubren los datos usados por la vista: curso docente, estudiante, nota y evaluacion.

### Criterio de finalizacion
- Existen interfaces para `DocenteCurso`, `EstudianteCurso`, `NotaRespuesta` y `Evaluacion` o nombres equivalentes.
- Los tipos nuevos pueden reemplazar los imports actuales desde `DocenteService`.

## Task 3: Crear query keys de evaluaciones

### Objetivo
Centralizar todas las keys de TanStack Query usadas por evaluaciones.

### Archivos esperados
- Crear `src/app/features/docente/data-access/evaluations.keys.ts`.

### Tests requeridos
- No aplica test automatizado.
- Verificar que no se usen strings sueltos para keys en la futura pagina.

### Criterio de finalizacion
- Existen keys para cursos, cursos por docente, estudiantes por curso, evaluaciones por `cadId`, notas por curso/asignatura y crear evaluacion.
- Las keys son jerarquicas y usan `as const`.

## Task 4: Crear API HTTP de evaluaciones

### Objetivo
Extraer las llamadas HTTP usadas por evaluaciones a una clase dedicada.

### Archivos esperados
- Crear `src/app/features/docente/data-access/evaluations.api.ts`.
- Consultar `src/app/core/services/docente.service.ts`.
- Usar `src/environments/environment.ts`.

### Tests requeridos
- No aplica test automatizado.
- Revisar que los endpoints coincidan con los actuales:
  - `GET /docentes/{docenteId}/cursos`
  - `GET /estudiantes/curso/{cursoId}`
  - `GET /evaluaciones/cad/{cadId}`
  - `GET /notas/curso/{cursoId}/asignatura/{asignaturaId}`
  - `POST /evaluaciones`

### Criterio de finalizacion
- `EvaluationsApi` expone metodos HTTP puros.
- No contiene `queryOptions`, `mutationOptions`, `injectQuery` ni `injectMutation`.

## Task 5: Crear queries de evaluaciones

### Objetivo
Crear la capa que devuelve `queryOptions` para cursos, estudiantes, evaluaciones y notas.

### Archivos esperados
- Crear `src/app/features/docente/data-access/evaluations.queries.ts`.
- Usar `src/app/features/docente/data-access/evaluations.api.ts`.
- Usar `src/app/features/docente/data-access/evaluations.keys.ts`.

### Tests requeridos
- No aplica test automatizado.
- Verificar que las queries dependientes reciban un booleano `enabled` o calculen `enabled` desde ids validos.

### Criterio de finalizacion
- Existen query options para cursos por docente, estudiantes por curso, evaluaciones por `cadId` y notas por curso/asignatura.
- Las query keys vienen solo desde `evaluations.keys.ts`.
- No se ejecutan requests con ids `0`, `null`, `undefined` o vacios.

## Task 6: Crear mutations de evaluaciones

### Objetivo
Crear la capa que devuelve `mutationOptions` para crear evaluaciones e invalidar datos relacionados.

### Archivos esperados
- Crear `src/app/features/docente/data-access/evaluations.mutations.ts`.
- Usar `src/app/features/docente/data-access/evaluations.api.ts`.
- Usar `src/app/features/docente/data-access/evaluations.keys.ts`.

### Tests requeridos
- No aplica test automatizado.
- Revisar que la mutation invalide evaluaciones por `cadId` y notas por curso/asignatura.

### Criterio de finalizacion
- Existe mutation para crear evaluacion.
- La mutation recibe `Evaluacion` en `mutate(payload)`.
- La invalidacion usa keys centralizadas.
- La mutation no abre `MatSnackBar`; el feedback visual queda en el componente.

## Task 7: Crear pagina standalone de evaluaciones

### Objetivo
Crear la nueva pagina dentro de `features/docente/pages` migrando la funcionalidad actual de `features/evaluations`.

### Archivos esperados
- Crear `src/app/features/docente/pages/evaluations.page.component/evaluations.page.component.ts`.
- Crear `src/app/features/docente/pages/evaluations.page.component/evaluations.page.component.html`.
- Crear `src/app/features/docente/pages/evaluations.page.component/evaluations.page.component.css`.
- Consultar `src/app/features/evaluations/evaluations.ts`.
- Consultar `src/app/features/evaluations/evaluations.html`.
- Consultar `src/app/features/evaluations/evaluations.css`.
- Consultar `src/app/features/docente/pages/attendance.page.component/*`.

### Tests requeridos
- No aplica test automatizado.
- Validar manualmente que la pagina conserva selector, formulario, tabla, historial y estados principales.

### Criterio de finalizacion
- La pagina usa `Navbar`, boton volver y titulo consistente con `attendance.page.component`.
- La pagina usa `injectQuery` e `injectMutation` sobre `EvaluationsQueries` y `EvaluationsMutations`.
- La tabla conserva columnas dinamicas y calculo de promedio.
- La creacion de evaluacion muestra `MatSnackBar` de exito o error.
- La fecha se envia como `YYYY-MM-DD`.

## Task 8: Registrar ruta docente

### Objetivo
Hacer accesible la nueva pagina desde `/docente/evaluaciones`.

### Archivos esperados
- Modificar `src/app/features/docente/docente.routes.ts`.

### Tests requeridos
- No aplica test automatizado.
- Verificar que la ruta lazy-load apunte a `EvaluationsPageComponent`.

### Criterio de finalizacion
- Existe path `evaluaciones`.
- La ruta final esperada es `/docente/evaluaciones`.
- No se modifican carpetas `home/`.

## Task 9: Reducir dependencia de DocenteService

### Objetivo
Evitar que la nueva pagina dependa de `DocenteService` para los datos de evaluaciones.

### Archivos esperados
- Modificar `src/app/core/services/docente.service.ts` solo si queda claro que los metodos migrados ya no se usan.
- Revisar imports en `src/app/features/**`.

### Tests requeridos
- No aplica test automatizado.
- Ejecutar busquedas con `rg` para confirmar referencias a metodos migrados.

### Criterio de finalizacion
- La nueva pagina no importa `DocenteService`.
- Si otros flujos usan `DocenteService`, no se rompen ni se eliminan metodos necesarios.
- No se refactorizan endpoints fuera del alcance de evaluaciones.

## Task 10: Eliminar vista legacy si queda sin referencias

### Objetivo
Eliminar `src/app/features/evaluations/` solo si la migracion quedo completa y no existen referencias activas.

### Archivos esperados
- Posible eliminacion de:
  - `src/app/features/evaluations/evaluations.ts`
  - `src/app/features/evaluations/evaluations.html`
  - `src/app/features/evaluations/evaluations.css`

### Tests requeridos
- Ejecutar busquedas con `rg` antes de eliminar.
- No aplica test automatizado.

### Criterio de finalizacion
- No existen imports ni rutas activas hacia `src/app/features/evaluations/`.
- Si hay referencias activas, no se elimina la carpeta y se documenta la razon.

## Task 11: Validacion final

### Objetivo
Confirmar que la migracion compila y que no hay cambios fuera de alcance.

### Archivos esperados
- Revisar cambios en todos los archivos tocados.
- No editar carpetas `home/`.

### Tests requeridos
- Ejecutar `npm run build`.
- Si falla, registrar archivo y mensaje principal del error.

### Criterio de finalizacion
- `npm run build` termina correctamente.
- Si falla por deuda preexistente o causa externa, queda documentado.
- La implementacion cumple criterios de aceptacion de `spec.md`.
- Los cambios estan acotados a `docente`, `data-access`, modelos, ruta y posible eliminacion de `evaluations/`.
