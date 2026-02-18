/* ===================================================
   MAIN.JS — ADVANCED GSAP + CINEMATIC EFFECTS
   =================================================== */

gsap.registerPlugin(ScrollTrigger);

/* ══════════════════════════════════════════════════
   1. CUSTOM CURSOR
══════════════════════════════════════════════════ */
const cursorDot  = document.createElement('div');
const cursorRing = document.createElement('div');
cursorDot.className  = 'cursor-dot';
cursorRing.className = 'cursor-ring';
document.body.appendChild(cursorDot);
document.body.appendChild(cursorRing);

let mouseX = 0, mouseY = 0;
let ringX  = 0, ringY  = 0;

window.addEventListener('mousemove', e => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  gsap.to(cursorDot, { x: mouseX, y: mouseY, duration: 0.05, ease: 'none' });
});

// Ring follows with lag
gsap.ticker.add(() => {
  ringX += (mouseX - ringX) * 0.12;
  ringY += (mouseY - ringY) * 0.12;
  gsap.set(cursorRing, { x: ringX, y: ringY });
});

// Cursor grow on interactive elements
document.querySelectorAll('a, button, .gallery-item, .step-card, .filter-btn').forEach(el => {
  el.addEventListener('mouseenter', () => {
    gsap.to(cursorRing, { scale: 2.2, opacity: 0.5, duration: 0.3 });
    gsap.to(cursorDot,  { scale: 0.4, duration: 0.3 });
  });
  el.addEventListener('mouseleave', () => {
    gsap.to(cursorRing, { scale: 1, opacity: 1, duration: 0.3 });
    gsap.to(cursorDot,  { scale: 1, duration: 0.3 });
  });
});

/* ══════════════════════════════════════════════════
   2. PARTICLE CANVAS (hero background)
══════════════════════════════════════════════════ */
const hero = document.getElementById('hero');
if (hero) {
  const canvas = document.createElement('canvas');
  canvas.className = 'hero-particles';
  hero.querySelector('.hero-bg').appendChild(canvas);
  const ctx = canvas.getContext('2d');

  let particles = [];
  const PARTICLE_COUNT = 80;

  function resizeCanvas() {
    canvas.width  = hero.offsetWidth;
    canvas.height = hero.offsetHeight;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  class Particle {
    constructor() { this.reset(); }
    reset() {
      this.x    = Math.random() * canvas.width;
      this.y    = Math.random() * canvas.height;
      this.size = Math.random() * 1.5 + 0.3;
      this.speedX = (Math.random() - 0.5) * 0.4;
      this.speedY = (Math.random() - 0.5) * 0.4;
      this.opacity = Math.random() * 0.6 + 0.1;
      this.color = Math.random() > 0.6 ? '#ff6b00' : '#00d4ff';
    }
    update() {
      this.x += this.speedX;
      this.y += this.speedY;
      if (this.x < 0 || this.x > canvas.width ||
          this.y < 0 || this.y > canvas.height) this.reset();
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.globalAlpha = this.opacity;
      ctx.fill();
    }
  }

  for (let i = 0; i < PARTICLE_COUNT; i++) particles.push(new Particle());

  // Draw connecting lines between nearby particles
  function drawConnections() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 100) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = '#ff6b00';
          ctx.globalAlpha = (1 - dist / 100) * 0.08;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
  }

  function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.globalAlpha = 1;
    particles.forEach(p => { p.update(); p.draw(); });
    drawConnections();
    requestAnimationFrame(animateParticles);
  }
  animateParticles();
}

/* ══════════════════════════════════════════════════
   3. TEXT SCRAMBLE EFFECT (hero title)
══════════════════════════════════════════════════ */
class TextScramble {
  constructor(el) {
    this.el = el;
    this.chars = '!<>-_\\/[]{}—=+*^?#ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    this.update = this.update.bind(this);
  }
  setText(newText) {
    const old = this.el.innerText;
    const len = Math.max(old.length, newText.length);
    const promise = new Promise(res => this.resolve = res);
    this.queue = [];
    for (let i = 0; i < len; i++) {
      const from  = old[i] || '';
      const to    = newText[i] || '';
      const start = Math.floor(Math.random() * 20);
      const end   = start + Math.floor(Math.random() * 20);
      this.queue.push({ from, to, start, end });
    }
    cancelAnimationFrame(this.frameReq);
    this.frame = 0;
    this.update();
    return promise;
  }
  update() {
    let output = '', complete = 0;
    for (let i = 0, n = this.queue.length; i < n; i++) {
      let { from, to, start, end, char } = this.queue[i];
      if (this.frame >= end) {
        complete++;
        output += to;
      } else if (this.frame >= start) {
        if (!char || Math.random() < 0.28) {
          char = this.chars[Math.floor(Math.random() * this.chars.length)];
          this.queue[i].char = char;
        }
        output += `<span class="scramble-char">${char}</span>`;
      } else {
        output += from;
      }
    }
    this.el.innerHTML = output;
    if (complete === this.queue.length) {
      this.resolve();
    } else {
      this.frameReq = requestAnimationFrame(this.update);
      this.frame++;
    }
  }
}

/* ══════════════════════════════════════════════════
   4. MAGNETIC BUTTONS
══════════════════════════════════════════════════ */
function initMagneticButtons() {
  document.querySelectorAll('.btn-primary, .btn-secondary').forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const rect   = btn.getBoundingClientRect();
      const cx     = rect.left + rect.width  / 2;
      const cy     = rect.top  + rect.height / 2;
      const dx     = (e.clientX - cx) * 0.35;
      const dy     = (e.clientY - cy) * 0.35;
      gsap.to(btn, { x: dx, y: dy, duration: 0.3, ease: 'power2.out' });
    });
    btn.addEventListener('mouseleave', () => {
      gsap.to(btn, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1, 0.4)' });
    });
  });
}

/* ══════════════════════════════════════════════════
   5. NAVBAR SCROLL + REVEAL
══════════════════════════════════════════════════ */
const navbar = document.getElementById('navbar');
let lastScroll = 0;
if (navbar) {
  // Animate nav links in on load
  gsap.from('.nav-link, .nav-github', {
    opacity: 0,
    y: -12,
    duration: 0.5,
    stagger: 0.08,
    ease: 'power3.out',
    delay: 0.8
  });
  gsap.from('.nav-logo', {
    opacity: 0,
    x: -20,
    duration: 0.6,
    ease: 'power3.out',
    delay: 0.5
  });

  window.addEventListener('scroll', () => {
    const current = window.scrollY;
    navbar.classList.toggle('scrolled', current > 20);
    // Hide on scroll down, show on scroll up
    if (current > lastScroll && current > 200) {
      gsap.to(navbar, { y: -80, duration: 0.4, ease: 'power2.in' });
    } else {
      gsap.to(navbar, { y: 0, duration: 0.4, ease: 'power2.out' });
    }
    lastScroll = current;
  });
}

/* ══════════════════════════════════════════════════
   6. MOBILE NAV TOGGLE
══════════════════════════════════════════════════ */
const navToggle = document.getElementById('navToggle');
const navLinks  = document.querySelector('.nav-links');
if (navToggle && navLinks) {
  navToggle.addEventListener('click', () => {
    navLinks.classList.toggle('open');
  });
  navLinks.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => navLinks.classList.remove('open'));
  });
}

/* ══════════════════════════════════════════════════
   7. HERO CINEMATIC ENTRANCE (index.html)
══════════════════════════════════════════════════ */
const heroTitle = document.getElementById('heroTitle');
if (heroTitle) {
  const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });

  // Badge slides in with bounce
  tl.to('#heroBadge', {
    opacity: 1, y: 0, duration: 0.7, ease: 'back.out(2)', delay: 0.3
  })
  // Lines stagger with clip-path reveal
  .fromTo('.line-1',
    { opacity: 0, y: 60, skewX: -5 },
    { opacity: 1, y: 0,  skewX: 0, duration: 0.9 }, '-=0.2'
  )
  .fromTo('.line-2',
    { opacity: 0, y: 80, skewX: -8, scale: 0.92 },
    { opacity: 1, y: 0,  skewX: 0,  scale: 1, duration: 1.0 }, '-=0.5'
  )
  .fromTo('.line-3',
    { opacity: 0, y: 50, letterSpacing: '20px' },
    { opacity: 1, y: 0,  letterSpacing: '8px', duration: 0.9 }, '-=0.5'
  )
  .to('#heroDesc', {
    opacity: 1, y: 0, duration: 0.7
  }, '-=0.4')
  .to('#heroActions', {
    opacity: 1, y: 0, duration: 0.6
  }, '-=0.3')
  .to('#heroStats', {
    opacity: 1, y: 0, duration: 0.6
  }, '-=0.2');

  // Scramble the GTA text after entrance
  tl.call(() => {
    const line2 = document.querySelector('.line-2');
    if (line2) {
      const scrambler = new TextScramble(line2);
      scrambler.setText('ARTWORK');
    }
  }, null, '+=0.3');

  // Floating glows — organic movement
  gsap.to('.glow-1', {
    x: 80, y: 60, scale: 1.15,
    duration: 9, repeat: -1, yoyo: true, ease: 'sine.inOut'
  });
  gsap.to('.glow-2', {
    x: -70, y: -50, scale: 1.2,
    duration: 11, repeat: -1, yoyo: true, ease: 'sine.inOut'
  });

  // Stat numbers count up
  tl.call(() => {
    document.querySelectorAll('.stat-num').forEach(el => {
      const target = el.textContent;
      if (!isNaN(target)) {
        gsap.from({ val: 0 }, {
          val: parseFloat(target),
          duration: 1.5,
          ease: 'power2.out',
          onUpdate: function() {
            el.textContent = Math.round(this.targets()[0].val);
          }
        });
      }
    });
  });

  initMagneticButtons();
}

/* ══════════════════════════════════════════════════
   8. SCROLL TRIGGER — ADVANCED REVEALS
══════════════════════════════════════════════════ */

// Section tags — slide in from left
gsap.utils.toArray('.section-tag').forEach(tag => {
  gsap.from(tag, {
    scrollTrigger: { trigger: tag, start: 'top 88%' },
    opacity: 0, x: -30, duration: 0.5, ease: 'power3.out'
  });
});

// Section titles — split word animation
gsap.utils.toArray('.section-title').forEach(title => {
  gsap.from(title, {
    scrollTrigger: { trigger: title, start: 'top 88%' },
    opacity: 0, y: 40, skewX: -3, duration: 0.7, ease: 'power3.out'
  });
});

// Step cards — 3D flip in
gsap.utils.toArray('.step-card').forEach((card, i) => {
  gsap.from(card, {
    scrollTrigger: { trigger: card, start: 'top 85%' },
    opacity: 0,
    y: 60,
    rotateX: 15,
    transformOrigin: 'top center',
    duration: 0.8,
    delay: i * 0.15,
    ease: 'power3.out'
  });
  // Hover tilt
  card.addEventListener('mousemove', e => {
    const rect = card.getBoundingClientRect();
    const rx = ((e.clientY - rect.top)  / rect.height - 0.5) * 10;
    const ry = ((e.clientX - rect.left) / rect.width  - 0.5) * -10;
    gsap.to(card, { rotateX: rx, rotateY: ry, duration: 0.4, ease: 'power2.out', transformPerspective: 800 });
  });
  card.addEventListener('mouseleave', () => {
    gsap.to(card, { rotateX: 0, rotateY: 0, duration: 0.5, ease: 'elastic.out(1, 0.5)' });
  });
});

// Tool cards — slide from sides
gsap.utils.toArray('.tool-card').forEach((card, i) => {
  gsap.from(card, {
    scrollTrigger: { trigger: card, start: 'top 85%' },
    opacity: 0,
    x: i % 2 === 0 ? -60 : 60,
    duration: 0.8,
    ease: 'power3.out'
  });
});

// Preview cards — scale + fade
gsap.utils.toArray('.preview-card').forEach((card, i) => {
  gsap.from(card, {
    scrollTrigger: { trigger: card, start: 'top 88%' },
    opacity: 0,
    scale: 0.92,
    y: 40,
    duration: 0.8,
    delay: i * 0.12,
    ease: 'power3.out'
  });
});

// Gallery items — stagger cascade
gsap.utils.toArray('.gallery-item').forEach((item, i) => {
  gsap.from(item, {
    scrollTrigger: { trigger: item, start: 'top 90%' },
    opacity: 0,
    y: 50,
    scale: 0.95,
    duration: 0.6,
    delay: (i % 3) * 0.1,
    ease: 'power3.out'
  });
});

// Page header
const pageHeader = document.querySelector('.page-header');
if (pageHeader) {
  gsap.from(pageHeader.querySelector('.section-tag'), {
    opacity: 0, y: -20, duration: 0.5, delay: 0.3, ease: 'power3.out'
  });
  gsap.from(pageHeader.querySelector('.page-title'), {
    opacity: 0, y: 30, skewX: -4, duration: 0.7, delay: 0.5, ease: 'power3.out'
  });
  gsap.from(pageHeader.querySelector('.page-desc'), {
    opacity: 0, y: 20, duration: 0.6, delay: 0.7, ease: 'power3.out'
  });
}

/* ══════════════════════════════════════════════════
   9. HORIZONTAL SCROLL PROGRESS BAR
══════════════════════════════════════════════════ */
const progressBar = document.createElement('div');
progressBar.className = 'scroll-progress';
document.body.appendChild(progressBar);

window.addEventListener('scroll', () => {
  const pct = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
  gsap.to(progressBar, { width: pct + '%', duration: 0.1, ease: 'none' });
});

/* ══════════════════════════════════════════════════
   10. SECTION BORDER GLOW ON SCROLL
══════════════════════════════════════════════════ */
gsap.utils.toArray('.section').forEach(section => {
  ScrollTrigger.create({
    trigger: section,
    start: 'top 60%',
    end: 'bottom 40%',
    onEnter: () => gsap.to(section, { '--glow-opacity': 1, duration: 0.5 }),
    onLeave: () => gsap.to(section, { '--glow-opacity': 0, duration: 0.5 }),
    onEnterBack: () => gsap.to(section, { '--glow-opacity': 1, duration: 0.5 }),
    onLeaveBack: () => gsap.to(section, { '--glow-opacity': 0, duration: 0.5 }),
  });
});
