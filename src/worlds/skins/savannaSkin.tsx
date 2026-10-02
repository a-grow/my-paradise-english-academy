// SAVANNA SKIN = the NEW shared world look, built first with World 3 (step 5.3, 2026-10-02).
// Source: the approved preview BACKUPFILES/world3_art/preview/template.html (v18).
// LOOK ONLY: every rule and every save stays in the brain (src/pages/WorldPage.tsx).
// PART 1: full-screen scene, title, growth bar, animal, name, Feed picture (not wired yet).
// PART 2a: top corners, left buttons, real CookieJar (new treat) + Daily Treat + Visit 5, right cards, My Worlds.
//          Coins show 0 and badges are grey placeholders.
// PART 2b: taps wired through the brain's own handlers (feed, name, daily, visit 5, unlock, switch animal, music);
//          exit popup (Stay/Leave, never a system box), click sound, flying treat + hop. Left buttons / help / badges /
//          album / worlds = 'Coming soon!' for now (Vocab needs a savanna return in GamePage first - step 5.4).
// HARD RULES: scenery stays still (only the animal + UI move); never window.prompt/alert/confirm;
// gold panels = pre-built images, never CSS border-image; Titan One for all code text; no emojis.
import { useEffect, useRef, useState } from "react";
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
    const w = window.innerWidth || STAGE_W, h = window.innerHeight || STAGE_H; // 0 in a hidden window -> design size
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
    return { animal, stageIdx, fed: animal.stages[stageIdx].min + (stageIdx < 3 ? 5 : 0), testView: true };
  }
  return { animal, stageIdx: v.stageIdx, fed: v.fedTreats, testView: false };
};

const thumb = (img: string) => img.replace(/\.webp$/, "-t.webp");

// New animal ready: a SPARKLER behind My Animals (card 262 x 191, centre 131,95) - everything shoots out from the
// centre in all directions and appears past the card's edges. Fixed pseudo-random numbers (same every load).
const SPARK = (() => {
  let seed = 11;
  const r = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  // dots: [angle deg, distance px, size px, seconds, delay seconds]
  const dots = Array.from({ length: 90 }, () => [r() * 360, 150 + r() * 120, 2 + r() * 2.5, 0.7 + r() * 0.7, -r() * 1.4]);
  // streaks: [angle deg, distance px, length px, seconds, delay seconds]
  const streaks = Array.from({ length: 26 }, () => [r() * 360, 150 + r() * 90, 18 + r() * 22, 0.5 + r() * 0.4, -r() * 0.9]);
  // twinkle stars: [angle deg, distance px, size px, seconds, delay seconds]
  const stars = Array.from({ length: 16 }, () => [r() * 360, 140 + r() * 90, 12 + r() * 10, 0.8 + r() * 0.6, -r() * 1.4]);
  return { dots, streaks, stars };
})();

const Loading = () => (
  <div style={{ position: "fixed", inset: 0, background: "#2d4a1c", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontFamily: "'Titan One', sans-serif", fontSize: 32 }}>
    <style>{FONTS}</style>
    Loading...
  </div>
);

const Page = ({ v }: { v: WorldView }) => {
  const { s, sw, sh } = useFit();
  const { animal, stageIdx, fed, testView } = useShown(v);
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
    return { a, open: unlocked && seen, ready: unlocked && !seen, img: thumb(a.stages[st].img), bigImg: a.stages[st].img, grownImg: thumb(a.stages[a.stages.length - 1].img) };
  });
  const [unlockedNow, setUnlockedNow] = useState(false);
  const newReady = slots.some(x => x.ready) || (onTest && q.get("n") === "1" && !unlockedNow);

  // Visit 5 days: dots = days in the current set of 5; all 5 lit when the +3 is ready to claim.
  const visitReady = Math.floor(v.visitDaysCount / 5) > 0 && !v.visit5Claimed;
  const lit = visitReady ? 5 : v.visitDaysCount % 5;

  // ---- PART 2b: taps (the test view ?a=/?s= is look-only, so feeding/naming are off there) ----
  const [toastMsg, setToastMsg] = useState("");
  const toastT = useRef(0);
  const toast = (t: string) => { setToastMsg(t); window.clearTimeout(toastT.current); toastT.current = window.setTimeout(() => setToastMsg(""), 1700); };
  const soon = () => toast("Coming soon!");
  const [panel, setPanel] = useState<null | "animals" | "exit">(null);
  const [dailyGone, setDailyGone] = useState(false);
  const [jarPoke, setJarPoke] = useState(0);
  // Treats won while away (games) FALL INTO the jar: the jar starts at the count this device last showed,
  // then moves to the real count. Display only - a per-device hint, never Supabase, never a save.
  const seenKey = `mpe_jarseen_${v.code}_${v.studentName}`;
  const [jarShown, setJarShown] = useState(() => {
    const testJ = onTest ? parseInt(q.get("j") ?? "", 10) : NaN; // TEST ONLY: ?j=10 = pretend 10 treats were just won
    if (Number.isFinite(testJ) && testJ > 0) return Math.max(0, v.jarTreats - testJ);
    const seen = parseInt(localStorage.getItem(seenKey) ?? "", 10);
    return Number.isFinite(seen) && seen >= 0 && seen < v.jarTreats ? seen : v.jarTreats;
  });
  const firstJar = useRef(true);
  useEffect(() => {
    localStorage.setItem(seenKey, String(v.jarTreats));
    const wait = firstJar.current && jarShown < v.jarTreats ? 900 : 0; // first time: let the page settle, then drop them in
    firstJar.current = false;
    const t = window.setTimeout(() => setJarShown(v.jarTreats), wait);
    return () => window.clearTimeout(t);
  }, [v.jarTreats]);

  // Feed: the brain feeds (jar -1, fed +1, saves); here a treat flies jar -> animal, then the animal hops.
  const [flying, setFlying] = useState<number[]>([]);
  const [hop, setHop] = useState(0);
  const canFeed = !testView && !grown && v.jarTreats > 0;
  const feed = () => {
    if (testView) return;
    if (grown) { toast("All grown up!"); return; }
    if (v.jarTreats <= 0) { toast("Play games to earn treats!"); return; }
    v.handleFeed();
    const id = Date.now() + Math.random();
    setFlying(f => [...f, id]);
    window.setTimeout(() => { setFlying(f => f.filter(x => x !== id)); setHop(h => h + 1); }, 650);
  };

  // Name typed right on the page (never a system box). Max 12 letters; empty = keep the old name.
  const [naming, setNaming] = useState(false);
  const namingRef = useRef(false);
  const [draft, setDraft] = useState("");
  const [burst, setBurst] = useState(0);
  const startName = () => { if (testView) return; namingRef.current = true; setDraft(name); setNaming(true); };
  const endName = (save: boolean) => {
    if (!namingRef.current) return;
    namingRef.current = false; setNaming(false);
    const t = draft.trim().slice(0, 12);
    if (save && t && t !== name) { v.savePetName(t); setBurst(b => b + 1); }
  };

  const claimDaily = () => { if (v.showDailyGift) v.claimDailyGift(); setDailyGone(true); toast("+1 treat!"); };
  const visit5 = () => {
    if (visitReady) { v.handleVisit5Days(); toast("+3 treats!"); }
    else toast("Visit 5 days for 3 treats!");
  };

  // Click sound on everything a kid can tap (class sv-tap). Follows the brain's sound on/off.
  const clicks = useRef<HTMLAudioElement[]>([]);
  const clickN = useRef(0);
  const onPointerDown = (e: React.PointerEvent) => {
    if (!v.sfxOn || !(e.target as HTMLElement).closest(".sv-tap")) return;
    if (!clicks.current.length) clicks.current = [0, 1, 2].map(() => { const a = new Audio(`${UI}/click.mp3`); a.volume = 0.5; return a; });
    const a = clicks.current[clickN.current++ % 3];
    a.currentTime = 0; a.play().catch(() => { });
  };

  return (
    <div className="sv-root" onPointerDown={onPointerDown}>
      <style>{FONTS + CSS}</style>
      <div className="sv-stage" style={{ width: sw, height: sh, transform: `translate(-50%,-50%) scale(${s})` }}>
        <div className="sv-fill"><img src={`${W}/far.jpg`} alt="" /></div>
        <div className="sv-scene" style={{ left: cx - STAGE_W / 2 }}>
          <img className="sv-bg" src={`${W}/far.jpg`} alt="" />
          <img className="sv-bg" src={`${W}/front.webp`} alt="" />
        </div>

        <div className="sv-grow" style={{ left: cx - 290 }}>
          <div className="sv-lbl">Stage {stageIdx + 1} of 4 {"\u00b7"} {stage.name}</div>
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
          <div key={hop} className={"sv-hop" + (hop ? " go" : "")}><img src={stage.img} alt={animal.name} /></div>
        </div>

        {naming
          ? <input className="sv-nameinput" style={{ left: cx - 330 }} autoFocus maxLength={12} autoComplete="off" spellCheck={false}
              placeholder="Type a name" value={draft} onChange={e => setDraft(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); endName(true); } else if (e.key === "Escape") endName(false); }}
              onBlur={() => endName(true)} />
          : name
            ? <div key={"n" + burst} className="sv-petname sv-tap" onClick={startName}>{name}</div>
            : <div className="sv-nametag sv-tap" onClick={startName}><img src={`${UI}/lbl_name.webp`} alt="Name your pet!" /></div>}
        {burst > 0 && (
          <div key={"b" + burst} className="sv-burst" style={{ left: cx }}>
            {Array.from({ length: 18 }, (_, i) => {
              const ang = (Math.PI * 2 * i) / 18, d = 150 + (i % 3) * 45;
              return <img key={i} src={`${UI}/sparkle.webp`} alt="" style={{ ["--dx" as string]: `${Math.cos(ang) * d}px`, ["--dy" as string]: `${Math.sin(ang) * d * 0.55}px`, width: 22 + (i % 4) * 7, animationDelay: `${(i % 5) * 25}ms` }} />;
            })}
          </div>
        )}

        <div className={"sv-feed sv-ptr" + (canFeed ? "" : " off")} onClick={feed}><img src={`${UI}/btn_feed.webp`} alt="Feed!" /></div>
        {flying.map(id => (
          <div key={id} className="sv-fly" style={{ ["--x0" as string]: "123px", ["--x1" as string]: `${cx - 32}px`, ["--y0" as string]: `${sh - 300}px`, ["--ym" as string]: `${(sh - 300 + 480) / 2 - 260}px`, ["--y1" as string]: "480px" }}>
            <img src={`${UI}/treat.webp`} alt="" />
          </div>
        ))}

        {/* top corners */}
        <div className="sv-rb sv-tap" style={{ left: 22 }} onClick={() => toast("How to play - coming soon!")}><img src={`${UI}/rb_help.webp`} alt="Help" /></div>
        <div className="sv-coins"><span>0</span></div>
        <div className={"sv-rb sv-tap" + (v.musicOn ? "" : " muted")} style={{ right: 100 }} onClick={() => v.setMusicOn(!v.musicOn)}><img src={`${UI}/rb_music.webp`} alt="Music" /></div>
        <div className="sv-rb sv-tap" style={{ right: 22 }} onClick={() => setPanel("exit")}><img src={`${UI}/rb_exit.webp`} alt="Exit" /></div>

        {/* left: ways to earn */}
        <div className="sv-left">
          <div className="sv-imgbtn sv-tap" onClick={soon}><img src={`${UI}/btn_vocab.webp`} alt="Vocab Games" /></div>
          <div className="sv-imgbtn sv-tap" onClick={soon}><img src={`${UI}/btn_grammar.webp`} alt="Grammar Games" /></div>
          <div className="sv-imgbtn sv-tap" onClick={soon}><img src={`${UI}/btn_puzzle.webp`} alt="Puzzle Activity" /></div>
          <div className="sv-imgbtn sv-tap" onClick={soon}><img src={`${UI}/btn_video.webp`} alt="Video Theater" /></div>
        </div>

        {/* bottom left: the real jar (new treat), Daily Treat, Visit 5 days */}
        <div className="sv-jar" onClick={() => setJarPoke(p => p + 1)}>
          <CookieJar count={jarShown} width="200px" cookie={`${UI}/treat.webp`} muted={!v.sfxOn} flyOut={false} poke={jarPoke} style={{ position: "absolute", left: 0, bottom: 0 }} />
          <div className="sv-jarcount">{v.jarTreats}</div>
        </div>
        <img className="sv-jarlbl" src={`${UI}/lbl_treats.webp`} alt="My Treats" />
        {showDaily && !dailyGone && <div className="sv-daily sv-tap" onClick={claimDaily}><img src={`${UI}/btn_daily.webp`} alt="Daily Treat!" /></div>}
        <div className={"sv-visit sv-tap" + (visitReady ? " ready" : "")} onClick={visit5}>
          Visit 5 days
          <div className="sv-dots">{[0, 1, 2, 3, 4].map(i => <i key={i} className={i < lit ? "on" : ""} />)}</div>
        </div>

        {/* right: cards (pre-built gold frames, never CSS border-image) */}
        {newReady && panel !== "animals" && (
          <div className="sv-sparkler" aria-hidden="true">
            <div className="sv-halo" />
            {SPARK.dots.map((d, i) => (
              <i key={"d" + i} className="sv-sd" style={{ width: d[2], height: d[2], margin: -d[2] / 2, ["--a" as string]: `${d[0]}deg`, ["--d" as string]: `${d[1]}px`, animationDuration: `${d[3]}s`, animationDelay: `${d[4]}s` }} />
            ))}
            {SPARK.streaks.map((t, i) => (
              <b key={"s" + i} className="sv-ss" style={{ width: t[2], ["--a" as string]: `${t[0]}deg`, ["--d" as string]: `${t[1]}px`, animationDuration: `${t[3]}s`, animationDelay: `${t[4]}s` }} />
            ))}
            {SPARK.stars.map((t, i) => (
              <img key={"t" + i} className="sv-st" src={`${UI}/sparkle.webp`} alt="" style={{ width: t[2], height: t[2], margin: -t[2] / 2, ["--a" as string]: `${t[0]}deg`, ["--d" as string]: `${t[1]}px`, animationDuration: `${t[3]}s`, animationDelay: `${t[4]}s` }} />
            ))}
          </div>
        )}
        <div className={"sv-card sv-animals sv-tap" + (newReady && panel !== "animals" ? " beacon" : "")} onClick={() => setPanel("animals")}>
          {newReady && <span className="sv-new">NEW!</span>}
          <div className="sv-grid">
            {slots.map(x => (
              <div key={x.a.id} className={"sv-slot" + (x.open ? " done" : " locked")}><img src={x.open ? x.img : x.grownImg} alt="" /></div>
            ))}
          </div>
          <img className="sv-cardlbl" style={{ top: 179, height: 46 }} src={`${UI}/lbl_animals.webp`} alt="My Animals" />
        </div>
        <div className="sv-card sv-badges sv-tap" onClick={soon}>
          <div className="sv-medals">{[0, 1, 2].map(i => <img key={i} className="sv-medal off" src={`${UI}/medal.webp`} alt="" />)}</div>
          <img className="sv-cardlbl" style={{ top: 111, height: 45 }} src={`${UI}/lbl_badges.webp`} alt="My Badges" />
        </div>
        <div className="sv-card sv-album sv-tap" onClick={soon}>
          <img className="sv-cardlbl" style={{ top: 176, height: 38 }} src={`${UI}/lbl_album.webp`} alt="Card Album" />
        </div>
        <div className="sv-card sv-worlds sv-tap" onClick={soon}>
          <div className="sv-wrow">
            <img src={`${UI}/world_ocean.webp`} alt="Ocean World" />
            <img src={`${UI}/world_dino.webp`} alt="Dino World" />
            <img className="here" src={`${UI}/world_savanna.webp`} alt="Savanna World" />
          </div>
          <img className="sv-cardlbl" style={{ top: 102, height: 48 }} src={`${UI}/lbl_worlds.webp`} alt="My Worlds" />
        </div>

        {toastMsg && <div className="sv-toast">{toastMsg}</div>}

        {/* My Animals screen: visit an open animal, or unlock the new friend */}
        {panel === "animals" && (
          <div className="sv-ov" onClick={() => setPanel(null)}>
            <div className="sv-ovcard" onClick={e => e.stopPropagation()}>
              <div className="sv-x sv-tap" onClick={() => setPanel(null)}><img src={`${UI}/rb_exit.webp`} alt="Close" /></div>
              <h2>My Savanna Animals</h2>
              <div className="sv-biggrid">
                {slots.map(x => {
                  const here = x.a.id === v.activeAnimalId;
                  if (x.open) return (
                    <div key={x.a.id} className={"sv-big sv-tap" + (here ? " here" : "")}
                      onClick={() => { if (!here) { v.setActiveAnimalId(x.a.id); toast("Hi again!"); } setPanel(null); }}>
                      <img src={x.bigImg} alt={x.a.name} /><p>{x.a.name}</p>{here && <small>With you now</small>}
                    </div>);
                  if (x.ready) return (
                    <div key={x.a.id} className="sv-big ready sv-tap" onClick={() => { v.dismissUnlock(x.a.id); setUnlockedNow(true); setPanel(null); toast("Say hello to your new friend!"); }}>
                      <img className="shadow" src={x.a.stages[0].img} alt="" /><p>New friend! Tap me!</p>
                    </div>);
                  return (
                    <div key={x.a.id} className="sv-big locked"><div className="sv-q">?</div><p>???</p></div>);
                })}
              </div>
            </div>
          </div>
        )}

        {/* exit: our own popup, never a system box */}
        {panel === "exit" && (
          <div className="sv-ov">
            <div className="sv-exit">
              <p className="q1">Leave Savanna World?</p>
              <p className="q2">Go back to the parents' page.</p>
              <div className="row">
                <button className="sv-btn3 green sv-tap" onClick={() => setPanel(null)}>Stay</button>
                <button className="sv-btn3 pink sv-tap" onClick={() => v.navigate("/portal")}>Leave</button>
              </div>
            </div>
          </div>
        )}
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
.sv-animals.beacon{animation:sv-peek 2.6s ease-in-out infinite,sv-goldglow 1.3s ease-in-out infinite;transform-origin:50% 90%}
@keyframes sv-peek{0%,52%,100%{transform:rotate(0)}56%{transform:rotate(-2.4deg)}61%{transform:rotate(2.2deg)}66%{transform:rotate(-1.8deg)}71%{transform:rotate(1.2deg)}76%{transform:rotate(0)}}
@keyframes sv-goldglow{0%,100%{filter:brightness(1.08) drop-shadow(0 0 3px #fff36b) drop-shadow(0 0 8px #ffd000) drop-shadow(0 0 16px rgba(255,190,0,.9))}50%{filter:brightness(1.22) drop-shadow(0 0 5px #fffbb0) drop-shadow(0 0 14px #ffe000) drop-shadow(0 0 28px rgba(255,200,0,1))}}
.sv-sparkler{position:absolute;right:30px;top:112px;width:262px;height:191px;pointer-events:none}
.sv-halo{position:absolute;left:131px;top:95px;width:380px;height:340px;margin:-170px 0 0 -190px;border-radius:50%;
 background:radial-gradient(closest-side,rgba(255,240,120,1) 0%,rgba(255,218,20,1) 55%,rgba(255,196,0,.75) 70%,rgba(255,170,0,.35) 85%,rgba(255,160,0,0) 100%);animation:sv-halo 1.6s ease-in-out infinite}
@keyframes sv-halo{0%,100%{opacity:.85;transform:scale(.95)}50%{opacity:1;transform:scale(1.07)}}
.sv-sd,.sv-ss,.sv-st{position:absolute;left:131px;top:95px;opacity:0;animation-iteration-count:infinite}
.sv-sd{border-radius:50%;background:#fffde6;box-shadow:0 0 2px 1px #fff27a,0 0 6px 2px #ffd000,0 0 10px 3px rgba(255,170,0,.7);
 animation-name:sv-sd;animation-timing-function:cubic-bezier(.2,.75,.35,1)}
@keyframes sv-sd{0%{opacity:0;transform:rotate(var(--a)) translateX(0) scale(1)}15%{opacity:1}70%{opacity:1}85%{opacity:.4}92%{opacity:1}100%{opacity:0;transform:rotate(var(--a)) translateX(var(--d)) scale(.5)}}
.sv-ss{height:2px;margin-top:-1px;border-radius:2px;transform-origin:0 50%;background:linear-gradient(90deg,rgba(255,220,60,0),#ffe24a 60%,#fffde6);
 box-shadow:0 0 4px 1px rgba(255,200,0,.8);animation-name:sv-ss;animation-timing-function:ease-out}
@keyframes sv-ss{0%{opacity:0;transform:rotate(var(--a)) translateX(60px) scaleX(.3)}20%{opacity:1}100%{opacity:0;transform:rotate(var(--a)) translateX(var(--d)) scaleX(1)}}
.sv-st{animation-name:sv-st;animation-timing-function:ease-out;filter:drop-shadow(0 0 4px #ffd000)}
@keyframes sv-st{0%{opacity:0;transform:rotate(var(--a)) translateX(calc(var(--d)*.6)) rotate(calc(var(--a)*-1)) scale(.2)}30%{opacity:1;transform:rotate(var(--a)) translateX(calc(var(--d)*.85)) rotate(calc(var(--a)*-1)) scale(1.15)}60%{opacity:.6}100%{opacity:0;transform:rotate(var(--a)) translateX(var(--d)) rotate(calc(var(--a)*-1 + 90deg)) scale(.4)}}
.sv-ptr{cursor:pointer}
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
.sv-tap{cursor:pointer}
.sv-rb.muted{opacity:.55}
.sv-imgbtn:active,.sv-rb:active,.sv-daily:active{transform:translateY(5px) scale(.98)}
.sv-card:active{transform:translateY(4px)}
.sv-feed:not(.off):active{transform:translate(-50%,5px) scale(.98)}
.sv-hop{width:100%;height:100%;transform-origin:50% 92%}
.sv-hop.go{animation:sv-hop .6s ease-out}
@keyframes sv-hop{0%{transform:translateY(0) scale(1,1)}15%{transform:translateY(0) scale(1.08,.9)}45%{transform:translateY(-46px) scale(.95,1.07)}75%{transform:translateY(0) scale(1.07,.92)}100%{transform:translateY(0) scale(1,1)}}
.sv-petname{animation:sv-namePop .5s cubic-bezier(.3,1.6,.5,1)}
@keyframes sv-namePop{0%{transform:translateX(-50%) scale(.3)}100%{transform:translateX(-50%) scale(1)}}
.sv-nameinput{position:absolute;top:808px;width:660px;height:76px;border:0;outline:0;background:rgba(255,248,230,.18);border-radius:40px;z-index:12;
 text-align:center;font-family:'Titan One',sans-serif;font-size:58px;color:#fff;caret-color:#ffd23a;
 text-shadow:-3px -3px 0 #7a3f08,3px -3px 0 #7a3f08,-3px 3px 0 #7a3f08,3px 3px 0 #7a3f08,0 7px 0 #7a3f08,0 10px 12px rgba(0,0,0,.45);
 box-shadow:0 0 0 4px rgba(255,210,58,.85),0 0 24px rgba(255,210,58,.6)}
.sv-nameinput::placeholder{color:rgba(255,255,255,.75)}
.sv-burst{position:absolute;top:850px;width:0;height:0;z-index:25;pointer-events:none}
.sv-burst img{position:absolute;left:0;top:0;margin:-14px 0 0 -14px;opacity:0;animation:sv-spk 1s ease-out forwards}
@keyframes sv-spk{0%{opacity:0;transform:translate(0,0) scale(.3) rotate(0)}25%{opacity:1}100%{opacity:0;transform:translate(var(--dx),var(--dy)) scale(1.1) rotate(160deg)}}
.sv-fly{position:absolute;left:0;top:0;z-index:20;pointer-events:none;animation:sv-flyx .65s linear forwards}
@keyframes sv-flyx{from{transform:translateX(var(--x0))}to{transform:translateX(var(--x1))}}
.sv-fly img{display:block;width:64px;animation:sv-flyy .65s forwards}
@keyframes sv-flyy{0%{transform:translateY(var(--y0)) rotate(0) scale(1);animation-timing-function:ease-out}50%{transform:translateY(var(--ym)) rotate(270deg) scale(.8);animation-timing-function:ease-in}100%{transform:translateY(var(--y1)) rotate(540deg) scale(.55)}}
.sv-toast{position:absolute;left:50%;top:430px;transform:translateX(-50%);z-index:40;background:rgba(40,25,10,.85);color:#fff;font-size:30px;border-radius:22px;padding:14px 30px;white-space:nowrap;pointer-events:none}
.sv-ov{position:absolute;inset:0;z-index:30;background:rgba(20,10,0,.55);display:flex;align-items:center;justify-content:center}
.sv-ovcard{position:relative;width:1000px;padding:26px 34px 34px;text-align:center;border:7px solid transparent;border-radius:44px;
 background:linear-gradient(180deg,#fffbef,#ffeec4) padding-box,linear-gradient(180deg,#fff9c4 0%,#ffe04a 35%,#ffb800 70%,#d98500 100%) border-box;
 box-shadow:0 0 0 3px #8f4f00,0 8px 0 3px #7a4100,0 14px 20px rgba(0,0,0,.35)}
.sv-ovcard h2,.sv-ovcard p,.sv-exit p,.sv-toast,.sv-visit,.sv-coins{font-family:'Titan One',sans-serif}
.sv-ovcard h2{font-size:44px;font-weight:400;color:#8a4f1d}
.sv-x{position:absolute;right:14px;top:14px;width:76px}
.sv-x img{display:block;width:100%}
.sv-biggrid{display:grid;grid-template-columns:repeat(3,1fr);gap:22px;margin-top:20px}
.sv-big{position:relative;background:#fff3d1;border:4px solid #e6b23a;border-radius:24px;padding:10px}
.sv-big img{display:block;width:100%;height:190px;object-fit:contain}
.sv-big img.shadow{filter:brightness(0);opacity:.35}
.sv-big p{font-size:24px;color:#8a4f1d}
.sv-big small{font-size:16px;color:#8a6a40}
.sv-big.here{border-color:#ffb000;box-shadow:0 0 0 4px #fff0b3}
.sv-big.ready{border-color:#ffb000;animation:sv-glowBox 1.1s ease-in-out infinite}
@keyframes sv-glowBox{0%,100%{box-shadow:0 0 0 0 rgba(255,215,60,0)}50%{box-shadow:0 0 34px 14px rgba(255,215,60,.95)}}
.sv-big.locked .sv-q{height:190px;display:flex;align-items:center;justify-content:center;font-size:90px;color:#c9a46a}
.sv-exit{width:760px;height:317px;padding:52px 40px 0;text-align:center;background:url(${UI}/frame_exit.webp) 0 0/100% 100% no-repeat;filter:drop-shadow(0 12px 16px rgba(0,0,0,.5))}
.sv-exit .q1{font-size:42px;color:#8a4a10;white-space:nowrap}
.sv-exit .q2{font-size:24px;color:#8a6a40;margin-top:6px}
.sv-exit .row{display:flex;gap:30px;justify-content:center;margin-top:26px}
.sv-btn3{position:relative;width:200px;height:84px;font-family:'Titan One',sans-serif;font-size:34px;color:#fff;cursor:pointer;border:7px solid transparent;border-radius:40px;
 background:linear-gradient(180deg,var(--t) 0%,var(--m) 50%,var(--b) 100%) padding-box,linear-gradient(180deg,#fff9c4 0%,#ffe04a 35%,#ffb800 70%,#d98500 100%) border-box;
 text-shadow:-2px -2px 0 var(--e),2px -2px 0 var(--e),-2px 2px 0 var(--e),2px 2px 0 var(--e),0 5px 0 var(--e),0 6px 6px rgba(0,0,0,.4);
 box-shadow:inset 0 5px 0 rgba(255,255,255,.55),inset 0 -5px 0 rgba(0,0,0,.14),0 0 0 3px #8f4f00,0 8px 0 3px #7a4100,0 14px 18px rgba(0,0,0,.4)}
.sv-btn3:active{transform:translateY(6px);box-shadow:inset 0 5px 0 rgba(255,255,255,.55),0 0 0 3px #8f4f00,0 2px 0 3px #7a4100,0 4px 8px rgba(0,0,0,.4)}
.sv-btn3.green{--t:#b8ffb0;--m:#45e06a;--b:#14a840;--e:#0a5e28}
.sv-btn3.pink{--t:#ffb8d8;--m:#ff4f9a;--b:#e0186c;--e:#8f0f45}
@media (prefers-reduced-motion: reduce){.sv-animals.beacon{animation:sv-goldglow 1.3s ease-in-out infinite}.sv-sd,.sv-ss,.sv-st{display:none}.sv-halo{animation:none}.sv-animal,.sv-animal.egg,.sv-nametag,.sv-daily,.sv-animals.glow,.sv-hop.go,.sv-big.ready{animation:none}}
`;

export const SAVANNA_SKIN: WorldSkin = {
  Loading, Page,
  makeSounds: () => ({}),          // part 2: click sound + effects
  music: `${W}/music.mp3`,
  musicVolume: 1,                  // the song file is already turned down (40%) = the approved preview loudness
  snd: { visit5: "", levelUp: "", rename: "" },
  levelUpMusic: null,
  renameMusic: null,
  completeDelayMs: 800,
  completeWaitsForLevelUp: false,
};
