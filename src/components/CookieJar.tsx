/* CookieJar - the new treat jar (MPE 2.0). Self-contained and VISUAL ONLY (saves nothing).
   Give it the kid's treat count; it animates every change after it first appears:
   - count goes UP   -> cookies drop in through the lid (chime, sparkles + golden halo, jar hops and dances)
   - count goes DOWN -> a cookie jumps out (feed: one happy hop + boing)
   The jar SHOWS at most 16 cookies. The real count is never capped - past 16 new cookies still fall in and slip
   behind the pile. The parent shows the number itself.
   Mount it only once the real count is known (e.g. after the cloud answers): the FIRST value is drawn without
   animation, every later change is animated. Big jumps animate at most 20 falling cookies (the count is still exact).
   Logic + art + sounds copied from the "Cookie Jar Sandbox" artifact (V1-V12, Andy 2026-09-28/29).
   Files: public/cookiejar/ (jar_back, jar_front, jar_lid, jar_mask, cookie .webp + 8 snd_*.mp3). */
import { useEffect, useRef, type CSSProperties } from "react";

const W = 546, H = 702;                  // jar art size (all 4 jar layers share this canvas)
const LIFT = 160, PADX = 130;            // room above / beside the jar so it can hop and dance without being cut off
const LID_Y = 0.2948717948717949 * H;    // where the lid sits
const MAX = 16;                          // most cookies drawn in the pile
const MAX_ANIMATED = 20;                 // most falling cookies for one big jump
const DIR = "/cookiejar/";
const SOUNDS: Record<string, string> = {
  open: "snd_open.mp3", close: "snd_close.mp3", drop1: "snd_drop1.mp3", drop2: "snd_drop2.mp3",
  many: "snd_many.mp3", chime: "snd_chime.mp3", jump: "snd_jump.mp3", tink: "snd_tink.mp3",
};

// Pile spots (fractions of the jar): x centre, y = bottom of the cookie, resting tilt in degrees.
// Row 1 lies flat on the jar floor; the top row reaches up into the neck.
const SLOTS = [
  [.25, .918, 2], [.50, .922, -1], [.75, .918, 3],
  [.22, .835, 16], [.47, .835, -8], [.72, .835, 14],
  [.33, .748, -18], [.57, .748, 12], [.78, .748, -24],
  [.22, .662, 24], [.45, .662, -10], [.68, .662, 16],
  [.36, .572, -14], [.62, .572, 18],
  [.41, .482, 8], [.61, .476, -10],
].map((s, i) => ({ x: s[0] * W, y: s[1] * H, rot: s[2] * Math.PI / 180, mirror: i % 2 === 1, scale: 0.94 + ((i * 37) % 11) / 100 }));
const TOP = SLOTS.length - 1;
// BACK WALL (Andy 2026-09-29): 3 cookies drawn BEHIND the pile once its top row is full, so cookies that
// fall in behind a full pile can't be seen through the gaps / bite marks. Hidden by the pile except in those gaps.
const BACK = [[.50, .56, 0, false], [.42, .70, 8, false], [.63, .82, -6, true]]
  .map(b => ({ x: (b[0] as number) * W, y: (b[1] as number) * H, rot: (b[2] as number) * Math.PI / 180, mirror: b[3] as boolean }));

const CSS = `
.cj-stage { position: relative; display: flex; flex-direction: column; align-items: center; }
.cj-stage canvas { width: ${(100 * (W + 2 * PADX) / W).toFixed(3)}%; max-width: none; height: auto; display: block; position: relative; z-index: 1; flex: none; }
.cj-halo { position: absolute; left: -38%; right: -38%; top: -12%; bottom: 2%; z-index: 0; border-radius: 50%; pointer-events: none;
  background: radial-gradient(closest-side, rgba(255,222,110,.85), rgba(255,200,60,.45) 45%, rgba(255,200,60,0));
  opacity: 0; transform: scale(.85); transition: opacity .35s ease, transform .35s ease; }
.cj-stage.cj-shine .cj-halo { opacity: 1; transform: scale(1); animation: cj-halo 1.6s ease-in-out infinite; }
.cj-tw { position: absolute; inset: 0; z-index: 2; pointer-events: none; opacity: 0; transition: opacity .4s ease; }
.cj-stage.cj-shine .cj-tw { opacity: 1; }
.cj-tw i { position: absolute; border-radius: 50%; opacity: 0; animation: cj-twinkle 1.4s ease-in-out infinite both;
  background: radial-gradient(circle, #fff 0%, #fff6b0 35%, rgba(255,210,80,0) 70%); }
.cj-tw i.cj-st { border-radius: 0; background: #fffbe0; filter: drop-shadow(0 0 8px #ffd84a) drop-shadow(0 0 3px #fff);
  clip-path: polygon(50% 0,61% 39%,100% 50%,61% 61%,50% 100%,39% 61%,0 50%,39% 39%); }
@keyframes cj-twinkle { 0%,100% { opacity: 0; transform: scale(.3) rotate(0deg); } 50% { opacity: 1; transform: scale(1.35) rotate(45deg); } }
@keyframes cj-halo { 0%,100% { opacity: .75; transform: scale(.96); } 50% { opacity: 1; transform: scale(1.04); } }
@media (prefers-reduced-motion: reduce) { .cj-tw i, .cj-stage.cj-shine .cj-halo { animation: none; } .cj-tw i { opacity: .9; } }
`;

// 28 twinkles in a ring around the jar (every 3rd one is a 4-point star)
const TWINKLES = Array.from({ length: 28 }, (_, i) => {
  const a = (i / 28) * Math.PI * 2 + (i % 3) * 0.13;
  const star = i % 3 === 0, size = (14 + ((i * 7) % 13)) * (star ? 2.1 : 1);
  return {
    star,
    style: {
      left: `${50 + Math.cos(a) * (50 + ((i * 37) % 17))}%`, top: `${55 + Math.sin(a) * (38 + ((i * 53) % 11))}%`,
      width: size, height: size, marginLeft: -size / 2, marginTop: -size / 2, animationDelay: `${(i * 173) % 1400}ms`,
    },
  };
});

type Engine = { earn: (n: number) => void; feed: (n: number) => void; destroy: () => void };

function makeEngine(cv: HTMLCanvasElement, stage: HTMLDivElement, startCount: number, isMuted: () => boolean): Engine {
  cv.width = W + 2 * PADX; cv.height = H + LIFT;
  const ctx = cv.getContext("2d")!;
  const off = document.createElement("canvas"); off.width = W; off.height = H;
  const octx = off.getContext("2d")!;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let dead = false;
  const timers: number[] = [];
  const later = (fn: () => void, ms: number) => { timers.push(window.setTimeout(() => { if (!dead) fn(); }, ms)); };

  // ---------- sound (Web Audio; starts after the first tap/key anywhere on the page) ----------
  let actx: AudioContext | null = null;
  const RAW: Record<string, Promise<ArrayBuffer | null>> = {};
  for (const k in SOUNDS) RAW[k] = fetch(DIR + SOUNDS[k]).then(r => (r.ok ? r.arrayBuffer() : null)).catch(() => null);
  const BUF: Record<string, AudioBuffer> = {};
  function unlockAudio() {
    if (dead) return;
    if (!actx) {
      const AC = window.AudioContext || (window as any).webkitAudioContext; if (!AC) return;
      actx = new AC();
      for (const k in RAW) RAW[k].then(ab => {
        if (!ab || !actx) return;
        new Promise<AudioBuffer>((res, rej) => { const p = actx!.decodeAudioData(ab, res, rej); if (p && (p as any).catch) (p as any).catch(rej); })
          .then(b => { BUF[k] = b; }).catch(() => {});
      });
    }
    if (actx.state === "suspended") actx.resume().catch(() => {});
  }
  document.addEventListener("pointerdown", unlockAudio);
  document.addEventListener("keydown", unlockAudio);
  function play(name: string, gain = 1, rate = 1) {
    if (isMuted() || !actx || !BUF[name]) return null;
    const src = actx.createBufferSource(); src.buffer = BUF[name]; src.playbackRate.value = rate;
    const g = actx.createGain(); g.gain.value = gain;
    src.connect(g).connect(actx.destination); src.start();
    return { src, g };
  }
  let dropFlip = false;
  function dropSound(gain = 1) { dropFlip = !dropFlip; play(dropFlip ? "drop1" : "drop2", 0.33 * gain * (dropFlip ? 1 : 1.5), 0.9 + Math.random() * 0.22); }
  const tinks: { src: AudioBufferSourceNode; g: GainNode }[] = []; let lastTink = 0;
  function tink(gain: number) { // subtle glass tink, never more than one every 90ms, slightly different pitch each time
    const now = performance.now(); if (now - lastTink < 90) return; lastTink = now;
    const h = play("tink", gain, 0.92 + Math.random() * 0.3);
    if (h) { tinks.push(h); h.src.onended = () => { const i = tinks.indexOf(h); if (i >= 0) tinks.splice(i, 1); }; }
  }
  function stopTinks() { // the jar is still: fade out any tink that is still ringing
    if (!actx) return;
    for (const h of tinks) { try { const t = actx.currentTime; h.g.gain.cancelScheduledValues(t); h.g.gain.setValueAtTime(h.g.gain.value, t); h.g.gain.linearRampToValueAtTime(0, t + 0.08); h.src.stop(t + 0.1); } catch (e) { /* already stopped */ } }
    tinks.length = 0;
  }
  let quietUntil = 0; // during a batch the stream of drops plays instead of single drops

  // ---------- state ----------
  let count = startCount;
  type PileCookie = { slot: number; y: number; vy: number; rot: number; state: "fall" | "rest"; squash: number; bounces: number; quiet?: boolean };
  type Extra = { kind: "hide" | "leave"; behind?: boolean; x: number; y: number; vy: number; rot: number; mirror: boolean; scale: number; alpha: number; stopY?: number; quiet?: boolean };
  const pile: PileCookie[] = [];
  const extras: Extra[] = [];
  let lid = 0, lidWant = 0, closePending = false;
  const jarSq = { x: 0, v: 0 }, jarRot = { x: 0, v: 0 }, hop = { y: 0, v: 0 }, sway = { x: 0, v: 0, to: 0 };
  let singleHop = false, wiggleSide = 1, energy = 0;
  let IMG: Record<string, HTMLImageElement> | null = null;
  // cookies already in the jar when it first appears (drawn at rest, no animation)
  for (let i = 0; i < Math.min(count, MAX); i++) pile.push({ slot: i, y: SLOTS[i].y, vy: 0, rot: SLOTS[i].rot, state: "rest", squash: 0, bounces: 0 });

  // each landing cookie adds "happiness"; while there is some, the jar hops and dances, then goes still again
  function jarBump(amount: number) {
    if (reduce) return;
    energy = Math.min(2.6, energy + amount);
    jarSq.v -= 7 * amount;
    wiggleSide = -wiggleSide; jarRot.v += (5 + 3 * amount) * wiggleSide;
  }
  function hopOnce() { // feeding: one happy hop, no dance
    if (reduce) return;
    if (hop.y >= 0 && hop.v >= 0) { hop.v = -330; jarSq.v += 6; wiggleSide = -wiggleSide; sway.to = 6 * wiggleSide; singleHop = true; }
  }
  const jarMoving = () => Math.abs(sway.x) + Math.abs(sway.v) > 0.05 || hop.y < 0 || Math.abs(jarSq.x) + Math.abs(jarSq.v) > 0.01 || Math.abs(jarRot.x) + Math.abs(jarRot.v) > 0.01;
  const cw = (scale: number) => W * 0.30 * scale;
  function nextFreeSlot() { const used = new Set(pile.map(c => c.slot)); for (let i = 0; i < SLOTS.length; i++) if (!used.has(i)) return i; return -1; }
  const topCookie = () => pile.reduce<PileCookie | null>((a, b) => (!a || b.slot > a.slot ? b : a), null);

  function dropOne() {
    const s = nextFreeSlot();
    if (s >= 0 && pile.length < Math.min(count, MAX)) {
      const sl = SLOTS[s];
      if (reduce) pile.push({ slot: s, y: sl.y, vy: 0, rot: sl.rot, state: "rest", squash: 0, bounces: 0 });
      else pile.push({ slot: s, y: -LIFT * 0.6, vy: 0, rot: sl.rot + (Math.random() - .5) * 1.2, state: "fall", squash: 0, bounces: 0, quiet: performance.now() < quietUntil });
    } else if (!reduce) {
      // jar already shows 16: this treat falls in and slips behind the pile
      const hideIn = SLOTS[3 + Math.floor(Math.random() * 9)];
      extras.push({ kind: "hide", x: W * (0.34 + Math.random() * 0.32), y: -LIFT * 0.6, vy: 0, rot: (Math.random() - .5) * 1.4,
                    mirror: Math.random() < .5, scale: 1, alpha: 1, stopY: hideIn.y - 30, quiet: performance.now() < quietUntil });
    }
    kick();
  }
  function sendOneOut() {
    if (reduce) { if (count < pile.length) { const t = topCookie(); if (t) pile.splice(pile.indexOf(t), 1); } render(); return; }
    if (count >= MAX) {
      // more than 16 in the jar: a cookie comes out from behind, the pile stays full
      const from = SLOTS[9];
      extras.push({ kind: "leave", behind: true, x: W * (0.42 + Math.random() * 0.16), y: from.y, vy: -1250, rot: (Math.random() - .5) * 0.8, mirror: Math.random() < .5, scale: 1, alpha: 1 });
    } else {
      const top = topCookie(); if (!top) return;
      pile.splice(pile.indexOf(top), 1);
      const sl = SLOTS[top.slot];
      extras.push({ kind: "leave", x: sl.x, y: top.y, vy: -1500, rot: top.rot, mirror: sl.mirror, scale: sl.scale, alpha: 1 });
    }
    kick();
  }

  function sparkle(ms: number) {
    stage.classList.add("cj-shine");
    // normally the sparkles end when the jar stops dancing (see tick); with reduced motion there is no dance, so use a timer
    if (reduce) later(() => stage.classList.remove("cj-shine"), ms);
  }
  function earn(n: number) {
    if (n <= 0) return;
    unlockAudio();
    const drops = Math.min(n, MAX_ANIMATED);
    count += n;
    play("chime", 0.55);
    sparkle(drops > 1 ? drops * 170 + 1200 : 1900);
    if (drops > 1 && !reduce) {
      const ms = drops * 170 + 700;
      quietUntil = performance.now() + ms;
      const h = play("many", 0.28);
      if (h && actx && ms < 3500) { const t = actx.currentTime + ms / 1000; h.g.gain.setValueAtTime(0.28, t - 0.25); h.g.gain.linearRampToValueAtTime(0, t); h.src.stop(t + 0.05); }
    }
    for (let i = 0; i < drops; i++) { if (reduce) dropOne(); else later(dropOne, i * 170); }
    render();
  }
  function feedOne() {
    if (count <= 0) return;
    play("jump", 0.6);
    hopOnce(); kick();
    count--;
    sendOneOut();
    render();
  }
  function feed(n: number) {
    unlockAudio();
    for (let i = 0; i < n; i++) { if (i === 0) feedOne(); else later(feedOne, i * 260); }
  }

  function drawCookieAt(c2: CanvasRenderingContext2D, x: number, y: number, rot: number, mirror: boolean, scale: number, squash: number, alpha: number) {
    const ck = IMG!.cookie, w = cw(scale), h = w * ck.height / ck.width * 0.9;
    c2.save();
    c2.globalAlpha = alpha;
    c2.translate(x, y);
    c2.rotate(rot);
    c2.scale((mirror ? -1 : 1) * (1 + squash * 0.12), 1 - squash * 0.16);
    c2.drawImage(ck, -w / 2, -h, w, h);
    c2.restore();
  }
  function drawShadow(c2: CanvasRenderingContext2D, c: PileCookie) {
    const sl = SLOTS[c.slot], w = cw(sl.scale);
    const dist = Math.max(0, sl.y - c.y);
    const k = Math.max(0.15, 1 - dist / 500);
    const cx = sl.x, cy = sl.y - 2, rx = w * 0.42 * k, ry = w * 0.09 * k;
    const g = c2.createRadialGradient(cx, cy, 0, cx, cy, rx);
    g.addColorStop(0, `rgba(30,14,6,${0.42 * k})`);
    g.addColorStop(1, "rgba(30,14,6,0)");
    c2.save(); c2.translate(cx, cy); c2.scale(1, ry / rx); c2.translate(-cx, -cy);
    c2.fillStyle = g; c2.beginPath(); c2.arc(cx, cy, rx, 0, Math.PI * 2); c2.fill(); c2.restore();
  }

  let last = 0, running = false, raf = 0;
  function tick(t: number) {
    if (dead) return;
    const dt = Math.min(0.033, (t - last) / 1000 || 0); last = t;
    let busy = false;
    for (const c of pile) {
      const sl = SLOTS[c.slot];
      if (c.state === "fall") {
        busy = true;
        c.vy += 2600 * dt; c.y += c.vy * dt;
        c.rot += (sl.rot - c.rot) * Math.min(1, dt * 6);
        if (c.y >= sl.y) {
          if (c.bounces === 0 && !c.quiet) dropSound(1);
          if (c.bounces === 0) { jarBump(1); tink(0.22); }
          c.y = sl.y; c.squash = Math.min(1, Math.abs(c.vy) / 900);
          c.vy = -c.vy * 0.28; c.bounces++;
          if (Math.abs(c.vy) < 140 || c.bounces > 2) { c.state = "rest"; c.vy = 0; c.rot = sl.rot; }
        }
      }
      if (c.squash > 0) { c.squash = Math.max(0, c.squash - dt * 5); busy = true; }
    }
    for (const e of extras) {
      busy = true;
      if (e.kind === "hide") {
        e.vy += 2600 * dt; e.y += e.vy * dt; e.rot *= 0.97;
        if (e.y >= (e.stopY as number) && e.alpha > 0) { e.alpha = 0; if (!e.quiet) dropSound(0.55); jarBump(0.8); tink(0.14); } // now fully behind the pile
      } else {
        e.y += e.vy * dt; e.vy *= 0.985; if (e.y < LID_Y) e.alpha = Math.max(0, e.alpha - dt * 1.8);
      }
    }
    for (let i = extras.length - 1; i >= 0; i--) if (extras[i].alpha <= 0) extras.splice(i, 1);
    const falling = pile.some(c => c.state === "fall") || extras.some(e => e.kind === "hide");
    if (!falling && tinks.length) stopTinks(); // cookies stopped falling: tinks off
    const needLid = pile.some(c => c.state === "fall" && c.y < LID_Y + 60) || extras.some(e => e.kind === "leave" || e.y < LID_Y + 60);
    const target = needLid ? 1 : 0;
    if (target === 1 && lidWant === 0) { if (lid < 0.3) play("open", 0.8); closePending = false; }
    if (target === 0 && lidWant === 1) closePending = true;
    lidWant = target;
    if (closePending && lid < 0.18) { play("close", 0.8); closePending = false; }
    lid += (target - lid) * Math.min(1, dt * (target ? 14 : 9));
    // hops: launch while happy, fall back with gravity, squash on landing
    if (hop.y >= 0 && hop.v >= 0 && energy > 0.15) {
      hop.v = -(420 + 170 * Math.min(energy, 2));
      jarSq.v += 9 + 3 * Math.min(energy, 2);
      wiggleSide = -wiggleSide; jarRot.v += (6 + 2 * energy) * wiggleSide;
      sway.to = wiggleSide * (13 + 6 * Math.min(energy, 2)); // drift to one side, then the other
    }
    if (hop.y < 0 || hop.v < 0) {
      hop.v += 5200 * dt; hop.y += hop.v * dt;
      if (hop.y >= 0) { hop.y = 0; jarSq.v -= 6 + 0.012 * hop.v; hop.v = 0; if (singleHop) { singleHop = false; sway.to = 0; } }
    }
    energy = Math.max(0, energy - dt * 1.3);
    if (energy <= 0 && !singleHop) sway.to = 0;
    sway.v += (95 * (sway.to - sway.x) - 11 * sway.v) * dt; sway.x += sway.v * dt;
    jarSq.v += (-520 * jarSq.x - 13 * jarSq.v) * dt; jarSq.x += jarSq.v * dt;
    jarRot.v += (-260 * jarRot.x - 9 * jarRot.v) * dt; jarRot.x += jarRot.v * dt;
    if (jarMoving()) busy = true;
    if (Math.abs(lid - target) > 0.01) busy = true;
    render();
    if (busy) raf = requestAnimationFrame(tick);
    else { running = false; if (!reduce) stage.classList.remove("cj-shine"); } // jar is still: sparkles off
  }
  function kick() { if (!running && !dead) { running = true; last = performance.now(); raf = requestAnimationFrame(tick); } }

  function render() {
    if (!IMG || dead) return;
    ctx.clearRect(0, 0, cv.width, cv.height);
    ctx.save();
    ctx.translate(PADX, 0);
    const sq = Math.max(-0.2, Math.min(0.2, jarSq.x * 0.05));   // + = tall and thin, - = short and wide
    const bx = W / 2, by = LIFT + H * 0.975;
    const lean = Math.max(-0.05, Math.min(0.05, jarRot.x * 0.005 + sway.v * 0.0003)); // gentle lean into the drift (~3 deg max)
    ctx.translate(bx + sway.x, by + hop.y); ctx.rotate(lean); ctx.scale(1 - sq * 0.75, 1 + sq); ctx.translate(-bx, -by);
    ctx.drawImage(IMG.back, 0, LIFT);
    // inside the glass: shadows, hidden overflow cookies, then the pile (bottom row first), clipped by the inner mask
    octx.clearRect(0, 0, W, H);
    octx.globalCompositeOperation = "source-over";
    const sorted = [...pile].sort((a, b) => a.slot - b.slot);
    for (const c of sorted) drawShadow(octx, c);
    const pileTop = SLOTS[TOP].y - cw(1) * 0.75;
    for (const e of extras) if ((e.kind === "hide" && e.y > LID_Y + 40) || (e.behind && e.y > pileTop)) drawCookieAt(octx, e.x, e.y, e.rot, e.mirror, e.scale, 0, e.alpha);
    const topRowFull = pile.some(c => c.slot === TOP && c.state === "rest") && pile.some(c => c.slot === TOP - 1 && c.state === "rest");
    if (topRowFull) for (const b of BACK) drawCookieAt(octx, b.x, b.y, b.rot, b.mirror, 1, 0, 1);
    for (const c of sorted) if (c.state === "rest" || c.y > LID_Y + 40) { const sl = SLOTS[c.slot]; drawCookieAt(octx, sl.x, c.y, c.rot, sl.mirror, sl.scale, c.squash, 1); }
    octx.globalCompositeOperation = "destination-in";
    octx.drawImage(IMG.mask, 0, 0);
    octx.globalCompositeOperation = "source-over";
    ctx.drawImage(off, 0, LIFT);
    // cookies passing through the open mouth, and cookies flying out
    ctx.save(); ctx.translate(0, LIFT);
    for (const c of pile) if (c.state === "fall" && c.y <= LID_Y + 40) { const sl = SLOTS[c.slot]; drawCookieAt(ctx, sl.x, c.y, c.rot, sl.mirror, sl.scale, 0, 1); }
    for (const e of extras) if ((e.kind === "hide" && e.y <= LID_Y + 40) || (e.kind === "leave" && !(e.behind && e.y > pileTop))) drawCookieAt(ctx, e.x, e.y, e.rot, e.mirror, e.scale, 0, e.alpha);
    ctx.restore();
    ctx.drawImage(IMG.front, 0, LIFT);
    // lid pops open on a hinge at its left edge
    ctx.save();
    const px = W * 0.14, py = LIFT + LID_Y;
    ctx.translate(px, py); ctx.rotate(-0.42 * lid); ctx.translate(-px, -py);
    ctx.translate(0, -26 * lid);
    ctx.drawImage(IMG.lid, 0, LIFT);
    ctx.restore();
    ctx.restore();
  }

  const load = (f: string) => new Promise<HTMLImageElement>((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = DIR + f; });
  Promise.all([load("jar_back.webp"), load("jar_front.webp"), load("jar_lid.webp"), load("jar_mask.webp"), load("cookie.webp")])
    .then(([back, front, lidImg, mask, cookie]) => {
      if (dead) return;
      IMG = { back, front, lid: lidImg, mask, cookie };
      render();
    })
    .catch(() => { console.error("[CookieJar] art failed to load"); });

  return {
    earn,
    feed,
    destroy() {
      dead = true;
      cancelAnimationFrame(raf);
      timers.forEach(clearTimeout);
      document.removeEventListener("pointerdown", unlockAudio);
      document.removeEventListener("keydown", unlockAudio);
      stage.classList.remove("cj-shine");
      if (actx) actx.close().catch(() => {});
    },
  };
}

type Props = {
  count: number;          // the kid's real treat count (never capped)
  muted?: boolean;        // true = no jar sounds
  width?: string;         // jar width (CSS); default fits phones
  style?: CSSProperties;
};

export default function CookieJar({ count, muted = false, width = "min(290px, 62vw)", style }: Props) {
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engine = useRef<Engine | null>(null);
  const shown = useRef(Math.max(0, Math.floor(Number(count) || 0)));
  const mutedRef = useRef(muted);
  mutedRef.current = muted;

  useEffect(() => {
    const e = makeEngine(canvasRef.current!, stageRef.current!, shown.current, () => mutedRef.current);
    engine.current = e;
    return () => { e.destroy(); engine.current = null; };
  }, []);

  useEffect(() => {
    const n = Math.max(0, Math.floor(Number(count) || 0));
    const d = n - shown.current;
    shown.current = n;
    if (!engine.current || d === 0) return;
    if (d > 0) engine.current.earn(d); else engine.current.feed(-d);
  }, [count]);

  return (
    <div ref={stageRef} className="cj-stage" style={{ width, ...style }}>
      <style>{CSS}</style>
      <div className="cj-halo" aria-hidden="true" />
      <canvas ref={canvasRef} role="img" aria-label="Glass treat jar with chocolate cookies inside" />
      <div className="cj-tw" aria-hidden="true">
        {TWINKLES.map((t, i) => <i key={i} className={t.star ? "cj-st" : undefined} style={t.style} />)}
      </div>
    </div>
  );
}
