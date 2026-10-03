// OCEAN = settings for the shared new look (newLook.tsx). Step 6, 2026-10-03.
// Approved look = the standalone preview (BACKUPFILES/world3_art/preview/template.html): no ground, so the animals
// FLOAT; 14 bubbles rise + wobble; 5 foreground plants sway from their base (the only moving scenery allowed).
// Animal pictures = public/worlds/ocean/<animal>-<stage>.webp (framed like the preview, made from /creatures).
import { makeLook } from "./newLook";

const W = "/worlds/ocean";

// 14 bubbles, fixed pseudo-random numbers (same every load): [left px, size px, rise s, wobble s, rise delay s, wobble delay s]
const BUBBLES = (() => {
  let seed = 7;
  const r = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  return Array.from({ length: 14 }, () => [80 + r() * 1440, 10 + r() * 26, 7 + r() * 7, 2 + r() * 2, -r() * 14, -r() * 3]);
})();
// 5 plants (preview order): [picture number, left px, height px, sway s, delay s, bottom px]
const PLANTS = [[3, 200, 480, 5.2, 0, -30], [4, 455, 210, 6.4, -2, -24], [1, 1095, 400, 4.6, -1, -30], [2, 1235, 520, 5.8, -3, -30], [5, 60, 420, 5, -2.5, -30]];

const OceanScene = () => (
  <>
    <style>{CSS}</style>
    <img className="oc-bg" src={`${W}/bg.jpg`} alt="" />
    <div className="oc-bubbles">
      {BUBBLES.map((b, i) => (
        <i key={i} style={{ left: b[0], width: b[1], height: b[1], animationDuration: `${b[2]}s,${b[3]}s`, animationDelay: `${b[4]}s,${b[5]}s` }} />
      ))}
    </div>
    {PLANTS.map(p => (
      <img key={p[0]} className="oc-plant" src={`${W}/plant${p[0]}.webp`} alt=""
        style={{ left: p[1], height: p[2], bottom: p[5], animationDuration: `${p[3]}s`, animationDelay: `${p[4]}s` }} />
    ))}
  </>
);

const CSS = `
.oc-bg{position:absolute;left:0;top:0;width:1600px;height:1000px;max-width:none;pointer-events:none}
.oc-bubbles{position:absolute;inset:0;overflow:hidden;pointer-events:none}
.oc-bubbles i{position:absolute;bottom:-60px;border-radius:50%;
 background:radial-gradient(circle at 32% 30%,rgba(255,255,255,.95) 0 14%,rgba(255,255,255,.25) 22%,rgba(180,230,255,.12) 55%,rgba(255,255,255,.55) 72%,rgba(255,255,255,0) 76%);
 animation-name:oc-up,oc-wob;animation-timing-function:linear,ease-in-out;animation-iteration-count:infinite,infinite}
@keyframes oc-up{0%{transform:translateY(0);opacity:0}8%{opacity:.9}85%{opacity:.85}100%{transform:translateY(-1120px);opacity:0}}
@keyframes oc-wob{0%,100%{margin-left:-8px}50%{margin-left:8px}}
.oc-plant{position:absolute;width:auto;max-width:none;transform-origin:50% 100%;animation:oc-sway 5s ease-in-out infinite;pointer-events:none;filter:drop-shadow(0 6px 6px rgba(0,30,60,.35))}
@keyframes oc-sway{0%,100%{transform:rotate(-2.2deg)}50%{transform:rotate(2.2deg)}}
@media (prefers-reduced-motion: reduce){.oc-bubbles i,.oc-plant{animation:none}}
`;

export const OCEAN_LOOK = makeLook({
  title: "Ocean", titleImg: null, dir: W, fill: `${W}/bg.jpg`, Scene: OceanScene,
  music: `${W}/music.mp3`, loadingBg: "#0c3460",
  move: "float",
  // the widest swimmers get 1.18x (they are already edge-to-edge in their square) - preview ZOOM table
  zoom: { "dolphin-young": 1.18, "dolphin-grown": 1.18, "shark-young": 1.18, "shark-grown": 1.18, "mantaray-young": 1.18, "mantaray-grown": 1.18 },
});
