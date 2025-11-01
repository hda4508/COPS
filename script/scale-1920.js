// ../script/scale-1920.js
(function () {
  const DESIGN_WIDTH = 1920; // 네 기준 폭

  function applyScale() {
    const stage = document.getElementById('stage');
    const app   = document.getElementById('app-1920');
    if (!stage || !app) return;

    // 화면 폭 기준으로만 축소 (세로는 그대로 스크롤)
    const vw = window.innerWidth;
    const scale = Math.min(vw / DESIGN_WIDTH, 1); // 1920 이상이면 1(원본), 이하면 축소

    // 스케일 적용
    app.style.transform = `scale(${scale})`;

    // 스케일 후 실제 보이는 높이에 맞춰 stage 높이를 보정
    // (transform은 레이아웃 박스를 줄이지 않기 때문에 시각 높이에 맞게 조정 필요)
    const appHeight = app.scrollHeight;        // 원본 콘텐츠 전체 높이(px)
    stage.style.height = (appHeight * scale) + 'px';
  }

  // 최초/리사이즈/폰트로드 등 변화에 반응
  window.addEventListener('load', applyScale);
  window.addEventListener('resize', applyScale);
  // 폰트 로드로 높이가 튈 수 있으니 한 번 더
  document.fonts && document.fonts.ready && document.fonts.ready.then(applyScale);
})();
