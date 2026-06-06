/* Impactus Learning — Main JS */

/* ── Chatbase Widget Loader ──
   Reads 'chatbot_enabled' from browser storage. Default = on.
   Toggle via admin.html ──────────────────────────────────── */
(function () {
  var chatbotId = 'yMSJ567-Ctz7BJ9LIQevS';

  // Safe storage getter (fails gracefully in restricted iframes)
  function getStore(key) {
    try { return window.localStorage.getItem(key); } catch(e) { return null; }
  }
  function setStore(key, val) {
    try { window.localStorage.setItem(key, val); } catch(e) {}
  }

  var enabled = getStore('chatbot_enabled');
  if (enabled === null) { setStore('chatbot_enabled', 'true'); enabled = 'true'; }
  if (enabled !== 'true') return;

  // Initialise chatbase queue
  if (!window.chatbase || window.chatbase('getState') !== 'initialized') {
    window.chatbase = function () {
      if (!window.chatbase.q) { window.chatbase.q = []; }
      window.chatbase.q.push(arguments);
    };
    window.chatbase = new Proxy(window.chatbase, {
      get: function (target, prop) {
        if (prop === 'q') return target.q;
        return function () {
          var args = Array.prototype.slice.call(arguments);
          args.unshift(prop);
          return target.apply(target, args);
        };
      }
    });
  }

  // Inject the Chatbase script
  function loadChatbase() {
    var s = document.createElement('script');
    s.src = 'https://www.chatbase.co/embed.min.js';
    s.id = chatbotId;
    s.domain = 'www.chatbase.co';
    document.body.appendChild(s);
  }

  if (document.readyState === 'complete') {
    loadChatbase();
  } else {
    window.addEventListener('load', loadChatbase);
  }
})();

document.addEventListener('DOMContentLoaded', () => {
  const root = document.documentElement;

  // Theme toggle — persists within session via localStorage
  let theme = (sessionStorage.getItem('il_theme') || 'light');
  root.setAttribute('data-theme', theme);

  document.querySelectorAll('[data-theme-toggle]').forEach(toggle => {
    toggle.addEventListener('click', () => {
      theme = theme === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', theme);
      sessionStorage.setItem('il_theme', theme);
    });
  });

  // Header scroll effect
  const header = document.querySelector('.header');
  if (header) {
    window.addEventListener('scroll', () => {
      header.classList.toggle('header--scrolled', window.scrollY > 40);
    }, { passive: true });
  }

  // Mobile nav drawer (hamburger button to open, X button to close)
  const navToggle = document.querySelector('.nav__toggle');
  const navLinks  = document.querySelector('.nav__links');
  const navOverlay = document.querySelector('.nav__overlay');
  const navClose  = document.querySelector('.nav__close');

  if (navToggle && navLinks) {
    let isOpen = false;

    // Guard: ignore hamburger triggers that are part of a multi-touch gesture (pinch-zoom)
    let touchCount = 0;
    document.addEventListener('touchstart', (e) => { touchCount = e.touches.length; }, { passive: true });
    document.addEventListener('touchend',   (e) => { if (e.touches.length === 0) touchCount = 0; }, { passive: true });

    function openNav() {
      isOpen = true;
      navLinks.classList.add('open');
      navLinks.classList.remove('dragging');
      navLinks.style.transform = '';
      if (navOverlay) {
        navOverlay.classList.add('open');
        navOverlay.classList.remove('dragging');
        navOverlay.style.opacity = '';
      }
      document.body.style.overflow = 'hidden';
    }

    function closeNav() {
      isOpen = false;
      navLinks.classList.remove('open');
      navLinks.classList.remove('dragging');
      navLinks.style.transform = '';
      if (navOverlay) {
        navOverlay.classList.remove('open');
        navOverlay.classList.remove('dragging');
        navOverlay.style.opacity = '';
      }
      document.body.style.overflow = '';
    }

    // Only open/close on single-touch clicks — not on pinch gestures
    navToggle.addEventListener('click', () => {
      if (touchCount > 1) return;
      if (!isOpen) openNav(); else closeNav();
    });
    if (navClose)   navClose.addEventListener('click', closeNav);
    if (navOverlay) {
      navOverlay.addEventListener('click', closeNav);
      // Fallback for touch devices where click on overlay may not fire
      navOverlay.addEventListener('touchend', (e) => { e.preventDefault(); closeNav(); }, { passive: false });
    }
    navLinks.querySelectorAll('a').forEach(link => link.addEventListener('click', closeNav));

  }

  // Scroll-triggered animations
  const animateEls = document.querySelectorAll('[data-animate]');
  if (animateEls.length && 'IntersectionObserver' in window) {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    animateEls.forEach(el => obs.observe(el));
  }

  // Stat counter animation
  document.querySelectorAll('[data-count]').forEach(el => {
    const target = parseInt(el.dataset.count);
    const suffix = el.dataset.suffix || '';
    const prefix = el.dataset.prefix || '';
    const divide = parseFloat(el.dataset.divide) || 1;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        obs.unobserve(el);
        let current = 0;
        const step = Math.max(1, Math.floor(target / 50));
        const interval = setInterval(() => {
          current += step;
          if (current >= target) { current = target; clearInterval(interval); }
          const display = divide > 1 ? (current / divide).toFixed(2) : current.toLocaleString();
          el.textContent = prefix + display + suffix;
        }, 30);
      }
    }, { threshold: 0.5 });
    obs.observe(el);
  });
});
