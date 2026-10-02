// SAVANNA SKIN = the NEW shared world look, built first with World 3 (step 5.3, 2026-10-02).
// Source: the approved preview BACKUPFILES/world3_art/preview/template.html (v18).
// LOOK ONLY: every rule and every save stays in the brain (src/pages/WorldPage.tsx).
// PART 1: full-screen scene, title, growth bar, animal, name, Feed picture (not wired yet).
// HARD RULES: scenery stays still (only the animal + UI move); never window.prompt/alert/confirm;
// gold panels = pre-built images, never CSS border-image; Titan One for all code text; no emojis.
import { useEffect, useState } from "react";
import type { WorldSkin } from "../skin";
import type { WorldView } from "@/pages/WorldPage";

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
@media (prefers-reduced-motion: reduce){.sv-animal,.sv-animal.egg,.sv-nametag{animation:none}}
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
