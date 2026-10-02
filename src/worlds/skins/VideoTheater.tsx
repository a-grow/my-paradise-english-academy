// VIDEO THEATER (new world look, Andy 2026-10-02 16:34): full-screen purple movie theater.
// The big screen shows ONE world at a time = up to 6 video cards (won = grown + video watched; not yet = dark '?').
// Gold arrows switch worlds (opens on the current world). Tap a card -> the room lights go down around the screen,
// the cards fade away and the video fades in ON the screen (Andy 16:42); X on the screen = back to the cards.
// Popcorn box stands on the stage floor in front of the left bulb pillar; it hops when the theater opens and
// 3 popcorn pop out onto the stage floor and stay.
// VISUAL ONLY: saves nothing. Playing here never marks anything watched (the brain's onVideoTime is NOT used).
// Other worlds = 'Coming soon!' until step 7 (they need each world's data read-only).
import { useEffect, useRef, useState, type CSSProperties } from "react";

export interface TheaterCard { id: string; name: string; poster: string; video: string | null; won: boolean }
export interface TheaterWorld { key: string; title: string; cards: TheaterCard[] | null }

const T = "/worlds/theater";
const UI = "/worlds/ui";
// The theater picture (1312x816) is drawn 1600 wide; its blank screen is x 286-1025, y 201-606 in the picture.
const K = 1600 / 1312, IMG_H = 816 * K;
const SCR = { x: 286 * K, y: 201 * K, w: (1025 - 286) * K, h: (606 - 201) * K };
// Popcorn box: 160 tall, standing on the stage floor (picture y 708) centred on the left bulb pillar (picture x 210).
const BOX_H = 128, BOX_W = Math.round(BOX_H * 366 / 466), FLOOR_Y = 696 * K, PILLAR_X = 210 * K; // Andy 16:48: smaller, off the chairs
// popcorn: [landing x from the box's left, landing y above the floor, spin deg, size px, delay ms]
const POP = [[BOX_W + 12, 2, 300, 16, 0], [BOX_W + 34, 0, -240, 15, 90], [-14, 1, 200, 16, 170]]; // same size as the popcorn in the box

export default function VideoTheater({ cx, sh, worlds, start, newIds, onPlay, onStop, onClose }: {
  cx: number; sh: number; worlds: TheaterWorld[]; start: number; newIds: string[];
  onPlay: (id: string) => void;   // a video starts (parent: music down, red dot off)
  onStop: () => void;             // the video closed (parent: music back)
  onClose: () => void;
}) {
  const [wi, setWi] = useState(start);
  const [playing, setPlaying] = useState<TheaterCard | null>(null);
  const [fading, setFading] = useState(false);
  const w = worlds[wi];
  // FILL THE WHOLE WINDOW (Andy 16:53, rule for every full screen): the picture (1600 x IMG_H design) is scaled to cover
  // the window, but never so much that the bulbs-to-stage-floor band (y 225-880) or the arrows (x 159-1441) get cut off.
  const sw = cx * 2;
  const f = Math.min(Math.max(sw / 1600, sh / IMG_H), sh / 765, sw / 1300);
  const left = 0, top = 0; // everything below is in picture coordinates inside .tv-pic
  const floor = top + FLOOR_Y;     // popcorn rests here
  const boxLeft = left + PILLAR_X - BOX_W / 2;

  const playingRef = useRef(false);
  useEffect(() => () => { if (playingRef.current) onStop(); }, []); // closing the theater mid-video brings the music back
  const play = (c: TheaterCard) => { if (!c.won || !c.video) return; playingRef.current = true; setPlaying(c); onPlay(c.id); };
  const stop = () => { setFading(true); window.setTimeout(() => { playingRef.current = false; setPlaying(null); setFading(false); onStop(); }, 650); };

  return (
    <div className={"tv-root" + (playing ? " playing" : "")}>
      <style>{CSS}</style>
      <img className="tv-fill" src={`${T}/bg.webp`} alt="" />
      <div className="tv-pic" style={{ left: cx - 800, top: sh / 2 - IMG_H / 2, width: 1600, height: IMG_H, transform: `scale(${f})` }}>
      <img className="tv-bg" src={`${T}/bg.webp`} alt="" style={{ left, top, width: 1600, height: IMG_H }} />

      {playing && <div className={"tv-lights" + (fading ? " out" : "")} style={{ left: left + SCR.x, top: top + SCR.y, width: SCR.w, height: SCR.h }} />}
      <div className={"tv-screen" + (playing && !fading ? " play" : "")} style={{ left: left + SCR.x, top: top + SCR.y, width: SCR.w, height: SCR.h }}>
        <div key={w.key} className="tv-page">
          <div className="tv-title">{w.title}</div>
          {w.cards
            ? <div className="tv-grid">
                {w.cards.map(c => c.won && c.video
                  ? <div key={c.id} className="tv-card sv-tap" onClick={() => play(c)}>
                      <div className="tv-poster"><img src={c.poster} alt="" /></div>
                      <i className="tv-play" />
                      <p>{c.name}</p>
                      {newIds.includes(c.id) && <span className="sv-dot" />}
                    </div>
                  : <div key={c.id} className="tv-card locked"><div className="tv-q">?</div><p>???</p></div>)}
              </div>
            : <div className="tv-soon">Coming soon!</div>}
        </div>
        {playing && playing.video && (
          <video className={"tv-video" + (fading ? " out" : "")} src={playing.video} autoPlay loop playsInline controls
            controlsList="nodownload noplaybackrate" disablePictureInPicture />
        )}
      </div>
      {playing && !fading && (
        <div className="sv-rb sv-tap tv-vx" style={{ left: left + SCR.x + SCR.w - 44, top: top + SCR.y - 32 }} onClick={stop}>
          <img src={`${UI}/rb_exit.webp`} alt="Close" />
        </div>
      )}

      <div className={"tv-arrow l sv-tap" + (wi === 0 ? " off" : "")} style={{ left: left + SCR.x - 190, top: top + SCR.y + SCR.h / 2 - 50 }}
        onClick={() => wi > 0 && setWi(wi - 1)}><i /></div>
      <div className={"tv-arrow r sv-tap" + (wi === worlds.length - 1 ? " off" : "")} style={{ left: left + SCR.x + SCR.w + 90, top: top + SCR.y + SCR.h / 2 - 50 }}
        onClick={() => wi < worlds.length - 1 && setWi(wi + 1)}><i /></div>

      {/* popcorn: box hops, 3 popcorn pop out and stay on the floor */}
      <i className="tv-cs box" style={{ left: boxLeft + BOX_W / 2, top: floor, width: BOX_W * 0.95, height: 14 }} />
      {POP.map((p, i) => (
        <i key={"s" + i} className="tv-cs pop" style={{ left: boxLeft + p[0], top: floor - p[1], width: p[3] * 1.15, height: 6, animationDelay: `${650 + p[4] + 690}ms` }} />
      ))}
      {POP.map((p, i) => (
        <div key={i} className="tv-pop" style={{ left: boxLeft + BOX_W / 2, top: floor - BOX_H, ["--dx" as string]: `${p[0] - BOX_W / 2}px`, ["--dy" as string]: `${BOX_H - p[1] - p[3] / 2}px`, animationDelay: `${650 + p[4]}ms` } as CSSProperties}>
          <div className="tv-popy" style={{ ["--dy" as string]: `${BOX_H - p[1] - p[3] / 2}px`, animationDelay: `${650 + p[4]}ms` } as CSSProperties}>
            <img src={`${T}/popcorn${i + 1}.webp`} alt="" style={{ width: p[3], margin: -p[3] / 2, ["--r" as string]: `${p[2]}deg`, animationDelay: `${650 + p[4]}ms` } as CSSProperties} />
          </div>
        </div>
      ))}
      <img className="tv-box" src={`${T}/popcorn_box.webp`} alt="" style={{ left: boxLeft, top: floor - BOX_H, height: BOX_H }} />

      </div>

      <div className="sv-rb sv-tap tv-x" onClick={onClose}><img src={`${UI}/rb_exit.webp`} alt="Close" /></div>

    </div>
  );
}

const CSS = `
.tv-root{position:absolute;inset:0;z-index:50;background:#5b2d9e;overflow:hidden;animation:tv-in .35s ease-out both}
@keyframes tv-in{from{opacity:0}to{opacity:1}}
.tv-fill{position:absolute;inset:-40px;width:calc(100% + 80px);height:calc(100% + 80px);max-width:none;object-fit:cover;filter:blur(22px) brightness(.85)}
.tv-pic{position:absolute;transform-origin:50% 50%}
.tv-bg{position:absolute;max-width:none}
.tv-screen{position:absolute;z-index:3;border-radius:18px;overflow:hidden}
.tv-screen .tv-page{transition:opacity .6s ease-out}
.tv-screen.play .tv-page{opacity:0;pointer-events:none}
.tv-video{position:absolute;inset:0;width:100%;height:100%;object-fit:contain;background:#120822;animation:tv-in .5s ease-out both;transition:opacity .4s}
.tv-video.out{animation:tv-out .6s ease-in both}
@keyframes tv-out{from{opacity:1}to{opacity:0}}
.tv-lights{position:absolute;z-index:2;border-radius:18px;pointer-events:none;box-shadow:0 0 0 4000px rgba(12,3,28,.62);animation:tv-in .5s ease-out both;transition:opacity .4s}
.tv-lights.out{animation:tv-out .6s ease-in both}
.tv-vx{z-index:4;width:76px}
.tv-page{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;animation:tv-page .35s ease-out both}
@keyframes tv-page{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
.tv-title{margin-top:14px;font-family:'Titan One',sans-serif;font-size:46px;line-height:1;color:#7a3fd0;text-shadow:0 3px 0 rgba(255,255,255,.8)}
.tv-grid{margin-top:16px;display:grid;grid-template-columns:repeat(3,250px);gap:18px 40px}
.tv-card{position:relative;width:250px;height:184px;border-radius:22px;border:5px solid #f3b81f;box-sizing:border-box;
 background:linear-gradient(180deg,#d6b8ff 0%,#a56df5 100%);box-shadow:0 6px 0 #b07a00,0 10px 14px rgba(60,20,110,.35);overflow:visible}
.tv-card:not(.locked):active{transform:translateY(4px)}
.tv-poster{position:absolute;left:0;right:0;top:4px;height:132px;display:flex;align-items:flex-end;justify-content:center;overflow:hidden}
.tv-poster img{height:128px;width:auto;max-width:none;filter:drop-shadow(0 4px 4px rgba(0,0,0,.3))}
.tv-play{position:absolute;right:10px;top:10px;width:46px;height:46px;border-radius:50%;background:rgba(255,255,255,.95);box-shadow:0 3px 6px rgba(0,0,0,.3)}
.tv-play::after{content:"";position:absolute;left:18px;top:13px;border-style:solid;border-width:10px 0 10px 16px;border-color:transparent transparent transparent #8a45e6}
.tv-card p{position:absolute;left:0;right:0;bottom:8px;margin:0;text-align:center;font-family:'Titan One',sans-serif;font-size:28px;line-height:1;color:#fff;
 text-shadow:2px 0 0 #5a2196,-2px 0 0 #5a2196,0 2px 0 #5a2196,0 -2px 0 #5a2196,0 4px 0 #5a2196}
.tv-card.locked{background:linear-gradient(180deg,#6a4a9e,#43286f);border-color:#b99b54;box-shadow:0 6px 0 #6d5320,0 10px 14px rgba(40,10,80,.35)}
.tv-q{position:absolute;left:0;right:0;top:22px;text-align:center;font-family:'Titan One',sans-serif;font-size:92px;line-height:1;color:rgba(255,255,255,.35)}
.tv-card.locked p{color:rgba(255,255,255,.55)}
.tv-card .sv-dot{right:-12px;top:-12px}
.tv-soon{margin-top:150px;font-family:'Titan One',sans-serif;font-size:56px;color:#a77ae8}
.tv-arrow{position:absolute;width:100px;height:100px;border-radius:50%;box-sizing:border-box;border:6px solid #fff3b0;
 background:radial-gradient(circle at 35% 30%,#fff2a0,#ffc928 55%,#e09300);box-shadow:0 6px 0 #9a5a00,0 12px 16px rgba(0,0,0,.35)}
.tv-arrow i{position:absolute;top:28px;border-style:solid}
.tv-arrow.l i{left:24px;border-width:16px 26px 16px 0;border-color:transparent #fff transparent transparent;filter:drop-shadow(0 2px 0 #b06a00)}
.tv-arrow.r i{left:36px;border-width:16px 0 16px 26px;border-color:transparent transparent transparent #fff;filter:drop-shadow(0 2px 0 #b06a00)}
.tv-arrow:active{transform:translateY(5px)}
.tv-root.playing .tv-arrow{pointer-events:none}
.tv-arrow.off{opacity:.35;filter:grayscale(.6);pointer-events:none}
.tv-x{right:22px}
.tv-box{position:absolute;height:190px;width:auto;max-width:none;transform-origin:50% 100%;
 animation:tv-hop .9s .35s cubic-bezier(.3,.7,.4,1) both}
@keyframes tv-hop{0%{transform:scale(1,1)}15%{transform:scale(1.1,.86)}40%{transform:translateY(-70px) scale(.94,1.08)}62%{transform:translateY(0) scale(1.08,.9)}78%{transform:translateY(-10px) scale(.98,1.02)}100%{transform:none}}
.tv-pop{position:absolute;width:0;height:0;animation:tv-popx .8s linear both}
.tv-popy{animation:tv-popy .8s both}
.tv-pop img{position:absolute;left:0;top:0;max-width:none;animation:tv-spin .8s ease-out both}
@keyframes tv-popx{0%{opacity:0;transform:translateX(0)}8%{opacity:1}100%{opacity:1;transform:translateX(var(--dx))}}
@keyframes tv-popy{0%{transform:translateY(0);animation-timing-function:cubic-bezier(.2,.7,.4,1)}40%{transform:translateY(-120px);animation-timing-function:cubic-bezier(.6,0,.8,.4)}86%{transform:translateY(var(--dy))}93%{transform:translateY(calc(var(--dy) - 12px))}100%{transform:translateY(var(--dy))}}
@keyframes tv-spin{from{transform:rotate(0)}to{transform:rotate(var(--r))}}
.tv-cs{position:absolute;border-radius:50%;transform:translate(-50%,-50%);pointer-events:none;
 background:radial-gradient(closest-side,rgba(40,12,70,.5),rgba(40,12,70,.28) 55%,rgba(40,12,70,0))}
.tv-cs.box{animation:tv-cshop .9s .35s cubic-bezier(.3,.7,.4,1) both}
@keyframes tv-cshop{0%,100%{transform:translate(-50%,-50%) scale(1);opacity:1}40%{transform:translate(-50%,-50%) scale(.55);opacity:.45}62%{transform:translate(-50%,-50%) scale(1.08);opacity:1}}
.tv-cs.pop{opacity:0;animation:tv-in .2s ease-out both}
@media (prefers-reduced-motion: reduce){.tv-cs,.tv-box,.tv-pop,.tv-popy,.tv-pop img,.tv-page{animation-duration:1ms}}
`;
