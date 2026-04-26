# Research y Estrategia UX

## Cuándo Necesitas Research (y Cuándo No)

El research tiene costo. No siempre justifica una investigación formal. La regla:

| Situación | Acción |
|---|---|
| Decisión de bajo riesgo, reversible | Diseña, itera con feedback |
| Funcionalidad nueva sobre dominio conocido | Entrevistas rápidas (3-5 usuarios) |
| Rediseño de flujo crítico | Research cualitativo + cuantitativo |
| Producto nuevo para audiencia desconocida | Research completo antes de diseñar |
| Contradicción entre datos y intuición | Validación con test de usabilidad |

---

## Métodos de Research — Cuándo Usar Cada Uno

### Research Cualitativo (el *por qué*)

**Entrevistas de usuario**
Para descubrir motivaciones, contexto, modelos mentales. No preguntes qué quieren — pregunta qué hacen.
```
Preguntas de apertura:  "Cuéntame sobre la última vez que..."
                        "¿Cómo manejas actualmente el problema de...?"
Evitar:                 "¿Usarías una función que...?" (hipotético → respuesta sesgada)
                        "¿Te gusta esta pantalla?" (lleva a validar, no a descubrir)
Número ideal:           5-8 participantes para saturación temática
```

**Guerrilla Usability Testing**
Rápido, económico, suficiente para detectar los problemas mayores.
```
Duración:     15-20 minutos por sesión
Participantes: 5 usuarios detectan ~85% de los problemas de usabilidad (Nielsen)
Protocolo:    "Piensa en voz alta. No hay respuestas incorrectas. Yo no diseñé esto."
Escenario:    Tarea específica basada en un objetivo real del usuario
Observar:     Dónde se pausa, dónde hace zoom, qué omite, qué dice que es confuso
```

**Card Sorting** (para arquitectura de información)
```
Abierto:    el usuario crea categorías → descubrir su modelo mental
Cerrado:    el usuario clasifica en categorías dadas → validar tu IA propuesta
Híbrido:    categorías base + libertad de crear nuevas
Herramientas: Maze, Optimal Workshop, UXtweak
```

**Tree Testing** (para validar navegación)
```
Objetivo:   verificar que los usuarios encuentran información en la jerarquía propuesta
Sin diseño visual → elimina el bias de la interfaz gráfica
Métricas:   tasa de éxito, directness, tiempo en tarea
```

### Research Cuantitativo (el *cuánto*)

**Analytics de producto**
```
Embudos:      dónde abandona el usuario el flujo (Mixpanel, Amplitude)
Heatmaps:     dónde hace clic, qué ignora (Hotjar, Clarity)
Session recording: reproducir sesiones reales para identificar frustración
A/B Testing:  comparar variantes con tráfico real → solo cuando tienes suficiente volumen
```

**Surveys / Encuestas**
```
NPS (Net Promoter Score):    lealtad general del producto
CSAT (Customer Satisfaction): satisfacción post-interacción específica
SUS (System Usability Scale): percepción de usabilidad con 10 preguntas estándar
CES (Customer Effort Score):  qué tan fácil fue completar una tarea
```

---

## Personas — Cómo Hacerlas Útiles (No Decorativas)

La mayoría de personas UX son inútiles porque son demasiado demográficas. Una persona útil captura comportamientos y motivaciones, no edad y ciudad.

### Estructura de persona accionable
```
Nombre + foto representativa (humaniza)

CONTEXTO
  Rol/situación relevante al producto
  Nivel de experiencia tecnológica
  Herramientas actuales que usa

OBJETIVOS (Jobs-to-be-Done)
  ¿Qué progreso quiere hacer en su vida/trabajo?
  ¿Cuál es el resultado final que busca?

FRUSTRACIONES ACTUALES
  ¿Qué le impide lograr ese objetivo hoy?
  ¿Dónde pierde tiempo o energía?

COMPORTAMIENTOS CLAVE
  Hábitos observados en research
  No aspiracionales — reales

SEÑALES EN EL PRODUCTO
  ¿Qué acciones hace este usuario en el producto?
  ¿Qué métricas nos dicen que está teniendo éxito?
```

### Jobs-to-be-Done — framework más preciso que personas
```
"Cuando [situación], quiero [motivación], para [resultado esperado]"

Ejemplo malo:   "El usuario quiere ver sus transacciones"
Ejemplo bueno:  "Cuando recibo un cobro inesperado, quiero verificar rápidamente
                 si fue un error mío o del banco, para saber si necesito reclamar"

El JTBD revela el contexto emocional y funcional — no solo la tarea.
```

---

## Arquitectura de Información

### Principios de IA

**Organización** — agrupa los contenidos según el modelo mental del usuario, no la estructura interna de tu empresa o base de datos.

**Nomenclatura** — usa el lenguaje del usuario. Si ellos dicen "factura" y tú dices "documento fiscal", hay fricción.

**Encontrabilidad** — ¿puede el usuario llegar a X en 3 clics o menos? ¿Lo busca o lo navega?

**Escalabilidad** — ¿tu estructura funciona con 10 ítems? ¿Y con 500?

### Flujos de usuario — cómo documentarlos

```
Nivel 1 — Happy Path:     el flujo ideal sin interrupciones
Nivel 2 — Casos de borde: ¿qué pasa si el usuario hace X inesperado?
Nivel 3 — Casos de error: ¿qué pasa cuando algo falla técnicamente?

Para cada paso del flujo documenta:
  PANTALLA:   qué ve el usuario
  ACCIÓN:     qué puede hacer
  DECISIÓN:   puntos de ramificación del flujo
  CONDICIÓN:  qué determina cada rama
  RESULTADO:  a dónde lleva cada opción
```

### Diagrama de flujo — convenciones estándar
```
[Rectángulo]  → pantalla o estado de la UI
(Rombo)       → punto de decisión (Sí/No)
→             → transición / navegación
[Rectángulo redondeado] → inicio / fin del flujo
//            → proceso del sistema (sin acción del usuario)
```

---

## Auditoría UX — Cómo Hacerla

Una auditoría UX evalúa un producto existente contra heurísticas y principios de diseño.

### Las 10 Heurísticas de Nielsen

1. **Visibilidad del estado del sistema** — el usuario siempre sabe qué está pasando
2. **Coincidencia con el mundo real** — usa el lenguaje y conceptos del usuario
3. **Control y libertad** — salida de emergencia siempre disponible (undo, cancel)
4. **Consistencia y estándares** — los mismos elementos significan lo mismo siempre
5. **Prevención de errores** — diseño que evita problemas antes de que ocurran
6. **Reconocimiento antes que recuerdo** — no obligues al usuario a memorizar
7. **Flexibilidad y eficiencia** — atajos para usuarios expertos
8. **Diseño estético y minimalista** — sin información irrelevante
9. **Ayuda a reconocer, diagnosticar y recuperarse de errores** — mensajes útiles
10. **Ayuda y documentación** — accesible cuando se necesita

### Proceso de auditoría
```
1. Definir alcance:     qué flujos o pantallas se van a revisar
2. Crear checklist:     heurísticas + criterios propios del producto
3. Recorrer el flujo:   como usuario novato, luego como usuario experto
4. Documentar:          captura de pantalla + hallazgo + severidad + recomendación
5. Priorizar:           matriz impacto × esfuerzo
6. Presentar:           resumen ejecutivo + detalle por área
```
