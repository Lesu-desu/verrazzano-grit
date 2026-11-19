(function () {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- OPENING CURTAIN ---------- */
  (function () {
    const root = document.documentElement;
    const intro = document.getElementById("intro");
    if (!intro) return;
    if (!root.classList.contains("intro-on")) { intro.remove(); return; }

    let opened = false, finished = false;

    function finish() {
      if (finished) return;
      finished = true;
      root.classList.remove("intro-on", "intro-hold");
      intro.remove();
    }

    function open() {
      if (opened) return;
      opened = true;
      root.classList.remove("intro-hold");   // lets the hero text start its own entrance
      intro.classList.add("is-open");
      setTimeout(finish, 1100);
    }

    const timer = setTimeout(open, 1300);
    const skip = () => { clearTimeout(timer); open(); };
    intro.addEventListener("click", skip);
    document.addEventListener("keydown", e => { if (e.key === "Escape" || e.key === "Enter") skip(); });
    setTimeout(finish, 4000);
  })();



  /* ---------- HEADER ON SCROLL ---------- */
  const header = document.getElementById("header");

  if (header) {
    const onScrollHeader = () => {
      header.classList.toggle("scrolled", window.scrollY > 40);
    };

    onScrollHeader();
    window.addEventListener("scroll", onScrollHeader, { passive: true });
  }


  /* ---------- MOBILE MENU ---------- */
  const burger = document.getElementById("burger");
  const navLinks = document.getElementById("navLinks");

  if (burger && navLinks) {
    burger.addEventListener("click", () => {
      const open = navLinks.classList.toggle("open");

      burger.classList.toggle("open", open);
      burger.setAttribute("aria-expanded", String(open));

      document.body.style.overflow = open ? "hidden" : "";
    });

    document.addEventListener("keydown", e => {
      if (e.key === "Escape" && navLinks.classList.contains("open")) {
        navLinks.classList.remove("open");
        burger.classList.remove("open");
        burger.setAttribute("aria-expanded", "false");
        document.body.style.overflow = "";
        burger.focus();
      }
    });

    navLinks.querySelectorAll("a").forEach(a => {
      a.addEventListener("click", () => {
        navLinks.classList.remove("open");
        burger.classList.remove("open");
        burger.setAttribute("aria-expanded", "false");
        document.body.style.overflow = "";
      });
    });
  }


  /* ---------- HERO PORTAL OPENING ---------- */
  const stage = document.querySelector(".hero-stage");
  const hero = document.querySelector(".hero");
  const portalMessages = document.querySelectorAll("[data-portal-message]");

  // Messages play between these scroll-progress values (0 = closed, 1 = fully open)
  const MSG_START = 0.2;
  const MSG_END = 1.0;
  let activeMsg = -1;
  const phoneHero = window.matchMedia("(max-width: 620px)");

  function setPortalMessage(open) {
    if (!portalMessages.length) return;

    let idx = -1;
    if (open >= MSG_START) {
      const span = (MSG_END - MSG_START) / portalMessages.length;
      idx = Math.min(
        Math.floor((open - MSG_START) / span),
        portalMessages.length - 1
      );
    }

    if (idx === activeMsg) return;
    activeMsg = idx;

    portalMessages.forEach((el, i) => {
      el.classList.toggle("is-active", i === idx);
    });
  }

  if (stage && hero) {

    if (reduceMotion) {
      hero.style.setProperty("--open", "0");
      hero.style.setProperty("--sweep", "0");

    } else {

      let ticking = false;

      function updateHero() {
        const rect = stage.getBoundingClientRect();

        const total = Math.max(
          stage.offsetHeight - window.innerHeight,
          1
        );

        const scrolled = Math.min(
          Math.max(-rect.top, 0),
          total
        );

        const open = scrolled / total;

        const sweep = Math.max(
          0,
          1 - Math.abs(open - 0.5) * 2
        );

        hero.style.setProperty("--open", open.toFixed(4));
        hero.style.setProperty("--sweep", sweep.toFixed(4));

        // once the hero copy has faded away, it must not swallow taps meant for the video
        hero.classList.toggle("text-gone", open >= (phoneHero.matches ? 0.2 : 0.92));

        setPortalMessage(open);

        ticking = false;
      }

      function requestUpdate() {
        if (!ticking) {
          ticking = true;
          requestAnimationFrame(updateHero);
        }
      }

      window.addEventListener("scroll", requestUpdate, {
        passive: true
      });

      window.addEventListener("resize", requestUpdate);

      updateHero();
    }
  }


  /* ---------- SHOWCASE SLIDER ---------- */
  const showcase = document.querySelector(".showcase");

  if (showcase) {
    const slides = Array.from(showcase.querySelectorAll("[data-slide]"));
    const dots = Array.from(showcase.querySelectorAll(".show-dot"));
    const arrows = Array.from(showcase.querySelectorAll(".show-arrow"));
    const countEl = showcase.querySelector("#showCount");
    const labelEl = showcase.querySelector("#showLabel");

    const DURATION = 2000;   // ms per slide
    let current = 0;
    let timer = null;
    let inView = false;
    let hovering = false;

    showcase.style.setProperty("--dur", DURATION + "ms");

    function stop() {
      clearTimeout(timer);
      timer = null;
      showcase.classList.remove("is-playing");
    }

    function play() {
      stop();
      if (reduceMotion || !inView || hovering || document.hidden) return;

      void showcase.offsetWidth;                 // restart the dot fill animation
      showcase.classList.add("is-playing");
      timer = setTimeout(() => goTo(current + 1), DURATION);
    }

    function goTo(i) {
      current = (i + slides.length) % slides.length;

      slides.forEach((s, n) => {
        const active = n === current;
        s.classList.toggle("is-active", active);
        s.setAttribute("aria-hidden", String(!active));
      });

      dots.forEach((d, n) => {
        d.classList.toggle("is-active", n === current);
        if (n === current) d.setAttribute("aria-current", "true");
        else d.removeAttribute("aria-current");
      });

      countEl.textContent = String(current + 1).padStart(2, "0");
      labelEl.textContent = slides[current].dataset.label || "";

      play();
    }

    dots.forEach((d, n) => d.addEventListener("click", () => goTo(n)));
    arrows.forEach(a => a.addEventListener("click", () => goTo(current + Number(a.dataset.dir))));

    // keyboard
    showcase.addEventListener("keydown", e => {
      if (e.key === "ArrowLeft") goTo(current - 1);
      if (e.key === "ArrowRight") goTo(current + 1);
    });

    // swipe
    let touchX = null;
    showcase.addEventListener("touchstart", e => {
      touchX = e.changedTouches[0].clientX;
    }, { passive: true });

    showcase.addEventListener("touchend", e => {
      if (touchX === null) return;
      const dx = e.changedTouches[0].clientX - touchX;
      touchX = null;
      if (Math.abs(dx) > 50) goTo(current + (dx < 0 ? 1 : -1));
    }, { passive: true });

    // keyboard focus pauses it (accessibility); the mouse does NOT

    showcase.addEventListener("focusin", e => {
      if (e.target.matches(":focus-visible")) { hovering = true; stop(); }
    });
    showcase.addEventListener("focusout", () => { hovering = false; play(); });

    // only run while on screen and while the tab is open
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(entries => {
        inView = entries[0].isIntersecting;
        play();
      }, { threshold: 0.4 }).observe(showcase);
    } else {
      inView = true;
      play();
    }

    document.addEventListener("visibilitychange", play);
  }


  /* ---------- PORTFOLIO 3D TILT ---------- */
  if (
    !reduceMotion &&
    window.matchMedia("(hover:hover)").matches
  ) {

    document.querySelectorAll("[data-tilt]").forEach(tile => {

      const MAX = 7;

      tile.addEventListener("mousemove", e => {

        const r = tile.getBoundingClientRect();

        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;

        tile.style.transform =
          `perspective(1000px) rotateX(${(-py * MAX).toFixed(2)}deg) rotateY(${(px * MAX).toFixed(2)}deg) scale(1.02)`;

        tile.style.setProperty(
          "--gx",
          `${(px + 0.5) * 100}%`
        );

        tile.style.setProperty(
          "--gy",
          `${(py + 0.5) * 100}%`
        );
      });

      tile.addEventListener("mouseleave", () => {

        tile.style.transform =
          "perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)";

      });

    });
  }


  /* ---------- PORTFOLIO MOSAIC: STAGGERED POP-IN ---------- */
  const mosaic = document.querySelector(".mosaic");
  const shots = document.querySelectorAll(".shot");

  if (mosaic && shots.length) {

    if (reduceMotion || !("IntersectionObserver" in window)) {
      shots.forEach(el => el.classList.add("in"));

    } else {
      const shotIO = new IntersectionObserver(entries => {
        const cols = getComputedStyle(mosaic).gridTemplateColumns.split(" ").length;
        const colWidth = mosaic.clientWidth / cols;

        entries
          .filter(entry => entry.isIntersecting)
          .forEach((entry, n) => {
            const el = entry.target;
            const col = Math.round(el.offsetLeft / colWidth);

            // wave: left column first, then the next, each photo a beat behind
            el.style.transitionDelay = (col * 140 + n * 70) + "ms";
            el.classList.add("in");
            shotIO.unobserve(el);
          });
      }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });

      shots.forEach(el => shotIO.observe(el));
    }
  }


  /* ---------- SCROLL REVEAL ---------- */
  const reveals = document.querySelectorAll(".reveal");

  if ("IntersectionObserver" in window) {

    const io = new IntersectionObserver((entries) => {

      entries.forEach((entry, i) => {

        if (entry.isIntersecting) {

          const el = entry.target;

          setTimeout(() => {
            el.classList.add("in");
          }, i * 70);

          io.unobserve(el);
        }

      });

    }, {
      threshold: 0.12,
      rootMargin: "0px 0px -60px 0px"
    });

    reveals.forEach(el => io.observe(el));

  } else {

    reveals.forEach(el => el.classList.add("in"));

  }


  /* ---------- CONTACT FORM ----------
     No server involved: the form builds the message, then a small popup lets the
     visitor send it by email (mailto) or WhatsApp (wa.me). Both open pre-filled,
     and the visitor presses send in their own app. */
  const form = document.getElementById("contactForm");
  const status = document.getElementById("formStatus");
  const pick = document.getElementById("contactPick");

  if (form && status && pick) {
    const EMAIL = form.dataset.email || "";
    const WHATSAPP = (form.dataset.whatsapp || "").replace(/\D/g, "");
    const oneLine = s => (s || "").replace(/[\r\n]+/g, " ").trim();
    let pending = null;     // the message waiting for a choice
    let opener = null;      // the button to give focus back to

    form.addEventListener("input", e => {
      e.target.closest(".field")?.classList.remove("has-error");
    });

    form.querySelector(".form-again")?.addEventListener("click", () => {
      form.classList.remove("is-sent");
      status.textContent = "";
      form.querySelector("input[name=name]")?.focus();
    });

    function buildMessage(d) {
      const name = oneLine(d.name), company = oneLine(d.company);
      const lines = [
        "Hello Verrazzano & Grit,",
        "",
        "My name is " + name + (company ? " from " + company : "") + ".",
        "I'm interested in: " + oneLine(d.service),
        "Email: " + oneLine(d.email)
      ];
      if (oneLine(d.phone)) lines.push("Phone: " + oneLine(d.phone));
      lines.push("", (d.message || "").trim());
      return {
        subject: "New enquiry: " + oneLine(d.service) + " - " + name,
        body: lines.join("\n")
      };
    }

    function openPick() {
      opener = document.activeElement;
      pick.hidden = false;
      document.body.classList.add("pick-open");
      pick.querySelector("[data-pick]")?.focus();
    }
    function closePick() {
      pick.hidden = true;
      document.body.classList.remove("pick-open");
      if (opener && opener.focus) opener.focus();
    }

    function showSent(channel) {
      const title = form.querySelector("[data-sent-title]");
      const msg = form.querySelector("[data-sent-msg]");
      if (title) title.textContent = channel === "whatsapp" ? "Your WhatsApp chat is ready." : "Your email is ready.";
      if (msg) msg.textContent = channel === "whatsapp"
        ? "WhatsApp should have opened with your message filled in. Press send there to finish."
        : "Your email app should have opened with your message filled in. Press send there to finish.";
      form.classList.add("is-sent");
      form.querySelector(".form-sent")?.focus();
    }

    pick.querySelectorAll("[data-pick]").forEach(btn => {
      btn.addEventListener("click", () => {
        if (!pending) return;
        const channel = btn.dataset.pick;
        if (channel === "whatsapp") {
          window.open("https://wa.me/" + WHATSAPP + "?text=" + encodeURIComponent(pending.body), "_blank", "noopener");
        } else {
          const link = document.createElement("a");      // opens the visitor's own email app
          link.href = "mailto:" + EMAIL +
            "?subject=" + encodeURIComponent(pending.subject) +
            "&body=" + encodeURIComponent(pending.body.replace(/\n/g, "\r\n"));
          document.body.appendChild(link);
          link.click();
          link.remove();
        }
        // Fallbacks for visitors with no mail app set up (mailto does nothing for them)
        const gmail = form.querySelector("[data-gmail]");
        if (gmail) gmail.href = "https://mail.google.com/mail/?view=cm&fs=1&to=" + encodeURIComponent(EMAIL) +
          "&su=" + encodeURIComponent(pending.subject) + "&body=" + encodeURIComponent(pending.body);
        closePick();
        showSent(channel);
      });
    });

    form.querySelector("[data-copy]")?.addEventListener("click", async e => {
      e.preventDefault();
      if (!pending) return;
      const text = "To: " + EMAIL + "\nSubject: " + pending.subject + "\n\n" + pending.body;
      try { await navigator.clipboard.writeText(text); e.target.textContent = "copied, now paste it into an email"; }
      catch (_) { e.target.textContent = "copy failed, please write to " + EMAIL; }
    });

    pick.querySelector("[data-pick-close]")?.addEventListener("click", closePick);
    pick.addEventListener("click", e => { if (e.target === pick) closePick(); });
    document.addEventListener("keydown", e => {
      if (pick.hidden) return;
      if (e.key === "Escape") { closePick(); return; }
      if (e.key === "Tab") {            // keep keyboard focus inside the popup
        const items = Array.from(pick.querySelectorAll("button"));
        const first = items[0], last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });

    form.addEventListener("submit", e => {
      e.preventDefault();
      status.textContent = "";
      status.classList.remove("error");
      form.querySelectorAll(".field").forEach(f => f.classList.remove("has-error"));

      if (!form.checkValidity()) {
        form.querySelectorAll(":invalid").forEach(el => {
          el.closest(".field")?.classList.add("has-error");
        });
        status.textContent = "Please complete the highlighted fields.";
        status.classList.add("error");
        return;
      }

      const data = Object.fromEntries(new FormData(form).entries());
      if ((data.website || "").trim()) return;      // hidden spam trap: people never fill it

      pending = buildMessage(data);
      openPick();
    });
  }


  /* ---------- FOOTER YEAR ---------- */
  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

})();

/* ---------- SCROLL-DRIVEN PORTFOLIO GALLERY ---------- */
(function () {
  "use strict";
  const gallery = document.querySelector("[data-vg-gallery]");
  if (!gallery) return;
  const stage = gallery.querySelector(".vg-gallery-stage");
  const images = Array.from(gallery.querySelectorAll(".vg-gallery-image"));
  const caption = gallery.querySelector(".vg-gallery-caption");
  const title = gallery.querySelector("[data-vg-title]");
  const category = gallery.querySelector("[data-vg-category]");
  const current = gallery.querySelector("[data-vg-current]");
  const progress = gallery.querySelector("[data-vg-progress]");
  // captions are written in projects.py (HOME_GALLERY) and read from each slide
  const projects = images.map(el => ({
    title: el.dataset.title || "",
    category: el.dataset.category || ""
  }));
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const ease = t => t * t * (3 - 2 * t);
  let frame = 0;
  let boxes = null;

  function measure() {
    const w = stage.clientWidth;
    const h = stage.clientHeight;
    const mobile = w < 700;
    // On phones/tablets the fixed header is a solid bar over the top of the pinned
    // stage, so the tiles are laid out below it instead of being half hidden.
    const header = document.getElementById("header");
    const inset = w <= 820 && header ? Math.max(header.offsetHeight, 72) : 0;
    stage.style.setProperty("--vg-inset", inset + "px");
    const hh = h - inset;
    const margin = Math.max(14, w * (mobile ? .045 : .035));
    const centerW = w * (mobile ? .76 : .48);
    const centerH = hh * (mobile ? .48 : .57);
    const sideW = w * (mobile ? .25 : .145);
    const sideH = hh * (mobile ? .18 : .22);
    const topY = inset ? inset + margin + 26 : margin + 34;
    boxes = [
      { x: (w-centerW)/2, y: inset + (hh-centerH)/2, w: centerW, h: centerH },
      { x: margin, y: topY, w: sideW, h: sideH },
      { x: w-margin-sideW, y: topY, w: sideW, h: sideH },
      { x: margin, y: h-margin-sideH, w: sideW, h: sideH },
      { x: w-margin-sideW, y: h-margin-sideH, w: sideW, h: sideH }
    ];
    render();
  }

  function render() {
    frame = 0;
    const rect = gallery.getBoundingClientRect();
    const travel = Math.max(1, gallery.offsetHeight - stage.clientHeight);
    const raw = clamp(-rect.top / travel, 0, 1) * (images.length - 1);
    const step = Math.min(images.length - 2, Math.floor(raw));
    const t = raw >= images.length - 1 ? 1 : raw - step;
    const atEnd = raw >= images.length - 1;
    const active = atEnd ? images.length - 1 : step;
    const next = Math.min(images.length - 1, active + 1);
    const full = { x: 0, y: 0, w: stage.clientWidth, h: stage.clientHeight };
    const firstPhase = ease(clamp(t / .52, 0, 1));
    const secondPhase = ease(clamp((t - .52) / .48, 0, 1));
    const slots = images.map((_, j) => ((j - active + images.length) % images.length));

    images.forEach((el, j) => {
      const slot = slots[j];
      let r = boxes[Math.min(slot, 4)];
      let opacity = slot <= 4 ? 1 : 0;
      let z = slot === 0 ? 3 : 1;

      if (j === active) {
        r = atEnd ? full : (t < .52 ? interpolate(boxes[0], full, firstPhase) : interpolate(full, boxes[4], secondPhase));
        opacity = atEnd ? 1 : (t < .52 ? 1 : 1 - secondPhase);
        z = 4;
      } else if (j === next && !atEnd) {
        const nextSlot = boxes[1];
        r = t < .52 ? boxes[slot] : interpolate(nextSlot, full, secondPhase);
        opacity = t < .52 ? (slot <= 4 ? 1 : 0) : 1;
        z = t < .52 ? 1 : 5;
      } else {
        const nextSlotIndex = (slot + images.length - 1) % images.length;
        const target = boxes[Math.min(nextSlotIndex, 4)];
        if (t >= .52) r = interpolate(boxes[Math.min(slot, 4)], target, secondPhase);
        opacity = slot <= 4 ? 1 : 0;
      }
      el.style.width = r.w + "px";
      el.style.height = r.h + "px";
      el.style.transform = `translate3d(${r.x}px,${r.y}px,0)`;
      el.style.opacity = String(opacity);
      el.style.zIndex = String(z);
      el.classList.toggle("is-active", j === active);
    });

    const showCaption = t > .24 || atEnd;
    caption.classList.toggle("is-visible", showCaption);
    title.textContent = projects[active].title;
    category.textContent = projects[active].category;
    current.textContent = String(active + 1).padStart(2, "0");
    progress.style.width = (raw / (images.length - 1) * 100) + "%";
  }

  function interpolate(a, b, t) {
    return { x: lerp(a.x,b.x,t), y: lerp(a.y,b.y,t), w: lerp(a.w,b.w,t), h: lerp(a.h,b.h,t) };
  }
  function onScroll() {
    if (frame) return;
    frame = requestAnimationFrame(() => { render(); frame = 0; });
  }
  if (reduceMotion) {
    gallery.classList.add("vg-gallery-static");
    images.forEach((el, i) => {
      el.style.cssText = `position:relative;display:${i===0?'block':'none'};width:100%;height:70svh;opacity:1;transform:none;`;
    });
    caption.classList.add("is-visible");
    return;
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", measure, { passive: true });
  if ("ResizeObserver" in window) new ResizeObserver(measure).observe(stage);
  measure();

  /* ---------- SERVICES INDEX ---------- */
  (function () {
    const root = document.querySelector("[data-svc]");
    if (!root) return;
    const items = [...root.querySelectorAll("[data-svc-item]")];
    const imgs = [...root.querySelectorAll(".svc-media img")];
    const canHover = window.matchMedia("(hover: hover) and (min-width: 861px)");

    function activate(i, allowCollapse) {
      items.forEach((item, k) => {
        const on = k === i && !(allowCollapse && item.classList.contains("is-active"));
        item.classList.toggle("is-active", on);
        item.querySelector(".svc-head").setAttribute("aria-expanded", String(on));
      });
      imgs.forEach((img, k) => img.classList.toggle("is-active", k === i));
    }

    items.forEach((item, i) => {
      item.addEventListener("mouseenter", () => { if (canHover.matches) activate(i, false); });
      item.querySelector(".svc-head").addEventListener("click", () => activate(i, !canHover.matches));
    });
  })();

})();