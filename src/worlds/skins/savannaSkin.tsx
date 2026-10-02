// SAVANNA SKIN = the NEW shared world look, built first with World 3 (step 5.3, 2026-10-02).
// Source: the approved preview BACKUPFILES/world3_art/preview/template.html (v18).
// LOOK ONLY: every rule and every save stays in the brain (src/pages/WorldPage.tsx).
// PART 1: full-screen scene, title, growth bar, animal, name, Feed picture (not wired yet).
// PART 2a: top corners, left buttons, real CookieJar (new treat) + Daily Treat + Visit 5, right cards, My Worlds.
//          DISPLAY ONLY - nothing is wired yet (part 2b). Coins show 0 and badges are grey placeholders.
// HARD RULES: scenery stays still (only the animal + UI move); never window.prompt/alert/confirm;
// gold panels = pre-built images, never CSS border-image; Titan One for all code text; no emojis.
import { useEffect, useState } from "react";
import type { WorldSkin } from "../skin";
import type { WorldView } from "@/pages/WorldPage";
import CookieJar from "@/components/CookieJar";
import { getAnimalStageIdx, type Animal } from "@/worlds/types";

const W = "/worlds/savanna";
const UI = "/worlds/ui";
const STAGE_W = 1600, STAGE_H = 1000; // design size; scaled to fit any window (one screen, no scrolling)

// Fit the 1600x1000 design into the window. The stage grows wider/taller to fill the window;
// buttons pin to its edges, the scene stays centred (cx) with a blurred copy filling the sides.
const useFit = () => {
  const calc = () => {
    const w = window.innerWidth, h = window.innerHeight;
    const s = Math.min(w / STAGE_W, h / STAGE_H);
    return { s, sw: w / s, sh: h / s };
  };
  const [f, setF] = useState(calc);
  useEffect(() => {
    const on = () => setF(calc());
    window.addEventListener("resize", on);
    return () => window.removeEventListener("resize", on);
  }, []);
  return f;
};

// TEST ONLY: on /world-test/ addresses, ?a=<animal>&s=<0-3> SHOWS another animal/stage.
// Display only - it changes nothing in the brain and is never saved.
const useShown = (v: WorldView) => {
  const onTest = window.location.pathname.startsWith("/world-test/");
  const q = new URLSearchParams(window.location.search);
  const picked = onTest ? v.ANIMALS.find(x => x.id === q.get("a")) : undefined;
  const sRaw = onTest ? q.get("s") : null;
  const s = sRaw !== null && /^[0-3]$/.test(sRaw) ? parseInt(sRaw, 10) : null;
  const animal = picked ?? v.activeAnimal;
  if (picked || s !== null) {
    const stageIdx = s ?? 3;
    return { animal, stageIdx, fed: animal.stages[stageIdx].min + (stageIdx < 3 ? 5 : 0) };
  }
  return { animal, stageIdx: v.stageIdx, fed: v.fedTreats };
};

const thumb = (img: string) => img.replace(/\.webp$/, "-t.webp");

const Loading = () => (
  <div style={{ position: "fixed", inset: 0, background: "#2d4a1c", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontFamily: "'Titan One', sans-serif", fontSize: 32 }}>
    <style>{FONTS}</style>
    Loading...
  </div>
);

const Page = ({ v }: { v: WorldView }) => {
  const { s, sw, sh } = useFit();
  const { animal, stageIdx, fed } = useShown(v);
  const cx = sw / 2;
  const max = animal.stages[animal.stages.length - 1].min;
  const stage = animal.stages[stageIdx];
  const next = animal.stages[stageIdx + 1];
  const pct = Math.min(1, fed / max);
  const name = v.petNameMap[animal.id] ?? "";
  const grown = stageIdx === animal.stages.length - 1;
  const sub = next
    ? `${next.min - fed} more treats to grow!`
    : (v.videoWatchedMap[animal.id] ? "All grown up!" : "All grown up! Watch the video!");

  // TEST ONLY flags (display only): ?d=1 shows the Daily Treat button, ?n=1 makes My Animals glow.
  const onTest = window.location.pathname.startsWith("/world-test/");
  const q = new URLSearchParams(window.location.search);
  const showDaily = v.showDailyGift || (onTest && q.get("d") === "1");

  // My Animals: same unlock rule as today's worlds (previous animal grown + its video watched,
  // and that animal itself opened unless it is the first one).
  const isUnlocked = (a: Animal) => {
    if (a.unlockCondition === "default") return true;
    const prev = v.ANIMALS.find(x => x.id === a.unlockCondition.replace(/_grown_video_watched$/, ""));
    if (!prev) return false;
    return getAnimalStageIdx(prev, v.fedTreatsState[prev.id] ?? 0) === 3 && (v.videoWatchedMap[prev.id] ?? false)
      && (prev.unlockCondition === "default" || (v.unlockSeenMap[prev.id] ?? false));
  };
  const slots = v.ANIMALS.map(a => {
    const unlocked = isUnlocked(a);
    const seen = a.unlockCondition === "default" || (v.unlockSeenMap[a.id] ?? false);
    const st = getAnimalStageIdx(a, v.fedTreatsState[a.id] ?? 0);
    return { a, open: unlocked && seen, ready: unlocked && !seen, img: thumb(a.stages[st].img), grownImg: thumb(a.stages[a.stages.length - 1].img) };
  });
  const newReady = slots.some(x => x.ready) || (onTest && q.get("n") === "1");

  // Visit 5 days: dots = days in the current set of 5; all 5 lit when the +3 is ready to claim.
  const visitReady = Math.floor(v.visitDaysCount / 5) > 0 && !v.visit5Claimed;
  const lit = visitReady ? 5 : v.visitDaysCount % 5;

  return (
    <div className="sv-root">
      <style>{FONTS + CSS}</style>
      <div className="sv-stage" style={{ width: sw, height: sh, transform: `translate(-50%,-50%) scale(${s})` }}>
        <div className="sv-fill"><img src={`${W}/far.jpg`} alt="" /></div>
        <div className="sv-scene" style={{ left: cx - STAGE_W / 2 }}>
          <img className="sv-bg" src={`${W}/far.jpg`} alt="" />
          <img className="sv-bg" src={`${W}/front.webp`} alt="" />
        </div>

        <div className="sv-grow" style={{ left: cx - 290 }}>
          <div className="sv-lbl">Stage {stageIdx + 1} of 4 {"·"} {stage.name}</div>
          <div className="sv-bar">
            <div className="sv-barfill" style={{ width: `calc(${pct * 100}% - 6px)` }} />
            {animal.stages.map((st, i) => (
              <div key={i} className={"sv-stop" + (fed >= st.min ? "" : " off")} style={{ left: `${(st.min / max) * 100}%` }}>
                <img src={thumb(st.img)} alt="" />
              </div>
            ))}
          </div>
          <div className="sv-sub">{sub}</div>
        </div>

        <img className="sv-title" src={`${W}/title.webp`} alt="Savanna World" />

        <div className={"sv-animal" + (stageIdx === 0 ? " egg" : "")} style={{ left: cx - 320 }}>
          <img src={stage.img} alt={animal.name} />
        </div>

        {name
          ? <div className="sv-petname">{name}</div>
          : <div className="sv-nametag"><img src={`${UI}/lbl_name.webp`} alt="Name your pet!" /></div>}

        <div className={"sv-feed" + (grown ? " off" : "")}><img src={`${UI}/btn_feed.webp`} alt="Feed!" /></div>

        {/* top corners */}
        <div className="sv-rb" style={{ left: 22 }}><img src={`${UI}/rb_help.webp`} alt="Help" /></div>
        <div className="sv-coins"><span>0</span></div>
        <div className="sv-rb" style={{ right: 100 }}><img src={`${UI}/rb_music.webp`} alt="Music" /></div>
        <div className="sv-rb" style={{ right: 22 }}><img src={`${UI}/rb_exit.webp`} alt="Exit" /></div>

        {/* left: ways to earn */}
        <div className="sv-left">
          <div className="sv-imgbtn"><img src={`${UI}/btn_vocab.webp`} alt="Vocab Games" /></div>
          <div className="sv-imgbtn"><img src={`${UI}/btn_grammar.webp`} alt="Grammar Games" /></div>
          <div className="sv-imgbtn"><img src={`${UI}/btn_puzzle.webp`} alt="Puzzle Activity" /></div>
          <div className="sv-imgbtn"><img src={`${UI}/btn_video.webp`} alt="Video Theater" /></div>
        </div>

        {/* bottom left: the real jar (new treat), Daily Treat, Visit 5 days */}
        <div className="sv-jar">
          <CookieJar count={v.jarTreats} width="200px" cookie={`${UI}/treat.webp`} style={{ position: "absolute", left: 0, bottom: 0 }} />
          <div className="sv-jarcount">{v.jarTreats}</div>
        </div>
        <img className="sv-jarlbl" src={`${UI}/lbl_treats.webp`} alt="My Treats" />
        {showDaily && <div className="sv-daily"><img src={`${UI}/btn_daily.webp`} alt="Daily Treat!" /></div>}
        <div className={"sv-visit" + (visitReady ? " ready" : "")}>
          Visit 5 days
          <div className="sv-dots">{[0, 1, 2, 3, 4].map(i => <i key={i} className={i < lit ? "on" : ""} />)}</div>
        </div>

        {/* right: cards (pre-built gold frames, never CSS border-image) */}
        <div className={"sv-card sv-animals" + (newReady ? " glow" : "")}>
          {newReady && <span className="sv-new">NEW!</span>}
          <div className="sv-grid">
            {slots.map(x => (
              <div key={x.a.id} className={"sv-slot" + (x.open ? " done" : " locked")}><img src={x.open ? x.img : x.grownImg} alt="" /></div>
            ))}
          </div>
          <img className="sv-cardlbl" style={{ top: 179, height: 46 }} src={`${UI}/lbl_animals.webp`} alt="My Animals" />
        </div>
        <div className="sv-card sv-badges">
          <div className="sv-medals">{[0, 1, 2].map(i => <img key={i} className="sv-medal off" src={`${UI}/medal.webp`} alt="" />)}</div>
          <img className="sv-cardlbl" style={{ top: 111, height: 45 }} src={`${UI}/lbl_badges.webp`} alt="My Badges" />
        </div>
        <div className="sv-card sv-album">
          <img className="sv-cardlbl" style={{ top: 176, height: 38 }} src={`${UI}/lbl_album.webp`} alt="Card Album" />
        </div>
        <div className="sv-card sv-worlds">
          <div className="sv-wrow">
            <img src={`${UI}/world_ocean.webp`} alt="Ocean World" />
            <img src={`${UI}/world_dino.webp`} alt="Dino World" />
            <img className="here" src={`${UI}/world_savanna.webp`} alt="Savanna World" />
          </div>
          <img className="sv-cardlbl" style={{ top: 102, height: 48 }} src={`${UI}/lbl_worlds.webp`} alt="My Worlds" />
        </div>
      </div>
    </div>
  );
};

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Titan+One&display=swap');`;

const CSS = `
.sv-root{position:fixed;inset:0;overflow:hidden;background:#000;user-select:none;-webkit-user-select:none}
.sv-stage{position:absolute;left:50%;top:50%;transform-origin:center center;overflow:hidden;font-family:'Titan One',sans-serif;color:#4a2b0f}
.sv-fill{position:absolute;left:0;top:0;width:100%;height:100%;overflow:hidden}
.sv-fill img{position:absolute;inset:-40px;max-width:none;width:calc(100% + 80px);height:calc(100% + 80px);object-fit:cover;filter:blur(18px) saturate(1.15) brightness(.92)}
.sv-scene{position:absolute;top:0;width:1600px;height:1000px;
 -webkit-mask-image:linear-gradient(90deg,transparent 0,#000 110px,#000 calc(100% - 110px),transparent 100%);
 mask-image:linear-gradient(90deg,transparent 0,#000 110px,#000 calc(100% - 110px),transparent 100%)}
.sv-bg{position:absolute;left:0;bottom:0;width:1600px;height:1067px;pointer-events:none}
.sv-grow{position:absolute;top:6px;width:580px;height:166px;background:url(${UI}/topbar.webp) center/100% 100% no-repeat;filter:drop-shadow(0 8px 8px rgba(0,0,0,.3))}
.sv-lbl{position:absolute;left:0;right:0;top:24px;text-align:center;font-size:24px;color:#8a4f1d;letter-spacing:.5px;white-space:nowrap}
.sv-bar{position:absolute;left:70px;right:70px;top:84px;height:30px;background:#6b3a12;border-radius:16px;box-shadow:inset 0 3px 6px rgba(0,0,0,.45)}
.sv-barfill{position:absolute;left:3px;top:3px;bottom:3px;border-radius:13px;background:linear-gradient(#ffe36b,#ffb000);box-shadow:inset 0 3px 0 rgba(255,255,255,.55);transition:width .6s cubic-bezier(.3,1.4,.5,1)}
.sv-stop{position:absolute;top:50%;width:54px;height:54px;margin:-27px 0 0 -27px;border-radius:50%;background:#fff3d1;border:4px solid #c47a2c;box-shadow:0 3px 0 #8a4f1d}
.sv-stop img{display:block;width:100%;height:100%;border-radius:50%;transition:filter .6s,opacity .6s}
.sv-stop.off img{filter:brightness(0) blur(2.5px);opacity:.45}
.sv-sub{position:absolute;left:0;right:0;top:122px;text-align:center;font-size:18px;color:#6b3a12;white-space:nowrap}
.sv-title{position:absolute;left:50%;top:168px;height:78px;width:auto;transform:translateX(-50%);filter:drop-shadow(0 7px 5px rgba(60,25,0,.45));pointer-events:none}
.sv-animal{position:absolute;top:201px;width:640px;height:640px;transform-origin:50% 92%;animation:sv-idle 6s ease-in-out infinite}
.sv-animal.egg{animation:sv-wobble 2.6s ease-in-out infinite}
.sv-animal img{display:block;width:100%;height:100%;pointer-events:none}
@keyframes sv-idle{0%,100%{transform:rotate(0) scale(1,1)}25%{transform:rotate(-.9deg) scale(1.008,.992)}50%{transform:rotate(0) scale(1.014,.984)}75%{transform:rotate(.9deg) scale(1.008,.992)}}
@keyframes sv-wobble{0%,70%,100%{transform:rotate(0)}76%{transform:rotate(-3deg)}84%{transform:rotate(3deg)}92%{transform:rotate(-1.5deg)}}
.sv-nametag{position:absolute;left:50%;top:824px;transform:translateX(-50%);animation:sv-nameBob 1.6s ease-in-out infinite}
.sv-nametag img{display:block;height:54px;width:auto;filter:drop-shadow(0 5px 5px rgba(0,0,0,.4))}
@keyframes sv-nameBob{0%,100%{transform:translateX(-50%) scale(1)}50%{transform:translateX(-50%) scale(1.06)}}
.sv-petname{position:absolute;left:50%;top:820px;transform:translateX(-50%);font-size:58px;line-height:1;color:#fff;white-space:nowrap;
 text-shadow:-3px -3px 0 #7a3f08,3px -3px 0 #7a3f08,-3px 3px 0 #7a3f08,3px 3px 0 #7a3f08,0 -3px 0 #7a3f08,0 3px 0 #7a3f08,-3px 0 0 #7a3f08,3px 0 0 #7a3f08,0 7px 0 #7a3f08,0 10px 12px rgba(0,0,0,.45)}
.sv-feed{position:absolute;left:50%;top:892px;width:430px;transform:translateX(-50%);filter:drop-shadow(0 8px 8px rgba(0,0,0,.35))}
.sv-feed img{display:block;width:100%;height:auto;pointer-events:none}
.sv-feed.off{filter:grayscale(.7);opacity:.6}
.sv-rb{position:absolute;top:14px;width:76px;filter:drop-shadow(0 8px 8px rgba(0,0,0,.35))}
.sv-rb img,.sv-imgbtn img,.sv-daily img{display:block;width:100%;height:auto;pointer-events:none}
.sv-coins{position:absolute;left:104px;top:16px;width:230px;height:90px;padding-left:96px;display:flex;align-items:center;justify-content:center;
 background:url(${UI}/pill_coin.webp) center/100% 100% no-repeat;font-size:34px;color:#8a4a10;filter:drop-shadow(0 8px 8px rgba(0,0,0,.3))}
.sv-left{position:absolute;left:22px;top:104px;width:270px;display:flex;flex-direction:column;gap:14px}
.sv-imgbtn{width:270px;filter:drop-shadow(0 8px 8px rgba(0,0,0,.35))}
.sv-jar{position:absolute;left:55px;bottom:52px;width:200px;height:258px}
.sv-jarcount{position:absolute;left:50%;bottom:6px;transform:translateX(-50%);z-index:3;background:#6b3a12;color:#fff;font-size:30px;line-height:36px;border-radius:20px;padding:0 18px;border:4px solid #ffd43b}
.sv-jarlbl{position:absolute;left:55px;bottom:14px;width:200px;height:36px;object-fit:contain;filter:drop-shadow(0 3px 3px rgba(0,0,0,.35));pointer-events:none}
.sv-daily{position:absolute;left:290px;bottom:116px;width:250px;filter:drop-shadow(0 8px 8px rgba(0,0,0,.35));animation:sv-bounce 1.2s ease-in-out infinite}
@keyframes sv-bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
.sv-visit{position:absolute;left:290px;bottom:20px;width:176px;height:95px;padding:24px 0 0 26px;background:url(${UI}/frame_visit.webp) 0 0/100% 100% no-repeat;
 font-size:17px;line-height:1.2;color:#8a4f1d;filter:drop-shadow(0 8px 8px rgba(0,0,0,.3))}
.sv-dots{display:flex;gap:6px;margin-top:4px}
.sv-dots i{width:20px;height:20px;border-radius:50%;background:#e9d6b0;border:2px solid #c47a2c}
.sv-dots i.on{background:#ffc21c}
.sv-card{position:absolute;right:30px;width:262px;background-position:0 0;background-size:100% 100%;background-repeat:no-repeat;filter:drop-shadow(0 8px 8px rgba(0,0,0,.3))}
.sv-cardlbl{position:absolute;left:50%;transform:translateX(-50%);width:auto;filter:drop-shadow(0 4px 4px rgba(0,0,0,.35));pointer-events:none}
.sv-animals{top:112px;height:191px;background-image:url(${UI}/frame_animals.webp)}
.sv-grid{position:absolute;left:22px;top:22px;width:219px;display:grid;grid-template-columns:repeat(3,69px);gap:6px}
.sv-slot{width:69px;height:69px;border-radius:14px;background:#f1dcae;border:3px dashed #d1a868;overflow:hidden}
.sv-slot img{display:block;width:100%;height:100%}
.sv-slot.done{border-style:solid;background:#fff3d1}
.sv-slot.locked img{filter:brightness(0);opacity:.25}
.sv-animals.glow{animation:sv-glow 1.1s ease-in-out infinite}
@keyframes sv-glow{0%,100%{filter:drop-shadow(0 8px 8px rgba(0,0,0,.3))}50%{filter:drop-shadow(0 0 22px rgba(255,215,60,1)) drop-shadow(0 0 10px rgba(255,215,60,1))}}
.sv-new{position:absolute;top:-14px;right:-8px;z-index:2;background:#ff3d7f;color:#fff;font-size:18px;border-radius:14px;padding:3px 10px;border:3px solid #fff;transform:rotate(8deg)}
.sv-badges{top:353px;height:122px;background-image:url(${UI}/frame_badges.webp)}
.sv-medals{position:absolute;left:0;right:0;top:26px;display:flex;justify-content:center;gap:8px}
.sv-medal{width:65px;height:70px;object-fit:contain;filter:drop-shadow(0 3px 2px rgba(0,0,0,.3))}
.sv-medal.off{filter:grayscale(1) brightness(1.15);opacity:.4}
.sv-album{top:525px;height:190px;background-image:url(${UI}/panel_album.webp)}
.sv-worlds{top:auto;bottom:84px;height:112px;background-image:url(${UI}/frame_worlds.webp)}
.sv-wrow{position:absolute;left:0;right:0;top:14px;display:flex;justify-content:center;gap:10px}
.sv-wrow img{width:62px;height:62px;border-radius:50%;border:4px solid #e9b53a;box-shadow:0 3px 0 #a86a10}
.sv-wrow img.here{border-color:#fff;box-shadow:0 0 0 3px #e9b53a,0 3px 0 3px #a86a10}
@media (prefers-reduced-motion: reduce){.sv-animal,.sv-animal.egg,.sv-nametag,.sv-daily,.sv-animals.glow{animation:none}}
`;

export const SAVANNA_SKIN: WorldSkin = {
  Loading, Page,
  makeSounds: () => ({}),          // part 2: click sound + effects
  music: `${W}/music.mp3`,
  snd: { visit5: "", levelUp: "", rename: "" },
  levelUpMusic: null,
  renameMusic: null,
  completeDelayMs: 800,
  completeWaitsForLevelUp: false,
};
