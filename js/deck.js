(() => {
  const slides = [...document.querySelectorAll(".slide")];
  const countEl = document.getElementById("count");
  const titleEl = document.getElementById("slide-title");
  const prevBtn = document.getElementById("prev");
  const nextBtn = document.getElementById("next");
  const announce = document.getElementById("announcer");
  const stage = document.querySelector(".stage");
  const dotsEl = document.getElementById("dots");
  const progressBar = document.getElementById("deck-progress-bar");
  const crumbChapter = document.getElementById("crumb-chapter");
  const crumbTitle = document.getElementById("crumb-title");
  
  const overview = document.getElementById("overview");
  const overviewBtn = document.getElementById("overview-btn");
  const overviewClose = document.getElementById("overview-close");
  const overviewGrid = document.getElementById("overview-grid");
  
  const shortcutsBtn = document.getElementById("shortcuts-btn");
  const shortcutsModal = document.getElementById("shortcuts-modal");
  const shortcutsClose = document.getElementById("shortcuts-close");
  const fullscreenBtn = document.getElementById("fullscreen-btn");

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
  let shortcutsOpen = false;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const hasGsap = typeof gsap !== "undefined";

  /* —— Build Dots & Overview Grid —— */
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
    const chapterName = slide.dataset.chapter || `0${i + 1}`;
    card.innerHTML = `
      <span class="overview-num">${String(i + 1).padStart(2, "0")} · ${chapterName}</span>
      <span class="overview-label">${slide.dataset.title}</span>
    `;
    card.addEventListener("click", () => {
      closeOverview();
      show(i);
    });
    overviewGrid.appendChild(card);
  });

  const dots = [...dotsEl.querySelectorAll(".dot")];
  const overviewCards = [...overviewGrid.querySelectorAll(".overview-card")];

  function setChrome(i) {
    const total = slides.length;
    countEl.textContent = `${String(i + 1).padStart(2, "0")} / ${total}`;
    titleEl.textContent = slides[i].dataset.title;
    
    if (crumbChapter) {
      crumbChapter.textContent = slides[i].dataset.chapter || "Deck";
    }
    if (crumbTitle) {
      crumbTitle.textContent = slides[i].dataset.title;
    }
    
    if (progressBar) {
      const pct = Math.round(((i + 1) / total) * 100);
      progressBar.style.width = `${pct}%`;
      const progressContainer = document.getElementById("deck-progress");
      if (progressContainer) {
        progressContainer.setAttribute("aria-valuenow", String(pct));
      }
    }

    prevBtn.disabled = i === 0;
    const isLast = i === total - 1;
    const nextBtnText = nextBtn.querySelector("span:first-child");
    if (nextBtnText) {
      nextBtnText.textContent = isLast ? "Restart ↺" : "Next";
    } else {
      nextBtn.innerHTML = isLast ? `<span>Restart ↺</span>` : `<span>Next</span> <span class="kbd-hint">→</span>`;
    }

    announce.textContent = `Slide ${i + 1} of ${total}: ${slides[i].dataset.title}`;

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
        duration: 0.7,
        ease: "power2.out",
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

    // Instant/no-animation path
    if (instant || reduceMotion || !hasGsap) {
      slides.forEach((s, j) => {
        const isActive = j === target;
        s.classList.toggle("is-active", isActive);
        s.setAttribute("aria-hidden", String(!isActive));
        s.style.visibility = isActive ? "visible" : "hidden";
        s.style.opacity = isActive ? "1" : "0";
        s.style.transform = "none";
      });
      index = target;
      animating = false;
      animateCounters(incoming);
      if (window.NukaazoCharts) {
        window.NukaazoCharts.ensureIn(incoming);
      }
      window.scrollTo(0, 0);
      return;
    }

    animating = true;
    const goingForward = target > prev;

    slides.forEach((s, j) => {
      s.setAttribute("aria-hidden", String(j !== target));
    });

    // Kill any running animations on slides to prevent collision/stutter
    gsap.killTweensOf([outgoing, incoming]);

    // Pre-initialize incoming at opacity 0 BEFORE it appears on screen (fixes FOUC/flash)
    gsap.set(incoming, {
      opacity: 0,
      x: goingForward ? 24 : -24,
      visibility: "visible",
      zIndex: 3,
    });
    gsap.set(outgoing, {
      zIndex: 2,
    });

    incoming.classList.add("is-animating-in");
    outgoing.classList.add("is-animating-out");

    // Single cohesive timeline: outgoing smoothly slides/fades out, incoming glides in
    const tl = gsap.timeline({
      defaults: { ease: "power2.out" },
      onComplete: () => {
        outgoing.classList.remove("is-active", "is-animating-out");
        incoming.classList.remove("is-animating-in");
        incoming.classList.add("is-active");

        gsap.set(outgoing, {
          clearProps: "all",
          visibility: "hidden",
          opacity: 0,
        });
        gsap.set(incoming, {
          clearProps: "transform",
          opacity: 1,
          visibility: "visible",
        });

        index = target;
        animating = false;

        animateCounters(incoming);
        if (window.NukaazoCharts) {
          window.NukaazoCharts.ensureIn(incoming);
        }
        window.scrollTo(0, 0);
      },
    });

    tl.to(outgoing, { opacity: 0, x: goingForward ? -18 : 18, duration: 0.24 }, 0)
      .to(incoming, { opacity: 1, x: 0, duration: 0.28 }, 0.03);
  }

  /* —— Modals: Overview & Shortcuts —— */
  function openOverview() {
    closeShortcuts();
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

  function openShortcuts() {
    closeOverview();
    if (shortcutsModal) {
      shortcutsModal.hidden = false;
      shortcutsOpen = true;
      shortcutsClose.focus();
    }
  }

  function closeShortcuts() {
    if (shortcutsModal) {
      shortcutsModal.hidden = true;
      shortcutsOpen = false;
    }
  }

  /* —— Fullscreen Toggle —— */
  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      if (fullscreenBtn) {
        const text = fullscreenBtn.querySelector(".btn-text");
        if (text) text.textContent = "Exit";
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      if (fullscreenBtn) {
        const text = fullscreenBtn.querySelector(".btn-text");
        if (text) text.textContent = "Expand";
      }
    }
  }

  /* —— Event Listeners —— */
  prevBtn.addEventListener("click", () => show(index - 1));
  nextBtn.addEventListener("click", () =>
    show(index === slides.length - 1 ? 0 : index + 1)
  );

  const hotPrev = document.getElementById("hot-prev");
  const hotNext = document.getElementById("hot-next");
  if (hotPrev) hotPrev.addEventListener("click", () => show(index - 1));
  if (hotNext) hotNext.addEventListener("click", () => show(index === slides.length - 1 ? 0 : index + 1));

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

  if (shortcutsBtn) shortcutsBtn.addEventListener("click", () => (shortcutsOpen ? closeShortcuts() : openShortcuts()));
  if (shortcutsClose) shortcutsClose.addEventListener("click", closeShortcuts);
  if (shortcutsModal) {
    shortcutsModal.addEventListener("click", (e) => {
      if (e.target === shortcutsModal) closeShortcuts();
    });
  }

  if (fullscreenBtn) fullscreenBtn.addEventListener("click", toggleFullscreen);

  /* —— Print & PDF Preparation —— */
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

  const printBtn = document.getElementById("print");
  if (printBtn) {
    printBtn.addEventListener("click", async () => {
      await prepareChartsForPrint();
      window.print();
    });
  }

  window.addEventListener("beforeprint", () => {
    document.body.classList.add("preparing-print");
    if (window.NukaazoCharts) window.NukaazoCharts.buildAll({ animate: false });
  });

  window.addEventListener("afterprint", () => {
    document.body.classList.remove("preparing-print");
  });

  /* Headless / ?export=1 check */
  if (new URLSearchParams(location.search).has("export")) {
    document.body.classList.add("preparing-print", "is-exporting");
    const ready = async () => {
      await prepareChartsForPrint();
      document.documentElement.dataset.exportReady = "1";
    };
    if (document.readyState === "complete") ready();
    else window.addEventListener("load", ready);
  }

  /* —— Interactive Smartphone Concept Demo —— */
  const phoneCta = document.getElementById("phone-cta");
  const phoneStatus = document.getElementById("phone-status");
  const phoneGreet = document.getElementById("phone-greet");
  const demoPhone = document.getElementById("demo-phone");
  let phoneAccepted = false;

  function resetPhone() {
    phoneAccepted = false;
    if (phoneCta) {
      phoneCta.classList.remove("is-done");
      const text = phoneCta.querySelector("span:first-child");
      if (text) text.textContent = "Accept this order";
      else phoneCta.textContent = "Accept this order";
    }
    if (phoneStatus) phoneStatus.hidden = true;
    if (phoneGreet) phoneGreet.textContent = "Good morning, Asha 👋";
    if (demoPhone) demoPhone.classList.remove("is-accepted");
  }

  if (phoneCta) {
    phoneCta.addEventListener("click", (e) => {
      e.stopPropagation();
      if (phoneAccepted) {
        resetPhone();
        return;
      }
      phoneAccepted = true;
      phoneCta.classList.add("is-done");
      const text = phoneCta.querySelector("span:first-child");
      if (text) text.textContent = "Order Accepted ✓ (Tap to reset)";
      else phoneCta.textContent = "Order Accepted ✓ (Tap to reset)";

      if (phoneStatus) phoneStatus.hidden = false;
      if (phoneGreet) phoneGreet.textContent = "Order accepted! On it, Asha ✨";
      if (demoPhone) demoPhone.classList.add("is-accepted");

      if (hasGsap && !reduceMotion && phoneStatus) {
        gsap.fromTo(phoneStatus, { opacity: 0, y: 4 }, { opacity: 1, y: 0, duration: 0.25, ease: "power2.out" });
      }
    });
  }

  /* —— Keyboard Navigation —— */
  document.addEventListener("keydown", (e) => {
    if (e.altKey || e.metaKey || e.ctrlKey) return;
    const tag = document.activeElement?.tagName;
    if (["INPUT", "TEXTAREA", "SELECT"].includes(tag)) return;

    if (e.key === "Escape") {
      if (overviewOpen) {
        e.preventDefault();
        closeOverview();
        return;
      }
      if (shortcutsOpen) {
        e.preventDefault();
        closeShortcuts();
        return;
      }
    }

    if (overviewOpen || shortcutsOpen) return;

    if (e.key === "o" || e.key === "O") {
      e.preventDefault();
      openOverview();
      return;
    }

    if (e.key === "f" || e.key === "F") {
      e.preventDefault();
      toggleFullscreen();
      return;
    }

    if (e.key === "?" || e.key === "/") {
      e.preventDefault();
      openShortcuts();
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

  /* —— Touch Swipe Navigation —— */
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
      if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) {
        show(index + (dx < 0 ? 1 : -1));
      }
    },
    { passive: true }
  );

  /* —— Brand Logo Home Link —— */
  document.querySelector(".brand")?.addEventListener("click", (e) => {
    e.preventDefault();
    show(0);
  });

  /* —— Initial Slide Location Hash —— */
  const match = location.hash.match(/^#slide-(\d+)$/);
  const start = match ? Number(match[1]) - 1 : 0;
  show(start, { instant: true });
})();
