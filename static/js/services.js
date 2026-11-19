/* ============================================================
   SERVICES — accordion + sticky media
   Works on any .svc block (services page, homepage, etc.)
   ============================================================ */
(function () {
  "use strict";

  document.querySelectorAll(".svc").forEach(root => {
    const items = Array.from(root.querySelectorAll(".svc-item"));
    if (!items.length) return;

    const heads  = items.map(item => item.querySelector(".svc-head"));
    const media  = root.querySelector(".svc-media");
    const images = media ? Array.from(media.querySelectorAll("img")) : [];
    const label  = media ? media.querySelector(".svc-media-label") : null;

    function activate(index) {
      items.forEach((item, i) => {
        const on = i === index;
        item.classList.toggle("is-active", on);
        if (heads[i]) heads[i].setAttribute("aria-expanded", String(on));
      });

      images.forEach((img, i) => {
        img.classList.toggle("is-active", i === index);
      });

      if (label && heads[index] && heads[index].dataset.label) {
        label.textContent = heads[index].dataset.label;
      }
    }

    heads.forEach((head, i) => {
      if (!head) return;

      head.addEventListener("click", () => activate(i));

      // ARIA accordion pattern: arrow keys move focus between headers
      head.addEventListener("keydown", e => {
        let next = null;

        if (e.key === "ArrowDown" || e.key === "ArrowRight") next = (i + 1) % heads.length;
        else if (e.key === "ArrowUp" || e.key === "ArrowLeft") next = (i - 1 + heads.length) % heads.length;
        else if (e.key === "Home") next = 0;
        else if (e.key === "End")  next = heads.length - 1;

        if (next !== null) {
          e.preventDefault();
          if (heads[next]) heads[next].focus();
        }
      });
    });

    // graceful fallback if an image file is missing
    if (media && images.length) {
      const fail = img => {
        img.classList.add("is-failed");
        media.classList.add("is-missing");
      };

      images.forEach(img => {
        img.addEventListener("error", () => fail(img));
        if (img.complete && img.naturalWidth === 0) fail(img);
      });
    }

    // respect whichever item already has .is-active in the HTML
    const initial = Math.max(0, items.findIndex(it => it.classList.contains("is-active")));
    activate(initial);
  });
})();