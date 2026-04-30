- Crear un servicio para traer los cursos segun el docente que ingresa al sistema
- Como ya existe una variable de api endpoint se creo otra
- Deberia ser: apiAttendanceConductUrl/docentes/cursos
- Para obtener una response se debe enviar el jwt a esta api
- La response que devuelve si todo sale bien es:
ejemplo de response:
{
  "success": true,
  "docente_id": 2,
  "data": [
    {
      "curso_id": 1,
      "nivel": "1° Medio",
      "letra": "A",
      "anio_academico": 2024,
      "asignatura_id": 1,
      "asignatura_nombre": "Matemática",
      "asignatura_siglas": "MAT01",
      "cad_id": 1
    }
  ]
}

- Debes aplicarlo en el componente de attendance-conduct

### Resultados y Justificación

- **Rama creada**: `feature/spec-009`
- **Creación de Servicio**: Se creó `AttendanceConductService` en `src/app/features/attendance-conduct/services/attendance-conduct.service.ts` que utiliza `HttpClient` para realizar la petición `GET` a la ruta indicada en el endpoint guardado en `environment.apiAttendanceConductUrl/docentes/cursos`.
- **Inyección y uso de Servicio**: Se modificó `AttendanceConduct` para implementar `OnInit`, inyectar el nuevo servicio y cargar la lista de cursos asociados al docente en el signal `cursosDisponibles`. Al cargarlos, también se selecciona el primero por defecto.
- **Modificación de vista HTML**: Se ajustó el loop de `@for` en el `mat-select` de `attendance-conduct.html` para iterar sobre el signal `cursosDisponibles()` y mostrar las propiedades del objeto (`nivel`, `letra`, `asignatura_nombre`) e indexar por `curso.curso_id`. 
- **Manejo del JWT**: Se identificó que Angular ya cuenta con un `authInterceptor` global que incluye el header `Authorization: Bearer <token>` automáticamente en cada petición. Por lo tanto, no se requirió enviar el token de forma manual en el nuevo servicio.
