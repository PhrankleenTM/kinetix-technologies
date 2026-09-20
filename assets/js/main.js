(function () {
  'use strict';
  document.documentElement.classList.add('js');
  var doc = document;
  var K = window.KINETIX = window.KINETIX || {};
  var header = doc.getElementById('site-header');
  function onScroll() {
    if (header) header.classList.toggle('scrolled', window.scrollY > 10);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  var burger = doc.getElementById('burger');
  var navLinks = doc.getElementById('nav-links');
  if (burger && navLinks) {
    function closeMenu() {
      burger.setAttribute('aria-expanded', 'false');
      burger.setAttribute('aria-label', K.getTranslation && K.getTranslation('a11y.open') || 'Open menu');
      navLinks.classList.remove('open');
    }
    burger.addEventListener('click', function () {
      var open = navLinks.classList.toggle('open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      burger.setAttribute('aria-label', K.getTranslation && K.getTranslation(open ? 'a11y.close' : 'a11y.open') || (open ? 'Close menu' : 'Open menu'));
    });
    navLinks.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', closeMenu); });
  }
  var langWrap = doc.getElementById('lang-switch');
  var langBtn = doc.getElementById('lang-btn');
  if (langWrap && langBtn) {
    langBtn.addEventListener('click', function () {
      var open = langWrap.getAttribute('aria-expanded') === 'true';
      langWrap.setAttribute('aria-expanded', open ? 'false' : 'true');
    });
    doc.addEventListener('click', function (e) {
      if (!langWrap.contains(e.target)) langWrap.setAttribute('aria-expanded', 'false');
    });
  }
  doc.querySelectorAll('[data-lang]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      K.setLang(btn.getAttribute('data-lang'));
      if (langWrap) langWrap.setAttribute('aria-expanded', 'false');
    });
  });
  var io = null;
  function revealInit() {
    var els = doc.querySelectorAll('.reveal');
    els.forEach(function (el) {
      if (el.classList.contains('is-visible')) return;
      if (!('IntersectionObserver' in window)) { el.classList.add('is-visible'); return; }
      if (!io) {
        io = new IntersectionObserver(function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-visible');
              io.unobserve(entry.target);
            }
          });
        }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
      }
      io.observe(el);
    });
  }
  revealInit();
  doc.addEventListener('kinetix:i18n', revealInit);
  K.refreshReveals = revealInit;
  var filterbar = doc.querySelector('.filterbar');
  if (filterbar) {
    var projects = doc.querySelectorAll('[data-cat]');
    filterbar.querySelectorAll('button[data-filter]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var f = btn.getAttribute('data-filter');
        filterbar.querySelectorAll('button[data-filter]').forEach(function (b) {
          b.setAttribute('aria-pressed', b === btn ? 'true' : 'false');
        });
        projects.forEach(function (p) {
          var cats = (p.getAttribute('data-cat') || '').split(' ').filter(Boolean);
          var show = f === 'all' || cats.indexOf(f) > -1;
          p.hidden = !show;
          if (show) {
            p.classList.remove('is-visible');
            if (io) io.unobserve(p);
          }
        });
        revealInit();
      });
    });
  }
})();