// BADGE ROOM (launch step 6, Andy 2026-10-13; was 'Trophy Room'): the kid's badges hang on gold cords in a fancy honey-wood room
// (public/worlds/trophy/room.webp, Andy's Gemini art, 1376x768, 12 empty blue velvet alcoves with hooks).
// Earned = bright, warm glow, gentle sway. Not yet = faded, still. NEW badges drop onto their hooks one by one with round
// light dots (the parent plays the wand sound and marks them seen). Tap a badge = big view with its name + how to earn it.
// Only the X closes anything (never a background tap). DISPLAY ONLY: saves nothing itself.
// MORE BADGES (Andy 18:01): 12 per wall; more than 12 = gold arrows left/right slide to the next wall (same room picture)
// + dots. Opens on the wall with the first NEW badge. MUSIC: public/worlds/trophy/music.mp3 ('A Thousand Dreams', levelled
// -22.5 LUFS) loops while the room is open; the world music goes quiet and comes back on close (onMusic).
import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { badgeImg, type BadgeDef } from "@/worlds/badges";

const R = "/worlds/trophy";
const UI = "/worlds/ui";
// The room picture (1376x768) is drawn 1600 wide. Hooks (bottom of each brass hook) measured in the picture.
const K = 1600 / 1376, IMG_H = 768 * K;
const HOOKS = [[192, 237], [391, 237], [589, 237], [785, 237], [983, 237], [1182, 237],
               [192, 526], [392, 526], [589, 526], [785, 526], [982, 526], [1182, 526]];
const BANNER = { x: 688 * K, y: 95 * K };
// ENGRAVED PLATES (Andy 18:27): top row = the plates in the picture (centre y 419.5); bottom row = a copy of one plate
// (plate.webp, cut from the picture) on the ledge under the bottom alcoves (centre y 706). x = each alcove's centre.
const PLATE_X = [185, 386.5, 587.5, 787.5, 988.5, 1190];
const PLATE_Y = [419.5, 706], PLATE_W = 121, PLATE_H = 37;
// slow floating light dots: [x 0-1600, start y, size, seconds, delay]
const MOTES = (() => {
  let seed = 7; const r = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  return Array.from({ length: 18 }, () => [r() * 1600, 300 + r() * 560, 3 + r() * 4, 12 + r() * 10, -r() * 20]);
})();
const BURST = Array.from({ length: 10 }, (_, i) => i * 36);

export const ROOM_NAME = "Champion's Hall"; // Andy 18:27 (was Badge Room / Trophy Room)
const PER = 12;

export default function TrophyRoom({ cx, sh, defs, earned, popNew, onClose, musicOn, onMusic }: {
  cx: number; sh: number; defs: BadgeDef[]; earned: string[]; popNew: string[]; onClose: () => void;
  musicOn: boolean; onMusic: (quiet: boolean) => void;
}) {
  const [zoom, setZoom] = useState<BadgeDef | null>(null);
  const pages = Math.max(1, Math.ceil(defs.length / PER));
  const [page, setPage] = useState(() => { const i = defs.findIndex(b => popNew.includes(b.id)); return i < 0 ? 0 : Math.floor(i / PER); });
  const [slide, setSlide] = useState("");   // x-l / x-r = sliding out, e-l / e-r = placed on the other side, "" = in place
  const go = (d: number) => { const n = page + d; if (n < 0 || n >= pages || slide) return; setSlide(d > 0 ? "x-l" : "x-r"); window.setTimeout(() => { setPage(n); setSlide(d > 0 ? "e-r" : "e-l"); window.setTimeout(() => setSlide(""), 30); }, 260); };
  // room music (fades in), world music quiet while the room is open
  const mus = useRef<HTMLAudioElement | null>(null);
  useEffect(() => {
    onMusic(true);
    const a = new Audio(`${R}/music.mp3`); a.loop = true; a.volume = 0; mus.current = a;
    let raf = 0;
    if (musicOn) a.play().then(() => { const t0 = performance.now(); const up = () => { const k = Math.min(1, (performance.now() - t0) / 1200); a.volume = k; if (k < 1) raf = requestAnimationFrame(up); }; raf = requestAnimationFrame(up); }).catch(() => { });
    return () => { cancelAnimationFrame(raf); a.pause(); mus.current = null; onMusic(false); };
  }, []);   // eslint-disable-line react-hooks/exhaustive-deps
  const musFirst = useRef(true);
  useEffect(() => { if (musFirst.current) { musFirst.current = false; return; } const a = mus.current; if (!a) return; if (musicOn) { a.volume = 1; a.play().catch(() => { }); } else a.pause(); }, [musicOn]); // music button while the room is open
  // FILL THE WHOLE WINDOW (rule for every full screen): cover, but never cut the banner-to-alcoves band or the alcoves.
  const sw = cx * 2;
  const f = Math.min(Math.max(sw / 1600, sh / IMG_H), sh / 800, sw / (pages > 1 ? 1560 : 1350)); // arrows (x 53-1546) never cut
  const sway = useMemo(() => defs.map((_, i) => ({ d: 5 + ((i * 37) % 10) / 4, dl: -((i * 53) % 40) / 10 })), [defs]);
  const shown = defs.slice(page * PER, page * PER + PER);
  return (
    <div className="tr-root">
      <style>{CSS}</style>
      <img className="tr-fill" src={`${R}/room.webp`} alt="" />
      <div className="tr-pic" style={{ left: cx - 800, top: sh / 2 - IMG_H / 2, width: 1600, height: IMG_H, transform: `scale(${f})` }}>
        <img className="tr-bg" src={`${R}/room.webp`} alt="" />
        <div className="tr-title" style={{ left: BANNER.x, top: BANNER.y }}>
          <div className="t1">{ROOM_NAME}</div>
          <div className="t2">{earned.length} / {defs.length} badges</div>
        </div>
        {MOTES.map((m, i) => <i key={i} className="tr-mote" style={{ left: m[0], top: m[1], width: m[2], height: m[2], animationDuration: `${m[3]}s`, animationDelay: `${m[4]}s` }} />)}
        <div className={"tr-wall" + (slide ? " " + slide : "")}>
        {shown.map((b, i) => {
          const [hx, hy] = HOOKS[i], got = earned.includes(b.id), pop = popNew.indexOf(b.id);
          const st = { left: hx * K, top: (hy - 8) * K, ["--pd" as string]: `${0.4 + Math.max(0, pop) * 0.3}s` } as CSSProperties;
          return (
            <div key={b.id} className={"tr-hang" + (got ? " got" : " off") + (pop >= 0 ? " pop" : "")} style={st}>
              <div className="tr-swing" style={got ? { animationDuration: `${sway[i].d}s`, animationDelay: `${sway[i].dl}s` } : undefined}>
                <i className="tr-cord" />
                {got && <b className="tr-glow" />}
                <img className="tr-badge sv-tap" src={badgeImg(b.id)} alt={b.name} onClick={() => setZoom(b)} />
                {pop >= 0 && <span className="tr-burst">{BURST.map(a => <i key={a} style={{ ["--a" as string]: `${a}deg` }} />)}</span>}
              </div>
            </div>);
        })}
        {shown.map((b, i) => {
          const row = i < 6 ? 0 : 1, got = earned.includes(b.id);
          return (
            <div key={"p" + b.id} className={"tr-plate" + (row ? " img" : "") + (got ? "" : " off")} style={{ left: PLATE_X[i % 6] * K, top: PLATE_Y[row] * K, width: PLATE_W * K, height: PLATE_H * K }}>
              <div className="n">{b.name}</div>
              <svg className="fl" viewBox="0 0 80 6"><path d="M2 3H33M47 3H78" stroke="#8a5a14" strokeWidth="1" strokeLinecap="round" /><path d="M40 0.5 43 3 40 5.5 37 3Z" fill="#8a5a14" /><circle cx="34.5" cy="3" r="0.9" fill="#8a5a14" /><circle cx="45.5" cy="3" r="0.9" fill="#8a5a14" /></svg>
              <div className="w">{b.plate}</div>
            </div>);
        })}
        </div>
        {pages > 1 && (<>
          <div className={"tr-arr l" + (page > 0 ? " sv-tap" : " off")} onClick={() => go(-1)}><svg viewBox="0 0 24 24"><path d="M16 3 6 12l10 9z" fill="#fff" /></svg></div>
          <div className={"tr-arr r" + (page < pages - 1 ? " sv-tap" : " off")} onClick={() => go(1)}><svg viewBox="0 0 24 24"><path d="M8 3l10 9-10 9z" fill="#fff" /></svg></div>
          <div className="tr-dots">{Array.from({ length: pages }, (_, i) => <i key={i} className={i === page ? "on" : ""} />)}</div>
        </>)}
      </div>
      <div className="sv-x sv-tap tr-x" onClick={onClose}><img src={`${UI}/rb_exit.webp`} alt="Close" /></div>
      {zoom && (
        <div className="tr-zoom">
          <div className="tr-zcard" style={{ left: cx, top: sh / 2 }}>
            <div className="sv-x sv-tap" onClick={() => setZoom(null)}><img src={`${UI}/rb_exit.webp`} alt="Close" /></div>
            <img className={"tr-zimg" + (earned.includes(zoom.id) ? "" : " off")} src={badgeImg(zoom.id)} alt="" />
            <div className="tr-zname">{zoom.name}</div>
            <div className="tr-zhow">{zoom.how}</div>
            <div className={"tr-zpill" + (earned.includes(zoom.id) ? " yes" : "")}>{earned.includes(zoom.id) ? "Earned!" : "Not yet"}</div>
          </div>
        </div>
      )}
    </div>
  );
}

const CSS = `@import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&display=swap');
.tr-root{position:absolute;inset:0;z-index:50;background:#8a4f1d;overflow:hidden;animation:tr-in .35s ease-out both}
@keyframes tr-in{from{opacity:0}to{opacity:1}}
.tr-fill{position:absolute;inset:-40px;width:calc(100% + 80px);height:calc(100% + 80px);max-width:none;object-fit:cover;filter:blur(22px) brightness(.85)}
.tr-pic{position:absolute;transform-origin:50% 50%}
.tr-bg{position:absolute;left:0;top:0;width:100%;height:100%;display:block}
.tr-title{position:absolute;translate:-50% -50%;text-align:center;font-family:'Titan One',sans-serif;white-space:nowrap;pointer-events:none}
.tr-title .t1{font-size:50px;line-height:56px;color:#7a3e0a;text-shadow:0 2px 0 rgba(255,244,200,.9),0 -1px 0 rgba(90,40,0,.35)}
.tr-title .t2{font-size:22px;line-height:26px;color:#8f5a1c;text-shadow:0 1px 0 rgba(255,244,200,.8)}
.tr-mote{position:absolute;border-radius:50%;background:#fff6cf;box-shadow:0 0 8px 2px rgba(255,236,170,.7);opacity:0;pointer-events:none;animation:tr-mote linear infinite}
@keyframes tr-mote{0%{opacity:0;transform:translate(0,0)}15%{opacity:.7}85%{opacity:.5}100%{opacity:0;transform:translate(26px,-260px)}}
.tr-hang{position:absolute;width:140px;translate:-50% 0}
.tr-swing{position:relative;display:flex;flex-direction:column;align-items:center;transform-origin:50% 0}
.tr-hang.got .tr-swing{animation:tr-sway 6s ease-in-out infinite alternate}
@keyframes tr-sway{from{transform:rotate(-2.4deg)}to{transform:rotate(2.4deg)}}
.tr-cord{display:block;width:4px;height:22px;border-radius:2px;background:linear-gradient(90deg,#9c6a12,#ffe58a 50%,#9c6a12);box-shadow:0 1px 2px rgba(0,0,0,.35)}
.tr-badge{position:relative;z-index:1;display:block;width:122px;max-height:142px;object-fit:contain;margin-top:-3px;cursor:pointer;filter:drop-shadow(0 6px 6px rgba(0,0,0,.4))}
.tr-hang.off .tr-badge{filter:grayscale(.85) brightness(.8);opacity:.45}
.tr-hang.off .tr-cord{opacity:.55}
.tr-glow{position:absolute;left:50%;top:80px;width:190px;height:190px;margin:-95px 0 0 -95px;border-radius:50%;pointer-events:none;
 background:radial-gradient(circle,rgba(255,226,120,.55) 0%,rgba(255,200,80,.25) 40%,rgba(255,200,80,0) 70%);animation:tr-glow 3.2s ease-in-out infinite alternate}
@keyframes tr-glow{from{opacity:.65;transform:scale(.92)}to{opacity:1;transform:scale(1.05)}}
.tr-hang.pop{animation:tr-drop .9s cubic-bezier(.3,1.4,.5,1) var(--pd) both}
@keyframes tr-drop{0%{opacity:0;transform:translateY(-150px)}55%{opacity:1}100%{opacity:1;transform:translateY(0)}}
.tr-burst{position:absolute;left:50%;top:92px;width:0;height:0;z-index:2;pointer-events:none}
.tr-burst i{position:absolute;left:-5px;top:-5px;width:10px;height:10px;border-radius:50%;background:#fff3b0;box-shadow:0 0 10px 3px rgba(255,214,90,.9);opacity:0;
 animation:tr-burst 1.1s ease-out calc(var(--pd) + .55s) both}
@keyframes tr-burst{0%{opacity:0;transform:rotate(var(--a)) translateX(10px) scale(.6)}20%{opacity:1}100%{opacity:0;transform:rotate(var(--a)) translateX(95px) scale(.3)}}
.tr-x{z-index:5}
.tr-plate{position:absolute;translate:-50% -50%;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;pointer-events:none;
 font-family:'Dancing Script',cursive;font-weight:700;color:#6b3808;text-shadow:0 1px 0 rgba(255,246,205,.75),0 -1px 0 rgba(110,60,0,.25)}
.tr-plate.img{background:url(${R}/plate.webp) 0 0/100% 100% no-repeat}
.tr-plate .n{font-size:19px;line-height:19px;white-space:nowrap}
.tr-plate .fl{width:62%;height:5px;margin:1px 0 1px}
.tr-plate .w{font-size:13px;line-height:13px;white-space:nowrap}
.tr-plate.off{opacity:.55}
.tr-wall{position:absolute;inset:0;transition:transform .26s ease-in,opacity .26s ease-in}
.tr-wall.x-l,.tr-wall.e-l{transform:translateX(-120px);opacity:0}
.tr-wall.x-r,.tr-wall.e-r{transform:translateX(120px);opacity:0}
.tr-wall.e-l,.tr-wall.e-r{transition:none}
.tr-arr{position:absolute;top:${(380 + 467) / 2 * K}px;width:74px;height:74px;margin-top:-37px;border-radius:50%;z-index:3;display:flex;align-items:center;justify-content:center;
 background:radial-gradient(circle at 35% 30%,#fff6b0,#ffc61a 45%,#c98400);box-shadow:0 0 0 4px #8f4f00,0 6px 0 4px #7a4100,0 12px 16px rgba(0,0,0,.4)}
.tr-arr svg{width:38px;height:38px;filter:drop-shadow(0 2px 0 rgba(120,60,0,.6))}
.tr-arr.l{left:${46 * K}px}.tr-arr.r{left:${(1376 - 46) * K - 74}px}
.tr-arr.off{opacity:.35}
.tr-arr.sv-tap:active{transform:translateY(4px)}
.tr-dots{position:absolute;left:50%;top:${742 * K}px;translate:-50% -50%;display:flex;gap:12px}
.tr-dots i{width:16px;height:16px;border-radius:50%;background:rgba(255,240,200,.45);border:3px solid #c98400}
.tr-dots i.on{background:#ffd23a;box-shadow:0 0 8px 2px rgba(255,210,60,.8)}
.tr-zoom{position:absolute;inset:0;z-index:6;background:rgba(30,12,0,.62);animation:tr-in .25s ease-out both}
.tr-zcard{position:absolute;translate:-50% -50%;width:520px;padding:34px 30px 32px;text-align:center;border-radius:44px;border:7px solid transparent;
 background:linear-gradient(#fff8e2,#ffe9b8) padding-box,linear-gradient(180deg,#fff9c4,#ffd23a 40%,#c98400) border-box;box-shadow:0 18px 40px rgba(0,0,0,.45);animation:tr-zin .45s cubic-bezier(.3,1.4,.5,1) both}
@keyframes tr-zin{from{scale:.6;opacity:0}to{scale:1;opacity:1}}
.tr-zimg{display:block;height:300px;max-width:100%;margin:0 auto;object-fit:contain;filter:drop-shadow(0 10px 10px rgba(0,0,0,.35))}
.tr-zimg.off{filter:grayscale(.85) brightness(.85);opacity:.5}
.tr-zname{font-family:'Titan One',sans-serif;font-size:44px;line-height:52px;color:#8a4f1d;margin-top:10px}
.tr-zhow{font-family:'Titan One',sans-serif;font-size:26px;line-height:32px;color:#a0703a;margin-top:4px}
.tr-zpill{display:inline-block;margin-top:16px;padding:6px 26px;border-radius:30px;font-family:'Titan One',sans-serif;font-size:26px;color:#fff;background:#b9a88a}
.tr-zpill.yes{background:linear-gradient(#5fe07a,#1fa846);box-shadow:0 4px 0 #13702e}
@media (prefers-reduced-motion: reduce){.tr-swing,.tr-mote,.tr-glow{animation:none!important}}
`;
