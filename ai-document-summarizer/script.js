/* ---------- cursor: glow + ring ---------- */
const glow = document.getElementById('glow');
const ring = document.getElementById('ring');
let mx = innerWidth / 2, my = innerHeight / 2, gx = mx, gy = my;

addEventListener('mousemove', e => {
  mx = e.clientX; my = e.clientY;
  glow.classList.add('on'); ring.classList.add('on');
  ring.style.left = mx + 'px'; ring.style.top = my + 'px';
});
document.addEventListener('mouseleave', () => {
  glow.classList.remove('on'); ring.classList.remove('on');
});
document.querySelectorAll('a,button,.file,input,textarea').forEach(el => {
  el.addEventListener('mouseenter', () => ring.classList.add('big'));
  el.addEventListener('mouseleave', () => ring.classList.remove('big'));
});

/* ---------- 3D tilt on panels ---------- */
document.querySelectorAll('.tilt').forEach(card => {
  card.addEventListener('mousemove', e => {
    const r = card.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - .5;
    const py = (e.clientY - r.top) / r.height - .5;
    card.style.transform = `perspective(900px) rotateX(${-py * 6}deg) rotateY(${px * 8}deg) translateZ(6px)`;
  });
  card.addEventListener('mouseleave', () => { card.style.transform = ''; });
});

/* ---------- 3D wave-field background (three.js) ---------- */
if (window.THREE) {
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x08060c, 0.035);
  const camera = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 0.1, 200);
  camera.position.set(0, 7, 14);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setSize(innerWidth, innerHeight);
  renderer.setClearColor(0x08060c);
  document.getElementById('bg').appendChild(renderer.domElement);

  const COLS = 110, ROWS = 64, SEP = 0.6, N = COLS * ROWS;
  const pos = new Float32Array(N * 3), col = new Float32Array(N * 3);
  for (let i = 0, k = 0; i < COLS; i++) {
    for (let j = 0; j < ROWS; j++, k++) {
      pos[k * 3] = (i - COLS / 2) * SEP;
      pos[k * 3 + 2] = (j - ROWS / 2) * SEP - 6;
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  const points = new THREE.Points(geo, new THREE.PointsMaterial({
    size: 0.075, vertexColors: true, transparent: true, opacity: .95,
    depthWrite: false, blending: THREE.AdditiveBlending
  }));
  scene.add(points);

  // floating wireframe shape
  const shape = new THREE.Mesh(
    new THREE.IcosahedronGeometry(2.4, 1),
    new THREE.MeshBasicMaterial({ color: 0xb9a7e0, wireframe: true, transparent: true, opacity: .35 })
  );
  shape.position.set(0, 5, -8);
  scene.add(shape);

  // mouse position on the wave plane
  const ray = new THREE.Raycaster();
  const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
  const hit = new THREE.Vector3(0, 0, 0), ndc = new THREE.Vector2();
  const lav = new THREE.Color(0xb9a7e0), ember = new THREE.Color(0xff8a5c), c = new THREE.Color();

  function frame(ms) {
    const t = ms * 0.001;
    gx += (mx - gx) * .08; gy += (my - gy) * .08;
    glow.style.left = gx + 'px'; glow.style.top = gy + 'px';

    ndc.set((mx / innerWidth) * 2 - 1, -(my / innerHeight) * 2 + 1);
    ray.setFromCamera(ndc, camera);
    ray.ray.intersectPlane(plane, hit);

    for (let k = 0; k < N; k++) {
      const x = pos[k * 3], z = pos[k * 3 + 2];
      const d = Math.hypot(x - hit.x, z - hit.z);
      let y = Math.sin(x * .45 + t) * .6 + Math.cos(z * .5 + t * .8) * .6;
      y += Math.exp(-d * d / 7) * Math.sin(d * 2.6 - t * 5) * 1.6;   // cursor ripples
      pos[k * 3 + 1] = y;
      c.copy(lav).lerp(ember, Math.min(1, Math.max(0, (y + .6) / 2.4)));
      col[k * 3] = c.r; col[k * 3 + 1] = c.g; col[k * 3 + 2] = c.b;
    }
    geo.attributes.position.needsUpdate = true;
    geo.attributes.color.needsUpdate = true;

    shape.rotation.x = t * .25; shape.rotation.y = t * .35;
    camera.position.x += ((mx / innerWidth - .5) * 6 - camera.position.x) * .03;
    camera.position.y += (7 - (my / innerHeight - .5) * 3 - camera.position.y) * .03;
    camera.lookAt(0, 0, -2);

    renderer.render(scene, camera);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  addEventListener('resize', () => {
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
  });
}

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
