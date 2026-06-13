/* ============================================================
   NINO RYSSENS — interactions
   custom cursor · scroll reveals · hide-on-scroll nav · live time
   ============================================================ */
(function () {
  "use strict";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- live Antwerp time ------------------------------------------- */
  function tick() {
    var els = document.querySelectorAll("[data-clock]");
    if (!els.length) return;
    var t = new Intl.DateTimeFormat("en-GB", {
      hour: "2-digit", minute: "2-digit", second: "2-digit",
      hour12: false, timeZone: "Europe/Brussels"
    }).format(new Date());
    els.forEach(function (e) { e.textContent = t + " CET"; });
  }
  tick(); setInterval(tick, 1000);

  /* ---- custom cursor ----------------------------------------------- */
  var fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  if (fine) {
    var ring = document.querySelector(".cursor");
    var dot = document.querySelector(".cursor-dot");
    var rx = window.innerWidth / 2, ry = window.innerHeight / 2;
    var dx = rx, dy = ry, cx = rx, cy = ry;
    window.addEventListener("mousemove", function (e) {
      dx = e.clientX; dy = e.clientY;
      cx = e.clientX; cy = e.clientY;
      if (dot) dot.style.transform = "translate(" + cx + "px," + cy + "px)";
    });
    function loop() {
      rx += (dx - rx) * 0.18; ry += (dy - ry) * 0.18;
      if (ring) ring.style.transform = "translate(" + rx + "px," + ry + "px)";
      requestAnimationFrame(loop);
    }
    loop();

    document.querySelectorAll("[data-cursor]").forEach(function (el) {
      el.addEventListener("mouseenter", function () { document.body.classList.add("cursor-hover"); });
      el.addEventListener("mouseleave", function () { document.body.classList.remove("cursor-hover"); });
    });
    // hide native cursor on fine pointers
    document.documentElement.style.cursor = "none";
  }

  /* ---- top bar: collapse into compact pill on scroll --------------- */
  var topbar = document.getElementById("topbar");
  var navCta = document.getElementById("navCta");
  var navMenu = document.getElementById("navMenu");
  var navInner = document.querySelector(".nav-links-inner");
  var navLinksEl = document.querySelector(".nav-links");
  var collapsed = false;

  /* measure exact content width so the collapse has no dead-zone */
  function measureNav() {
    if (!navLinksEl || !navInner) return;
    var w = navInner.scrollWidth || navInner.getBoundingClientRect().width;
    if (w > 0) navLinksEl.style.maxWidth = Math.ceil(w + 4) + "px";
  }
  measureNav();
  requestAnimationFrame(measureNav);
  window.addEventListener("resize", measureNav);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(measureNav);

  var mobileMq = window.matchMedia("(max-width: 760px)");

  function updateCollapse() {
    var y = window.scrollY;
    // on small screens the compact pill + menu IS the navigation (hamburger pattern)
    var c = mobileMq.matches ? true : (collapsed ? y > 80 : y > 130);
    if (c !== collapsed) {
      collapsed = c;
      if (topbar) topbar.setAttribute("data-collapsed", c ? "true" : "false");
      if (!c && navMenu) navMenu.classList.remove("open");
    }
  }
  window.addEventListener("scroll", updateCollapse, { passive: true });
  window.addEventListener("resize", updateCollapse);
  if (mobileMq.addEventListener) mobileMq.addEventListener("change", updateCollapse);
  updateCollapse();

  /* contact button: link when expanded, dropdown trigger when collapsed */
  if (navCta && navMenu) {
    navCta.addEventListener("click", function (e) {
      if (collapsed) {
        e.preventDefault();
        e.stopPropagation();
        navMenu.classList.toggle("open");
      }
    });
    navMenu.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () { navMenu.classList.remove("open"); });
    });
    document.addEventListener("click", function (e) {
      if (topbar && !topbar.contains(e.target)) navMenu.classList.remove("open");
    });
  }

  /* ---- scroll reveal (rect-based — robust across iframes) ---------- */
  var reveals = Array.prototype.slice.call(document.querySelectorAll(".reveal"));
  if (reduce) {
    reveals.forEach(function (el) { el.classList.add("in"); });
  } else {
    var checkReveals = function () {
      var vh = window.innerHeight || document.documentElement.clientHeight;
      for (var i = reveals.length - 1; i >= 0; i--) {
        var el = reveals[i];
        var r = el.getBoundingClientRect();
        if (r.top < vh * 0.92 && r.bottom > 0) {
          el.classList.add("in");
          reveals.splice(i, 1);
        }
      }
    };
    checkReveals();
    window.addEventListener("scroll", checkReveals, { passive: true });
    window.addEventListener("resize", checkReveals, { passive: true });
    // safety: nothing should ever stay hidden if scripts/timers stall
    setTimeout(function () { document.querySelectorAll(".reveal").forEach(function (el) { el.classList.add("in"); }); }, 2600);
  }

  /* ---- duplicate marquee content for seamless loop ----------------- */
  document.querySelectorAll(".marquee").forEach(function (m) {
    m.innerHTML = m.innerHTML + m.innerHTML;
  });

  /* ---- nav scroll-spy: underline the active section ---------------- */
  var spyLinks = Array.prototype.slice.call(document.querySelectorAll(".nav a.lk"));
  var spyTargets = spyLinks.map(function (a) {
    var id = a.getAttribute("href");
    return id && id.charAt(0) === "#" ? document.querySelector(id) : null;
  });
  function spy() {
    var mark = window.scrollY + window.innerHeight * 0.34;
    var current = -1;
    for (var i = 0; i < spyTargets.length; i++) {
      var t = spyTargets[i];
      if (t && t.offsetTop <= mark) current = i;
    }
    spyLinks.forEach(function (a, i) { a.classList.toggle("active", i === current); });
  }
  window.addEventListener("scroll", spy, { passive: true });
  spy();

  /* ---- year ---------------------------------------------------------*/
  var y = document.querySelector("[data-year]");
  if (y) y.textContent = new Date().getFullYear();

  /* ---- standout carousel (coverflow) ------------------------------- */
  var stage = document.getElementById("carStage");
  if (stage) {
    var cards = Array.prototype.slice.call(stage.querySelectorAll(".car-card"));
    var n = cards.length;
    var active = 0;
    var dotsWrap = document.getElementById("carDots");
    var count = document.getElementById("carCount");
    var names = cards.map(function (c) { return c.getAttribute("data-name") || ""; });

    var dots = [];
    cards.forEach(function (_, i) {
      var b = document.createElement("button");
      b.type = "button";
      b.setAttribute("aria-label", "Go to project " + (i + 1));
      b.addEventListener("click", function () { go(i); });
      if (dotsWrap) dotsWrap.appendChild(b);
      dots.push(b);
    });

    function step() { return stage.clientWidth * 0.5; }
    function pad(num) { return (num < 10 ? "0" : "") + num; }

    function render() {
      var s = step();
      cards.forEach(function (card, i) {
        var d = i - active;
        if (d > n / 2) d -= n;            /* wrap: nearest copy fills the empty side */
        else if (d < -n / 2) d += n;
        var ad = Math.abs(d);
        var scale = d === 0 ? 1 : 0.8;
        card.style.transform = "translate(-50%,-50%) translateX(" + (d * s) + "px) scale(" + scale + ")";
        card.style.zIndex = String(20 - ad);
        card.style.opacity = ad === 0 ? "1" : (ad === 1 ? "0.5" : "0");
        card.style.pointerEvents = ad <= 1 ? "auto" : "none";
        card.classList.toggle("is-active", d === 0);
      });
      dots.forEach(function (b, i) { b.classList.toggle("on", i === active); });
      if (count) count.textContent = pad(active + 1) + " / " + pad(n) + " — " + names[active];
    }
    function go(i) { active = (i % n + n) % n; render(); }
    function next() { go(active + 1); }
    function prev() { go(active - 1); }

    var nx = document.getElementById("carNext");
    var pv = document.getElementById("carPrev");
    if (nx) nx.addEventListener("click", next);
    if (pv) pv.addEventListener("click", prev);

    /* click a side card -> focus it; active card follows its link */
    var dragged = false;
    cards.forEach(function (card, i) {
      card.addEventListener("click", function (e) {
        if (dragged) { e.preventDefault(); return; }
        if (i !== active) { e.preventDefault(); go(i); }
      });
    });

    /* drag / swipe */
    var down = false, sx = 0;
    stage.addEventListener("pointerdown", function (e) { down = true; sx = e.clientX; dragged = false; });
    stage.addEventListener("pointermove", function (e) { if (down && Math.abs(e.clientX - sx) > 6) dragged = true; });
    window.addEventListener("pointerup", function (e) {
      if (!down) return; down = false;
      var dx = e.clientX - sx;
      if (Math.abs(dx) > 50) { dx < 0 ? next() : prev(); }
    });

    /* keyboard — only when the carousel is on screen */
    window.addEventListener("keydown", function (e) {
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
      var r = stage.getBoundingClientRect();
      if (r.bottom < 40 || r.top > (window.innerHeight - 40)) return;
      if (e.key === "ArrowLeft") prev(); else next();
    });

    window.addEventListener("resize", render);
    render();
  }
})();
