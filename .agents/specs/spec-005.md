- genera la vista principal de Docente
- Debe contener las principales opciones que el docente puede tener segun el
`contex/`.
- genera la vista de registro de asistencia y conducta y enlazala con la ruta del 
docente creada.
- no generes los servicios solo las vistas.
- utiliza colores de angular material. no colores personalizados.

---

## Resultados de la Ejecución (Spec-005)

**Acciones realizadas:**
1. **Vista Principal de Docente:** Se rediseñó el componente `DocenteHome` en `src/app/features/home/docente-home/`. Ahora incluye un panel de control con:
   - Toolbar profesional con nombre de usuario y cierre de sesión.
   - Resumen dinámico del día (Clases, Estudiantes, Evaluaciones, Mensajes).
   - Tarjetas de navegación intuitivas para las herramientas principales.
2. **Vista de Asistencia y Conducta:** Se creó el componente `AsistenciaConducta` en `src/app/features/docente/asistencia-conducta/`. Características:
   - Filtros por curso y fecha.
   - Tabla interactiva para marcar asistencia con estados (Presente, Ausente, Tardanza, Justificado).
   - Sistema de anotaciones de conducta con formulario reactivo y lista cronológica de registros.
   - Uso de Angular Signals para una reactividad eficiente.
3. **Configuración de Rutas:** Se registraron las nuevas rutas en `app.routes.ts`:
   - `/docente`: Dashboard principal.
   - `/docente/asistencia`: Registro de asistencia y conducta.
4. **Estética y Diseño:** Se implementó una interfaz premium utilizando Angular Material y CSS personalizado basado en variables de tema, asegurando un diseño responsivo y moderno ("wow factor").

**Justificación:**
- Se optó por una arquitectura de componentes standalone y el uso de **Signals** para seguir las mejores prácticas de Angular moderno (v17+).
- Las vistas fueron diseñadas para ser altamente usables en dispositivos móviles y escritorio, facilitando la labor diaria del docente en la sala de clases.
- Se respetó la restricción de usar colores de Angular Material, integrándolos mediante el sistema de diseño del framework.
