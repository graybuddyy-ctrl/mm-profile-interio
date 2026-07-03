/* ============================================
   MM Profile Interio - Main JavaScript
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  // ===== INTRO OVERLAY =====
  const overlay = document.getElementById('intro-overlay');
  if (overlay) {
    // After progress bar fills (total ~3.5s), fade out overlay
    setTimeout(() => {
      overlay.style.transition = 'opacity 0.8s ease';
      overlay.style.opacity = '0';
      setTimeout(() => {
        overlay.style.display = 'none';
        document.body.style.overflow = '';
      }, 800);
    }, 3600);

    document.body.style.overflow = 'hidden';
  }

  // ===== NAVBAR SCROLL =====
  const navbar = document.querySelector('.navbar');
  if (navbar) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    });
  }

  // ===== HAMBURGER MOBILE MENU =====
  const hamburger = document.querySelector('.hamburger');
  const mobileNav = document.querySelector('.mobile-nav');
  const mobileClose = document.querySelector('.mobile-nav-close');

  if (hamburger && mobileNav) {
    hamburger.addEventListener('click', () => {
      mobileNav.classList.add('active');
    });

    if (mobileClose) {
      mobileClose.addEventListener('click', () => {
        mobileNav.classList.remove('active');
      });
    }

    mobileNav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mobileNav.classList.remove('active');
      });
    });
  }

  // ===== SCROLL REVEAL ANIMATIONS =====
  const revealElements = document.querySelectorAll('.reveal');

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  revealElements.forEach(el => revealObserver.observe(el));

  // ===== SMOOTH SCROLL FOR ANCHOR LINKS =====
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // ===== COUNTER ANIMATION =====
  function animateCounter(el, target, suffix = '') {
    let count = 0;
    const duration = 2000;
    const step = target / (duration / 16);

    const update = () => {
      count = Math.min(count + step, target);
      el.textContent = Math.round(count) + suffix;
      if (count < target) requestAnimationFrame(update);
    };
    requestAnimationFrame(update);
  }

  const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const counters = entry.target.querySelectorAll('[data-count]');
        counters.forEach(counter => {
          const target = parseInt(counter.dataset.count);
          const suffix = counter.dataset.suffix || '';
          animateCounter(counter, target, suffix);
        });
        statsObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  const statsSection = document.querySelector('.hero-stats');
  if (statsSection) statsObserver.observe(statsSection);

  // ===== PRODUCT CARD HOVER TILT =====
  document.querySelectorAll('.product-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width - 0.5) * 8;
      const y = ((e.clientY - rect.top) / rect.height - 0.5) * 8;
      card.style.transform = `translateY(-8px) rotateX(${-y}deg) rotateY(${x}deg)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });

  // ===== YEAR IN FOOTER =====
  const yearEl = document.querySelector('.current-year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ===== ACTIVE NAV LINK ON SCROLL =====
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');

  window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 100;
      if (window.scrollY >= sectionTop) current = section.id;
    });
    navLinks.forEach(link => {
      link.style.color = '';
      if (link.getAttribute('href') === '#' + current) {
        link.style.color = 'var(--accent)';
      }
    });
  });

});
