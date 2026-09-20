(function () {
  "use strict";
  const CONFIG = {
    contactFormId: "meaoaeok",
    newsletterFormId: "mrpbpebd",
  };
  const STRINGS = {
    required: "This field is required.",
    email: "Please enter a valid email address.",
    errorTitle: "Something went wrong.",
    notConfig:
      "This form is not connected yet. Please email us at kinetix.technologies.web@gmail.com.",
    successTitle: "Message sent.",
    successBody: "Thanks for reaching out. We will reply within one business day.",
    errorBody:
      "We could not send your message right now. Please try again or email us directly.",
    newsOk: "You are subscribed. Watch your inbox for practical insights.",
    newsErr: "We could not subscribe you right now. Please try again.",
  };
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  function setBusy(btn, busy) {
    if (!btn) return;
    btn.classList.toggle("is-loading", busy);
    btn.disabled = busy;
    const spinner = btn.querySelector(".spinner");
    if (!spinner) return;
    if (busy) {
      spinner.setAttribute("aria-hidden", "false");
      btn.setAttribute("aria-busy", "true");
    } else {
      spinner.setAttribute("aria-hidden", "true");
      btn.removeAttribute("aria-busy");
    }
  }
  function showAlert(target, ok, title, body) {
    if (!target) return;
    target.innerHTML = "";
    if (title) {
      const h = document.createElement("strong");
      h.textContent = title;
      target.appendChild(h);
    }
    if (body) {
      target.appendChild(document.createTextNode(" " + body));
    }
    target.classList.remove("alert--ok", "alert--err");
    target.classList.add(ok ? "alert--ok" : "alert--err", "is-visible");
  }
  function hideAlert(target) {
    if (target) target.classList.remove("is-visible");
  }
  function setFieldError(field, message) {
    field.classList.toggle("has-error", !!message);
    const err = field.querySelector(".err");
    if (err) err.textContent = message || "";
  }
  function findField(form, name) {
    const input = form.querySelector('[name="' + name + '"]');
    return input && input.closest(".field");
  }
  function validateInput(input) {
    const value = (input.value || "").trim();
    if (input.getAttribute("type") === "email") {
      if (!value) {
        return input.hasAttribute("required") ? STRINGS.required : null;
      }
      return EMAIL_RE.test(value) ? null : STRINGS.email;
    }
    if (input.tagName === "SELECT") {
      return value ? null : STRINGS.required;
    }
    if (input.hasAttribute("required") && !value) return STRINGS.required;
    return null;
  }
  function validateForm(form) {
    let firstBad = null;
    form.querySelectorAll("input, select, textarea").forEach(function (input) {
      if (
        input.type === "hidden" ||
        input.name === "_gotcha" ||
        input.name === "_subject"
      )
        return;
      const errMsg = validateInput(input);
      const field = findField(form, input.name);
      const dirty = (input.value || "").trim() !== "";
      if (
        errMsg &&
        (input.hasAttribute("required") ||
          input.getAttribute("type") === "email" ||
          (dirty && errMsg === STRINGS.email))
      ) {
        if (field) setFieldError(field, errMsg);
        if (!firstBad) firstBad = input;
        input.setAttribute("aria-invalid", "true");
      } else {
        if (field) setFieldError(field, null);
        input.removeAttribute("aria-invalid");
      }
    });
    if (firstBad) firstBad.focus();
    return !firstBad;
  }
  function postForm(form, endpointId) {
    const url = "https://formspree.io/f/" + endpointId;
    const data = new FormData(form);
    data.set("_language", "en");
    if (!form.querySelector('[name="_subject"]')) {
      data.set(
        "_subject",
        form.hasAttribute("data-newsletter")
          ? "Newsletter subscription  |  kinetix.tech"
          : "New project inquiry  |  kinetix.tech",
      );
    }
    return fetch(url, {
      method: "POST",
      body: data,
      headers: { Accept: "application/json" },
    }).then(function (res) {
      if (res.ok) return res.json();
      throw new Error("Formspree error " + res.status);
    });
  }
  function bindForm(form) {
    form.setAttribute("novalidate", "novalidate");
    const alert = form.querySelector(".alert");
    const btn = form.querySelector('button[type="submit"]');
    const isNews = form.hasAttribute("data-newsletter");
    const endpointId = isNews ? CONFIG.newsletterFormId : CONFIG.contactFormId;
    form.addEventListener("input", function (e) {
      const field = findField(form, e.target.name);
      if (field && field.classList.contains("has-error")) {
        setFieldError(field, null);
      }
      if (form.classList.contains("is-visible"))
        hideAlert(form.querySelector(".alert"));
    });
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      hideAlert(alert);
      if (!validateForm(form)) return;
      const unconfigured =
        endpointId.indexOf("REPLACE_WITH") === 0 || !endpointId;
      if (unconfigured) {
        showAlert(alert, false, STRINGS.errorTitle, STRINGS.notConfig);
        return;
      }
      setBusy(btn, true);
      if (alert) alert.setAttribute("aria-live", "polite");
      postForm(form, endpointId)
        .then(function () {
          setBusy(btn, false);
          if (isNews) {
            showAlert(alert, true, null, STRINGS.newsOk);
            form.reset();
          } else {
            showAlert(
              alert,
              true,
              STRINGS.successTitle,
              STRINGS.successBody,
            );
            form.reset();
          }
        })
        .catch(function () {
          setBusy(btn, false);
          showAlert(
            alert,
            false,
            STRINGS.errorTitle,
            isNews ? STRINGS.newsErr : STRINGS.errorBody,
          );
        });
    });
  }
  document
    .querySelectorAll("form[data-contact], form[data-newsletter]")
    .forEach(bindForm);
  (function preselectProjectType() {
    const form = document.querySelector("form[data-contact]");
    if (!form) return;
    const m = location.search.match(/[?&]type=([^&]+)/);
    if (!m) return;
    const select = form.querySelector('select[name="project_type"]');
    if (!select) return;
    const map = {
      website: "website",
      ecom: "ecom",
      clinic: "clinic",
      inventory: "inventory",
      crm: "crm",
      custom: "custom",
    };
    const key = map[m[1]];
    if (!key) return;
    const opt = select.querySelector('option[value="' + key + '"]');
    if (opt) {
      opt.selected = true;
      const field = findField(form, "project_type");
      if (field) field.classList.add("is-filled");
    }
  })();
})();