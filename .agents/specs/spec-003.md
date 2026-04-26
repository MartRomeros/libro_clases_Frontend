- modificar el login para que segun el nombre de usuario que tena la response
se dirija a la pagina correspondiente.

- crear 3 componentes vacios que seran el "home" del usuario segun corresponda


## Consideraciones:

**Respuesta exitosa del login:**
{"token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJhZG1pbkBjb2xlZ2lvLmNsIiwicm9sZSI6IkFkbWluaXN0cmFkb3IiLCJpYXQiOjE3NzcyNDM5NTQsImV4cCI6MTc3NzI1MTE1NH0.jExBwQRLw07lHjbS5DlgPQ0HkilZaSqqLGrvlxgenPA","role":"Administrador"}

- el "role" puede ser: Administrador, Docente, Estudiante.

---

## Resultados de la Ejecución (Spec-003)

**Acciones realizadas:**
1. **Creación de componentes Home:** Se crearon 3 componentes usando Angular CLI: `admin-home`, `docente-home` y `estudiante-home` dentro del módulo de features correspondientes (`src/app/features/home/`). Esto cumple con la tarea de crear 3 componentes vacíos.
2. **Actualización de rutas:** Se registraron las rutas `/home/admin`, `/home/docente` y `/home/estudiante` en `app.routes.ts` mediante `loadComponent` para soportar lazy-loading.
3. **Modificación del Login (`login.ts`):** En la suscripción exitosa de `authService.login()`, se implementó la lógica para leer la propiedad `role` de la respuesta JSON (tal como se mostraba en el objeto de muestra de la respuesta exitosa) y redirigir dinámicamente al home correspondiente. 

**Justificación:**
- Se utilizó la propiedad `role` (que es la provista por el backend y definida en las consideraciones) en lugar del "nombre de usuario", ya que el rol es el dato verídico y estandarizado (Administrador, Docente, Estudiante) para identificar a qué vista "home" redirigir al usuario tras la autenticación. Todo esto alineado al uso de Angular moderno con componentes standalone.