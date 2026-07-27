/**
 * core/analisis_economico.js
 * 
 * NÚCLEO MATEMÁTICO DE ANÁLISIS ECONÓMICO Y FINANCIERO
 * SIN DOM, SIN CANVAS, SIN MATHJAX — SOLO FUNCIONES PURAS CON FAIL-SAFE
 */

/**
 * Valida si un valor es un número finito.
 * @param {*} x - Valor a validar.
 * @returns {boolean}
 */
export function isValidNumber(x) {
    return typeof x === 'number' && Number.isFinite(x);
}

/**
 * Convierte un valor a número finito con un valor por defecto.
 * @param {*} x - Valor a convertir.
 * @param {number} fallback - Valor por defecto (default: 0).
 * @returns {number}
 */
export function toFiniteNumber(x, fallback = 0) {
    const n = Number(x);
    return Number.isFinite(n) ? n : fallback;
}

/**
 * Calcula el Capital de Trabajo necesario para la operación.
 * Fórmula: Capital de Trabajo = (Costos Operativos Anuales / 365) * Días del Ciclo de Caja
 * 
 * @param {number} annualOperatingCosts - Costos operativos anuales.
 * @param {number} cashCycleDays - Días del ciclo de caja.
 * @returns {number}
 */
export function calculateWorkingCapital(annualOperatingCosts, cashCycleDays) {
    const costs = Number(annualOperatingCosts);
    const days = Number(cashCycleDays);
    if (!Number.isFinite(costs) || !Number.isFinite(days)) return 0;
    if (costs <= 0 || days <= 0) return 0;
    return (costs / 365) * days;
}

/**
 * Calcula el Costo Promedio Ponderado de Capital (WACC).
 * Fórmula: WACC = (E/V * Re) + (D/V * Rd * (1 - T))
 * Donde V = E + D
 * 
 * @param {number} equity - Capital propio (E).
 * @param {number} debt - Deuda (D).
 * @param {number} costOfEquity - Costo de capital propio (Re) en decimal (ej. 0.12).
 * @param {number} costOfDebt - Costo de deuda (Rd) en decimal (ej. 0.08).
 * @param {number} taxRate - Tasa impositiva (T) en decimal (ej. 0.25).
 * @returns {number} WACC en decimal (ej. 0.098).
 */
export function calculateWACC(equity, debt, costOfEquity, costOfDebt, taxRate) {
    const E = Number(equity);
    const D = Number(debt);
    const Re = Number(costOfEquity);
    const Rd = Number(costOfDebt);
    const T = Number(taxRate);

    if (!Number.isFinite(E) || !Number.isFinite(D) || !Number.isFinite(Re) || !Number.isFinite(Rd) || !Number.isFinite(T)) {
        return 0;
    }
    if (E < 0 || D < 0 || Re < 0 || Rd < 0 || T < 0) return 0;
    const V = E + D;
    if (V <= 0) return 0;

    return (E / V) * Re + (D / V) * Rd * (1 - T);
}

/**
 * Calcula la depreciación anual por el método de línea recta.
 * Fórmula: Dk = (V0 - Vs) / n
 * 
 * @param {number} initialValue - Valor inicial (V0).
 * @param {number} salvageValue - Valor de salvamento (Vs).
 * @param {number} lifespan - Vida útil en años (n).
 * @returns {number} Depreciación anual.
 */
export function calculateDepreciationLinear(initialValue, salvageValue, lifespan) {
    const V0 = Number(initialValue);
    const Vs = Number(salvageValue);
    const n = Number(lifespan);

    if (!Number.isFinite(V0) || !Number.isFinite(Vs) || !Number.isFinite(n)) return 0;
    if (V0 <= 0 || n <= 0) return 0;
    if (V0 < Vs) return 0;

    return (V0 - Vs) / n;
}

/**
 * Calcula el margen de contribución unitario.
 * Fórmula: MCu = Pu - CVu
 * 
 * @param {number} price - Precio unitario (Pu).
 * @param {number} variableCost - Costo variable unitario (CVu).
 * @returns {number} Margen de contribución unitario.
 */
export function calculateMarginalContribution(price, variableCost) {
    const Pu = Number(price);
    const CVu = Number(variableCost);
    if (!Number.isFinite(Pu) || !Number.isFinite(CVu)) return 0;
    if (Pu < 0 || CVu < 0 || Pu < CVu) return 0;
    return Pu - CVu;
}

/**
 * Calcula el punto de equilibrio operativo en unidades.
 * Fórmula: Q_PE = CF_Total / MCu
 * 
 * @param {number} fixedCosts - Costos fijos totales (CF).
 * @param {number} marginalContribution - Margen de contribución unitario (MCu).
 * @returns {number} Cantidad de equilibrio (unidades).
 */
export function calculateBreakEven(fixedCosts, marginalContribution) {
    const CF = Number(fixedCosts);
    const MCu = Number(marginalContribution);
    if (!Number.isFinite(CF) || !Number.isFinite(MCu)) return 0;
    if (CF <= 0 || MCu <= 0) return 0;
    return CF / MCu;
}

/**
 * Calcula el margen de utilidad unitario al nivel de producción.
 * Fórmula: MUu = Pu - CTu
 * Donde CTu = CVu + (CF_Total / Q)
 * 
 * @param {number} price - Precio unitario (Pu).
 * @param {number} variableCost - Costo variable unitario (CVu).
 * @param {number} fixedCosts - Costos fijos totales (CF).
 * @param {number} quantity - Cantidad producida/estimada (Q).
 * @returns {number} Margen de utilidad unitario.
 */
export function calculateUnitProfit(price, variableCost, fixedCosts, quantity) {
    const Pu = Number(price);
    const CVu = Number(variableCost);
    const CF = Number(fixedCosts);
    const Q = Number(quantity);

    if (!Number.isFinite(Pu) || !Number.isFinite(CVu) || !Number.isFinite(CF) || !Number.isFinite(Q)) return 0;
    if (Pu < 0 || CVu < 0 || CF < 0 || Q <= 0) return 0;
    return Pu - (CVu + CF / Q);
}

/**
 * Calcula el Valor Actual Neto (VAN / NPV).
 * Fórmula: VAN = -I0 + sum_{t=1}^N (FCLPt / (1 + k)^t)
 * 
 * @param {number} initialInvestment - Inversión inicial total (I0).
 * @param {Array<number>} cashFlows - Flujos de caja neto por año.
 * @param {number} discountRate - Tasa de descuento (k) en decimal.
 * @returns {number} Valor Actual Neto.
 */
export function calculateNPV(initialInvestment, cashFlows, discountRate) {
    const I0 = Number(initialInvestment);
    const k = Number(discountRate);
    if (!Number.isFinite(I0) || !Number.isFinite(k)) return 0;
    if (!Array.isArray(cashFlows) || cashFlows.length === 0) return -I0;

    let sum = 0;
    for (let t = 0; t < cashFlows.length; t++) {
        const val = Number(cashFlows[t]);
        if (!Number.isFinite(val)) return 0;
        sum += val / Math.pow(1 + k, t + 1);
    }
    return -I0 + sum;
}

/**
 * Calcula la Tasa Interna de Retorno (TIR / IRR) usando el método de Newton-Raphson.
 * 
 * @param {number} initialInvestment - Inversión inicial total (I0).
 * @param {Array<number>} cashFlows - Flujos de caja neto por año.
 * @returns {number} TIR en decimal (ej. 0.542 para 54.2%), o 0 si falla.
 */
export function calculateIRR(initialInvestment, cashFlows) {
    const I0 = Number(initialInvestment);
    if (!Number.isFinite(I0) || I0 <= 0) return 0;
    if (!Array.isArray(cashFlows) || cashFlows.length === 0) return 0;

    // Verificar si hay cambios de signo (regla de Descartes)
    let hasPositive = false;
    let hasNegative = true; // Inversión inicial es egreso (-)

    for (let t = 0; t < cashFlows.length; t++) {
        const val = Number(cashFlows[t]);
        if (!Number.isFinite(val)) return 0;
        if (val > 0) hasPositive = true;
        if (val < 0) hasNegative = true;
    }
    if (!hasPositive || !hasNegative) return 0;

    // Método de Newton-Raphson
    let r = 0.1; 
    const maxIterations = 100;
    const tolerance = 1e-7;

    for (let i = 0; i < maxIterations; i++) {
        let npv = -I0;
        let dNpv = 0;

        for (let t = 0; t < cashFlows.length; t++) {
            const f = Number(cashFlows[t]);
            const period = t + 1;
            const factor = Math.pow(1 + r, period);
            npv += f / factor;
            dNpv -= (period * f) / (factor * (1 + r));
        }

        if (Math.abs(dNpv) < tolerance) {
            break;
        }

        const nextR = r - npv / dNpv;
        
        if (!Number.isFinite(nextR) || nextR < -0.99 || nextR > 50.0) {
            break;
        }

        if (Math.abs(nextR - r) < tolerance) {
            return nextR;
        }
        r = nextR;
    }

    // Fallback: Método de Bisección
    let low = -0.99;
    let high = 10.0;
    let mid = 0;
    for (let i = 0; i < 50; i++) {
        mid = (low + high) / 2;
        let npv = -I0;
        for (let t = 0; t < cashFlows.length; t++) {
            npv += Number(cashFlows[t]) / Math.pow(1 + mid, t + 1);
        }
        if (Math.abs(npv) < 1e-5) {
            return mid;
        }
        if (npv > 0) {
            low = mid;
        } else {
            high = mid;
        }
    }

    return mid;
}
