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

/* ─── 9. CMS CONTENT HYDRATION (content.json) ──────────────────────── */
(function initCMSContent() {
  fetch('./content.json?_t=' + Date.now())
    .then(function(res) {
      if (!res.ok) throw new Error('CMS file not found');
      return res.json();
    })
    .then(function(data) {
      if (!data) return;

      // Hero
      if (data.hero) {
        var h1 = document.getElementById('hero-headline');
        if (h1 && data.hero.headline) {
          h1.innerHTML = data.hero.headline + '<br /><span class="hero-h1-sub">' + (data.hero.headline_sub || '') + '</span>';
        }
        var bio = document.querySelector('.hero-bio');
        if (bio && data.hero.bio) bio.textContent = data.hero.bio;
        var phil = document.querySelector('.hero-philosophy em');
        if (phil && data.hero.philosophy) phil.textContent = '"' + data.hero.philosophy.replace(/^"|"$/g, '') + '"';
        var ctaPri = document.querySelector('.hero-cta-row .cta-primary');
        if (ctaPri && data.hero.cta_primary_text) ctaPri.textContent = data.hero.cta_primary_text + ' →';
        var ctaGhost = document.querySelector('.hero-cta-row .cta-ghost');
        if (ctaGhost && data.hero.cta_secondary_text) ctaGhost.textContent = data.hero.cta_secondary_text;

        // Custom portrait image uploaded via CMS
        if (data.hero.portrait_image) {
          var frame = document.querySelector('.portrait-frame');
          var existingPh = document.querySelector('.portrait-placeholder');
          if (frame && data.hero.portrait_image.trim()) {
            var img = document.createElement('img');
            img.src = data.hero.portrait_image;
            img.alt = 'Studio portrait of Olasupo Abigael Tomilola, founder of OAT Photography';
            img.className = 'portrait-img';
            img.loading = 'eager';
            if (existingPh) {
              frame.replaceChild(img, existingPh);
            }
          }
        }
      }

      // Nav and social URLs
      if (data.nav) {
        if (data.nav.instagram_url) {
          document.querySelectorAll('a[href*="instagram.com"]').forEach(function(a) {
            a.href = data.nav.instagram_url;
          });
        }
        if (data.nav.tiktok_url) {
          document.querySelectorAll('a[href*="tiktok.com"]').forEach(function(a) {
            a.href = data.nav.tiktok_url;
          });
        }
        if (data.nav.facebook_url) {
          document.querySelectorAll('a[href*="facebook.com"]').forEach(function(a) {
            a.href = data.nav.facebook_url;
          });
        }
      }

      // Selected Work cards
      if (Array.isArray(data.portfolio) && data.portfolio.length) {
        var cards = document.querySelectorAll('.portfolio-card');
        data.portfolio.forEach(function(item, idx) {
          var card = cards[idx];
          if (!card) return;

          var link = card.querySelector('.card-frame-link');
          if (link && item.url) link.href = item.url;

          var catTag = card.querySelector('.card-category-tag');
          if (catTag && item.category) catTag.textContent = item.category;

          var loc = card.querySelector('.card-location');
          if (loc && item.location) loc.textContent = item.location;

          var titleLink = card.querySelector('.card-title-link');
          if (titleLink) {
            if (item.url) titleLink.href = item.url;
            if (item.title) {
              titleLink.innerHTML = item.title + ' <span class="title-arrow" aria-hidden="true">→</span>';
            }
          }

          var desc = card.querySelector('.card-desc');
          if (desc && item.description) desc.textContent = item.description;

          var skillTag = card.querySelector('.card-skill-tag');
          if (skillTag && item.skill) {
            skillTag.textContent = (item.skill.indexOf('Skill:') === 0 ? '' : 'Skill: ') + item.skill;
          }

          // If custom cover image is set
          if (item.image && item.image.trim()) {
            var coverArt = card.querySelector('.card-cover-art');
            if (coverArt) {
              coverArt.innerHTML = '<img src="' + item.image + '" alt="' + (item.title || '') + '" class="card-cover-image" loading="lazy" />';
            }
          }
        });
      }

      // Verticals / Pillars
      if (Array.isArray(data.verticals) && data.verticals.length) {
        var vCards = document.querySelectorAll('.vertical-card');
        data.verticals.forEach(function(v, idx) {
          var card = vCards[idx];
          if (!card) return;
          var title = card.querySelector('.vertical-title');
          if (title && v.title) title.textContent = v.title;
          var desc = card.querySelector('.vertical-desc');
          if (desc && v.description) desc.textContent = v.description;
          var link = card.querySelector('.vertical-link');
          if (link) {
            if (v.link_url) link.href = v.link_url;
            if (v.link_text) link.innerHTML = v.link_text + ' <span aria-hidden="true">→</span>';
          }
        });
      }

      // Testimonials
      if (Array.isArray(data.testimonials) && data.testimonials.length) {
        var slides = document.querySelectorAll('.testimonial-slide');
        data.testimonials.forEach(function(t, idx) {
          var s = slides[idx];
          if (!s) return;
          var q = s.querySelector('.testimonial-quote p em');
          if (q && t.quote) q.textContent = '"' + t.quote.replace(/^"|"$/g, '') + '"';
          var name = s.querySelector('.testimonial-name');
          if (name && t.name) name.textContent = t.name;
          var ctx = s.querySelector('.testimonial-context');
          if (ctx && t.context) ctx.textContent = t.context;
          var gLink = s.querySelector('.testimonial-gallery-link');
          if (gLink && t.gallery_url) gLink.href = t.gallery_url;
        });
      }

      // About
      if (data.about) {
        var aboutBio = document.querySelector('.about-bio');
        if (aboutBio && data.about.bio) {
          // preserve strong tag on @oat_graphy if present
          aboutBio.innerHTML = data.about.bio.replace(/@oat_graphy/g, '<strong>@oat_graphy</strong>');
        }
        if (Array.isArray(data.about.tags) && data.about.tags.length) {
          var tagsContainer = document.querySelector('.about-tags');
          if (tagsContainer) {
            tagsContainer.innerHTML = data.about.tags.map(function(tag) {
              return '<span class="about-tag">' + tag + '</span>';
            }).join('');
          }
        }
      }

      // Contact & Footer
      if (data.contact) {
        var footerBooking = document.querySelector('.footer-booking-row .cta-primary');
        if (footerBooking) {
          if (data.contact.booking_cta) footerBooking.textContent = data.contact.booking_cta + ' →';
          if (data.contact.instagram_url) footerBooking.href = data.contact.instagram_url;
        }
        var footerSub = document.querySelector('.footer-sub');
        if (footerSub && data.contact.footer_sub) {
          footerSub.innerHTML = data.contact.footer_sub.replace(/\n/g, '<br />');
        }
        var markets = document.querySelector('.footer-locations p');
        if (markets && data.contact.primary_markets) {
          markets.textContent = data.contact.primary_markets;
        }
      }
    })
    .catch(function(err) {
      // Graceful degradation: keeps original static HTML pristine
      console.info('Static content rendered (CMS offline or defaults preserved):', err.message);
    });
})();
