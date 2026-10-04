// DINO = settings for the shared new look (newLook.tsx). Step 6, 2026-10-03.
// Approved look = the standalone preview (BACKUPFILES/world3_art/preview/template.html): the original pictures WITH
// their faded dirt patch (no added shadows); dinos DO NOT MOVE (no breathing, wobble or hop); land stages are dropped
// onto the sand path (DY); the pterodactyl young/grown fly (bob) over a faint oval ground shadow.
import { makeLook } from "./newLook";

const W = "/worlds/dino";

const DinoScene = () => (
  <>
    <img className="sv-bg" src={`${W}/far.jpg`} alt="" style={{ height: 1000, bottom: 0 }} />
    {/* VOLCANO SMOKE (Andy 2026-10-04): slow, faint, far away - 9 soft ash-grey puffs rise from the crater (1030,146), drift
        a little with the wind, grow and fade (~10s each, one after another). Drawn in the scene = behind every button. */}
    <style>{SMOKE_CSS}</style>
    <div className="dn-smoke" aria-hidden="true">
      {PUFFS.map((f, i) => <i key={i} style={{ width: f.size, height: f.size, margin: -f.size / 2, animationDuration: `${f.dur}s`,
        animationDelay: `${f.delay}s`, ["--dx" as string]: `${f.dx}px`, ["--r" as string]: `${f.rot}deg`, ["--s" as string]: f.grow,
        ["--o" as string]: f.op } as React.CSSProperties} />)}
    </div>
    <img className="sv-bg" src={`${W}/front.webp`} alt="" style={{ height: 1000, bottom: -140 }} />
  </>
);

// BILLOWING SMOKE (Andy 2026-10-04 16:42): 16 lumpy puffs of different sizes and speeds; each rolls (turns) as it rises,
// drifts out sideways (the plume widens) and grows, and keeps going up past the top of the screen. Fixed numbers (same every time).
const PUFFS = (() => {
  let seed = 23;
  const r = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  const N = 16, D = 7.5;
  return Array.from({ length: N }, (_, i) => {
    const dur = 6 + r() * 3;
    return { size: 55 + r() * 70, dur, delay: -(i / N) * D - r() * 0.4, dx: (r() - 0.35) * 190,
      rot: (r() < 0.5 ? -1 : 1) * (60 + r() * 120), grow: (2.4 + r() * 1.8).toFixed(2), op: (0.7 + r() * 0.3).toFixed(2) };
  });
})();

const SMOKE_CSS = `
/* v3 (Andy 14:29, fixed 2026-10-04): v2 was a light pink-grey = the SAME colour as the dusky sky, so it vanished.
   Now soft ASH-GREY (darker than the sky) puffing from the crater (1030,146) and blown RIGHT, so the plume leaves the
   top bar's corner into open sky. Blurred + see-through = still far away. */
.dn-smoke{position:absolute;left:1030px;top:146px;width:0;height:0;pointer-events:none}
/* v5 billow (Andy 16:42): each puff = 3 offset soft lumps -> it looks like rolling smoke when it turns */
.dn-smoke i{position:absolute;left:0;top:0;border-radius:50%;opacity:0;filter:blur(5px);
 background:radial-gradient(circle at 35% 40%,rgba(68,54,62,.95) 0%,rgba(86,72,80,.6) 30%,rgba(100,86,94,0) 56%),
  radial-gradient(circle at 66% 58%,rgba(76,62,70,.9) 0%,rgba(94,80,88,.55) 28%,rgba(100,86,94,0) 52%),
  radial-gradient(circle at 50% 50%,rgba(90,76,84,.55) 0%,rgba(100,86,94,0) 70%);
 animation-name:dn-puff;animation-timing-function:cubic-bezier(.25,.2,.6,1);animation-iteration-count:infinite}
/* v4 (Andy 2026-10-04 16:22): STRAIGHT UP behind the stage sign (only a hair of lean); wider at the top so its right side
   shows past the sign. */
@keyframes dn-puff{0%{opacity:0;transform:translate(0,0) rotate(0) scale(.35)}
 10%{opacity:var(--o);transform:translate(calc(var(--dx) * .05),-28px) rotate(calc(var(--r) * .12)) scale(calc(var(--s) * .3))}
 50%{opacity:var(--o);transform:translate(calc(var(--dx) * .45),-150px) rotate(calc(var(--r) * .55)) scale(calc(var(--s) * .65))}
 85%{opacity:calc(var(--o) * .6)}
 100%{opacity:0;transform:translate(var(--dx),-330px) rotate(var(--r)) scale(var(--s))}}
@media (prefers-reduced-motion: reduce){.dn-smoke i{animation:none;opacity:0}}
`;

export const DINO_LOOK = makeLook({
  title: "Dino", titleImg: null, dir: W, fill: `${W}/far.jpg`, Scene: DinoScene,
  music: `${W}/music.mp3`, loadingBg: "#3a2a12",
  move: "still",
  fly: ["pterodactyl-young", "pterodactyl-grown"],
  zoom: { "brontosaurus-grown": 2.05, "pterodactyl-young": 1.3, "pterodactyl-grown": 1.75 },
  zoomOrigin: { "brontosaurus-grown": "54.2% 90.5%" },  // grows from its back feet
  // drop each land dino so its dirt patch sits on the sand, just above 'Name your pet!' (preview DY table)
  dy: {
    "triceratops-egg": 10, "triceratops-baby": 40, "triceratops-young": 50, "triceratops-grown": 11,
    "pterodactyl-egg": 36, "pterodactyl-baby": 87,
    "velociraptor-egg": 44, "velociraptor-baby": 78, "velociraptor-young": 102, "velociraptor-grown": 102,
    "brontosaurus-egg": 9, "brontosaurus-baby": 28, "brontosaurus-young": 40,
    "dilophosaurus-egg": 11, "dilophosaurus-baby": 7, "dilophosaurus-young": 40, "dilophosaurus-grown": 67,
    "trex-egg": 19, "trex-baby": 8, "trex-young": 59, "trex-grown": 56,
  },
});
