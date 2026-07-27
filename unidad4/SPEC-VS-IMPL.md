# SPECIFICATION VS IMPLEMENTATION: Economic & Financial Analysis Dashboard

This document provides a comparative analysis of the requirements specified in the project definition and the actual implemented code.

| Category / Requirement | Stated Specification | Technical Implementation | Status |
| :--- | :--- | :--- | :--- |
| **Inversión Fija (CapEx)** | Tangibles (maquinaria, obras) y Intangibles (licencias, software). | Modeled in Lab, Classification Game, and Exercises 1 and 13. | ✅ Cumplido |
| **Capital de Trabajo** | \(KT = (Costos / 365) \times Ciclo\) | Implemented in `calculateWorkingCapital` (core) & dynamic slider in Lab. | ✅ Cumplido |
| **WACC Formula** | \((E/V \times Re) + (D/V \times Rd \times (1-T))\) | Implemented in `calculateWACC` (core) & dynamic slider in Lab. | ✅ Cumplido |
| **Depreciación Lineal** | \(D_k = (V_0 - V_s) / n\) | Implemented in `calculateDepreciationLinear` (core) & Calculator. | ✅ Cumplido |
| **Punto de Equilibrio** | \(Q_{PE} = CF / (P_u - CV_u)\) | Implemented in `calculateBreakEven` (core) & dynamic updates on Tab 5. | ✅ Cumplido |
| **Utilidad Operativa (EBIT)** | \(Ingresos - CV - CF\) | Calculated dynamically in the 5-Year Cash Flow Projection Table. | ✅ Cumplido |
| **Flujo de Caja Libre (FCLP)** | \(EBIT(1-T) + Depr - CapEx - \Delta KT\) | Calculated dynamically in the 5-Year Cash Flow Projection Table. | ✅ Cumplido |
| **Evaluación Financiera (VAN)** | \(\sum FCLP_t / (1+k)^t - I_0\) | Implemented in `calculateNPV` (core). Corrects the case study summation error. | ✅ Cumplido |
| **Evaluación Financiera (TIR)** | Rate making VAN = 0 | Implemented in `calculateIRR` (core) using Newton-Raphson + Bisection. | ✅ Cumplido |
| **Space Dark Theme** | Slate dark theme, glassmorphism card panels. | Variables and CSS rules applied in `style.css` (Outfit + Plus Jakarta Sans). | ✅ Cumplido |
| **Canvas Graphics** | Visual dynamic canvas drawings for elements. | Implemented: 1. Capital structure pie chart; 2. NPV profile curve; 3. Exercise diagrams. | ✅ Cumplido |
| **WCAG 2.1 AA** | Keyboard navigation, ARIA tags, Skip link. | Validated in `index.html` (tablist roles) & `app.js` (Arrow navigation). | ✅ Cumplido |
| **12 Solved Exercises** | E1 to E12 with step-by-step canvas. | Full database implemented in `app.js` with dynamic step rendering. | ✅ Cumplido |
| **12 Proposed Exercises** | E13 to E24 with accordion & LaTeX. | Full database implemented in `app.js` with expandable answers & MathJax. | ✅ Cumplido |
| **Single Bundle Embed** | `google_sites_embed.html` < 500KB | Compiled via `build_embed.py`. Final size: **116.72 KB**. | ✅ Cumplido |
| **Test Coverage** | 100% Core functionality coverage. | Completed using Node test runner in `tests/`. All 10 tests pass. | ✅ Cumplido |

---

## Developer Comments on sum discrepancies:
As documented in `TECHNICAL-INVENTORY.md`, the case study's reported NPV of `$247,713.82` has been identified as a calculation error (forgetting to add the discounted Year 5 cash flow). The application displays both the mathematically correct 5-year NPV (`$363,353`) and explains the 4-year error (`$247,714`) to ensure double academic rigor.
