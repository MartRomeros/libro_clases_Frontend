# Spec: Estructurar Vista de Evaluaciones del Docente

## Objetivo
Migrar y estructurar la vista actual de evaluaciones para que viva dentro del feature `docente`, con una separacion clara entre pagina, data-access, modelos y rutas. La implementacion debe conservar la funcionalidad existente y dejar el codigo preparado para escalar.

## Alcance
- Crear una nueva pagina standalone en `src/app/features/docente/pages/evaluations.page.component/`.
- La pagina debe tener estos archivos:
  - `evaluations.page.component.ts`
  - `evaluations.page.component.html`
  - `evaluations.page.component.css`
- Migrar a esta nueva pagina la funcionalidad actualmente ubicada en `src/app/features/evaluations/`.
- Reutilizar el HTML y CSS actuales de `src/app/features/evaluations/` como base visual de la nueva pagina.
- Agregar la ruta `evaluaciones` en `src/app/features/docente/docente.routes.ts`.
- La ruta final debe ser `/docente/evaluaciones`.
- Organizar en `src/app/features/docente/data-access/` las llamadas HTTP, query keys, queries y mutations necesarias para evaluaciones.
- Migrar desde `DocenteService` los endpoints usados por la vista de evaluaciones.
- Si `DocenteService` tiene endpoints no usados por evaluaciones, no migrarlos en esta tarea.
- Una vez terminada la migracion y validado el build, eliminar `src/app/features/evaluations/` si ya no queda referenciado.
- Mantener la funcionalidad actual de evaluaciones:
  - cargar cursos/asignaturas del docente
  - seleccionar curso/asignatura
  - cargar estudiantes del curso
  - cargar evaluaciones por `cadId`
  - cargar notas por curso/asignatura
  - mostrar matriz de calificaciones
  - calcular promedio por estudiante
  - crear nueva evaluacion
  - refrescar evaluaciones/notas despues de crear una evaluacion
  - mostrar feedback visual con `MatSnackBar`

## Fuera de alcance
- No editar carpetas `home/`.
- No cambiar contratos del backend.
- No implementar tests automatizados nuevos.
- No refactorizar funcionalidades de docente que no participen en la vista de evaluaciones.

## Reglas de negocio
- La nueva implementacion debe estar ubicada dentro de `src/app/features/docente/pages`.
- La pagina debe usar el patron de pagina docente de `attendance.page.component` para navbar, boton volver, titulo y contenedor general.
- El contenido funcional de evaluaciones debe conservar el diseno actual de `src/app/features/evaluations/`.
- Si hay conflicto entre ambas referencias visuales, priorizar el contenido y estilos actuales de `evaluations/`, envueltos en la estructura general de pagina usada por `attendance.page.component`.
- La separacion de data-access debe seguir este formato:
  - llamadas HTTP -> `src/app/features/docente/data-access/evaluations.api.ts`
  - query keys -> `src/app/features/docente/data-access/evaluations.keys.ts`
  - queries -> `src/app/features/docente/data-access/evaluations.queries.ts`
  - mutations -> `src/app/features/docente/data-access/evaluations.mutations.ts`
- Los tipos/modelos necesarios deben ubicarse en `src/app/features/docente/models/` si no existe ya un modelo equivalente.
- Las queries deben usar `queryOptions`.
- Las mutations deben usar `mutationOptions`.
- Los componentes deben ejecutar las opciones mediante `injectQuery` e `injectMutation`.
- Las query keys no deben escribirse como strings sueltos dentro de componentes; deben centralizarse en `evaluations.keys.ts`.
- Las queries dependientes de perfil, curso, `cadId` o asignatura deben usar `enabled` para evitar llamadas con ids invalidos.
- Las fechas deben manejarse como `Date` en UI y enviarse al backend como string ISO `YYYY-MM-DD`.

## Criterios de aceptacion
- Existe `src/app/features/docente/pages/evaluations.page.component/evaluations.page.component.ts`.
- Existe `src/app/features/docente/pages/evaluations.page.component/evaluations.page.component.html`.
- Existe `src/app/features/docente/pages/evaluations.page.component/evaluations.page.component.css`.
- Existe la ruta `/docente/evaluaciones` configurada en `docente.routes.ts`.
- La pagina carga con navbar, boton volver y titulo consistente con `attendance.page.component`.
- La vista conserva el contenido visual y funcional de `src/app/features/evaluations/`.
- La pagina permite seleccionar curso/asignatura.
- Al seleccionar curso/asignatura se cargan estudiantes, evaluaciones y notas.
- La matriz de calificaciones muestra estudiantes, columnas dinamicas por evaluacion y promedio.
- La pagina permite crear una nueva evaluacion.
- Al crear una evaluacion, se muestra `MatSnackBar` de exito o error segun corresponda.
- Al crear una evaluacion correctamente, se invalidan/refrescan evaluaciones y notas relacionadas.
- La pagina contempla estados de carga, vacio y error para los datos principales.
- No se editan carpetas `home/`.
- Si `src/app/features/evaluations/` queda sin referencias despues de la migracion, se elimina.
- Se ejecuta `npm run build` al final.
- Si `npm run build` falla, se documenta claramente el error y el archivo afectado.
