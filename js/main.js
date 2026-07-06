// ===== Mobile menu toggle =====
const navToggle = document.getElementById('nav-toggle');
const navMenu = document.getElementById('nav-menu');

navToggle.addEventListener('click', () => {
  const isOpen = navMenu.classList.toggle('open');
  navToggle.classList.toggle('open', isOpen);
  navToggle.setAttribute('aria-expanded', String(isOpen));
});

// Close the menu when a link is clicked (mobile)
navMenu.addEventListener('click', (e) => {
  if (e.target.matches('.nav__link')) {
    navMenu.classList.remove('open');
    navToggle.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
  }
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

// ===== Fade-in on scroll =====
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (!prefersReducedMotion) {
  const revealTargets = document.querySelectorAll('.section, .hero__content');
  revealTargets.forEach((el) => el.classList.add('reveal'));

  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1 }
  );

  revealTargets.forEach((el) => revealObserver.observe(el));
}
