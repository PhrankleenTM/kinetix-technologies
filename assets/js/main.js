(function () {
  "use strict";
  document.documentElement.classList.add("js");
  const doc = document;
  const header = doc.getElementById("site-header");
  function onScroll() {
    if (header) header.classList.toggle("scrolled", window.scrollY > 10);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  const burger = doc.getElementById("burger");
  const navLinks = doc.getElementById("nav-links");
  if (burger && navLinks) {
    function closeMenu() {
      burger.setAttribute("aria-expanded", "false");
      burger.setAttribute("aria-label", "Open menu");
      navLinks.classList.remove("open");
    }
    burger.addEventListener("click", function () {
      const open = navLinks.classList.toggle("open");
      burger.setAttribute("aria-expanded", open ? "true" : "false");
      burger.setAttribute(
        "aria-label",
        open ? "Close menu" : "Open menu",
      );
    });
    navLinks.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", closeMenu);
    });
  }
  let io = null;
  function revealInit() {
    const els = doc.querySelectorAll(".reveal");
    els.forEach(function (el) {
      if (el.classList.contains("is-visible")) return;
      if (!("IntersectionObserver" in window)) {
        el.classList.add("is-visible");
        return;
      }
      if (!io) {
        io = new IntersectionObserver(
          function (entries) {
            entries.forEach(function (entry) {
              if (entry.isIntersecting) {
                entry.target.classList.add("is-visible");
                io.unobserve(entry.target);
              }
            });
          },
          { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
        );
      }
      io.observe(el);
    });
  }
  revealInit();
  const filterbar = doc.querySelector(".filterbar");
  if (filterbar) {
    const projects = doc.querySelectorAll("[data-cat]");
    filterbar.querySelectorAll("button[data-filter]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        const f = btn.getAttribute("data-filter");
        filterbar.querySelectorAll("button[data-filter]").forEach(function (b) {
          b.setAttribute("aria-pressed", b === btn ? "true" : "false");
        });
        projects.forEach(function (p) {
          const cats = (p.getAttribute("data-cat") || "")
            .split(" ")
            .filter(Boolean);
          const show = f === "all" || cats.indexOf(f) > -1;
          p.hidden = !show;
          if (show) {
            p.classList.remove("is-visible");
            if (io) io.unobserve(p);
          }
        });
        revealInit();
      });
    });
  }
})();