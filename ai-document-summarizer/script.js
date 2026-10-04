:root{
  --bg:#08060c;
  --ink:#efe9f7;
  --ink-soft:#a99fbd;
  --lav:#b9a7e0;
  --ember:#ff8a5c;
  --panel:rgba(22,16,34,.55);
  --line:rgba(185,167,224,.22);
}
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'DM Sans',system-ui,sans-serif;color:var(--ink);background:var(--bg);min-height:100vh;overflow-x:hidden}

#bg{position:fixed;inset:0;z-index:-2}
#bg canvas{display:block}

h1{
  font-family:'Bricolage Grotesque',sans-serif;font-weight:800;
  font-size:clamp(2.2rem,6vw,4rem);line-height:1.05;letter-spacing:-.03em;
  background:linear-gradient(110deg,#fff 15%,var(--lav) 55%,var(--ember));
  -webkit-background-clip:text;background-clip:text;color:transparent;
}
.lead{margin:1.2rem 0 2.2rem;max-width:52ch;color:var(--ink-soft);font-size:1.1rem;line-height:1.55}

/* cursor effects */
.glow{position:fixed;top:0;left:0;z-index:-1;width:520px;height:520px;border-radius:50%;
  pointer-events:none;transform:translate(-50%,-50%);opacity:0;transition:opacity .3s;
  background:radial-gradient(circle,rgba(255,138,92,.2),rgba(185,167,224,.1) 45%,transparent 70%)}
.ring{position:fixed;top:0;left:0;z-index:50;width:36px;height:36px;border-radius:50%;
  pointer-events:none;transform:translate(-50%,-50%);opacity:0;
  border:1.5px solid var(--lav);transition:opacity .3s,width .25s,height .25s,background .25s,border-color .25s}
.glow.on,.ring.on{opacity:1}
.ring.big{width:64px;height:64px;border-color:var(--ember);background:rgba(255,138,92,.12)}

.nav{padding:1.4rem clamp(1.2rem,5vw,4rem)}
.back{color:var(--ink);text-decoration:none;font-weight:500;padding:.5rem 1rem;border-radius:999px;
  border:1px solid var(--line);background:var(--panel);backdrop-filter:blur(10px);transition:border-color .2s,transform .2s}
.back:hover{border-color:var(--ember);transform:translateX(-3px)}

.wrap{max-width:820px;margin:0 auto;padding:2rem 1.2rem 5rem}
.panel{
  background:var(--panel);border:1px solid var(--line);
  box-shadow:0 24px 70px rgba(0,0,0,.6),inset 0 1px 0 rgba(255,255,255,.07);
  backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);
  border-radius:24px;padding:1.4rem;margin-bottom:1.4rem;
  transition:transform .15s ease-out;will-change:transform;
}
textarea{width:100%;resize:vertical;min-height:200px;font:inherit;line-height:1.6;color:var(--ink);
  background:rgba(8,6,12,.65);border:1px solid var(--line);border-radius:16px;padding:1rem}
textarea::placeholder{color:#756a8c}

.controls{display:flex;flex-wrap:wrap;gap:1rem 1.4rem;align-items:center;margin-top:1rem}
.file{cursor:pointer;padding:.65rem 1.1rem;border-radius:999px;border:1px dashed var(--lav);color:var(--ink);font-weight:500;transition:background .2s}
.file:hover{background:rgba(185,167,224,.15)}
.file input{position:absolute;opacity:0;width:0;height:0}
.len{display:flex;align-items:center;gap:.7rem;color:var(--ink-soft);font-size:.95rem}
.len input{accent-color:var(--ember);width:140px}
.len output{min-width:6.5em;color:var(--ink);font-weight:500}

.btn{margin-left:auto;cursor:pointer;border:0;font:inherit;font-weight:700;padding:.8rem 1.8rem;border-radius:999px;
  color:#1a1224;background:linear-gradient(135deg,#cdbdf2,#ff9a6c);
  box-shadow:0 0 30px rgba(255,138,92,.35);transition:transform .2s,box-shadow .2s}
.btn:hover{transform:translateY(-2px);box-shadow:0 0 46px rgba(255,138,92,.6)}
.btn.ghost{margin:1rem 0 0;background:transparent;border:1px solid var(--ember);color:var(--ink);box-shadow:none}
.btn.ghost:hover{background:rgba(255,138,92,.14)}

.result .stats{color:var(--ink-soft);font-size:.9rem;margin-bottom:.8rem}
.result p{font-size:1.1rem;line-height:1.7}

.back:focus-visible,.btn:focus-visible,textarea:focus-visible,.file:focus-within,input[type=range]:focus-visible{
  outline:2px solid var(--ember);outline-offset:3px}

@media (max-width:600px){.btn{margin-left:0;width:100%}}
@media (hover:none){.glow,.ring{display:none}}
@media (prefers-reduced-motion:reduce){*{transition:none!important}}
         
