- genera una vista para que los usuarios puedan ver sus datos personales
- no debe incluir la contraseña
- no se deben cambiar los datos
- segun el `contexto` genera la vista con los datos que podrian visualizarse en el perfil de usuario
- analizar si esta vista debe ir como `feature/` o como `shared/`

---

## Resultados y Justificación

### Decisión Arquitectónica: `shared/` ✅

El componente se ubicó en **`src/app/shared/components/user-profile/`** porque:
- Es **transversal a todos los roles** (admin, docente, estudiante, apoderado): todos ven los mismos campos base
- No tiene lógica de negocio exclusiva de un dominio (no es solo de `auth/`, ni de `docente/`, ni de `estudiante/`)
- Se accede a través de la ruta `/perfil` desde cualquier home mediante navegación programática
- Sigue el patrón del proyecto donde `shared/` aloja componentes reutilizables

### Tareas Realizadas

1. **Modelo `UserProfile`** (`core/models/user-profile.model.ts`):
   - Campos del DB: `usuario_id`, `rut`, `nombre`, `apellido_paterno`, `apellido_materno?`, `email`, `activo`, `rol`
   - **Sin campo `password`** (excluido explícitamente)
   - Interfaces discriminadas por rol: `DocentePerfil` (especialidad), `EstudiantePerfil` (curso), `ApoderadoPerfil`

2. **Componente `UserProfileComponent`** (`shared/components/user-profile/`):
   - Standalone, usa Signals (`signal`, `computed`) para reactividad eficiente
   - Lee el usuario autenticado desde `AuthService.currentUser()` (signal existente)
   - Redirige a `/login` si no hay sesión activa
   - Construye perfil enriquecido con mock data (en producción llamará al MS de auth/gestión)
   - Control flow moderno: `@if`, `@switch/@case` para secciones por rol

3. **Ruta `/perfil`** (`app.routes.ts`):
   - Lazy-loaded, disponible para todos los roles autenticados

4. **Acceso desde `DocenteHome`**:
   - Botón "Mi Perfil" (`account_circle`) en el toolbar
   - Avatar de bienvenida como botón interactivo con tooltip
   - Enlace "Ver mi perfil" bajo el nombre de bienvenida

### Campos visibles por sección

| Sección | Campos |
|---|---|
| Datos Personales | RUT, Nombre, Apellido Paterno, Apellido Materno |
| Contacto | Email (sin contraseña — campo enmascarado con `••••••••••`) |
| Info Docente | Especialidad |
| Info Estudiante | Nivel, Letra, Año académico |
| Sistema | ID de usuario, Rol, Estado activo/inactivo |

### Branch y PR

- **Rama:** `feature/spec-007-perfil-usuario` (publicada en GitHub)
- **PR:** Pendiente de abrir manualmente en GitHub (requiere autenticación en browser)
  → Comparar: `master ← feature/spec-007-perfil-usuario`