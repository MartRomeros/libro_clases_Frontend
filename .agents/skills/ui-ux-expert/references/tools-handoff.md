# Herramientas y Handoff a Desarrollo

## Ecosistema de Herramientas de Diseño

### Figma — El Estándar Actual

Figma dominó el mercado por su colaboración en tiempo real, accesibilidad web y ecosistema de plugins. Es la herramienta principal para la mayoría de equipos hoy.

**Organización de archivos en Figma**
```
Equipo
├── 🎨 Design System         ← componentes, tokens, guías
│   ├── Foundations          (colores, tipografía, espaciado)
│   ├── Components           (biblioteca de componentes)
│   └── Patterns             (patrones de diseño documentados)
├── 📱 Producto Principal
│   ├── _Wireframes          (exploración, baja fidelidad)
│   ├── _Flows & Diagrams    (flujos de usuario, IA)
│   ├── Feature: Auth        (diseño final listo para dev)
│   ├── Feature: Dashboard
│   └── Feature: Checkout
└── 🔬 Research & Archive    (hallazgos, auditorías, referencia)
```

**Nomenclatura de layers**
```
Frames:          PascalCase descriptivo: UserProfile/Desktop
Groups:          kebab-case: header-section
Components:      Button/Primary/Large, Card/Product/Default
Layers:          descriptivos: icon-chevron, label-username, bg-card
```

**Auto Layout — el corazón de Figma moderno**
```
Horizontal / Vertical spacing → equivalente a flexbox
Hug contents    → el frame se ajusta al contenido (shrink-wrap)
Fixed width     → ancho fijo independiente del contenido
Fill container  → ocupa el espacio disponible (flex-grow: 1)
Min/Max width   → restricciones de tamaño responsivo

Resizing de children:
  Fixed    → tamaño fijo siempre
  Hug      → se ajusta al contenido interno
  Fill     → se estira para llenar el padre
```

**Variables en Figma (desde 2023)**
```
Reemplazan los Styles para color, tipografía y spacing
Permiten modo claro/oscuro sin duplicar componentes
Se pueden exportar como design tokens (JSON)
```

### Plugins de Figma Esenciales

```
Tokens Studio for Figma  → gestión y exportación de design tokens
                           Sincroniza con repositorio de código

Figma to Code            → genera código React, HTML, Tailwind desde diseños
                           (como punto de partida, siempre revisar el output)

Stark                    → verificador de contraste y accesibilidad integrado
                           Simula tipos de daltonismo y baja visión

Iconify                  → 200,000+ iconos de todas las bibliotecas
                           Directamente en Figma sin exportar

UI Faces                 → avatares realistas para mockups
Lorem ipsum de Figma     → contenido de relleno en español/inglés

FigJam AI               → generación de flujos y wireframes con IA
Anima                    → animaciones y prototipos avanzados desde Figma
```

---

## Handoff a Desarrollo — Cómo Hacer que Funcione

El handoff es donde más se pierde en el proceso de diseño. Un mal handoff resulta en:
- Diseño implementado incorrectamente
- Conversaciones repetitivas "¿qué font-size es este?"
- Inconsistencias entre diseño y código

### Lo que debe estar claro antes del handoff

```
✅ Todos los estados del componente diseñados (default, hover, focus, error, disabled)
✅ Comportamiento responsivo documentado (qué pasa en 320px, 768px, 1024px)
✅ Tokens usados en lugar de valores hardcoded
✅ Comportamientos de interacción especificados (animación, timing)
✅ Edge cases documentados (texto muy largo, sin datos, error de red)
✅ Anotaciones de accesibilidad (roles ARIA, orden de foco, texto alternativo)
✅ Assets exportados en los formatos correctos
```

### Anotaciones de diseño

Agrega notas directamente en el frame de Figma para:
```
→ Comportamiento de hover/click/focus
→ Valores de animación (duration, easing)
→ Lógica condicional ("mostrar solo si el usuario tiene plan Premium")
→ Textos máximos y truncación
→ Comportamiento en casos edge
→ Links a referencia técnica si es complejo
```

### Especificaciones por tipo de elemento

**Tipografía — lo que dev necesita**
```
font-family:   'Inter', sans-serif
font-size:     16px / 1rem
font-weight:   500
line-height:   1.5 (24px)
letter-spacing: -0.01em
color:         var(--color-text-primary) / #1e293b
```

**Espaciado — siempre en tokens**
```
❌ padding: 17px 23px  (valores arbitrarios → el dev no sabe si es exacto o aproximado)
✅ padding: var(--space-4) var(--space-6)  (16px 24px)
✅ O en Tailwind: px-6 py-4
```

**Sombras**
```
box-shadow: 0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06);
O en tokens: var(--shadow-sm)
```

---

## Design Tokens — Del Diseño al Código

### Flujo de tokens con Tokens Studio

```
Figma (Tokens Studio) → JSON → repositorio de código → CSS/SCSS/JS

1. Diseñador define tokens en Tokens Studio
2. Se exportan como JSON (o se sincronizan automáticamente con GitHub)
3. Style Dictionary transforma el JSON a CSS variables, SCSS variables,
   JavaScript exports, etc.
4. Los developers importan las variables ya listas
```

### Style Dictionary — transformar tokens

```javascript
// style-dictionary.config.js
module.exports = {
  source: ['tokens/**/*.json'],
  platforms: {
    css: {
      transformGroup: 'css',
      prefix: '',
      buildPath: 'dist/tokens/',
      files: [{
        destination: 'variables.css',
        format: 'css/variables',
        selector: ':root',
      }],
    },
    js: {
      transformGroup: 'js',
      buildPath: 'dist/tokens/',
      files: [{
        destination: 'tokens.js',
        format: 'javascript/es6',
      }],
    },
    tailwind: {
      transformGroup: 'js',
      buildPath: 'dist/tokens/',
      files: [{
        destination: 'tailwind-tokens.js',
        format: 'javascript/es6',
      }],
    },
  },
};
```

---

## Métricas de Éxito del Diseño

Como diseñador, necesitas medir el impacto de tus decisiones:

### Métricas cuantitativas
```
Task success rate     → % de usuarios que completan una tarea
Time on task          → tiempo promedio para completar la tarea
Error rate            → % de errores en formularios o flujos
Conversion rate       → % de usuarios que completan el funnel
Abandonment rate      → % que abandona un flujo antes de completarlo
Bounce rate           → % que sale sin interactuar
Learnability          → tiempo que toma dominar una funcionalidad nueva
```

### Métricas cualitativas
```
SUS (System Usability Scale)   → encuesta de 10 preguntas, score 0-100
                                  < 50: inaceptable, 68+: bueno, 85+: excelente
NPS (Net Promoter Score)       → "¿Recomendarías esto?" 0-10
CSAT                           → satisfacción post-tarea
Ease of Use rating             → después de un test de usabilidad
Think-aloud sessions           → análisis cualitativo de sesiones grabadas
```

### Cómo presentar resultados de diseño al equipo
```
Estructura efectiva:
  1. Problema que resolvíamos
  2. Research/datos que informaron la decisión
  3. Opciones consideradas (y por qué las descartamos)
  4. La solución elegida con justificación
  5. Resultados medidos después de implementar
  6. Qué aprendimos y qué haríamos diferente

Evitar:
  - Presentar solo el resultado final sin el proceso
  - Defender diseños por estética sin datos o principios
  - No mostrar las alternativas consideradas
```

---

## Otras Herramientas del Ecosistema

```
PROTOTIPADO
  Figma Prototype   → transiciones básicas y click-throughs
  Framer            → prototipos con lógica real e interacciones complejas
  ProtoPie          → interacciones táctiles y de sensor en móvil
  Principle         → animaciones de alta fidelidad

RESEARCH Y TESTING
  Maze              → tests de usabilidad no moderados
  UserTesting       → acceso a panel de usuarios reales
  Hotjar            → heatmaps y recordings en producción
  Optimal Workshop  → card sorting y tree testing
  Lyssna            → test de preferencia y primeras impresiones

COLABORACIÓN
  FigJam            → pizarras y workshops de diseño
  Miro              → workshops y mapas de experiencia
  Notion            → documentación de research y decisiones
  Coda              → dashboards y documentación dinámica

HANDOFF Y DOCUMENTACIÓN
  Storybook         → documentación de componentes con código
  Zeroheight        → design system documentation
  Supernova         → sincroniza Figma + documentación automática
  Chromatic         → visual regression testing para Storybook
```
