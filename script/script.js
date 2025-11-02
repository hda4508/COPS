 // 메인 인터렉션
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

    function start() {
      if (alive) return;
      alive = true;
      loop();
    }

    function stop() {
      alive = false;
      if (timerId) {
        clearTimeout(timerId);
        timerId = null;
      }
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) start();
          else stop();
        });
      },
      {
        root: null,
        threshold: 0.1
      }
    );
    io.observe(root);

    root.addEventListener('pointerover', (e) => {
      const wrapper = e.target.closest('[class^="m-dot"]');
      if (wrapper) twinkleOnce(wrapper);
    });

  })();


  // 네비 부드럽게
  (function () {
      const btn = document.getElementById('topBtn');

      window.addEventListener('scroll', () => {
        if (window.scrollY > 30) btn.classList.add('is-show');
        else btn.classList.remove('is-show');
      });

      btn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    })();

// 메인 비디오 재생
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
});


// 첫 번째, 세 번째 카드는 위에서 아래로
// 두 번째 카드는 아래에서 위로 > css 에서 추가 작성

document.addEventListener("DOMContentLoaded", () => {
    const cards = document.querySelectorAll(".fail-card");

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("show");
                }
            });
        }, {
            threshold: 0.3
        }
    );

    cards.forEach((card) => observer.observe(card));
});


document.addEventListener("DOMContentLoaded", () => {
    function seqReveal({
        graphSel,
        listSel,
        rootSel,
        dur = 900,
        valueDelay = 200,
        buffer = 60,
        threshold = 0.3
    }) {
        const graphs = document.querySelectorAll(graphSel);
        if (!graphs.length) return;

        const io = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;

                const graph = entry.target;
                graph.classList.add("is-active");

                const root = rootSel ? graph.closest(rootSel) : document;
                const list = root ? root.querySelector(listSel) : null;

                const totalWait = dur + valueDelay + buffer;
                if (list) {
                    setTimeout(() => {
                        list.classList.add("is-reveal");
                    }, totalWait);
                }

                io.unobserve(graph);
            });
        }, {
            threshold,
            rootMargin: "0px 0px -12% 0px"
        });

        graphs.forEach((g) => io.observe(g));
    }

    seqReveal({
        graphSel: ".servey-first .graph",
        listSel: ".graph-card-list",
        rootSel: ".servey-first",
        dur: 900,
        valueDelay: 200,
        buffer: 60,
        threshold: 0.3
    });

    seqReveal({
        graphSel: ".second-graph-card-list-content #graph-2",
        listSel: ".second-graph-card-list",
        rootSel: ".second-graph-card-list-content",
        dur: 900,
        valueDelay: 200,
        buffer: 60,
        threshold: 0.3
    });
});

document.addEventListener("DOMContentLoaded", () => {
  const scope = document.querySelector(".servey-first[data-replay-scope]");
  if (!scope) return;

  const graph = scope.querySelector("#graph-1");
  const list  = scope.querySelector("#graph-1-list");

  const io = new IntersectionObserver((entries) => {
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


document.addEventListener("DOMContentLoaded", () => {
  const scope = document.querySelector(".second-graph-card-list-content[data-replay-scope]");
  if (!scope) return;
  const graph = scope.querySelector("#graph-2");
  const list  = scope.querySelector(".second-graph-card-list");

  const io = new IntersectionObserver((ents) => {
    ents.forEach(e => {
      if (!e.isIntersecting) return;
      if (e.target === graph) graph.classList.add("is-active");
      if (e.target === list)  list.classList.add("show");
    });
  }, { threshold: 0.3 });

  if (graph) io.observe(graph);
  if (list)  io.observe(list);
});


// -----------------------------------------------------------------------------------
// Drop Line 1 & Gradient Title 
// -----------------------------------------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
    const targets = document.querySelectorAll(".drop-line-1, .gradient-title");

    if (targets.length === 0) {
        return;
    }

    const observer = new IntersectionObserver(
        (entries, currentObserver) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("fade-in");
                    currentObserver.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1
        }
    );

    targets.forEach((target) => observer.observe(target));
});


// -----------------------------------------------------------------------------------
// Key Insight 
// -----------------------------------------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {

    const mainSectionTarget = document.querySelector(".key-insight-section");


    const sequentialTargets = [
        document.querySelector(".drop-line-2"),
        document.querySelector(".insight"),
        document.querySelector(".insight-content")
    ].filter(el => el !== null);

    if (!mainSectionTarget || sequentialTargets.length < 3) {
        console.warn("순차 등장 요소: 부모 섹션(.key-insight-section) 또는 자식 요소(.drop-line-2 등)를 찾을 수 없습니다. 클래스명을 확인해 주세요.");
        return;
    }

    const observer = new IntersectionObserver(
        (entries, currentObserver) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {

                    sequentialTargets.forEach((target, index) => {
                        const delay = index * 200;
                        setTimeout(() => {
                            target.classList.add("show-drop");
                        }, delay);
                    });

                    currentObserver.unobserve(entry.target);
                }
            });
        }, {
            rootMargin: '0px 0px -200px 0px',
            threshold: 0.01
        }
    );


    observer.observe(mainSectionTarget);
});


// -----------------------------------------------------------------------------------
//  Persona 섹션 
// -----------------------------------------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
  const allTargetLines = document.querySelectorAll(".persona-line");
  const allTargetBoxes = document.querySelectorAll(".persona-box");

  if (allTargetLines.length === 0 || allTargetLines.length !== allTargetBoxes.length) {
    console.warn("Persona 순차 등장: Line/Box 요소의 개수가 일치하지 않거나 요소를 찾을 수 없습니다.");
    return;
  }

  allTargetLines.forEach((targetLine, index) => {
    const targetBox = allTargetBoxes[index];

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          targetLine.classList.add("show-persona");
          setTimeout(() => targetBox.classList.add("show-persona"), 400);
        }
      });
    }, {
      rootMargin: '0px 0px -50px 0px',
      threshold: 0.1
    });

    observer.observe(targetLine);
  });
});


// -----------------------------------------------------------------------------------
//  Service Box 호버
// -----------------------------------------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
    const serviceBoxes = document.querySelectorAll(".service-box");
    const serviceContainer = document.querySelector(".service-boxs");

    if (!serviceBoxes.length || !serviceContainer) {
        console.warn("Service Box 호버 인터랙션: .service-box 또는 부모 컨테이너를 찾을 수 없습니다.");
        return;
    }


    serviceBoxes.forEach(box => {
        box.addEventListener('mouseenter', () => {
            serviceContainer.classList.add('is-service-hovering');

            serviceBoxes.forEach(otherBox => {
                otherBox.classList.add('dimmed-service');
            });

            box.classList.remove('dimmed-service');
        });


        box.addEventListener('mouseleave', () => {
            serviceContainer.classList.remove('is-service-hovering');
            serviceBoxes.forEach(otherBox => {
                otherBox.classList.remove('dimmed-service');
            });
        });
    });
});

/// Onboarding 부분

document.addEventListener("DOMContentLoaded", () => {
  const section = document.querySelector("#Service"); // ★ 여기!
  if (!section) {
    console.warn("[Onboarding] #Service 섹션을 찾을 수 없습니다.");
    return;
  }

  const lineBoxes = [
    section.querySelector(".onboarding-line1"),
    section.querySelector(".onboarding-line2"),
    section.querySelector(".onboarding-line3"),
  ].filter(Boolean);

  const stepTexts = Array.from(section.querySelectorAll(".onboarding-step .step"));
  const videos = Array.from(section.querySelectorAll(".onboarding-content-sub video"));

  // 재생 속도 매핑
  const rateMap = new Map([
    [".onboarding-sub1", 3.0],
    [".onboarding-sub2", 7.0],
    [".onboarding-sub3", 1.7],
  ]);

  // 초기화
  const initState = () => {
    stepTexts.forEach(s => s.classList.remove("show"));
    videos.forEach(v => {
      v.classList.remove("active", "playing");
      v.pause();
      try { v.currentTime = 0; } catch {}
      v.muted = true;
      v.setAttribute("muted", "");
      v.playsInline = true;
      v.setAttribute("playsinline", "");
      v.removeAttribute("autoplay");
      v.preload = "auto"; // 로딩 안정화

      for (const [sel, r] of rateMap) {
        if (v.matches(sel)) { v.playbackRate = r; break; }
      }
    });
    lineBoxes.forEach(b => { if (b) b.style.width = "0px"; });
  };

  initState();

  // 내부 스타일 보장
  (function ensureLineCSS() {
    const css = `
      .onboarding-line1,.onboarding-line2,.onboarding-line3{
        width:0;height:2px;overflow:hidden;
        transition:width 700ms ease;will-change:width;
      }
      .onboarding-line1 svg,.onboarding-line2 svg,.onboarding-line3 svg{
        display:block;width:100%;height:2px;
      }
    `;
    if (!document.querySelector('style[data-onboarding-style]')) {
      const tag = document.createElement("style");
      tag.setAttribute("data-onboarding-style", "true");
      tag.textContent = css;
      document.head.appendChild(tag);
    }
  })();

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
  const targetWidths = lineBoxes.map(getTargetWidth);

  const drawLine = (i) => new Promise(res => {
    const box = lineBoxes[i], w = targetWidths[i];
    if (!box || !w) return res();
    requestAnimationFrame(() => {
      box.style.width = w + "px";
      setTimeout(res, 750);
    });
  });

  const revealStep = (i) => new Promise(res => {
    const s = stepTexts[i];
    if (!s) return res();
    s.classList.add("show");
    setTimeout(res, 420);
  });

  // ▶︎ 비디오 재생
  const playVideo = (i) => new Promise(async (res) => {
    const v = videos[i];
    if (!v) return res();

    v.classList.add("active");

    // 로딩 보장
    if (v.readyState < 2) {
      await new Promise(r => {
        const onReady = () => { v.removeEventListener("loadeddata", onReady); r(); };
        v.addEventListener("loadeddata", onReady);
        setTimeout(() => { v.removeEventListener("loadeddata", onReady); r(); }, 1500);
      });
    }

    for (const [sel, r] of rateMap) {
      if (v.matches(sel)) { v.playbackRate = r; break; }
    }

    v.currentTime = 0;
    v.classList.add("playing");

    const tryPlay = () => v.play();

    let endedResolve;
    const endedP = new Promise(r => {
      endedResolve = r;
      v.addEventListener("ended", () => {
        v.classList.remove("playing");
        r("ended");
      }, { once: true });
    });

    const estMs = Math.max(500, Math.floor(((v.duration || 4) / (v.playbackRate || 1)) * 1000) + 300);
    const timeoutP = new Promise(r => setTimeout(() => r("timeout"), estMs));

    // 섹션 내부 클릭 킥
    let kicked = false;
    const kick = (e) => {
      if (!section.contains(e.target)) return;
      if (kicked) return;
      kicked = true;
      tryPlay().catch(()=>{}).finally(() => {
        section.removeEventListener("click", kick, true);
      });
    };
    section.addEventListener("click", kick, true);

    try { await tryPlay(); } catch { /* 클릭 대기 */ }

    const result = await Promise.race([endedP, timeoutP]);

    section.removeEventListener("click", kick, true);
    if (result === "timeout") {
      v.classList.remove("playing");
      v.removeEventListener("ended", endedResolve);
    }
    res();
  });

  let running = false;
  let finished = false;

  const resetAll = () => {
    running = false;
    finished = false;
    initState();
  };

  const run = async () => {
    if (running || finished) return;
    running = true;
    try {
      await drawLine(0);
      await revealStep(0);
      await playVideo(0);

      await drawLine(1);
      await revealStep(1);
      await playVideo(1);

      await drawLine(2);
      await revealStep(2);
      await playVideo(2);

      finished = true;
    } finally {
      running = false;
    }
  };

  // Service 섹션이 보이면 시작, 벗어나면 리셋
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.target !== section) return;
      if (e.isIntersecting) {
        run();
      } else {
        resetAll();
      }
    });
  }, {
    threshold: 0.55,
    rootMargin: "0px 0px -10% 0px"
  });

  io.observe(section);
});




// Design system 부분

document.addEventListener("DOMContentLoaded", () => {
  const box = document.querySelector(".line-box");
  if (!box) return;

  const svgWrap = box.querySelector(".line-box-line");
  const imgWrap = box.querySelector(".line-box-img");
  const linesAll = Array.from(svgWrap.querySelectorAll("line"));


  const horizontals = [];
  const verticals = [];

  linesAll.forEach(line => {
    const y1 = parseFloat(line.getAttribute("y1"));
    const y2 = parseFloat(line.getAttribute("y2"));
    const len = line.getTotalLength();

    line._len = len;
    line.style.strokeDasharray = len;
    line.style.strokeDashoffset = len; 

    if (!Number.isNaN(y1) && !Number.isNaN(y2) && y1 === y2) {
      horizontals.push(line);
    } else {
      verticals.push(line);
    }
  });


  const drawGroup = (lines, duration = 900) => new Promise(resolve => {
    requestAnimationFrame(() => {
      lines.forEach(l => l.style.strokeDashoffset = 0);
      setTimeout(resolve, duration + 50);
    });
  });

  const revealImage = () => new Promise(resolve => {
    imgWrap.classList.add("show");
    setTimeout(resolve, 700);
  });

  const runSequence = async () => {
    await drawGroup(horizontals, 900);
    await drawGroup(verticals, 900);   
    await revealImage();            
  };


  let played = false;
  const io = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !played) {
        played = true;
        runSequence().finally(() => obs.unobserve(entry.target));
      }
    });
  }, { threshold: 0.7 });
  io.observe(box);
});

document.addEventListener("DOMContentLoaded", () => {
  const box = document.querySelector(".line-box");
  if (box) {
    const svgWrap = box.querySelector(".line-box-line");
    const imgWrap = box.querySelector(".line-box-img");
    const linesAll = Array.from(svgWrap.querySelectorAll("line"));
    const horizontals = [];
    const verticals = [];

    
    const systemText = document.querySelector(".system-text");
    const designImgBox = document.querySelector(".design-img-box");

 
    [systemText, designImgBox].forEach(el => {
      if (el) el.classList.add("reveal-init");
    });

 
    linesAll.forEach(line => {
      const y1 = parseFloat(line.getAttribute("y1"));
      const y2 = parseFloat(line.getAttribute("y2"));
      const len = line.getTotalLength();
      line._len = len;
      line.style.strokeDasharray = len;
      line.style.strokeDashoffset = len; // 숨김
      if (!Number.isNaN(y1) && !Number.isNaN(y2) && y1 === y2) {
        horizontals.push(line);
      } else {
        verticals.push(line);
      }
    });


    const drawGroup = (lines, duration = 900) => new Promise(resolve => {
      requestAnimationFrame(() => {
        lines.forEach(l => (l.style.strokeDashoffset = 0));
        setTimeout(resolve, duration + 50);
      });
    });


    const revealLogo = () => new Promise(resolve => {
      imgWrap.classList.add("show");
      setTimeout(resolve, 700);
    });

    const revealSystemText = () => new Promise(resolve => {
      if (systemText) {
        systemText.classList.add("reveal-in");
      }
      setTimeout(resolve, 500);
    });


    const revealDesignBox = () => new Promise(resolve => {
      if (designImgBox) {
        designImgBox.classList.add("reveal-in");
      }
      setTimeout(resolve, 500);
    });


    const runSequence = async () => {
      await drawGroup(horizontals, 900); 
      await drawGroup(verticals, 900);  
      await revealLogo();             
      await revealSystemText();   
      await revealDesignBox();      
    };

    let played = false;
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !played) {
          played = true;
          runSequence().finally(() => obs.unobserve(entry.target));
        }
      });
    }, { threshold: 0.7 });
    io.observe(box);
  }


  const fontSystem = document.querySelector(".font-system");
  if (fontSystem) {
    const revealTargets = [];


    const leftTitle = document.querySelector(".font-color"); 
    const leftSub   = document.querySelector(".system-subtext"); 
    const leftMain  = document.querySelector(".system-main");
    if (leftTitle) revealTargets.push(leftTitle);
    if (leftSub)   revealTargets.push(leftSub);
    if (leftMain)  revealTargets.push(leftMain);


    revealTargets.push(
      ...Array.from(document.querySelectorAll(".font-content1 .system-content1, .font-content1 .system-content2, .font-content1 .system-content3, .font-content1 .system-content4, .font-content1 .system-content5"))
    );
    revealTargets.push(
      ...Array.from(document.querySelectorAll(".font-content2 .system-content6, .font-content2 .system-content7, .font-content2 .system-content8, .font-content2 .system-content9, .font-content2 .system-content10"))
    );

    const colorTitle = document.querySelector(".font-color2");
    if (colorTitle) revealTargets.push(colorTitle);


    revealTargets.push(
      ...Array.from(document.querySelectorAll(".cops-color1, .cops-color2, .cops-color3, .cops-color4"))
    );

    revealTargets.push(
      ...Array.from(document.querySelectorAll(".color7-1, .color7-2, .color7-3, .color7-4, .color7-5, .color7-6, .color7-7"))
    );


    revealTargets.forEach(el => el.classList.add("reveal-init"));

    const staggerIn = (elements, baseDelay = 80) => {
      elements.forEach((el, i) => {
    
        el.style.transitionDelay = `${i * baseDelay}ms`;
        el.classList.add("reveal-in");
      });
    };

    const io2 = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          staggerIn(revealTargets, 80);
          obs.unobserve(entry.target); 
        }
      });
    }, { threshold: 0.25 });

    io2.observe(fontSystem);
  }
});

