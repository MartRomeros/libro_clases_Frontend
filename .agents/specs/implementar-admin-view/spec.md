# Spec: Implementar vista de administrador

## Objetivo

Actualizar la experiencia visual del modulo administrador para que sea
consistente con las vistas de docente y estudiante, usando como referencia el
diseno de `.agents/context/ui-mejorada`, especialmente el lenguaje visual de la
home del alumno, pero adaptado a las necesidades del administrador.

La vista debe funcionar como panel de supervision y acceso rapido para la
gestion escolar del libro de clases.

## Alcance

- Redisenar el home del administrador.
- Crear o ajustar un navbar especifico para administrador, similar al navbar de
  docente y estudiante.
- Reemplazar el navbar generico actual en las paginas del administrador por el
  navbar especifico del feature admin.
- Cambiar los indicadores principales del dashboard admin por:
  - Estudiantes.
  - Docentes.
  - Asistencia promedio.
  - Cursos.
- Cambiar las acciones rapidas del dashboard admin para que sean exactamente:
  - Gestion de usuarios.
  - Gestion de cursos.
  - Mensajes.
- Ajustar la UI de las paginas existentes del administrador para mantener
  consistencia visual con el nuevo dashboard.
- Mantener los estados de carga, error y vacio donde existan consultas a datos.
- Mantener la implementacion dentro del frontend Angular.

## Fuera de alcance

- Cambios en backend.
- Cambios en base de datos.
- Creacion de nuevos endpoints.
- Cambios de autenticacion, autorizacion o roles.
- Reemplazar Angular Material por otra libreria visual.
- Introducir Tailwind como dependencia si el proyecto no lo tiene configurado.
- Implementar reportes avanzados, graficos historicos o metricas no disponibles
  desde los datos actuales.

## Reglas de negocio

- El administrador debe poder identificar rapidamente el estado general del
  colegio desde el dashboard.
- Las acciones rapidas deben dirigir a flujos administrativos existentes o a
  rutas claramente definidas dentro del frontend.
- Si una metrica no puede obtenerse desde datos reales disponibles, debe
  mostrarse un valor seguro o `Sin informacion disponible`; no debe presentarse
  como dato real inventado.
- La navegacion admin debe mantener la misma intencion que docente y estudiante:
  contenedor con sidenav mobile, toolbar superior y contenido proyectado.
- Los textos visibles deben estar en espanol.
- La UI debe ser responsive para desktop, tablet y mobile.

## Criterios de aceptacion

- Dado un usuario administrador, cuando entra a `/admin`, entonces ve un
  dashboard visualmente consistente con docente y estudiante.
- Dado el dashboard admin, cuando se renderizan los indicadores principales,
  entonces aparecen Estudiantes, Docentes, Asistencia promedio y Cursos.
- Dado el dashboard admin, cuando se renderizan las acciones rapidas, entonces
  aparecen exactamente Gestion de usuarios, Gestion de cursos y Mensajes.
- Dado el modulo admin, cuando se navega entre paginas existentes, entonces el
  navbar admin se mantiene consistente.
- Dado un estado de carga de datos, cuando las queries estan pendientes,
  entonces se muestra un loading state.
- Dado un error al cargar datos, cuando una query falla, entonces se muestra un
  error state con opcion de reintento cuando el patron existente lo permita.
- Dado que no hay datos disponibles, cuando una lista o tabla queda vacia,
  entonces se muestra un empty state comprensible.
- Dado un viewport mobile, cuando el usuario abre la navegacion, entonces puede
  acceder a las opciones admin sin desbordes ni solapamientos.
- El build del frontend debe pasar con `npm run build`.

## Supuestos

- El proyecto usa Angular moderno con standalone components y control flow
  `@if` / `@for`.
- El feature admin actual contiene al menos `/admin` y `/admin/usuarios`.
- La accion `Mensajes` debe navegar al modulo existente de comunicaciones
  (`/comunicaciones`), salvo que una etapa posterior defina una ruta admin
  especifica.
- La accion `Gestion de cursos` puede apuntar a una seccion/ruta admin definida
  por el diseno. Si no existe pagina propia, debe resolverse sin romper rutas.
- Las metricas administrativas pueden calcularse desde queries existentes si
  estan disponibles; si no, se debe usar fallback explicito.

## Casos borde

- Perfil del administrador no disponible.
- Error al cargar usuarios, cursos u otros datos admin.
- Listas de usuarios, cursos, docentes o estudiantes vacias.
- Rutas de acciones rapidas no existentes.
- Navegacion mobile con menu abierto y cierre por seleccion.
- Textos largos en cards o tablas.
- Datos parciales: por ejemplo cursos disponibles pero asistencia promedio no.
