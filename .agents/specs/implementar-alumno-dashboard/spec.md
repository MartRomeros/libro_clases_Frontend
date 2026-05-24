# Implementar dashboard y vistas del alumno

## Objetivo

Implementar la UI mejorada para todo el feature de estudiante ubicado en
`src/app/features/estudiante/`, tomando como referencia los diseños HTML de
`.agents/context/ui-mejorada/alumno`.

El resultado debe modernizar la experiencia completa del alumno:

- Inicio del alumno.
- Calificaciones.
- Asistencia.
- Material de estudio.
- Navegación propia del alumno.

## Alcance

La tarea incluye actualizar las pantallas existentes del feature estudiante:

- `estudiante-home.page.component`
- `grades.page.component`
- `attendance.page.component`
- `resources.page.component`

Tambien incluye crear una estructura de `sections` para estudiante, siguiendo el
patron del feature docente, especialmente para el navbar.

## Referencias de UI

La UI mejorada esta en:

- `.agents/context/ui-mejorada/alumno/alumno-home.html`
- `.agents/context/ui-mejorada/alumno/calificaciones.html`
- `.agents/context/ui-mejorada/alumno/asistencia.html`
- `.agents/context/ui-mejorada/alumno/material.html`

Estas referencias se deben adaptar al sistema visual y componentes existentes
del proyecto. No se deben copiar dependencias externas de los HTML de referencia.

## Componentes y libreria visual

Todos los componentes interactivos y estructurales deben usar Angular Material
cuando corresponda:

- Botones.
- Cards.
- Tablas.
- Iconos.
- Chips/badges.
- Tooltips.
- Dividers.
- Estados de carga, error y vacio ya compartidos en `shared/components`.

## Navbar del alumno

Se debe crear un navbar propio para alumno, equivalente en estructura y
comportamiento al navbar del docente ubicado en `src/app/features/docente/`.

El navbar debe vivir dentro del feature estudiante, siguiendo la estructura:

- `src/app/features/estudiante/sections/navbar.component/...`

El menu del alumno debe incluir:

- Inicio
- Calificaciones
- Asistencia
- Material
- Comunicaciones

No debe incluir `Noticias`.

Las vistas de estudiante deben usar este navbar propio en lugar del navbar
generico actual, siempre que aplique.

## Datos del backend

La UI mejorada puede pedir datos que actualmente no existen en el backend.

Regla:

- Si el dato existe hoy, conectarlo a la fuente real actual.
- Si el dato no existe, mantener el bloque visual y mostrar `Sin informacion disponible`.
- Anotar en comentarios o en el design los datos faltantes para integrarlos luego.
- No inventar datos dinamicos como si vinieran del backend.

Excepcion:

- La vista de material de estudio puede mantener el mock actual de recursos.

## Reglas por vista

### Inicio del alumno

Debe mostrar:

- Saludo personalizado con el nombre del estudiante cuando este disponible.
- Resumen escolar.
- Accesos principales a Calificaciones, Asistencia, Material y Comunicaciones.
- Bloques de resumen que puedan conectarse con datos reales disponibles.
- Para datos no disponibles, mostrar `Sin informacion disponible`.

No debe mostrar acceso a Noticias.

### Calificaciones

Debe adaptar la UI mejorada de `calificaciones.html`.

Debe conectarse con la data real actual de notas del estudiante.

Debe incluir:

- Estado de carga.
- Estado de error.
- Estado vacio cuando no existan notas.
- Tabla o layout de calificaciones.
- Indicadores visuales para notas bajas.
- Promedios cuando la informacion este disponible.

Si la UI de referencia pide datos no disponibles, mostrar `Sin informacion disponible`.

### Asistencia

Debe adaptar la UI mejorada de `asistencia.html`.

Debe conectarse con la data real actual de asistencia del estudiante.

Debe incluir:

- Estado de carga.
- Estado de error.
- Estado vacio cuando no existan registros.
- Resumen general.
- Desglose por asignatura o clase segun la data actual.
- Indicadores de porcentaje con estados semanticos.

Si algun indicador de la referencia no puede calcularse con la data actual,
mostrar `Sin informacion disponible`.

### Material de estudio

Debe adaptar la UI mejorada de `material.html`.

Por ahora debe conservar el mock actual de recursos.

Debe incluir:

- Lista o tabla de materiales.
- Tipo de archivo.
- Asignatura.
- Titulo.
- Fecha.
- Tamano.
- Accion de descarga.
- Estado vacio si el mock queda sin elementos.

## Estructura esperada

La estructura del feature estudiante debe acercarse a la del docente:

```text
src/app/features/estudiante/
  data-access/
  models/
  pages/
  sections/
  estudiante.routes.ts
```

La carpeta `sections` debe contener al menos el navbar del alumno.

## Fuera de alcance

- Crear endpoints nuevos.
- Cambiar backend.
- Crear la vista de Noticias.
- Reemplazar el mock de recursos por backend real.
- Redisenar features que no sean `estudiante`, salvo ajustes necesarios de navegacion compartida.

## Criterios de aceptacion

- Todas las pantallas del feature estudiante usan la UI mejorada como referencia.
- El alumno tiene navbar propio con menus correctos.
- No aparece `Noticias` en el menu ni en accesos rapidos.
- Las pantallas mantienen estados de carga, error y vacio.
- Los datos existentes se conectan al backend actual.
- Los datos no disponibles se muestran como `Sin informacion disponible`.
- Material de estudio conserva el mock actual.
- La estructura del feature incluye `sections` como en docente.
