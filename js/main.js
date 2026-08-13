document.documentElement.classList.add("js");

/* ============================================================
   MICS — main.js
   功能：Mobile Nav / Active Nav / Device Gallery / Reveal / Year
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {
  const siteHeader = document.querySelector(".site-header");
  const navToggle = document.querySelector(".nav-toggle");
  const primaryNav = document.querySelector(".primary-nav");
  const navLinks = [...document.querySelectorAll('.primary-nav a[href^="#"]')];
  const sections = navLinks.map((l) => document.querySelector(l.getAttribute("href"))).filter(Boolean);
  const yearElement = document.querySelector("#current-year");
  const isEnglish = document.documentElement.lang === "en";
  const openMenuLabel = isEnglish ? "Open navigation menu" : "打开导航菜单";
  const closeMenuLabel = isEnglish ? "Close navigation menu" : "关闭导航菜单";

  /* ---- Header scroll state ---- */
  if (siteHeader) {
    const updateHeaderState = () => siteHeader.classList.toggle("is-scrolled", window.scrollY > 12);
    window.addEventListener("scroll", updateHeaderState, { passive: true });
    updateHeaderState();
  }

  /* ---- Mobile navigation ---- */
  const closeNavigation = () => {
    if (!navToggle) return;
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.querySelector(".sr-only").textContent = openMenuLabel;
    document.body.classList.remove("nav-open");
  };

  if (navToggle && primaryNav) {
    navToggle.addEventListener("click", () => {
      const isOpen = navToggle.getAttribute("aria-expanded") === "true";
      navToggle.setAttribute("aria-expanded", String(!isOpen));
      navToggle.querySelector(".sr-only").textContent = isOpen ? openMenuLabel : closeMenuLabel;
      document.body.classList.toggle("nav-open", !isOpen);
    });
    navLinks.forEach((link) => link.addEventListener("click", closeNavigation));
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") { closeNavigation(); navToggle.focus(); }
    });
    window.addEventListener("resize", () => { if (window.innerWidth > 900) closeNavigation(); });
  }

  /* ---- Active anchor highlight ---- */
  if ("IntersectionObserver" in window && sections.length > 0) {
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        const visibleSection = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visibleSection) return;
        navLinks.forEach((link) => {
          const isCurrent = link.getAttribute("href") === `#${visibleSection.target.id}`;
          if (isCurrent) link.setAttribute("aria-current", "location");
          else link.removeAttribute("aria-current");
        });
      },
      { rootMargin: "-25% 0px -60%", threshold: [0, 0.15, 0.4] }
    );
    sections.forEach((section) => sectionObserver.observe(section));
  }

  /* ---- Year ---- */
  if (yearElement) yearElement.textContent = String(new Date().getFullYear());

  /* ---- Device gallery ---- */
  safelyInitialize(initDeviceGallery);

  /* ---- Scroll reveal ---- */
  if ("IntersectionObserver" in window && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const fadeElements = document.querySelectorAll(".fade-in-up");
    const fadeObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            fadeObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -10% 0px" }
    );
    document.documentElement.classList.add("reveal-enabled");
    fadeElements.forEach((el) => fadeObserver.observe(el));
  }

  /* ---- Platform side reveal ---- */
  safelyInitialize(initPlatformReveals);
});

function safelyInitialize(initializer) {
  try {
    initializer();
  } catch (error) {
    document.documentElement.classList.remove("reveal-enabled");
    console.error(`[MICS] ${initializer.name} failed.`, error);
  }
}

function initPlatformReveals() {
  const features = document.querySelectorAll(".platform-reveal");
  if (
    features.length === 0 ||
    !("IntersectionObserver" in window) ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.16, rootMargin: "0px 0px -8% 0px" }
  );

  features.forEach((feature) => observer.observe(feature));
}

/* ============================================================
   Device Gallery
   水平轨道 + Pointer Drag + Touch Swipe + Snap + Autoplay + Loop
   ============================================================ */
function initDeviceGallery() {
  const viewport = document.querySelector("[data-device-showcase]");
  if (!viewport) return;

  const track = viewport.querySelector("[data-device-track]");
  if (!track) return;
  const slides = [...track.querySelectorAll(".hero-device-slide")];
  const frame = viewport.closest(".hero-platform-frame");
  if (!frame) return;
  const captionIndex = frame.querySelector("[data-device-caption-index]");
  const captionName = frame.querySelector("[data-device-caption-name]");
  const captionSub = frame.querySelector("[data-device-caption-sub]");
  const indexLabel = frame.querySelector(".hero-device-index");
  const prevBtn = frame.querySelector("[data-device-prev]");
  const nextBtn = frame.querySelector("[data-device-next]");

  const realCount = 3; // 真实设备数量（不含 clone）
  if (slides.length < realCount + 2) return;

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const AUTOPLAY_MS = 5200;
  const RESUME_DELAY_MS = 2000;
  const SNAP_MS = 520;

  let realIndex = 0;
  let autoplayTimer = null;
  let resumeTimer = null;
  let isPointerPaused = false;
  let isDragging = false;
  let dragStartX = 0;
  let dragStartY = 0;
  let dragStartTime = 0;
  let dragDeltaX = 0;
  let dragMoved = false;

  const pad = (n) => String(n + 1).padStart(2, "0");
  const padTotal = (n) => String(n).padStart(2, "0");

  // track: [clone(03), 01, 02, 03, clone(01)]
  const positionFor = (realIdx) => -(realIdx + 1) * 100;

  function setTransform(percent, animate) {
    track.classList.toggle("is-animating", animate);
    track.style.transform = `translate3d(${percent}%, 0, 0)`;
  }

  function updateCaption() {
    const slide = slides[realIndex + 1];
    if (captionIndex) captionIndex.textContent = pad(realIndex);
    if (captionName) captionName.textContent = slide.dataset.deviceName || "";
    if (captionSub) captionSub.textContent = slide.dataset.deviceSub || "";
    if (indexLabel) indexLabel.textContent = `${pad(realIndex)} / ${padTotal(realCount)}`;
    slides.forEach((s, i) => s.setAttribute("aria-hidden", String(i !== realIndex + 1)));
  }

  function goTo(nextIndex, animate = true) {
    if (nextIndex < 0 || nextIndex >= realCount) return;
    realIndex = nextIndex;
    setTransform(positionFor(realIndex), animate);
    updateCaption();
  }

  function next() {
    if (realIndex === realCount - 1) {
      setTransform(positionFor(realCount), true); // slide into clone(01)
      window.setTimeout(() => {
        track.classList.remove("is-animating");
        track.style.transform = `translate3d(${positionFor(0)}%, 0, 0)`;
        realIndex = 0;
        updateCaption();
      }, SNAP_MS);
    } else {
      goTo(realIndex + 1);
    }
  }

  function prev() {
    if (realIndex === 0) {
      setTransform(0, true); // slide into clone(03)
      window.setTimeout(() => {
        track.classList.remove("is-animating");
        track.style.transform = `translate3d(${positionFor(realCount - 1)}%, 0, 0)`;
        realIndex = realCount - 1;
        updateCaption();
      }, SNAP_MS);
    } else {
      goTo(realIndex - 1);
    }
  }

  function stopAutoplay() {
    window.clearInterval(autoplayTimer);
    autoplayTimer = null;
  }

  function startAutoplay() {
    if (prefersReducedMotion || document.hidden || isPointerPaused || isDragging || autoplayTimer) return;
    autoplayTimer = window.setInterval(next, AUTOPLAY_MS);
  }

  function pauseForPointer() {
    isPointerPaused = true;
    stopAutoplay();
  }

  function resumeForPointer() {
    isPointerPaused = false;
    window.clearTimeout(resumeTimer);
    resumeTimer = window.setTimeout(startAutoplay, RESUME_DELAY_MS);
  }

  /* ---- Pointer drag / touch swipe ---- */
  function onPointerDown(e) {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    isDragging = true;
    dragMoved = false;
    dragStartX = e.clientX;
    dragStartY = e.clientY;
    dragStartTime = performance.now();
    dragDeltaX = 0;
    stopAutoplay();
    track.classList.remove("is-animating");
    viewport.setPointerCapture(e.pointerId);
    viewport.classList.add("is-dragging");
  }

  function onPointerMove(e) {
    if (!isDragging) return;
    const dx = e.clientX - dragStartX;
    const dy = e.clientY - dragStartY;
    if (!dragMoved && Math.abs(dx) < 4 && Math.abs(dy) < 4) return;
    if (!dragMoved && Math.abs(dy) > Math.abs(dx)) {
      // vertical scroll intent — release
      isDragging = false;
      viewport.classList.remove("is-dragging");
      if (viewport.hasPointerCapture(e.pointerId)) viewport.releasePointerCapture(e.pointerId);
      resumeForPointer();
      return;
    }
    dragMoved = true;
    dragDeltaX = dx;
    const pxPerPercent = viewport.offsetWidth / 100;
    setTransform(positionFor(realIndex) + dx / pxPerPercent, false);
  }

  function onPointerUp(e) {
    if (!isDragging) return;
    isDragging = false;
    viewport.classList.remove("is-dragging");
    if (viewport.hasPointerCapture(e.pointerId)) viewport.releasePointerCapture(e.pointerId);

    const width = viewport.offsetWidth;
    const dt = performance.now() - dragStartTime;
    const velocity = dt > 0 ? dragDeltaX / dt : 0;
    const threshold = width * 0.18;

    if (dragDeltaX < -threshold || velocity < -0.5) next();
    else if (dragDeltaX > threshold || velocity > 0.5) prev();
    else goTo(realIndex, true); // snap back

    resumeForPointer();
  }

  viewport.addEventListener("pointerdown", onPointerDown);
  viewport.addEventListener("pointermove", onPointerMove);
  viewport.addEventListener("pointerup", onPointerUp);
  viewport.addEventListener("pointercancel", onPointerUp);
  viewport.addEventListener("dragstart", (e) => e.preventDefault());

  if (prevBtn) prevBtn.addEventListener("click", () => { pauseForPointer(); prev(); resumeForPointer(); });
  if (nextBtn) nextBtn.addEventListener("click", () => { pauseForPointer(); next(); resumeForPointer(); });

  /* ---- Keyboard ---- */
  viewport.setAttribute("tabindex", "0");
  viewport.setAttribute("role", "region");
  viewport.setAttribute(
    "aria-label",
    document.documentElement.lang === "en" ? "Research platform device gallery" : "实验平台设备展示"
  );
  viewport.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight") { e.preventDefault(); pauseForPointer(); next(); resumeForPointer(); }
    else if (e.key === "ArrowLeft") { e.preventDefault(); pauseForPointer(); prev(); resumeForPointer(); }
  });

  /* ---- Hover pause ---- */
  viewport.addEventListener("mouseenter", pauseForPointer);
  viewport.addEventListener("mouseleave", resumeForPointer);

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stopAutoplay();
    else startAutoplay();
  });

  /* ---- Init ---- */
  goTo(0, false);
  startAutoplay();
}
