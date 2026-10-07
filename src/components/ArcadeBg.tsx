// The arcade-room picture behind the vocab hub screens (choose book / unit / game).
// The picture is drawn "cover" (like a CSS background) and the glow effects sit on top at the same spots in the picture:
// the string lights twinkle on and off at random like Christmas lights, the arcade screens glow, the two stars glow.
import type { CSSProperties } from "react";

const W = 1326, H = 732; // size of the picture
const R = W / H;

// [x, y, colour] of each bulb in the picture
const BULBS: [number, number, string][] = [
  [238, 32, "#5ff3ff"], [337, 48, "#ffe14d"], [388, 34, "#ff6fa8"], [423, 38, "#6dff6d"], [470, 54, "#ff5a4d"], [527, 57, "#ffe14d"],
  [582, 50, "#5ff3ff"], [634, 34, "#ff9a2e"], [693, 34, "#ff9a2e"], [745, 51, "#5ff3ff"], [800, 58, "#ffe14d"], [856, 54, "#ff5a4d"],
  [903, 38, "#6dff6d"], [938, 34, "#ff6fa8"], [989, 48, "#ffe14d"], [1088, 31, "#5ff3ff"],
];
// [x, y, width, height, colour] of each arcade screen
const SCREENS: [number, number, number, number, string][] = [
  [109, 372, 108, 112, "#9ff6ff"], [205, 366, 88, 100, "#ff9ff0"], [338, 352, 78, 82, "#ffe98a"],
  [933, 352, 74, 82, "#9ff6ff"], [1052, 364, 86, 96, "#ff9ff0"], [1176, 376, 98, 108, "#9fffc4"],
];
const STARS: [number, number][] = [[287, 101], [1037, 101]];

const pc = (x: number, y: number): CSSProperties => ({ left: `${(x / W) * 100}%`, top: `${(y / H) * 100}%` });
const u = (n: number) => `calc(var(--u) * ${n})`;

const CSS = `
@keyframes abBulb{0%,100%{opacity:0;transform:translate(-50%,-50%) scale(.55)}16%{opacity:1;transform:translate(-50%,-50%) scale(1.25)}34%{opacity:.4;transform:translate(-50%,-50%) scale(.95)}58%{opacity:0;transform:translate(-50%,-50%) scale(.6)}}
@keyframes abScreen{0%,100%{opacity:.30}30%{opacity:.85}55%{opacity:.45}78%{opacity:.7}}
@keyframes abStar{0%,100%{opacity:.55;transform:translate(-50%,-50%) scale(.9)}50%{opacity:1;transform:translate(-50%,-50%) scale(1.35)}}
@media (prefers-reduced-motion: reduce){.ab-fx{animation:none !important}}
`;

export default function ArcadeBg() {
  return (
    <div aria-hidden style={{ position: "fixed", inset: 0, overflow: "hidden", zIndex: 0, pointerEvents: "none", background: "#241046" }}>
      <style>{CSS}</style>
      <div style={{ position: "absolute", left: "50%", top: "50%", width: `max(100vw, calc(100vh * ${R}))`, height: `max(100vh, calc(100vw / ${R}))`,
        transform: "translate(-50%,-50%)", backgroundImage: "url(/vocab/arcade/bg.webp)", backgroundSize: "100% 100%",
        ["--u" as string]: `calc(max(100vw, calc(100vh * ${R})) / ${W})` } as CSSProperties}>
        {SCREENS.map(([x, y, w, h, c], i) => (
          <i key={"s" + i} className="ab-fx" style={{ position: "absolute", ...pc(x, y), width: u(w), height: u(h), borderRadius: u(10), background: c,
            filter: `blur(${u(5)})`, boxShadow: `0 0 ${u(34)} ${c}`, mixBlendMode: "screen",
            animation: `abScreen ${3.2 + (i % 3) * 0.9}s ease-in-out ${-i * 0.7}s infinite` }} />
        ))}
        {BULBS.map(([x, y, c], i) => (
          <i key={"b" + i} className="ab-fx" style={{ position: "absolute", ...pc(x, y), width: u(46), height: u(46), borderRadius: "50%",
            background: `radial-gradient(circle, #fff 0%, ${c} 24%, ${c}00 68%)`, mixBlendMode: "screen", opacity: 0,
            animation: `abBulb ${2.6 + ((i * 37) % 29) / 10}s ease-in-out ${-((i * 53) % 47) / 10}s infinite` }} />
        ))}
        {STARS.map(([x, y], i) => (
          <i key={"t" + i} className="ab-fx" style={{ position: "absolute", ...pc(x, y), width: u(120), height: u(120), borderRadius: "50%",
            background: "radial-gradient(circle, rgba(255,240,140,.95) 0%, rgba(255,214,60,.55) 30%, rgba(255,200,40,0) 70%)", mixBlendMode: "screen",
            animation: `abStar ${2.4 + i * 0.5}s ease-in-out ${-i * 1.1}s infinite` }} />
        ))}
      </div>
    </div>
  );
}
