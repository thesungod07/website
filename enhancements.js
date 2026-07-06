(function () {
  'use strict';

  /* ==========================================================
   *  1. PARTICLE NETWORK
   *  Interactive connected nodes — the main visual centerpiece
   * ========================================================== */

  const canvas = document.createElement('canvas');
  canvas.id = 'particle-canvas';
  canvas.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:0;pointer-events:none;';
  document.body.prepend(canvas);

  const ctx = canvas.getContext('2d');
  let particles = [];
  let mouse = { x: null, y: null, radius: 130 };
  let animId;

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function initParticles() {
    const density = Math.min(1200, Math.max(400, Math.floor((canvas.width * canvas.height) / 11000)));
    particles = [];
    for (let i = 0; i < density; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        r: Math.random() * 2 + 0.8,
        phase: Math.random() * Math.PI * 2,
      });
    }
  }

  function lerp(a, b, t) { return a + (b - a) * t; }

  function drawParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (morphState) {
      morphProgress = Math.min(1, morphProgress + 0.025);
      if (morphState === 'forming') {
        if (morphProgress >= 1) morphState = 'hold';
      } else if (morphState === 'dispersing') {
        if (morphProgress >= 1) { morphState = null; document.body.classList.remove('morphing-active'); setContentOpacity(''); }
      }
    }

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      let px = p.x, py = p.y;

      if (morphState) {
        const o = morphOrigins[i];
        const t = morphTargets[i];
        if (morphState === 'forming') {
          px = lerp(o.x, t.x, easeInOut(morphProgress));
          py = lerp(o.y, t.y, easeInOut(morphProgress));
        } else if (morphState === 'hold') {
          px = t.x;
          py = t.y;
        } else if (morphState === 'dispersing') {
          px = lerp(t.x, o.x, easeInOut(morphProgress));
          py = lerp(t.y, o.y, easeInOut(morphProgress));
        }
      } else {
        /* mouse interaction */
        if (mouse.x !== null) {
          const dx = mouse.x - px;
          const dy = mouse.y - py;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < mouse.radius && dist > 0) {
            const force = (mouse.radius - dist) / mouse.radius;
            px -= dx * force * 0.015;
            py -= dy * force * 0.015;
          }
        }

        px += p.vx + Math.sin(Date.now() * 0.0006 + p.phase) * 0.08;
        py += p.vy + Math.cos(Date.now() * 0.0004 + p.phase) * 0.08;

        if (px < -10) px = canvas.width + 10;
        if (px > canvas.width + 10) px = -10;
        if (py < -10) py = canvas.height + 10;
        if (py > canvas.height + 10) py = -10;

        /* only write back when not morphing */
        p.x = px;
        p.y = py;
      }

      /* draw connections */
      const connectionDist = morphState ? 40 : 110;
      for (let j = i + 1; j < particles.length; j++) {
        const p2 = particles[j];
        let p2x, p2y;
        if (morphState) {
          const o2 = morphOrigins[j];
          const t2 = morphTargets[j];
          if (morphState === 'forming') {
            p2x = lerp(o2.x, t2.x, easeInOut(morphProgress));
            p2y = lerp(o2.y, t2.y, easeInOut(morphProgress));
          } else if (morphState === 'hold') {
            p2x = t2.x; p2y = t2.y;
          } else {
            p2x = lerp(t2.x, o2.x, easeInOut(morphProgress));
            p2y = lerp(t2.y, o2.y, easeInOut(morphProgress));
          }
        } else {
          p2x = p2.x; p2y = p2.y;
        }
        const dx = px - p2x;
        const dy = py - p2y;
        const dist = dx * dx + dy * dy;
        if (dist < connectionDist * connectionDist) {
          const alpha = morphState
            ? (1 - Math.sqrt(dist) / connectionDist) * 0.5
            : (1 - Math.sqrt(dist) / connectionDist) * 0.12;
          ctx.beginPath();
          ctx.strokeStyle = `rgba(74, 222, 128, ${alpha})`;
          ctx.lineWidth = morphState ? 0.8 : 0.6;
          ctx.moveTo(px, py);
          ctx.lineTo(p2x, p2y);
          ctx.stroke();
        }
      }

      ctx.beginPath();
      const brightness = morphState
        ? 0.7
        : 0.2 + Math.sin(Date.now() * 0.002 + p.phase) * 0.1 + 0.3;
      ctx.fillStyle = `rgba(74, 222, 128, ${brightness})`;
      ctx.arc(px, py, morphState ? p.r * 1.2 : p.r, 0, Math.PI * 2);
      ctx.fill();
    }

    animId = requestAnimationFrame(drawParticles);
  }

  function easeInOut(t) {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  }

  function startParticles() {
    resize();
    initParticles();
    drawParticles();
  }

  window.addEventListener('resize', () => {
    morphState = null; document.body.classList.remove('morphing-active'); setContentOpacity('');
    resize();
    initParticles();
  });

  document.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  document.addEventListener('mouseleave', () => {
    mouse.x = null;
    mouse.y = null;
  });

  /* expose for terminal apollo command */
  let morphState = null;  // 'forming' | 'hold' | 'dispersing'
  let morphProgress = 0;
  let morphOrigins = [];
  let morphTargets = [];

  function getTextPixels(text, maxSamples) {
    const off = document.createElement('canvas');
    off.width = Math.max(canvas.width, 800);
    off.height = Math.max(canvas.height * 0.5, 200);
    const octx = off.getContext('2d');
    if (!octx) return null;
    const size = Math.max(80, Math.min(off.height * 0.85, off.width / 3));
    octx.font = `900 ${size}px "JetBrains Mono", "Inter", sans-serif`;
    const metrics = octx.measureText(text);
    const tw = metrics.width;
    const th = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent || size;
    const ox = (off.width - tw) / 2;
    const oy = (off.height + th) / 2;
    octx.fillStyle = '#fff';
    octx.textBaseline = 'bottom';
    octx.fillText(text, ox, oy);
    const imgData = octx.getImageData(0, 0, off.width, off.height);
    if (!imgData) return null;
    const pixels = [];
    for (let y = 0; y < imgData.height; y += 3) {
      for (let x = 0; x < imgData.width; x += 3) {
        if (imgData.data[(y * imgData.width + x) * 4 + 3] > 128) {
          pixels.push({ x: x + (canvas.width - off.width) / 2, y: y + (canvas.height - off.height) / 2 });
        }
      }
    }
    if (pixels.length === 0) return null;
    if (maxSamples < 1) return pixels.slice(0, 100);
    const sampled = [];
    const step = Math.max(1, Math.floor(pixels.length / maxSamples));
    for (let i = 0; i < maxSamples; i++) {
      const idx = Math.min(Math.floor(i * step + Math.random() * step), pixels.length - 1);
      sampled.push(pixels[idx]);
    }
    return sampled;
  }

  function setContentOpacity(opacity) {
    const targets = document.querySelectorAll('nav, section, .hero, footer, .scroll-indicator, #cursor-glow');
    targets.forEach(el => { el.style.opacity = opacity; el.style.transition = 'opacity 0.8s ease'; });
    canvas.style.zIndex = opacity === '' ? 0 : 9999;
  }

  window.__shapeParticles = function (text, holdMs) {
    if (morphState) return;
    if (particles.length < 10) return;
    const targets = getTextPixels(text, particles.length);
    if (!targets) return;
    morphOrigins = particles.map(p => ({ x: p.x, y: p.y }));
    morphTargets = targets;
    morphProgress = 0;
    morphState = 'forming';
    document.body.classList.add('morphing-active');
    setContentOpacity('0.02');
    if (holdMs === undefined) holdMs = 3000;
    setTimeout(() => {
      if (morphState === 'hold') {
        morphProgress = 0;
        morphState = 'dispersing';
      }
    }, holdMs);
  };

  /* pause on low-power devices */
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    canvas.style.display = 'none';
  } else {
    startParticles();
  }


  /* ==========================================================
   *  2. CURSOR GLOW
   *  Subtle green radial gradient that follows the mouse
   * ========================================================== */

  const glow = document.createElement('div');
  glow.id = 'cursor-glow';
  glow.style.cssText =
    'position:fixed;width:500px;height:500px;border-radius:50%;' +
    'background:radial-gradient(circle,rgba(74,222,128,0.06) 0%,transparent 60%);' +
    'pointer-events:none;z-index:9998;transform:translate(-50%,-50%);' +
    'transition:opacity 0.2s;will-change:transform;opacity:0;';
  document.body.appendChild(glow);

  let glowTimer;
  document.addEventListener('mousemove', (e) => {
    glow.style.left = e.clientX + 'px';
    glow.style.top = e.clientY + 'px';
    glow.style.opacity = '1';
    clearTimeout(glowTimer);
    glowTimer = setTimeout(() => { glow.style.opacity = '0'; }, 2000);
  });

  document.addEventListener('mouseenter', () => {
    glow.style.opacity = '1';
  });

  document.addEventListener('mouseleave', () => {
    glow.style.opacity = '0';
  });


  /* ==========================================================
   *  3. SCROLL REVEAL ANIMATIONS
   *  Fade-in + slide-up for sections and their children
   * ========================================================== */

  const observerOptions = {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px',
  };

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, observerOptions);

  function setupReveals() {
    /* reveal major sections */
    document.querySelectorAll('section, .hero').forEach((el) => {
      el.classList.add('reveal');
      revealObserver.observe(el);
    });

    /* reveal children with stagger */
    document.querySelectorAll(
      '.skill-group, .project-card, .sec-card, .link-card, .terminal-block, .term-outer, .currently-wrap'
    ).forEach((el, i) => {
      el.classList.add('reveal');
      const delay = Math.min(i % 6, 5);
      el.classList.add('reveal-delay-' + delay);
      revealObserver.observe(el);
    });
  }

  /* wait for DOM — the original page may load async */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupReveals);
  } else {
    setupReveals();
  }


  /* ==========================================================
   *  4. SCROLL INDICATOR
   *  Small 'scroll down' hint at the bottom of hero
   * ========================================================== */

  const hero = document.querySelector('.hero');
  if (hero) {
    const indicator = document.createElement('div');
    indicator.className = 'scroll-indicator';
    indicator.innerHTML = '<span>scroll</span><div class="scroll-indicator-line"></div>';
    hero.appendChild(indicator);

    /* hide once user scrolls past hero */
    window.addEventListener('scroll', () => {
      const heroBottom = hero.getBoundingClientRect().bottom;
      indicator.style.opacity = heroBottom > 80 ? '0.5' : '0';
    }, { passive: true });
  }


  /* ==========================================================
   *  5. CARD TILT ON HOVER (3D Parallax)
   *  Subtle perspective tilt on project cards
   * ========================================================== */

  document.querySelectorAll('.project-card').forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      card.style.setProperty('--rx', (y * -6) + 'deg');
      card.style.setProperty('--ry', (x * 6) + 'deg');
      card.style.transform = `perspective(600px) rotateX(var(--rx)) rotateY(var(--ry)) translateY(-4px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });

})();
