# Accesibilidad — WCAG, ARIA, Inclusión Digital

## Por Qué la Accesibilidad es Diseño de Calidad

1 de cada 4 personas tiene alguna discapacidad. Además:
- Teclado: usuarios power users y usuarios con movilidad reducida
- Contraste: usuarios con baja visión, pantallas bajo luz solar, pantallas baratas
- Screen readers: usuarios ciegos, usuarios que aprenden auditivamente
- Subtítulos: usuarios sordos, usuarios en ambientes ruidosos, usuarios aprendiendo un idioma

El diseño accesible mejora la experiencia de todos.

---

## WCAG 2.1 — Los Cuatro Principios (POUR)

### Perceptible
El contenido debe ser presentable de formas que los usuarios puedan percibir.

```
1.1.1 Texto alternativo (A)
  Toda imagen no decorativa debe tener alt text descriptivo
  alt="" para imágenes decorativas (el screen reader las ignora)
  alt="[descripción de la acción, no de la imagen]" en botones con ícono

1.3.1 Información y relaciones (A)
  La estructura semántica debe transmitirse en el código
  Headings jerárquicos: h1 → h2 → h3 (no saltar niveles)
  Listas reales para listas de contenido (<ul>, <ol>)

1.4.1 Uso del color (A)
  El color nunca debe ser el único medio de transmitir información
  ✅ Error: borde rojo + ícono + texto de error
  ❌ Error: solo borde rojo

1.4.3 Contraste mínimo (AA) — el más importante en UI
  Texto normal: ratio 4.5:1
  Texto grande (≥18px regular o ≥14px bold): ratio 3:1
  Elementos UI y gráficos: ratio 3:1

1.4.4 Resize text (AA)
  El texto debe ser legible al 200% de zoom sin perder contenido

1.4.10 Reflow (AA)
  El contenido debe ser legible en 320px de ancho (sin scroll horizontal)

1.4.11 Non-text contrast (AA)
  Componentes UI (inputs, botones) y gráficos: ratio 3:1 mínimo

1.4.12 Text spacing (AA)
  El contenido no debe romperse si el usuario ajusta:
  Line height hasta 1.5x el tamaño de fuente
  Spacing entre letras hasta 0.12em
  Spacing entre palabras hasta 0.16em
```

### Operable
Los componentes de la UI deben ser operables por todos los usuarios.

```
2.1.1 Teclado (A)
  Toda funcionalidad disponible por mouse debe funcionar con teclado
  Nunca usar onMouseOver/onMouseOut como única forma de activar

2.1.2 Sin trampa de teclado (A)
  El usuario puede navegar hacia y desde cualquier componente con teclado
  Los modales atrapan el foco correctamente (focus trap)

2.4.1 Bypass blocks (A)
  Skip links: enlace "Saltar al contenido" al inicio de la página

2.4.3 Orden del foco (A)
  El orden de tab navigation sigue el orden visual lógico
  Nunca usar tabindex > 0

2.4.4 Propósito del enlace (A)
  El texto del enlace describe su destino sin contexto adicional
  ❌ "Click aquí" o "Leer más"
  ✅ "Ver detalles del pedido #1234" o "Leer más sobre accesibilidad web"

2.4.7 Focus visible (AA)
  Los elementos con foco deben tener un indicador visual claro
  ❌ outline: none sin alternativa
  ✅ focus-visible con ring visible y de buen contraste

2.5.3 Label in name (A)
  El aria-label de un botón debe incluir su texto visible
  Si el botón dice "Buy Now", aria-label no puede ser "Purchase product"
```

### Comprensible
El contenido y la operación de la UI deben ser comprensibles.

```
3.1.1 Idioma de la página (A)
  <html lang="es"> en español, <html lang="en"> en inglés

3.2.1 On focus (A)
  Recibir foco no debe cambiar el contexto de la página inesperadamente

3.2.2 On input (A)
  Cambiar un setting no debe disparar navegación automática sin aviso

3.3.1 Identificación de errores (A)
  Los errores en formularios deben describir el problema exacto
  ❌ "Email inválido"
  ✅ "El email debe incluir @ y un dominio. Ej: usuario@ejemplo.com"

3.3.2 Labels e instrucciones (A)
  Los inputs deben tener labels visibles siempre
  Las instrucciones de formato van antes del input, no solo en el placeholder

3.3.3 Sugerencia de error (AA)
  Si el usuario comete un error y hay formas conocidas de corregirlo, sugerirlas
```

### Robusto
El contenido debe ser interpretable por herramientas de asistencia.

```
4.1.1 Parsing (A)
  HTML válido — los elementos tienen sus atributos requeridos,
  los IDs son únicos, las etiquetas están bien cerradas

4.1.2 Nombre, rol, valor (A)
  Todos los componentes de UI tienen: nombre accesible, rol correcto y valor

4.1.3 Mensajes de estado (AA)
  Los mensajes de éxito/error deben anunciarse por screen readers
  Usar role="status" (no intrusivo) o role="alert" (intrusivo/urgente)
```

---

## ARIA — Cuándo Usarlo y Cuándo No

**Primera regla de ARIA**: Si existe un elemento HTML nativo con el comportamiento correcto, úsalo.

```
❌ <div role="button" onClick={...}>
✅ <button onClick={...}>

❌ <div role="checkbox" aria-checked={checked}>
✅ <input type="checkbox" checked={checked}>

❌ <div role="heading" aria-level="2">
✅ <h2>
```

Solo usa ARIA cuando el HTML nativo no puede hacer el trabajo:

### Roles ARIA más usados en UI moderna

```html
<!-- Landmark roles — estructura de la página -->
<header role="banner">       <!-- o simplemente <header> -->
<nav role="navigation">      <!-- o simplemente <nav> -->
<main role="main">           <!-- o simplemente <main> -->
<footer role="contentinfo">  <!-- o simplemente <footer> -->
<aside role="complementary"> <!-- o simplemente <aside> -->

<!-- Live regions — anunciar cambios dinámicos -->
<div role="status" aria-live="polite">  <!-- mensajes no urgentes (éxito) -->
<div role="alert" aria-live="assertive"> <!-- mensajes urgentes (error) -->

<!-- Widgets complejos -->
<div role="dialog" aria-modal="true" aria-labelledby="dialog-title">
<div role="tab" aria-selected="true" aria-controls="panel-1">
<div role="tabpanel" id="panel-1">
<div role="combobox" aria-expanded="false" aria-haspopup="listbox">
<div role="tooltip" id="tooltip-1">

<!-- Atributos descriptivos -->
aria-label="Cerrar diálogo"              <!-- nombre accesible sin texto visible -->
aria-labelledby="id-del-titulo"          <!-- nombre accesible desde elemento existente -->
aria-describedby="id-de-descripcion"     <!-- descripción adicional -->
aria-expanded="true/false"               <!-- estado expandido (menú, accordion) -->
aria-hidden="true"                       <!-- ocultar de screen readers (iconos decorativos) -->
aria-current="page"                      <!-- elemento actual en navegación -->
aria-busy="true"                         <!-- cargando, esperar -->
aria-disabled="true"                     <!-- deshabilitado (mantiene en tab order) -->
aria-required="true"                     <!-- campo requerido -->
aria-invalid="true"                      <!-- campo con error -->
aria-errormessage="id-del-error"         <!-- vincular con mensaje de error -->
```

---

## Navegación por Teclado — Patrones Estándar

```
Tab / Shift+Tab   → navegar entre elementos focusables
Enter / Space     → activar botón, link, checkbox
Escape            → cerrar modal, dropdown, tooltip
Flechas           → navegar dentro de un widget (radio group, tabs, listbox)
Home / End        → primer/último elemento en un widget
Ctrl+Home/End     → inicio/fin del documento

Ejemplos de comportamiento esperado:
  Modal:     Tab queda atrapado dentro. Esc cierra. Foco vuelve al trigger.
  Dropdown:  Enter/Space abre. Flechas navegan opciones. Esc cierra.
  Tabs:      Flechas cambian tab. Tab sale del componente de tabs.
  Date picker: Flechas navegan entre días. Enter selecciona.
```

---

## Checklist de Accesibilidad por Componente

### Formularios
```
□ Cada input tiene <label> asociado (for/id o wrapping)
□ Placeholder no reemplaza el label
□ Los errores se muestran debajo del campo con aria-describedby
□ Los campos requeridos indican con aria-required="true" + indicador visual
□ El formulario puede completarse completamente con teclado
□ Los mensajes de éxito/error se anuncian con role="status/alert"
□ Autocompletado configurado (autocomplete="email", "name", etc.)
```

### Modales / Dialogs
```
□ role="dialog" aria-modal="true" aria-labelledby="título-id"
□ Focus trap dentro del modal
□ Primer elemento focusable recibe foco al abrir
□ Esc cierra el modal
□ Al cerrar, el foco vuelve al elemento que lo abrió
□ Backdrop no es focusable
```

### Navegación
```
□ aria-current="page" en el ítem activo
□ aria-label en el <nav> si hay múltiples navs en la página
□ Menús desplegables con aria-expanded
□ Skip link al inicio de la página
```

### Imágenes
```
□ alt descriptivo en imágenes de contenido
□ alt="" en imágenes decorativas
□ SVG decorativo: aria-hidden="true"
□ SVG informativo: role="img" aria-label="..."
□ Gráficos complejos: descripción larga con aria-describedby
```
