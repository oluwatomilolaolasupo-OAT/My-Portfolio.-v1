/**
 * OAT Photography — script.js
 * Vanilla JS: scroll reveal · marquee pause · testimonial slider
 *             · mobile drawer · smooth scroll · keyboard nav
 */

'use strict';

/* ─── 1. SCROLL-TRIGGERED REVEAL ───────────────────────────────────── */
(function initReveal() {
  var els = document.querySelectorAll('.reveal-up');
  if (!els.length) return;

  // If user prefers reduced motion, skip — CSS already handles it
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    els.forEach(function(el) { el.classList.add('is-visible'); });
    return;
  }

  var observer = new IntersectionObserver(
    function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  els.forEach(function(el) { observer.observe(el); });
})();

/* ─── 2. MOBILE DRAWER ─────────────────────────────────────────────── */
(function initDrawer() {
  var hamburger = document.querySelector('.hamburger');
  var drawer    = document.querySelector('.mobile-drawer');
  var overlay   = document.querySelector('.drawer-overlay');
  var closeBtn  = document.querySelector('.drawer-close');

  if (!hamburger || !drawer) return;

  function openDrawer() {
    drawer.classList.add('is-open');
    overlay.classList.add('is-active');
    hamburger.setAttribute('aria-expanded', 'true');
    drawer.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    // Focus the close button for keyboard users
    closeBtn && closeBtn.focus();
  }

  function closeDrawer() {
    drawer.classList.remove('is-open');
    overlay.classList.remove('is-active');
    hamburger.setAttribute('aria-expanded', 'false');
    drawer.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    hamburger.focus();
  }

  hamburger.addEventListener('click', openDrawer);
  closeBtn && closeBtn.addEventListener('click', closeDrawer);
  overlay.addEventListener('click', closeDrawer);

  // Close on drawer link click
  drawer.querySelectorAll('a').forEach(function(link) {
    link.addEventListener('click', closeDrawer);
  });

  // Close on Escape key
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && drawer.classList.contains('is-open')) {
      closeDrawer();
    }
  });

  // Trap focus within drawer when open
  drawer.addEventListener('keydown', function(e) {
    if (e.key !== 'Tab') return;
    var focusable = drawer.querySelectorAll('a, button, [tabindex]:not([tabindex="-1"])');
    var first = focusable[0];
    var last  = focusable[focusable.length - 1];
    if (e.shiftKey) {
      if (document.activeElement === first) { e.preventDefault(); last.focus(); }
    } else {
      if (document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
})();

/* ─── 3. TESTIMONIAL SLIDER ────────────────────────────────────────── */
(function initTestimonials() {
  var slides   = document.querySelectorAll('.testimonial-slide');
  var dots     = document.querySelectorAll('.t-dot');
  var prevBtn  = document.getElementById('tPrev');
  var nextBtn  = document.getElementById('tNext');

  if (!slides.length) return;

  var current  = 0;
  var total    = slides.length;
  var autoTimer = null;

  function goTo(index, focus) {
    // Hide current
    slides[current].classList.remove('is-active');
    slides[current].setAttribute('aria-hidden', 'true');
    dots[current].classList.remove('t-dot--active');
    dots[current].setAttribute('aria-pressed', 'false');

    // Update index
    current = (index + total) % total;

    // Show new
    slides[current].classList.add('is-active');
    slides[current].setAttribute('aria-hidden', 'false');
    dots[current].classList.add('t-dot--active');
    dots[current].setAttribute('aria-pressed', 'true');

    if (focus) {
      var q = slides[current].querySelector('.testimonial-quote');
      q && q.focus();
    }

    resetAuto();
  }

  function next() { goTo(current + 1, false); }
  function prev() { goTo(current - 1, false); }

  // Auto-advance every 7s
  function startAuto() {
    autoTimer = setInterval(next, 7000);
  }
  function resetAuto() {
    clearInterval(autoTimer);
    startAuto();
  }

  prevBtn && prevBtn.addEventListener('click', function() { goTo(current - 1, false); });
  nextBtn && nextBtn.addEventListener('click', function() { goTo(current + 1, false); });

  dots.forEach(function(dot, i) {
    dot.addEventListener('click', function() { goTo(i, true); });
  });

  // Keyboard support on track
  var track = document.getElementById('testimonialsTrack');
  track && track.addEventListener('keydown', function(e) {
    if (e.key === 'ArrowRight') { goTo(current + 1, false); }
    if (e.key === 'ArrowLeft')  { goTo(current - 1, false); }
  });

  // Pause auto-advance when testimonials section is out of view
  if ('IntersectionObserver' in window) {
    var sectionObs = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) { startAuto(); }
        else { clearInterval(autoTimer); }
      });
    }, { threshold: 0.2 });
    var section = document.querySelector('.testimonials-section');
    section && sectionObs.observe(section);
  } else {
    startAuto();
  }

  // Show first slide
  slides[0].classList.add('is-active');
  slides[0].removeAttribute('aria-hidden');
})();

/* ─── 4. STICKY NAV — subtle shadow on scroll ─────────────────────── */
(function initStickyNav() {
  var header = document.querySelector('.site-header');
  if (!header) return;

  var lastY = 0;
  window.addEventListener('scroll', function() {
    var y = window.scrollY;
    if (y > 10) {
      header.style.boxShadow = '0 1px 0 rgba(35,27,24,0.08)';
    } else {
      header.style.boxShadow = 'none';
    }
    lastY = y;
  }, { passive: true });
})();

/* ─── 5. SMOOTH SCROLL for anchor links ───────────────────────────── */
(function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
    anchor.addEventListener('click', function(e) {
      var targetId = this.getAttribute('href').slice(1);
      if (!targetId) return;
      var target = document.getElementById(targetId);
      if (!target) return;
      e.preventDefault();
      var navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 72;
      var top  = target.getBoundingClientRect().top + window.scrollY - navH - 16;
      window.scrollTo({ top: top, behavior: 'smooth' });
      // Update focus to target for accessibility
      target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
      target.addEventListener('blur', function() { target.removeAttribute('tabindex'); }, { once: true });
    });
  });
})();

/* ─── 6. PORTFOLIO CARD — arrow nudge enhancement ─────────────────── */
(function initCardArrows() {
  // The CSS handles the translateX transform; this JS adds an extra
  // aria-label update for screen readers when hovering.
  document.querySelectorAll('.portfolio-card').forEach(function(card) {
    var link = card.querySelector('.card-title-link');
    if (link) {
      var origLabel = link.getAttribute('aria-label') || '';
      card.addEventListener('mouseenter', function() {
        link.setAttribute('data-hovered', 'true');
      });
      card.addEventListener('mouseleave', function() {
        link.removeAttribute('data-hovered');
      });
    }
  });
})();

/* ─── 7. MARQUEE PAUSE ON FOCUS ───────────────────────────────────── */
(function initMarqueeFocus() {
  var strip = document.querySelector('.marquee-strip');
  var track = document.querySelector('.marquee-track');
  if (!strip || !track) return;

  strip.addEventListener('focusin', function() {
    track.style.animationPlayState = 'paused';
  });
  strip.addEventListener('focusout', function() {
    track.style.animationPlayState = 'running';
  });
})();

/* ─── 8. NAV ACTIVE STATE (highlight current section) ─────────────── */
(function initNavHighlight() {
  var sections = document.querySelectorAll('section[id], footer[id]');
  var navLinks = document.querySelectorAll('.nav-link, .drawer-link');
  if (!sections.length || !navLinks.length) return;

  if (!('IntersectionObserver' in window)) return;

  var sectionMap = {};
  sections.forEach(function(s) { sectionMap[s.id] = s; });

  var obs = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (!entry.isIntersecting) return;
      var id = entry.target.id;
      navLinks.forEach(function(link) {
        var href = link.getAttribute('href');
        if (href === '#' + id) {
          link.setAttribute('aria-current', 'true');
        } else {
          link.removeAttribute('aria-current');
        }
      });
    });
  }, { threshold: 0.4 });

  sections.forEach(function(s) { obs.observe(s); });
})();
