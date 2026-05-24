# Design: Dashboard y vistas del alumno

## Contexto

El feature `estudiante` ya contiene pantallas funcionales para inicio,
calificaciones, asistencia y material de estudio, pero su UI actual no coincide
con la propuesta visual mejorada ubicada en `.agents/context/ui-mejorada/alumno`.

La implementacion debe adaptar esa propuesta al proyecto actual, usando Angular
Material y los patrones ya existentes en el repositorio. El alcance cubre todo
`src/app/features/estudiante/`.

## Archivos que probablemente se modificaran

### Home estudiante

- `src/app/features/estudiante/pages/estudiante-home.page.component/estudiante-home.page.component.ts`
- `src/app/features/estudiante/pages/estudiante-home.page.component/estudiante-home.page.component.html`
- `src/app/features/estudiante/pages/estudiante-home.page.component/estudiante-home.page.component.css`

### Calificaciones

- `src/app/features/estudiante/pages/grades.page.component/grades.page.component.ts`
- `src/app/features/estudiante/pages/grades.page.component/grades.page.component.html`
- `src/app/features/estudiante/pages/grades.page.component/grades.page.component.css`

### Asistencia

- `src/app/features/estudiante/pages/attendance.page.component/attendance.page.component.ts`
- `src/app/features/estudiante/pages/attendance.page.component/attendance.page.component.html`
- `src/app/features/estudiante/pages/attendance.page.component/attendance.page.component.css`

### Material

- `src/app/features/estudiante/pages/resources.page.component/resources.page.component.ts`
- `src/app/features/estudiante/pages/resources.page.component/resources.page.component.html`
- `src/app/features/estudiante/pages/resources.page.component/resources.page.component.css`

## Archivos que probablemente se agregaran

### Navbar alumno

- `src/app/features/estudiante/sections/navbar.component/navbar.component.ts`
- `src/app/features/estudiante/sections/navbar.component/navbar.component.html`
- `src/app/features/estudiante/sections/navbar.component/navbar.component.css`

El navbar debe tomar como referencia la estructura del navbar docente, pero con
menus del alumno.

## Arquitectura propuesta

### Estructura del feature

Mantener el feature con una forma similar a docente:

```text
src/app/features/estudiante/
  data-access/
  models/
  pages/
  sections/
  estudiante.routes.ts
```

La carpeta `sections` se usara para piezas compartidas dentro del feature,
empezando por el navbar.

### Navbar

Crear un navbar standalone de alumno, equivalente en intencion al de docente:

- Marca: `Portal Estudiantil`.
- Menu desktop.
- Menu mobile si el navbar docente ya lo soporta.
- Acceso a las rutas principales del alumno.

Rutas/menu:

| Label | Ruta |
| --- | --- |
| Inicio | `/estudiante` |
| Calificaciones | `/estudiante/notas` |
| Asistencia | `/estudiante/asistencia` |
| Material | `/estudiante/recursos` |
| Comunicaciones | `/comunicaciones` |

No incluir `Noticias`.

Las paginas del feature estudiante deben reemplazar el navbar generico actual
por este navbar especifico.

## Flujo de datos

### Perfil del estudiante

La home debe seguir tomando el nombre desde el perfil autenticado cuando este
disponible. Si el perfil no esta disponible:

- Mientras carga: mostrar estado de carga o texto breve de carga.
- Si falla: mostrar saludo generico y estado de error cuando corresponda.

### Calificaciones

Usar la fuente actual:

- `EstudianteQueries.notas(estudianteId)`
- `EstudianteApi.getNotas(estudianteId)`

La tabla debe seguir conectada a datos reales. Si la UI mejorada pide datos no
existentes, como ranking, tendencia o resumen avanzado, renderizar
`Sin informacion disponible`.

### Asistencia

Usar la fuente actual:

- `EstudianteQueries.asistencia(estudianteId)`
- `EstudianteApi.getAsistencias(estudianteId)`

Los totales y porcentajes deben calcularse desde la data actual. Si algun bloque
visual de la referencia no se puede calcular con seguridad, renderizar
`Sin informacion disponible`.

### Material

Mantener el mock actual de `resources.page.component`.

No crear API nueva para recursos en esta tarea.

## UI por pantalla

### Home

Referencia:

- `.agents/context/ui-mejorada/alumno/alumno-home.html`

Comportamiento:

- Mostrar saludo personalizado.
- Mostrar resumen escolar en cards.
- Mostrar accesos a las secciones reales del alumno.
- Eliminar cualquier acceso a Noticias.
- Mostrar valores reales cuando existan.
- Mostrar `Sin informacion disponible` en cards cuyo dato no exista.

Datos probablemente disponibles:

- Nombre del estudiante.

Datos probablemente faltantes:

- Promedio general consolidado.
- Resumen real de asistencia en home.
- Recursos disponibles desde backend.
- Notificaciones/avisos academicos.

### Calificaciones

Referencia:

- `.agents/context/ui-mejorada/alumno/calificaciones.html`

Comportamiento:

- Mantener boton de volver o navegacion coherente con navbar.
- Mostrar calificaciones por asignatura.
- Marcar notas bajo 4.0 con estado visual de alerta.
- Mantener estado vacio: `No hay notas`.
- Mantener estado de error con opcion de reintento.

Datos probablemente disponibles:

- Asignatura.
- Nota 1, nota 2, nota 3 o estructura actual equivalente.
- Promedio si viene desde backend o se puede calcular con seguridad.

Datos probablemente faltantes:

- Filtro real por semestre si el backend no lo entrega.
- Estadisticas avanzadas de desempeno.

### Asistencia

Referencia:

- `.agents/context/ui-mejorada/alumno/asistencia.html`

Comportamiento:

- Mostrar desglose de asistencia.
- Mostrar resumen general si puede calcularse.
- Usar estados semanticos:
  - Verde para asistencia saludable.
  - Amarillo para asistencia en riesgo.
  - Rojo para asistencia critica.
- Mantener estado vacio: `No hay asistencia`.
- Mantener estado de error con opcion de reintento.

Datos probablemente disponibles:

- Asignatura o clase.
- Clases asistidas.
- Ausencias.
- Total de clases.
- Porcentaje calculado.

Datos probablemente faltantes:

- Metas, tendencias o comparativas historicas si aparecen en la referencia.

### Material

Referencia:

- `.agents/context/ui-mejorada/alumno/material.html`

Comportamiento:

- Mantener datos mock actuales.
- Mostrar listado de recursos con icono por tipo.
- Mantener accion de descarga.
- Mantener estado vacio si no hay recursos mock.

Datos disponibles:

- Los definidos actualmente en el mock.

Datos faltantes:

- Recursos reales desde backend.

## Estados compartidos

Todas las pantallas deben conservar o integrar:

- Loading state.
- Error state.
- Empty state.

Orden esperado:

```text
loading -> error -> empty -> success
```

Para datos no disponibles por backend, no usar error. Usar texto:

```text
Sin informacion disponible
```

## Dependencias nuevas

No se esperan dependencias nuevas.

Usar Angular Material y componentes compartidos existentes.

## Riesgos

- Los HTML de referencia usan Tailwind, fuentes externas y Material Symbols; la
  implementacion debe adaptarse al sistema actual, no copiar esas dependencias.
- Algunas metricas de la home parecen no existir en backend. Deben mostrarse
  como `Sin informacion disponible`.
- El mock de recursos debe mantenerse claramente aislado para no parecer data
  real de backend.
- Cambiar el navbar puede afectar navegacion mobile si no se replica el patron
  del docente.
- La eliminacion de Noticias debe revisar tanto menu como cards/accesos rapidos.

## Estrategia de validacion

Validacion tecnica recomendada:

```bash
npm run build
```

Validacion manual recomendada:

- Entrar como estudiante.
- Confirmar navbar con Inicio, Calificaciones, Asistencia, Material y
  Comunicaciones.
- Confirmar que no aparece Noticias.
- Abrir Home, Calificaciones, Asistencia y Material.
- Confirmar estados de carga, error y vacio donde aplique.
- Confirmar que datos no disponibles muestran `Sin informacion disponible`.
- Confirmar que Material conserva recursos mock.
- Revisar responsive desktop/mobile.

## Orden de implementacion sugerido

1. Crear `sections/navbar.component` para estudiante.
2. Reemplazar el navbar generico en las vistas del feature estudiante.
3. Actualizar rutas/menu y eliminar Noticias.
4. Implementar UI mejorada de home.
5. Implementar UI mejorada de calificaciones conectada a datos actuales.
6. Implementar UI mejorada de asistencia conectada a datos actuales.
7. Implementar UI mejorada de material manteniendo mock.
8. Revisar estados de carga/error/vacio.
9. Revisar datos faltantes y textos `Sin informacion disponible`.
10. Ejecutar validacion tecnica y manual.
