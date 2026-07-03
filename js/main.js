/**
 * OV Suspension — main.js
 * Versión 1.0 | julio 2026
 *
 * Módulos:
 *   1. Reducción de movimiento (prefers-reduced-motion)
 *   2. Navbar — sticky + scroll + menú mobile
 *   3. Scroll suave a anclas
 *   4. Reveal on-scroll (IntersectionObserver)
 *   5. Contadores animados
 *   6. Botón "volver arriba"
 *   7. Año dinámico en footer
 *   8. Microinteracciones de cards
 */

'use strict';

/* ============================================================
   1. ACCESIBILIDAD — prefers-reduced-motion
   Si el usuario prefiere sin animaciones, no activamos ninguna.
   ============================================================ */
const prefersReducedMotion = window.matchMedia(
  '(prefers-reduced-motion: reduce)'
).matches;

/* ============================================================
   2. NAVBAR
   - Aplica clase .navbar--scrolled cuando el usuario scrollea
   - Toggle de menú mobile con soporte de teclado y ARIA
   ============================================================ */
(function initNavbar() {
  const navbar      = document.getElementById('navbar');
  const hamburger   = document.getElementById('hamburger');
  const navMenu     = document.getElementById('nav-menu');
  const navLinks    = navMenu ? navMenu.querySelectorAll('a') : [];

  if (!navbar || !hamburger || !navMenu) return;

  /* --- Sticky: clase al scrollear --- */
  let lastScroll = 0;

  function handleScroll() {
    const scrollY = window.scrollY;

    // Activar fondo sólido pasados los 60px
    if (scrollY > 60) {
      navbar.classList.add('navbar--scrolled');
      navbar.classList.remove('navbar--transparent');
    } else {
      navbar.classList.remove('navbar--scrolled');
      navbar.classList.add('navbar--transparent');
    }

    lastScroll = scrollY;
  }

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll(); // Estado inicial

  /* --- Menú mobile: toggle --- */
  function openMenu() {
    navMenu.classList.add('open');
    hamburger.setAttribute('aria-expanded', 'true');
    hamburger.setAttribute('aria-label', 'Cerrar menú');
    // Enfocar el primer link al abrir
    if (navLinks.length) navLinks[0].focus();
    // Bloquear scroll del body
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    navMenu.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    hamburger.setAttribute('aria-label', 'Abrir menú');
    document.body.style.overflow = '';
  }

  hamburger.addEventListener('click', function () {
    const isOpen = navMenu.classList.contains('open');
    if (isOpen) { closeMenu(); } else { openMenu(); }
  });

  // Cerrar al hacer clic en un link del menú
  navLinks.forEach(function (link) {
    link.addEventListener('click', closeMenu);
  });

  // Cerrar con la tecla Escape
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && navMenu.classList.contains('open')) {
      closeMenu();
      hamburger.focus();
    }
  });

  // Cerrar al redimensionar a desktop
  window.addEventListener('resize', function () {
    if (window.innerWidth > 768) { closeMenu(); }
  });
})();

/* ============================================================
   3. SCROLL SUAVE A ANCLAS
   Maneja los clicks en links tipo href="#seccion"
   (Complementa scroll-behavior: smooth del CSS)
   ============================================================ */
(function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (!targetId || targetId === '#') return;

      const target = document.querySelector(targetId);
      if (!target) return;

      e.preventDefault();

      const navbarHeight = 72; // altura de la navbar fija
      const targetTop = target.getBoundingClientRect().top + window.scrollY - navbarHeight;

      window.scrollTo({
        top: targetTop,
        behavior: prefersReducedMotion ? 'auto' : 'smooth'
      });

      // Mover foco al elemento destino para accesibilidad
      target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
    });
  });
})();

/* ============================================================
   4. REVEAL ON-SCROLL — IntersectionObserver
   Elementos con clase .reveal aparecen al entrar en viewport.
   También maneja .reveal--left y .reveal--right.
   ============================================================ */
(function initReveal() {
  if (prefersReducedMotion) {
    // Sin animaciones: mostrar todo directamente
    document.querySelectorAll('.reveal, .reveal--left, .reveal--right')
      .forEach(function (el) { el.classList.add('revealed'); });
    return;
  }

  const observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          // Una vez revelado, dejar de observar
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.12,    // 12% del elemento visible
      rootMargin: '0px 0px -40px 0px'  // offset desde el borde inferior
    }
  );

  document.querySelectorAll('.reveal, .reveal--left, .reveal--right')
    .forEach(function (el) { observer.observe(el); });
})();

/* ============================================================
   5. CONTADORES ANIMADOS
   Busca elementos con data-target y anima el número desde 0.
   Se activa al entrar en viewport con IntersectionObserver.
   ============================================================ */
(function initCounters() {
  /**
   * Anima un elemento desde 0 hasta target.
   * @param {Element} countEl  - el span.count dentro del stats__number
   * @param {number}  target   - valor final
   * @param {number}  duration - milisegundos de duración
   */
  function animateCounter(countEl, target, duration) {
    const start     = performance.now();
    const startVal  = 0;

    function step(now) {
      const elapsed  = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Easing out-cubic
      const eased    = 1 - Math.pow(1 - progress, 3);
      const current  = Math.round(startVal + (target - startVal) * eased);

      countEl.textContent = current;

      if (progress < 1) { requestAnimationFrame(step); }
    }

    requestAnimationFrame(step);
  }

  if (prefersReducedMotion) {
    // Mostrar valores finales sin animación
    document.querySelectorAll('[data-target]').forEach(function (wrapper) {
      const target   = parseInt(wrapper.dataset.target, 10);
      const countEl  = wrapper.querySelector('.count');
      if (countEl) { countEl.textContent = target; }
    });
    return;
  }

  const counterObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;

        const wrapper  = entry.target;
        const target   = parseInt(wrapper.dataset.target, 10);
        const countEl  = wrapper.querySelector('.count');

        if (!countEl || isNaN(target)) return;

        animateCounter(countEl, target, 1800);
        counterObserver.unobserve(wrapper);
      });
    },
    { threshold: 0.5 }
  );

  document.querySelectorAll('[data-target]')
    .forEach(function (el) { counterObserver.observe(el); });
})();

/* ============================================================
   6. BOTÓN "VOLVER ARRIBA"
   Aparece con clase .visible al bajar más de 400px.
   ============================================================ */
(function initScrollTop() {
  const btn = document.getElementById('scroll-top');
  if (!btn) return;

  window.addEventListener('scroll', function () {
    if (window.scrollY > 400) {
      btn.classList.add('visible');
    } else {
      btn.classList.remove('visible');
    }
  }, { passive: true });

  btn.addEventListener('click', function () {
    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion ? 'auto' : 'smooth'
    });
  });
})();

/* ============================================================
   7. AÑO DINÁMICO EN FOOTER
   ============================================================ */
(function initFooterYear() {
  const yearEl = document.getElementById('footer-year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
})();

/* ============================================================
   8. MICROINTERACCIONES DE CARDS
   Efecto de "tilt" suave al mover el mouse sobre las cards
   (solo en desktop, no en touch)
   ============================================================ */
(function initCardTilt() {
  // Solo en dispositivos con mouse/puntero fino
  const hasHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (!hasHover || prefersReducedMotion) return;

  document.querySelectorAll('.card').forEach(function (card) {
    card.addEventListener('mousemove', function (e) {
      const rect    = card.getBoundingClientRect();
      const x       = e.clientX - rect.left - rect.width / 2;
      const y       = e.clientY - rect.top  - rect.height / 2;
      const tiltX   = -(y / rect.height) * 5;  // máx 5deg
      const tiltY   =  (x / rect.width)  * 5;

      card.style.transform = 'translateY(-4px) perspective(800px) rotateX('
        + tiltX + 'deg) rotateY(' + tiltY + 'deg)';
    });

    card.addEventListener('mouseleave', function () {
      card.style.transform = '';
    });
  });
})();
