// GROW-UP PARTY (new world look, step 5.3 (2), Andy 2026-10-02 15:14): an animal reaches its LAST stage.
// Black screen -> big 3D "Congratulations!" (same as the grammar win screen: Word3D, Lilita One) with sparkles
// bursting as the letters pop, then a few glowing embers float around the word -> the prizes pop in one by one,
// glowing and sparkling -> OK -> every prize flies to its place with a little sparkle trail
// (coins -> coin total, treats -> jar, puzzle pieces -> Puzzle button). The parent then fills the jar and closes it.
// Andy 15:31: + the grown animal big in the middle with turning light rays + 'X is all grown up!', a confetti burst
// when the word lands, a soft plop as each treat lands (coins stay silent for now).
// Andy 17:03: ALSO the WORLD-FINISHED screen (word 'World Complete!', all the world's grown animals in a row,
// its own music, coins + a badge that flies into My Badges) - same component, different props.
// VISUAL ONLY: this file saves nothing. The numbers are placeholders until step 5.4 wires real coins/pieces/treats.
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { FUN3D_CSS, Word3D, word3DDone } from "@/components/Fun3D";

export type PrizeKind = "coin" | "treat" | "piece" | "badge";
export interface Prize { kind: PrizeKind; n: number; img: string; flyers: number; size: number; label?: string }
type Pt = { x: number; y: number };

const WORD_DELAY = 350, STAGGER = 70, FONT = 120;
const PRIZE_GAP = 260;                                         // ms between prizes
const FLY_MS = 950;                                            // one flight

// fixed pseudo-random numbers (same every time)
const rnd = (seed: number) => () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
const R = rnd(7);
// per letter: [angle deg, distance px, size px, seconds]
const BURSTS = Array.from({ length: 24 }, () => Array.from({ length: 6 }, () => [R() * 360, 60 + R() * 80, 3 + R() * 3.5, 0.8 + R() * 0.6]));
// embers: [x 0-1 along the word, y 0-1 band around it, size px, seconds, delay seconds]
const EMBERS = Array.from({ length: 22 }, () => [R(), R(), 3 + R() * 3.5, 3.6 + R() * 3, -R() * 6.5]);
// prize twinkles: [angle deg, distance px, size px, seconds, delay seconds]
// confetti: [dx px, up px, fall px, spin deg, width px, colour, seconds, delay ms]
const CONF_COL = ["#ffd23a", "#ff6fa8", "#4fd2f6", "#62e07c", "#b36bff", "#ff9a3c"];
const CONFETTI = Array.from({ length: 72 }, () => [(R() - 0.5) * 1400, -120 - R() * 230, 520 + R() * 380, (R() < 0.5 ? -1 : 1) * (360 + R() * 900), 9 + R() * 8, Math.floor(R() * 6), 2.6 + R() * 1.3, R() * 260]);
const TWINKLE = Array.from({ length: 16 }, () => [R() * 360, 80 + R() * 50, 2.5 + R() * 2.5, 1.6 + R() * 1.4, -R() * 3]);

type Flyer = { id: number; kind: PrizeKind; img: string; size: number; x0: number; y0: number; x1: number; y1: number; delay: number };
type Burst = { id: number; x: number; y: number };

export default function GrowUpParty({ phase, cx, sh, prizes, sfxOn, heroImgs, line, target, onLand, onAllLanded, onOk,
  word = "Congratulations!", music = { file: "celebration/win_fanfare.mp3", ms: 6800 } }: {
  phase: "on" | "fly" | "out"; cx: number; sh: number; prizes: Prize[]; sfxOn: boolean;
  heroImgs: string[]; line: string;             // 1 image = the grown animal big; more = a row (world finished)
  word?: string;                                // the big 3D word
  music?: { file: string; ms: number };         // path under public/ + its length (OK waits for it)
  target: (k: PrizeKind) => Pt | null;          // where each kind flies to (stage px)
  onLand: (k: PrizeKind, add: number) => void;  // one flyer landed (add = how much it carries)
  onAllLanded: () => void;                      // every flyer landed
  onOk: () => void;                             // kid tapped OK
}) {
  const WORD = word, MUSIC_MS = music.ms;
  const WORD_DONE = word3DDone(WORD, WORD_DELAY, STAGGER);
  const ANIMAL_AT = WORD_DONE - 250;                                        // hero + rays pop in
  const LINE_AT = ANIMAL_AT + 400 + (heroImgs.length - 1) * 150;           // the line under the hero
  const PRIZES_AT = LINE_AT + 600;                                          // first prize pops in
  const wordTop = sh / 2 - 470, heroY = sh / 2 - 135, lineTop = sh / 2 + 40, rowY = sh / 2 + 205, okTop = sh / 2 + 335;
  const tileX = (i: number) => cx + (i - (prizes.length - 1) / 2) * 300;
  const okAt = PRIZES_AT + prizes.length * PRIZE_GAP + 450;

  // the word's real width (for the letter bursts + embers)
  const wordRef = useRef<HTMLSpanElement>(null);
  const [wb, setWb] = useState<{ x: number; w: number } | null>(null);
  useEffect(() => {
    const t = window.setTimeout(() => { const e = wordRef.current; if (e) setWb({ x: e.offsetLeft, w: e.offsetWidth }); }, 60);
    return () => window.clearTimeout(t);
  }, [cx]);

  const [embers, setEmbers] = useState(false);
  const [okReady, setOkReady] = useState(false);
  const [musicDone, setMusicDone] = useState(false); // Andy 16:28: OK can't be tapped until the music stops
  const sounds = useRef<HTMLAudioElement[]>([]);
  const play = (f: string, vol: number) => { // f = path under public/
    if (!sfxOn) return;
    const a = new Audio(`/${f}`); a.volume = vol; sounds.current.push(a); a.play().catch(() => { });
    return a;
  };
  useEffect(() => {
    play("celebration/win_pop.mp3", 0.7);
    const tune = play(music.file, 0.5); // grow-up: the win-screen fanfare (Andy 16:53); world finished: its own music
    tune?.addEventListener("ended", () => setMusicDone(true));
    const ts = [
      window.setTimeout(() => setMusicDone(true), MUSIC_MS), // sound off / blocked: same wait
      window.setTimeout(() => setEmbers(true), WORD_DONE),
      window.setTimeout(() => setOkReady(true), okAt),
    ];
    return () => { ts.forEach(t => window.clearTimeout(t)); sounds.current.forEach(a => a.pause()); };
  }, []);

  // OK -> launch every flyer (prize by prize, a little apart)
  const [flyers, setFlyers] = useState<Flyer[]>([]);
  const [bursts, setBursts] = useState<Burst[]>([]);
  const [gone, setGone] = useState<number[]>([]);
  const timers = useRef<number[]>([]);
  useEffect(() => () => timers.current.forEach(t => window.clearTimeout(t)), []);
  useEffect(() => {
    if (phase !== "fly") return;
    const later = (fn: () => void, ms: number) => { timers.current.push(window.setTimeout(fn, ms)); };
    const list: Flyer[] = [];
    let last = 0;
    play("celebration/rising_pop.mp3", 0.6); // Andy 16:07: right as the prizes start flying (was: at the first landing)
    prizes.forEach((p, i) => {
      const to = target(p.kind);
      const start = i * 380;
      later(() => setGone(g => [...g, i]), start + 120);
      if (!to) return;
      for (let j = 0; j < p.flyers; j++) {
        const delay = start + j * 85;
        const add = Math.floor(p.n / p.flyers) + (j < p.n % p.flyers ? 1 : 0);
        list.push({ id: i * 100 + j, kind: p.kind, img: p.img, size: p.size, x0: tileX(i) + (j % 3 - 1) * 14, y0: rowY + 10 - (j % 2) * 12, x1: to.x, y1: to.y, delay });
        later(() => {
          onLand(p.kind, add);
          if (p.kind === "treat") play(j % 2 ? "cookiejar/snd_drop2.mp3" : "cookiejar/snd_drop1.mp3", 0.4);
          const id = Date.now() + Math.random();
          setBursts(b => [...b, { id, x: to.x, y: to.y }]);
          later(() => setBursts(b => b.filter(x => x.id !== id)), 800);
        }, delay + FLY_MS);
        last = Math.max(last, delay + FLY_MS);
      }
    });
    setFlyers(list);
    later(onAllLanded, last + 80);
  }, [phase]);

  return (
    <div className={"gu-ov " + phase}>
      <style>{FUN3D_CSS + CSS}</style>

      <div className="gu-wordrow" style={{ top: wordTop }}>
        <span ref={wordRef} className="gu-word"><Word3D text={WORD} delay={WORD_DELAY} stagger={STAGGER} style={{ fontSize: FONT }} /></span>
        {wb && Array.from(WORD).map((ch, i) => ch === " " ? null : BURSTS[i % BURSTS.length].map((b, k) => (
          <i key={i + "-" + k} className="gu-bd" style={{
            left: wb.x + (i + 0.5) * (wb.w / WORD.length), top: FONT * 0.55, width: b[2], height: b[2], margin: -b[2] / 2,
            ["--a" as string]: `${b[0]}deg`, ["--d" as string]: `${b[1]}px`, animationDuration: `${b[3]}s`,
            animationDelay: `${WORD_DELAY + i * STAGGER + 180}ms`,
          } as CSSProperties} />
        )))}
        {wb && embers && EMBERS.map((e, i) => (
          <i key={"e" + i} className="gu-em" style={{
            left: wb.x - 40 + e[0] * (wb.w + 80), top: -30 + e[1] * (FONT + 70), width: e[2], height: e[2],
            animationDuration: `${e[3]}s`, animationDelay: `${e[4]}s`,
          }} />
        ))}
      </div>

      <div className="gu-mid">
      <div className="gu-hero" style={{ left: cx, top: heroY, animationDelay: `${ANIMAL_AT}ms` }}>
        <div className="gu-hglow" />
        <div className="gu-rays" />
        {heroImgs.length === 1
          ? <img className="gu-himg" src={heroImgs[0]} alt="" />
          : <div className="gu-hrow">
              {heroImgs.map((src, i) => <img key={i} className="gu-hsm" src={src} alt="" style={{ animationDelay: `${i * 150}ms` }} />)}
            </div>}
      </div>
      <div className="gu-line" style={{ top: lineTop, animationDelay: `${LINE_AT}ms` }}>{line}</div>
      </div>

      {embers && (
        <div className="gu-conf" style={{ left: cx, top: wordTop + FONT * 0.6 }}>
          {CONFETTI.map((c, i) => (
            <i key={i} style={{ width: c[4], height: c[4] * 1.6, background: CONF_COL[c[5]], ["--dx" as string]: `${c[0]}px`, ["--up" as string]: `${c[1]}px`, ["--fall" as string]: `${c[2]}px`, ["--r" as string]: `${c[3]}deg`, animationDuration: `${c[6]}s`, animationDelay: `${c[7]}ms` } as CSSProperties} />
          ))}
        </div>
      )}

      {prizes.map((p, i) => (
        <div key={p.kind} className="gu-prize" style={{ left: tileX(i) - 130, top: rowY - 120, animationDelay: `${PRIZES_AT + i * PRIZE_GAP}ms` }}>
          <div className={"gu-pin" + (gone.includes(i) ? " gone" : "")}>
          <div className="gu-phalo" />
          {TWINKLE.map((t, k) => (
            <i key={k} className="gu-tw" style={{ width: t[2], height: t[2], margin: -t[2] / 2, ["--a" as string]: `${t[0]}deg`, ["--d" as string]: `${t[1]}px`, animationDuration: `${t[3]}s`, animationDelay: `${t[4]}s` } as CSSProperties} />
          ))}
          <img className="gu-pimg" src={p.img} alt="" style={{ width: p.size * 1.8 }} />
          <div className="gu-pn" style={p.label ? { fontSize: 42, marginTop: 8 } : undefined}>{p.label ?? `x${p.n}`}</div>
          </div>
        </div>
      ))}

      {okReady && (
        <button className={"f3-btn f3-yellow gu-ok" + (musicDone ? " wake" : "")} style={{ top: okTop, left: cx }} disabled={phase !== "on" || !musicDone}
          onClick={() => { if (phase === "on" && musicDone) onOk(); }}>OK!</button>
      )}

      {flyers.map(f => {
        const ym = Math.min(f.y0, f.y1) - 170;
        const path = { ["--x0" as string]: `${f.x0}px`, ["--x1" as string]: `${f.x1}px` } as CSSProperties;
        const pathY = { ["--y0" as string]: `${f.y0}px`, ["--ym" as string]: `${ym}px`, ["--y1" as string]: `${f.y1}px` } as CSSProperties;
        return [0, 1, 2, 3].map(t => (
          <div key={f.id + "-" + t} className="gu-fx" style={{ ...path, animationDelay: `${f.delay + t * 45}ms` }}>
            <div className="gu-fy" style={{ ...pathY, animationDelay: `${f.delay + t * 45}ms` }}>
              {t === 0
                ? <img src={f.img} alt="" style={{ width: f.size, margin: -f.size / 2 }} />
                : <i className="gu-trail" style={{ width: 11 - t * 2, height: 11 - t * 2, margin: -(11 - t * 2) / 2, opacity: 1 - t * 0.22 }} />}
            </div>
          </div>
        ));
      })}

      {bursts.map(b => (
        <div key={b.id} className="gu-land" style={{ left: b.x, top: b.y }}>
          {[0, 1, 2, 3, 4, 5, 6, 7].map(k => <i key={k} style={{ ["--a" as string]: `${k * 45 + 10}deg` } as CSSProperties} />)}
        </div>
      ))}
    </div>
  );
}

const CSS = `
.gu-ov{position:absolute;inset:0;z-index:60;background:rgba(0,0,0,.88);animation:gu-in .4s ease-out both;transition:background .6s ease-out,opacity .5s ease-out}
.gu-ov.fly{background:rgba(0,0,0,.45)}
.gu-ov.out{opacity:0}
@keyframes gu-in{from{opacity:0}to{opacity:1}}
.gu-wordrow{position:absolute;left:0;right:0;text-align:center;pointer-events:none;transition:opacity .4s}
.gu-word{display:inline-block}
.gu-ov.fly .gu-wordrow,.gu-ov.fly .gu-ok,.gu-ov.out .gu-wordrow,.gu-ov.out .gu-ok,.gu-ov.fly .gu-mid,.gu-ov.out .gu-mid{opacity:0;transition:opacity .4s}
.gu-mid{position:absolute;inset:0;pointer-events:none;transition:opacity .4s}
.gu-hero{position:absolute;width:0;height:0;pointer-events:none;animation:gu-pop .7s cubic-bezier(.25,1.6,.45,1) both;transition:opacity .4s}
.gu-hglow{position:absolute;left:-260px;top:-230px;width:520px;height:460px;border-radius:50%;
 background:radial-gradient(closest-side,rgba(255,232,140,.75) 0%,rgba(255,200,60,.4) 50%,rgba(255,170,0,0) 100%)}
.gu-rays{position:absolute;left:-430px;top:-430px;width:860px;height:860px;border-radius:50%;
 background:repeating-conic-gradient(rgba(255,234,150,0) 0deg,rgba(255,234,150,.72) 5deg,rgba(255,234,150,0) 10deg,rgba(255,234,150,0) 18deg);filter:blur(6px);
 -webkit-mask-image:radial-gradient(closest-side,#000 18%,transparent 100%);mask-image:radial-gradient(closest-side,#000 18%,transparent 100%);
 animation:gu-spin 90s linear infinite}
@keyframes gu-spin{to{transform:rotate(360deg)}}
.gu-himg{position:absolute;left:0;top:0;height:330px;width:auto;max-width:none;animation:gu-breathe 3s ease-in-out infinite;
 filter:drop-shadow(0 10px 14px rgba(0,0,0,.45))}
@keyframes gu-breathe{0%,100%{transform:translate(-50%,-50%) scale(1)}50%{transform:translate(-50%,-50%) scale(1.03,.985)}}
.gu-line{position:absolute;left:0;right:0;text-align:center;font-family:'Titan One',sans-serif;font-size:46px;color:#fff;white-space:nowrap;pointer-events:none;
 text-shadow:3px 0 0 #6b3a00,-3px 0 0 #6b3a00,0 3px 0 #6b3a00,0 -3px 0 #6b3a00,2px 2px 0 #6b3a00,-2px 2px 0 #6b3a00,2px -2px 0 #6b3a00,-2px -2px 0 #6b3a00,0 5px 0 #6b3a00;
 animation:gu-linein .5s ease-out both;transition:opacity .4s}
@keyframes gu-linein{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}}
.gu-conf{position:absolute;width:0;height:0;pointer-events:none;z-index:1}
.gu-conf i{position:absolute;left:0;top:0;border-radius:2px;opacity:0;animation-name:gu-conf;animation-fill-mode:both}
@keyframes gu-conf{0%{opacity:1;transform:translate(0,0) rotate(0);animation-timing-function:cubic-bezier(.2,.8,.4,1)}
 28%{opacity:1;transform:translate(calc(var(--dx) * .55),var(--up)) rotate(calc(var(--r) * .3));animation-timing-function:cubic-bezier(.5,0,.8,.6)}
 85%{opacity:1}100%{opacity:0;transform:translate(var(--dx),var(--fall)) rotate(var(--r))}}
.gu-bd,.gu-em,.gu-tw,.gu-trail{position:absolute;border-radius:50%;background:#fffde6;
 box-shadow:0 0 2px 1px #fff27a,0 0 6px 2px #ffd000,0 0 10px 3px rgba(255,170,0,.7)}
.gu-bd{opacity:0;animation-name:gu-bd;animation-timing-function:cubic-bezier(.2,.75,.35,1);animation-fill-mode:both}
@keyframes gu-bd{0%{opacity:0;transform:rotate(var(--a)) translateX(0) scale(1.2)}12%{opacity:1}75%{opacity:1}100%{opacity:0;transform:rotate(var(--a)) translateX(var(--d)) scale(.4)}}
.gu-em{opacity:0;animation-name:gu-em;animation-timing-function:ease-in-out;animation-iteration-count:infinite}
@keyframes gu-em{0%{opacity:0;transform:translate(0,30px) scale(.6)}25%{opacity:1}60%{opacity:.85}100%{opacity:0;transform:translate(14px,-80px) scale(1)}}
.gu-prize{position:absolute;width:260px;height:240px;animation:gu-pop .6s cubic-bezier(.25,1.6,.45,1) both}
.gu-pin{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;transition:opacity .35s}
.gu-pin.gone{opacity:0}
@keyframes gu-pop{0%{opacity:0;transform:scale(.2)}60%{opacity:1;transform:scale(1.15)}100%{opacity:1;transform:scale(1)}}
.gu-phalo{position:absolute;left:50%;top:44%;width:260px;height:260px;margin:-130px 0 0 -130px;border-radius:50%;
 background:radial-gradient(closest-side,rgba(255,236,120,.95) 0%,rgba(255,206,40,.7) 45%,rgba(255,170,0,.25) 75%,rgba(255,160,0,0) 100%);
 animation:gu-halo 1.6s ease-in-out infinite}
@keyframes gu-halo{0%,100%{opacity:.75;transform:scale(.92)}50%{opacity:1;transform:scale(1.06)}}
.gu-tw{left:50%;top:44%;opacity:0;animation-name:gu-tw;animation-timing-function:cubic-bezier(.2,.75,.35,1);animation-iteration-count:infinite}
@keyframes gu-tw{0%{opacity:0;transform:rotate(var(--a)) translateX(30px) scale(1)}20%{opacity:1}75%{opacity:.9}100%{opacity:0;transform:rotate(var(--a)) translateX(var(--d)) scale(.4)}}
.gu-pimg{position:relative;display:block;max-width:none;animation:gu-glow 1.4s ease-in-out infinite}
@keyframes gu-glow{0%,100%{filter:brightness(1.05) drop-shadow(0 0 4px #fff36b) drop-shadow(0 0 12px #ffd000)}50%{filter:brightness(1.22) drop-shadow(0 0 7px #fffbb0) drop-shadow(0 0 22px #ffe000)}}
.gu-hrow{position:absolute;left:0;top:0;transform:translate(-50%,-50%);display:flex;align-items:flex-end;gap:4px}
.gu-hsm{height:200px;width:auto;max-width:none;filter:drop-shadow(0 8px 10px rgba(0,0,0,.45));animation:gu-pop .6s cubic-bezier(.25,1.6,.45,1) both}
.gu-pn{position:relative;white-space:nowrap;margin-top:2px;font-family:'Titan One',sans-serif;font-size:58px;line-height:1;color:#fff;
 text-shadow:3px 0 0 #6b3a00,-3px 0 0 #6b3a00,0 3px 0 #6b3a00,0 -3px 0 #6b3a00,2px 2px 0 #6b3a00,-2px 2px 0 #6b3a00,2px -2px 0 #6b3a00,-2px -2px 0 #6b3a00,0 6px 0 #6b3a00}
.gu-ok{position:absolute;transform:translateX(-50%);font-size:44px;min-width:5.5em;animation:gu-okin .45s cubic-bezier(.25,1.6,.45,1) both;transition:opacity .4s}
.gu-ok:disabled{opacity:1;filter:saturate(.45) brightness(.88);cursor:default}
.gu-ok{transition:opacity .4s,filter .4s}
.gu-ok.wake{animation:gu-okin .45s cubic-bezier(.25,1.6,.45,1) both,gu-okwake .5s ease-out both}
@keyframes gu-okwake{0%{transform:translateX(-50%) scale(1)}45%{transform:translateX(-50%) scale(1.14)}100%{transform:translateX(-50%) scale(1)}}
.gu-ok:active:not(:disabled){transform:translateX(-50%) translateY(.17em)}
@keyframes gu-okin{from{transform:translateX(-50%) scale(.3)}to{transform:translateX(-50%) scale(1)}}
.gu-fx{position:absolute;left:0;top:0;z-index:2;pointer-events:none;animation:gu-fx ${FLY_MS}ms cubic-bezier(.45,.05,.55,.95) both}
.gu-fy{animation:gu-fy ${FLY_MS}ms linear both}
.gu-fy img{display:block;position:relative;max-width:none;filter:drop-shadow(0 0 6px #ffe36a) drop-shadow(0 0 14px rgba(255,200,0,.8))}
.gu-trail{position:relative;display:block}
@keyframes gu-fx{0%{opacity:0;transform:translateX(var(--x0))}6%{opacity:1}92%{opacity:1}100%{opacity:0;transform:translateX(var(--x1))}}
@keyframes gu-fy{0%{transform:translateY(var(--y0)) scale(1.15);animation-timing-function:ease-out}45%{transform:translateY(var(--ym)) scale(1.05);animation-timing-function:ease-in}100%{transform:translateY(var(--y1)) scale(.6)}}
.gu-land{position:absolute;z-index:2;pointer-events:none}
.gu-land i{position:absolute;left:0;top:0;width:6px;height:6px;margin:-3px;border-radius:50%;background:#fffde6;
 box-shadow:0 0 2px 1px #fff27a,0 0 6px 2px #ffd000;animation:gu-land .65s ease-out both}
@keyframes gu-land{0%{opacity:1;transform:rotate(var(--a)) translateX(4px) scale(1.2)}100%{opacity:0;transform:rotate(var(--a)) translateX(46px) scale(.4)}}
@media (prefers-reduced-motion: reduce){.gu-bd,.gu-em,.gu-tw,.gu-trail,.gu-land,.gu-conf{display:none}.gu-phalo,.gu-pimg,.gu-rays,.gu-himg{animation:none}.gu-himg{transform:translate(-50%,-50%)}}
`;
