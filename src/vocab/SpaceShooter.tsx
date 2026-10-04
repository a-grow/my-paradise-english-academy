// SPACE SHOOTER v2 (Andy 2026-10-04): new pixel-art look (public/vocab/space/), fills the whole window like the world
// page (a 1600x944 design field scaled to fit, then widened to the window), the grammar games' top bar with the Chinese
// target word + speaker in the middle, its own song (GamePage plays it while this game is open).
// SAME RULES as the old game (GameTest.tsx SpaceShooter, kept there as the fallback): shoot the UFO showing the English
// word for the Chinese word on top; a UFO that reaches the ship or a UFO shot that hits it = -1 life, then 3-2-1;
// all words cleared = win (treats paid by the win screen), time or lives out = lose screen.
// NEW: the robot UFOs drop slow shots straight down (dodge them); a pulsing HEART ORB floats down now and then while
// the kid has fewer than 5 lives - shoot it for +1 life. No explosions: a right UFO spins away happy, a wrong one fades.
import { useCallback, useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import GrammarGameBar from "@/components/GrammarGameBar";

type Diff = "easy" | "medium" | "hard";
type Cfg = { spawnMs: number; speedMult: number; timerSec: number; maxOnScreen: number };
type Unit = { vocab: string[]; chinese: Record<string, string> };

const ART = "/vocab/space";
export const SPACE_MUSIC = `${ART}/music2.mp3`; // Andy 20:32: 'arcade hero' song, levelled to ~-21.6 dB (10% under the world songs)
const FW = 1600, FH = 944;               // design field (under the 56px bar)
const SHIP_W = 86, UFO_W = 120, ORB_W = 72; // smaller (Andy 20:18) = farther to go
const MAX_LIVES = 5;
// UFO shots + heart orbs per difficulty (slow + rare on easy/medium - Andy 2026-10-04)
const EXTRA: Record<Diff, { shotMs: number; shotSpeed: number; orbMs: number }> = {
  easy: { shotMs: 5200, shotSpeed: 220, orbMs: 16000 },
  medium: { shotMs: 3800, shotSpeed: 290, orbMs: 20000 },
  hard: { shotMs: 2400, shotSpeed: 390, orbMs: 24000 },
};

// UFO falling speed per level (Andy 20:18: easy slower, medium faster, hard a little faster). Was the shared cfg.speedMult.
const FALL: Record<Diff, number> = { easy: 0.5, medium: 0.75, hard: 0.95 };
// Andy's sounds (trimmed copies in public/vocab/space; originals in BACKUPFILES/vocab_art/space/originals) + volume
const SND: Record<string, [string, number]> = {
  shoot: [`${ART}/snd_shoot.mp3`, 0.35], ufoshot: [`${ART}/snd_ufoshot.mp3`, 0.16],
  hit: [`${ART}/snd_hit.mp3`, 0.55], boom: [`${ART}/snd_boom.mp3`, 0.5],
};

// twinkling stars over the background picture: [x 0-1, y 0-1, size px, seconds, delay s, bright]
const STARS = (() => {
  let seed = 31;
  const r = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  return Array.from({ length: 22 }, (_, i) => [r(), r() * 0.8, 2.5 + r() * 3.5, 1.6 + r() * 2.6, -r() * 4, i % 4 === 0 ? 1 : 0]);
})();

// The computer voice: full volume, and the game music dips while it speaks (GamePage listens to 'mpe-duck') - Andy 20:32.
let sayN = 0;
const duck = (on: boolean) => window.dispatchEvent(new CustomEvent("mpe-duck", { detail: on }));
const speak = (text: string, lang: string) => {
  try {
    speechSynthesis.cancel();
    const n = ++sayN, u = new SpeechSynthesisUtterance(text);
    u.lang = lang; u.volume = 1;
    const up = () => { if (n === sayN) duck(false); };
    u.onend = up; u.onerror = up; window.setTimeout(up, 4000);
    duck(true); speechSynthesis.speak(u);
  } catch { /* */ }
};
// COINS floating in space (Andy 20:32): never more than 3 at a time; some are x2 / x3
const COIN_W = 52, COIN_MS = 3200;

// sounds: Andy's files (decoded once, can overlap) + small synth sounds; quiet when the bar's sound button is off
const useSfx = (on: boolean) => {
  const ctx = useRef<AudioContext | null>(null);
  const bufs = useRef<Record<string, AudioBuffer>>({});
  const onRef = useRef(on); onRef.current = on;
  const getCtx = () => {
    if (!ctx.current) ctx.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    if (ctx.current.state === "suspended") ctx.current.resume().catch(() => { });
    return ctx.current;
  };
  useEffect(() => {
    let dead = false;
    const c = getCtx();
    Object.entries(SND).forEach(([k, [url]]) => {
      fetch(url).then(r => r.arrayBuffer()).then(ab => c.decodeAudioData(ab)).then(buf => { if (!dead) bufs.current[k] = buf; }).catch(() => { });
    });
    return () => { dead = true; };
  }, []);
  return useCallback((type: "shoot" | "ufoshot" | "hit" | "boom" | "wrong" | "life" | "countdown" | "coin" | "shield") => {
    if (!onRef.current) return;
    try {
      const c = getCtx();
      const buf = bufs.current[type];
      if (buf) {
        const src = c.createBufferSource(), g = c.createGain();
        src.buffer = buf; g.gain.value = SND[type][1]; src.connect(g); g.connect(c.destination); src.start();
        return;
      }
      const osc = (f: number, t: number, d: number, v = 0.22, w: OscillatorType = "sine") => {
        const o = c.createOscillator(), g = c.createGain();
        o.connect(g); g.connect(c.destination); o.type = w; o.frequency.value = f;
        g.gain.setValueAtTime(v, c.currentTime + t); g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + t + d);
        o.start(c.currentTime + t); o.stop(c.currentTime + t + d + 0.01);
      };
      if (type === "wrong") { osc(220, 0, 0.25, 0.22, "sawtooth"); osc(160, 0.12, 0.2, 0.16, "sawtooth"); }
      if (type === "life") [784, 988, 1175, 1568].forEach((f, i) => osc(f, i * 0.08, 0.22, 0.2, "triangle"));
      if (type === "countdown") osc(460, 0, 0.16, 0.34, "square");
      if (type === "coin") { osc(988, 0, 0.08, 0.14, "square"); osc(1319, 0.07, 0.24, 0.14, "square"); }
      if (type === "shield") { // ricochet 'pi-yoong'
        const o = c.createOscillator(), g = c.createGain(); o.connect(g); g.connect(c.destination); o.type = "triangle";
        o.frequency.setValueAtTime(1500, c.currentTime); o.frequency.exponentialRampToValueAtTime(420, c.currentTime + 0.3);
        g.gain.setValueAtTime(0.26, c.currentTime); g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.32);
        o.start(c.currentTime); o.stop(c.currentTime + 0.33);
      }
    } catch { /* */ }
  }, []);
};

const Countdown = ({ onDone, sfx }: { onDone: () => void; sfx: (t: "countdown") => void }) => {
  const [n, setN] = useState(3);
  useEffect(() => {
    sfx("countdown");
    const iv = window.setInterval(() => setN(p => {
      if (p <= 1) { window.clearInterval(iv); window.setTimeout(onDone, 650); return 0; }
      sfx("countdown"); return p - 1;
    }), 950);
    return () => window.clearInterval(iv);
  }, []);
  return (
    <div className="ss-count">
      <div key={n} className={"ss-countn" + (n === 0 ? " go" : "")}>{n === 0 ? "GO!" : n}</div>
      <div className="ss-countsub">{n === 0 ? "Here we go!" : "Get ready..."}</div>
    </div>
  );
};

type Ufo = { id: number; x: number; y: number; word: string; idx: number; vy: number; shield?: number }; // shield = flashing until (ms)
type Bounce = { id: number; x: number; y: number; vx: number; vy: number };
type Pt = { id: number; x: number; y: number };
type Orb = { id: number; x0: number; x: number; y: number; t: number };
type Fx = { id: number; x: number; y: number; kind: "happy" | "wrong" | "life" | "coin" | "spark"; idx: number; word: string }; // coin: idx = value
type Coin = { id: number; x0: number; x: number; y: number; t: number; v: 1 | 2 | 3 };

const Play = ({ unit, diff, cfg, sfxOn, musicOn, onToggleMusic, onBack, onWin, onLose }: {
  unit: Unit; diff: Diff; cfg: Cfg; sfxOn: boolean; musicOn: boolean; onToggleMusic: () => void;
  onBack: () => void; onWin: (coins: number) => void; onLose: (reason: "timeout" | "lives") => void;
}) => {
  const sfx = useSfx(sfxOn);
  const X = EXTRA[diff];
  const TOTAL = unit.vocab.length;

  // field size: design 1600x944 scaled to fit, then widened/taller to fill the window (same as the world page)
  const calc = () => {
    const w = window.innerWidth || FW, h = Math.max(200, (window.innerHeight || FH + 56) - 56);
    const s = Math.min(w / FW, h / FH);
    return { s, sw: w / s, sh: h / s };
  };
  const [fit, setFit] = useState(calc);
  const fitRef = useRef(fit); fitRef.current = fit;
  useEffect(() => { const on = () => setFit(calc()); window.addEventListener("resize", on); return () => window.removeEventListener("resize", on); }, []);
  const shipTop = () => fitRef.current.sh - 235;

  const [, setTick] = useState(0);
  const [target, setTarget] = useState(unit.vocab[0]);
  const targetRef = useRef(target); targetRef.current = target;
  const [lives, setLives] = useState(MAX_LIVES);
  const livesRef = useRef(MAX_LIVES);
  const [solved, setSolved] = useState(0);
  const [coins, setCoins] = useState(0);   // collected this round (paid only on a WIN)
  const coinsRef = useRef(0);
  const [timeLeft, setTimeLeft] = useState(cfg.timerSec);
  const [ouch, setOuch] = useState(false);
  const [paused, setPaused] = useState(false);
  const pausedRef = useRef(false); pausedRef.current = paused;
  const [countdown, setCountdown] = useState(false);
  const [safe, setSafe] = useState(false); // blinking after the countdown (can't be hit)
  const doneRef = useRef(false);

  const g = useRef({ ufos: [] as Ufo[], shots: [] as Pt[], drops: [] as Pt[], bounces: [] as Bounce[], orb: null as Orb | null, fx: [] as Fx[], coins: [] as Coin[], lastCoin: -1700,
    shipX: FW / 2, id: 0, lastSpawn: 0, lastDrop: 0, lastOrb: 0, start: 0, lastShot: 0,
    cooldown: false, invincible: false, cleared: new Set<string>(), keys: new Set<string>() });

  const nextTarget = (cleared: Set<string>) => {
    const remaining = unit.vocab.filter(v => !cleared.has(v));
    if (!remaining.length) return;
    const others = remaining.filter(v => v !== targetRef.current);
    const pool = others.length ? others : remaining;
    setTarget(pool[Math.floor(Math.random() * pool.length)]);
  };

  const finish = (fn: () => void) => { if (doneRef.current) return; doneRef.current = true; fn(); };

  // timer
  useEffect(() => {
    if (paused) return;
    const t = window.setInterval(() => setTimeLeft(tl => {
      if (doneRef.current) return tl;
      if (tl <= 1) { finish(() => onLose("timeout")); return 0; }
      return tl - 1;
    }), 1000);
    return () => window.clearInterval(t);
  }, [paused]);

  const hurt = () => {
    const G = g.current;
    if (G.cooldown || G.invincible || doneRef.current) return;
    G.cooldown = true;
    sfx("hit");
    setOuch(true);
    livesRef.current--; setLives(livesRef.current);
    if (livesRef.current <= 0) { window.setTimeout(() => finish(() => onLose("lives")), 900); return; }
    // Andy 20:18: NO countdown - red shake, then the ship blinks ~2s (can't be hit) while the game keeps going
    G.invincible = true;
    window.setTimeout(() => { setOuch(false); setSafe(true); }, 500);
    window.setTimeout(() => { G.invincible = false; G.cooldown = false; setSafe(false); }, 2300);
  };

  const shoot = () => {
    const G = g.current;
    if (pausedRef.current || doneRef.current) return;
    const now = performance.now();
    if (now - G.lastShot < 200) return;
    G.lastShot = now;
    sfx("shoot");
    G.shots.push({ id: G.id++, x: G.shipX, y: shipTop() + 8 });
    addFx({ x: G.shipX, y: shipTop() + 4, kind: "spark", idx: 0, word: "" }); // quick sparkle at the nose
  };

  const addFx = (f: Omit<Fx, "id">) => {
    const G = g.current; const id = G.id++;
    G.fx.push({ ...f, id });
    window.setTimeout(() => { G.fx = G.fx.filter(x => x.id !== id); }, 950);
  };

  // main loop (stage px per second)
  useEffect(() => {
    let raf = 0, last = performance.now();
    const G = g.current;
    if (!G.start) { G.start = last; G.lastDrop = last; G.lastOrb = last; }
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      const { sw, sh } = fitRef.current;
      const top = sh - 235;
      if (!pausedRef.current && !doneRef.current) {
        // ship (arrow keys held)
        if (G.keys.has("ArrowLeft")) G.shipX -= sw * 0.42 * dt;
        if (G.keys.has("ArrowRight")) G.shipX += sw * 0.42 * dt;
        if (G.keys.has(" ")) shoot();
        G.shipX = Math.max(70, Math.min(sw - 70, G.shipX));
        // new UFO (same rules as the old game)
        if (now - G.lastSpawn > cfg.spawnMs && G.ufos.length < cfg.maxOnScreen) {
          G.lastSpawn = now;
          const onScreen = G.ufos.filter(a => a.word === targetRef.current).length;
          const force = onScreen === 0 && G.ufos.length >= Math.min(3, cfg.maxOnScreen - 1);
          const word = force ? targetRef.current : unit.vocab[Math.floor(Math.random() * unit.vocab.length)];
          let x = 110 + Math.random() * (sw - 220);
          for (let i = 0; i < 8 && G.ufos.some(a => Math.abs(a.x - x) < 160); i++) x = 110 + Math.random() * (sw - 220);
          G.ufos.push({ id: G.id++, x, y: -70, word, idx: Math.max(0, unit.vocab.indexOf(word)), vy: (0.055 + Math.random() * 0.04) * FALL[diff] * 0.6 * sh });
        }
        // UFOs move; one reaching the ship = hurt
        for (const a of G.ufos) a.y += a.vy * dt;
        const crash = G.ufos.find(a => a.y + 32 >= top + 20 && a.y < top + 110 && Math.abs(a.x - G.shipX) < 80);
        if (crash && !G.cooldown && !G.invincible) { // the UFO that bumped the ship fades away
          G.ufos = G.ufos.filter(a => a !== crash); addFx({ x: crash.x, y: crash.y, kind: "wrong", idx: crash.idx, word: crash.word }); hurt();
        }
        G.ufos = G.ufos.filter(a => a.y < sh + 90);
        // UFO shots: now and then one UFO drops a slow shot straight down
        if (now - G.start > 4000 && now - G.lastDrop > X.shotMs) {
          G.lastDrop = now;
          const can = G.ufos.filter(a => a.y > 40 && a.y < top - 260);
          if (can.length) { const a = can[Math.floor(Math.random() * can.length)]; G.drops.push({ id: G.id++, x: a.x, y: a.y + 42 }); sfx("ufoshot"); }
        }
        for (const d of G.drops) d.y += X.shotSpeed * dt;
        const hit = G.drops.find(d => Math.abs(d.x - G.shipX) < 34 && d.y > top + 15 && d.y < top + 110);
        if (hit) { G.drops = G.drops.filter(d => d !== hit); hurt(); }
        G.drops = G.drops.filter(d => d.y < sh + 30);
        // shots bounced back by a wrong UFO's shield: they can hit the ship too
        for (const d of G.bounces) { d.x += d.vx * dt; d.y += d.vy * dt; }
        const bh = G.bounces.find(d => Math.abs(d.x - G.shipX) < 34 && d.y > top + 15 && d.y < top + 110);
        if (bh) { G.bounces = G.bounces.filter(d => d !== bh); hurt(); }
        G.bounces = G.bounces.filter(d => d.y < sh + 30 && d.x > -40 && d.x < sw + 40);
        // heart orb: floats down slowly while the kid has fewer than 5 lives
        if (!G.orb && livesRef.current < MAX_LIVES && now - G.lastOrb > X.orbMs) {
          const x0 = 160 + Math.random() * (sw - 320);
          G.orb = { id: G.id++, x0, x: x0, y: -60, t: 0 };
        }
        if (G.orb) {
          G.orb.t += dt; G.orb.y += 70 * dt; G.orb.x = G.orb.x0 + Math.sin(G.orb.t * 1.3) * 60;
          if (G.orb.y > sh + 60) { G.orb = null; G.lastOrb = now; }
        }
        // coins drift down slowly with a gentle sway
        if (G.coins.length < 3 && now - G.lastCoin > COIN_MS) {
          G.lastCoin = now;
          const r = Math.random(), v = (r < 0.12 ? 3 : r < 0.35 ? 2 : 1) as 1 | 2 | 3;
          let x0 = 120 + Math.random() * (sw - 240);
          for (let i = 0; i < 6 && (G.ufos.some(a => Math.abs(a.x - x0) < 130 && a.y < 140) || G.coins.some(c => Math.abs(c.x0 - x0) < 160)); i++) x0 = 120 + Math.random() * (sw - 240);
          G.coins.push({ id: G.id++, x0, x: x0, y: -40, t: Math.random() * 6, v });
        }
        for (const c of G.coins) { c.t += dt; c.y += 55 * dt; c.x = c.x0 + Math.sin(c.t * 0.9) * 40; }
        G.coins = G.coins.filter(c => c.y < sh + 40);
        // a coin that touches the ship is caught too (Andy 20:41)
        const caught = G.coins.filter(c => Math.abs(c.x - G.shipX) < 58 && c.y > top - 12 && c.y < top + 110);
        for (const cn of caught) {
          G.coins = G.coins.filter(c => c !== cn);
          coinsRef.current += cn.v; setCoins(coinsRef.current); sfx("coin");
          addFx({ x: cn.x, y: cn.y, kind: "coin", idx: cn.v, word: "" });
        }
        // kid's shots
        for (const b of G.shots) b.y -= 1100 * dt;
        for (const b of [...G.shots]) {
          if (G.orb && Math.hypot(b.x - G.orb.x, b.y - G.orb.y) < ORB_W * 0.62) {
            addFx({ x: G.orb.x, y: G.orb.y, kind: "life", idx: 0, word: "" });
            G.orb = null; G.lastOrb = now; G.shots = G.shots.filter(s => s !== b);
            livesRef.current = Math.min(MAX_LIVES, livesRef.current + 1); setLives(livesRef.current); sfx("life");
            continue;
          }
          const cn = G.coins.find(c => Math.hypot(b.x - c.x, b.y - c.y) < COIN_W * (c.v > 1 ? 0.75 : 0.65));
          if (cn) {
            G.coins = G.coins.filter(c => c !== cn); G.shots = G.shots.filter(s => s !== b);
            coinsRef.current += cn.v; setCoins(coinsRef.current); sfx("coin");
            addFx({ x: cn.x, y: cn.y, kind: "coin", idx: cn.v, word: "" });
            continue;
          }
          const u = G.ufos.find(a => Math.abs(a.x - b.x) < UFO_W * 0.48 && Math.abs(a.y - b.y) < 50);
          if (!u) continue;
          G.shots = G.shots.filter(s => s !== b);
          if (u.word === targetRef.current) {
            G.ufos = G.ufos.filter(a => a !== u);
            addFx({ x: u.x, y: u.y, kind: "happy", idx: u.idx, word: u.word });
            sfx("boom"); speak(u.word, "en-US");
            G.cleared = new Set([...G.cleared, u.word]); setSolved(G.cleared.size);
            if (G.cleared.size >= TOTAL) window.setTimeout(() => finish(() => onWin(coinsRef.current)), 600);
            else window.setTimeout(() => nextTarget(G.cleared), 150);
          } else {
            // WRONG UFO (Andy 20:47): shield on - it turns and flashes bright red, and the shot bounces back down
            // toward the ship (aimed near it, not always at it)
            u.shield = now + 700;
            const tx = G.shipX + (Math.random() - 0.5) * 240, sy = u.y + 40, vy = 470;
            const t2 = Math.max(0.55, (top + 50 - sy) / vy);
            G.bounces.push({ id: G.id++, x: b.x, y: sy, vx: (tx - b.x) / t2, vy });
            sfx("shield"); sfx("wrong");
          }
        }
        G.shots = G.shots.filter(b => b.y > -40);
      }
      setTick(t => (t + 1) % 1000000);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  // keyboard: arrows move, space shoots (held = repeats)
  useEffect(() => {
    const G = g.current;
    const dn = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" || e.key === "ArrowRight" || e.key === " ") e.preventDefault();
      if (!G.keys.has(e.key) && e.key === "ArrowLeft") G.shipX -= fitRef.current.sw * 0.02;
      if (!G.keys.has(e.key) && e.key === "ArrowRight") G.shipX += fitRef.current.sw * 0.02;
      G.keys.add(e.key);
    };
    const up = (e: KeyboardEvent) => G.keys.delete(e.key);
    window.addEventListener("keydown", dn); window.addEventListener("keyup", up);
    return () => { window.removeEventListener("keydown", dn); window.removeEventListener("keyup", up); };
  }, []);

  const fieldRef = useRef<HTMLDivElement>(null);
  const touchX = (e: React.TouchEvent) => {
    const r = fieldRef.current?.getBoundingClientRect(); if (!r) return;
    g.current.shipX = (e.touches[0].clientX - r.left) / fitRef.current.s;
  };
  const isTouch = typeof window !== "undefined" && "ontouchstart" in window;
  const hold = (dir: number) => (e: React.TouchEvent<HTMLButtonElement>) => {
    e.stopPropagation(); const k = dir < 0 ? "ArrowLeft" : "ArrowRight";
    if (e.type === "touchstart") g.current.keys.add(k); else g.current.keys.delete(k);
  };

  const G = g.current;
  const { s, sw, sh } = fit;
  const top = sh - 235;
  const zh = unit.chinese[target] || target;
  return (
    <div className="ss-page">
      <style>{CSS}</style>
      <GrammarGameBar onBack={onBack} muted={!musicOn} onToggleMute={onToggleMusic}
        stats={{ coins, lives, solved, total: TOTAL }} time={timeLeft}
        center={
          <span className="ss-target">
            <span className="ss-zh">{zh}</span>
            <button className="ss-say" aria-label="Say it" onClick={e => { e.stopPropagation(); speak(zh.split("/")[0].trim(), "zh-TW"); }}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 5 6 9H3v6h3l5 4V5z" fill="#fff" /><path d="M15.5 8.5a5 5 0 0 1 0 7" /><path d="M18.5 5.5a9 9 0 0 1 0 13" />
              </svg>
            </button>
          </span>
        } />
      <div className="ss-field" ref={fieldRef} onTouchMove={touchX} onTouchEnd={() => shoot()}>
        <div className="ss-stage" style={{ width: sw, height: sh, transform: `scale(${s})` }}>
          {STARS.map((t, i) => (
            <i key={i} className={"ss-star" + (t[5] ? " big" : "")} style={{ left: t[0] * sw, top: t[1] * sh, width: t[2], height: t[2],
              margin: -t[2] / 2, animationDuration: `${t[3]}s`, animationDelay: `${t[4]}s` }} />
          ))}
          {G.ufos.map(a => (
            <div key={a.id} className={"ss-ufo" + (a.shield && a.shield > performance.now() ? " shield" : "")} style={{ left: a.x, top: a.y }}>
              <div className="ss-bob">
                {a.shield && a.shield > performance.now() && <b className="ss-shieldring" />}
                <img src={`${ART}/ufo-${(a.idx % 6) + 1}.webp`} alt="" style={{ width: UFO_W }} draggable={false} />
                <div className="ss-sign">{a.word}</div>
              </div>
            </div>
          ))}
          {G.orb && (
            <div className="ss-orb" style={{ left: G.orb.x, top: G.orb.y }}>
              <img src={`${ART}/heart-orb.webp`} alt="" style={{ width: ORB_W }} draggable={false} />
            </div>
          )}
          {G.coins.map(c => (
            <div key={c.id} className="ss-coin" style={{ left: c.x, top: c.y }}>
              <img src="/worlds/ui/coin.webp" alt="" style={{ width: c.v > 1 ? COIN_W * 1.15 : COIN_W }} draggable={false} />
              {c.v > 1 && <b>{"\u00d7"}{c.v}</b>}
            </div>
          ))}
          {G.drops.map(d => <i key={d.id} className="ss-drop" style={{ left: d.x, top: d.y }} />)}
          {G.bounces.map(d => <i key={d.id} className="ss-bounce" style={{ left: d.x, top: d.y }} />)}
          {G.shots.map(b => <i key={b.id} className="ss-shot" style={{ left: b.x, top: b.y }} />)}
          {G.fx.map(f => f.kind === "life"
            ? <div key={f.id} className="ss-fx life" style={{ left: f.x, top: f.y }}><img src={`${ART}/heart-orb.webp`} alt="" style={{ width: ORB_W }} /><b>+1</b></div>
            : f.kind === "coin"
            ? <div key={f.id} className="ss-fx coin" style={{ left: f.x, top: f.y }}><img src="/worlds/ui/coin.webp" alt="" style={{ width: COIN_W }} /><b>+{f.idx}</b>
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(k => <i key={k} style={{ ["--a" as string]: `${k * 36 + 10}deg` } as CSSProperties} />)}</div>
            : f.kind === "spark"
            ? <div key={f.id} className="ss-fx spark" style={{ left: f.x, top: f.y }}>{[0, 1, 2, 3, 4, 5].map(k => <i key={k} style={{ ["--a" as string]: `${-160 + k * 28}deg` } as CSSProperties} />)}</div>
            : (
              <div key={f.id} className={"ss-fx " + f.kind} style={{ left: f.x, top: f.y }}>
                <img src={`${ART}/ufo-${(f.idx % 6) + 1}.webp`} alt="" style={{ width: UFO_W }} />
                {f.kind === "happy" && [0, 1, 2, 3, 4, 5, 6, 7].map(k => <i key={k} style={{ ["--a" as string]: `${k * 45 + 20}deg` } as CSSProperties} />)}
              </div>
            ))}
          <div className={"ss-ship" + (ouch ? " ouch" : safe ? " safe" : "")} style={{ left: G.shipX, top }}>
            <img className="f1" src={`${ART}/ship-1.webp`} alt="" style={{ width: SHIP_W }} draggable={false} />
            <img className="f2" src={`${ART}/ship-2.webp`} alt="" style={{ width: SHIP_W }} draggable={false} />
          </div>
          {!isTouch && (
            <div className="ss-help">
              <div>{"← →"} Move Ship {" • "} Space to Shoot!</div>
              <div className="zh">{"← →"} 移動太空船 • 空白鍵射擊！</div>
            </div>
          )}
        </div>
        {isTouch && (
          <div className="ss-pads">
            <button onTouchStart={hold(-1)} onTouchEnd={hold(-1)}>{"◀"}</button>
            <button onTouchStart={hold(1)} onTouchEnd={hold(1)}>{"▶"}</button>
          </div>
        )}
      </div>
      {countdown && <Countdown sfx={sfx} onDone={() => {
        const G2 = g.current, t2 = shipTop();
        setCountdown(false); setPaused(false);
        G2.ufos = G2.ufos.filter(a => !(a.y > t2 - 300 && Math.abs(a.x - G2.shipX) < 320));
        G2.drops = []; G2.cooldown = false;
        G2.invincible = true; setSafe(true);
        window.setTimeout(() => { G2.invincible = false; setSafe(false); }, 2500);
      }} />}
    </div>
  );
};

// Outer: keeps the result (win / lose) and restarts the game by remounting it.
export default function SpaceShooter2({ unit, diff, cfg, sfxOn = true, musicOn, onToggleMusic, onMusicTrack, onBack, onRestart, getCoinTotal, renderWin, renderLose }: {
  unit: Unit; diff: Diff; cfg: Cfg; sfxOn?: boolean; musicOn: boolean; onToggleMusic: () => void;
  onMusicTrack?: (src: string | null) => void; onBack: () => void; onRestart?: () => void;
  getCoinTotal?: () => Promise<number | null | undefined>;   // the kid's coins before this round (win screen pill)
  renderWin: (restart: () => void, coinsWon: number, coinStart: number) => ReactNode; renderLose: (reason: "timeout" | "lives", restart: () => void) => ReactNode;
}) {
  const [run, setRun] = useState(0);
  const [coinsWon, setCoinsWon] = useState(0);
  const [coinStart, setCoinStart] = useState(0);
  useEffect(() => { getCoinTotal?.().then(t => { if (typeof t === "number") setCoinStart(t); }); }, [run]);
  const [result, setResult] = useState<null | "win" | "timeout" | "lives">(null);
  useEffect(() => () => onMusicTrack?.(null), []);                          // leaving the game: back to the arcade song
  useEffect(() => { onMusicTrack?.(result ? "" : SPACE_MUSIC); }, [result]); // win / lose screen: game music stops (Andy 20:41)
  useEffect(() => { // fonts: VT323 (green computer letters on the UFO signs)
    if (document.getElementById("mpe-font-vt323")) return;
    const l = document.createElement("link"); l.id = "mpe-font-vt323"; l.rel = "stylesheet";
    l.href = "https://fonts.googleapis.com/css2?family=VT323&display=swap"; document.head.appendChild(l);
  }, []);
  const restart = () => { onRestart?.(); setResult(null); setRun(r => r + 1); };
  if (result === "win") return <>{renderWin(restart, coinsWon, coinStart)}</>;
  if (result) return <>{renderLose(result, restart)}</>;
  return <Play key={run} unit={unit} diff={diff} cfg={cfg} sfxOn={sfxOn && musicOn} musicOn={musicOn} onToggleMusic={onToggleMusic}
    onBack={onBack} onWin={c => { setCoinsWon(c); setResult("win"); }} onLose={r => setResult(r)} />;
}

const CSS = `
.ss-page{position:fixed;inset:0;display:flex;flex-direction:column;background:#03030f;user-select:none;-webkit-user-select:none;-webkit-touch-callout:none;overflow:hidden}
.ss-field{position:relative;flex:1;overflow:hidden;background:#04040f url(${ART}/bg.webp) center/cover no-repeat}
.ss-stage{position:absolute;left:0;top:0;transform-origin:0 0}
.ss-target{display:flex;align-items:center;gap:8px;background:rgba(0,0,20,.6);border:1.5px solid rgba(0,255,255,.3);border-radius:999px;padding:2px 10px 2px 22px}
.ss-zh{font-family:'Nunito',sans-serif;font-weight:900;font-size:30px;line-height:1.2;color:#00ffff;white-space:nowrap}
.ss-say{background:none;border:none;cursor:pointer;padding:4px;display:flex}
.ss-star{position:absolute;border-radius:50%;background:#fffef0;box-shadow:0 0 4px 1px #fff8c8,0 0 9px 2px rgba(190,220,255,.55);animation:ss-tw ease-in-out infinite;pointer-events:none}
.ss-star.big{box-shadow:0 0 5px 2px #fffbe0,0 0 14px 5px rgba(200,225,255,.7),0 0 26px 8px rgba(160,200,255,.35)}
@keyframes ss-tw{0%,100%{opacity:.25;transform:scale(.7)}50%{opacity:1;transform:scale(1.25)}}
.ss-ufo{position:absolute;transform:translate(-50%,-50%);pointer-events:none}
.ss-ufo .ss-bob{position:relative}
.ss-ufo.shield .ss-bob{animation:ss-turn .7s ease-out}
@keyframes ss-turn{0%{transform:rotate(0)}20%{transform:rotate(-16deg)}50%{transform:rotate(13deg)}78%{transform:rotate(-5deg)}100%{transform:rotate(0)}}
.ss-ufo.shield img{animation:ss-red .14s steps(1) infinite}
@keyframes ss-red{0%{filter:brightness(1.5) sepia(1) saturate(8) hue-rotate(-45deg) drop-shadow(0 0 12px #ff2a2a) drop-shadow(0 0 26px #ff0000)}
 50%{filter:brightness(2.1) sepia(1) saturate(10) hue-rotate(-45deg) drop-shadow(0 0 18px #ff5050) drop-shadow(0 0 40px #ff1010)}}
.ss-shieldring{position:absolute;left:50%;top:36%;width:156px;height:132px;margin:-66px 0 0 -78px;border-radius:50%;pointer-events:none;z-index:2;
 background:radial-gradient(closest-side,rgba(255,60,60,0) 58%,rgba(255,90,90,.45) 80%,rgba(255,220,220,.95) 95%,rgba(255,60,60,0) 100%);
 box-shadow:0 0 22px 8px rgba(255,40,40,.75);animation:ss-ring .7s ease-out forwards}
@keyframes ss-ring{0%{opacity:0;transform:scale(.6)}18%{opacity:1;transform:scale(1.06)}100%{opacity:0;transform:scale(1.18)}}
.ss-bounce{position:absolute;width:16px;height:16px;margin:-8px 0 0 -8px;border-radius:50%;pointer-events:none;
 background:radial-gradient(circle,#fff 0%,#ffe08a 35%,#ff5a3c 78%);box-shadow:0 0 8px 3px rgba(255,90,60,.95),0 0 20px 7px rgba(255,50,30,.55)}
.ss-bob{display:flex;flex-direction:column;align-items:center;animation:ss-bob 1.6s ease-in-out infinite}
@keyframes ss-bob{0%,100%{transform:translateY(0) rotate(-2deg)}50%{transform:translateY(-8px) rotate(2deg)}}
.ss-ufo img{display:block}
.ss-sign{margin-top:2px;padding:0 11px;background:#000;border:3px solid #c8d0d8;border-radius:8px;white-space:nowrap;
 box-shadow:inset 0 0 0 1px #6b737c,0 0 0 1px #3a4047,0 3px 6px rgba(0,0,0,.6);
 font-family:'VT323',monospace;font-size:30px;line-height:30px;color:#39ff6a;text-shadow:0 0 6px rgba(57,255,106,.75)}
.ss-orb{position:absolute;transform:translate(-50%,-50%);pointer-events:none}
.ss-orb img{display:block;animation:ss-pulse 1.1s ease-in-out infinite;filter:drop-shadow(0 0 10px rgba(255,140,120,.8))}
@keyframes ss-pulse{0%,100%{transform:scale(.9)}50%{transform:scale(1.1);filter:drop-shadow(0 0 18px rgba(255,170,140,1))}}
.ss-drop{position:absolute;width:26px;height:26px;margin:-13px 0 0 -13px;border-radius:50%;pointer-events:none;
 background:radial-gradient(circle at 42% 38%,#fff 0%,#fff 18%,#ffd2ff 34%,#e07bff 62%,#9b3cf0 100%);
 box-shadow:0 0 6px 2px #fff,0 0 14px 6px #f2a6ff,0 0 28px 12px rgba(205,95,255,.85),0 0 46px 18px rgba(170,60,255,.45);animation:ss-dp .5s ease-in-out infinite} /* brighter (Andy 20:41) */
.ss-fx.coin i,.ss-fx.spark i{position:absolute;left:0;top:0;border-radius:50%;background:#fffde6;box-shadow:0 0 3px 1px #fff27a,0 0 9px 3px #ffd000}
.ss-fx.coin i{width:9px;height:9px;margin:-4.5px;animation:ss-dot .55s ease-out forwards}
.ss-fx.spark i{width:6px;height:6px;margin:-3px;animation:ss-spk .32s ease-out forwards}
@keyframes ss-spk{0%{opacity:1;transform:rotate(var(--a)) translateX(4px) scale(1.2)}100%{opacity:0;transform:rotate(var(--a)) translateX(34px) scale(.3)}}
@keyframes ss-dp{0%,100%{transform:scale(.9)}50%{transform:scale(1.12)}}
.ss-shot{position:absolute;width:10px;height:28px;margin:-14px 0 0 -5px;border-radius:5px;pointer-events:none;
 background:linear-gradient(180deg,#fffbe0,#ffd84a 45%,#ff9a1f);box-shadow:0 0 10px 3px rgba(255,210,70,.85)}
.ss-ship{position:absolute;transform:translateX(-50%);pointer-events:none}
.ss-ship img{display:block}
.ss-ship .f2{position:absolute;left:0;top:0}
.ss-ship .f1{animation:ss-f1 .22s steps(1) infinite}.ss-ship .f2{animation:ss-f2 .22s steps(1) infinite}
@keyframes ss-f1{0%{opacity:1}50%{opacity:0}}@keyframes ss-f2{0%{opacity:0}50%{opacity:1}}
.ss-ship.ouch{animation:ss-ouch .14s linear infinite}
@keyframes ss-ouch{0%,100%{transform:translateX(-50%);filter:none}25%{transform:translateX(calc(-50% - 7px));filter:drop-shadow(0 0 14px #ff3b3b) brightness(1.4)}75%{transform:translateX(calc(-50% + 7px));filter:drop-shadow(0 0 14px #ff3b3b) brightness(1.4)}}
.ss-ship.safe{animation:ss-safe .3s steps(1) infinite}
@keyframes ss-safe{0%{opacity:1}50%{opacity:.35}}
.ss-fx{position:absolute;pointer-events:none}
.ss-fx img{position:absolute;left:0;top:0;transform:translate(-50%,-50%)}
.ss-fx.happy img{animation:ss-happy .9s ease-in forwards}
@keyframes ss-happy{0%{transform:translate(-50%,-50%) rotate(0) scale(1);opacity:1}100%{transform:translate(-50%,-260px) rotate(360deg) scale(.35);opacity:0}}
.ss-fx.happy i{position:absolute;left:0;top:0;width:10px;height:10px;margin:-5px;border-radius:50%;background:#fffde6;
 box-shadow:0 0 3px 1px #fff27a,0 0 9px 3px #ffd000;animation:ss-dot .8s ease-out forwards}
@keyframes ss-dot{0%{opacity:1;transform:rotate(var(--a)) translateX(10px) scale(1.2)}100%{opacity:0;transform:rotate(var(--a)) translateX(110px) scale(.4)}}
.ss-fx.wrong img{animation:ss-wrong .7s ease-out forwards}
@keyframes ss-wrong{0%{transform:translate(-50%,-50%);filter:none;opacity:1}20%{transform:translate(calc(-50% - 10px),-50%)}40%{transform:translate(calc(-50% + 10px),-50%);filter:grayscale(1) brightness(.7)}100%{transform:translate(-50%,-50%) scale(.8);filter:grayscale(1) brightness(.6);opacity:0}}
.ss-fx.life img{animation:ss-life .9s ease-out forwards}
@keyframes ss-life{0%{transform:translate(-50%,-50%) scale(1);opacity:1}100%{transform:translate(-50%,-50%) scale(2.2);opacity:0}}
.ss-fx.life b{position:absolute;left:0;top:0;transform:translate(-50%,-50%);font-family:'Nunito',sans-serif;font-weight:900;font-size:48px;color:#ff8a8a;
 text-shadow:0 0 10px rgba(255,120,120,.9),0 3px 0 #7a1020;animation:ss-plus .9s ease-out forwards}
@keyframes ss-plus{0%{transform:translate(-50%,-50%) scale(.5);opacity:0}25%{opacity:1;transform:translate(-50%,-80%) scale(1.1)}100%{transform:translate(-50%,-180%) scale(1);opacity:0}}
.ss-help{position:absolute;left:0;right:0;bottom:14px;text-align:center;color:#fbbf24;font-family:'Fredoka One','Nunito',sans-serif;font-size:24px;pointer-events:none;text-shadow:0 2px 4px rgba(0,0,0,.8)}
.ss-help .zh{font-family:'Nunito',sans-serif;font-size:20px;margin-top:2px}
.ss-pads{position:absolute;left:0;right:0;bottom:10px;display:flex;justify-content:center;gap:24px}
.ss-pads button{width:84px;height:52px;border-radius:16px;background:rgba(255,255,255,.15);border:2px solid rgba(255,255,255,.4);color:#fff;font-size:28px;user-select:none}
.ss-count{position:fixed;inset:0;z-index:200;background:rgba(0,0,0,.6);display:flex;flex-direction:column;align-items:center;justify-content:center}
.ss-countn{font-family:'Nunito',sans-serif;font-weight:900;font-size:144px;line-height:1;color:#fbbf24;text-shadow:0 0 70px rgba(251,191,36,.9);animation:ss-cp .4s cubic-bezier(.34,1.56,.64,1)}
.ss-countn.go{font-size:80px;color:#4ade80;text-shadow:0 0 70px rgba(74,222,128,.9)}
.ss-countsub{font-family:'Nunito',sans-serif;font-weight:700;font-size:18px;color:rgba(255,255,255,.55);margin-top:12px}
@keyframes ss-cp{0%{transform:scale(.3);opacity:0}100%{transform:scale(1);opacity:1}}
.ss-coin{position:absolute;transform:translate(-50%,-50%);pointer-events:none}
.ss-coin img{display:block;animation:ss-spin 1.8s ease-in-out infinite;filter:drop-shadow(0 0 8px rgba(255,210,60,.75))}
@keyframes ss-spin{0%,100%{transform:scaleX(1)}50%{transform:scaleX(.6)}}
.ss-coin b{position:absolute;left:64%;top:46%;font-family:'Fredoka','Nunito',sans-serif;font-weight:800;font-size:26px;color:#fff;white-space:nowrap;
 text-shadow:-2px -2px 0 #7a3f08,2px -2px 0 #7a3f08,-2px 2px 0 #7a3f08,2px 2px 0 #7a3f08,0 3px 0 #7a3f08}
.ss-fx.coin img{animation:ss-coinpop .7s ease-out forwards}
@keyframes ss-coinpop{0%{transform:translate(-50%,-50%) scale(1);opacity:1}100%{transform:translate(-50%,-90%) scale(1.5);opacity:0}}
.ss-fx.coin b{position:absolute;left:0;top:0;transform:translate(-50%,-50%);font-family:'Fredoka','Nunito',sans-serif;font-weight:800;font-size:44px;color:#ffd84a;
 text-shadow:-2px -2px 0 #7a3f08,2px -2px 0 #7a3f08,-2px 2px 0 #7a3f08,2px 2px 0 #7a3f08,0 4px 0 #7a3f08;animation:ss-plus .9s ease-out forwards}
@media (prefers-reduced-motion: reduce){.ss-star,.ss-bob,.ss-orb img,.ss-drop,.ss-coin img{animation:none}}
`;
