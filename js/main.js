const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const hasFinePointer = window.matchMedia('(pointer: fine)').matches;

// ===== Mobile menu toggle =====
const navToggle = document.getElementById('nav-toggle');
const navMenu = document.getElementById('nav-menu');

function setMenu(open) {
  navMenu.classList.toggle('open', open);
  navToggle.classList.toggle('open', open);
  navToggle.setAttribute('aria-expanded', String(open));
}

navToggle.addEventListener('click', () => setMenu(!navMenu.classList.contains('open')));

navMenu.addEventListener('click', (e) => {
  if (e.target.closest('a')) setMenu(false);
});

// ===== Nav: hide on scroll down, show on scroll up + progress bar =====
const nav = document.getElementById('nav');
const progress = document.getElementById('progress');
const toTop = document.getElementById('to-top');
const timeline = document.querySelector('.timeline');
const orb1 = document.querySelector('.hero__orb--1');
const orb2 = document.querySelector('.hero__orb--2');
let lastY = window.scrollY;
let ticking = false;

function onScroll() {
  const y = window.scrollY;
  const max = document.documentElement.scrollHeight - window.innerHeight;

  progress.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
  nav.classList.toggle('nav--scrolled', y > 10);
  toTop.classList.toggle('show', y > window.innerHeight * 0.8);

  // don't hide the nav while the mobile menu is open
  if (!navMenu.classList.contains('open')) {
    nav.classList.toggle('nav--hidden', y > lastY && y > 200);
  }
  lastY = y;

  if (!prefersReducedMotion) {
    // hero orbs drift slower than the page (parallax)
    if (y < window.innerHeight) {
      orb1.style.translate = `0 ${y * 0.18}px`;
      orb2.style.translate = `0 ${y * 0.1}px`;
    }
    // fill the timeline line as it scrolls through the viewport
    if (timeline) {
      const rect = timeline.getBoundingClientRect();
      const t = (window.innerHeight * 0.75 - rect.top) / rect.height;
      timeline.style.setProperty('--tl', Math.min(Math.max(t, 0), 1));
    }
  }
  ticking = false;
}

window.addEventListener('scroll', () => {
  if (!ticking) {
    ticking = true;
    requestAnimationFrame(onScroll);
  }
}, { passive: true });
onScroll();

toTop.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
});

// ===== Active nav link on scroll =====
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav__link');

const activeObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        navLinks.forEach((link) => {
          link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`);
        });
      }
    });
  },
  { rootMargin: '-40% 0px -55% 0px' }
);
sections.forEach((section) => activeObserver.observe(section));

// ===== Typing effect =====
const ROLES = ['an Android Developer', 'a Kotlin Enthusiast', 'a Hardware Integrator', 'a Problem Solver'];
const typedEl = document.getElementById('typed');

if (!prefersReducedMotion) {
  let roleIndex = 0;
  let charIndex = ROLES[0].length; // start fully typed, then erase
  let deleting = true;

  function tick() {
    const word = ROLES[roleIndex];
    charIndex += deleting ? -1 : 1;
    typedEl.textContent = word.slice(0, charIndex);

    let delay = deleting ? 45 : 85;
    if (!deleting && charIndex === word.length) {
      delay = 2200; // pause on the full word
      deleting = true;
    } else if (deleting && charIndex === 0) {
      deleting = false;
      roleIndex = (roleIndex + 1) % ROLES.length;
      delay = 350;
    }
    setTimeout(tick, delay);
  }
  setTimeout(tick, 2200);
}

// ===== Scroll reveal with stagger =====
if (prefersReducedMotion) {
  document.querySelectorAll('.reveal').forEach((el) => el.classList.add('visible'));
} else {
  // stagger siblings that reveal together (cards, skill groups, timeline items)
  document.querySelectorAll('.projects, .skills, .timeline, .section--center').forEach((group) => {
    group.querySelectorAll(':scope > .reveal').forEach((el, i) => {
      el.style.setProperty('--delay', `${i * 110}ms`);
    });
  });

  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );
  document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));
}

// ===== Animated stat counters =====
const stats = document.querySelectorAll('.stat__num');

function animateCount(el) {
  const target = parseFloat(el.dataset.count);
  const decimals = parseInt(el.dataset.decimals || '0', 10);
  const suffix = el.dataset.suffix || '';
  const duration = 1400;
  const start = performance.now();

  function frame(now) {
    const t = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - t, 3); // ease-out cubic
    el.textContent = (target * eased).toFixed(decimals) + suffix;
    if (t < 1) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

const statObserver = new IntersectionObserver(
  (entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        if (prefersReducedMotion) {
          const el = entry.target;
          el.textContent = parseFloat(el.dataset.count).toFixed(parseInt(el.dataset.decimals || '0', 10)) + (el.dataset.suffix || '');
        } else {
          animateCount(entry.target);
        }
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.6 }
);
stats.forEach((el) => statObserver.observe(el));

// ===== Cursor spotlight (desktop, motion allowed) =====
const spotlight = document.getElementById('spotlight');

if (hasFinePointer && !prefersReducedMotion) {
  let sx = 0, sy = 0, spotTicking = false;
  window.addEventListener('mousemove', (e) => {
    sx = e.clientX;
    sy = e.clientY;
    if (!spotTicking) {
      spotTicking = true;
      requestAnimationFrame(() => {
        spotlight.style.setProperty('--sx', `${sx}px`);
        spotlight.style.setProperty('--sy', `${sy}px`);
        spotTicking = false;
      });
    }
  }, { passive: true });
}

// ===== Card tilt + cursor-tracking glow =====
if (hasFinePointer && !prefersReducedMotion) {
  document.querySelectorAll('[data-tilt]').forEach((card) => {
    let rafId = null;

    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        card.style.setProperty('--mx', `${x}px`);
        card.style.setProperty('--my', `${y}px`);
        const rx = ((y / rect.height) - 0.5) * -6; // max ±3deg
        const ry = ((x / rect.width) - 0.5) * 6;
        card.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-4px)`;
      });
    });

    card.addEventListener('mouseleave', () => {
      if (rafId) cancelAnimationFrame(rafId);
      card.style.transform = '';
    });
  });
}

// ===== Theme toggle =====
const themeToggle = document.getElementById('theme-toggle');

themeToggle.addEventListener('click', () => {
  const next = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light';
  document.documentElement.dataset.theme = next;
  localStorage.setItem('theme', next);
  refreshParticleColor();
});

// ===== Custom cursor =====
if (hasFinePointer && !prefersReducedMotion) {
  document.documentElement.classList.add('custom-cursor');
  const dot = document.getElementById('cursor');
  const ring = document.getElementById('cursor-ring');
  let mx = window.innerWidth / 2, my = window.innerHeight / 2;
  let rx = mx, ry = my;

  window.addEventListener('mousemove', (e) => {
    mx = e.clientX;
    my = e.clientY;
    dot.style.translate = `${mx}px ${my}px`;
  }, { passive: true });

  (function followCursor() {
    rx += (mx - rx) * 0.16;
    ry += (my - ry) * 0.16;
    ring.style.translate = `${rx}px ${ry}px`;
    requestAnimationFrame(followCursor);
  })();

  document.querySelectorAll('a, button, [data-tilt]').forEach((el) => {
    el.addEventListener('mouseenter', () => ring.classList.add('cursor-ring--hover'));
    el.addEventListener('mouseleave', () => ring.classList.remove('cursor-ring--hover'));
  });
}

// ===== Magnetic elements =====
if (hasFinePointer && !prefersReducedMotion) {
  document.querySelectorAll('.btn, .social, .theme-toggle, .nav__logo, .to-top').forEach((el) => {
    const strength = el.classList.contains('btn') ? 0.22 : 0.35;
    el.addEventListener('mousemove', (e) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left - r.width / 2) * strength;
      const y = (e.clientY - r.top - r.height / 2) * strength;
      el.style.translate = `${x}px ${y}px`;
    });
    el.addEventListener('mouseleave', () => {
      el.style.translate = '';
    });
  });
}

// ===== Hero particle constellation =====
const canvas = document.getElementById('particles');
let particleColor = '#4fd1c5';

function refreshParticleColor() {
  particleColor = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#4fd1c5';
}
refreshParticleColor();

if (canvas && hasFinePointer && !prefersReducedMotion) {
  const ctx = canvas.getContext('2d');
  const hero = canvas.parentElement;
  let particles = [];
  let running = false;
  let rafId = null;
  const mouse = { x: -9999, y: -9999 };

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = hero.offsetWidth * dpr;
    canvas.height = hero.offsetHeight * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const count = Math.min(70, Math.floor((hero.offsetWidth * hero.offsetHeight) / 22000));
    particles = Array.from({ length: count }, (_, i) => ({
      // deterministic-ish spread using index; velocity from a simple hash
      x: ((i * 137.5) % hero.offsetWidth),
      y: ((i * 89.7) % hero.offsetHeight),
      vx: (((i * 7) % 10) - 5) / 22,
      vy: (((i * 13) % 10) - 5) / 22,
    }));
  }

  function step() {
    if (!running) return;
    const w = hero.offsetWidth, h = hero.offsetHeight;
    ctx.clearRect(0, 0, w, h);

    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > w) p.vx *= -1;
      if (p.y < 0 || p.y > h) p.vy *= -1;

      // gentle push away from the cursor
      const dx = p.x - mouse.x, dy = p.y - mouse.y;
      const dist = Math.hypot(dx, dy);
      if (dist < 110 && dist > 0.01) {
        p.x += (dx / dist) * 0.6;
        p.y += (dy / dist) * 0.6;
      }

      ctx.globalAlpha = 0.55;
      ctx.fillStyle = particleColor;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 1.6, 0, Math.PI * 2);
      ctx.fill();
    }

    // connect nearby particles
    ctx.strokeStyle = particleColor;
    ctx.lineWidth = 0.6;
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const a = particles[i], b = particles[j];
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d < 120) {
          ctx.globalAlpha = (1 - d / 120) * 0.22;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }
    ctx.globalAlpha = 1;
    rafId = requestAnimationFrame(step);
  }

  function setRunning(on) {
    if (on && !running) {
      running = true;
      step();
    } else if (!on && running) {
      running = false;
      if (rafId) cancelAnimationFrame(rafId);
    }
  }

  hero.addEventListener('mousemove', (e) => {
    const rect = hero.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  }, { passive: true });
  hero.addEventListener('mouseleave', () => {
    mouse.x = -9999;
    mouse.y = -9999;
  });

  window.addEventListener('resize', resize);
  document.addEventListener('visibilitychange', () => setRunning(!document.hidden));
  // only animate while the hero is on screen
  new IntersectionObserver((entries) => setRunning(entries[0].isIntersecting))
    .observe(hero);

  resize();
}
