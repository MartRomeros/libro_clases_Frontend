# Design Document — webpay-matricula-pago

## Overview

Esta funcionalidad extiende el componente `Matriculas` existente y reimplementa `WebpayReturnComponent` para integrar un flujo de pago WebPay (Transbank) completo dentro de la aplicación Angular 21.

El flujo se divide en dos etapas separadas por una redirección externa al portal de Transbank:

1. **Etapa 1 — Inicio del pago** (`MatriculasComponent`): el usuario completa el formulario, los datos se persisten en `sessionStorage` y se abre la URL de Transbank en una nueva pestaña.
2. **Etapa 2 — Retorno del pago** (`WebpayReturnComponent`): Transbank redirige al usuario a `/webpay-return` con parámetros que determinan el resultado (éxito, cancelación o ausencia de token). El componente procesa el resultado y muestra el estado correspondiente.

El servicio `AdminApi` ya expone los dos endpoints necesarios (`iniciarPagoWebpay` y `grabarMatricula`) y no requiere modificaciones.

---

## Architecture

```
Usuario
  │
  │  1. Llena formulario y presiona "Grabar Matrícula"
  ▼
MatriculasComponent (src/app/features/matriculas/matriculas.ts)
  │  – Valida formulario (ReactiveForm)
  │  – Serializa datos en sessionStorage['matriculaFormData']
  │  – Llama AdminApi.iniciarPagoWebpay(1000, returnUrl)
  │  – Abre window.open(url, '_blank')
  │
  │  2. Nueva pestaña → Portal de Transbank (externo)
  │     El usuario paga / cancela
  │
  │  3. Transbank redirige la pestaña original a /webpay-return?token_ws=... ó ?TBK_TOKEN=...
  ▼
WebpayReturnComponent (src/app/features/matriculas/webpay-return.component.ts)
  │  – Lee query params con ActivatedRoute
  │  – Determina estado: éxito | cancelación | error
  │  – Si éxito → AdminApi.grabarMatricula(payload)
  │  – Limpia sessionStorage en todos los casos
  │  – Renderiza vista de estado final
  ▼
AdminApi (src/app/features/admin/data-access/admin.api.ts)  [sin cambios]
  │
  ▼
API Gateway → MsMatriculas (backend)
```

---

## Components

### 1. `MatriculasComponent` — cambios al método `grabar()`

El componente ya existe. Solo se modifica el método `grabar()` para:

- Manejar el error de `iniciarPagoWebpay` con un `MatSnackBar` en lugar de `alert()`.
- Mostrar un indicador de carga (botón en estado "loading") mientras se espera la respuesta del backend.

**Archivo:** `src/app/features/matriculas/matriculas.ts`

**Propiedades adicionales necesarias:**

```typescript
isInitiatingPayment = false; // controla el estado de carga del botón
```

**Método `grabar()` actualizado:**

```typescript
async grabar() {
  if (this.matriculaForm.invalid || !this.cuposDisponibles || this.cuposDisponibles <= 0) {
    this.matriculaForm.markAllAsTouched();
    return;
  }

  this.isInitiatingPayment = true;

  const formData = this.matriculaForm.value;
  sessionStorage.setItem('matriculaFormData', JSON.stringify(formData));

  const amount = 1000;
  const returnUrl = `${window.location.origin}/webpay-return`;

  try {
    const { url } = await this.adminApi.iniciarPagoWebpay(amount, returnUrl);
    window.open(url, '_blank');
  } catch (error) {
    console.error('Error al iniciar pago Webpay:', error);
    this.snackBar.open(
      'No se pudo iniciar el proceso de pago. Intente nuevamente.',
      'Cerrar',
      { duration: 5000, panelClass: ['snack-error'] }
    );
  } finally {
    this.isInitiatingPayment = false;
  }
}
```

**Template — actualización del botón de submit:**

```html
<button mat-flat-button type="submit"
  [disabled]="!matriculaForm.valid || cuposDisponibles === null || cuposDisponibles <= 0 || isInitiatingPayment"
  class="flex-1! py-6! bg-[#2dbcfe]! text-[#001e40]! disabled:bg-gray-100! disabled:text-gray-400! rounded-full! font-bold! tracking-wide shadow-md hover:shadow-lg transition-all">
  @if (isInitiatingPayment) {
    <mat-icon class="animate-spin mr-2">refresh</mat-icon>
    Iniciando pago...
  } @else {
    Grabar Matrícula
  }
</button>
```

---

### 2. `WebpayReturnComponent` — reimplementación completa

**Archivo:** `src/app/features/matriculas/webpay-return.component.ts`

#### Estado interno

```typescript
type ReturnState = 'loading' | 'success' | 'error' | 'cancelled';

interface MatriculaResumen {
  nombreAlumno: string;
  apellidosAlumno: string;
  rutAlumno: string;
  cursoNombre: string;
}
```

#### Lógica de inicialización (ngOnInit)

```
1. estado = 'loading'
2. Leer query params con ActivatedRoute (NO con window.location)
3. SI contiene TBK_TOKEN → estado = 'cancelled', limpiar sessionStorage, FIN
4. SI NO contiene token_ws → estado = 'error', mensaje = 'No se recibió token de pago válido', limpiar sessionStorage, FIN
5. Leer sessionStorage['matriculaFormData']
6. SI nulo o vacío → estado = 'error', mensaje = 'No se encontraron datos de matrícula', limpiar sessionStorage, FIN
7. Construir payload = { ...formData, token_ws }
8. Llamar AdminApi.grabarMatricula(payload)
   - Éxito → estado = 'success', construir MatriculaResumen, limpiar sessionStorage
   - Error → estado = 'error', mensaje = 'Hubo un problema al registrar la matrícula', limpiar sessionStorage
```

#### Propiedades del componente

```typescript
state: ReturnState = 'loading';
errorMessage = '';
resumen: MatriculaResumen | null = null;
```

#### Clase completa (estructura)

```typescript
@Component({
  selector: 'app-webpay-return',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    Navbar,
    Footer
  ],
  templateUrl: './webpay-return.component.html',
})
export class WebpayReturnComponent implements OnInit {
  private route = inject(ActivatedRoute);   // <- usar ActivatedRoute, no window.location
  private router = inject(Router);
  private adminApi = inject(AdminApi);

  state: ReturnState = 'loading';
  errorMessage = '';
  resumen: MatriculaResumen | null = null;

  async ngOnInit() { /* lógica descrita arriba */ }

  private cleanupSession() {
    sessionStorage.removeItem('matriculaFormData');
  }

  navigateHome() { this.router.navigate(['/']); }
  navigateToMatriculas() { this.router.navigate(['/matriculas']); }
}
```

---

## Interfaces y Modelos de Datos

### `MatriculaFormData` (datos guardados en sessionStorage)

```typescript
interface MatriculaFormData {
  nombreAlumno: string;
  apellidosAlumno: string;
  rutAlumno: string;
  curso: number;           // cursoId
  nombreApoderado: string;
  rutApoderado: string;
}
```

### `GrabarMatriculaPayload` (payload enviado al backend)

```typescript
interface GrabarMatriculaPayload extends MatriculaFormData {
  token_ws: string;
}
```

### `WebpayCreateResponse` (ya tipado en AdminApi)

```typescript
interface WebpayCreateResponse {
  url: string;
  token: string;
}
```

---

## Template del `WebpayReturnComponent`

El template implementa cuatro estados mutuamente excluyentes con Angular control flow (`@if`):

```html
<app-navbar>
  <section class="min-h-[calc(100vh-64px)] flex items-center justify-center
                   bg-gradient-to-br from-[#001e40] to-[#004080] py-20 px-4">

    <!-- ESTADO: CARGANDO -->
    @if (state === 'loading') {
      <div class="flex flex-col items-center gap-6 text-white">
        <mat-spinner diameter="56"></mat-spinner>
        <p class="text-lg font-semibold">Procesando resultado del pago...</p>
      </div>
    }

    <!-- ESTADO: ÉXITO -->
    @if (state === 'success') {
      <div class="bg-white rounded-4xl shadow-2xl p-10 max-w-md w-full text-center">
        <div class="flex justify-center mb-4">
          <span class="bg-emerald-100 rounded-full p-4">
            <mat-icon class="text-emerald-600 text-5xl! w-12! h-12!">check_circle</mat-icon>
          </span>
        </div>
        <h2 class="text-2xl font-extrabold text-[#001e40] mb-2">¡Matrícula Registrada!</h2>
        <p class="text-gray-500 mb-6 text-sm">El pago fue procesado y la matrícula quedó registrada exitosamente.</p>
        @if (resumen) {
          <div class="text-left bg-gray-50 rounded-2xl p-4 mb-6 space-y-2 text-sm">
            <div class="flex justify-between">
              <span class="text-gray-500">Alumno</span>
              <span class="font-semibold text-[#001e40]">{{ resumen.nombreAlumno }} {{ resumen.apellidosAlumno }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500">RUT</span>
              <span class="font-semibold text-[#001e40]">{{ resumen.rutAlumno }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500">Curso</span>
              <span class="font-semibold text-[#001e40]">{{ resumen.cursoNombre }}</span>
            </div>
          </div>
        }
        <button mat-flat-button routerLink="/"
          class="w-full py-4! rounded-full! bg-[#2dbcfe]! text-[#001e40]! font-bold!">
          Ir al Inicio
        </button>
      </div>
    }

    <!-- ESTADO: ERROR -->
    @if (state === 'error') {
      <div class="bg-white rounded-4xl shadow-2xl p-10 max-w-md w-full text-center">
        <div class="flex justify-center mb-4">
          <span class="bg-rose-100 rounded-full p-4">
            <mat-icon class="text-rose-600 text-5xl! w-12! h-12!">error_outline</mat-icon>
          </span>
        </div>
        <h2 class="text-2xl font-extrabold text-[#001e40] mb-2">Error al Registrar</h2>
        <p class="text-gray-500 mb-6 text-sm">{{ errorMessage }}</p>
        <button mat-flat-button routerLink="/matriculas"
          class="w-full py-4! rounded-full! bg-rose-500! text-white! font-bold!">
          Reintentar
        </button>
      </div>
    }

    <!-- ESTADO: CANCELACIÓN -->
    @if (state === 'cancelled') {
      <div class="bg-white rounded-4xl shadow-2xl p-10 max-w-md w-full text-center">
        <div class="flex justify-center mb-4">
          <span class="bg-amber-100 rounded-full p-4">
            <mat-icon class="text-amber-500 text-5xl! w-12! h-12!">cancel</mat-icon>
          </span>
        </div>
        <h2 class="text-2xl font-extrabold text-[#001e40] mb-2">Pago Cancelado</h2>
        <p class="text-gray-500 mb-6 text-sm">Cancelaste el pago en el portal de WebPay. Puedes reintentar cuando quieras.</p>
        <button mat-flat-button routerLink="/matriculas"
          class="w-full py-4! rounded-full! bg-amber-400! text-[#001e40]! font-bold!">
          Reintentar
        </button>
      </div>
    }

  </section>
  <app-footer></app-footer>
</app-navbar>
```

---

## Components and Interfaces

### Componentes modificados

| Componente | Archivo | Tipo de cambio |
|---|---|---|
| `MatriculasComponent` | `src/app/features/matriculas/matriculas.ts` | Modificación — nuevo método `grabar()` async |
| `MatriculasComponent` template | `src/app/features/matriculas/matriculas.html` | Modificación — botón con estado de carga |
| `WebpayReturnComponent` | `src/app/features/matriculas/webpay-return.component.ts` | Reimplementación completa |
| `WebpayReturnComponent` template | `src/app/features/matriculas/webpay-return.component.html` | Reimplementación completa |

### Interfaces expuestas

```typescript
// src/app/features/matriculas/webpay.interfaces.ts
export interface MatriculaFormData { ... }
export interface GrabarMatriculaPayload extends MatriculaFormData { token_ws: string; }
export type ReturnState = 'loading' | 'success' | 'error' | 'cancelled';
export interface MatriculaResumen { ... }
```

---

## Data Models

### `MatriculaFormData`

```typescript
interface MatriculaFormData {
  nombreAlumno: string;
  apellidosAlumno: string;
  rutAlumno: string;
  curso: number;           // cursoId
  nombreApoderado: string;
  rutApoderado: string;
}
```

### `GrabarMatriculaPayload`

```typescript
interface GrabarMatriculaPayload extends MatriculaFormData {
  token_ws: string;
}
```

### `MatriculaResumen`

```typescript
interface MatriculaResumen {
  nombreAlumno: string;
  apellidosAlumno: string;
  rutAlumno: string;
  cursoNombre: string;
}
```

### `WebpayCreateResponse` (ya tipado en AdminApi)

```typescript
interface WebpayCreateResponse {
  url: string;
  token: string;
}
```

---

## Error Handling

| Escenario | Componente | Comportamiento |
|---|---|---|
| `iniciarPagoWebpay` falla (red/servidor) | `MatriculasComponent` | `MatSnackBar` con mensaje de error, formulario preservado, `isInitiatingPayment = false` |
| Retorno sin `token_ws` ni `TBK_TOKEN` | `WebpayReturnComponent` | Estado Error, mensaje "No se recibió token de pago válido" |
| Retorno con `TBK_TOKEN` | `WebpayReturnComponent` | Estado Cancelación (sin llamar al backend) |
| `sessionStorage` vacío con `token_ws` | `WebpayReturnComponent` | Estado Error, mensaje "No se encontraron datos de matrícula" |
| `grabarMatricula` falla 4xx/5xx | `WebpayReturnComponent` | Estado Error, mensaje "Hubo un problema al registrar la matrícula" |

En todos los casos de error o cancelación `sessionStorage['matriculaFormData']` se elimina mediante `cleanupSession()`.

---

## Testing Strategy

Las pruebas se centran en las 8 propiedades de corrección definidas en este documento. Cada propiedad se implementa como una sub-tarea opcional en `tasks.md`.

- **Unit tests** para `WebpayReturnComponent`: mock de `ActivatedRoute`, `AdminApi` y `sessionStorage`; verificar transiciones de estado para cada combinación de query params.
- **Unit tests** para `MatriculasComponent`: verificar serialización en sessionStorage, estado del botón y llamada a `iniciarPagoWebpay`.
- **Integration tests** (tarea 7.2): flujo completo `grabar()` → sessionStorage → retorno con los tres escenarios (success, error, cancelled).

---

## Routing

La ruta `/webpay-return` ya está registrada en `app.routes.ts`:

```typescript
{
  path: 'webpay-return',
  loadComponent: () =>
    import('./features/matriculas/webpay-return.component').then(m => m.WebpayReturnComponent)
}
```

No se requieren cambios en el enrutamiento.

---

## Corrección clave respecto a la implementación actual

La implementación actual de `WebpayReturnComponent` usa `window.location.search` para leer los query params. El diseño reemplaza esto con `ActivatedRoute.queryParams` o `ActivatedRoute.snapshot.queryParams`, que es la forma correcta en Angular y permite la inyección de mocks en tests.

```typescript
// ❌ Actual (difícil de testear)
const params = new URLSearchParams(window.location.search);
const tokenWs = params.get('token_ws');

// ✅ Diseñado (testeable con Angular TestBed)
const params = this.route.snapshot.queryParams;
const tokenWs = params['token_ws'];
const tbkToken = params['TBK_TOKEN'];
```

---

## Correctness Properties

*Una propiedad es una característica o comportamiento que debe cumplirse en todas las ejecuciones válidas del sistema — esencialmente, una afirmación formal sobre lo que el sistema debe hacer. Las propiedades sirven como puente entre las especificaciones legibles por humanos y las garantías de corrección verificables automáticamente.*

### Property 1: Serialización de datos del formulario antes del pago

*Para cualquier* conjunto de datos de formulario válidos (nombreAlumno, apellidosAlumno, rutAlumno, curso, nombreApoderado, rutApoderado), después de invocar `grabar()`, `sessionStorage['matriculaFormData']` debe contener una cadena JSON que al deserializar produzca un objeto equivalente a los datos del formulario originales.

**Validates: Requirements 1.1**

---

### Property 2: Botón deshabilitado con formulario inválido o sin cupos

*Para cualquier* combinación de campos del formulario que resulte en un formulario inválido (campo requerido vacío) o cuando `cuposDisponibles` sea `null`, `0` o negativo, el botón "Grabar Matrícula" debe estar deshabilitado y el método `grabar()` no debe ser invocado.

**Validates: Requirements 1.5**

---

### Property 3: Payload de grabarMatricula combina formData y token_ws

*Para cualquier* objeto `formData` almacenado en `sessionStorage` y cualquier valor de `token_ws` recibido como query param, la llamada a `AdminApi.grabarMatricula` debe recibir exactamente `{ ...formData, token_ws }` como payload — sin campos añadidos ni eliminados.

**Validates: Requirements 2.1**

---

### Property 4: Estado Éxito muestra todos los campos del resumen

*Para cualquier* payload de matrícula que produzca una respuesta exitosa de `grabarMatricula`, el DOM en Estado Éxito debe contener el `nombreAlumno`, `apellidosAlumno`, `rutAlumno` y el nombre del curso correspondiente al `cursoId` del formulario.

**Validates: Requirements 2.2**

---

### Property 5: TBK_TOKEN produce Estado Cancelación sin llamar al backend

*Para cualquier* valor de `TBK_TOKEN` presente en los query params (independientemente de si `token_ws` también está presente), `WebpayReturnComponent` debe entrar en Estado Cancelación y `AdminApi.grabarMatricula` no debe ser invocado en ningún momento durante el ciclo de vida del componente.

**Validates: Requirements 4.1**

---

### Property 6: Error HTTP en grabarMatricula produce Estado Error

*Para cualquier* código de error HTTP (4xx o 5xx) retornado por `AdminApi.grabarMatricula`, `WebpayReturnComponent` debe entrar en Estado Error mostrando un mensaje descriptivo, y el `sessionStorage` debe quedar limpio.

**Validates: Requirements 3.1, 3.3**

---

### Property 7: Spinner y estado final son mutuamente excluyentes

*Para cualquiera* de los tres estados finales (`success`, `error`, `cancelled`), la propiedad `state` debe ser diferente de `'loading'` y el spinner de `MatProgressSpinner` no debe estar presente en el DOM simultáneamente con el contenido del estado final.

**Validates: Requirements 5.4**

---

### Property 8: sessionStorage se limpia en todos los estados finales

*Para cualquier* combinación de query params que lleve al componente a un estado final (éxito, error o cancelación), `sessionStorage.getItem('matriculaFormData')` debe retornar `null` una vez que el componente termine de procesar la respuesta.

**Validates: Requirements 2.3, 3.3, 4.4**
