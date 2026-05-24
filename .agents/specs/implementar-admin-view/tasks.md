# Tasks: Vista de administrador consistente

- [x]
## Task 1: Levantar estado actual del feature admin

### Objetivo

Identificar estructura, rutas, componentes, queries y estilos actuales del
modulo admin antes de modificar la UI.

### Archivos esperados

- Revisar `src/app/features/admin/**`.
- Revisar `src/app/features/docente/sections/navbar.component/**`.
- Revisar `src/app/features/docente/sections/toolbar.component/**`.
- Revisar `src/app/features/estudiante/sections/navbar.component/**`.
- Revisar `src/app/features/estudiante/sections/toolbar.component/**`.
- Revisar `.agents/context/ui-mejorada/alumno/alumno-home.html`.

### Tests requeridos

- No se crean tests.
- Usar busquedas con `rg` para:
  - `app-navbar`
  - `AdminHomePageComponent`
  - `UserManagementPageComponent`
  - `resumenRapido`
  - `opciones`
  - `admin.routes`
  - `AdminQueries`

### Criterio de finalizacion

- Queda claro que paginas admin usan el navbar generico actual.
- Queda claro que rutas admin existen hoy.
- Queda claro que datos/query actuales pueden alimentar metricas.
- Queda claro que `Gestion de cursos` debe resolverse sin romper rutas.

- [x]
## Task 2: Crear toolbar propio del administrador

### Objetivo

Crear un toolbar dentro del feature admin, equivalente en intencion a los
toolbars de docente y estudiante, con identidad administrativa.

### Archivos esperados

- Crear `src/app/features/admin/sections/toolbar.component/toolbar.component.ts`.
- Crear `src/app/features/admin/sections/toolbar.component/toolbar.component.html`.
- Crear `src/app/features/admin/sections/toolbar.component/toolbar.component.css`.

### Tests requeridos

- No se crean tests automatizados.
- Verificacion manual posterior en desktop y mobile.

### Criterio de finalizacion

- El toolbar es standalone.
- Usa Angular Material igual que docente/estudiante cuando corresponda.
- Muestra identidad institucional `O'Higgins`.
- Comunica que el usuario esta en administracion.
- Expone boton de menu mobile.
- Incluye acceso a cuenta o replica el patron de cuenta existente.
- No introduce dependencias nuevas.

- [x]
## Task 3: Crear navbar propio del administrador

### Objetivo

Crear un navbar contenedor para admin que use `mat-sidenav-container`,
`mat-sidenav`, el toolbar admin y proyeccion de contenido.

### Archivos esperados

- Crear `src/app/features/admin/sections/navbar.component/navbar.component.ts`.
- Crear `src/app/features/admin/sections/navbar.component/navbar.component.html`.
- Crear `src/app/features/admin/sections/navbar.component/navbar.component.css`.

### Tests requeridos

- No se crean tests automatizados.
- Verificacion manual posterior:
  - abre/cierra sidenav
  - navega por links
  - menu mobile no tapa contenido

### Criterio de finalizacion

- El navbar es standalone.
- Usa `<ng-content>` para envolver paginas admin.
- Incluye menus:
  - Inicio -> `/admin`
  - Usuarios -> `/admin/usuarios`
  - Cursos -> `/admin/usuarios` o ruta valida definida durante la tarea
  - Mensajes -> `/comunicaciones`
- Mantiene comportamiento responsive similar al navbar docente/estudiante.
- Mantiene acciones de cuenta: ver perfil y cerrar sesion, si existen en el
  patron tomado como referencia.

- [x]
## Task 4: Reemplazar navbar generico en paginas admin

### Objetivo

Usar el navbar propio del administrador en las paginas existentes del feature
admin.

### Archivos esperados

- `src/app/features/admin/pages/admin-home.page.component/admin-home.page.component.ts`
- `src/app/features/admin/pages/admin-home.page.component/admin-home.page.component.html`
- `src/app/features/admin/pages/user-management.page.component/user-management.page.component.ts`
- `src/app/features/admin/pages/user-management.page.component/user-management.page.component.html`

### Tests requeridos

- No se crean tests.
- Verificacion manual posterior en `/admin` y `/admin/usuarios`.

### Criterio de finalizacion

- Ninguna pagina admin usa `<app-navbar/>` generico.
- Las paginas admin importan y renderizan el navbar admin.
- El contenido de cada pagina queda proyectado dentro del layout admin.
- La navegacion entre `/admin`, `/admin/usuarios` y `/comunicaciones` funciona.

- [x]
## Task 5: Actualizar modelo local de metricas y acciones del dashboard admin

### Objetivo

Ajustar la configuracion de datos de la home admin para que coincida con la
spec antes de redisenar el template.

### Archivos esperados

- `src/app/features/admin/pages/admin-home.page.component/admin-home.page.component.ts`

### Tests requeridos

- No se crean tests.
- Verificacion manual posterior de labels, iconos y rutas.

### Criterio de finalizacion

- Los indicadores principales son exactamente:
  - Estudiantes
  - Docentes
  - Asistencia promedio
  - Cursos
- Las acciones rapidas son exactamente:
  - Gestion de usuarios
  - Gestion de cursos
  - Mensajes
- `Gestion de usuarios` navega a `/admin/usuarios`.
- `Gestion de cursos` navega a una ruta valida, inicialmente `/admin/usuarios`
  si no se separa pagina.
- `Mensajes` navega a `/comunicaciones`.
- Las metricas no disponibles usan `Sin informacion disponible`.
- No se crean endpoints nuevos.

- [x]
## Task 6: Implementar UI mejorada de home administrador

### Objetivo

Redisenar la home admin usando como referencia la home mejorada de alumno y el
lenguaje visual de docente/estudiante.

### Archivos esperados

- `src/app/features/admin/pages/admin-home.page.component/admin-home.page.component.ts`
- `src/app/features/admin/pages/admin-home.page.component/admin-home.page.component.html`
- `src/app/features/admin/pages/admin-home.page.component/admin-home.page.component.css`

### Tests requeridos

- No se crean tests.
- Verificacion manual:
  - saludo con nombre del administrador cuando hay perfil
  - fallback `Administrador` cuando no hay perfil
  - cuatro cards de metricas
  - tres acciones rapidas
  - navegacion por click y teclado

### Criterio de finalizacion

- La home muestra saludo administrativo personalizado.
- La home muestra subtitulo institucional del panel.
- La home muestra Estudiantes, Docentes, Asistencia promedio y Cursos.
- La home muestra Gestion de usuarios, Gestion de cursos y Mensajes.
- Los cards tienen jerarquia visual, bordes y espaciado consistentes.
- No se copia Tailwind ni Material Symbols desde la referencia.
- La UI no presenta datos inventados como reales.

- [x]
## Task 7: Ajustar UI de gestion de usuarios y configuracion academica

### Objetivo

Actualizar la pagina admin existente para que sea visualmente consistente con el
nuevo dashboard sin reescribir su logica de negocio.

### Archivos esperados

- `src/app/features/admin/pages/user-management.page.component/user-management.page.component.ts`
- `src/app/features/admin/pages/user-management.page.component/user-management.page.component.html`
- `src/app/features/admin/pages/user-management.page.component/user-management.page.component.css`

### Tests requeridos

- No se crean tests.
- Verificacion manual:
  - tabs existentes siguen accesibles
  - formularios siguen enviando
  - tablas siguen renderizando
  - botones de editar/eliminar siguen visibles
  - loading/error/empty siguen funcionando

### Criterio de finalizacion

- La pagina usa el navbar admin.
- Gestion de usuarios conserva formulario y tabla actuales.
- Configuracion academica conserva cursos, asignaturas, CAD y asignacion de
  alumnos.
- Evaluaciones globales conserva filtro, formulario y tabla actuales.
- La UI usa espaciado, headers, cards y tablas consistentes con la home admin.
- No se cambian contratos de API ni payloads de mutations.

- [x]
## Task 8: Revisar rutas y navegacion de acciones admin

### Objetivo

Asegurar que todos los links del navbar y acciones rapidas apunten a rutas
validas y no generen navegacion rota.

### Archivos esperados

- `src/app/features/admin/admin.routes.ts`
- `src/app/features/admin/sections/navbar.component/navbar.component.ts`
- `src/app/features/admin/sections/navbar.component/navbar.component.html`
- `src/app/features/admin/pages/admin-home.page.component/admin-home.page.component.ts`

### Tests requeridos

- No se crean tests.
- Verificacion manual:
  - `/admin`
  - `/admin/usuarios`
  - ruta usada por Gestion de cursos
  - `/comunicaciones`

### Criterio de finalizacion

- Inicio navega a `/admin`.
- Usuarios navega a `/admin/usuarios`.
- Cursos navega a una pantalla valida.
- Mensajes navega a `/comunicaciones`.
- No quedan rutas visibles hacia `/admin/reportes` o `/admin/notificaciones`
  si esas rutas no existen.
- Si se crea una ruta `/admin/cursos`, queda documentada en el codigo y enlazada
  de forma consistente.

- [x]
## Task 9: Revisar estados de carga, error, vacio y datos faltantes

### Objetivo

Garantizar que las pantallas admin mantienen los estados de datos esperados y
que las metricas no disponibles no aparecen como errores.

### Archivos esperados

- `src/app/features/admin/pages/admin-home.page.component/admin-home.page.component.ts`
- `src/app/features/admin/pages/admin-home.page.component/admin-home.page.component.html`
- `src/app/features/admin/pages/user-management.page.component/user-management.page.component.ts`
- `src/app/features/admin/pages/user-management.page.component/user-management.page.component.html`

### Tests requeridos

- No se crean tests.
- Verificacion manual:
  - loading -> error -> empty -> success
  - datos faltantes muestran `Sin informacion disponible`
  - errores reales usan `app-error-state`
  - vacios reales usan `app-empty-state`

### Criterio de finalizacion

- Queries pendientes muestran loading state donde aplica.
- Errores de query muestran error state con reintento donde el patron actual lo
  permite.
- Listas vacias muestran empty state.
- Metricas sin fuente real muestran `Sin informacion disponible`.
- No se muestran errores crudos ni objetos JSON en UI.

- [x]
## Task 10: Pulir responsive y consistencia visual admin

### Objetivo

Asegurar que las vistas admin funcionan bien en desktop, tablet y mobile,
manteniendo consistencia con docente y estudiante.

### Archivos esperados

- CSS del navbar admin.
- CSS del toolbar admin.
- CSS de `admin-home`.
- CSS de `user-management`.

### Tests requeridos

- No se crean tests.
- Verificacion manual en:
  - desktop
  - tablet
  - ancho mobile
  - sidenav mobile abierto y cerrado

### Criterio de finalizacion

- No hay overflow horizontal inesperado.
- Cards y tablas se adaptan a mobile.
- El navbar no tapa contenido.
- Los textos no se superponen.
- Los botones mantienen targets comodos.
- La UI usa Angular Material y estilos locales sin depender de Tailwind de los
  HTML de referencia.

- [x]
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
- `/admin` usa navbar admin.
- `/admin/usuarios` usa navbar admin.
- El dashboard muestra las cuatro metricas requeridas.
- El dashboard muestra las tres acciones rapidas requeridas.
- Gestion de usuarios navega correctamente.
- Gestion de cursos navega a una pantalla valida.
- Mensajes navega a `/comunicaciones`.
- Las pantallas mantienen estados de carga, error y vacio.
- Datos faltantes muestran `Sin informacion disponible`.
- No hay cambios fuera del alcance del spec.
