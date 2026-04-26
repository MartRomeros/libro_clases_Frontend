# Layout, Estructura y Responsive Design

## Grid Systems — La Base del Layout

### El Grid de 12 columnas

El grid de 12 columnas es estándar porque es divisible en: 1, 2, 3, 4, 6, 12 — lo que da flexibilidad para casi cualquier layout.

```
12 col → 100% del ancho
6 col  → 50%  — dos columnas iguales
4 col  → 33%  — tres columnas iguales
3 col  → 25%  — cuatro columnas iguales
8+4    → contenido principal (2/3) + sidebar (1/3)
9+3    → contenido amplio + sidebar estrecho
```

### Gutters (espaciado entre columnas)

```
Móvil (320-767px):   gutter 16px
Tablet (768-1023px): gutter 24px
Desktop (1024px+):   gutter 24-32px
Wide (1440px+):      gutter 32px
```

### Margins (margen lateral de la página)

```
Móvil:   16px a cada lado (el contenido ocupa el ancho - 32px)
Tablet:  24-32px a cada lado
Desktop: suficientes para que el contenido no llegue al borde
         max-width del contenedor: 1200px-1440px
```

### Containers y max-width

```css
/* Contenedor estándar con padding responsivo */
.container {
  width: 100%;
  max-width: 1280px;
  margin-inline: auto;
  padding-inline: clamp(1rem, 5vw, 2rem);
}

/* Grid base con CSS Grid */
.grid-12 {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: clamp(1rem, 2vw, 1.5rem);
}

/* Layout principal: sidebar + contenido */
.layout-with-sidebar {
  display: grid;
  grid-template-columns: 240px 1fr;
  gap: 2rem;
}
@media (max-width: 768px) {
  .layout-with-sidebar {
    grid-template-columns: 1fr;
  }
}
```

---

## Breakpoints Estándar

```
Breakpoint   Nombre       Ancho mínimo    Dispositivo típico
──────────── ──────────── ──────────────  ──────────────────────
xs           Extra small  < 480px         Teléfonos pequeños
sm           Small        480px+          Teléfonos grandes
md           Medium       768px+          Tablets portrait
lg           Large        1024px+         Tablets landscape / laptops
xl           Extra large  1280px+         Desktops
2xl          Wide         1536px+         Monitores anchos

Tailwind usa: sm(640), md(768), lg(1024), xl(1280), 2xl(1536)
Bootstrap usa: sm(576), md(768), lg(992), xl(1200), xxl(1400)
```

### Mobile-First vs Desktop-First

**Mobile-First** (recomendado): diseñas el layout base para móvil y luego añades complejidad para pantallas más grandes.
```css
/* Base: móvil */
.card-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

/* Tablet */
@media (min-width: 768px) {
  .card-grid { grid-template-columns: repeat(2, 1fr); }
}

/* Desktop */
@media (min-width: 1024px) {
  .card-grid { grid-template-columns: repeat(3, 1fr); }
}
```

---

## Composición Visual — Principios Fundamentales

### Jerarquía visual
El ojo escanea antes de leer. La jerarquía guía ese escaneo:

```
1er nivel → El TÍTULO más importante de la sección (grande, bold, alto contraste)
2do nivel → Información clave de soporte (tamaño mediano, peso medio)
3er nivel → Cuerpo del contenido (tamaño base, peso normal)
4to nivel → Metadata y labels (pequeño, bajo contraste)

Herramientas de jerarquía:
  Tamaño     → lo más grande llama más la atención
  Peso       → bold destaca sobre regular
  Color      → color saturado destaca sobre neutral
  Espacio    → más espacio alrededor = más importancia
  Posición   → arriba y izquierda → primero (en culturas occidentales)
```

### Proximidad y agrupación
```
Los elementos relacionados deben estar cerca.
Los elementos no relacionados deben tener separación visible.

Regla práctica: si el espacio entre dos grupos de elementos es igual
al espacio entre los elementos dentro de cada grupo → el usuario no
entiende qué está relacionado con qué.

Buena separación:
  Intra-grupo:  8-12px entre elementos del mismo grupo
  Inter-grupo:  24-48px entre grupos distintos
  Secciones:    64-96px entre secciones principales
```

### Alineación
```
Todo debe estar alineado a algo.
Evita la alineación arbitraria — genera ruido visual.

Tipos de alineación:
  Borde izquierdo:  la más natural para texto occidental
  Centro:           para elementos flotantes, CTAs, cards
  Borde derecho:    para números, fechas, acciones
  Baseline:         para elementos de texto en línea
```

### Contraste y Énfasis
```
El contraste no es solo de color — es de todo:
  Grande vs pequeño
  Bold vs thin
  Oscuro vs claro
  Lleno vs vacío
  Complejo vs simple

Sin contraste → todo se ve igual → el usuario no sabe qué importa.
Demasiado contraste en todo → el usuario no sabe dónde mirar.
```

---

## Espaciado — Sistema y Aplicación

### Cuándo usar cada valor

```
4px  → separación entre label y su valor (ej: "Estado" : "Activo")
       padding interno de tags y chips
       separación entre ícono y texto del mismo elemento

8px  → padding interno de botones pequeños
       gap entre ítems de una lista horizontal (chips, tags)
       separación entre elementos íntimamente relacionados

12px → padding de inputs y botones medianos
       separación entre form fields apilados
       gap entre elementos relacionados

16px → padding estándar de cards y paneles
       padding horizontal de contenedores de texto
       separación entre secciones internas de un componente

24px → separación entre grupos de elementos dentro de una sección
       padding de cards más espaciosas
       gap entre cards en un grid

32px → separación visible entre secciones de la misma área
       padding de secciones de contenido

48px → separación entre áreas distintas de la interfaz
       padding vertical de secciones de página

64px → separación entre secciones de una página
       padding top/bottom de bloques de hero

96px+ → separación grande entre secciones independientes
        ideal para landing pages con mucho espacio
```

### White Space (Espacio negativo)

El espacio vacío no es espacio desperdiciado. Es lo que le da respiro al contenido y hace que lo importante destaque.

Señales de que falta espacio:
- Todo parece igualmente importante
- La página se siente "apretada" o "claustrofóbica"
- El usuario tiene que esforzarse para encontrar lo que busca
- Los elementos se "pisan" visualmente

---

## Responsive Design Patterns

### Responsive Navigation

```
Desktop → Topbar horizontal con todos los ítems visibles
Tablet  → Topbar con menú colapsado (hamburger o condensado)
Móvil   → Hamburger que abre drawer lateral o menú overlay
          O: Bottom navigation para apps
```

### Responsive Tables

```
Opción A — Horizontal scroll:
  La tabla hace scroll horizontalmente en móvil
  Agregar sombra/indicador en el borde para señalar scroll
  Solo funciona para tablas con pocas filas

Opción B — Card layout:
  En móvil, cada fila se convierte en una card vertical
  Muestra los campos más importantes con label explícito
  El nombre de la columna aparece como label antes del valor

Opción C — Priority columns:
  Ocultar columnas menos importantes en móvil
  Mostrar botón "Ver más" para acceder al detalle completo
```

### Responsive Images

```css
/* Siempre definir aspect-ratio para evitar layout shift */
.product-image {
  aspect-ratio: 4/3;
  width: 100%;
  object-fit: cover;
}

/* Imágenes responsivas con srcset */
<img
  src="image-800.jpg"
  srcset="image-400.jpg 400w, image-800.jpg 800w, image-1200.jpg 1200w"
  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
  alt="..."
  loading="lazy"
/>
```

### Fluid Typography

```css
/* clamp(mínimo, preferido, máximo) */
:root {
  --text-base: clamp(1rem, 0.9rem + 0.5vw, 1.125rem);
  --text-lg:   clamp(1.125rem, 1rem + 0.75vw, 1.375rem);
  --text-xl:   clamp(1.25rem, 1rem + 1.5vw, 1.75rem);
  --text-hero: clamp(2rem, 1rem + 5vw, 4rem);
}
```
