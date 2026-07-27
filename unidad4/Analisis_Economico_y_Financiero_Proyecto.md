# ANÁLISIS ECONÓMICO Y FINANCIERO DEL PROYECTO

**Fecha:** 27 de julio de 2026  
**Asignatura:** Gestión de Proyectos  
**Carrera:** Ingeniería Industrial  

---

## INTRODUCCIÓN MOTIVADORA

El análisis económico y financiero transforma la viabilidad técnica y operativa de un proyecto de ingeniería en métricas de factibilidad monetaria y sostenibilidad en el tiempo. En la gestión de proyectos industriales, no basta con diseñar un proceso productivo eficiente o una distribución de planta óptima; es imprescindible evaluar la estructura de capital, optimizar el costo de oportunidad y asegurar el retorno de la inversión para maximizar el valor de la organización.

---

## IDEVICE DE LECTURA: FUNDAMENTOS DEL ANÁLISIS ECONÓMICO-FINANCIERO

### Tema 1: Análisis de las Inversiones y Financiamiento

El capital total requerido para la puesta en marcha de un proyecto industrial se divide en tres categorías principales de inversión, acompañadas de la estructura de financiamiento:

1. **Inversión Fija (CapEx - Capital Expenditures):**
   * **Activos Tangibles:** Terrenos, obras civiles, maquinaria, equipos de proceso, instalaciones auxiliares (eléctricas, hidráulicas, neumáticas).
   * **Activos Intangibles:** Licencias de software, patentes, gastos de constitución, estudios previos, capacitación de personal.

2. **Capital de Trabajo (OpEx inicial / Working Capital):**
   * Recursos necesarios para asegurar la operación continua durante el desfase temporal entre los egresos operativos y la recuperación de cartera. Se calcula comúnmente mediante el **método del periodo de desfase** o el **método del ciclo monetario**:

$$\text{Capital de Trabajo} = \left( \frac{\text{Costos Operativos Anuales}}{365} \right) \times \text{Días del Ciclo de Caja}$$

3. **Estructura de Financiamiento y WACC:**
   * La combinación de deuda ($D$) y capital propio ($E$).
   * **Costo Promedio Ponderado de Capital (WACC - Weighted Average Cost of Capital):**

$$\text{WACC} = \left( \frac{E}{V} \times R_e \right) + \left( \frac{D}{V} \times R_d \times (1 - T) \right)$$

*Donde:*
* $V = E + D$ (Valor total de la estructura de financiamiento).
* $R_e$: Costo del capital propio (determinado vía CAPM - *Capital Asset Pricing Model*).
* $R_d$: Tasa de interés de la deuda.
* $T$: Tasa impositiva corporativa (escudo fiscal).

---

### Tema 2: Determinación de Costos, Gastos y Construcciones

Para garantizar una estimación precisa del costo de producción y de las instalaciones civiles, aplicamos la jerarquización de costos industriales:

1. **Costos de Construcción y Obras Civiles:**
   * Estimados mediante el método de parametrización por metro cuadrado ($m^2$) ajustado por factores de complejidad industrial (muros de carga, cimentación para maquinaria pesada, áreas limpias, etc.).

2. **Costos de Producción:**
   * **Costo Directo (CD):** Materia prima directa (MPD) + Mano de obra directa (MOD).
   * **Costos Indirectos de Fabricación (CIF):** Materiales indirectos, mano de obra indirecta (MOI), servicios básicos industriales, mantenimiento preventivo/correctivo y depreciación de maquinaria.

3. **Depreciación de Activos Fijos (Método en Línea Recta):**

$$D_k = \frac{V_0 - V_s}{n}$$

*Donde $V_0$ es el valor inicial del activo, $V_s$ el valor de salvamento y $n$ la vida útil fiscal/técnica.*

4. **Gastos Operativos:**
   * Gastos de Administración (G&A), Gastos de Ventas/Comercialización y Gastos Financieros (intereses de la deuda).

---

### Tema 3: Ingresos y Rentabilidades del Proyecto

La evaluación monetaria requiere proyectar el Flujo de Caja Libre del Proyecto (FCLP) o Flujo de Caja del Inversionista (FCI) a lo largo del horizonte de evaluación ($N$ periodos):

$$\text{FCLP}_t = \text{EBIT}_t \times (1 - T) + \text{Depreciación}_t - \text{CapEx}_t - \Delta\text{Capital de Trabajo}_t$$

#### Indicadores Fundamentales de Rentabilidad

1. **Valor Actual Neto (VAN):**

$$\text{VAN} = \sum_{t=1}^{N} \frac{\text{FCLP}_t}{(1 + k)^t} - I_0$$

*Criterio de decisión:* Si $\text{VAN} > 0$, el proyecto genera valor por encima de la tasa de descuento $k$ ($\text{WACC}$).

2. **Tasa Interna de Retorno (TIR):**
   * Corresponde a la tasa de descuento $r$ que hace que el $\text{VAN} = 0$:

$$\sum_{t=1}^{N} \frac{\text{FCLP}_t}{(1 + r)^t} - I_0 = 0$$

*Criterio de decisión:* Si $\text{TIR} > \text{WACC}$, el proyecto es financieramente rentable.

3. **Periodo de Recuperación de la Inversión Descontado (PRI):**
   * Determina el momento exacto $t^*$ en que los flujos acumulados descontados igualan la inversión inicial $I_0$.

---

### Tema 4: Criterios de Beneficios y Rentabilidades Unitarias

Para la optimización a nivel de planta, la evaluación se traslada del nivel macro al nivel unitario mediante los conceptos de margen de contribución y punto de equilibrio:

1. **Margen de Contribución Unitario ($MC_u$):**

$$MC_u = P_u - CV_u$$

*Donde $P_u$ es el precio de venta unitario y $CV_u$ es el costo variable unitario.*

2. **Punto de Equilibrio Operativo ($Q_{PE}$):**

$$Q_{PE} = \frac{\text{CF Total}}{P_u - CV_u} = \frac{\text{CF Total}}{MC_u}$$

3. **Margen de Utilidad Unitaria ($MU_u$):**

$$MU_u = P_u - CT_u$$

*Donde el Costo Total Unitario es:* $CT_u = CV_u + \frac{\text{CF Total}}{Q_{\text{producido}}}$.

---

## ACTIVIDAD PRÁCTICA: TALLER DE EVALUACIÓN ECONÓMICA Y FINANCIERA

### Caso de Estudio
Una planta de procesamiento industrial evalúa una línea de producción con los siguientes parámetros:
* **Inversión Fija ($I_0$):** $\$250,000$ USD (Maquinaria y Obras Civiles).
* **Capital de Trabajo Inicial:** $\$30,000$ USD.
* **Vida útil del proyecto:** 5 años (sin valor de salvamento al año 5 para fines simplificados).
* **Producción estimada ($Q$):** $50,000$ unidades/año.
* **Precio unitario ($P_u$):** $\$12.00$ USD/unidad.
* **Costo Variable Unitario ($CV_u$):** $\$6.50$ USD/unidad.
* **Costos Fijos Anuales (CF):** $\$110,000$ USD/año (incluye $\$50,000$ USD de depreciación en línea recta).
* **Tasa de Descuento (WACC):** $12\%$.
* **Impuesto a la Renta ($T$):** $25\%$.

#### Consignas de Trabajo:
1. Calcular el Punto de Equilibrio Operativo en unidades ($Q_{PE}$) y en valor monetario.
2. Construir el Estado de Resultados proyectado y determinar el Flujo de Caja Libre para el Año 1 al Año 5 (asumiendo flujo constante).
3. Obtener el Valor Actual Neto ($	ext{VAN}$) y la Tasa Interna de Retorno ($	ext{TIR}$).
4. Determinar la Rentabilidad Unitaria ($MU_u$) al nivel de producción proyectado.

---

## MATRIZ ANALÍTICA: CONFIGURACIÓN DEL IDEVICE EN EXELEARNING

Para asegurar un diseño instruccional con el 100% de Eficiencia Global del Equipo pedagógico (OEE), trazabilidad SCORM e integración de gamificación, se establece la siguiente matriz de configuración en eXeLearning:

| Componente de Configuración | Parámetro en eXeLearning | Especificación de Diseño Instruccional / Técnico |
| :--- | :--- | :--- |
| **Tipo de iDevice** | **Actividad Drop / Cuestionario SCORM / Tarea** | Estructuración en H1 -> Introducción -> Lectura -> Práctica. |
| **Ajustes Generales** | Título y Visibilidad | Nombre estandarizado sin etiquetas "Hidden from students". Estilo de plantilla CSS responsive (p. ej., *INTEF* o *Base*). |
| **Trazabilidad SCORM** | SCORM 1.2 / SCORM 2004 | **Puntuación mínima de aprobación:** 70/100.<br>**Criterio de finalización:** *Completed/Passed* al enviar la resolución del taller. |
| **Tracking de Variables** | `cmi.core.lesson_status`, `cmi.core.score.raw` | Mapeo directo a la libreta de calificaciones de la LMS (Moodle). |
| **Gamificación (Contraseñas)** | iDevice "Candado" / Bloqueo de página | **Contraseña de acceso al examen final:** Calculada mediante el valor entero del $Q_{PE}$ ($Q_{PE} = 20000$). |
| **Retroalimentación** | Inmediata y Explicativa | Inclusión de resolución paso a paso en LaTeX tras cada intento. |

---

## RETROALIMENTACIÓN INMEDIATA DEL TALLER

### 1. Punto de Equilibrio ($Q_{PE}$)

$$MC_u = 12.00 - 6.50 = 5.50 \text{ USD/unidad}$$

$$Q_{PE} = \frac{110,000}{5.50} = 20,000 \text{ unidades/año}$$

### 2. Flujo de Caja Libre Anual (Años 1 a 5)
* **Ingresos:** $50,000 \times 12.00 = \$600,000$ USD
* **Costos Variables:** $50,000 \times 6.50 = \$325,000$ USD
* **Costos Fijos (incluye Depreciación):** $\$110,000$ USD
* **EBIT (Utilidad Operativa):** $600,000 - 325,000 - 110,000 = \$165,000$ USD
* **Impuestos ($25\%$):** $165,000 \times 0.25 = \$41,250$ USD
* **NOPAT ($\	ext{EBIT} \times (1-T)$):** $\$123,750$ USD
* **(+) Depreciación:** $+\$50,000$ USD
* **Flujo de Caja Libre Operativo ($FCLP_t$):** $\$173,750$ USD/año

### 3. Evaluación Financiera ($\	ext{VAN}$ y $\	ext{TIR}$)
* **Inversión Inicial Total ($I_0$):** $\$250,000 \text{ (Fija)} + \$30,000 \text{ (Cap. Trabajo)} = \$280,000$ USD.
* **Flujo de Caja Año 5:** Incluye la recuperación del Capital de Trabajo ($\$173,750 + \$30,000 = \$203,750$ USD).

$$\text{VAN} = -280,000 + \sum_{t=1}^{4} \frac{173,750}{(1+0.12)^t} + \frac{203,750}{(1+0.12)^5}$$

$$\text{VAN} = -280,000 + 527,713.82 = \$247,713.82 \text{ USD}$$

* Como el $\text{VAN} > 0$ y la $\text{TIR} \approx 54.2\% > 12\%$, el proyecto es **financieramente viable y altamente rentable**.
