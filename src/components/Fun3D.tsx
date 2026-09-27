import type { CSSProperties } from "react";

// Shared "fun 3D" look for the grammar win + lose screens:
// big chunky letters that pop in one by one (gold face + orange 3D side), and chunky 3D candy buttons.
// VISUAL ONLY.

// Chunky rounded font (Google Fonts). Loaded once, as soon as a game page loads.
if (typeof document !== "undefined" && !document.getElementById("f3-font")) {
  const l = document.createElement("link");
  l.id = "f3-font";
  l.rel = "stylesheet";
  l.href = "https://fonts.googleapis.com/css2?family=Lilita+One&display=swap";
  document.head.appendChild(l);
}

export const FUN3D_CSS = `
.f3-word { display:inline-flex; align-items:flex-end; font-family:'Lilita One', Fredoka, sans-serif; font-weight:400;
  line-height:1.05; letter-spacing:.01em; white-space:nowrap; }
.f3-sp { display:inline-block; width:.26em; }
.f3-l { position:relative; display:inline-block; transform-origin:50% 85%;
  animation:f3-pop .55s var(--d) cubic-bezier(.25,1.6,.45,1) both, f3-bob 2.8s calc(var(--d) + 1.4s) ease-in-out infinite; }
.f3-back { color:var(--f3-side); -webkit-text-stroke:.09em var(--f3-edge); paint-order:stroke fill;
  text-shadow:0 .03em 0 var(--f3-side), 0 .06em 0 var(--f3-side), 0 .09em 0 var(--f3-side2), 0 .115em 0 var(--f3-edge),
    0 .18em .16em rgba(0,0,0,.5); }
.f3-front { position:absolute; left:0; top:0; color:transparent; background:var(--f3-face);
  -webkit-background-clip:text; background-clip:text; pointer-events:none; }
.f3-gold { --f3-face:linear-gradient(180deg,#fffbd0 0%,#ffe75e 30%,#ffcc21 62%,#ffad12 100%);
  --f3-side:#ea870f; --f3-side2:#d06c0b; --f3-edge:#8a3f05; }
.f3-blue { --f3-face:linear-gradient(180deg,#f4fdff 0%,#a8e8ff 32%,#55bff6 66%,#2f93e2 100%);
  --f3-side:#2177c6; --f3-side2:#1b62aa; --f3-edge:#0d3470; }
@keyframes f3-pop { 0%{opacity:0; transform:translateY(.45em) scale(.2)} 55%{opacity:1; transform:translateY(-.12em) scale(1.28)}
  78%{transform:translateY(0) scale(.92)} 100%{opacity:1; transform:none} }
@keyframes f3-bob { 0%,100%{transform:none} 50%{transform:translateY(-.05em)} }

.f3-btn { position:relative; font-family:Fredoka, sans-serif; font-weight:700; font-size:max(22px, calc(var(--u, 1vh) * 2.8));
  min-width:9.2em; padding:.46em 1.4em .54em; border-radius:.75em; border:.08em solid var(--b-edge); cursor:pointer;
  color:#fff; letter-spacing:.01em;
  text-shadow:0 .06em .09em rgba(0,0,0,.55), 0 .02em .02em rgba(0,0,0,.35);  /* subtle drop shadow so the white words read clearly */
  background:linear-gradient(180deg, var(--b-top) 0%, var(--b-mid) 55%, var(--b-bot) 100%);
  box-shadow:inset 0 .1em 0 rgba(255,255,255,.55), inset 0 -.1em 0 rgba(0,0,0,.12), 0 .22em 0 var(--b-edge), 0 .36em .5em rgba(0,0,0,.45);
  transition:transform .08s, box-shadow .08s, opacity .25s, filter .25s; }
.f3-btn::before { content:""; position:absolute; left:.4em; right:.4em; top:.1em; height:42%; border-radius:.55em .55em 1.2em 1.2em;
  background:linear-gradient(rgba(255,255,255,.6), rgba(255,255,255,.08)); pointer-events:none; }
.f3-btn:active:not(:disabled) { transform:translateY(.17em);
  box-shadow:inset 0 .1em 0 rgba(255,255,255,.55), inset 0 -.1em 0 rgba(0,0,0,.12), 0 .05em 0 var(--b-edge), 0 .12em .2em rgba(0,0,0,.4); }
.f3-btn:disabled { opacity:.45; filter:grayscale(.6); cursor:default; }
.f3-yellow { --b-top:#fff38a; --b-mid:#ffd11c; --b-bot:#f5a300; --b-edge:#9a5200; }
.f3-cyan   { --b-top:#b8f4ff; --b-mid:#4fd2f6; --b-bot:#1ca3dc; --b-edge:#0a5a86; }
.f3-green  { --b-top:#c4ffbd; --b-mid:#62e07c; --b-bot:#2db451; --b-edge:#146b37; }

@media (prefers-reduced-motion: reduce) { .f3-l { animation:none; } }
`;

// Big 3D word. Letters pop in one by one, starting after `delay` ms, `stagger` ms apart.
export function Word3D({ text, palette = "gold", delay = 0, stagger = 70, style }: {
  text: string; palette?: "gold" | "blue"; delay?: number; stagger?: number; style?: CSSProperties;
}) {
  return (
    <span className={`f3-word f3-${palette}`} style={style} aria-label={text} role="text">
      {Array.from(text).map((ch, i) =>
        ch === " " ? (
          <span key={i} className="f3-sp" />
        ) : (
          <span key={i} className="f3-l" style={{ ["--d" as string]: `${delay + i * stagger}ms` } as CSSProperties} aria-hidden="true">
            <span className="f3-back">{ch}</span>
            <span className="f3-front">{ch}</span>
          </span>
        ),
      )}
    </span>
  );
}

// How long a Word3D takes to finish popping in (ms).
export const word3DDone = (text: string, delay = 0, stagger = 70) => delay + (Array.from(text).length - 1) * stagger + 550;
