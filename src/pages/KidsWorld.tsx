import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const SHEETDB_URL = "https://sheetdb.io/api/v1/9ctz2zljbz6wx";
const MASTER_CODE = "1006";

// ── ANIMALS — add a new animal here, nothing else needs to change ────────────
interface AnimalStage { name: string; nameZh: string; min: number; img: string; }
interface Animal {
  id: string; name: string; nameZh: string; emoji: string;
  stages: AnimalStage[];
  unlockCondition: "default" | "turtle_grown_video_watched" | "dolphin_grown_video_watched" | "octopus_grown_video_watched" | "shark_grown_video_watched" | "clownfish_grown_video_watched";
  collectionBg: string; collectionBorder: string; collectionGlow: string;
  video: string | null; isEggType: boolean; scale?: number;
  accentColor: string; accentGlow: string;
  btnColor: string; btnGlow: string; btn3Color: string; btn3Glow: string;
  feedLabel: string; feedLabelZh: string;
  levelUpMessages: { main: string; zh: string; sub: string; subZh: string }[];
  unlockOverlay: { emoji: string; title: string; titleZh: string; eggLine: string; eggLineZh: string; feedLine: string; feedLineZh: string; btnText: string; glowColor: string; borderColor: string; bgGradient: string; };
}
const ANIMALS: Animal[] = [
  {
    id: "turtle", name: "Sea Turtle", nameZh: "海龜", emoji: "🐢",
    stages: [
      { name: "Egg",   nameZh: "蛋",      min: 0,  img: "/creatures/turtle-egg.png" },
      { name: "Baby",  nameZh: "小海龜",   min: 15, img: "/creatures/turtle-baby.png" },
      { name: "Young", nameZh: "年輕海龜", min: 30, img: "/creatures/turtle-young.png" },
      { name: "Grown", nameZh: "成年海龜", min: 45, img: "/creatures/turtle-grown.png" },
    ],
    unlockCondition: "default",
    collectionBg: "#0891b2", collectionBorder: "rgba(255,215,0,0.6)", collectionGlow: "rgba(255,215,0,0.35)",
    video: "/video_adult_turtle.mp4", isEggType: true, scale: 1,
    accentColor: "#f97316", accentGlow: "rgba(249,115,22,0.5)",
    btnColor: "#f97316", btnGlow: "rgba(249,115,22,0.5)", btn3Color: "#10b981", btn3Glow: "rgba(16,185,129,0.5)",
    feedLabel: "turtle", feedLabelZh: "海龜",
    levelUpMessages: [
      { main: "Welcome Home!",          zh: "歡迎回家！",           sub: "Meet your Baby Sea Turtle!",     subZh: "快來認識你的小海龜！" },
      { main: "Look how you've grown!", zh: "你長大了！",           sub: "Now a Young Sea Turtle!",        subZh: "現在是年輕海龜了！" },
      { main: "Fully grown! Amazing!",  zh: "完全長大了！太棒了！", sub: "You raised a Grown Sea Turtle!", subZh: "你養大了一隻成年海龜！" },
    ],
    unlockOverlay: { emoji: "🐢", title: "Sea Turtle!", titleZh: "海龜！", eggLine: "A Sea Turtle appeared!", eggLineZh: "海龜出現了！", feedLine: "Feed it treats to help it grow!", feedLineZh: "餵牠餅乾讓牠長大！", btnText: "Let's go! · 出發！🎉", glowColor: "rgba(255,215,0,0.6)", borderColor: "rgba(255,215,0,0.7)", bgGradient: "linear-gradient(135deg,#0c3460,#1a6e8a)" },
  },
  {
    id: "dolphin", name: "Dolphin", nameZh: "海豚", emoji: "🐬",
    stages: [
      { name: "Blanket", nameZh: "裹巾",     min: 0,  img: "/creatures/dolphin-blanket.png" },
      { name: "Young", nameZh: "年輕海豚", min: 15, img: "/creatures/dolphin-baby.png" },
      { name: "Teen",  nameZh: "青少海豚", min: 30, img: "/creatures/dolphin-young.png" },
      { name: "Grown", nameZh: "成年海豚", min: 45, img: "/creatures/dolphin-grown.png" },
    ],
    unlockCondition: "turtle_grown_video_watched",
    collectionBg: "#0077b6", collectionBorder: "rgba(100,200,255,0.7)", collectionGlow: "rgba(100,200,255,0.4)",
    video: "/video_adult_dolphin.mp4", isEggType: false, scale: 1.6,
    accentColor: "#f472b6", accentGlow: "rgba(244,114,182,0.5)",
    btnColor: "#22d3ee", btnGlow: "rgba(34,211,238,0.5)", btn3Color: "#f472b6", btn3Glow: "rgba(244,114,182,0.5)",
    feedLabel: "dolphin", feedLabelZh: "海豚",
    levelUpMessages: [
      { main: "Welcome Home!",          zh: "歡迎回家！",           sub: "Meet your Baby Dolphin!",     subZh: "快來認識你的小海豚！" },
      { main: "Look how you've grown!", zh: "你長大了！",           sub: "Now a Young Dolphin!",        subZh: "現在是年輕海豚了！" },
      { main: "Fully grown! Amazing!",  zh: "完全長大了！太棒了！", sub: "You raised a Grown Dolphin!", subZh: "你養大了一隻成年海豚！" },
    ],
    unlockOverlay: { emoji: "🐬", title: "New Friend!", titleZh: "新朋友來了！", eggLine: "A Dolphin appeared!", eggLineZh: "海豚出現了！", feedLine: "Feed it treats to help it grow!", feedLineZh: "餵牠餅乾讓牠長大！", btnText: "So cool! · 太酷了！🎉", glowColor: "rgba(100,200,255,0.6)", borderColor: "rgba(100,200,255,0.7)", bgGradient: "linear-gradient(135deg,#003d7a,#0077b6,#00b4d8)" },
  },
  // ── ADD NEW ANIMALS HERE — one object = one new animal (octopus before shark) ───
  {
    id: "octopus", name: "Octopus", nameZh: "章魚", emoji: "🐙",
    stages: [
      { name: "Egg",   nameZh: "章魚蛋",   min: 0,  img: "/creatures/octopus-egg.png" },
      { name: "Baby",  nameZh: "小章魚",   min: 15, img: "/creatures/octopus-egg-baby.png" },
      { name: "Young", nameZh: "年輕章魚", min: 30, img: "/creatures/octopus-young.png" },
      { name: "Grown", nameZh: "成年章魚", min: 45, img: "/creatures/octopus-grown.png" },
    ],
    unlockCondition: "dolphin_grown_video_watched",
    collectionBg: "#581c87", collectionBorder: "rgba(216,180,254,0.7)", collectionGlow: "rgba(168,85,247,0.5)",
    video: "/video-adult-octopus.mp4", isEggType: true, scale: 1.4,
    accentColor: "#e879f9", accentGlow: "rgba(232,121,249,0.5)",
    btnColor: "#a855f7", btnGlow: "rgba(168,85,247,0.5)", btn3Color: "#e879f9", btn3Glow: "rgba(232,121,249,0.5)",
    feedLabel: "octopus", feedLabelZh: "章魚",
    levelUpMessages: [
      { main: "Hello little one!",       zh: "你好小寶貝！",         sub: "A Baby Octopus appeared!",       subZh: "小章魚出現了！" },
      { main: "Growing so fast!",        zh: "長得好快！",           sub: "Now a Young Octopus!",           subZh: "現在是年輕章魚了！" },
      { main: "Magnificent! Amazing!",   zh: "太壯觀了！太棒了！",   sub: "You raised a Grown Octopus!",    subZh: "你養大了一隻成年章魚！" },
    ],
    unlockOverlay: { emoji: "🐙", title: "New Friend!", titleZh: "新朋友來了！", eggLine: "An Octopus Egg appeared!", eggLineZh: "出現了一顆章魚蛋！", feedLine: "Feed it treats to help it grow!", feedLineZh: "餵牠餅乾讓牠長大！", btnText: "So cool! · 太酷了！🎉", glowColor: "rgba(168,85,247,0.6)", borderColor: "rgba(216,180,254,0.7)", bgGradient: "linear-gradient(135deg,#2e1065,#581c87,#7e22ce)" },
  },
  {
    id: "shark", name: "Great White Shark", nameZh: "大白鯊", emoji: "🦈",
    stages: [
      { name: "Blanket", nameZh: "裹巾",     min: 0,  img: "/creatures/shark-blanket.png" },
      { name: "Baby",  nameZh: "小鯊魚",   min: 15, img: "/creatures/shark-baby.png" },
      { name: "Young", nameZh: "年輕鯊魚", min: 30, img: "/creatures/shark-young.png" },
      { name: "Grown", nameZh: "成年鯊魚", min: 45, img: "/creatures/shark-grown.png" },
    ],
    unlockCondition: "octopus_grown_video_watched",
    collectionBg: "#1e3a5f", collectionBorder: "rgba(200,220,255,0.7)", collectionGlow: "rgba(96,165,250,0.4)",
    video: "/video_adult_shark.mp4", isEggType: false, scale: 1.6,
    accentColor: "#60a5fa", accentGlow: "rgba(96,165,250,0.5)",
    btnColor: "#60a5fa", btnGlow: "rgba(96,165,250,0.5)", btn3Color: "#3b82f6", btn3Glow: "rgba(59,130,246,0.5)",
    feedLabel: "shark", feedLabelZh: "鯊魚",
    levelUpMessages: [
      { main: "Hello little one!",      zh: "你好小寶貝！",       sub: "A Baby Shark appeared!",        subZh: "小鯊魚出現了！" },
      { main: "Growing so fast!",       zh: "長得好快！",         sub: "Now a Young Shark!",            subZh: "現在是年輕鯊魚了！" },
      { main: "Magnificent! Amazing!",  zh: "太壯觀了！太棒了！", sub: "You raised a Grown Shark!",     subZh: "你養大了一隻成年鯊魚！" },
    ],
    unlockOverlay: { emoji: "🦈", title: "New Friend!", titleZh: "新朋友來了！", eggLine: "A Shark Egg appeared!", eggLineZh: "出現了一顆鯊魚蛋！", feedLine: "Feed it treats to help it grow!", feedLineZh: "餵牠餅乾讓牠長大！", btnText: "So cool! · 太酷了！🎉", glowColor: "rgba(96,165,250,0.6)", borderColor: "rgba(200,220,255,0.7)", bgGradient: "linear-gradient(135deg,#0f2744,#1e3a5f,#2d5a8e)" },
  },
  {
    id: "clownfish", name: "Clownfish", nameZh: "小丑魚", emoji: "🐠",
    stages: [
      { name: "Egg",   nameZh: "魚蛋",     min: 0,  img: "/creatures/clownfish-egg.png" },
      { name: "Baby",  nameZh: "小小丑魚", min: 15, img: "/creatures/clownfish-baby.png" },
      { name: "Young", nameZh: "年輕小丑魚", min: 30, img: "/creatures/clownfish-young.png" },
      { name: "Grown", nameZh: "成年小丑魚", min: 45, img: "/creatures/clownfish-grown.png" },
    ],
    unlockCondition: "shark_grown_video_watched",
    collectionBg: "#c2410c", collectionBorder: "rgba(251,146,60,0.7)", collectionGlow: "rgba(249,115,22,0.45)",
    video: "/video_adult_clownfish.mp4", isEggType: true, scale: 1.0,
    accentColor: "#fb923c", accentGlow: "rgba(251,146,60,0.5)",
    btnColor: "#ea580c", btnGlow: "rgba(234,88,12,0.5)", btn3Color: "#f97316", btn3Glow: "rgba(249,115,22,0.5)",
    feedLabel: "clownfish", feedLabelZh: "小丑魚",
    levelUpMessages: [
      { main: "Hello little one!",      zh: "你好小寶貝！",         sub: "A Baby Clownfish appeared!",      subZh: "小小丑魚出現了！" },
      { main: "Growing so fast!",       zh: "長得好快！",           sub: "Now a Young Clownfish!",          subZh: "現在是年輕小丑魚了！" },
      { main: "Magnificent! Amazing!",  zh: "太壯觀了！太棒了！",   sub: "You raised a Grown Clownfish!",   subZh: "你養大了一隻成年小丑魚！" },
    ],
    unlockOverlay: { emoji: "🐠", title: "New Friend!", titleZh: "新朋友來了！", eggLine: "A Clownfish Egg appeared!", eggLineZh: "出現了一顆小丑魚蛋！", feedLine: "Feed it treats to help it grow!", feedLineZh: "餵牠餅乾讓牠長大！", btnText: "So cool! · 太酷了！🎉", glowColor: "rgba(249,115,22,0.6)", borderColor: "rgba(251,146,60,0.7)", bgGradient: "linear-gradient(135deg,#7c1d0c,#c2410c,#ea580c)" },
  },
  {
    id: "mantaray", name: "Manta Ray", nameZh: "蝠鱝", emoji: "🐟",
    stages: [
      { name: "Blanket", nameZh: "裹巾",       min: 0,  img: "/creatures/mantaray-blanket.png" },
      { name: "Baby",    nameZh: "小蝠鱝",     min: 15, img: "/creatures/mantaray-baby.png" },
      { name: "Young",   nameZh: "年輕蝠鱝",   min: 30, img: "/creatures/mantaray-young.png" },
      { name: "Grown",   nameZh: "成年蝠鱝",   min: 45, img: "/creatures/mantaray-grown.png" },
    ],
    unlockCondition: "clownfish_grown_video_watched",
    collectionBg: "#1e3a8a", collectionBorder: "rgba(147,197,253,0.7)", collectionGlow: "rgba(96,165,250,0.45)",
    video: "/video_adult_mantaray.mp4", isEggType: false, scale: 1.6,
    accentColor: "#818cf8", accentGlow: "rgba(129,140,248,0.5)",
    btnColor: "#3b82f6", btnGlow: "rgba(59,130,246,0.5)", btn3Color: "#818cf8", btn3Glow: "rgba(129,140,248,0.5)",
    feedLabel: "mantaray", feedLabelZh: "蝠鱝",
    levelUpMessages: [
      { main: "Hello little one!",      zh: "你好小寶貝！",         sub: "A Baby Manta Ray appeared!",      subZh: "小蝠鱝出現了！" },
      { main: "Growing so fast!",       zh: "長得好快！",           sub: "Now a Young Manta Ray!",          subZh: "現在是年輕蝠鱝了！" },
      { main: "Magnificent! Amazing!",  zh: "太壯觀了！太棒了！",   sub: "You raised a Grown Manta Ray!",   subZh: "你養大了一隻成年蝠鱝！" },
    ],
    unlockOverlay: { emoji: "🐟", title: "New Friend!", titleZh: "新朋友來了！", eggLine: "A Manta Ray appeared!", eggLineZh: "蝠鱝出現了！", feedLine: "Feed it treats to help it grow!", feedLineZh: "餵牠餅乾讓牠長大！", btnText: "So cool! · 太酷了！🎉", glowColor: "rgba(96,165,250,0.6)", borderColor: "rgba(147,197,253,0.7)", bgGradient: "linear-gradient(135deg,#0f172a,#1e3a8a,#2563eb)" },
  },
];
// locked placeholder slots (fills collection grid to 6 total)
const LOCKED_SLOTS = [
  { collectionBg: "#7c3aed", collectionBorder: "rgba(167,139,250,0.5)", collectionGlow: "rgba(124,58,237,0.25)" },
  { collectionBg: "#0d9488", collectionBorder: "rgba(94,234,212,0.5)",  collectionGlow: "rgba(13,148,136,0.25)" },
  { collectionBg: "#b45309", collectionBorder: "rgba(251,191,36,0.5)",  collectionGlow: "rgba(180,83,9,0.25)"  },
  { collectionBg: "#be185d", collectionBorder: "rgba(249,168,212,0.5)", collectionGlow: "rgba(190,24,93,0.25)" },
];
const getAnimalStage = (animal: Animal, fed: number): AnimalStage =>
  [...animal.stages].reverse().find(s => fed >= s.min) ?? animal.stages[0];
const getAnimalStageIdx = (animal: Animal, fed: number): number =>
  animal.stages.indexOf(getAnimalStage(animal, fed));

// ── EGG CRACKS ───────────────────────────────────────────────────────────────
const EggCracks = ({ treats }: { treats: number }) => {
  const level = treats <= 2 ? 0 : treats <= 5 ? 1 : treats <= 8 ? 2 : treats <= 11 ? 3 : 4;
  if (level === 0) return null;
  return (
    <svg viewBox="0 0 200 200" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 10 }}>
      {level >= 1 && (
        <path d="M105,55 L112,70 L108,78 L115,92" stroke="#8B5E3C" strokeWidth="2.5" fill="none" strokeLinecap="round" style={{ filter: "drop-shadow(0 0 3px rgba(255,200,100,0.8))" }} />
      )}
      {level >= 2 && (
        <>
          <path d="M105,55 L112,70 L108,78 L115,92" stroke="#8B5E3C" strokeWidth="2.5" fill="none" strokeLinecap="round" style={{ filter: "drop-shadow(0 0 3px rgba(255,200,100,0.8))" }} />
          <path d="M88,70 L80,82 L85,90 L79,102" stroke="#8B5E3C" strokeWidth="2" fill="none" strokeLinecap="round" style={{ filter: "drop-shadow(0 0 3px rgba(255,200,100,0.8))" }} />
        </>
      )}
      {level >= 3 && (
        <>
          <path d="M105,55 L112,70 L108,78 L115,92" stroke="#7a4e2a" strokeWidth="3" fill="none" strokeLinecap="round" style={{ filter: "drop-shadow(0 0 4px rgba(255,200,100,0.9))" }} />
          <path d="M88,70 L80,82 L85,90 L79,102" stroke="#7a4e2a" strokeWidth="2.5" fill="none" strokeLinecap="round" style={{ filter: "drop-shadow(0 0 4px rgba(255,200,100,0.9))" }} />
          <path d="M115,92 L122,100 L118,108" stroke="#7a4e2a" strokeWidth="2" fill="none" strokeLinecap="round" style={{ filter: "drop-shadow(0 0 3px rgba(255,200,100,0.8))" }} />
          <path d="M100,110 L106,120 L102,128" stroke="#7a4e2a" strokeWidth="2" fill="none" strokeLinecap="round" />
        </>
      )}
      {level >= 4 && (
        <>
          <path d="M105,55 L112,70 L108,78 L115,92 L108,102 L114,115" stroke="#5a3010" strokeWidth="3.5" fill="none" strokeLinecap="round" style={{ filter: "drop-shadow(0 0 6px rgba(255,180,50,1))" }} />
          <path d="M88,70 L80,82 L85,90 L79,102 L85,112" stroke="#5a3010" strokeWidth="3" fill="none" strokeLinecap="round" style={{ filter: "drop-shadow(0 0 5px rgba(255,180,50,0.9))" }} />
          <path d="M115,92 L125,98 L120,108 L127,116" stroke="#5a3010" strokeWidth="2.5" fill="none" strokeLinecap="round" style={{ filter: "drop-shadow(0 0 4px rgba(255,180,50,0.8))" }} />
          <path d="M100,110 L106,122 L100,130 L107,140" stroke="#5a3010" strokeWidth="2.5" fill="none" strokeLinecap="round" style={{ filter: "drop-shadow(0 0 4px rgba(255,180,50,0.8))" }} />
          <path d="M82,95 L75,105 L80,115" stroke="#5a3010" strokeWidth="2" fill="none" strokeLinecap="round" />
          {[[114, 115], [85, 112], [127, 116], [107, 140]].map(([cx, cy], i) => (
            <circle key={i} cx={cx} cy={cy} r="3" fill="#ffd700" opacity="0.8" style={{ animation: `spL ${1 + i * 0.3}s ease-in-out infinite` }} />
          ))}
        </>
      )}
    </svg>
  );
};

// ── ROUND FACE COOKIE ─────────────────────────────────────────────────────────
const FaceCookie = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" style={{ display: "inline-block", flexShrink: 0 }}>
    <circle cx="20" cy="20" r="18" fill="#d4b483" stroke="#b8965a" strokeWidth="1.2" />
    {Array.from({ length: 10 }).map((_, j) => {
      const angle = (j / 10) * Math.PI * 2;
      const rx = 20 + Math.cos(angle) * 18;
      const ry = 20 + Math.sin(angle) * 18;
      return <circle key={j} cx={rx} cy={ry} r="1.8" fill="#b8965a" opacity="0.6" />;
    })}
    <circle cx="15" cy="17" r="2" fill="#7a5c2e" opacity="0.8" />
    <circle cx="25" cy="17" r="2" fill="#7a5c2e" opacity="0.8" />
    <path d="M13,23 Q20,29 27,23" stroke="#7a5c2e" strokeWidth="1.8" fill="none" strokeLinecap="round" opacity="0.7" />
    <ellipse cx="14" cy="10" rx="5" ry="2.5" fill="white" opacity="0.18" transform="rotate(-25,14,10)" />
  </svg>
);

// ── DISNEY NAME TAG ───────────────────────────────────────────────────────────
const DisneyNameTag = ({ name, onRename }: { name: string; onRename?: () => void }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <div style={{ position: "relative", display: "inline-block", marginBottom: "0.5rem" }}>
      <svg viewBox="0 0 240 80" width="240" height="80" overflow="visible">
        <defs>
          <linearGradient id="tBg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ff9de2" />
            <stop offset="50%" stopColor="#ff6ec7" />
            <stop offset="100%" stopColor="#e040a0" />
          </linearGradient>
          <linearGradient id="tBrd" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ffd700" />
            <stop offset="50%" stopColor="#ffaa00" />
            <stop offset="100%" stopColor="#ff8800" />
          </linearGradient>
          <filter id="tShadow">
            <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#c020a0" floodOpacity="0.45" />
          </filter>
        </defs>
        <path d="M88,8 Q70,-5 52,2" stroke="#60b8ff" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <path d="M152,8 Q170,-5 188,2" stroke="#60b8ff" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <circle cx="88" cy="8" r="3.5" fill="#ffd700" stroke="#ffaa00" strokeWidth="1" />
        <circle cx="152" cy="8" r="3.5" fill="#ffd700" stroke="#ffaa00" strokeWidth="1" />
        <path d="M10,18 L20,10 L220,10 L230,18 L230,62 L220,70 L20,70 L10,62 Z" fill="url(#tBg)" filter="url(#tShadow)" />
        <path d="M10,18 L20,10 L220,10 L230,18 L230,62 L220,70 L20,70 L10,62 Z" fill="none" stroke="url(#tBrd)" strokeWidth="3" />
        <path d="M16,20 L24,14 L216,14 L224,20 L224,60 L216,66 L24,66 L16,60 Z" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />
        <path d="M30,25 L32,19 L34,25 L40,25 L35,29 L37,35 L32,31 L27,35 L29,29 L24,25 Z" fill="#ffd700" opacity="0.9" />
        <path d="M210,25 L212,19 L214,25 L220,25 L215,29 L217,35 L212,31 L207,35 L209,29 L204,25 Z" fill="#ffd700" opacity="0.9" />
        <path d="M22,53 L23,50 L24,53 L27,53 L25,55 L26,58 L23,56 L20,58 L21,55 L19,53 Z" fill="#ffd700" opacity="0.7" />
        <path d="M218,53 L219,50 L220,53 L223,53 L221,55 L222,58 L219,56 L216,58 L217,55 L215,53 Z" fill="#ffd700" opacity="0.7" />
        {[[55, 16], [125, 13], [195, 18], [50, 64], [120, 67], [192, 60]].map(([cx, cy], i) => (
          <circle key={i} cx={cx} cy={cy} r="2.2" fill="rgba(255,255,255,0.55)" style={{ animation: `sTag ${1.5 + i * 0.3}s ease-in-out infinite ${i * 0.2}s` }} />
        ))}
        <path d="M24,63 Q48,58 72,63 Q96,68 120,63 Q144,58 168,63 Q192,68 216,63" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" fill="none" />
      </svg>
      <div style={{
        position: "absolute", top: "50%", left: "50%",
        transform: "translate(-50%,-50%) translateY(2px)",
        fontFamily: "'Fredoka One',cursive", fontSize: "1.45rem",
        color: "white", whiteSpace: "nowrap", letterSpacing: "0.06em",
        textShadow: "0 2px 4px rgba(150,0,80,0.6), 0 0 14px rgba(255,150,220,0.5)"
      }}>{name}</div>
      {onRename && (
        <div style={{ position: "absolute", bottom: 2, right: -4 }}>
          <div style={{ position: "relative", display: "inline-block" }}>
            <button
              onClick={onRename}
              onMouseEnter={() => setHovered(true)}
              onMouseLeave={() => setHovered(false)}
              style={{ background: "rgba(255,255,255,0.2)", border: "1.5px solid rgba(255,255,255,0.45)", borderRadius: "50%", width: 24, height: 24, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: 0, transition: "background 0.2s" }}
              onMouseDown={e => (e.currentTarget.style.background = "rgba(255,255,255,0.4)")}
              onMouseUp={e => (e.currentTarget.style.background = "rgba(255,255,255,0.2)")}
            >
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                <path d="M9 1.5l2.5 2.5-7 7L2 12l.5-2.5 7-7z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M7.5 3l2.5 2.5" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
            {hovered && (
              <div style={{ position: "absolute", bottom: 30, left: "50%", transform: "translateX(-50%)", background: "rgba(0,0,0,0.75)", color: "white", fontFamily: "Nunito,sans-serif", fontSize: "0.75rem", padding: "0.3rem 0.6rem", borderRadius: "8px", whiteSpace: "nowrap", pointerEvents: "none", zIndex: 99 }}>
                Rename your friend! · 重新幫你的朋友取名字！
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// ── TREAT JAR ─────────────────────────────────────────────────────────────────
const TreatJar = ({ treats, nextStage }: { treats: number; nextStage: AnimalStage | null }) => {
  const displayTreats = Math.min(treats, 9999);
  const cookieCount = treats === 0 ? 0 : Math.min(treats, 9);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.4rem" }}>
      <div style={{ position: "relative", width: 100, height: 130 }}>
        <svg viewBox="0 0 100 130" width="100" height="130">
          <defs>
            <linearGradient id="jB" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="rgba(200,230,255,0.18)" />
              <stop offset="40%" stopColor="rgba(255,255,255,0.38)" />
              <stop offset="100%" stopColor="rgba(200,230,255,0.12)" />
            </linearGradient>
            <clipPath id="jCP">
              <path d="M16,33 Q13,36 13,43 L13,112 Q13,120 21,120 L79,120 Q87,120 87,112 L87,43 Q87,36 84,33 Z" />
            </clipPath>
          </defs>
          <rect x="22" y="17" width="56" height="18" rx="7" fill="#fbbf24" stroke="#f59e0b" strokeWidth="1.5" />
          <rect x="27" y="20" width="46" height="5" rx="2.5" fill="rgba(255,255,255,0.45)" />
          <rect x="40" y="12" width="20" height="9" rx="4" fill="#f59e0b" stroke="#d97706" strokeWidth="1" />
          <path d="M16,33 Q13,36 13,43 L13,112 Q13,120 21,120 L79,120 Q87,120 87,112 L87,43 Q87,36 84,33 Z" fill="url(#jB)" stroke="rgba(255,255,255,0.5)" strokeWidth="2" />
          {cookieCount > 0 && Array.from({ length: cookieCount }).map((_, i) => {
            const col = i % 3;
            const row = Math.floor(i / 3);
            const cx = 28 + col * 20;
            const cy = 105 - row * 20;
            return (
              <g key={i} clipPath="url(#jCP)" style={{ animation: `jF2 ${2 + i * 0.25}s ease-in-out infinite ${i * 0.15}s` }}>
                <circle cx={cx} cy={cy} r="8" fill="#d4b483" stroke="#b8965a" strokeWidth="1" />
                {Array.from({ length: 10 }).map((_, j) => {
                  const angle = (j / 10) * Math.PI * 2;
                  const rx = cx + Math.cos(angle) * 8;
                  const ry = cy + Math.sin(angle) * 8;
                  return <circle key={j} cx={rx} cy={ry} r="1.1" fill="#b8965a" opacity="0.6" />;
                })}
                <circle cx={cx - 3} cy={cy - 2} r="1.2" fill="#7a5c2e" opacity="0.8" />
                <circle cx={cx + 3} cy={cy - 2} r="1.2" fill="#7a5c2e" opacity="0.8" />
                <path d={`M${cx - 4},${cy + 2} Q${cx},${cy + 5} ${cx + 4},${cy + 2}`} stroke="#7a5c2e" strokeWidth="1.2" fill="none" strokeLinecap="round" opacity="0.7" />
              </g>
            );
          })}
          <path d="M24,42 Q26,76 24,108" stroke="rgba(255,255,255,0.38)" strokeWidth="5" fill="none" strokeLinecap="round" />
        </svg>
      </div>
      <div style={{ fontFamily: "'Fredoka One',cursive", fontSize: "1.1rem", color: "white", textShadow: "0 2px 6px rgba(0,0,0,0.4)", textAlign: "center" }}>
        {displayTreats} treat{displayTreats !== 1 ? "s" : ""}
      </div>
      {!nextStage && (
        <div style={{ fontFamily: "Nunito,sans-serif", fontSize: "0.85rem", color: "#fbbf24", textAlign: "center", background: "rgba(0,0,0,0.28)", borderRadius: "999px", padding: "0.2rem 0.8rem" }}>
          Max stage!
        </div>
      )}
    </div>
  );
};

// ── LEVEL UP OVERLAY ──────────────────────────────────────────────────────────
const LevelUpOverlay = ({ animal, stageIdx, onDismiss }: { animal: Animal; stageIdx: number; onDismiss: () => void }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext("2d"); if (!ctx) return;
    canvas.width = window.innerWidth; canvas.height = window.innerHeight;
    const pieces = Array.from({ length: 130 }, () => ({
      x: Math.random() * canvas.width, y: -20,
      r: 4 + Math.random() * 8,
      color: ["#fbbf24", "#f97316", "#ec4899", "#a855f7", "#22d3ee", "#4ade80", "#f43f5e"][Math.floor(Math.random() * 7)],
      vx: (Math.random() - 0.5) * 5, vy: 2 + Math.random() * 5,
      rot: Math.random() * 360, vrot: (Math.random() - 0.5) * 8,
      shape: Math.floor(Math.random() * 3),
    }));
    let frame: number;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      pieces.forEach(p => {
        p.x += p.vx; p.y += p.vy; p.rot += p.vrot; p.vy += 0.08;
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot * Math.PI / 180);
        ctx.fillStyle = p.color;
        if (p.shape === 0) { ctx.fillRect(-p.r / 2, -p.r / 2, p.r, p.r); }
        else if (p.shape === 1) { ctx.beginPath(); ctx.arc(0, 0, p.r / 2, 0, Math.PI * 2); ctx.fill(); }
        else { ctx.beginPath(); ctx.moveTo(0, -p.r); ctx.lineTo(p.r, p.r); ctx.lineTo(-p.r, p.r); ctx.closePath(); ctx.fill(); }
        ctx.restore();
        if (p.y > canvas.height) { p.y = -20; p.x = Math.random() * canvas.width; }
      });
      frame = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(frame);
  }, []);

  const msg = animal.levelUpMessages[Math.min(stageIdx - 1, animal.levelUpMessages.length - 1)] ?? animal.levelUpMessages[0];
  const newImg = animal.stages[stageIdx]?.img ?? animal.stages[animal.stages.length - 1].img;

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 500, background: "rgba(0,0,60,0.82)", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", padding: "1rem", animation: "popIn 0.4s ease-out" }}>
      <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0 }} />
      <div style={{ position: "relative", zIndex: 10, textAlign: "center", background: "linear-gradient(135deg,#0c3460,#1a6e8a)", borderRadius: "2.5rem", padding: "2.5rem 2rem", maxWidth: 360, width: "100%", border: "3px solid rgba(255,215,0,0.65)", boxShadow: "0 0 60px rgba(255,215,0,0.4),0 20px 60px rgba(0,0,0,0.5)" }}>
        <div style={{ position: "absolute", inset: -8, borderRadius: "2.8rem", border: "2px solid rgba(255,215,0,0.3)", animation: "goldPulse 1.5s ease-in-out infinite", pointerEvents: "none" }} />
        <div style={{ marginBottom: "0.5rem" }}>
          {["★", "★", "★"].map((s, i) => (
            <span key={i} style={{ display: "inline-block", color: "#fbbf24", fontSize: "2rem", animation: `sBounce 0.6s ease-out ${i * 0.12}s both` }}>{s}</span>
          ))}
        </div>
        <div style={{ fontFamily: "'Fredoka One',cursive", fontSize: "2.6rem", color: "#fbbf24", textShadow: "0 0 20px rgba(255,215,0,0.9)", marginBottom: "0.2rem", lineHeight: 1.1 }}>WOW!</div>
        <div style={{ fontFamily: "'Fredoka One',cursive", fontSize: "1.6rem", color: "white", marginBottom: "0.1rem", textShadow: "0 2px 8px rgba(0,0,0,0.4)" }}>
          {msg.main}
        </div>
        <div style={{ fontFamily: "Nunito,sans-serif", fontSize: "1.1rem", color: "rgba(255,255,255,0.75)", marginBottom: "1rem" }}>{msg.zh}</div>
        <div style={{ position: "relative", display: "inline-block", animation: "cReveal 0.8s cubic-bezier(0.34,1.56,0.64,1) 0.3s both" }}>
          <div style={{ position: "absolute", inset: -20, borderRadius: "50%", background: "radial-gradient(circle,rgba(255,215,0,0.4) 0%,transparent 70%)", animation: "goldPulse 1s ease-in-out infinite" }} />
          <img src={newImg} alt="New stage!" style={{ width: 150, height: 130, objectFit: "contain", filter: "drop-shadow(0 0 20px rgba(255,215,0,0.9))" }} />
        </div>
        <div style={{ fontFamily: "'Fredoka One',cursive", fontSize: "1.2rem", color: "#fbbf24", margin: "0.75rem 0 0.25rem", textShadow: "0 2px 6px rgba(0,0,0,0.3)" }}>
          {msg.sub}
        </div>
        <div style={{ fontFamily: "Nunito,sans-serif", fontSize: "1rem", color: "rgba(255,255,255,0.65)", marginBottom: "1.25rem" }}>{msg.subZh}</div>
        <button onClick={onDismiss} style={{ background: "linear-gradient(135deg,#fbbf24,#f97316)", border: "none", borderRadius: "999px", color: "white", fontFamily: "'Fredoka One',cursive", fontSize: "1.6rem", padding: "0.85rem 3rem", cursor: "pointer", boxShadow: "0 6px 24px rgba(251,191,36,0.65)" }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.transform = "scale(1.06)"}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.transform = ""}>
          Yay!!! 太棒了！
        </button>
      </div>
    </div>
  );
};

// ── PET NAMING ────────────────────────────────────────────────────────────────
const PetNamingInput = ({ petName, onSave, isRenaming, onCancelRename }: { petName: string; onSave: (n: string) => void; isRenaming?: boolean; onCancelRename?: () => void }) => {
  const [val, setVal] = useState(petName);
  useEffect(() => { setVal(petName); }, [petName]);

  // First-time naming: no name yet, show prompt button or input
  const [editingFirst, setEditingFirst] = useState(false);

  if (!petName && !editingFirst) return (
    <button onClick={() => setEditingFirst(true)} style={{ background: "rgba(255,255,255,0.15)", border: "1.5px dashed rgba(255,255,255,0.4)", borderRadius: "999px", color: "rgba(255,255,255,0.8)", fontFamily: "'Fredoka One',cursive", fontSize: "0.95rem", padding: "0.3rem 1rem", cursor: "pointer", marginBottom: "0.5rem" }}>
      Give your pet a name! · 幫你的寵物取個名字！
    </button>
  );

  if (!petName && editingFirst) return (
    <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.5rem", alignItems: "center" }}>
      <input autoFocus value={val}
        onChange={e => setVal(e.target.value)}
        onKeyDown={e => { if (e.key === "Enter" && val.trim()) { onSave(val.trim()); setEditingFirst(false); } }}
        maxLength={16} placeholder="Enter a name."
        style={{ fontFamily: "'Fredoka One',cursive", fontSize: "1rem", padding: "0.4rem 0.9rem", borderRadius: "999px", border: "2px solid rgba(255,255,255,0.5)", background: "rgba(255,255,255,0.2)", color: "white", outline: "none", width: 140 }} />
      <button onClick={() => { if (val.trim()) { onSave(val.trim()); setEditingFirst(false); } }} style={{ background: "#4ade80", border: "none", borderRadius: "999px", color: "white", fontFamily: "'Fredoka One',cursive", fontSize: "0.9rem", padding: "0.4rem 0.9rem", cursor: "pointer" }}>Save · 儲存</button>
    </div>
  );

  // Rename mode: inline below name tag, triggered by pen icon
  if (isRenaming) return (
    <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.25rem", marginBottom: "0.25rem", alignItems: "center", justifyContent: "center" }}>
      <input autoFocus value={val}
        onChange={e => setVal(e.target.value)}
        onKeyDown={e => {
          if (e.key === "Enter" && val.trim()) { onSave(val.trim()); }
          if (e.key === "Escape") { if (onCancelRename) onCancelRename(); }
        }}
        maxLength={16}
        style={{ fontFamily: "'Fredoka One',cursive", fontSize: "1rem", padding: "0.4rem 0.9rem", borderRadius: "999px", border: "2px solid rgba(255,255,255,0.5)", background: "rgba(255,255,255,0.2)", color: "white", outline: "none", width: 140, textAlign: "center" }} />
      <button onClick={() => { if (val.trim()) onSave(val.trim()); }}
        style={{ background: "#4ade80", border: "none", borderRadius: "50%", width: 32, height: 32, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem" }}>✓</button>
      <button onClick={() => { if (onCancelRename) onCancelRename(); }}
        style={{ background: "#f87171", border: "none", borderRadius: "50%", width: 32, height: 32, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem" }}>✗</button>
    </div>
  );

  // Named, not renaming: render nothing (pen icon on name tag handles it)
  return null;
};

// ── UNDERWATER BG ─────────────────────────────────────────────────────────────
const UnderwaterBg = ({ sad }: { sad: boolean }) => (
  <svg viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", zIndex: 0 }}>
    <defs>
      <linearGradient id="wG" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={sad ? "#0d1f2d" : "#003d6b"} />
        <stop offset="45%" stopColor={sad ? "#122030" : "#0077b6"} />
        <stop offset="100%" stopColor={sad ? "#1a2e1a" : "#00b4a0"} />
      </linearGradient>
      <linearGradient id="sG" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#c8a96e" />
        <stop offset="100%" stopColor="#96703a" />
      </linearGradient>
      <radialGradient id="r1" cx="25%" cy="0%"><stop offset="0%" stopColor="white" stopOpacity="0.13" /><stop offset="100%" stopColor="white" stopOpacity="0" /></radialGradient>
      <radialGradient id="r2" cx="55%" cy="0%"><stop offset="0%" stopColor="white" stopOpacity="0.09" /><stop offset="100%" stopColor="white" stopOpacity="0" /></radialGradient>
      <radialGradient id="r3" cx="78%" cy="0%"><stop offset="0%" stopColor="white" stopOpacity="0.07" /><stop offset="100%" stopColor="white" stopOpacity="0" /></radialGradient>
    </defs>
    <rect width="800" height="600" fill="url(#wG)" />
    <ellipse cx="200" cy="-30" rx="55" ry="420" fill="url(#r1)" style={{ animation: "rW 7s ease-in-out infinite" }} />
    <ellipse cx="440" cy="-30" rx="45" ry="400" fill="url(#r2)" style={{ animation: "rW 9s ease-in-out infinite 1.5s" }} />
    <ellipse cx="624" cy="-30" rx="38" ry="380" fill="url(#r3)" style={{ animation: "rW 8s ease-in-out infinite 3s" }} />
    <ellipse cx="120" cy="530" rx="100" ry="55" fill="#1a3d28" opacity="0.55" />
    <ellipse cx="680" cy="535" rx="90" ry="50" fill="#1a3d28" opacity="0.5" />
    <rect x="0" y="568" width="800" height="80" fill="url(#sG)" />
    <ellipse cx="400" cy="568" rx="420" ry="28" fill="url(#sG)" />
    {[60, 160, 260, 360, 460, 560, 660, 740].map((x, i) => (
      <ellipse key={i} cx={x} cy="575" rx="32" ry="4" fill="#a08050" opacity="0.35" />
    ))}
    <g style={{ transformOrigin: "70px 565px", animation: "sw 4s ease-in-out infinite" }}>
      <rect x="64" y="498" width="12" height="70" rx="6" fill="#ff5555" />
      <circle cx="70" cy="495" r="18" fill="#ff3333" />
      <circle cx="56" cy="508" r="12" fill="#ff5555" />
      <circle cx="84" cy="506" r="14" fill="#ff4444" />
    </g>
    {[148, 168, 190, 210].map((x, i) => (
      <g key={i} style={{ transformOrigin: `${x}px 568px`, animation: `sw ${3.2 + i * 0.8}s ease-in-out infinite ${i * 0.4}s` }}>
        <path d={`M${x} 568 Q${x + (i % 2 === 0 ? -18 : 16)} ${538 - i * 5} ${x + (i % 2 === 0 ? 6 : -4)} ${510 - i * 5} Q${x + (i % 2 === 0 ? -12 : 14)} ${485 - i * 4} ${x + (i % 2 === 0 ? 4 : -2)} ${462 - i * 4}`} stroke={["#22c55e", "#16a34a", "#15803d", "#166534"][i]} strokeWidth="7" fill="none" strokeLinecap="round" />
      </g>
    ))}
    <g style={{ transformOrigin: "685px 565px", animation: "sw 4.8s ease-in-out infinite 1.2s" }}>
      <rect x="679" y="492" width="12" height="76" rx="6" fill="#a855f7" />
      <circle cx="685" cy="489" r="20" fill="#9333ea" />
      <circle cx="670" cy="504" r="13" fill="#a855f7" />
      <circle cx="700" cy="502" r="15" fill="#c084fc" />
    </g>
    {[580, 602, 625, 648].map((x, i) => (
      <g key={i} style={{ transformOrigin: `${x}px 568px`, animation: `sw ${3.5 + i * 0.7}s ease-in-out infinite ${i * 0.35}s` }}>
        <path d={`M${x} 568 Q${x + (i % 2 === 0 ? 16 : -18)} ${538 - i * 5} ${x + (i % 2 === 0 ? -4 : 6)} ${510 - i * 5} Q${x + (i % 2 === 0 ? 12 : -14)} ${485 - i * 4} ${x + (i % 2 === 0 ? -2 : 4)} ${462 - i * 4}`} stroke={["#10b981", "#059669", "#047857", "#065f46"][i]} strokeWidth="7" fill="none" strokeLinecap="round" />
      </g>
    ))}
    {[{ x: 90, s: 9, d: 9, dl: 0 }, { x: 210, s: 6, d: 12, dl: 2.5 }, { x: 330, s: 11, d: 8, dl: 5 }, { x: 460, s: 7, d: 14, dl: 1 }, { x: 570, s: 9, d: 10, dl: 3.5 }, { x: 690, s: 5, d: 8, dl: 6.5 }, { x: 155, s: 7, d: 13, dl: 4 }, { x: 415, s: 10, d: 9, dl: 7 }, { x: 535, s: 6, d: 11, dl: 2 }].map((b, i) => (
      <circle key={i} cx={b.x} cy="620" r={b.s} fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="1.5" style={{ animation: `bU ${b.d}s ease-in infinite ${b.dl}s` }} />
    ))}
    <g style={{ animation: "fR 20s linear infinite" }}>
      <ellipse cx="-40" cy="200" rx="18" ry="9" fill="#fbbf24" opacity="0.4" />
      <polygon points="-58,200 -72,194 -72,206" fill="#fbbf24" opacity="0.4" />
    </g>
    <g style={{ animation: "fL 25s linear infinite 6s" }}>
      <ellipse cx="840" cy="300" rx="14" ry="7" fill="#a78bfa" opacity="0.35" />
      <polygon points="854,300 866,295 866,305" fill="#a78bfa" opacity="0.35" />
    </g>
    <style>{`
      @keyframes sw{0%,100%{transform:rotate(-6deg)}50%{transform:rotate(6deg)}}
      @keyframes rW{0%,100%{opacity:.85;transform:skewX(-4deg)}50%{opacity:1;transform:skewX(4deg)}}
      @keyframes bU{0%{transform:translateY(0);opacity:.6}50%{transform:translateY(-310px) translateX(14px);opacity:.35}100%{transform:translateY(-660px) translateX(-12px);opacity:0}}
      @keyframes fR{0%{transform:translateX(0)}100%{transform:translateX(900px)}}
      @keyframes fL{0%{transform:translateX(0) scaleX(-1)}100%{transform:translateX(-900px) scaleX(-1)}}
    `}</style>
  </svg>
);

// ── EARN BUTTONS ──────────────────────────────────────────────────────────────
const EarnButtons = ({ navigate, code, studentName, activeAnimal }: { navigate: (p: string) => void; code: string; studentName: string; activeAnimal: Animal }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
    {[
      { label: "Play a Game", sub: "打敗遊戲，得1~3個餅乾！", reward: "+1~3 treats", color: activeAnimal.btnColor, glow: activeAnimal.btnGlow, path: `/game/${code}/${studentName}/BOOKNUM` },
      { label: "Read & Quiz", sub: "即將推出！Coming Soon!", reward: "🔒", color: "#a855f7", glow: "rgba(168,85,247,0.0)", path: "", disabled: true },
      { label: "Visit 5 Days!", sub: "連續來5天！", reward: "+3 treats", color: activeAnimal.btn3Color, glow: activeAnimal.btn3Glow, path: "" },
    ].map((btn, i) => (
      <button key={i} onClick={() => { if(!btn.disabled && btn.path){ const f = JSON.parse(sessionStorage.getItem('mpe_family') || '{}'); navigate(btn.path.replace('BOOKNUM', String(f?.book ?? 1))); }}} style={{
        width: "100%", padding: "1.1rem 1.25rem",
        background: `linear-gradient(135deg,${btn.color},${btn.color}cc)`,
        border: "none", borderRadius: "1.4rem", opacity: btn.disabled ? 0.4 : 1,
        cursor: btn.disabled ? "not-allowed" : "pointer",
        boxShadow: `0 6px 20px ${btn.glow}`,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        textAlign: "left", animation: `eF ${2.5 + i * 0.4}s ease-in-out infinite`
      }}
        onMouseEnter={e => { if (btn.disabled) return; const el = e.currentTarget as HTMLElement; el.style.transform = "scale(1.04) translateY(-3px)"; el.style.boxShadow = `0 12px 30px ${btn.glow}`; }}
        onMouseLeave={e => { if (btn.disabled) return; const el = e.currentTarget as HTMLElement; el.style.transform = ""; el.style.boxShadow = `0 6px 20px ${btn.glow}`; }}
      >
        <div>
          <div style={{ fontFamily: "'Fredoka One',cursive", fontSize: "1.35rem", color: "white", lineHeight: 1.2 }}>{btn.label}</div>
          <div style={{ fontFamily: "Nunito,sans-serif", fontSize: "1.05rem", color: "rgba(255,255,255,0.9)", marginTop: "0.15rem" }}>{btn.sub}</div>
        </div>
        <div style={{ background: "rgba(255,255,255,0.25)", borderRadius: "999px", padding: "0.35rem 0.9rem", flexShrink: 0, marginLeft: "0.5rem", fontFamily: "'Fredoka One',cursive", fontSize: "1.1rem", color: "white", whiteSpace: "nowrap" }}>
          {btn.reward}
        </div>
      </button>
    ))}
  </div>
);

// ── COLLECTION ────────────────────────────────────────────────────────────────
const OceanCollection = ({ fedTreatsMap, videoWatched, videoWatchedMap, unlockSeenMap, onAnimalClick }: { fedTreatsMap: Record<string,number>; videoWatched: boolean; videoWatchedMap: Record<string,boolean>; unlockSeenMap: Record<string,boolean>; onAnimalClick: (id: string) => void }) => {
  const lockedCount = 6 - ANIMALS.length;
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "0.75rem" }}>
      {ANIMALS.map((animal, i) => {
        const fed = fedTreatsMap[animal.id] ?? 0;
        const animalStageIdx = getAnimalStageIdx(animal, fed);
        const currentImg = animal.stages[animalStageIdx].img;
        const isUnlocked = (() => {
          if (animal.unlockCondition === "default") return true;
          if (animal.unlockCondition === "turtle_grown_video_watched") {
            return getAnimalStageIdx(ANIMALS[0], fedTreatsMap["turtle"] ?? 0) === 3 && (videoWatchedMap["turtle"] ?? false);
          }
          if (animal.unlockCondition === "dolphin_grown_video_watched") {
            const dolphin = ANIMALS.find(a => a.id === "dolphin");
            return dolphin ? getAnimalStageIdx(dolphin, fedTreatsMap["dolphin"] ?? 0) === 3 && (videoWatchedMap["dolphin"] ?? false) && (unlockSeenMap["dolphin"] ?? false) : false;
          }
          if (animal.unlockCondition === "octopus_grown_video_watched") {
            const octopus = ANIMALS.find(a => a.id === "octopus");
            return octopus ? getAnimalStageIdx(octopus, fedTreatsMap["octopus"] ?? 0) === 3 && (videoWatchedMap["octopus"] ?? false) && (unlockSeenMap["octopus"] ?? false) : false;
          }
          if (animal.unlockCondition === "shark_grown_video_watched") {
            const shark = ANIMALS.find(a => a.id === "shark");
            return shark ? getAnimalStageIdx(shark, fedTreatsMap["shark"] ?? 0) === 3 && (videoWatchedMap["shark"] ?? false) && (unlockSeenMap["shark"] ?? false) : false;
          }
          if (animal.unlockCondition === "clownfish_grown_video_watched") {
            const clownfish = ANIMALS.find(a => a.id === "clownfish");
            return clownfish ? getAnimalStageIdx(clownfish, fedTreatsMap["clownfish"] ?? 0) === 3 && (videoWatchedMap["clownfish"] ?? false) && (unlockSeenMap["clownfish"] ?? false) : false;
          }
          return false;
        })();
        const unlockSeen = unlockSeenMap[animal.id] ?? false;
        const isClickable = isUnlocked && !unlockSeen && animal.unlockCondition !== "default";
        return (
          <div key={animal.id} id={`animal-card-${animal.id}`} onClick={isClickable ? () => onAnimalClick(animal.id) : undefined}
            style={{ position: "relative", borderRadius: "1.25rem",
              background: isClickable ? `${animal.collectionBg}22` : `${animal.collectionBg}${isUnlocked ? "33" : "18"}`,
              border: `2px solid ${isClickable ? animal.collectionBorder : animal.collectionBorder}`,
              padding: "0.85rem 0.5rem",
              boxShadow: isClickable ? `0 0 30px ${animal.collectionGlow}, 0 0 60px ${animal.collectionGlow}` : `0 0 ${isUnlocked ? 20 : 10}px ${animal.collectionGlow}`,
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
              transition: "all 0.3s", cursor: isClickable ? "pointer" : "default",
              animation: isClickable ? "dolphinPulse 1.2s ease-in-out infinite" : undefined }}>
            {isUnlocked && (unlockSeen || animal.unlockCondition === "default") ? (
              <>
                <img src={currentImg} alt={animal.name} style={{ width: 62, height: 62, objectFit: "contain", filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.3))", display: "block", margin: "0 auto", animation: "bobAnim 3s ease-in-out infinite" }} />
                <div style={{ fontFamily: "'Fredoka One',cursive", fontSize: "0.85rem", color: "#fbbf24", marginTop: "0.35rem", textAlign: "center", textShadow: "0 1px 4px rgba(0,0,0,0.4)" }}>{animal.name}</div>
                <div style={{ position: "absolute", inset: -3, borderRadius: "1.4rem", border: "2px solid rgba(255,215,0,0.4)", animation: "gP 2s ease-in-out infinite", pointerEvents: "none" }} />
              </>
            ) : isClickable ? (
              <>
                {unlockSeen ? (
                  <img src={animal.stages[0].img} alt={animal.name} style={{ width: 62, height: 62, objectFit: "contain", filter: `drop-shadow(0 4px 12px ${animal.collectionGlow})`, display: "block", margin: "0 auto", animation: "bobAnim 2s ease-in-out infinite" }} />
                ) : (
                  <div style={{ width: 56, height: 52, borderRadius: "30% 40% 35% 45%", background: animal.collectionBorder, margin: "0 auto", position: "relative", display: "flex", alignItems: "center", justifyContent: "center", animation: "bobAnim 2s ease-in-out infinite", boxShadow: `0 0 24px ${animal.collectionBorder}` }}>
                    <div style={{ width: 34, height: 30, borderRadius: "40% 35% 45% 30%", background: animal.collectionBg }} />
                    <div style={{ position: "absolute", top: -6, right: -5, animation: "spL 1s ease-in-out infinite" }}>
                      <svg width="16" height="16" viewBox="0 0 14 14"><path d="M7 0L8.5 5.5L14 7L8.5 8.5L7 14L5.5 8.5L0 7L5.5 5.5Z" fill="rgba(255,255,255,1)" /></svg>
                    </div>
                    <div style={{ position: "absolute", bottom: -4, left: -4, animation: "spL 1.4s ease-in-out infinite 0.4s" }}>
                      <svg width="12" height="12" viewBox="0 0 14 14"><path d="M7 0L8.5 5.5L14 7L8.5 8.5L7 14L5.5 8.5L0 7L5.5 5.5Z" fill="rgba(255,255,255,0.9)" /></svg>
                    </div>
                    <div style={{ position: "absolute", top: 2, left: -8, animation: "spL 1.8s ease-in-out infinite 0.2s" }}>
                      <svg width="10" height="10" viewBox="0 0 14 14"><path d="M7 0L8.5 5.5L14 7L8.5 8.5L7 14L5.5 8.5L0 7L5.5 5.5Z" fill="rgba(255,255,255,0.8)" /></svg>
                    </div>
                  </div>
                )}
                <div style={{ fontFamily: "'Fredoka One',cursive", fontSize: "0.82rem", color: "#4c1d95", marginTop: "0.4rem", textAlign: "center", textShadow: "0 1px 3px rgba(255,255,255,0.6)" }}>{unlockSeen ? animal.name : "???"}</div>
                {!unlockSeen && (
                  <div style={{ fontFamily: "'Fredoka One',cursive", fontSize: "0.75rem", color: "#4c1d95", textAlign: "center", lineHeight: 1.2, textShadow: "0 1px 3px rgba(255,255,255,0.6)" }}>
                    Click Me!<br/><span style={{ fontFamily: "Noto Sans TC, sans-serif", fontSize: "0.7rem" }}>點我！</span>
                  </div>
                )}
                <div style={{ position: "absolute", inset: -3, borderRadius: "1.4rem", border: `2px solid ${animal.collectionBorder}`, animation: "gP 1s ease-in-out infinite", pointerEvents: "none" }} />
              </>
            ) : (
              <>
                <div style={{ width: 56, height: 52, borderRadius: "30% 40% 35% 45%", background: `${animal.collectionBg}55`, margin: "0 auto", position: "relative", display: "flex", alignItems: "center", justifyContent: "center", animation: "sL 2.5s ease-in-out infinite" }}>
                  <div style={{ width: 34, height: 30, borderRadius: "40% 35% 45% 30%", background: `${animal.collectionBg}88` }} />
                  <div style={{ position: "absolute", top: -6, right: -5, animation: `spL ${1.8 + i * 0.3}s ease-in-out infinite` }}>
                    <svg width="14" height="14" viewBox="0 0 14 14"><path d="M7 0L8.5 5.5L14 7L8.5 8.5L7 14L5.5 8.5L0 7L5.5 5.5Z" fill="rgba(255,255,255,0.75)" /></svg>
                  </div>
                  <div style={{ position: "absolute", bottom: -4, left: -4, animation: `spL ${2.2 + i * 0.25}s ease-in-out infinite 0.5s` }}>
                    <svg width="10" height="10" viewBox="0 0 14 14"><path d="M7 0L8.5 5.5L14 7L8.5 8.5L7 14L5.5 8.5L0 7L5.5 5.5Z" fill="rgba(255,255,255,0.55)" /></svg>
                  </div>
                </div>
                <div style={{ fontFamily: "'Fredoka One',cursive", fontSize: "0.82rem", color: animal.collectionBorder, marginTop: "0.4rem", textAlign: "center", opacity: 0.75 }}>???</div>
              </>
            )}
          </div>
        );
      })}
      {Array.from({ length: lockedCount }).map((_, i) => {
        const col = LOCKED_SLOTS[i];
        return (
          <div key={`locked-${i}`} style={{ position: "relative", borderRadius: "1.25rem", background: `${col.collectionBg}18`, border: `2px solid ${col.collectionBorder}`, padding: "0.85rem 0.5rem", boxShadow: `0 0 10px ${col.collectionGlow}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <div style={{ width: 56, height: 52, borderRadius: "30% 40% 35% 45%", background: `${col.collectionBg}55`, margin: "0 auto", position: "relative", display: "flex", alignItems: "center", justifyContent: "center", animation: "sL 2.5s ease-in-out infinite" }}>
              <div style={{ width: 34, height: 30, borderRadius: "40% 35% 45% 30%", background: `${col.collectionBg}88` }} />
            </div>
            <div style={{ fontFamily: "'Fredoka One',cursive", fontSize: "0.82rem", color: col.collectionBorder, marginTop: "0.4rem", textAlign: "center", opacity: 0.75 }}>???</div>
          </div>
        );
      })}
    </div>
  );
};

// ── MAIN ──────────────────────────────────────────────────────────────────────
const KidsWorld = () => {
  const { code, studentName } = useParams<{ code: string; studentName: string }>();
  const { family } = useAuth();
  const navigate = useNavigate();

  const isMaster = code === MASTER_CODE;
  if (isMaster) {
    localStorage.removeItem(`mpe_game_claimed_${code}_Test_${new Date().toDateString()}`);
    localStorage.removeItem(`mpe_levelup_${code}_Test`);
  }

  const [jarTreats, setJarTreats] = useState(() => isMaster ? 99 : parseInt(localStorage.getItem(`mpe_jar_${code}_${studentName}`) || "0"));
  const [fedTreatsState, setFedTreatsState] = useState<Record<string,number>>(() => isMaster ? { turtle: 45, dolphin: 45, octopus: 45, shark: 45, clownfish: 45 } : { turtle: parseInt(localStorage.getItem(`mpe_fed_${code}_${studentName}`) || "0") });
  const [treats, setTreats] = useState(0);
  const [loading, setLoading] = useState(!isMaster);
  const [hearts, setHearts] = useState<{ id: number; x: number; y: number; delay: number }[]>([]);
  const [petted, setPetted] = useState(false);
  const [eggWiggle, setEggWiggle] = useState(false);
  const [showDailyGift, setShowDailyGift] = useState(false);
  const [justEarned, setJustEarned] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const sad = false;
  const [isRenaming, setIsRenaming] = useState(false);
  const [petNameMap, setPetNameMap] = useState<Record<string,string>>(() =>
    Object.fromEntries(ANIMALS.map(a => [a.id, localStorage.getItem(`mpe_petname_${a.id}_${code}_${studentName}`) || ""]))
  );
  const [levelUpStage, setLevelUpStage] = useState<{ animal: Animal; stageIdx: number } | null>(null);
  const [showVideo, setShowVideo] = useState(false);
  const [videoButtonSeen, setVideoButtonSeen] = useState(() => localStorage.getItem(`mpe_videoseen_${code}_${studentName}`) === "1");
  const [videoWatchedMap, setVideoWatchedMap] = useState<Record<string,boolean>>(() => {
    if (isMaster) return { turtle: true, dolphin: true, octopus: true, shark: true, clownfish: true };
    const map: Record<string,boolean> = {};
    ANIMALS.forEach(a => {
      const key = a.id === "turtle" ? `mpe_videowatched_${code}_${studentName}` : `mpe_videowatched_${a.id}_${code}_${studentName}`;
      map[a.id] = localStorage.getItem(key) === "1";
    });
    return map;
  });
  const [showUnlockFor, setShowUnlockFor] = useState<string | null>(null);
  const [unlockSeenMap, setUnlockSeenMap] = useState<Record<string,boolean>>(() =>
    Object.fromEntries(ANIMALS.map(a => [a.id, localStorage.getItem(`mpe_unlkseen_${a.id}_${code}_${studentName}`) === "1"]))
  );

  const [videoFadingOut, setVideoFadingOut] = useState(false);
  const [showLookBelow, setShowLookBelow] = useState(false);
  const [showOceanComplete, setShowOceanComplete] = useState(false);
  const closeVideo = () => { setVideoFadingOut(true); setTimeout(() => { setShowVideo(false); setVideoFadingOut(false); if (audioRef.current) audioRef.current.volume = volume * 0.5; if(!unlockSeenMap["dolphin"] || !unlockSeenMap["octopus"] || !unlockSeenMap["shark"] || !unlockSeenMap["clownfish"] || !unlockSeenMap["mantaray"]) setTimeout(() => setShowLookBelow(true), 300); }, 400); };
  const [musicOn, setMusicOn] = useState(() => localStorage.getItem("mpe_music") !== "off");
  const [sfxOn, setSfxOn] = useState(() => localStorage.getItem("mpe_sfx") !== "off");
  const [volume, setVolume] = useState(() => parseFloat(localStorage.getItem("mpe_volume") || "0.25"));

  const heartId = useRef(0);
  const feedId = useRef(0);
  const [feedingCookies, setFeedingCookies] = useState<{ id: number; x: number; y: number }[]>([]);
  const creatureRef = useRef<HTMLDivElement>(null);
  const collectionRef = useRef<HTMLDivElement>(null);
  const pageRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const harpRef = useRef<HTMLAudioElement | null>(null);
  const lullabyRef = useRef<HTMLAudioElement | null>(null);
  const tadaRef = useRef<HTMLAudioElement | null>(null);
  const completeRef = useRef<HTMLAudioElement | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const prevStageRef = useRef(-1);
  // ── FIX: load previously fired level-ups from localStorage on mount ──
  const levelUpFiredRef = useRef<Record<string, Set<number>>>(
    Object.fromEntries(ANIMALS.map(a => [a.id, new Set<number>(
      JSON.parse(localStorage.getItem(`mpe_levelup_${a.id}_${code}_${studentName}`) || "[]")
    )]))
  );

  const displayName = (() => {
    if (isMaster) return "Teacher";
    const n = studentName ?? "";
    const s = family?.students.find(s => s.name.toLowerCase() === n.toLowerCase());
    return s?.name ?? (n.charAt(0).toUpperCase() + n.slice(1));
  })();

  const [activeAnimalId, setActiveAnimalId] = useState("turtle");
  const activeAnimal = ANIMALS.find(a => a.id === activeAnimalId) ?? ANIMALS[0];
  const videoWatched = videoWatchedMap[activeAnimalId] ?? false;
  const fedTreats = fedTreatsState[activeAnimalId] ?? 0;
  const petName = petNameMap[activeAnimalId] ?? "";
  const stage = getAnimalStage(activeAnimal, fedTreats);
  const stageIdx = getAnimalStageIdx(activeAnimal, fedTreats);
  const nextStage = activeAnimal.stages[stageIdx + 1] ?? null;
  const isEgg = stageIdx === 0;
  const nearHatch = isEgg && fedTreats >= 12;
  const progress = nextStage ? Math.round(((fedTreats - stage.min) / (nextStage.min - stage.min)) * 100) : 100;

  // Music
  useEffect(() => {
    if (!audioRef.current) { audioRef.current = new Audio("/ocean-music.mp3"); audioRef.current.loop = true; }
    audioRef.current.volume = volume * 0.5;
    if (musicOn) { audioRef.current.play().catch(() => { const tryPlay = () => { audioRef.current?.play().catch(() => { }); }; document.addEventListener("pointerdown", tryPlay, { once: true }); }); }
    else audioRef.current.pause();
    localStorage.setItem("mpe_music", musicOn ? "on" : "off");
    return () => { audioRef.current?.pause(); };
  }, [musicOn]);
  useEffect(() => { if (audioRef.current) audioRef.current.volume = volume * 0.5; localStorage.setItem("mpe_volume", String(volume)); }, [volume]);
  useEffect(() => { localStorage.setItem("mpe_sfx", sfxOn ? "on" : "off"); }, [sfxOn]);

  // Lock scroll when dim overlay is active
  useEffect(() => {
    if ((stageIdx === 3 && !videoWatched && !levelUpStage) || showVideo || showLookBelow || showOceanComplete) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [stageIdx, videoWatched, showVideo, showLookBelow, showOceanComplete]);

  // Ocean complete — fire once when mantaray is fully grown + video watched
  useEffect(() => {
    const mantaray = ANIMALS.find(a => a.id === "mantaray");
    if (!mantaray) return;
    const mantarayFed = fedTreatsState["mantaray"] ?? 0;
    const mantarayGrown = getAnimalStageIdx(mantaray, mantarayFed) === 3;
    const mantarayVideoWatched = videoWatchedMap["mantaray"] ?? false;
    const alreadySeen = localStorage.getItem(`mpe_oceancomplete_${code}_${studentName}`) === "1";
    if (mantarayGrown && mantarayVideoWatched && !alreadySeen && !showVideo) {
      setTimeout(() => {
        setShowOceanComplete(true);
        if (audioRef.current) audioRef.current.volume = 0.02;
        if (!completeRef.current) completeRef.current = new Audio("/completedworld-music.mp3");
        completeRef.current.currentTime = 0;
        completeRef.current.volume = 0.5;
        completeRef.current.play().catch(() => {
          const tryPlay = () => { completeRef.current?.play().catch(() => {}); };
          document.addEventListener("pointerdown", tryPlay, { once: true });
        });
      }, 800);
    }
  }, [fedTreatsState, videoWatchedMap, showVideo]);

  const getCtx = () => {
    if (!ctxRef.current) ctxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    return ctxRef.current;
  };
  const playSfx = useCallback((type: "chirp" | "hearts" | "levelup" | "daily" | "treat" | "rattle") => {
    if (!sfxOn) return;
    try {
      const ctx = getCtx();
      const play = (freq: number, time: number, dur: number, vol = 0.15, wave: OscillatorType = "sine") => {
        const osc = ctx.createOscillator(); const g = ctx.createGain();
        osc.connect(g); g.connect(ctx.destination);
        osc.type = wave; osc.frequency.value = freq;
        g.gain.setValueAtTime(vol, ctx.currentTime + time);
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + time + dur);
        osc.start(ctx.currentTime + time); osc.stop(ctx.currentTime + time + dur + 0.01);
      };
      const sounds: Record<string, () => void> = {
        chirp: () => { play(600, 0, .06); play(900, .08, .06); play(1100, .16, .1); },
        hearts: () => { [523, 659, 784, 1047].forEach((f, i) => play(f, i * 0.09, 0.18)); },
        levelup: () => { [523, 659, 784, 1047, 1319, 1568, 2093].forEach((f, i) => play(f, i * 0.09, 0.3, 0.2)); },
        daily: () => { play(523, 0, 0.08, 0.12); play(659, 0.1, 0.08, 0.14); play(784, 0.2, 0.08, 0.16); play(1047, 0.3, 0.12, 0.18); play(1319, 0.4, 0.18, 0.14); },
        treat: () => { play(660, 0, .05); play(880, .07, .05); },
        rattle: () => {
          [0, 0.08, 0.16, 0.24, 0.32].forEach(t => {
            const buf = ctx.createBuffer(1, ctx.sampleRate * 0.05, ctx.sampleRate);
            const data = buf.getChannelData(0);
            for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * 0.3;
            const src = ctx.createBufferSource(); const g = ctx.createGain();
            src.buffer = buf; src.connect(g); g.connect(ctx.destination);
            g.gain.setValueAtTime(0.4, ctx.currentTime + t);
            g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + t + 0.05);
            src.start(ctx.currentTime + t);
          });
        },
      };
      sounds[type]?.();
    } catch { }
  }, [sfxOn]);

  // Level up — fire ONCE per stage transition, never repeat (persisted in localStorage)
  useEffect(() => {
    const animalFired = levelUpFiredRef.current[activeAnimalId] ?? new Set<number>();
    if (stageIdx > 0 && stageIdx !== prevStageRef.current && !animalFired.has(stageIdx)) {
      animalFired.add(stageIdx);
      levelUpFiredRef.current[activeAnimalId] = animalFired;
      localStorage.setItem(`mpe_levelup_${activeAnimalId}_${code}_${studentName}`, JSON.stringify([...animalFired]));
      setLevelUpStage({ animal: activeAnimal, stageIdx });
      if (!tadaRef.current) tadaRef.current = new Audio("/tada-music.mp3");
      tadaRef.current.currentTime = 0;
      tadaRef.current.volume = 0;
      tadaRef.current.play().catch(() => playSfx("levelup"));
      let tv = 0;
      const target = 0.35;
      const tadaFade = setInterval(() => {
        tv = Math.min(tv + target / 20, target);
        if (tadaRef.current) tadaRef.current.volume = tv;
        if (tv >= target) clearInterval(tadaFade);
      }, 25);
    }
    prevStageRef.current = stageIdx;
  }, [stageIdx]);

  useEffect(() => {
    if (isMaster) return;
    setLoading(false);
    const lastGift = localStorage.getItem(`mpe_gift_${code}_${studentName}`);
    const shownKey = `mpe_gift_shown_${code}_${studentName}_${new Date().toDateString()}`;
    if (lastGift !== new Date().toDateString() && !localStorage.getItem(shownKey)) {
      localStorage.setItem(shownKey, "true");
      setTimeout(() => { setShowDailyGift(true); }, 1800);
    }
  }, []);

  const savePetName = (name: string) => {
    setPetNameMap(m => ({ ...m, [activeAnimalId]: name }));
    localStorage.setItem(`mpe_petname_${activeAnimalId}_${code}_${studentName}`, name);
    if (!harpRef.current) harpRef.current = new Audio("/harp-music.mp3");
    harpRef.current.currentTime = 0;
    harpRef.current.volume = 0.3;
    harpRef.current.play().catch(() => { });
  };

  const handleFeed = () => {
    if (jarTreats <= 0) return;
    const newJar = jarTreats - 1;
    const newFed = fedTreats + 1;
    setJarTreats(newJar);
    setFedTreatsState(m => ({ ...m, [activeAnimalId]: newFed }));
    if (!isMaster) {
      localStorage.setItem(`mpe_jar_${code}_${studentName}`, String(newJar));
      const lsKey = activeAnimalId === "turtle" ? `mpe_fed_${code}_${studentName}` : `mpe_fed_${activeAnimalId}_${code}_${studentName}`;
      localStorage.setItem(lsKey, String(newFed));
    }
    playSfx("treat");
    const id = feedId.current++;
    const jarX = window.innerWidth / 2 - 80;
    const jarY = window.innerHeight / 2 + 100;
    setFeedingCookies(f => [...f, { id, x: jarX, y: jarY }]);
    setTimeout(() => {
      setFeedingCookies(f => f.filter(c => c.id !== id));
      setPetted(true);
      setTimeout(() => setPetted(false), 1200);
    }, 1000);
    setJustEarned(1);
    setTimeout(() => setJustEarned(0), 2500);
  };

  const spawnHearts = (cx: number, cy: number) => {
    const nh = Array.from({ length: 4 }, (_, i) => ({ id: heartId.current++, x: cx + (Math.random() - 0.5) * 80, y: cy - 20, delay: i * 0.15 }));
    setHearts(h => [...h, ...nh]);
    setTimeout(() => setHearts(h => h.filter(hh => !nh.find(n => n.id === hh.id))), 2000);
  };

  const handlePet = (e: React.MouseEvent | React.TouchEvent) => {
    if (isEgg) return;
    const rect = creatureRef.current?.getBoundingClientRect(); if (!rect) return;
    const cx = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const cy = 'touches' in e ? e.touches[0].clientY : e.clientY;
    spawnHearts(cx - rect.left, cy - rect.top);
    setPetted(true); playSfx("hearts");
    setTimeout(() => setPetted(false), 1200);
  };

  const handleEggTap = () => { setEggWiggle(true); playSfx("rattle"); setTimeout(() => setEggWiggle(false), 700); };

  const claimDailyGift = () => {
    const newJar = jarTreats + 1;
    setJarTreats(newJar);
    setJustEarned(1);
    playSfx("daily");
    setShowDailyGift(false);
    localStorage.setItem(`mpe_gift_${code}_${studentName}`, new Date().toDateString());
    if (!isMaster) localStorage.setItem(`mpe_jar_${code}_${studentName}`, String(newJar));
    setTimeout(() => setJustEarned(0), 2500);
  };

  const creatureImg = activeAnimal.stages[stageIdx]?.img ?? activeAnimal.stages[0].img;


  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(180deg,#003d6b,#00b4a0)" }}>
      <div style={{ fontFamily: "'Fredoka One',cursive", fontSize: "2rem", color: "white", textAlign: "center" }}>
        Loading {displayName}'s World...
      </div>
    </div>
  );

  return (
    <div ref={pageRef} style={{ minHeight: "100vh", position: "relative", overflow: "hidden", fontFamily: "'Fredoka One',cursive", userSelect: "none" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka+One&family=Nunito:wght@600;700;800;900&display=swap');
        @keyframes heartFloat{0%{transform:translateY(0) scale(0.5);opacity:1}60%{transform:translateY(-55px) scale(1.1);opacity:1}100%{transform:translateY(-100px) scale(0.8);opacity:0}}
        @keyframes bobAnim{0%,100%{transform:translateY(0) rotate(-0.5deg)}50%{transform:translateY(-14px) rotate(0.5deg)}}
        @keyframes pettedAnim{0%,100%{transform:translateY(0) scale(1)}20%{transform:translateY(-8px) rotate(-4deg) scale(1.06)}40%{transform:translateY(-12px) rotate(4deg) scale(1.08)}60%{transform:translateY(-6px) rotate(-2deg) scale(1.05)}80%{transform:translateY(-3px) rotate(2deg) scale(1.03)}}
        @keyframes eggWiggle{0%,100%{transform:rotate(0deg) scale(1)}15%{transform:rotate(-10deg) scale(1.04)}30%{transform:rotate(10deg) scale(1.04)}45%{transform:rotate(-7deg) scale(1.02)}60%{transform:rotate(7deg) scale(1.02)}75%{transform:rotate(-3deg) scale(1.01)}}
        @keyframes eggAuto{0%,80%,100%{transform:rotate(0deg)}83%{transform:rotate(-6deg)}87%{transform:rotate(6deg)}91%{transform:rotate(-4deg)}95%{transform:rotate(3deg)}98%{transform:rotate(-1deg)}}
        @keyframes nearHatchGlow{0%,100%{filter:drop-shadow(0 0 8px rgba(255,215,0,0.6)) drop-shadow(0 8px 20px rgba(0,0,0,0.3))}50%{filter:drop-shadow(0 0 22px rgba(255,215,0,1)) drop-shadow(0 8px 20px rgba(0,0,0,0.3))}}
        @keyframes giftBounce{0%,100%{transform:translateY(0) rotate(-4deg)}50%{transform:translateY(-18px) rotate(4deg)}}
        @keyframes popIn{0%{transform:scale(0) rotate(-10deg);opacity:0}65%{transform:scale(1.12) rotate(3deg);opacity:1}100%{transform:scale(1) rotate(0deg);opacity:1}}
        @keyframes fadeUp{0%{transform:translateY(24px);opacity:0}100%{transform:translateY(0);opacity:1}}
        @keyframes shimmer{0%,100%{opacity:0.65}50%{opacity:1}}
        @keyframes earnedPop{0%{transform:translateY(0) scale(0.8);opacity:1}60%{transform:translateY(-20px) scale(1.15);opacity:1}100%{transform:translateY(-40px) scale(1);opacity:0}}
        @keyframes eF{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}
        @keyframes goldPulse{0%,100%{opacity:0.4;transform:scale(1)}50%{opacity:0.85;transform:scale(1.02)}}
        @keyframes gP{0%,100%{opacity:0.4}50%{opacity:0.85}}
        @keyframes sL{0%,100%{opacity:0.35}50%{opacity:0.65}}
        @keyframes videoFadeIn{0%{opacity:0}100%{opacity:1}}
        @keyframes overlayFadeIn{0%{opacity:0}100%{opacity:1}}
        @keyframes videoFadeOut{0%{opacity:1}100%{opacity:0}}
        @keyframes spL{0%,100%{opacity:0.3;transform:scale(1) rotate(0deg)}50%{opacity:1;transform:scale(1.6) rotate(20deg)}}
        @keyframes jF2{0%,100%{transform:translateY(0)}50%{transform:translateY(-2px)}}
        @keyframes sBounce{0%{transform:scale(0) rotate(-20deg);opacity:0}100%{transform:scale(1) rotate(0deg);opacity:1}}
        @keyframes cReveal{0%{transform:scale(0) rotate(-10deg);opacity:0}70%{transform:scale(1.15) rotate(3deg);opacity:1}100%{transform:scale(1) rotate(0deg);opacity:1}}
        @keyframes sTag{0%,100%{opacity:0.4;transform:scale(0.8)}50%{opacity:1;transform:scale(1.2)}}
        @keyframes sparkTag{0%,100%{opacity:0.4}50%{opacity:1}}
        @keyframes cookieFloat{0%{transform:translateY(0) translateX(0) scale(1);opacity:1}25%{transform:translateY(-60px) translateX(20px) scale(1.1)}50%{transform:translateY(-120px) translateX(-15px) scale(1.05)}75%{transform:translateY(-180px) translateX(10px) scale(0.9)}100%{transform:translateY(-240px) translateX(0) scale(0.5);opacity:0}}
        @keyframes arrowWiggle{0%,100%{transform:translateY(0) rotate(-8deg)}50%{transform:translateY(6px) rotate(8deg)}}
        @keyframes clickMePulse{0%,100%{transform:scale(1);box-shadow:0 0 20px rgba(255,215,0,0.5)}50%{transform:scale(1.04);box-shadow:0 0 40px rgba(255,215,0,1)}}
        @keyframes dolphinPulse{0%,100%{transform:scale(1);box-shadow:0 0 30px rgba(100,200,255,0.8)}50%{transform:scale(1.05);box-shadow:0 0 60px rgba(100,200,255,1)}}
        @keyframes watchPulse{0%,100%{transform:scale(1);box-shadow:0 0 30px rgba(255,220,0,0.8),0 0 60px rgba(0,180,216,0.6)}50%{transform:scale(1.06);box-shadow:0 0 60px rgba(255,220,0,1),0 0 100px rgba(0,180,216,0.9)}}
        .bob{animation:bobAnim 3.4s ease-in-out infinite}
        .petted{animation:pettedAnim 0.9s ease-in-out}
        .egg-idle{animation:bobAnim 4s ease-in-out infinite,eggAuto 5s ease-in-out infinite;cursor:pointer}
        .egg-near{animation:bobAnim 2s ease-in-out infinite,eggAuto 2.5s ease-in-out infinite,nearHatchGlow 1.2s ease-in-out infinite;cursor:pointer}
        .egg-wiggle{animation:eggWiggle 0.7s ease-in-out;cursor:pointer}
        .glass{background:rgba(255,255,255,0.12);backdrop-filter:blur(14px);border:1.5px solid rgba(255,255,255,0.25);border-radius:1.75rem}
        .gold-border{border:2.5px solid gold !important;box-shadow:0 0 28px rgba(255,215,0,0.45)}
        .toggle-track{width:50px;height:28px;border-radius:999px;border:none;cursor:pointer;transition:background 0.3s;position:relative;display:flex;align-items:center;padding:3px}
        .toggle-thumb{width:22px;height:22px;border-radius:50%;background:white;transition:transform 0.3s;box-shadow:0 2px 4px rgba(0,0,0,0.2)}
        input[type=range]{-webkit-appearance:none;width:100%;height:6px;border-radius:3px;background:rgba(255,255,255,0.25);outline:none}
        input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:18px;height:18px;border-radius:50%;background:#4ade80;cursor:pointer;box-shadow:0 2px 6px rgba(0,0,0,0.3)}
      `}</style>

      <UnderwaterBg sad={sad} />
      {levelUpStage && <LevelUpOverlay animal={levelUpStage.animal} stageIdx={levelUpStage.stageIdx} onDismiss={() => setLevelUpStage(null)} />}

      {/* OCEAN COMPLETE OVERLAY */}
      {showOceanComplete && (
        <div style={{ position: "fixed", inset: 0, zIndex: 700, background: "rgba(0,0,30,0.88)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
          <div onClick={e => e.stopPropagation()} style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>

            {/* Sparkle ring around image */}
            <div style={{ position: "relative", display: "inline-block" }}>
              {/* Rotating sparkle SVGs */}
              {[0,45,90,135,180,225,270,315].map((deg, i) => (
                <div key={i} style={{ position: "absolute", top: "50%", left: "50%", width: "100%", height: "100%", transform: `translate(-50%,-50%) rotate(${deg}deg)`, pointerEvents: "none" }}>
                  <div style={{ position: "absolute", top: -18, left: "50%", transform: "translateX(-50%)", animation: `spL ${1.2 + i * 0.15}s ease-in-out infinite ${i * 0.1}s` }}>
                    <svg width="22" height="22" viewBox="0 0 14 14">
                      <path d="M7 0L8.5 5.5L14 7L8.5 8.5L7 14L5.5 8.5L0 7L5.5 5.5Z" fill={["#ffd700","#ff9de2","#60b8ff","#4ade80","#fbbf24","#c084fc","#fb923c","#f472b6"][i]} />
                    </svg>
                  </div>
                </div>
              ))}
              {/* Second ring — counter rotating, smaller */}
              {[22,67,112,157,202,247,292,337].map((deg, i) => (
                <div key={`b${i}`} style={{ position: "absolute", top: "50%", left: "50%", width: "110%", height: "110%", transform: `translate(-50%,-50%) rotate(${deg}deg)`, pointerEvents: "none" }}>
                  <div style={{ position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)", animation: `spL ${1.5 + i * 0.2}s ease-in-out infinite ${i * 0.15}s` }}>
                    <svg width="14" height="14" viewBox="0 0 14 14">
                      <path d="M7 0L8.5 5.5L14 7L8.5 8.5L7 14L5.5 8.5L0 7L5.5 5.5Z" fill={["#fff","#ffd700","#ff9de2","#60b8ff","#fff","#fbbf24","#c084fc","#fff"][i]} opacity="0.9" />
                    </svg>
                  </div>
                </div>
              ))}
              {/* Glowing border around image */}
              <div style={{ position: "absolute", inset: -6, borderRadius: "1.5rem", background: "transparent", border: "3px solid rgba(255,215,0,0.7)", boxShadow: "0 0 30px rgba(255,215,0,0.6), 0 0 60px rgba(255,180,0,0.4), inset 0 0 20px rgba(255,215,0,0.1)", animation: "goldPulse 1.5s ease-in-out infinite", pointerEvents: "none" }} />
              <img src="/completed_oceanworld.png" alt="Ocean World Complete!" style={{ width: "min(680px,90vw)", borderRadius: "1.25rem", display: "block", filter: "drop-shadow(0 0 30px rgba(255,215,0,0.5))", position: "relative", zIndex: 1 }} />
            </div>

            {/* Title */}
            <div style={{ fontFamily: "'Fredoka One',cursive", fontSize: "clamp(1.6rem,5vw,2.2rem)", color: "#ffd700", textShadow: "0 0 20px rgba(255,215,0,0.9), 0 3px 8px rgba(0,0,0,0.6)", marginTop: "1.25rem", textAlign: "center", animation: "shimmer 1.5s ease-in-out infinite" }}>
              🌊 Ocean World Complete! 🌊
            </div>
            <div style={{ fontFamily: "Noto Sans TC, sans-serif", fontSize: "1.05rem", color: "rgba(255,255,255,0.8)", marginBottom: "1.25rem", textAlign: "center" }}>
              海洋世界完成了！
            </div>

            {/* Red 3D button */}
            <button
              onPointerDown={() => {
                try {
                  const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
                  const buf = ctx.createBuffer(1, ctx.sampleRate * 0.08, ctx.sampleRate);
                  const data = buf.getChannelData(0);
                  for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / data.length, 2) * 0.8;
                  const src = ctx.createBufferSource(); const g = ctx.createGain();
                  src.buffer = buf; src.connect(g); g.connect(ctx.destination);
                  g.gain.setValueAtTime(0.6, ctx.currentTime);
                  g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
                  src.start();
                  const osc = ctx.createOscillator(); const og = ctx.createGain();
                  osc.connect(og); og.connect(ctx.destination);
                  osc.type = "sine"; osc.frequency.setValueAtTime(180, ctx.currentTime);
                  osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.12);
                  og.gain.setValueAtTime(0.3, ctx.currentTime);
                  og.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
                  osc.start(); osc.stop(ctx.currentTime + 0.13);
                } catch {}
              }}
              onClick={() => {
                localStorage.setItem(`mpe_oceancomplete_${code}_${studentName}`, "1");
                setShowOceanComplete(false);
                if (completeRef.current) { completeRef.current.pause(); completeRef.current.currentTime = 0; }
                if (audioRef.current) audioRef.current.volume = volume * 0.5;
              }}
              style={{ background: "linear-gradient(180deg,#ff4444 0%,#cc0000 50%,#990000 100%)", border: "none", borderRadius: "999px", padding: "1.1rem 2.8rem", cursor: "pointer", boxShadow: "0 8px 0px #660000, 0 12px 24px rgba(0,0,0,0.5), 0 0 30px rgba(255,60,60,0.5)", transform: "translateY(0)", transition: "transform 0.08s, box-shadow 0.08s", fontFamily: "'Fredoka One',cursive", fontSize: "1.5rem", color: "white", textShadow: "0 2px 4px rgba(0,0,0,0.4)", display: "flex", flexDirection: "column", alignItems: "center", gap: "0.2rem" }}
              onMouseDown={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(5px)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 3px 0px #660000, 0 6px 12px rgba(0,0,0,0.5), 0 0 20px rgba(255,60,60,0.4)"; }}
              onMouseUp={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 0px #660000, 0 12px 24px rgba(0,0,0,0.5), 0 0 30px rgba(255,60,60,0.5)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 0px #660000, 0 12px 24px rgba(0,0,0,0.5), 0 0 30px rgba(255,60,60,0.5)"; }}
            >
              Click to enter a New World!
              <span style={{ fontFamily: "Noto Sans TC, sans-serif", fontSize: "1rem", opacity: 0.9 }}>點擊進入新世界！</span>
            </button>
          </div>
        </div>
      )}

      {/* LOOK BELOW POPUP */}
      {showLookBelow && (
        <div style={{ position: "fixed", inset: 0, zIndex: 600, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem", animation: "popIn 0.35s ease-out" }}>
          <div onClick={e => e.stopPropagation()} style={{ background: "linear-gradient(135deg,#0c3460,#0077b6)", borderRadius: "2.5rem", padding: "2.5rem 2rem", textAlign: "center", maxWidth: 340, width: "100%", border: "3px solid #fbbf24", boxShadow: "0 0 60px rgba(251,191,36,0.6), 0 20px 60px rgba(0,0,0,0.5)", animation: "popIn 0.4s ease-out" }}>
            <div style={{ fontSize: "3rem", marginBottom: "0.5rem", animation: "bobAnim 1s ease-in-out infinite" }}>👇</div>
            <div style={{ fontFamily: "'Fredoka One',cursive", fontSize: "2rem", color: "#fbbf24", textShadow: "0 0 20px rgba(251,191,36,0.9)", marginBottom: "0.25rem" }}>Look below!</div>
            <div style={{ fontFamily: "Noto Sans TC, sans-serif", fontSize: "1.1rem", color: "rgba(255,255,255,0.85)", marginBottom: "0.5rem" }}>往下看！</div>
            <div style={{ fontFamily: "'Fredoka One',cursive", fontSize: "1.2rem", color: "white", marginBottom: "0.25rem" }}>A new friend is waiting!</div>
            <div style={{ fontFamily: "Noto Sans TC, sans-serif", fontSize: "1rem", color: "rgba(255,255,255,0.7)", marginBottom: "1.5rem" }}>新朋友在等你！</div>
            <button onClick={() => { setShowLookBelow(false); setTimeout(() => collectionRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }), 100); }} style={{ background: "linear-gradient(135deg,#fbbf24,#f97316)", border: "none", borderRadius: "999px", color: "white", fontFamily: "'Fredoka One',cursive", fontSize: "1.4rem", padding: "0.8rem 2.5rem", cursor: "pointer", boxShadow: "0 6px 24px rgba(251,191,36,0.6)" }}>
              Let's go! · 出發！🎉
            </button>
          </div>
        </div>
      )}

      {/* ANIMAL UNLOCK OVERLAY — data-driven, works for any animal */}
      {showUnlockFor && (() => {
        const a = ANIMALS.find(x => x.id === showUnlockFor);
        if (!a) return null;
        const ov = a.unlockOverlay;
        const dismiss = () => {
          setShowUnlockFor(null);
          setUnlockSeenMap(m => ({ ...m, [a.id]: true }));
          setTimeout(() => { window.scrollTo({ top: 0, behavior: "smooth" }); }, 400);
          localStorage.setItem(`mpe_unlkseen_${a.id}_${code}_${studentName}`, "1");
          setActiveAnimalId(a.id);
          if (lullabyRef.current) { lullabyRef.current.pause(); lullabyRef.current.currentTime = 0; }
          if (audioRef.current) audioRef.current.volume = volume * 0.5;
        };
        return (
          <div style={{ position: "fixed", inset: 0, zIndex: 600, background: "rgba(0,10,40,0.92)", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem", animation: "popIn 0.4s ease-out" }}>
            <div onClick={e => e.stopPropagation()} style={{ position: "relative", zIndex: 10, textAlign: "center", background: ov.bgGradient, borderRadius: "2.5rem", padding: "2.5rem 2rem", maxWidth: 360, width: "100%", border: `3px solid ${ov.borderColor}`, boxShadow: `0 0 80px ${ov.glowColor}, 0 20px 60px rgba(0,0,0,0.5)` }}>
              <div style={{ position: "absolute", inset: -8, borderRadius: "2.8rem", border: `2px solid ${ov.borderColor}`, animation: "goldPulse 1.5s ease-in-out infinite", pointerEvents: "none" }} />
              <div style={{ fontFamily: "'Fredoka One',cursive", fontSize: "2.8rem", marginBottom: "0.25rem" }}>{ov.emoji}</div>
              <div style={{ fontFamily: "'Fredoka One',cursive", fontSize: "2.2rem", color: "white", textShadow: `0 0 20px ${ov.glowColor}`, marginBottom: "0.1rem", lineHeight: 1.1 }}>{ov.title}</div>
              <div style={{ fontFamily: "Noto Sans TC, sans-serif", fontSize: "1.1rem", color: "rgba(255,255,255,0.8)", marginBottom: "1rem" }}>{ov.titleZh}</div>
              <div style={{ position: "relative", display: "inline-block", animation: "cReveal 0.8s cubic-bezier(0.34,1.56,0.64,1) 0.3s both" }}>
                <div style={{ position: "absolute", inset: -20, borderRadius: "50%", background: `radial-gradient(circle,${ov.glowColor} 0%,transparent 70%)`, animation: "goldPulse 1s ease-in-out infinite" }} />
                <img src={a.stages[0].img} alt={a.name} style={{ width: 150, height: 140, objectFit: "contain", filter: `drop-shadow(0 0 24px ${ov.glowColor})` }} />
              </div>
              <div style={{ fontFamily: "'Fredoka One',cursive", fontSize: "1.3rem", color: "white", margin: "0.75rem 0 0.2rem" }}>{ov.eggLine}</div>
              <div style={{ fontFamily: "Noto Sans TC, sans-serif", fontSize: "1rem", color: "rgba(255,255,255,0.7)", marginBottom: "0.5rem" }}>{ov.eggLineZh}</div>
              <div style={{ fontFamily: "Nunito,sans-serif", fontSize: "0.9rem", color: "rgba(255,255,255,0.55)", marginBottom: "1.5rem" }}>{ov.feedLine} · {ov.feedLineZh}</div>
              <button onClick={dismiss} style={{ background: `linear-gradient(135deg,${ov.borderColor},${ov.glowColor})`, border: "none", borderRadius: "999px", color: "white", fontFamily: "'Fredoka One',cursive", fontSize: "1.5rem", padding: "0.85rem 3rem", cursor: "pointer", boxShadow: `0 6px 24px ${ov.glowColor}` }}>
                {ov.btnText}
              </button>
            </div>
          </div>
        );
      })()}

      {/* DIM OVERLAY — shown when grown but video not yet watched */}
      {stageIdx === 3 && !videoWatched && !levelUpStage && (
        <div style={{ position: "fixed", inset: 0, zIndex: 90, background: "rgba(0,0,0,0.65)", pointerEvents: "all", animation: "overlayFadeIn 0.6s ease-out" }} />
      )}

      {/* WATCH BUTTON — outside all blurred containers, always on top */}
      {stageIdx === 3 && !showVideo && !videoWatched && !levelUpStage && (
        <div style={{ position: "fixed", top: "50%", left: 0, right: 0, transform: "translateY(-50%)", zIndex: 200, textAlign: "center", pointerEvents: "none" }}>
          {!videoWatched && (
            <div style={{ fontFamily: "Nunito,sans-serif", fontSize: "1.1rem", color: "#fbbf24", textAlign: "center", marginBottom: "0.6rem", animation: "shimmer 1.5s ease-in-out infinite" }}>
              Watch first! · 先看影片！👇
            </div>
          )}
          <button onClick={() => { setShowVideo(true); if (audioRef.current) audioRef.current.volume = 0.02; if(!videoButtonSeen){ setVideoButtonSeen(true); localStorage.setItem(`mpe_videoseen_${code}_${studentName}`,"1"); }}} style={{ pointerEvents: "all", padding: "1rem 2.5rem", background: "linear-gradient(135deg, #00b4d8, #0077b6)", border: "3px solid rgba(255,255,0,0.9)", borderRadius: "999px", color: "white", fontFamily: "'Fredoka One',cursive", fontSize: "1.5rem", cursor: "pointer", animation: "watchPulse 1.2s ease-in-out infinite", display: "inline-block" }}>
            🎬 Watch {petName || activeAnimal.name}! · 看{petName || activeAnimal.nameZh}！
          </button>
        </div>
      )}

      {/* NAV */}
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, background: "rgba(0,40,80,0.72)", backdropFilter: "blur(14px)", padding: "0.55rem 1rem", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.15)" }}>
        <button onClick={() => navigate("/portal")} style={{ background: "rgba(255,255,255,0.18)", border: "1.5px solid rgba(255,255,255,0.35)", color: "white", fontFamily: "'Fredoka One',cursive", fontSize: "1.05rem", padding: "0.42rem 1.1rem", borderRadius: "999px", cursor: "pointer" }}>← Back · 返回</button>
        <span style={{ color: "white", fontFamily: "'Fredoka One',cursive", fontSize: "1.15rem", textShadow: "0 2px 6px rgba(0,0,0,0.4)" }}>My Paradise English</span>
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          {isMaster && <span style={{ background: "linear-gradient(135deg,#f59e0b,#d97706)", color: "white", borderRadius: "999px", padding: "0.25rem 0.75rem", fontSize: "0.78rem", fontFamily: "'Fredoka One',cursive" }}>MASTER</span>}
          <button onClick={() => setShowSettings(s => !s)} style={{ background: "rgba(255,255,255,0.18)", border: "1.5px solid rgba(255,255,255,0.3)", color: "white", fontFamily: "'Fredoka One',cursive", fontSize: "1rem", padding: "0.35rem 0.9rem", borderRadius: "999px", cursor: "pointer" }}>Settings · 設定</button>
        </div>
      </nav>

      {/* SETTINGS */}
      {showSettings && (
        <div onClick={e => e.stopPropagation()} style={{ position: "fixed", top: 62, right: 14, zIndex: 200, background: "rgba(0,30,60,0.93)", backdropFilter: "blur(18px)", borderRadius: "1.4rem", padding: "1.25rem 1.5rem", minWidth: 240, border: "1.5px solid rgba(255,255,255,0.2)", animation: "popIn 0.25s ease-out", boxShadow: "0 8px 32px rgba(0,0,0,0.4)" }}>
          <div style={{ color: "white", fontFamily: "'Fredoka One',cursive", fontSize: "1.2rem", marginBottom: "1rem" }}>Settings · 設定</div>
          {[
            { label: "Music · 音樂", on: musicOn, toggle: () => setMusicOn(m => !m) },
            { label: "Sound Effects · 音效", on: sfxOn, toggle: () => setSfxOn(s => !s) },
          ].map((item, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.55rem 0", borderBottom: "1px solid rgba(255,255,255,0.12)" }}>
              <span style={{ color: "white", fontFamily: "'Fredoka One',cursive", fontSize: "1rem" }}>{item.label}</span>
              <button className="toggle-track" style={{ background: item.on ? "#4ade80" : "rgba(255,255,255,0.25)" }} onClick={item.toggle}>
                <div className="toggle-thumb" style={{ transform: item.on ? "translateX(22px)" : "translateX(0)" }} />
              </button>
            </div>
          ))}
          <div style={{ padding: "0.6rem 0" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.4rem" }}>
              <span style={{ color: "white", fontFamily: "'Fredoka One',cursive", fontSize: "1rem" }}>Volume · 音量</span>
              <span style={{ color: "rgba(255,255,255,0.6)", fontFamily: "Nunito,sans-serif", fontSize: "0.85rem" }}>{Math.round(volume * 100)}%</span>
            </div>
            <input type="range" min="0" max="1" step="0.05" value={volume} onChange={e => setVolume(parseFloat(e.target.value))} />
          </div>
        </div>
      )}

      {/* DAILY GIFT */}
      {showDailyGift && (
        <div style={{ position: "fixed", inset: 0, zIndex: 300, background: "rgba(0,0,0,0.65)", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
          <div style={{ background: "linear-gradient(135deg,#0c3460,#0a6e8a)", borderRadius: "2rem", padding: "2.5rem 2rem", textAlign: "center", border: "2px solid rgba(255,255,255,0.3)", maxWidth: 340, width: "100%", animation: "popIn 0.4s ease-out", boxShadow: "0 20px 60px rgba(0,0,0,0.5)" }}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: "0.75rem", animation: "giftBounce 1s ease-in-out infinite" }}>
              <FaceCookie size={80} />
            </div>
            <div style={{ color: "white", fontFamily: "'Fredoka One',cursive", fontSize: "2rem", marginBottom: "0.25rem" }}>
              Daily Gift! 🎁
            </div>
            <div style={{ color: "rgba(255,255,255,0.75)", fontFamily: "Nunito,sans-serif", fontSize: "1rem", marginBottom: "0.25rem" }}>每日禮物！</div>
            <div style={{ color: "rgba(255,255,255,0.8)", fontFamily: "Nunito,sans-serif", fontSize: "1.05rem", marginBottom: "1.5rem", lineHeight: 1.6 }}>
              {displayName} gets 1 treat today! <br />
              <span style={{ fontFamily: "'Fredoka One',cursive", fontSize: "0.95rem" }}>{displayName}今天得到1個餅乾！</span><br />
              <span style={{ fontSize: "0.85rem", opacity: 0.65 }}>Come back tomorrow for more! · 明天再來拿更多！</span>
            </div>
            <button onClick={claimDailyGift} style={{ background: "linear-gradient(135deg,#f59e0b,#ef4444)", border: "none", borderRadius: "999px", color: "white", fontFamily: "'Fredoka One',cursive", fontSize: "1.35rem", padding: "0.9rem 2.5rem", cursor: "pointer", boxShadow: "0 6px 24px rgba(245,158,11,0.55)" }}>
              Claim +1 Treat! · 領取！
            </button>
          </div>
        </div>
      )}

      {/* MAIN */}
      <div style={{ position: "relative", zIndex: 10, maxWidth: 520, margin: "0 auto", padding: "72px 14px 50px", filter: (stageIdx === 3 && !videoWatched && !levelUpStage) ? "blur(4px)" : "none", transition: "filter 0.3s ease" }}>

        {/* Title */}
        <div style={{ textAlign: "center", marginBottom: "1rem", animation: "fadeUp 0.5s ease-out" }}>
          <div style={{ fontFamily: "'Fredoka One',cursive", fontSize: "clamp(2rem,6vw,3rem)", color: "white", textShadow: "0 3px 14px rgba(0,0,50,0.6)", lineHeight: 1.1 }}>
            {displayName}'s Ocean World!
          </div>
          <div style={{ display: "inline-block", marginTop: "0.6rem", background: "linear-gradient(135deg,hsl(350,85%,60%),hsl(330,80%,65%))", color: "white", borderRadius: "999px", padding: "0.38rem 1.4rem", fontSize: "1.2rem", fontFamily: "'Fredoka One',cursive", boxShadow: "0 4px 16px rgba(0,0,0,0.3)" }}>
            {stage.name} Stage · {stage.nameZh}
          </div>
        </div>

        {/* CREATURE CARD */}
        <div className={`glass ${isMaster ? "gold-border" : ""}`}
          style={{ padding: "1.75rem 1.25rem 1.5rem", marginBottom: "1rem", textAlign: "center", animation: "fadeUp 0.6s ease-out", boxShadow: "0 8px 40px rgba(0,0,0,0.25)", position: "relative", overflow: "visible" }}>

          {justEarned > 0 && (
            <div style={{ position: "absolute", top: 14, right: 14, background: "rgba(255,200,0,0.95)", borderRadius: "999px", padding: "0.3rem 0.9rem", color: "#333", fontFamily: "'Fredoka One',cursive", fontSize: "1rem", animation: "earnedPop 2s ease-out forwards", zIndex: 20 }}>
              +{justEarned} treats!
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", position: "relative", zIndex: 20 }}>
            {petName ? <DisneyNameTag name={petName} onRename={() => setIsRenaming(true)} /> : <div style={{ height: 8 }} />}
            <PetNamingInput petName={petName} onSave={(n) => { savePetName(n); setIsRenaming(false); }} isRenaming={isRenaming} onCancelRename={() => setIsRenaming(false)} />
          </div>

          {nearHatch && !eggWiggle && (
            <div style={{ background: "rgba(255,255,255,0.95)", borderRadius: "1.2rem", padding: "0.7rem 1.1rem", margin: "0 auto 0.6rem", maxWidth: 260, fontFamily: "Nunito,sans-serif", fontSize: "1rem", color: "#333", lineHeight: 1.5, boxShadow: "0 4px 12px rgba(0,0,0,0.15)", position: "relative" }}>
              I'm almost ready! 🐣<br />
              <span style={{ fontSize: "0.9rem", color: "#555" }}>我快出來了！再給我幾個餅乾！</span>
              <div style={{ position: "absolute", bottom: -8, left: "50%", transform: "translateX(-50%)", width: 0, height: 0, borderLeft: "8px solid transparent", borderRight: "8px solid transparent", borderTop: "8px solid rgba(255,255,255,0.95)" }} />
            </div>
          )}

          <div ref={creatureRef} style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", cursor: "pointer", pointerEvents: "none" }}>
            {hearts.map(h => (
              <div key={h.id} style={{ position: "absolute", left: h.x, top: h.y, pointerEvents: "none", animation: `heartFloat 1.4s ease-out ${h.delay}s forwards`, opacity: 0, zIndex: 50 }}>
                <svg width="22" height="20" viewBox="0 0 24 22">
                  <path d="M12 20.5C12 20.5 2 13.5 2 7C2 4.2 4.2 2 7 2C9.1 2 10.9 3.2 12 5C13.1 3.2 14.9 2 17 2C19.8 2 22 4.2 22 7C22 13.5 12 20.5 12 20.5Z" fill="#ff6b9d" stroke="#ff4488" strokeWidth="1" />
                </svg>
              </div>
            ))}
            <div
              className={isEgg && activeAnimal.isEggType ? (eggWiggle ? "egg-wiggle" : nearHatch ? "egg-near" : "egg-idle") : (petted ? "petted" : "bob")}
              onClick={isEgg ? handleEggTap : handlePet}
              style={{ width: "min(250px,65vw)", height: "min(210px,55vw)", display: "flex", alignItems: "center", justifyContent: "center", filter: sad ? "saturate(0.4) brightness(0.75)" : "none", position: "relative", transition: "filter 0.5s ease", pointerEvents: "auto" }}>
              {isEgg && activeAnimal.isEggType && <EggCracks treats={fedTreats} />}
              <img src={creatureImg} alt={stage.name} style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain", filter: sad ? "none" : "drop-shadow(0 8px 20px rgba(0,0,0,0.3))", transform: activeAnimal.scale && activeAnimal.scale !== 1 && (activeAnimal.isEggType || stageIdx > 0) ? `scale(${activeAnimal.scale})` : "none", transformOrigin: "center center" }} draggable={false} />
            </div>

            {/* Instructional hints — bilingual */}
            {isEgg && !nearHatch && (
              <div style={{ color: "rgba(255,255,255,0.85)", fontFamily: "Nunito,sans-serif", fontSize: "1rem", marginTop: "0.4rem", animation: "shimmer 2.2s ease-in-out infinite", textAlign: "center" }}>
                Tap me & say hello! 👆 · 點我打招呼！👆
              </div>
            )}
            {nearHatch && (
              <div style={{ color: "#fbbf24", fontFamily: "'Fredoka One',cursive", fontSize: "1.05rem", marginTop: "0.4rem", animation: "shimmer 1s ease-in-out infinite", textAlign: "center" }}>
                Almost there! ✨ · 快到了！✨
              </div>
            )}
            {!isEgg && !sad && (
              <div style={{ color: "rgba(255,255,255,0.85)", fontFamily: "Nunito,sans-serif", fontSize: "1rem", marginTop: "0.4rem", animation: "shimmer 2.2s ease-in-out infinite", textAlign: "center" }}>
                Pet me to make me happy! · 摸摸我讓我開心！🐢
              </div>
            )}


          </div>

          <div style={{ color: "white", fontFamily: "'Fredoka One',cursive", fontSize: "1.45rem", marginTop: "0.6rem", textShadow: "0 2px 8px rgba(0,0,0,0.4)" }}>
            {stage.name} {activeAnimal.name}{isMaster ? " (Master)" : ""}
          </div>

          {nextStage && (
            <div style={{ marginTop: "1.1rem", padding: "0 0.5rem" }}>
              <div style={{ position: "relative", height: 30, background: "rgba(0,0,0,0.25)", borderRadius: "999px", border: "2.5px solid rgba(255,255,255,0.2)", overflow: "visible", marginBottom: "0.75rem" }}>
                <div style={{ width: `${progress}%`, height: "100%", borderRadius: "999px", background: "linear-gradient(to right,#fbbf24,#f97316)", transition: "width 1s cubic-bezier(0.34,1.56,0.64,1)", boxShadow: "0 0 12px rgba(251,191,36,0.7)", minWidth: progress > 0 ? "28px" : "0", position: "relative" }}>
                  {progress > 0 && (
                    <div style={{ position: "absolute", right: -14, top: "50%", transform: "translateY(-50%)", fontSize: "1.4rem", filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.4))" }}>
                      ⭐
                    </div>
                  )}
                </div>
              </div>
              <div style={{ textAlign: "center", fontFamily: "'Fredoka One',cursive", fontSize: "1.2rem", color: "#fbbf24", textShadow: "0 2px 6px rgba(0,0,0,0.4)", animation: "shimmer 2s ease-in-out infinite" }}>
                {nextStage.min - fedTreats} more treats to {nextStage.name}!<br />
                <span style={{ fontFamily: "Nunito,sans-serif", fontSize: "1rem", opacity: 0.85 }}>還需要 {nextStage.min - fedTreats} 個餅乾才能變成{nextStage.nameZh}！</span>
              </div>
            </div>
          )}
          {!nextStage && (
            <div style={{ color: "#fbbf24", fontFamily: "'Fredoka One',cursive", fontSize: "1.25rem", marginTop: "0.75rem", textShadow: "0 2px 8px rgba(0,0,0,0.4)" }}>
              {petName ? `${petName} is all grown up! ${activeAnimal.emoji}` : `Your ${activeAnimal.name} is all grown up! ${activeAnimal.emoji}`}<br />
              <span style={{ fontFamily: "Nunito,sans-serif", fontSize: "1rem", opacity: 0.85 }}>你的{activeAnimal.nameZh}長大了！🎉</span>
            </div>
          )}
        </div>

        {/* FLOATING COOKIES */}
        {feedingCookies.map(c => (
          <div key={c.id} style={{ position: "fixed", left: c.x, top: c.y, zIndex: 400, pointerEvents: "none", animation: "cookieFloat 1s ease-out forwards" }}>
            <FaceCookie size={32} />
          </div>
        ))}

        {/* FEED BUTTON */}
        {!isMaster && (nextStage ? (jarTreats > 0 && (
          <button onClick={handleFeed} style={{ width: "100%", padding: "1.1rem", marginBottom: "1rem", background: "linear-gradient(135deg,#fbbf24,#f97316)", border: "none", borderRadius: "999px", color: "white", fontFamily: "'Fredoka One',cursive", fontSize: "1.4rem", cursor: "pointer", boxShadow: "0 6px 24px rgba(251,191,36,0.55)", animation: "eF 2s ease-in-out infinite" }}>
            Feed Me! ({jarTreats} treat{jarTreats !== 1 ? "s" : ""} ready)<br />
            <span style={{ fontFamily: "Nunito,sans-serif", fontSize: "1rem", opacity: 0.9 }}>餵我！（{jarTreats}個餅乾準備好了）</span>
          </button>
        )) : (
          <button onClick={() => playSfx("chirp")} style={{ width: "100%", padding: "1.1rem", marginBottom: "1rem", background: "linear-gradient(135deg,#a855f7,#7c3aed)", border: "none", borderRadius: "999px", color: "white", fontFamily: "'Fredoka One',cursive", fontSize: "1.4rem", cursor: "pointer", boxShadow: "0 6px 24px rgba(168,85,247,0.55)", animation: "eF 2s ease-in-out infinite" }}>
            I'm Full! 🌟 · 吃飽了！
          </button>
        ))}

        {/* TREAT JAR */}
        <div className="glass" style={{ padding: "1.5rem", marginBottom: "1rem", animation: "fadeUp 0.7s ease-out" }}>
          <div style={{ color: "white", fontFamily: "'Fredoka One',cursive", fontSize: "1.25rem", textAlign: "center", marginBottom: "0.85rem" }}>
            {petName ? `${petName} loves treats! ` : `Feed your ${activeAnimal.name} Treats! `}<br />
            <span style={{ fontFamily: "Nunito,sans-serif", fontSize: "1.05rem", opacity: 0.8 }}>餵你的{activeAnimal.nameZh}餅乾！每次餵食讓牠更快長大！</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "2rem" }}>
            <TreatJar treats={jarTreats} nextStage={nextStage} />
            <div style={{ textAlign: "center" }}>
              <div style={{ color: "white", fontFamily: "'Fredoka One',cursive", fontSize: "2.8rem", lineHeight: 1 }}>
                {stageIdx + 1}<span style={{ fontSize: "1.3rem", opacity: 0.6 }}>/4</span>
              </div>
              <div style={{ color: "rgba(255,255,255,0.7)", fontFamily: "Nunito,sans-serif", fontSize: "0.95rem" }}>
                stages done · 已完成階段
              </div>
              <div style={{ marginTop: "0.75rem", display: "flex", alignItems: "center", gap: "0.4rem", justifyContent: "center" }}>
                <FaceCookie size={24} />

              </div>
            </div>
          </div>
        </div>

        {isMaster && (
          <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1rem" }}>
            <button onClick={() => { const newJar = jarTreats + 1; setJarTreats(newJar); playSfx("treat"); }} style={{ flex: 1, padding: "0.9rem", background: "linear-gradient(135deg,#10b981,#059669)", border: "none", borderRadius: "999px", color: "white", fontFamily: "'Fredoka One',cursive", fontSize: "1rem", cursor: "pointer", boxShadow: "0 6px 20px rgba(16,185,129,0.5)" }}>
              Add to Jar +1
            </button>
            <button onClick={() => { setFedTreatsState({}); setJarTreats(99); setActiveAnimalId("turtle"); setVideoWatchedMap({}); setUnlockSeenMap({}); localStorage.clear(); ANIMALS.forEach(a => { levelUpFiredRef.current[a.id] = new Set(); }); playSfx("chirp"); }} style={{ flex: 1, padding: "0.9rem", background: "linear-gradient(135deg,#ef4444,#b91c1c)", border: "none", borderRadius: "999px", color: "white", fontFamily: "'Fredoka One',cursive", fontSize: "1rem", cursor: "pointer", boxShadow: "0 6px 20px rgba(239,68,68,0.5)" }}>
              🥚 Reset to Egg
            </button>
            <button onClick={handleFeed} disabled={jarTreats <= 0} style={{ flex: 1, padding: "0.9rem", background: jarTreats > 0 ? "linear-gradient(135deg,#f59e0b,#ef4444)" : "rgba(255,255,255,0.1)", border: "none", borderRadius: "999px", color: "white", fontFamily: "'Fredoka One',cursive", fontSize: "1rem", cursor: jarTreats > 0 ? "pointer" : "not-allowed", boxShadow: jarTreats > 0 ? "0 6px 20px rgba(245,158,11,0.5)" : "none" }}>
              Feed {activeAnimal.name}
            </button>
          </div>
        )}

        {/* EARN */}
        <div className="glass" style={{ padding: "1.5rem", marginBottom: "1rem", animation: "fadeUp 0.8s ease-out" }}>
          <div style={{ color: "white", fontFamily: "'Fredoka One',cursive", fontSize: "1.5rem", marginBottom: "1rem", textAlign: "center" }}>
            Earn Treats! <br />
            <span style={{ fontFamily: "Nunito,sans-serif", fontSize: "1.05rem", opacity: 0.8 }}>賺餅乾！完成挑戰得到獎勵！</span>
          </div>
          <EarnButtons navigate={navigate} code={code ?? ""} studentName={studentName ?? ""} activeAnimal={activeAnimal} />
        </div>

        {/* COLLECTION */}
        <div className="glass" style={{ padding: "1.5rem", animation: "fadeUp 0.9s ease-out" }}>
          <div style={{ color: "white", fontFamily: "'Fredoka One',cursive", fontSize: "1.5rem", marginBottom: "1rem", textAlign: "center" }}>
            Ocean Collection 🌊<br />
            <span style={{ fontFamily: "Nunito,sans-serif", fontSize: "1.05rem", opacity: 0.8 }}>海洋收藏！收集所有生物！</span>
          </div>
          {/* Wiggle arrow pointing at correct collection slot */}
          {(() => {
            const showDolphin = (fedTreatsState["turtle"] ?? 0) >= 45 && (videoWatchedMap["turtle"] ?? false) && !unlockSeenMap["dolphin"];
            const showOctopus = (fedTreatsState["dolphin"] ?? 0) >= 45 && (videoWatchedMap["dolphin"] ?? false) && (unlockSeenMap["dolphin"] ?? false) && !unlockSeenMap["octopus"];
            const showShark = (fedTreatsState["octopus"] ?? 0) >= 45 && (videoWatchedMap["octopus"] ?? false) && (unlockSeenMap["octopus"] ?? false) && !unlockSeenMap["shark"];
            if (!showDolphin && !showOctopus) return null;
            // 3-col grid: col1=16.7%, col2=50%, col3=83.3%
            const leftPct = showDolphin ? "50%" : "83.3%";
            return (
              <div style={{ position: "relative", height: "80px", marginBottom: "0.75rem" }}>
                <div style={{ position: "absolute", left: leftPct, transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <div style={{ fontFamily: "'Fredoka One',cursive", fontSize: "1rem", color: "#fbbf24", textAlign: "center", marginBottom: "0.3rem", animation: "shimmer 1s ease-in-out infinite", textShadow: "0 0 16px rgba(251,191,36,0.9)", whiteSpace: "nowrap" }}>
                    ✨ You unlocked a new friend!<br/>
                    <span style={{ fontFamily: "Noto Sans TC, sans-serif", fontSize: "0.9rem" }}>你解鎖了新朋友！</span>
                  </div>
                  <div style={{ animation: "arrowWiggle 0.7s ease-in-out infinite" }}>
                    <svg width="40" height="36" viewBox="0 0 40 40" style={{ filter: "drop-shadow(0 0 10px rgba(251,191,36,1))" }}>
                      <path d="M20 4 L20 28 M20 28 L10 18 M20 28 L30 18" stroke="#fbbf24" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                    </svg>
                  </div>
                </div>
              </div>
            );
          })()}
          <div ref={collectionRef}><OceanCollection fedTreatsMap={fedTreatsState} videoWatched={videoWatched} videoWatchedMap={videoWatchedMap} unlockSeenMap={unlockSeenMap} onAnimalClick={(id) => {
            setShowUnlockFor(id);
            if (audioRef.current) audioRef.current.volume = 0.02;
            if (!lullabyRef.current) lullabyRef.current = new Audio("/lullaby-music.mp3");
            lullabyRef.current.currentTime = 0;
            lullabyRef.current.volume = 0.5;
            lullabyRef.current.play().catch(() => {});
            lullabyRef.current.onended = () => {
              if (audioRef.current) audioRef.current.volume = volume * 0.5;
            };
          }} /></div>
          <div style={{ color: "rgba(255,255,255,0.5)", fontFamily: "Nunito,sans-serif", fontSize: "0.9rem", marginTop: "0.85rem", textAlign: "center" }}>
            More creatures unlocking soon! · 更多生物即將解鎖！
          </div>
        </div>
      </div>

      {/* VIDEO PLAYER — outside blurred content div so it renders unblurred */}
      {showVideo && (
        <div style={{ position: "fixed", inset: 0, zIndex: 999, background: "rgba(0,20,40,0.85)", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem", opacity: videoFadingOut ? 0 : 1, transition: "opacity 0.4s ease-out" }}>
          <div onClick={e => e.stopPropagation()} style={{ position: "relative", maxWidth: 420, width: "100%" }}>

            <video autoPlay loop controls
              onTimeUpdate={(e) => { if (!videoWatched && (e.target as HTMLVideoElement).currentTime >= 1) { const vKey = activeAnimalId === "turtle" ? `mpe_videowatched_${code}_${studentName}` : `mpe_videowatched_${activeAnimalId}_${code}_${studentName}`; localStorage.setItem(vKey, "1"); setVideoWatchedMap(m => ({ ...m, [activeAnimalId]: true })); } }}
              style={{ width: "100%", borderRadius: "1rem", border: "4px solid rgba(0,180,216,0.8)", boxShadow: "0 0 40px rgba(0,180,216,0.5)", display: "block", position: "relative", zIndex: 1 }}
              src={activeAnimal.video ?? ""} />
            <button onClick={closeVideo} style={{ position: "absolute", top: -16, right: -16, zIndex: 3, background: "#ef4444", border: "none", borderRadius: "50%", width: 36, height: 36, color: "white", fontSize: "1.1rem", cursor: "pointer", fontWeight: 900 }}>✕</button>
          </div>
        </div>
      )}
      {showSettings && <div style={{ position: "fixed", inset: 0, zIndex: 150 }} onClick={() => setShowSettings(false)} />}
    </div>
  );
};

export default KidsWorld;
