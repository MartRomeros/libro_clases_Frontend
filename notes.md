# Prompts para el SDD

## Validacion de spec:

```md
Lee /specs/login-with-google/spec.md y revisa si falta información antes de implementar.

No escribas código todavía.

Devuélveme:
1. Preguntas abiertas
2. Riesgos técnicos
3. Supuestos que estás haciendo
4. Casos borde faltantes
5. Cambios sugeridos a la spec
```

## Creacion del design.md:

```
A partir de /specs/login-with-google/spec.md, crea /specs/login-with-google/design.md.

Incluye:
- Archivos que probablemente se modificarán
- Arquitectura propuesta
- Flujo de datos
- Cambios en base de datos, si aplica
- Dependencias nuevas, si aplica
- Riesgos
- Estrategia de testing

No implementes código todavía.
```
# Generar tareas pequenas:

```md
A partir de spec.md y design.md, crea /specs/login-with-google/tasks.md.

Divide la implementación en tareas pequeñas, revisables y en orden.

Cada tarea debe incluir:
- Objetivo
- Archivos esperados
- Tests requeridos
- Criterio de finalización
```

Ejemplo de task.md:

```md
# Tasks: Login with Google

## Task 1: Configurar variables de entorno
- Agregar GOOGLE_CLIENT_ID
- Agregar GOOGLE_CLIENT_SECRET
- Documentar en .env.example

## Task 2: Crear servicio OAuth
- Crear servicio para validar respuesta de Google
- Manejar email no verificado
- Agregar tests unitarios

## Task 3: Crear endpoint callback
- Procesar respuesta OAuth
- Crear o vincular usuario
- Crear sesión

## Task 4: Agregar botón en frontend
- Mostrar botón en login
- Redirigir a flujo OAuth

## Task 5: Validación final
- Ejecutar npm run build
- Ejecutar npm test
- Revisar que no haya cambios fuera de alcance
```

