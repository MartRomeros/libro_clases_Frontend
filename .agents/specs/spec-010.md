- Crear la logica para que, en caso de no haber curso seleccionado en el modulo de attendance no se muestren
los alumnos
- crear la logica para que al accceder por GET a cursos/curso_id/alumnos obtenga los alumnos de ese curso
la response que se obtiene al acceder es asi:
{
"success": true,
  "curso_id": 2,
  "data": [
    {
      "estudiante_id": 113,
      "rut": "20.110.004-9",
      "nombre": "Tomás",
      "apellido_paterno": "Díaz",
      "apellido_materno": "Guerrero",
      "email": "tomas.diaz@colegio.cl"
    },]
}
- si el spec es muy ambiguo puedes realizar preguntas para que quede claro

## Resultados y Justificación

### Cambios realizados:
1.  **MS Integración (Servicio)**: Se actualizó `AttendanceConductService` para incluir el método `getAlumnosCurso(cursoId: number)`, alineado con la especificación del MS de asistencia y conducta. Se definieron las interfaces `Alumno` y `AlumnosResponse` para tipar correctamente la respuesta.
2.  **Lógica de Selección**: En el componente principal `AttendanceConduct`, se eliminó la selección automática del primer curso disponible. Ahora el estado inicial es "no seleccionado" (`''`), y se agregó una opción explícita "Seleccione un curso" en el `mat-select`.
3.  **Comunicación entre Componentes**: Se implementó el paso de datos desde el padre a los hijos (`app-attendance` y `app-conduct`) utilizando `input` de Angular.
4.  **Estado Vacío y Carga**:
    *   Ambos submódulos (`Attendance` y `Conduct`) ahora reaccionan al cambio de curso mediante un `effect`.
    *   Si no hay curso seleccionado, se muestra un "Empty State" amigable que invita al usuario a seleccionar uno, cumpliendo con el requerimiento de no mostrar alumnos.
    *   Se implementó un estado de carga (`mat-spinner`) mientras se obtienen los datos del servidor.
5.  **Actualización de Datos**: Se reemplazaron los datos mockeados por la información real obtenida del servicio, incluyendo el RUT y nombres completos en las tablas y formularios.

### Justificación:
Se optó por utilizar la API de Signals de Angular (`input`, `effect`, `signal`, `computed`) para mantener la consistencia con las versiones modernas de Angular mencionadas en las reglas del proyecto. Esta aproximación garantiza una reactividad eficiente y un código más limpio. La implementación del estado vacío mejora significativamente la UX al evitar mostrar listas vacías o erróneas antes de que el docente tome una decisión.

### Actualización: Corrección de Reactividad y Binding
Se detectó un error de compilación (`NG8002`) al utilizar Signal Inputs (`input()`) en combinación con la configuración actual del proyecto. Para resolverlo y asegurar la carga correcta de datos:
1.  Se migraron los inputs de `input()` a `@Input()` clásicos con decoradores.
2.  Para mantener la reactividad (ya que `effect()` no rastrea propiedades normales), se implementaron **setters** para la propiedad `cursoId`. Esto garantiza que el método `cargarAlumnos()` se ejecute automáticamente cada vez que el padre cambia el valor del curso seleccionado.
3.  Se actualizaron las plantillas HTML para acceder a las propiedades sin paréntesis, eliminando los errores de binding.
