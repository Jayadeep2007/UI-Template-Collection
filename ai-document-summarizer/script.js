/* ---------- mouse effect (glow + dot) ---------- */
const glow = document.getElementById('glow');
const dot = document.getElementById('dot');
let mx = innerWidth / 2, my = innerHeight / 2;   // real mouse
let gx = mx, gy = my;                            // eased glow position

addEventListener('mousemove', e => {
  mx = e.clientX; my = e.clientY;
  glow.classList.add('on'); dot.classList.add('on');
  dot.style.left = mx + 'px'; dot.style.top = my + 'px';
});
document.addEventListener('mouseleave', () => {
  glow.classList.remove('on'); dot.classList.remove('on');
});
document.querySelectorAll('a,button,.file,input,textarea').forEach(el => {
  el.addEventListener('mouseenter', () => dot.classList.add('big'));
  el.addEventListener('mouseleave', () => dot.classList.remove('big'));
});

/* ---------- aurora + stars background ---------- */
const cv = document.getElementById('bg');
const ctx = cv.getContext('2d');
let W, H, stars = [];

function resize() {
  W = cv.width = innerWidth;
  H = cv.height = innerHeight;
  stars = Array.from({ length: Math.floor(W * H / 9000) }, () => ({
    x: Math.random() * W, y: Math.random() * H,
    r: Math.random() * 1.2 + .2,
    t: Math.random() * 6.28, s: Math.random() * .02 + .005,
    d: Math.random() * .04 + .01          // parallax depth
  }));
}
addEventListener('resize', resize);
resize();

// aurora blobs: [x, y, size, speedX, speedY, phase, colour]
const blobs = [
  [.25, .30, .55, .00021, .00017, 0,   '138,77,255'],
  [.70, .25, .50, .00017, .00023, 2,   '228,92,255'],
  [.50, .75, .60, .00019, .00015, 4,   '90,60,255'],
  [.85, .70, .45, .00023, .00020, 1,   '200,70,230'],
  [.15, .80, .40, .00015, .00022, 3,   '110,70,255']
];

function draw(t) {
  ctx.globalCompositeOperation = 'source-over';
  ctx.fillStyle = '#06030d';
  ctx.fillRect(0, 0, W, H);

  // flowing aurora light
  ctx.globalCompositeOperation = 'lighter';
  for (const [bx, by, bs, sx, sy, ph, col] of blobs) {
    const x = W * (bx + Math.sin(t * sx + ph) * .22);
    const y = H * (by + Math.cos(t * sy + ph * 1.3) * .2);
    const r = Math.max(W, H) * bs * (0.85 + Math.sin(t * .0004 + ph) * .15);
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, `rgba(${col},.30)`);
    g.addColorStop(.5, `rgba(${col},.10)`);
    g.addColorStop(1, `rgba(${col},0)`);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
  }

  // light that follows the mouse
  gx += (mx - gx) * .06; gy += (my - gy) * .06;
  glow.style.left = gx + 'px'; glow.style.top = gy + 'px';
  const mr = Math.max(W, H) * .28;
  const mg = ctx.createRadialGradient(gx, gy, 0, gx, gy, mr);
  mg.addColorStop(0, 'rgba(228,92,255,.28)');
  mg.addColorStop(1, 'rgba(228,92,255,0)');
  ctx.fillStyle = mg;
  ctx.fillRect(0, 0, W, H);

  // twinkling stars with mouse parallax
  ctx.globalCompositeOperation = 'source-over';
  const ox = (mx - W / 2) * .02, oy = (my - H / 2) * .02;
  for (const s of stars) {
    s.t += s.s;
    const a = .35 + Math.sin(s.t) * .35;
    ctx.fillStyle = `rgba(235,220,255,${a})`;
    ctx.beginPath();
    ctx.arc(s.x - ox * s.d * 40, s.y - oy * s.d * 40, s.r, 0, 6.283);
    ctx.fill();
  }
  requestAnimationFrame(draw);
}
requestAnimationFrame(draw);

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
