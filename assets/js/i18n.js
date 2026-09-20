(function () {
  'use strict';
  const root = window;
  const SUPPORTED = ['en', 'fr', 'es'];
  const STORAGE_KEY = 'kinetix-lang';
  let lang = 'en';
  let dict = {};
  function readStorage() {
    try { return localStorage.getItem(STORAGE_KEY); } catch (e) { return null; }
  }
  function writeStorage(v) {
    try { localStorage.setItem(STORAGE_KEY, v); } catch (e) {  }
  }
  const urlLang = new URLSearchParams(window.location.search).get('lang');
  if (SUPPORTED.indexOf(urlLang) > -1) lang = urlLang;
  else if (SUPPORTED.indexOf(readStorage()) > -1) lang = readStorage();
  function merge(target, src) {
    for (const k in src) {
      if (src[k] && typeof src[k] === 'object' && !Array.isArray(src[k])) {
        target[k] = target[k] || {};
        merge(target[k], src[k]);
      } else {
        target[k] = src[k];
      }
    }
  }
  function get(path) {
    if (!path) return null;
    const segs = path.split('.');
    let cur = dict;
    for (let i = 0; i < segs.length; i++) {
      if (cur == null) return null;
      cur = cur[segs[i]];
    }
    return typeof cur === 'string' ? cur : null;
  }
  function apply() {
    document.documentElement.lang = lang;
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      const v = get(el.getAttribute('data-i18n'));
      if (v != null) el.textContent = v;
    });
    document.querySelectorAll('[data-i18n-html]').forEach(function (el) {
      const v = get(el.getAttribute('data-i18n-html'));
      if (v != null) el.innerHTML = v;
    });
    document.querySelectorAll('[data-i18n-ph]').forEach(function (el) {
      const v = get(el.getAttribute('data-i18n-ph'));
      if (v != null) el.setAttribute('placeholder', v);
    });
    document.querySelectorAll('[data-i18n-attr]').forEach(function (el) {
      const attr = el.getAttribute('data-i18n-attr');
      const v = get(el.getAttribute('data-i18n-attr-value'));
      if (attr && v != null) el.setAttribute(attr, v);
    });
    document.querySelectorAll('title[data-i18n-doc]').forEach(function (el) {
      const v = get(el.getAttribute('data-i18n-doc'));
      if (v != null) el.textContent = v;
    });
    document.querySelectorAll('[data-i18n-langcode]').forEach(function (el) {
      el.textContent = lang.toUpperCase();
    });
    document.querySelectorAll('[data-lang]').forEach(function (btn) {
      btn.setAttribute('aria-current', btn.getAttribute('data-lang') === lang ? 'true' : 'false');
    });
    document.dispatchEvent(new CustomEvent('kinetix:i18n', { detail: { lang: lang } }));
  }
  root.KINETIX = root.KINETIX || {};
  root.KINETIX.addTranslations = function (bundle) { merge(dict, bundle); };
  root.KINETIX.getTranslation = get;
  root.KINETIX.setLang = function (next) {
    if (SUPPORTED.indexOf(next) === -1) return;
    lang = next;
    writeStorage(next);
    apply();
  };
  root.KINETIX.getLang = function () { return lang; };
  root.KINETIX.applyTranslations = apply;
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', apply);
  } else {
    apply();
  }
})();