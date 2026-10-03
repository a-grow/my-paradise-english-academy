import { useEffect, useState } from "react";
import { FUN3D_CSS, Word3D } from "@/components/Fun3D";

// Lose screen for the grammar games (all 4 wrappers use this one file).
// Teacher Andy slides up like on the win screen, points at the buttons and tilts his head kindly.
// VISUAL ONLY: no treats won or lost. Buttons work right away.
type Props = {
  muted: boolean;
  onTryAgain: () => void;
  onChooseGame: () => void;
  onReturnToWorld: () => void;
  title?: string;   // default 'Out of hearts!' (vocab games: 'Out of time!' when the clock ran out - 2026-10-04)
};

const ART = "/celebration/";
const IMG = { body: ART + "andy_sad_body.webp", head: ART + "andy_sad_head.webp" };
const LOSE_SFX = ART + "game_over.mp3";   // plays once as the screen opens (the wrapper fades the game music out)
const TITLE = "Out of hearts!";

if (typeof window !== "undefined") {
  Object.values(IMG).forEach((src) => { const i = new Image(); i.src = src; });
}

const CSS = `
.ls-root { position:fixed; inset:0; z-index:60; --u:min(1vh,0.75vw);
  --shift:max(0px, calc(var(--u) * 54 + 165px - 50vw)); overflow:hidden; color:#fff;
  background:rgba(0,0,0,0.75); backdrop-filter:blur(8px); -webkit-backdrop-filter:blur(8px); font-family:Fredoka, sans-serif; }
.ls-center { position:absolute; inset:0; padding-left:calc(var(--shift) * 2); display:flex; flex-direction:column;
  align-items:center; justify-content:center; gap:28px; text-align:center; }
.ls-title { font-size:max(52px, calc(var(--u) * 8.4)); }
.ls-btns { display:flex; flex-direction:column; gap:22px; animation:ls-popIn .45s .75s cubic-bezier(.3,1.7,.5,1) both; }

.ls-andy { position:absolute; right:calc(50% + var(--u) * 6 + 165px - var(--shift)); bottom:calc(var(--u) * -30);
  height:calc(var(--u) * 84); aspect-ratio:478/834; pointer-events:none; transform:translateY(110%); }
.ls-andy.in { animation:ls-andyIn .75s cubic-bezier(.25,1.45,.45,1) forwards; }
.ls-sway { width:100%; height:100%; transform-origin:50% 100%; animation:ls-sway 4.6s ease-in-out infinite; }
.ls-breathe { position:relative; width:100%; height:100%; transform-origin:50% 100%; animation:ls-breathe 2.6s ease-in-out infinite; }
.ls-andy img { position:absolute; inset:0; width:100%; height:100%; object-fit:contain; user-select:none; }
.ls-body { filter:drop-shadow(0 10px 18px rgba(0,0,0,.45)); }
/* the head turns around his neck (31.17% / 33.81% of the picture) */
.ls-head { transform-origin:31.17% 33.81%; animation:ls-tiltIn .9s .7s ease-out both, ls-tilt 4.2s 1.6s ease-in-out infinite; }
@media (max-width:560px) { .ls-andy { display:none; } .ls-center { padding-left:0; } }
@media (max-height:520px) { .ls-center { gap:14px; } .ls-btns { gap:14px; } .ls-title { font-size:44px; } }

@keyframes ls-popIn { from{opacity:0; transform:scale(.4)} to{opacity:1; transform:scale(1)} }
@keyframes ls-andyIn { from{transform:translateY(110%) rotate(-6deg)} to{transform:translateY(0) rotate(0)} }
@keyframes ls-sway { 0%,100%{transform:rotate(-.7deg)} 50%{transform:rotate(.7deg)} }
@keyframes ls-breathe { 0%,100%{transform:scale(1,1)} 50%{transform:scale(.994,1.01)} }
@keyframes ls-tiltIn { from{transform:rotate(0)} to{transform:rotate(5deg)} }
@keyframes ls-tilt { 0%,100%{transform:rotate(5deg)} 30%{transform:rotate(7deg)} 60%{transform:rotate(3.5deg)} }
@media (prefers-reduced-motion: reduce) { .ls-sway, .ls-breathe, .ls-head { animation:none; } .ls-andy.in { animation:none; transform:none; } }
`;

export default function LoseScreen({ muted, onTryAgain, onChooseGame, onReturnToWorld, title = TITLE }: Props) {
  const [andyIn, setAndyIn] = useState(false);
  useEffect(() => {
    const t = window.setTimeout(() => setAndyIn(true), 150);
    const sfx = new Audio(LOSE_SFX);
    sfx.volume = 0.8;
    if (!muted) sfx.play().catch(() => {});
    return () => { clearTimeout(t); sfx.pause(); };
    // runs once when the lose screen opens
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="ls-root">
      <style>{FUN3D_CSS + CSS}</style>

      <div className={`ls-andy${andyIn ? " in" : ""}`}>
        <div className="ls-sway"><div className="ls-breathe">
          <img className="ls-body" src={IMG.body} alt="" draggable={false} />
          <img className="ls-head" src={IMG.head} alt="" draggable={false} />
        </div></div>
      </div>

      <div className="ls-center">
        <div className="ls-title"><Word3D text={title} palette="blue" delay={150} stagger={45} /></div>
        <div className="ls-btns">
          <button className="f3-btn f3-green" onClick={onTryAgain}>Try Again</button>
          <button className="f3-btn f3-yellow" onClick={onChooseGame}>Choose Game</button>
          <button className="f3-btn f3-cyan" onClick={onReturnToWorld}>Return to World</button>
        </div>
      </div>
    </div>
  );
}
