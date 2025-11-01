(() => {
  // reflow로 CSS keyframes/transition 재점화
  const reflow = (el) => { el.style.animation = 'none'; el.offsetHeight; el.style.animation = ''; };

  // 섹션 관찰
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const section = entry.target;

      if (entry.isIntersecting) {
        // 들어올 때: reflow 대상 재점화, 비디오 자동재생
        section.querySelectorAll("[data-reflow]").forEach(reflow);
        section.querySelectorAll("video[data-replay-video][data-autoplay]").forEach(v => {
          try { v.muted = true; v.play(); } catch(e) {}
        });
      } else {
        // 나갈 때: 지정 클래스 제거 → 기존 트리거가 다시 동작할 수 있게 초기화
        section.querySelectorAll("[data-reset]").forEach((el) => {
          const toRemove = (el.getAttribute("data-reset") || "").split(",").map(s => s.trim()).filter(Boolean);
          toRemove.forEach(cls => el.classList.remove(cls));
        });

        // 그래프 같은 케이스: .is-active 제거가 필요하면 위 data-reset으로 처리(예: data-reset="is-active")
        // 비디오 초기화
        section.querySelectorAll("video[data-replay-video]").forEach((v) => {
          v.pause();
          v.currentTime = 0;
        });
      }
    });
  }, { threshold: 0.2 });

  // 페이지의 리플레이 섹션들 등록
  document.querySelectorAll("[data-replay-scope]").forEach(sec => io.observe(sec));
})();