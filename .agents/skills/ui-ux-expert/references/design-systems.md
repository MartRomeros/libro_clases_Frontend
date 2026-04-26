# Design Systems — Tokens, Componentes, Atomic Design

## Qué es un Design System (y qué no es)

Un design system no es una biblioteca de componentes. Es el conjunto de:
- **Principios de diseño** — el *por qué* detrás de las decisiones
- **Design tokens** — los valores fundamentales (color, espaciado, tipografía, sombras)
- **Componentes** — los bloques reutilizables con sus variantes y comportamientos
- **Patrones** — cómo combinar componentes para resolver problemas recurrentes
- **Documentación** — cómo y cuándo usar cada cosa
- **Proceso** — cómo contribuir, cómo mantener, cómo versionar

Un design system vive y muere por su documentación y gobernanza, no solo por su calidad visual.

---

## Design Tokens — La Base de Todo

Los design tokens son los valores atómicos del sistema. Existen en tres niveles:

### Nivel 1 — Global/Primitive Tokens (los valores brutos)
```json
{
  "color": {
    "blue": {
      "50":  { "value": "#eff6ff" },
      "100": { "value": "#dbeafe" },
      "500": { "value": "#3b82f6" },
      "600": { "value": "#2563eb" },
      "700": { "value": "#1d4ed8" },
      "900": { "value": "#1e3a8a" }
    },
    "neutral": {
      "0":   { "value": "#ffffff" },
      "100": { "value": "#f5f5f5" },
      "500": { "value": "#737373" },
      "900": { "value": "#171717" },
      "1000":{ "value": "#000000" }
    }
  },
  "spacing": {
    "1": { "value": "4px" },
    "2": { "value": "8px" },
    "3": { "value": "12px" },
    "4": { "value": "16px" },
    "6": { "value": "24px" },
    "8": { "value": "32px" },
    "12": { "value": "48px" },
    "16": { "value": "64px" }
  },
  "font-size": {
    "xs":  { "value": "12px" },
    "sm":  { "value": "14px" },
    "md":  { "value": "16px" },
    "lg":  { "value": "20px" },
    "xl":  { "value": "24px" },
    "2xl": { "value": "32px" },
    "3xl": { "value": "40px" }
  },
  "radius": {
    "none": { "value": "0" },
    "sm":   { "value": "4px" },
    "md":   { "value": "8px" },
    "lg":   { "value": "12px" },
    "xl":   { "value": "16px" },
    "full": { "value": "9999px" }
  }
}
```

### Nivel 2 — Semantic/Alias Tokens (el propósito semántico)
```json
{
  "color": {
    "background": {
      "default":   { "value": "{color.neutral.0}" },
      "subtle":    { "value": "{color.neutral.100}" },
      "inverse":   { "value": "{color.neutral.900}" }
    },
    "text": {
      "primary":   { "value": "{color.neutral.900}" },
      "secondary": { "value": "{color.neutral.500}" },
      "disabled":  { "value": "{color.neutral.300}" },
      "inverse":   { "value": "{color.neutral.0}" }
    },
    "border": {
      "default":   { "value": "{color.neutral.200}" },
      "strong":    { "value": "{color.neutral.400}" },
      "focus":     { "value": "{color.blue.500}" }
    },
    "action": {
      "primary":          { "value": "{color.blue.600}" },
      "primary-hover":    { "value": "{color.blue.700}" },
      "primary-text":     { "value": "{color.neutral.0}" }
    },
    "feedback": {
      "success": { "value": "#16a34a" },
      "warning": { "value": "#d97706" },
      "error":   { "value": "#dc2626" },
      "info":    { "value": "#2563eb" }
    }
  }
}
```

### Nivel 3 — Component Tokens (específicos de un componente)
```json
{
  "button": {
    "padding-x":          { "value": "{spacing.4}" },
    "padding-y":          { "value": "{spacing.2}" },
    "border-radius":      { "value": "{radius.md}" },
    "font-size":          { "value": "{font-size.sm}" },
    "primary-background": { "value": "{color.action.primary}" },
    "primary-text":       { "value": "{color.action.primary-text}" }
  }
}
```

### Exportar tokens a CSS
```css
/* Variables CSS generadas desde los tokens */
:root {
  /* Primitivos */
  --color-blue-50:  #eff6ff;
  --color-blue-500: #3b82f6;
  --color-blue-600: #2563eb;

  /* Semánticos (light mode) */
  --color-bg-default:   var(--color-neutral-0);
  --color-text-primary: var(--color-neutral-900);
  --color-border:       var(--color-neutral-200);
  --color-action:       var(--color-blue-600);

  /* Espaciado */
  --space-1: 4px;
  --space-2: 8px;
  --space-4: 16px;
  --space-8: 32px;

  /* Tipografía */
  --font-sans: 'Inter Variable', system-ui, sans-serif;
  --text-sm: 14px;
  --text-base: 16px;
  --text-lg: 20px;

  /* Radios */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
}

/* Dark mode — solo cambian los semánticos, no los primitivos */
[data-theme="dark"] {
  --color-bg-default:   var(--color-neutral-950);
  --color-text-primary: var(--color-neutral-50);
  --color-border:       var(--color-neutral-800);
}
```

---

## Atomic Design — Organizar los Componentes

```
Átomos       → elementos HTML básicos con tokens aplicados
               Button, Input, Label, Badge, Icon, Avatar

Moléculas    → grupos de átomos que forman una unidad funcional
               SearchBar (Input + Button + Icon)
               FormField (Label + Input + HelperText)
               Card (Image + Title + Body + Action)

Organismos   → secciones complejas compuestas de moléculas
               Header (Logo + Navigation + SearchBar + UserMenu)
               ProductGrid (múltiples Cards)
               CheckoutForm (múltiples FormFields + Summary)

Templates    → layouts de página sin contenido real
               DashboardLayout, AuthLayout, LandingLayout

Pages        → templates con contenido real — lo que el usuario ve
```

---

## Anatomía de un Componente Bien Documentado

Para cada componente del sistema, documentar:

```
NOMBRE Y PROPÓSITO
  ¿Qué es? ¿Para qué se usa?

CUÁNDO USARLO / CUÁNDO NO
  Ejemplos de uso correcto e incorrecto

ANATOMÍA
  Partes del componente con nombre (label, icon, container, etc.)

VARIANTES
  Primary, Secondary, Destructive, Ghost, Link...

TAMAÑOS
  Small (sm), Medium (md, default), Large (lg)

ESTADOS
  Default, Hover, Focus, Active, Disabled, Loading, Error

PROPIEDADES (API del componente)
  variant: 'primary' | 'secondary' | 'destructive'
  size: 'sm' | 'md' | 'lg'
  disabled: boolean
  loading: boolean
  leftIcon?: ReactNode
  rightIcon?: ReactNode

COMPORTAMIENTO
  ¿Cómo responde al teclado? ¿A touch? ¿Al resize?

ACCESIBILIDAD
  Rol ARIA, atributos requeridos, comportamiento con screen reader

TOKENS USADOS
  Qué tokens consume y cómo

EJEMPLOS DE CÓDIGO
  Uso más común, variantes clave
```

### Ejemplo — Button Component

```
Variantes:    Primary, Secondary, Outline, Ghost, Destructive, Link
Tamaños:      sm (h-8), md (h-10, default), lg (h-12)
Estados:      default → hover → focus-visible → active → disabled → loading

Accesibilidad:
  role="button" o elemento <button>
  aria-disabled en lugar de disabled cuando no quieras sacar del tab order
  aria-busy="true" + aria-label="Loading" durante estado loading
  focus-visible con outline visible (no quitar outline sin reemplazarlo)
  Ratio de contraste 4.5:1 para texto sobre fondo del botón

Tokens:
  background:  --color-action-primary
  text:        --color-action-primary-text
  padding:     --space-2 (vertical) --space-4 (horizontal)
  radius:      --radius-md
  font-size:   --text-sm
  font-weight: 500

DO:
  ✅ Usar Primary para la acción más importante de la pantalla
  ✅ Máximo 1 Primary Button por sección
  ✅ Label en verbo + objeto: "Save Changes", "Delete Account"

DON'T:
  ❌ Usar Primary para acciones secundarias
  ❌ Deshabilitar sin explicar por qué (usa estado de error + mensaje)
  ❌ Labels ambiguos: "OK", "Yes", "Submit"
```

---

## Versionado y Gobernanza

```
Semantic Versioning para design systems:
  Major (2.0.0) → breaking changes en componentes o tokens
  Minor (1.3.0) → nuevos componentes o variantes, backwards compatible
  Patch (1.2.1) → fixes de bugs visuales, ajustes menores

Proceso de contribución:
  1. RFC (Request for Comment) → proponer el cambio con justificación
  2. Review → equipo de design + dev + accesibilidad
  3. Prototipo → implementar en rama separada
  4. Testing → visual regression + accesibilidad + cross-browser
  5. Documentación → actualizar antes de merge
  6. Release → changelog + comunicación al equipo

Herramientas de documentación:
  Storybook     → documentación de componentes con código interactivo
  Supernova     → sincroniza Figma + documentación
  zeroheight    → design + code en una sola fuente de verdad
  Figma Tokens  → plugin para tokens en Figma
```
