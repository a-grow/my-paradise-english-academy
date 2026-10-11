// "Puzzle Mixup!" word (Andy 2026-10-11): "Puzzle" in white, "Mixup!" = every letter a different colour + tilted a
// different way, gently wobbling (all the worlds got mixed up). Used on the world-page button AND the puzzle page title.
import type { CSSProperties } from "react";

const MIX_COLORS = ["#ff5fa8", "#ffd23a", "#46d8ff", "#7ee04f", "#ff9b2f", "#c99bff"];
const MIX_ROT = [-12, 9, -7, 11, -9, 8];
const MIX_DY = [0.03, -0.07, 0.05, -0.04, 0.06, -0.05];

export function MixupWord({ size, twoLines = false, pop = false, className, style }: {
  size: number; twoLines?: boolean; pop?: boolean; className?: string; style?: CSSProperties;
}) {
  const v = (o: Record<string, string>) => o as CSSProperties;
  return (
    <span className={"mx-word" + (twoLines ? " two" : "") + (pop ? " pop" : "") + (className ? " " + className : "")}
      style={{ fontSize: size, ...style }} aria-label="Puzzle Mixup!" role="text">
      <span className="mx-a" aria-hidden="true">
        {Array.from("Puzzle").map((c, i) => <span key={i} className="mx-l" style={v({ "--d": `${i * 45}ms` })}>{c}</span>)}
      </span>
      <span className="mx-b" aria-hidden="true">
        {Array.from("Mixup!").map((c, i) => (
          <span key={i} className="mx-l mx-c" style={{ color: MIX_COLORS[i], ...v({ "--r": `${MIX_ROT[i]}deg`, "--y": `${MIX_DY[i]}em`, "--d": `${(6 + i) * 45}ms`, "--w": `${(i * -0.37).toFixed(2)}s` }) }}>{c}</span>
        ))}
      </span>
    </span>
  );
}

export const MIXUP_CSS = `
.mx-word{display:inline-flex;align-items:baseline;gap:.24em;font-family:'Lilita One',sans-serif;font-weight:400;line-height:1;white-space:nowrap}
.mx-word.two{flex-direction:column;align-items:center;gap:0}
.mx-a,.mx-b{display:inline-flex;align-items:baseline}
.mx-l{display:inline-block;color:#fff;-webkit-text-stroke:.14em #3a1270;paint-order:stroke fill;
 text-shadow:0 .07em 0 #3a1270,0 .13em .12em rgba(0,0,0,.35);transform:rotate(var(--r,0deg)) translateY(var(--y,0em))}
.mx-c{margin:0 .015em;animation:mx-wob 2.8s var(--w,0s) ease-in-out infinite}
.mx-word.pop .mx-l{animation:mx-pop .55s var(--d) cubic-bezier(.25,1.6,.45,1) backwards}
.mx-word.pop .mx-c{animation:mx-pop .55s var(--d) cubic-bezier(.25,1.6,.45,1) backwards,mx-wob 2.8s calc(var(--d) + .6s) ease-in-out infinite}
@keyframes mx-pop{0%{opacity:0;transform:rotate(var(--r,0deg)) translateY(.5em) scale(.2)}
 60%{opacity:1;transform:rotate(var(--r,0deg)) translateY(-.1em) scale(1.25)}100%{opacity:1;transform:rotate(var(--r,0deg)) translateY(var(--y,0em))}}
@keyframes mx-wob{0%,100%{transform:rotate(var(--r,0deg)) translateY(var(--y,0em))}
 50%{transform:rotate(calc(var(--r,0deg) * -0.45)) translateY(calc(var(--y,0em) - .06em))}}
@media (prefers-reduced-motion: reduce){.mx-l,.mx-c,.mx-word.pop .mx-l,.mx-word.pop .mx-c{animation:none}}
`;
