/* ---------- mouse-follow glow ---------- */
const glow = document.getElementById('glow');
let tx = innerWidth / 2, ty = innerHeight / 2, x = tx, y = ty;

addEventListener('mousemove', e => {
  tx = e.clientX; ty = e.clientY;
  glow.classList.add('on');
});
document.addEventListener('mouseleave', () => glow.classList.remove('on'));

(function follow() {
  x += (tx - x) * 0.12;
  y += (ty - y) * 0.12;
  glow.style.left = x + 'px';
  glow.style.top = y + 'px';
  requestAnimationFrame(follow);
})();

/* ---------- particle background ---------- */
const cv = document.getElementById('bg');
const ctx = cv.getContext('2d');
let W, H, pts = [], mx = -999, my = -999;

function resize() {
  W = cv.width = innerWidth;
  H = cv.height = innerHeight;
  const n = Math.min(110, Math.floor(W * H / 14000));
  pts = Array.from({ length: n }, () => ({
    x: Math.random() * W, y: Math.random() * H,
    vx: (Math.random() - .5) * .35, vy: (Math.random() - .5) * .35,
    r: Math.random() * 1.6 + .6
  }));
}
addEventListener('resize', resize);
addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });
resize();

function draw() {
  ctx.clearRect(0, 0, W, H);
  for (const p of pts) {
    p.x += p.vx; p.y += p.vy;
    if (p.x < 0 || p.x > W) p.vx *= -1;
    if (p.y < 0 || p.y > H) p.vy *= -1;

    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, 6.283);
    ctx.fillStyle = 'rgba(185,166,255,.85)';
    ctx.fill();

    const dm = Math.hypot(p.x - mx, p.y - my);
    if (dm < 170) {
      ctx.strokeStyle = `rgba(160,125,255,${1 - dm / 170})`;
      ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(mx, my); ctx.stroke();
    }
  }
  for (let i = 0; i < pts.length; i++) {
    for (let j = i + 1; j < pts.length; j++) {
      const d = Math.hypot(pts[i].x - pts[j].x, pts[i].y - pts[j].y);
      if (d < 120) {
        ctx.strokeStyle = `rgba(139,108,255,${.22 * (1 - d / 120)})`;
        ctx.beginPath(); ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(pts[j].x, pts[j].y); ctx.stroke();
      }
    }
  }
  requestAnimationFrame(draw);
}
draw();

/* ---------- summarizer UI ---------- */
const input = document.getElementById('input');
const fileEl = document.getElementById('file');
const len = document.getElementById('len');
const lenOut = document.getElementById('lenOut');
const go = document.getElementById('go');
const result = document.getElementById('result');
const summaryEl = document.getElementById('summary');
const stats = document.getElementById('stats');
const copy = document.getElementById('copy');

len.addEventListener('input', () => {
  lenOut.textContent = len.value + (len.value === '1' ? ' sentence' : ' sentences');
});

fileEl.addEventListener('change', () => {
  const f = fileEl.files[0];
  if (!f) return;
  const r = new FileReader();
  r.onload = () => { input.value = r.result; };
  r.readAsText(f);
});

function summarize(text, count) {
  const sentences = text.match(/[^.!?]+[.!?]+(\s|$)|[^.!?]+$/g) || [];
  if (sentences.length <= count) return sentences.map(s => s.trim()).join(' ');

  const stop = new Set('the a an and or but of to in on for with is are was were be it this that as at by from not have has had'.split(' '));
  const freq = {};
  text.toLowerCase().match(/[a-z']+/g)?.forEach(w => {
    if (!stop.has(w) && w.length > 2) freq[w] = (freq[w] || 0) + 1;
  });

  const scored = sentences.map((s, i) => {
    const words = s.toLowerCase().match(/[a-z']+/g) || [];
    const score = words.reduce((n, w) => n + (freq[w] || 0), 0) / (words.length || 1);
    return { s: s.trim(), i, score };
  });

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, count)
    .sort((a, b) => a.i - b.i)
    .map(o => o.s)
    .join(' ');
}

go.addEventListener('click', () => {
  const text = input.value.trim();
  if (text.length < 40) {
    result.hidden = false;
    stats.textContent = '';
    summaryEl.textContent = 'Add at least a few sentences of text, then select Summarize.';
    return;
  }
  const out = summarize(text, +len.value);
  const w1 = text.split(/\s+/).length, w2 = out.split(/\s+/).length;
  stats.textContent = `${w1} words reduced to ${w2} (${Math.round((1 - w2 / w1) * 100)}% shorter)`;
  summaryEl.textContent = out;
  result.hidden = false;
});

copy.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(summaryEl.textContent);
    copy.textContent = 'Copied';
    setTimeout(() => (copy.textContent = 'Copy summary'), 1500);
  } catch { copy.textContent = 'Copy failed'; }
});
