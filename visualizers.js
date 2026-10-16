/* ==========================================================================
   SIMULADORES Y VISUALIZADORES INTERACTIVOS
   Listas Doblemente Ligadas, Algoritmos, Colas, Pilas y Modelado
   ========================================================================== */

// Sonidos sintetizados por Web Audio API para interactividad
const SoundFX = {
  ctx: null,
  enabled: true,
  init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
  },
  playTone(freq = 440, type = 'sine', duration = 0.12) {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      if (this.ctx.state === 'suspended') this.ctx.resume();
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch(e) {}
  },
  click() { this.playTone(600, 'triangle', 0.05); },
  success() {
    this.playTone(523.25, 'sine', 0.1);
    setTimeout(() => this.playTone(659.25, 'sine', 0.15), 100);
    setTimeout(() => this.playTone(783.99, 'sine', 0.2), 200);
  },
  pointer() { this.playTone(350, 'sawtooth', 0.08); },
  warn() { this.playTone(220, 'square', 0.15); }
};

// ==========================================================================
// 1. FIGURA III.18 - LISTA DOBLEMENTE LIGADA ESTÁNDAR (Pág 80)
// ==========================================================================
window.Fig18 = {
  currentIndex: -1,
  direction: 'none',
  timer: null,

  init() {
    this.reset();
  },

  reset() {
    if (this.timer) clearInterval(this.timer);
    this.currentIndex = -1;
    this.direction = 'none';
    this.updateUI("Lista en reposo. Usa los botones para recorrer hacia adelante o atrás.");
    const nodes = document.querySelectorAll('#fig18-stage .dll-node');
    nodes.forEach(n => n.classList.remove('highlighted'));
  },

  traverseForward() {
    this.reset();
    SoundFX.click();
    this.direction = 'forward';
    let step = 0;
    const nodes = document.querySelectorAll('#fig18-stage .dll-node');
    const descriptions = [
      "1. Puntero I (Inicio): p = I apunta al primer nodo con dato 'x'. Su LI apunta a NULL (tierra).",
      "2. Avance sucesor: p = p->LD. Nos movemos al nodo intermedio con dato 'y'.",
      "3. Fin de lista: p = p->LD. Llegamos al nodo final con dato 'z'. Su LD apunta a NULL (tierra) y coincide con D."
    ];

    const runStep = () => {
      nodes.forEach(n => n.classList.remove('highlighted'));
      if (step < nodes.length) {
        nodes[step].classList.add('highlighted');
        SoundFX.pointer();
        this.updateUI(descriptions[step]);
        step++;
      } else {
        clearInterval(this.timer);
        this.updateUI("Recorrido finalizado. Se alcanzó la liga derecha a NULL (tierra).");
      }
    };

    runStep();
    this.timer = setInterval(runStep, 1500);
  },

  traverseBackward() {
    this.reset();
    SoundFX.click();
    this.direction = 'backward';
    const nodes = document.querySelectorAll('#fig18-stage .dll-node');
    let step = nodes.length - 1;
    const descriptions = [
      "3. Retorno al inicio: p = p->LI. Se alcanza el primer nodo 'x'. Su LI va a tierra (NULL).",
      "2. Retroceso antecesor: p = p->LI. Regresamos al nodo intermedio 'y'.",
      "1. Puntero D (Derecho): p = D apunta al último nodo con dato 'z'."
    ];

    const runStep = () => {
      nodes.forEach(n => n.classList.remove('highlighted'));
      if (step >= 0) {
        nodes[step].classList.add('highlighted');
        SoundFX.pointer();
        this.updateUI(descriptions[step]);
        step--;
      } else {
        clearInterval(this.timer);
        this.updateUI("Recorrido inverso finalizado. Se alcanzó la liga izquierda a NULL (tierra).");
      }
    };

    runStep();
    this.timer = setInterval(runStep, 1500);
  },

  updateUI(msg) {
    const el = document.getElementById('fig18-status');
    if (el) el.innerHTML = `<span class="tag-badge cyan">ESTADO</span> ${msg}`;
  }
};

// ==========================================================================
// 2. FIGURA III.19 - INSERCIÓN DE NODO (Pág 81)
// ==========================================================================
window.Fig19 = {
  step: 0,
  maxSteps: 4,

  init() {
    this.render();
  },

  nextStep() {
    if (this.step < this.maxSteps) {
      this.step++;
      SoundFX.click();
      this.render();
    }
  },

  prevStep() {
    if (this.step > 0) {
      this.step--;
      SoundFX.click();
      this.render();
    }
  },

  reset() {
    this.step = 0;
    SoundFX.click();
    this.render();
  },

  render() {
    const step = this.step;
    // Actualizar badges de pasos en el panel
    for (let i = 0; i <= 4; i++) {
      const item = document.getElementById(`fig19-step-${i}`);
      if (item) {
        if (i === step) item.classList.add('active');
        else item.classList.remove('active');
      }
    }

    // Actualizar líneas de código resaltadas
    const codeLines = document.querySelectorAll('#fig19-code .code-line');
    codeLines.forEach((cl, idx) => {
      if (idx === step) cl.classList.add('highlight-line');
      else cl.classList.remove('highlight-line');
    });

    // Control de visibilidad y estilos de flechas SVG
    const arrowDirect = document.getElementById('fig19-arrow-direct');
    const arrowDirectRev = document.getElementById('fig19-arrow-direct-rev');
    const arrowNToM = document.getElementById('fig19-arrow-n-m');
    const arrowNToA = document.getElementById('fig19-arrow-n-a');
    const arrowAToN = document.getElementById('fig19-arrow-a-n');
    const arrowMToN = document.getElementById('fig19-arrow-m-n');
    const nodeN = document.getElementById('fig19-node-n');

    if (!nodeN) return;

    // Estado 0: N recién creado, enlaces originales intactos
    if (step === 0) {
      if (arrowDirect) arrowDirect.style.opacity = '1';
      if (arrowDirectRev) arrowDirectRev.style.opacity = '1';
      if (arrowNToM) arrowNToM.style.opacity = '0';
      if (arrowNToA) arrowNToA.style.opacity = '0';
      if (arrowAToN) arrowAToN.style.opacity = '0';
      if (arrowMToN) arrowMToN.style.opacity = '0';
      nodeN.style.transform = 'translateY(-10px)';
      nodeN.style.opacity = '0.7';
    }
    // Paso 1: N->LD = M
    else if (step === 1) {
      if (arrowDirect) arrowDirect.style.opacity = '1';
      if (arrowDirectRev) arrowDirectRev.style.opacity = '1';
      if (arrowNToM) arrowNToM.style.opacity = '1';
      if (arrowNToA) arrowNToA.style.opacity = '0';
      if (arrowAToN) arrowAToN.style.opacity = '0';
      if (arrowMToN) arrowMToN.style.opacity = '0';
      nodeN.style.transform = 'translateY(0)';
      nodeN.style.opacity = '1';
    }
    // Paso 2: N->LI = A
    else if (step === 2) {
      if (arrowDirect) arrowDirect.style.opacity = '1';
      if (arrowDirectRev) arrowDirectRev.style.opacity = '1';
      if (arrowNToM) arrowNToM.style.opacity = '1';
      if (arrowNToA) arrowNToA.style.opacity = '1';
      if (arrowAToN) arrowAToN.style.opacity = '0';
      if (arrowMToN) arrowMToN.style.opacity = '0';
    }
    // Paso 3: A->LD = N (Se rompe enlace directo A->M)
    else if (step === 3) {
      if (arrowDirect) arrowDirect.style.opacity = '0'; // roto
      if (arrowDirectRev) arrowDirectRev.style.opacity = '1';
      if (arrowNToM) arrowNToM.style.opacity = '1';
      if (arrowNToA) arrowNToA.style.opacity = '1';
      if (arrowAToN) arrowAToN.style.opacity = '1';
      if (arrowMToN) arrowMToN.style.opacity = '0';
    }
    // Paso 4: M->LI = N (Se rompe enlace inverso M->A). Inserción completa!
    else if (step === 4) {
      if (arrowDirect) arrowDirect.style.opacity = '0';
      if (arrowDirectRev) arrowDirectRev.style.opacity = '0'; // roto
      if (arrowNToM) arrowNToM.style.opacity = '1';
      if (arrowNToA) arrowNToA.style.opacity = '1';
      if (arrowAToN) arrowAToN.style.opacity = '1';
      if (arrowMToN) arrowMToN.style.opacity = '1';
      SoundFX.success();
    }
  }
};

// ==========================================================================
// 3. ELIMINACIÓN DE NODO (Retiro)
// ==========================================================================
window.DeleteSim = {
  deleted: false,

  toggleDelete() {
    const target = document.getElementById('del-node-b');
    const bypassFwd = document.getElementById('del-arrow-bypass-fwd');
    const bypassRev = document.getElementById('del-arrow-bypass-rev');
    const origLinks = document.querySelectorAll('.del-orig-link');
    const status = document.getElementById('del-status');

    if (!target) return;

    if (!this.deleted) {
      // Eliminar nodo B
      this.deleted = true;
      SoundFX.warn();
      target.style.opacity = '0.2';
      target.style.transform = 'scale(0.85)';
      origLinks.forEach(l => l.style.opacity = '0.1');
      if (bypassFwd) bypassFwd.style.opacity = '1';
      if (bypassRev) bypassRev.style.opacity = '1';
      if (status) status.innerHTML = "<span class='tag-badge emerald'>ELIMINADO</span> Enlaces reconectados: <code>A->LD = C</code> y <code>C->LI = A</code>. Memoria de B liberada.";
    } else {
      // Restaurar
      this.deleted = false;
      SoundFX.click();
      target.style.opacity = '1';
      target.style.transform = 'scale(1)';
      origLinks.forEach(l => l.style.opacity = '1');
      if (bypassFwd) bypassFwd.style.opacity = '0';
      if (bypassRev) bypassRev.style.opacity = '0';
      if (status) status.innerHTML = "<span class='tag-badge cyan'>ESTADO</span> Nodo B activo en medio de la lista.";
    }
  }
};

// ==========================================================================
// 4. FIGURA III.20 - LISTA CIRCULAR DOBLEMENTE LIGADA CON CABEZA (Pág 82)
// ==========================================================================
window.Fig20 = {
  rotation: 0,
  isRotating: false,
  timer: null,

  rotateRing() {
    SoundFX.click();
    const ring = document.getElementById('fig20-ring-nodes');
    if (!ring) return;
    this.rotation += 45; // 360 / 8 = 45 grados por nodo
    ring.style.transform = `rotate(${this.rotation}deg)`;
    const status = document.getElementById('fig20-status');
    if (status) {
      status.innerHTML = `<span class="tag-badge purple">CIRCULAR</span> Rotación a ${(this.rotation % 360)}°. El circuito cerrado no tiene fin ni punteros nulos.`;
    }
  },

  toggleContinuousRun() {
    if (this.isRotating) {
      clearInterval(this.timer);
      this.isRotating = false;
      const btn = document.getElementById('fig20-btn-auto');
      if (btn) btn.innerHTML = '▶ Auto Recorrido';
    } else {
      this.isRotating = true;
      const btn = document.getElementById('fig20-btn-auto');
      if (btn) btn.innerHTML = '⏸ Pausar';
      this.timer = setInterval(() => {
        this.rotateRing();
      }, 1200);
    }
  }
};

// ==========================================================================
// 5. MODELOS DE COLAS (Páginas 83 y 84)
// ==========================================================================
window.QueueModels = {
  currentModel: 'a', // 'a', 'b', 'c', 'd'
  clientCounter: 1,

  setModel(model) {
    this.currentModel = model;
    SoundFX.click();
    // Botones de pestañas
    document.querySelectorAll('.tab-qmodel').forEach(b => {
      b.classList.toggle('active', b.dataset.model === model);
    });
    // Vistas de modelos
    document.querySelectorAll('.qmodel-view').forEach(v => {
      v.style.display = (v.id === `qmodel-view-${model}`) ? 'flex' : 'none';
    });

    const descriptions = {
      'a': "<strong>Modelo a) Un solo servidor y una sola cola (Pág. 83):</strong> Una fila lineal simple donde los elementos entran por turno y son atendidos por el servidor [ S1 ].",
      'b': "<strong>Modelo b) Varios servidores diferentes y una sola cola (Pág. 83):</strong> Proceso secuencial en etapas (pipeline). Cada cliente pasa consecutivamente por [ S1 ] → [ S2 ] → [ S3 ].",
      'c': "<strong>Modelo c) Varios servidores iguales y varias colas (Pág. 84):</strong> Tres líneas independientes y paralelas hacia servidores idénticos [ S1 ], [ S2 ], [ S3 ] (estilo cajas de supermercado).",
      'd': "<strong>Modelo d) Varios servidores diferentes y varias colas (Pág. 84):</strong> Modelo matricial. Tres líneas paralelas independientes donde cada una pasa por 3 etapas consecutivas de servicio."
    };

    const descEl = document.getElementById('qmodel-description');
    if (descEl) descEl.innerHTML = descriptions[model];
  },

  addClient() {
    SoundFX.click();
    const token = document.createElement('div');
    token.className = 'client-token';
    token.textContent = `C${this.clientCounter++}`;

    const model = this.currentModel;
    let targetQueue = null;

    if (model === 'a' || model === 'b') {
      targetQueue = document.querySelector(`#qmodel-view-${model} .queue-track`);
    } else if (model === 'c' || model === 'd') {
      // Elegir la cola con menos clientes
      const queues = document.querySelectorAll(`#qmodel-view-${model} .queue-track`);
      let minLen = 999;
      queues.forEach(q => {
        if (q.children.length < minLen) {
          minLen = q.children.length;
          targetQueue = q;
        }
      });
    }

    if (targetQueue) {
      if (targetQueue.children.length >= 6) {
        SoundFX.warn();
        return;
      }
      targetQueue.appendChild(token);
    }
  },

  serveClient() {
    const model = this.currentModel;
    const view = document.getElementById(`qmodel-view-${model}`);
    if (!view) return;

    if (model === 'a') {
      const q = view.querySelector('.queue-track');
      const server = view.querySelector('.server-box');
      if (q && q.firstElementChild) {
        SoundFX.success();
        const client = q.firstElementChild;
        server.classList.add('busy');
        server.querySelector('.server-status').textContent = `Atendiendo ${client.textContent}`;
        client.remove();
        setTimeout(() => {
          server.classList.remove('busy');
          server.querySelector('.server-status').textContent = 'DISPONIBLE';
        }, 1200);
      }
    } else if (model === 'b') {
      // Pipeline S1 -> S2 -> S3
      const q = view.querySelector('.queue-track');
      const s1 = view.querySelector('#s1-b');
      const s2 = view.querySelector('#s2-b');
      const s3 = view.querySelector('#s3-b');

      if (q && q.firstElementChild) {
        SoundFX.success();
        const client = q.firstElementChild;
        const name = client.textContent;
        client.remove();

        s1.classList.add('busy');
        s1.querySelector('.server-status').textContent = name;
        setTimeout(() => {
          s1.classList.remove('busy');
          s1.querySelector('.server-status').textContent = 'LIBRE';
          s2.classList.add('busy');
          s2.querySelector('.server-status').textContent = name;
          setTimeout(() => {
            s2.classList.remove('busy');
            s2.querySelector('.server-status').textContent = 'LIBRE';
            s3.classList.add('busy');
            s3.querySelector('.server-status').textContent = name;
            setTimeout(() => {
              s3.classList.remove('busy');
              s3.querySelector('.server-status').textContent = 'LIBRE';
            }, 800);
          }, 800);
        }, 800);
      }
    } else if (model === 'c' || model === 'd') {
      const queues = view.querySelectorAll('.queue-track');
      queues.forEach((q, idx) => {
        if (q.firstElementChild) {
          SoundFX.success();
          const client = q.firstElementChild;
          const s = view.querySelectorAll('.server-box')[idx];
          if (s) {
            s.classList.add('busy');
            s.querySelector('.server-status').textContent = client.textContent;
            client.remove();
            setTimeout(() => {
              s.classList.remove('busy');
              s.querySelector('.server-status').textContent = 'DISPONIBLE';
            }, 1000);
          }
        }
      });
    }
  }
};

// ==========================================================================
// 6. PILA VERTICAL - PROBLEMA 2 (Pág 86)
// ==========================================================================
window.StackSim = {
  items: ['DAT1', 'DAT2'],
  maxItems: 5,

  init() {
    this.render();
  },

  push() {
    if (this.items.length >= this.maxItems) {
      SoundFX.warn();
      this.updateStatus("Desbordamiento de Pila (Stack Overflow). Límite de casillas alcanzado.");
      return;
    }
    SoundFX.click();
    const val = `DAT${this.items.length + 1}`;
    this.items.push(val);
    this.render();
    this.updateStatus(`Operación PUSH('${val}'): Se inserta por el extremo superior. TOPE sube.`);
  },

  pop() {
    if (this.items.length === 0) {
      SoundFX.warn();
      this.updateStatus("Subdesbordamiento de Pila (Stack Underflow). La pila está vacía (apunta a tierra).");
      return;
    }
    SoundFX.pointer();
    const removed = this.items.pop();
    this.render();
    this.updateStatus(`Operación POP(): Se extrajo '${removed}' por el extremo superior (LIFO/UEPS). TOPE baja.`);
  },

  render() {
    const container = document.getElementById('stack-items-container');
    const topeLabel = document.getElementById('stack-tope-pointer');
    if (!container) return;

    container.innerHTML = '';
    // Renderizamos desde arriba hacia abajo
    for (let i = this.items.length - 1; i >= 0; i--) {
      const el = document.createElement('div');
      el.className = 'stack-slot' + (i === this.items.length - 1 ? ' top-slot' : '');
      el.style.cssText = `
        height: 48px;
        background: linear-gradient(90deg, rgba(56, 189, 248, 0.15), rgba(168, 85, 247, 0.15));
        border: 2px solid ${i === this.items.length - 1 ? 'var(--accent-cyan)' : 'rgba(255, 255, 255, 0.2)'};
        border-radius: 8px;
        margin: 4px 0;
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: var(--font-mono);
        font-weight: 700;
        color: #fff;
        box-shadow: ${i === this.items.length - 1 ? 'var(--glow-cyan)' : 'none'};
      `;
      el.textContent = this.items[i];
      container.appendChild(el);
    }

    if (topeLabel) {
      if (this.items.length > 0) {
        topeLabel.style.display = 'flex';
        topeLabel.innerHTML = `→ TOPE [Pos: ${this.items.length}]`;
      } else {
        topeLabel.innerHTML = `→ TOPE = NULL (Tierra)`;
      }
    }
  },

  updateStatus(msg) {
    const st = document.getElementById('stack-status');
    if (st) st.innerHTML = `<span class="tag-badge purple">LIFO / UEPS</span> ${msg}`;
  }
};

// ==========================================================================
// 7. TRANSFORMACIÓN DE LISTA COMPLEJA - PROBLEMA 3 (Pág 87)
// ==========================================================================
window.ComplexList = {
  animating: false,

  traceFlow() {
    SoundFX.click();
    const pathA = document.getElementById('complex-loop-a');
    const jumpArrows = document.querySelectorAll('.complex-jump-arrow');
    const nodes = document.querySelectorAll('.complex-node-box');

    if (pathA) pathA.classList.add('active-glow');
    jumpArrows.forEach(a => a.classList.add('active-glow'));

    let current = 0;
    const interval = setInterval(() => {
      nodes.forEach(n => n.classList.remove('highlighted'));
      if (current < nodes.length) {
        nodes[current].classList.add('highlighted');
        SoundFX.pointer();
        current++;
      } else {
        clearInterval(interval);
        setTimeout(() => {
          if (pathA) pathA.classList.remove('active-glow');
          jumpArrows.forEach(a => a.classList.remove('active-glow'));
          nodes.forEach(n => n.classList.remove('highlighted'));
        }, 1500);
      }
    }, 600);
  }
};

// ==========================================================================
// 8. SIMULACIÓN DE GASOLINERA - PROBLEMA 6 (Pág 88)
// ==========================================================================
window.GasStationSim = {
  carsInQueue: 3,
  carsServed: 12,
  avgWaitMinutes: 4.8,
  timer: null,
  running: false,

  addCar() {
    if (this.carsInQueue >= 8) {
      SoundFX.warn();
      return;
    }
    SoundFX.click();
    this.carsInQueue++;
    this.render();
  },

  advanceStep() {
    if (this.carsInQueue > 0) {
      this.carsInQueue--;
      this.carsServed++;
      SoundFX.success();
      this.avgWaitMinutes = (Math.random() * 2 + 3.8).toFixed(1);
      this.render();
    }
  },

  toggleSimulation() {
    if (this.running) {
      clearInterval(this.timer);
      this.running = false;
      const b = document.getElementById('gas-btn-run');
      if (b) b.textContent = '▶ Iniciar Simulación';
    } else {
      this.running = true;
      const b = document.getElementById('gas-btn-run');
      if (b) b.textContent = '⏸ Pausar';
      this.timer = setInterval(() => {
        if (Math.random() > 0.4) this.addCar();
        if (Math.random() > 0.3) this.advanceStep();
      }, 1800);
    }
  },

  render() {
    const queueEl = document.getElementById('gas-cars-queue');
    const servedEl = document.getElementById('gas-served-count');
    const waitEl = document.getElementById('gas-avg-wait');

    if (queueEl) {
      queueEl.innerHTML = '';
      for (let i = 0; i < this.carsInQueue; i++) {
        const car = document.createElement('div');
        car.className = 'client-token';
        car.style.background = 'linear-gradient(135deg, #06b6d4, #3b82f6)';
        car.textContent = `🚗`;
        queueEl.appendChild(car);
      }
    }

    if (servedEl) servedEl.textContent = this.carsServed;
    if (waitEl) waitEl.textContent = `${this.avgWaitMinutes} min`;
  }
};

// ==========================================================================
// 9. EVALUADOR POLACA SUFIJA - PROBLEMA 4 (Pág 87)
// ==========================================================================
window.PostfixDemo = {
  steps: [
    { expr: "5 3 + 2 *", token: "5", stack: [5], desc: "Leer operando '5' → Se apila en la pila." },
    { expr: "5 3 + 2 *", token: "3", stack: [5, 3], desc: "Leer operando '3' → Se apila en la pila." },
    { expr: "5 3 + 2 *", token: "+", stack: [8], desc: "Operador '+' → Se desapilan 3 y 5. Se calcula 5 + 3 = 8. Se apila 8." },
    { expr: "5 3 + 2 *", token: "2", stack: [8, 2], desc: "Leer operando '2' → Se apila en la pila." },
    { expr: "5 3 + 2 *", token: "*", stack: [16], desc: "Operador '*' → Se desapilan 2 y 8. Se calcula 8 * 2 = 16. ¡Resultado final!" }
  ],
  currentStep: 0,

  next() {
    if (this.currentStep < this.steps.length - 1) {
      this.currentStep++;
      SoundFX.click();
      this.render();
    }
  },

  reset() {
    this.currentStep = 0;
    SoundFX.click();
    this.render();
  },

  render() {
    const s = this.steps[this.currentStep];
    const stackEl = document.getElementById('postfix-stack-view');
    const descEl = document.getElementById('postfix-desc');
    const tokenEl = document.getElementById('postfix-current-token');

    if (tokenEl) tokenEl.textContent = s.token;
    if (descEl) descEl.innerHTML = `<span class="tag-badge cyan">PASO ${this.currentStep + 1}</span> ${s.desc}`;
    if (stackEl) {
      stackEl.innerHTML = '';
      s.stack.forEach(val => {
        const item = document.createElement('div');
        item.className = 'stack-slot';
        item.style.cssText = `
          height: 38px;
          background: rgba(56, 189, 248, 0.2);
          border: 1px solid var(--accent-cyan);
          border-radius: 6px;
          margin: 3px 0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: var(--font-mono);
          font-weight: bold;
        `;
        item.textContent = val;
        stackEl.prepend(item);
      });
    }
  }
};

// ==========================================================================
// 10. CUESTIONARIO DE AUTOEVALUACIÓN (PÁGINA 85 - MATCH COLUMNS)
// ==========================================================================
window.QuizPage85 = {
  concepts: [
    { id: 1, term: "1. Lista" },
    { id: 2, term: "2. Lista lineal" },
    { id: 3, term: "3. Pila" },
    { id: 4, term: "4. Cola" },
    { id: 5, term: "5. Cola doble" },
    { id: 6, term: "6. PEPS" },
    { id: 7, term: "7. UEPS" },
    { id: 8, term: "8. Lista circular" },
    { id: 9, term: "9. Lista doblemente ligada" },
    { id: 10, term: "10. Lista simple ligada" }
  ],
  definitions: [
    { id: 9, text: "En este tipo de lista... es posible conocer tanto a su antecesor como a su sucesor en cada nodo." },
    { id: 7, text: "Últimas Entradas, Primeras Salidas (LIFO). Principio de operación de una pila." },
    { id: 6, text: "Primeras Entradas, Primeras Salidas (FIFO). Principio rector de las líneas de espera o colas." },
    { id: 8, text: "Estructura continua en forma de anillo donde el último nodo apunta al primero, sin punteros nulos." },
    { id: 3, text: "Estructura lineal donde los elementos se introducen y se retiran exclusivamente por el mismo extremo (TOPE)." },
    { id: 4, text: "Estructura de datos donde las inserciones se hacen por un extremo y las extracciones por el opuesto." },
    { id: 5, text: "Bicola (Deque): Estructura donde las inserciones y extracciones pueden realizarse por ambos extremos." },
    { id: 1, text: "Conjunto homogéneo de elementos o nodos que puede ser aumentado o disminuido dinámicamente." },
    { id: 2, text: "Conjunto de elementos ordenados en secuencia directa uno detrás de otro." },
    { id: 10, text: "Colección de nodos donde cada uno contiene información y únicamente una liga al siguiente sucesor." }
  ],
  selectedConcept: null,
  matchesCount: 0,

  init() {
    this.render();
  },

  selectConcept(id, el) {
    SoundFX.click();
    document.querySelectorAll('.concept-quiz-card').forEach(c => c.classList.remove('selected'));
    this.selectedConcept = id;
    el.classList.add('selected');
  },

  selectDef(targetId, el) {
    if (!this.selectedConcept) {
      SoundFX.warn();
      return;
    }

    if (this.selectedConcept === targetId) {
      // Coincidencia correcta
      SoundFX.success();
      el.classList.add('matched');
      const conceptEl = document.querySelector(`.concept-quiz-card[data-id="${this.selectedConcept}"]`);
      if (conceptEl) conceptEl.classList.add('matched');

      el.innerHTML = `<strong>(${this.selectedConcept})</strong> ${el.dataset.text}`;
      this.selectedConcept = null;
      this.matchesCount++;
      this.updateScore();
    } else {
      // Error
      SoundFX.warn();
      el.classList.add('wrong');
      setTimeout(() => el.classList.remove('wrong'), 500);
    }
  },

  updateScore() {
    const scoreEl = document.getElementById('quiz-score-val');
    if (scoreEl) scoreEl.textContent = `${this.matchesCount} / 10`;
    if (this.matchesCount === 10) {
      const banner = document.getElementById('quiz-congrats');
      if (banner) banner.style.display = 'block';
    }
  },

  reset() {
    this.selectedConcept = null;
    this.matchesCount = 0;
    this.render();
  },

  render() {
    const colLeft = document.getElementById('quiz-col-concepts');
    const colRight = document.getElementById('quiz-col-defs');
    const scoreEl = document.getElementById('quiz-score-val');
    const banner = document.getElementById('quiz-congrats');

    if (scoreEl) scoreEl.textContent = `0 / 10`;
    if (banner) banner.style.display = 'none';

    if (colLeft) {
      colLeft.innerHTML = '';
      this.concepts.forEach(c => {
        const item = document.createElement('div');
        item.className = 'quiz-card concept-quiz-card';
        item.dataset.id = c.id;
        item.textContent = c.term;
        item.onclick = () => this.selectConcept(c.id, item);
        colLeft.appendChild(item);
      });
    }

    if (colRight) {
      colRight.innerHTML = '';
      this.definitions.forEach(d => {
        const item = document.createElement('div');
        item.className = 'quiz-card def-quiz-card';
        item.dataset.id = d.id;
        item.dataset.text = d.text;
        item.innerHTML = `<strong>( &nbsp; )</strong> ${d.text}`;
        item.onclick = () => this.selectDef(d.id, item);
        colRight.appendChild(item);
      });
    }
  }
};

// ==========================================================================
// 11. MOTOR 3D: CANVAS DE ESPACIO DE MEMORIA Y NODOS HOLOGRÁFICOS
// ==========================================================================
window.Canvas3D = {
  canvas: null,
  ctx: null,
  nodes: [],
  nodeCount: 50,
  width: 0,
  height: 0,
  fov: 320,
  rotX: 0,
  rotY: 0,
  targetRotX: 0,
  targetRotY: 0,
  animId: null,

  init() {
    this.canvas = document.getElementById('canvas3d');
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.resize();
    window.addEventListener('resize', () => this.resize());

    // Crear nodos en coordenadas tridimensionales (x, y, z)
    this.nodes = [];
    for (let i = 0; i < this.nodeCount; i++) {
      this.nodes.push({
        x: (Math.random() - 0.5) * 1200,
        y: (Math.random() - 0.5) * 800,
        z: (Math.random() - 0.5) * 800,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        vz: (Math.random() - 0.5) * 0.4,
        color: i % 3 === 0 ? '#38bdf8' : (i % 3 === 1 ? '#a855f7' : '#10b981'),
        radius: Math.random() * 2.5 + 2
      });
    }

    // Interacción del mouse para ángulo 3D
    window.addEventListener('mousemove', (e) => {
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      this.targetRotY = (e.clientX - cx) * 0.0004;
      this.targetRotX = (e.clientY - cy) * 0.0003;
    });

    this.animate();
  },

  resize() {
    if (!this.canvas) return;
    this.width = this.canvas.width = window.innerWidth;
    this.height = this.canvas.height = window.innerHeight;
  },

  animate() {
    this.rotX += (this.targetRotX - this.rotX) * 0.05;
    this.rotY += (this.targetRotY - this.rotY) * 0.05;

    this.ctx.clearRect(0, 0, this.width, this.height);

    const cosY = Math.cos(this.rotY + 0.001);
    const sinY = Math.sin(this.rotY + 0.001);
    const cosX = Math.cos(this.rotX);
    const sinX = Math.sin(this.rotX);

    const projected = [];

    // Transformación 3D y proyección en perspectiva
    for (let i = 0; i < this.nodes.length; i++) {
      const n = this.nodes[i];
      n.x += n.vx;
      n.y += n.vy;
      n.z += n.vz;

      // Rebote en espacio 3D
      if (Math.abs(n.x) > 600) n.vx *= -1;
      if (Math.abs(n.y) > 400) n.vy *= -1;
      if (Math.abs(n.z) > 400) n.vz *= -1;

      // Rotación alrededor de Y y X
      let x1 = n.x * cosY - n.z * sinY;
      let z1 = n.z * cosY + n.x * sinY;
      let y1 = n.y * cosX - z1 * sinX;
      let z2 = z1 * cosX + n.y * sinX + 500; // Alejar de la cámara

      if (z2 > 50) {
        const scale = this.fov / z2;
        const px = this.width / 2 + x1 * scale;
        const py = this.height / 2 + y1 * scale;
        projected.push({ px, py, scale, z: z2, color: n.color, radius: n.radius * scale });
      } else {
        projected.push(null);
      }
    }

    // Dibujar enlaces ligaduras en 3D entre nodos cercanos
    for (let i = 0; i < this.nodes.length; i++) {
      const p1 = projected[i];
      if (!p1) continue;
      for (let j = i + 1; j < this.nodes.length; j++) {
        const p2 = projected[j];
        if (!p2) continue;

        const dx = p1.px - p2.px;
        const dy = p1.py - p2.py;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 110) {
          const alpha = (1 - dist / 110) * 0.25;
          this.ctx.strokeStyle = `rgba(56, 189, 248, ${alpha})`;
          this.ctx.lineWidth = 1;
          this.ctx.beginPath();
          this.ctx.moveTo(p1.px, p1.py);
          this.ctx.lineTo(p2.px, p2.py);
          this.ctx.stroke();
        }
      }
    }

    // Dibujar nodos esféricos con resplandor neón
    for (let i = 0; i < projected.length; i++) {
      const p = projected[i];
      if (!p) continue;
      const alpha = Math.min(1, Math.max(0.15, (1000 - p.z) / 800));

      this.ctx.fillStyle = p.color;
      this.ctx.globalAlpha = alpha;
      this.ctx.beginPath();
      this.ctx.arc(p.px, p.py, Math.max(1, p.radius), 0, Math.PI * 2);
      this.ctx.fill();

      // Halo sutil
      this.ctx.strokeStyle = p.color;
      this.ctx.globalAlpha = alpha * 0.3;
      this.ctx.lineWidth = 1.5;
      this.ctx.beginPath();
      this.ctx.arc(p.px, p.py, Math.max(2, p.radius * 2), 0, Math.PI * 2);
      this.ctx.stroke();
    }
    this.ctx.globalAlpha = 1.0;

    this.animId = requestAnimationFrame(() => this.animate());
  }
};

// ==========================================================================
// 12. CONTROLADOR DE NODO 3D ROTATORIO (Slide 2)
// ==========================================================================
window.Node3D = {
  isRotating: true,
  cubeEl: null,
  currentAngleY: 25,
  currentAngleX: -12,

  init() {
    this.cubeEl = document.getElementById('interactive-cube-3d');
    if (this.cubeEl) {
      this.cubeEl.classList.add('rotating');
    }
  },

  toggleRotation() {
    SoundFX.click();
    if (!this.cubeEl) this.cubeEl = document.getElementById('interactive-cube-3d');
    if (!this.cubeEl) return;

    this.isRotating = !this.isRotating;
    if (this.isRotating) {
      this.cubeEl.classList.add('rotating');
      const btn = document.getElementById('btn-node-3d-toggle');
      if (btn) btn.textContent = '⏸ Pausar Giro 3D';
    } else {
      this.cubeEl.classList.remove('rotating');
      const btn = document.getElementById('btn-node-3d-toggle');
      if (btn) btn.textContent = '▶ Girar en 3D';
    }
  },

  resetOrientation() {
    SoundFX.click();
    if (!this.cubeEl) this.cubeEl = document.getElementById('interactive-cube-3d');
    if (!this.cubeEl) return;
    this.isRotating = false;
    this.cubeEl.classList.remove('rotating');
    this.cubeEl.style.transform = 'rotateX(0deg) rotateY(0deg)';
    const btn = document.getElementById('btn-node-3d-toggle');
    if (btn) btn.textContent = '▶ Girar en 3D';
  }
};

// ==========================================================================
// 13. EFECTOS DINÁMICOS & GESTOR DE INTEGRANTES DEL EQUIPO
// ==========================================================================
window.CardTilt3D = {
  init() {
    // Los paneles de texto e información se mantienen 100% planos para garantizar
    // una lectura nítida, profesional y cómoda sin distorsiones ópticas.
    // El 3D permanece activo en el fondo cósmico Canvas3D y en el bloque del nodo 3D (Node3D).
  }
};

window.TeamManager = {
  memberCount: 12,

  addMember() {
    SoundFX.click();
    this.memberCount++;
    const grid = document.getElementById('team-grid');
    if (!grid) return;

    const card = document.createElement('div');
    card.className = 'team-card';
    const numStr = String(this.memberCount).padStart(2, '0');
    const gradients = [
      'linear-gradient(135deg, var(--accent-cyan), var(--accent-purple))',
      'linear-gradient(135deg, var(--accent-purple), var(--accent-pink))',
      'linear-gradient(135deg, var(--accent-emerald), var(--accent-cyan))',
      'linear-gradient(135deg, var(--accent-amber), var(--accent-rose))'
    ];
    const grad = gradients[(this.memberCount - 1) % gradients.length];

    card.innerHTML = `
      <span class="team-card-del" onclick="window.TeamManager.removeMember(this)" title="Eliminar integrante">×</span>
      <div class="team-avatar" style="background: ${grad};">${numStr}</div>
      <div class="team-info">
        <div class="team-name" contenteditable="true" spellcheck="false" title="Clic para editar nombre">Integrante ${this.memberCount}</div>
        <div class="team-role">Subtema ${this.memberCount}</div>
      </div>
    `;
    grid.appendChild(card);
    card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  },

  removeMember(btn) {
    SoundFX.warn();
    const card = btn.closest('.team-card');
    if (card) card.remove();
  }
};


