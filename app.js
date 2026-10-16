/* ==========================================================================
   ENGINE DE PRESENTACIÓN - CONTROLADOR PRINCIPAL
   Navegación, Atajos de Teclado, Cronómetro, Modales y Eventos
   ========================================================================== */

const Presentation = {
  currentSlide: 0,
  slides: [],
  totalSlides: 0,
  timerSeconds: 0,
  timerInterval: null,
  isTimerRunning: true,

  init() {
    this.slides = Array.from(document.querySelectorAll('.slide'));
    this.totalSlides = this.slides.length;

    this.bindEvents();
    this.initTimer();
    this.buildOverviewGrid();
    this.showSlide(0);

    // Inicializar visualizadores de inicio y motores 3D
    if (window.Canvas3D) window.Canvas3D.init();
    if (window.Node3D) window.Node3D.init();
    if (window.CardTilt3D) window.CardTilt3D.init();
    if (window.Fig18) window.Fig18.init();
    if (window.Fig19) window.Fig19.init();
    if (window.StackSim) window.StackSim.init();
    if (window.PostfixDemo) window.PostfixDemo.render();
    if (window.QuizPage85) window.QuizPage85.init();
    if (window.GasStationSim) window.GasStationSim.render();
  },

  showSlide(index) {
    if (index < 0 || index >= this.totalSlides) return;

    this.slides.forEach((s, idx) => {
      s.classList.remove('active', 'prev');
      if (idx === index) {
        s.classList.add('active');
      } else if (idx < index) {
        s.classList.add('prev');
      }
    });

    this.currentSlide = index;
    const activeSlide = this.slides[index];
    const navTopic = document.getElementById('nav-active-topic');
    if (navTopic && activeSlide) {
      const title = activeSlide.dataset.title || activeSlide.querySelector('.slide-title')?.textContent?.trim() || `Diapositiva ${index + 1}`;
      navTopic.textContent = `${index + 1}. ${title}`;
    }
    this.updateProgress();
    this.updateNavButtons();
    this.onSlideActivated(index);
  },

  nextSlide() {
    if (this.currentSlide < this.totalSlides - 1) {
      this.showSlide(this.currentSlide + 1);
      SoundFX.click();
    }
  },

  prevSlide() {
    if (this.currentSlide > 0) {
      this.showSlide(this.currentSlide - 1);
      SoundFX.click();
    }
  },

  goToSlide(index) {
    this.showSlide(index);
    this.toggleOverview(false);
    SoundFX.click();
  },

  updateProgress() {
    const progressFill = document.getElementById('progress-bar-fill');
    const counterText = document.getElementById('slide-counter-text');
    const percentage = ((this.currentSlide + 1) / this.totalSlides) * 100;

    if (progressFill) progressFill.style.width = `${percentage}%`;
    if (counterText) counterText.textContent = `${this.currentSlide + 1} / ${this.totalSlides}`;

    // Actualizar tarjeta activa en modal
    document.querySelectorAll('.overview-card').forEach((card, i) => {
      card.classList.toggle('active', i === this.currentSlide);
    });
  },

  updateNavButtons() {
    const btnPrev = document.getElementById('btn-nav-prev');
    const btnNext = document.getElementById('btn-nav-next');
    if (btnPrev) btnPrev.disabled = this.currentSlide === 0;
    if (btnNext) btnNext.disabled = this.currentSlide === this.totalSlides - 1;
  },

  onSlideActivated(index) {
    // Hooks específicos según diapositiva para reanimar o enfocar
    if (index === 2 && window.Fig18) window.Fig18.reset();
    if (index === 4 && window.Fig19) window.Fig19.reset();
    if (index === 6 && window.Fig20) window.Fig20.rotation = 0;
    if (index === 9 && window.QueueModels) window.QueueModels.setModel('a');
    if (index === 10 && window.QueueModels) window.QueueModels.setModel('c');
    if (index === 11 && window.StackSim) window.StackSim.render();
    if (index === 13 && window.GasStationSim) window.GasStationSim.render();
  },

  bindEvents() {
    // Atajos de teclado para la exposición
    document.addEventListener('keydown', (e) => {
      // Ignorar si estamos en un input
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;

      switch(e.key) {
        case 'ArrowRight':
        case 'PageDown':
        case ' ':
          e.preventDefault();
          this.nextSlide();
          break;
        case 'ArrowLeft':
        case 'PageUp':
          e.preventDefault();
          this.prevSlide();
          break;
        case 'Home':
          e.preventDefault();
          this.showSlide(0);
          break;
        case 'End':
          e.preventDefault();
          this.showSlide(this.totalSlides - 1);
          break;
        case 'Escape':
          this.toggleOverview(false);
          break;
        case 'f':
        case 'F':
          this.toggleFullscreen();
          break;
        case 'm':
        case 'M':
        case 'g':
        case 'G':
          this.toggleOverview();
          break;
        case 't':
        case 'T':
          this.toggleTimer();
          break;
        case 's':
        case 'S':
          this.toggleAudio();
          break;
      }
    });

    // Botones de navegación
    const btnPrev = document.getElementById('btn-nav-prev');
    const btnNext = document.getElementById('btn-nav-next');
    const btnOverview = document.getElementById('btn-overview');
    const btnCloseOverview = document.getElementById('btn-close-overview');
    const btnFs = document.getElementById('btn-fullscreen');
    const btnTimer = document.getElementById('timer-pill-btn');
    const btnSound = document.getElementById('btn-sound-toggle');

    if (btnPrev) btnPrev.addEventListener('click', () => this.prevSlide());
    if (btnNext) btnNext.addEventListener('click', () => this.nextSlide());
    if (btnOverview) btnOverview.addEventListener('click', () => this.toggleOverview(true));
    if (btnCloseOverview) btnCloseOverview.addEventListener('click', () => this.toggleOverview(false));
    if (btnFs) btnFs.addEventListener('click', () => this.toggleFullscreen());
    if (btnTimer) btnTimer.addEventListener('click', () => this.toggleTimer());
    if (btnSound) btnSound.addEventListener('click', () => this.toggleAudio());
  },

  // Cronómetro del presentador
  initTimer() {
    const el = document.getElementById('timer-text');
    this.timerInterval = setInterval(() => {
      if (this.isTimerRunning) {
        this.timerSeconds++;
        const mins = Math.floor(this.timerSeconds / 60).toString().padStart(2, '0');
        const secs = (this.timerSeconds % 60).toString().padStart(2, '0');
        if (el) el.textContent = `${mins}:${secs}`;
      }
    }, 1000);
  },

  toggleTimer() {
    this.isTimerRunning = !this.isTimerRunning;
    SoundFX.click();
    const dot = document.querySelector('.timer-pill .dot');
    if (dot) {
      dot.style.animationPlayState = this.isTimerRunning ? 'running' : 'paused';
      dot.style.background = this.isTimerRunning ? 'var(--accent-emerald)' : 'var(--accent-amber)';
    }
  },

  toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  },

  toggleAudio() {
    SoundFX.enabled = !SoundFX.enabled;
    const btn = document.getElementById('btn-sound-toggle');
    if (btn) {
      btn.innerHTML = SoundFX.enabled ? '🔊 Audio' : '🔇 Mudo';
      btn.style.color = SoundFX.enabled ? 'var(--accent-cyan)' : 'var(--text-dim)';
    }
  },

  toggleOverview(forceState) {
    const modal = document.getElementById('overview-modal');
    if (!modal) return;
    const isOpen = forceState !== undefined ? forceState : !modal.classList.contains('open');
    modal.classList.toggle('open', isOpen);
    SoundFX.click();
  },

  buildOverviewGrid() {
    const grid = document.getElementById('overview-grid');
    if (!grid) return;
    grid.innerHTML = '';

    this.slides.forEach((slide, idx) => {
      const titleEl = slide.querySelector('.slide-title');
      const catEl = slide.querySelector('.slide-category');
      const title = titleEl ? titleEl.textContent.trim() : `Diapositiva ${idx + 1}`;
      const cat = catEl ? catEl.textContent.trim() : 'Tema';

      const card = document.createElement('div');
      card.className = `overview-card ${idx === 0 ? 'active' : ''}`;
      card.innerHTML = `
        <div class="overview-card-num">DIAPOSITIVA ${String(idx + 1).padStart(2, '0')} • ${cat}</div>
        <div class="overview-card-title">${title}</div>
      `;
      card.addEventListener('click', () => this.goToSlide(idx));
      grid.appendChild(card);
    });
  }
};

// Arrancar al cargar el documento
window.addEventListener('DOMContentLoaded', () => {
  Presentation.init();
});
