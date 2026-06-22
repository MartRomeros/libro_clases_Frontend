# Implementation Plan: webpay-matricula-pago

## Overview

Integración del flujo de pago WebPay (Transbank) en el proceso de matrícula. La implementación se divide en dos bloques principales: modificar `MatriculasComponent` para iniciar el pago, y reimplementar `WebpayReturnComponent` para procesar el retorno de Transbank con los cuatro estados posibles (loading, success, error, cancelled).

El diseño usa TypeScript/Angular 21 con Angular Material y TailwindCSS.

---

## Tasks

- [ ] 1. Definir interfaces y tipos compartidos
  - [ ] 1.1 Crear el archivo de interfaces para el flujo WebPay
    - Crear `src/app/features/matriculas/webpay.interfaces.ts`
    - Definir `MatriculaFormData` con campos: `nombreAlumno`, `apellidosAlumno`, `rutAlumno`, `curso` (number), `nombreApoderado`, `rutApoderado`
    - Definir `GrabarMatriculaPayload` que extiende `MatriculaFormData` agregando `token_ws: string`
    - Definir el tipo union `ReturnState = 'loading' | 'success' | 'error' | 'cancelled'`
    - Definir `MatriculaResumen` con campos: `nombreAlumno`, `apellidosAlumno`, `rutAlumno`, `cursoNombre`
    - _Requirements: 2.1, 2.2_

- [ ] 2. Modificar `MatriculasComponent` — método `grabar()` y template del botón
  - [ ] 2.1 Actualizar `matriculas.ts` con la nueva lógica de `grabar()`
    - Importar `MatSnackBar` desde `@angular/material/snack-bar` e inyectarlo en el constructor/inject
    - Agregar la propiedad `isInitiatingPayment = false`
    - Reemplazar el método `grabar()` con la versión async que:
      - Valida formulario y cupos antes de proceder (`markAllAsTouched()` y retorno anticipado si inválido)
      - Serializa `this.matriculaForm.value` en `sessionStorage['matriculaFormData']` con `JSON.stringify`
      - Construye `returnUrl = window.location.origin + '/webpay-return'`
      - Llama a `this.adminApi.iniciarPagoWebpay(1000, returnUrl)` con `await`
      - Abre `window.open(url, '_blank')` si la llamada es exitosa
      - Captura errores con `catch` y muestra `MatSnackBar` con mensaje de error (duration 5000ms, panelClass `['snack-error']`)
      - Restablece `isInitiatingPayment = false` en el bloque `finally`
    - _Requirements: 1.1, 1.2, 1.3, 1.4_

  - [ ] 2.2 Actualizar `matriculas.html` — botón de submit
    - Localizar el botón `<button mat-flat-button type="submit">` existente
    - Agregar al binding `[disabled]` la condición `|| isInitiatingPayment`
    - Reemplazar el contenido estático del botón por control flow `@if (isInitiatingPayment)` que muestra `<mat-icon class="animate-spin mr-2">refresh</mat-icon> Iniciando pago...` y `@else` que muestra `Grabar Matrícula`
    - Importar `MatProgressSpinnerModule` en los imports del componente si no está presente
    - _Requirements: 1.3, 1.5_

  - [ ]* 2.3 Escribir prueba de propiedad — Serialización de datos del formulario
    - **Property 1: Serialización de datos del formulario antes del pago**
    - Para cualquier conjunto de datos válidos en el formulario, verificar que tras invocar `grabar()`, `sessionStorage['matriculaFormData']` contiene exactamente los datos del formulario serializados como JSON
    - **Validates: Requirements 1.1**

  - [ ]* 2.4 Escribir prueba de propiedad — Botón deshabilitado con formulario inválido
    - **Property 2: Botón deshabilitado con formulario inválido o sin cupos**
    - Para cualquier combinación de campos inválidos o `cuposDisponibles` <= 0 / null, verificar que el botón está `disabled` y que `grabar()` no se invoca
    - **Validates: Requirements 1.5**

- [ ] 3. Checkpoint — Verificar flujo de inicio de pago
  - Asegurar que todos los tests pasen y que el botón del formulario se comporte correctamente. Consultar al usuario si surgen dudas.

- [ ] 4. Implementar `WebpayReturnComponent` — lógica TypeScript
  - [ ] 4.1 Crear `webpay-return.component.ts` con la clase completa
    - Crear el archivo `src/app/features/matriculas/webpay-return.component.ts`
    - Importar y marcar el componente como `standalone: true` con los imports: `CommonModule`, `RouterLink`, `MatButtonModule`, `MatIconModule`, `MatProgressSpinnerModule`, más los componentes `Navbar` y `Footer` del sistema
    - Inyectar `ActivatedRoute`, `Router` y `AdminApi`
    - Declarar propiedades: `state: ReturnState = 'loading'`, `errorMessage = ''`, `resumen: MatriculaResumen | null = null`
    - Implementar `ngOnInit()` async con la lógica de determinación de estado:
      1. Leer query params con `this.route.snapshot.queryParams`
      2. Si contiene `TBK_TOKEN` → `state = 'cancelled'`, `cleanupSession()`, retornar
      3. Si no contiene `token_ws` → `state = 'error'`, `errorMessage = 'No se recibió token de pago válido'`, `cleanupSession()`, retornar
      4. Leer `sessionStorage.getItem('matriculaFormData')`; si nulo/vacío → `state = 'error'`, `errorMessage = 'No se encontraron datos de matrícula'`, `cleanupSession()`, retornar
      5. Construir payload: `{ ...JSON.parse(formDataStr), token_ws }`
      6. Llamar `await this.adminApi.grabarMatricula(payload)`: éxito → `state = 'success'`, poblar `resumen`, `cleanupSession()`; error → `state = 'error'`, `errorMessage = 'Hubo un problema al registrar la matrícula'`, `cleanupSession()`
    - Implementar `cleanupSession()`: `sessionStorage.removeItem('matriculaFormData')`
    - Implementar `navigateHome()` y `navigateToMatriculas()`
    - _Requirements: 2.1, 3.1, 3.4, 3.5, 4.1_

  - [ ]* 4.2 Escribir prueba de propiedad — Payload combina formData y token_ws
    - **Property 3: Payload de grabarMatricula combina formData y token_ws**
    - Para cualquier `formData` en `sessionStorage` y cualquier `token_ws`, verificar que `AdminApi.grabarMatricula` recibe exactamente `{ ...formData, token_ws }` sin campos extras ni faltantes
    - **Validates: Requirements 2.1**

  - [ ]* 4.3 Escribir prueba de propiedad — TBK_TOKEN produce Estado Cancelación
    - **Property 5: TBK_TOKEN produce Estado Cancelación sin llamar al backend**
    - Para cualquier valor de `TBK_TOKEN` en query params (con o sin `token_ws`), verificar que `state === 'cancelled'` y que `AdminApi.grabarMatricula` nunca es invocado
    - **Validates: Requirements 4.1**

  - [ ]* 4.4 Escribir prueba de propiedad — Error HTTP produce Estado Error
    - **Property 6: Error HTTP en grabarMatricula produce Estado Error**
    - Para cualquier código 4xx o 5xx retornado por `AdminApi.grabarMatricula`, verificar que `state === 'error'` y que `sessionStorage.getItem('matriculaFormData')` retorna `null`
    - **Validates: Requirements 3.1, 3.3**

  - [ ]* 4.5 Escribir prueba de propiedad — sessionStorage limpio en todos los estados finales
    - **Property 8: sessionStorage se limpia en todos los estados finales**
    - Para cualquier combinación de query params que lleve a success, error o cancelled, verificar que `sessionStorage.getItem('matriculaFormData')` retorna `null` al finalizar
    - **Validates: Requirements 2.3, 3.3, 4.4**

- [ ] 5. Implementar `webpay-return.component.html` — template de los cuatro estados
  - [ ] 5.1 Crear el template HTML del componente de retorno
    - Crear `src/app/features/matriculas/webpay-return.component.html`
    - Estructurar el template con `<app-navbar>`, `<section>` centrada y `<app-footer>`
    - Implementar el bloque `@if (state === 'loading')`: spinner `<mat-spinner diameter="56">` con texto "Procesando resultado del pago..."
    - Implementar el bloque `@if (state === 'success')`: icono `check_circle` con fondo `bg-emerald-100`, título "¡Matrícula Registrada!", resumen de datos del alumno en bloque `@if (resumen)`, botón "Ir al Inicio" con `routerLink="/"`
    - Implementar el bloque `@if (state === 'error')`: icono `error_outline` con fondo `bg-rose-100`, título "Error al Registrar", `{{ errorMessage }}`, botón "Reintentar" con `routerLink="/matriculas"`
    - Implementar el bloque `@if (state === 'cancelled')`: icono `cancel` con fondo `bg-amber-100`, título "Pago Cancelado", mensaje fijo, botón "Reintentar" con `routerLink="/matriculas"`
    - Aplicar clases TailwindCSS y estilos Angular Material consistentes con el diseño del sistema (fondo `from-[#001e40] to-[#004080]`, tarjetas `rounded-4xl shadow-2xl`)
    - _Requirements: 2.2, 2.4, 3.2, 4.2, 4.3, 5.1, 5.2, 5.3, 5.4, 5.5_

  - [ ]* 5.2 Escribir prueba de propiedad — Estado Éxito muestra todos los campos del resumen
    - **Property 4: Estado Éxito muestra todos los campos del resumen**
    - Para cualquier payload exitoso de `grabarMatricula`, verificar que el DOM en `state === 'success'` contiene `nombreAlumno`, `apellidosAlumno`, `rutAlumno` y el nombre del curso
    - **Validates: Requirements 2.2**

  - [ ]* 5.3 Escribir prueba de propiedad — Spinner y estado final son mutuamente excluyentes
    - **Property 7: Spinner y estado final son mutuamente excluyentes**
    - Para cualquiera de los tres estados finales, verificar que `state !== 'loading'` y que `mat-spinner` no está presente en el DOM junto con el contenido del estado final
    - **Validates: Requirements 5.4**

- [ ] 6. Checkpoint — Verificar componente de retorno completo
  - Asegurar que todos los tests pasen, que los cuatro estados renderizan correctamente y que el sessionStorage se limpia en todos los casos. Consultar al usuario si surgen dudas.

- [ ] 7. Integración final y verificación del enrutamiento
  - [ ] 7.1 Verificar y ajustar `app.routes.ts`
    - Confirmar que la ruta `/webpay-return` apunta a `WebpayReturnComponent` con lazy loading
    - Si la importación apunta a una ruta incorrecta o a un componente anterior, actualizar el path del import al nuevo archivo `./features/matriculas/webpay-return.component`
    - _Requirements: 2.1, 3.1, 4.1_

  - [ ]* 7.2 Escribir tests de integración para el flujo completo
    - Verificar el flujo end-to-end desde `grabar()` (serialización en sessionStorage) hasta `WebpayReturnComponent` procesando los tres escenarios principales (success, error, cancelled)
    - _Requirements: 1.1, 1.2, 1.3, 2.1, 2.2, 3.1, 4.1_

- [ ] 8. Checkpoint final — Verificación completa
  - Asegurar que todos los tests pasen y que el flujo completo de WebPay funciona end-to-end en ambiente de pruebas. Consultar al usuario si surgen dudas.

---

## Notes

- Las tareas marcadas con `*` son opcionales y pueden omitirse para un MVP más rápido
- Cada tarea referencia los requisitos específicos para trazabilidad
- Los checkpoints garantizan validación incremental del trabajo
- El diseño ya confirma que `AdminApi` no requiere cambios: los métodos `iniciarPagoWebpay` y `grabarMatricula` ya existen
- La corrección clave del diseño: reemplazar `window.location.search` por `ActivatedRoute.snapshot.queryParams` en el componente de retorno
- Las 8 propiedades de corrección del diseño se distribuyen en sub-tareas opcionales cercanas a su implementación para detectar errores temprano

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["2.1", "4.1"] },
    { "id": 2, "tasks": ["2.2", "2.3", "2.4", "4.2", "4.3", "4.4", "4.5"] },
    { "id": 3, "tasks": ["5.1"] },
    { "id": 4, "tasks": ["5.2", "5.3", "7.1"] },
    { "id": 5, "tasks": ["7.2"] }
  ]
}
```
