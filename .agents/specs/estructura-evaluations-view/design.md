# Design: Estructurar Vista de Evaluaciones del Docente

## Archivos que probablemente se modificaran

### Archivos nuevos
- `src/app/features/docente/pages/evaluations.page.component/evaluations.page.component.ts`
- `src/app/features/docente/pages/evaluations.page.component/evaluations.page.component.html`
- `src/app/features/docente/pages/evaluations.page.component/evaluations.page.component.css`
- `src/app/features/docente/data-access/evaluations.api.ts`
- `src/app/features/docente/data-access/evaluations.keys.ts`
- `src/app/features/docente/data-access/evaluations.queries.ts`
- `src/app/features/docente/data-access/evaluations.mutations.ts`
- `src/app/features/docente/models/evaluations.model.ts`

### Archivos existentes a modificar
- `src/app/features/docente/docente.routes.ts`
- `src/app/core/services/docente.service.ts`

### Archivos candidatos a eliminar
- `src/app/features/evaluations/evaluations.ts`
- `src/app/features/evaluations/evaluations.html`
- `src/app/features/evaluations/evaluations.css`

La eliminacion de `src/app/features/evaluations/` debe hacerse solo despues de confirmar que no quedan imports, rutas o referencias activas hacia esa carpeta.

## Arquitectura propuesta

La nueva vista quedara dentro del feature `docente`, manteniendo la pagina como capa de composicion y moviendo acceso a datos a archivos especializados.

Estructura objetivo:

```text
src/app/features/docente/
├── data-access/
│   ├── evaluations.api.ts
│   ├── evaluations.keys.ts
│   ├── evaluations.queries.ts
│   └── evaluations.mutations.ts
├── models/
│   └── evaluations.model.ts
├── pages/
│   └── evaluations.page.component/
│       ├── evaluations.page.component.ts
│       ├── evaluations.page.component.html
│       └── evaluations.page.component.css
└── docente.routes.ts
```

Responsabilidades:

- `evaluations.api.ts`: llamadas HTTP puras con `HttpClient` y `firstValueFrom`.
- `evaluations.keys.ts`: definicion centralizada de query keys.
- `evaluations.queries.ts`: metodos que retornan `queryOptions`.
- `evaluations.mutations.ts`: metodos que retornan `mutationOptions` e invalidan queries relacionadas.
- `evaluations.model.ts`: interfaces actualmente declaradas en `DocenteService` y usadas por evaluaciones.
- `evaluations.page.component.ts`: estado local de UI, `injectQuery`, `injectMutation`, computed values, formulario y navegacion.
- `evaluations.page.component.html/css`: layout visual tomando `evaluations/` como base y agregando estructura tipo `attendance.page.component`.

No se reutilizara `src/app/features/docente/data-access/docente.api.ts` para evaluaciones porque actualmente contiene clases y keys de asistencia (`AttendanceApi`, `attendanceKeys`). Crear archivos `evaluations.*` evita mezclar dominios.

## Flujo de datos

1. La ruta `/docente/evaluaciones` carga lazy la nueva `EvaluationsPageComponent`.
2. El componente obtiene el perfil autenticado con el patron existente de auth.
3. Cuando existe `usuario_id`, se ejecuta la query de cursos del docente.
4. El usuario selecciona un curso/asignatura.
5. Desde el curso seleccionado se derivan:
   - `cursoId`
   - `cadId`
   - `asignaturaId`
6. Con esos ids se habilitan queries dependientes:
   - estudiantes por curso
   - evaluaciones por `cadId`
   - notas por curso/asignatura
7. El componente combina estudiantes, evaluaciones y notas en una matriz renderizable.
8. Al crear una evaluacion:
   - el formulario valida nombre y fecha
   - la fecha se normaliza a `YYYY-MM-DD`
   - se ejecuta la mutation de crear evaluacion
   - en exito se invalidan evaluaciones por `cadId` y notas por curso/asignatura
   - se muestra `MatSnackBar`
   - se cierra/restablece el formulario
9. En error se muestra `MatSnackBar` y se conserva el formulario para permitir reintento.

Query keys propuestas:

```text
evaluationsKeys.all
evaluationsKeys.cursos()
evaluationsKeys.cursosByDocente(docenteId)
evaluationsKeys.estudiantes()
evaluationsKeys.estudiantesByCurso(cursoId)
evaluationsKeys.evaluaciones()
evaluationsKeys.evaluacionesByCad(cadId)
evaluationsKeys.notas()
evaluationsKeys.notasByCursoAsignatura(cursoId, asignaturaId)
evaluationsKeys.crearEvaluacion()
```

Endpoints a migrar desde `DocenteService`:

```text
GET  /docentes/{docenteId}/cursos
GET  /estudiantes/curso/{cursoId}
GET  /evaluaciones/cad/{cadId}
GET  /notas/curso/{cursoId}/asignatura/{asignaturaId}
POST /evaluaciones
```

## Cambios en base de datos

No aplica.

La tarea es de frontend y no cambia contratos del backend ni requiere migraciones de base de datos.

## Dependencias nuevas

No se esperan dependencias nuevas.

La implementacion debe usar dependencias ya presentes:

- Angular standalone components
- Angular Material
- `@tanstack/angular-query-experimental`
- `HttpClient`
- Reactive Forms

## Riesgos

- La spec pide eliminar `features/evaluations/`; si existe una ruta o import activo no detectado, la eliminacion puede romper compilacion.
- El `DocenteService` puede seguir siendo usado por otras pantallas. La migracion debe retirar solo los metodos movidos si ya no quedan referencias, o dejarlos temporalmente si otros flujos dependen de ellos.
- Las query keys nuevas deben invalidar los mismos datos que antes. Si se invalidan keys incorrectas, crear evaluacion funcionara pero la UI no refrescara.
- Las queries dependientes deben usar `enabled`; sin eso pueden ejecutarse requests con `0`, `null` o ids invalidos.
- La fecha puede venir como `Date` desde `mat-datepicker` o como string si el formulario queda inicializado con ISO. La normalizacion debe cubrir ambos casos.
- La matriz de notas actual depende de ids dinamicos (`ev1Id`, `ev2Id`, `ev3Id`). Hay que conservar esa logica para no perder calificaciones existentes.
- Si el build falla por deuda previa, debe distinguirse de errores introducidos por esta migracion.

## Estrategia de testing

No se agregaran tests automatizados porque la spec los deja fuera de alcance. La validacion sera manual y por compilacion.

Checklist manual:

- Navegar a `/docente/evaluaciones`.
- Ver navbar, boton volver y titulo de pagina docente.
- Confirmar que cargan cursos/asignaturas del docente.
- Seleccionar curso/asignatura.
- Confirmar que cargan estudiantes, evaluaciones y notas.
- Confirmar que la tabla muestra columnas dinamicas por evaluacion.
- Confirmar que el promedio por estudiante se calcula igual que en la vista anterior.
- Abrir formulario de nueva evaluacion.
- Validar que nombre y fecha sean requeridos.
- Crear una evaluacion con fecha valida.
- Confirmar `MatSnackBar` de exito.
- Confirmar que evaluaciones/notas se refrescan despues de crear.
- Probar estado sin curso seleccionado.
- Probar estado sin evaluaciones.
- Probar respuesta vacia de estudiantes si el backend lo permite.

Validacion tecnica final:

```bash
npm run build
```

Si falla, documentar:

- comando ejecutado
- archivo afectado
- mensaje principal del error
- si el error parece preexistente o causado por la migracion
