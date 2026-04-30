Este spec se dividira en 2 partes:

**Primera Parte**
- Genera la logica para que al registrar la asistencia haga un console.log sobre los alumnos registrados
- Usar reactive forms module cuando sea necesario. la fecha a enviar debe estar en formato ISO YYYY-MM-DD
- El resultado a mostrar debe ser el siguiente (el formato es de ejemplo):

```
1 {
2   "cad_id": 1,
3   "fecha": "2026-05-01",
4   "asistencias": [
5     {
6       "estudiante_id": 4,
7       "estado": "Presente",
8       "tipo_asistencia": "Presencial"
9     },
10     {
11       "estudiante_id": 5,
12       "estado": "Ausente",
13       "tipo_asistencia": "Presencial"
14     },
15     {
16       "estudiante_id": 13,
17       "estado": "Tardanza",
18       "tipo_asistencia": "Presencial"
19     }
20   ]
21 }
```
**Segunda Parte**
- Crear el servicio para que registre la asistencia a la base de datos
- El endpoint es POST el json a enviar es el mismo esquema que se dejo en este spec. /asistencia
- Antes de registrarla con un mat dialog o un mat alert indicar si realmente desea registrar la asistencia.
este es el mensaje que se envia tras la creacion de la asistencia:

{
  "success": true,
  "message": "Asistencia registrada correctamente"
}


## Resultados
- Se implementó la lógica en el componente `app-attendance`.
- Se generó el formato de JSON requerido, extrayendo los IDs de estudiantes y el estado de la asistencia.
- La fecha fue formateada al estándar ISO `YYYY-MM-DD` extrayéndola del `@Input() fecha`.
- No fue necesario usar `ReactiveFormsModule` ya que el estado se estaba manejando óptimamente con Angular Signals, lo que hace el código más reactivo y sin la verbosidad de los formularios reactivos para este caso particular.
- Se creó la rama `spec-011`.

## Resultados (Segunda Parte)
- Se añadieron las interfaces `AsistenciaPayload`, `AsistenciaDetalle` y `RegistroAsistenciaResponse` en `AttendanceConductService`.
- Se implementó el método `registrarAsistencia` en el servicio que hace la petición POST a `/asistencia`.
- Se integró `MatDialog` y se creó un componente inline `ConfirmDialogComponent` para pedir confirmación antes de enviar los datos al backend.
- Se actualizó el método `guardarAsistencia` en `app-attendance` para que muestre el diálogo de confirmación, y si el usuario acepta, llama al servicio y muestra el mensaje de éxito usando el `MatSnackBar`.
