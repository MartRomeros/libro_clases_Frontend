Genera solo la vista del login de la aplicacion

- el formulario debe tener los campos de correo y contraseña.
- el formulario debe tener validaciones antes y despues de enviar el formulario.
- debe tener un apartado para recuperar la contraseña.
- simula con un spinner el envio de datos.

## Resultados

Se ha implementado la vista de inicio de sesión completa, cumpliendo con todos los requisitos técnicos y estéticos:

- **Componente Estructurado**: Se creó el componente `Login` en `src/app/features/auth/login` utilizando una estructura de archivos separada (TS, HTML, CSS).
- **Formulario Reactivo**: Implementado con `ReactiveFormsModule`, incluyendo validaciones para correo electrónico (formato y obligatoriedad) y contraseña (longitud mínima y obligatoriedad).
- **Seguridad Visual**: Se incluyó un botón para alternar la visibilidad de la contraseña.
- **Simulación de Carga**: Al enviar el formulario, se activa un `mat-spinner` dentro del botón y se deshabilita la interacción durante 2 segundos para simular una llamada a la API.
- **Diseño Integrado**: Se utilizó **Tailwind CSS 4** y variables de sistema de **Angular Material 3** (`--mat-sys-*`) para garantizar que los colores coincidan con la paleta `azure` del proyecto.
- **Rutas**: Se registró la ruta `/login` en el sistema de navegación de la aplicación.

## Justificación

La implementación utiliza las mejores prácticas de Angular moderno (Signals para el estado visual, Standalone Components y Router Lazy Loading). El uso de variables de sistema de Material garantiza que la aplicación sea mantenible y coherente con cualquier cambio futuro en el tema global. Se optó por un diseño limpio y profesional que prioriza la experiencia de usuario (UX) mediante feedback visual claro en las validaciones y estados de carga.