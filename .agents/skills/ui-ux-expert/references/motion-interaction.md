# Motion y Micro-interacciones

## Por Qué el Motion Importa en UX

El movimiento bien aplicado:
- **Orienta** — muestra al usuario a dónde fue algo o de dónde viene algo
- **Confirma** — le dice al usuario que su acción fue registrada
- **Guía** — dirige la atención hacia lo que importa
- **Deleita** — agrega personalidad y pulido

El movimiento mal aplicado:
- Distrae y frustra
- Ralentiza la percepción de la interfaz
- Puede causar malestar en usuarios con sensibilidad al movimiento

---

## Los 12 Principios de Animación (aplicados a UI)

De Disney, adaptados para interfaces:

### Los más relevantes para UI

**1. Squash and Stretch** → cosas que se comprimen/estiran al moverse
Uso en UI: botones que "respiran" al hacer clic, elementos que se escalan

**2. Anticipation** → pequeño movimiento opuesto antes de la acción principal
Uso en UI: notificaciones que se mueven ligeramente antes de expandir

**3. Ease In / Ease Out** → las cosas se aceleran y desaceleran naturalmente
Uso en UI: todos los elementos deben tener easing, nunca linear salvo casos específicos

**4. Follow Through** → los elementos secundarios siguen al principal
Uso en UI: elementos que siguen el scroll, detalles que responden al movimiento principal

**5. Staging** → un elemento a la vez para no confundir
Uso en UI: no animar múltiples cosas importantes simultáneamente

**6. Overlapping action** → las partes se mueven a velocidades ligeramente distintas
Uso en UI: listas con stagger, elementos que entran en cascada

---

## Duraciones Recomendadas

```
50-100ms    → micro-feedback: hover states, focus rings, toggles
              tan rápido que se siente instantáneo
              
100-200ms   → transiciones de estado simples: show/hide tooltips,
              dropdowns que aparecen, checkboxes

200-400ms   → transiciones de componentes: modales que abren,
              drawers, expansión de acordeones
              El punto dulce para la mayoría de transiciones

300-500ms   → transiciones de página o de secciones grandes
              
500ms-1s    → animaciones elaboradas, onboarding, primera visita
              Solo cuando hay algo especial que mostrar

> 1s         → peligroso — se siente lento si no hay razón narrativa
```

---

## Easing — La Curva de la Animación

```css
/* Naturales para movimiento de entrada y salida */
--ease-in:        cubic-bezier(0.4, 0, 1, 1);   /* empieza lento → termina rápido */
--ease-out:       cubic-bezier(0, 0, 0.2, 1);   /* empieza rápido → termina lento */
--ease-in-out:    cubic-bezier(0.4, 0, 0.2, 1); /* lento → rápido → lento */

/* Para el 90% de los casos de UI */
--ease-standard:  cubic-bezier(0.4, 0, 0.2, 1); /* Material Design "Standard" */
--ease-decelerate: cubic-bezier(0, 0, 0.2, 1);  /* para entradas (elemento nuevo) */
--ease-accelerate: cubic-bezier(0.4, 0, 1, 1);  /* para salidas (elemento que se va) */

/* Spring physics — más natural para elementos interactivos */
/* En Framer Motion: type: "spring", stiffness: 400, damping: 30 */
```

### Cuándo usar cada curva
```
ease-out (decelerate)  → cuando algo ENTRA a la pantalla
ease-in (accelerate)   → cuando algo SALE de la pantalla
ease-in-out            → cuando algo SE MUEVE de un lugar a otro
linear                 → solo para loops infinitos y efectos de barra de progreso
spring                 → para elementos arrastrados, botones con bounce, interacciones táctiles
```

---

## Micro-interacciones — Catálogo

### Button States
```css
.button {
  transition: background-color 150ms ease-out,
              transform 100ms ease-out,
              box-shadow 150ms ease-out;
}
.button:hover {
  background-color: var(--color-primary-hover);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}
.button:active {
  transform: scale(0.98);  /* sensación de press físico */
}
.button:focus-visible {
  outline: 2px solid var(--color-focus);
  outline-offset: 2px;
}
```

### Toggle / Switch
```
OFF → ON:
  1. El handle se desliza de izquierda a derecha (200ms, ease-in-out)
  2. El fondo cambia de neutral a primary (200ms)
  3. Pequeño bounce al llegar (spring)
  
Feedback adicional (opcional):
  Ícono que cambia (x → check)
  Vibración háptica en móvil
```

### Loading States
```
Skeleton screens (recomendado sobre spinners para contenido)
  Bloques grises con shimmer animation que imitan el layout
  Reduce percepción de tiempo de espera
  CSS:
    background: linear-gradient(
      90deg,
      var(--skeleton-base) 25%,
      var(--skeleton-highlight) 50%,
      var(--skeleton-base) 75%
    );
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;

Spinner (para acciones puntuales)
  Solo cuando la duración es impredecible (< 3 segundos)
  Reemplazar con progress bar si la espera puede ser > 3s

Progress bar (para procesos medibles)
  Cuando sabes el porcentaje de avance
  Siempre mostrar texto adicional: "Subiendo archivos... 2 de 5"
```

### Transiciones de Estado de Formulario
```
Input error:
  1. Borde cambia de neutral a rojo (150ms ease-out)
  2. Ícono de error aparece con fade+scale (200ms)
  3. Mensaje de error aparece deslizando desde arriba (200ms)
  
No hacer:
  - Shake animation del campo (molesto y no sirve de nada)
  - Flash de rojo intenso (agresivo)
```

### Page Transitions
```
Entre páginas del mismo nivel:
  Fade: opacity 0→1 (200-300ms) — sutil y seguro

Hacia detalle (drill down):
  Slide left: el nuevo contenido entra desde la derecha
  
Volver atrás:
  Slide right: el contenido vuelve desde la izquierda
  
En móvil (iOS-like):
  El nuevo screen entra desde la derecha con el anterior saliendo a la izquierda
  Velocidad: 350ms, ease-out
```

---

## Principio de Reducción de Movimiento

**Siempre** respetar la preferencia del usuario:

```css
/* Envolver todas las animaciones con esta media query */
@media (prefers-reduced-motion: no-preference) {
  .animated-element {
    transition: transform 300ms ease-out;
    animation: float 3s ease-in-out infinite;
  }
}

/* O globalmente — quitar animaciones para quienes las prefieren reducidas */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

En JavaScript/React:
```javascript
const prefersReducedMotion = window.matchMedia(
  '(prefers-reduced-motion: reduce)'
).matches;

const animationConfig = prefersReducedMotion
  ? { duration: 0 }
  : { duration: 300, easing: 'ease-out' };
```

---

## Herramientas de Motion

```
CSS Animations / Transitions  → para lo básico, sin dependencias
Framer Motion (React)         → production-ready, spring physics, layout animations
GSAP                          → animaciones complejas y timeline, máxima control
CSS Scroll-driven animations   → parallax y animaciones al scroll sin JS (moderno)
Lottie                         → animaciones vectoriales exportadas desde After Effects
```

### Cuándo usar cada herramienta
```
CSS puro:       hover states, transiciones simples, spinners, skeleton
Framer Motion:  componentes React con estados complejos, drag & drop, layouts que cambian
GSAP:           animaciones narrativas, landing pages con storytelling, secuencias complejas
Lottie:         ilustraciones animadas, iconos animados, onboarding ilustrado
```
