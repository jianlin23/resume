(function () {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Preloader */
  const pre = document.getElementById("preloader");
  window.addEventListener("load", () => pre && pre.classList.add("done"));
  setTimeout(() => pre && pre.classList.add("done"), 3000); // never block on slow assets

  /* Age = current year minus birth year, so it never goes stale */
  const age = new Date().getFullYear() - 2003;
  document.querySelectorAll("[data-age]").forEach((el) => (el.textContent = age));

  /* Typed.js (vendored) */
  const typedEl = document.querySelector(".typed");
  if (typedEl && window.Typed) {
    new Typed(".typed", {
      strings: typedEl.dataset.typedItems.split(","),
      loop: true, typeSpeed: 70, backSpeed: 40, backDelay: 1800,
    });
  }

  /* AOS (vendored) */
  if (window.AOS) AOS.init({ duration: 700, easing: "ease-out-cubic", once: true, disable: reduceMotion });

  /* GLightbox (vendored) */
  if (window.GLightbox) GLightbox({ selector: ".glightbox" });

  /* vanilla-tilt (CDN, optional) */
  if (window.VanillaTilt && !reduceMotion && window.matchMedia("(hover: hover)").matches) {
    VanillaTilt.init(document.querySelectorAll("[data-tilt]"), { max: 7, speed: 400, glare: true, "max-glare": 0.12, scale: 1.02 });
  }

  /* Count-up numbers */
  const counters = document.querySelectorAll("[data-count]");
  const countObs = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      countObs.unobserve(e.target);
      const el = e.target;
      const end = parseFloat(el.dataset.count);
      const dec = (el.dataset.count.split(".")[1] || "").length;
      if (reduceMotion) { el.textContent = end.toFixed(dec); return; }
      const t0 = performance.now(), dur = 1400;
      (function step(t) {
        const p = Math.min((t - t0) / dur, 1);
        el.textContent = (end * (1 - Math.pow(1 - p, 3))).toFixed(dec);
        if (p < 1) requestAnimationFrame(step);
      })(t0);
    });
  }, { threshold: 0.6 });
  counters.forEach((c) => countObs.observe(c));

  /* Nav: scroll progress, scrollspy, mobile toggle, back-to-top */
  const nav = document.querySelector(".nav");
  const links = [...nav.querySelectorAll("a")];
  const bar = document.querySelector(".progress-line");
  const toTop = document.querySelector(".to-top");
  const sections = links.map((a) => document.querySelector(a.hash));

  function onScroll() {
    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - innerHeight;
    bar.style.width = (max > 0 ? (y / max) * 100 : 0) + "%";
    toTop.classList.toggle("show", y > 500);
    let current = 0;
    sections.forEach((s, i) => { if (s && y + 200 >= s.offsetTop) current = i; });
    links.forEach((a, i) => a.classList.toggle("active", i === current));
  }
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  document.querySelector(".nav-toggle").addEventListener("click", () => nav.classList.toggle("open"));
  links.forEach((a) => a.addEventListener("click", () => nav.classList.remove("open")));

  /* Timelines: line fills with scroll; each dot lights up when the line reaches it */
  const timelines = [...document.querySelectorAll(".timeline")];
  function updateTimelines() {
    const trigger = innerHeight * 0.6;
    timelines.forEach((tl) => {
      const reach = trigger - tl.getBoundingClientRect().top;
      tl.style.setProperty("--fill", Math.max(0, Math.min(reach - 8, tl.offsetHeight - 16)) + "px");
      tl.querySelectorAll(".t-item").forEach((it) => it.classList.toggle("reached", reach >= it.offsetTop + 28));
    });
  }
  addEventListener("scroll", updateTimelines, { passive: true });
  addEventListener("resize", updateTimelines);
  updateTimelines();

  /* Light / dark theme (choice is remembered; default is dark) */
  const root = document.documentElement;
  const themeBtn = document.querySelector(".theme-toggle");
  function paintThemeIcon() {
    const light = root.getAttribute("data-theme") === "light";
    themeBtn.innerHTML = '<i aria-hidden="true" class="bi ' + (light ? "bi-moon-stars" : "bi-sun") + '"></i>';
    themeBtn.setAttribute("aria-label", light ? "Switch to dark theme" : "Switch to light theme");
  }
  themeBtn.addEventListener("click", () => {
    const next = root.getAttribute("data-theme") === "light" ? "dark" : "light";
    root.setAttribute("data-theme", next);
    try { localStorage.setItem("theme", next); } catch (e) { }
    paintThemeIcon();
  });
  paintThemeIcon();

  /* Gantt chart: bars grow when the chart scrolls into view */
  const gantt = document.querySelector(".gantt");
  if (gantt) {
    new IntersectionObserver((entries, obs) => entries.forEach((e) => {
      if (e.isIntersecting) { gantt.classList.add("in"); obs.disconnect(); }
    }), { threshold: 0.3 }).observe(gantt);
  }

  /* Award filters */
  const buttons = document.querySelectorAll(".filters button");
  const awards = document.querySelectorAll(".award");
  buttons.forEach((b) => b.addEventListener("click", () => {
    buttons.forEach((x) => x.classList.remove("active"));
    b.classList.add("active");
    awards.forEach((a) => a.classList.toggle("hide", b.dataset.filter !== "all" && !a.classList.contains(b.dataset.filter)));
  }));

  if (reduceMotion) return;

  /* Cursor glow */
  const glow = document.querySelector(".cursor-glow");
  addEventListener("pointermove", (e) => { glow.style.left = e.clientX + "px"; glow.style.top = e.clientY + "px"; }, { passive: true });

  /* Particle network background (no dependencies) */
  const cv = document.getElementById("bg-canvas");
  const ctx = cv.getContext("2d");
  let W, H, pts = [];
  const mouse = { x: -999, y: -999 };
  addEventListener("pointermove", (e) => { mouse.x = e.clientX; mouse.y = e.clientY; }, { passive: true });

  function resize() {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    W = cv.width = innerWidth * dpr; H = cv.height = innerHeight * dpr;
    cv.style.width = innerWidth + "px"; cv.style.height = innerHeight + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const n = Math.min(90, Math.floor((innerWidth * innerHeight) / 17000));
    pts = Array.from({ length: n }, () => ({
      x: Math.random() * innerWidth, y: Math.random() * innerHeight,
      vx: (Math.random() - 0.5) * 0.35, vy: (Math.random() - 0.5) * 0.35,
    }));
  }
  addEventListener("resize", resize);
  resize();

  (function draw() {
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    const light = root.getAttribute("data-theme") === "light";
    const dot = light ? "rgba(2, 100, 160, .5)" : "rgba(148, 197, 255, .6)";
    const lineRGB = light ? "30, 90, 170" : "120, 170, 255";
    for (let i = 0; i < pts.length; i++) {
      const p = pts[i];
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > innerWidth) p.vx *= -1;
      if (p.y < 0 || p.y > innerHeight) p.vy *= -1;
      ctx.fillStyle = dot;
      ctx.beginPath(); ctx.arc(p.x, p.y, 1.5, 0, 6.283); ctx.fill();
      for (let j = i + 1; j < pts.length; j++) {
        const q = pts[j], d = Math.hypot(p.x - q.x, p.y - q.y);
        if (d < 130) { ctx.strokeStyle = `rgba(${lineRGB}, ${(light ? 0.22 : 0.16) * (1 - d / 130)})`; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke(); }
      }
      const md = Math.hypot(p.x - mouse.x, p.y - mouse.y);
      if (md < 160) { ctx.strokeStyle = `rgba(167, 139, 250, ${0.4 * (1 - md / 160)})`; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke(); }
    }
    requestAnimationFrame(draw);
  })();
})();
