const canvas = document.getElementById("bg");
const ctx = canvas.getContext("2d");

const dpr = Math.min(window.devicePixelRatio || 1, 2);

let w = 0, h = 0;
let particles = [];
let mouse = { x: 0, y: 0, active: false };

function resize() {
  w = window.innerWidth;
  h = window.innerHeight;

  canvas.width = Math.floor(w * dpr);
  canvas.height = Math.floor(h * dpr);
  canvas.style.width = w + "px";
  canvas.style.height = h + "px";
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  // 依螢幕大小調整粒子數（手機少一點比較順）
  const target = Math.max(40, Math.min(120, Math.floor(w / 12)));
  particles = Array.from({ length: target }, () => newParticle(true));
}

function rand(min, max) {
  return Math.random() * (max - min) + min;
}

function newParticle(randomPos = false) {
  return {
    x: randomPos ? rand(0, w) : rand(-20, w + 20),
    y: randomPos ? rand(0, h) : rand(-20, h + 20),
    vx: rand(-0.25, 0.25),
    vy: rand(-0.25, 0.25),
    r: rand(1, 2.2),
    a: rand(0.25, 0.8)
  };
}

function drawBackground() {
  // 透明清除 + 疊加一點點暗色，留下殘影（更夢幻）
  ctx.fillStyle = "rgba(8, 12, 25, 0.35)";
  ctx.fillRect(0, 0, w, h);
}

function drawParticles() {
  // 粒子本體（一次畫完會比每顆都 beginPath 更省）
  ctx.beginPath();
  for (const p of particles) {
    ctx.moveTo(p.x + p.r, p.y);
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
  }
  ctx.fillStyle = "rgba(255,255,255,0.85)";
  ctx.fill();
}

function drawLinks() {
  // 粒子連線
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const a = particles[i], b = particles[j];
      const dx = a.x - b.x, dy = a.y - b.y;
      const dist = Math.hypot(dx, dy);
      const max = 120;
      if (dist < max) {
        const alpha = (1 - dist / max) * 0.25;
        ctx.strokeStyle = `rgba(34,211,238,${alpha})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
    }
  }
}

function update() {
  for (const p of particles) {
    // 滑鼠吸引（越近越明顯）
    if (mouse.active) {
      const dx = mouse.x - p.x;
      const dy = mouse.y - p.y;
      const dist = Math.max(40, Math.hypot(dx, dy));
      const pull = 18 / dist; // 吸力係數
      p.vx += dx * pull * 0.0006;
      p.vy += dy * pull * 0.0006;
    }

    // 慣性 + 阻尼
    p.vx *= 0.985;
    p.vy *= 0.985;

    p.x += p.vx;
    p.y += p.vy;

    // 邊界循環（出界就從另一側回來）
    if (p.x < -30) p.x = w + 30;
    if (p.x > w + 30) p.x = -30;
    if (p.y < -30) p.y = h + 30;
    if (p.y > h + 30) p.y = -30;
  }
}

function loop() {
  drawBackground();
  drawLinks();
  drawParticles();
  update();

  // 每幀更新：交給瀏覽器在下一次重繪前呼叫
  requestAnimationFrame(loop);
}

window.addEventListener("resize", resize);

window.addEventListener("mousemove", (e) => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
  mouse.active = true;
});

window.addEventListener("mouseleave", () => {
  mouse.active = false;
});

window.addEventListener("touchstart", (e) => {
  const t = e.touches[0];
  mouse.x = t.clientX;
  mouse.y = t.clientY;
  mouse.active = true;
}, { passive: true });

window.addEventListener("touchmove", (e) => {
  const t = e.touches[0];
  mouse.x = t.clientX;
  mouse.y = t.clientY;
}, { passive: true });

window.addEventListener("touchend", () => {
  mouse.active = false;
});

resize();
ctx.fillStyle = "rgba(8, 12, 25, 1)";
ctx.fillRect(0, 0, w, h);
loop();
