# Design: Vista de administrador consistente

## Contexto

El feature `admin` ya tiene una home y una pagina de gestion de usuarios, pero
su UI usa el navbar generico y no coincide con el patron visual reciente de
docente y estudiante.

La implementacion debe adaptar la referencia visual de
`.agents/context/ui-mejorada` al modulo administrador, manteniendo Angular
Material, standalone components, rutas lazy y los patrones existentes de
TanStack Query.

## Archivos que probablemente se modificaran

### Home administrador

- `src/app/features/admin/pages/admin-home.page.component/admin-home.page.component.ts`
- `src/app/features/admin/pages/admin-home.page.component/admin-home.page.component.html`
- `src/app/features/admin/pages/admin-home.page.component/admin-home.page.component.css`

### Gestion de usuarios / configuracion academica

- `src/app/features/admin/pages/user-management.page.component/user-management.page.component.ts`
- `src/app/features/admin/pages/user-management.page.component/user-management.page.component.html`
- `src/app/features/admin/pages/user-management.page.component/user-management.page.component.css`

### Rutas admin

- `src/app/features/admin/admin.routes.ts`

Solo se modificara si es necesario resolver una ruta para Gestion de cursos sin
romper navegacion.

## Archivos que probablemente se agregaran

### Navbar admin

- `src/app/features/admin/sections/navbar.component/navbar.component.ts`
- `src/app/features/admin/sections/navbar.component/navbar.component.html`
- `src/app/features/admin/sections/navbar.component/navbar.component.css`

### Toolbar admin

- `src/app/features/admin/sections/toolbar.component/toolbar.component.ts`
- `src/app/features/admin/sections/toolbar.component/toolbar.component.html`
- `src/app/features/admin/sections/toolbar.component/toolbar.component.css`

Estos componentes deben tomar como referencia directa los patrones de:

- `src/app/features/docente/sections/navbar.component/`
- `src/app/features/docente/sections/toolbar.component/`
- `src/app/features/estudiante/sections/navbar.component/`
- `src/app/features/estudiante/sections/toolbar.component/`

## Arquitectura propuesta

### Estructura del feature

Mantener el modulo admin con la misma forma que docente y estudiante:

```text
src/app/features/admin/
  data-access/
  models/
  pages/
  sections/
  admin.routes.ts
```

La carpeta `sections` contendra componentes compartidos solo por el feature
admin. El navbar admin sera el contenedor de layout de las paginas admin, usando
`<ng-content>` para proyectar cada pagina.

### Navbar

Crear `NavbarAdminComponent` standalone con:

- `mat-sidenav-container`.
- `mat-sidenav` en modo `over` para mobile.
- Links principales del administrador.
- Menu de cuenta con `Ver perfil` y `Cerrar sesion`.
- Toolbar admin proyectada como en docente/estudiante.

Menu propuesto:

| Label | Ruta |
| --- | --- |
| Inicio | `/admin` |
| Usuarios | `/admin/usuarios` |
| Cursos | `/admin/usuarios` |
| Mensajes | `/comunicaciones` |

La ruta `Cursos` puede apuntar inicialmente a `/admin/usuarios` porque la pagina
actual incluye configuracion academica en tabs. Si durante implementacion se
separa una ruta `/admin/cursos`, el menu y la accion rapida deben actualizarse
de forma consistente.

### Toolbar

Crear `ToolbarAdminComponent` standalone con:

- Identidad institucional `O'Higgins`.
- Titulo contextual de administracion.
- Boton de menu mobile.
- Boton/notificacion visual si el patron existente lo permite.
- Menu de cuenta reutilizando el comportamiento actual de logout/perfil.

La toolbar debe mantener el lenguaje visual de docente/estudiante: fondo claro,
azul institucional, iconos Material y layout estable.

## Flujo de datos

### Perfil administrador

La home debe seguir usando:

- `AuthQueries.me()`
- `injectQuery`
- `computed`

Si el perfil no esta disponible, mostrar `Administrador` como fallback.

### Metricas principales

El dashboard debe mostrar cuatro cards:

| Card | Fuente esperada | Fallback |
| --- | --- | --- |
| Estudiantes | Query/admin data existente si esta disponible | `Sin informacion disponible` |
| Docentes | Query/admin data existente si esta disponible | `Sin informacion disponible` |
| Asistencia promedio | Datos existentes si estan disponibles | `Sin informacion disponible` |
| Cursos | Query de cursos existente si esta disponible | `Sin informacion disponible` |

Si `AdminQueries` ya expone usuarios/cursos, se pueden derivar conteos desde
esas respuestas. Si no existe una query segura para una metrica, no crear
contratos nuevos contra backend en esta tarea.

### Acciones rapidas

La home debe renderizar exactamente tres acciones:

| Accion | Ruta recomendada | Icono |
| --- | --- | --- |
| Gestion de usuarios | `/admin/usuarios` | `manage_accounts` |
| Gestion de cursos | `/admin/usuarios` o `/admin/cursos` si se crea ruta | `school` |
| Mensajes | `/comunicaciones` | `chat` |

Las acciones deben ser botones/cards navegables con soporte para click y tecla
Enter.

## UI por pantalla

### Home admin

Referencia visual:

- `.agents/context/ui-mejorada/alumno/alumno-home.html`

Adaptacion:

- Saludo personalizado para administrador.
- Subtitulo institucional del panel administrativo.
- Cards de resumen con los cuatro indicadores requeridos.
- Seccion de acciones rapidas con tres cards grandes.
- Jerarquia similar a alumno/docente: ancho maximo, separacion por secciones,
  cards con borde sutil y sombras suaves.
- No usar sidebar permanente de escritorio; mantener el patron sidenav +
  toolbar de las features existentes.

### Gestion de usuarios

La pagina actual contiene:

- Gestion de usuarios.
- Configuracion academica.
- Evaluaciones globales.

La tarea debe ajustar su apariencia para que:

- Use `app-navbar-admin`.
- Mantenga tabs o estructura actual si no se separan rutas.
- Mejore espaciado, contenedores, headers y estados.
- Conserve formularios, tablas, mutations y queries actuales.
- Mantenga `app-loading-state`, `app-error-state` y `app-empty-state`.

No se debe reescribir la logica de negocio de formularios salvo que sea
necesario para enlazar acciones/rutas.

## Estados compartidos

Todas las pantallas admin deben conservar el orden:

```text
loading -> error -> empty -> success
```

Para datos no disponibles por falta de endpoint, usar:

```text
Sin informacion disponible
```

No usar error state para metricas que simplemente no existen en el contrato
actual.

## Cambios en base de datos

No aplica.

La tarea es exclusivamente de frontend y no modifica la base de datos ni
contratos backend.

## Dependencias nuevas

No se esperan dependencias nuevas.

Usar dependencias existentes:

- Angular standalone components.
- Angular Material.
- `@tanstack/angular-query-experimental`.
- Reactive Forms.
- Componentes compartidos `loading-state`, `error-state` y `empty-state`.

## Riesgos

- El diseno de referencia usa Tailwind y Material Symbols; la implementacion
  debe traducir la apariencia al stack actual sin agregar dependencias.
- `Gestion de cursos` no existe como ruta independiente en `admin.routes.ts`.
  Puede resolverse apuntando a la pagina actual con tabs, o creando una ruta
  nueva si el equipo decide separar esa pantalla.
- Algunas metricas requeridas pueden no existir como endpoints directos. Deben
  derivarse de datos existentes o mostrarse como `Sin informacion disponible`.
- La pagina `user-management` concentra muchos flujos; redisenarla sin tocar
  logica requiere cambios cuidadosos en template/CSS.
- Cambiar el navbar generico por uno admin puede afectar comportamiento de
  logout/perfil si no se replica el patron de docente/estudiante.
- Si existen estilos globales o clases utilitarias usadas por docente/estudiante,
  el admin debe reutilizarlas con cuidado para no romper otras features.

## Estrategia de testing

No se requieren tests automatizados nuevos para esta etapa si la implementacion
solo cambia UI y navegacion. La validacion minima debe ser build y revision
manual.

Validacion tecnica:

```bash
npm run build
```

Validacion manual:

- Entrar a `/admin`.
- Confirmar que se usa navbar admin y no el navbar generico.
- Confirmar cards: Estudiantes, Docentes, Asistencia promedio y Cursos.
- Confirmar acciones rapidas: Gestion de usuarios, Gestion de cursos y
  Mensajes.
- Confirmar que Gestion de usuarios navega correctamente.
- Confirmar que Gestion de cursos navega a una pantalla valida.
- Confirmar que Mensajes navega a `/comunicaciones`.
- Entrar a `/admin/usuarios`.
- Confirmar que la pagina mantiene formularios, tablas, tabs y estados.
- Probar viewport mobile: abrir/cerrar menu, navegar y verificar que no hay
  solapamientos.
- Confirmar que datos no disponibles se muestran como
  `Sin informacion disponible`.

## Orden de implementacion sugerido

1. Crear `sections/toolbar.component` para admin copiando el patron conceptual
   de docente/estudiante.
2. Crear `sections/navbar.component` para admin con rutas y menu definidos.
3. Reemplazar `<app-navbar/>` por `<app-navbar-admin>` en paginas admin.
4. Actualizar datos locales de cards y acciones rapidas en la home admin.
5. Redisenar template y CSS de `admin-home`.
6. Ajustar template y CSS de `user-management` para consistencia visual.
7. Revisar rutas de Gestion de cursos y Mensajes.
8. Revisar estados loading/error/empty.
9. Ejecutar `npm run build`.
10. Hacer validacion manual responsive.
