// NEW LOOK = the ONE shared world look for every world (step 6, 2026-10-03: made from savannaSkin.tsx).
// Each world gives its own settings (makeLook at the bottom): scene, title, music, how animals move, sizes.
// Settings: savannaSkin.tsx (Savanna), oceanLook.tsx (Ocean), dinoLook.tsx (Dino).
// History of the build (step 5.3 / 5.4, first made for Savanna):
// Source: the approved preview BACKUPFILES/world3_art/preview/template.html (v18).
// LOOK ONLY: every rule and every save stays in the brain (src/pages/WorldPage.tsx).
// PART 1: full-screen scene, title, growth bar, animal, name, Feed picture (not wired yet).
// PART 2a: top corners, left buttons, real CookieJar (new treat) + Daily Treat + Visit 5, right cards, My Worlds.
//          Badges are grey placeholders. (5.4: coins pill = the kid's REAL coins.)
// PART 2b: taps wired through the brain's own handlers (feed, name, daily, visit 5, unlock, switch animal, music);
//          exit popup (Stay/Leave, never a system box), click sound, flying treat + hop. Left buttons / help / badges /
//          album / worlds = 'Coming soon!' for now (Vocab needs a savanna return in GamePage first - step 5.4).
// HARD RULES: scenery stays still (only the animal + UI move); never window.prompt/alert/confirm;
// gold panels = pre-built images, never CSS border-image; Titan One for all code text; no emojis.
import { useEffect, useRef, useState, type ComponentType } from "react";
import type { WorldSkin } from "../skin";
import type { WorldView } from "@/pages/WorldPage";
import CookieJar from "@/components/CookieJar";
import GrowUpParty, { type Prize, type PrizeKind } from "./GrowUpParty";
import VideoTheater, { type TheaterWorld, type TheaterCard } from "./VideoTheater";
import type { WorldConfig } from "@/worlds";
import DailyPrize, { type DailyKind } from "./DailyPrize";
import HowToPlay from "@/components/HowToPlay";
import { worldHowTo } from "@/components/howtos";
import { PACK_PRICE, DEMO_COINS, ALBUM_FOR_ALL } from "@/cards/economy";
import { isCloseBtn, playCloseBeep } from "@/lib/clickSfx";
import { getAnimalStageIdx, type Animal } from "@/worlds/types";

// ---- per-world settings (step 6) ----
export interface LookSettings {
  title: string;                         // "Savanna" -> "Savanna World", "My Savanna Animals"
  titleImg: string | null;               // title art; null = code text (until Andy makes title art)
  dir: string;                           // pictures: <dir>/<animal>-<egg|baby|young|grown>(-t).webp
  fill: string;                          // picture behind the blurred window sides
  Scene: ComponentType;                  // the scenery inside the 1600x1000 box
  music: string;
  loadingBg: string;
  move: "breathe" | "float" | "still";   // Savanna breathes, Ocean floats, Dino never moves
  fly?: string[];                        // "<animal>-<stage>" that fly: bob + faint ground shadow
  zoom?: Record<string, number>;         // extra size per picture
  zoomOrigin?: Record<string, string>;   // grow from this point (default 50% 92%; floaters + flyers 50% 50%)
  dy?: Record<string, number>;           // drop the picture this many px (Dino: onto the sand path)
}
const KEYS = ["egg", "baby", "young", "grown"];
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

// New animal ready: a SPARKLER behind My Animals (card 262 x 191, centre 131,95) - everything shoots out from the
// centre in all directions and appears past the card's edges. Fixed pseudo-random numbers (same every load).
const SPARK = (() => {
  let seed = 11;
  const r = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  // SLOW MOTION (Andy 15:14): about 2.2x slower; no star shapes, 20 more round dots instead.
  // dots: [angle deg, distance px, size px, seconds, delay seconds, start spot 0-1]
  const dots = Array.from({ length: 110 }, () => [r() * 360, 150 + r() * 120, 2 + r() * 2.5, 1.6 + r() * 1.5, -r() * 3.1, r()]);
  // streaks: [angle deg, distance px, length px, seconds, delay seconds, start spot 0-1]
  const streaks = Array.from({ length: 26 }, () => [r() * 360, 150 + r() * 90, 18 + r() * 22, 1.1 + r() * 0.9, -r() * 2.0, r()]);
  return { dots, streaks };
})();

// The sparkler: breathing yellow halo + dots and thin streaks shooting out from (cx,cy) inside its box, non-stop.
// spread = dots start anywhere along a line this wide (wide buttons); k = distance scale.
const Sparkler = ({ className, style, cx, cy, spread = 0, k = 1, halo = [380, 340] }: {
  className: string; style?: React.CSSProperties; cx: number; cy: number; spread?: number; k?: number; halo?: [number, number];
}) => (
  <div className={"sv-sparkler " + className} aria-hidden="true" style={{ ...style, ["--cx" as string]: `${cx}px`, ["--cy" as string]: `${cy}px` }}>
    <div className="sv-halo" style={{ width: halo[0], height: halo[1], margin: `${-halo[1] / 2}px 0 0 ${-halo[0] / 2}px` }} />
    {SPARK.dots.map((d, i) => (
      <i key={"d" + i} className="sv-sd" style={{ width: d[2], height: d[2], margin: -d[2] / 2, ["--ox" as string]: `${(d[5] - 0.5) * spread}px`, ["--a" as string]: `${d[0]}deg`, ["--d" as string]: `${d[1] * k}px`, animationDuration: `${d[3]}s`, animationDelay: `${d[4]}s` }} />
    ))}
    {SPARK.streaks.map((t, i) => (
      <b key={"s" + i} className="sv-ss" style={{ width: t[2], ["--ox" as string]: `${(t[5] - 0.5) * spread}px`, ["--a" as string]: `${t[0]}deg`, ["--d" as string]: `${t[1] * k}px`, animationDuration: `${t[3]}s`, animationDelay: `${t[4]}s` }} />
    ))}
  </div>
);

// POINTING HAND (Andy 2026-10-03): points at what is waiting for a tap. Mounted only while that thing is waiting:
// fades in after 1s, taps toward it (bobs along its pointing direction), gone once the kid taps it (the thing goes away).
// Picture public/worlds/ui/hand_point.webp points DOWN-LEFT; fingertip = 1.6% / 94.5% of the picture.
// flip = mirrored (points down-RIGHT) for targets on the right edge (no room to their right). sel = the target (CSS
// selector inside the stage), fx/fy = the spot on it the fingertip touches. Display only - saves nothing.
const HAND_W = 108, HAND_H = HAND_W * 256 / 320; // smaller (Andy 2026-10-04)
const Hand = ({ stage, s, sel, fx, fy, flip = false }: {
  stage: React.RefObject<HTMLDivElement>; s: number; sel: string; fx: number; fy: number; flip?: boolean;
}) => {
  const [p, setP] = useState<{ x: number; y: number } | null>(null);
  useEffect(() => {
    const tick = () => {
      const st = stage.current, el = st?.querySelector(sel);
      if (!st || !el) { setP(null); return; }
      const a = st.getBoundingClientRect(), b = el.getBoundingClientRect();
      // SMOOTH (Andy 2026-10-04): from the target's CENTRE (a pulse/scale never moves it) + its layout size (offsetWidth,
      // never scaled), so a pulsing button no longer makes the hand jump; tiny changes ignored, real moves glide (CSS).
      const h = el as HTMLElement, w = h.offsetWidth || b.width / s, ht = h.offsetHeight || b.height / s;
      const x = (b.left + b.width / 2 - a.left) / s + (fx - 0.5) * w, y = (b.top + b.height / 2 - a.top) / s + (fy - 0.5) * ht;
      setP(q => (q && Math.abs(q.x - x) < 2 && Math.abs(q.y - y) < 2 ? q : { x, y }));
    };
    tick();
    const t = window.setInterval(tick, 250);
    return () => window.clearInterval(t);
  }, [stage, s, sel, fx, fy]);
  if (!p) return null;
  const left = flip ? p.x - HAND_W * (1 - 0.016) : p.x - HAND_W * 0.016;
  return (
    <div className={"sv-hand" + (flip ? " flip" : "")} style={{ left, top: p.y - HAND_H * 0.945, width: HAND_W }} aria-hidden="true">
      <img src={`${UI}/hand_point.webp`} alt="" />
    </div>
  );
};

// NEW ARRIVAL sparkles (Andy 2026-10-04): round glowing dots only (no star shapes). [angle deg, distance px, size px, s, delay s]
const ARRIVE = (() => {
  let seed = 23;
  const r = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  return Array.from({ length: 30 }, () => [r() * 360, 120 + r() * 200, 6 + r() * 10, 1.1 + r() * 1.2, r() * 1.6]);
})();

// STAGE TRANSFORMATION sparkles (Andy 2026-10-04): a canvas over the animal - three glowing ribbons of sparkle dust
// spiral up around it (bright in front, dim behind = depth), plus soft mist; ~3.2s, then gone. Round dots only.
const TF_DUR = 3200;
const TF_P = (() => {
  let seed = 41;
  const r = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  const ribbons = Array.from({ length: 3 * 36 }, (_, i) => ({ strand: i % 3, u: Math.floor(i / 3) / 36 + r() * 0.02, size: 2.6 + r() * 3.2 }));
  const loose = Array.from({ length: 34 }, () => ({ x: r(), y: r(), size: 2 + r() * 3, ph: r() * 6.28, sp: 2 + r() * 3 }));
  return { ribbons, loose };
})();
const TransformFx = () => {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cv = ref.current; const ctx = cv?.getContext("2d");
    if (!cv || !ctx) return;
    const W = 900, H = 900, t0 = performance.now();
    let raf = 0;
    const dot = (x: number, y: number, s: number, a: number) => {
      const g = ctx.createRadialGradient(x, y, 0, x, y, s * 3.2);
      g.addColorStop(0, `rgba(255,255,255,${a})`); g.addColorStop(0.3, `rgba(255,246,170,${a * 0.85})`);
      g.addColorStop(0.6, `rgba(255,206,60,${a * 0.35})`); g.addColorStop(1, "rgba(255,190,0,0)");
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, s * 3.2, 0, 6.2832); ctx.fill();
    };
    const frame = (now: number) => {
      const t = (now - t0) / 1000, k = (now - t0) / TF_DUR;
      ctx.clearRect(0, 0, W, H);
      if (k >= 1) return;
      const fade = Math.min(1, t / 0.35) * (k > 0.7 ? Math.max(0, (1 - k) / 0.3) : 1);
      ctx.globalCompositeOperation = "lighter";
      for (const p of TF_P.ribbons) {
        const u = (p.u + t * 0.3) % 1;                                   // travels up the spiral
        const ang = p.strand * 2.094 + u * Math.PI * 5 + t * 2.6;          // the twist
        const rad = 250 * (0.3 + 0.7 * Math.sin(Math.PI * u));             // wide in the middle, narrow at both ends
        const x = W / 2 + Math.cos(ang) * rad, y = H / 2 + 300 - u * 620 + Math.sin(ang) * rad * 0.26;
        const depth = (Math.sin(ang) + 1) / 2;                            // 0 = behind, 1 = in front
        const a = fade * (0.25 + 0.75 * depth) * Math.sin(Math.PI * u);
        dot(x, y, p.size * (0.6 + 0.7 * depth), a);
        if (depth > 0.5) dot(x, y, p.size * 3.2, a * 0.06);                  // soft mist around the front of the ribbon
      }
      for (const p of TF_P.loose) {                                       // twinkles drifting up inside the swirl
        const tw = 0.5 + 0.5 * Math.sin(t * p.sp + p.ph);
        dot(W / 2 + (p.x - 0.5) * 420, H / 2 + 260 - ((p.y + t * 0.18) % 1) * 560, p.size, fade * tw * 0.8);
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, []);
  return <canvas ref={ref} width={900} height={900} className="sv-tfx" aria-hidden="true" />;
};

// NEW FRIEND box lights (Andy 2026-10-04): slow glowing motes around the box - rise, sink back, vanish (never shoot out).
// [left %, top %, size px, seconds, delay seconds, sideways drift px]
const MOTES = (() => {
  let seed = 59;
  const r = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  return Array.from({ length: 26 }, () => {
    const a = r() * 6.2832, e = 0.42 + r() * 0.1;
    return [50 + Math.cos(a) * e * 100, 50 + Math.sin(a) * e * 100, 5 + r() * 7, 3.6 + r() * 2.8, -r() * 6, (r() - 0.5) * 30];
  });
})();

// Andy 2026-10-04 16:27: motes along the edge of the WHOLE My Animals box (box = card + 50px each side), same columns as MOTES
const PANEL_MOTES = (() => {
  let seed = 83;
  const r = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  return Array.from({ length: 44 }, (_, i) => {
    const side = i % 4, t = r() * 100, o = r() * 7;
    const x = side === 0 || side === 2 ? t : side === 1 ? 93 + o : o;
    const y = side === 1 || side === 3 ? t : side === 2 ? 93 + o : o;
    return [x, y, 5 + r() * 7, 3.6 + r() * 2.8, -r() * 6, (r() - 0.5) * 30];
  });
})();

const Loading = ({ L }: { L: LookSettings }) => (
  <div style={{ position: "fixed", inset: 0, background: L.loadingBg, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontFamily: "'Titan One', sans-serif", fontSize: 32 }}>
    <style>{FONTS}</style>
    Loading...
  </div>
);

const Page = ({ v, L }: { v: WorldView; L: LookSettings }) => {
  const { s, sw, sh } = useFit();
  const { animal, stageIdx, fed, testView } = useShown(v);
  // STAGE TRANSFORMATION (Andy 2026-10-04): during a stage party the OLD stage picture stays (hold.show); 1s after OK a big
  // glow + spiralling sparkles, and under the glow the picture swaps to the new stage (hold.show = hold.to). Display only.
  const [hold, setHold] = useState<null | { id: string; show: number; to: number }>(null);
  const picIdx = hold && hold.id === animal.id ? hold.show : stageIdx;
  const art = (a: Animal, i: number, t = false) => `${L.dir}/${a.id}-${KEYS[i]}${t ? "-t" : ""}.webp`; // picture (t = thumbnail)
  const akey = `${animal.id}-${KEYS[picIdx]}`;  // this picture's name in the size tables
  const isFly = !!L.fly?.includes(akey);
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
  // Watch the video: animal grown + its video not watched yet. The button takes the Feed spot.
  // TEST ONLY ?v=1 = pretend the video is not watched. Test views never mark a video as watched (nothing saved).
  const testVid = testView || (onTest && q.get("v") === "1");
  const [testWatched, setTestWatched] = useState(false); // TEST ONLY: ?v=1 'watched' after closing (nothing saved)
  const watchReady = grown && !!animal.video && !testWatched && (!v.videoWatchedMap[animal.id] || (onTest && q.get("v") === "1"));

  // GROW-UP PARTY (Andy 15:14): the animal reaches its last stage -> Congratulations + prizes fly to their places,
  // then a red dot on Video Theater. STEP 5.4 (Andy 21:04): REAL prizes = 15 coins + 10 treats (puzzle pieces later).
  // The DATABASE pays them (mpe_claim_prize, once per kid; amounts live there - keep these numbers the same).
  // TEST ONLY ?g=1 = play the party on load (display only, claims nothing; add &v=1 to see the Watch button after).
  // STAGE PARTIES (Andy 2026-10-04): baby + young get the same Congratulations screen with a smaller prize (coins only:
  // baby 5, young 10 - same numbers the database pays for '<world>:<animal>:baby|young'). partyStage = which stage the
  // party is for (null = grown). TEST ONLY ?g=1&gs=1|2 = the baby/young party (display only, claims nothing).
  const STAGE_COINS = [0, 5, 10];
  const STAGE_TREATS = [0, 2, 3];
  const [partyStage, setPartyStage] = useState<number | null>(null);
  const partyAnimal = v.levelUpStage?.animal ?? animal;
  const partyLast = partyAnimal.stages.length - 1;
  const smallParty = partyStage !== null && partyStage > 0 && partyStage < partyLast;
  const PRIZES: Prize[] = smallParty
    ? [ // + treats (Andy 2026-10-04 09:14, database prize v3: baby 2, young 3)
      { kind: "coin", n: STAGE_COINS[partyStage!] ?? 0, img: `${UI}/coin.webp`, flyers: partyStage === 1 ? 5 : 8, size: 70 },
      { kind: "treat", n: STAGE_TREATS[partyStage!] ?? 0, img: `${UI}/treat.webp`, flyers: STAGE_TREATS[partyStage!] ?? 0, size: 64 },
    ]
    : [
      { kind: "coin", n: 15, img: `${UI}/coin.webp`, flyers: 10, size: 70 },
      { kind: "treat", n: 10, img: `${UI}/treat.webp`, flyers: 10, size: 64 },
    ];
  const partyWho = v.petNameMap[partyAnimal.id] || `Your ${partyAnimal.name.toLowerCase()}`;
  const partyLine = !smallParty ? `${partyWho} is all grown up!` : partyStage === 1 ? `${partyWho} is a baby now!` : `${partyWho} is growing up!`;
  const claimed = useRef<Set<string>>(new Set()); // each prize asked for once per page (the database also refuses repeats)
  const askPrize = (id: string) => { if (claimed.current.has(id)) return; claimed.current.add(id); v.claimPrize(id); };
  const [party, setParty] = useState<null | "on" | "fly" | "out">(null);
  // WORLD FINISHED (Andy 17:03): brain's showComplete (last animal grown + video watched, once per device) -> same
  // celebration: 'World Complete!', all 6 grown animals, coins x50 + a Savanna badge into My Badges (DISPLAY ONLY).
  // TEST ONLY ?c=1 = play it on load (saves nothing, never calls closeComplete).
  const [done, setDone] = useState<null | "on" | "fly" | "out">(null);
  const [badgesShown, setBadgesShown] = useState(0);
  const badgesRef = useRef<HTMLDivElement>(null);
  const DONE_PRIZES: Prize[] = [ // STEP 5.4 (Andy 21:04): REAL = 50 coins + 15 treats + the badge (database: '<world>:complete')
    { kind: "coin", n: 25, img: `${UI}/coin.webp`, flyers: 12, size: 70 }, // = what the database pays (prize v2/v3: 25 - fixed 2026-10-04, was 50 on screen)
    { kind: "treat", n: 15, img: `${UI}/treat.webp`, flyers: 10, size: 64 },
    { kind: "badge", n: 1, img: `/worlds/badges/${v.world.id}.webp`, flyers: 1, size: 64, label: "New badge!" },
  ];
  useEffect(() => { if (onTest && q.get("c") === "1") setDone("on"); }, []);
  useEffect(() => {
    if (!v.showComplete) return;
    v.completeRef.current?.pause(); // the celebration plays the music itself
    // NO REPLAY (step 5.4): the brain's 'seen' flag is per device. The prize list is in the cloud: if this world's
    // prize was already paid (any device, cleared cache...), just close quietly - no second celebration.
    if (v.prizes === null && !v.isMaster) return; // prize list not read yet: wait (this runs again when it arrives)
    if (done === null && (v.prizes ?? []).includes(`${v.world.id}:complete`)) { v.closeComplete(); return; }
    askPrize(`${v.world.id}:complete`); // REAL prize (database pays once)
    setDone(d => d ?? "on");
  }, [v.showComplete, v.prizes]);
  const doneLanded = () => {
    setJarShown(j => j + (DONE_PRIZES.find(p => p.kind === "treat")?.n ?? 0)); // the jar's own fill-up animation
    window.setTimeout(() => setDone("out"), 1200);
    window.setTimeout(() => { setDone(null); if (v.showComplete) v.closeComplete(); }, 1750);
  };
  const [coinShown, setCoinShown] = useState(0);
  const [bump, setBump] = useState<Record<string, number>>({});
  const [newIds, setNewIds] = useState<string[]>([]); // EXTRA red dots in this page only (test flags ?v=1 / ?t=1, just watched)
  const stageRef = useRef<HTMLDivElement>(null);
  const coinRef = useRef<HTMLDivElement>(null);
  const puzzleRef = useRef<HTMLDivElement>(null);
  const jarRef = useRef<HTMLDivElement>(null);
  useEffect(() => { if (onTest && q.get("g") === "1") { const gs = parseInt(q.get("gs") ?? "", 10); if (gs === 1 || gs === 2) { setPartyStage(gs); setHold({ id: animal.id, show: gs - 1, to: gs }); } setParty("on"); } }, []);
  // SMALL STAGE PRIZE (Andy 2026-10-03): baby +5 coins, young +10 coins (database pays once: '<world>:<animal>:baby|young').
  // A gold '+5' pops over the animal and a few coins float into the coin pill. No dark screen, nothing to tap (~1.6s).
  const MINI_COINS = STAGE_COINS; // (small '+5' pop - no longer used since 2026-10-04: baby/young get the party)
  const [mini, setMini] = useState<null | { id: number; n: number; x1: number; y1: number }>(null);
  useEffect(() => {
    const lu = v.levelUpStage;
    if (lu && lu.stageIdx > 0 && lu.stageIdx < lu.animal.stages.length - 1) {
      askPrize(`${v.world.id}:${lu.animal.id}:${lu.stageIdx === 1 ? "baby" : "young"}`); // REAL prize (database pays once)
      setPartyStage(lu.stageIdx); setHold({ id: lu.animal.id, show: lu.stageIdx - 1, to: lu.stageIdx }); // old stage stays until the transformation   // the Congratulations screen, coins only (Andy 2026-10-04)
      setParty(p => p ?? "on");
      return;
    }
    if (lu && lu.stageIdx === lu.animal.stages.length - 1) {
      askPrize(`${v.world.id}:${lu.animal.id}:grown`); // REAL prize (database pays once)
      setPartyStage(lu.stageIdx); setHold({ id: lu.animal.id, show: lu.stageIdx - 1, to: lu.stageIdx }); // old stage stays until the transformation
      setParty(p => p ?? "on");
    }
  }, [v.levelUpStage]);
  const partyWas = useRef(false);
  useEffect(() => { // music quiet during the party, back after
    const a = v.audioRef.current, full = v.K.musicVolume ?? v.volume * 0.5;
    const on = !!(party || done);
    if (a && on && !partyWas.current) a.volume = full * 0.15;
    if (a && !on && partyWas.current) a.volume = full;
    partyWas.current = on;
  }, [party, done]);
  const at = (el: HTMLElement | null, fx: number, fy: number) => {
    const st = stageRef.current;
    if (!el || !st) return null;
    const a = st.getBoundingClientRect(), r = el.getBoundingClientRect();
    return { x: (r.left + r.width * fx - a.left) / s, y: (r.top + r.height * fy - a.top) / s };
  };
  const partyTarget = (k: PrizeKind) =>
    k === "coin" ? at(coinRef.current, 0.2, 0.5) : k === "treat" ? at(jarRef.current, 0.5, 0.1)
      : k === "badge" ? at(badgesRef.current, 0.22, 0.38) : at(puzzleRef.current, 0.17, 0.5);
  const partyLand = (k: PrizeKind, add: number) => {
    if (k === "coin") setCoinShown(c => c + add);
    if (k === "badge") setBadgesShown(b => b + 1);
    setBump(b => ({ ...b, [k]: (b[k] ?? 0) + 1 }));
  };
  // Andy 2026-10-04 16:22: the treats finish dropping into the jar FIRST (old stage still showing), THEN the transformation.
  const partyLanded = () => {
    const nT = PRIZES.find(p => p.kind === "treat")?.n ?? 0;
    setJarShown(j => j + nT); // the jar's own fill-up animation
    const jarMs = Math.min(nT, 12) * 170 + 900;          // ~ CookieJar earn(): 170ms per drop + settle
    const endAt = hold ? jarMs + TF_DUR : 3000;
    if (hold) window.setTimeout(startTransform, jarMs);
    window.setTimeout(() => setParty("out"), endAt);
    window.setTimeout(() => {
      if (onTest && q.get("g") === "1") setTestKeep(true); // TEST party paid nothing: keep the shown jar/coins (no 'going back' lid pop)
      setParty(null); setPartyStage(null); setHold(null); v.setLevelUpStage(null);
    }, endAt + 550);
  };
  // Video closed: if it counted as watched (brain: 1 second), the Watch button is gone and Video Theater gets its red dot.
  const closeVid = () => {
    const done = testVid || !!v.videoWatchedMap[animal.id];
    v.closeVideo();
    if (done) { setNewIds(ids => ids.includes(animal.id) ? ids : [...ids, animal.id]); if (testVid) setTestWatched(true); }
  };
  const lift = party === "fly" || party === "out" || done === "fly" || done === "out" ? " sv-lift" : "";
  // While a celebration is on, the coin pill + jar HOLD their old numbers; the flying prizes add them as they land.
  // Afterwards both follow the real numbers again (= the database's, so a prize that was not paid shows nothing).
  const [dailyDay, setDailyDay] = useState(0); // DAILY PRIZE on screen = today's box 1-7 (0 = not showing)
  // NEW-WORLD WELCOME (Andy 2026-10-09): the background drops in (1 bounce), then the front layer, a glow grows + sparkles,
  // 2s later the swirl brings the egg/blanket, then '<Name> World' fades in with a chime; then the UI slides in + the music
  // fades up. ONCE per kid per world (cloud seen flag intro:<world>:one), only while the world's FIRST animal has 0 treats.
  // Visits + teacher 1006 never; TEST ONLY ?wi=1 on /world-test/ plays it (marks nothing).
  const introFlag = `intro:${v.world.id}:one`;
  const introTest = onTest && q.get("wi") === "1";
  const [intro, setIntro] = useState<"pending" | "on" | "off">(() =>
    introTest ? "on" : (!v.readOnly && !v.isMaster && (v.fedTreatsState[v.ANIMALS[0].id] ?? 0) === 0) ? "pending" : "off");
  const [ip, setIp] = useState(0); // intro step: 1 drop, 2 glow, 3 egg, 4 title, 5 title leaving
  // the world before this one (My Worlds order): its picture, NOT blurred, is what the new world drops onto (Ocean = none)
  const introIds = [...v.worldList.map(x => x.world.id), ...v.comingWorlds.map(w => w.id)];
  const prevId = introIds[introIds.indexOf(v.world.id) - 1];
  const prevFar = prevId ? (prevId === "ocean" ? "/worlds/ocean/bg.jpg" : `/worlds/${prevId}/far.jpg`) : null;
  const backRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (intro !== "pending") return;
    if (v.seen) { setIntro(v.seen.includes(introFlag) ? "off" : "on"); return; }
    const t = window.setTimeout(() => setIntro(i => (i === "pending" ? "off" : i)), 4000); // cloud not answering: skip it
    return () => window.clearTimeout(t);
  }, [intro, v.seen]);
  // HOW TO PLAY (Andy 2026-10-07): pops in 1s after entering, ONCE per kid on any device (the brain's cloud seen list,
  // flag howto:world:one); '?' opens it any time. 'pending' = still reading the cloud, 'wait' = it will show; the Daily
  // Prize waits for both. Visits (read-only) and the teacher code never show it by themselves (test: ?h=1 on /world-test/).
  const [howto, setHowto] = useState<"pending" | "wait" | "open" | "closed">(() => {
    if (v.readOnly) return "closed";
    if (window.location.pathname.startsWith("/world-test/") && new URLSearchParams(window.location.search).get("h") === "1") return "wait";
    return v.isMaster ? "closed" : "pending";
  });
  const howAuto = useRef(false);
  useEffect(() => {
    if (howto !== "pending") return;
    if (v.seen) { setHowto(v.seen.includes("howto:world:one") ? "closed" : "wait"); return; }
    const t = window.setTimeout(() => setHowto(h => (h === "pending" ? "closed" : h)), 4000); // cloud not answering: don't block the Daily Prize
    return () => window.clearTimeout(t);
  }, [howto, v.seen]);
  useEffect(() => { if (howto !== "wait" || intro !== "off") return; const t = window.setTimeout(() => { howAuto.current = true; setHowto("open"); }, 1000); return () => window.clearTimeout(t); }, [howto, intro]);
  const closeHowto = () => { setHowto("closed"); if (howAuto.current) { howAuto.current = false; v.markSeen("howto:world:one"); } };
  // TEST ONLY (?dp=): nothing is saved, so after the test prize the jar + coin pill KEEP the shown numbers
  // (going back to the real number made the jar open again with the feed sound - Andy 14:19).
  const [testKeep, setTestKeep] = useState(false);
  const holding = !!(party || done || mini || dailyDay || testKeep || intro !== "off");
  useEffect(() => { if (!holding) setCoinShown(v.coins ?? 0); }, [v.coins, holding]);
  // MY BADGES (step 5.4): one badge per finished world = '<world>:complete' in the kid's prize list (from the cloud).
  // During the world-finished party the new badge flies in first, then lights up (same hold as coins / jar).
  const wonBadges = (v.prizes ?? []).filter(p => /^[a-z]+:complete$/.test(p)).map(p => p.split(":")[0]);
  useEffect(() => { if (!holding) setBadgesShown(wonBadges.length); }, [wonBadges.length, holding]);
  // DAILY PRIZE (Andy 2026-10-03): rises in ~1.2s after the world opens when today's box is not taken yet (any device).
  // TEST ONLY ?dp=1..7 on /world-test/ = show it as that day (display only - claims nothing).
  const testDp = onTest ? parseInt(q.get("dp") ?? "", 10) : NaN;
  const isTestDp = Number.isFinite(testDp) && testDp >= 1 && testDp <= 7;
  const dailyReady = isTestDp ? testDp : (v.dailyPrize && !v.dailyPrize.claimedToday ? v.dailyPrize.day : 0);
  const dailyShown = useRef(false);
  useEffect(() => {
    if (!dailyReady || dailyShown.current || party || done || howto !== "closed" || intro !== "off") return;
    const t = window.setTimeout(() => { dailyShown.current = true; setDailyDay(dailyReady); }, 1200);
    return () => window.clearTimeout(t);
  }, [dailyReady, party, done, howto, intro]);
  const dailyLand = (k: DailyKind, add: number) => {
    if (k === "treat") { setJarShown(j => j + add); setBump(b => ({ ...b, treat: (b.treat ?? 0) + 1 })); }
    else partyLand(k, add);
  };
  const bumpStyle = (k: string) => (bump[k] ? { animation: `sv-bump${bump[k] % 2} .3s ease-out` } : undefined);

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
    return { a, open: unlocked && seen, ready: unlocked && !seen, img: art(a, st, true), bigImg: art(a, st), grownImg: art(a, a.stages.length - 1, true) };
  });
  const [unlockedNow, setUnlockedNow] = useState(false);
  const newReady = slots.some(x => x.ready) || (onTest && q.get("n") === "1" && !unlockedNow);
  // ALBUM METER (Andy 2026-10-07): coins toward the next card pack; packs ready = red dot + glow (waits for the new-friend glow)
  const albumOn = v.isMaster || ALBUM_FOR_ALL;
  const albumCoins = v.isMaster ? DEMO_COINS : (v.coins ?? 0);
  const albumPacks = albumOn ? Math.floor(albumCoins / PACK_PRICE) : 0;
  const albumPct = albumPacks > 0 ? 100 : ((albumCoins % PACK_PRICE) / PACK_PRICE) * 100;

  // Visit 5 days: dots = days in the current set of 5; all 5 lit when the +3 is ready to claim.
  const visitReady = Math.floor(v.visitDaysCount / 5) > 0 && !v.visit5Claimed;
  const lit = visitReady ? 5 : v.visitDaysCount % 5;

  // ---- PART 2b: taps (the test view ?a=/?s= is look-only, so feeding/naming are off there) ----
  const [toastMsg, setToastMsg] = useState("");
  const toastT = useRef(0);
  const toast = (t: string) => { setToastMsg(t); window.clearTimeout(toastT.current); toastT.current = window.setTimeout(() => setToastMsg(""), 1700); };
  const soon = () => toast("Coming soon!");
  // VOCAB + GRAMMAR (5.4, Andy 21:27): kids land on the BOOK choice (vocab arcade) / the LEVEL list (grammar hub) first.
  // The page remembers itself (this tab only) so the games' 'back to world' brings the kid back HERE.
  const goGames = (path: string) => { sessionStorage.setItem("mpe_return_world", window.location.pathname); v.navigate(path); };
  const goVocab = () => goGames(`${v.world.gamePath}/${v.code}/${v.studentName}/${v.family?.book ?? 1}`);
  const goGrammar = () => goGames(`/grammar-hub/${v.code}/${v.studentName}`);
  const [panel, setPanel] = useState<null | "animals" | "exit" | "theater" | "worlds">(null);

  // VIDEO THEATER (Andy 16:34): Savanna cards from the brain (won = grown + video watched); Ocean + Dino = 'Coming soon!'
  // until step 7. Playing a video there saves nothing. TEST ONLY ?t=1 = open it on load, first won video marked new.
  // Step 6: THIS world's cards come from the brain; the other worlds stay 'Coming soon!' until step 7.
  const myTheaterCards = v.ANIMALS.map(a => ({
    id: a.id, name: v.petNameMap[a.id] || a.name, poster: art(a, a.stages.length - 1), video: a.video ?? null,
    won: getAnimalStageIdx(a, v.fedTreatsState[a.id] ?? 0) === a.stages.length - 1 && !!v.videoWatchedMap[a.id] && !!a.video,
  }));
  // STEP 7 (2026-10-04): EVERY world (v.worldList, in order). This world = live brain state; the others = the kid's
  // cloud row (read only). A world not started yet shows all its cards as '?' (not won).
  const cardsOf = (w: WorldConfig): TheaterCard[] => {
    if (w.id === v.world.id) return myTheaterCards;
    const S2 = w.makeSave("", "");
    const r2 = v.rowData && S2.hasCloud(v.rowData) ? S2.readCloud(v.rowData, null) : null;
    return w.animals.map(a => {
      const c = r2?.animals[a.id];
      return { id: a.id, name: c?.petName || a.name, poster: `/worlds/${w.id}/${a.id}-${KEYS[a.stages.length - 1]}.webp`, video: a.video ?? null,
        won: !!c && getAnimalStageIdx(a, c.fed) === a.stages.length - 1 && !!c.videoWatched && !!a.video };
    });
  };
  const theaterWorlds: TheaterWorld[] = v.worldList.map(x => ({ key: x.world.id, title: `${x.world.title} World`, cards: cardsOf(x.world) }));
  const theaterStart = Math.max(0, theaterWorlds.findIndex(w => w.key === v.world.id));
  useEffect(() => {
    if (!(onTest && q.get("t") === "1")) return;
    const first = theaterWorlds[theaterStart].cards?.find(c => c.won);
    if (first) setNewIds(ids => ids.includes(first.id) ? ids : [...ids, first.id]);
    setPanel("theater");
  }, []);
  // RED DOTS (5.4, Andy 14:28 choice a): every WON video not yet played in the Video Theater = red dot on its card + the
  // button. 'Played' is saved in the cloud (v.seen 'theater:<world>:<animal>'), so the dot is gone on every device.
  // step 7: red dots for EVERY world's won videos (animal ids are unique across worlds; cardWorld = which world a card is in)
  const cardWorld: Record<string, string> = {};
  theaterWorlds.forEach(w => (w.cards ?? []).forEach(c => { cardWorld[c.id] = w.key; }));
  const realNew = v.seen ? theaterWorlds.flatMap(w => (w.cards ?? []).filter(c => c.won && !v.seen!.includes(`theater:${w.key}:${c.id}`)).map(c => c.id)) : [];
  const allNew = [...new Set([...realNew, ...newIds])];
  const theaterMusic = (quiet: boolean) => { const a = v.audioRef.current; if (a) a.volume = quiet ? 0.02 : (v.K.musicVolume ?? v.volume * 0.5); };
  const [dailyGone, setDailyGone] = useState(false);
  const [jarPoke, setJarPoke] = useState(0);
  const musicWasPaused = useRef(false); // music button: was the music still waiting for a tap?
  // MY WORLDS row (Andy 2026-10-09): arrows scroll one card; opening the panel shows the kid's own world
  const wRowRef = useRef<HTMLDivElement>(null);
  const [wEdge, setWEdge] = useState({ l: true, r: false });
  const wEdges = () => { const e = wRowRef.current; if (e) setWEdge({ l: e.scrollLeft < 8, r: e.scrollLeft + e.clientWidth > e.scrollWidth - 8 }); };
  const wScroll = (d: number) => { wRowRef.current?.scrollBy({ left: d * 280, behavior: "smooth" }); };
  useEffect(() => {
    if (panel !== "worlds") return;
    const e = wRowRef.current; if (!e) return;
    const here = e.querySelector(".sv-wcard.here") as HTMLElement | null;
    if (here) e.scrollLeft = Math.max(0, here.offsetLeft - e.offsetLeft - 280);
    wEdges();
  }, [panel]);
  // Treats won while away (games) FALL INTO the jar: the jar starts at the count this device last showed,
  // then moves to the real count. Display only - a per-device hint, never Supabase, never a save.
  const seenKey = `mpe_jarseen_${v.code}_${v.studentName}`;
  const [jarShown, setJarShown] = useState(() => {
    const testJ = onTest ? parseInt(q.get("j") ?? "", 10) : NaN; // TEST ONLY: ?j=10 = pretend 10 treats were just won
    if (Number.isFinite(testJ) && testJ > 0) return Math.max(0, v.jarTreats - testJ);
    const seen = v.isMaster ? NaN : parseInt(localStorage.getItem(seenKey) ?? "", 10); // 1006: jar is 99 every visit - no fake drop-in
    return Number.isFinite(seen) && seen >= 0 && seen < v.jarTreats ? seen : v.jarTreats;
  });
  const firstJar = useRef(true);
  useEffect(() => {
    if (testKeep || (holding && v.jarTreats > jarShown)) return; // a celebration is on: prizes fill the jar when they land (a feed still shows at once)
    if (!v.readOnly && !v.isMaster) localStorage.setItem(seenKey, String(v.jarTreats)); // a visit + 1006 write nothing
    const wait = firstJar.current && jarShown < v.jarTreats ? 900 : 0; // first time: let the page settle, then drop them in
    firstJar.current = false;
    const t = window.setTimeout(() => setJarShown(v.jarTreats), wait);
    return () => window.clearTimeout(t);
  }, [v.jarTreats, holding]);

  // Feed: the brain feeds (jar -1, fed +1, saves); here a treat flies jar -> animal, then the animal hops.
  const [flying, setFlying] = useState<number[]>([]);
  const [hop, setHop] = useState(0);
  // NEW ARRIVAL (Andy 2026-10-04): when a Congratulations box goes away, or a new friend is unlocked, the animal hops in
  // with a soft glow + round sparkles for ~3s and the magic-wand sound plays (public/worlds/ui/snd_newfriend.mp3). Display only.
  const [arrive, setArrive] = useState(0);
  const [arriving, setArriving] = useState(false);
  const arriveT = useRef(0);
  // transformation state (see hold above): tf = run number, tfOn = showing, oldPic = the old picture fading out at the swap
  const [tf, setTf] = useState(0);
  const [tfOn, setTfOn] = useState(false);
  const [oldPic, setOldPic] = useState<null | { src: string; style: React.CSSProperties }>(null);
  const tfT = useRef<number[]>([]);
  const picStyleFor = (k: string): React.CSSProperties => ({ transform: `scale(${L.zoom?.[k] ?? 1})`,
    transformOrigin: L.zoomOrigin?.[k] ?? (L.move === "float" || !!L.fly?.includes(k) ? "50% 50%" : "50% 92%") });
  const picStyle = picStyleFor(akey);
  // LITTLE ACTIONS (Andy 2026-10-08): every 5-9 s the animal does ONE short random action (wiggle, bounce, stretch,
  // look the other way); tapping the animal = an action at once. Display only, nothing saved. Dinos (move 'still')
  // never move; eggs/blankets only wiggle or bounce; nothing during parties, transformations, arrivals or the Daily Prize.
  const [act, setAct] = useState("");
  const actRef = useRef({ go: (_tap?: boolean) => { } });
  actRef.current.go = (tap?: boolean) => {
    if (L.move === "still" || act || holding || tfOn || arriving || document.hidden) return;
    if (tap && picIdx > 0) { setAct("look"); return; } // Andy 10-08: turning around = ONLY on a tap (eggs/blankets: random wiggle/bounce)
    const list = picIdx === 0 ? ["wiggle", "bounce"] : ["wiggle", "bounce", "stretch"];
    setAct(list[Math.floor(Math.random() * list.length)]);
  };
  useEffect(() => {
    let t = 0;
    const next = () => { t = window.setTimeout(() => { actRef.current.go(); next(); }, 5000 + Math.random() * 4000); };
    next();
    return () => window.clearTimeout(t);
  }, []);
  const startTransform = () => {
    setTf(n => n + 1); setTfOn(true);
    if (v.sfxOn) { const a = new Audio(`${UI}/snd_newfriend.mp3`); a.volume = 0.7; a.play().catch(() => { }); } // wand: sparkles start
    tfT.current.forEach(t => window.clearTimeout(t));
    tfT.current = [
      window.setTimeout(() => { // the swap, under the brightest glow: old fades out, new fades in (0.4s)
        setOldPic({ src: art(animal, picIdx), style: picStyle });
        setHold(h => (h ? { ...h, show: h.to } : h));
      }, 900),
      window.setTimeout(() => setOldPic(null), 1350),
      window.setTimeout(() => setTfOn(false), TF_DUR + 100),
    ];
  };
  const startArrive = () => {
    setArrive(a => a + 1);
    // Andy 2026-10-04 16:27: the new egg gets the SAME golden glow + spiral as a stage transformation (was soft glow + dots)
    setTf(n => n + 1); setTfOn(true);
    tfT.current.forEach(t => window.clearTimeout(t));
    tfT.current = [window.setTimeout(() => setTfOn(false), TF_DUR + 100)];
    if (v.sfxOn) { const a = new Audio(`${UI}/snd_newfriend.mp3`); a.volume = 0.7; a.play().catch(() => { }); }
  };
  // SETTLE-IN WAVE (Andy 2026-10-09): 1.2s after the UI is in (every load, after the welcome too), a light band sweeps
  // left->right over the whole screen (linear, 1.8s), round glitters follow it and each button pulses once as it passes.
  const WAVE_MS = 1800, WAVE_W = 520;
  const [wave, setWave] = useState(0);
  const waveDone = useRef(false);
  useEffect(() => {
    if (intro !== "off" || waveDone.current) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    waveDone.current = true;
    const t = window.setTimeout(() => setWave(1), 1200);
    return () => window.clearTimeout(t);
  }, [intro]);
  const waveAt = (x: number) => Math.max(0, Math.min(1, (x + 600 - WAVE_W / 2) / (sw + 800))) * WAVE_MS; // ms until the band's middle reaches x
  const waveDots = useRef<{ x: number; y: number; z: number; d: number }[]>([]);
  useEffect(() => {
    if (!wave) return;
    const st = stageRef.current; if (!st) return;
    const sr = st.getBoundingClientRect();
    st.querySelectorAll<HTMLElement>(".sv-rb,.sv-imgbtn,.sv-card,.sv-jar,.sv-coins,.sv-feed,.sv-watch").forEach(el => {
      const r = el.getBoundingClientRect(); if (!r.width) return;
      const x = (r.left + r.width / 2 - sr.left) / s;
      el.animate([{ scale: "1" }, { scale: "1.12", offset: 0.4 }, { scale: "1" }], { duration: 520, delay: waveAt(x), easing: "ease-out" });
    });
    const t = window.setTimeout(() => setWave(0), WAVE_MS + 1200);
    return () => window.clearTimeout(t);
  }, [wave]);
  if (wave && !waveDots.current.length) waveDots.current = Array.from({ length: 24 }, () => ({ x: Math.random() * sw, y: 70 + Math.random() * (sh - 140), z: 10 + Math.random() * 14, d: Math.random() * 260 }));
  const sceneRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);
  const introDots = useRef(Array.from({ length: 26 }, () => ({ a: Math.random() * Math.PI * 2, r: 60 + Math.random() * 250, d: Math.random() * 1.6, z: 9 + Math.random() * 12 })));
  useEffect(() => {
    if (intro !== "on") return;
    if (!introTest) v.markSeen(introFlag);
    const ivs: number[] = [];
    const hush = () => { const a = v.audioRef.current; if (a) a.volume = 0; }; // world music waits until the animal appears
    hush();
    // one fall + ONE bounce + settle; 'translate' adds to each layer's own transform/animation (bubbles, smoke...)
    const DROP: Keyframe[] = [
      { translate: "0 -1150px", easing: "cubic-bezier(.55,0,1,.45)" },
      { translate: "0 0", offset: 0.58, easing: "cubic-bezier(0,.45,.45,1)" },
      { translate: "0 -64px", offset: 0.78, easing: "cubic-bezier(.55,0,1,.45)" },
      { translate: "0 0" },
    ];
    const kids = Array.from(sceneRef.current?.children ?? []) as HTMLElement[];
    // Andy 17:12: background comes DOWN from the top, the front layer comes UP from the bottom (mirror: rise, ONE dip, settle)
    const RISE: Keyframe[] = DROP.map(k => ({ ...k, translate: String(k.translate).replace(" -", " ") }));
    kids.forEach((el, i) => el.animate(i === 0 ? DROP : RISE, { duration: 1250, delay: i === 0 ? 0 : 900, fill: "backwards" }));
    // the old world stays behind and fades away once the new background has landed
    backRef.current?.animate([{ opacity: 1 }, { opacity: 1, offset: 0.6 }, { opacity: 0 }], { duration: 1400, fill: "forwards" });
    const thud = () => { if (v.sfxOn) { const a = new Audio(`${UI}/snd_thud.mp3`); a.volume = 0.9; a.play().catch(() => { }); } };
    const whoosh = () => { if (v.sfxOn) { const a = new Audio("/cards/ui/whoosh.mp3"); a.volume = 0.75; a.play().catch(() => { }); } };
    const musicUp = () => { // world music fades up (1.5s)
      const m = v.audioRef.current, full = v.K.musicVolume ?? v.volume * 0.5; let k = 0;
      ivs.push(window.setInterval(() => { k++; if (m) m.volume = Math.min(full, (full * k) / 20); }, 75));
    };
    setIp(1);
    const ts = [
      window.setTimeout(hush, 80), window.setTimeout(hush, 600), // the brain may create/start the music just after this
      window.setTimeout(whoosh, 0), window.setTimeout(whoosh, 900), // background flies down, front flies up
      window.setTimeout(thud, 725), window.setTimeout(thud, 1625), // background lands, front lands (first touch of each)
      window.setTimeout(() => setIp(2), 2150),
      window.setTimeout(() => { setIp(3); startArrive(); musicUp(); }, 4150),
      window.setTimeout(() => {
        setIp(4);
        if (v.sfxOn) { // chime fades in
          const c = new Audio("/cookiejar/snd_chime.mp3"); c.volume = 0; c.play().catch(() => { });
          let k = 0; ivs.push(window.setInterval(() => { k++; c.volume = Math.min(0.7, k * 0.07); }, 50));
        }
      }, 5700),
      window.setTimeout(() => setIp(5), 8300),
      window.setTimeout(() => {
        setIntro("off"); setIp(0);
        ivs.forEach(t => window.clearInterval(t)); // music + chime ramps are done by now
      }, 8800),
    ];
    return () => { ts.forEach(t => window.clearTimeout(t)); ivs.forEach(t => window.clearInterval(t)); };
  }, [intro]);
  const canFeed = !testView && !v.readOnly && !grown && v.jarTreats > 0;
  const feed = () => {
    if (testView) return;
    if (v.readOnly) { toast("Just visiting!"); return; } // a visit: no feeding
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
  const startName = () => { if (testView || v.readOnly) return; /* a visit: no renaming */ v.nudgeSeen(); namingRef.current = true; setDraft(name); setNaming(true); };
  const endName = (save: boolean) => {
    if (!namingRef.current) return;
    namingRef.current = false; setNaming(false);
    const t = draft.trim().slice(0, 12);
    if (save && t && t !== name) {
      v.savePetName(t); setBurst(b => b + 1);
      if (v.sfxOn) { const a = new Audio(`${UI}/snd_rename.mp3`); a.volume = 0.8; a.play().catch(() => { }); } // fairy wand (Andy 2026-10-04)
    }
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
    if (isCloseBtn(e.target)) { playCloseBeep(); return; }   // red X = beep instead of the click (Andy 2026-10-07)
    if (!clicks.current.length) clicks.current = [0, 1, 2].map(() => { const a = new Audio(`${UI}/click.mp3`); a.volume = 0.5; return a; });
    const a = clicks.current[clickN.current++ % 3];
    a.currentTime = 0; a.play().catch(() => { });
  };

  return (
    <div className="sv-root" onPointerDown={onPointerDown}>
      <style>{FONTS + CSS}</style>
      <div className={"sv-stage" + (intro !== "off" ? " intro ip" + ip : "")} ref={stageRef} style={{ width: sw, height: sh, transform: `translate(-50%,-50%) scale(${s})` }}>
        <div className="sv-fill" ref={fillRef}><img src={L.fill} alt="" /></div>
        {intro !== "off" && prevFar && ip <= 1 && <div className="sv-iback" ref={backRef}><img src={prevFar} alt="" /></div>}
        <div className="sv-scene" ref={sceneRef} style={{ left: cx - STAGE_W / 2 }}><L.Scene /></div>

        <div className="sv-grp sv-inT">{/* slide-in group (Andy 20:02) */}
        <div className="sv-grow" style={{ left: cx - 290 }}>
          <div className="sv-lbl">Stage {stageIdx + 1} of 4 {"\u00b7"} {stage.name}</div>
          <div className="sv-bar">
            <div className="sv-barfill" style={{ width: `calc(${pct * 100}% - 6px)` }} />
            {animal.stages.map((st, i) => (
              <div key={i} className={"sv-stop" + (fed >= st.min ? "" : " off")} style={{ left: `${(st.min / max) * 100}%` }}>
                <img src={art(animal, i, true)} alt="" />
              </div>
            ))}
          </div>
          <div className="sv-sub">{sub}</div>
        </div>

        {L.titleImg ? <img className="sv-title" src={L.titleImg} alt={`${L.title} World`} /> : <div className="sv-titletxt">{L.title} World</div>}
        </div>

        {isFly && <div className="sv-flyshadow" style={{ left: cx }} />}
        {arriving && <div key={"ag" + arrive} className="sv-arrive" style={{ left: cx - 320, top: 201 + (L.dy?.[akey] ?? 0) }}><b className="sv-aglow" /></div>}
        <div className={"sv-animal mv-" + L.move + (picIdx === 0 ? " egg" : "") + (isFly ? " fly" : "")} style={{ left: cx - 320, top: 201 + (L.dy?.[akey] ?? 0) }}
          onClick={() => actRef.current.go(true)}>
          <div key={"in" + arrive} className={"sv-in" + (arrive ? " go" : "")}><div key={hop} className={"sv-hop" + (hop ? " go" : "")}>
            <div className={"sv-act" + (act ? " a-" + act : "")} onAnimationEnd={e => { if (e.target === e.currentTarget) setAct(""); }}>
            {oldPic && <img className="sv-picout" src={oldPic.src} alt="" style={oldPic.style} />}
            <img key={art(animal, picIdx)} className={tfOn ? "sv-picin" : undefined} src={art(animal, picIdx)} alt={animal.name} style={picStyle} /></div></div></div>
        </div>
        {tfOn && (
          <div key={"tf" + tf} className="sv-tf" style={{ left: cx - 320, top: 201 + (L.dy?.[akey] ?? 0) }}>
            <b className="sv-tglow" /><TransformFx />
          </div>
        )}
        {arriving && (
          <div key={"ad" + arrive} className="sv-arrive" style={{ left: cx - 320, top: 201 + (L.dy?.[akey] ?? 0), zIndex: 7 }}>
            {ARRIVE.map((d, i) => (
              <i key={i} style={{ width: d[2], height: d[2], margin: -d[2] / 2, ["--a" as string]: `${d[0]}deg`, ["--d" as string]: `${d[1]}px`,
                animationDuration: `${d[3]}s`, animationDelay: `${d[4]}s` }} />
            ))}
          </div>
        )}

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
              const w = 14 + (i % 4) * 5; // round glowing dots - no star shapes (Andy 2026-10-03)
              return <i key={i} style={{ ["--dx" as string]: `${Math.cos(ang) * d}px`, ["--dy" as string]: `${Math.sin(ang) * d * 0.55}px`, width: w, height: w, marginLeft: -w / 2, marginTop: -w / 2, animationDelay: `${(i % 5) * 25}ms` }} />;
            })}
          </div>
        )}

        {watchReady && !party && !v.showVideo && (
          <Sparkler className="sv-spk-watch" style={{ left: cx - 265 }} cx={265} cy={51} spread={420} k={0.75} halo={[700, 260]} />
        )}
        {watchReady
          ? <div className="sv-watch sv-tap" onClick={v.openVideo}><img src={`${UI}/btn_watch.webp`} alt="" /><span>Watch the video!</span></div>
          : <div className={"sv-feed sv-ptr" + (canFeed ? "" : " off")} onClick={feed}><img src={`${UI}/btn_feed.webp`} alt="Feed!" /></div>}
        {flying.map(id => (
          <div key={id} className="sv-fly" style={{ ["--x0" as string]: "123px", ["--x1" as string]: `${cx - 32}px`, ["--y0" as string]: `${sh - 300}px`, ["--ym" as string]: `${(sh - 300 + 480) / 2 - 260}px`, ["--y1" as string]: "480px" }}>
            <img src={`${UI}/treat.webp`} alt="" />
          </div>
        ))}

        {/* top corners */}
        <div className="sv-grp sv-inT">
        <div className="sv-rb sv-tap" style={{ left: 22 }} onClick={() => setHowto("open")}><img src={`${UI}/rb_help.webp`} alt="Help" /></div>
        <div ref={coinRef} className={"sv-coins" + lift} style={bumpStyle("coin")}><span>{coinShown}</span></div>
        <div className={"sv-rb sv-tap" + (v.musicOn ? "" : " muted")} style={{ right: 100 }} onPointerDown={() => { const a = v.audioRef.current; musicWasPaused.current = !!a && a.paused; }}
          onClick={() => { if (v.musicOn && musicWasPaused.current) { v.audioRef.current?.play().catch(() => { }); return; } v.setMusicOn(!v.musicOn); }}><img src={`${UI}/rb_music.webp`} alt="Music" /></div>
        <div className="sv-rb sv-tap" style={{ right: 22 }} onClick={() => setPanel("exit")}><img src={`${UI}/rb_exit.webp`} alt="Exit" /></div>
        </div>

        {/* left: ways to earn */}
        <div className="sv-left sv-inL">
          <div className="sv-imgbtn sv-tap" onClick={goVocab}><img src={`${UI}/btn_vocab.webp`} alt="Vocab Games" /></div>
          <div className="sv-imgbtn sv-tap" onClick={goGrammar}><img src={`${UI}/btn_grammar.webp`} alt="Grammar Games" /></div>
          <div ref={puzzleRef} className={"sv-imgbtn sv-tap" + lift} style={bumpStyle("piece")} onClick={soon}><img src={`${UI}/btn_puzzle.webp`} alt="Puzzle Activity" /></div>
          <div className="sv-imgbtn sv-tap" onClick={() => setPanel("theater")}>
            <img src={`${UI}/btn_video.webp`} alt="Video Theater" />{allNew.length > 0 && <span className="sv-dot" />}
          </div>
        </div>

        {/* bottom left: the real jar (new treat), Daily Treat, Visit 5 days */}
        <div ref={jarRef} className={"sv-jar sv-inB" + lift} onClick={() => setJarPoke(p => p + 1)}>
          <CookieJar count={jarShown} width="200px" cookie={`${UI}/treat.webp`} muted={!v.sfxOn} flyOut={false} poke={jarPoke} style={{ position: "absolute", left: 0, bottom: 0 }} />
          <div className="sv-jarcount">{holding ? jarShown : Math.max(v.jarTreats, jarShown)}</div>
        </div>
        <img className={"sv-jarlbl sv-inB" + lift} src={`${UI}/lbl_treats.webp`} alt="My Treats" />
        {/* Daily Treat button + Visit 5 days REMOVED (Andy 2026-10-03): the Daily Prize box replaces both. */}

        {/* right: cards (pre-built gold frames, never CSS border-image) */}
        <div className="sv-grp sv-inR">
        {newReady && panel !== "animals" && (
          <Sparkler className="sv-spk-animals" cx={131} cy={95} />
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
        <div ref={badgesRef} className={"sv-card sv-badges sv-tap" + lift} style={bumpStyle("badge")} onClick={soon}>
          <div className="sv-medals">{[0, 1, 2].map(i => <img key={i} className={"sv-medal" + (i < badgesShown ? " won" : " off")} src={i < badgesShown ? `/worlds/badges/${wonBadges[i] ?? v.world.id}.webp` : `${UI}/medal.webp`} alt="" />)}</div>
          <img className="sv-cardlbl" style={{ top: 111, height: 45 }} src={`${UI}/lbl_badges.webp`} alt="My Badges" />
        </div>
        {albumPacks > 0 && !newReady && !panel && <Sparkler className="sv-spk-album" cx={131} cy={95} />}
        <div className={"sv-card sv-album sv-tap" + (albumPacks > 0 && !newReady && !panel ? " beacon" : "")} onClick={albumOn ? () => goGames(`/album/${v.code}/${v.studentName}`) : soon}>{/* Card Album: 1006 only for now */}
          <img className="sv-cardlbl" style={{ top: 176, height: 38 }} src={`${UI}/lbl_album.webp`} alt="Card Album" />
          {albumPacks > 0 && <span className="sv-dot num">{albumPacks}</span>}
        </div>
        {albumOn && (
          <div className="sv-ameter sv-tap" onClick={() => goGames(`/album/${v.code}/${v.studentName}`)}>
            <div className="sv-amtrack"><i className={albumPacks ? "full" : ""} style={{ width: `${Math.max(8, albumPct)}%` }} />
              <span>{albumPacks ? "OPEN!" : `${albumCoins % PACK_PRICE} / ${PACK_PRICE}`}</span></div>
            <img className={"sv-apack" + (albumPacks ? " ready" : "")} src="/cards/ui/pack_closed.webp" alt="" />
          </div>
        )}
        </div>
        <div className="sv-card sv-worlds sv-tap sv-inB" onClick={() => setPanel("worlds")}>
          <div className="sv-wrow">
            {v.worldList.slice(0, 3).map(x => ( /* step 7: from the world list (4+ worlds: show the 3 nearest - later) */
              <img key={x.world.id} className={x.world.id === v.world.id ? "here" : (!x.finished && x.world.id !== v.currentWorld.id ? "lock" : undefined)}
                src={`${UI}/world_${x.world.id}.webp`} alt={`${x.world.title} World`} />))}
          </div>
          <img className="sv-cardlbl" style={{ top: 102, height: 48 }} src={`${UI}/lbl_worlds.webp`} alt="My Worlds" />
        </div>

        {toastMsg && <div className="sv-toast">{toastMsg}</div>}

        {/* My Animals screen: visit an open animal, or unlock the new friend */}
        {panel === "animals" && (
          <div className="sv-ov" onClick={() => setPanel(null)}>
            <div className="sv-ovcard" onClick={e => e.stopPropagation()}>
              {newReady && ( /* Andy 2026-10-04 16:27: glow + motes around the WHOLE My Animals box, not one card */
                <div className="sv-fmotes sv-pmotes" aria-hidden="true"><b className="sv-pglow" />
                  {PANEL_MOTES.map((m, i) => <i key={i} style={{ left: `${m[0]}%`, top: `${m[1]}%`, width: m[2], height: m[2], margin: -m[2] / 2,
                    ["--dx" as string]: `${m[5]}px`, animationDuration: `${m[3]}s`, animationDelay: `${m[4]}s` }} />)}
                </div>)}
              <div className="sv-x sv-tap" onClick={() => setPanel(null)}><img src={`${UI}/rb_exit.webp`} alt="Close" /></div>
              <h2>My {L.title} Animals</h2>
              <div className="sv-biggrid">
                {slots.map(x => {
                  const here = x.a.id === v.activeAnimalId;
                  if (x.open) return (
                    <div key={x.a.id} className={"sv-big sv-tap" + (here ? " here" : "")}
                      onClick={() => { if (!here) { v.switchAnimal(x.a.id); toast("Hi again!"); } setPanel(null); }}>
                      <img src={x.bigImg} alt={x.a.name} /><p>{x.a.name}</p>{here && <small>With you now</small>}
                    </div>);
                  if (x.ready) return (
                    <div key={x.a.id} className="sv-readywrap">
                      <div className="sv-big ready sv-tap" onClick={() => { v.dismissUnlock(x.a.id); setUnlockedNow(true); setPanel(null); startArrive(); toast("Say hello to your new friend!"); }}>
                        <img className="shadow" src={art(x.a, 0)} alt="" /><p>New friend! Tap me!</p>
                      </div>
                    </div>);
                  return (
                    <div key={x.a.id} className="sv-big locked"><div className="sv-q">?</div><p>???</p></div>);
                })}
              </div>
            </div>
          </div>
        )}

        {/* MY WORLDS (step 7, 2026-10-04): every world in order. Finished = visit (read-only page, saves nothing);
            the kid's current world = go there; not reached yet = '?'. Only the X closes it (never a background tap). */}
        {panel === "worlds" && (
          <div className="sv-ov">
            <div className="sv-ovcard">
              <div className="sv-x sv-tap" onClick={() => setPanel(null)}><img src={`${UI}/rb_exit.webp`} alt="Close" /></div>
              <h2>My Worlds</h2>
              {/* Andy 2026-10-09: ONE row, scroll left/right (pink arrows); background pictures; not reached = grey + name, no tap */}
              <div className="sv-wwrap">
                <div className={"sv-warr l" + (wEdge.l ? " off" : " sv-tap")} onClick={() => wScroll(-1)}><svg viewBox="0 0 24 24"><path d="M16 3 6 12l10 9z" fill="#fff" /></svg></div>
                <div className="sv-wlist" ref={wRowRef} onScroll={wEdges}>
                  {[...v.worldList, ...v.comingWorlds.map(w => ({ world: w, finished: false }))].map(x => {
                    const w = x.world, here = w.id === v.world.id, now = w.id === v.currentWorld.id;
                    const go = here ? null : x.finished ? `/visit/${w.id}/${v.code}/${v.studentName}` : now ? `${w.path}/${v.code}/${v.studentName}` : null;
                    const pic = <img className="sv-wpic" src={`${UI}/card_${w.id}.webp`} alt="" />;
                    if (!here && !go) return (
                      <div key={w.id} className="sv-big sv-wcard locked">{pic}<p>{w.title} World</p></div>);
                    const label = here ? (v.readOnly ? "Visiting" : "You are here") : x.finished ? "Finished! Tap to visit" : "Tap to go back";
                    return (
                      <div key={w.id} className={"sv-big sv-wcard" + (here ? " here" : " sv-tap")} onClick={() => { if (go) v.navigate(go); else setPanel(null); }}>
                        {pic}<p>{w.title} World</p><small>{label}</small>
                      </div>);
                  })}
                </div>
                <div className={"sv-warr r" + (wEdge.r ? " off" : " sv-tap")} onClick={() => wScroll(1)}><svg viewBox="0 0 24 24"><path d="M8 3l10 9-10 9z" fill="#fff" /></svg></div>
              </div>
            </div>
          </div>
        )}

        {/* video player: the brain marks it watched after 1 second (onVideoTime) and turns the music down/up */}
        {v.showVideo && animal.video && (
          <div className={"sv-ov sv-vov" + (v.videoFadingOut ? " out" : "")}>
            <div className="sv-ovcard sv-vcard">
              <div className="sv-x sv-tap" onClick={closeVid}><img src={`${UI}/rb_exit.webp`} alt="Close" /></div>
              <video className="sv-video" src={animal.video} autoPlay loop playsInline controls controlsList="nodownload noplaybackrate" disablePictureInPicture
                onTimeUpdate={testVid ? undefined : v.onVideoTime} />
            </div>
          </div>
        )}

        {panel === "theater" && (
          <VideoTheater cx={cx} sh={sh} worlds={theaterWorlds} start={theaterStart} newIds={allNew}
            onPlay={id => { theaterMusic(true); setNewIds(ids => ids.filter(x => x !== id)); v.markSeen(`theater:${cardWorld[id] ?? v.world.id}:${id}`); }}
            onStop={() => theaterMusic(false)} onClose={() => setPanel(null)}
            muted={!v.sfxOn} onIntro={q => theaterMusic(q)} />
        )}

        {howto === "open" && <HowToPlay {...worldHowTo((v.ANIMALS[0]?.stages ?? []).map(st => st.img))} muted={!v.sfxOn} onDone={closeHowto} />}
        {dailyDay > 0 && (
          <DailyPrize cx={cx} sh={sh} day={dailyDay} sfxOn={v.sfxOn}
            onClaim={() => (isTestDp ? Promise.resolve({ paid: true }) : v.claimDailyPrize())}
            target={k => partyTarget(k)} onLand={dailyLand} onDone={() => { if (isTestDp) setTestKeep(true); setDailyDay(0); }} />
        )}

        {mini && (
          <div key={mini.id} style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 40 }}>
            <div className="sv-mini" style={{ left: cx, top: 380 }}>+{mini.n}</div>
            {Array.from({ length: Math.min(mini.n, 6) }, (_, i) => (
              <img key={i} className="sv-minicoin" src={`${UI}/coin.webp`} alt=""
                style={{ left: cx + (i % 3 - 1) * 26, top: 450, animationDelay: `${500 + i * 90}ms`,
                  ["--dx" as string]: `${mini.x1 - (cx + (i % 3 - 1) * 26)}px`, ["--dy" as string]: `${mini.y1 - 450}px` } as React.CSSProperties} />
            ))}
          </div>
        )}

        {party && (
          <GrowUpParty phase={party} cx={cx} sh={sh} prizes={PRIZES} sfxOn={v.sfxOn} target={partyTarget}
            heroImgs={[art(partyAnimal, smallParty ? partyStage! : partyLast)]}
            line={partyLine}
            onLand={partyLand} onAllLanded={partyLanded} onOk={() => setParty("fly")} />
        )}

        {done && (
          <GrowUpParty phase={done} cx={cx} sh={sh} prizes={DONE_PRIZES} sfxOn={v.sfxOn} target={partyTarget}
            word="World Complete!" music={{ file: "completedworld-music.mp3", ms: 4300 }}
            heroImgs={v.ANIMALS.map(a => art(a, a.stages.length - 1))} line={`You finished ${L.title} World!`}
            onLand={partyLand} onAllLanded={doneLanded} onOk={() => setDone("fly")} />
        )}

        {/* POINTING HANDS (Andy 2026-10-03): only while the thing waits for a tap */}
        {watchReady && !party && !done && !dailyDay && !v.showVideo && !panel && (
          <Hand stage={stageRef} s={s} sel=".sv-watch" fx={0.86} fy={0.22} />
        )}
        {newReady && !panel && !party && !done && !dailyDay && !v.showVideo && ( /* not while a video plays (Andy 2026-10-04) */
          <Hand stage={stageRef} s={s} sel=".sv-animals" fx={0.16} fy={0.3} flip />
        )}
        {panel === "animals" && <Hand stage={stageRef} s={s} sel=".sv-big.ready" fx={0.82} fy={0.2} />}
        {dailyDay > 0 && <Hand stage={stageRef} s={s} sel=".dp-claim:not(:disabled)" fx={0.86} fy={0.25} />}

        {/* NEW-WORLD WELCOME: glow + round sparkles where the egg will appear, then the big world title */}
        {intro !== "off" && ip >= 2 && (
          <div className={"sv-iglow" + (ip >= 3 ? " fade" : "")} style={{ left: cx, top: 600 }}>
            <b />
            {introDots.current.map((d, i) => <i key={i} style={{ left: Math.cos(d.a) * d.r, top: Math.sin(d.a) * d.r * 0.8, width: d.z, height: d.z, animationDelay: `${d.d}s` }} />)}
          </div>)}
        {intro !== "off" && ip >= 4 && (
          <div className={"sv-ititle" + (ip >= 5 ? " out" : "")} style={{ left: cx }}>
            <b className="sv-ihalo" />
            {L.titleImg ? <img src={L.titleImg} alt="" /> : <div className="sv-ititxt">{L.title} World</div>}
            {introDots.current.slice(0, 16).map((d, i) => <i key={i} style={{ left: Math.cos(d.a) * (d.r * 1.3 + 90), top: Math.sin(d.a) * d.r * 0.35, width: d.z, height: d.z, animationDelay: `${0.3 + d.d}s` }} />)}
          </div>)}

        {wave > 0 && (
          <div className="sv-wave" style={{ ["--sw" as string]: `${sw}px` } as React.CSSProperties}>
            <b className="sv-wband" style={{ width: WAVE_W, animationDuration: `${WAVE_MS}ms` }} />
            {waveDots.current.map((d, i) => <i key={i} style={{ left: d.x, top: d.y, width: d.z, height: d.z, animationDelay: `${waveAt(d.x) + d.d}ms` }} />)}
          </div>)}

        {/* exit: our own popup, never a system box */}
        {panel === "exit" && (
          <div className="sv-ov">
            <div className="sv-exit">
              <p className="q1">Leave {L.title} World?</p>
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

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Lilita+One&family=Titan+One&display=swap');`;

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
.sv-titletxt{position:absolute;left:0;right:0;top:168px;text-align:center;font-family:'Lilita One',sans-serif;font-size:66px;line-height:1.2;color:#ffd23a;pointer-events:none;white-space:nowrap;
 text-shadow:-3px -3px 0 #7a3a08,3px -3px 0 #7a3a08,-3px 3px 0 #7a3a08,3px 3px 0 #7a3a08,0 -3px 0 #7a3a08,0 3px 0 #7a3a08,-3px 0 0 #7a3a08,3px 0 0 #7a3a08,0 8px 0 #7a3a08,0 12px 12px rgba(0,0,0,.45)}
.sv-animal{position:absolute;top:201px;width:640px;height:640px;transform-origin:50% 92%;animation:sv-idle 6s ease-in-out infinite}
.sv-animal.egg{animation:sv-wobble 2.6s ease-in-out infinite}
.sv-animal img{display:block;width:100%;height:100%;pointer-events:none}
@keyframes sv-idle{0%,100%{transform:rotate(0) scale(1,1)}25%{transform:rotate(-.9deg) scale(1.008,.992)}50%{transform:rotate(0) scale(1.014,.984)}75%{transform:rotate(.9deg) scale(1.008,.992)}}
@keyframes sv-wobble{0%,70%,100%{transform:rotate(0)}76%{transform:rotate(-3deg)}84%{transform:rotate(3deg)}92%{transform:rotate(-1.5deg)}}
/* step 6: how each world's animals move (Savanna = breathe above). Ocean floats; Dino never moves (only flyers bob). */
.sv-animal.mv-float,.sv-animal.mv-float.egg{animation:sv-swim 4.5s ease-in-out infinite;transform-origin:50% 50%}
.sv-animal.mv-still,.sv-animal.mv-still.egg{animation:none}
.sv-animal.mv-still.fly{animation:sv-swim 3.6s ease-in-out infinite;transform-origin:50% 50%}
/* (2026-10-04 Andy: every animal hops a little when fed - Dino too; dinos still never sway/breathe) */
@keyframes sv-swim{0%,100%{transform:translateY(0) rotate(-1.2deg)}50%{transform:translateY(-16px) rotate(1.2deg)}}
.sv-flyshadow{position:absolute;top:800px;width:300px;height:44px;margin-left:-150px;border-radius:50%;pointer-events:none;
 background:radial-gradient(ellipse at center,rgba(40,25,5,.5) 0%,rgba(40,25,5,.25) 45%,rgba(40,25,5,0) 72%);animation:sv-flyshadow 3.6s ease-in-out infinite}
@keyframes sv-flyshadow{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(.86);opacity:.75}}
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
.sv-grp{position:absolute;inset:0;pointer-events:none}
.sv-grp .sv-tap,.sv-grp .sv-rb{pointer-events:auto}
.sv-inL{animation:sv-inL .85s cubic-bezier(.3,1.35,.5,1) .05s backwards}
.sv-inR{animation:sv-inR .85s cubic-bezier(.3,1.35,.5,1) .1s backwards}
.sv-inB{animation:sv-inB .85s cubic-bezier(.3,1.35,.5,1) .2s backwards}
.sv-inT{animation:sv-inT .8s cubic-bezier(.3,1.35,.5,1) .12s backwards}
@keyframes sv-inL{0%{transform:translateX(-440px)}100%{transform:none}}
@keyframes sv-inR{0%{transform:translateX(440px)}100%{transform:none}}
@keyframes sv-inB{0%{transform:translateY(420px)}100%{transform:none}}
@keyframes sv-inT{0%{transform:translateY(-280px)}100%{transform:none}}
.sv-imgbtn{position:relative;width:270px;filter:drop-shadow(0 8px 8px rgba(0,0,0,.35))}
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
.sv-album.beacon{animation:sv-peek 2.6s ease-in-out infinite,sv-goldglow 1.3s ease-in-out infinite;transform-origin:50% 90%}
.sv-spk-album{right:30px;top:525px;width:262px;height:190px}
.sv-dot.num{display:flex;align-items:center;justify-content:center;width:44px;height:44px;right:-10px;top:-12px;font-family:'Titan One',sans-serif;font-size:22px;line-height:1;color:#fff;text-shadow:0 2px 0 rgba(0,0,0,.35)}
.sv-ameter{position:absolute;right:34px;top:724px;width:256px;height:76px}
.sv-amtrack{position:absolute;left:0;top:22px;width:210px;height:34px;border-radius:17px;background:#5a2b16;border:4px solid #f3b13a;overflow:hidden;box-shadow:inset 0 3px 6px rgba(0,0,0,.4),0 5px 8px rgba(0,0,0,.3)}
.sv-amtrack i{position:absolute;left:0;top:0;bottom:0;border-radius:13px;background:linear-gradient(#a6f590,#2fb34a);transition:width .6s}
.sv-amtrack i.full{background:linear-gradient(#fff38a,#ffcf20 55%,#f5a300);animation:sv-amshine 1.4s ease-in-out infinite alternate}
@keyframes sv-amshine{0%{filter:brightness(1)}100%{filter:brightness(1.3)}}
.sv-amtrack span{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-family:'Titan One',sans-serif;font-size:18px;color:#fff;paint-order:stroke fill;-webkit-text-stroke:4px #3a1d6e}
.sv-apack{position:absolute;right:0;top:0;width:46px;transform:rotate(10deg);filter:drop-shadow(0 4px 6px rgba(0,0,0,.4))}
.sv-apack.ready{animation:sv-apack 2s ease-in-out infinite;filter:drop-shadow(0 0 10px rgba(255,225,120,.95))}
@keyframes sv-apack{0%,60%,100%{transform:rotate(10deg)}66%{transform:rotate(-6deg) scale(1.1)}72%{transform:rotate(14deg) scale(1.1)}78%{transform:rotate(2deg)}84%{transform:rotate(10deg)}}
@keyframes sv-peek{0%,52%,100%{transform:rotate(0)}56%{transform:rotate(-2.4deg)}61%{transform:rotate(2.2deg)}66%{transform:rotate(-1.8deg)}71%{transform:rotate(1.2deg)}76%{transform:rotate(0)}}
@keyframes sv-goldglow{0%,100%{filter:brightness(1.08) drop-shadow(0 0 3px #fff36b) drop-shadow(0 0 8px #ffd000) drop-shadow(0 0 16px rgba(255,190,0,.9))}50%{filter:brightness(1.22) drop-shadow(0 0 5px #fffbb0) drop-shadow(0 0 14px #ffe000) drop-shadow(0 0 28px rgba(255,200,0,1))}}
.sv-sparkler{position:absolute;pointer-events:none}
.sv-spk-animals{right:30px;top:112px;width:262px;height:191px}
.sv-spk-watch{top:892px;width:530px;height:102px}
.sv-halo{position:absolute;left:var(--cx);top:var(--cy);border-radius:50%;
 background:radial-gradient(closest-side,rgba(255,240,120,1) 0%,rgba(255,218,20,1) 55%,rgba(255,196,0,.75) 70%,rgba(255,170,0,.35) 85%,rgba(255,160,0,0) 100%);animation:sv-halo 1.6s ease-in-out infinite}
@keyframes sv-halo{0%,100%{opacity:.85;transform:scale(.95)}50%{opacity:1;transform:scale(1.07)}}
.sv-sd,.sv-ss{position:absolute;left:calc(var(--cx) + var(--ox, 0px));top:var(--cy);opacity:0;animation-iteration-count:infinite}
.sv-sd{border-radius:50%;background:#fffde6;box-shadow:0 0 2px 1px #fff27a,0 0 6px 2px #ffd000,0 0 10px 3px rgba(255,170,0,.7);
 animation-name:sv-sd;animation-timing-function:cubic-bezier(.2,.75,.35,1)}
@keyframes sv-sd{0%{opacity:0;transform:rotate(var(--a)) translateX(0) scale(1)}15%{opacity:1}70%{opacity:1}85%{opacity:.4}92%{opacity:1}100%{opacity:0;transform:rotate(var(--a)) translateX(var(--d)) scale(.5)}}
.sv-ss{height:2px;margin-top:-1px;border-radius:2px;transform-origin:0 50%;background:linear-gradient(90deg,rgba(255,220,60,0),#ffe24a 60%,#fffde6);
 box-shadow:0 0 4px 1px rgba(255,200,0,.8);animation-name:sv-ss;animation-timing-function:ease-out}
@keyframes sv-ss{0%{opacity:0;transform:rotate(var(--a)) translateX(60px) scaleX(.3)}20%{opacity:1}100%{opacity:0;transform:rotate(var(--a)) translateX(var(--d)) scaleX(1)}}
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
.sv-wrow img.lock{filter:grayscale(1) brightness(.85);opacity:.55}
.sv-wrow img.here{border-color:#fff;box-shadow:0 0 0 3px #e9b53a,0 3px 0 3px #a86a10}
.sv-tap{cursor:pointer}
.sv-rb.muted{opacity:.55}
.sv-imgbtn:active,.sv-rb:active,.sv-daily:active{transform:translateY(5px) scale(.98)}
.sv-card:active{transform:translateY(4px)}
.sv-feed:not(.off):active{transform:translate(-50%,5px) scale(.98)}
.sv-hop{position:relative;width:100%;height:100%;transform-origin:50% 92%}
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
.sv-burst i{position:absolute;left:0;top:0;border-radius:50%;opacity:0;animation:sv-spk 1s ease-out forwards;
  background:radial-gradient(circle,#fff 0%,#fff3a0 30%,rgba(255,214,90,.6) 55%,rgba(255,210,80,0) 72%)}
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
.sv-big.ready{border-color:#ffb000} /* glow moved to the whole box (Andy 2026-10-04 16:27) */
@keyframes sv-glowBox{0%,100%{box-shadow:0 0 0 0 rgba(255,215,60,0)}50%{box-shadow:0 0 34px 14px rgba(255,215,60,.95)}}
.sv-stage.intro{background:radial-gradient(ellipse at 50% 45%,#2b1d5c 0%,#0c0720 75%)}
.sv-stage.intro :is(.sv-inL,.sv-inR,.sv-inB,.sv-inT,.sv-nametag,.sv-feed,.sv-watch,.sv-petname,.sv-hand){animation:none!important;visibility:hidden}
.sv-stage.intro.ip0 :is(.sv-scene,.sv-fill){visibility:hidden}
.sv-wave{position:absolute;inset:0;z-index:70;pointer-events:none;overflow:hidden}
.sv-wband{position:absolute;top:-10%;left:0;height:120%;transform:skewX(-18deg);mix-blend-mode:screen;
 background:linear-gradient(90deg,rgba(255,255,255,0) 0%,rgba(255,248,215,.16) 30%,rgba(255,250,230,.42) 50%,rgba(255,248,215,.16) 70%,rgba(255,255,255,0) 100%);
 animation:sv-wsweep linear both}
@keyframes sv-wsweep{0%{translate:-600px 0}100%{translate:calc(var(--sw) + 200px) 0}}
.sv-wave i{position:absolute;border-radius:50%;background:radial-gradient(circle,#fff 0%,#fff6c8 35%,rgba(255,220,110,0) 70%);
 transform:translate(-50%,-50%) scale(.2);opacity:0;animation:sv-wdot .9s ease-out both}
@keyframes sv-wdot{0%{opacity:0;transform:translate(-50%,-50%) scale(.2)}35%{opacity:1;transform:translate(-50%,-50%) scale(1.2)}100%{opacity:0;transform:translate(-50%,-60%) scale(.4)}}
.sv-iback{position:absolute;inset:0;overflow:hidden;pointer-events:none}
.sv-iback img{position:absolute;left:0;top:0;width:100%;height:100%;object-fit:cover}
.sv-stage.intro:is(.ip0,.ip1,.ip2) .sv-animal{visibility:hidden}
.sv-iglow{position:absolute;z-index:6;width:0;height:0;pointer-events:none;transition:opacity .9s}
.sv-iglow.fade{opacity:0}
.sv-iglow b{position:absolute;left:-300px;top:-300px;width:600px;height:600px;border-radius:50%;
 background:radial-gradient(circle,rgba(255,250,215,.95) 0%,rgba(255,215,90,.6) 30%,rgba(255,190,40,.18) 58%,rgba(255,190,40,0) 72%);
 animation:sv-igrow 1.6s cubic-bezier(.2,.8,.3,1) both,sv-ipulse 1.4s 1.6s ease-in-out infinite}
.sv-iglow i,.sv-ititle i{position:absolute;border-radius:50%;background:radial-gradient(circle,#fff 0%,#fff6c8 35%,rgba(255,220,110,0) 70%);
 transform:translate(-50%,-50%);opacity:0;animation:sv-itw 1.6s ease-in-out infinite}
@keyframes sv-igrow{0%{transform:scale(.05);opacity:0}100%{transform:scale(1);opacity:1}}
@keyframes sv-ipulse{0%,100%{transform:scale(1)}50%{transform:scale(1.08)}}
@keyframes sv-itw{0%,100%{opacity:0;transform:translate(-50%,-50%) scale(.3)}50%{opacity:1;transform:translate(-50%,-50%) scale(1.15)}}
.sv-ititle{position:absolute;top:255px;z-index:60;width:0;height:0;pointer-events:none;animation:sv-itin 1.1s cubic-bezier(.3,1.4,.5,1) both}
.sv-ititle.out{animation:sv-itout .5s ease-in both}
.sv-ititle img{position:absolute;left:0;top:0;height:140px;width:auto;max-width:none;transform:translate(-50%,-50%);
 filter:drop-shadow(0 0 18px rgba(255,230,140,.95)) drop-shadow(0 8px 6px rgba(60,25,0,.5))}
.sv-ititxt{position:absolute;left:0;top:0;transform:translate(-50%,-50%);white-space:nowrap;font-family:'Lilita One',sans-serif;font-size:120px;
 color:#ffd23a;-webkit-text-stroke:8px #6b3a0a;paint-order:stroke fill;filter:drop-shadow(0 0 18px rgba(255,230,140,.95))}
.sv-ihalo{position:absolute;left:-460px;top:-160px;width:920px;height:320px;border-radius:50%;
 background:radial-gradient(ellipse,rgba(255,240,170,.75) 0%,rgba(255,210,80,.3) 40%,rgba(255,210,80,0) 70%);animation:sv-ipulse 1.6s ease-in-out infinite}
@keyframes sv-itin{0%{opacity:0;transform:scale(.6)}100%{opacity:1;transform:scale(1)}}
@keyframes sv-itout{0%{opacity:1}100%{opacity:0;transform:translateY(-60px) scale(.8)}}
.sv-wwrap{position:relative;margin:20px 50px 0}
.sv-wlist{display:flex;gap:22px;overflow-x:auto;scroll-snap-type:x mandatory;scrollbar-width:none;padding:6px 0}
.sv-wlist::-webkit-scrollbar{display:none}
.sv-wcard{flex:0 0 258px;scroll-snap-align:start;box-sizing:border-box}
.sv-big img.sv-wpic{height:160px;object-fit:cover;border-radius:16px}
.sv-wcard.locked img.sv-wpic{filter:grayscale(1) contrast(.85) brightness(1.05);opacity:.7}
.sv-wcard.locked p{color:#a8977a}
.sv-warr{position:absolute;top:50%;z-index:2;width:62px;height:96px;margin-top:-48px;border-radius:22px;background:linear-gradient(#ff8ab5,#e0457a);
 border:5px solid #fff;box-shadow:0 6px 0 #9c1d4c,0 10px 14px rgba(0,0,0,.3);display:flex;align-items:center;justify-content:center;box-sizing:border-box}
.sv-warr.l{left:-74px}.sv-warr.r{right:-74px}
.sv-warr svg{width:34px;height:34px;filter:drop-shadow(0 2px 0 #9c1d4c)}
.sv-warr:active{transform:translateY(4px);box-shadow:0 2px 0 #9c1d4c}
.sv-warr.off{opacity:.35}
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
.sv-watch{position:absolute;left:50%;top:892px;width:530px;transform:translateX(-50%);animation:sv-watchPulse 1.3s ease-in-out infinite}
.sv-watch img{display:block;width:100%;height:auto;pointer-events:none}
.sv-watch span{position:absolute;left:16%;right:4%;top:50%;transform:translateY(-54%);text-align:center;white-space:nowrap;pointer-events:none;
 font-family:'Titan One',sans-serif;font-size:40px;color:#fff;
 text-shadow:3px 0 0 #4b0f5c,-3px 0 0 #4b0f5c,0 3px 0 #4b0f5c,0 -3px 0 #4b0f5c,2px 2px 0 #4b0f5c,-2px 2px 0 #4b0f5c,2px -2px 0 #4b0f5c,-2px -2px 0 #4b0f5c,0 5px 0 #4b0f5c}
@keyframes sv-watchPulse{0%,100%{transform:translateX(-50%) scale(1);filter:brightness(1.08) drop-shadow(0 0 3px #fff36b) drop-shadow(0 0 8px #ffd000) drop-shadow(0 0 16px rgba(255,190,0,.9))}
 50%{transform:translateX(-50%) scale(1.05);filter:brightness(1.22) drop-shadow(0 0 5px #fffbb0) drop-shadow(0 0 14px #ffe000) drop-shadow(0 0 28px rgba(255,200,0,1))}}
.sv-lift{z-index:61;pointer-events:none}
.sv-tf{position:absolute;width:640px;height:640px;pointer-events:none;z-index:62}
.sv-tglow{position:absolute;left:50%;top:55%;width:620px;height:620px;margin:-310px 0 0 -310px;border-radius:50%;opacity:0;
 background:radial-gradient(closest-side,#fff 0%,rgba(255,252,220,.98) 22%,rgba(255,236,120,.85) 45%,rgba(255,210,40,.4) 70%,rgba(255,200,0,0) 100%);
 animation:sv-tglow 3.2s ease-in-out forwards}
@keyframes sv-tglow{0%{opacity:0;transform:scale(.4)}22%{opacity:1;transform:scale(1.1)}45%{opacity:1;transform:scale(1.18)}75%{opacity:.35;transform:scale(1.3)}100%{opacity:0;transform:scale(1.4)}}
.sv-tfx{position:absolute;left:50%;top:50%;width:900px;height:900px;margin:-450px 0 0 -450px;pointer-events:none}
.sv-picin{animation:sv-picin .4s ease-out both}
@keyframes sv-picin{from{opacity:0}to{opacity:1}}
.sv-animal img.sv-picout{position:absolute;left:0;top:0;animation:sv-picout .4s ease-in forwards}
@keyframes sv-picout{from{opacity:1}to{opacity:0}}
.sv-readywrap{position:relative}
.sv-readywrap .sv-big{position:relative;z-index:1}
.sv-fmotes{position:absolute;inset:-46px;pointer-events:none;z-index:0}
.sv-fglow{position:absolute;inset:14px;border-radius:60px;filter:blur(8px);
 background:radial-gradient(closest-side,rgba(255,238,150,.95),rgba(255,214,70,.55) 60%,rgba(255,200,0,0) 100%);animation:sv-fglow 3s ease-in-out infinite}
@keyframes sv-fglow{0%,100%{opacity:.65;transform:scale(.97)}50%{opacity:1;transform:scale(1.04)}}
.sv-fmotes i{position:absolute;border-radius:50%;opacity:0;background:#fffde6;
 box-shadow:0 0 4px 2px #fff27a,0 0 10px 4px #ffd000,0 0 18px 6px rgba(255,170,0,.55);animation-name:sv-mote;animation-timing-function:ease-in-out;animation-iteration-count:infinite}
@keyframes sv-mote{0%{opacity:0;transform:translate(0,14px) scale(.4)}25%{opacity:1;transform:translate(calc(var(--dx) * .5),-26px) scale(1)}
 55%{opacity:.9;transform:translate(var(--dx),-44px) scale(.9)}80%{opacity:.5;transform:translate(calc(var(--dx) * .6),-28px) scale(.7)}100%{opacity:0;transform:translate(0,-12px) scale(.4)}}
.sv-pmotes{inset:-50px;z-index:-1}
.sv-pglow{position:absolute;inset:50px;border-radius:44px;animation:sv-pglow 2s ease-in-out infinite}
@keyframes sv-pglow{0%,100%{box-shadow:0 0 28px 10px rgba(255,215,60,.6)}50%{box-shadow:0 0 60px 26px rgba(255,215,60,.95)}}
@media (prefers-reduced-motion: reduce){.sv-fmotes i,.sv-fglow,.sv-pglow{animation:none}}
.sv-in{width:100%;height:100%;transform-origin:50% 92%}
.sv-animal:not(.mv-still){cursor:pointer}
.sv-act{width:100%;height:100%;transform-origin:50% 92%}
.mv-float .sv-act{transform-origin:50% 50%}
.sv-act.a-wiggle{animation:sv-aWiggle 1.1s ease-in-out}
.sv-act.a-bounce{animation:sv-aBounce 1.1s ease-out}
.sv-act.a-stretch{animation:sv-aStretch 1.4s ease-in-out}
.sv-act.a-look{animation:sv-aLook 2.6s ease-in-out}
@keyframes sv-aWiggle{0%,100%{transform:rotate(0)}15%{transform:rotate(-4deg)}35%{transform:rotate(4deg)}55%{transform:rotate(-3deg)}75%{transform:rotate(2deg)}}
@keyframes sv-aBounce{0%,100%{transform:translateY(0) scale(1,1)}10%{transform:translateY(0) scale(1.05,.94)}25%{transform:translateY(-28px) scale(.97,1.04)}40%{transform:translateY(0) scale(1.05,.95)}55%{transform:translateY(-16px) scale(.98,1.02)}70%{transform:translateY(0) scale(1.03,.97)}85%{transform:translateY(0) scale(1,1)}}
@keyframes sv-aStretch{0%,100%{transform:scale(1,1)}30%{transform:scale(1.07,.92)}60%{transform:scale(.96,1.07)}80%{transform:scale(1.01,.99)}}
@keyframes sv-aLook{0%,100%{transform:scaleX(1)}12%,80%{transform:scaleX(-1)}}
@media (prefers-reduced-motion: reduce){.sv-act.a-wiggle,.sv-act.a-bounce,.sv-act.a-stretch,.sv-act.a-look{animation:none}}
.sv-in.go{animation:sv-arriveIn 1.05s cubic-bezier(.3,1.4,.5,1) both}
@keyframes sv-arriveIn{0%{transform:translateY(-140px) scale(.25);opacity:0}35%{opacity:1;transform:translateY(-60px) scale(1.08)}62%{transform:translateY(0) scale(1.06,.92)}80%{transform:translateY(-14px) scale(.97,1.04)}100%{transform:translateY(0) scale(1)}}
.sv-arrive{position:absolute;width:640px;height:640px;pointer-events:none;animation:sv-arriveOut 3.3s ease-out forwards}
@keyframes sv-arriveOut{0%,75%{opacity:1}100%{opacity:0}}
.sv-aglow{position:absolute;left:50%;top:58%;width:520px;height:520px;margin:-260px 0 0 -260px;border-radius:50%;
 background:radial-gradient(closest-side,rgba(255,240,150,.75),rgba(255,214,60,.35) 55%,rgba(255,200,0,0) 100%);animation:sv-aglow 1.6s ease-in-out infinite}
@keyframes sv-aglow{0%,100%{transform:scale(.9);opacity:.7}50%{transform:scale(1.05);opacity:1}}
.sv-arrive i{position:absolute;left:50%;top:58%;border-radius:50%;opacity:0;background:#fffde6;
 box-shadow:0 0 4px 2px #fff27a,0 0 10px 4px #ffd000,0 0 18px 6px rgba(255,170,0,.6);
 animation-name:sv-adot;animation-timing-function:cubic-bezier(.2,.75,.35,1);animation-iteration-count:2}
@keyframes sv-adot{0%{opacity:0;transform:rotate(var(--a)) translateX(30px) scale(.4)}20%{opacity:1}75%{opacity:1}100%{opacity:0;transform:rotate(var(--a)) translateX(var(--d)) scale(1)}}
.sv-hand{position:absolute;z-index:75;pointer-events:none;animation:sv-handIn .5s 1s ease-out both;transition:left .35s ease-out,top .35s ease-out}
.sv-hand.flip{transform:scaleX(-1)}
.sv-hand img{display:block;width:100%;height:auto;filter:drop-shadow(0 5px 5px rgba(0,0,0,.35));will-change:transform;animation:sv-handTap .55s 1s cubic-bezier(.45,0,.55,1) infinite alternate both}
@keyframes sv-handIn{from{opacity:0}to{opacity:1}}
@keyframes sv-handTap{from{transform:translate3d(0,0,0)}to{transform:translate3d(-8px,8px,0)}}
@keyframes sv-bump0{0%{transform:scale(1)}40%{transform:scale(1.12)}100%{transform:scale(1)}}
@keyframes sv-bump1{0%{transform:scale(1)}40%{transform:scale(1.12)}100%{transform:scale(1)}}
.sv-mini{position:absolute;transform:translate(-50%,-50%);font-family:'Titan One',sans-serif;font-size:72px;line-height:1;color:#ffd84a;
  text-shadow:0 5px 0 #b36b00,0 0 22px rgba(255,210,80,.85);animation:sv-miniUp 1.7s ease-out forwards;white-space:nowrap}
@keyframes sv-miniUp{0%{opacity:0;transform:translate(-50%,-30%) scale(.6)}15%{opacity:1;transform:translate(-50%,-50%) scale(1.12)}25%{transform:translate(-50%,-50%) scale(1)}70%{opacity:1}100%{opacity:0;transform:translate(-50%,-120%) scale(1)}}
.sv-minicoin{position:absolute;width:56px;height:56px;margin:-28px 0 0 -28px;opacity:0;filter:drop-shadow(0 3px 3px rgba(0,0,0,.3));
  animation:sv-miniFly .75s cubic-bezier(.5,0,.6,1) forwards}
@keyframes sv-miniFly{0%{opacity:0;transform:translate(0,0) scale(.5)}15%{opacity:1;transform:translate(0,-34px) scale(1)}90%{opacity:1}100%{opacity:0;transform:translate(var(--dx),var(--dy)) scale(.7)}}
.sv-dot{position:absolute;right:-6px;top:-8px;width:36px;height:36px;border-radius:50%;border:4px solid #fff;box-sizing:border-box;
 background:radial-gradient(circle at 35% 30%,#ff8a80,#e5221b 60%,#b3120d);box-shadow:0 3px 6px rgba(0,0,0,.4);
 animation:sv-dotIn .5s cubic-bezier(.25,1.6,.45,1) both,sv-dotPulse 1.6s .6s ease-in-out infinite}
@keyframes sv-dotIn{from{transform:scale(0)}to{transform:scale(1)}}
@keyframes sv-dotPulse{0%,100%{transform:scale(1)}50%{transform:scale(1.15)}}
.sv-vov{animation:sv-vin .3s ease-out;transition:opacity .4s ease-out;background:rgba(10,5,0,.8)}
.sv-vov.out{opacity:0}
@keyframes sv-vin{from{opacity:0}to{opacity:1}}
.sv-vcard{width:1040px;padding:30px}
.sv-vcard .sv-x{right:-36px;top:-36px;z-index:2}
.sv-video{display:block;width:100%;aspect-ratio:16/9;border-radius:24px;background:#000}
@media (prefers-reduced-motion: reduce){.sv-watch{animation:none;filter:drop-shadow(0 8px 8px rgba(0,0,0,.35))}}
@media (prefers-reduced-motion: reduce){.sv-animals.beacon{animation:sv-goldglow 1.3s ease-in-out infinite}.sv-sd,.sv-ss,.sv-st{display:none}.sv-halo{animation:none}.sv-animal,.sv-animal.egg,.sv-nametag,.sv-daily,.sv-animals.glow,.sv-hop.go,.sv-big.ready{animation:none}}
@media (prefers-reduced-motion: reduce){.sv-animal.mv-float,.sv-animal.mv-float.egg,.sv-animal.mv-still.fly,.sv-flyshadow{animation:none}}
`;

// One world's look = the shared page + that world's settings. Same timings + sounds for every world.
// Called ONCE per world when the file loads (so the page components keep the same identity).
export const makeLook = (L: LookSettings): WorldSkin => ({
  Loading: () => <Loading L={L} />,
  Page: ({ v }) => <Page v={v} L={L} />,
  makeSounds: () => ({}),          // click sound + effects live in the page
  music: L.music,
  musicVolume: 1,                  // the song files are already turned down (40%) = the approved preview loudness
  snd: { visit5: "", levelUp: "", rename: "" },
  levelUpMusic: null,
  renameMusic: null,
  completeDelayMs: 800,
  completeWaitsForLevelUp: false,
});
