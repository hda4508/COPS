
/* =========================================================================
   메인 점멸(.main-dot) 인터랙션
   =======================================================================*/
(function () {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) return;

  const root = document.querySelector('.main-dot');
  if (!root) return;

  const dots = root.querySelectorAll('[class^="m-dot"]');

  dots.forEach(dot => {
    const svg = dot.querySelector('svg');
    let glow = '115,255,0';
    if (svg) {
      const redCircle = svg.querySelector('circle[fill="#FF0000"]');
      const yellowCircle = svg.querySelector('circle[fill="#FFD24B"]');
      if (redCircle) glow = '255,0,0';
      else if (yellowCircle) glow = '255,210,75';
    }
    dot.style.setProperty('--glow', glow);
    const baseScale = 0.98 + Math.random() * 0.06;
    dot.style.setProperty('--base-scale', baseScale.toFixed(3));
  });

  function twinkleOnce(el) {
    if (!el || el.classList.contains('twinkling')) return;
    const dur = 520 + Math.random() * 480;
    el.style.setProperty('--twinkle-dur', `${Math.round(dur)}ms`);
    el.classList.add('twinkling');
    setTimeout(() => el.classList.remove('twinkling'), dur);
  }

  let alive = false;
  let timerId = null;
  function loop() {
    if (!alive) return;
    const burst = 1 + Math.floor(Math.random() * 3);
    for (let i = 0; i < burst; i++) {
      const pick = dots[Math.floor(Math.random() * dots.length)];
      twinkleOnce(pick);
    }
    const next = 120 + Math.random() * 420;
    timerId = setTimeout(loop, next);
  }
  function start() { if (!alive) { alive = true; loop(); } }
  function stop()  { alive = false; if (timerId) { clearTimeout(timerId); timerId = null; } }

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) start();
      else stop();
    });
  }, { root: null, threshold: 0.1 });
  io.observe(root);

  root.addEventListener('pointerover', (e) => {
    const wrapper = e.target.closest('[class^="m-dot"]');
    if (wrapper) twinkleOnce(wrapper);
  });

  /* reinit: Top 후 재가동 */
  document.addEventListener('app:reinit', () => {
    root.querySelectorAll('.twinkling').forEach(el => el.classList.remove('twinkling'));
    stop();
    try { io.unobserve(root); } catch {}
    requestAnimationFrame(() => { try { io.observe(root); } catch {} });
  });
})();

/* =========================================================================
   Top 버튼: 해시 제거 + 맨 위 이동 + 재가동 트리거
   =======================================================================*/
(function () {
  const btn = document.getElementById('topBtn');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 30) btn.classList.add('is-show');
    else btn.classList.remove('is-show');
  });

  btn.addEventListener('click', (e) => {
    // Shift+클릭 시 완전 새로고침(해시 없이 경로 유지) — 선택 기능
    if (e.shiftKey) { location.replace(location.pathname + location.search); return; }
    e.preventDefault();
    resetAndGoTop();
  });

  function resetAndGoTop() {
    // 1) 해시(#)만 제거
    try { history.replaceState(null, '', location.pathname + location.search); }
    catch { history.replaceState(null, '', location.pathname); }

    // 2) 공통 상태 초기화(필요 클래스 제거)
    const resetClasses = ['is-active', 'is-visible', 'show', 'playing', 'expanded', 'active', 'fade-in', 'reveal-in', 'show-drop', 'show-persona', 'dimmed-service', 'is-service-hovering'];
    resetClasses.forEach(c => { document.querySelectorAll('.' + c).forEach(el => el.classList.remove(c)); });

    // 3) 모든 비디오 초기화
    document.querySelectorAll('video').forEach(v => {
      try { v.pause(); v.currentTime = 0; v.muted = true; v.removeAttribute('controls'); } catch {}
    });

    // 4) 특정 CSS 애니메이션 재시작
    restartCSSAnimations('.ekg-animated-svg, .ekg-highlight-line, [data-restart]');

    // 5) 맨 위 이동
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // 6) 맨 위 도착 후: 모듈 재가동
    waitUntilTop(() => {
      if (window.ScrollTrigger) { try { window.ScrollTrigger.refresh(true); } catch {} }
      jogScrollAndRetick();               // IO/스크롤 기반 트리거 재활성화
      document.dispatchEvent(new Event('app:reinit')); // 각 모듈이 이 이벤트를 받아 재바인딩
    });
  }

  function waitUntilTop(cb) {
    const check = () => { if (Math.abs(window.scrollY) <= 1) cb(); else requestAnimationFrame(check); };
    requestAnimationFrame(check);
  }

  function restartCSSAnimations(selector) {
    document.querySelectorAll(selector).forEach(el => {
      el.style.animation = 'none'; void el.offsetWidth; el.style.animation = '';
    });
  }

  function jogScrollAndRetick() {
    const y = window.scrollY;
    window.scrollTo(0, Math.max(1, y + 1));
    requestAnimationFrame(() => {
      window.scrollTo(0, 0);
      forceScrollTick(3, 16);
    });
  }
  function forceScrollTick(times = 2, delay = 0) {
    let n = 0;
    const tick = () => {
      window.dispatchEvent(new Event('scroll'));
      n++;
      if (n < times) (delay > 0) ? setTimeout(tick, delay) : requestAnimationFrame(tick);
    };
    tick();
  }
})();

/* =========================================================================
   메인 비디오 클릭 확대/축소
   =======================================================================*/
document.addEventListener("DOMContentLoaded", () => {
  const box = document.getElementById("videoBox");
  const video = document.getElementById("mainVideo");
  if (!box || !video) return;

  box.addEventListener("click", () => {
    if (!box.classList.contains("expanded")) {
      box.classList.add("expanded", "playing");
      video.play();
      document.body.classList.add("video-expanded");
      document.documentElement.style.overflow = "hidden";
    } else {
      video.pause();
      box.classList.remove("expanded", "playing");
      document.body.classList.remove("video-expanded");
      document.documentElement.style.overflow = "";
    }
  });

  video.addEventListener("ended", () => {
    box.classList.remove("expanded", "playing");
    document.body.classList.remove("video-expanded");
    document.documentElement.style.overflow = "";
  });

  // reinit: 초기상태로
  document.addEventListener('app:reinit', () => {
    try { video.pause(); video.currentTime = 0; } catch {}
    box.classList.remove("expanded", "playing");
    document.body.classList.remove("video-expanded");
    document.documentElement.style.overflow = "";
  });
});

/* =========================================================================
   실패 카드(.fail-card) 단순 등장
   =======================================================================*/
document.addEventListener("DOMContentLoaded", () => {
  const cards = document.querySelectorAll(".fail-card");
  if (!cards.length) return;

  let observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => { if (entry.isIntersecting) entry.target.classList.add("show"); });
  }, { threshold: 0.3 });

  cards.forEach(card => observer.observe(card));

  document.addEventListener('app:reinit', () => {
    cards.forEach(el => el.classList.remove('show'));
    try { observer.disconnect(); } catch {}
    observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => { if (entry.isIntersecting) entry.target.classList.add("show"); });
    }, { threshold: 0.3 });
    cards.forEach(card => observer.observe(card));
  });
});

/* =========================================================================
   그래프 순차 등장(seqReveal) 2곳
   =======================================================================*/
document.addEventListener("DOMContentLoaded", () => {
  function seqReveal({ graphSel, listSel, rootSel, dur = 900, valueDelay = 200, buffer = 60, threshold = 0.3 }) {
    const graphs = document.querySelectorAll(graphSel);
    if (!graphs.length) return;

    let io;
    const cb = (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const graph = entry.target;
        graph.classList.add("is-active");

        const root = rootSel ? graph.closest(rootSel) : document;
        const list = root ? root.querySelector(listSel) : null;
        const totalWait = dur + valueDelay + buffer;
        if (list) setTimeout(() => list.classList.add("is-reveal"), totalWait);

        io.unobserve(graph);
      });
    };

    const makeIO = () => new IntersectionObserver(cb, { threshold, rootMargin: "0px 0px -12% 0px" });
    io = makeIO();
    graphs.forEach((g) => io.observe(g));

    // reinit
    document.addEventListener('app:reinit', () => {
      graphs.forEach(g => g.classList.remove('is-active'));
      document.querySelectorAll(listSel).forEach(l => l.classList.remove('is-reveal'));
      try { io.disconnect(); } catch {}
      io = makeIO();
      graphs.forEach(g => io.observe(g));
    });
  }

  seqReveal({ graphSel: ".servey-first .graph", listSel: ".graph-card-list", rootSel: ".servey-first", dur: 900, valueDelay: 200, buffer: 60, threshold: 0.3 });
  seqReveal({ graphSel: ".second-graph-card-list-content #graph-2", listSel: ".second-graph-card-list", rootSel: ".second-graph-card-list-content", dur: 900, valueDelay: 200, buffer: 60, threshold: 0.3 });
});

/* =========================================================================
   servey-first (data-replay-scope)
   =======================================================================*/
document.addEventListener("DOMContentLoaded", () => {
  const scope = document.querySelector(".servey-first[data-replay-scope]");
  if (!scope) return;

  const graph = scope.querySelector("#graph-1");
  const list  = scope.querySelector("#graph-1-list");
  if (!graph && !list) return;

  let io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      const el = e.target;
      if (el === graph) graph.classList.add("is-active");
      if (el === list)  list.classList.add("show");
    });
  }, { root: null, threshold: 0.3 });

  if (graph) io.observe(graph);
  if (list)  io.observe(list);

  document.addEventListener('app:reinit', () => {
    graph && graph.classList.remove('is-active');
    list && list.classList.remove('show');
    try { io.disconnect(); } catch {}
    io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        const el = e.target;
        if (el === graph) graph.classList.add("is-active");
        if (el === list)  list.classList.add("show");
      });
    }, { root: null, threshold: 0.3 });
    if (graph) io.observe(graph);
    if (list)  io.observe(list);
  });
});

/* =========================================================================
   second-graph-card-list-content (data-replay-scope)
   =======================================================================*/
document.addEventListener("DOMContentLoaded", () => {
  const scope = document.querySelector(".second-graph-card-list-content[data-replay-scope]");
  if (!scope) return;
  const graph = scope.querySelector("#graph-2");
  const list  = scope.querySelector(".second-graph-card-list");
  if (!graph && !list) return;

  let io = new IntersectionObserver((ents) => {
    ents.forEach(e => {
      if (!e.isIntersecting) return;
      if (e.target === graph) graph.classList.add("is-active");
      if (e.target === list)  list.classList.add("show");
    });
  }, { threshold: 0.3 });

  if (graph) io.observe(graph);
  if (list)  io.observe(list);

  document.addEventListener('app:reinit', () => {
    graph && graph.classList.remove('is-active');
    list && list.classList.remove('show');
    try { io.disconnect(); } catch {}
    io = new IntersectionObserver((ents) => {
      ents.forEach(e => {
        if (!e.isIntersecting) return;
        if (e.target === graph) graph.classList.add("is-active");
        if (e.target === list)  list.classList.add("show");
      });
    }, { threshold: 0.3 });
    if (graph) io.observe(graph);
    if (list)  io.observe(list);
  });
});

/* =========================================================================
   Drop Line 1 & Gradient Title (fade-in)
   =======================================================================*/
document.addEventListener("DOMContentLoaded", () => {
  const targets = document.querySelectorAll(".drop-line-1, .gradient-title");
  if (!targets.length) return;

  let observer = new IntersectionObserver((entries, currentObserver) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("fade-in");
        currentObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  targets.forEach(t => observer.observe(t));

  document.addEventListener('app:reinit', () => {
    targets.forEach(t => t.classList.remove('fade-in'));
    try { observer.disconnect(); } catch {}
    observer = new IntersectionObserver((entries, currentObserver) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("fade-in");
          currentObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    targets.forEach(t => observer.observe(t));
  });
});

/* =========================================================================
   Key Insight (show-drop 순차)
   =======================================================================*/
document.addEventListener("DOMContentLoaded", () => {
  const mainSectionTarget = document.querySelector(".key-insight-section");
  const sequentialTargets = [
    document.querySelector(".drop-line-2"),
    document.querySelector(".insight"),
    document.querySelector(".insight-content")
  ].filter(Boolean);
  if (!mainSectionTarget || sequentialTargets.length < 3) return;

  const makeObserver = () => new IntersectionObserver((entries, currentObserver) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        sequentialTargets.forEach((target, index) => {
          const delay = index * 200;
          setTimeout(() => target.classList.add("show-drop"), delay);
        });
        currentObserver.unobserve(entry.target);
      }
    });
  }, { rootMargin: '0px 0px -200px 0px', threshold: 0.01 });

  let observer = makeObserver();
  observer.observe(mainSectionTarget);

  document.addEventListener('app:reinit', () => {
    sequentialTargets.forEach(t => t.classList.remove('show-drop'));
    try { observer.disconnect(); } catch {}
    observer = makeObserver();
    observer.observe(mainSectionTarget);
  });
});

/* =========================================================================
   Persona 섹션 (show-persona)
   =======================================================================*/
document.addEventListener("DOMContentLoaded", () => {
  const allTargetLines = document.querySelectorAll(".persona-line");
  const allTargetBoxes = document.querySelectorAll(".persona-box");
  if (!allTargetLines.length || allTargetLines.length !== allTargetBoxes.length) return;

  const makeObserver = () => new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const idx = [...allTargetLines].indexOf(entry.target);
        if (idx >= 0) {
          const targetLine = allTargetLines[idx];
          const targetBox  = allTargetBoxes[idx];
          targetLine.classList.add("show-persona");
          setTimeout(() => targetBox.classList.add("show-persona"), 400);
        }
      }
    });
  }, { rootMargin: '0px 0px -50px 0px', threshold: 0.1 });

  let observer = makeObserver();
  allTargetLines.forEach(t => observer.observe(t));

  document.addEventListener('app:reinit', () => {
    document.querySelectorAll('.show-persona').forEach(el => el.classList.remove('show-persona'));
    try { observer.disconnect(); } catch {}
    observer = makeObserver();
    allTargetLines.forEach(t => observer.observe(t));
  });
});

/* =========================================================================
   Service Box 호버
   =======================================================================*/
document.addEventListener("DOMContentLoaded", () => {
  const serviceBoxes = document.querySelectorAll(".service-box");
  const serviceContainer = document.querySelector(".service-boxs");
  if (!serviceBoxes.length || !serviceContainer) return;

  serviceBoxes.forEach(box => {
    box.addEventListener('mouseenter', () => {
      serviceContainer.classList.add('is-service-hovering');
      serviceBoxes.forEach(otherBox => otherBox.classList.add('dimmed-service'));
      box.classList.remove('dimmed-service');
    });
    box.addEventListener('mouseleave', () => {
      serviceContainer.classList.remove('is-service-hovering');
      serviceBoxes.forEach(otherBox => otherBox.classList.remove('dimmed-service'));
    });
  });

  document.addEventListener('app:reinit', () => {
    serviceContainer.classList.remove('is-service-hovering');
    serviceBoxes.forEach(b => b.classList.remove('dimmed-service'));
  });
});

/* =========================================================================
   Onboarding (#Service) — 라인/텍스트/비디오 순차
   =======================================================================*/
document.addEventListener("DOMContentLoaded", () => {
  const section = document.querySelector("#Service");
  if (!section) return;

  const lineBoxes = [
    section.querySelector(".onboarding-line1"),
    section.querySelector(".onboarding-line2"),
    section.querySelector(".onboarding-line3"),
  ].filter(Boolean);

  const stepTexts = Array.from(section.querySelectorAll(".onboarding-step .step"));
  const videos = Array.from(section.querySelectorAll(".onboarding-content-sub video"));

  const rateMap = new Map([
    [".onboarding-sub1", 3.0],
    [".onboarding-sub2", 7.0],
    [".onboarding-sub3", 1.7],
  ]);

  (function ensureLineCSS() {
    const css = `
      .onboarding-line1,.onboarding-line2,.onboarding-line3{width:0;height:2px;overflow:hidden;transition:width 700ms ease;will-change:width;}
      .onboarding-line1 svg,.onboarding-line2 svg,.onboarding-line3 svg{display:block;width:100%;height:2px;}
      .onboarding-step .step{opacity:0;transform:translateY(8px);transition:.42s ease}
      .onboarding-step .step.show{opacity:1;transform:none}
    `;
    if (!document.querySelector('style[data-onboarding-style]')) {
      const tag = document.createElement("style");
      tag.setAttribute("data-onboarding-style", "true");
      tag.textContent = css;
      document.head.appendChild(tag);
    }
  })();

  const initState = () => {
    stepTexts.forEach(s => s.classList.remove("show"));
    videos.forEach(v => {
      v.classList.remove("active", "playing");
      try { v.pause(); } catch {}
      try { v.currentTime = 0; } catch {}
      v.muted = true;
      v.setAttribute("muted", "");
      v.playsInline = true;
      v.setAttribute("playsinline", "");
      v.setAttribute("autoplay", "");
      v.preload = "auto";
      for (const [sel, r] of rateMap) { if (v.matches(sel)) { v.playbackRate = r; break; } }
    });
    lineBoxes.forEach(b => { if (b) b.style.width = "0px"; });
  };
  initState();

  const getTargetWidth = (box) => {
    const dw = parseFloat(box?.dataset?.width);
    if (!Number.isNaN(dw) && dw > 0) return dw;
    const svg = box?.querySelector("svg");
    const wAttr = parseFloat(svg?.getAttribute("width"));
    if (!Number.isNaN(wAttr) && wAttr > 0) return wAttr;
    const vb = svg?.getAttribute("viewBox");
    if (vb) {
      const p = vb.split(/\s+/).map(Number);
      if (p.length === 4 && p[2] > 0) return p[2];
    }
    return Math.max(0, Math.round(box?.scrollWidth || 0));
  };

  let targetWidths = [];
  const measureTargets = () => { targetWidths = lineBoxes.map(getTargetWidth); };
  measureTargets();

  if (document.fonts && document.fonts.ready) { document.fonts.ready.then(measureTargets); }
  window.addEventListener("resize", debounce(() => {
    const before = targetWidths.join(",");
    measureTargets();
    if (targetWidths.join(",") !== before && !running) {
      lineBoxes.forEach(b => { if (b) b.style.width = "0px"; });
    }
  }, 120));
  window.addEventListener("orientationchange", () => setTimeout(() => {
    measureTargets();
    lineBoxes.forEach(b => { if (b) b.style.width = "0px"; });
  }, 150));
  function debounce(fn, wait){ let t; return (...a)=>{ clearTimeout(t); t=setTimeout(()=>fn(...a), wait); }; }

  const drawLine = (i) => new Promise(res => {
    const box = lineBoxes[i], w = targetWidths[i];
    if (!box || !w) return res();
    requestAnimationFrame(() => { box.style.width = w + "px"; setTimeout(res, 750); });
  });
  const revealStep = (i) => new Promise(res => { const s = stepTexts[i]; if (!s) return res(); s.classList.add("show"); setTimeout(res, 420); });
  const playVideo = (i) => new Promise(async (res) => {
    const v = videos[i]; if (!v) return res();
    v.classList.add("active");
    if (v.readyState < 1) await new Promise(r => { const onMeta = () => { v.removeEventListener("loadedmetadata", onMeta); r(); }; v.addEventListener("loadedmetadata", onMeta); setTimeout(()=>{ v.removeEventListener("loadedmetadata", onMeta); r(); },1500); });
    if (v.readyState < 2) await new Promise(r => { const onReady = () => { v.removeEventListener("loadeddata", onReady); r(); }; v.addEventListener("loadeddata", onReady); setTimeout(()=>{ v.removeEventListener("loadeddata", onReady); r(); },1500); });
    for (const [sel, r] of rateMap) { if (v.matches(sel)) { v.playbackRate = r; break; } }
    try { v.currentTime = 0; } catch {}
    v.classList.add("playing");

    const tryPlay = () => v.play();
    let endedListener;
    const endedP = new Promise(r => { endedListener = () => { v.classList.remove("playing"); r("ended"); }; v.addEventListener("ended", endedListener, { once: true }); });
    const expected = (v.duration && isFinite(v.duration)) ? (v.duration / (v.playbackRate || 1)) : 6;
    const timeoutMs = Math.max(1200, Math.floor(expected * 1000) + 400);
    const timeoutP = new Promise(r => setTimeout(() => r("timeout"), timeoutMs));

    let kicked = false;
    const kick = (e) => { if (!section.contains(e.target)) return; if (kicked) return; kicked = true; tryPlay().catch(()=>{}).finally(() => { section.removeEventListener("click", kick, true); }); };
    section.addEventListener("click", kick, true);

    try { await tryPlay(); } catch {}
    const result = await Promise.race([endedP, timeoutP]);
    section.removeEventListener("click", kick, true);
    if (result === "timeout" && endedListener) {
      v.classList.remove("playing");
      v.removeEventListener("ended", endedListener);
    }
    res();
  });

  let running = false;
  let finished = false;
  const resetAll = () => { running = false; finished = false; initState(); };

  const run = async () => {
    if (running || finished) return;
    running = true;
    try {
      await drawLine(0); await revealStep(0); await playVideo(0);
      await drawLine(1); await revealStep(1); await playVideo(1);
      await drawLine(2); await revealStep(2); await playVideo(2);
      finished = true;
    } finally { running = false; }
  };

  const getIOOptions = () => {
    const vm = Math.round(window.innerHeight * 0.25);
    return { root: null, threshold: 0.2, rootMargin: `-${vm}px 0px -${vm}px 0px` };
  };

  let io = new IntersectionObserver(handleIO, getIOOptions());
  function handleIO(entries){
    entries.forEach(e => {
      if (e.target !== section) return;
      if (e.isIntersecting) run();
      else resetAll();
    });
  }
  io.observe(section);

  window.addEventListener("resize", debounce(() => {
    const newOpts = getIOOptions();
    io.disconnect();
    io = new IntersectionObserver(handleIO, newOpts);
    io.observe(section);
  }, 150));

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible" && !finished) run();
  });

  // reinit
  document.addEventListener('app:reinit', () => { resetAll(); /* io는 살아있으므로 재측정만 필요 시 수행됨 */ });
});

/* =========================================================================
   Design system — line-box (버전 1)
   =======================================================================*/
document.addEventListener("DOMContentLoaded", () => {
  const box = document.querySelector(".line-box");
  if (!box) return;

  const svgWrap = box.querySelector(".line-box-line");
  const imgWrap = box.querySelector(".line-box-img");
  const linesAll = Array.from(svgWrap.querySelectorAll("line"));
  const horizontals = []; const verticals = [];

  linesAll.forEach(line => {
    const y1 = parseFloat(line.getAttribute("y1"));
    const y2 = parseFloat(line.getAttribute("y2"));
    const len = line.getTotalLength();
    line._len = len;
    line.style.strokeDasharray = len;
    line.style.strokeDashoffset = len;
    if (!Number.isNaN(y1) && !Number.isNaN(y2) && y1 === y2) horizontals.push(line);
    else verticals.push(line);
  });

  const drawGroup = (lines, duration = 900) => new Promise(resolve => {
    requestAnimationFrame(() => {
      lines.forEach(l => l.style.strokeDashoffset = 0);
      setTimeout(resolve, duration + 50);
    });
  });
  const revealImage = () => new Promise(resolve => { imgWrap.classList.add("show"); setTimeout(resolve, 700); });

  const runSequence = async () => { await drawGroup(horizontals, 900); await drawGroup(verticals, 900); await revealImage(); };

  let played = false;
  let io = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !played) {
        played = true;
        runSequence().finally(() => obs.unobserve(entry.target));
      }
    });
  }, { threshold: 0.7 });
  io.observe(box);

  // reinit
  document.addEventListener('app:reinit', () => {
    played = false;
    linesAll.forEach(l => { if (typeof l._len === 'number') { l.style.strokeDasharray = l._len; l.style.strokeDashoffset = l._len; } });
    imgWrap && imgWrap.classList.remove('show');
    try { io.disconnect(); } catch {}
    io.observe(box);
  });
});

/* =========================================================================
   Design system — line-box (버전 2 + 텍스트/이미지 reveal)
   =======================================================================*/
document.addEventListener("DOMContentLoaded", () => {
  const box = document.querySelector(".line-box");
  if (!box) return;

  const svgWrap = box.querySelector(".line-box-line");
  const imgWrap = box.querySelector(".line-box-img");
  const linesAll = Array.from(svgWrap.querySelectorAll("line"));
  const horizontals = []; const verticals = [];

  const systemText = document.querySelector(".system-text");
  const designImgBox = document.querySelector(".design-img-box");

  [systemText, designImgBox].forEach(el => { if (el) el.classList.add("reveal-init"); });

  linesAll.forEach(line => {
    const y1 = parseFloat(line.getAttribute("y1"));
    const y2 = parseFloat(line.getAttribute("y2"));
    const len = line.getTotalLength();
    line._len = len;
    line.style.strokeDasharray = len;
    line.style.strokeDashoffset = len;
    if (!Number.isNaN(y1) && !Number.isNaN(y2) && y1 === y2) horizontals.push(line);
    else verticals.push(line);
  });

  const drawGroup = (lines, duration = 900) => new Promise(resolve => {
    requestAnimationFrame(() => { lines.forEach(l => (l.style.strokeDashoffset = 0)); setTimeout(resolve, duration + 50); });
  });
  const revealLogo = () => new Promise(resolve => { imgWrap.classList.add("show"); setTimeout(resolve, 700); });
  const revealSystemText = () => new Promise(resolve => { if (systemText) systemText.classList.add("reveal-in"); setTimeout(resolve, 500); });
  const revealDesignBox = () => new Promise(resolve => { if (designImgBox) designImgBox.classList.add("reveal-in"); setTimeout(resolve, 500); });

  const runSequence = async () => {
    await drawGroup(horizontals, 900);
    await drawGroup(verticals, 900);
    await revealLogo();
    await revealSystemText();
    await revealDesignBox();
  };

  let played = false;
  let io = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !played) {
        played = true;
        runSequence().finally(() => obs.unobserve(entry.target));
      }
    });
  }, { threshold: 0.7 });
  io.observe(box);

  // reinit
  document.addEventListener('app:reinit', () => {
    linesAll.forEach(l => { if (typeof l._len === 'number') { l.style.strokeDasharray = l._len; l.style.strokeDashoffset = l._len; } });
    if (imgWrap) imgWrap.classList.remove('show');
    if (systemText) systemText.classList.remove('reveal-in');
    if (designImgBox) designImgBox.classList.remove('reveal-in');
    [systemText, designImgBox].forEach(el => { if (el && !el.classList.contains('reveal-init')) el.classList.add('reveal-init'); });

    document.querySelectorAll('.reveal-in').forEach(el => el.classList.remove('reveal-in'));
    played = false;
    try { io.disconnect(); } catch {}
    io.observe(box);
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const fontSystem = document.querySelector(".font-system");
  if (!fontSystem) return;

  // 촤르륵 대상들 수집 (네가 쓰는 클래스 그대로 유지)
  const targets = [];
  const leftTitle = document.querySelector(".font-color");
  const leftSub   = document.querySelector(".system-subtext");
  const leftMain  = document.querySelector(".system-main");
  if (leftTitle) targets.push(leftTitle);
  if (leftSub)   targets.push(leftSub);
  if (leftMain)  targets.push(leftMain);

  targets.push(
    ...document.querySelectorAll(".font-content1 .system-content1, .font-content1 .system-content2, .font-content1 .system-content3, .font-content1 .system-content4, .font-content1 .system-content5")
  );
  targets.push(
    ...document.querySelectorAll(".font-content2 .system-content6, .font-content2 .system-content7, .font-content2 .system-content8, .font-content2 .system-content9, .font-content2 .system-content10")
  );

  const colorTitle = document.querySelector(".font-color2");
  if (colorTitle) targets.push(colorTitle);
  targets.push(
    ...document.querySelectorAll(".cops-color1, .cops-color2, .cops-color3, .cops-color4")
  );
  targets.push(
    ...document.querySelectorAll(".color7-1, .color7-2, .color7-3, .color7-4, .color7-5, .color7-6, .color7-7")
  );

  // 초기 상태(숨김)
  const setInit = () => {
    targets.forEach(el => {
      el.classList.remove("reveal-in");
      el.classList.add("reveal-init");
      el.style.transitionDelay = ""; // 지연 초기화
    });
  };
  setInit();

  const staggerIn = (elements, baseDelay = 80) => {
    elements.forEach((el, i) => {
      el.style.transitionDelay = `${i * baseDelay}ms`;
      el.classList.add("reveal-in");
    });
  };

  const makeObserver = () =>
    new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        staggerIn(targets, 80);
        obs.unobserve(entry.target);
      });
    }, { threshold: 0.25 });

  let io = makeObserver();
  io.observe(fontSystem);

  // Top 클릭 후 재시동
  document.addEventListener("app:reinit", () => {
    setInit();
    try { io.disconnect(); } catch {}
    io = makeObserver();
    io.observe(fontSystem);
  });
});