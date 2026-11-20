(() => {
  const slides = [...document.querySelectorAll(".slide")];
  const countEl = document.getElementById("count");
  const titleEl = document.getElementById("slide-title");
  const prevBtn = document.getElementById("prev");
  const nextBtn = document.getElementById("next");
  const announce = document.getElementById("announcer");
  const stage = document.querySelector(".stage");
  const dotsEl = document.getElementById("dots");
  const overview = document.getElementById("overview");
  const overviewBtn = document.getElementById("overview-btn");
  const overviewClose = document.getElementById("overview-close");
  const overviewGrid = document.getElementById("overview-grid");
  const chapterBtns = [...document.querySelectorAll("[data-chapter]")];

  const CHAPTER_BY_SLIDE = [
    null,
    "problem",
    "product",
    "product",
    "proof",
    "proof",
    "plan",
    "plan",
    "ask",
    "ask",
    null,
    null,
    null,
    null,
  ];

  let index = 0;
  let animating = false;
  let overviewOpen = false;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const hasGsap = typeof gsap !== "undefined";

  /* —— Build dots + overview —— */
  slides.forEach((slide, i) => {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.className = "dot";
    dot.setAttribute("role", "tab");
    dot.setAttribute("aria-label", `Slide ${i + 1}: ${slide.dataset.title}`);
    dot.addEventListener("click", () => show(i));
    dotsEl.appendChild(dot);

    const card = document.createElement("button");
    card.type = "button";
    card.className = "overview-card";
    card.innerHTML = `<span class="overview-num">${String(i + 1).padStart(2, "0")}</span><span class="overview-label">${slide.dataset.title}</span>`;
    card.addEventListener("click", () => {
      closeOverview();
      show(i);
    });
    overviewGrid.appendChild(card);
  });

  const dots = [...dotsEl.querySelectorAll(".dot")];
  const overviewCards = [...overviewGrid.querySelectorAll(".overview-card")];

  function setChrome(i) {
    countEl.textContent = `${String(i + 1).padStart(2, "0")} / ${slides.length}`;
    titleEl.textContent = slides[i].dataset.title;
    prevBtn.disabled = i === 0;
    nextBtn.textContent = i === slides.length - 1 ? "Start over ↺" : "Next →";
    announce.textContent = `Slide ${i + 1} of ${slides.length}: ${slides[i].dataset.title}`;

    dots.forEach((d, j) => {
      d.classList.toggle("is-active", j === i);
      d.classList.toggle("is-done", j < i);
      d.setAttribute("aria-selected", String(j === i));
    });

    overviewCards.forEach((c, j) => c.classList.toggle("is-active", j === i));

    const chapter = CHAPTER_BY_SLIDE[i];
    chapterBtns.forEach((btn) => {
      btn.classList.toggle("is-active", btn.dataset.chapter === chapter);
    });

    try {
      history.replaceState(null, "", `#slide-${i + 1}`);
    } catch (_) {
      /* ignore */
    }
  }

  function playReveals(slide, { animate = true } = {}) {
    const items = slide.querySelectorAll(".reveal");
    if (!items.length) return;

    if (!hasGsap || reduceMotion || !animate) {
      if (hasGsap) gsap.set(items, { clearProps: "opacity,transform" });
      items.forEach((el) => {
        el.style.opacity = "1";
        el.style.transform = "none";
      });
      return;
    }

    gsap.fromTo(
      items,
      { opacity: 0, y: 18 },
      {
        opacity: 1,
        y: 0,
        duration: 0.5,
        stagger: 0.06,
        ease: "power3.out",
        overwrite: "auto",
      }
    );
  }

  function animateCounters(slide) {
    const nodes = slide.querySelectorAll("[data-count]");
    nodes.forEach((el) => {
      const end = Number(el.dataset.count);
      const prefix = el.dataset.prefix || "";
      const suffix = el.dataset.suffix || "";
      if (Number.isNaN(end)) return;

      if (!hasGsap || reduceMotion) {
        el.textContent = `${prefix}${end}${suffix}`;
        return;
      }

      const state = { val: 0 };
      gsap.to(state, {
        val: end,
        duration: 1.05,
        ease: "power2.out",
        delay: 0.15,
        onUpdate: () => {
          el.textContent = `${prefix}${Math.round(state.val)}${suffix}`;
        },
      });
    });
  }

  function show(next, { instant = false } = {}) {
    const target = Math.max(0, Math.min(slides.length - 1, next));
    if (target === index && !instant && slides[target].classList.contains("is-active")) {
      return;
    }
    if (animating && !instant) return;

    const prev = index;
    const outgoing = slides[prev];
    const incoming = slides[target];

    setChrome(target);

    const afterShow = () => {
      playReveals(incoming, { animate: !instant });
      animateCounters(incoming);
      if (window.NukaazoCharts) {
        requestAnimationFrame(() => {
          window.NukaazoCharts.ensureIn(incoming);
          requestAnimationFrame(() => window.NukaazoCharts.ensureIn(incoming));
        });
      }
      window.scrollTo(0, 0);
    };

    if (instant || reduceMotion || !hasGsap) {
      slides.forEach((s, j) => {
        s.classList.toggle("is-active", j === target);
        s.setAttribute("aria-hidden", String(j !== target));
      });
      index = target;
      afterShow();
      return;
    }

    animating = true;
    const goingForward = target > prev;

    slides.forEach((s, j) => {
      s.setAttribute("aria-hidden", String(j !== target));
    });

    incoming.classList.add("is-active");

    const tl = gsap.timeline({
      defaults: { ease: "power2.inOut" },
      onComplete: () => {
        outgoing.classList.remove("is-active");
        gsap.set(outgoing, { clearProps: "opacity,transform" });
        gsap.set(incoming, { clearProps: "transform" });
        index = target;
        animating = false;
        afterShow();
      },
    });

    gsap.set(incoming, {
      opacity: 0,
      x: goingForward ? 40 : -40,
      zIndex: 3,
    });
    gsap.set(outgoing, { zIndex: 2 });

    tl.to(outgoing, { opacity: 0, x: goingForward ? -28 : 28, duration: 0.34 }, 0).to(
      incoming,
      { opacity: 1, x: 0, duration: 0.38 },
      0.05
    );
  }

  function openOverview() {
    overview.hidden = false;
    overviewOpen = true;
    overviewBtn.setAttribute("aria-expanded", "true");
    document.body.classList.add("overview-open");
    overviewClose.focus();
  }

  function closeOverview() {
    overview.hidden = true;
    overviewOpen = false;
    overviewBtn.setAttribute("aria-expanded", "false");
    document.body.classList.remove("overview-open");
  }

  /* —— Controls —— */
  prevBtn.addEventListener("click", () => show(index - 1));
  nextBtn.addEventListener("click", () =>
    show(index === slides.length - 1 ? 0 : index + 1)
  );
  document.getElementById("hot-prev").addEventListener("click", () => show(index - 1));
  document.getElementById("hot-next").addEventListener("click", () =>
    show(index === slides.length - 1 ? 0 : index + 1)
  );

  document.querySelectorAll("[data-jump]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const n = Number(btn.getAttribute("data-jump"));
      if (!Number.isNaN(n)) show(n - 1);
    });
  });

  overviewBtn.addEventListener("click", () => (overviewOpen ? closeOverview() : openOverview()));
  overviewClose.addEventListener("click", closeOverview);
  overview.addEventListener("click", (e) => {
    if (e.target === overview) closeOverview();
  });

  async function prepareChartsForPrint() {
    document.body.classList.add("preparing-print");
    if (window.NukaazoCharts) {
      window.NukaazoCharts.buildAll({ animate: false });
    }
    if (document.fonts?.ready) {
      try {
        await document.fonts.ready;
      } catch (_) {
        /* ignore */
      }
    }
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  }

  document.getElementById("print").addEventListener("click", async () => {
    await prepareChartsForPrint();
    window.print();
  });

  window.addEventListener("beforeprint", () => {
    document.body.classList.add("preparing-print");
    if (window.NukaazoCharts) window.NukaazoCharts.buildAll({ animate: false });
  });

  window.addEventListener("afterprint", () => {
    document.body.classList.remove("preparing-print");
  });

  /* Headless / ?export=1 — paint every chart before PDF capture */
  if (new URLSearchParams(location.search).has("export")) {
    document.body.classList.add("preparing-print", "is-exporting");
    const ready = async () => {
      await prepareChartsForPrint();
      document.documentElement.dataset.exportReady = "1";
    };
    if (document.readyState === "complete") ready();
    else window.addEventListener("load", ready);
  }

  /* —— Interactive phone demo —— */
  const phoneCta = document.getElementById("phone-cta");
  const phoneStatus = document.getElementById("phone-status");
  const phoneOrder = document.getElementById("phone-order");
  const phoneGreet = document.getElementById("phone-greet");
  let phoneAccepted = false;

  function resetPhone() {
    phoneAccepted = false;
    phoneCta.hidden = false;
    phoneCta.textContent = "Accept this order";
    phoneCta.classList.remove("is-done");
    phoneStatus.hidden = true;
    phoneOrder.innerHTML = "<b>New order #1042</b><span>₹540</span>";
    phoneGreet.textContent = "Good morning, Asha.";
    document.getElementById("demo-phone").classList.remove("is-accepted");
  }

  phoneCta.addEventListener("click", (e) => {
    e.stopPropagation();
    if (phoneAccepted) {
      resetPhone();
      return;
    }
    phoneAccepted = true;
    phoneCta.textContent = "Accepted ✓";
    phoneCta.classList.add("is-done");
    phoneStatus.hidden = false;
    phoneOrder.innerHTML = "<b>Order #1042</b><span>Preparing</span>";
    phoneGreet.textContent = "On it, Asha.";
    document.getElementById("demo-phone").classList.add("is-accepted");
    if (hasGsap && !reduceMotion) {
      gsap.fromTo(phoneStatus, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.35 });
    }
  });

  /* —— Keyboard —— */
  document.addEventListener("keydown", (e) => {
    if (e.altKey || e.metaKey || e.ctrlKey) return;
    const tag = document.activeElement?.tagName;
    if (["INPUT", "TEXTAREA", "SELECT"].includes(tag)) return;

    if (e.key === "Escape" && overviewOpen) {
      e.preventDefault();
      closeOverview();
      return;
    }

    if (overviewOpen) return;

    if (e.key === "o" || e.key === "O") {
      e.preventDefault();
      openOverview();
      return;
    }

    if (["ArrowRight", "PageDown", " "].includes(e.key)) {
      if (e.key === " " && ["BUTTON", "A"].includes(tag)) return;
      e.preventDefault();
      show(index === slides.length - 1 ? 0 : index + 1);
    } else if (["ArrowLeft", "PageUp"].includes(e.key)) {
      e.preventDefault();
      show(index - 1);
    } else if (e.key === "Home") {
      e.preventDefault();
      show(0);
    } else if (e.key === "End") {
      e.preventDefault();
      show(slides.length - 1);
    }
  });

  /* —— Swipe —— */
  let sx = 0;
  let sy = 0;
  stage.addEventListener(
    "touchstart",
    (e) => {
      sx = e.changedTouches[0].clientX;
      sy = e.changedTouches[0].clientY;
    },
    { passive: true }
  );
  stage.addEventListener(
    "touchend",
    (e) => {
      const dx = e.changedTouches[0].clientX - sx;
      const dy = e.changedTouches[0].clientY - sy;
      if (Math.abs(dx) > 70 && Math.abs(dx) > Math.abs(dy) * 1.5) {
        show(index + (dx < 0 ? 1 : -1));
      }
    },
    { passive: true }
  );

  /* —— Brand home —— */
  document.querySelector(".brand")?.addEventListener("click", (e) => {
    e.preventDefault();
    show(0);
  });

  const match = location.hash.match(/^#slide-(\d+)$/);
  const start = match ? Number(match[1]) - 1 : 0;
  show(start, { instant: true });
})();
