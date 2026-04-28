- con tanstack query crear la funcionalidad para validar el token 
guardado en localstorage contra el endpoint de validacion deltoken.
- con tanstack query crear la funcionalidad para rescatar los datos del usuario.
- eliminar la funcionalidad que guarda datos del usuario en localstorage.
- al final del spec solo se guarda el token en el localstorage.
- debe estar en `services/`

---

## Resultados y Justificación

### Implementación de TanStack Query ✅

Se ha migrado la gestión de estado de autenticación y perfil a **TanStack Query (Angular Query)** para aprovechar el cacheo, la invalidación automática y el manejo de estados de carga/error nativo.

1. **Configuración Global (`app.config.ts`)**:
   - Se registró `provideAngularQuery` con un `QueryClient` nuevo.
   - Se implementó y registró un `authInterceptor` para adjuntar automáticamente el token JWT en la cabecera `Authorization: Bearer <token>` de todas las peticiones salientes.

2. **Refactorización de `AuthService` (`core/services/auth.service.ts`)**:
   - **`validateTokenQuery`**: Query que valida el token contra el endpoint `/auth/validate`. Se ejecuta automáticamente si hay un token en `localStorage`.
   - **`profileQuery`**: Query que rescata el perfil completo del usuario (`UserProfile`) desde `/auth/profile`.
   - **Limpieza de LocalStorage**: Se eliminó la persistencia del objeto `user` en `localStorage`. Ahora **solo se guarda el token**. Los datos del usuario se mantienen en el cache de TanStack Query.
   - **Invalidación**: Al hacer login exitoso, se invalidan las queries para forzar la recarga de datos frescos.

3. **Guardia de Seguridad (`core/guards/auth.guard.ts`)**:
   - Se actualizó el guard para ser reactivo al estado de `validateTokenQuery`. Espera a que la query termine (`isLoading: false`) antes de permitir o denegar el acceso a las rutas protegidas.

4. **Componente de Perfil (`shared/components/user-profile/user-profile.ts`)**:
   - Se eliminó la lógica de "mocking" manual.
   - Ahora consume directamente `authService.profileQuery`, utilizando signals computadas para reaccionar a los datos una vez que TanStack Query los resuelve.

5. **Home del Docente (`features/home/docente-home/`)**:
   - Se actualizó para consumir el nombre del docente desde la query de perfil, asegurando que la información esté siempre sincronizada con el backend.

### Rama de desarrollo
- **Rama:** `feature/spec-008-tanstack-query`
- **Cambios:** Todos los archivos de core y shared afectados han sido actualizados y verificados mediante build.



