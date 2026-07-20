/*=== APP.JS — LÓGICA DE INTERFAZ E INTERACTIVIDAD ===*/

import { 
    calcularFRC, 
    calcularCAE, 
    calcularGuerchet, 
    calcularPuntosPonderados, 
    calcularBalanceMasa, 
    calcularObrerosMOD, 
    calcularOEE 
} from './core/estudio_tecnico.js';

// Prevenir loops inactivos
window.canvasDrawers = {};

document.addEventListener('DOMContentLoaded', () => {
    initTabs();
    initSimulators();
    initAccordion();
    initKeyboardNav();
    
    // Simple routing based on page name
    const path = window.location.pathname;
    if (path.includes('modulo2.html')) {
        const tab = document.getElementById('tab-btn-4'); // Elementos (Guerchet/SLP)
        if (tab) activateTab(tab);
    } else if (path.includes('modulo3.html')) {
        const tab = document.getElementById('tab-btn-5'); // Caso Práctico (ASME/Mass Balance)
        if (tab) activateTab(tab);
    } else {
        triggerTabDraw('intro');
    }
});

/*=== TAB NAVIGATION ===*/
function initTabs() {
    const tabs = document.querySelectorAll('nav[role="tablist"] button');
    const panels = document.querySelectorAll('section[role="tabpanel"]');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            activateTab(tab);
        });
    });
}

function activateTab(tab) {
    if (!tab) return;
    const tabs = document.querySelectorAll('nav[role="tablist"] button');
    const panels = document.querySelectorAll('section[role="tabpanel"]');
    const tabName = tab.getAttribute('aria-controls');
    
    tabs.forEach(t => {
        t.setAttribute('aria-selected', 'false');
        t.setAttribute('tabindex', '-1');
    });
    tab.setAttribute('aria-selected', 'true');
    tab.setAttribute('tabindex', '0');
    
    panels.forEach(p => {
        p.classList.remove('active');
    });
    const activePanel = document.getElementById(tabName);
    if (activePanel) {
        activePanel.classList.add('active');
    }
    
    // Sync sidebar active class
    const sidebarItems = document.querySelectorAll('.sidebar-menu li');
    sidebarItems.forEach(li => li.classList.remove('active'));
    
    const activeLink = document.querySelector(`.sidebar-menu a[href="#${tabName}"]`);
    if (activeLink && activeLink.parentElement) {
        activeLink.parentElement.classList.add('active');
    }
    
    // Trigger Canvas Draw for the new active tab
    triggerTabDraw(tabName);
}

// Expose globally
window.activateTab = activateTab;

function triggerTabDraw(tabName) {
    if (window.canvasDrawers && window.canvasDrawers[tabName]) {
        setTimeout(() => {
            window.canvasDrawers[tabName]();
        }, 80);
    }
}

/*=== KEYBOARD NAVIGATION ===*/
function initKeyboardNav() {
    const tabs = document.querySelectorAll('nav[role="tablist"] button');
    tabs.forEach((tab, index) => {
        tab.addEventListener('keydown', (e) => {
            let newIndex = index;
            if (e.key === 'ArrowRight') {
                newIndex = (index + 1) % tabs.length;
            } else if (e.key === 'ArrowLeft') {
                newIndex = (index - 1 + tabs.length) % tabs.length;
            } else if (e.key === 'Home') {
                newIndex = 0;
            } else if (e.key === 'End') {
                newIndex = tabs.length - 1;
            } else {
                return;
            }
            e.preventDefault();
            activateTab(tabs[newIndex]);
        });
    });
}

/*=== ACCORDION OF EXERCISES ===*/
function initAccordion() {
    const headers = document.querySelectorAll('.ex-header');
    headers.forEach(h => {
        h.addEventListener('click', () => {
            const content = h.nextElementSibling;
            const exId = h.getAttribute('data-ex');
            
            if (content.style.display === 'block') {
                content.style.display = 'none';
                h.setAttribute('aria-expanded', 'false');
                stopExAnimation(exId);
            } else {
                content.style.display = 'block';
                h.setAttribute('aria-expanded', 'true');
                drawExerciseCanvas(exId, 1);
            }
        });
    });
}

/*=== CANVAS HIGHDPI SCALING ===*/
function getScaledContext(canvas) {
    const rect = canvas.getBoundingClientRect();
    const displayWidth = rect.width || parseInt(canvas.getAttribute('width')) || 400;
    const displayHeight = rect.height || parseInt(canvas.getAttribute('height')) || 250;
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

function drawGrid(ctx, width, height, size = 40) {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.02)';
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

/*=== 12 EXERCISES DATABASE ===*/
const exercisesDb = {
    1: {
        title: "Ejercicio 1: FRC de la Caldera",
        statement: "Calcule el Factor de Recuperación de Capital (FRC) para la caldera de 15 HP de la planta de mermelada, sabiendo que tiene un costo de inversión de $15,000, vida útil de 10 años y una tasa de descuento del 12% anual.",
        steps: [
            "Paso 1: Identificar las variables financieras. Tasa \\(i = 12\\% = 0.12\\), vida útil \\(n = 10\\) años.",
            "Paso 2: Aplicar la fórmula del FRC: \\[\\text{FRC} = \\frac{0.12 \\cdot (1+0.12)^{10}}{(1+0.12)^{10} - 1}\\]",
            "Paso 3: Calcular el resultado final: \\[\\text{FRC} \\approx 0.1770\\] (es decir, el 17.70% de la inversión se recupera anualmente)."
        ],
        draw: (ctx, w, h, step) => {
            drawGrid(ctx, w, h);
            ctx.fillStyle = '#6366f1';
            ctx.fillRect(50, 50, 80, 150); // Caldera shape
            ctx.fillStyle = '#fff';
            ctx.font = '12px Outfit';
            ctx.fillText("Caldera 15 HP", 60, 40);
            ctx.fillText(`FRC: 0.1770`, 160, 120);
        }
    },
    2: {
        title: "Ejercicio 2: Área de la Báscula de Recibo",
        statement: "Calcule la superficie estática (Ss) y gravitacional (Sg) de la báscula de recibo marca Baunken de 1.5 toneladas, la cual mide 1.5m de ancho por 2.0m de largo, con acceso por 2 de sus lados.",
        steps: [
            "Paso 1: Superficie Estática: \\[S_s = l \\times w = 1.5 \\times 2.0 = 3.00 \\text{ m}^2\\]",
            "Paso 2: Superficie de Gravitación: \\[S_g = S_s \\times n = 3.00 \\times 2 = 6.00 \\text{ m}^2\\]"
        ],
        draw: (ctx, w, h, step) => {
            drawGrid(ctx, w, h);
            ctx.strokeStyle = '#a855f7';
            ctx.lineWidth = 2;
            ctx.strokeRect(80, 60, 100, 120); // Static area
            ctx.fillStyle = 'rgba(168, 85, 247, 0.1)';
            ctx.fillRect(80, 60, 100, 120);
            ctx.fillStyle = '#fff';
            ctx.fillText("Ss = 3.0 m²", 100, 120);
        }
    },
    3: {
        title: "Ejercicio 3: Merma en Pelado de Fresa",
        statement: "Un lote de producción inicial tiene 213 kg de fresa fresca. Si la merma del mondado (remoción de pedúnculo y hojas) es del 6.2%, calcule la pulpa de fresa útil resultante.",
        steps: [
            "Paso 1: Calcular los kilogramos de merma: \\[\\text{Merma} = 213 \\times 0.062 = 13.206 \\text{ kg}\\]",
            "Paso 2: Calcular la pulpa limpia: \\[\\text{Pulpa Útil} = 213 - 13.206 = 199.794 \\text{ kg}\\]"
        ],
        draw: (ctx, w, h, step) => {
            drawGrid(ctx, w, h);
            ctx.fillStyle = '#f43f5e';
            ctx.beginPath();
            ctx.arc(80, 120, 35, 0, 2*Math.PI);
            ctx.fill();
            ctx.fillStyle = '#fff';
            ctx.fillText("Fresa: 213 kg", 50, 70);
            ctx.fillText("Merma 6.2%", 160, 120);
        }
    },
    4: {
        title: "Ejercicio 4: Disponibilidad de la Tapadora",
        statement: "En una jornada laboral de 480 minutos, la máquina tapadora automática sufre fallas y reparaciones que suman 45 minutos de inactividad técnica. Calcule la disponibilidad de la máquina.",
        steps: [
            "Paso 1: Calcular el tiempo de operación real: \\[T_{op} = 480 - 45 = 435 \\text{ min}\\]",
            "Paso 2: Calcular la disponibilidad técnica: \\[D = \\frac{435}{480} \\times 100 = 90.63\\%\\]"
        ],
        draw: (ctx, w, h, step) => {
            drawGrid(ctx, w, h);
            ctx.fillStyle = '#10b981';
            ctx.fillRect(60, 80, 200, 25);
            ctx.fillStyle = '#f43f5e';
            ctx.fillRect(260, 80, 30, 25); // Down time
            ctx.fillStyle = '#fff';
            ctx.fillText("Operación: 435 min", 70, 70);
            ctx.fillText("Paro: 45 min", 250, 130);
        }
    },
    5: {
        title: "Ejercicio 5: CAE del Tanque de Escalde",
        statement: "Un tanque de escalde Jerza tiene un costo de inversión de $45,000, costo de operación anual de $8,000, tasa de interés del 12% y vida útil de 10 años. Calcule el Costo Anual Equivalente (CAE).",
        steps: [
            "Paso 1: Usar el FRC de 0.1770 (calculado en Ejercicio 1).",
            "Paso 2: Calcular el costo anual de la inversión: \\[I_{anual} = 45,000 \\times 0.1770 = 7,965 \\text{ USD/año}\\]",
            "Paso 3: Sumar el costo operativo para obtener el CAE: \\[\\text{CAE} = 7,965 + 8,000 = 15,965 \\text{ USD/año}\\]"
        ],
        draw: (ctx, w, h, step) => {
            drawGrid(ctx, w, h);
            ctx.fillStyle = '#f59e0b';
            ctx.fillRect(80, 60, 120, 100); // Tank shape
            ctx.fillStyle = '#fff';
            ctx.fillText("Tanque Escalde", 90, 50);
            ctx.fillText("CAE: $15,965", 95, 120);
        }
    },
    6: {
        title: "Ejercicio 6: Evaluación de Terrenos (Puntos Ponderados)",
        statement: "Compare dos alternativas de terrenos. Terreno A: Cercanía de materia prima (peso 60%, nota 9), Infraestructura (peso 40%, nota 7). Calcule la calificación ponderada total.",
        steps: [
            "Paso 1: Puntuación factor materia prima: \\[0.60 \\times 9 = 5.40\\]",
            "Paso 2: Puntuación factor infraestructura: \\[0.40 \\times 7 = 2.80\\]",
            "Paso 3: Sumar para obtener la calificación total del Terreno A: \\[5.40 + 2.80 = 8.20 / 10\\]"
        ],
        draw: (ctx, w, h, step) => {
            drawGrid(ctx, w, h);
            ctx.fillStyle = '#6366f1';
            ctx.fillRect(60, 60, 100, 100);
            ctx.fillStyle = '#fff';
            ctx.fillText("Terreno A", 80, 50);
            ctx.fillText("Puntaje: 8.20", 75, 110);
        }
    },
    7: {
        title: "Ejercicio 7: Personal de Envasado",
        statement: "Se deben envasar 7,000 frascos de mermelada por día. Si un operario envasa a mano 600 frascos en un turno de 8 horas, ¿cuántos obreros se necesitan para cumplir la meta?",
        steps: [
            "Paso 1: Calcular la cantidad nominal de operarios: \\[N = \\frac{7,000}{600} \\approx 11.67\\]",
            "Paso 2: Redondear al entero superior para asegurar la producción: \\[\\text{Obreros Requeridos} = 12\\]"
        ],
        draw: (ctx, w, h, step) => {
            drawGrid(ctx, w, h);
            ctx.fillStyle = '#a855f7';
            for (let i = 0; i < 12; i++) {
                const x = 50 + (i % 4) * 50;
                const y = 60 + Math.floor(i / 4) * 50;
                ctx.fillRect(x, y, 30, 30); // Worker representation
            }
        }
    },
    8: {
        title: "Ejercicio 8: OEE de la Envasadora",
        statement: "Calcule el OEE de la envasadora automática de frascos si su Disponibilidad es del 90.63%, su Rendimiento es del 92.00% y su Tasa de Calidad es del 98.80%.",
        steps: [
            "Paso 1: Aplicar la fórmula general de OEE: \\[\\text{OEE} = \\text{Disponibilidad} \\times \\text{Rendimiento} \\times \\text{Calidad}\\]",
            "Paso 2: Multiplicar los valores decimales correspondientes: \\[\\text{OEE} = 0.9063 \\times 0.9200 \\times 0.9880 \\approx 0.8238\\]",
            "Paso 3: Convertir a porcentaje: \\[\\text{OEE} \\approx 82.38\\%\\]"
        ],
        draw: (ctx, w, h, step) => {
            drawGrid(ctx, w, h);
            ctx.fillStyle = '#10b981';
            ctx.beginPath();
            ctx.arc(150, 100, 45, 0, 2*Math.PI);
            ctx.fill();
            ctx.fillStyle = '#fff';
            ctx.fillText("OEE: 82.38%", 120, 105);
        }
    },
    9: {
        title: "Ejercicio 9: Layout Guerchet Completo",
        statement: "Determine la superficie total de Guerchet para la envasadora comercial de mermelada (largo = 2.4 m, ancho = 1.2 m, acceso por 2 lados y factor de evolución k = 0.75).",
        steps: [
            "Paso 1: Área estática (Ss): \\[S_s = 2.4 \\times 1.2 = 2.88 \\text{ m}^2\\]",
            "Paso 2: Área de gravitación (Sg): \\[S_g = S_s \\times n = 2.88 \\times 2 = 5.76 \\text{ m}^2\\]",
            "Paso 3: Área de evolución (Se): \\[S_e = (S_s + S_g) \\times k = (2.88 + 5.76) \\times 0.75 = 6.48 \\text{ m}^2\\]",
            "Paso 4: Área total (St): \\[S_t = 2.88 + 5.76 + 6.48 = 15.12 \\text{ m}^2\\]"
        ],
        draw: (ctx, w, h, step) => {
            drawGrid(ctx, w, h);
            ctx.strokeStyle = '#f59e0b';
            ctx.strokeRect(60, 60, 180, 100); // Ss + Sg + Se visual representation
            ctx.fillStyle = 'rgba(245, 158, 11, 0.1)';
            ctx.fillRect(60, 60, 180, 100);
            ctx.fillStyle = '#fff';
            ctx.fillText("St = 15.12 m²", 110, 115);
        }
    },
    10: {
        title: "Ejercicio 10: Penalización de Vogel",
        statement: "Calcule la penalización de fletes para la Planta A si los dos costos unitarios más bajos de envío a los destinos X e Y son $3.00 y $5.00 respectivamente.",
        steps: [
            "Paso 1: Aplicar la regla de penalizaciones de Vogel (diferencia de los dos costos mínimos).",
            "Paso 2: Restar los dos fletes menores: \\[\\text{Penalización} = 5.00 - 3.00 = 2.00 \\text{ USD}\\]"
        ],
        draw: (ctx, w, h, step) => {
            drawGrid(ctx, w, h);
            ctx.strokeStyle = '#6366f1';
            ctx.strokeRect(60, 80, 100, 60);
            ctx.fillStyle = '#fff';
            ctx.fillText("Planta A", 80, 70);
            ctx.fillText("Penalización: $2", 180, 115);
        }
    },
    11: {
        title: "Ejercicio 11: Balance de Concentración",
        statement: "En el concentrador de mermelada Jerza ingresan 199.8 kg de pulpa de fresa y 199.8 kg de azúcar. Si se evapora el 35% del peso total en forma de vapor de agua, calcule el rendimiento final de mermelada y los frascos de 250g obtenidos.",
        steps: [
            "Paso 1: Masa de la mezcla inicial: \\[M_{mix} = 199.8 + 199.8 = 399.60 \\text{ kg}\\]",
            "Paso 2: Calcular el agua evaporada: \\[M_{evap} = 399.60 \\times 0.35 = 139.86 \\text{ kg}\\]",
            "Paso 3: Calcular la mermelada final: \\[M_{mermelada} = 399.60 - 139.86 = 259.74 \\text{ kg}\\]",
            "Paso 4: Calcular frascos de 250g: \\[\\text{Frascos} = \\frac{259.74}{0.25} \\approx 1039 \\text{ unidades}\\]"
        ],
        draw: (ctx, w, h, step) => {
            drawGrid(ctx, w, h);
            ctx.fillStyle = '#f43f5e';
            ctx.fillRect(80, 60, 100, 100);
            ctx.fillStyle = '#fff';
            ctx.fillText("Mezcla: 399.6 kg", 90, 50);
            ctx.fillText("Vapor: 139.8 kg", 200, 80);
        }
    },
    12: {
        title: "Ejercicio 12: Confiabilidad de la Caldera (MTBF y MTTR)",
        statement: "Durante 200 horas de operación, la caldera de la planta de mermeladas sufrió 4 paradas por avería, las cuales demoraron 8 horas en total en ser reparadas. Calcule el MTBF y MTTR.",
        steps: [
            "Paso 1: Calcular el tiempo de operación real: \\[T_{op} = 200 - 8 = 192 \\text{ horas}\\]",
            "Paso 2: Calcular el MTBF (Tiempo medio entre fallas): \\[\\text{MTBF} = \\frac{192}{4} = 48.00 \\text{ horas/falla}\\]",
            "Paso 3: Calcular el MTTR (Tiempo medio para reparar): \\[\\text{MTTR} = \\frac{8}{4} = 2.00 \\text{ horas/reparación}\\]"
        ],
        draw: (ctx, w, h, step) => {
            drawGrid(ctx, w, h);
            ctx.fillStyle = '#10b981';
            ctx.fillRect(50, 80, 200, 20); // MTBF
            ctx.fillStyle = '#f43f5e';
            ctx.fillRect(250, 80, 40, 20); // MTTR
            ctx.fillStyle = '#fff';
            ctx.fillText("MTBF: 48 horas", 80, 70);
            ctx.fillText("MTTR: 2 horas", 240, 120);
        }
    }
};

function drawExerciseCanvas(exId, step) {
    const canvas = document.getElementById(`canvas-ex-${exId}`);
    if (!canvas) return;
    
    const ctx = getScaledContext(canvas);
    const w = canvas.width / (window.devicePixelRatio || 1);
    const h = canvas.height / (window.devicePixelRatio || 1);
    
    ctx.clearRect(0, 0, w, h);
    
    const ex = exercisesDb[exId];
    if (ex && ex.draw) {
        ex.draw(ctx, w, h, step);
    }
}

function stopExAnimation(exId) {
    // Left empty since our exercises drawings are static 2D vector illustrations
}

/*=== SIMULATORS LOGIC ===*/
function initSimulators() {
    // 3D software stack rotation
    const rotX = document.getElementById('rot-x');
    const rotY = document.getElementById('rot-y');
    if (rotX && rotY) {
        rotX.addEventListener('input', rotateStack);
        rotY.addEventListener('input', rotateStack);
    }
    
    // Register the Lange sizing draw method in window.canvasDrawers
    window.canvasDrawers['tema5'] = () => {
        calculateLange();
    };
    
    // SLP diagram hover details is inlined in HTML as showSlpDetails()
}

function rotateStack() {
    const rx = document.getElementById('rot-x').value;
    const ry = document.getElementById('rot-y').value;
    
    const valX = document.getElementById('val-x');
    const valY = document.getElementById('val-y');
    if (valX) valX.innerText = rx;
    if (valY) valY.innerText = ry;
    
    const stack = document.getElementById('software-stack');
    if (stack) {
        stack.style.setProperty('--rotate-x', rx + 'deg');
        stack.style.setProperty('--rotate-y', ry + 'deg');
    }
}

// Lange Sizing draw canvas logic
function calculateLange() {
    const inv = parseFloat(document.getElementById('inv').value) || 0;
    const op = parseFloat(document.getElementById('op_cost').value) || 0;
    const r = (parseFloat(document.getElementById('rate').value) || 0) / 100;
    const n = parseInt(document.getElementById('years').value) || 1;

    if (r <= 0 || n <= 0) return;

    const crf = (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    const cae = (inv * crf) + op;

    const resInv = document.getElementById('res-inv');
    const resOp = document.getElementById('res-op');
    const resTotal = document.getElementById('res-total');
    
    if (resInv) resInv.innerText = '$' + inv.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2});
    if (resOp) resOp.innerText = '$' + op.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2});
    if (resTotal) resTotal.innerText = '$' + cae.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2});
    
    const resultsPanel = document.getElementById('lange-results');
    if (resultsPanel) resultsPanel.style.display = 'block';

    const barFill = document.getElementById('lange-bar');
    if (barFill) {
        barFill.style.width = '0%';
        setTimeout(() => {
            const percentage = Math.min((cae / (inv + op)) * 100, 100);
            barFill.style.width = percentage + '%';
        }, 50);
    }

    drawLangeChart(inv, op, crf);
}

function drawLangeChart(invBase, opBase, crf) {
    const canvas = document.getElementById('lange-chart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const margin = { top: 30, right: 30, bottom: 40, left: 50 };
    const width = canvas.width - margin.left - margin.right;
    const height = canvas.height - margin.top - margin.bottom;

    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(margin.left, margin.top);
    ctx.lineTo(margin.left, canvas.height - margin.bottom);
    ctx.lineTo(canvas.width - margin.right, canvas.height - margin.bottom);
    ctx.stroke();

    ctx.fillStyle = '#f8fafc';
    ctx.font = '10px Outfit';
    ctx.textAlign = 'center';
    ctx.fillText('Capacidad de Planta (Lotes/Día)', margin.left + width / 2, canvas.height - 10);
    
    ctx.save();
    ctx.translate(15, margin.top + height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('Costo Anual ($)', 0, 0);
    ctx.restore();

    const points = [];
    let minCAE = Infinity;
    let optX = 0;
    let optY = 0;

    for (let x = 0.5; x <= 2.5; x += 0.05) {
        const inv = invBase * Math.pow(x, 0.6);
        const op = opBase / Math.sqrt(x);
        const caeVal = (inv * crf) + op;
        points.push({ xVal: x, invCAE: inv * crf, opCAE: op, totalCAE: caeVal });

        if (caeVal < minCAE) {
            minCAE = caeVal;
            optX = x;
            optY = caeVal;
        }
    }

    const getXPixel = (x) => margin.left + ((x - 0.5) / 2.0) * width;
    const getMaxY = () => {
        let max = 0;
        points.forEach(p => {
            if (p.totalCAE > max) max = p.totalCAE;
        });
        return max * 1.1;
    };
    const maxY = getMaxY();
    const getYPixel = (y) => (canvas.height - margin.bottom) - (y / maxY) * height;

    // 1. Inversion Fija Curve (Blue)
    ctx.strokeStyle = '#6366f1';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(getXPixel(points[0].xVal), getYPixel(points[0].invCAE));
    for (let i = 1; i < points.length; i++) {
        ctx.lineTo(getXPixel(points[i].xVal), getYPixel(points[i].invCAE));
    }
    ctx.stroke();

    // 2. Costo Operativo Curve (Orange)
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(getXPixel(points[0].xVal), getYPixel(points[0].opCAE));
    for (let i = 1; i < points.length; i++) {
        ctx.lineTo(getXPixel(points[i].xVal), getYPixel(points[i].opCAE));
    }
    ctx.stroke();

    // 3. Total Cost Curve (Cyan)
    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(getXPixel(points[0].xVal), getYPixel(points[0].totalCAE));
    for (let i = 1; i < points.length; i++) {
        ctx.lineTo(getXPixel(points[i].xVal), getYPixel(points[i].totalCAE));
    }
    ctx.stroke();

    // Dotted lines to optimal point
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.setLineDash([4, 4]);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(getXPixel(optX), getYPixel(optY));
    ctx.lineTo(getXPixel(optX), canvas.height - margin.bottom);
    ctx.moveTo(getXPixel(optX), getYPixel(optY));
    ctx.lineTo(margin.left, getYPixel(optY));
    ctx.stroke();
    ctx.setLineDash([]);

    // Glowing optimal dot
    ctx.fillStyle = '#10b981';
    ctx.beginPath();
    ctx.arc(getXPixel(optX), getYPixel(optY), 6, 0, 2 * Math.PI);
    ctx.fill();
    
    ctx.font = 'bold 8px Outfit';
    ctx.fillStyle = '#10b981';
    ctx.textAlign = 'left';
    ctx.fillText('Óptimo', getXPixel(optX) + 8, getYPixel(optY) - 4);
}
