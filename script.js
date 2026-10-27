/**
 * Portfolio JavaScript
 * Theme toggle, mobile nav, scroll animations, counter animation, form handling
 */

(function() {
  'use strict';

  // ==========================================================================
  // DOM Elements
  // ==========================================================================
  const themeToggle = document.getElementById('theme-toggle');
  const navToggle = document.querySelector('.nav-toggle');
  const navMenu = document.getElementById('nav-menu');
  const navLinks = document.querySelectorAll('.nav-link');
  const scrollIndicator = document.querySelector('.scroll-indicator');
  const statValues = document.querySelectorAll('.stat-value[data-count]');
  const skillItems = document.querySelectorAll('.skill-item[data-level]');
  const contactForm = document.querySelector('.contact-form');
  const formNote = document.querySelector('.form-note');

  // ==========================================================================
  // Theme Management
  // ==========================================================================
  const THEME_KEY = 'portfolio-theme';
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');

  function getInitialTheme() {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored) return stored;
    return prefersDark.matches ? 'dark' : 'light';
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_KEY, theme);
    updateThemeToggleAria(theme);
  }

  function updateThemeToggleAria(theme) {
    if (themeToggle) {
      const label = theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';
      themeToggle.setAttribute('aria-label', label);
    }
  }

  function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    applyTheme(next);
  }

  // Initialize theme
  applyTheme(getInitialTheme());

  // Theme toggle event
  if (themeToggle) {
    themeToggle.addEventListener('click', toggleTheme);
  }

  // Listen for system theme changes
  prefersDark.addEventListener('change', (e) => {
    if (!localStorage.getItem(THEME_KEY)) {
      applyTheme(e.matches ? 'dark' : 'light');
    }
  });

  // ==========================================================================
  // Mobile Navigation
  // ==========================================================================
  function toggleMobileNav() {
    const isOpen = navMenu.classList.toggle('is-open');
    navToggle.setAttribute('aria-expanded', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  }

  function closeMobileNav() {
    navMenu.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  if (navToggle && navMenu) {
    navToggle.addEventListener('click', toggleMobileNav);
    navLinks.forEach(link => link.addEventListener('click', closeMobileNav));
    // Close on escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navMenu.classList.contains('is-open')) {
        closeMobileNav();
        navToggle.focus();
      }
    });
    // Close on click outside
    document.addEventListener('click', (e) => {
      if (navMenu.classList.contains('is-open') &&
          !navMenu.contains(e.target) &&
          !navToggle.contains(e.target)) {
        closeMobileNav();
      }
    });
  }

  // ==========================================================================
  // Smooth Scroll for Anchor Links
  // ==========================================================================
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        const headerHeight = document.querySelector('.header').offsetHeight;
        const targetPosition = target.getBoundingClientRect().top + window.scrollY - headerHeight;
        window.scrollTo({ top: targetPosition, behavior: 'smooth' });
        target.focus({ preventScroll: true });
      }
    });
  });

  // ==========================================================================
  // Scroll Indicator Hide on Scroll
  // ==========================================================================
  function handleScrollIndicator() {
    if (scrollIndicator) {
      const scrolled = window.scrollY > 100;
      scrollIndicator.style.opacity = scrolled ? '0' : '1';
      scrollIndicator.style.pointerEvents = scrolled ? 'none' : 'auto';
    }
  }

  window.addEventListener('scroll', handleScrollIndicator, { passive: true });

  // ==========================================================================
  // Counter Animation for Stats
  // ==========================================================================
  function animateCounter(el) {
    const target = parseInt(el.dataset.count, 10);
    const duration = 1500;
    const startTime = performance.now();
    const startValue = 0;

    function updateCounter(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Easing: easeOutExpo
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const current = Math.floor(eased * target);
      el.textContent = current.toLocaleString();

      if (progress < 1) {
        requestAnimationFrame(updateCounter);
      } else {
        el.textContent = target.toLocaleString();
      }
    }

    requestAnimationFrame(updateCounter);
  }

  // ==========================================================================
  // Skill Bar Animation
  // ==========================================================================
  function animateSkillBars() {
    skillItems.forEach(item => {
      const level = item.dataset.level;
      const progressBar = item.querySelector('.skill-progress');
      if (progressBar && level) {
        progressBar.style.setProperty('--level', level + '%');
      }
    });
  }

  // ==========================================================================
  // Intersection Observer for Reveal Animations
  // ==========================================================================
  const observerOptions = {
    root: null,
    rootMargin: '0px 0px -10% 0px',
    threshold: 0.1
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');

        // Trigger counter animation for stats
        if (entry.target.classList.contains('hero-stats')) {
          statValues.forEach(el => {
            if (!el.dataset.animated) {
              el.dataset.animated = 'true';
              animateCounter(el);
            }
          });
        }

        // Trigger skill bar animation
        if (entry.target.id === 'skills' || entry.target.classList.contains('skills')) {
          animateSkillBars();
        }

        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Initialize reveal classes FIRST, then observe
  function initRevealClasses() {
    const sectionsToReveal = document.querySelectorAll(
      '#about, #projects, #skills, #contact'
    );
    sectionsToReveal.forEach((section, index) => {
      section.classList.add('reveal');
      section.style.transitionDelay = `${index * 100}ms`;
    });

    // Add stagger to project cards
    const projectCards = document.querySelectorAll('.project-card');
    projectCards.forEach((card, index) => {
      card.classList.add('reveal');
      card.style.transitionDelay = `${index * 100}ms`;
    });

    // Add stagger to highlight cards
    const highlightCards = document.querySelectorAll('.highlight-card');
    highlightCards.forEach((card, index) => {
      card.classList.add('reveal');
      card.style.transitionDelay = `${index * 100}ms`;
    });

    // Add stagger to skill categories
    const skillCategories = document.querySelectorAll('.skill-category');
    skillCategories.forEach((cat, index) => {
      cat.classList.add('reveal');
      cat.style.transitionDelay = `${index * 150}ms`;
    });

    // NOW observe all reveal elements after classes are added
    document.querySelectorAll('.reveal, .reveal-stagger').forEach(el => observer.observe(el));

    // Observe hero-stats for counter
    const heroStats = document.querySelector('.hero-stats');
    if (heroStats) observer.observe(heroStats);

    // Observe skills section for skill bars
    const skillsSection = document.getElementById('skills');
    if (skillsSection) observer.observe(skillsSection);
  }

  // ==========================================================================
  // Active Nav Link on Scroll
  // ==========================================================================
  const sections = document.querySelectorAll('section[id]');
  const navLinkMap = new Map();
  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href && href.startsWith('#')) {
      navLinkMap.set(href.slice(1), link);
    }
  });

  function updateActiveNav() {
    const scrollPos = window.scrollY + document.querySelector('.header').offsetHeight + 100;

    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');

      if (scrollPos >= top && scrollPos < top + height) {
        navLinkMap.forEach((link, key) => {
          link.classList.toggle('active', key === id);
        });
      }
    });
  }

  window.addEventListener('scroll', updateActiveNav, { passive: true });

  // ==========================================================================
  // Contact Form Handling
  // ==========================================================================
  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending...';

      try {
        const formData = new FormData(contactForm);
        const response = await fetch(contactForm.action, {
          method: 'POST',
          body: formData,
          headers: { 'Accept': 'application/json' }
        });

        if (response.ok) {
          formNote.textContent = 'Message sent successfully! I\'ll get back to you soon.';
          formNote.style.color = 'hsl(var(--color-success))';
          contactForm.reset();
        } else {
          throw new Error('Form submission failed');
        }
      } catch (error) {
        formNote.textContent = 'Something went wrong. Please try emailing directly.';
        formNote.style.color = 'hsl(var(--color-error))';
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
        // Clear message after 5 seconds
        setTimeout(() => { formNote.textContent = ''; }, 5000);
      }
    });
  }

  // ==========================================================================
  // Keyboard Navigation Enhancement
  // ==========================================================================
  // Trap focus in mobile menu when open
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Tab' && navMenu.classList.contains('is-open')) {
      const focusableElements = navMenu.querySelectorAll(
        'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const first = focusableElements[0];
      const last = focusableElements[focusableElements.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });

  // ==========================================================================
  // Performance: Debounce Scroll Handlers
  // ==========================================================================
  function debounce(fn, wait) {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => fn(...args), wait);
    };
  }

  // Replace scroll handlers with debounced versions
  window.removeEventListener('scroll', handleScrollIndicator);
  window.removeEventListener('scroll', updateActiveNav);
  window.addEventListener('scroll', debounce(handleScrollIndicator, 50), { passive: true });
  window.addEventListener('scroll', debounce(updateActiveNav, 50), { passive: true });

  // Run after DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initRevealClasses);
  } else {
    initRevealClasses();
  }

  // ==========================================================================
  // Console Easter Egg
  // ==========================================================================
  console.log('%c👋 Hey there!', 'font-size: 24px; font-weight: bold; color: #a855f7;');
  console.log('%cThanks for checking out the source. This portfolio is built with vanilla HTML, CSS & JS — no frameworks, no build step.', 'font-size: 14px; color: #64748b;');
  console.log('%cWant to connect? Check out the contact section!', 'font-size: 14px; color: #64748b;');

})();