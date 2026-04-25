Este proyecto consiste en la vista de usuario para el libro de clases.
Sirve para apoyar a los 4 microservicios a realizar los cuales son:

- MS Gestion escolar (Java Springboot)
- MS Autenticacion y autorizacion (Node JS + Express)
- MS Asistencia y conducta (Node JS + Express)
- MS Mensajeria (Node JS + Express)

Ademas este proyecto sera subido a un AWS S3 en. Tener en cuenta que se trata de
un AWS Academy.

Base de datos:
- Local: PostgreSQL
- Remota: AWS RDS Postgre + DynamoDB Para la mensajeria. Ademas se pretende
utilizar SQS para la cola de notificaciones y mensajes.

MER de base de datos: `.gemini/context/script.sql.md`

## Limites

- En este proyecto no se consideraran tests. solo desarrollo y el codigo final
- Si se requieren instalar dependencias se debe preguntar antes de instalarlas.
- antes de cualquier implementacion revisar specs anteriores y el `contexto/`
- al terminar un spec se debe dejar abajo de este los resultados y su justificacion.