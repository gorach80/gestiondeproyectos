# 🧠 AGENT PROMPT — Panel Web Económico-Financiero
## Prompt Interno para Diseño de Plataformas Educativas STEM con 10 Capas de Razonamiento

**Tema del Proyecto:** Análisis Económico y Financiero de Proyectos (Ingeniería Industrial)

---

## 1. ARQUITECTURA DE 5 CAPAS

```
┌─────────────────────────────────────────────────────┐
│ Capa 1: Usuario final (navegador Chrome/FF/Safari)  │
├─────────────────────────────────────────────────────┤
│ Capa 2: Interfaz (index.html + style.css)           │ ← WCAG AA
├─────────────────────────────────────────────────────┤
│ Capa 3: Lógica de app (app.js)                      │ ← UI + eventos
├─────────────────────────────────────────────────────┤
│ Capa 4: Núcleo matemático (core/analisis_econ.js)   │ ← FUNCIONES PURAS
├─────────────────────────────────────────────────────┤
│ Capa 5: Infraestructura (build_embed.py)            │ ← Google Sites
└─────────────────────────────────────────────────────┘
```

### Reglas Críticas
- ⚠️ **NUNCA** dupliques lógica matemática fuera de `core/analisis_economico.js`.
- ⚠️ **NUNCA** uses `parseFloat()` sin envolver en `toFiniteNumber()`.
- ⚠️ **NUNCA** añadas un `<canvas>` sin `role="img"` y `aria-label`.
- ⚠️ **NUNCA** añadas una pestaña sin `role="tab"`, `aria-selected`, `aria-controls`, `tabindex`.
- 💡 **SIEMPRE** verifica que `window.canvasDrawers{}` registre solo la pestaña activa.

---

## 2. ANÁLISIS PEDAGÓGICO (7 PESTAÑAS)

| # | Pestaña | Nivel Bloom | Rol Cognitivo | Pregunta |
|---|---|---|---|---|
| 1 | **Intro & Lab** | Recordar | Activación | ¿Qué es esto? ¿Cómo lo toco? |
| 2 | **Clasificación** | Comprender | Categorización | ¿En qué familia cae? |
| 3 | **Propiedades** | Aplicar | Teorema | ¿Qué leyes lo rigen? |
| 4 | **Elementos** | Analizar | Anatomía | ¿De qué partes se compone? |
| 5 | **Evaluación** | Evaluar | Aplicación real | ¿Dónde se usa? |
| 6 | **Ejercicios** | Crear | Práctica guiada | ¿Puedo resolverlo paso a paso? |
| 7 | **Autoevaluación** | Crear | Autoevaluación | ¿Lo domino sin ayuda? |

---

## 3. NÚCLEO MATEMÁTICO AISLADO
El archivo `core/analisis_economico.js` contiene funciones puras que nunca tocan el DOM, Canvas, ni MathJax. Retorna `0` ante inputs inválidos.

---

## 4. ARQUITECTURA VISUAL (SPACE DARK)
- `--bg-dark: #090d16;` (Slate oscuro)
- `--primary: #6366f1;` (Indigo -> estructura)
- `--secondary: #a855f7;` (Púrpura -> conceptos)
- `--accent: #10b981;` (Verde -> éxito)
- `--danger: #f43f5e;` (Rosa -> error/costo)
- Glassmorphism: `.content-card` con blur de 12px y transparencia.

---

## 5. CANVAS + LAZY LOADING
Las animaciones y renderizados de canvas se desactivan en pestañas ocultas mediante el registro `window.canvasDrawers`.

---

## 6. ACCESIBILIDAD WCAG 2.1 AA
- `skip-link` al inicio.
- ARIA completo.
- Navegación por teclado (flechas).
- Contraste de colores mínimo 4.5:1.
- `@media print` para impresión.

---

## 7. TESTING + FAIL-SAFE
Política de fail-safe: Ante cualquier input corrupto (NaN, null, undefined), retorna 0 en lugar de lanzar una excepción que congele la interfaz.

---

## 8. MATHJAX Y LATEX
Uso de escape con doble barra `\\(` y `\\[` en strings dinámicos de JavaScript para evitar conflictos.

---

## 9. BASE DE DATOS DE 24 EJERCICIOS
- 12 Ejercicios Resueltos paso a paso con canvas interactivo (E1 a E12).
- 12 Ejercicios Propuestos tipo test con retroalimentación inmediata en acordeón (E13 a E24).

---

## 10. INFRAESTRUCTURA DE ENTRÁGENO
- `build_embed.py` inlines CSS y JS para generar el bundle único `google_sites_embed.html`.
