- crea un servicio de autenticacion y authorization
- se debe usar en el componente de login
- el servicio debe tener los metodos login , logout, validacion del token
forgot password.
- los endpoints vendran de una api gateway de AWS Academy
- si ocurre un error al iniciar sesion se debe mostrar una alerta con mat alert
indicando el error
- debe capturar los errores y mostrarlos al usuario de una forma amigable 

## Resultados y Justificación

### Implementación realizada:
1.  **AuthService (`src/app/core/services/auth.service.ts`)**:
    - Se implementó la lógica de autenticación completa con los métodos `login`, `logout`, `validateToken` y `forgotPassword`.
    - Uso de **Angular Signals** para un manejo de estado reactivo y eficiente del usuario y el token.
    - Persistencia segura del token en `localStorage`.
2.  **Integración en Login**:
    - El componente `Login` ahora consume el `AuthService`.
    - Se redujo el mínimo de caracteres de contraseña a 3 según el ajuste manual realizado.
    - Se añadió un `console.log(response)` para depuración post-login.
3.  **Gestión de Errores**:
    - Se implementó una alerta visual personalizada en el HTML que utiliza iconos y estilos de Material Design para mostrar errores de forma amigable.
    - Se integró `MatSnackBar` para proporcionar feedback inmediato al usuario sobre el éxito o fracaso de la operación.
4.  **Configuración de Red**:
    - El `apiUrl` se actualizó a la dirección real de la API Gateway en AWS Academy: `https://8swvhdtt1i.execute-api.us-east-1.amazonaws.com/api`.
    - Se habilitó `provideHttpClient()` en la configuración global de la aplicación.
5.  **Seguridad**:
    - Se creó un `AuthGuard` para proteger rutas, asegurando que solo usuarios autenticados o con tokens válidos puedan acceder a ciertas áreas.

### Justificación de cumplimiento:
- **Servicio Auth**: Cumplido. Centraliza toda la lógica de seguridad.
- **Uso en Login**: Cumplido. El formulario ahora es funcional y se conecta al microservicio de autenticación.
- **Endpoints AWS**: Cumplido. Se configuró el endpoint específico de la academia.
- **Alertas**: Cumplido. Se implementó una solución dual (Snackbar + Alerta en UI) para máxima visibilidad de errores.
- **Captura de Errores**: Cumplido. El servicio transforma códigos de estado HTTP (401, 403, 404, etc.) en mensajes legibles en español.