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
