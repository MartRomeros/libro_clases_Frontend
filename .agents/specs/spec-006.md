- desacompla el componente asistencia y conducta en el componente `attendance-conduct`
- el componente `attendance-conduct` tiene otros componentes `attendance` y `conduct`
- implementar el codigo donde corresponda, no se debe cambiar la logica del componente.

## Resultados y Justificación

### Tareas Realizadas
1.  **Desacoplamiento Estructural:** Se migró la lógica del componente monolítico `asistencia-conducta` hacia una nueva estructura modular en `src/app/features/attendance-conduct/`.
2.  **Creación de Sub-componentes:**
    -   `AttendanceComponent`: Gestiona el marcado de asistencia y contadores.
    -   `ConductComponent`: Gestiona el formulario de anotaciones y el historial del día.
3.  **Refactorización del Padre (`AttendanceConduct`):** Actúa como orquestador, manteniendo los filtros globales (Curso/Fecha) y el Toolbar.
4.  **Corrección de Errores:** Se resolvieron errores de inyección (`FormBuilder`) y faltas de módulos (`MatSnackBarModule`, `CommonModule`) en los componentes hijos.
5.  **Mejora Visual:** Se aplicó un estilo "Premium" al Toolbar (fondo corporativo, sombras profundas, espaciado flex) para mantener la coherencia con el resto de la aplicación.

### Justificación
El desacoplamiento mejora la mantenibilidad y legibilidad del código. Al separar Asistencia de Conducta, cada componente tiene una única responsabilidad (SRP), facilitando futuras integraciones con microservicios específicos. Se mantuvo el uso de Signals para una reactividad eficiente y se conservó la lógica original de datos mock según lo solicitado.
