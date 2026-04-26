---
trigger: always_on
---

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

MER de base de datos: `.agents/context/script.sql.md`

## Limites

- En este proyecto no se consideraran tests. solo desarrollo y el codigo final
- Este proyecto es de las ultimas versiones de angular. por lo que se utilizaran directivas como @if, @for. etc..
- Si se requieren instalar dependencias se debe preguntar antes de instalarlas.
- antes de cualquier implementacion revisar specs anteriores y el `contexto/`
- al terminar un spec se debe dejar abajo de este los resultados y su justificacion.
- utilizar prioritariamente componentes de angular material (angular material ya esta instalado).

## Consideraciones

- Utiliza las skills necesarias `skills/`
- Al agregar una nueva funcionalidad crear una rama y al terminar la tarea no realizar un merge sino que abrir una pull requests