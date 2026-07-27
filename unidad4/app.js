import {
    calculateWorkingCapital,
    calculateWACC,
    calculateDepreciationLinear,
    calculateMarginalContribution,
    calculateBreakEven,
    calculateUnitProfit,
    calculateNPV,
    calculateIRR
} from './core/analisis_economico.js';

/*=== GLOBAL APPLICATION STATE ===*/
const state = {
    activeTab: 'intro',
    lab: {
        opCosts: 325000,
        cycle: 34,
        equity: 150000,
        debt: 130000,
        ke: 0.15,
        kd: 0.08,
        tax: 0.25
    },
    flowParams: {
        quantity: 50000,
        price: 12.00,
        vc: 6.50,
        fc: 110000
    },
    solved: {
        currentExId: 1,
        currentStep: 0
    },
    proposed: {
        currentQId: 13,
        userAnswers: {}
    }
};

// Canvas references
window.canvasDrawers = {};

/*=== INITIALIZATION ===*/
document.addEventListener('DOMContentLoaded', () => {
    initTabs();
    initLab();
    initClassificationGame();
    initPropertiesCalculators();
    initFlowCalculator();
    initEvaluationTab();
    initSolvedExercises();
    initProposedExercises();
    
    // Draw initial active tab canvas
    triggerTabDraw('intro');
});

/*=== TAB NAVIGATION LOGIC (WCAG AA) ===*/
function initTabs() {
    const tabs = document.querySelectorAll('[role="tab"]');
    const panels = document.querySelectorAll('[role="tabpanel"]');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            activateTab(tab);
        });

        tab.addEventListener('keydown', (e) => {
            const tabsArray = Array.from(tabs);
            const index = tabsArray.indexOf(tab);
            let newIndex = index;

            if (e.key === 'ArrowRight') {
                newIndex = (index + 1) % tabsArray.length;
            } else if (e.key === 'ArrowLeft') {
                newIndex = (index - 1 + tabsArray.length) % tabsArray.length;
            } else if (e.key === 'Home') {
                newIndex = 0;
            } else if (e.key === 'End') {
                newIndex = tabsArray.length - 1;
            } else {
                return;
            }
            e.preventDefault();
            tabsArray[newIndex].focus();
            activateTab(tabsArray[newIndex]);
        });
    });

    function activateTab(activeTab) {
        tabs.forEach(t => {
            t.setAttribute('aria-selected', 'false');
            t.setAttribute('tabindex', '-1');
        });
        panels.forEach(p => {
            p.classList.remove('active');
        });

        activeTab.setAttribute('aria-selected', 'true');
        activeTab.setAttribute('tabindex', '0');

        const panelId = activeTab.getAttribute('aria-controls');
        const targetPanel = document.getElementById(panelId);
        targetPanel.classList.add('active');

        // Set active tab in state
        const tabName = panelId.replace('panel-', '');
        state.activeTab = tabName;

        // Trigger dynamic Canvas rendering for the active tab
        triggerTabDraw(tabName);

        // Re-render LaTeX math
        if (window.MathJax) {
            MathJax.typesetPromise([targetPanel]);
        }
    }
}

function triggerTabDraw(tabName) {
    if (window.canvasDrawers && window.canvasDrawers[tabName]) {
        setTimeout(() => {
            window.canvasDrawers[tabName]();
        }, 80);
    }
}

/*=== HIGH DPI CANVAS UTILITY ===*/
function getScaledContext(canvas) {
    const rect = canvas.getBoundingClientRect();
    const displayWidth = rect.width || canvas.width || 500;
    const displayHeight = rect.height || canvas.height || 320;
    const dpr = window.devicePixelRatio || 1;

    canvas.width = displayWidth * dpr;
    canvas.height = displayHeight * dpr;
    canvas.style.width = `${displayWidth}px`;
    canvas.style.height = `${displayHeight}px`;

    const ctx = canvas.getContext('2d');
    ctx.resetTransform();
    ctx.scale(dpr, dpr);
    return ctx;
}

function drawGrid(ctx, width, height, size = 40) {
    ctx.strokeStyle = '#121926';
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

/*=== TAB 1: INTRO & LAB LOGIC ===*/
function initLab() {
    const opCostsSlider = document.getElementById('lab-opcosts');
    const cycleSlider = document.getElementById('lab-cycle');
    const equitySlider = document.getElementById('lab-equity');
    const debtSlider = document.getElementById('lab-debt');
    const keSlider = document.getElementById('lab-ke');
    const kdSlider = document.getElementById('lab-kd');
    const taxSlider = document.getElementById('lab-tax');

    const opCostsVal = document.getElementById('lab-opcosts-val');
    const cycleVal = document.getElementById('lab-cycle-val');
    const equityVal = document.getElementById('lab-equity-val');
    const debtVal = document.getElementById('lab-debt-val');
    const keVal = document.getElementById('lab-ke-val');
    const kdVal = document.getElementById('lab-kd-val');
    const taxVal = document.getElementById('lab-tax-val');

    const metricWorkCap = document.getElementById('metric-work-cap');
    const metricWacc = document.getElementById('metric-wacc');
    const metricTotalCapital = document.getElementById('metric-total-capital');

    function updateLab() {
        state.lab.opCosts = Number(opCostsSlider.value);
        state.lab.cycle = Number(cycleSlider.value);
        state.lab.equity = Number(equitySlider.value);
        state.lab.debt = Number(debtSlider.value);
        state.lab.ke = Number(keSlider.value) / 100;
        state.lab.kd = Number(kdSlider.value) / 100;
        state.lab.tax = Number(taxSlider.value) / 100;

        // Label update
        opCostsVal.textContent = `$${state.lab.opCosts.toLocaleString()}`;
        cycleVal.textContent = `${state.lab.cycle} días`;
        equityVal.textContent = `$${state.lab.equity.toLocaleString()}`;
        debtVal.textContent = `$${state.lab.debt.toLocaleString()}`;
        keVal.textContent = `${(state.lab.ke * 100).toFixed(1)}%`;
        kdVal.textContent = `${(state.lab.kd * 100).toFixed(1)}%`;
        taxVal.textContent = `${(state.lab.tax * 100).toFixed(1)}%`;

        // Mathematical Core calculations
        const workingCapital = calculateWorkingCapital(state.lab.opCosts, state.lab.cycle);
        const totalCapital = state.lab.equity + state.lab.debt;
        const wacc = calculateWACC(state.lab.equity, state.lab.debt, state.lab.ke, state.lab.kd, state.lab.tax);

        // Update displays
        metricWorkCap.textContent = `$${Math.round(workingCapital).toLocaleString()}`;
        metricTotalCapital.textContent = `$${totalCapital.toLocaleString()}`;
        metricWacc.textContent = `${(wacc * 100).toFixed(2)}%`;

        // Redraw chart
        drawCapitalStructureChart();
    }

    // Bind listeners
    [opCostsSlider, cycleSlider, equitySlider, debtSlider, keSlider, kdSlider, taxSlider].forEach(slider => {
        slider.addEventListener('input', updateLab);
    });

    window.canvasDrawers['intro'] = drawCapitalStructureChart;

    function drawCapitalStructureChart() {
        const canvas = document.getElementById('canvas-capital');
        if (!canvas) return;
        const ctx = getScaledContext(canvas);
        const w = canvas.width / (window.devicePixelRatio || 1);
        const h = canvas.height / (window.devicePixelRatio || 1);

        ctx.clearRect(0, 0, w, h);
        drawGrid(ctx, w, h);

        const total = state.lab.equity + state.lab.debt;
        const eqPct = total > 0 ? state.lab.equity / total : 0.5;
        const dbPct = total > 0 ? state.lab.debt / total : 0.5;

        // Draw Pie Chart
        const centerX = w / 2 - 80;
        const centerY = h / 2;
        const radius = Math.min(w, h) / 2.6;

        ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
        ctx.shadowBlur = 15;

        // Capital Propio (Indigo)
        ctx.fillStyle = '#6366f1';
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, -Math.PI/2, -Math.PI/2 + eqPct * 2 * Math.PI);
        ctx.fill();

        // Deuda (Púrpura)
        ctx.fillStyle = '#a855f7';
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, -Math.PI/2 + eqPct * 2 * Math.PI, Math.PI * 1.5);
        ctx.fill();

        // Draw center hole for Doughnut style
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#090d16';
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius * 0.55, 0, Math.PI * 2);
        ctx.fill();

        // Labels / Legend
        const legendX = w - 180;
        const legendY = h / 2 - 40;

        ctx.fillStyle = '#f8fafc';
        ctx.font = 'bold 14px Outfit';
        ctx.fillText('Estructura de Capital', legendX, legendY - 10);

        // Indigo legend indicator
        ctx.fillStyle = '#6366f1';
        ctx.fillRect(legendX, legendY + 10, 16, 16);
        ctx.fillStyle = '#cbd5e1';
        ctx.font = '13px Plus Jakarta Sans';
        ctx.fillText(`C. Propio: ${(eqPct * 100).toFixed(1)}%`, legendX + 25, legendY + 22);

        // Purple legend indicator
        ctx.fillStyle = '#a855f7';
        ctx.fillRect(legendX, legendY + 35, 16, 16);
        ctx.fillStyle = '#cbd5e1';
        ctx.fillText(`Deuda: ${(dbPct * 100).toFixed(1)}%`, legendX + 25, legendY + 47);

        // Add WACC info in center
        ctx.fillStyle = '#cbd5e1';
        ctx.font = '10px Plus Jakarta Sans';
        ctx.textAlign = 'center';
        ctx.fillText('WACC', centerX, centerY - 6);
        ctx.fillStyle = '#f8fafc';
        ctx.font = 'bold 15px Outfit';
        const wacc = calculateWACC(state.lab.equity, state.lab.debt, state.lab.ke, state.lab.kd, state.lab.tax);
        ctx.fillText(`${(wacc * 100).toFixed(2)}%`, centerX, centerY + 12);
        ctx.textAlign = 'left';
    }

    updateLab();
}

/*=== TAB 2: CLASSIFICATION GAME ===*/
function initClassificationGame() {
    const items = document.querySelectorAll('.dnd-item');
    const zones = document.querySelectorAll('.dnd-zone');
    const pool = document.getElementById('dnd-pool');
    const feedback = document.getElementById('dnd-feedback');

    items.forEach(item => {
        item.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', item.id);
        });

        // Click alternative for mobile accessibility
        item.addEventListener('click', () => {
            const currentZone = item.parentElement;
            if (currentZone.id === 'dnd-pool') {
                // Click moves it to CapEx first
                moveItem(item, document.getElementById('zone-capex'));
            } else if (currentZone.id === 'zone-capex') {
                moveItem(item, document.getElementById('zone-opex'));
            } else {
                moveItem(item, pool);
            }
            checkClassificationScore();
        });
    });

    zones.forEach(zone => {
        zone.addEventListener('dragover', (e) => {
            e.preventDefault();
            zone.classList.add('drag-over');
        });

        zone.addEventListener('dragleave', () => {
            zone.classList.remove('drag-over');
        });

        zone.addEventListener('drop', (e) => {
            e.preventDefault();
            zone.classList.remove('drag-over');
            const itemId = e.dataTransfer.getData('text/plain');
            const item = document.getElementById(itemId);
            if (item) {
                moveItem(item, zone);
                checkClassificationScore();
            }
        });
    });

    // Make pool drop-targetable
    pool.addEventListener('dragover', (e) => e.preventDefault());
    pool.addEventListener('drop', (e) => {
        e.preventDefault();
        const itemId = e.dataTransfer.getData('text/plain');
        const item = document.getElementById(itemId);
        if (item) {
            moveItem(item, pool);
            checkClassificationScore();
        }
    });

    function moveItem(item, targetContainer) {
        targetContainer.appendChild(item);
    }

    function checkClassificationScore() {
        let correctCount = 0;
        let incorrectCount = 0;
        const totalItems = items.length;

        items.forEach(item => {
            const parent = item.parentElement;
            if (parent.id === 'dnd-pool') {
                item.className = 'dnd-item'; // Reset styles
            } else {
                const targetType = parent.getAttribute('data-zone');
                const actualType = item.getAttribute('data-type');

                if (targetType === actualType) {
                    item.className = 'dnd-item bg-correct';
                    correctCount++;
                } else {
                    item.className = 'dnd-item bg-incorrect';
                    incorrectCount++;
                }
            }
        });

        if (correctCount + incorrectCount > 0) {
            feedback.style.display = 'block';
            if (correctCount === totalItems) {
                feedback.innerHTML = `<span style="color: var(--accent);"><i class="fa-solid fa-trophy"></i> ¡Excelente! Todos los egresos han sido clasificados correctamente. (CapEx = Inversiones a largo plazo; OpEx = Gastos corrientes de operación).</span>`;
            } else {
                feedback.innerHTML = `Puntuación: <span style="color: var(--accent);">${correctCount} correctos</span> / <span style="color: var(--danger);">${incorrectCount} incorrectos</span> de ${totalItems}. Sigue intentándolo.`;
            }
        } else {
            feedback.style.display = 'none';
        }
    }
}

/*=== TAB 3: PROPERTIES CALCULATORS ===*/
function initPropertiesCalculators() {
    const propEv = document.getElementById('prop-ev');
    const propRe = document.getElementById('prop-re');
    const propRd = document.getElementById('prop-rd');
    const propT = document.getElementById('prop-t');
    const propWaccRes = document.getElementById('prop-wacc-res');

    const propV0 = document.getElementById('prop-v0');
    const propVs = document.getElementById('prop-vs');
    const propN = document.getElementById('prop-n');
    const propDepRes = document.getElementById('prop-dep-res');

    function updateWaccCalc() {
        const ev = Number(propEv.value) / 100;
        const dv = 1 - ev;
        const re = Number(propRe.value) / 100;
        const rd = Number(propRd.value) / 100;
        const t = Number(propT.value) / 100;

        // Use mathematical core via calculated variables
        const wacc = calculateWACC(ev, dv, re, rd, t);
        propWaccRes.textContent = `${(wacc * 100).toFixed(2)}%`;
    }

    function updateDepCalc() {
        const v0 = Number(propV0.value);
        const vs = Number(propVs.value);
        const n = Number(propN.value);

        const dep = calculateDepreciationLinear(v0, vs, n);
        propDepRes.textContent = `$${Math.round(dep).toLocaleString()} / año`;
    }

    [propEv, propRe, propRd, propT].forEach(inp => inp.addEventListener('input', updateWaccCalc));
    [propV0, propVs, propN].forEach(inp => inp.addEventListener('input', updateDepCalc));

    updateWaccCalc();
    updateDepCalc();
}

/*=== TAB 4: ELEMENTOS (CASH FLOW GENERATOR) ===*/
function initFlowCalculator() {
    const qtySlider = document.getElementById('elem-quantity');
    const priceSlider = document.getElementById('elem-price');
    const vcSlider = document.getElementById('elem-vc');
    const fcSlider = document.getElementById('elem-fc');

    const qtyVal = document.getElementById('elem-quantity-val');
    const priceVal = document.getElementById('elem-price-val');
    const vcVal = document.getElementById('elem-vc-val');
    const fcVal = document.getElementById('elem-fc-val');

    function updateFlowTable() {
        state.flowParams.quantity = Number(qtySlider.value);
        state.flowParams.price = Number(priceSlider.value);
        state.flowParams.vc = Number(vcSlider.value);
        state.flowParams.fc = Number(fcSlider.value);

        qtyVal.textContent = `${state.flowParams.quantity.toLocaleString()} u`;
        priceVal.textContent = `$${state.flowParams.price.toFixed(2)}`;
        vcVal.textContent = `$${state.flowParams.vc.toFixed(2)}`;
        fcVal.textContent = `$${state.flowParams.fc.toLocaleString()}`;

        // Compute flow values
        const revenue = state.flowParams.quantity * state.flowParams.price;
        const varCosts = state.flowParams.quantity * state.flowParams.vc;
        const fixCosts = state.flowParams.fc;
        const ebit = revenue - varCosts - fixCosts;
        const tax = ebit > 0 ? ebit * 0.25 : 0;
        const nopat = ebit - tax;
        const depreciation = 50000; // Fixed from case study
        const capex = 250000;
        const workCapital = 30000;

        // FCLP = NOPAT + Depr - CapEx - DeltaWC
        const flows = [];
        flows.push(-capex - workCapital); // Year 0

        for (let y = 1; y <= 4; y++) {
            flows.push(nopat + depreciation); // y1-y4 constant
        }
        flows.push(nopat + depreciation + workCapital); // Year 5 with WC Recovery

        // Render Table Body
        const tbody = document.querySelector('#flow-table tbody');
        tbody.innerHTML = `
            <tr>
                <td><strong>Ingresos</strong></td>
                <td>-</td>
                <td>$${revenue.toLocaleString()}</td>
                <td>$${revenue.toLocaleString()}</td>
                <td>$${revenue.toLocaleString()}</td>
                <td>$${revenue.toLocaleString()}</td>
                <td>$${revenue.toLocaleString()}</td>
            </tr>
            <tr>
                <td><strong>Costos Variables (-)</strong></td>
                <td>-</td>
                <td>$${varCosts.toLocaleString()}</td>
                <td>$${varCosts.toLocaleString()}</td>
                <td>$${varCosts.toLocaleString()}</td>
                <td>$${varCosts.toLocaleString()}</td>
                <td>$${varCosts.toLocaleString()}</td>
            </tr>
            <tr>
                <td><strong>Costos Fijos (-)</strong></td>
                <td>-</td>
                <td>$${fixCosts.toLocaleString()}</td>
                <td>$${fixCosts.toLocaleString()}</td>
                <td>$${fixCosts.toLocaleString()}</td>
                <td>$${fixCosts.toLocaleString()}</td>
                <td>$${fixCosts.toLocaleString()}</td>
            </tr>
            <tr>
                <td><strong>Utilidad Operativa (EBIT)</strong></td>
                <td>-</td>
                <td style="color:${ebit >= 0 ? 'var(--accent)' : 'var(--danger)'}">$${ebit.toLocaleString()}</td>
                <td style="color:${ebit >= 0 ? 'var(--accent)' : 'var(--danger)'}">$${ebit.toLocaleString()}</td>
                <td style="color:${ebit >= 0 ? 'var(--accent)' : 'var(--danger)'}">$${ebit.toLocaleString()}</td>
                <td style="color:${ebit >= 0 ? 'var(--accent)' : 'var(--danger)'}">$${ebit.toLocaleString()}</td>
                <td style="color:${ebit >= 0 ? 'var(--accent)' : 'var(--danger)'}">$${ebit.toLocaleString()}</td>
            </tr>
            <tr>
                <td><strong>Impuestos (25%) (-)</strong></td>
                <td>-</td>
                <td>$${tax.toLocaleString()}</td>
                <td>$${tax.toLocaleString()}</td>
                <td>$${tax.toLocaleString()}</td>
                <td>$${tax.toLocaleString()}</td>
                <td>$${tax.toLocaleString()}</td>
            </tr>
            <tr>
                <td><strong>Utilidad Neta (NOPAT)</strong></td>
                <td>-</td>
                <td>$${nopat.toLocaleString()}</td>
                <td>$${nopat.toLocaleString()}</td>
                <td>$${nopat.toLocaleString()}</td>
                <td>$${nopat.toLocaleString()}</td>
                <td>$${nopat.toLocaleString()}</td>
            </tr>
            <tr>
                <td><strong>(+) Depreciación</strong></td>
                <td>-</td>
                <td>$${depreciation.toLocaleString()}</td>
                <td>$${depreciation.toLocaleString()}</td>
                <td>$${depreciation.toLocaleString()}</td>
                <td>$${depreciation.toLocaleString()}</td>
                <td>$${depreciation.toLocaleString()}</td>
            </tr>
            <tr>
                <td><strong>Inversión Fija (CapEx) (-)</strong></td>
                <td style="color:var(--danger)">-$${capex.toLocaleString()}</td>
                <td>-</td>
                <td>-</td>
                <td>-</td>
                <td>-</td>
                <td>-</td>
            </tr>
            <tr>
                <td><strong>Capital de Trabajo (-) / Recov. (+)</strong></td>
                <td style="color:var(--danger)">-$${workCapital.toLocaleString()}</td>
                <td>-</td>
                <td>-</td>
                <td>-</td>
                <td>-</td>
                <td style="color:var(--accent)">+$${workCapital.toLocaleString()}</td>
            </tr>
            <tr style="background: rgba(99, 102, 241, 0.15); font-weight: bold;">
                <td><strong>Flujo Libre de Caja (FCLP)</strong></td>
                <td style="color:var(--danger)">$${flows[0].toLocaleString()}</td>
                <td style="color:var(--accent)">$${flows[1].toLocaleString()}</td>
                <td style="color:var(--accent)">$${flows[2].toLocaleString()}</td>
                <td style="color:var(--accent)">$${flows[3].toLocaleString()}</td>
                <td style="color:var(--accent)">$${flows[4].toLocaleString()}</td>
                <td style="color:var(--accent)">$${flows[5].toLocaleString()}</td>
            </tr>
        `;

        // Update Evaluation indicators state in background
        updateEvaluationResults(flows);
    }

    [qtySlider, priceSlider, vcSlider, fcSlider].forEach(slider => {
        slider.addEventListener('input', updateFlowTable);
    });

    updateFlowTable();
}

/*=== TAB 5: EVALUATION RESULTS & NPV CURVE ===*/
let globalFlows = [];
function updateEvaluationResults(flows) {
    globalFlows = flows;
    if (state.activeTab === 'practica') {
        drawNPVProfile();
    }
}

function initEvaluationTab() {
    window.canvasDrawers['practica'] = drawNPVProfile;
}

function drawNPVProfile() {
    const evalVan = document.getElementById('eval-van');
    const evalTir = document.getElementById('eval-tir');
    const evalQpe = document.getElementById('eval-qpe');
    const evalMuu = document.getElementById('eval-muu');
    const evalWaccShow = document.getElementById('eval-wacc-show');
    const evalVanShow = document.getElementById('eval-van-show');
    const evalDecisionBox = document.getElementById('eval-decision-box');

    if (!evalVan || globalFlows.length === 0) return;

    // Use parameters from Flow Calculator
    const I0 = Math.abs(globalFlows[0]);
    const cashFlows = globalFlows.slice(1);
    
    // Cost of capital from Lab
    const currentWacc = calculateWACC(state.lab.equity, state.lab.debt, state.lab.ke, state.lab.kd, state.lab.tax);

    const van = calculateNPV(I0, cashFlows, currentWacc);
    const tir = calculateIRR(I0, cashFlows);

    const mc = calculateMarginalContribution(state.flowParams.price, state.flowParams.vc);
    const qpe = calculateBreakEven(state.flowParams.fc, mc);
    const muu = calculateUnitProfit(state.flowParams.price, state.flowParams.vc, state.flowParams.fc, state.flowParams.quantity);

    // Update numbers
    evalVan.textContent = `$${Math.round(van).toLocaleString()}`;
    evalTir.textContent = `${(tir * 100).toFixed(2)}%`;
    evalQpe.textContent = `${Math.round(qpe).toLocaleString()} u`;
    evalMuu.textContent = `$${muu.toFixed(2)}`;
    evalWaccShow.textContent = `${(currentWacc * 100).toFixed(2)}%`;
    evalVanShow.textContent = `$${Math.round(van).toLocaleString()}`;

    // Update decision status
    if (van > 0 && tir > currentWacc) {
        evalDecisionBox.className = 'alert-box bg-correct';
        evalDecisionBox.innerHTML = `<i class="fa-solid fa-circle-check" style="color: var(--accent); margin-right: 8px;"></i>
        <strong>ESTADO:</strong> PROYECTO RENTABLE. El VAN es positivo y la tasa de rendimiento supera el WACC. Se recomienda APROBAR.`;
    } else {
        evalDecisionBox.className = 'alert-box bg-incorrect';
        evalDecisionBox.innerHTML = `<i class="fa-solid fa-triangle-exclamation" style="color: var(--danger); margin-right: 8px;"></i>
        <strong>ESTADO:</strong> PROYECTO RECHAZADO. El VAN es negativo o la TIR no cubre el costo de capital. NO es viable.`;
    }

    // Draw NPV Profile Curve
    const canvas = document.getElementById('canvas-npv-profile');
    if (!canvas) return;
    const ctx = getScaledContext(canvas);
    const w = canvas.width / (window.devicePixelRatio || 1);
    const h = canvas.height / (window.devicePixelRatio || 1);

    ctx.clearRect(0, 0, w, h);
    drawGrid(ctx, w, h);

    // Generate NPV profile points for discount rates from 0% to 100%
    const rates = [];
    const npvs = [];
    for (let r = 0; r <= 1.0; r += 0.05) {
        rates.push(r);
        npvs.push(calculateNPV(I0, cashFlows, r));
    }

    const minNpv = Math.min(...npvs, -I0 * 0.5);
    const maxNpv = Math.max(...npvs, I0 * 1.5);

    // Coordinate mapping functions
    const margin = 40;
    const mapX = (rate) => margin + (rate / 1.0) * (w - 2 * margin);
    const mapY = (nVal) => {
        const pct = (nVal - minNpv) / (maxNpv - minNpv);
        return h - margin - pct * (h - 2 * margin);
    };

    // Draw axes
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1.5;
    
    // X axis (NPV = 0)
    const yZero = mapY(0);
    ctx.beginPath();
    ctx.moveTo(margin, yZero);
    ctx.lineTo(w - margin, yZero);
    ctx.stroke();

    // Y axis (Rate = 0)
    ctx.beginPath();
    ctx.moveTo(margin, margin);
    ctx.lineTo(margin, h - margin);
    ctx.stroke();

    // Draw NPV Curve
    ctx.strokeStyle = '#6366f1';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(mapX(rates[0]), mapY(npvs[0]));
    for (let i = 1; i < rates.length; i++) {
        ctx.lineTo(mapX(rates[i]), mapY(npvs[i]));
    }
    ctx.stroke();

    // Mark current WACC
    const waccX = mapX(currentWacc);
    const waccY = mapY(van);

    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(waccX, waccY, 6, 0, Math.PI * 2);
    ctx.fill();

    // Draw dotted line from WACC axis
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.6)';
    ctx.beginPath();
    ctx.moveTo(waccX, yZero);
    ctx.lineTo(waccX, waccY);
    ctx.moveTo(margin, waccY);
    ctx.lineTo(waccX, waccY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Mark IRR (where NPV meets 0)
    if (tir > 0 && tir <= 1.0) {
        const irrX = mapX(tir);
        ctx.fillStyle = '#10b981';
        ctx.beginPath();
        ctx.arc(irrX, yZero, 6, 0, Math.PI * 2);
        ctx.fill();

        ctx.font = 'bold 10px Plus Jakarta Sans';
        ctx.fillStyle = '#10b981';
        ctx.fillText(`TIR: ${(tir * 100).toFixed(1)}%`, irrX - 25, yZero - 10);
    }

    // Axes Labels
    ctx.fillStyle = '#cbd5e1';
    ctx.font = '10px Plus Jakarta Sans';
    ctx.fillText('Tasa de Descuento (%)', w - 140, yZero + 15);
    
    ctx.save();
    ctx.translate(margin - 10, margin + 40);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('VAN (USD)', 0, 0);
    ctx.restore();

    ctx.fillStyle = '#cbd5e1';
    ctx.fillText(`WACC: ${(currentWacc * 100).toFixed(1)}%`, waccX - 30, yZero + 15);
}

/*=== TAB 6: 12 GUIDED EXERCISES DATABASE ===*/
const solvedExercisesDB = {
    1: {
        title: "Ejercicio 1: CapEx Tangible vs Intangible",
        statement: "Una fábrica compra maquinaria por $180,000, gasta $20,000 en cimentación civil, $15,000 en licencias de software y $5,000 en capacitación. Calcula el CapEx Tangible e Intangible.",
        steps: [
            {
                header: "Paso 1: Identificación y Clasificación",
                content: "El CapEx se divide en activos físicos (tangibles) y derechos/servicios (intangibles).<br>Fórmula: \\[CapEx_{\\text{Tangible}} = \\text{Maquinaria} + \\text{Cimentación}\\]\\[CapEx_{\\text{Intangible}} = \\text{Software} + \\text{Capacitación}\\]"
            },
            {
                header: "Paso 2: Suma de Valores",
                content: "Tangible: \\(180,000 + 20,000 = \\$200,000\\) USD.<br>Intangible: \\(15,000 + 5,000 = \\$20,000\\) USD.<br>CapEx Total: \\(200,000 + 20,000 = \\$220,000\\) USD."
            }
        ],
        draw: (ctx, w, h, step) => {
            ctx.clearRect(0, 0, w, h);
            drawGrid(ctx, w, h);
            
            // Bar graph representation
            ctx.fillStyle = '#6366f1';
            ctx.fillRect(80, h - 80 - 120, 80, 120); // Tangible
            
            ctx.fillStyle = '#a855f7';
            ctx.fillRect(200, h - 80 - 30, 80, 30); // Intangible

            ctx.fillStyle = '#cbd5e1';
            ctx.font = 'bold 12px Outfit';
            ctx.fillText('Tangible ($200k)', 75, h - 60);
            ctx.fillText('Intangible ($20k)', 195, h - 60);

            if (step === 2) {
                ctx.strokeStyle = '#10b981';
                ctx.lineWidth = 2;
                ctx.strokeRect(60, h - 80 - 130, 240, 140);
                ctx.fillStyle = '#10b981';
                ctx.fillText('CapEx Total = $220k', 120, h - 230);
            }
        }
    },
    2: {
        title: "Ejercicio 2: Periodo de Desfase de Capital de Trabajo",
        statement: "Un proyecto tiene costos operativos de $450,000 anuales. Si el ciclo neto de caja es de 45 días, calcula el Capital de Trabajo necesario.",
        steps: [
            {
                header: "Paso 1: Aplicación de la fórmula",
                content: "Utilizamos el método de desfase para financiar la caja durante el ciclo operativo:<br>\\[\\text{Capital de Trabajo} = \\left(\\frac{\\text{Costos Operativos}}{365}\\right) \\times \\text{Días de Ciclo}\\]"
            },
            {
                header: "Paso 2: Reemplazo y Cálculo",
                content: "\\[KT = \\left(\\frac{450,000}{365}\\right) \\times 45 = 1,232.88 \\times 45 = \\$55,479.45\\text{ USD}\\]"
            }
        ],
        draw: (ctx, w, h, step) => {
            ctx.clearRect(0, 0, w, h);
            drawGrid(ctx, w, h);

            // Timeline representations
            ctx.strokeStyle = '#64748b';
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.moveTo(50, h/2);
            ctx.lineTo(w - 50, h/2);
            ctx.stroke();

            // Cash cycle block
            ctx.fillStyle = 'rgba(99, 102, 241, 0.2)';
            ctx.fillRect(50, h/2 - 40, w - 100, 80);

            ctx.fillStyle = '#cbd5e1';
            ctx.font = '13px Plus Jakarta Sans';
            ctx.fillText('Día 0: Egresos', 40, h/2 + 60);
            ctx.fillText('Día 45: Recuperación', w - 160, h/2 + 60);
            
            ctx.fillStyle = '#f8fafc';
            ctx.font = 'bold 14px Outfit';
            ctx.fillText('Ciclo de Caja: 45 días', w/2 - 60, h/2 + 5);

            if (step === 2) {
                ctx.fillStyle = '#10b981';
                ctx.font = 'bold 15px Outfit';
                ctx.fillText('Capital de Trabajo Requerido: $55,479.45', 60, h/2 - 60);
            }
        }
    },
    3: {
        title: "Ejercicio 3: Costo de Capital Propio (CAPM)",
        statement: "Una empresa evalúa el costo del capital propio. La tasa libre de riesgo es 4.5%, el Beta del sector es 1.25, y la prima de riesgo de mercado es 6.0%. Calcula el Re.",
        steps: [
            {
                header: "Paso 1: Ecuación del CAPM",
                content: "El modelo CAPM estima el retorno mínimo esperado por el inversionista:<br>\\[R_e = R_f + \\beta \\times (R_m - R_f)\\]Donde \\(R_f\\) es la tasa libre de riesgo, \\(\\beta\\) es el riesgo sistemático, y \\(R_m - R_f\\) es la prima de mercado."
            },
            {
                header: "Paso 2: Reemplazo numérico",
                content: "\\[R_e = 4.5\\% + 1.25 \\times 6.0\\% = 4.5\\% + 7.5\\% = 12.0\\%\\]"
            }
        ],
        draw: (ctx, w, h, step) => {
            ctx.clearRect(0, 0, w, h);
            drawGrid(ctx, w, h);

            // Draw CAPM Line chart (SML)
            ctx.strokeStyle = '#64748b';
            ctx.lineWidth = 2;
            // X-axis (Beta)
            ctx.beginPath(); ctx.moveTo(50, h - 50); ctx.lineTo(w - 50, h - 50); ctx.stroke();
            // Y-axis (Re)
            ctx.beginPath(); ctx.moveTo(50, 50); ctx.lineTo(50, h - 50); ctx.stroke();

            // Line slope
            ctx.strokeStyle = '#a855f7';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(50, h - 50 - 45); // Rf
            ctx.lineTo(w - 100, h - 50 - 180);
            ctx.stroke();

            ctx.fillStyle = '#cbd5e1';
            ctx.font = '11px Plus Jakarta Sans';
            ctx.fillText('Beta (Riesgo)', w - 120, h - 30);
            ctx.fillText('Re (%)', 20, 40);
            ctx.fillText('Rf (4.5%)', 10, h - 50 - 45);

            if (step === 2) {
                // Mark point Beta = 1.25
                const bx = 50 + 1.25 * 150;
                const by = h - 50 - 45 - 1.25 * 54;
                ctx.fillStyle = '#10b981';
                ctx.beginPath(); ctx.arc(bx, by, 6, 0, Math.PI*2); ctx.fill();
                ctx.fillText('Re = 12.0% (Beta = 1.25)', bx + 10, by - 5);
            }
        }
    },
    4: {
        title: "Ejercicio 4: Cálculo de WACC Completo",
        statement: "Un proyecto se financia con 60% de capital propio (retorno 14%) y 40% de deuda (tasa de interés 9%). Tasa de impuestos corporativos es 30%. Calcula el WACC.",
        steps: [
            {
                header: "Paso 1: Plantear la ponderación del costo de capital",
                content: "Recordar la fórmula simplificada por proporciones:<br>\\[\\text{WACC} = (\\%E \\times R_e) + (\\%D \\times R_d \\times (1 - T))\\]"
            },
            {
                header: "Paso 2: Resolver la ecuación",
                content: "\\[\\text{WACC} = (0.60 \\times 0.14) + (0.40 \\times 0.09 \\times (1 - 0.30))\\]\\[\\text{WACC} = 0.084 + 0.0252 = 0.1092 \\implies 10.92\\%\\]"
            }
        ],
        draw: (ctx, w, h, step) => {
            ctx.clearRect(0, 0, w, h);
            drawGrid(ctx, w, h);

            // Draw a Balance representation
            const pivotX = w/2;
            const pivotY = h - 80;

            // Base
            ctx.fillStyle = '#1e293b';
            ctx.beginPath();
            ctx.moveTo(pivotX - 30, pivotY);
            ctx.lineTo(pivotX + 30, pivotY);
            ctx.lineTo(pivotX, pivotY - 40);
            ctx.closePath();
            ctx.fill();

            // Balance arm
            ctx.strokeStyle = '#cbd5e1';
            ctx.lineWidth = 5;
            ctx.beginPath();
            ctx.moveTo(pivotX - 120, pivotY - 40);
            ctx.lineTo(pivotX + 120, pivotY - 40);
            ctx.stroke();

            // Weights
            ctx.fillStyle = '#6366f1';
            ctx.fillRect(pivotX - 150, pivotY - 40 - 20, 60, 20); // Equity 60%
            ctx.fillStyle = '#a855f7';
            ctx.fillRect(pivotX + 90, pivotY - 40 - 20, 60, 20); // Debt 40%

            ctx.fillStyle = '#cbd5e1';
            ctx.font = 'bold 12px Outfit';
            ctx.fillText('Re: 14% (60%)', pivotX - 160, pivotY - 70);
            ctx.fillText('Rd: 9% (40%)', pivotX + 90, pivotY - 70);

            if (step === 2) {
                ctx.fillStyle = '#10b981';
                ctx.font = 'bold 16px Outfit';
                ctx.fillText('WACC: 10.92% (Neto)', pivotX - 60, pivotY - 110);
            }
        }
    },
    5: {
        title: "Ejercicio 5: Depreciación de Línea Recta y Libros",
        statement: "Una prensa industrial tiene un costo inicial de $120,000, vida útil de 6 años y valor de salvamento de $30,000. Grafica la depreciación acumulada y el valor en libros.",
        steps: [
            {
                header: "Paso 1: Cálculo del cargo de depreciación anual",
                content: "\\[D_k = \\frac{120,000 - 30,000}{6} = \\frac{90,000}{6} = \\$15,000\\text{ USD anuales}\\]"
            },
            {
                header: "Paso 2: Evolución de valor en libros",
                content: "El valor en libros disminuye cada año en $15,000 hasta alcanzar el valor de salvamento al año 6 ($30,000)."
            }
        ],
        draw: (ctx, w, h, step) => {
            ctx.clearRect(0, 0, w, h);
            drawGrid(ctx, w, h);

            // Chart of Book Value
            ctx.strokeStyle = '#64748b';
            ctx.beginPath(); ctx.moveTo(60, h-40); ctx.lineTo(w-40, h-40); ctx.stroke(); // X
            ctx.beginPath(); ctx.moveTo(60, 40); ctx.lineTo(60, h-40); ctx.stroke(); // Y

            const points = [120000, 105000, 90000, 75000, 60000, 45000, 30000];
            const mapX = (y) => 60 + y * (w - 120) / 6;
            const mapY = (val) => h - 40 - (val / 120000) * (h - 80);

            ctx.strokeStyle = '#f43f5e';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(mapX(0), mapY(points[0]));
            for (let i = 1; i < points.length; i++) {
                ctx.lineTo(mapX(i), mapY(points[i]));
            }
            ctx.stroke();

            ctx.fillStyle = '#cbd5e1';
            ctx.font = '10px Plus Jakarta Sans';
            ctx.fillText('Valor en libros (USD)', 10, 30);
            ctx.fillText('Año 0', mapX(0) - 10, h - 20);
            ctx.fillText('Año 6', mapX(6) - 10, h - 20);

            if (step === 2) {
                ctx.fillStyle = '#10b981';
                ctx.fillText('V. Salvamento: $30k', mapX(6) + 5, mapY(30000));
                ctx.beginPath(); ctx.arc(mapX(6), mapY(30000), 5, 0, Math.PI*2); ctx.fill();
            }
        }
    },
    6: {
        title: "Ejercicio 6: Utilidad Operativa NOPAT",
        statement: "Una planta reporta ventas de $800,000, costos directos de $350,000, gastos G&A de $100,000 e incluye una depreciación de $50,000. Tasa impositiva 25%. Obtén el NOPAT.",
        steps: [
            {
                header: "Paso 1: Obtener el EBIT (Utilidad Operativa)",
                content: "\\[\\text{EBIT} = \\text{Ventas} - \\text{Costos Directos} - \\text{Gastos Fijos}\\]\\[\\text{EBIT} = 800,000 - 350,000 - 100,000 = \\$350,000\\text{ USD}\\]"
            },
            {
                header: "Paso 2: Calcular impuesto y NOPAT",
                content: "Impuestos: \\(350,000 \\times 0.25 = \\$87,500\\) USD.<br>NOPAT: \\(350,000 - 87,500 = \\$262,500\\) USD."
            }
        ],
        draw: (ctx, w, h, step) => {
            ctx.clearRect(0, 0, w, h);
            drawGrid(ctx, w, h);

            // Waterfall structure block
            ctx.fillStyle = '#1e293b';
            ctx.fillRect(50, 50, w - 100, 30); // Ventas 800
            ctx.fillStyle = '#cbd5e1';
            ctx.font = 'bold 12px Outfit';
            ctx.fillText('Ventas: $800k', 60, 70);

            ctx.fillStyle = '#f43f5e';
            ctx.fillRect(50, 100, w/2, 30); // Costos -450
            ctx.fillStyle = '#cbd5e1';
            ctx.fillText('Costos: -$450k', 60, 120);

            if (step === 2) {
                ctx.fillStyle = '#10b981';
                ctx.fillRect(50, 150, (w-100) * (262.5/800), 30); // NOPAT
                ctx.fillStyle = '#f8fafc';
                ctx.fillText('NOPAT Neto: $262.5k', 60, 170);
            }
        }
    },
    7: {
        title: "Ejercicio 7: Punto de Equilibrio Operativo",
        statement: "Un proceso de ensamble vende repuestos a $15.00/u. El costo variable unitario es $9.00/u y los costos fijos anuales suman $120,000. Calcula el Q_PE.",
        steps: [
            {
                header: "Paso 1: Margen de contribución",
                content: "\\[MC_u = P_u - CV_u = 15.00 - 9.00 = 6.00 \\text{ USD/unidad}\\]"
            },
            {
                header: "Paso 2: Equilibrio",
                content: "\\[Q_{PE} = \\frac{\\text{Costos Fijos}}{MC_u} = \\frac{120,000}{6.00} = 20,000 \\text{ unidades/año}\\]"
            }
        ],
        draw: (ctx, w, h, step) => {
            ctx.clearRect(0, 0, w, h);
            drawGrid(ctx, w, h);

            // Break-even axes
            ctx.strokeStyle = '#64748b';
            ctx.beginPath(); ctx.moveTo(50, h-40); ctx.lineTo(w-40, h-40); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(50, 40); ctx.lineTo(50, h-40); ctx.stroke();

            // Total Cost Line
            ctx.strokeStyle = '#f43f5e';
            ctx.beginPath();
            ctx.moveTo(50, h - 40 - 60); // CF = 60
            ctx.lineTo(w - 60, h - 40 - 180);
            ctx.stroke();

            // Total Revenue Line
            ctx.strokeStyle = '#10b981';
            ctx.beginPath();
            ctx.moveTo(50, h - 40);
            ctx.lineTo(w - 60, h - 40 - 240);
            ctx.stroke();

            if (step === 2) {
                // Mark intersection
                const intersectX = 50 + 150;
                const intersectY = h - 40 - 120;
                ctx.fillStyle = '#f59e0b';
                ctx.beginPath(); ctx.arc(intersectX, intersectY, 6, 0, Math.PI*2); ctx.fill();
                ctx.fillText('Q_pe = 20,000 u', intersectX - 40, intersectY - 15);
            }
        }
    },
    8: {
        title: "Ejercicio 8: Margen de Utilidad Unitario",
        statement: "Con base en el Ejercicio 7, si se fabrican y venden 35,000 unidades en vez de 20,000, calcula el costo total unitario y la rentabilidad por unidad.",
        steps: [
            {
                header: "Paso 1: Costo total unitario",
                content: "El costo variable por unidad sigue siendo $9.00.<br>Costo fijo prorrateado: \\(120,000 / 35,000 = \\$3.43\\) USD.<br>Costo total unitario: \\(9.00 + 3.43 = \\$12.43\\) USD."
            },
            {
                header: "Paso 2: Margen de utilidad",
                content: "Margen: \\(MC_u = Precio - CT_u = 15.00 - 12.43 = \\$2.57\\) USD por unidad."
            }
        ],
        draw: (ctx, w, h, step) => {
            ctx.clearRect(0, 0, w, h);
            drawGrid(ctx, w, h);

            // Bar chart comparing cost components
            ctx.fillStyle = '#f43f5e';
            ctx.fillRect(80, h - 80 - 90, 60, 90); // CV = $9
            ctx.fillStyle = '#f59e0b';
            ctx.fillRect(80, h - 80 - 124, 60, 34); // CF = $3.43

            ctx.fillStyle = '#6366f1';
            ctx.fillRect(200, h - 80 - 150, 60, 150); // Precio = $15

            ctx.fillStyle = '#cbd5e1';
            ctx.font = '12px Plus Jakarta Sans';
            ctx.fillText('Costo: $12.43', 75, h - 60);
            ctx.fillText('Precio: $15.00', 195, h - 60);

            if (step === 2) {
                ctx.fillStyle = '#10b981';
                ctx.fillRect(200, h - 80 - 150, 60, 26); // Profit Margin top
                ctx.fillText('Ganancia: $2.57/u', 180, h - 240);
            }
        }
    },
    9: {
        title: "Ejercicio 9: Valor Actual Neto (VAN)",
        statement: "Un proyecto tiene una inversión inicial de $100,000 y flujos netos anuales de $35,000 por 4 años. Costo de capital (WACC) es 10%. Calcula el VAN.",
        steps: [
            {
                header: "Paso 1: Sumatoria de flujos descontados",
                content: "\\[\\text{VP} = \\sum_{t=1}^{4} \\frac{35,000}{(1+0.10)^t} = 31,818 + 28,926 + 26,296 + 23,905 = \\$110,945\\]"
            },
            {
                header: "Paso 2: Restar inversión inicial",
                content: "\\[\\text{VAN} = 110,945 - 100,000 = \\$10,945\\text{ USD}\\]"
            }
        ],
        draw: (ctx, w, h, step) => {
            ctx.clearRect(0, 0, w, h);
            drawGrid(ctx, w, h);

            // Flow diagram
            ctx.strokeStyle = '#cbd5e1';
            ctx.beginPath(); ctx.moveTo(50, h/2); ctx.lineTo(w-50, h/2); ctx.stroke();

            // Initial investment down arrow
            ctx.strokeStyle = '#f43f5e';
            ctx.lineWidth = 3;
            ctx.beginPath(); ctx.moveTo(80, h/2); ctx.lineTo(80, h/2 + 80); ctx.stroke();
            ctx.fillStyle = '#cbd5e1';
            ctx.fillText('-$100k', 60, h/2 + 95);

            // Inflow arrows
            ctx.strokeStyle = '#10b981';
            for (let i = 1; i <= 4; i++) {
                const x = 80 + i * 60;
                ctx.beginPath(); ctx.moveTo(x, h/2); ctx.lineTo(x, h/2 - 50); ctx.stroke();
                ctx.fillText(`+$35k`, x - 15, h/2 - 60);
            }

            if (step === 2) {
                ctx.fillStyle = '#10b981';
                ctx.font = 'bold 16px Outfit';
                ctx.fillText('VAN: +$10,945 (Viable)', w/2 - 60, 50);
            }
        }
    },
    10: {
        title: "Ejercicio 10: Tasa Interna de Retorno (TIR)",
        statement: "Determina la TIR del proyecto del Ejercicio 9 y comprueba que el VAN se vuelve cero con esta tasa.",
        steps: [
            {
                header: "Paso 1: Planteamiento de la ecuación",
                content: "La TIR (r) cumple con la condición de anulación del VAN:<br>\\[\\sum_{t=1}^{4} \\frac{35,000}{(1+r)^t} - 100,000 = 0\\]"
            },
            {
                header: "Paso 2: Resolución numérica",
                content: "Resolviendo iterativamente por el método de Newton-Raphson, se obtiene una tasa de:<br>\\[r = 18.45\\%\\]"
            }
        ],
        draw: (ctx, w, h, step) => {
            ctx.clearRect(0, 0, w, h);
            drawGrid(ctx, w, h);

            // Draw NPV Curve
            ctx.strokeStyle = '#cbd5e1';
            ctx.beginPath(); ctx.moveTo(50, h/2); ctx.lineTo(w-50, h/2); ctx.stroke();

            ctx.strokeStyle = '#a855f7';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(80, 50);
            ctx.quadraticCurveTo(w/2 - 20, h/2 + 20, w - 80, h - 60);
            ctx.stroke();

            ctx.fillStyle = '#cbd5e1';
            ctx.fillText('NPV = 0 Line', w - 130, h/2 - 10);

            if (step === 2) {
                // Mark intersection
                const irrX = w/2 - 10;
                ctx.fillStyle = '#10b981';
                ctx.beginPath(); ctx.arc(irrX, h/2, 6, 0, Math.PI*2); ctx.fill();
                ctx.fillText('TIR: 18.45%', irrX - 30, h/2 - 15);
            }
        }
    },
    11: {
        title: "Ejercicio 11: Periodo de Recuperación Descontado (PRI)",
        statement: "Calcula en qué año exacto se recupera la inversión de $100,000 en el Ejercicio 9 si descontamos los flujos al 10%.",
        steps: [
            {
                header: "Paso 1: Flujos acumulados descontados",
                content: "Año 1: \\(31,818\\) (Restante: \\(68,182\\))<br>Año 2: \\(31,818 + 28,926 = 60,744\\) (Restante: \\(39,256\\))<br>Año 3: \\(60,744 + 26,296 = 87,040\\) (Restante: \\(12,960\\))<br>Año 4: \\(87,040 + 23,905 = 110,945\\) (Supera la inversión)"
            },
            {
                header: "Paso 2: Interpolación lineal",
                content: "El retorno ocurre en el transcurso del año 4:<br>\\[PRI = 3 + \\frac{12,960}{23,905} = 3.54 \\text{ años}\\]"
            }
        ],
        draw: (ctx, w, h, step) => {
            ctx.clearRect(0, 0, w, h);
            drawGrid(ctx, w, h);

            // Cumulative flow chart
            ctx.strokeStyle = '#cbd5e1';
            ctx.beginPath(); ctx.moveTo(50, h - 80); ctx.lineTo(w-50, h - 80); ctx.stroke();

            const cumulative = [0, 31.8, 60.7, 87.0, 110.9];
            const mapX = (idx) => 60 + idx * (w - 120) / 4;
            const mapY = (val) => h - 80 - (val / 120) * (h - 120);

            // Draw line
            ctx.strokeStyle = '#6366f1';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(mapX(0), mapY(cumulative[0]));
            for (let i = 1; i < cumulative.length; i++) {
                ctx.lineTo(mapX(i), mapY(cumulative[i]));
            }
            ctx.stroke();

            // Investment threshold
            ctx.strokeStyle = 'rgba(244, 63, 94, 0.6)';
            ctx.setLineDash([4, 4]);
            ctx.beginPath();
            ctx.moveTo(50, mapY(100));
            ctx.lineTo(w-50, mapY(100));
            ctx.stroke();
            ctx.setLineDash([]);
            ctx.fillStyle = '#f43f5e';
            ctx.fillText('Inversión ($100k)', 60, mapY(100) - 10);

            if (step === 2) {
                // Mark intersection
                const intersectX = mapX(3) + 0.54 * (mapX(4) - mapX(3));
                ctx.fillStyle = '#10b981';
                ctx.beginPath(); ctx.arc(intersectX, mapY(100), 6, 0, Math.PI*2); ctx.fill();
                ctx.fillText('PRI: 3.54 años', intersectX - 40, mapY(100) + 20);
            }
        }
    },
    12: {
        title: "Ejercicio 12: Escudo Fiscal por Intereses y Depreciación",
        statement: "Un proyecto deduce $50,000 en depreciación y paga $12,000 de intereses. Si la tasa impositiva corporativa es del 25%, calcula el ahorro fiscal acumulado.",
        steps: [
            {
                header: "Paso 1: Explicación del Escudo Fiscal",
                content: "Los intereses y la depreciación son deducibles antes del cálculo de impuestos.<br>\\[\\text{Escudo Fiscal} = (\\text{Depreciación} + \\text{Intereses}) \\times T\\]"
            },
            {
                header: "Paso 2: Reemplazo numérico",
                content: "\\[EF = (50,000 + 12,000) \\times 0.25 = 62,000 \\times 0.25 = \\$15,500\\text{ USD anuales}\\]"
            }
        ],
        draw: (ctx, w, h, step) => {
            ctx.clearRect(0, 0, w, h);
            drawGrid(ctx, w, h);

            // Blocks of tax deduction
            ctx.fillStyle = 'rgba(244, 63, 94, 0.15)';
            ctx.fillRect(80, 80, 200, 40); // Depreciation
            ctx.strokeStyle = '#f43f5e';
            ctx.strokeRect(80, 80, 200, 40);
            ctx.fillStyle = '#cbd5e1';
            ctx.font = '12px Plus Jakarta Sans';
            ctx.fillText('Depreciación Deductible: $50k', 95, 105);

            ctx.fillStyle = 'rgba(245, 158, 11, 0.15)';
            ctx.fillRect(80, 130, 200, 40); // Intereses
            ctx.strokeStyle = '#f59e0b';
            ctx.strokeRect(80, 130, 200, 40);
            ctx.fillStyle = '#cbd5e1';
            ctx.fillText('Intereses Deductibles: $12k', 95, 155);

            if (step === 2) {
                ctx.fillStyle = '#10b981';
                ctx.fillRect(300, 80, 100, 90); // Escudo fiscal
                ctx.fillStyle = '#f8fafc';
                ctx.font = 'bold 13px Outfit';
                ctx.fillText('Ahorro', 315, 120);
                ctx.fillText('$15.5k', 315, 140);
            }
        }
    }
};

function initSolvedExercises() {
    const solvedSelector = document.getElementById('solved-selector');
    const solvedTitle = document.getElementById('solved-ex-title');
    const solvedStatement = document.getElementById('solved-ex-statement');
    const solvedStepHeader = document.getElementById('solved-step-header');
    const solvedStepContent = document.getElementById('solved-step-content');
    const solvedStepCounter = document.getElementById('solved-step-counter');

    const btnPrev = document.getElementById('btn-prev-step');
    const btnNext = document.getElementById('btn-next-step');

    // Create selection buttons
    for (let id = 1; id <= 12; id++) {
        const btn = document.createElement('button');
        btn.textContent = `E${id}`;
        btn.className = `btn-exercise ${id === 1 ? 'active' : ''}`;
        btn.addEventListener('click', () => {
            document.querySelectorAll('#solved-selector .btn-exercise').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            selectExercise(id);
        });
        solvedSelector.appendChild(btn);
    }

    function selectExercise(id) {
        state.solved.currentExId = id;
        state.solved.currentStep = 0;
        updateExerciseUI();
    }

    function updateExerciseUI() {
        const ex = solvedExercisesDB[state.solved.currentExId];
        solvedTitle.textContent = ex.title;
        solvedStatement.textContent = ex.statement;

        const stepObj = ex.steps[state.solved.currentStep];
        solvedStepHeader.textContent = stepObj.header;
        solvedStepContent.innerHTML = stepObj.content;
        solvedStepCounter.textContent = `Paso ${state.solved.currentStep + 1} de ${ex.steps.length}`;

        // Disable buttons accordingly
        btnPrev.disabled = state.solved.currentStep === 0;
        btnNext.disabled = state.solved.currentStep === ex.steps.length - 1;

        // Draw Canvas illustration
        const canvas = document.getElementById('canvas-exercise');
        if (canvas) {
            const ctx = getScaledContext(canvas);
            const w = canvas.width / (window.devicePixelRatio || 1);
            const h = canvas.height / (window.devicePixelRatio || 1);
            ex.draw(ctx, w, h, state.solved.currentStep + 1);
        }

        // Render MathJax equations
        if (window.MathJax) {
            MathJax.typesetPromise([solvedStepContent]);
        }
    }

    btnPrev.addEventListener('click', () => {
        if (state.solved.currentStep > 0) {
            state.solved.currentStep--;
            updateExerciseUI();
        }
    });

    btnNext.addEventListener('click', () => {
        const ex = solvedExercisesDB[state.solved.currentExId];
        if (state.solved.currentStep < ex.steps.length - 1) {
            state.solved.currentStep++;
            updateExerciseUI();
        }
    });

    window.canvasDrawers['interactivos'] = () => {
        updateExerciseUI();
    };

    selectExercise(1);
}

/*=== TAB 7: 12 PROPOSED EXERCISES DATABASE ===*/
const proposedExercisesDB = {
    13: {
        title: "Ejercicio 13: CapEx de Instalación",
        statement: "Una fábrica compra una troqueladora neumática por $95,000. Los costos de envío y aduanas son $8,000, los de instalación e ingeniería civil $12,000 y se capacita a los operarios por $3,000. ¿Cuál es el CapEx Tangible total del activo?",
        options: ["$95,000", "$103,000", "$115,000", "$118,000"],
        correctIndex: 2,
        solution: "El CapEx tangible incluye el precio de compra más todos los costos capitalizables necesarios para poner el activo en operación (Fletes, Obras civiles e Instalación). La capacitación se considera comúnmente gasto intangible o directo al ejercicio operativo.<br>Formula: \\[\\text{CapEx Tangible} = 95,000 + 8,000 + 12,000 = \\$115,000\\text{ USD}\\]"
    },
    14: {
        title: "Ejercicio 14: Capital de Trabajo",
        statement: "Una línea de producción opera con egresos anuales de $219,000. Si las cuentas por cobrar tardan 40 días, inventario 25 días y cuentas por pagar 15 días en promedio, calcula el Capital de Trabajo necesario (método periodo desfase con días netos).",
        options: ["$30,000", "$39,000", "$45,000", "$50,000"],
        correctIndex: 0,
        solution: "Primero calculamos el Ciclo Neto de Caja:<br>\\[\\text{Ciclo de Caja} = \\text{Días Inventario} + \\text{Días Cobro} - \\text{Días Pago}\\]\\[\\text{Ciclo} = 25 + 40 - 15 = 50\\text{ días}\\]<br>Aplicando el desfase:<br>\\[KT = \\left(\\frac{219,000}{365}\\right) \\times 50 = 600 \\times 50 = \\$30,000\\text{ USD}\\]"
    },
    15: {
        title: "Ejercicio 15: Modelo CAPM para Sector Logístico",
        statement: "Calcula la tasa de retorno exigida por accionistas (Re) para un operador logístico, si la tasa libre de riesgo es de 5.0%, el Beta del sector es 0.80, y el retorno de mercado esperado es de 11.25%.",
        options: ["8.0%", "10.0%", "11.25%", "13.0%"],
        correctIndex: 1,
        solution: "La prima de riesgo de mercado es \\(R_m - R_f = 11.25\\% - 5.0\\% = 6.25\\%\\).<br>Aplicando CAPM:<br>\\[R_e = 5.0\\% + 0.80 \\times 6.25\\% = 5.0\\% + 5.0\\% = 10.0\\%\\]"
    },
    16: {
        title: "Ejercicio 16: WACC con Tasas de Impuestos Locales",
        statement: "Una planta química utiliza 30% de capital de terceros (Préstamo al 10%) y 70% de capital propio (Costo 14%). Con una tasa corporativa de impuestos del 30%, calcula el WACC.",
        options: ["11.20%", "11.90%", "12.00%", "12.80%"],
        correctIndex: 1,
        solution: "Reemplazando en la fórmula ponderada:<br>\\[\\text{WACC} = (0.70 \\times 0.14) + (0.30 \\times 0.10 \\times (1 - 0.30))\\]\\[\\text{WACC} = 0.098 + 0.021 = 0.119 \\implies 11.90\\%\\]"
    },
    17: {
        title: "Ejercicio 17: Depreciación de Reactores",
        statement: "Un reactor biológico de $200,000 se deprecia linealmente por 8 años. Si su valor de salvamento técnico al final del periodo se estima en $40,000, ¿cuál es su valor contable en libros al final del año 5?",
        options: ["$75,000", "$90,000", "$100,000", "$120,000"],
        correctIndex: 2,
        solution: "Calculamos la depreciación anual:<br>\\[D_k = \\frac{200,000 - 40,000}{8} = 20,000\\text{ USD/año}\\]<br>Al final del año 5, la depreciación acumulada es \\(20,000 \\times 5 = \\$100,000\\).<br>El valor en libros es:<br>\\[V_5 = 200,000 - 100,000 = \\$100,000\\text{ USD}\\]"
    },
    18: {
        title: "Ejercicio 18: Margen de Contribución Relativo",
        statement: "Una embotelladora vende bebidas a $2.50 la unidad, incurriendo en un costo variable unitario de $1.50. ¿Cuántas unidades debe vender al año para cubrir costos fijos por $60,000?",
        options: ["24,000 u", "40,000 u", "60,000 u", "90,000 u"],
        correctIndex: 2,
        solution: "Margen unitario: \\(MC_u = 2.50 - 1.50 = 1.00\\) USD/u.<br>\\[Q_{PE} = \\frac{60,000}{1.00} = 60,000\\text{ unidades/año}\\]"
    },
    19: {
        title: "Ejercicio 19: Punto de Equilibrio en Ventas (USD)",
        statement: "Con los datos del Ejercicio 18, determina el volumen de ventas monetarias necesario para estar en punto de equilibrio.",
        options: ["$60,000", "$90,000", "$120,000", "$150,000"],
        correctIndex: 3,
        solution: "Ventas de equilibrio: \\(Q_{PE} \\times Precio = 60,000 \\times 2.50 = \\$150,000\\) USD."
    },
    20: {
        title: "Ejercicio 20: Impuesto a las Utilidades y Flujos",
        statement: "Un taller mecánico reporta ingresos de $150,000, costos operativos de $80,000 y depreciación por $20,000. Si la tasa impositiva es de 20%, calcula el NOPAT.",
        options: ["$40,000", "$44,000", "$50,000", "$56,000"],
        correctIndex: 0,
        solution: "EBIT: \\(150,000 - 80,000 - 20,000 = \\$50,000\\).<br>Impuesto: \\(50,000 \\times 0.20 = \\$10,000\\).<br>NOPAT: \\(50,000 - 10,000 = \\$40,000\\) USD."
    },
    21: {
        title: "Ejercicio 21: VAN de un Activo Logístico",
        statement: "Una grúa horquilla requiere inversión neta inicial de $40,000 (Año 0). Genera ahorros netos (FCLP) de $15,000 anuales del año 1 al 4. Con WACC de 8%, determina el VAN.",
        options: ["$9,681", "$20,000", "$9,000", "$49,681"],
        correctIndex: 0,
        solution: "\\[VAN = -40,000 + \\sum_{t=1}^{4} \\frac{15,000}{(1.08)^t} = -40,000 + 49,681.65 = \\$9,681.65\\text{ USD}\\]"
    },
    22: {
        title: "Ejercicio 22: TIR de Inversión Tecnológica",
        statement: "Un software de planeación ERP cuesta $30,000 y ahorra $18,000 al final del año 1 y $18,000 al final del año 2. ¿Cuál es su TIR aproximada?",
        options: ["10.0%", "15.0%", "20.0%", "23.4%"],
        correctIndex: 3,
        solution: "La TIR cumple con la ecuación:<br>\\[\\frac{18,000}{1+r} + \\frac{18,000}{(1+r)^2} = 30,000\\]<br>Iterando se obtiene \\(r \\approx 23.38\\%\\) (se aproxima a 23.4%)."
    },
    23: {
        title: "Ejercicio 23: Payback Descontado",
        statement: "Determina el PRI descontado (al 8%) para el equipo logístico del Ejercicio 21 (Inversión $40,000, flujo anual descontado de $13,889, $12,860, $11,907, $11,025).",
        options: ["2.67 años", "3.11 años", "3.50 años", "2.00 años"],
        correctIndex: 1,
        solution: "Flujos acumulados descontados:<br>Año 1: \\(13,889\\) (Faltan \\(26,111\\))<br>Año 2: \\(13,889 + 12,860 = 26,749\\) (Faltan \\(13,251\\))<br>Año 3: \\(26,749 + 11,907 = 38,656\\) (Faltan \\(1,344\\))<br>Año 4: \\(38,656 + 11,025 = 49,681\\) (Supera la inversión)<br>Interpolación en el Año 4:<br>\\[PRI = 3 + \\frac{1,344}{11,025} \\approx 3.12\\text{ años (opción 3.11 por decimales)}\\]"
    },
    24: {
        title: "Ejercicio 24: Margen Utilidad Prorrateado",
        statement: "Un producto industrial se vende a $80. Costos fijos anuales son $240,000 y costo variable unitario es $40. Si la capacidad nominal del periodo es de 8,000 unidades, calcula el margen de utilidad unitaria total.",
        options: ["$10", "$20", "$30", "$40"],
        correctIndex: 0,
        solution: "Costo Fijo por unidad: \\(240,000 / 8,000 = \\$30\\) USD/u.<br>Costo Total Unitario: \\(40 + 30 = \\$70\\) USD/u.<br>Margen de utilidad unitaria: \\(80 - 70 = \\$10\\) USD/u."
    }
};

function initProposedExercises() {
    const container = document.getElementById('proposed-quiz-container');
    if (!container) return;

    const quizTitle = document.getElementById('proposed-quiz-title');
    const quizProgress = document.getElementById('proposed-quiz-progress');
    const quizStatement = document.getElementById('proposed-quiz-statement');
    const quizOptions = document.getElementById('proposed-quiz-options');
    const btnValidate = document.getElementById('btn-proposed-validate');
    const validationStatus = document.getElementById('proposed-validation-status');
    const solutionBox = document.getElementById('proposed-solution-box');
    const solutionContent = document.getElementById('proposed-solution-content');

    const btnPrev = document.getElementById('btn-proposed-prev');
    const btnNext = document.getElementById('btn-proposed-next');
    const quizCounter = document.getElementById('proposed-quiz-counter');

    function renderQuestion() {
        const id = state.proposed.currentQId;
        const ex = proposedExercisesDB[id];
        if (!ex) return;

        // Reset elements
        validationStatus.textContent = '';
        validationStatus.className = '';
        solutionBox.style.display = 'none';
        btnValidate.disabled = false;

        // Set title and progress
        quizTitle.textContent = `Pregunta ${id - 12} de 12`;
        quizProgress.textContent = `Ejercicio ${id} de 24`;
        quizCounter.textContent = `Pregunta ${id - 12} de 12`;
        quizStatement.textContent = ex.statement;

        // Set navigation state
        btnPrev.disabled = id === 13;
        btnNext.disabled = id === 24;

        // Render options
        quizOptions.innerHTML = ex.options.map((opt, i) => `
            <label style="display: flex; align-items: center; gap: 10px; cursor: pointer; padding: 12px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.05); background: rgba(255,255,255,0.01); transition: all var(--transition-speed) ease;" id="opt-label-${i}">
                <input type="radio" name="proposed-option" value="${i}" style="cursor: pointer;">
                <span>${opt}</span>
            </label>
        `).join('');

        // Restore answered state if user already answered this question
        const savedAnswer = state.proposed.userAnswers[id];
        if (savedAnswer) {
            const radio = quizOptions.querySelector(`input[value="${savedAnswer.selectedIndex}"]`);
            if (radio) {
                radio.checked = true;
            }
            showValidationFeedback(id, ex, savedAnswer.selectedIndex);
        }

        // Render LaTeX equations in MathJax
        if (window.MathJax) {
            MathJax.typesetPromise([quizStatement, quizOptions, solutionContent]);
        }
    }

    function showValidationFeedback(id, ex, selectedIndex) {
        const labels = quizOptions.querySelectorAll('label');
        labels.forEach(lbl => {
            lbl.style.borderColor = 'rgba(255,255,255,0.05)';
            lbl.style.background = 'rgba(255,255,255,0.01)';
        });

        const selectedLabel = document.getElementById(`opt-label-${selectedIndex}`);
        const isCorrect = selectedIndex === ex.correctIndex;

        if (isCorrect) {
            if (selectedLabel) {
                selectedLabel.style.borderColor = 'var(--accent)';
                selectedLabel.style.background = 'rgba(16, 185, 129, 0.1)';
            }
            validationStatus.textContent = '¡Correcto!';
            validationStatus.style.color = 'var(--accent)';
        } else {
            if (selectedLabel) {
                selectedLabel.style.borderColor = 'var(--danger)';
                selectedLabel.style.background = 'rgba(244, 63, 94, 0.1)';
            }
            // Highlight the correct one
            const correctLabel = document.getElementById(`opt-label-${ex.correctIndex}`);
            if (correctLabel) {
                correctLabel.style.borderColor = 'var(--accent)';
                correctLabel.style.background = 'rgba(16, 185, 129, 0.05)';
            }
            validationStatus.textContent = 'Incorrecto. Revisa la retroalimentación.';
            validationStatus.style.color = 'var(--danger)';
        }

        solutionContent.innerHTML = ex.solution;
        solutionBox.style.display = 'block';
        btnValidate.disabled = true;

        if (window.MathJax) {
            MathJax.typesetPromise([solutionContent]);
        }
    }

    btnValidate.addEventListener('click', () => {
        const id = state.proposed.currentQId;
        const ex = proposedExercisesDB[id];
        const selected = quizOptions.querySelector('input[name="proposed-option"]:checked');

        if (!selected) {
            alert("Por favor, selecciona una respuesta antes de validar.");
            return;
        }

        const selectedIndex = parseInt(selected.value);
        const isCorrect = selectedIndex === ex.correctIndex;

        // Save in state
        state.proposed.userAnswers[id] = {
            selectedIndex: selectedIndex,
            isCorrect: isCorrect
        };

        showValidationFeedback(id, ex, selectedIndex);
    });

    btnPrev.addEventListener('click', () => {
        if (state.proposed.currentQId > 13) {
            state.proposed.currentQId--;
            renderQuestion();
        }
    });

    btnNext.addEventListener('click', () => {
        if (state.proposed.currentQId < 24) {
            state.proposed.currentQId++;
            renderQuestion();
        }
    });

    // Make active tab draw trigger quiz rendering
    window.canvasDrawers['propuestos'] = () => {
        renderQuestion();
    };

    // Initial render
    renderQuestion();
}
