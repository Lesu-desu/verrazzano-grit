(function () {
  "use strict";

  const data = window.PF;
  if (!data) return;

  const byId = {};
  data.projects.forEach(p => { byId[p.id] = p; });

  const root = document.documentElement;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- KEEP THE HEADER OFFSET IN STEP WITH THE REAL HEADER ---------- */
  const header = document.getElementById("header");
  function measure() {
    if (header) root.style.setProperty("--pf-head", header.offsetHeight + "px");
  }
  measure();
  window.addEventListener("resize", measure);
  window.addEventListener("load", measure);

  /* ---------- PHOTOS THAT FAIL TO LOAD ---------- */
  // A deleted or misnamed photo is dropped from its slideshow, so the counter and
  // the arrows only ever cover photos that exist. If it was the project's only
  // photo, a tinted panel with the project name is shown instead.
  const failed = new Set();

  function guard(img) {
    const holder = img.closest("[data-name]");
    if (!holder) return;
    const fail = () => {
      const src = img.getAttribute("src");
      const box = holder.closest(".pf-slider");
      if (holder.classList.contains("pf-slide") && box && box._drop &&
          box.querySelectorAll(".pf-slide").length > 1) {
        failed.add(src);
        box._drop(holder);
      } else {
        holder.classList.add("is-missing");
      }
    };
    if (img.complete && img.naturalWidth === 0 && img.getAttribute("src")) fail();
    else img.addEventListener("error", fail, { once: true });
  }

  /* ---------- FOCUS TRAP FOR DIALOGS ---------- */
  function trapTab(e, box) {
    if (e.key !== "Tab") return;
    const items = Array.from(box.querySelectorAll("button, iframe, video[controls]"))
      .filter(el => !el.hidden && el.offsetParent !== null);
    if (!items.length) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  const dialogOpen = () => document.body.classList.contains("pf-locked");

  /* =========================================================
     PHOTO SLIDESHOWS
     ========================================================= */
  function initSlider(box) {
    const track = box.querySelector(".pf-track");
    const counter = box.querySelector(".pf-counter");
    const prev = box.querySelector(".pf-arrow--prev");
    const next = box.querySelector(".pf-arrow--next");
    const pause = box.querySelector(".pf-pause");
    let slides = Array.from(track.children);
    let n = slides.length;
    let idx = 0;
    let raf = 0;

    function scrollToX(left, smooth) {
      try {
        track.scrollTo({ left: left, behavior: smooth ? "smooth" : "auto" });
      } catch (err) {
        track.scrollLeft = left;       // very old browsers
      }
    }

    // move to slide i; wrapping from one end to the other jumps instead of racing across
    function go(i, smooth) {
      if (n < 2) return;
      const wrap = i < 0 || i >= n;
      i = (i + n) % n;
      scrollToX(i * track.clientWidth, smooth !== false && !wrap && !reduceMotion);
    }
    box._go = go;   // the full-screen viewer uses this to keep the slideshow in step

    function update() {
      if (counter) counter.textContent = (idx + 1) + " / " + n;
      slides.forEach((s, k) => s.setAttribute("tabindex", k === idx ? "0" : "-1"));
      [prev, next, counter, pause].forEach(el => { if (el) el.hidden = n < 2; });
    }

    // called when a photo fails to load
    box._drop = function (slide) {
      slide.remove();
      slides = Array.from(track.children);
      n = slides.length;
      idx = Math.min(idx, n - 1);
      update();
    };

    track.addEventListener("scroll", () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        if (!track.clientWidth) return;
        const i = Math.round(track.scrollLeft / track.clientWidth);
        if (i !== idx && i >= 0 && i < n) { idx = i; update(); }
      });
    }, { passive: true });

    // photos are lazy-loaded; as soon as someone touches the slideshow, load them all
    // (this also lets a deleted photo be noticed and dropped straight away)
    const loadAll = () => track.querySelectorAll("img").forEach(im => { im.loading = "eager"; });
    ["pointerenter", "touchstart", "focusin"].forEach(ev =>
      box.addEventListener(ev, loadAll, { once: true, passive: true }));

    // keep the current photo in place if the window is resized
    window.addEventListener("resize", () => go(idx, false));

    if (prev) prev.addEventListener("click", () => go(idx - 1));
    if (next) next.addEventListener("click", () => go(idx + 1));

    /* gentle autoplay, only where the markup asks for it */
    if (box.hasAttribute("data-autoplay")) {
      if (reduceMotion) {
        if (pause) pause.remove();
        return;
      }
      let paused = false, hovering = false, visible = false;

      box.addEventListener("pointerenter", () => { hovering = true; });
      box.addEventListener("pointerleave", () => { hovering = false; });
      box.addEventListener("focusin", () => { hovering = true; });
      box.addEventListener("focusout", () => { hovering = false; });

      if ("IntersectionObserver" in window) {
        new IntersectionObserver(entries => {
          visible = entries[0].isIntersecting;
        }, { threshold: 0.4 }).observe(box);
      } else {
        visible = true;
      }

      // how long each photo stays before the next one, in milliseconds (4800 = 4.8 seconds)
      const SLIDE_MS = 4800;
      setInterval(() => {
        if (paused || hovering || !visible || document.hidden || dialogOpen()) return;
        go(idx + 1);
      }, SLIDE_MS);

      if (pause) {
        pause.addEventListener("click", () => {
          paused = !paused;
          pause.textContent = paused ? "Play" : "Pause";
          pause.setAttribute("aria-label", paused ? "Play slideshow" : "Pause slideshow");
        });
      }
    }
  }

  // one broken slideshow must never stop the others, or the buttons below
  let started = 0;
  document.querySelectorAll(".pf-slider").forEach(box => {
    try { initSlider(box); started++; }
    catch (err) { console.error("[portfolio] slideshow failed to start:", err); }
  });
  document.querySelectorAll(".pf-slide img, .pf-film img").forEach(guard);
  console.info("[portfolio] script v4 running, " + started + " slideshows started");

  /* =========================================================
     FULL-SCREEN PHOTO VIEWER
     ========================================================= */
  const lb = document.getElementById("pfLightbox");
  const lbImg = document.getElementById("pfLbImage");
  const lbTitle = document.getElementById("pfLbTitle");
  const lbCount = document.getElementById("pfLbCount");
  const lbPrev = document.getElementById("pfLbPrev");
  const lbNext = document.getElementById("pfLbNext");
  const lbClose = document.getElementById("pfLbClose");

  let photos = [];
  let index = 0;
  let current = null;
  let lastFocus = null;

  function paint() {
    lbImg.src = photos[index];
    lbImg.alt = current.name + ", photo " + (index + 1);
    lbCount.textContent = (index + 1) + " / " + photos.length;
  }

  function openGallery(id, start, trigger) {
    const p = byId[id];
    if (!p) return;
    current = p;
    photos = p.images.filter(src => !failed.has(src));
    index = start || 0;
    lastFocus = trigger || document.activeElement;
    lbTitle.textContent = p.location ? p.name + ", " + p.location : p.name;
    const single = photos.length < 2;
    lbPrev.hidden = single;
    lbNext.hidden = single;
    paint();
    lb.hidden = false;
    document.body.classList.add("pf-locked");
    lbClose.focus();
  }

  function closeGallery() {
    lb.hidden = true;
    lbImg.removeAttribute("src");
    document.body.classList.remove("pf-locked");
    // return focus without letting the browser scroll the slideshow back to the old slide
    if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
    // then leave the slideshow on the photo the visitor was last looking at
    const box = document.querySelector('.pf-slider[data-id="' + current.id + '"]');
    if (box && box._go) box._go(index, false);
  }

  function step(dir) {
    index = (index + dir + photos.length) % photos.length;
    paint();
  }

  document.querySelectorAll("[data-open]").forEach(btn => {
    btn.addEventListener("click", () => {
      let start = 0;
      if (btn.classList.contains("pf-slide")) {
        start = Array.from(btn.parentNode.children).indexOf(btn);   // position among photos still present
      }
      openGallery(Number(btn.dataset.open), start, btn);
    });
  });
  lbClose.addEventListener("click", closeGallery);
  lbPrev.addEventListener("click", () => step(-1));
  lbNext.addEventListener("click", () => step(1));
  lb.addEventListener("click", e => { if (e.target === lb) closeGallery(); });

  let touchX = 0;
  lb.addEventListener("touchstart", e => { touchX = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener("touchend", e => {
    const dx = touchX - e.changedTouches[0].clientX;
    if (Math.abs(dx) > 50 && photos.length > 1) step(dx > 0 ? 1 : -1);
  });

  /* =========================================================
     FILMS
     ========================================================= */
  const vbox = document.getElementById("pfVideoBox");
  const vstage = document.getElementById("pfVideoStage");
  const vclose = document.getElementById("pfVideoClose");
  let vLastFocus = null;

  function openFilm(btn) {
    const d = btn.dataset;
    vstage.innerHTML = "";

    if (d.youtube) {
      const f = document.createElement("iframe");
      f.src = "https://www.youtube-nocookie.com/embed/" + encodeURIComponent(d.youtube) + "?autoplay=1&rel=0&modestbranding=1";
      f.title = d.title || "Film";
      f.allow = "autoplay; fullscreen; picture-in-picture";
      f.allowFullscreen = true;
      vstage.appendChild(f);
    } else if (d.src) {
      const v = document.createElement("video");
      v.src = d.src;                    // already a full URL from projects.py
      if (d.poster) v.poster = d.poster;
      v.controls = true;
      v.autoplay = true;
      v.playsInline = true;
      vstage.appendChild(v);
    } else {
      return;
    }

    vLastFocus = btn;
    vbox.setAttribute("aria-label", d.title || "Film");
    vbox.hidden = false;
    document.body.classList.add("pf-locked");
    vclose.focus();
  }

  function closeFilm() {
    vbox.hidden = true;
    vstage.innerHTML = "";              // removing the element also stops playback
    document.body.classList.remove("pf-locked");
    if (vLastFocus && vLastFocus.focus) vLastFocus.focus();
  }

  document.querySelectorAll("[data-film]").forEach(btn => {
    btn.addEventListener("click", () => openFilm(btn));
  });
  vclose.addEventListener("click", closeFilm);
  vbox.addEventListener("click", e => { if (e.target === vbox) closeFilm(); });

  /* ---------- KEYBOARD ---------- */
  document.addEventListener("keydown", e => {
    if (!vbox.hidden) {
      if (e.key === "Escape") closeFilm();
      else trapTab(e, vbox);
      return;
    }
    if (lb.hidden) return;
    if (e.key === "Escape") closeGallery();
    else if (e.key === "ArrowLeft" && photos.length > 1) step(-1);
    else if (e.key === "ArrowRight" && photos.length > 1) step(1);
    else trapTab(e, lb);
  });
})();