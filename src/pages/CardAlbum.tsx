// CARD ALBUM (Andy 2026-10-07, layout v2 from his Domino / other-game screenshots).
// Two screens: ALBUM HOME (open storybook, 12 round set badges, blue ribbon = whole-album prize, pack corner)
// and a SET PAGE (that set's world behind, gold ribbon = set prize, 10 cards on the book, missing card = faded word).
// v2 (Andy 16:19): NO computer voice; lots of bright MAGIC (one canvas of glowing round fairy dots + rising yellow embers):
// the closed album glimmers, opens in a big yellow glow + ember shower; new cards FLY into their set's badge with a
// sparkle trail + the transformation chime (public/worlds/ui/snd_newfriend.mp3). Whole background softly blurred.
// STEP 1 = DISPLAY ONLY on teacher code 1006 (pretend coins + cards, NOTHING is saved). Every other code: "Coming soon".
// Real saving (open a pack = database function, coins_spent, cards saved) = its own careful cloud session later.
// REAL SAVING (launch step 5, 2026-10-14): the codes in PuzzleMixup REAL_CODES (TEST99 now, every kid at launch) read + save
// the real album: the database (mpe_open_packs) takes the coins + picks the cards FIRST, then the animation shows them.
import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CARD_SETS, CARDS_TOTAL, cardImg, type CardInfo, type CardSet } from "@/cards/cardData";
import { PACK_PRICE, DEMO_COINS, demoCoinsGet, demoCoinsSet } from "@/cards/economy";
import { Word3D, FUN3D_CSS } from "@/components/Fun3D";
import { useClickSfx } from "@/lib/clickSfx";
import HowToPlay from "@/components/HowToPlay";
import { ALBUM_HOWTO, SWAP_HOWTO } from "@/components/howtos";
import { useHowtoSeen, wantHowto, seenHowto, firstHowto } from "@/lib/howtoSeen";
import { loadPrizes, loadCards, openPacks, pickCard, markSeen, cardSeen, type CardPacks } from "@/lib/cloudSave";
import { isRealCode } from "@/pages/PuzzleMixup";   // ONE rule for real saving in Puzzle + Album (every code except 1006)
import { lockLeft, LOCK_IMG } from "@/lib/locks";
import LockMsg from "@/components/LockMsg";

const MASTER_CODE = "1006";
const U = "/cards/ui";
const CHIME = "/worlds/ui/snd_newfriend.mp3";
const WHOOSH = "/cards/ui/whoosh.mp3";
// TABLE BACKGROUND (Andy 2026-10-07 21:59): the same cozy table on every world, painted soft (no blur in code). Seasons later =
// swap the picture by date (same layout). TBL = where the things on the table sit (picture px) so nothing ever covers them.
const TABLE_BG = "/cards/ui/table_neutral.webp";
const TBL = { w: 1376, h: 768, left: 235, right: 1200, plantL: 1210 };        // cards flying (Andy 20:02)   // the stage-transformation magic sound
const STAGE_W = 1600, STAGE_H = 1000;
const SET_PRIZE = { treats: 5, coins: 50 };   // shown only - the database will pay (cloud step)
const ALBUM_PRIZE = { treats: 20, coins: 200 };
const allOwned = (o: Record<string, number>) => CARD_SETS.every(st => st.cards.every(c => (o[`${st.id}-${c.n}`] ?? 0) > 0));   // whole album done

// Picture on each set's round badge (card number) + its colour.
const BADGE: Record<number, { n: number; c: string }> = {
  1: { n: 1, c: "#1aa3e0" }, 2: { n: 10, c: "#f08a1a" }, 3: { n: 5, c: "#8a4fe0" }, 4: { n: 1, c: "#e0457a" },
  5: { n: 1, c: "#3ab04a" }, 6: { n: 1, c: "#e05a3a" }, 7: { n: 10, c: "#2ab3c0" }, 8: { n: 2, c: "#6a62e0" },
  9: { n: 3, c: "#d9a21a" }, 10: { n: 8, c: "#c0502a" }, 11: { n: 10, c: "#2a8ad9" }, 12: { n: 1, c: "#9a5a2a" },
};

// Open book picture (album_open.webp 1312x702): the inside of each page's gold frame, in picture pixels (measured).
const BOOK_W = 1312, BOOK_H = 702;
const PAGE_L = { x: 122, y: 80, w: 482, h: 538 };
const PAGE_R = { x: 708, y: 80, w: 482, h: 538 };
// Ribbon pictures (1284x408): the flat middle of the front band, as fractions (measured: inside the gold lines y 27-231).
const RIB_W = 1284, RIB_H = 408, BAND = { x0: 0.15, x1: 0.85, y0: 0.075, y1: 0.555 };

// Layout (stage px). HOME: book 1200 wide. SET PAGE: book 1400 wide.
const HOME = { titleTop: -12, ribW: 680, ribTop: 104, barTop: 246, bookW: 1200, bookTop: 298 };
const SETP = { ribW: 520, ribTop: 72, barTop: 178, bookW: 1400, bookTop: 222, cardW: 158 };

type Owned = Record<string, number>;   // "set-n" -> how many the kid has (2+ = doubles)
const key = (s: number, n: number) => `${s}-${n}`;

// 1006 pretend album: the same every time (fixed numbers).
const demoAlbum = () => {
  const have = [7, 10, 4, 2, 3, 1, 2, 0, 2, 1, 1, 1];
  let seed = 11;
  const r = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  const owned: Owned = {};
  CARD_SETS.forEach((s, i) => {
    const order = s.cards.map(c => c.n).sort(() => r() - 0.5);
    order.slice(0, have[i]).forEach(n => { owned[key(s.id, n)] = 1; });
  });
  owned[key(1, 1)] = 2; owned[key(2, 4)] = 3;                                   // a few doubles (+1 / +2 tags)
  const d5 = CARD_SETS[4].cards.find(c => owned[key(5, c.n)]); if (d5) owned[key(5, d5.n)] = 2;
  if (new URLSearchParams(window.location.search).get("ac") === "1") {   // TEST (1006, ?ac=1): every card but one (set 12) -> pick it (?sw=10) -> album party
    CARD_SETS.forEach(st => st.cards.forEach(c => { owned[key(st.id, c.n)] = owned[key(st.id, c.n)] || 1; }));
    delete owned[key(12, CARD_SETS[11].cards[0].n)];
  }
  const fresh = new Set<string>(Object.keys(owned).filter(k => k.startsWith("1-")).slice(0, 2));
  Object.keys(owned).filter(k => k.startsWith("3-")).slice(0, 1).forEach(k => fresh.add(k));
  return { owned, fresh, coins: demoCoinsGet(), swap: Math.min(10, Number(new URLSearchParams(window.location.search).get("sw")) || 7) };   // ?sw=10 = test Pick a Card (1006)   // 1006 coins = the tab's pretend coins (shared with the world page, 2026-10-14)
};

// ONE PACK (plan): 1 card 45% / 2 cards 40% / 3 cards 15%; a card is gold 8% of the time; a card the kid does NOT
// have yet is 3x likelier; a double = +1 swap point (gold double = +3). DISPLAY ONLY - the real draw will happen in the database.
type Pull = { set: number; c: CardInfo; isNew: boolean; pts: number };
const drawPack = (owned: Owned): Pull[] => {
  const r = Math.random(), n = r < 0.45 ? 1 : r < 0.85 ? 2 : 3;
  const got: Owned = { ...owned }, out: Pull[] = [];
  for (let i = 0; i < n; i++) {
    const gold = Math.random() < 0.08;
    const pool = CARD_SETS.flatMap(st => st.cards.filter(c => c.gold === gold).map(c => ({ set: st.id, c })));
    const w = pool.map(x => (got[key(x.set, x.c.n)] ? 1 : 3));
    let t = Math.random() * w.reduce((a, b) => a + b, 0), k = 0;
    while (k < pool.length - 1 && t > w[k]) { t -= w[k]; k++; }
    const x = pool[k], kk = key(x.set, x.c.n), isNew = !got[kk];
    got[kk] = (got[kk] ?? 0) + 1;
    out.push({ ...x, isNew, pts: isNew ? 0 : x.c.gold ? 3 : 1 });
  }
  return out;
};
// PACK SCREEN shows at most this many packs at once (Andy 2026-10-07).
const MAX_OPEN = 10;
const PACK_AR = 600 / 354;   // pack_closed.webp height / width

// a tiny 'ting' made in the browser (no file) for each new Swap Meter dot; each dot a little higher (Andy 10-16)
const ting = (i: number) => {
  try {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ac = new AC(), t = ac.currentTime, f = 1318.5 * Math.pow(1.122, i);
    [f, f * 2].forEach((fr, k) => {
      const o = ac.createOscillator(), g = ac.createGain();
      o.type = "sine"; o.frequency.setValueAtTime(fr, t);
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(k ? 0.04 : 0.12, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.35);
      o.connect(g); g.connect(ac.destination); o.start(t); o.stop(t + 0.4);
      if (!k) o.onended = () => { ac.close().catch(() => { }); };
    });
  } catch { /* no sound */ }
};
const play = (src: string, vol = 0.6) => { try { const a = new Audio(src); a.volume = vol; a.play().catch(() => { }); } catch { /* */ } };

// ---------- MAGIC: one canvas over the whole stage. Round glowing dots only (no star shapes). ----------
// ember = warm yellow-orange spark that rises + flickers; fairy = bright white-gold twinkle that drifts; glow = big soft halo.
type Part = { x: number; y: number; vx: number; vy: number; s: number; t: number; life: number; k: 0 | 1 | 2; ph: number };
const sprite = (core: string, mid: string, edge: string) => {
  const c = document.createElement("canvas"); c.width = c.height = 64;
  const g = c.getContext("2d");
  if (g) {
    const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    gr.addColorStop(0, core); gr.addColorStop(0.22, mid); gr.addColorStop(0.55, edge); gr.addColorStop(1, "rgba(255,190,0,0)");
    g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
  }
  return c;
};
class Fx {
  ps: Part[] = [];
  em: { until: number; fn: (dt: number) => void }[] = [];
  cv: HTMLCanvasElement; ctx: CanvasRenderingContext2D | null; spr: HTMLCanvasElement[];
  raf = 0; last = 0; on = true;
  constructor(cv: HTMLCanvasElement) {
    this.cv = cv; this.ctx = cv.getContext("2d");
    this.spr = [sprite("rgba(255,255,225,1)", "rgba(255,222,90,.95)", "rgba(255,150,10,.4)"),    // ember
      sprite("rgba(255,255,255,1)", "rgba(255,250,205,.95)", "rgba(255,220,90,.35)"),            // fairy
      sprite("rgba(255,252,220,.95)", "rgba(255,232,130,.55)", "rgba(255,205,60,.18)")];          // glow
    this.raf = requestAnimationFrame(this.frame);
  }
  ember(x: number, y: number, sp = 1) {
    this.ps.push({ x, y, vx: (Math.random() - 0.5) * 50 * sp, vy: -(35 + Math.random() * 85) * sp, s: 2.6 + Math.random() * 3.6, t: 0, life: 1.3 + Math.random() * 1.7, k: 0, ph: Math.random() * 6.28 });
  }
  fairy(x: number, y: number, sp = 1) {
    const a = Math.random() * 6.28, v = (20 + Math.random() * 110) * sp;
    this.ps.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 20, s: 1.5 + Math.random() * 2.6, t: 0, life: 0.7 + Math.random() * 1.2, k: 1, ph: Math.random() * 6.28 });
  }
  glow(x: number, y: number, s: number, life = 1) { this.ps.push({ x, y, vx: 0, vy: 0, s, t: 0, life, k: 2, ph: 0 }); }
  burst(x: number, y: number, o: { embers?: number; fairies?: number; glow?: number; w?: number; h?: number; sp?: number }) {
    const w = o.w ?? 40, h = o.h ?? w;
    for (let i = 0; i < (o.embers ?? 0); i++) this.ember(x + (Math.random() - 0.5) * w, y + (Math.random() - 0.5) * h, o.sp);
    for (let i = 0; i < (o.fairies ?? 0); i++) this.fairy(x + (Math.random() - 0.5) * w, y + (Math.random() - 0.5) * h, o.sp);
    if (o.glow) this.glow(x, y, o.glow);
  }
  emit(ms: number, fn: (dt: number) => void) { this.em.push({ until: performance.now() + ms, fn }); }
  frame = (now: number) => {
    if (!this.on) return;
    const dt = Math.min(0.05, this.last ? (now - this.last) / 1000 : 0.016); this.last = now;
    this.em = this.em.filter(e => now < e.until); this.em.forEach(e => e.fn(dt));
    const c = this.ctx;
    if (c) {
      c.clearRect(0, 0, this.cv.width, this.cv.height);
      if (this.ps.length) {
        c.globalCompositeOperation = "lighter";
        this.ps = this.ps.filter(p => (p.t += dt) < p.life);
        for (const p of this.ps) {
          const k = p.t / p.life;
          let a = Math.min(1, p.t / 0.12) * (1 - k * k), r = p.s * 3.2;
          if (p.k === 0) { p.vy -= 12 * dt; p.x += (p.vx + Math.sin(p.t * 3 + p.ph) * 22) * dt; p.y += p.vy * dt; a *= 0.7 + 0.3 * Math.sin(p.t * 24 + p.ph); }
          else if (p.k === 1) { p.vx *= 1 - 1.5 * dt; p.vy = p.vy * (1 - 1.5 * dt) - 10 * dt; p.x += p.vx * dt; p.y += p.vy * dt; a *= 0.35 + 0.65 * Math.abs(Math.sin(p.t * 9 + p.ph)); }
          else { r = p.s * (0.7 + 0.5 * k); a = 0.9 * (1 - k); }
          c.globalAlpha = Math.max(0, Math.min(1, a));
          c.drawImage(this.spr[p.k], p.x - r, p.y - r, r * 2, r * 2);
        }
        c.globalAlpha = 1;
      }
    }
    this.raf = requestAnimationFrame(this.frame);
  };
  stop() { this.on = false; cancelAnimationFrame(this.raf); }
}

const useFit = () => {
  const calc = () => {
    const w = window.innerWidth || STAGE_W, h = window.innerHeight || STAGE_H;
    const s = Math.min(w / STAGE_W, h / STAGE_H);
    return { s, sw: w / s, sh: h / s };
  };
  const [f, setF] = useState(calc);
  useEffect(() => { const on = () => setF(calc()); window.addEventListener("resize", on); return () => window.removeEventListener("resize", on); }, []);
  return f;
};

// Words: ONE font size per album (Titan One); a word too long for its space is squeezed sideways, never smaller.
const measureCtx = typeof document !== "undefined" ? document.createElement("canvas").getContext("2d") : null;
const squeeze = (word: string, px: number, room: number) => {
  if (!measureCtx) return 1;
  measureCtx.font = `${px}px 'Titan One'`;
  const w = measureCtx.measureText(word).width;
  return w > room ? room / w : 1;
};

// A ribbon picture with its text sitting on the flat middle of the band.
function Ribbon({ img, left, top, width, line1, prize, stroke }: {
  img: string; left: number; top: number; width: number; line1: string; prize: React.ReactNode; stroke: string;
}) {
  const h = width * RIB_H / RIB_W;
  return (
    <div className="ca-ribbon ca-inT" style={{ left, top, width, height: h, backgroundImage: `url(${img})` }}>
      <div className="ca-rtxt" style={{ left: width * BAND.x0, width: width * (BAND.x1 - BAND.x0), top: h * BAND.y0, height: h * (BAND.y1 - BAND.y0),
        ["--rs" as string]: stroke } as CSSProperties}>
        <div className="ca-rt" style={{ fontSize: width * 0.031 }}>{line1}</div>
        <div className="ca-rp" style={{ fontSize: width * 0.058 }}>{prize}</div>
      </div>
    </div>
  );
}
const PrizeRow = ({ treats, coins, badge }: { treats: number; coins: number; badge?: boolean }) => (
  <><img src="/worlds/ui/treat.webp" alt="" />{treats}<img src="/worlds/ui/coin.webp" alt="" />{coins}{badge && <span>+ BADGE</span>}</>
);

// One card (or its empty spot). Box = W x H; the picture keeps its own shape inside.
function Card({ set, c, W, have, fresh, extra, fontPx, onTap }: {
  set: number; c: CardInfo; W: number; have: boolean; fresh?: boolean; extra?: number; fontPx: number; onTap: () => void;
}) {
  const H = Math.round(W * 1.45);
  const k = Math.min(W / c.w, H / c.h), ox = (W - c.w * k) / 2, oy = (H - c.h * k) / 2, rad = Math.min(c.w, c.h) * k * 0.1;
  const room = c.lw * k * 0.88;
  if (!have) return (
    <div className={"ca-empty ca-tap" + (c.gold ? " gold" : "")} style={{ width: W, height: H, borderRadius: rad }} onClick={onTap}>
      <div className="ca-q" style={{ width: W * 0.46, height: W * 0.46, fontSize: W * 0.32 }}>?</div>
      <div className="ca-ew" style={{ fontSize: fontPx, transform: `scaleX(${squeeze(c.word, fontPx, W * 0.84)})` }}>{c.word}</div>
    </div>
  );
  return (
    <div className={"ca-card ca-tap" + (c.gold ? " gold" : "")} style={{ width: W, height: H }} onClick={onTap}>
      <img src={cardImg(set, c.n)} alt={c.word} style={{ left: ox, top: oy, width: c.w * k, height: c.h * k }} />
      <div className="ca-word" style={{ left: ox + c.lx * k, top: oy + c.ly * k, width: c.lw * k, height: c.lh * k, fontSize: fontPx }}>
        <span style={{ transform: `scaleX(${squeeze(c.word, fontPx, room)})` }}>{c.word}</span>
      </div>
      {c.gold && <div className="ca-shine" style={{ left: ox, top: oy, width: c.w * k, height: c.h * k, borderRadius: rad }} />}
      {fresh && <div className="ca-tag new">NEW</div>}
      {!fresh && extra ? <div className="ca-tag dup">+{extra}</div> : null}
    </div>
  );
}

// PACK OPENING (Andy 2026-10-07 21:52). 2+ packs = PACK SCREEN first: the packs drop into a neat row. 'Open Next' (or tap a
// pack) = that pack moves to the middle, glimmers, shakes, bursts; its cards fly out face down and flip one by one. 'Open All'
// = every pack glows big + bright and shakes together, they all burst at once, the cards land in neat rows and flip in a
// quick wave. 'Put in Album!' = the cards fly into their set badges (chime + sparkle each), then back to the packs left.
// 1 pack = opens straight away. No voice (Andy 16:19).
type Batch = { packs: Pull[][]; all: boolean; from: number; rowN: number; pay?: number };   // pay = ms the coins pour in first (2026-10-14)
function PackOpen({ count, coins, cx, cy, fx, draw, getTarget, onFlyStart, onLand, onBatchDone, hold, onClose }: {
  count: number; coins: number; cx: number; cy: number; fx: () => Fx | null; draw: (n: number) => Pull[][] | Promise<Pull[][] | null>;
  getTarget: (set: number) => { x: number; y: number } | null;
  onFlyStart: (n: number) => void; onLand: (x: Pull) => void; onBatchDone: () => void; hold: boolean; onClose: () => void;
}) {
  const [left, setLeft] = useState(count);
  const [ph, setPh] = useState<"pick" | "pay" | "shake" | "burst" | "cards" | "fly" | "wait">(count > 1 ? "pick" : "shake");
  const [batch, setBatch] = useState<Batch | null>(null);
  const [pickKey, setPickKey] = useState(0);
  const [flipped, setFlipped] = useState(0);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const raf = useRef(0);

  // the row of packs (pack screen + Open All)
  const row = (n: number) => {
    const pw = Math.min(210, (cx * 2 - 260 - (n - 1) * 34) / n);
    return { pw, h: pw * PACK_AR, x: (i: number) => cx + (i - (n - 1) / 2) * (pw + 34), y: cy - 40 };
  };
  const busy = useRef(false);   // REAL kids: waiting for the database's cards (2026-10-14)
  const start = (n: number, all: boolean, from: number) => {
    if (batch || busy.current || pouring.current || !(ph === "pick" || ph === "shake")) return;   // + never two pours at once
    cardRefs.current = []; setFlipped(0);
    const begin = (p: Pull[][]) => { const ms = pour(p.length, all); setBatch({ packs: p, all, from, rowN: left, pay: ms }); setPh(ms ? "pay" : "shake"); };
    const got = draw(n);
    if (Array.isArray(got)) { begin(got); return; }   // 1006: at once
    busy.current = true;
    got.then(p => { busy.current = false; if (p && p.length) begin(p); else onClose(); });
  };
  // COINS POUR INTO THE PACK (Andy 2026-10-14): FIRST the coins fall from the wallet into the pack (~2.5s, 'pay' phase) while the
  // wallet's green bar drains with a falling sound (the meter going backwards), THEN the pack shakes + bursts. Coins in, cards out.
  // The album's coins go down when the pour ends (onFlyStart). The wallet bar = progress to the NEXT pack ('40 / 200').
  const poRef = useRef<HTMLDivElement>(null);
  const pourT = useRef<number[]>([]);
  const pouring = useRef(false);
  const [wc, setWc] = useState(coins);           // the wallet number on this screen (counts down while the coins pour)
  const [pourOn, setPourOn] = useState(false);
  useEffect(() => { if (!pouring.current) setWc(coins); }, [coins]);
  useEffect(() => () => pourT.current.forEach(t => window.clearTimeout(t)), []);
  const pour = (n: number, all: boolean) => {   // returns how long the pour takes (ms)
    const root = poRef.current; if (!root) { onFlyStart(n); return 0; }
    pouring.current = true;
    const left = Math.max(0, coins - PACK_PRICE * n), leftPct = ((left % PACK_PRICE) / PACK_PRICE) * 100;
    const k = Math.min(30, 16 + 4 * n), G = 85, ms = (k - 1) * G + 850;
    const R = row(n), src = { x: cx - 92, y: 50 };
    const dst = (i: number) => (all ? { x: R.x(i % n), y: R.y } : { x: cx, y: cy - 20 });
    setPourOn(true); setWc(coins);
    try {
      const clink = () => { const a = new Audio("/celebration/coins_land.mp3"); a.volume = 0.45; a.play().catch(() => { }); return a; };
      const a1 = clink(); pourT.current.push(window.setTimeout(() => { a1.pause(); clink(); }, 1550));
    } catch { /* */ }
    // (falling tone removed 10-16: Andy - it sounded like losing coins; the coins_land clink above stays)
    for (let j = 0; j < k; j++) {
      pourT.current.push(window.setTimeout(() => {
        const c = document.createElement("img");
        c.src = "/worlds/ui/coin.webp"; c.alt = ""; c.className = "ca-pcoin";
        root.appendChild(c);
        const d = dst(j), mx = (src.x + d.x) / 2 + (Math.random() - 0.5) * 120, my = Math.min(src.y, d.y) + 30 + Math.random() * 40;
        c.animate([
          { transform: `translate(${src.x}px,${src.y}px) scale(.9)`, opacity: 1 },
          { transform: `translate(${mx}px,${my}px) scale(1.05)`, opacity: 1, offset: 0.5 },
          { transform: `translate(${d.x + (Math.random() - 0.5) * 60}px,${d.y}px) scale(.35)`, opacity: 0 },
        ], { duration: 650, easing: "ease-in" }).onfinish = () => c.remove();
        const total = PACK_PRICE * n, step = j === k - 1 ? total - Math.round(total / k) * (k - 1) : Math.round(total / k);
        pourT.current.push(window.setTimeout(() => setWc(x => x - step), 600));
      }, j * G));
    }
    pourT.current.push(window.setTimeout(() => { pouring.current = false; setPourOn(false); setWc(left); onFlyStart(n); }, ms));
    return ms;
  };
  useEffect(() => {
    if (count === 1) start(1, false, -1); else play(WHOOSH, 0.6);
    return () => cancelAnimationFrame(raf.current);
  }, []);   // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {                                     // after a batch: back to the packs left (after any Collection Completed)
    if (ph !== "wait" || hold) return;
    const t = window.setTimeout(() => { setPickKey(k => k + 1); setPh("pick"); play(WHOOSH, 0.6); }, 500);
    return () => window.clearTimeout(t);
  }, [ph, hold]);

  const pulls = batch ? batch.packs.flat() : [];
  const packOf = batch ? batch.packs.flatMap((p, pi) => p.map(() => pi)) : [];
  const RB = row(batch && batch.all ? batch.packs.length : 1);

  // 1-3 cards = one big row. 4+ cards = a grid sized to fit the screen, small NEW / +N tags.
  const N = Math.max(1, pulls.length), big = N <= 3;
  const lay = (() => {
    if (big) return { W: 250, cols: N, gx: 46, gy: 0, top: cy - Math.round(250 * 1.45) / 2 - 30 };
    const aw = cx * 2 - 120, ah = cy * 2 - 300, gx = 26, gy = 30;
    let best = { W: 0, cols: 1 };
    for (let c = 1; c <= N; c++) {
      const r = Math.ceil(N / c), w = Math.min(230, (aw - (c - 1) * gx) / c, (ah - (r - 1) * gy) / r / 1.45);
      if (w >= best.W) best = { W: Math.floor(w), cols: c };   // a tie = fewer rows
    }
    const rows = Math.ceil(N / best.cols), gh = rows * Math.round(best.W * 1.45) + (rows - 1) * gy;
    return { W: best.W, cols: best.cols, gx, gy, top: cy - gh / 2 + 40 };
  })();
  const { W, cols } = lay, H = Math.round(W * 1.45), gap = lay.gx;
  const rowOf = (i: number) => Math.floor(i / cols);
  const inRow = (i: number) => Math.min(cols, N - rowOf(i) * cols);
  const leftOf = (i: number) => cx + (i % cols - (inRow(i) - 1) / 2) * (W + gap) - W / 2;
  const topOf = (i: number) => lay.top + rowOf(i) * (H + lay.gy);
  const top = lay.top, gridH = rowOf(N - 1) * (H + lay.gy) + H;
  const step = big ? 900 : Math.max(130, Math.round(1800 / N));    // flip one after another, faster when there are many
  const every = big ? 1 : Math.ceil(260 / step);                   // many cards: a flip sound on every 2nd/3rd card

  useEffect(() => {
    if (!batch) return;
    const f = fx(), all = batch.all, D = batch.pay ?? 0;   // D = the coins pour in first
    const pts = all ? batch.packs.map((_, i) => ({ x: RB.x(i), y: RB.y })) : [{ x: cx, y: cy - 60 }];
    const rw = all ? RB.pw * 0.6 : 170, rh = all ? RB.h * 0.55 : 280;
    const t0 = window.setTimeout(() => play(`${U}/pack_shake.mp3`, 0.6), D + 500);   // matchbox rattle = the 1s wiggle
    const tS = window.setTimeout(() => { if (D) setPh("shake"); f?.emit(1450, () => {                                  // the pack(s) glimmer while they shake
      for (let j = 0; j < (all ? 2 : 1); j++) {
        const p = pts[Math.floor(Math.random() * pts.length)], a = Math.random() * 6.28;
        if (Math.random() < 0.7) f.fairy(p.x + Math.cos(a) * rw, p.y + Math.sin(a) * rh, 0.4);
        if (Math.random() < 0.35) f.ember(p.x + (Math.random() - 0.5) * rw * 1.5, p.y + rh * 0.9, 0.8);
      }
    }); }, D);
    const ts = [t0, tS,
      window.setTimeout(() => {
        setPh("burst"); play("/worlds/daily/claim.mp3", 0.6);
        const g = fx(); if (!g) return;
        if (all) {
          pts.forEach(p => g.burst(p.x, p.y, { glow: 230, embers: 26, fairies: 46, w: RB.pw * 1.1, h: RB.h, sp: 1.6 }));
          g.burst(cx, RB.y, { glow: 560, embers: 40, fairies: 70, w: Math.min(cx * 1.6, pts.length * (RB.pw + 34)), h: RB.h, sp: 1.8 });
        } else g.burst(cx, cy - 60, { glow: 420, embers: 70, fairies: 120, w: 260, h: 360, sp: 1.8 });
        g.emit(1400, () => { if (Math.random() < 0.8) g.ember(cx + (Math.random() - 0.5) * 700, cy + 300, 1.3); });
      }, D + 1500),
      window.setTimeout(() => { setPh("cards"); play(WHOOSH, 0.75); }, D + 2100),
      ...pulls.map((x, i) => window.setTimeout(() => {
        setFlipped(i + 1); if (i % every === 0) play(`${U}/card_flip.mp3`, 0.6);   // card flip sound (Andy 20:12)
        const g = fx(); g?.burst(leftOf(i) + W / 2, topOf(i) + H / 2, x.c.gold ? { glow: big ? 260 : 170, fairies: big ? 70 : 34, embers: big ? 24 : 12, w: W, h: H, sp: 1.2 } : { fairies: big ? 30 : 14, embers: big ? 10 : 5, w: W, h: H });
      }, D + 2900 + i * step)),
    ];
    return () => ts.forEach(t => window.clearTimeout(t));
  }, [batch]);   // eslint-disable-line react-hooks/exhaustive-deps
  const done = batch !== null && flipped >= pulls.length;

  const finish = () => {
    const n = batch ? batch.packs.length : 0, rest = left - n;
    setLeft(rest); setBatch(null); onBatchDone();
    if (rest > 0) setPh("wait"); else onClose();
  };
  const fly = () => {
    if (ph === "fly" || !batch) return;
    setPh("fly");   // (coins are now taken when they pour in - 2026-10-14)
    const starts = pulls.map((_, i) => ({ x: leftOf(i) + W / 2, y: topOf(i) + H / 2 }));
    const targets = pulls.map(x => getTarget(x.set) ?? { x: cx, y: cy });
    const t0 = performance.now() + 250, D = big ? 1050 : 900, GAP = big ? 480 : Math.max(60, Math.min(300, Math.round(2400 / N))), landed = pulls.map(() => false);
    const k = big ? 1 : Math.ceil(N / 8);                            // many cards: whoosh + chime on every k-th card only
    pulls.forEach((_, i) => { if (i % k === 0) window.setTimeout(() => play(WHOOSH, 0.7), 250 + i * GAP); });
    const stepF = (now: number) => {
      let all = true;
      pulls.forEach((x, i) => {
        const el = cardRefs.current[i], t = (now - t0 - i * GAP) / D;
        if (t < 0) { all = false; return; }
        if (t >= 1) {
          if (!landed[i]) {
            landed[i] = true; if (el) el.style.opacity = "0";
            onLand(x); if (i % k === 0) play(CHIME, 0.3);   // quieter (Andy 20:02)
            fx()?.burst(targets[i].x, targets[i].y, big ? { glow: 150, fairies: 55, embers: 22, w: 80, sp: 1.4 } : { glow: 110, fairies: 28, embers: 10, w: 70, sp: 1.3 });
          }
          return;
        }
        all = false;
        const e = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
        const s0 = starts[i], g = targets[i], mx = (s0.x + g.x) / 2, my = Math.min(s0.y, g.y) - 230;
        const px = (1 - e) * (1 - e) * s0.x + 2 * (1 - e) * e * mx + e * e * g.x, py = (1 - e) * (1 - e) * s0.y + 2 * (1 - e) * e * my + e * e * g.y;
        const rot = big ? (i - (N - 1) / 2) * 14 : (i % cols - (inRow(i) - 1) / 2) * 8;
        if (el) el.style.transform = `translate(${px - s0.x}px,${py - s0.y}px) scale(${1 - (1 - 46 / W) * e}) rotate(${rot * e}deg)`;
        const f = fx();
        if (f) {                                             // sparkle trail
          for (let j = 0; j < (big ? 4 : 2); j++) f.fairy(px + (Math.random() - 0.5) * 120 * (1 - e), py + (Math.random() - 0.5) * 160 * (1 - e), 0.45);
          if (Math.random() < 0.7) f.ember(px + (Math.random() - 0.5) * 40, py, 0.7);
        }
      });
      if (all) { window.setTimeout(finish, 450); return; }
      raf.current = requestAnimationFrame(stepF);
    };
    raf.current = requestAnimationFrame(stepF);
  };

  const R0 = row(Math.max(1, left));
  const RF = batch && batch.from >= 0 ? row(batch.rowN) : null;      // Open Next: the pack starts from its spot in the row
  return (
    <div ref={poRef} className={"ca-po" + (ph === "fly" || ph === "wait" ? " fly" : "")}>
      {ph !== "fly" && ph !== "wait" && (
        <div className={"ca-wal" + (pourOn ? " drain" : "")} style={{ left: cx - 120, top: 18 }}>
          <div className="ca-wnum">{Math.max(0, wc)}</div>
          <div className="ca-wbar"><i className={wc >= PACK_PRICE ? "full" : ""} style={{ width: `${Math.max(6, Math.min(100, (Math.max(0, wc) / PACK_PRICE) * 100))}%` }} /></div>
          <img className="ca-wcoin" src="/worlds/ui/coin.webp" alt="Coins" />
        </div>
      )}
      {ph === "pick" && (
        <>
          <div className="ca-congrats" style={{ top: R0.y - R0.h / 2 - 165 }}>
            <Word3D key={pickKey} text={left > 1 ? `${left} Card Packs!` : "1 Card Pack!"} palette="gold" stagger={40} />
          </div>
          {Array.from({ length: left }, (_, i) => (
            <div key={`${pickKey}-${i}`} className="ca-pk ca-tap" onClick={() => start(1, false, i)}
              style={{ left: R0.x(i) - R0.pw / 2, top: R0.y - R0.h / 2, width: R0.pw, height: R0.h, animationDelay: `${i * 110}ms` }}>
              <img src={`${U}/pack_closed.webp`} alt="Card pack" style={{ animationDelay: `${(i * 0.37).toFixed(2)}s` }} />
            </div>
          ))}
          <div className="ca-poput" style={{ top: R0.y + R0.h / 2 + 44 }}>
            <button className="f3-btn f3-cyan" onClick={() => start(1, false, 0)}>{left > 1 ? "Open Next" : "Open!"}</button>
            {left > 1 && <button className="f3-btn f3-yellow" onClick={() => start(left, true, -1)}>Open All</button>}
          </div>
          <div className="ca-rb ca-tap" style={{ left: 22 }} onClick={onClose}><img src="/worlds/ui/rb_exit.webp" alt="Close" /></div>
        </>
      )}
      {batch && !batch.all && (ph === "pay" || ph === "shake" || ph === "burst") && (
        <div className={"ca-pobox " + ph + ((ph === "pay" || ph === "shake") && RF ? " from" : "") + (batch.pay ? " paid" : "")}
          style={{ left: cx - 160, top: cy - 290, ...(RF ? { ["--fx" as string]: `${RF.x(batch.from) - cx}px`, ["--fy" as string]: `${RF.y - (cy - 20)}px`, ["--fs" as string]: `${RF.pw / 300}` } : {}) } as CSSProperties}>
          <img src={`${U}/${ph === "burst" ? "pack_open" : "pack_closed"}.webp`} alt="" />
          {ph === "shake" && <div className="ca-posh" />}
        </div>
      )}
      {batch && batch.all && (ph === "pay" || ph === "shake" || ph === "burst") && batch.packs.map((_, i) => (
        <div key={i} className={"ca-pk all " + ph} style={{ left: RB.x(i) - RB.pw / 2, top: RB.y - RB.h / 2, width: RB.pw, height: RB.h }}>
          <img src={`${U}/${ph === "burst" ? "pack_open" : "pack_closed"}.webp`} alt="" />
          {ph === "shake" && <div className="ca-posh" />}
        </div>
      ))}
      {ph === "burst" && batch && <div className="ca-pob" style={{ left: cx, top: batch.all ? RB.y : cy - 60 }} />}
      {batch && (ph === "cards" || ph === "fly") && (
        <div className={"ca-congrats" + (ph === "fly" ? " out" : "")} style={{ top: top - 150 }}>
          <Word3D text="Congratulations!" palette="gold" stagger={45} />
        </div>
      )}
      {batch && (ph === "cards" || ph === "fly") && pulls.map((x, i) => {
        const left0 = leftOf(i), tp = topOf(i), on = flipped > i;
        const from = batch.all ? { x: RB.x(packOf[i]), y: RB.y } : null;   // Open All: each card comes out of its own pack
        return (
          <div key={i} ref={el => { cardRefs.current[i] = el; }} className={"ca-pocard" + (ph === "fly" ? " flying" : "")}
            style={{ left: left0, top: tp, width: W,
              ["--dx" as string]: `${(from ? from.x : cx) - left0 - W / 2}px`,
              ...(from ? { ["--dy" as string]: `${from.y - tp - H / 2}px` } : big ? {} : { ["--dy" as string]: `${cy - tp - H / 2}px` }),
              animationDelay: `${i * (big ? 140 : Math.min(140, Math.round(1200 / N)))}ms` } as CSSProperties}>
            <div className={"ca-flip" + (on ? " on" : "")} style={{ width: W, height: H }}>
              <div className="ca-face back"><img src={`${U}/card_back.webp`} alt="" /></div>
              <div className={"ca-face front" + (x.c.gold ? " goldglow" : "")}>
                <Card set={x.set} c={x.c} W={W} have fontPx={big ? 26 : Math.max(12, Math.round(26 * W / 250))} onTap={() => { }}
                  fresh={!big && x.isNew} extra={!big && !x.isNew ? x.pts : undefined} />
              </div>
            </div>
            {big && on && ph !== "fly" && <div className="ca-polrow"><span className={"ca-pol " + (x.isNew ? "new" : "dup")}>{x.isNew ? "NEW CARD!" : `+${x.pts} Swap`}</span></div>}
          </div>
        );
      })}
      {ph === "cards" && done && (
        <div className="ca-poput" style={{ top: big ? cy + 262 : top + gridH + 28 }}>
          <button className="f3-btn f3-green" onClick={fly}>Put in Album!</button>
        </div>
      )}
    </div>
  );
}

// SET COMPLETE screen. Tap anywhere (after the prizes have popped in) = collect.
function SetDone({ set, cx, cy, fx, coinAt, onCollect }: {
  set: CardSet; cx: number; cy: number; fx: () => Fx | null; coinAt: { x: number; y: number }; onCollect: () => void;
}) {
  const [ready, setReady] = useState(false);
  const [going, setGoing] = useState(false);
  const b = BADGE[set.id];
  useEffect(() => {
    play("/celebration/win_fanfare.mp3", 0.7); play(CHIME, 0.3);
    const t = [
      window.setTimeout(() => fx()?.burst(cx - 250, cy - 20, { glow: 260, fairies: 70, embers: 26, w: 220 }), 700),
      window.setTimeout(() => fx()?.burst(cx + 380, cy - 20, { fairies: 40, embers: 14, w: 60 }), 1500),
      window.setTimeout(() => setReady(true), 2300),
    ];
    return () => t.forEach(x => window.clearTimeout(x));
  }, []);
  const collect = () => {
    if (!ready || going) return;
    setGoing(true); play(WHOOSH, 0.75);
    const f = fx();
    f?.emit(900, () => { for (let j = 0; j < 2; j++) f.fairy(cx + (Math.random() - 0.5) * 300, cy + 190, 0.6); });
    window.setTimeout(() => { play("/cookiejar/snd_drop1.mp3", 0.4); }, 350);
    window.setTimeout(() => { fx()?.burst(coinAt.x, coinAt.y, { glow: 120, fairies: 40, embers: 12, w: 50 }); onCollect(); }, 900);
  };
  return (
    <div className={"ca-sd" + (going ? " going" : "")} onClick={collect}>
      <div className="ca-congrats sd" style={{ top: cy - 360 }}><Word3D text="Collection Completed!" palette="gold" stagger={45} /></div>
      <div className="ca-sdrow" style={{ left: cx - 420, top: cy - 140 }}>
        <div className="ca-sdbadge" style={{ ["--c" as string]: b.c, backgroundImage: `url(${cardImg(set.id, b.n)})` } as CSSProperties} />
        <div className="ca-sdname" style={{ ["--c" as string]: b.c } as CSSProperties}>{set.name}</div>
        <div className="ca-sdbar"><i /><span>{set.cards.length} / {set.cards.length}</span></div>
        <div className="ca-sdcheck" />
      </div>
      <div className="ca-sdprize" style={{ top: cy + 165 }}>
        <div className="ca-sdp t" style={{ ["--fx" as string]: `${-cx + 60}px`, ["--fy" as string]: `${cy + 245}px` } as CSSProperties}>
          <img src="/worlds/ui/treat.webp" alt="" /><span>x{SET_PRIZE.treats}</span></div>
        <div className="ca-sdp c" style={{ ["--fx" as string]: `${coinAt.x - cx - 80}px`, ["--fy" as string]: `${coinAt.y - cy - 215}px` } as CSSProperties}>
          <img src="/worlds/ui/coin.webp" alt="" /><span>x{SET_PRIZE.coins}</span></div>
      </div>
      {ready && !going && <div className="ca-sdtap" style={{ top: cy + 345 }}>TAP TO COLLECT</div>}
    </div>
  );
}

// ALBUM COMPLETE party (Andy 10-16): after the last Set Complete screen. The book glows gold, light dots burst, Teacher Andy
// slides in and claps, then 200 coins + 20 treats fly out (the DATABASE already paid 'cards:a1:album' once; this only shows it).
const GIFT = "/worlds/gift";
const CLAPF = ["andy_clap_flat", "andy_clap_mid", "andy_clap_out", "andy_clap_mid"];
function AlbumDone({ cx, cy, fx, coinAt, onCollect }: {
  cx: number; cy: number; fx: () => Fx | null; coinAt: { x: number; y: number }; onCollect: () => void;
}) {
  const [ready, setReady] = useState(false);
  const [going, setGoing] = useState(false);
  const [clapping, setClapping] = useState(false);
  const [fr, setFr] = useState(0);
  useEffect(() => {
    play("/celebration/win_fanfare.mp3", 0.7); play(CHIME, 0.4);
    const t = [
      window.setTimeout(() => fx()?.burst(cx, cy - 40, { glow: 320, fairies: 90, embers: 30, w: 300 }), 600),
      window.setTimeout(() => setClapping(true), 1300),
      window.setTimeout(() => fx()?.burst(cx - 430, cy - 220, { fairies: 40, embers: 14, w: 80 }), 1500),
      window.setTimeout(() => fx()?.burst(cx + 430, cy - 220, { fairies: 40, embers: 14, w: 80 }), 1900),
      window.setTimeout(() => setReady(true), 2600),
      window.setTimeout(() => { setClapping(false); setFr(0); }, 4300),
    ];
    return () => t.forEach(x => window.clearTimeout(x));
  }, []);
  useEffect(() => {
    if (!clapping) return;
    let i = 0; play(`${GIFT}/clap.mp3`, 0.5);
    const id = window.setInterval(() => { i++; setFr(i % 4); if (i % 4 === 0) play(`${GIFT}/clap.mp3`, 0.5); }, 90);
    return () => window.clearInterval(id);
  }, [clapping]);
  const collect = () => {
    if (!ready || going) return;
    setGoing(true); play(WHOOSH, 0.75);
    const f = fx();
    f?.emit(900, () => { for (let j = 0; j < 2; j++) f.fairy(cx + (Math.random() - 0.5) * 300, cy + 190, 0.6); });
    window.setTimeout(() => { play("/cookiejar/snd_drop1.mp3", 0.4); }, 350);
    window.setTimeout(() => { fx()?.burst(coinAt.x, coinAt.y, { glow: 120, fairies: 40, embers: 12, w: 50 }); onCollect(); }, 900);
  };
  return (
    <div className={"ca-sd" + (going ? " going" : "")} onClick={collect}>
      <div className="ca-congrats sd" style={{ top: cy - 380 }}><Word3D text="Album Complete!" palette="gold" stagger={45} /></div>
      <div className="ca-adbook" style={{ left: cx, top: cy - 250 }}><img src={`${U}/album_closed.webp`} alt="" draggable={false} /></div>
      <div className="ca-adandy"><img src={`${GIFT}/${clapping ? CLAPF[fr] : "andy_gift"}.webp`} alt="" draggable={false} /></div>
      <div className="ca-sdprize" style={{ top: cy + 165 }}>
        <div className="ca-sdp t" style={{ ["--fx" as string]: `${-cx + 60}px`, ["--fy" as string]: `${cy + 245}px` } as CSSProperties}>
          <img src="/worlds/ui/treat.webp" alt="" /><span>x{ALBUM_PRIZE.treats}</span></div>
        <div className="ca-sdp c" style={{ ["--fx" as string]: `${coinAt.x - cx - 80}px`, ["--fy" as string]: `${coinAt.y - cy - 215}px` } as CSSProperties}>
          <img src="/worlds/ui/coin.webp" alt="" /><span>x{ALBUM_PRIZE.coins}</span></div>
      </div>
      {ready && !going && <div className="ca-sdtap" style={{ top: cy + 345 }}>TAP TO COLLECT</div>}
    </div>
  );
}

export default function CardAlbum() {
  const { code: rawCode, studentName: rawName } = useParams();
  const code = (rawCode ?? "").toUpperCase(), name = (rawName ?? "").toLowerCase();
  const navigate = useNavigate();
  const isMaster = code === MASTER_CODE;
  const { s, sw, sh } = useFit();
  const cx = sw / 2;
  useClickSfx(true);
  // LOCK (launch step 4): a real kid's prize list decides it (1006 never locked). -1 = still reading.
  const [lockN, setLockN] = useState(isMaster ? 0 : -1);
  useEffect(() => {
    if (isMaster) return;
    let alive = true;
    loadPrizes(code, name).then(list => { if (alive) setLockN(list === undefined ? 0 : lockLeft("album", list, false)); });
    return () => { alive = false; };
  }, [isMaster, code, name]);
  // REAL kids (2026-10-14): unlocked + the album read from the database = the page works. on = show the album.
  const real = !isMaster && isRealCode(code);
  const [cardsLoad, setCardsLoad] = useState<"wait" | "ok" | "fail">(isMaster ? "ok" : "wait");
  const on = isMaster || (real && lockN === 0 && cardsLoad === "ok");

  // Where the kid came from (the world page set this when its Card Album button was tapped).
  const ret = useMemo(() => {
    const r = sessionStorage.getItem("mpe_return_world") || "";
    return r.toLowerCase().includes(`/${code.toLowerCase()}/${name}`) ? r : `/world/${code}/${name}`;
  }, [code, name]);
  const homeWorld: CardSet["world"] = /dino/.test(ret) ? "dino" : /savanna/.test(ret) ? "savanna" : "ocean";

  const [album, setAlbum] = useState(() => isMaster ? demoAlbum() : { owned: {} as Owned, fresh: new Set<string>(), coins: 0, swap: 0 });   // 1006: pretend album (memory only); real kids: read below
  const { owned, fresh } = album;
  useEffect(() => { if (isMaster) demoCoinsSet(album.coins); }, [isMaster, album.coins]);   // 1006: keep the tab's pretend coins in step
  const [poN, setPoN] = useState(0);                                // pack screen: how many packs it holds (0 = closed)
  const scUsed = useRef(false);
  const [setId, setSetId] = useState<number | null>(null);      // null = album home
  const [zoom, setZoom] = useState<{ set: number; c: CardInfo } | null>(null);
  const [phase, setPhase] = useState<"closed" | "opening" | "open" | "closing">("closed");
  const [fontReady, setFontReady] = useState(false);
  const [wiggle, setWiggle] = useState<string | null>(null);
  const [bumps, setBumps] = useState<Record<number, number>>({});
  const [setDone, setSetDone] = useState<number | null>(null);
  // PICK A CARD (Andy 10-16): a full Swap Meter (10 points) = choose ONE missing card. pickOn = the ? cards glow; pickAsk = the chosen card popup.
  const [pickOn, setPickOn] = useState(false);
  const [pickAsk, setPickAsk] = useState<{ set: number; c: CardInfo; ph: "ask" | "wait" | "got" } | null>(null);
  const pickBusy = useRef(false);
  const [albumDone, setAlbumDone] = useState(false);   // the ALBUM COMPLETE party is showing
  const albumDue = useRef(false);                      // the whole album was finished: party after the last Set Complete screen
  const [swapHelp, setSwapHelp] = useState(false);   // Swap Meter rules popup (tap the meter, Andy 10-16)
  const owedAlbum = useRef(0);                         // real kids: album prize paid by the DB but not yet collected on screen   // a SET COMPLETE screen is showing for this set
  const doneQ = useRef<number[]>([]);                               // sets this pack completed (shown after the cards land)
  const albumRef = useRef<{ owned: Owned } | null>(null);
  // REAL kids: read the album (cards, coins, swap). NEW = owned and not in the seen list (cardSeen = 'card:<set>:<n>' in letters).
  const dbAfter = useRef<CardPacks | null>(null);   // the database's numbers after the last opening (shown when the pack screen closes)
  const paidSets = useRef<number[]>([]);             // sets the DATABASE paid this visit (only these get the set prize screen)
  const owedSets = useRef(0);                        // set prizes paid but not yet collected on screen
  useEffect(() => {
    if (!real || lockN !== 0) return;
    let alive = true;
    loadCards(code, name).then(r => {
      if (!alive) return;
      if (!r) { setCardsLoad("fail"); return; }
      const fresh = new Set<string>();
      CARD_SETS.forEach(st => st.cards.forEach(c => { if ((r.cards[key(st.id, c.n)] ?? 0) > 0 && !r.seen.includes(cardSeen(st.id, c.n))) fresh.add(key(st.id, c.n)); }));
      setAlbum({ owned: r.cards, fresh, coins: r.coins, swap: r.swap });
      setCardsLoad("ok");
    });
    return () => { alive = false; };
  }, [real, lockN, code, name]);
  // HOW TO PLAY before the book pops up (first 3 times, cloud 'seen' like the games; id 'album'). '?' reopens it. (Andy 2026-10-11)
  const howReady = useHowtoSeen(code, name);
  const [how, setHow] = useState<"ask" | "open" | "done">("ask");
  const [go, setGo] = useState(false);
  useEffect(() => {
    if (!on || how !== "ask" || !howReady) return;
    if (wantHowto("album")) setHow("open"); else { setHow("done"); setGo(true); }
  }, [on, how, howReady]);
  const closeHow = () => { if (!go) { seenHowto("album"); setGo(true); } setHow("done"); };

  const stageRef = useRef<HTMLDivElement>(null);
  const cvRef = useRef<HTMLCanvasElement>(null);
  const fxRef = useRef<Fx | null>(null);
  // The table picture covers the stage; the book shrinks (only if needed) to sit between the cocoa and the storybooks.
  const tk = Math.max(sw / TBL.w, sh / TBL.h), tox = (sw - TBL.w * tk) / 2;
  const roomHalf = Math.min(cx - (TBL.left * tk + tox), TBL.right * tk + tox - cx) - 26;
  const bkHome = Math.min(1, roomHalf / (HOME.bookW / 2)), bkSet = Math.min(1, roomHalf / (SETP.bookW / 2));
  const pillL = Math.min(sw - 252, TBL.plantL * tk + tox - 246);   // coin pill sits left of the plant
  const [leaving, setLeaving] = useState(false);
  const geo = useRef({ cx, sh, s, bk: bkHome }); geo.current = { cx, sh, s, bk: bkHome };
  const fx = () => fxRef.current;
  useEffect(() => {
    if (cvRef.current) fxRef.current = new Fx(cvRef.current);
    return () => { fxRef.current?.stop(); fxRef.current = null; };
  }, [on]);

  useEffect(() => {
    let on = true;
    document.fonts?.load("20px 'Titan One'").then(() => on && setFontReady(true)).catch(() => on && setFontReady(true));
    const t = window.setTimeout(() => on && setFontReady(true), 1500);
    return () => { on = false; window.clearTimeout(t); };
  }, []);

  // Centre of a set's badge on the album home, in stage px (cards fly there).
  const getTarget = (set: number) => {
    const el = document.querySelector(`[data-set="${set}"] .ca-badge`), st = stageRef.current;
    if (!el || !st) return null;
    const r = el.getBoundingClientRect(), b = st.getBoundingClientRect(), k = geo.current.s;
    return { x: (r.left + r.width / 2 - b.left) / k, y: (r.top + r.height / 2 - b.top) / k };
  };

  // OPEN-ALBUM: the closed cover glimmers (fairy dots round the edge, embers rising), then swings open (2 doors) in a big
  // yellow glow + ember shower, then the set badges pop in, each with its own little sparkle.
  useEffect(() => {
    if (!on || !go) return;
    const book = () => {
      const { cx: X, bk } = geo.current, BW = HOME.bookW * bk, BH = BW * BOOK_H / BOOK_W;
      return { l: X - BW / 2, t: HOME.bookTop, w: BW, h: BH };
    };
    const ts = [
      window.setTimeout(() => play(WHOOSH, 0.85), 30),   // the book whooshes up from the bottom (Andy 20:14)
      window.setTimeout(() => {
        const f = fx(), o = book(), b = { l: o.l + o.w / 4, t: o.t, w: o.w / 2, h: o.h };   // the closed book = the middle half
        f?.emit(850, () => {
          for (let j = 0; j < 2; j++) {
            const u = Math.random(), side = Math.floor(Math.random() * 4);
            const x = side < 2 ? b.l + u * b.w : side === 2 ? b.l : b.l + b.w, y = side === 0 ? b.t : side === 1 ? b.t + b.h : b.t + u * b.h;
            f.fairy(x, y, 0.35);
          }
          if (Math.random() < 0.5) f.ember(b.l + Math.random() * b.w, b.t + b.h - 10, 0.8);
        });
      }, 900),
      window.setTimeout(() => {
        setPhase("opening"); play(CHIME, 0.7); play(`${U}/album_pages.mp3`, 0.4);   // chime + cover/pages turning (Andy 19:32)
        const f = fx(), b = book(), mx = b.l + b.w / 2, my = b.t + b.h / 2;
        f?.burst(mx, my, { glow: 520, embers: 90, fairies: 160, w: b.w * 0.8, h: b.h * 0.7, sp: 1.6 });
        f?.emit(2100, () => {
          if (Math.random() < 0.9) f.ember(b.l + 60 + Math.random() * (b.w - 120), b.t + b.h * (0.45 + Math.random() * 0.5), 1.2);
          if (Math.random() < 0.9) f.fairy(b.l + Math.random() * b.w, b.t + Math.random() * b.h, 0.5);
        });
      }, 1750),
      window.setTimeout(() => { setPhase("open"); play(`${U}/album_open.mp3`, 0.8); }, 3650),   // victory fanfare as the open book lands
      ...CARD_SETS.map((x, i) => window.setTimeout(() => {
        const p = getTarget(x.id); if (p) fx()?.burst(p.x, p.y, { fairies: 16, embers: 4, w: 110 });
      }, 3770 + i * 70)),
    ];
    return () => ts.forEach(t => window.clearTimeout(t));
  }, [on, go]);

  // BACKGROUND MUSIC (Andy 2026-10-08): coffee jazz, looping, at the levelled volume. Starts ~2.5s after the open book lands
  // (the fanfare plays first), fades in; fades out when the book closes. Follows the music on/off setting of the world the kid
  // came from (Ocean = mpe_music, others = mpe_<world>_music).
  const musicRef = useRef<HTMLAudioElement | null>(null);
  const fadeT = useRef(0);
  const fadeTo = (to: number, ms: number, then?: () => void) => {
    const a = musicRef.current; if (!a) return;
    window.clearInterval(fadeT.current);
    const from = a.volume, t0 = performance.now();
    fadeT.current = window.setInterval(() => {
      const k = Math.min(1, (performance.now() - t0) / ms); a.volume = from + (to - from) * k;
      if (k >= 1) { window.clearInterval(fadeT.current); then?.(); }
    }, 40);
  };
  useEffect(() => {
    if (!on || !go) return;
    const w = (ret.match(/\/(dino|savanna|snowy|taiwan)\//) || [])[1];   // + taiwan (2026-10-08: from Taiwan it read Ocean's mpe_music)
    const off = (() => { try { return localStorage.getItem(w ? `mpe_${w}_music` : "mpe_music") === "off"; } catch { return false; } })();
    if (off) return;
    const a = new Audio(`${U}/album_music.mp3`); a.loop = true; a.volume = 0; musicRef.current = a;
    const t = window.setTimeout(() => { a.play().then(() => fadeTo(1, 2000)).catch(() => { }); }, 6100);
    return () => { window.clearTimeout(t); window.clearInterval(fadeT.current); a.pause(); musicRef.current = null; };
  }, [on, ret, go]);

  const countIn = (st: CardSet) => st.cards.filter(c => owned[key(st.id, c.n)]).length;
  const total = CARD_SETS.reduce((a, st) => a + countIn(st), 0);
  const packs = Math.floor(album.coins / PACK_PRICE);
  const meter = packs > 0 ? PACK_PRICE : album.coins % PACK_PRICE;

  // "You need N more coins!" (Andy 10-14): tap the pack or OPEN! while it is not ready.
  const [needPop, setNeedPop] = useState<null | { n: number; k: number }>(null);
  useEffect(() => { if (!needPop) return; const t = window.setTimeout(() => setNeedPop(null), 3000); return () => window.clearTimeout(t); }, [needPop]);
  const needMore = () => { if (packs > 0 || poN || phase !== "open" || setId || setDone) return; setNeedPop({ n: PACK_PRICE - (album.coins % PACK_PRICE), k: Date.now() }); };
  const walletCoinRef = useRef<HTMLImageElement>(null);
  const walletCoinAt = () => {   // the wallet coin in stage px (set prize coins fly there)
    const el = walletCoinRef.current, st = stageRef.current;
    if (!el || !st) return { x: 100, y: sh - 120 };
    const r = el.getBoundingClientRect(), b = st.getBoundingClientRect(), k = geo.current.s;
    return { x: (r.left + r.width / 2 - b.left) / k, y: (r.top + r.height / 2 - b.top) / k };
  };
  // NEW SWAP DOTS (Andy 10-16): when the pack screen closes, the dots won turn gold one by one (ting each) + a fading '+N'.
  const swapBefore = useRef<number | null>(null);
  const [swapAnim, setSwapAnim] = useState<{ from: number; to: number; k: number } | null>(null);
  useEffect(() => {
    if (poN > 0) { if (swapBefore.current === null) swapBefore.current = album.swap; return; }
    const from = swapBefore.current; swapBefore.current = null;
    if (from === null || album.swap <= from) return;
    const to = album.swap, k = Date.now();
    setSwapAnim({ from, to, k });
    const ts = Array.from({ length: to - from }, (_, j) => window.setTimeout(() => ting(j), 500 + j * 260));
    ts.push(window.setTimeout(() => setSwapAnim(a => (a && a.k === k ? null : a)), 900 + (to - from) * 260 + 1400));
    return () => ts.forEach(x => window.clearTimeout(x));
  }, [poN]);   // eslint-disable-line react-hooks/exhaustive-deps
  const openPack = () => {
    if (!(packs > 0 && !poN && phase === "open" && !setId && !setDone)) return;
    setPoN(Math.min(packs, MAX_OPEN));
  };
  // Draw n packs (each sees the cards the earlier ones gave, so NEW stays right). DISPLAY ONLY - the real draw = database.
  const drawPacks = (n: number): Pull[][] => {
    albumRef.current = { owned };
    const got: Owned = { ...owned }, out: Pull[][] = [];
    // TEST (1006 only, ?sc=1): the first pack brings Busy Ocean's missing cards -> Collection Completed screen
    const sc = new URLSearchParams(window.location.search).get("sc") === "1" && !scUsed.current;
    for (let i = 0; i < n; i++) {
      let p = i === 0 && sc ? CARD_SETS[0].cards.filter(c => !got[key(1, c.n)]).slice(0, 3).map(c => ({ set: 1, c, isNew: true, pts: 0 })) : [];
      if (i === 0 && sc) scUsed.current = true;
      if (!p.length) p = drawPack(got);
      p.forEach(x => { const k = key(x.set, x.c.n); got[k] = (got[k] ?? 0) + 1; });
      out.push(p);
    }
    return out;
  };
  // REAL kids: the DATABASE opens the packs FIRST (takes the coins, picks the cards, pays a finished set once), then the
  // animation shows exactly those cards. No answer / not enough coins = the pack screen closes (nothing shown that was not saved).
  const drawReal = async (n: number): Promise<Pull[][] | null> => {
    const r = await openPacks(code, name, n);
    if (!r) return null;                                                           // failed / no row: nothing was taken
    if (!r.ok || !r.packs) { setAlbum(a => ({ ...a, coins: r.coins, swap: r.swap })); return null; }
    dbAfter.current = r;
    paidSets.current = [...paidSets.current, ...(r.sets ?? [])];
    if (r.album) { albumDue.current = true; owedAlbum.current = 1; }
    const out = r.packs.map(pk => pk.map(x => ({ set: x.set, c: CARD_SETS[x.set - 1]?.cards.find(c => c.n === x.n), isNew: x.new, pts: x.pts })));
    if (out.some(pk => pk.some(x => !x.c))) return null;                         // unknown card: saved, shown after the sync
    albumRef.current = { owned };
    return out as Pull[][];
  };
  // When the pack screen closes: the shown numbers = the database's (set prizes not yet collected on screen are left out).
  useEffect(() => {
    if (!real || poN > 0 || !dbAfter.current) return;
    const r = dbAfter.current; dbAfter.current = null;
    setAlbum(a => {
      const fresh2 = new Set(a.fresh);
      Object.keys(r.cards).forEach(k => { if ((r.cards[k] ?? 0) > 0 && !(a.owned[k] > 0)) fresh2.add(k); });
      return { ...a, owned: r.cards, fresh: fresh2, coins: r.coins - SET_PRIZE.coins * owedSets.current - ALBUM_PRIZE.coins * owedAlbum.current, swap: r.swap };
    });
  }, [real, poN]);
  const batchDone = () => { albumRef.current = null; const n = doneQ.current.shift(); if (n) setSetDone(n); };
  const collectSet = () => {
    setAlbum(a => ({ ...a, coins: a.coins + SET_PRIZE.coins }));   // 1006: shown only - the database pays in the cloud step
    if (real) owedSets.current = Math.max(0, owedSets.current - 1);   // real kids: the DATABASE already paid it - this only moves the shown number
    setSetDone(null);
    const n = doneQ.current.shift(); if (n) window.setTimeout(() => setSetDone(n), 400);
    else if (albumDue.current) { albumDue.current = false; window.setTimeout(() => setAlbumDone(true), 500); }
  };
  const collectAlbum = () => { setAlbum(a => ({ ...a, coins: a.coins + ALBUM_PRIZE.coins })); owedAlbum.current = 0; setAlbumDone(false); };   // shown number only (DB already paid)
  const onFlyStart = (n: number) => setAlbum(a => ({ ...a, coins: a.coins - PACK_PRICE * n }));
  const onLand = (x: Pull) => {
    const cur = albumRef.current?.owned ?? owned, kk0 = key(x.set, x.c.n);
    const full = (o: Owned) => CARD_SETS[x.set - 1].cards.every(c => (o[key(x.set, c.n)] ?? 0) > 0);
    const after: Owned = { ...cur, [kk0]: (cur[kk0] ?? 0) + 1 };
    if (!full(cur) && full(after) && !doneQ.current.includes(x.set) && (!real || paidSets.current.includes(x.set))) { doneQ.current.push(x.set); if (real) owedSets.current++; }
    if (!real && !allOwned(cur) && allOwned(after)) albumDue.current = true;   // 1006: pretend album finished
    if (albumRef.current) albumRef.current = { owned: after };
    setAlbum(a => {
      const kk = key(x.set, x.c.n), owned2: Owned = { ...a.owned, [kk]: (a.owned[kk] ?? 0) + 1 }, fresh2 = new Set(a.fresh);
      if (x.isNew) fresh2.add(kk);
      return { ...a, owned: owned2, fresh: fresh2, swap: Math.min(10, a.swap + x.pts) };
    });
    setBumps(b => ({ ...b, [x.set]: (b[x.set] ?? 0) + 1 }));
  };
  // CLOSE (Andy 19:32): the X on the album home plays the opening backwards (top page first, then the other pages, then the
  // cover swings shut and the book slides back), chime at the start, a soft thump as the cover lands, then back to the world.
  const closing = useRef(false);
  const closeAlbum = () => {
    if (closing.current) return;
    if (phase !== "open") { navigate(ret); return; }
    closing.current = true;
    setPhase("closing"); play(CHIME, 0.7);
    fadeTo(0, 1200, () => musicRef.current?.pause());   // music fades out as the book closes
    const f = fx(), { cx: X, bk } = geo.current, BW = HOME.bookW * bk, BH = BW * BOOK_H / BOOK_W;
    f?.burst(X, HOME.bookTop + BH / 2, { fairies: 90, embers: 30, w: BW * 0.8, h: BH * 0.6 });
    window.setTimeout(() => play(`${U}/album_close.mp3`, 0.4), 1650);
    window.setTimeout(() => { const g = fx(); g?.burst(X - BW / 4, HOME.bookTop + BH / 2, { glow: 260, fairies: 60, embers: 24, w: BW * 0.45, h: BH * 0.8, sp: 1.2 }); }, 1700);
    window.setTimeout(() => play(WHOOSH, 0.85), 2250);   // ...and whooshes out at the bottom, right after its little hop up (Andy 20:17)
    window.setTimeout(() => setLeaving(true), 2400);   // soft fade, then the world
    window.setTimeout(() => navigate(ret), 2750);
  };

  // Leaving a set page = its NEW tags have been seen.
  const goSet = (next: number | null) => {
    if (setId && real) [...fresh].filter(k => k.startsWith(`${setId}-`)).forEach(k => { const [a, b] = k.split("-").map(Number); markSeen(code, name, cardSeen(a, b)); });   // cloud: seen
    if (setId) setAlbum(a => ({ ...a, fresh: new Set([...a.fresh].filter(k => !k.startsWith(`${setId}-`))) }));
    setSetId(next);
  };
  const tapCard = (st: CardSet, c: CardInfo) => {
    if (pickOn && !owned[key(st.id, c.n)]) { setPickAsk({ set: st.id, c, ph: "ask" }); return; }
    if (owned[key(st.id, c.n)]) setZoom({ set: st.id, c });
    else { setWiggle(key(st.id, c.n)); window.setTimeout(() => setWiggle(null), 500); }
  };

  // PICK IT: real kids = the DATABASE first (takes the 10 points, gives the card, pays a finished set once); then the card shows.
  // No answer / refused = nothing changes on screen except the database's own numbers. 1006 = pretend (memory only).
  const doPick = async () => {
    const p = pickAsk; if (!p || p.ph !== "ask" || pickBusy.current) return;
    pickBusy.current = true; setPickAsk({ ...p, ph: "wait" });
    const kk = key(p.set, p.c.n);
    const full = (o: Owned) => CARD_SETS[p.set - 1].cards.every(c => (o[key(p.set, c.n)] ?? 0) > 0);
    if (real) {
      const r = await pickCard(code, name, p.set, p.c.n);
      pickBusy.current = false;
      if (!r || !r.ok) {
        if (r) setAlbum(a => ({ ...a, owned: r.cards, swap: r.swap, coins: r.coins - SET_PRIZE.coins * owedSets.current - ALBUM_PRIZE.coins * owedAlbum.current }));
        setPickAsk(null); setPickOn(false); return;
      }
      paidSets.current = [...paidSets.current, ...(r.sets ?? [])];
    if (r.album) { albumDue.current = true; owedAlbum.current = 1; }
      if (!full(owned) && full(r.cards) && (r.sets ?? []).includes(p.set) && !doneQ.current.includes(p.set)) { doneQ.current.push(p.set); owedSets.current++; }
      setAlbum(a => { const f2 = new Set(a.fresh); f2.add(kk); return { ...a, owned: r.cards, fresh: f2, swap: r.swap, coins: r.coins - SET_PRIZE.coins * owedSets.current - ALBUM_PRIZE.coins * owedAlbum.current }; });
    } else {
      pickBusy.current = false;
      if (!full(owned) && full({ ...owned, [kk]: 1 }) && !doneQ.current.includes(p.set)) doneQ.current.push(p.set);
      if (!allOwned(owned) && allOwned({ ...owned, [kk]: 1 })) albumDue.current = true;
      setAlbum(a => { const f2 = new Set(a.fresh); f2.add(kk); return { ...a, owned: { ...a.owned, [kk]: 1 }, fresh: f2, swap: Math.max(0, a.swap - 10) }; });
    }
    play(CHIME, 0.7); setPickOn(false); setPickAsk({ ...p, ph: "got" });
  };
  const closePick = () => {
    const was = pickAsk?.ph; if (was === "wait") return;
    setPickAsk(null);
    if (was === "got") { const n = doneQ.current.shift(); if (n) window.setTimeout(() => setSetDone(n), 300); }
  };

  // STILL READING THE CLOUD (Andy 10-17 iPad: a flash of 'Card Album' + 'Back' on plain purple before the album): show only the
  // table picture. If the cloud is very slow (4s), the old screen with its Back button comes back so a kid is never stuck.
  const reading = !isMaster && (lockN < 0 || (real && lockN === 0 && cardsLoad === "wait"));
  const [slow, setSlow] = useState(false);
  useEffect(() => { if (!reading) return; const t = window.setTimeout(() => setSlow(true), 4000); return () => window.clearTimeout(t); }, [reading]);
  if (!on && reading && !slow) return (
    <div className="ca-root"><style>{CSS}</style><div className="ca-table" style={{ backgroundImage: `url(${TABLE_BG})`, animation: "none" }} /></div>
  );
  if (!on) return (
    <div className="ca-root"><style>{FONTS + FUN3D_CSS + CSS}</style>
      <div className="ca-soon">
        <div style={{ fontSize: 48 }}>Card Album</div>
        {lockN > 0 ? <><img src={LOCK_IMG} alt="" style={{ height: 150, margin: "18px 0 6px", filter: "drop-shadow(0 8px 8px rgba(0,0,0,.35))" }} />
        <div style={{ fontSize: 34, lineHeight: "44px", textAlign: "center", margin: "0 0 30px" }}><LockMsg left={lockN} nColor="#7fd8ff" /></div></>
          : <div style={{ fontSize: 30, margin: "10px 0 30px" }}>{lockN < 0 || (real && lockN === 0 && cardsLoad === "wait") ? "" : real && cardsLoad === "fail" ? "Please try again later." : "Coming soon!"}</div>}
        <button className="f3-btn f3-yellow" onClick={() => navigate(ret)}>Back</button>
      </div>
    </div>
  );

  // The inside of a page's gold frame for a book drawn bw wide at (left, top), less a little padding.
  const pageBox = (bw: number, left: number, top: number, p: typeof PAGE_L, pad = 0) => {
    const k = bw / BOOK_W;
    return { left: left + (p.x + pad) * k, top: top + (p.y + pad) * k, width: (p.w - 2 * pad) * k, height: (p.h - 2 * pad) * k };
  };

  const st = setId ? CARD_SETS[setId - 1] : null;

  // ---------- ALBUM HOME ----------
  const homeView = () => {
    const BW = HOME.bookW, BH = BW * BOOK_H / BOOK_W, bl = cx - BW / 2, bt = HOME.bookTop;
    const pages = [pageBox(BW, bl, bt, PAGE_L, 12), pageBox(BW, bl, bt, PAGE_R, 12)];
    const colW = pages[0].width / 3;
    return (
      <>
        <div className="ca-title ca-inT" style={{ left: cx, top: HOME.titleTop }}><Word3D text="My Card Album" palette="gold" stagger={40} /></div>
        <Ribbon img={`${U}/ribbon_blue.webp`} left={cx - HOME.ribW / 2} top={HOME.ribTop} width={HOME.ribW} stroke="#17237a"
          line1="FINISH THE WHOLE ALBUM TO WIN" prize={<PrizeRow treats={ALBUM_PRIZE.treats} coins={ALBUM_PRIZE.coins} badge />} />
        <div className="ca-bar green ca-inT" style={{ left: cx - 200, top: HOME.barTop, width: 400 }}>
          <i style={{ width: `${Math.max(6, (total / CARDS_TOTAL) * 100)}%` }} /><span>{total} / {CARDS_TOTAL}</span>
        </div>

        <div className="ca-bk" style={{ transform: `scale(${bkHome})`, transformOrigin: `${cx}px ${bt}px` }}>
        <div className="ca-book" style={{ left: bl, top: bt, width: BW, height: BH }}>
          <img className={"ca-bookimg" + (phase !== "open" ? " hide" : "")} src={`${U}/album_open.webp`} alt="" />
        </div>
        {phase === "open" && [0, 1].map(pi => (
          <div key={pi} className="ca-sets" style={pages[pi]}>
            {CARD_SETS.slice(pi * 6, pi * 6 + 6).map((x, i) => {
              const n = countIn(x), done = n === x.cards.length, b = BADGE[x.id];
              const isNew = x.cards.some(c => fresh.has(key(x.id, c.n)));
              return (
                <div key={x.id} data-set={x.id} className="ca-set ca-tap" style={{ ["--c" as string]: b.c, animationDelay: `${(pi * 6 + i) * 70}ms` } as CSSProperties}
                  onClick={() => !poN && goSet(x.id)}>
                  <div key={`b${bumps[x.id] ?? 0}`} className={"ca-badge" + (bumps[x.id] ? " bump" : "")} style={{ backgroundImage: `url(${cardImg(x.id, b.n)})` }} />
                  {bumps[x.id] ? <div key={`f${bumps[x.id]}`} className="ca-flash" /> : null}
                  <div className="ca-name" style={{ maxWidth: colW - 8 }}><span style={{ transform: `scaleX(${squeeze(x.name, 16, colW - 34)})` }}>{x.name}</span></div>
                  {done ? <div className="ca-done">COMPLETED!</div>
                    : <div className="ca-bar blue small"><i style={{ width: `${Math.max(8, n * 10)}%` }} /><span>{n}/{x.cards.length}</span></div>}
                  {isNew && <div className="ca-tag new set">NEW</div>}
                </div>
              );
            })}
          </div>
        ))}
        {phase !== "open" && (
          <div className={"ca-b3 " + phase} style={{ left: bl, top: bt, width: BW, height: BH }}>
            <div className="ca-b3glow" />
            <div className="ca-b3base" style={{ backgroundImage: `url(${U}/album_open.webp)` }} />
            <div className="ca-b3edge r" /><div className="ca-b3edge b" />
            {[3, 2, 1].map((z, i) => (
              <div key={z} className="ca-b3pg" style={{ ["--z" as string]: `${z}px`, animationDelay: phase === "closing" ? `${(z - 1) * 160}ms` : `${380 + i * 210}ms` } as CSSProperties}>
                <div className="ca-b3f front" /><div className="ca-b3f back" />
              </div>
            ))}
            <div className="ca-b3cv">
              <div className="ca-b3f front" style={{ backgroundImage: `url(${U}/album_cover.webp)` }} />
              <div className="ca-b3f back" style={{ backgroundImage: `url(${U}/album_open.webp)` }} />
            </div>
          </div>
        )}
        {phase === "opening" && <div className="ca-glowwrap" style={{ left: bl, top: bt, width: BW, height: BH }}><div className="ca-pageglow" /><div className="ca-burst" /></div>}
        </div>

        <div className="ca-packbox ca-inL" style={{ top: sh - 336 }}>
          <div className={"ca-pack ca-tap" + (packs ? " ready" : "")} onClick={packs ? openPack : needMore}>
            <img src={`${U}/pack_closed.webp`} alt="Card pack" />
            {packs > 0 && <div className="ca-x">x{packs}</div>}
          </div>
          <button className={"ca-open" + (packs ? "" : " off")} onClick={packs ? openPack : needMore}>OPEN!</button>
          {needPop && <div key={needPop.k} className="ca-needbub">Win <span>{needPop.n}</span> more coins!</div>}
          <div className={"ca-swap ca-tap" + (album.swap >= 10 ? " full" : "")} onClick={() => { if (phase === "open" && !poN && !setDone && !pickOn) setSwapHelp(true); }}>{Array.from({ length: 10 }, (_, i) => {
            const pop = !!swapAnim && i >= swapAnim.from && i < swapAnim.to;
            return <b key={i + (pop ? "p" + swapAnim!.k : "")} className={(i < album.swap ? "on" : "") + (pop ? " pop" : "")} style={pop ? { animationDelay: `${500 + (i - swapAnim!.from) * 260}ms` } : undefined} />;
          })}
          {swapAnim && <span key={swapAnim.k} className="ca-swplus">+{swapAnim.to - swapAnim.from}</span>}</div>
          {album.swap >= 10 && !pickOn
            ? <button className="ca-open ca-pickbtn" onClick={() => { if (phase === "open" && !poN && !setDone) setPickOn(true); }}>PICK A CARD!</button>
            : <div className="ca-swapl ca-tap" onClick={() => { if (phase === "open" && !poN && !setDone && !pickOn) setSwapHelp(true); }}>Swap Meter <b className="ca-swq">?</b></div>}
        </div>
      </>
    );
  };

  // ---------- SET PAGE ----------
  const setView = (x: CardSet) => {
    const BW = SETP.bookW, BH = BW * BOOK_H / BOOK_W, bl = cx - BW / 2, bt = SETP.bookTop;
    const pages = [pageBox(BW, bl, bt, PAGE_L, 6), pageBox(BW, bl, bt, PAGE_R, 6)];
    const n = countIn(x), CW = SETP.cardW, fontPx = 17;
    return (
      <>
        <div className="ca-title set ca-inT" style={{ left: cx }}><Word3D key={x.id} text={x.name} palette="blue" stagger={35} /></div>
        <Ribbon img={`${U}/ribbon_gold.webp`} left={cx - SETP.ribW / 2} top={SETP.ribTop} width={SETP.ribW} stroke="#8a4a05"
          line1="FINISH THE SET TO WIN" prize={<PrizeRow treats={SET_PRIZE.treats} coins={SET_PRIZE.coins} />} />
        <div className="ca-bar blue ca-inT" style={{ left: cx - 150, top: SETP.barTop, width: 300 }}>
          <i style={{ width: `${Math.max(6, n * 10)}%` }} /><span>{n} / {x.cards.length}</span>
        </div>
        <div className="ca-bk" style={{ transform: `scale(${bkSet})`, transformOrigin: `${cx}px ${bt}px` }}>
        <div className="ca-book" style={{ left: bl, top: bt, width: BW, height: BH }}>
          <img className="ca-bookimg" src={`${U}/album_open.webp`} alt="" />
        </div>
        {[0, 1].map(pi => (
          <div key={x.id + "-" + pi} className="ca-cards" style={pages[pi]}>
            {[x.cards.slice(pi * 5, pi * 5 + 3), x.cards.slice(pi * 5 + 3, pi * 5 + 5)].map((row, ri) => (
              <div key={ri} className="ca-row">
                {row.map(c => {
                  const kk = key(x.id, c.n), cnt = owned[kk] ?? 0;
                  return (
                    <div key={c.n} className={wiggle === kk ? "ca-wig" : undefined}>
                      <Card set={x.id} c={c} W={CW} have={cnt > 0} fresh={fresh.has(kk)} extra={cnt > 1 ? cnt - 1 : 0} fontPx={fontPx} onTap={() => tapCard(x, c)} />
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        ))}
        <button className="ca-arrow l" style={{ left: bl - 18, top: bt + BH / 2 - 55 }} onClick={() => goSet(x.id === 1 ? 12 : x.id - 1)}>{"‹"}</button>
        <button className="ca-arrow r" style={{ left: bl + BW - 56, top: bt + BH / 2 - 55 }} onClick={() => goSet(x.id === 12 ? 1 : x.id + 1)}>{"›"}</button>
        </div>
      </>
    );
  };

  return (
    <div className={"ca-root" + (leaving ? " leaving" : "")}>
      <style>{FONTS + FUN3D_CSS + CSS}</style>
      <div ref={stageRef} className={"ca-stage" + (go ? " go" : "") + (pickOn && !pickAsk ? " ca-picking" : "")} data-font={fontReady ? 1 : 0} onScroll={e => { e.currentTarget.scrollTop = 0; e.currentTarget.scrollLeft = 0; }} style={{ width: sw, height: sh, transform: `translate(-50%,-50%) scale(${s})` }}>
        <div className="ca-table" style={{ backgroundImage: `url(${TABLE_BG})` }} />

        {go && (st ? setView(st) : homeView())}

        {go && phase === "open" && !poN && !setDone && <div className="ca-rb ca-tap ca-inT" style={{ left: 108 }} onClick={() => setHow("open")}><img src="/worlds/ui/rb_help.webp" alt="How to play" /></div>}
        <div className="ca-rb ca-tap ca-inT" style={{ left: 22 }} onClick={() => (poN || setDone ? undefined : st ? goSet(null) : closeAlbum())}>
          <img src="/worlds/ui/rb_exit.webp" alt={st ? "Back to album" : "Exit"} />
        </div>
        {/* PIGGY BANK WALLET (Andy 10-14 21:31): top right; number = ALL my coins, bar = how close to a pack (full at 200+) */}
        <div className={"ca-wal ca-inR" + (needPop ? " nope" : "")} style={{ left: pillL, top: 16 }}>
          <div className="ca-wnum">{album.coins}</div>
          <div className="ca-wbar"><i className={packs ? "full" : ""} style={{ width: `${Math.max(6, Math.min(100, (album.coins / PACK_PRICE) * 100))}%` }} /></div>
          <img ref={walletCoinRef} className="ca-wcoin" src="/worlds/ui/coin.webp" alt="Coins" />
        </div>
        {isMaster && <div className="ca-teacher ca-inR" style={{ top: 104, left: pillL - 80 }}>Teacher view: nothing is saved</div>}{/* 1006 only (was shown to real kids too) */}

        {poN > 0 && <PackOpen count={poN} coins={album.coins} cx={cx} cy={sh / 2} fx={fx} draw={real ? drawReal : drawPacks} getTarget={getTarget} onFlyStart={onFlyStart}
          onLand={onLand} onBatchDone={batchDone} hold={setDone !== null} onClose={() => setPoN(0)} />}
        {setDone && <SetDone set={CARD_SETS[setDone - 1]} cx={cx} cy={sh / 2} fx={fx} coinAt={walletCoinAt()} onCollect={collectSet} />}
        {albumDone && <AlbumDone cx={cx} cy={sh / 2} fx={fx} coinAt={walletCoinAt()} onCollect={collectAlbum} />}
        {pickOn && !pickAsk && !setDone && !poN && phase === "open" && (
          <div className="ca-pickbar">
            <span>{setId ? "Tap a ? card to pick it!" : "Open a set, then tap a ? card!"}</span>
            <div className="ca-tap ca-pickx" onClick={() => setPickOn(false)}><img src="/worlds/ui/rb_exit.webp" alt="Cancel" /></div>
          </div>
        )}
        {pickAsk && (
          <div className="ca-zoom">
            <div key={pickAsk.ph === "got" ? "got" : "ask"} className={"ca-zcard" + (pickAsk.ph === "got" ? " ca-pickgot" : "")}>
              <Card set={pickAsk.set} c={pickAsk.c} W={340} have={pickAsk.ph === "got"} fresh={pickAsk.ph === "got"} fontPx={35} onTap={() => { }} />
            </div>
            {pickAsk.ph !== "got" && <button className={"ca-open ca-pickgo" + (pickAsk.ph === "wait" ? " off" : "")} onClick={doPick}>PICK IT!</button>}
            {pickAsk.ph !== "wait" && <div className="ca-rb ca-tap ca-zx" onClick={closePick}><img src="/worlds/ui/rb_exit.webp" alt="Close" /></div>}
          </div>
        )}
        {zoom && (
          <div className="ca-zoom">
            <div className="ca-zcard">
              <Card set={zoom.set} c={zoom.c} W={340} have fresh={false} fontPx={35} onTap={() => { }} />
            </div>
            <div className="ca-rb ca-tap ca-zx" onClick={() => setZoom(null)}><img src="/worlds/ui/rb_exit.webp" alt="Close" /></div>
          </div>
        )}
        <canvas ref={cvRef} className="ca-fx" width={Math.round(sw)} height={Math.round(sh)} style={{ width: sw, height: sh }} aria-hidden="true" />
      </div>
      {how === "open" && <HowToPlay {...ALBUM_HOWTO} needOk={!go && firstHowto("album")} onDone={closeHow} />}
      {swapHelp && <HowToPlay {...SWAP_HOWTO} onDone={() => setSwapHelp(false)} />}{/* outside the scaled stage (it fits itself to the window) */}
    </div>
  );
}

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Lilita+One&family=Titan+One&display=swap');`;
const CSS = `
.ca-root{position:fixed;inset:0;overflow:hidden;background:#000;user-select:none;-webkit-user-select:none}
.ca-stage{position:absolute;left:50%;top:50%;transform-origin:center center;overflow:hidden;overflow:clip;font-family:'Titan One',sans-serif;color:#fff}
.ca-table{position:absolute;inset:0;background:#d68c42 center top/cover no-repeat;animation:ca-bgb .9s ease-out backwards}   /* wide windows crop only the bottom (keeps the cookies) */
.ca-stage{animation:ca-fadein .4s backwards}
.ca-root.leaving .ca-stage{opacity:0;transition:opacity .35s}
.ca-bk{position:absolute;left:0;top:0;width:100%;height:100%;pointer-events:none}
.ca-bk>*{pointer-events:auto}
.ca-fx{position:absolute;left:0;top:0;z-index:80;pointer-events:none}
/* ENTRY (Andy 2026-10-13): the background bounces, the UI slides/drops in like the world page. Uses the 'translate'/'scale'
   properties (not 'transform') so every existing transform (translateX(-50%) etc.) stays as it is. */
.ca-inL{animation:ca-inL .8s cubic-bezier(.3,1.35,.5,1) .1s backwards}
.ca-inR{animation:ca-inR .8s cubic-bezier(.3,1.35,.5,1) .15s backwards}
.ca-inT{animation:ca-inT .75s cubic-bezier(.3,1.35,.5,1) .05s backwards}
@keyframes ca-inL{0%{translate:-460px 0}100%{translate:0 0}}
@keyframes ca-inR{0%{translate:460px 0}100%{translate:0 0}}
@keyframes ca-inT{0%{translate:0 -300px}100%{translate:0 0}}
.ca-stage:not(.go) :is(.ca-bg,.ca-table,.ca-inL,.ca-inR,.ca-inT){animation-play-state:paused}   /* the entry waits while How to Play is open */
@keyframes ca-bgb{0%{scale:1}28%{scale:1.07}60%{scale:1}80%{scale:1.015}100%{scale:1}}
.ca-tap{cursor:pointer}
.ca-rb{position:absolute;top:14px;width:76px;filter:drop-shadow(0 8px 8px rgba(0,0,0,.35));z-index:30}
.ca-rb img{display:block;width:100%;pointer-events:none}
.ca-coins{position:absolute;top:16px;width:230px;height:90px;padding-left:96px;display:flex;align-items:center;justify-content:center;
 background:url(/worlds/ui/pill_coin.webp) center/100% 100% no-repeat;font-size:34px;color:#8a4a10;filter:drop-shadow(0 8px 8px rgba(0,0,0,.3));z-index:30}
.ca-teacher{position:absolute;width:310px;text-align:right;font-size:15px;color:#fff;opacity:.85;text-shadow:0 2px 3px rgba(0,0,0,.8);z-index:30}
.ca-title{position:absolute;transform:translateX(-50%);font-size:80px;white-space:nowrap;z-index:5}
.ca-title.set{font-size:58px;top:-8px}
.ca-ribbon{position:absolute;background:center/100% 100% no-repeat;filter:drop-shadow(0 8px 10px rgba(0,0,0,.35));z-index:4}
.ca-rtxt{position:absolute;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px}
.ca-rt,.ca-rp,.ca-name,.ca-bar span,.ca-done,.ca-open,.ca-tag,.ca-swapl,.ca-arrow,.ca-x,.ca-pol{paint-order:stroke fill}
.ca-rt{letter-spacing:.5px;line-height:1;white-space:nowrap;-webkit-text-stroke:.28em var(--rs)}
.ca-rp{display:flex;align-items:center;gap:.18em;line-height:1;white-space:nowrap;-webkit-text-stroke:.2em var(--rs)}
.ca-rp img{height:1.2em;margin-left:.15em}
.ca-rp span{margin-left:.3em}
.ca-bar{position:absolute;height:40px;border-radius:20px;background:#5a2b16;border:4px solid #f3b13a;overflow:hidden;box-shadow:inset 0 3px 6px rgba(0,0,0,.4),0 5px 8px rgba(0,0,0,.3);z-index:5}
.ca-bar i{position:absolute;left:0;top:0;bottom:0;border-radius:16px}
.ca-bar.green i{background:linear-gradient(#a6f590,#2fb34a)}
.ca-bar.blue i{background:linear-gradient(#9be8ff,#1f8fe0)}
.ca-bar span{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:22px;-webkit-text-stroke:5px #3a1d6e}
.ca-bar.small{position:relative;width:118px;height:30px;margin-top:6px;border-width:3px}
.ca-bar.small span{font-size:17px;-webkit-text-stroke:4px #3a1d6e}
.ca-book{position:absolute;z-index:2}
.ca-bookimg{position:absolute;inset:0;width:100%;height:100%;filter:drop-shadow(0 14px 14px rgba(70,30,0,.5))}
.ca-burst{position:absolute;left:50%;top:50%;width:1500px;height:1500px;margin:-750px;border-radius:50%;pointer-events:none;z-index:9;
 background:radial-gradient(circle,rgba(255,255,240,1) 0%,rgba(255,240,150,.9) 14%,rgba(255,215,80,.55) 32%,rgba(255,200,60,0) 62%);animation:ca-burst 1.7s ease-out forwards}
@keyframes ca-burst{0%{opacity:0;transform:scale(.15)}25%{opacity:1}100%{opacity:0;transform:scale(1.2)}}
.ca-pageglow{position:absolute;inset:4%;border-radius:20px;pointer-events:none;z-index:8;
 background:radial-gradient(ellipse at 50% 50%,rgba(255,250,210,.95),rgba(255,225,110,.6) 45%,rgba(255,210,80,0) 75%);animation:ca-pageglow 2.4s ease-out forwards}
@keyframes ca-pageglow{0%{opacity:0}20%{opacity:1}100%{opacity:0}}
.ca-bookimg.hide{opacity:0}
.ca-glowwrap{position:absolute;z-index:9;pointer-events:none}
.ca-b3{position:absolute;z-index:8;perspective:2600px;transform-style:preserve-3d;transition:transform 1.4s cubic-bezier(.45,.05,.35,1)}
.ca-b3.closed{transform:translateX(-25%);animation:ca-b3in .9s cubic-bezier(.3,1.3,.5,1) both}
@keyframes ca-b3in{0%{transform:translate(-25%,860px) rotate(-4deg)}100%{transform:translate(-25%,0) rotate(0)}}
.ca-b3glow{position:absolute;left:45%;top:-7%;width:60%;height:114%;border-radius:60px;pointer-events:none;transform:translateZ(-2px);
 background:radial-gradient(ellipse,rgba(255,236,140,.85),rgba(255,214,90,.35) 45%,rgba(255,210,80,0) 70%);animation:ca-b3glow 1.3s ease-in-out both}
.ca-b3.opening .ca-b3glow{opacity:0;transition:opacity .7s}
@keyframes ca-b3glow{0%{opacity:0}60%{opacity:1}100%{opacity:.85}}
.ca-b3base{position:absolute;left:50%;top:0;width:50%;height:100%;background-size:200% 100%;background-position:100% 0;background-repeat:no-repeat;filter:drop-shadow(0 14px 14px rgba(70,30,0,.5))}
.ca-b3edge{position:absolute;transition:opacity .9s;background:repeating-linear-gradient(var(--d),#fffaf0 0 2px,#e9dcc0 2px 3px);box-shadow:0 4px 8px rgba(0,0,0,.25)}
.ca-b3edge.r{--d:90deg;left:calc(100% - 14px);top:5%;width:24px;height:89%;border-radius:0 10px 10px 0}
.ca-b3edge.b{--d:180deg;left:52%;top:calc(100% - 12px);width:46%;height:20px;border-radius:0 0 10px 10px}
.ca-b3.opening .ca-b3edge{opacity:0}
.ca-b3pg{position:absolute;left:50%;top:4.7%;width:46.6%;height:88.2%;transform-origin:0 50%;transform-style:preserve-3d;transform:translateZ(var(--z))}
.ca-b3.opening .ca-b3pg{animation:ca-b3pg 1.15s cubic-bezier(.45,.05,.35,1) both}
@keyframes ca-b3pg{0%{transform:rotateY(0) translateZ(var(--z))}100%{transform:rotateY(-180deg) translateZ(var(--z))}}
.ca-b3f{position:absolute;inset:0;backface-visibility:hidden;-webkit-backface-visibility:hidden;background-repeat:no-repeat}
.ca-b3pg .ca-b3f{border-radius:6px;background:linear-gradient(90deg,#ead6aa,#fff6df 10%,#fff6df 90%,#f2e0b8);
 box-shadow:inset 0 0 0 14px #fff6df,inset 0 0 0 16px #e2bf75,inset 0 0 0 20px #fff6df,inset 0 0 0 21px #e8c98a,0 2px 5px rgba(0,0,0,.18)}
.ca-b3pg .ca-b3f.back{transform:rotateY(180deg)}
.ca-b3cv{position:absolute;left:50%;top:0;width:50%;height:100%;transform-origin:0 50%;transform-style:preserve-3d;transform:translateZ(4px)}
.ca-b3.opening .ca-b3cv{animation:ca-b3cv 1.4s cubic-bezier(.5,.02,.35,1) both}
@keyframes ca-b3cv{0%{transform:rotateY(0) translateZ(4px)}100%{transform:rotateY(-180deg) translateZ(4px)}}
.ca-b3cv .front{background-size:100% 100%;filter:drop-shadow(0 14px 14px rgba(70,30,0,.5))}
.ca-b3cv .back{background-size:200% 100%;background-position:0 0;transform:rotateY(180deg)}
.ca-b3.opening .ca-b3cv .front{animation:ca-b3sh1 1.4s cubic-bezier(.5,.02,.35,1) both}
.ca-b3.opening .ca-b3cv .back{animation:ca-b3sh2 1.4s cubic-bezier(.5,.02,.35,1) both}
.ca-b3.closing{animation:ca-b3slide 1.2s .5s cubic-bezier(.45,.05,.35,1) both,ca-b3out .65s 2s cubic-bezier(.55,-0.35,.85,.4) forwards}
@keyframes ca-b3out{0%{transform:translate(-25%,0)}100%{transform:translate(-25%,900px) rotate(4deg)}}
@keyframes ca-b3slide{0%{transform:none}100%{transform:translateX(-25%)}}
.ca-b3.opening{animation:ca-b3slideo 1.4s cubic-bezier(.45,.05,.35,1) both}   /* Andy 2026-10-08 14:34: SLIDE right while the cover opens (was a hop: the transition can't start from the pop-in animation) */
@keyframes ca-b3slideo{0%{transform:translateX(-25%)}100%{transform:none}}
.ca-b3.closing .ca-b3pg{animation:ca-b3pgc .9s cubic-bezier(.45,.05,.35,1) both}
@keyframes ca-b3pgc{0%{transform:rotateY(-180deg) translateZ(var(--z))}100%{transform:rotateY(0) translateZ(var(--z))}}
.ca-b3.closing .ca-b3cv{animation:ca-b3cvc 1.2s .5s cubic-bezier(.5,.02,.35,1) both}
@keyframes ca-b3cvc{0%{transform:rotateY(-180deg) translateZ(4px)}100%{transform:rotateY(0) translateZ(4px)}}
.ca-b3.closing .ca-b3cv .front{animation:ca-b3sh2 1.2s .5s cubic-bezier(.5,.02,.35,1) both}
.ca-b3.closing .ca-b3cv .back{animation:ca-b3sh1 1.2s .5s cubic-bezier(.5,.02,.35,1) both}
.ca-b3.closing .ca-b3edge{animation:ca-fadein .5s 1.5s both}
.ca-b3.closing .ca-b3glow{animation:ca-b3glow 1s 1.4s both}
@keyframes ca-b3sh1{0%{filter:brightness(1)}50%,100%{filter:brightness(.55)}}
@keyframes ca-b3sh2{0%,50%{filter:brightness(.6)}100%{filter:brightness(1)}}
.ca-sets{position:absolute;z-index:6;display:grid;grid-template-columns:repeat(3,1fr);grid-template-rows:1fr 1fr;align-items:center;justify-items:center}
.ca-set{position:relative;display:flex;flex-direction:column;align-items:center;animation:ca-pop .5s cubic-bezier(.25,1.6,.45,1) both}
@keyframes ca-pop{0%{opacity:0;transform:scale(.3)}100%{opacity:1;transform:none}}
.ca-badge{width:108px;height:108px;border-radius:50%;background-size:165%;background-position:50% 20%;border:7px solid var(--c);
 box-shadow:0 0 0 4px #ffcf40,0 7px 10px rgba(0,0,0,.3)}
.ca-badge.bump{animation:ca-bump .9s cubic-bezier(.25,1.6,.45,1)}
.ca-flash{position:absolute;left:50%;top:54px;width:240px;height:240px;margin:-120px;border-radius:50%;pointer-events:none;z-index:4;mix-blend-mode:screen;
 background:radial-gradient(circle,rgba(255,255,235,1) 0%,rgba(255,240,120,.95) 25%,rgba(255,215,60,.5) 48%,rgba(255,200,40,0) 70%);animation:ca-flash .6s ease-out forwards}
@keyframes ca-flash{0%{opacity:0;transform:scale(.3)}18%{opacity:1;transform:scale(1)}100%{opacity:0;transform:scale(1.5)}}
.ca-congrats{position:absolute;left:0;right:0;display:flex;justify-content:center;font-size:96px;z-index:3;pointer-events:none;animation:ca-congin .7s cubic-bezier(.3,1.4,.5,1) both}
.ca-congrats.out{animation:ca-congout .45s ease-in forwards}
@keyframes ca-congin{0%{opacity:0;transform:translateY(-260px) scale(.6)}100%{opacity:1;transform:none}}
@keyframes ca-congout{0%{opacity:1;transform:none}100%{opacity:0;transform:scale(.8)}}
@keyframes ca-bump{0%{transform:scale(1)}30%{transform:scale(1.32);box-shadow:0 0 0 4px #fff3a0,0 0 40px 18px rgba(255,225,110,.95)}100%{transform:scale(1);box-shadow:0 0 0 4px #ffcf40,0 7px 10px rgba(0,0,0,.3)}}
.ca-name{margin-top:-18px;position:relative;display:flex;justify-content:center;padding:3px 10px 5px;border-radius:12px;background:var(--c);border:3px solid #ffcf40;font-size:16px;white-space:nowrap;
 -webkit-text-stroke:4px rgba(0,0,0,.3);box-shadow:0 4px 6px rgba(0,0,0,.25)}
.ca-name span{display:inline-block}
.ca-done{margin-top:7px;font-size:20px;color:#ffd84a;-webkit-text-stroke:6px #a35a00}
.ca-tag{position:absolute;z-index:3;padding:2px 10px 4px;border-radius:12px;border:3px solid #fff;font-size:16px;-webkit-text-stroke:4px rgba(0,0,0,.25);box-shadow:0 3px 5px rgba(0,0,0,.3)}
.ca-tag.new{background:#ff3b5c;top:-10px;left:-10px;transform:rotate(-8deg)}
.ca-tag.new.set{left:auto;right:-14px;top:-4px;transform:rotate(8deg)}
.ca-tag.dup{background:#8a4fe0;top:-10px;left:-10px;transform:rotate(-8deg)}
.ca-cards{position:absolute;z-index:6;display:flex;flex-direction:column;justify-content:space-evenly;align-items:center}
.ca-row{display:flex;gap:14px}
.ca-card{position:relative;filter:drop-shadow(0 5px 6px rgba(0,0,0,.28));transition:transform .15s}
.ca-card:active{transform:scale(.96)}
.ca-card>img{position:absolute;display:block}
.ca-word{position:absolute;display:flex;align-items:center;justify-content:center;color:#5a2a0e;white-space:nowrap;line-height:1;padding-bottom:.08em}
.ca-word span{display:inline-block}
.ca-shine{position:absolute;overflow:hidden;pointer-events:none}
.ca-shine::after{content:"";position:absolute;top:-20%;bottom:-20%;width:45%;left:-60%;
 background:linear-gradient(105deg,rgba(255,255,255,0) 0%,rgba(255,248,200,.55) 50%,rgba(255,255,255,0) 100%);animation:ca-shine 4.5s ease-in-out infinite}
@keyframes ca-shine{0%,55%{left:-60%}85%,100%{left:120%}}
.ca-empty{position:relative;background:#f1d9ad;border:5px solid #e3c189;box-shadow:inset 0 0 0 5px #f7e6c4;
 display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12%}
.ca-empty.gold{background:#f6dd9a;border-color:#efb52c}
.ca-q{border-radius:50%;background:#e6c890;color:#f8e9cb;display:flex;align-items:center;justify-content:center;line-height:1}
.ca-ew{color:#a87c42;white-space:nowrap;line-height:1}
.ca-wig{animation:ca-wig .45s ease-in-out}
@keyframes ca-wig{0%,100%{transform:none}25%{transform:rotate(-4deg)}75%{transform:rotate(4deg)}}
.ca-arrow{position:absolute;z-index:7;width:74px;height:110px;border-radius:24px;background:linear-gradient(#ff8ab5,#e0457a);border:5px solid #fff;color:#fff;
 box-shadow:0 6px 0 #9c1d4c,0 10px 14px rgba(0,0,0,.35);font-family:'Titan One',sans-serif;font-size:72px;line-height:90px;-webkit-text-stroke:7px #9c1d4c;cursor:pointer}
.ca-arrow:active{transform:translateY(4px);box-shadow:0 2px 0 #9c1d4c}
.ca-packbox{position:absolute;left:8px;width:186px;display:flex;flex-direction:column;align-items:center;z-index:9}
.ca-pack{position:relative;width:104px;height:176px}
.ca-pack img{width:100%;height:100%;filter:drop-shadow(0 8px 10px rgba(0,0,0,.4))}
.ca-pack.ready img{animation:ca-packglow 2.4s ease-in-out infinite}
@keyframes ca-packglow{0%,100%{filter:drop-shadow(0 0 10px rgba(255,225,120,.6))}50%{filter:drop-shadow(0 0 28px rgba(255,230,140,1))}}
.ca-pack.ready{animation:ca-packbob 2.4s ease-in-out infinite}
@keyframes ca-packbob{0%,100%{transform:none}50%{transform:translateY(-6px) rotate(-2deg)}}
.ca-x{position:absolute;right:-28px;top:-10px;width:56px;height:56px;border-radius:50%;background:#ff4f8b;border:4px solid #fff;display:flex;align-items:center;justify-content:center;
 font-size:24px;-webkit-text-stroke:5px #9c1d4c;box-shadow:0 4px 0 #9c1d4c}
.ca-open{margin-top:-22px;position:relative;width:162px;height:58px;border-radius:29px;background:linear-gradient(#ffe066,#f5a20e);border:5px solid #fff;
 font-family:'Titan One',sans-serif;font-size:30px;color:#fff;-webkit-text-stroke:7px #a35a00;box-shadow:0 6px 0 #a35a00,0 0 24px rgba(255,220,90,.8);cursor:pointer}
.ca-open.off{filter:grayscale(.8);opacity:.6;cursor:default;box-shadow:0 6px 0 #a35a00}
.ca-pk{position:absolute;animation:ca-pkin .6s cubic-bezier(.3,1.45,.5,1) both}
.ca-pk img{position:absolute;inset:0;width:100%;height:100%;object-fit:contain;filter:drop-shadow(0 0 18px rgba(255,225,120,.85));animation:ca-packbob 2.4s ease-in-out infinite}
@keyframes ca-pkin{0%{transform:translateY(-760px) rotate(-12deg);opacity:0}50%{opacity:1}100%{transform:none;opacity:1}}
.ca-pk .ca-posh{left:0;right:0}
.ca-pk.all{animation:none}
.ca-pk.all.shake{animation:ca-shake 1s .45s ease-in both}
.ca-pk.all.shake img{animation:ca-pkglow 1.45s ease-in both}
@keyframes ca-pkglow{0%{filter:drop-shadow(0 0 18px rgba(255,225,120,.85))}100%{filter:drop-shadow(0 0 48px rgba(255,240,160,1)) brightness(1.3)}}
.ca-pk.all.burst{animation:ca-poout .6s ease-out both}
.ca-pk.all.burst img{animation:none}
.ca-pobox.from{animation:ca-from .5s cubic-bezier(.3,1.3,.5,1) both,ca-shake 1s .5s ease-in both}
@keyframes ca-from{0%{transform:translate(var(--fx),var(--fy)) scale(var(--fs))}100%{transform:none}}
.ca-packbox .ca-bar{position:relative;height:34px}
.ca-wal{position:absolute;width:236px;height:86px;z-index:30}
.ca-wnum{position:absolute;left:50px;top:2px;width:176px;height:52px;padding-left:18px;box-sizing:border-box;border-radius:26px 26px 7px 7px;display:flex;align-items:center;justify-content:center;
 background:linear-gradient(#fffaf0,#f1dfbd);border:4px solid #f3b13a;box-shadow:0 5px 10px rgba(0,0,0,.35);font-size:32px;line-height:1;color:#7a3e1d}
.ca-wal .ca-wbar{left:50px;right:auto;top:54px;width:176px;height:24px;box-sizing:border-box;border-radius:7px 7px 12px 12px;border-width:3px}   /* joined to the number pill (Andy 10-14) */
.ca-wal .ca-wbar i{border-radius:4px 4px 9px 9px}
.ca-wal .ca-wcoin{left:-6px;top:-8px;width:74px;height:74px;z-index:2}
.ca-wal.nope .ca-wnum,.ca-wal.nope .ca-wcoin{animation:ca-nope .45s ease-in-out}
.ca-wal.nope .ca-wbar{animation:ca-barflash .6s ease-in-out}
@keyframes ca-nope{0%,100%{translate:0}20%{translate:-7px}40%{translate:7px}60%{translate:-5px}80%{translate:4px}}
@keyframes ca-barflash{0%,50%,100%{box-shadow:inset 0 3px 6px rgba(0,0,0,.4)}25%,75%{box-shadow:inset 0 3px 6px rgba(0,0,0,.4),0 0 16px 6px rgba(255,230,90,.95)}}
.ca-pack:not(.ready) img{filter:saturate(.35) brightness(.85) drop-shadow(0 8px 10px rgba(0,0,0,.4));opacity:.8}
.ca-wbar{position:absolute;left:28px;top:9px;right:0;height:38px;border-radius:19px;background:#5a2b16;border:4px solid #f3b13a;overflow:hidden;box-shadow:inset 0 3px 6px rgba(0,0,0,.4),0 5px 8px rgba(0,0,0,.3)}
.ca-wbar i{position:absolute;left:0;top:0;bottom:0;border-radius:15px;background:linear-gradient(#a6f590,#2fb34a);transition:width .4s}
.ca-wbar i.full{background:linear-gradient(#fff38a,#ffcf20 55%,#f5a300)}
.ca-wbar span{position:absolute;inset:0;padding-left:24px;display:flex;align-items:center;justify-content:center;font-size:20px;color:#fff;-webkit-text-stroke:5px #3a1d6e;paint-order:stroke fill}
.ca-wcoin{position:absolute;left:-4px;top:-2px;width:60px;height:60px;object-fit:contain;filter:drop-shadow(0 4px 5px rgba(0,0,0,.4))}
.ca-ptag{position:absolute;right:-16px;bottom:22px;display:flex;align-items:center;gap:2px;height:28px;padding:0 9px;border-radius:14px;z-index:2;
 background:linear-gradient(#fffaf0,#f1dfbd);border:3px solid #f3b13a;font-size:18px;line-height:1;color:#7a3e1d;box-shadow:0 3px 5px rgba(0,0,0,.3)}
.ca-ptag img{width:18px;height:18px;filter:none;animation:none}
.ca-needbub{position:absolute;left:calc(100% + 18px);top:190px;white-space:nowrap;background:#fffbea;border:5px solid #c47a2c;border-radius:26px;padding:10px 22px;
 font-size:26px;line-height:34px;color:#8a4a10;box-shadow:0 8px 14px rgba(0,0,0,.3);animation:ca-bubin 3s ease-out forwards;pointer-events:none;z-index:12}
.ca-needbub span{color:#1a7fff;font-size:1.25em}
@keyframes ca-bubin{0%{opacity:0;transform:scale(.6)}10%{opacity:1;transform:scale(1.05)}15%{transform:scale(1)}85%{opacity:1}100%{opacity:0}}
.ca-wal.drain .ca-wbar{box-shadow:inset 0 3px 6px rgba(0,0,0,.4),0 0 22px 7px rgba(120,255,110,.85)}
.ca-wal.drain .ca-wbar i{background:linear-gradient(#e2ffc8,#5cff6e);box-shadow:0 0 14px 4px rgba(140,255,120,.9);transition:width .25s}
.ca-pobox.pay{animation:ca-drop .5s cubic-bezier(.25,1.4,.45,1) both}
.ca-pobox.pay.from{animation:ca-from .5s cubic-bezier(.3,1.3,.5,1) both}
.ca-pobox.shake.paid,.ca-pobox.shake.from.paid{animation:ca-shake 1s .5s ease-in both}
.ca-pcoin{position:absolute;left:0;top:0;width:52px;height:52px;margin:-26px 0 0 -26px;pointer-events:none;z-index:70;filter:drop-shadow(0 3px 3px rgba(0,0,0,.4))}
.ca-packbox .ca-bar span{font-size:19px}
.ca-swap{display:flex;gap:2px;margin-top:10px;position:relative}
.ca-swap b.on.pop{animation:ca-dotpop .45s cubic-bezier(.3,1.6,.5,1) both}
@keyframes ca-dotpop{0%{background:#2b1a5c;border-color:#b9a6ff;box-shadow:none;transform:scale(1)}45%{transform:scale(1.7)}100%{transform:scale(1)}}
.ca-swplus{position:absolute;left:50%;top:-6px;translate:-50% 0;font-family:'Titan One',sans-serif;font-size:30px;color:#ffd84a;-webkit-text-stroke:6px #3a1d6e;paint-order:stroke fill;pointer-events:none;animation:ca-swplus 2s .5s ease-out both}
@keyframes ca-swplus{0%{opacity:0;transform:translateY(10px) scale(.6)}20%{opacity:1;transform:translateY(-14px) scale(1.15)}70%{opacity:1;transform:translateY(-30px) scale(1)}100%{opacity:0;transform:translateY(-48px) scale(1)}}
.ca-swap b{width:14px;height:14px;border-radius:50%;background:#2b1a5c;border:3px solid #b9a6ff}
.ca-swap b.on{background:radial-gradient(circle at 35% 35%,#fff6c8,#ffb800);border-color:#fff;box-shadow:0 0 6px rgba(255,216,74,.8)}   /* gold like the Swap Meter screen (Andy 10-16, was purple) */
.ca-swapl{margin-top:3px;font-size:16px;-webkit-text-stroke:5px #3a1d6e}
.ca-swq{display:inline-flex;align-items:center;justify-content:center;width:22px;height:22px;margin-left:4px;border-radius:50%;background:#7b5cff;border:2px solid #fff;font-size:14px;-webkit-text-stroke:0;vertical-align:2px}
.ca-swh{margin-top:-90px;background:#d9efff;border:7px solid #7b5cff;border-radius:34px;padding:20px 44px 30px;box-shadow:0 10px 0 rgba(0,0,0,.3);animation:ca-zin .4s cubic-bezier(.25,1.5,.45,1) both}
.ca-swht{font-family:'Titan One',sans-serif;font-size:46px;color:#fff;-webkit-text-stroke:9px #3a1d6e;paint-order:stroke fill;text-align:center;margin-bottom:6px}
.ca-swhrow{display:flex;align-items:center;gap:28px;margin-top:18px}
.ca-swhrow>div{width:140px;flex:none;display:flex;justify-content:center}
.ca-swhrow p{margin:0;font-family:'Titan One',sans-serif;font-size:31px;line-height:1.25;color:#3a1d6e}
.ca-swhrow p b{color:#7b5cff;font-weight:400}
/* each section its own colours on the light blue (Andy 10-16): no blue text */
.ca-swh .ca-swhrow:nth-child(2) p{color:#3a1d6e}.ca-swh .ca-swhrow:nth-child(2) p b{color:#d0186a}
.ca-swh .ca-swhrow:nth-child(3) p{color:#5a2e05}.ca-swh .ca-swhrow:nth-child(3) p b{color:#c94a00}
.ca-swh .ca-swhrow:nth-child(4) p{color:#0f5130}.ca-swh .ca-swhrow:nth-child(4) p b{color:#c8102e}
.ca-swhex{gap:12px}
.ca-swhex>div{display:flex;flex-direction:column;align-items:center;gap:8px}
.ca-swh .ca-swhex .ca-swap{width:auto;flex-wrap:nowrap;gap:3px}
.ca-swh .ca-swap{flex-wrap:wrap;width:110px;gap:5px;margin:0;justify-content:center}
.ca-zoom{position:absolute;inset:0;z-index:50;background:rgba(10,6,40,.72);display:flex;align-items:center;justify-content:center}
.ca-zcard{animation:ca-zin .45s cubic-bezier(.25,1.5,.45,1) both}
.ca-swap.full b.on{background:radial-gradient(circle at 35% 35%,#fff6c8,#ffb800);border-color:#fff;box-shadow:0 0 8px #ffd84a;animation:ca-pickdot 1.2s ease-in-out infinite}
@keyframes ca-pickdot{0%,100%{transform:scale(1)}50%{transform:scale(1.25)}}
.ca-open.ca-pickbtn{margin-top:8px;width:auto;height:50px;padding:0 18px;font-size:22px;white-space:nowrap;background:linear-gradient(#c9b4ff,#7b5cff);-webkit-text-stroke:6px #3a1d6e;box-shadow:0 5px 0 #3a1d6e,0 0 22px rgba(190,160,255,.9);animation:ca-pickpulse 1.3s ease-in-out infinite}
@keyframes ca-pickpulse{0%,100%{transform:scale(1)}50%{transform:scale(1.07)}}
.ca-picking .ca-empty{animation:ca-pickglow 1.2s ease-in-out infinite}
@keyframes ca-pickglow{0%,100%{box-shadow:inset 0 0 0 5px #f7e6c4,0 0 6px 2px rgba(255,216,74,.5)}50%{box-shadow:inset 0 0 0 5px #f7e6c4,0 0 22px 8px rgba(255,216,74,1)}}
.ca-pickbar{position:absolute;left:50%;bottom:22px;transform:translateX(-50%);z-index:45;display:flex;align-items:center;gap:14px;background:#fffbea;border:5px solid #7b5cff;border-radius:30px;padding:8px 10px 8px 26px;box-shadow:0 6px 0 rgba(0,0,0,.3)}
.ca-pickbar span{font-family:'Titan One',sans-serif;font-size:26px;color:#3a1d6e;white-space:nowrap}
.ca-pickx img{display:block;width:52px;height:52px}
.ca-open.ca-pickgo{position:absolute;left:50%;bottom:140px;margin:0 0 0 -110px;width:220px;height:66px;font-size:32px}
.ca-zcard.ca-pickgot{animation:ca-pickflip .7s cubic-bezier(.25,1.5,.45,1) both}
@keyframes ca-pickflip{0%{transform:rotateY(90deg) scale(.8)}100%{transform:none}}
@keyframes ca-zin{0%{transform:scale(.3) rotateY(90deg);opacity:0}100%{transform:none;opacity:1}}
.ca-zx{position:absolute;left:50%;top:auto;bottom:40px;margin-left:-38px}
.ca-po{position:absolute;inset:0;z-index:60;background:radial-gradient(ellipse at 50% 45%,rgba(70,40,150,.95),rgba(12,6,40,.98));animation:ca-fadein .35s both;transition:background .6s}
.ca-po.fly{background:rgba(12,6,40,0)}
@keyframes ca-fadein{from{opacity:0}to{opacity:1}}
.ca-pobox{position:absolute;width:320px;height:540px;display:flex;align-items:center;justify-content:center}
.ca-pobox img{width:300px;height:auto;filter:drop-shadow(0 0 34px rgba(255,225,120,.95))}
.ca-pobox.shake{animation:ca-drop .5s cubic-bezier(.25,1.4,.45,1) both,ca-shake 1s .5s ease-in both}
@keyframes ca-drop{0%{transform:translateY(-600px) rotate(-10deg)}100%{transform:none}}
@keyframes ca-shake{0%{transform:none}20%{transform:rotate(-2deg)}30%{transform:rotate(2deg)}45%{transform:rotate(-3.5deg) scale(1.02)}55%{transform:rotate(3.5deg) scale(1.03)}
 68%{transform:rotate(-5deg) scale(1.05)}78%{transform:rotate(5deg) scale(1.06)}88%{transform:rotate(-6deg) scale(1.08)}100%{transform:rotate(0) scale(1.1)}}
.ca-pobox.burst{animation:ca-poout .6s ease-out both}
@keyframes ca-poout{0%{transform:scale(1.15)}40%{transform:scale(1.2)}100%{transform:scale(1.1) translateY(40px);opacity:0}}
.ca-posh{position:absolute;left:10px;right:10px;top:0;bottom:0;overflow:hidden;pointer-events:none;
 -webkit-mask-image:url(/cards/ui/pack_closed.webp);mask-image:url(/cards/ui/pack_closed.webp);-webkit-mask-size:100% 100%;mask-size:100% 100%;-webkit-mask-position:center;mask-position:center}
.ca-posh::after{content:"";position:absolute;top:-10%;bottom:-10%;width:40%;left:-60%;background:linear-gradient(100deg,rgba(255,255,255,0),rgba(255,255,255,.7),rgba(255,255,255,0));animation:ca-shine 1.2s .2s ease-in-out infinite}
.ca-pob{position:absolute;width:0;height:0}
.ca-pob::before{content:"";position:absolute;left:-700px;top:-700px;width:1400px;height:1400px;border-radius:50%;
 background:radial-gradient(circle,rgba(255,255,240,1) 0%,rgba(255,235,140,.85) 18%,rgba(255,210,80,0) 58%);animation:ca-burst 1s ease-out forwards}
.ca-pocard{position:absolute;animation:ca-fly .6s cubic-bezier(.25,1.3,.45,1) both;transform-origin:50% 50%}
.ca-pocard.flying{animation:none;filter:drop-shadow(0 0 26px rgba(255,225,110,1))}
@keyframes ca-fly{0%{transform:translate(var(--dx),var(--dy,160px)) scale(.25) rotate(-20deg);opacity:0}100%{transform:none;opacity:1}}
.ca-flip{position:relative;transform-style:preserve-3d;transform:rotateY(180deg);transition:transform .6s cubic-bezier(.4,1.4,.5,1)}
.ca-flip.on{transform:rotateY(0)}
.ca-face{position:absolute;inset:0;backface-visibility:hidden;-webkit-backface-visibility:hidden}
.ca-face.back{transform:rotateY(180deg)}
.ca-face.back img{width:100%;height:100%;object-fit:contain;filter:drop-shadow(0 8px 12px rgba(0,0,0,.4))}
.ca-face.goldglow{filter:drop-shadow(0 0 26px rgba(255,215,90,1))}
.ca-polrow{position:absolute;left:-40px;right:-40px;bottom:-64px;display:flex;justify-content:center;animation:ca-pop .45s cubic-bezier(.25,1.6,.45,1) both}
.ca-pol{white-space:nowrap;padding:4px 18px 7px;border-radius:16px;border:4px solid #fff;font-size:26px;-webkit-text-stroke:6px rgba(0,0,0,.25)}
.ca-pol.new{background:#ff3b5c}
.ca-pol.dup{background:#8a4fe0}
.ca-poput{position:absolute;left:0;right:0;display:flex;justify-content:center;gap:28px;z-index:2;animation:ca-pop .45s cubic-bezier(.25,1.6,.45,1) both}
.ca-sd{position:absolute;inset:0;z-index:65;background:radial-gradient(ellipse at 50% 45%,rgba(60,30,120,.93),rgba(10,5,35,.97));animation:ca-fadein .35s both;cursor:pointer;transition:opacity .4s .55s}
.ca-sd.going{opacity:0}
.ca-adbook{position:absolute;translate:-50% 0;animation:ca-pop .6s .3s cubic-bezier(.25,1.5,.45,1) both;pointer-events:none}
.ca-adbook img{display:block;height:370px;animation:ca-adglow 1.6s ease-in-out infinite}
@keyframes ca-adglow{0%,100%{filter:drop-shadow(0 0 22px rgba(255,210,80,.8)) drop-shadow(0 0 50px rgba(255,180,40,.5))}50%{filter:drop-shadow(0 0 36px rgba(255,230,120,1)) drop-shadow(0 0 90px rgba(255,190,60,.85))}}
.ca-adandy{position:absolute;right:30px;bottom:0;animation:ca-adin .8s cubic-bezier(.3,1.3,.5,1) .5s both;pointer-events:none}
.ca-adandy img{display:block;height:560px;filter:drop-shadow(0 10px 14px rgba(0,0,0,.45))}
@keyframes ca-adin{0%{transform:translateX(120%)}100%{transform:none}}
.ca-congrats.sd{font-size:96px}
.ca-sdrow{position:absolute;width:840px;height:260px;animation:ca-pop .6s .35s cubic-bezier(.25,1.5,.45,1) both}
.ca-sdbadge{position:absolute;left:0;top:0;width:250px;height:250px;border-radius:50%;background-size:165%;background-position:50% 20%;border:12px solid var(--c);
 box-shadow:0 0 0 7px #ffcf40,0 0 50px 14px rgba(255,220,100,.6),0 12px 18px rgba(0,0,0,.4);z-index:2}
.ca-sdname{position:absolute;left:125px;top:222px;transform:translateX(-50%);z-index:3;white-space:nowrap;padding:5px 18px 8px;border-radius:14px;background:var(--c);
 border:4px solid #ffcf40;font-size:28px;paint-order:stroke fill;-webkit-text-stroke:6px rgba(0,0,0,.3);box-shadow:0 5px 8px rgba(0,0,0,.3)}
.ca-sdbar{position:absolute;left:200px;top:88px;width:560px;height:76px;border-radius:38px;background:#5a2b16;border:7px solid #ffcf40;overflow:hidden;box-shadow:0 8px 14px rgba(0,0,0,.4)}
.ca-sdbar i{position:absolute;inset:0;border-radius:31px;background:linear-gradient(#9be8ff,#1f8fe0);transform-origin:0 50%;animation:ca-sdfill .8s .7s ease-out both}
@keyframes ca-sdfill{0%{transform:scaleX(.85)}100%{transform:scaleX(1)}}
.ca-sdbar span{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:44px;paint-order:stroke fill;-webkit-text-stroke:8px #12306a}
.ca-sdcheck{position:absolute;left:715px;top:56px;width:130px;height:130px;border-radius:50%;background:radial-gradient(circle at 40% 35%,#c6ff9a,#4fd14a 60%,#2a9a2c);
 border:7px solid #fff;box-shadow:0 0 30px 8px rgba(140,255,120,.7),0 8px 12px rgba(0,0,0,.4);animation:ca-pop .5s 1.4s cubic-bezier(.25,1.8,.45,1) both}
.ca-sdcheck::after{content:"";position:absolute;left:36px;top:22px;width:34px;height:62px;border:solid #fff;border-width:0 15px 15px 0;transform:rotate(40deg);border-radius:4px}
.ca-sdprize{position:absolute;left:0;right:0;display:flex;justify-content:center;gap:90px}
.ca-sdp{display:flex;align-items:center;gap:10px;font-size:56px;paint-order:stroke fill;-webkit-text-stroke:9px #5a2b16;animation:ca-pop .5s cubic-bezier(.25,1.7,.45,1) both}
.ca-sdp.t{animation-delay:1.8s}
.ca-sdp.c{animation-delay:2s}
.ca-sdp img{width:120px;filter:drop-shadow(0 0 18px rgba(255,220,100,.8))}
.ca-sd.going .ca-sdp{animation:ca-sdfly .9s cubic-bezier(.5,-0.2,.6,1) forwards}
.ca-sd.going .ca-sdp.t{animation-delay:.05s}
@keyframes ca-sdfly{0%{transform:none;opacity:1}100%{transform:translate(var(--fx),var(--fy)) scale(.3);opacity:0}}
.ca-sdtap{position:absolute;left:0;right:0;text-align:center;font-size:40px;paint-order:stroke fill;-webkit-text-stroke:8px #3a1d6e;animation:ca-sdtap 1.1s ease-in-out infinite alternate}
@keyframes ca-sdtap{0%{transform:scale(.96);opacity:.75}100%{transform:scale(1.06);opacity:1}}
.ca-soon{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;background:#2f1f6e;color:#fff;font-family:'Titan One',sans-serif}
`;
