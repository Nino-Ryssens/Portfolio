/* ============================================================
   NINO RYSSENS — case / project detail page interactions
   Mirrors the homepage system (custom cursor · scroll reveal · nav pill)
   and adds: collapsible sections, a unified media lightbox
   (image / PDF / video + photo-gallery prev-next) and an Instagram
   story viewer. Self-contained — no shared runtime with main.js.
   ============================================================ */
(function () {
  "use strict";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- live Antwerp time + year ------------------------------------ */
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
  var y = document.querySelector("[data-year]");
  if (y) y.textContent = new Date().getFullYear();

  /* ---- custom glass cursor (fine pointers only) -------------------- */
  var fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  if (fine) {
    var ring = document.querySelector(".cursor");
    var rx = window.innerWidth / 2, ry = window.innerHeight / 2, dx = rx, dy = ry;
    window.addEventListener("mousemove", function (e) { dx = e.clientX; dy = e.clientY; });
    (function loop() {
      rx += (dx - rx) * 0.18; ry += (dy - ry) * 0.18;
      if (ring) ring.style.transform = "translate(" + rx + "px," + ry + "px)";
      requestAnimationFrame(loop);
    })();
    document.querySelectorAll("[data-cursor]").forEach(function (el) {
      el.addEventListener("mouseenter", function () { document.body.classList.add("cursor-hover"); });
      el.addEventListener("mouseleave", function () { document.body.classList.remove("cursor-hover"); });
    });
    document.documentElement.style.cursor = "none";
  }

  /* ---- nav pill: two modes by one breakpoint (twin of CSS) --------- */
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
    document.body.classList.add("nav-open");
    if (navCta) navCta.setAttribute("aria-expanded", "true");
  }
  if (navCta && navMenu) {
    navCta.setAttribute("aria-haspopup", "true");
    navCta.setAttribute("aria-expanded", "false");
    navCta.addEventListener("click", function (e) {
      if (!isClosedMode()) return;
      e.preventDefault(); e.stopPropagation();
      navMenu.classList.contains("open") ? closeMenu() : openMenu();
    });
    navMenu.querySelectorAll("a").forEach(function (a) { a.addEventListener("click", closeMenu); });
    document.addEventListener("click", function (e) { if (topbar && !topbar.contains(e.target)) closeMenu(); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeMenu(); });
    if (desktopMq.addEventListener) desktopMq.addEventListener("change", closeMenu);
    else if (desktopMq.addListener) desktopMq.addListener(closeMenu);
  }

  /* ---- scroll reveal (rect-based, with safety fallback) ------------ */
  var reveals = Array.prototype.slice.call(document.querySelectorAll(".reveal"));
  if (reduce) {
    reveals.forEach(function (el) { el.classList.add("in"); });
  } else {
    var checkReveals = function () {
      var vh = window.innerHeight || document.documentElement.clientHeight;
      for (var i = reveals.length - 1; i >= 0; i--) {
        var r = reveals[i].getBoundingClientRect();
        if (r.top < vh * 0.92 && r.bottom > 0) { reveals[i].classList.add("in"); reveals.splice(i, 1); }
      }
    };
    checkReveals();
    window.addEventListener("scroll", checkReveals, { passive: true });
    window.addEventListener("resize", checkReveals, { passive: true });
    setTimeout(function () { document.querySelectorAll(".reveal").forEach(function (el) { el.classList.add("in"); }); }, 2600);
  }

  /* ============================================================
     COLLAPSIBLE SECTIONS  + open-from-hash + in-page jump links
     ============================================================ */
  function openSection(sec, scroll) {
    if (!sec) return;
    sec.classList.add("is-open");
    var head = sec.querySelector(".section-head");
    if (head) head.setAttribute("aria-expanded", "true");
    if (scroll) setTimeout(function () { sec.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" }); }, 60);
    // a freshly opened section may contain reveals — re-check
    if (!reduce) window.dispatchEvent(new Event("scroll"));
  }
  function closeSection(sec) {
    if (!sec) return;
    sec.classList.remove("is-open");
    var head = sec.querySelector(".section-head");
    if (head) head.setAttribute("aria-expanded", "false");
  }
  document.querySelectorAll("section.work").forEach(function (sec) {
    var head = sec.querySelector(".section-head");
    if (!head) return;
    var toggle = function () { sec.classList.contains("is-open") ? closeSection(sec) : openSection(sec, false); };
    head.addEventListener("click", toggle);
    head.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggle(); }
    });
  });
  function openFromHash() {
    if (!location.hash) return;
    var target;
    try { target = document.querySelector(location.hash); } catch (e) { return; }
    if (target && target.classList && target.classList.contains("work")) openSection(target, true);
  }
  openFromHash();
  window.addEventListener("hashchange", openFromHash);
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener("click", function (e) {
      var id = a.getAttribute("href");
      if (id.length < 2) return;
      var target;
      try { target = document.querySelector(id); } catch (err) { return; }
      if (target && target.classList.contains("work")) {
        e.preventDefault();
        openSection(target, true);
        history.replaceState(null, "", id);
      }
    });
  });

  /* ============================================================
     LIGHTBOX  — image / PDF (iframe) / video, + photo-gallery nav
     Reuses the .lb chrome from ../styles.css.
     ============================================================ */
  var lb = document.getElementById("lb");
  if (lb) {
    var lbContent = lb.querySelector(".lb-content");
    var lbCount = lb.querySelector(".lb-count");
    var lbAlt = lb.querySelector(".lb-alt");
    var lbPrev = lb.querySelector(".lb-prev");
    var lbNext = lb.querySelector(".lb-next");
    var lbClose = lb.querySelector(".lb-close");
    var lastFocus = null;

    function showNav(show) {
      lb.classList.toggle("lb-single", !show);
    }
    function openMedia(html, caption) {
      lbContent.innerHTML = html;
      lbAlt.innerHTML = caption || "";
      lbCount.textContent = "";
      showNav(false);
      var sw = window.innerWidth - document.documentElement.clientWidth;
      if (sw > 0) document.body.style.paddingRight = sw + "px";
      document.body.classList.add("lb-lock");
      lb.classList.add("open");
      lastFocus = document.activeElement;
      lbClose.focus();
    }
    function closeLb() {
      lb.classList.remove("open");
      lbContent.innerHTML = "";
      document.body.classList.remove("lb-lock");
      document.body.style.paddingRight = "";
      lbPrev.onclick = lbNext.onclick = null;
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    }
    lbClose.addEventListener("click", closeLb);
    lb.addEventListener("click", function (e) { if (e.target === lb) closeLb(); });
    document.addEventListener("keydown", function (e) {
      if (!lb.classList.contains("open")) return;
      if (e.key === "Escape") closeLb();
      else if (e.key === "ArrowLeft" && !lb.classList.contains("lb-single") && lbPrev.onclick) lbPrev.onclick();
      else if (e.key === "ArrowRight" && !lb.classList.contains("lb-single") && lbNext.onclick) lbNext.onclick();
    });

    function esc(s) { return (s || "").replace(/"/g, "&quot;"); }

    // single image / video / pdf cards
    document.querySelectorAll("[data-video]").forEach(function (el) {
      el.addEventListener("click", function (e) {
        if (e.target.closest("a")) return;
        openMedia('<video class="lb-media" src="' + esc(el.dataset.video) + '" controls autoplay playsinline></video>', el.dataset.title || "");
      });
    });
    document.querySelectorAll("[data-image]:not(.pitem)").forEach(function (el) {
      el.addEventListener("click", function (e) {
        if (e.target.closest("a")) return;
        openMedia('<img class="lb-media" src="' + esc(el.dataset.image) + '" alt="' + esc(el.dataset.title) + '">', el.dataset.title || "");
      });
    });
    document.querySelectorAll("[data-pdf]").forEach(function (el) {
      el.addEventListener("click", function (e) {
        if (e.target.closest("a")) return;
        var src = el.dataset.pdf, title = el.dataset.title || "";
        openMedia(
          '<iframe class="lb-media" src="' + esc(src) + '" title="' + esc(title) + '"></iframe>',
          title + ' — <a href="' + esc(src) + '" target="_blank" rel="noopener">open in new tab ↗</a>'
        );
      });
    });

    // photo galleries — prev/next within a gallery
    function pad2(n) { return (n < 10 ? "0" : "") + n; }
    document.querySelectorAll(".pgal").forEach(function (gal) {
      var items = Array.prototype.slice.call(gal.querySelectorAll(".pitem"));
      items.forEach(function (it, idx) {
        it.addEventListener("click", function () {
          var i = idx;
          function show() {
            var item = items[i];
            lbContent.innerHTML = '<img class="lb-media" src="' + esc(item.dataset.image) + '" alt="' + esc(item.dataset.title) + '">';
            lbAlt.textContent = item.dataset.title || "";
            lbCount.textContent = pad2(i + 1) + " / " + pad2(items.length);
            showNav(items.length > 1);
          }
          var sw = window.innerWidth - document.documentElement.clientWidth;
          if (sw > 0) document.body.style.paddingRight = sw + "px";
          document.body.classList.add("lb-lock");
          lb.classList.add("open");
          lastFocus = document.activeElement;
          lbClose.focus();
          lbPrev.onclick = function () { i = (i - 1 + items.length) % items.length; show(); };
          lbNext.onclick = function () { i = (i + 1) % items.length; show(); };
          show();
        });
      });
    });

    // Keyboard access: every click-to-open tile becomes a real button
    // (Enter/Space) with a focus ring (from ../styles.css) — parity with the
    // homepage gallery. Anchors (the .docx card) are already accessible.
    document.querySelectorAll("[data-image], [data-pdf], [data-video]").forEach(function (el) {
      if (el.tagName === "A") return;
      el.setAttribute("role", "button");
      el.setAttribute("tabindex", "0");
      if (!el.getAttribute("aria-label")) el.setAttribute("aria-label", "View: " + (el.dataset.title || "media"));
      el.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); el.click(); }
      });
    });
  }

  /* ---- video thumbnails: hover to preview-play --------------------- */
  document.querySelectorAll(".thumb video").forEach(function (v) {
    var card = v.closest(".card");
    if (!card) return;
    card.addEventListener("mouseenter", function () { v.play().catch(function () {}); });
    card.addEventListener("mouseleave", function () { v.pause(); try { v.currentTime = 2; } catch (e) {} });
  });

  /* ============================================================
     INSTAGRAM STORY VIEWER
     Reads groups from window.IG_HIGHLIGHTS = [{label, stories:[...]}]
     ============================================================ */
  var highlights = window.IG_HIGHLIGHTS || [];
  var sv = document.getElementById("sv");
  if (sv && highlights.length) {
    var svImg = document.getElementById("sv-img");
    var svBars = document.getElementById("sv-bars");
    var svLabel = document.getElementById("sv-label");
    var svClose = document.getElementById("sv-close");
    var svPrev = document.getElementById("sv-prev");
    var svNext = document.getElementById("sv-next");
    var curHL = 0, curIdx = 0, advanceTimer = null;

    function renderBars(n, active) {
      svBars.innerHTML = "";
      for (var i = 0; i < n; i++) {
        var bar = document.createElement("div");
        bar.className = "sv-bar" + (i < active ? " done" : i === active ? " active" : "");
        bar.innerHTML = '<span class="sv-bar-fill"></span>';
        svBars.appendChild(bar);
      }
    }
    function showStory() {
      var hl = highlights[curHL];
      svLabel.textContent = "· " + hl.label;
      svImg.src = hl.stories[curIdx];
      renderBars(hl.stories.length, curIdx);
      clearTimeout(advanceTimer);
      if (!reduce) advanceTimer = setTimeout(nextStory, 5000);
    }
    function nextStory() {
      var hl = highlights[curHL];
      if (curIdx < hl.stories.length - 1) { curIdx++; showStory(); }
      else if (curHL < highlights.length - 1) { curHL++; curIdx = 0; showStory(); }
      else closeStories();
    }
    function prevStory() {
      if (curIdx > 0) { curIdx--; showStory(); }
      else if (curHL > 0) { curHL--; curIdx = highlights[curHL].stories.length - 1; showStory(); }
    }
    function openStories(i) {
      curHL = i; curIdx = 0;
      sv.classList.add("open");
      sv.setAttribute("aria-hidden", "false");
      document.body.classList.add("lb-lock");
      showStory();
    }
    function closeStories() {
      sv.classList.remove("open");
      sv.setAttribute("aria-hidden", "true");
      document.body.classList.remove("lb-lock");
      clearTimeout(advanceTimer);
    }
    document.querySelectorAll(".ig-hl").forEach(function (btn) {
      btn.addEventListener("click", function () { openStories(parseInt(btn.dataset.hl, 10)); });
    });
    svClose.addEventListener("click", closeStories);
    svPrev.addEventListener("click", prevStory);
    svNext.addEventListener("click", nextStory);
    sv.addEventListener("click", function (e) { if (e.target === sv) closeStories(); });
    document.addEventListener("keydown", function (e) {
      if (!sv.classList.contains("open")) return;
      if (e.key === "Escape") closeStories();
      else if (e.key === "ArrowLeft") { e.preventDefault(); prevStory(); }
      else if (e.key === "ArrowRight") { e.preventDefault(); nextStory(); }
    });
  }
})();
