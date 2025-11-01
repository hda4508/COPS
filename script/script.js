
  (function () {
    // 사용자가 모션 줄이기 설정이면 그냥 종료
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) return;

    // 메인 컨테이너
    const root = document.querySelector('.main-dot');
    if (!root) return;

    // 반짝일 후보: 점 래퍼 div들 (m-dot1~m-dot14 등)
    const dots = root.querySelectorAll('[class^="m-dot"]');

    // 각 점에 어울리는 글로우 색 자동 추출(대략적인 채우기 색 기준)
    dots.forEach(dot => {
      // SVG 내부 주요 색을 간단히 추정 (빨강/노랑/초록)
      const svg = dot.querySelector('svg');
      let glow = '115,255,0'; // green
      if (svg) {
        const redCircle = svg.querySelector('circle[fill="#FF0000"]');
        const yellowCircle = svg.querySelector('circle[fill="#FFD24B"]');
        if (redCircle) glow = '255,0,0';
        else if (yellowCircle) glow = '255,210,75';
      }
      dot.style.setProperty('--glow', glow);

      // 개별 점마다 약간 다른 기본 스케일 (자연스러운 떨림)
      const baseScale = 0.98 + Math.random() * 0.06; // 0.98 ~ 1.04
      dot.style.setProperty('--base-scale', baseScale.toFixed(3));
    });

    // 중복 반짝 방지용
    function twinkleOnce(el) {
      if (!el || el.classList.contains('twinkling')) return;

      // 개별 반짝 지속시간 약간 랜덤
      const dur = 520 + Math.random() * 480; // 520~1000ms
      el.style.setProperty('--twinkle-dur', `${Math.round(dur)}ms`);

      el.classList.add('twinkling');
      setTimeout(() => el.classList.remove('twinkling'), dur);
    }

    // 타이머 관리 (보이는 동안만 동작)
    let alive = false;
    let timerId = null;

    function loop() {
      if (!alive) return;

      // 한 번에 1~3개 정도 랜덤 반짝
      const burst = 1 + Math.floor(Math.random() * 3);
      for (let i = 0; i < burst; i++) {
        const pick = dots[Math.floor(Math.random() * dots.length)];
        twinkleOnce(pick);
      }

      // 다음 트리거까지 대기 시간 랜덤 (짧게/길게 섞음)
      const next = 120 + Math.random() * 420; // 120~540ms
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

    // 섹션이 화면에 보일 때만 실행 (백스크롤 시 재실행 포함)
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

    // 사용자가 마우스로 올리면 즉시 반짝(피드백)
    root.addEventListener('pointerover', (e) => {
      const wrapper = e.target.closest('[class^="m-dot"]');
      if (wrapper) twinkleOnce(wrapper);
    });

  })();

  (function () {
      const btn = document.getElementById('topBtn');

      window.addEventListener('scroll', () => {
        if (window.scrollY > 30) btn.classList.add('is-show');
        else btn.classList.remove('is-show');
      });

      // 버튼 클릭 시 맨 위로 부드럽게 이동
      btn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    })();

// 메인 비디오 재생
document.addEventListener("DOMContentLoaded", () => {
  const box = document.getElementById("videoBox");
  const video = document.getElementById("mainVideo");

  if (!box || !video) return;

  // 클릭 시 확대 + 재생 / 축소 + 일시정지
  box.addEventListener("click", () => {
    if (!box.classList.contains("expanded")) {
      box.classList.add("expanded", "playing");
      video.play();
      document.body.classList.add("video-expanded"); // top버튼 숨김
      document.documentElement.style.overflow = "hidden"; // 스크롤 잠금
    } else {
      video.pause();
      box.classList.remove("expanded", "playing");
      document.body.classList.remove("video-expanded");
      document.documentElement.style.overflow = ""; // 스크롤 복구
    }
  });

  // 영상이 끝나면 자동 축소
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

// Onboarding 부분
document.addEventListener("DOMContentLoaded", () => {
  const section = document.querySelector("#Service");
  if (!section) return;

  const lineBoxes = [
    document.querySelector(".onboarding-line1"),
    document.querySelector(".onboarding-line2"),
    document.querySelector(".onboarding-line3"),
  ].filter(Boolean);

  const stepTexts = Array.from(document.querySelectorAll(".onboarding-step .step"));
  const videos = Array.from(document.querySelectorAll(".onboarding-content-sub video"));

  // ✅ 영상별 속도 설정
  const sub1 = document.querySelector(".onboarding-sub1");
  const sub2 = document.querySelector(".onboarding-sub2");
  const sub3 = document.querySelector(".onboarding-sub3");
  if (sub1) sub1.playbackRate = 1.5;
  if (sub2) sub2.playbackRate = 2.0;
  if (sub3) sub3.playbackRate = 1.7;

  stepTexts.forEach(s => s.classList.remove("show"));
  videos.forEach(v => {
    v.classList.remove("active", "playing");
    v.muted = true;
    v.setAttribute("muted", "");
    v.playsInline = true;
    v.setAttribute("playsinline", "");
    v.autoplay = true;
    v.setAttribute("autoplay", "");
    v.preload = "auto";
    v.setAttribute("preload", "auto");
  });

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
    const box = lineBoxes[i],
      w = targetWidths[i];
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

  const playVideo = (i) => new Promise(async (res) => {
    const v = videos[i];
    if (!v) return res();

    try {
      if (v.readyState < 2) {
        await new Promise(r => v.addEventListener("loadeddata", r, { once: true }));
      }

      v.currentTime = 0;
      v.classList.add("active", "playing");

      // ✅ 속도 다시 반영 (보호용)
      if (v.classList.contains("onboarding-sub1")) v.playbackRate = 1.5;
      if (v.classList.contains("onboarding-sub2")) v.playbackRate = 2.0;
      if (v.classList.contains("onboarding-sub3")) v.playbackRate = 1.7;

      await v.play();

      // ✅ 끝나면 다음으로
      v.addEventListener("ended", () => res(), { once: true });

      // 혹시 ended 인식 못할 때 대비 타임아웃 (영상 길이의 1/속도)
      const estDuration = (v.duration || 3) / v.playbackRate * 1000;
      setTimeout(res, estDuration + 300);
    } catch {
      const kick = () => {
        v.classList.add("active", "playing");
        v.play().finally(() => window.removeEventListener("click", kick));
      };
      window.addEventListener("click", kick, { once: true });
    }
  });

  let hasRun = false;
  const run = async () => {
    if (hasRun) return;
    hasRun = true;
    await drawLine(0);
    await revealStep(0);
    await playVideo(0);
    await drawLine(1);
    await revealStep(1);
    await playVideo(1);
    await drawLine(2);
    await revealStep(2);
    await playVideo(2);
  };

  const io = new IntersectionObserver((entries, obs) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        run();
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.7 });

  io.observe(section);

  window.addEventListener("click", () => run(), { once: true });
});


// Design system 부분

// document.addEventListener("DOMContentLoaded", () => {
//   const box = document.querySelector(".line-box");
//   if (!box) return;

//   const svgWrap = box.querySelector(".line-box-line");
//   const imgWrap = box.querySelector(".line-box-img");
//   const linesAll = Array.from(svgWrap.querySelectorAll("line"));

//   // 1) 초기 세팅: 길이 계산해서 모두 숨김(대시 오프셋 = 길이)
//   const horizontals = [];
//   const verticals   = [];

//   linesAll.forEach(line => {
//     const y1 = parseFloat(line.getAttribute("y1"));
//     const y2 = parseFloat(line.getAttribute("y2"));

//     const len = line.getTotalLength();
//     line._len = len;
//     line.style.strokeDasharray = len;
//     line.style.strokeDashoffset = len; // 전부 가려둠

//     if (!Number.isNaN(y1) && !Number.isNaN(y2) && y1 === y2) {
//       horizontals.push(line);
//     } else {
//       verticals.push(line);
//     }
//   });

//   // 2) 그릴 순서 정렬
//   // 가로선: 위에서 아래(y 오름차순), 세로선: 왼쪽에서 오른쪽(x 오름차순)
//   horizontals.sort((a, b) => parseFloat(a.getAttribute("y1")) - parseFloat(b.getAttribute("y1")));
//   verticals.sort((a, b) => parseFloat(a.getAttribute("x1")) - parseFloat(b.getAttribute("x1")));

//   // 3) 유틸: 한 줄 그리기
//   const drawOne = (line, duration = 600) => new Promise(resolve => {
//     // (필요시 개별 duration 주고 싶으면 여기서 line.style.transitionDuration 조정)
//     requestAnimationFrame(() => {
//       line.style.strokeDashoffset = 0;  // ← 0으로 떨어뜨려 그려지게
//       setTimeout(resolve, duration + 50);
//     });
//   });

//   // 4) 유틸: 시퀀스로 한 줄씩 그리기
//   const drawSeries = async (lines, perLine = 600, gap = 120) => {
//     for (const ln of lines) {
//       await drawOne(ln, perLine);
//       if (gap) await new Promise(r => setTimeout(r, gap)); // 다음 줄까지 간격
//     }
//   };

//   // 5) 이미지 디졸브
//   const revealImage = () => new Promise(resolve => {
//     imgWrap.classList.add("show");
//     setTimeout(resolve, 720);
//   });

//   // 6) 메인 시퀀스: 가로(한 줄씩) → 세로(한 줄씩) → 이미지
//   const runSequence = async () => {
//     await drawSeries(horizontals, 600, 120);
//     await drawSeries(verticals,   600, 120);
//     await revealImage();
//   };

//   // 7) 스크롤 70% 보이면 한 번만 실행
//   let played = false;
//   const io = new IntersectionObserver((entries, obs) => {
//     entries.forEach(entry => {
//       if (entry.isIntersecting && !played) {
//         played = true;
//         runSequence().finally(() => obs.unobserve(entry.target));
//       }
//     });
//   }, { threshold: 0.7 });
//   io.observe(box);

//   // (보조) IO가 못 잡히는 경우 첫 클릭으로 실행
//   window.addEventListener("click", () => {
//     if (!played) { played = true; runSequence(); }
//   }, { once: true });
// });

document.addEventListener("DOMContentLoaded", () => {
  const box = document.querySelector(".line-box");
  if (!box) return;

  const svgWrap = box.querySelector(".line-box-line");
  const imgWrap = box.querySelector(".line-box-img");
  const linesAll = Array.from(svgWrap.querySelectorAll("line"));

  // 가로 / 세로 분리
  const horizontals = [];
  const verticals = [];

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

  // 그룹 그리기
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
    await drawGroup(horizontals, 900); // 가로선 전체
    await drawGroup(verticals, 900);   // 세로선 전체
    await revealImage();               // 이미지 디졸브
  };

  // 스크롤 트리거 (70%)
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
  /*** ① 상단 Line → Logo → Text → 하단 박스 시퀀스 ***/
  const box = document.querySelector(".line-box");
  if (box) {
    const svgWrap = box.querySelector(".line-box-line");
    const imgWrap = box.querySelector(".line-box-img");
    const linesAll = Array.from(svgWrap.querySelectorAll("line"));
    const horizontals = [];
    const verticals = [];

    // 다음 단계 대상: 설명 글(.system-text), 하단 박스(.design-img-box)
    const systemText = document.querySelector(".system-text");
    const designImgBox = document.querySelector(".design-img-box");

    // 초기 숨김 클래스 부여
    [systemText, designImgBox].forEach(el => {
      if (el) el.classList.add("reveal-init");
    });

    // 선들 dash 준비 + 가로/세로 분리
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

    // 그룹 그리기
    const drawGroup = (lines, duration = 900) => new Promise(resolve => {
      requestAnimationFrame(() => {
        lines.forEach(l => (l.style.strokeDashoffset = 0));
        setTimeout(resolve, duration + 50);
      });
    });

    // 로고 디졸브
    const revealLogo = () => new Promise(resolve => {
      imgWrap.classList.add("show");
      setTimeout(resolve, 700);
    });

    // 설명 글 나타나기
    const revealSystemText = () => new Promise(resolve => {
      if (systemText) {
        systemText.classList.add("reveal-in");
      }
      setTimeout(resolve, 500);
    });

    // 하단 박스 나타나기
    const revealDesignBox = () => new Promise(resolve => {
      if (designImgBox) {
        designImgBox.classList.add("reveal-in");
      }
      setTimeout(resolve, 500);
    });

    // 순서 실행
    const runSequence = async () => {
      await drawGroup(horizontals, 900); // 가로선 전체
      await drawGroup(verticals, 900);   // 세로선 전체
      await revealLogo();                // 로고 디졸브
      await revealSystemText();          // 설명 글
      await revealDesignBox();           // 하단 박스
    };

    // 스크롤 트리거(70%)
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

  /*** ② Typography ~ Color 구간 스태거 등장 ***/
  const fontSystem = document.querySelector(".font-system");
  if (fontSystem) {
    // 위에서 아래로 순차 등장시키고 싶은 요소들 수집(위→아래 순서대로)
    const revealTargets = [];

    // 왼쪽 타이포 영역
    const leftTitle = document.querySelector(".font-color");      // "Typography"
    const leftSub   = document.querySelector(".system-subtext");  // ENG/KR
    const leftMain  = document.querySelector(".system-main");     // 프리텐다드/Pretendard
    if (leftTitle) revealTargets.push(leftTitle);
    if (leftSub)   revealTargets.push(leftSub);
    if (leftMain)  revealTargets.push(leftMain);

    // 사이즈/스타일 표 (font-content1/2 내부의 모든 .system-content*)
    revealTargets.push(
      ...Array.from(document.querySelectorAll(".font-content1 .system-content1, .font-content1 .system-content2, .font-content1 .system-content3, .font-content1 .system-content4, .font-content1 .system-content5"))
    );
    revealTargets.push(
      ...Array.from(document.querySelectorAll(".font-content2 .system-content6, .font-content2 .system-content7, .font-content2 .system-content8, .font-content2 .system-content9, .font-content2 .system-content10"))
    );

    // 오른쪽 Color 영역 타이틀
    const colorTitle = document.querySelector(".font-color2"); // "Color"
    if (colorTitle) revealTargets.push(colorTitle);

    // 컬러 카드 4개
    revealTargets.push(
      ...Array.from(document.querySelectorAll(".cops-color1, .cops-color2, .cops-color3, .cops-color4"))
    );

    // 옆 세로 샘플 7개
    revealTargets.push(
      ...Array.from(document.querySelectorAll(".color7-1, .color7-2, .color7-3, .color7-4, .color7-5, .color7-6, .color7-7"))
    );

    // 초기 숨김 클래스 부여
    revealTargets.forEach(el => el.classList.add("reveal-init"));

    const staggerIn = (elements, baseDelay = 80) => {
      elements.forEach((el, i) => {
        // 각 요소마다 지연을 주어 촤르륵 등장
        el.style.transitionDelay = `${i * baseDelay}ms`;
        el.classList.add("reveal-in");
      });
    };

    const io2 = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          staggerIn(revealTargets, 80);
          obs.unobserve(entry.target); // 1회만
        }
      });
    }, { threshold: 0.25 });

    io2.observe(fontSystem);
  }
});


document.addEventListener("DOMContentLoaded", () => {
  const scope = document.querySelector(".system-box[data-replay-scope]");
  if (!scope) return;

  const box = scope.querySelector(".line-box");
  const svgWrap = box?.querySelector(".line-box-line");
  const imgWrap = box?.querySelector(".line-box-img");
  const systemText = scope.querySelector(".system-text");

  if (!box || !svgWrap || !imgWrap) return;

  const lines = Array.from(svgWrap.querySelectorAll("line"));
  const horizontals = [];
  const verticals = [];

  // 초기 세팅
  const setupLines = () => {
    horizontals.length = 0;
    verticals.length = 0;
    lines.forEach(line => {
      const y1 = parseFloat(line.getAttribute("y1"));
      const y2 = parseFloat(line.getAttribute("y2"));
      const len = line.getTotalLength();
      line._len = len;
      line.style.strokeDasharray = len;
      line.style.strokeDashoffset = len;
      if (y1 === y2) horizontals.push(line);
      else verticals.push(line);
    });
  };

  const drawGroup = (arr, dur = 900) =>
    new Promise(res => {
      requestAnimationFrame(() => {
        arr.forEach(l => (l.style.strokeDashoffset = 0));
        setTimeout(res, dur + 50);
      });
    });

  const revealLogo = () =>
    new Promise(res => {
      imgWrap.classList.add("show");
      setTimeout(res, 700);
    });

  const revealText = () =>
    new Promise(res => {
      systemText.classList.add("reveal-in");
      setTimeout(res, 500);
    });

  const runSeq = async () => {
    await drawGroup(horizontals, 900);
    await drawGroup(verticals, 900);
    await revealLogo();
    await revealText();
  };

  const resetSeq = () => {
    lines.forEach(l => {
      const len = l._len || 0;
      l.style.strokeDasharray = len;
      l.style.strokeDashoffset = len;
    });
    imgWrap.classList.remove("show");
    systemText.classList.remove("reveal-in");
  };

  // 초기 상태 설정
  setupLines();
  systemText.classList.add("reveal-init");

  // 진입 시 재생 / 이탈 시 리셋
  const io = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setupLines();
          runSeq();
        } else {
          resetSeq();
        }
      });
    },
    { threshold: 0.55 }
  );

  io.observe(scope);
});

