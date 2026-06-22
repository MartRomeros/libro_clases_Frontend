# Requirements Document

## Introduction

Esta funcionalidad integra el flujo de pago WebPay (Transbank) en el proceso de matrícula del sistema de Libro de Clases. Cuando el usuario envía el formulario de matrícula, los datos se persisten en `sessionStorage` y se inicia una transacción WebPay que se abre en una nueva pestaña del navegador. Al regresar a la ruta `/webpay-return`, el componente `WebpayReturnComponent` determina el resultado del pago —éxito, error o cancelación— y actúa en consecuencia: registra la matrícula en el backend en caso de éxito, o muestra el estado apropiado con opción de reintentar en caso de fallo o cancelación. El `sessionStorage` se limpia en todos los casos.

## Glossary

- **Formulario de Matrícula**: El formulario Angular reactivo del componente `Matriculas` que recopila los datos del alumno y del apoderado.
- **grabar()**: Método del componente `Matriculas` que persiste los datos del formulario en `sessionStorage` e inicia la transacción WebPay.
- **WebpayReturnComponent**: Componente Angular en la ruta `/webpay-return` que procesa la respuesta de Transbank y muestra el resultado al usuario.
- **token_ws**: Parámetro de query string enviado por Transbank al retornar exitosamente o con error de procesamiento interno.
- **TBK_TOKEN**: Parámetro de query string enviado por Transbank cuando el usuario cancela la transacción en el portal de pago.
- **sessionStorage**: Almacenamiento de sesión del navegador donde se guardan temporalmente los datos del formulario de matrícula durante el flujo de pago.
- **AdminApi**: Servicio Angular que encapsula las llamadas HTTP al API Gateway del backend; expone `iniciarPagoWebpay(amount, returnUrl)` y `grabarMatricula(payload)`.
- **MsMatriculas**: Microservicio backend responsable de registrar matrículas y gestionar la integración con Transbank.
- **Estado Éxito**: Estado final del componente `WebpayReturnComponent` cuando el pago se confirma y la matrícula se registra correctamente.
- **Estado Error**: Estado final del componente `WebpayReturnComponent` cuando el pago retorna con `token_ws` pero el registro de la matrícula falla.
- **Estado Cancelación**: Estado final del componente `WebpayReturnComponent` cuando Transbank retorna con `TBK_TOKEN` (usuario canceló el pago).
- **Monto Fijo**: Valor de $1.000 CLP utilizado como monto de la transacción WebPay durante sandbox/pruebas.

---

## Requirements

### Requirement 1: Persistencia de datos y apertura de WebPay

**User Story:** Como apoderado, quiero que al hacer clic en "Grabar Matrícula" se inicie el pago WebPay en una nueva pestaña, para poder completar el pago sin perder los datos del formulario que ya ingresé.

#### Acceptance Criteria

1. WHEN el usuario envía el formulario de matrícula con datos válidos y cupos disponibles mayores a cero, THE Formulario de Matrícula SHALL serializar los datos del formulario en `sessionStorage` bajo la clave `matriculaFormData` antes de llamar a `AdminApi.iniciarPagoWebpay`.

2. WHEN el método `grabar()` se ejecuta, THE Formulario de Matrícula SHALL llamar a `AdminApi.iniciarPagoWebpay` con un monto fijo de 1000 CLP y una `returnUrl` construida como `window.location.origin + '/webpay-return'`.

3. WHEN `AdminApi.iniciarPagoWebpay` retorna la URL y el token de Transbank, THE Formulario de Matrícula SHALL abrir la URL de pago en una nueva pestaña del navegador mediante `window.open(url, '_blank')`.

4. IF `AdminApi.iniciarPagoWebpay` falla con un error de red o del servidor, THEN THE Formulario de Matrícula SHALL mostrar un mensaje de error al usuario indicando que no fue posible iniciar el pago y SHALL permitir al usuario reintentar el envío del formulario sin limpiar los datos ingresados.

5. WHILE el formulario de matrícula es inválido o `cuposDisponibles` es nulo o menor o igual a cero, THE Formulario de Matrícula SHALL mantener el botón "Grabar Matrícula" deshabilitado y SHALL NOT invocar el método `grabar()`.

---

### Requirement 2: Procesamiento de retorno exitoso de WebPay

**User Story:** Como apoderado, quiero que al completar el pago exitosamente en WebPay se registre automáticamente la matrícula y se me muestre un resumen, para confirmar que el proceso quedó correctamente registrado.

#### Acceptance Criteria

1. WHEN `WebpayReturnComponent` se inicializa y los query params contienen `token_ws` pero no `TBK_TOKEN`, THE WebpayReturnComponent SHALL recuperar los datos del formulario desde `sessionStorage['matriculaFormData']` y llamar a `AdminApi.grabarMatricula` con el payload que incluye los datos del formulario y el `token_ws`.

2. WHEN `AdminApi.grabarMatricula` retorna una respuesta exitosa, THE WebpayReturnComponent SHALL mostrar el Estado Éxito con un resumen de la matrícula registrada que incluya: nombre del alumno, apellidos del alumno, RUT del alumno y el nombre del curso.

3. WHEN el Estado Éxito se muestra, THE WebpayReturnComponent SHALL eliminar la clave `matriculaFormData` de `sessionStorage`.

4. WHEN el Estado Éxito se muestra, THE WebpayReturnComponent SHALL presentar un botón que permita al usuario navegar a la página de inicio (`/`).

---

### Requirement 3: Procesamiento de error en WebPay

**User Story:** Como apoderado, quiero que si ocurre un error al registrar la matrícula después del pago se me muestre un mensaje claro con opción de reintentar, para poder corregir la situación sin perder el proceso.

#### Acceptance Criteria

1. WHEN `WebpayReturnComponent` se inicializa con `token_ws` presente y `AdminApi.grabarMatricula` falla con un error HTTP 4xx o 5xx, THE WebpayReturnComponent SHALL mostrar el Estado Error con un mensaje que indique que hubo un problema al registrar la matrícula.

2. WHEN el Estado Error se muestra, THE WebpayReturnComponent SHALL presentar un botón de "Reintentar" que navegue al usuario a la ruta `/matriculas`.

3. WHEN el Estado Error se muestra, THE WebpayReturnComponent SHALL eliminar la clave `matriculaFormData` de `sessionStorage`.

4. WHEN `WebpayReturnComponent` se inicializa y los query params no contienen ni `token_ws` ni `TBK_TOKEN`, THE WebpayReturnComponent SHALL mostrar el Estado Error con un mensaje que indique que no se recibió un token de pago válido.

5. WHEN `WebpayReturnComponent` se inicializa con `token_ws` presente y `sessionStorage['matriculaFormData']` está vacío o ausente, THE WebpayReturnComponent SHALL mostrar el Estado Error con un mensaje que indique que no se encontraron datos de la matrícula.

---

### Requirement 4: Procesamiento de cancelación de WebPay

**User Story:** Como apoderado, quiero que si cancelo el pago en WebPay se me muestre un mensaje de cancelación con la opción de reintentar, para poder volver al formulario y completar el proceso cuando esté listo.

#### Acceptance Criteria

1. WHEN `WebpayReturnComponent` se inicializa y los query params contienen `TBK_TOKEN` (independientemente de que `token_ws` esté presente o no), THE WebpayReturnComponent SHALL mostrar el Estado Cancelación sin llamar a `AdminApi.grabarMatricula`.

2. WHEN el Estado Cancelación se muestra, THE WebpayReturnComponent SHALL presentar un mensaje que indique que el usuario canceló el pago en WebPay.

3. WHEN el Estado Cancelación se muestra, THE WebpayReturnComponent SHALL presentar un botón de "Reintentar" que navegue al usuario a la ruta `/matriculas`.

4. WHEN el Estado Cancelación se muestra, THE WebpayReturnComponent SHALL eliminar la clave `matriculaFormData` de `sessionStorage`.

---

### Requirement 5: Diseño visual del WebpayReturnComponent

**User Story:** Como apoderado, quiero que la página de retorno de WebPay presente de forma visual y clara el resultado de mi pago, para entender el estado de mi matrícula de un vistazo.

#### Acceptance Criteria

1. WHEN el Estado Éxito se muestra, THE WebpayReturnComponent SHALL utilizar iconografía y colores que distingan visualmente el éxito (tono verde o de confirmación) del error y la cancelación, empleando componentes de Angular Material y TailwindCSS consistentes con el diseño existente del sistema.

2. WHEN el Estado Error se muestra, THE WebpayReturnComponent SHALL utilizar iconografía y colores que representen visualmente un estado de error (tono rojo o de advertencia).

3. WHEN el Estado Cancelación se muestra, THE WebpayReturnComponent SHALL utilizar iconografía y colores que representen visualmente un estado de advertencia (tono amarillo o neutro), diferenciado del Estado Error.

4. WHILE cualquiera de los tres estados finales se muestra, THE WebpayReturnComponent SHALL mantener la pantalla de carga (spinner) oculta y SHALL NOT mostrar el spinner y el estado final simultáneamente.

5. WHILE el componente procesa la respuesta de Transbank (antes de determinar el estado final), THE WebpayReturnComponent SHALL mostrar un indicador de carga (spinner) al usuario.
