// HOW TO PLAY screen (Andy 2026-10-07), one for every game (vocab + grammar), shown before the game starts.
// Look: the game dimmed behind, big chunky gold title (Word3D, same as the Congratulations screens), three pictures
// with green arrows between them popping in LEFT to RIGHT (a pop sound each), super simple English (no Chinese),
// a CONTROLS row (key caps / mouse + a short sentence), an optional tip line, then TAP TO CONTINUE.
// Enter: dim fades in, title pops, items pop in order. Exit: everything shrinks + fades, then the game starts.
// The Daily Prize claim jingle (public/worlds/daily/claim.mp3) plays when the screen opens.
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { FUN3D_CSS, Word3D } from "@/components/Fun3D";
import { KeyCaps, type HintKey } from "@/components/ControlHints";

export type HowStep = { art: ReactNode; text: ReactNode };
export type HowControl = { keys?: HintKey[]; mouse?: boolean; text: ReactNode };
export type HowToProps = {
  title: string; steps: HowStep[]; controls: HowControl[]; tip?: ReactNode;
  bg?: string; muted?: boolean; onDone: () => void;
};

const W = 1600, H = 900;
const T0 = 650, GAP = 300;                        // first item at 0.65s, then one every 0.3s (step, arrow, step, ...)

let actx: AudioContext | null = null;
const pop = (i: number) => {                       // short bright 'pop', a little higher each time
  try {
    actx = actx || new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    if (actx.state === "suspended") actx.resume().catch(() => { });
    const c = actx, t = c.currentTime, o = c.createOscillator(), g = c.createGain();
    o.type = "sine"; o.frequency.setValueAtTime(520 + i * 70, t); o.frequency.exponentialRampToValueAtTime(1250 + i * 120, t + 0.09);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.32, t + 0.012); g.gain.exponentialRampToValueAtTime(0.001, t + 0.16);
    o.connect(g); g.connect(c.destination); o.start(t); o.stop(t + 0.18);
  } catch { /* */ }
};

export const GreenArrow = ({ w = 110 }: { w?: number }) => (
  <svg width={w} height={w * 0.72} viewBox="0 0 110 80" aria-hidden="true">
    <defs><linearGradient id="hw-ga" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#d6ff7a" /><stop offset=".5" stopColor="#5fd83a" /><stop offset="1" stopColor="#2f9a1c" /></linearGradient></defs>
    <path d="M8 28 H58 V8 L102 40 L58 72 V52 H8 Z" fill="url(#hw-ga)" stroke="#1d5a10" strokeWidth="6" strokeLinejoin="round" />
    <path d="M16 34 H64 V22 L88 38" fill="none" stroke="rgba(255,255,255,.65)" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default function HowToPlay({ title, steps, controls, tip, bg, muted, onDone }: HowToProps) {
  // FIT (Andy 2026-10-07: cut off on full screen): measure the REAL content size (it can be taller/wider than 1600x900)
  // and shrink it so everything always shows, on any window shape. Re-measures when pictures/fonts load or the window changes.
  const stageRef = useRef<HTMLDivElement>(null);
  const fit = () => {
    const el = stageRef.current;
    let cw = W, ch = H;
    if (el) { ch = Math.max(H, el.offsetHeight); for (const k of Array.from(el.children) as HTMLElement[]) cw = Math.max(cw, k.offsetWidth + 60); }
    return Math.min(window.innerWidth / cw, window.innerHeight / ch) * 0.97;
  };
  const [s, setS] = useState(() => Math.min(window.innerWidth / W, window.innerHeight / H) * 0.97);
  useEffect(() => {
    const on = () => setS(fit());
    on();
    window.addEventListener("resize", on);
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(on) : null;
    if (ro && stageRef.current) { ro.observe(stageRef.current); for (const k of Array.from(stageRef.current.children)) ro.observe(k); }
    document.fonts?.ready.then(on).catch(() => { });
    return () => { window.removeEventListener("resize", on); ro?.disconnect(); };
  }, []);
  const [out, setOut] = useState(false);
  const ready = useRef(false);
  const n = steps.length * 2 - 1;                  // steps + arrows
  const tCtrl = T0 + n * GAP + 150, tTip = tCtrl + 300, tTap = (tip ? tTip : tCtrl) + 450;
  useEffect(() => {
    const ts: number[] = [];
    if (!muted) { const a = new Audio("/worlds/daily/claim.mp3"); a.volume = 0.5; a.play().catch(() => { }); }
    for (let i = 0; i < n; i++) if (i % 2 === 0) ts.push(window.setTimeout(() => { if (!muted) pop(i / 2); }, T0 + i * GAP));
    ts.push(window.setTimeout(() => { ready.current = true; }, 900));
    return () => ts.forEach(t => window.clearTimeout(t));
  }, []);
  const close = () => {
    if (!ready.current || out) return;
    setOut(true);
    window.setTimeout(onDone, 380);
  };
  const d = (ms: number) => ({ animationDelay: `${ms}ms` } as CSSProperties);
  return (
    <div className={"hw-root" + (out ? " out" : "")} onPointerDown={close} role="dialog" aria-label={`How to play ${title}`}>
      <style>{FUN3D_CSS + CSS}</style>
      {bg && <div className="hw-bg" style={{ backgroundImage: `url(${bg})` }} />}
      <div className="hw-dim" />
      <div ref={stageRef} className="hw-stage" style={{ transform: `translate(-50%,-50%) scale(${s})` }}>
        <div className="hw-title"><Word3D text={title} palette="gold" stagger={55} style={{ fontSize: title.length > 14 ? 92 : 112 }} /></div>
        <div className={"hw-row" + (steps.length > 3 ? " many" : "")}>
          {steps.map((st, i) => (
            <div key={i} className="hw-cell">
              <div className="hw-step" style={d(T0 + i * 2 * GAP)}>
                <div className="hw-art">{st.art}</div>
                <div className="hw-cap">{st.text}</div>
              </div>
              {i < steps.length - 1 && <div className="hw-arrow" style={d(T0 + (i * 2 + 1) * GAP)}><GreenArrow /></div>}
            </div>
          ))}
        </div>
        <div className="hw-ctrls" style={d(tCtrl)}>
          {controls.map((c, i) => (
            <div key={i} className="hw-ctrl">
              <KeyCaps keys={c.keys || []} mouse={c.mouse} big />
              <span className="hw-ctext">{c.text}</span>
            </div>
          ))}
        </div>
        {tip && <div className="hw-tip" style={d(tTip)}>{tip}</div>}
        <div className="hw-tap" style={d(tTap)}>TAP TO CONTINUE</div>
      </div>
    </div>
  );
}

const CSS = `
.hw-root{position:fixed;inset:0;z-index:400;overflow:hidden;cursor:pointer;user-select:none;-webkit-user-select:none}
.hw-bg{position:absolute;inset:-20px;background:center/cover no-repeat;filter:blur(3px) saturate(.9);animation:hw-fade .5s ease-out both}
.hw-dim{position:absolute;inset:0;background:radial-gradient(ellipse at 50% 45%,rgba(10,14,40,.72),rgba(4,6,20,.9));animation:hw-fade .5s ease-out both}
.hw-root.out .hw-dim,.hw-root.out .hw-bg{animation:hw-fadeout .38s ease-in both}
@keyframes hw-fade{from{opacity:0}to{opacity:1}}
@keyframes hw-fadeout{from{opacity:1}to{opacity:0}}
.hw-stage{position:absolute;left:50%;top:50%;width:${W}px;min-height:${H}px;transform-origin:50% 50%;display:flex;flex-direction:column;align-items:center}
.hw-root.out .hw-stage>*{animation:hw-away .36s cubic-bezier(.5,0,.8,.6) both !important}
@keyframes hw-away{to{opacity:0;transform:scale(.6)}}
.hw-title{margin-top:26px;height:140px;display:flex;align-items:center;filter:drop-shadow(0 8px 14px rgba(0,0,0,.45))}
.hw-row{display:flex;align-items:flex-start;justify-content:center;margin-top:24px;min-height:340px}
.hw-cell{display:flex;align-items:flex-start}
.hw-step{width:400px;display:flex;flex-direction:column;align-items:center;animation:hw-pop .5s cubic-bezier(.25,1.6,.45,1) both}
.hw-art{position:relative;width:340px;height:250px;display:flex;align-items:center;justify-content:center}
.hw-cap{margin-top:16px;width:400px;text-align:center;font-family:'Lilita One','Fredoka',sans-serif;font-size:40px;line-height:1.12;color:#fff;
 -webkit-text-stroke:6px #1d1240;paint-order:stroke fill;text-shadow:0 4px 0 #1d1240}
.hw-cap b,.hw-ctext b,.hw-tip b{color:#ffd84a;font-weight:400}
.hw-cap em,.hw-tip em{color:#ff6f91;font-style:normal}
.hw-arrow{margin-top:86px;animation:hw-pop .45s cubic-bezier(.25,1.6,.45,1) both}
.hw-arrow svg{display:block;animation:hw-nudge 1.2s ease-in-out 1.4s infinite}
.hw-row.many .hw-step{width:330px}.hw-row.many .hw-art{width:300px}.hw-row.many .hw-cap{width:330px;font-size:36px}
.hw-row.many .hw-arrow{margin-top:96px}.hw-row.many .hw-arrow svg{width:84px;height:60px}
@keyframes hw-nudge{0%,100%{transform:translateX(0)}50%{transform:translateX(8px)}}
@keyframes hw-jump{0%{transform:translateY(0)}100%{transform:translateY(-22px)}}
@keyframes hw-pop{0%{opacity:0;transform:scale(.25)}60%{opacity:1;transform:scale(1.12)}100%{opacity:1;transform:scale(1)}}
.hw-ctrls{display:flex;gap:56px;align-items:center;justify-content:center;margin-top:6px;animation:hw-pop .5s cubic-bezier(.25,1.6,.45,1) both}
.hw-ctrl{display:flex;align-items:center;gap:16px;background:rgba(255,255,255,.08);border:2px solid rgba(255,255,255,.18);border-radius:999px;padding:10px 26px 10px 14px}
.hw-ctext{font-family:'Lilita One','Fredoka',sans-serif;font-size:34px;color:#fff;-webkit-text-stroke:5px #1d1240;paint-order:stroke fill;white-space:nowrap}
.hw-tip{margin-top:20px;text-align:center;line-height:1.22;font-family:'Lilita One','Fredoka',sans-serif;font-size:38px;color:#fff;-webkit-text-stroke:6px #1d1240;paint-order:stroke fill;text-shadow:0 4px 0 #1d1240;animation:hw-pop .5s cubic-bezier(.25,1.6,.45,1) both}
.hw-tap{margin-top:auto;margin-bottom:22px;padding-top:18px;font-family:'Lilita One','Fredoka',sans-serif;font-size:40px;letter-spacing:1px;color:#fff;-webkit-text-stroke:6px #1d1240;paint-order:stroke fill;
 opacity:0;animation:hw-fade .4s ease-out both,hw-blink 1.4s ease-in-out infinite}
@keyframes hw-blink{0%,100%{opacity:1}50%{opacity:.45}}
@media (prefers-reduced-motion: reduce){.hw-step,.hw-arrow,.hw-ctrls,.hw-tip{animation:none}.hw-arrow svg,.hw-tap{animation:none;opacity:1}}
`;
