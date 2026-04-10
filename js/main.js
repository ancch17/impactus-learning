/* Impactus Learning — Main JS */
document.addEventListener('DOMContentLoaded', () => {
  const root = document.documentElement;

  // Theme toggle
  let theme = matchMedia('(prefers-color-scheme:dark)').matches ? 'dark' : 'light';
  root.setAttribute('data-theme', theme);

  document.querySelectorAll('[data-theme-toggle]').forEach(toggle => {
    toggle.addEventListener('click', () => {
      theme = theme === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', theme);
    });
  });

  // Header scroll effect
  const header = document.querySelector('.header');
  if (header) {
    let last = 0;
    window.addEventListener('scroll', () => {
      const y = window.scrollY;
      header.classList.toggle('header--scrolled', y > 40);
      last = y;
    }, { passive: true });
  }

  // Mobile nav drawer with swipe
  const navToggle = document.querySelector('.nav__toggle');
  const navLinks = document.querySelector('.nav__links');
  const navOverlay = document.querySelector('.nav__overlay');
  const navClose = document.querySelector('.nav__close');

  if (navToggle && navLinks) {
    const drawerWidth = () => navLinks.offsetWidth;
    let isOpen = false;

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

    navToggle.addEventListener('click', () => { if (!isOpen) openNav(); else closeNav(); });
    if (navClose) navClose.addEventListener('click', closeNav);
    if (navOverlay) navOverlay.addEventListener('click', closeNav);
    navLinks.querySelectorAll('a').forEach(link => link.addEventListener('click', closeNav));

    // Touch swipe
    let touchStartX = 0, touchStartY = 0, touchCurrentX = 0;
    let isDragging = false, edgeSwipe = false;
    const EDGE_ZONE = 30, SWIPE_THRESHOLD = 60;

    document.addEventListener('touchstart', (e) => {
      if (window.innerWidth > 768) return;
      const touch = e.touches[0];
      touchStartX = touch.clientX; touchStartY = touch.clientY;
      touchCurrentX = touchStartX;
      isDragging = false; edgeSwipe = false;
      if (!isOpen && touchStartX > window.innerWidth - EDGE_ZONE) edgeSwipe = true;
    }, { passive: true });

    document.addEventListener('touchmove', (e) => {
      if (window.innerWidth > 768) return;
      const touch = e.touches[0];
      const dx = touch.clientX - touchStartX;
      const dy = touch.clientY - touchStartY;
      if (!isDragging && Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy)) {
        isDragging = true;
        navLinks.classList.add('dragging');
        if (navOverlay) navOverlay.classList.add('dragging');
      }
      if (!isDragging) return;
      touchCurrentX = touch.clientX;
      if (isOpen) {
        const offset = Math.max(0, touchCurrentX - touchStartX);
        navLinks.style.transform = 'translateX(' + offset + 'px)';
        if (navOverlay) navOverlay.style.opacity = Math.max(0, 1 - (offset / drawerWidth()));
      } else if (edgeSwipe) {
        const offset = Math.max(0, drawerWidth() + (touchCurrentX - touchStartX));
        const clamped = Math.min(drawerWidth(), offset);
        navLinks.style.transform = 'translateX(' + (drawerWidth() - clamped) + 'px)';
        if (navOverlay) {
          navOverlay.classList.add('open');
          navOverlay.style.opacity = clamped / drawerWidth();
        }
      }
    }, { passive: true });

    document.addEventListener('touchend', () => {
      if (!isDragging) return;
      isDragging = false;
      navLinks.classList.remove('dragging');
      if (navOverlay) navOverlay.classList.remove('dragging');
      const dx = touchCurrentX - touchStartX;
      if (isOpen) { dx > SWIPE_THRESHOLD ? closeNav() : openNav(); }
      else if (edgeSwipe) { dx < -SWIPE_THRESHOLD ? openNav() : closeNav(); }
    }, { passive: true });
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
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        obs.unobserve(el);
        let current = 0;
        const step = Math.max(1, Math.floor(target / 40));
        const interval = setInterval(() => {
          current += step;
          if (current >= target) { current = target; clearInterval(interval); }
          el.textContent = current + suffix;
        }, 30);
      }
    }, { threshold: 0.5 });
    obs.observe(el);
  });
});
