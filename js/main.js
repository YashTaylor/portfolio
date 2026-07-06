const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const hasFinePointer = window.matchMedia('(pointer: fine)').matches;

// shared night value (0 sunset → 1 night) — ambient.js reads this
window.NIGHT = 0;

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

// ===== Scroll: progress, nav, sky crossfade, parallax, timeline fill =====
const nav = document.getElementById('nav');
const progress = document.getElementById('progress');
const toTop = document.getElementById('to-top');
const skyDusk = document.getElementById('sky-dusk');
const skyNight = document.getElementById('sky-night');
const timeline = document.querySelector('.timeline');
const parallaxEls = document.querySelectorAll('[data-parallax]');
let lastY = window.scrollY;
let ticking = false;

const clamp01 = (v) => Math.min(Math.max(v, 0), 1);

function onScroll() {
  const y = window.scrollY;
  const max = document.documentElement.scrollHeight - window.innerHeight;
  const p = max > 0 ? y / max : 0;

  progress.style.transform = `scaleX(${p})`;
  nav.classList.toggle('nav--scrolled', y > 10);
  toTop.classList.toggle('show', y > window.innerHeight * 0.8);

  if (!navMenu.classList.contains('open')) {
    nav.classList.toggle('nav--hidden', y > lastY && y > 200);
  }
  lastY = y;

  // sky: sunset → dusk (p 0.20–0.55) → night (p 0.55–0.85)
  skyDusk.style.opacity = clamp01((p - 0.2) / 0.35);
  const night = clamp01((p - 0.55) / 0.3);
  skyNight.style.opacity = night;

  if (Math.abs(night - window.NIGHT) > 0.005) {
    window.NIGHT = night;
    document.body.style.setProperty('--night', night.toFixed(3));
  }

  if (!prefersReducedMotion) {
    if (y < window.innerHeight) {
      parallaxEls.forEach((el) => {
        el.style.translate = `0 ${y * parseFloat(el.dataset.parallax)}px`;
      });
    }
    if (timeline) {
      const rect = timeline.getBoundingClientRect();
      const t = (window.innerHeight * 0.75 - rect.top) / rect.height;
      timeline.style.setProperty('--tl', clamp01(t));
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

// ===== Hero name: cinematic letter reveal =====
const heroTitle = document.getElementById('hero-title');

if (!prefersReducedMotion) {
  let letterIndex = 0;
  // wrap each character of every text node in a .letter span, keep the accent span
  Array.from(heroTitle.childNodes).forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const frag = document.createDocumentFragment();
      for (const ch of node.textContent) {
        if (ch === ' ') {
          frag.appendChild(document.createTextNode(' '));
          continue;
        }
        const span = document.createElement('span');
        span.className = 'letter';
        span.style.setProperty('--i', letterIndex++);
        span.textContent = ch;
        frag.appendChild(span);
      }
      heroTitle.replaceChild(frag, node);
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      node.classList.add('letter');
      node.style.setProperty('--i', letterIndex++);
    }
  });
}

// ===== Role crossfade (calm replacement for typing) =====
const ROLES = ['an Android Developer', 'a Kotlin Enthusiast', 'a Hardware Integrator', 'a Problem Solver'];
const typedEl = document.getElementById('typed');

if (!prefersReducedMotion) {
  let roleIndex = 0;
  setInterval(() => {
    typedEl.classList.add('fading');
    setTimeout(() => {
      roleIndex = (roleIndex + 1) % ROLES.length;
      typedEl.textContent = ROLES[roleIndex];
      typedEl.classList.remove('fading');
    }, 580);
  }, 4200);
}

// ===== Scroll reveal with stagger =====
if (prefersReducedMotion) {
  document.querySelectorAll('.reveal').forEach((el) => el.classList.add('visible'));
} else {
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
    const eased = 1 - Math.pow(1 - t, 3);
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
