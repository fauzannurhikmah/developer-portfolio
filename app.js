/**
 * ALEX PRATAMA - CINEMATIC PORTFOLIO ENGINE
 * Vanilla JavaScript • High-Performance • Zero Dependencies
 */

(function () {
  'use strict';

  // =========================================================================
  // 1. AUDIO SYNTHESIZER (Web Audio API)
  // Provides subtle, tactile cinematic UI sound effects without external files
  // =========================================================================
  class AudioFX {
    constructor() {
      this.ctx = null;
      this.enabled = false;
      this.initialized = false;
    }

    init() {
      if (this.initialized) return;
      try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) {
          this.ctx = new AudioContext();
          this.initialized = true;
        }
      } catch (e) {
        console.warn('Web Audio not supported or blocked', e);
      }
    }

    toggle() {
      if (!this.initialized) this.init();
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      this.enabled = !this.enabled;
      return this.enabled;
    }

    playClick(freq = 880, duration = 0.04) {
      if (!this.enabled || !this.ctx) return;
      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(freq * 0.5, this.ctx.currentTime + duration);

        gain.gain.setValueAtTime(0.04, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + duration);
      } catch (e) {}
    }

    playHum(freq = 220, duration = 0.12) {
      if (!this.enabled || !this.ctx) return;
      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        gain.gain.setValueAtTime(0.03, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + duration);
      } catch (e) {}
    }

    playSuccess() {
      if (!this.enabled || !this.ctx) return;
      try {
        const now = this.ctx.currentTime;
        [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + i * 0.06);
          gain.gain.setValueAtTime(0.03, now + i * 0.06);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.06 + 0.15);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(now + i * 0.06);
          osc.stop(now + i * 0.06 + 0.15);
        });
      } catch (e) {}
    }
  }

  const sound = new AudioFX();

  // =========================================================================
  // 2. LIVE CLOCK (JAKARTA WIB UTC+7)
  // =========================================================================
  function initLiveClock() {
    const clockEl = document.getElementById('liveClock');
    const mobileClockEl = document.getElementById('mobileLiveClock');

    function update() {
      const now = new Date();
      // Format as Jakarta time
      const timeStr = now.toLocaleTimeString('id-ID', {
        timeZone: 'Asia/Jakarta',
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
      const formatted = `${timeStr} WIB`;
      if (clockEl) clockEl.textContent = formatted;
      if (mobileClockEl) mobileClockEl.textContent = formatted;
    }

    update();
    setInterval(update, 1000);
  }

  // =========================================================================
  // 3. INTERACTIVE SPOTLIGHT CURSOR & TILT EFFECT
  // =========================================================================
  function initSpotlightAndTilt() {
    const spotlight = document.getElementById('cursorSpotlight');
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let currentX = mouseX;
    let currentY = mouseY;

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });

    function animateSpotlight() {
      currentX += (mouseX - currentX) * 0.15;
      currentY += (mouseY - currentY) * 0.15;
      if (spotlight) {
        spotlight.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
      }
      requestAnimationFrame(animateSpotlight);
    }
    animateSpotlight();

    // 3D Card Tilt on Hover (Only for pointer devices with hover capability)
    if (window.matchMedia && window.matchMedia('(hover: hover)').matches) {
      const tiltCards = document.querySelectorAll('[data-tilt]');
      tiltCards.forEach((card) => {
        card.addEventListener('mousemove', (e) => {
          const rect = card.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          const centerX = rect.width / 2;
          const centerY = rect.height / 2;
          const rotateX = ((y - centerY) / centerY) * -5;
          const rotateY = ((x - centerX) / centerX) * 5;

          card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
          card.style.setProperty('--mouse-x', `${x}px`);
          card.style.setProperty('--mouse-y', `${y}px`);
        });

        card.addEventListener('mouseleave', () => {
          card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0)';
        });
      });
    }
  }

  // =========================================================================
  // 4. INTERACTIVE NEURAL ARCHITECTURE TERMINAL
  // =========================================================================
  function initInteractiveTerminal() {
    const termInput = document.getElementById('termInput');
    const termOutput = document.getElementById('termOutput');
    const tabBtns = document.querySelectorAll('.term-tab');
    const tabPanes = document.querySelectorAll('.term-pane');
    const quickChips = document.querySelectorAll('.term-chip');

    if (!termInput || !termOutput) return;

    const commands = {
      help: () => `Available commands:
  • <span class="cyan">architecture</span> : Inspect current distributed cluster topology
  • <span class="cyan">benchmarks</span>   : View sub-50ms latency performance metrics
  • <span class="cyan">stack</span>        : List mission-critical production technology stack
  • <span class="cyan">projects</span>     : Print highlights of 4 flagship systems
  • <span class="cyan">contact</span>      : Display encrypted transmission channels
  • <span class="cyan">ping</span>         : Run simulated ICMP round-trip latency probe
  • <span class="cyan">neofetch</span>     : Display engineer system specifications
  • <span class="cyan">matrix</span>       : Trigger quantum rain sequence
  • <span class="cyan">clear</span>        : Clear the terminal console buffer`,

      architecture: () => `<span class="amber">[SYSTEM TOPOLOGY]</span>
- Gateway       : Nginx Edge Proxy + TLS 1.3 Termination (Zero Latency)
- Application   : Distributed Microservices (Golang + Rust Core)
- Event Bus     : Apache Kafka 3-Node Cluster (500K msgs/sec)
- Caching Layer : Redis v7 Multi-Shard Cluster (Sub-1.2ms hits)
- Primary DB    : PostgreSQL 16 with Read Replicas & Connection Pooling
- Observability : OpenTelemetry + ClickHouse + Custom Real-time Visualizer`,

      benchmarks: () => `<span class="emerald">=== PERFORMANCE METRICS (2026 AUDIT) ===</span>
• API Gateway P99 Latency : 12.4 ms [PASS]
• Kafka Event Ingestion   : 540,000 req/sec [OPTIMAL]
• Financial Ledger TPS    : 18,200 ACID ops/sec [VERIFIED]
• Memory Footprint        : -38% compared to Legacy JVM
• AWS Cloud Cost Savings  : -28.4% YoY reduction`,

      stack: () => `<span class="purple">=== CORE WEAPONS OF CHOICE ===</span>
• Systems  : Golang, Rust, TypeScript, Node.js
• Frontend : Modern CSS3, HTML5 Canvas, WebSockets, React/Next.js
• Cloud    : Docker, Kubernetes, AWS (EKS, RDS, S3), Terraform, Linux
• Storage  : PostgreSQL, ClickHouse, Redis, MongoDB, Yjs CRDT`,

      projects: () => `<span class="cyan">=== FLAGSHIP RELEASES ===</span>
1. <a href="#projects" class="term-link">[01] CloudMesh Engine</a> - Real-time Distributed Telemetry
2. <a href="#projects" class="term-link">[02] OmniPay Gateway</a>  - High-TPS Double-Entry Settlement
3. <a href="#projects" class="term-link">[03] NexusFlow Engine</a> - Visual DAG Async Workflow Orchestrator
4. <a href="#projects" class="term-link">[04] HyperCanvas CRDT</a>- 60 FPS Collaborative Vector Canvas`,

      contact: () => `<span class="amber">=== TRANSMISSION CHANNELS ===</span>
• Email    : <a href="mailto:alex.pratama.dev@example.com" class="term-link">alex.pratama.dev@example.com</a>
• Location : Jakarta, Indonesia (GMT+7) • Remote Worldwide
• Status   : Available for High-Impact Roles & Architecture Consultations`,

      ping: () => `PING edge.alex-pratama.net (103.28.14.99): 56 data bytes
64 bytes from 103.28.14.99: icmp_seq=0 ttl=64 time=8.14 ms
64 bytes from 103.28.14.99: icmp_seq=1 ttl=64 time=7.92 ms
64 bytes from 103.28.14.99: icmp_seq=2 ttl=64 time=8.05 ms
--- edge.alex-pratama.net ping statistics ---
3 packets transmitted, 3 received, 0% packet loss, avg = 8.03 ms`,

      neofetch: () => `<span class="cyan">           _        </span>   <span class="white">alex@quantum-core</span>
<span class="cyan">    /\\    | |       </span>   -----------------
<span class="cyan">   /  \\   | | _____ </span>   <span class="dim">OS:</span> Linux 6.8.0-zen-x86_64
<span class="cyan">  / /\\ \\  | |/ _ \\ \\</span>   <span class="dim">Host:</span> High-Concurrency Enterprise Node
<span class="cyan"> / ____ \\ | |  __/> ></span>  <span class="dim">Uptime:</span> 7 Years 3 Months
<span class="cyan">/_/    \\_\\|_|\\___/_/</span>   <span class="dim">Shell:</span> zsh 5.9 (SysArchitect)
                       <span class="dim">Terminal:</span> NeuralHUD v4.2
                       <span class="dim">CPU:</span> Go Runtime / Rust Engine
                       <span class="dim">Memory:</span> 99.99% Availability`,

      matrix: () => {
        startMatrixRain();
        return `<span class="emerald">Quantum simulation sequence activated... Observe the background telemetry.</span>`;
      },

      clear: () => {
        termOutput.innerHTML = '';
        return null;
      }
    };

    function executeCommand(rawCmd) {
      const cmd = rawCmd.trim().toLowerCase();
      if (!cmd) return;

      sound.playClick(940, 0.05);

      // Add user command line to output
      const line = document.createElement('div');
      line.className = 'term-entry';
      line.innerHTML = `<span class="term-prompt-symbol">&gt;</span> <span class="term-input-echo">${escapeHTML(rawCmd)}</span>`;
      termOutput.appendChild(line);

      const resp = document.createElement('div');
      resp.className = 'term-response';

      if (commands[cmd]) {
        const result = commands[cmd]();
        if (result !== null) {
          resp.innerHTML = result;
          termOutput.appendChild(resp);
        }
      } else {
        resp.innerHTML = `<span class="rose">Command not recognized: "${escapeHTML(rawCmd)}". Type <strong class="cyan">help</strong> for available commands.</span>`;
        termOutput.appendChild(resp);
      }

      termOutput.scrollTop = termOutput.scrollHeight;
      termInput.value = '';
    }

    termInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        executeCommand(termInput.value);
      }
    });

    // Quick Command Chips
    quickChips.forEach((chip) => {
      chip.addEventListener('click', () => {
        const cmd = chip.getAttribute('data-cmd');
        if (cmd) executeCommand(cmd);
      });
    });

    // Tab Switching
    tabBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const target = btn.getAttribute('data-tab');
        sound.playClick(720, 0.03);

        tabBtns.forEach((b) => b.classList.remove('active'));
        tabPanes.forEach((p) => p.classList.remove('active'));

        btn.classList.add('active');
        const activePane = document.getElementById(target);
        if (activePane) activePane.classList.add('active');
      });
    });
  }

  function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
      tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
  }

  // =========================================================================
  // 5. LIVE TELEMETRY SIMULATIONS (Projects Showcase)
  // =========================================================================
  function initProjectSimulations() {
    // 5.1 Project 1: CloudMesh Oscilloscope Canvas
    const canvas = document.getElementById('telemetryCanvas');
    if (canvas) {
      const ctx = canvas.getContext('2d');
      let offset = 0;

      function resizeCanvas() {
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * (window.devicePixelRatio || 1);
        canvas.height = rect.height * (window.devicePixelRatio || 1);
      }
      resizeCanvas();
      window.addEventListener('resize', resizeCanvas);

      function drawOscilloscope() {
        if (!canvas.width || !canvas.height) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const w = canvas.width;
        const h = canvas.height;
        const mid = h * 0.55;

        // Draw grid lines
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
        ctx.lineWidth = 1;
        for (let x = 0; x < w; x += 30) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, h);
          ctx.stroke();
        }
        for (let y = 0; y < h; y += 20) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(w, y);
          ctx.stroke();
        }

        // Draw Sine Telemetry Wave
        ctx.beginPath();
        ctx.lineWidth = 2.5;
        const grad = ctx.createLinearGradient(0, 0, w, 0);
        grad.addColorStop(0, '#06b6d4');
        grad.addColorStop(0.5, '#38bdf8');
        grad.addColorStop(1, '#818cf8');
        ctx.strokeStyle = grad;

        for (let x = 0; x < w; x += 2) {
          const wave1 = Math.sin((x * 0.02) + offset) * 18;
          const wave2 = Math.cos((x * 0.05) - offset * 1.5) * 8;
          const wave3 = Math.sin((x * 0.01) + offset * 0.5) * 12;
          const y = mid + wave1 + wave2 + wave3;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Secondary pulse wave
        ctx.beginPath();
        ctx.lineWidth = 1.2;
        ctx.strokeStyle = 'rgba(16, 185, 129, 0.6)';
        for (let x = 0; x < w; x += 3) {
          const y = mid + Math.sin((x * 0.035) + offset * 2) * 12;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        offset += 0.05;
        requestAnimationFrame(drawOscilloscope);
      }
      drawOscilloscope();
    }

    // 5.2 Live Dynamic Throughput Counter
    const liveTpsEl = document.getElementById('liveTpsCounter');
    if (liveTpsEl) {
      let baseTps = 18240;
      setInterval(() => {
        const delta = Math.floor(Math.random() * 240) - 120;
        baseTps = Math.max(17800, Math.min(19500, baseTps + delta));
        liveTpsEl.textContent = baseTps.toLocaleString('en-US');
      }, 1200);
    }

    // 5.3 Live Hash Sequence Generator
    const liveHashEl = document.getElementById('liveTxHash');
    if (liveHashEl) {
      const hexChars = '0123456789abcdef';
      setInterval(() => {
        let hash = '0x';
        for (let i = 0; i < 16; i++) {
          hash += hexChars[Math.floor(Math.random() * hexChars.length)];
        }
        hash += '...';
        liveHashEl.textContent = hash;
      }, 2400);
    }

    // 5.4 Interactive Canvas for HyperCanvas Project
    const hyperCanvas = document.getElementById('hyperCanvasDemo');
    if (hyperCanvas) {
      const hCtx = hyperCanvas.getContext('2d');
      let isDrawing = false;
      const strokes = [];

      function resizeHyperCanvas() {
        const rect = hyperCanvas.getBoundingClientRect();
        hyperCanvas.width = rect.width * (window.devicePixelRatio || 1);
        hyperCanvas.height = rect.height * (window.devicePixelRatio || 1);
        drawDemoCurves();
      }
      resizeHyperCanvas();
      window.addEventListener('resize', resizeHyperCanvas);

      function drawDemoCurves() {
        const w = hyperCanvas.width;
        const h = hyperCanvas.height;
        hCtx.clearRect(0, 0, w, h);

        // Ambient collaborative path
        hCtx.beginPath();
        hCtx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
        hCtx.lineWidth = 3;
        hCtx.moveTo(w * 0.1, h * 0.7);
        hCtx.bezierCurveTo(w * 0.3, h * 0.2, w * 0.6, h * 0.9, w * 0.85, h * 0.3);
        hCtx.stroke();

        // User drawn strokes
        strokes.forEach((stroke) => {
          hCtx.beginPath();
          hCtx.strokeStyle = stroke.color;
          hCtx.lineWidth = 2.5;
          stroke.points.forEach((pt, i) => {
            if (i === 0) hCtx.moveTo(pt.x, pt.y);
            else hCtx.lineTo(pt.x, pt.y);
          });
          hCtx.stroke();
        });
      }

      hyperCanvas.addEventListener('mousedown', (e) => {
        isDrawing = true;
        const rect = hyperCanvas.getBoundingClientRect();
        const scaleX = hyperCanvas.width / rect.width;
        const scaleY = hyperCanvas.height / rect.height;
        strokes.push({
          color: '#fbbf24',
          points: [{ x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY }]
        });
      });

      hyperCanvas.addEventListener('mousemove', (e) => {
        const coordEl = document.getElementById('canvasCoords');
        const rect = hyperCanvas.getBoundingClientRect();
        const x = Math.round(e.clientX - rect.left);
        const y = Math.round(e.clientY - rect.top);
        if (coordEl) coordEl.textContent = `X: ${x} | Y: ${y}`;

        if (!isDrawing) return;
        const scaleX = hyperCanvas.width / rect.width;
        const scaleY = hyperCanvas.height / rect.height;
        const currentStroke = strokes[strokes.length - 1];
        if (currentStroke) {
          currentStroke.points.push({
            x: (e.clientX - rect.left) * scaleX,
            y: (e.clientY - rect.top) * scaleY
          });
          drawDemoCurves();
        }
      });

      window.addEventListener('mouseup', () => {
        isDrawing = false;
      });

      // Touch handlers for mobile devices
      hyperCanvas.addEventListener('touchstart', (e) => {
        if (e.touches.length === 1) {
          isDrawing = true;
          const touch = e.touches[0];
          const rect = hyperCanvas.getBoundingClientRect();
          const scaleX = hyperCanvas.width / rect.width;
          const scaleY = hyperCanvas.height / rect.height;
          strokes.push({
            color: '#fbbf24',
            points: [{ x: (touch.clientX - rect.left) * scaleX, y: (touch.clientY - rect.top) * scaleY }]
          });
          sound.playClick(920, 0.02);
        }
      }, { passive: true });

      hyperCanvas.addEventListener('touchmove', (e) => {
        if (!isDrawing || e.touches.length !== 1) return;
        const touch = e.touches[0];
        const coordEl = document.getElementById('canvasCoords');
        const rect = hyperCanvas.getBoundingClientRect();
        const x = Math.round(touch.clientX - rect.left);
        const y = Math.round(touch.clientY - rect.top);
        if (coordEl) coordEl.textContent = `X: ${x} | Y: ${y}`;

        const scaleX = hyperCanvas.width / rect.width;
        const scaleY = hyperCanvas.height / rect.height;
        const currentStroke = strokes[strokes.length - 1];
        if (currentStroke) {
          currentStroke.points.push({
            x: (touch.clientX - rect.left) * scaleX,
            y: (touch.clientY - rect.top) * scaleY
          });
          drawDemoCurves();
        }
      }, { passive: true });

      window.addEventListener('touchend', () => {
        isDrawing = false;
      });

      // Clear canvas button
      const clearBtn = document.getElementById('clearCanvasBtn');
      if (clearBtn) {
        clearBtn.addEventListener('click', () => {
          strokes.length = 0;
          drawDemoCurves();
        });
      }
    }
  }

  // =========================================================================
  // 6. SKILLS FILTERING MATRIX
  // =========================================================================
  function initSkillsMatrix() {
    const filterButtons = document.querySelectorAll('.skill-filter-btn');
    const skillCards = document.querySelectorAll('.skill-card-item');

    filterButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        sound.playClick(680, 0.03);
        const filter = btn.getAttribute('data-filter');

        filterButtons.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');

        skillCards.forEach((card) => {
          const cat = card.getAttribute('data-category');
          if (filter === 'all' || cat === filter) {
            card.style.display = 'flex';
            card.style.animation = 'fadeInUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards';
          } else {
            card.style.display = 'none';
          }
        });
      });
    });
  }

  // =========================================================================
  // 7. COMMAND PALETTE (HUD) & KEYBOARD SHORTCUTS
  // =========================================================================
  function initCommandPalette() {
    const palette = document.getElementById('commandPalette');
    const paletteBackdrop = document.getElementById('paletteBackdrop');
    const paletteInput = document.getElementById('paletteInput');
    const paletteItems = document.querySelectorAll('.palette-item');
    const openBtns = document.querySelectorAll('.open-palette-btn');
    const closeBtn = document.getElementById('closePaletteBtn');

    function openPalette() {
      if (!palette) return;
      palette.classList.add('active');
      if (paletteBackdrop) paletteBackdrop.classList.add('active');
      if (paletteInput) {
        paletteInput.value = '';
        setTimeout(() => paletteInput.focus(), 50);
      }
      sound.playHum(440, 0.15);
    }

    function closePalette() {
      if (!palette) return;
      palette.classList.remove('active');
      if (paletteBackdrop) paletteBackdrop.classList.remove('active');
      sound.playClick(400, 0.04);
    }

    openBtns.forEach((btn) => btn.addEventListener('click', openPalette));
    if (closeBtn) closeBtn.addEventListener('click', closePalette);
    if (paletteBackdrop) paletteBackdrop.addEventListener('click', closePalette);

    // Global Keydown: Ctrl+K or Cmd+K
    window.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (palette && palette.classList.contains('active')) {
          closePalette();
        } else {
          openPalette();
        }
      } else if (e.key === 'Escape' && palette && palette.classList.contains('active')) {
        closePalette();
      }
    });

    // Filtering items inside palette
    if (paletteInput) {
      paletteInput.addEventListener('input', () => {
        const query = paletteInput.value.toLowerCase().trim();
        paletteItems.forEach((item) => {
          const text = item.textContent.toLowerCase();
          if (text.includes(query)) {
            item.style.display = 'flex';
          } else {
            item.style.display = 'none';
          }
        });
      });
    }

    paletteItems.forEach((item) => {
      item.addEventListener('click', () => {
        const action = item.getAttribute('data-action');
        closePalette();

        if (action === 'audio-toggle') {
          toggleAudioState();
        } else if (action === 'matrix') {
          startMatrixRain();
        } else if (action === 'copy-email') {
          copyEmailToClipboard();
        } else if (item.getAttribute('href')) {
          const target = item.getAttribute('href');
          const targetEl = document.querySelector(target);
          if (targetEl) targetEl.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });
  }

  // =========================================================================
  // 8. AUDIO TOGGLE BUTTON & VISUALIZER
  // =========================================================================
  function initAudioToggle() {
    const audioToggleBtn = document.getElementById('audioToggleBtn');
    if (!audioToggleBtn) return;

    audioToggleBtn.addEventListener('click', () => {
      toggleAudioState();
    });
  }

  function toggleAudioState() {
    const isEnabled = sound.toggle();
    const audioToggleBtn = document.getElementById('audioToggleBtn');
    const audioStatusText = document.getElementById('audioStatusText');
    const mobileAudioBtn = document.getElementById('mobileAudioToggleBtn');
    const mobileAudioText = document.getElementById('mobileAudioStatusText');

    const updateBtn = (btn, textEl) => {
      if (!btn) return;
      if (isEnabled) {
        btn.classList.add('active');
        if (textEl) textEl.textContent = 'FX ON';
      } else {
        btn.classList.remove('active');
        if (textEl) textEl.textContent = 'FX OFF';
      }
    };

    updateBtn(audioToggleBtn, audioStatusText);
    updateBtn(mobileAudioBtn, mobileAudioText);

    if (isEnabled) {
      sound.playSuccess();
      showToast('Tactile Audio FX Activated');
    } else {
      showToast('Audio FX Muted');
    }
  }

  // =========================================================================
  // 9. COPY EMAIL & ENCRYPTED TRANSMISSION FORM
  // =========================================================================
  function initContactActions() {
    const copyBtns = document.querySelectorAll('.copy-email-btn');
    copyBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        copyEmailToClipboard();
      });
    });

    const contactForm = document.getElementById('terminalContactForm');
    if (contactForm) {
      contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        sound.playSuccess();

        const submitBtn = contactForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = `<span>✓ Encrypted Packet Dispatched</span>`;
        submitBtn.style.background = 'linear-gradient(135deg, #059669 0%, #10b981 100%)';

        showToast('Signal packet transmitted successfully! Expected response < 2h.');

        setTimeout(() => {
          submitBtn.innerHTML = originalText;
          submitBtn.style.background = '';
          contactForm.reset();
        }, 3500);
      });
    }
  }

  function copyEmailToClipboard() {
    const email = 'alex.pratama.dev@example.com';
    navigator.clipboard.writeText(email).then(() => {
      sound.playClick(1020, 0.05);
      showToast('Email copied to clipboard: ' + email);
    }).catch(() => {
      showToast('Contact: ' + email);
    });
  }

  function showToast(message) {
    let toast = document.getElementById('hudToast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'hudToast';
      toast.className = 'hud-toast';
      document.body.appendChild(toast);
    }

    toast.innerHTML = `<span class="toast-dot"></span><span>${message}</span>`;
    toast.classList.add('show');

    clearTimeout(toast._timeout);
    toast._timeout = setTimeout(() => {
      toast.classList.remove('show');
    }, 3200);
  }

  // =========================================================================
  // 10. MATRIX QUANTUM RAIN EASTER EGG
  // =========================================================================
  function startMatrixRain() {
    let rainCanvas = document.getElementById('matrixRainCanvas');
    if (!rainCanvas) {
      rainCanvas = document.createElement('canvas');
      rainCanvas.id = 'matrixRainCanvas';
      rainCanvas.className = 'matrix-rain-canvas';
      document.body.appendChild(rainCanvas);
    }

    rainCanvas.style.display = 'block';
    rainCanvas.style.opacity = '1';

    const rCtx = rainCanvas.getContext('2d');
    rainCanvas.width = window.innerWidth;
    rainCanvas.height = window.innerHeight;

    const chars = '0123456789ABCDEF<>/*&|!~+=-$#@';
    const fontSize = 14;
    const columns = Math.floor(rainCanvas.width / fontSize);
    const drops = Array(columns).fill(1);

    let frameCount = 0;
    const maxFrames = 180; // runs for ~3 seconds

    function draw() {
      rCtx.fillStyle = 'rgba(5, 7, 12, 0.08)';
      rCtx.fillRect(0, 0, rainCanvas.width, rainCanvas.height);

      rCtx.fillStyle = '#06b6d4';
      rCtx.font = `${fontSize}px 'JetBrains Mono', monospace`;

      for (let i = 0; i < drops.length; i++) {
        const text = chars[Math.floor(Math.random() * chars.length)];
        rCtx.fillText(text, i * fontSize, drops[i] * fontSize);

        if (drops[i] * fontSize > rainCanvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }

      frameCount++;
      if (frameCount < maxFrames) {
        requestAnimationFrame(draw);
      } else {
        rainCanvas.style.opacity = '0';
        setTimeout(() => {
          rainCanvas.style.display = 'none';
        }, 800);
      }
    }

    draw();
  }

  // =========================================================================
  // 11. MOBILE NAVIGATION DRAWER CONTROLLER
  // =========================================================================
  function initMobileNav() {
    const toggleBtn = document.getElementById('mobileMenuToggle');
    const closeBtn = document.getElementById('mobileDrawerClose');
    const backdrop = document.getElementById('mobileNavBackdrop');
    const drawer = document.getElementById('mobileNavDrawer');
    const mobileLinks = document.querySelectorAll('.mobile-nav-link, .mobile-nav-connect');
    const mobileAudioBtn = document.getElementById('mobileAudioToggleBtn');

    if (!toggleBtn || !drawer) return;

    function openMobileNav() {
      drawer.classList.add('active');
      drawer.setAttribute('aria-hidden', 'false');
      if (backdrop) backdrop.classList.add('active');
      toggleBtn.classList.add('active');
      toggleBtn.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
      sound.playClick(620, 0.04);
    }

    function closeMobileNav() {
      drawer.classList.remove('active');
      drawer.setAttribute('aria-hidden', 'true');
      if (backdrop) backdrop.classList.remove('active');
      toggleBtn.classList.remove('active');
      toggleBtn.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
      sound.playClick(440, 0.04);
    }

    toggleBtn.addEventListener('click', () => {
      if (drawer.classList.contains('active')) {
        closeMobileNav();
      } else {
        openMobileNav();
      }
    });

    if (closeBtn) closeBtn.addEventListener('click', closeMobileNav);
    if (backdrop) backdrop.addEventListener('click', closeMobileNav);

    // Close on navigation link click with smooth scroll
    mobileLinks.forEach((link) => {
      link.addEventListener('click', (e) => {
        closeMobileNav();
        const href = link.getAttribute('href');
        if (href && href.startsWith('#')) {
          e.preventDefault();
          const target = document.querySelector(href);
          if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
          }
        }
      });
    });

    // Mobile Audio Button trigger
    if (mobileAudioBtn) {
      mobileAudioBtn.addEventListener('click', () => {
        toggleAudioState();
      });
    }

    // Keyboard ESC closes mobile nav
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && drawer.classList.contains('active')) {
        closeMobileNav();
      }
    });
  }

  // =========================================================================
  // INITIALIZATION ON DOM READY
  // =========================================================================
  document.addEventListener('DOMContentLoaded', () => {
    initLiveClock();
    initSpotlightAndTilt();
    initInteractiveTerminal();
    initProjectSimulations();
    initSkillsMatrix();
    initCommandPalette();
    initAudioToggle();
    initContactActions();
    initMobileNav();

    // Attach subtle audio click to all buttons and links
    document.querySelectorAll('a, button, .interactive-click').forEach((el) => {
      el.addEventListener('mouseenter', () => sound.playHum(340, 0.04));
      el.addEventListener('click', () => sound.playClick(780, 0.03));
    });
  });

})();
