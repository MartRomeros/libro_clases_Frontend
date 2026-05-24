# Tasks: Dashboard y vistas del alumno

- [x]
## Task 1: Levantar estado actual del feature estudiante

### Objetivo

Identificar la estructura, datos disponibles y dependencias actuales antes de modificar las pantallas.

### Archivos esperados

- Revisar `src/app/features/estudiante/**`.
- Revisar `src/app/features/docente/sections/navbar.component/**`.
- Revisar `.agents/context/ui-mejorada/alumno/*.html`.

### Tests requeridos

- No se crean tests.
- Usar busquedas con `rg` para:
  - `app-navbar`
  - `Noticias`
  - `noticias`
  - `resumenRapido`
  - `cargarRecursosMock`
  - `EstudianteQueries`

### Criterio de finalizacion

- Queda claro que componentes usan el navbar generico actual.
- Queda claro donde aparece Noticias para eliminarlo.
- Queda claro que datos reales existen para notas y asistencia.
- Queda claro que recursos se mantiene como mock.

- [x]
## Task 2: Crear navbar propio del alumno

### Objetivo

Crear un navbar dentro del feature estudiante, equivalente al navbar docente pero con menus del alumno.

### Archivos esperados

- Crear `src/app/features/estudiante/sections/navbar.component/navbar.component.ts`.
- Crear `src/app/features/estudiante/sections/navbar.component/navbar.component.html`.
- Crear `src/app/features/estudiante/sections/navbar.component/navbar.component.css`.

### Tests requeridos

- No se crean tests automatizados.
- Verificacion manual posterior en desktop y mobile.

### Criterio de finalizacion

- El navbar es standalone.
- Usa Angular Material igual que el navbar docente cuando corresponda.
- Incluye menus:
  - Inicio -> `/estudiante`
  - Calificaciones -> `/estudiante/notas`
  - Asistencia -> `/estudiante/asistencia`
  - Material -> `/estudiante/recursos`
  - Comunicaciones -> `/comunicaciones`
- No incluye Noticias.
- Mantiene comportamiento responsive similar al navbar docente.

- [x]
## Task 3: Reemplazar navbar generico en vistas de estudiante

### Objetivo

Usar el navbar propio del alumno en todas las pantallas del feature estudiante.

### Archivos esperados

- `src/app/features/estudiante/pages/estudiante-home.page.component/estudiante-home.page.component.ts`
- `src/app/features/estudiante/pages/estudiante-home.page.component/estudiante-home.page.component.html`
- `src/app/features/estudiante/pages/grades.page.component/grades.page.component.ts`
- `src/app/features/estudiante/pages/grades.page.component/grades.page.component.html`
- `src/app/features/estudiante/pages/attendance.page.component/attendance.page.component.ts`
- `src/app/features/estudiante/pages/attendance.page.component/attendance.page.component.html`
- `src/app/features/estudiante/pages/resources.page.component/resources.page.component.ts`
- `src/app/features/estudiante/pages/resources.page.component/resources.page.component.html`

### Tests requeridos

- No se crean tests.

### Criterio de finalizacion

- Ninguna vista del feature estudiante usa `app-navbar` generico.
- Todas las vistas importan y renderizan el navbar del alumno.
- La navegacion entre Inicio, Calificaciones, Asistencia, Material y Comunicaciones funciona.

- [x]
## Task 4: Implementar UI mejorada de home del alumno

### Objetivo

Actualizar la home del alumno usando como referencia `alumno-home.html`, conectando datos reales disponibles y mostrando `Sin informacion disponible` para datos faltantes.

### Archivos esperados

- `src/app/features/estudiante/pages/estudiante-home.page.component/estudiante-home.page.component.ts`
- `src/app/features/estudiante/pages/estudiante-home.page.component/estudiante-home.page.component.html`
- `src/app/features/estudiante/pages/estudiante-home.page.component/estudiante-home.page.component.css`

### Tests requeridos

- No se crean tests.
- Verificacion manual:
  - saludo con nombre del estudiante
  - estado de carga de perfil
  - ausencia segura de perfil
  - accesos principales funcionando

### Criterio de finalizacion

- La home sigue mostrando saludo personalizado cuando hay perfil.
- El resumen escolar muestra datos reales solo cuando existen.
- Los datos no disponibles muestran `Sin informacion disponible`.
- Los accesos rapidos incluyen Calificaciones, Asistencia, Material y Comunicaciones.
- No queda ningun acceso a Noticias.
- La UI respeta el estilo de la referencia sin copiar dependencias externas.

- [x]
## Task 5: Implementar UI mejorada de calificaciones

### Objetivo

Actualizar la vista de calificaciones usando como referencia `calificaciones.html`, manteniendo conexion con la data real actual.

### Archivos esperados

- `src/app/features/estudiante/pages/grades.page.component/grades.page.component.ts`
- `src/app/features/estudiante/pages/grades.page.component/grades.page.component.html`
- `src/app/features/estudiante/pages/grades.page.component/grades.page.component.css`

### Tests requeridos

- No se crean tests.
- Verificacion manual:
  - carga notas del estudiante autenticado
  - muestra loading
  - muestra error con reintento
  - muestra empty state si no hay notas
  - marca notas bajo 4.0

### Criterio de finalizacion

- La pantalla usa la query actual de notas del estudiante.
- La tabla o layout principal muestra asignatura, notas disponibles y promedio cuando exista.
- Los indicadores visuales de notas bajas se mantienen o mejoran.
- Si la referencia pide datos no disponibles, se muestra `Sin informacion disponible`.
- No se agregan endpoints nuevos.

- [x]
## Task 6: Implementar UI mejorada de asistencia

### Objetivo

Actualizar la vista de asistencia usando como referencia `asistencia.html`, manteniendo conexion con la data real actual.

### Archivos esperados

- `src/app/features/estudiante/pages/attendance.page.component/attendance.page.component.ts`
- `src/app/features/estudiante/pages/attendance.page.component/attendance.page.component.html`
- `src/app/features/estudiante/pages/attendance.page.component/attendance.page.component.css`

### Tests requeridos

- No se crean tests.
- Verificacion manual:
  - carga asistencia del estudiante autenticado
  - muestra loading
  - muestra error con reintento
  - muestra empty state si no hay registros
  - calcula totales y porcentaje general cuando sea posible

### Criterio de finalizacion

- La pantalla usa la query actual de asistencia del estudiante.
- El desglose de asistencia se muestra con la data disponible.
- El resumen general se calcula solo si hay datos suficientes.
- Los porcentajes usan estados semanticos:
  - verde saludable
  - amarillo en riesgo
  - rojo critico
- Si algun indicador no puede calcularse, muestra `Sin informacion disponible`.

- [x]
## Task 7: Implementar UI mejorada de material de estudio

### Objetivo

Actualizar la vista de material usando como referencia `material.html`, conservando el mock actual de recursos.

### Archivos esperados

- `src/app/features/estudiante/pages/resources.page.component/resources.page.component.ts`
- `src/app/features/estudiante/pages/resources.page.component/resources.page.component.html`
- `src/app/features/estudiante/pages/resources.page.component/resources.page.component.css`

### Tests requeridos

- No se crean tests.
- Verificacion manual:
  - lista recursos mock
  - muestra tipo, asignatura, titulo, fecha, tamano y accion
  - muestra empty state si el mock queda vacio
  - accion de descarga conserva comportamiento actual

### Criterio de finalizacion

- La pantalla mantiene el mock existente.
- No se crea API nueva de recursos.
- La UI muestra icono por tipo de archivo.
- La accion de descarga queda visible y funcional segun el comportamiento actual.
- El mock no se presenta como dato proveniente del backend.

- [x]
## Task 8: Eliminar Noticias del feature estudiante

### Objetivo

Retirar Noticias del menu, accesos rapidos y cualquier navegacion visible del alumno.

### Archivos esperados

- `src/app/features/estudiante/pages/estudiante-home.page.component/estudiante-home.page.component.ts`
- `src/app/features/estudiante/pages/estudiante-home.page.component/estudiante-home.page.component.html`
- `src/app/features/estudiante/sections/navbar.component/navbar.component.html`
- `src/app/features/estudiante/sections/navbar.component/navbar.component.ts`
- Revisar `src/app/features/estudiante/estudiante.routes.ts`.

### Tests requeridos

- No se crean tests.
- Usar busqueda:

```bash
rg -n "Noticias|noticias" src/app/features/estudiante
```

### Criterio de finalizacion

- No aparece Noticias en UI de estudiante.
- No hay card o menu visible que navegue a `/estudiante/noticias`.
- Si existe una ruta obsoleta de noticias, queda removida o inaccesible desde UI segun menor impacto.

- [x]
## Task 9: Revisar estados de carga, error, vacio y datos faltantes

### Objetivo

Unificar el comportamiento de estados en las vistas del alumno y asegurar que datos no disponibles no se muestren como errores.

### Archivos esperados

- Todas las paginas bajo `src/app/features/estudiante/pages/**`.

### Tests requeridos

- No se crean tests.
- Verificacion manual:
  - loading -> error -> empty -> success
  - datos faltantes muestran `Sin informacion disponible`
  - errores reales usan `app-error-state`
  - vacios reales usan `app-empty-state`

### Criterio de finalizacion

- Cada vista tiene loading, error y empty cuando aplica.
- Los datos no existentes en backend se muestran como `Sin informacion disponible`.
- No se inventan valores dinamicos para metricas faltantes.
- No se muestran errores crudos ni objetos en UI.

- [x]
## Task 10: Pulir responsive y consistencia visual

### Objetivo

Asegurar que las vistas mejoradas funcionen bien en desktop y mobile, siguiendo el lenguaje visual de la referencia y del proyecto.

### Archivos esperados

- CSS de todas las paginas de estudiante modificadas.
- CSS del navbar alumno.

### Tests requeridos

- No se crean tests.
- Verificacion manual en:
  - desktop
  - ancho mobile
  - menu mobile del navbar

### Criterio de finalizacion

- No hay overflow horizontal inesperado.
- Tablas y cards se adaptan a mobile.
- El navbar no tapa contenido.
- Los textos no se superponen.
- Los botones mantienen targets comodos.
- La UI usa Angular Material y estilos locales sin depender de Tailwind de los HTML de referencia.

- [ ]
## Task 11: Validacion final

### Objetivo

Confirmar que la implementacion cumple la spec y compila correctamente.

### Archivos esperados

- No aplica archivo nuevo.
- Ajustes menores si la validacion detecta errores.

### Tests requeridos

- Ejecutar:

```bash
npm run build
```

### Criterio de finalizacion

- `npm run build` termina correctamente.
- El feature estudiante tiene navbar propio.
- Inicio, Calificaciones, Asistencia y Material usan la UI mejorada.
- Comunicaciones queda disponible desde el navbar.
- Noticias no aparece.
- Material mantiene mock.
- Datos faltantes muestran `Sin informacion disponible`.
- Las vistas mantienen estados de carga, error y vacio.
