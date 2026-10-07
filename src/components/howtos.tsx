// HOW TO PLAY content for every game except Frog Snap (its own lives in src/vocab/FrogSnap.tsx). Andy 2026-10-07.
// Pictures = the games' own art (vocab: public/vocab/<game>/, grammar: public/grammar/howto/ cut from the game HTML files,
// originals in BACKUPFILES/howto_extract_20261007). Super simple English; <b> = yellow, <em> = pink.
import type { CSSProperties, ReactNode } from "react";
import type { HowToProps } from "@/components/HowToPlay";
import type { HintKey } from "@/components/ControlHints";

type How = Omit<HowToProps, "onDone" | "muted">;
const G = "/grammar/howto";
const box = (w = 340, h = 250): CSSProperties => ({ position: "relative", width: w, height: h });
const abs = (s: CSSProperties): CSSProperties => ({ position: "absolute", ...s });
const K = (...k: HintKey[]) => k;

// the Chinese word chip from the top bar (example word only)
const Chip = ({ zh, color = "#ffe066" }: { zh: string; color?: string }) => (
  <span style={{ display: "flex", alignItems: "center", gap: 10, background: "rgba(10,20,40,.85)", border: "3px solid rgba(255,255,255,.45)", borderRadius: 999,
    padding: "6px 18px 6px 26px", fontFamily: "'Nunito',sans-serif", fontWeight: 900, fontSize: 52, color, boxShadow: "0 8px 0 rgba(0,0,0,.35)" }}>
    {zh}
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round"><path d="M11 5 6 9H3v6h3l5 4V5z" fill="#fff" /><path d="M15.5 8.5a5 5 0 0 1 0 7" /><path d="M18.5 5.5a9 9 0 0 1 0 13" /></svg>
  </span>
);
// a sentence banner like the grammar games
const Sentence = ({ text, dark = false }: { text: ReactNode; dark?: boolean }) => (
  <span style={{ fontFamily: "'Courier New',monospace", fontWeight: 900, fontSize: 38, whiteSpace: "nowrap", padding: "14px 24px", borderRadius: 14,
    background: dark ? "#1b1640" : "#fff", color: dark ? "#fff" : "#1b1b1b", border: `4px solid ${dark ? "#8f7cff" : "#1b1b1b"}`, boxShadow: "0 8px 0 rgba(0,0,0,.35)" }}>{text}</span>
);
const Meter = () => (
  <div style={{ width: 300, height: 30, borderRadius: 999, border: "4px solid #f4fff8", background: "linear-gradient(180deg,#e2ffd2 0%,#9df07c 22%,#4cc531 55%,#2f9a1c 75%,#8de66a 100%)",
    boxShadow: "0 0 0 2px #0b4a63,0 0 16px rgba(120,255,120,.8)" }} />
);
// tip pictures: centred under the tip text, big enough to see (Andy 10:01)
const Pics = ({ srcs, h = 84 }: { srcs: string[]; h?: number }) => (
  <span style={{ display: "flex", justifyContent: "center", alignItems: "flex-end", gap: 34, marginTop: 8 }}>
    {srcs.map(s => <img key={s} src={s} alt="" style={{ height: h, filter: "drop-shadow(0 4px 4px rgba(0,0,0,.4))" }} />)}
  </span>
);

// ---------------- VOCAB ----------------
export const gardenHowTo = (diff: string): How => ({
  title: "Get Out of My Garden!",
  bg: "/vocab/garden/bg.webp",
  steps: [
    { art: <Chip zh={"蘋果"} />, text: <>Look at the <b>word</b> on top</> },
    { art: <div style={box()}>
        <img src="/vocab/garden/hole1.webp" alt="" style={abs({ left: 50, top: 100, width: 200 })} />
        <img src="/vocab/garden/mole.webp" alt="" style={abs({ left: 80, top: 62, width: 140 })} />
        <img src="/vocab/garden/hole1-front.webp" alt="" style={abs({ left: 50, top: 100, width: 200 })} />
        <span style={abs({ left: 74, top: 6, fontFamily: "'Titan One','Fredoka',sans-serif", fontSize: 32, color: "#4a2508", padding: "2px 16px 4px", borderRadius: 6,
          background: "linear-gradient(180deg,#f6dca6 0%,#e9c27c 55%,#d9a95e 100%)", border: "4px solid #5b3412", boxShadow: "0 4px 0 #3b220c" })}>apple</span>
        <img src="/vocab/garden/hammer-2.webp" alt="" style={abs({ left: 212, top: 0, width: 118, transform: "rotate(-18deg)" })} />
      </div>, text: <><b>Whack</b> the correct animal!</> },
    { art: <img src="/vocab/garden/basket-big.webp" alt="" style={{ width: 230 }} />, text: <><b>Fill</b> the basket to <b>win!</b></> },
  ],
  controls: [{ mouse: true, text: <>Click to <b>whack</b></> }],
  tip: diff === "easy"
    ? <>Don't hit the <em>red X!</em></>
    : <>Don't hit the <em>red X!</em><br /><span style={{ color: "#ffb347" }}>Careful!</span> Some words are <em>spelled wrong!</em></>,
});

const slot = (ch: string, on = true): ReactNode => (
  <span key={ch} style={{ width: 54, height: 64, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 9, fontFamily: "'Titan One','Fredoka',sans-serif",
    fontSize: 40, color: on ? "#1d4a0b" : "#a88b5a", background: on ? "linear-gradient(180deg,#d9ffbf,#9be27a)" : "#f6e6bd", border: `3px solid ${on ? "#2f6b17" : "#4a2a0c"}` }}>{ch}</span>
);
export const TICKET_HOWTO: How = {
  title: "Ticket Please!",
  bg: "/vocab/train/bg.webp",
  steps: [
    { art: <div style={{ display: "flex", gap: 8, padding: "10px 16px", background: "linear-gradient(180deg,#8a5a2b,#6b4220)", border: "5px solid #3b220c", borderRadius: 16,
        boxShadow: "0 8px 0 #2a1707" }}>{["c", "a", "t"].map(c => slot(c))}</div>, text: <><b>Remember</b> the word</> },
    { art: <div style={box()}>
        <img src="/vocab/train/face-3.webp" alt="" style={abs({ left: 40, top: 40, width: 92 })} />
        <div style={abs({ left: 128, top: 80, width: 180, transform: "rotate(-4deg)" })}>
          <img src="/vocab/train/ticket.webp" alt="" style={{ width: "100%", display: "block" }} />
          <span style={abs({ left: "26%", right: "6%", top: 0, bottom: "4%", display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: "'Titan One','Fredoka',sans-serif", fontSize: 54, color: "#5a3300" })}>c</span>
        </div>
      </div>, text: <>Pick up letters <b>in order</b></> },
    { art: <div style={{ display: "flex", alignItems: "flex-end" }}>
        <img src="/vocab/train/side-car-2.webp" alt="" style={{ width: 130 }} />
        <img src="/vocab/train/side-engine.webp" alt="" style={{ width: 180 }} />
      </div>, text: <><b>Spell</b> the word to <b>win!</b></> },
  ],
  controls: [{ keys: K("left", "up", "down", "right"), text: <>Drive the <b>train</b></> }],
  tip: <><em>Wrong</em> letters cost a heart!</>,
};

export const SPACE_HOWTO: How = {
  title: "Space Robots!",
  bg: "/vocab/space/bg.webp",
  steps: [
    { art: <Chip zh={"蘋果"} color="#00ffff" />, text: <>Look at the <b>word</b> on top</> },
    { art: <div style={{ ...box(), display: "flex", flexDirection: "column", alignItems: "center" }}>
        <img src="/vocab/space/ufo-2.webp" alt="" style={{ width: 150 }} />
        <span style={{ marginTop: -4, padding: "0 14px", background: "#000", border: "3px solid #c8d0d8", borderRadius: 8, fontFamily: "'VT323',monospace", fontSize: 40,
          lineHeight: "40px", color: "#39ff6a", textShadow: "0 0 6px rgba(57,255,106,.75)" }}>apple</span>
        <i style={{ width: 8, height: 26, borderRadius: 4, marginTop: 8, background: "linear-gradient(180deg,#fffbe0,#ffd84a 45%,#ff9a1f)", boxShadow: "0 0 10px 3px rgba(255,210,70,.85)" }} />
        <img src="/vocab/space/ship-1.webp" alt="" style={{ width: 58, marginTop: 4 }} />
      </div>, text: <><b>Shoot</b> the correct robot!</> },
    { art: <img src="/vocab/space/mission.webp" alt="" style={{ width: 340 }} />, text: <><b>Win</b> the mission!</> },
  ],
  controls: [{ keys: K("left", "right"), text: <>Move</> }, { keys: K("space"), text: <><b>Shoot</b></> }],
  tip: <><b>Dodge</b> the bubbles!</>,
};

// ---------------- GRAMMAR ----------------
const answerBox = (w: string): ReactNode => (
  <span style={{ fontFamily: "'Courier New',monospace", fontWeight: 900, fontSize: 40, padding: "6px 22px", borderRadius: 10, color: "#3a2400",
    background: "linear-gradient(180deg,#ffe48a,#f2b632)", border: "4px solid #6b4a12", boxShadow: "0 6px 0 #4a3008" }}>{w}</span>
);
export const RUN_HOWTO: How = {
  title: "Teacher Andy, Run!",
  bg: "/grammar-run-btn.png",
  steps: [
    { art: <Sentence text={<>I see ___ cat.</>} />, text: <><b>Read</b> the sentence</> },
    { art: <div style={{ ...box(), display: "flex", flexDirection: "column", alignItems: "center" }}>
        {answerBox("a")}
        <svg width="40" height="40" viewBox="0 0 40 40" style={{ marginTop: 6 }}><path d="M20 4 L34 22 H25 V36 H15 V22 H6 Z" fill="#ffd84a" stroke="#1d1240" strokeWidth="3" strokeLinejoin="round" /></svg>
        <img src={`${G}/run-andy.webp`} alt="" style={{ height: 150, marginTop: 2 }} />
      </div>, text: <><b>Jump</b> into the correct word!</> },
    { art: <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}><img src={`${G}/run-andy.webp`} alt="" style={{ height: 170, animation: "hw-jump .6s ease-in-out infinite alternate" }} /><Meter /></div>,
      text: <>Get them <b>all</b> to <b>win!</b></> },
  ],
  controls: [{ keys: K("left", "right"), text: <>Run</> }, { keys: K("up", "space"), text: <><b>Jump</b></> }],
  tip: <>Watch out for <em>crows</em> and <em>hedgehogs!</em><Pics srcs={[`${G}/crow.webp`, `${G}/hedgehog.webp`]} /></>,
};

const ring = (txt: string, c: string): ReactNode => (
  <span style={{ width: 120, height: 120, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Lilita One',sans-serif",
    fontSize: 30, color: "#fff", border: `7px solid ${c}`, background: `${c}55`, boxShadow: `0 0 18px ${c}` }}>{txt}</span>
);
export const SWIM_HOWTO: How = {
  title: "Teacher Andy, Swim!",
  bg: "/grammar-swim-btn.png",
  steps: [
    { art: <Sentence text="It is a pen." dark />, text: <><b>Read</b> the sentence</> },
    { art: <div style={{ ...box(), display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        {ring("TRUE", "#3ddc6a")}<img src={`${G}/swim-andy.webp`} alt="" style={{ width: 100 }} />{ring("FALSE", "#ff4d6d")}
      </div>, text: <>Swim to <b>TRUE</b> or <b>FALSE</b></> },
    { art: <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 18 }}><img src={`${G}/swim-andy.webp`} alt="" style={{ width: 170 }} /><Meter /></div>,
      text: <><b>Fill</b> the meter to <b>win!</b></> },
  ],
  controls: [{ keys: K("left", "up", "down", "right"), text: <>Swim</> }],
  tip: <>Watch out for <em>sharks</em> & <em>jellyfish!</em><Pics srcs={[`${G}/shark.webp`, `${G}/jelly.webp`]} /></>,
};

export const DIG_HOWTO: How = {
  title: "Teacher Andy Dig!",
  bg: "/grammar-dig-btn.png",
  steps: [
    { art: <Sentence text="I have a cat." />, text: <><b>Read</b> the sentence</> },
    { art: <div style={{ ...box(), display: "flex", alignItems: "flex-end", justifyContent: "center", gap: 6 }}>
        <img src={`${G}/dig-strike.webp`} alt="" style={{ height: 210 }} />
        <span style={{ marginBottom: 20, fontFamily: "'Courier New',monospace", fontWeight: 900, fontSize: 38, color: "#fff", padding: "18px 22px", borderRadius: "40% 45% 38% 42%",
          background: "radial-gradient(circle at 35% 30%,#b9b9b9,#7d7d7d 60%,#5a5a5a)", border: "4px solid #333", boxShadow: "0 6px 0 #2a2a2a", textShadow: "0 2px 0 #222" }}>have</span>
      </div>, text: <><b>Dig</b> the words <b>in order</b></> },
    { art: <img src={`${G}/dig-win.webp`} alt="" style={{ height: 230 }} />, text: <><b>Build</b> the sentence to <b>win!</b></> },
  ],
  controls: [{ keys: K("left", "up", "down", "right"), text: <>Walk</> }, { mouse: true, text: <>Click to <b>dig</b></> }],
  tip: <><b>Bop</b> the worms!<Pics srcs={[`${G}/worm.webp`]} h={70} /></>,
};

export const GRAB_HOWTO: How = {
  title: "Teacher Andy, Grab!",
  bg: "/grammar-grab-btn.png",
  steps: [
    { art: <Sentence text={<>She ___ happy.</>} dark />, text: <><b>Read</b> the sentence</> },
    { art: <div style={{ ...box(), display: "flex", flexDirection: "column", alignItems: "center" }}>
        <img src={`${G}/claw.webp`} alt="" style={{ height: 120 }} />
        <div style={{ position: "relative", width: 120, marginTop: -18 }}>
          <img src={`${G}/box-green.webp`} alt="" style={{ width: "100%", display: "block" }} />
          <span style={abs({ inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Courier New',monospace", fontWeight: 900, fontSize: 40, color: "#123a12" })}>is</span>
        </div>
      </div>, text: <><b>Grab</b> the correct word!</> },
    { art: <img src={`${G}/grab-andy.webp`} alt="" style={{ height: 240 }} />, text: <><b>Fix</b> the sentence to <b>win!</b></> },
  ],
  controls: [{ keys: K("left", "right"), text: <>Move the claw</> }, { keys: K("space"), mouse: true, text: <><b>Grab!</b></> }],
  tip: <>Don't grab the <em>X box!</em><Pics srcs={[`${G}/box-x.webp`]} /></>,
};

// ---------------- WORLD PAGE (first visit + the '?' button) ----------------
const UI = "/worlds/ui";
export const worldHowTo = (stages: string[]): How => ({
  title: "Welcome to Your World!",
  steps: [
    { art: <div style={{ display: "flex", flexDirection: "column", gap: 10, alignItems: "center" }}>
        <img src={`${UI}/btn_vocab.webp`} alt="" style={{ width: 210 }} /><img src={`${UI}/btn_grammar.webp`} alt="" style={{ width: 210 }} /></div>,
      text: <>Play <b>games</b></> },
    { art: <div style={{ position: "relative", width: 260, height: 200 }}>
        <img src={`${UI}/treat.webp`} alt="" style={abs({ left: 0, top: 70, width: 100, transform: "rotate(-14deg)" })} />
        <img src={`${UI}/treat.webp`} alt="" style={abs({ left: 150, top: 70, width: 100, transform: "rotate(12deg)" })} />
        <img src={`${UI}/treat.webp`} alt="" style={abs({ left: 70, top: 20, width: 120 })} />
      </div>, text: <>Win <b>treats!</b></> },
    { art: <img src={`${UI}/btn_feed.webp`} alt="" style={{ width: 280 }} />, text: <><b>Feed</b> your animal</> },
    { art: <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
        {stages.slice(0, 4).map((src, i) => { const h = [76, 104, 136, 172][i]; return <img key={src} src={src} alt="" style={{ height: h, width: h, objectFit: "contain", margin: `0 ${-Math.round(h * 0.2)}px` }} />; })}
      </div>, text: <>Watch it <b>grow up!</b></> },
  ],
  controls: [{ mouse: true, text: <>Click or tap the <b>buttons</b></> }],
  tip: <>Come back <b>every day</b> for a <b>Daily Prize!</b><Pics srcs={[`${UI}/btn_daily.webp`]} h={80} /></>,
});
