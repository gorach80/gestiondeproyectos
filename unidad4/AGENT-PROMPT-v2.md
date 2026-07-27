# 🧠 AGENT PROMPT v2.0 — Panel Web Educativo Interactivo
## Prompt Interno para Diseño de Plataformas STEM con 10 Capas de Razonamiento

**Versión:** 2.0.0
**Fecha:** 2026-07-13
**Rol:** Desarrollador Web Educativo Senior (Qwen3.7)
**Stack objetivo:** Vanilla ES2022 + Canvas 2D + MathJax + Google Sites Embed
**Estilo visual:** Space Dark + Glassmorphism (Outfit + Plus Jakarta Sans)

---

## 🎯 PROPÓSITO DE ESTE DOCUMENTO

Este documento es un **handoff completo** para cualquier agente IA que deba construir un panel web educativo interactivo sobre un tema STEM nuevo. Contiene el **prompt interno actualizado** con 10 capas de razonamiento, derivado de la evolución del proyecto *Radio de Borneo v2.0* y adaptado al contexto de Google Sites.

**Reglas de uso:**
- ✅ Leer este documento ANTES de escribir cualquier línea de código
- ✅ Seguir las 10 capas en orden estricto
- ✅ Nunca duplicar lógica matemática fuera del núcleo aislado
- ✅ Siempre verificar las 7 preguntas de calidad al final

---

## 📋 TABLA DE CONTENIDOS

1. [Arquitectura de 5 Capas](#1-arquitectura-de-5-capas)
2. [Análisis Pedagógico (7 Pestañas)](#2-análisis-pedagógico)
3. [Núcleo Matemático Aislado](#3-núcleo-matemático-aislado)
4. [Arquitectura Visual (Space Dark)](#4-arquitectura-visual)
5. [Canvas + Lazy Loading](#5-canvas--lazy-loading)
6. [Accesibilidad WCAG 2.1 AA](#6-accesibilidad-wcag-21-aa)
7. [Testing + Fail-Safe](#7-testing--fail-safe)
8. [MathJax y LaTeX](#8-mathjax-y-latex)
9. [Base de Datos de 12 Ejercicios](#9-base-de-datos-de-12-ejercicios)
10. [Build + CI/CD + Handoff](#10-build--ci/CD--handoff)
11. [Glosario y Convenciones](#11-glosario-y-convenciones)
12. [Checklist de Verificación Final](#12-checklist-de-verificación-final)

---

## 1. ARQUITECTURA DE 5 CAPAS

### 1.1 Diagrama de Capas

```
┌─────────────────────────────────────────────────────┐
│ Capa 1: Usuario final (navegador Chrome/FF/Safari)  │
├─────────────────────────────────────────────────────┤
│ Capa 2: Interfaz (index.html + style.css)           │ ← WCAG AA
├─────────────────────────────────────────────────────┤
│ Capa 3: Lógica de app (app.js)                      │ ← UI + eventos
├─────────────────────────────────────────────────────┤
│ Capa 4: Núcleo matemático (core/[tema].js)          │ ← FUNCIONES PURAS
├─────────────────────────────────────────────────────┤
│ Capa 5: Infraestructura (build_embed.py)            │ ← Google Sites
└─────────────────────────────────────────────────────┘
```

### 1.2 Principios Rectores

| Principio | Implementación | Verificación |
|---|---|---|
| Separación de responsabilidades | UI en `app.js`, cálculo en `core/[tema].js` | Tests no tocan DOM |
| DRY estricto | Toda la física en el core | `grep "Math.sqrt" app.js = 0` |
| Fail-safe ante errores | NaN → estado conservador | Tests de robustez pasan |
| Lazy loading | Recursos pesados bajo demanda | Flags en `app.js` |
| Zero backend | Todo en cliente | Sin `fetch()` en el código |
| Bundle mínimo | Inline CSS/JS para Google Sites | `google_sites_embed.html` < 500KB |

### 1.3 Reglas Críticas

> ⚠️ **NUNCA** dupliques lógica matemática fuera de `core/[tema].js`.
> ⚠️ **NUNCA** uses `parseFloat()` sin envolver en `toFiniteNumber()`.
> ⚠️ **NUNCA** añadas un `<canvas>` sin `role="img"` y `aria-label`.
> ⚠️ **NUNCA** añadas una pestaña sin `role="tab"`, `aria-selected`, `aria-controls`, `tabindex`.
> ✅ **SIEMPRE** verifica que `window.canvasDrawers{}` registre solo la pestaña activa.

---

## 2. ANÁLISIS PEDAGÓGICO

### 2.1 Las 7 Pestañas Obligatorias

Cada pestaña mapea un **nivel de Bloom** ascendente:

| # | Pestaña | Nivel Bloom | Rol Cognitivo | Pregunta |
|---|---|---|---|---|
| 1 | **Intro & Lab** | Recordar | Activación | ¿Qué es esto? ¿Cómo lo toco? |
| 2 | **Clasificación** | Comprender | Categorización | ¿En qué familia cae? |
| 3 | **Propiedades** | Aplicar | Teorema | ¿Qué leyes lo rigen? |
| 4 | **Elementos** | Analizar | Anatomía | ¿De qué partes se compone? |
| 5 | **Ingeniería/Práctica** | Evaluar | Aplicación real | ¿Dónde se usa? |
| 6 | **12 Ejercicios Interactivos** | Crear | Práctica guiada | ¿Puedo resolverlo paso a paso? |
| 7 | **12 Ejercicios Propuestos** | Crear | Autoevaluación | ¿Lo domino sin ayuda? |

### 2.2 Estructura HTML Semántica

```html
<nav role="tablist" aria-label="Pestañas del panel">
  <button role="tab" aria-selected="true" aria-controls="tab-1" tabindex="0">...</button>
  <button role="tab" aria-selected="false" aria-controls="tab-2" tabindex="-1">...</button>
  ...
</nav>
<main>
  <section role="tabpanel" id="tab-1" aria-labelledby="tab-btn-1">...</section>
  ...
</main>
```

---

## 3. NÚCLEO MATEMÁTICO AISLADO

### 3.1 Archivo `core/[tema].js`

**Regla de oro:** Este archivo **NUNCA** toca el DOM, Canvas, ni MathJax. Solo contiene funciones puras.

```javascript
// src/core/[tema].js — NÚCLEO MATEMÁTICO
// SIN DOM, SIN Canvas, SIN MathJax — SOLO MATEMÁTICAS PURAS

/**
 * Valida si un valor es número finito
 * @param {*} x - Valor a validar
 * @returns {boolean}
 */
export function isValidNumber(x) {
    return typeof x === 'number' && Number.isFinite(x);
}

/**
 * Convierte a número finito con fallback
 * @param {*} x - Valor a convertir
 * @param {number} fallback - Valor por defecto (default: 0)
 * @returns {number}
 */
export function toFiniteNumber(x, fallback = 0) {
    const n = Number(x);
    return Number.isFinite(n) ? n : fallback;
}

/**
 * [Ejemplo] Calcula propiedad específica del tema
 * FAIL-SAFE: retorna 0 ante inputs inválidos
 */
export function calcularPropiedad(param1, param2) {
    if (!isValidNumber(param1) || !isValidNumber(param2)) return 0;
    if (param1 <= 0 || param2 <= 0) return 0;
    // Fórmula específica del tema
    return /* cálculo */;
}
```

### 3.2 Invariantes Fail-Safe

- ✅ `NaN` / `Infinity` / `null` / `string` → retorna el valor más conservador
- ✅ Cobertura 100% del core con tests
- ✅ `grep "Math.sqrt" app.js` debe dar **0 ocurrencias**

---

## 4. ARQUITECTURA VISUAL

### 4.1 Paleta Space Dark

```css
:root {
    --bg-dark: #090d16;
    --bg-deep: #0f172a;
    --card-bg: rgba(30, 41, 59, 0.55);
    --card-border: rgba(255, 255, 255, 0.08);
    --text-primary: #f8fafc;
    --text-secondary: #cbd5e1;
    --primary: #6366f1;      /* Indigo → estructura */
    --secondary: #a855f7;    /* Púrpura → conceptos */
    --accent: #10b981;       /* Verde → éxito/correcto */
    --danger: #f43f5e;       /* Rosa → error/peligro */
    --warning: #f59e0b;      /* Ámbar → avisos */
}
```

### 4.2 Reglas de Color Semántico

| Color | Uso | NO usar para |
|---|---|---|
| 🟣 `#6366f1` Indigo | Estructura principal | Decoración |
| 🟪 `#a855f7` Púrpura | Conceptos secundarios | Texto normal |
| 🟢 `#10b981` Verde | Éxito / convexo / correcto | Advertencia |
| 🔴 `#f43f5e` Rosa | Error / cóncavo / peligro | Éxito |
| 🟡 `#f59e0b` Ámbar | Avisos / resultados críticos | Texto general |

### 4.3 Glassmorphism Funcional

```css
.content-card {
    background: rgba(30, 41, 59, 0.55);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 24px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}
```

> 💡 **Principio:** El blur no es decorativo, *separa capas de información* sin muros visuales.

### 4.4 Tipografía

- **Headings:** `Outfit` (800 weight)
- **Body:** `Plus Jakarta Sans` (400-600 weight)
- **Fórmulas:** MathJax con fuente propia

---

## 5. CANVAS + LAZY LOADING

### 5.1 Registro Global de Dibujadores

```javascript
// app.js — Previene animaciones en pestañas ocultas
window.canvasDrawers = {};

function triggerTabDraw(tabName) {
    if (window.canvasDrawers && window.canvasDrawers[tabName]) {
        setTimeout(() => {
            window.canvasDrawers[tabName]();
        }, 80);
    }
}
```

### 5.2 Soporte Hi-DPI

```javascript
function getScaledContext(canvas) {
    const rect = canvas.getBoundingClientRect();
    const displayWidth = rect.width || parseInt(canvas.getAttribute('width')) || 500;
    const displayHeight = rect.height || parseInt(canvas.getAttribute('height')) || 320;
    const dpr = window.devicePixelRatio || 1;
    
    if (canvas.width !== Math.floor(displayWidth * dpr) || 
        canvas.height !== Math.floor(displayHeight * dpr)) {
        canvas.width = displayWidth * dpr;
        canvas.height = displayHeight * dpr;
        canvas.style.width = `${displayWidth}px`;
        canvas.style.height = `${displayHeight}px`;
    }
    
    const ctx = canvas.getContext('2d');
    ctx.resetTransform();
    ctx.scale(dpr, dpr);
    return ctx;
}
```

### 5.3 Rejilla de Fondo

```javascript
function drawGrid(ctx, width, height, size = 40) {
    ctx.strokeStyle = '#141b2a';
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += size) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
    }
    for (let y = 0; y < height; y += size) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
    }
}
```

### 5.4 Cancelación de Loops Inactivos

```javascript
// Para ejercicios propuestos con animación continua
let runningAnimations = {};

function stopAnimation(exId) {
    if (runningAnimations[exId]) {
        cancelAnimationFrame(runningAnimations[exId].frameId);
        delete runningAnimations[exId];
    }
}
```

> ⚠️ **Regla crítica:** Si un canvas está en `display:none` (pestaña oculta), **NO** debe animarse.

---

## 6. ACCESIBILIDAD WCAG 2.1 AA

### 6.1 Checklist Obligatorio

- ✅ `skip-link` al inicio del `<body>`
- ✅ `role="tablist"` + `role="tab"` + `role="tabpanel"` con ARIA sincronizado
- ✅ `aria-selected`, `aria-controls`, `tabindex` dinámico (0 activo, -1 inactivos)
- ✅ Navegación completa por teclado (flechas, Home, End)
- ✅ `aria-label` en TODO `<canvas>` (son imágenes)
- ✅ `aria-live="polite"` en regiones dinámicas
- ✅ `prefers-reduced-motion` respeta todas las animaciones
- ✅ Contraste mínimo 4.5:1 (texto), 3:1 (UI)
- ✅ `@media print` para impresión
- ✅ `forced-colors` para modo alto contraste

### 6.2 Snippet CSS de Accesibilidad

```css
/* Skip link */
.skip-link {
    position: absolute;
    top: -40px;
    left: 0;
    background: var(--primary);
    color: white;
    padding: 8px 16px;
    z-index: 1000;
    transition: top 0.2s;
}
.skip-link:focus { top: 0; }

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
        animation-duration: 0.01ms !important;
        transition-duration: 0.01ms !important;
    }
}

/* Focus visible */
:focus-visible {
    outline: 3px solid var(--primary);
    outline-offset: 2px;
}
```

### 6.3 Navegación por Teclado

```javascript
// app.js — Navegación ARIA tablist
tabs.forEach((tab, index) => {
    tab.addEventListener('keydown', (e) => {
        let newIndex = index;
        if (e.key === 'ArrowRight') newIndex = (index + 1) % tabs.length;
        else if (e.key === 'ArrowLeft') newIndex = (index - 1 + tabs.length) % tabs.length;
        else if (e.key === 'Home') newIndex = 0;
        else if (e.key === 'End') newIndex = tabs.length - 1;
        else return;
        
        e.preventDefault();
        activateTab(tabs[newIndex]);
    });
});
```

---

## 7. TESTING + FAIL-SAFE

### 7.1 4 Casos Obligatorios por Función

```javascript
// tests/[tema].test.js
describe('calcularPropiedad', () => {
    it('caso nominal: valores válidos', () => {
        expect(calcularPropiedad(10, 5)).toBe(/* esperado */);
    });
    it('caso límite: valores en frontera', () => {
        expect(calcularPropiedad(0, 5)).toBe(0);
    });
    it('caso inválido: n < mínimo → 0 (fail-safe)', () => {
        expect(calcularPropiedad(-1, 5)).toBe(0);
    });
    it('caso corrupto: NaN → 0 (fail-safe)', () => {
        expect(calcularPropiedad(NaN, 5)).toBe(0);
        expect(calcularPropiedad(null, 5)).toBe(0);
        expect(calcularPropiedad("10", 5)).toBe(/* esperado */);
    });
});
```

### 7.2 Política Fail-Safe

> *Ante cualquier input inválido, retorna el estado más conservador (0, false, o PELIGRO), NUNCA propagues silenciosamente el error.*

---

## 8. MATHJAX Y LATEX

### 8.1 Reglas de Escape en Strings JS

```javascript
// ❌ INCORRECTO (rompe el string)
const formula = "\(x^2\)";

// ✅ CORRECTO (doble barra)
const formula = "\\(x^2\\)";

// ✅ ALTERNATIVA (template literal)
const formula = `\\[S_i = (n - 2) \\times 180^\\circ\\]`;
```

### 8.2 Re-renderizado Dinámico

```javascript
// Después de inyectar HTML con LaTeX
function renderMathIn(container) {
    if (window.MathJax) {
        MathJax.typesetPromise([container]).then(() => {
            // Ajustar maxHeight si es acordeón
            if (container.classList.contains('accordion-content')) {
                container.style.maxHeight = container.scrollHeight + 100 + 'px';
            }
        });
    }
}
```

### 8.3 Configuración MathJax en `index.html`

```html
<script>
window.MathJax = {
    tex: {
        inlineMath: [['\\(', '\\)']],
        displayMath: [['\\[', '\\]']]
    },
    svg: { fontCache: 'global' },
    startup: {
        ready: () => {
            MathJax.startup.defaultReady();
        }
    }
};
</script>
<script id="MathJax-script" async 
    src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-svg.js"></script>
```

---

## 9. BASE DE DATOS DE 12 EJERCICIOS

### 9.1 Distribución de Dificultad

```
Básico (4):     E1, E2, E3, E4     → fórmulas directas
Intermedio (4): E5, E6, E7, E8     → despejes y relaciones
Avanzado (4):   E9, E10, E11, E12  → sistemas, áreas complejas, topografía
```

### 9.2 Estructura de Cada Ejercicio

```javascript
const exercisesDatabase = {
    1: {
        title: "Ejercicio 1: [Título]",
        statement: "[Enunciado completo]",
        steps: [
            {
                header: "Paso 1: [Subtítulo]",
                content: "Texto con LaTeX: \\[formula\\]"
            },
            // ... más pasos
        ],
        graphicDesc: [
            "Descripción del canvas en paso 1",
            "Descripción del canvas en paso 2",
            // ...
        ],
        draw: (ctx, w, h, step) => {
            // Función de dibujo específica por paso
            if (step === 1) { /* ... */ }
            if (step === 2) { /* ... */ }
        }
    }
};
```

### 9.3 Principio Clave

> 🎯 **El canvas NO es ilustración, es DEMOSTRACIÓN VIVA del paso actual.** Cada paso debe redibujar el canvas con elementos nuevos.

---

## 10. BUILD + CI/CD + HANDOFF

### 10.1 `build_embed.py`

```python
import os
import re

def build():
    cwd = os.path.dirname(os.path.abspath(__file__))
    index_path = os.path.join(cwd, 'index.html')
    style_path = os.path.join(cwd, 'style.css')
    app_path = os.path.join(cwd, 'app.js')
    output_path = os.path.join(cwd, 'google_sites_embed.html')
    
    with open(index_path, 'r', encoding='utf-8') as f:
        html = f.read()
    with open(style_path, 'r', encoding='utf-8') as f:
        css = f.read()
    with open(app_path, 'r', encoding='utf-8') as f:
        js = f.read()
    
    # Reemplazar CSS link por inline
    html = re.sub(
        r'<link\s+rel="stylesheet"\s+href="style\.css"\s*/?>',
        f'<style>\n{css}\n</style>',
        html
    )
    
    # Reemplazar JS script por inline
    html = re.sub(
        r'<script\s+src="app\.js"\s*></script>',
        f'<script>\n{js}\n</script>',
        html
    )
    
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(html)
    
    print(f"✅ Build exitoso: {output_path}")

if __name__ == '__main__':
    build()
```

### 10.2 Entregables Obligatorios (3 documentos)

1. **`TECHNICAL-INVENTORY.md`** — Arquitectura, API, deuda técnica, roadmap
2. **`AGENT-PROMPT.md`** — Instrucciones para el siguiente agente IA
3. **`SPEC-VS-IMPL.md`** — Comparativo especificación vs implementación

### 10.3 Métricas Objetivo

| Métrica | Objetivo |
|---|---|
| Bundle gzipped | < 500 KB |
| Tests passing | 100% |
| Cobertura core | 100% |
| WCAG AA | Completo |
| Lighthouse Accessibility | ≥ 95 |

---

## 11. GLOSARIO Y CONVENCIONES

### 11.1 Convenciones de Código

- ✅ ES2022 modules (`import`/`export`), NO CommonJS
- ✅ 2 espacios de indentación
- ✅ `const` por defecto, `let` si reasigna, `var` prohibido
- ✅ Comillas simples, template literals para interpolación
- ✅ JSDoc en funciones del core
- ✅ Strings LaTeX con doble barra (`\\(` y `\\[`)
- ✅ Comentarios en español con headers `/*===...===*/`

### 11.2 Estructura de Archivos

```
proyecto/
├── index.html              # Estructura + MathJax CDN + Font Awesome
├── style.css               # Variables + glassmorphism + responsive
├── app.js                  # 7 init*() + DB ejercicios + animaciones
├── core/
│   └── [tema].js           # Núcleo matemático (funciones puras)
├── tests/
│   └── [tema].test.js      # Tests Vitest (cobertura 100%)
├── build_embed.py          # Combina todo para Google Sites
├── google_sites_embed.html # Output final embebible
├── TECHNICAL-INVENTORY.md  # Doc 1 de handoff
├── AGENT-PROMPT.md         # Doc 2 de handoff (este archivo)
└── SPEC-VS-IMPL.md         # Doc 3 de handoff
```

### 11.3 Glosario Técnico

| Término | Definición |
|---|---|
| **Glassmorphism** | Efecto visual con blur + transparencia + borde sutil |
| **Space Dark** | Paleta oscura con acentos neón semánticos |
| **Hi-DPI** | Escalado por `devicePixelRatio` para pantallas retina |
| **Fail-Safe** | Política de retornar estado conservador ante errores |
| **Lazy Loading** | Carga de recursos solo cuando se necesitan |
| **WCAG AA** | Estándar W3C de accesibilidad nivel AA |
| **ARIA** | Atributos HTML para aplicaciones web accesibles |
| **MathJax** | Librería JS para renderizar LaTeX en el navegador |

---

## 12. CHECKLIST DE VERIFICACIÓN FINAL

### 12.1 Las 7 Preguntas de Calidad

Antes de entregar, responde:

1. ¿Esto es **visualmente claro**? (Space Dark + Glassmorphism coherente)
2. ¿Esto es **matemáticamente riguroso**? (Fórmulas verificadas)
3. ¿Esto es **técnicamente eficiente**? (Canvas optimizados, sin loops activos innecesarios)
4. ¿Esto es **pedagógicamente progresivo**? (7 pestañas en orden Bloom)
5. ¿Esto es **accesible para todos**? (WCAG AA completo)
6. ¿Esto es **testeable sin DOM**? (Core aislado)
7. ¿Esto está **documentado para el futuro**? (3 PDFs de handoff)

Si las **7 respuestas** son **SÍ**, el panel está listo. 🚀

### 12.2 Checklist Técnico Pre-Entrega

- [ ] `index.html` tiene DOCTYPE, lang, meta tags, ARIA completo
- [ ] `style.css` incluye `prefers-reduced-motion` y `@media print`
- [ ] `app.js` usa `window.canvasDrawers{}` para control de animaciones
- [ ] `core/[tema].js` tiene funciones puras con fail-safe
- [ ] `tests/[tema].test.js` cubre 4 casos por función
- [ ] `build_embed.py` genera `google_sites_embed.html` funcional
- [ ] Los 12 ejercicios interactivos tienen `steps[]`, `draw()`, `graphicDesc[]`
- [ ] Los 12 ejercicios propuestos usan acordeones con MathJax dinámico
- [ ] Todos los `<canvas>` tienen `role="img"` y `aria-label`
- [ ] Navegación por teclado funciona en todas las pestañas
- [ ] Bundle final < 500 KB gzipped

### 12.3 Flujo de Trabajo Completo

```
FASE 1: ANÁLISIS
  ├─ 1.1 Leer tema y construir glosario de dominio
  ├─ 1.2 Diseñar núcleo matemático (core/[tema].js)
  └─ 1.3 Escribir tests del core (cobertura 100%)

FASE 2: IMPLEMENTACIÓN
  ├─ 2.1 index.html (WCAG AA + ARIA completo)
  ├─ 2.2 style.css (Space Dark + Glassmorphism + reduced-motion)
  ├─ 2.3 app.js (7 init*() + lazy loading + fail-safe)
  └─ 2.4 build_embed.py (combina todo para Google Sites)

FASE 3: VERIFICACIÓN
  ├─ 3.1 npm test (todos los tests pasan)
  ├─ 3.2 npm run build (bundle < 500KB)
  ├─ 3.3 Lighthouse Accessibility ≥ 95
  └─ 3.4 Checklist de handoff completo

FASE 4: DOCUMENTACIÓN
  ├─ 4.1 TECHNICAL-INVENTORY.md
  ├─ 4.2 AGENT-PROMPT.md (este archivo)
  └─ 4.3 SPEC-VS-IMPL.md
```

---

## 🎯 PENSAMIENTO CENTRAL ACTUALIZADO

> **"Diseño como si el estudiante fuera un explorador en un museo interactivo, pero ahora el museo tiene cimientos de ingeniería: núcleo matemático aislado y testeable, accesibilidad universal, carga perezosa inteligente, y documentación de handoff para que el siguiente agente pueda continuar la obra sin perder el hilo."**

Mi *prompt interno* constante es:

**"¿Esto es visualmente claro? ¿Matemáticamente riguroso? ¿Técnicamente eficiente? ¿Pedagógicamente progresivo? ¿Accesible para todos? ¿Testeable sin DOM? ¿Documentado para el futuro?"**

Si las **7 respuestas** son **SÍ**, el panel está listo. 🚀

---

## 📚 REFERENCIAS

- WCAG 2.1 AA: https://www.w3.org/WAI/WCAG21/quickref/
- ARIA Authoring Practices: https://www.w3.org/WAI/ARIA/apg/
- MathJax Docs: https://docs.mathjax.org/
- Canvas API: https://developer.mozilla.org/docs/Web/API/Canvas_API

---

**Fin del documento.**
**Versión:** 2.0.0
**Última actualización:** 2026-07-13
**Mantenedor:** Qwen3.7 — Desarrollador Web Educativo