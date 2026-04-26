# Diseño Visual — Tipografía, Color, Iconografía

## Tipografía — El 80% del Diseño Digital

### Principios fundamentales

**Jerarquía** — el lector debe poder escanear la página y entender la estructura sin leer.
Varía tamaño, peso y color para crear niveles: H1 → H2 → H3 → cuerpo → caption.

**Legibilidad** — cómo se distingue cada carácter individualmente.
Factores: forma de las letras, espaciado, tamaño mínimo.

**Readability** — cómo se lee el texto en bloques.
Factores: longitud de línea, interlineado, contraste, longitud de párrafo.

### Escala tipográfica — Type Scale

Usa una escala modular basada en una razón (ratio). Las más comunes:
```
Minor Third  (1.200): 12 → 14 → 17 → 20 → 24 → 29 → 35px   (compacto)
Major Third  (1.250): 12 → 15 → 19 → 24 → 30 → 37 → 46px   (balanceado)
Perfect Fourth(1.333): 12 → 16 → 21 → 28 → 37 → 50 → 67px  (dramático)
Golden Ratio (1.618): muy grande salto — solo para hero text
```

Herramienta: typescale.com

### Reglas críticas de tipografía web

```
Line height (interlineado):
  Cuerpo de texto:  1.5 – 1.7x el tamaño de fuente  (ej: 16px → 24-27px)
  Headings:         1.1 – 1.3x el tamaño de fuente   (ej: 40px → 44-52px)

Longitud de línea (measure):
  Óptimo:           50-75 caracteres por línea (~600-700px a 16px)
  Móvil:            35-50 caracteres por línea
  Demasiado ancho:  > 90 caracteres → el ojo pierde el inicio de la siguiente línea
  Demasiado estrecho: < 30 caracteres → lectura entrecortada

Letter spacing (tracking):
  Cuerpo:           0 o ligeramente negativo (-0.01em a 0)
  Headings grandes: -0.02em a -0.04em (óptico — se ve más cohesivo)
  MAYÚSCULAS/CAPS:  0.05em a 0.15em (siempre espaciar más)
  Captions/labels:  0.02em a 0.05em (mejora legibilidad en pequeño)
```

### Combinaciones de fuentes — Pairings

El principio: **contraste con armonía**. Contrasta el estilo (serif + sans-serif) pero armoniza el carácter (ambas elegantes, o ambas geométricas, etc.).

```
Uso          Display / Heading          Body / UI
──────────── ─────────────────────────  ──────────────────────
Editorial    Playfair Display           Source Serif Pro
Tecnología   Space Grotesk / Syne       Inter / DM Sans
Humanista    Merriweather               Nunito Sans
Geométrico   Jost / Urbanist            Lato / Outfit
Luxury       Cormorant Garamond         Libre Baskerville
Moderno      Cabinet Grotesk            Satoshi / General Sans
Futurista    Clash Display              IBM Plex Sans
```

Regla: máximo 2 familias tipográficas. Si necesitas más variación, usa los pesos de la misma familia.

---

## Color — Sistema Semántico

### Estructura de un sistema de color

```
Brand Colors (2-3 colores)
  → Primary:    el color más representativo del brand
  → Secondary:  complementario, para accents y soporte
  → Accent:     llamadas a la atención, highlights

Neutral Colors (escala completa)
  → 50  #fafafa   → fondos muy suaves
  → 100 #f5f5f5   → fondos de cards, separadores
  → 200 #e5e5e5   → bordes
  → 300 #d4d4d4   → bordes de inputs
  → 400 #a3a3a3   → placeholder text
  → 500 #737373   → texto secundario
  → 600 #525252   → texto de apoyo
  → 700 #404040   → texto principal (dark)
  → 800 #262626   → headings
  → 900 #171717   → texto muy oscuro / fondos dark
  → 950 #0a0a0a   → fondo dark mode profundo

Semantic Colors
  → Success: #16a34a (green-600) — estados completados, confirmación
  → Warning: #d97706 (amber-600) — advertencias, acción necesaria
  → Error:   #dc2626 (red-600)   — errores, alertas críticas
  → Info:    #2563eb (blue-600)  — información, ayuda contextual
```

### Contraste — WCAG obligatorio

```
Texto normal (< 18px regular, < 14px bold):
  AA:   ratio 4.5:1 mínimo   (cumplimiento básico)
  AAA:  ratio 7:1            (máxima accesibilidad)

Texto grande (≥ 18px regular, ≥ 14px bold):
  AA:   ratio 3:1 mínimo
  AAA:  ratio 4.5:1

Componentes UI y gráficos:
  AA:   ratio 3:1 mínimo

Verificadores: webaim.org/resources/contrastchecker
               whocanuse.com (ver impacto por tipo de deficiencia visual)
```

### Combinaciones de color que siempre funcionan

```
Dark neutral + vivid accent:
  Fondo: #0f172a (slate-900) + Texto: #f1f5f9 + Accent: #38bdf8 (sky-400)

Light con accent saturado:
  Fondo: #ffffff + Texto: #1e293b + Accent: #7c3aed (violet-600)

Warm minimal:
  Fondo: #fafaf9 (stone-50) + Texto: #1c1917 (stone-900) + Accent: #f97316 (orange-500)

Cool monochromático:
  Fondo: #f8fafc + Texto: #0f172a + Accent: #0ea5e9 (sky-500)
  (Varía luminosidad, no el hue)
```

### Errores comunes de color

```
❌ Demasiados colores: más de 3-4 colores de brand → desorden visual
❌ Color como única señal semántica: nunca solo rojo = error (accesibilidad)
❌ Saturación máxima en áreas grandes: #ff0000 de fondo → agresivo
❌ Contraste insuficiente: texto gris #999 sobre blanco → ratio 2.8:1 (falla AA)
❌ Dark mode como inversión exacta: convertir colores → no siempre funciona
```

---

## Iconografía

### Cuándo usar iconos

- Para complementar texto (no reemplazarlo) en navegación principal
- Para acciones reconocidas universalmente (edit ✏️, delete 🗑️, close ✕)
- Para reducir carga cognitiva en interfaces densas
- Como apoyo visual en categorías o estados

### Cuándo NO usar iconos solos

- Navegación de aplicaciones complejas → siempre acompañar con label
- Acciones con consecuencias (destructivas) → texto explícito obligatorio
- Conceptos abstractos → el ícono es ambiguo sin contexto

### Principios de consistencia en iconografía

```
Una sola biblioteca en todo el producto (Lucide, Heroicons, Phosphor, etc.)
Un solo estilo: outline, filled o duotone — nunca mezclar
Tamaño consistente: definir 3-4 tamaños estándar (16px, 20px, 24px, 32px)
Grosor consistente: mantener el mismo stroke-width
Color semántico: los iconos heredan o respetan el sistema de color
```

### Librerías recomendadas

| Librería | Estilo | Variantes | Ideal para |
|---|---|---|---|
| Lucide | Outline limpio | 1 estilo | Apps modernas, dashboards |
| Heroicons | Outline / Solid | 2 estilos | Apps web, Tailwind |
| Phosphor | Múltiple | 6 estilos | Flexibilidad máxima |
| Tabler | Outline geométrico | 1 estilo | Dashboards técnicos |
| Remix Icon | Mixto | 2 estilos | Apps con iconografía densa |
| Font Awesome | Completo | 4 estilos | Cuando necesitas cobertura total |

---

## Imágenes e Ilustraciones

### Principios de uso de imágenes

**Autenticidad** — fotos de personas reales generan más confianza que stock genérico. Si usas stock, elige estilos editoriales sobre poses artificiales.

**Consistencia estética** — define un tratamiento visual para todas las imágenes del producto: misma paleta de tonos, mismo nivel de contraste, mismo estilo.

**Performance** — las imágenes son el mayor factor de rendimiento percibido. Siempre especificar aspect-ratio en CSS para evitar layout shifts.

### Tratamientos visuales para cohesión

```css
/* Tono consistente con CSS filters */
.product-image {
  filter: saturate(0.9) contrast(1.05);
}

/* Color overlay para cohesión de brand */
.hero-image {
  position: relative;
}
.hero-image::after {
  content: '';
  position: absolute;
  inset: 0;
  background: color-mix(in srgb, var(--brand-primary) 20%, transparent);
  mix-blend-mode: multiply;
}
```

### Ilustraciones — cuándo y cómo

Úsalas para: empty states, onboarding, confirmaciones emocionales, mascota de marca.
Evítalas en: contextos que requieren credibilidad (B2B enterprise, finanzas, salud).

Estilos modernos que funcionan bien:
```
Isométrico 3D    → tecnología, dashboards, procesos
Flat con sombra  → apps móviles, consumidor
Línea editorial  → medios, contenido
Abstracto/blob   → SaaS moderno, startups
Pixel art        → gaming, nostalgia, nicho
```
