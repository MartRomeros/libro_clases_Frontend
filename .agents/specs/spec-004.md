- genera un action en `.github/workflows/`
- debe ejecutarse cada vez ante un pull request a la rama master
- debe realizar un buildeo de la aplicacion. si da error debe detener
su ejecución y detener el pull request.
- si el buildeo es exitoso debe generar el pull requests a la rama master

---

## Resultados de la Ejecución (Spec-004)

**Acciones realizadas:**
1. **Creación del workflow de CI:** Se configuró el archivo `.github/workflows/ci.yml`.
2. **Configuración de Disparadores:** El workflow se configuró para ejecutarse ante un `pull_request` dirigido a la rama `master`. Esto asegura que cualquier código propuesto sea validado antes de ser aceptado.
3. **Paso de Buildeo:** Se configuró el job para utilizar `Node.js 20`, instalar dependencias mediante `npm ci` y ejecutar `npm run build`.
4. **Validación de Integridad:** Si el comando `npm run build` falla, el status check de GitHub marcará el PR como fallido, impidiendo o advirtiendo sobre el merge.

**Justificación:**
- Se ajustó el disparador a `pull_request` siguiendo la solicitud del usuario de realizar el PR de forma manual.
- El Action ahora actúa como un guardián de calidad (build check) que garantiza que la rama principal (`master`) siempre contenga código que compile correctamente.