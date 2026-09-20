(function () {
  'use strict';
  var CONFIG = {
    contactFormId: 'REPLACE_WITH_YOUR_FORMPREE_ID',
    newsletterFormId: 'REPLACE_WITH_YOUR_FORMPREE_ID'
  };
  var K = window.KINETIX || {};
  function tr(key) { return (K.getTranslation && K.getTranslation(key)) || key; }
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  function setBusy(btn, busy) {
    if (!btn) return;
    btn.classList.toggle('is-loading', busy);
    btn.disabled = busy;
    var spinner = btn.querySelector('.spinner');
    if (!spinner) return;
    if (busy) {
      spinner.setAttribute('aria-hidden', 'false');
      btn.setAttribute('aria-busy', 'true');
    } else {
      spinner.setAttribute('aria-hidden', 'true');
      btn.removeAttribute('aria-busy');
    }
  }
  function showAlert(target, ok, title, body) {
    target.innerHTML = '';
    if (title) {
      var h = document.createElement('strong');
      h.textContent = title;
      target.appendChild(h);
    }
    if (body) {
      target.appendChild(document.createTextNode(' ' + body));
    }
    target.classList.remove('alert--ok', 'alert--err');
    target.classList.add(ok ? 'alert--ok' : 'alert--err', 'is-visible');
  }
  function hideAlert(target) {
    if (target) target.classList.remove('is-visible');
  }
  function setFieldError(field, message) {
    field.classList.toggle('has-error', !!message);
    var err = field.querySelector('.err');
    if (err) err.textContent = message || '';
  }
  function findField(form, name) {
    var input = form.querySelector('[name="' + name + '"]');
    return input && input.closest('.field');
  }
  function validateInput(input) {
    var value = (input.value || '').trim();
    if (input.getAttribute('type') === 'email') {
      if (!value) {
        return input.hasAttribute('required') ? 'form.required' : null;
      }
      return EMAIL_RE.test(value) ? null : 'form.email';
    }
    if (input.tagName === 'SELECT') {
      return value ? null : 'form.required';
    }
    if (input.hasAttribute('required') && !value) return 'form.required';
    return null;
  }
  function validateForm(form) {
    var firstBad = null;
    form.querySelectorAll('input, select, textarea').forEach(function (input) {
      if (input.type === 'hidden' || input.name === '_gotcha' || input.name === '_subject') return;
      var errKey = validateInput(input);
      var field = findField(form, input.name);
      var dirty = (input.value || '').trim() !== '';
      if (errKey && (input.hasAttribute('required') || input.getAttribute('type') === 'email' || (dirty && errKey === 'form.email'))) {
        if (field) setFieldError(field, tr(errKey));
        if (!firstBad) firstBad = input;
        input.setAttribute('aria-invalid', 'true');
      } else {
        if (field) setFieldError(field, null);
        input.removeAttribute('aria-invalid');
      }
    });
    if (firstBad) firstBad.focus();
    return !firstBad;
  }
  function postForm(form, endpointId) {
    var url = 'https://formspree.io/f/' + endpointId;
    var data = new FormData(form);
    data.set('_language', K.getLang ? K.getLang() : 'en');
    if (!form.querySelector('[name="_subject"]')) {
      data.set('_subject', form.hasAttribute('data-newsletter') ? 'Newsletter subscription  |  kinetix.tech' : 'New project inquiry  |  kinetix.tech');
    }
    return fetch(url, {
      method: 'POST',
      body: data,
      headers: { 'Accept': 'application/json' }
    }).then(function (res) {
      if (res.ok) return res.json();
      throw new Error('Formspree error ' + res.status);
    });
  }
  function bindForm(form) {
    form.setAttribute('novalidate', 'novalidate');
    var alert = form.querySelector('.alert');
    var btn = form.querySelector('button[type="submit"]');
    var isNews = form.hasAttribute('data-newsletter');
    var endpointId = isNews ? CONFIG.newsletterFormId : CONFIG.contactFormId;
    form.addEventListener('input', function (e) {
      var field = findField(form, e.target.name);
      if (field && field.classList.contains('has-error')) {
        setFieldError(field, null);
      }
      if (form.classList.contains('is-visible')) hideAlert(form.querySelector('.alert'));
    });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      hideAlert(alert);
      if (!validateForm(form)) return;
      var unconfigured = endpointId.indexOf('REPLACE_WITH') === 0 || !endpointId;
      if (unconfigured) {
        showAlert(alert, false, tr('form.error_title'), tr('form.notConfig'));
        return;
      }
      setBusy(btn, true);
      alert.setAttribute('aria-live', 'polite');
      postForm(form, endpointId)
        .then(function () {
          setBusy(btn, false);
          if (isNews) {
            showAlert(alert, true, null, tr('news.ok'));
            form.reset();
          } else {
            showAlert(alert, true, tr('form.success_title'), tr('form.success_body'));
            form.reset();
          }
        })
        .catch(function () {
          setBusy(btn, false);
          showAlert(alert, false, tr('form.error_title'), isNews ? tr('news.err') : tr('form.error_body'));
        });
    });
  }
  document.addEventListener('kinetix:i18n', function () {
    document.querySelectorAll('.field.has-error input, .field.has-error textarea, .field.has-error select').forEach(function (input) {
      var err = findField(input.form, input.name);
      if (err) {
        var msg = err.querySelector('.err');
        var key = input.getAttribute('aria-invalid') === 'true' ? (input.getAttribute('type') === 'email' ? 'form.email' : 'form.required') : null;
        msg.textContent = key ? tr(key) : '';
      }
    });
  });
  document.querySelectorAll('form[data-contact], form[data-newsletter]').forEach(bindForm);
  (function preselectProjectType() {
    var form = document.querySelector('form[data-contact]');
    if (!form) return;
    var m = location.search.match(/[?&]type=([^&]+)/);
    if (!m) return;
    var select = form.querySelector('select[name="project_type"]');
    if (!select) return;
    var map = { website: 'website', ecom: 'ecom', clinic: 'clinic', inventory: 'inventory', crm: 'crm', custom: 'custom' };
    var key = map[m[1]];
    if (!key) return;
    var opt = select.querySelector('option[value="' + key + '"]');
    if (opt) {
      opt.selected = true;
      var field = findField(form, 'project_type');
      if (field) field.classList.add('is-filled');
    }
  })();
})();