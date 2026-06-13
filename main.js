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

  /* ---- top bar: two modes by ONE breakpoint, no scroll state -------
     Mode is decided purely by the device, never by scroll position:
       • Closed pill (dropdown)  → mobile + tablet (default)
       • Open pill (inline links) → desktop only
     This matchMedia query is the EXACT twin of the CSS open-pill media
     query, so JS (dropdown behaviour) and CSS (layout) can never
     disagree and produce a hybrid state. */
  var topbar = document.getElementById("topbar");
  var navCta = document.getElementById("navCta");
  var navMenu = document.getElementById("navMenu");
  var desktopMq = window.matchMedia("(min-width: 1024px) and (hover: hover) and (pointer: fine)");
  function isClosedMode() { return !desktopMq.matches; }

  function closeMenu() {
    if (!navMenu) return;
    navMenu.classList.remove("open");
    document.body.classList.remove("nav-open");
    if (navCta) navCta.setAttribute("aria-expanded", "false");
  }
  function openMenu() {
    if (!navMenu) return;
    navMenu.classList.add("open");
    document.body.classList.add("nav-open");   /* scroll lock */
    if (navCta) navCta.setAttribute("aria-expanded", "true");
  }

  if (navCta && navMenu) {
    navCta.setAttribute("aria-haspopup", "true");
    navCta.setAttribute("aria-expanded", "false");

    /* the trigger is a dropdown toggle in closed mode, a plain #contact
       link in open mode (desktop) */
    navCta.addEventListener("click", function (e) {
      if (!isClosedMode()) return;          /* desktop: let the link work */
      e.preventDefault();
      e.stopPropagation();
      navMenu.classList.contains("open") ? closeMenu() : openMenu();
    });

    /* choosing a destination closes the menu (and releases the lock) */
    navMenu.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", closeMenu);
    });

    /* click outside the pill closes the dropdown */
    document.addEventListener("click", function (e) {
      if (topbar && !topbar.contains(e.target)) closeMenu();
    });

    /* ESC closes the dropdown */
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeMenu();
    });

    /* crossing the desktop breakpoint must never leave a stale dropdown
       open behind the open-pill layout */
    var onModeChange = function () { closeMenu(); };
    if (desktopMq.addEventListener) desktopMq.addEventListener("change", onModeChange);
    else if (desktopMq.addListener) desktopMq.addListener(onModeChange);
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

  /* ---- carousel: strong dark fade + white text on every card ------- */
  (function () {
    // tall, strong bottom-up fade so white text reads on any thumbnail
    var SCRIM = "linear-gradient(to top, rgba(8,8,7,0.96) 0%, rgba(8,8,7,0.82) 20%, rgba(8,8,7,0.45) 46%, rgba(8,8,7,0) 78%)";
    document.querySelectorAll(".car-card").forEach(function (card) {
      card.setAttribute("data-tone", "dark");
      var ov = card.querySelector(".feature-overlay");
      if (ov) ov.style.background = SCRIM;
      // inline !important so white wins regardless of the cascade
      card.querySelectorAll(".feature-overlay .ftitle, .feature-overlay .fmeta .mono.prim")
        .forEach(function (e) { e.style.setProperty("color", "#ffffff", "important"); });
      card.querySelectorAll(".feature-overlay .label")
        .forEach(function (e) { e.style.setProperty("color", "rgba(255,255,255,0.82)", "important"); });
      card.querySelectorAll(".feature-overlay .fmeta .mono:not(.prim)")
        .forEach(function (e) { e.style.setProperty("color", "rgba(255,255,255,0.7)", "important"); });
    });
  })();

  /* ---- feature video: yield the custom cursor to native controls --- */
  document.querySelectorAll(".video-feature").forEach(function (vf) {
    vf.addEventListener("mouseenter", function () { document.body.classList.add("cursor-over-video"); });
    vf.addEventListener("mouseleave", function () { document.body.classList.remove("cursor-over-video"); });
  });

  /* ============================================================
     LIGHTBOX — full-size image viewer for every gallery thumbnail
     Groups images per project so prev/next stays within a case study.
     Supports: click/keyboard open, arrows, ESC, backdrop-close, tap/click
     zoom + drag-pan, and horizontal swipe between images on touch.
     ============================================================ */
  (function () {
    // Clickable tiles: collage/portrait thumbnails that hold a real image.
    // Excludes carousel cards (they link to sections) and the feature video
    // (it has native controls).
    var tiles = Array.prototype.slice
      .call(document.querySelectorAll(".hovermedia"))
      .filter(function (el) {
        return !el.classList.contains("car-card") &&
               !el.classList.contains("video-feature") &&
               el.querySelector("img.fill");
      });
    if (!tiles.length) return;

    // Build per-project groups so arrows cycle within one case study.
    var groups = [];
    var groupOf = new Map();
    tiles.forEach(function (tile) {
      var key = tile.closest(".collage") || tile.closest(".portrait") || tile.parentNode;
      var g = groupOf.get(key);
      if (!g) { g = []; groupOf.set(key, g); groups.push(g); }
      var img = tile.querySelector("img.fill");
      var item = { src: img.getAttribute("src"), alt: img.getAttribute("alt") || "" };
      g.push(item);
      var idx = g.length - 1;

      // Inject the hover "View" affordance (no extra markup in the HTML).
      if (!tile.querySelector(".media-cue")) {
        var cue = document.createElement("div");
        cue.className = "media-cue";
        cue.innerHTML = '<span aria-hidden="true">↗ View</span>';
        tile.appendChild(cue);
      }
      // Make the anchor-without-href behave as a button for keyboard users.
      tile.setAttribute("role", "button");
      tile.setAttribute("tabindex", "0");
      tile.setAttribute("aria-label", "View image" + (item.alt ? ": " + item.alt : ""));
      tile.addEventListener("click", function (e) { e.preventDefault(); open(g, idx); });
      tile.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(g, idx); }
      });
    });

    // ---- build the overlay once ----
    var lb = document.createElement("div");
    lb.className = "lb";
    lb.setAttribute("role", "dialog");
    lb.setAttribute("aria-modal", "true");
    lb.setAttribute("aria-label", "Image viewer");
    lb.innerHTML =
      '<button class="lb-btn lb-close" type="button" aria-label="Close (Esc)">✕</button>' +
      '<button class="lb-btn lb-prev" type="button" aria-label="Previous image">‹</button>' +
      '<button class="lb-btn lb-next" type="button" aria-label="Next image">›</button>' +
      '<div class="lb-stage"><img class="lb-img" alt=""></div>' +
      '<div class="lb-caption"><span class="lb-count"></span><span class="lb-alt"></span></div>';
    document.body.appendChild(lb);

    var img = lb.querySelector(".lb-img");
    var stage = lb.querySelector(".lb-stage");
    var elCount = lb.querySelector(".lb-count");
    var elAlt = lb.querySelector(".lb-alt");
    var btnClose = lb.querySelector(".lb-close");
    var btnPrev = lb.querySelector(".lb-prev");
    var btnNext = lb.querySelector(".lb-next");

    var group = null, index = 0, lastFocus = null;
    var zoom = 1, panX = 0, panY = 0;

    function applyTransform() {
      img.style.transform = "scale(" + zoom + ") translate(" + panX + "px," + panY + "px)";
    }
    function resetZoom() {
      zoom = 1; panX = 0; panY = 0;
      img.classList.remove("zoomed", "panning");
      img.style.transform = "";
    }
    function preload(src) { if (src) { var i = new Image(); i.src = src; } }

    function setImage(i) {
      index = (i % group.length + group.length) % group.length;
      var it = group[index];
      resetZoom();
      img.src = it.src;
      img.alt = it.alt;
      elAlt.textContent = it.alt;
      elCount.textContent = pad2(index + 1) + " / " + pad2(group.length);
      // preload neighbours for instant swipe/arrow
      preload(group[(index + 1) % group.length].src);
      preload(group[(index - 1 + group.length) % group.length].src);
    }
    function pad2(n) { return (n < 10 ? "0" : "") + n; }

    function open(g, i) {
      group = g;
      lb.classList.toggle("lb-single", g.length <= 1);
      setImage(i);
      // lock scroll without a layout shift from the vanishing scrollbar
      var sw = window.innerWidth - document.documentElement.clientWidth;
      if (sw > 0) document.body.style.paddingRight = sw + "px";
      document.body.classList.add("lb-lock");
      lb.classList.add("open");
      lastFocus = document.activeElement;
      btnClose.focus();
    }
    function close() {
      lb.classList.remove("open");
      document.body.classList.remove("lb-lock");
      document.body.style.paddingRight = "";
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    }
    function next() { setImage(index + 1); }
    function prev() { setImage(index - 1); }

    btnClose.addEventListener("click", close);
    btnNext.addEventListener("click", function (e) { e.stopPropagation(); next(); });
    btnPrev.addEventListener("click", function (e) { e.stopPropagation(); prev(); });
    // click on the dimmed backdrop (not the image/controls) closes
    lb.addEventListener("click", function (e) { if (e.target === lb || e.target === stage) close(); });

    // ---- zoom toggle + drag-pan on the image ----
    img.addEventListener("click", function (e) {
      e.stopPropagation();
      if (panMoved) { panMoved = false; return; }   // a drag shouldn't toggle
      if (zoom === 1) {
        zoom = 2.4;
        img.classList.add("zoomed");
        // zoom toward the click point
        var r = img.getBoundingClientRect();
        panX = (r.left + r.width / 2 - e.clientX) / zoom;
        panY = (r.top + r.height / 2 - e.clientY) / zoom;
        clampPan();
        applyTransform();
      } else {
        resetZoom();
      }
    });

    function clampPan() {
      var r = stage.getBoundingClientRect();
      var maxX = (img.naturalWidth ? Math.min(r.width, img.clientWidth) : r.width) * (zoom - 1) / (2 * zoom);
      var maxY = img.clientHeight * (zoom - 1) / (2 * zoom);
      panX = Math.max(-maxX, Math.min(maxX, panX));
      panY = Math.max(-maxY, Math.min(maxY, panY));
    }

    // ---- pointer: drag to pan when zoomed, swipe to change when not ----
    var down = false, startX = 0, startY = 0, basePanX = 0, basePanY = 0, panMoved = false;
    img.addEventListener("pointerdown", function (e) {
      down = true; panMoved = false;
      startX = e.clientX; startY = e.clientY;
      basePanX = panX; basePanY = panY;
      try { img.setPointerCapture(e.pointerId); } catch (err) {}
    });
    img.addEventListener("pointermove", function (e) {
      if (!down) return;
      var dx = e.clientX - startX, dy = e.clientY - startY;
      if (Math.abs(dx) > 4 || Math.abs(dy) > 4) panMoved = true;
      if (zoom > 1) {
        img.classList.add("panning");
        panX = basePanX + dx / zoom;
        panY = basePanY + dy / zoom;
        clampPan();
        applyTransform();
      }
    });
    img.addEventListener("pointerup", function (e) {
      if (!down) return; down = false;
      img.classList.remove("panning");
      try { img.releasePointerCapture(e.pointerId); } catch (err) {}
      // horizontal swipe (only when not zoomed) navigates the group
      if (zoom === 1 && group && group.length > 1) {
        var dx = e.clientX - startX, dy = e.clientY - startY;
        if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) { dx < 0 ? next() : prev(); }
      }
    });

    // ---- keyboard ----
    document.addEventListener("keydown", function (e) {
      if (!lb.classList.contains("open")) return;
      if (e.key === "Escape") { close(); }
      else if (e.key === "ArrowRight") { next(); }
      else if (e.key === "ArrowLeft") { prev(); }
      else if (e.key === "Tab") {
        // simple focus trap across the visible controls
        var f = [btnClose, btnPrev, btnNext].filter(function (b) {
          return b.offsetParent !== null;
        });
        if (!f.length) return;
        var first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
  })();
})();
