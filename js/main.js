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
