// LAUNCH GIFT (launch step 7, Andy 2026-10-13/15): the first time a kid opens any world on 2.0, after How to Play,
// a present pops up in the middle: "A Gift from Teacher Andy!" + button "Thank you, Teacher Andy!". Tap = the present
// shakes, the lid pops off, the box glows -> onOpen() (the world page asks the DATABASE for prize 'gift:launch' = 10
// treats, once per kid) -> onTreats() (the world page flies the treats into the jar with the win parade) -> fades out.
// LOOK ONLY: amounts + "once" live in the database (mpe_claim_prize v5). Art: public/worlds/gift (originals BACKUPFILES/gift_art).
import { useEffect, useRef, useState, type CSSProperties } from "react";

const G = "/worlds/gift";
const BOX_W = 250;                          // closed present width on the stage (art 438 x 525)
const SC = BOX_W / 438;
const ANDY_H = 600, ANDY_W = Math.round(600 * 459 / 900);   // Teacher Andy pictures 459 x 900 (all share one crop)
// CLAP frames, hands together -> apart (in-between pictures go in the middle, in order); played back and forth
const CLAP = ["andy_clap_flat", "andy_clap_mid", "andy_clap_out"];   // flat palms (clap sound) -> halfway -> apart (Andy 10-15; old in/almost unused)
const CLAP_MS = 90;                     // the 3 present pictures share one scale (same Gemini sheet)

export default function LaunchGift({ cx, sh, sfxOn, message, onOpen, onTreats, onDone }: {
  cx: number; sh: number; sfxOn: boolean; message?: string; onOpen: () => void; onTreats: () => void; onDone: () => void;
}) {
  // in -> idle (waits for the tap) -> shake -> open (lid flies off) -> out (fades while the treats fly) -> onDone
  const [phase, setPhase] = useState<"in" | "idle" | "shake" | "open" | "out">("in");
  // TEACHER ANDY (Andy 10-15): slides up beside the present like on the game win screen (same sway / breathe / blink),
  // presenting it ("Here you go!"); when the lid pops he CLAPS (2 pictures swapped fast) and hops. Art: public/worlds/gift/andy_*.
  const [eyes, setEyes] = useState(false);                     // blink
  const [clap, setClap] = useState<number | null>(null);      // index in CLAP (0 = hands together), null = presenting pose
  const [leave, setLeave] = useState(false);                  // done clapping: slides off to the right (Andy 10-15)
  const clapping = useRef(false);
  const ac = useRef<AudioContext | null>(null);
  const timers = useRef<number[]>([]);
  const later = (fn: () => void, ms: number) => { timers.current.push(window.setTimeout(fn, ms)); };
  const play = (f: string, vol: number) => { if (!sfxOn) return; try { const a = new Audio(f); a.volume = vol; a.play().catch(() => { }); } catch { /* */ } };
  const rowY = Math.round(sh * 0.42);       // = WinParade's row: the treats pop up right out of the box
  const bottom = rowY + Math.round(525 * SC / 2);   // the box stands here (closed + open share the bottom)

  useEffect(() => {
    later(() => play("/celebration/win_pop.mp3", 0.7), 300);   // the present pops in
    later(() => setPhase(p => (p === "in" ? "idle" : p)), 1300);
    const blinkLoop = () => later(() => { setEyes(true); later(() => setEyes(false), 140); blinkLoop(); }, 2500 + Math.random() * 2000);
    blinkLoop();
    return () => { timers.current.forEach(t => window.clearTimeout(t)); ac.current?.close().catch(() => { }); };
  }, []);   // eslint-disable-line react-hooks/exhaustive-deps

  // CLAP SOUND = the FIRST clap of Andy's freesound clip (hand-clap-106596, original in BACKUPFILES/gift_art/sounds),
  // cut to 0.24s; it plays on the hands-together frame
  const clapSnd = () => play(`${G}/clap.mp3`, 0.45);
  const startClap = () => {
    clapping.current = true;
    const idx = CLAP.map((_, i) => i);                       // 0,1,..,N-1 then back N-2..1 (ping-pong)
    const seq = [...idx, ...idx.slice(1, -1).reverse()];
    let k = 0;
    const step = () => { if (!clapping.current) return; const i = seq[k % seq.length]; setClap(i); if (i === 0) clapSnd(); k++; later(step, CLAP_MS); };
    step();
  };
  const tap = () => {
    if (phase !== "idle") return;
    setPhase("shake");
    play("/celebration/rising_pop.mp3", 0.6);
    later(() => { setPhase("open"); play("/worlds/daily/claim.mp3", 0.6); onOpen(); startClap(); }, 750);
    later(() => onTreats(), 750 + 650);
    later(() => { clapping.current = false; setClap(0); setLeave(true); }, 750 + 900 + 2000);   // claps 2s longer, then slides off right
    later(() => setPhase("out"), 750 + 900 + 2000 + 800);
    later(onDone, 750 + 900 + 2000 + 800 + 700);
  };

  const opened = phase === "open" || phase === "out";
  return (
    <div className={"lg-root" + (phase === "out" ? " out" : "")}>
      <style>{CSS}</style>
      <div className="lg-dim" />
      <img className="lg-title" src={`${G}/gift_title.webp`} alt="A Gift from Teacher Andy!" draggable={false}
        style={{ left: cx, top: rowY - (message ? 362 : 255), width: 760 }} />
      {/* TEACHER GIFT MESSAGE (Andy 2026-10-23): the teacher's one line UNDER the title (Andy 13:07: swapped - the title moves up into the free space) */}
      {message && (
        <div className="lg-msg" style={{ left: cx, top: rowY - 255, fontSize: message.length <= 22 ? 62 : message.length <= 36 ? 50 : 38 }}>{message}</div>
      )}
      <i className={"lg-glow" + (opened ? " big" : "")} style={{ left: cx, top: rowY }} />
      {!opened && (
        <div className="lg-pop" style={{ left: cx, top: bottom }}>
          <img className={"lg-closed" + (phase === "idle" ? " wig" : phase === "shake" ? " shake" : "")} src={`${G}/gift_closed.webp`} alt="" draggable={false} style={{ width: BOX_W }} />
        </div>
      )}
      {opened && (
        <>
          <img className="lg-box" src={`${G}/gift_box.webp`} alt="" draggable={false} style={{ left: cx, top: bottom, width: Math.round(414 * SC) }} />
          <img className="lg-lid" src={`${G}/gift_lid.webp`} alt="" draggable={false} style={{ left: cx, top: bottom - Math.round(525 * SC), width: Math.round(437 * SC) }} />
        </>
      )}
      <div className={"lg-andy" + (leave ? " leave" : "")} style={{ left: cx + 190, top: rowY - 200, width: ANDY_W, height: ANDY_H, ["--out" as string]: `${cx + 300}px` } as CSSProperties}>
        <div className="lg-sway"><div className="lg-breathe"><div className={"lg-hop" + (clap !== null && !leave ? " on" : "")}>
          <img src={`${G}/andy_gift.webp`} alt="" draggable={false} style={{ opacity: clap !== null ? 0 : 1 }} />
          <img src={`${G}/andy_gift_blink.webp`} alt="" draggable={false} style={{ opacity: clap === null && eyes ? 1 : 0 }} />
          {CLAP.map((f, i) => <img key={f} src={`${G}/${f}.webp`} alt="" draggable={false} style={{ opacity: clap === i ? 1 : 0 }} />)}
        </div></div></div>
      </div>
      {(phase === "in" || phase === "idle") && (
        <button className={"lg-btn" + (phase === "idle" ? " sv-tap" : "")} disabled={phase !== "idle"} onClick={tap}
          style={{ left: cx, top: rowY + 235 }}>{/* sv-tap = the world page click sound */}
          <img src={`${G}/gift_btn.webp`} alt="Thank you, Teacher Andy!" draggable={false} style={{ width: 470 }} />
        </button>
      )}
    </div>
  );
}

const CSS = `
.lg-root{position:absolute;inset:0;z-index:72;pointer-events:auto;transition:opacity .7s ease}
.lg-root.out{opacity:0;pointer-events:none}
.lg-dim{position:absolute;inset:0;background:rgba(0,0,0,.75);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);animation:lg-fade .45s ease-out both} /* = the game win screen (Andy 10-15: almost black, the gift stands out) */
@keyframes lg-fade{from{opacity:0}to{opacity:1}}
.lg-title{position:absolute;translate:-50% -50%;filter:drop-shadow(0 6px 8px rgba(0,0,0,.45));animation:lg-drop .7s cubic-bezier(.3,1.5,.5,1) .15s both;pointer-events:none}
@keyframes lg-drop{0%{opacity:0;transform:translateY(-70px) scale(.9)}100%{opacity:1;transform:none}}
.lg-msg{position:absolute;translate:-50% -50%;max-width:1500px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;pointer-events:none;
 font-family:'Lilita One',sans-serif;line-height:1.25;color:#7dffe3;
 text-shadow:4px 0 #3a1468,-4px 0 #3a1468,0 4px #3a1468,0 -4px #3a1468,3px 3px #3a1468,-3px 3px #3a1468,3px -3px #3a1468,-3px -3px #3a1468,0 8px 10px rgba(0,0,0,.55);animation:lg-msgIn .8s cubic-bezier(.3,1.5,.5,1) .5s both,lg-msgBob 3s ease-in-out 1.4s infinite}
@keyframes lg-msgIn{0%{opacity:0;transform:scale(.6)}100%{opacity:1;transform:none}}
@keyframes lg-msgBob{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
.lg-glow{position:absolute;width:520px;height:520px;translate:-50% -50%;border-radius:50%;pointer-events:none;
 background:radial-gradient(closest-side,rgba(255,236,160,.75),rgba(255,214,110,.3) 55%,rgba(255,214,110,0));
 animation:lg-glow .8s ease-out .3s both;transition:transform .6s ease,opacity .6s ease}
.lg-glow.big{transform:scale(1.35)}
@keyframes lg-glow{from{opacity:0;transform:scale(.4)}to{opacity:1;transform:scale(1)}}
.lg-pop{position:absolute;translate:-50% -100%;animation:lg-pop .6s cubic-bezier(.3,1.6,.5,1) .3s both;pointer-events:none}
@keyframes lg-pop{0%{opacity:0;transform:scale(.2)}100%{opacity:1;transform:scale(1)}}
.lg-closed{display:block;transform-origin:50% 92%;filter:drop-shadow(0 10px 10px rgba(0,0,0,.4))}
.lg-closed.wig{animation:lg-wig 2.4s ease-in-out .4s infinite}
@keyframes lg-wig{0%,62%,100%{transform:rotate(0)}68%{transform:rotate(-5deg)}74%{transform:rotate(5deg)}80%{transform:rotate(-3deg)}86%{transform:rotate(2deg)}}
.lg-closed.shake{animation:lg-shake .75s ease-in-out both}
@keyframes lg-shake{0%{transform:rotate(0) scale(1)}15%{transform:rotate(-7deg) scale(1.03)}30%{transform:rotate(7deg) scale(1.05)}45%{transform:rotate(-7deg) scale(1.07)}60%{transform:rotate(7deg) scale(1.09)}75%{transform:rotate(-4deg) scale(1.1)}100%{transform:rotate(0) scale(1.08)}}
.lg-box{position:absolute;translate:-50% -100%;filter:drop-shadow(0 10px 10px rgba(0,0,0,.4));pointer-events:none}
.lg-lid{position:absolute;translate:-50% 0;pointer-events:none;filter:drop-shadow(0 8px 8px rgba(0,0,0,.35));animation:lg-lid 1s cubic-bezier(.2,.7,.4,1) both}
@keyframes lg-lid{0%{transform:none;opacity:1}55%{transform:translate(70px,-230px) rotate(16deg);opacity:1}100%{transform:translate(120px,-330px) rotate(26deg);opacity:0}}
.lg-btn{position:absolute;translate:-50% -50%;padding:0;border:0;background:none;cursor:pointer;animation:lg-btn .5s cubic-bezier(.3,1.5,.5,1) .9s both}
.lg-btn img{display:block;filter:drop-shadow(0 6px 6px rgba(0,0,0,.4))}
.lg-btn:active:not(:disabled) img{transform:translateY(5px)}
.lg-btn:disabled{cursor:default}
@keyframes lg-btn{0%{opacity:0;transform:translateY(40px)}100%{opacity:1;transform:none}}
.lg-andy{position:absolute;pointer-events:none;animation:lg-andyIn .75s cubic-bezier(.25,1.45,.45,1) .45s both}
@keyframes lg-andyIn{0%{transform:translateY(110%) rotate(-6deg);opacity:0}25%{opacity:1}100%{transform:none;opacity:1}}
.lg-sway{width:100%;height:100%;transform-origin:50% 100%;animation:lg-sway 3.4s ease-in-out infinite}
.lg-breathe{width:100%;height:100%;transform-origin:50% 100%;animation:lg-breathe 2.2s ease-in-out infinite}
.lg-hop{position:relative;width:100%;height:100%;transform-origin:50% 100%}
.lg-hop.on{animation:lg-hop .42s ease-in-out infinite}
.lg-andy.leave{animation:lg-andyOut .8s cubic-bezier(.5,0,.75,.4) forwards}
@keyframes lg-andyOut{0%{transform:none}15%{transform:translateX(-20px) rotate(-3deg)}100%{transform:translateX(var(--out)) rotate(6deg)}}
.lg-andy img{position:absolute;inset:0;width:100%;height:100%;object-fit:contain;user-select:none;filter:drop-shadow(0 10px 18px rgba(0,0,0,.45))}
@keyframes lg-sway{0%,100%{transform:rotate(-1.2deg)}50%{transform:rotate(1.2deg)}}
@keyframes lg-breathe{0%,100%{transform:scale(1,1)}50%{transform:scale(.992,1.014)}}
@keyframes lg-hop{0%,100%{transform:translateY(0) scale(1,1)}15%{transform:translateY(0) scale(1.03,.96)}50%{transform:translateY(-4%) scale(.98,1.03)}85%{transform:translateY(0) scale(1.02,.98)}}
@media (prefers-reduced-motion: reduce){.lg-closed.wig{animation:none}}
`;
