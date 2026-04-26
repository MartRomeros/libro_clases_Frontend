# Patrones de UI — Formularios, Navegación, Modales y más

## Formularios — El Patrón más Crítico

Los formularios son el punto de mayor fricción en cualquier producto. Cada campo adicional reduce la tasa de completado.

### Principios de diseño de formularios

**Un concepto por pantalla** (mobile first)
Los formularios largos en una sola pantalla abruman. Divide en pasos si hay más de 5-7 campos.

**Inline validation — en el momento correcto**
```
❌ Validar mientras el usuario escribe (demasiado agresivo — interrumpe)
❌ Validar solo al enviar (feedback tardío — el usuario ya olvidó qué escribió)
✅ Validar al salir del campo (onBlur) — justo a tiempo
✅ Mostrar éxito (✓) cuando el campo está correcto — no solo errores
```

**Labels siempre visibles**
El placeholder desaparece al escribir. El usuario pierde contexto. Siempre usa `<label>` sobre o al lado del input.

**Mensajes de error útiles**
```
❌ "Error en el campo"
❌ "Formato incorrecto"
✅ "El teléfono debe tener 10 dígitos. Ej: 3001234567"
✅ "La contraseña debe tener al menos 8 caracteres, una mayúscula y un número"
```

**Orden lógico y agrupación**
Agrupa campos relacionados. Sigue el orden mental del usuario (nombre antes que email, ciudad antes que país).

### Anatomía de un campo de formulario
```
[Label]          ← siempre visible, fuera del input
[Input field]    ← estado: default, focus, filled, error, disabled, read-only
[Helper text]    ← instrucciones de formato, carácter count
[Error message]  ← debajo del input, con ícono de error
```

### Estados de input a diseñar siempre
```
Default:   borde neutral, placeholder gris
Focus:     borde de color primary (azul), ring de foco (accesibilidad)
Filled:    texto del usuario, borde levemente más oscuro
Error:     borde rojo, ícono de error, mensaje debajo
Success:   borde verde, ícono de check (para campos que requieren validación)
Disabled:  fondo gris, texto grisado, cursor not-allowed
Read-only: similar a disabled pero sin indicar no-editable
Loading:   spinner o skeleton en validaciones async
```

### Patrones de formulario avanzados

**Progressive Disclosure** — mostrar campos según el contexto
```
Tipo de cuenta → Personal / Empresa
  Si Empresa → mostrar campos: Nombre empresa, NIT, Representante legal
  Si Personal → ocultar esos campos
```

**Inline editing** — editar sin formulario modal
```
El usuario ve texto estático → hace clic → se transforma en input editable
→ Confirma con Enter/blur o cancela con Esc
Ideal para: perfiles, títulos, configuraciones rápidas
```

---

## Navegación — Patrones por Plataforma

### Web — Navegación horizontal (topbar)
```
Cuándo:   5-8 ítems principales, contenido amplio en horizontal
Estructura: Logo | Links principales | Acciones (search, CTA, avatar)
Comportamiento responsive: colapsar a hamburger en móvil
```

### Web — Sidebar navigation
```
Cuándo:   Apps complejas con muchas secciones, dashboards
Variantes:
  Siempre visible    → paneles de administración, apps de escritorio
  Collapsible        → colapsa a iconos, expande al hover/click
  Overlay (mobile)   → se superpone al contenido en pantallas pequeñas
Máximo de ítems recomendado: 7-9 en el nivel principal
```

### Mobile — Bottom Navigation
```
Cuándo:     apps móviles con 3-5 secciones principales
Items:      3-5 ítems (no más — space es limitado)
Anatomía:   Ícono + Label (nunca solo ícono en navegación principal)
Active state: color primary en ícono + label, indicador visual claro
Badge:      para notificaciones — número o dot sin número
```

### Breadcrumbs
```
Cuándo:     jerarquías de contenido de 3+ niveles (e-commerce, docs, CMS)
No usar en: apps con navegación plana o flujos lineales
Formato:    Inicio / Categoría / Subcategoría / Página actual
Última migaja: texto plano (no link) — es la página actual
```

### Tabs
```
Cuándo:     alternar entre vistas del mismo contenido (no navegación)
No usar en: más de 6-7 tabs — usar dropdown/menú alternativo
Regla:      todos los tabs deben ser del mismo nivel jerárquico
Mobile:     tabs con scroll horizontal o pill/selector alternativo
```

---

## Modales — Cuándo y Cómo

### Cuándo usar modales (y cuándo no)
```
✅ USAR para:
  Confirmaciones de acciones destructivas ("¿Estás seguro de eliminar?")
  Formularios cortos dentro del contexto actual (3-5 campos)
  Vista rápida de contenido sin perder el contexto (quick view)
  Alertas críticas que requieren acción inmediata

❌ NO USAR para:
  Mensajes de éxito/info que no requieren acción (usar toast)
  Formularios largos (mejor página dedicada)
  Contenido que el usuario necesita consultar mientras hace otra cosa
  Confirmaciones de acciones no destructivas (agregar fricción innecesaria)
  Modales sobre modales (nunca)
```

### Tipos de overlay

**Modal / Dialog** — para acciones que requieren decisión
```
Backdrop oscuro semitransparente
Focus trap — Tab no escapa del modal
Esc cierra
Botones: Acción principal + Cancelar (siempre una forma de salir)
Tamaños: sm (400px), md (560px), lg (720px), fullscreen
```

**Sheet / Drawer** — para contenido extenso o en móvil
```
Desliza desde el lateral o desde abajo
Bottom sheet en móvil es más ergonómico que modal centrado
Drag handle para cerrar en bottom sheets
```

**Popover / Dropdown** — para acciones contextuales
```
Se ancla al elemento que lo dispara
Cierra al hacer click fuera o al perder foco
No bloquea la interacción con el resto de la página
```

**Toast / Snackbar** — para feedback no intrusivo
```
Aparece en esquina (bottom-left o bottom-right)
Auto-dismiss después de 3-5 segundos para mensajes informativos
No auto-dismiss para errores importantes
Acción inline opcional ("Deshacer")
Máximo 1-2 toasts simultáneos
```

---

## Empty States — Oportunidad de Diseño

Un empty state bien diseñado convierte frustración en acción.

### Los tres tipos de empty state

**1. Primera vez (First run)** — el usuario nunca ha tenido datos aquí
```
Ilustración amigable o ícono del concepto
Título que describe qué puede hacer aquí
Descripción del beneficio
CTA primario que inicia la creación/configuración
Ejemplo: "Aún no tienes proyectos. Los proyectos te ayudan a organizar tu trabajo."
```

**2. Sin resultados** — búsqueda o filtro sin resultados
```
Ilustración de búsqueda vacía
"Sin resultados para [término]"
Sugerencias: revisar ortografía, ampliar términos, limpiar filtros
CTA para limpiar filtros o iniciar nueva búsqueda
```

**3. Error / Sin conexión** — algo falló
```
Ilustración de error (no aterradora)
Explicación simple de qué pasó
CTA para reintentar
Opción de contactar soporte si el error persiste
```

---

## Tablas de Datos — Diseño de Alta Densidad

### Principios para tablas

**Alineación de contenido**
```
Texto:       alineado a la izquierda
Números:     alineados a la derecha (facilita comparación)
Booleanos:   centrados (ícono check/cross)
Acciones:    alineadas a la derecha de cada fila
```

**Densidad**
```
Compact:   padding-y: 8px  — para datos densos, power users
Default:   padding-y: 12px — balance general
Relaxed:   padding-y: 16px — cuando el contenido lo requiere (imágenes, múltiples líneas)
```

**Patrones esenciales**
```
Ordenamiento:    flechas en headers, estado activo visible
Filtrado:        sobre la tabla o en sidebar — nunca dentro de la tabla
Paginación:      número de registros por página + navegación
Selección:       checkbox en primera columna, selección masiva
Acciones inline: en la última columna, mostrar al hover
Row expansion:   flecha o clic en la fila para expandir detalle
```

**Responsive**
```
En móvil, las tablas anchas son problemáticas. Opciones:
  Card view:    cada fila se convierte en una card
  Scroll horizontal: con indicador visual de que hay más
  Columnas prioritarias: mostrar solo las más importantes en móvil
  Detalle en modal:  ícono "ver más" que abre el detalle completo
```

---

## Onboarding — Primer Uso

### Patrones de onboarding por complejidad

**Progressive onboarding** (recomendado para la mayoría)
```
No mostrar todo de golpe. Enseñar contextualmente cuando el usuario
llega a cada funcionalidad por primera vez.
Tooltip → "Esta es tu barra de herramientas. Haz clic para ver opciones."
```

**Checklist de setup**
```
Para productos donde hay pasos de configuración iniciales
Lista clara de pasos con progreso visual (3/5 completados)
El usuario mantiene control — puede saltar o volver
Ideal para: herramientas B2B, SaaS con setup inicial
```

**Empty state con tour opcional**
```
Mostrar el empty state enriquecido con guía
Botón "Tomar el tour" para quienes quieran la guía completa
Botón "Empezar" para quienes prefieren explorar solos
```

**Lo que nunca hacer en onboarding**
```
❌ Forced flow: el usuario no puede usar el producto hasta completar el onboarding
❌ Demasiada información: más de 5-6 pasos en el tour inicial
❌ Preguntar datos que no se usarán inmediatamente
❌ No tener un "Skip" o "I'll do this later"
❌ Onboarding no adaptado al caso de uso del usuario
```
