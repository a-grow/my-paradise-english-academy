import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const MASTER_CODE = "1006";

// ── ANIMALS ──────────────────────────────────────────────────────────────────
interface AnimalStage { name: string; nameZh: string; min: number; img: string; }
interface Animal {
  id: string; name: string; nameZh: string; emoji: string;
  stages: AnimalStage[];
  unlockCondition: "default" | "triceratops_grown_video_watched" | "pterodactyl_grown_video_watched" | "raptor_grown_video_watched" | "brontosaurus_grown_video_watched" | "dilophosaurus_grown_video_watched";
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
    id: "triceratops", name: "Triceratops", nameZh: "三角龍", emoji: "🦕",
    stages: [
      { name: "Egg", nameZh: "蛋", min: 0, img: "/creatures/triceratop-egg.png" },
      { name: "Baby", nameZh: "小三角龍", min: 15, img: "/creatures/triceratop-baby.png" },
      { name: "Young", nameZh: "年輕三角龍", min: 30, img: "/creatures/triceratop-young.png" },
      { name: "Grown", nameZh: "成年三角龍", min: 45, img: "/creatures/triceratop-grown.png" },
    ],
    unlockCondition: "default",
    collectionBg: "#7c4a1a", collectionBorder: "rgba(218,165,32,0.7)", collectionGlow: "rgba(218,165,32,0.4)",
    video: "/video_adult_triceratop.mp4", isEggType: true, scale: 1,
    accentColor: "#DAA520", accentGlow: "rgba(218,165,32,0.5)",
    btnColor: "#b45309", btnGlow: "rgba(180,83,9,0.5)", btn3Color: "#556B2F", btn3Glow: "rgba(85,107,47,0.5)",
    feedLabel: "triceratops", feedLabelZh: "三角龍",
    levelUpMessages: [
      { main: "Welcome, little one!", zh: "歡迎來到世界！", sub: "Meet your Baby Triceratops!", subZh: "快來認識你的小三角龍！" },
      { main: "Growing strong!", zh: "長得好壯！", sub: "Now a Young Triceratops!", subZh: "現在是年輕三角龍了！" },
      { main: "Fully grown! ROAR!", zh: "完全長大了！吼！", sub: "You raised a Grown Triceratops!", subZh: "你養大了一隻成年三角龍！" },
    ],
    unlockOverlay: { emoji: "🦕", title: "Triceratops!", titleZh: "三角龍！", eggLine: "A Triceratops Egg appeared!", eggLineZh: "三角龍蛋出現了！", feedLine: "Feed it treats to help it grow!", feedLineZh: "餵牠餅乾讓牠長大！", btnText: "Let's go! · 出發！🎉", glowColor: "rgba(218,165,32,0.6)", borderColor: "rgba(218,165,32,0.8)", bgGradient: "linear-gradient(135deg,#3d2b1f,#7c4a1a)" },
  },
  {
    id: "pterodactyl", name: "Pterodactyl", nameZh: "翼龍", emoji: "🦅",
    stages: [
      { name: "Egg", nameZh: "蛋", min: 0, img: "/creatures/pterodactyl-egg.png" },
      { name: "Baby", nameZh: "小翼龍", min: 15, img: "/creatures/pterodactyl-baby.png" },
      { name: "Young", nameZh: "年輕翼龍", min: 30, img: "/creatures/pterodactyl-young.png" },
      { name: "Grown", nameZh: "成年翼龍", min: 45, img: "/creatures/pterodactyl-grown.png" },
    ],
    unlockCondition: "triceratops_grown_video_watched",
    collectionBg: "#5c3d11", collectionBorder: "rgba(210,105,30,0.7)", collectionGlow: "rgba(210,105,30,0.4)",
    video: "/video_adult_pterodactyl.mp4", isEggType: true, scale: 1.3,
    accentColor: "#D2691E", accentGlow: "rgba(210,105,30,0.5)",
    btnColor: "#D2691E", btnGlow: "rgba(210,105,30,0.5)", btn3Color: "#8B4513", btn3Glow: "rgba(139,69,19,0.5)",
    feedLabel: "pterodactyl", feedLabelZh: "翼龍",
    levelUpMessages: [
      { main: "Welcome, little one!", zh: "歡迎來到世界！", sub: "Meet your Baby Pterodactyl!", subZh: "快來認識你的小翼龍！" },
      { main: "Growing strong!", zh: "長得好壯！", sub: "Now a Young Pterodactyl!", subZh: "現在是年輕翼龍了！" },
      { main: "Fully grown! ROAR!", zh: "完全長大了！吼！", sub: "You raised a Grown Pterodactyl!", subZh: "你養大了一隻成年翼龍！" },
    ],
    unlockOverlay: { emoji: "🦅", title: "New Friend!", titleZh: "新朋友來了！", eggLine: "A Pterodactyl Egg appeared!", eggLineZh: "翼龍蛋出現了！", feedLine: "Feed it treats to help it grow!", feedLineZh: "餵牠餅乾讓牠長大！", btnText: "So cool! · 太酷了！🎉", glowColor: "rgba(210,105,30,0.6)", borderColor: "rgba(210,105,30,0.8)", bgGradient: "linear-gradient(135deg,#2d1a08,#5c3d11,#8B4513)" },
  },
  {
    id: "raptor", name: "Raptor", nameZh: "迅猛龍", emoji: "🦖",
    stages: [
      { name: "Egg", nameZh: "蛋", min: 0, img: "/creatures/triceratop-egg.png" },
      { name: "Baby", nameZh: "小迅猛龍", min: 15, img: "/creatures/triceratop-baby.png" },
      { name: "Young", nameZh: "年輕迅猛龍", min: 30, img: "/creatures/triceratop-young.png" },
      { name: "Grown", nameZh: "成年迅猛龍", min: 45, img: "/creatures/triceratop-grown.png" },
    ],
    unlockCondition: "pterodactyl_grown_video_watched",
    collectionBg: "#4a5c1a", collectionBorder: "rgba(107,142,35,0.7)", collectionGlow: "rgba(107,142,35,0.4)",
    video: null, isEggType: true, scale: 1.2,
    accentColor: "#6B8E23", accentGlow: "rgba(107,142,35,0.5)",
    btnColor: "#556B2F", btnGlow: "rgba(85,107,47,0.5)", btn3Color: "#6B8E23", btn3Glow: "rgba(107,142,35,0.5)",
    feedLabel: "raptor", feedLabelZh: "迅猛龍",
    levelUpMessages: [
      { main: "Welcome, little one!", zh: "歡迎來到世界！", sub: "Meet your Baby Raptor!", subZh: "快來認識你的小迅猛龍！" },
      { main: "Growing strong!", zh: "長得好壯！", sub: "Now a Young Raptor!", subZh: "現在是年輕迅猛龍了！" },
      { main: "Fully grown! ROAR!", zh: "完全長大了！吼！", sub: "You raised a Grown Raptor!", subZh: "你養大了一隻成年迅猛龍！" },
    ],
    unlockOverlay: { emoji: "🦖", title: "New Friend!", titleZh: "新朋友來了！", eggLine: "A Raptor Egg appeared!", eggLineZh: "迅猛龍蛋出現了！", feedLine: "Feed it treats to help it grow!", feedLineZh: "餵牠餅乾讓牠長大！", btnText: "So cool! · 太酷了！🎉", glowColor: "rgba(107,142,35,0.6)", borderColor: "rgba(107,142,35,0.8)", bgGradient: "linear-gradient(135deg,#1e2a08,#4a5c1a,#556B2F)" },
  },
  {
    id: "brontosaurus", name: "Brontosaurus", nameZh: "雷龍", emoji: "🦕",
    stages: [
      { name: "Egg", nameZh: "蛋", min: 0, img: "/creatures/triceratop-egg.png" },
      { name: "Baby", nameZh: "小雷龍", min: 15, img: "/creatures/triceratop-baby.png" },
      { name: "Young", nameZh: "年輕雷龍", min: 30, img: "/creatures/triceratop-young.png" },
      { name: "Grown", nameZh: "成年雷龍", min: 45, img: "/creatures/triceratop-grown.png" },
    ],
    unlockCondition: "raptor_grown_video_watched",
    collectionBg: "#3d5c2a", collectionBorder: "rgba(154,205,50,0.7)", collectionGlow: "rgba(154,205,50,0.4)",
    video: null, isEggType: true, scale: 1.5,
    accentColor: "#9ACD32", accentGlow: "rgba(154,205,50,0.5)",
    btnColor: "#6B8E23", btnGlow: "rgba(107,142,35,0.5)", btn3Color: "#9ACD32", btn3Glow: "rgba(154,205,50,0.5)",
    feedLabel: "brontosaurus", feedLabelZh: "雷龍",
    levelUpMessages: [
      { main: "Welcome, little one!", zh: "歡迎來到世界！", sub: "Meet your Baby Brontosaurus!", subZh: "快來認識你的小雷龍！" },
      { main: "Growing strong!", zh: "長得好壯！", sub: "Now a Young Brontosaurus!", subZh: "現在是年輕雷龍了！" },
      { main: "Fully grown! ROAR!", zh: "完全長大了！吼！", sub: "You raised a Grown Brontosaurus!", subZh: "你養大了一隻成年雷龍！" },
    ],
    unlockOverlay: { emoji: "🦕", title: "New Friend!", titleZh: "新朋友來了！", eggLine: "A Brontosaurus Egg appeared!", eggLineZh: "雷龍蛋出現了！", feedLine: "Feed it treats to help it grow!", feedLineZh: "餵牠餅乾讓牠長大！", btnText: "So cool! · 太酷了！🎉", glowColor: "rgba(154,205,50,0.6)", borderColor: "rgba(154,205,50,0.8)", bgGradient: "linear-gradient(135deg,#1a2e0d,#3d5c2a,#556B2F)" },
  },
  {
    id: "dilophosaurus", name: "Dilophosaurus", nameZh: "雙冠龍", emoji: "🦎",
    stages: [
      { name: "Egg", nameZh: "蛋", min: 0, img: "/creatures/triceratop-egg.png" },
      { name: "Baby", nameZh: "小雙冠龍", min: 15, img: "/creatures/triceratop-baby.png" },
      { name: "Young", nameZh: "年輕雙冠龍", min: 30, img: "/creatures/triceratop-young.png" },
      { name: "Grown", nameZh: "成年雙冠龍", min: 45, img: "/creatures/triceratop-grown.png" },
    ],
    unlockCondition: "brontosaurus_grown_video_watched",
    collectionBg: "#7c2d12", collectionBorder: "rgba(234,88,12,0.7)", collectionGlow: "rgba(234,88,12,0.4)",
    video: null, isEggType: true, scale: 1.2,
    accentColor: "#ea580c", accentGlow: "rgba(234,88,12,0.5)",
    btnColor: "#c2410c", btnGlow: "rgba(194,65,12,0.5)", btn3Color: "#ea580c", btn3Glow: "rgba(234,88,12,0.5)",
    feedLabel: "dilophosaurus", feedLabelZh: "雙冠龍",
    levelUpMessages: [
      { main: "Welcome, little one!", zh: "歡迎來到世界！", sub: "Meet your Baby Dilophosaurus!", subZh: "快來認識你的小雙冠龍！" },
      { main: "Growing strong!", zh: "長得好壯！", sub: "Now a Young Dilophosaurus!", subZh: "現在是年輕雙冠龍了！" },
      { main: "Fully grown! ROAR!", zh: "完全長大了！吼！", sub: "You raised a Grown Dilophosaurus!", subZh: "你養大了一隻成年雙冠龍！" },
    ],
    unlockOverlay: { emoji: "🦎", title: "New Friend!", titleZh: "新朋友來了！", eggLine: "A Dilophosaurus Egg appeared!", eggLineZh: "雙冠龍蛋出現了！", feedLine: "Feed it treats to help it grow!", feedLineZh: "餵牠餅乾讓牠長大！", btnText: "So cool! · 太酷了！🎉", glowColor: "rgba(234,88,12,0.6)", borderColor: "rgba(234,88,12,0.8)", bgGradient: "linear-gradient(135deg,#3d0f04,#7c2d12,#c2410c)" },
  },
  {
    id: "trex", name: "T-Rex", nameZh: "暴龍", emoji: "🦖",
    stages: [
      { name: "Egg", nameZh: "蛋", min: 0, img: "/creatures/triceratop-egg.png" },
      { name: "Baby", nameZh: "小暴龍", min: 15, img: "/creatures/triceratop-baby.png" },
      { name: "Young", nameZh: "年輕暴龍", min: 30, img: "/creatures/triceratop-young.png" },
      { name: "Grown", nameZh: "成年暴龍", min: 45, img: "/creatures/triceratop-grown.png" },
    ],
    unlockCondition: "dilophosaurus_grown_video_watched",
    collectionBg: "#6b1a1a", collectionBorder: "rgba(220,38,38,0.7)", collectionGlow: "rgba(220,38,38,0.4)",
    video: null, isEggType: true, scale: 1.6,
    accentColor: "#dc2626", accentGlow: "rgba(220,38,38,0.5)",
    btnColor: "#b91c1c", btnGlow: "rgba(185,28,28,0.5)", btn3Color: "#dc2626", btn3Glow: "rgba(220,38,38,0.5)",
    feedLabel: "t-rex", feedLabelZh: "暴龍",
    levelUpMessages: [
      { main: "Welcome, little one!", zh: "歡迎來到世界！", sub: "Meet your Baby T-Rex!", subZh: "快來認識你的小暴龍！" },
      { main: "Growing strong!", zh: "長得好壯！", sub: "Now a Young T-Rex!", subZh: "現在是年輕暴龍了！" },
      { main: "Fully grown! ROAR!", zh: "完全長大了！吼！", sub: "You raised a Grown T-Rex!", subZh: "你養大了一隻成年暴龍！" },
    ],
    unlockOverlay: { emoji: "🦖", title: "T-REX!", titleZh: "暴龍！", eggLine: "A T-Rex Egg appeared!", eggLineZh: "暴龍蛋出現了！", feedLine: "Feed it treats to help it grow!", feedLineZh: "餵牠餅乾讓牠長大！", btnText: "ROAR! · 吼！🦖", glowColor: "rgba(220,38,38,0.6)", borderColor: "rgba(220,38,38,0.8)", bgGradient: "linear-gradient(135deg,#2d0808,#6b1a1a,#b91c1c)" },
  },
];

const getAnimalStage = (animal: Animal, fed: number): AnimalStage =>
  [...animal.stages].reverse().find(s => fed >= s.min) ?? animal.stages[0];
const getAnimalStageIdx = (animal: Animal, fed: number): number =>
  animal.stages.indexOf(getAnimalStage(animal, fed));

// ── EGG CRACKS (same as Ocean World) ─────────────────────────────────────────
const EggCracks = ({ treats }: { treats: number }) => {
  const level = treats <= 2 ? 0 : treats <= 5 ? 1 : treats <= 8 ? 2 : treats <= 11 ? 3 : 4;
  if (level === 0) return null;
  return (
    <svg viewBox="0 0 200 200" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 10 }}>
      {level >= 1 && <path d="M105,55 L112,70 L108,78 L115,92" stroke="#5a3010" strokeWidth="2.5" fill="none" strokeLinecap="round" style={{ filter: "drop-shadow(0 0 3px rgba(218,165,32,0.8))" }} />}
      {level >= 2 && <><path d="M105,55 L112,70 L108,78 L115,92" stroke="#5a3010" strokeWidth="2.5" fill="none" strokeLinecap="round" /><path d="M88,70 L80,82 L85,90 L79,102" stroke="#5a3010" strokeWidth="2" fill="none" strokeLinecap="round" /></>}
      {level >= 3 && <><path d="M105,55 L112,70 L108,78 L115,92" stroke="#3d1f08" strokeWidth="3" fill="none" strokeLinecap="round" /><path d="M88,70 L80,82 L85,90 L79,102" stroke="#3d1f08" strokeWidth="2.5" fill="none" strokeLinecap="round" /><path d="M115,92 L122,100 L118,108" stroke="#3d1f08" strokeWidth="2" fill="none" strokeLinecap="round" /><path d="M100,110 L106,120 L102,128" stroke="#3d1f08" strokeWidth="2" fill="none" strokeLinecap="round" /></>}
      {level >= 4 && <><path d="M105,55 L112,70 L108,78 L115,92 L108,102 L114,115" stroke="#1a0a02" strokeWidth="3.5" fill="none" strokeLinecap="round" style={{ filter: "drop-shadow(0 0 6px rgba(218,165,32,1))" }} /><path d="M88,70 L80,82 L85,90 L79,102 L85,112" stroke="#1a0a02" strokeWidth="3" fill="none" strokeLinecap="round" /><path d="M115,92 L125,98 L120,108 L127,116" stroke="#1a0a02" strokeWidth="2.5" fill="none" strokeLinecap="round" />{[[114, 115], [85, 112], [127, 116]].map(([cx, cy], i) => <circle key={i} cx={cx} cy={cy} r="3" fill="#DAA520" opacity="0.9" style={{ animation: `spL ${1 + i * 0.3}s ease-in-out infinite` }} />)}</>}
    </svg>
  );
};

// ── BONE COOKIE (prehistoric treat) ──────────────────────────────────────────
const BoneCookie = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" style={{ display: "inline-block", flexShrink: 0 }}>
    <rect x="14" y="17" width="12" height="6" rx="2" fill="#e8d5a3" stroke="#c4a96b" strokeWidth="1" />
    <circle cx="11" cy="14" r="5" fill="#e8d5a3" stroke="#c4a96b" strokeWidth="1" />
    <circle cx="11" cy="26" r="5" fill="#e8d5a3" stroke="#c4a96b" strokeWidth="1" />
    <circle cx="29" cy="14" r="5" fill="#e8d5a3" stroke="#c4a96b" strokeWidth="1" />
    <circle cx="29" cy="26" r="5" fill="#e8d5a3" stroke="#c4a96b" strokeWidth="1" />
    <ellipse cx="14" cy="11" rx="4" ry="2" fill="white" opacity="0.2" transform="rotate(-30,14,11)" />
  </svg>
);

// ── STONE NAME PLATE ──────────────────────────────────────────────────────────
const StoneNameTag = ({ name, onRename }: { name: string; onRename?: () => void }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <div style={{ position: "relative", display: "inline-block", marginBottom: "0.5rem" }}>
      <svg viewBox="0 0 260 85" width="260" height="85" overflow="visible">
        <defs>
          <linearGradient id="stoneGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#8a7560" />
            <stop offset="40%" stopColor="#6b5a42" />
            <stop offset="100%" stopColor="#4a3828" />
          </linearGradient>
          <linearGradient id="stoneBrd" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#DAA520" />
            <stop offset="50%" stopColor="#b8860b" />
            <stop offset="100%" stopColor="#8B6914" />
          </linearGradient>
          <filter id="stoneShadow">
            <feDropShadow dx="2" dy="5" stdDeviation="5" floodColor="#1a0a02" floodOpacity="0.6" />
          </filter>
          <filter id="chisel">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="2" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
        {/* rough stone shape — jagged edges */}
        <path d="M8,22 L18,10 L38,6 L70,8 L120,5 L170,8 L210,6 L238,10 L252,22 L255,40 L252,60 L240,75 L210,80 L160,82 L110,80 L60,82 L28,76 L8,62 L5,42 Z"
          fill="url(#stoneGrad)" filter="url(#stoneShadow)" />
        {/* highlight cracks */}
        <path d="M8,22 L18,10 L38,6 L70,8 L120,5 L170,8 L210,6 L238,10 L252,22 L255,40 L252,60 L240,75 L210,80 L160,82 L110,80 L60,82 L28,76 L8,62 L5,42 Z"
          fill="none" stroke="url(#stoneBrd)" strokeWidth="2.5" />
        {/* inner bevel */}
        <path d="M16,26 L24,16 L44,12 L120,10 L208,12 L240,18 L248,38 L244,58 L232,70 L120,76 L30,70 L14,55 L12,38 Z"
          fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" />
        {/* crack lines for texture */}
        <path d="M60,15 L55,35 L65,50" stroke="rgba(0,0,0,0.18)" strokeWidth="1" fill="none" strokeLinecap="round" />
        <path d="M180,12 L185,30 L178,48" stroke="rgba(0,0,0,0.14)" strokeWidth="1" fill="none" strokeLinecap="round" />
        <path d="M120,8 L122,25" stroke="rgba(0,0,0,0.1)" strokeWidth="1" fill="none" strokeLinecap="round" />
        {/* chisel marks */}
        {[30, 80, 140, 200, 230].map((x, i) => (
          <path key={i} d={`M${x},${70 + i % 2 * 4} L${x + 8},${68 + i % 2 * 3}`} stroke="rgba(0,0,0,0.2)" strokeWidth="1.5" strokeLinecap="round" />
        ))}
        {/* gold corner accents */}
        <circle cx="38" cy="12" r="4" fill="#DAA520" opacity="0.8" />
        <circle cx="218" cy="12" r="4" fill="#DAA520" opacity="0.8" />
        <circle cx="28" cy="72" r="3.5" fill="#DAA520" opacity="0.7" />
        <circle cx="228" cy="72" r="3.5" fill="#DAA520" opacity="0.7" />
      </svg>
      <div style={{
        position: "absolute", top: "50%", left: "50%",
        transform: "translate(-50%,-50%) translateY(2px)",
        fontFamily: "'Titan One',cursive", fontSize: "1.35rem",
        color: "#f5e6c8", whiteSpace: "nowrap", letterSpacing: "0.04em",
        textShadow: "0 2px 4px rgba(0,0,0,0.8), 0 0 12px rgba(218,165,32,0.4)",
      }}>{name}</div>
      {onRename && (
        <div style={{ position: "absolute", bottom: 4, right: 0 }}>
          <div style={{ position: "relative", display: "inline-block" }}>
            <button
              onClick={onRename}
              onMouseEnter={() => setHovered(true)}
              onMouseLeave={() => setHovered(false)}
              style={{ background: "rgba(218,165,32,0.25)", border: "1.5px solid rgba(218,165,32,0.5)", borderRadius: "50%", width: 24, height: 24, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}
            >
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                <path d="M9 1.5l2.5 2.5-7 7L2 12l.5-2.5 7-7z" stroke="#DAA520" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M7.5 3l2.5 2.5" stroke="#DAA520" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
            {hovered && (
              <div style={{ position: "absolute", bottom: 30, left: "50%", transform: "translateX(-50%)", background: "rgba(0,0,0,0.8)", color: "#f5e6c8", fontFamily: "Nunito,sans-serif", fontSize: "0.75rem", padding: "0.3rem 0.6rem", borderRadius: "8px", whiteSpace: "nowrap", pointerEvents: "none", zIndex: 99 }}>
                Rename your dino! · 重新幫你的恐龍取名字！
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
  const boneCount = treats === 0 ? 0 : Math.min(treats, 9);
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.4rem" }}>
      <div style={{ position: "relative", width: 100, height: 130 }}>
        <svg viewBox="0 0 100 130" width="100" height="130">
          <defs>
            <linearGradient id="jStone" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="rgba(139,101,60,0.25)" />
              <stop offset="40%" stopColor="rgba(200,170,120,0.4)" />
              <stop offset="100%" stopColor="rgba(139,101,60,0.18)" />
            </linearGradient>
            <clipPath id="jCP2">
              <path d="M16,33 Q13,36 13,43 L13,112 Q13,120 21,120 L79,120 Q87,120 87,112 L87,43 Q87,36 84,33 Z" />
            </clipPath>
          </defs>
          <rect x="22" y="17" width="56" height="18" rx="7" fill="#8B6914" stroke="#DAA520" strokeWidth="1.5" />
          <rect x="27" y="20" width="46" height="5" rx="2.5" fill="rgba(255,235,180,0.35)" />
          <rect x="40" y="12" width="20" height="9" rx="4" fill="#b8860b" stroke="#DAA520" strokeWidth="1" />
          <path d="M16,33 Q13,36 13,43 L13,112 Q13,120 21,120 L79,120 Q87,120 87,112 L87,43 Q87,36 84,33 Z" fill="url(#jStone)" stroke="rgba(218,165,32,0.4)" strokeWidth="2" />
          {boneCount > 0 && Array.from({ length: boneCount }).map((_, i) => {
            const col = i % 3; const row = Math.floor(i / 3);
            const cx = 28 + col * 20; const cy = 105 - row * 20;
            return (
              <g key={i} clipPath="url(#jCP2)" style={{ animation: `jF2 ${2 + i * 0.25}s ease-in-out infinite ${i * 0.15}s` }}>
                <rect x={cx - 6} y={cy - 2} width="12" height="4" rx="1.5" fill="#e8d5a3" stroke="#c4a96b" strokeWidth="0.8" />
                <circle cx={cx - 6} cy={cy} r="3.5" fill="#e8d5a3" stroke="#c4a96b" strokeWidth="0.8" />
                <circle cx={cx + 6} cy={cy} r="3.5" fill="#e8d5a3" stroke="#c4a96b" strokeWidth="0.8" />
              </g>
            );
          })}
          <path d="M24,42 Q26,76 24,108" stroke="rgba(255,235,180,0.2)" strokeWidth="5" fill="none" strokeLinecap="round" />
        </svg>
      </div>
      <div style={{ fontFamily: "'Titan One',cursive", fontSize: "1.1rem", color: "#f5e6c8", textShadow: "0 2px 6px rgba(0,0,0,0.6)", textAlign: "center" }}>
        {displayTreats} treat{displayTreats !== 1 ? "s" : ""}
      </div>
      {!nextStage && (
        <div style={{ fontFamily: "Nunito,sans-serif", fontSize: "0.85rem", color: "#DAA520", textAlign: "center", background: "rgba(0,0,0,0.35)", borderRadius: "999px", padding: "0.2rem 0.8rem" }}>
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
      color: ["#DAA520", "#D2691E", "#8B4513", "#556B2F", "#b8860b", "#9ACD32", "#ea580c"][Math.floor(Math.random() * 7)],
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
    <div style={{ position: "fixed", inset: 0, zIndex: 500, background: "rgba(20,10,0,0.88)", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", padding: "1rem", animation: "popIn 0.4s ease-out" }}>
      <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0 }} />
      <div style={{ position: "relative", zIndex: 10, textAlign: "center", background: "linear-gradient(135deg,#3d2b1f,#7c4a1a)", borderRadius: "2.5rem", padding: "2.5rem 2rem", maxWidth: 360, width: "100%", border: "3px solid rgba(218,165,32,0.7)", boxShadow: "0 0 60px rgba(218,165,32,0.4),0 20px 60px rgba(0,0,0,0.6)" }}>
        <div style={{ position: "absolute", inset: -8, borderRadius: "2.8rem", border: "2px solid rgba(218,165,32,0.3)", animation: "goldPulse 1.5s ease-in-out infinite", pointerEvents: "none" }} />
        <div style={{ marginBottom: "0.5rem" }}>
          {["★", "★", "★"].map((s, i) => (
            <span key={i} style={{ display: "inline-block", color: "#DAA520", fontSize: "2rem", animation: `sBounce 0.6s ease-out ${i * 0.12}s both` }}>{s}</span>
          ))}
        </div>
        <div style={{ fontFamily: "'Titan One',cursive", fontSize: "2.6rem", color: "#DAA520", textShadow: "0 0 20px rgba(218,165,32,0.9)", marginBottom: "0.2rem", lineHeight: 1.1 }}>ROAR!!!</div>
        <div style={{ fontFamily: "'Titan One',cursive", fontSize: "1.5rem", color: "#f5e6c8", marginBottom: "0.1rem" }}>{msg.main}</div>
        <div style={{ fontFamily: "Nunito,sans-serif", fontSize: "1.1rem", color: "rgba(245,230,200,0.75)", marginBottom: "1rem" }}>{msg.zh}</div>
        <div style={{ position: "relative", display: "inline-block", animation: "cReveal 0.8s cubic-bezier(0.34,1.56,0.64,1) 0.3s both" }}>
          <div style={{ position: "absolute", inset: -20, borderRadius: "50%", background: "radial-gradient(circle,rgba(218,165,32,0.4) 0%,transparent 70%)", animation: "goldPulse 1s ease-in-out infinite" }} />
          <img src={newImg} alt="New stage!" style={{ width: 150, height: 130, objectFit: "contain", filter: "drop-shadow(0 0 20px rgba(218,165,32,0.9))" }} />
        </div>
        <div style={{ fontFamily: "'Titan One',cursive", fontSize: "1.1rem", color: "#DAA520", margin: "0.75rem 0 0.25rem" }}>{msg.sub}</div>
        <div style={{ fontFamily: "Nunito,sans-serif", fontSize: "1rem", color: "rgba(245,230,200,0.65)", marginBottom: "1.25rem" }}>{msg.subZh}</div>
        <button onClick={onDismiss} style={{ background: "linear-gradient(135deg,#DAA520,#8B4513)", border: "none", borderRadius: "999px", color: "white", fontFamily: "'Titan One',cursive", fontSize: "1.5rem", padding: "0.85rem 3rem", cursor: "pointer", boxShadow: "0 6px 24px rgba(218,165,32,0.55)" }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.transform = "scale(1.06)"}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.transform = ""}>
          AMAZING! 太棒了！
        </button>
      </div>
    </div>
  );
};

// ── PET NAMING ────────────────────────────────────────────────────────────────
const PetNamingInput = ({ petName, onSave, isRenaming, onCancelRename }: { petName: string; onSave: (n: string) => void; isRenaming?: boolean; onCancelRename?: () => void }) => {
  const [val, setVal] = useState(petName);
  const [editingFirst, setEditingFirst] = useState(false);
  useEffect(() => { setVal(petName); }, [petName]);

  if (!petName && !editingFirst) return (
    <button onClick={() => setEditingFirst(true)} style={{ background: "rgba(218,165,32,0.15)", border: "1.5px dashed rgba(218,165,32,0.5)", borderRadius: "999px", color: "rgba(245,230,200,0.8)", fontFamily: "'Titan One',cursive", fontSize: "0.95rem", padding: "0.3rem 1rem", cursor: "pointer", marginBottom: "0.5rem" }}>
      Name your dino! · 幫你的恐龍取名字！
    </button>
  );
  if (!petName && editingFirst) return (
    <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.5rem", alignItems: "center" }}>
      <input autoFocus value={val} onChange={e => setVal(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && val.trim()) { onSave(val.trim()); setEditingFirst(false); } }} maxLength={16} placeholder="Enter a name."
        style={{ fontFamily: "'Titan One',cursive", fontSize: "1rem", padding: "0.4rem 0.9rem", borderRadius: "999px", border: "2px solid rgba(218,165,32,0.6)", background: "rgba(61,43,31,0.7)", color: "#f5e6c8", outline: "none", width: 140 }} />
      <button onClick={() => { if (val.trim()) { onSave(val.trim()); setEditingFirst(false); } }} style={{ background: "#556B2F", border: "none", borderRadius: "999px", color: "white", fontFamily: "'Titan One',cursive", fontSize: "0.9rem", padding: "0.4rem 0.9rem", cursor: "pointer" }}>Save · 儲存</button>
    </div>
  );
  if (isRenaming) return (
    <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.25rem", marginBottom: "0.25rem", alignItems: "center", justifyContent: "center" }}>
      <input autoFocus value={val} onChange={e => setVal(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && val.trim()) onSave(val.trim()); if (e.key === "Escape" && onCancelRename) onCancelRename(); }} maxLength={16}
        style={{ fontFamily: "'Titan One',cursive", fontSize: "1rem", padding: "0.4rem 0.9rem", borderRadius: "999px", border: "2px solid rgba(218,165,32,0.6)", background: "rgba(61,43,31,0.7)", color: "#f5e6c8", outline: "none", width: 140, textAlign: "center" }} />
      <button onClick={() => { if (val.trim()) onSave(val.trim()); }} style={{ background: "#556B2F", border: "none", borderRadius: "50%", width: 32, height: 32, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem", color: "white" }}>✓</button>
      <button onClick={() => { if (onCancelRename) onCancelRename(); }} style={{ background: "#b91c1c", border: "none", borderRadius: "50%", width: 32, height: 32, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem", color: "white" }}>✗</button>
    </div>
  );
  return null;
};

// ── EARN BUTTONS ──────────────────────────────────────────────────────────────
const EarnButtons = ({ navigate, code, studentName, activeAnimal }: { navigate: (p: string) => void; code: string; studentName: string; activeAnimal: Animal }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
    {[
      { label: "Play a Game", sub: "打敗遊戲，得1~3個骨頭餅乾！", reward: "+1~3 bone cookies", color: activeAnimal.btnColor, glow: activeAnimal.btnGlow, path: `/game/${code}/${studentName}/BOOKNUM`, dino: true },
      { label: "Read & Quiz", sub: "即將推出！Coming Soon!", reward: "🔒", color: "#6B5A42", glow: "rgba(107,90,66,0.0)", path: "", disabled: true },
      { label: "Visit 5 Days!", sub: "連續來5天！", reward: "+3 bone cookies", color: activeAnimal.btn3Color, glow: activeAnimal.btn3Glow, path: "" },
    ].map((btn, i) => (
      <button key={i} onClick={() => { if (!btn.disabled && btn.path) { const f = JSON.parse(sessionStorage.getItem('mpe_family') || '{}'); if ((btn as any).dino) sessionStorage.setItem('mpe_from_dino', '1'); navigate(btn.path.replace('BOOKNUM', String(f?.book ?? 1))); } }} style={{
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
          <div style={{ fontFamily: "'Titan One',cursive", fontSize: "1.25rem", color: "white", lineHeight: 1.2 }}>{btn.label}</div>
          <div style={{ fontFamily: "Nunito,sans-serif", fontSize: "1.05rem", color: "rgba(255,255,255,0.9)", marginTop: "0.15rem" }}>{btn.sub}</div>
        </div>
        <div style={{ background: "rgba(255,255,255,0.2)", borderRadius: "999px", padding: "0.35rem 0.9rem", flexShrink: 0, marginLeft: "0.5rem", fontFamily: "'Titan One',cursive", fontSize: "1rem", color: "white", whiteSpace: "nowrap" }}>
          {btn.reward}
        </div>
      </button>
    ))}
  </div>
);

// ── DINO COLLECTION ───────────────────────────────────────────────────────────
const DinoCollection = ({ fedTreatsMap, videoWatchedMap, unlockSeenMap, onAnimalClick }: { fedTreatsMap: Record<string, number>; videoWatchedMap: Record<string, boolean>; unlockSeenMap: Record<string, boolean>; onAnimalClick: (id: string) => void }) => {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "0.75rem" }}>
      {ANIMALS.map((animal, i) => {
        const fed = fedTreatsMap[animal.id] ?? 0;
        const animalStageIdx = getAnimalStageIdx(animal, fed);
        const currentImg = animal.stages[animalStageIdx].img;
        const isUnlocked = (() => {
          if (animal.unlockCondition === "default") return true;
          if (animal.unlockCondition === "triceratops_grown_video_watched") return getAnimalStageIdx(ANIMALS[0], fedTreatsMap["triceratops"] ?? 0) === 3 && (videoWatchedMap["triceratops"] ?? false);
          if (animal.unlockCondition === "pterodactyl_grown_video_watched") { const a = ANIMALS.find(x => x.id === "pterodactyl"); return a ? getAnimalStageIdx(a, fedTreatsMap["pterodactyl"] ?? 0) === 3 && (videoWatchedMap["pterodactyl"] ?? false) && (unlockSeenMap["pterodactyl"] ?? false) : false; }
          if (animal.unlockCondition === "raptor_grown_video_watched") { const a = ANIMALS.find(x => x.id === "raptor"); return a ? getAnimalStageIdx(a, fedTreatsMap["raptor"] ?? 0) === 3 && (videoWatchedMap["raptor"] ?? false) && (unlockSeenMap["raptor"] ?? false) : false; }
          if (animal.unlockCondition === "brontosaurus_grown_video_watched") { const a = ANIMALS.find(x => x.id === "brontosaurus"); return a ? getAnimalStageIdx(a, fedTreatsMap["brontosaurus"] ?? 0) === 3 && (videoWatchedMap["brontosaurus"] ?? false) && (unlockSeenMap["brontosaurus"] ?? false) : false; }
          if (animal.unlockCondition === "dilophosaurus_grown_video_watched") { const a = ANIMALS.find(x => x.id === "dilophosaurus"); return a ? getAnimalStageIdx(a, fedTreatsMap["dilophosaurus"] ?? 0) === 3 && (videoWatchedMap["dilophosaurus"] ?? false) && (unlockSeenMap["dilophosaurus"] ?? false) : false; }
          return false;
        })();
        const unlockSeen = unlockSeenMap[animal.id] ?? false;
        const isClickable = isUnlocked && !unlockSeen && animal.unlockCondition !== "default";
        return (
          <div key={animal.id} id={`dino-card-${animal.id}`} onClick={isClickable ? () => onAnimalClick(animal.id) : undefined}
            style={{
              position: "relative", borderRadius: "1.25rem",
              background: `${animal.collectionBg}${isUnlocked ? "44" : "22"}`,
              border: `2px solid ${animal.collectionBorder}`,
              padding: "0.85rem 0.5rem",
              boxShadow: isClickable ? `0 0 30px ${animal.collectionGlow},0 0 60px ${animal.collectionGlow}` : `0 0 ${isUnlocked ? 20 : 10}px ${animal.collectionGlow}`,
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
              transition: "all 0.3s", cursor: isClickable ? "pointer" : "default",
              animation: isClickable ? "dinoPulse 1.2s ease-in-out infinite" : undefined
            }}>
            {isUnlocked && (unlockSeen || animal.unlockCondition === "default") ? (
              <>
                <img src={currentImg} alt={animal.name} style={{ width: 62, height: 62, objectFit: "contain", filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.4))", display: "block", margin: "0 auto", animation: "bobAnim 3s ease-in-out infinite" }} />
                <div style={{ fontFamily: "'Titan One',cursive", fontSize: "0.75rem", color: "#DAA520", marginTop: "0.35rem", textAlign: "center", textShadow: "0 1px 4px rgba(0,0,0,0.5)" }}>{animal.name}</div>
                <div style={{ position: "absolute", inset: -3, borderRadius: "1.4rem", border: "2px solid rgba(218,165,32,0.4)", animation: "gP 2s ease-in-out infinite", pointerEvents: "none" }} />
              </>
            ) : isClickable ? (
              <>
                <div style={{ width: 56, height: 52, borderRadius: "30% 40% 35% 45%", background: animal.collectionBorder, margin: "0 auto", position: "relative", display: "flex", alignItems: "center", justifyContent: "center", animation: "bobAnim 2s ease-in-out infinite", boxShadow: `0 0 24px ${animal.collectionBorder}` }}>
                  <div style={{ width: 34, height: 30, borderRadius: "40% 35% 45% 30%", background: animal.collectionBg }} />
                  <div style={{ position: "absolute", top: -6, right: -5, animation: "spL 1s ease-in-out infinite" }}>
                    <svg width="16" height="16" viewBox="0 0 14 14"><path d="M7 0L8.5 5.5L14 7L8.5 8.5L7 14L5.5 8.5L0 7L5.5 5.5Z" fill="rgba(255,255,255,1)" /></svg>
                  </div>
                </div>
                <div style={{ fontFamily: "'Titan One',cursive", fontSize: "0.72rem", color: "#DAA520", marginTop: "0.4rem", textAlign: "center" }}>Click Me!<br /><span style={{ fontFamily: "Noto Sans TC,sans-serif", fontSize: "0.65rem" }}>點我！</span></div>
                <div style={{ position: "absolute", inset: -3, borderRadius: "1.4rem", border: `2px solid ${animal.collectionBorder}`, animation: "gP 1s ease-in-out infinite", pointerEvents: "none" }} />
              </>
            ) : (
              <>
                <div style={{ width: 56, height: 52, borderRadius: "30% 40% 35% 45%", background: `${animal.collectionBg}55`, margin: "0 auto", position: "relative", display: "flex", alignItems: "center", justifyContent: "center", animation: "sL 2.5s ease-in-out infinite" }}>
                  <div style={{ width: 34, height: 30, borderRadius: "40% 35% 45% 30%", background: `${animal.collectionBg}88` }} />
                  <div style={{ position: "absolute", top: -6, right: -5, animation: `spL ${1.8 + i * 0.3}s ease-in-out infinite` }}>
                    <svg width="14" height="14" viewBox="0 0 14 14"><path d="M7 0L8.5 5.5L14 7L8.5 8.5L7 14L5.5 8.5L0 7L5.5 5.5Z" fill="rgba(255,255,255,0.6)" /></svg>
                  </div>
                </div>
                <div style={{ fontFamily: "'Titan One',cursive", fontSize: "0.72rem", color: animal.collectionBorder, marginTop: "0.4rem", textAlign: "center", opacity: 0.75 }}>???</div>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
};

// ── MAIN ──────────────────────────────────────────────────────────────────────
const DinosaurWorld = () => {
  const { code, studentName } = useParams<{ code: string; studentName: string }>();
  const { family } = useAuth();
  const navigate = useNavigate();

  const isMaster = code === MASTER_CODE;

  const [jarTreats, setJarTreats] = useState(() => isMaster ? 99 : parseInt(localStorage.getItem(`mpe_dino_jar_${code}_${studentName}`) || "0"));
  const [fedTreatsState, setFedTreatsState] = useState<Record<string, number>>(() =>
    isMaster ? { triceratops: 45, pterodactyl: 45, raptor: 45, brontosaurus: 45, dilophosaurus: 45 } :
      Object.fromEntries(ANIMALS.map(a => [a.id, parseInt(localStorage.getItem(`mpe_dino_fed_${a.id}_${code}_${studentName}`) || "0")]))
  );
  const [loading, setLoading] = useState(!isMaster);
  const [hearts, setHearts] = useState<{ id: number; x: number; y: number; delay: number }[]>([]);
  const [petted, setPetted] = useState(false);
  const [eggWiggle, setEggWiggle] = useState(false);
  const [showDailyGift, setShowDailyGift] = useState(false);
  const [justEarned, setJustEarned] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [petNameMap, setPetNameMap] = useState<Record<string, string>>(() =>
    Object.fromEntries(ANIMALS.map(a => [a.id, localStorage.getItem(`mpe_dino_petname_${a.id}_${code}_${studentName}`) || ""]))
  );
  const [levelUpStage, setLevelUpStage] = useState<{ animal: Animal; stageIdx: number } | null>(null);
  const [showVideo, setShowVideo] = useState(false);
  const [videoWatchedMap, setVideoWatchedMap] = useState<Record<string, boolean>>(() => {
    if (isMaster) return { triceratops: true, pterodactyl: true, raptor: true, brontosaurus: true, dilophosaurus: true };
    return Object.fromEntries(ANIMALS.map(a => [a.id, localStorage.getItem(`mpe_dino_videowatched_${a.id}_${code}_${studentName}`) === "1"]));
  });
  const [showUnlockFor, setShowUnlockFor] = useState<string | null>(null);
  const [unlockSeenMap, setUnlockSeenMap] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(ANIMALS.map(a => [a.id, localStorage.getItem(`mpe_dino_unlkseen_${a.id}_${code}_${studentName}`) === "1"]))
  );
  const [videoFadingOut, setVideoFadingOut] = useState(false);
  const [showLookBelow, setShowLookBelow] = useState(false);
  const [showDinoComplete, setShowDinoComplete] = useState(false);
  const [musicOn, setMusicOn] = useState(() => localStorage.getItem("mpe_dino_music") !== "off");
  const [sfxOn, setSfxOn] = useState(() => localStorage.getItem("mpe_sfx") !== "off");
  const [volume, setVolume] = useState(() => parseFloat(localStorage.getItem("mpe_volume") || "0.25"));
  const [feedingBones, setFeedingBones] = useState<{ id: number; x: number; y: number }[]>([]);

  const heartId = useRef(0);
  const feedId = useRef(0);
  const creatureRef = useRef<HTMLDivElement>(null);
  const collectionRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lullabyRef = useRef<HTMLAudioElement | null>(null);
  const tadaRef = useRef<HTMLAudioElement | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const prevStageRef = useRef<number | null>(null);
  const levelUpFiredRef = useRef<Record<string, Set<number>>>(
    Object.fromEntries(ANIMALS.map(a => [a.id, new Set<number>(
      JSON.parse(localStorage.getItem(`mpe_dino_levelup_${a.id}_${code}_${studentName}`) || "[]")
    )]))
  );

  const displayName = (() => {
    if (isMaster) return "Teacher";
    const n = studentName ?? "";
    const s = family?.students.find(s => s.name.toLowerCase() === n.toLowerCase());
    return s?.name ?? (n.charAt(0).toUpperCase() + n.slice(1));
  })();

  const [activeAnimalId, setActiveAnimalId] = useState("triceratops");
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
    if (!audioRef.current) { audioRef.current = new Audio("/dinosaurworld-music.mp3"); audioRef.current.loop = true; }
    audioRef.current.volume = volume * 0.5;
    if (musicOn) { audioRef.current.play().catch(() => { const tryPlay = () => { audioRef.current?.play().catch(() => { }); }; document.addEventListener("pointerdown", tryPlay, { once: true }); }); }
    else audioRef.current.pause();
    localStorage.setItem("mpe_dino_music", musicOn ? "on" : "off");
    return () => { audioRef.current?.pause(); };
  }, [musicOn]);
  useEffect(() => { if (audioRef.current) audioRef.current.volume = volume * 0.5; localStorage.setItem("mpe_volume", String(volume)); }, [volume]);
  useEffect(() => { localStorage.setItem("mpe_sfx", sfxOn ? "on" : "off"); }, [sfxOn]);

  useEffect(() => {
    if ((stageIdx === 3 && !videoWatched && !levelUpStage) || showVideo || showLookBelow || showDinoComplete) {
      document.body.style.overflow = "hidden";
    } else { document.body.style.overflow = ""; }
    return () => { document.body.style.overflow = ""; };
  }, [stageIdx, videoWatched, showVideo, showLookBelow, showDinoComplete]);

  // Dino world complete
  useEffect(() => {
    const trex = ANIMALS.find(a => a.id === "trex");
    if (!trex) return;
    const trexFed = fedTreatsState["trex"] ?? 0;
    const trexGrown = getAnimalStageIdx(trex, trexFed) === 3;
    const trexVideoWatched = videoWatchedMap["trex"] ?? false;
    const alreadySeen = localStorage.getItem(`mpe_dinocomplete_${code}_${studentName}`) === "1";
    if (trexGrown && trexVideoWatched && !alreadySeen && !showVideo) {
      setTimeout(() => {
        setShowDinoComplete(true);
        if (audioRef.current) audioRef.current.volume = 0.02;
      }, 800);
    }
  }, [fedTreatsState, videoWatchedMap, showVideo]);

  const getCtx = () => {
    if (!ctxRef.current) ctxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    return ctxRef.current;
  };

  // Prehistoric SFX
  const playSfx = useCallback((type: "stomp" | "hearts" | "roar" | "daily" | "treat" | "rattle") => {
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
      const noise = (time: number, dur: number, vol: number) => {
        const buf = ctx.createBuffer(1, ctx.sampleRate * dur, ctx.sampleRate);
        const data = buf.getChannelData(0);
        for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / data.length, 1.5);
        const src = ctx.createBufferSource(); const g = ctx.createGain();
        src.buffer = buf; src.connect(g); g.connect(ctx.destination);
        g.gain.setValueAtTime(vol, ctx.currentTime + time);
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + time + dur);
        src.start(ctx.currentTime + time);
      };
      const sounds: Record<string, () => void> = {
        // Heavy stomp — low thud
        stomp: () => { noise(0, 0.08, 0.5); play(60, 0, 0.15, 0.3, "sine"); play(40, 0.05, 0.12, 0.25, "sine"); },
        // Dino chirp — rising tones for hearts
        hearts: () => { [200, 260, 320, 400].forEach((f, i) => play(f, i * 0.08, 0.2, 0.12, "triangle")); },
        // Building roar — low to mid sweep
        roar: () => {
          const osc = ctx.createOscillator(); const g = ctx.createGain();
          osc.connect(g); g.connect(ctx.destination);
          osc.type = "sawtooth";
          osc.frequency.setValueAtTime(80, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(220, ctx.currentTime + 0.4);
          osc.frequency.exponentialRampToValueAtTime(140, ctx.currentTime + 0.8);
          g.gain.setValueAtTime(0.0, ctx.currentTime);
          g.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.15);
          g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.9);
          osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.9);
          noise(0, 0.6, 0.2);
        },
        // Cave echo chime
        daily: () => { [150, 200, 250, 180, 220].forEach((f, i) => play(f, i * 0.12, 0.3, 0.14, "triangle")); },
        // Claw tap
        treat: () => { noise(0, 0.04, 0.3); play(120, 0, 0.06, 0.2, "square"); },
        // Egg rumble
        rattle: () => { [0, 0.08, 0.16, 0.24, 0.32].forEach(t => { noise(t, 0.06, 0.25); play(80, t, 0.06, 0.15, "sine"); }); },
      };
      sounds[type]?.();
    } catch { }
  }, [sfxOn]);

  // Close video
  const closeVideo = () => {
    setVideoFadingOut(true);
    setTimeout(() => {
      setShowVideo(false); setVideoFadingOut(false);
      if (audioRef.current) audioRef.current.volume = volume * 0.5;
      if (!unlockSeenMap["pterodactyl"] || !unlockSeenMap["raptor"] || !unlockSeenMap["brontosaurus"] || !unlockSeenMap["dilophosaurus"] || !unlockSeenMap["trex"])
        setTimeout(() => setShowLookBelow(true), 300);
    }, 400);
  };

  // Level up
  useEffect(() => {
    const animalFired = levelUpFiredRef.current[activeAnimalId] ?? new Set<number>();
    if (prevStageRef.current === null) { prevStageRef.current = stageIdx; return; }
    if (stageIdx > 0 && stageIdx !== prevStageRef.current && !animalFired.has(stageIdx)) {
      animalFired.add(stageIdx);
      levelUpFiredRef.current[activeAnimalId] = animalFired;
      localStorage.setItem(`mpe_dino_levelup_${activeAnimalId}_${code}_${studentName}`, JSON.stringify([...animalFired]));
      setLevelUpStage({ animal: activeAnimal, stageIdx });
      playSfx("roar");
    }
    prevStageRef.current = stageIdx;
  }, [stageIdx]);

  useEffect(() => {
    if (isMaster) return;
    setLoading(false);
    const lastGift = localStorage.getItem(`mpe_dino_gift_${code}_${studentName}`);
    const shownKey = `mpe_dino_gift_shown_${code}_${studentName}_${new Date().toDateString()}`;
    if (lastGift !== new Date().toDateString() && !localStorage.getItem(shownKey)) {
      localStorage.setItem(shownKey, "true");
      setTimeout(() => { setShowDailyGift(true); }, 1800);
    }
  }, []);

  const savePetName = (name: string) => {
    setPetNameMap(m => ({ ...m, [activeAnimalId]: name }));
    localStorage.setItem(`mpe_dino_petname_${activeAnimalId}_${code}_${studentName}`, name);
    playSfx("daily");
  };

  const handleFeed = () => {
    if (jarTreats <= 0) return;
    const newJar = jarTreats - 1;
    const newFed = fedTreats + 1;
    setJarTreats(newJar);
    setFedTreatsState(m => ({ ...m, [activeAnimalId]: newFed }));
    if (!isMaster) {
      localStorage.setItem(`mpe_dino_jar_${code}_${studentName}`, String(newJar));
      localStorage.setItem(`mpe_dino_fed_${activeAnimalId}_${code}_${studentName}`, String(newFed));
    }
    playSfx("treat");
    const id = feedId.current++;
    const jarX = window.innerWidth / 2 - 80;
    const jarY = window.innerHeight / 2 + 100;
    setFeedingBones(f => [...f, { id, x: jarX, y: jarY }]);
    setTimeout(() => {
      setFeedingBones(f => f.filter(c => c.id !== id));
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
    localStorage.setItem(`mpe_dino_gift_${code}_${studentName}`, new Date().toDateString());
    if (!isMaster) localStorage.setItem(`mpe_dino_jar_${code}_${studentName}`, String(newJar));
    setTimeout(() => setJustEarned(0), 2500);
  };

  const creatureImg = activeAnimal.stages[stageIdx]?.img ?? activeAnimal.stages[0].img;

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(180deg,#3d2b1f,#1a0a02)" }}>
      <div style={{ fontFamily: "'Titan One',cursive", fontSize: "2rem", color: "#DAA520", textAlign: "center", textShadow: "0 0 20px rgba(218,165,32,0.5)" }}>
        Loading {displayName}'s Dinosaur World... 🦕
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", position: "relative", overflow: "hidden", fontFamily: "'Titan One',cursive", userSelect: "none" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Titan+One&family=Nunito:wght@600;700;800;900&display=swap');
        @keyframes heartFloat{0%{transform:translateY(0) scale(0.5);opacity:1}60%{transform:translateY(-55px) scale(1.1);opacity:1}100%{transform:translateY(-100px) scale(0.8);opacity:0}}
        @keyframes bobAnim{0%,100%{transform:translateY(0) rotate(-0.5deg)}50%{transform:translateY(-14px) rotate(0.5deg)}}
        @keyframes pettedAnim{0%,100%{transform:translateY(0) scale(1)}20%{transform:translateY(-8px) rotate(-4deg) scale(1.06)}40%{transform:translateY(-12px) rotate(4deg) scale(1.08)}60%{transform:translateY(-6px) rotate(-2deg) scale(1.05)}80%{transform:translateY(-3px) rotate(2deg) scale(1.03)}}
        @keyframes eggWiggle{0%,100%{transform:rotate(0deg) scale(1)}15%{transform:rotate(-10deg) scale(1.04)}30%{transform:rotate(10deg) scale(1.04)}45%{transform:rotate(-7deg) scale(1.02)}60%{transform:rotate(7deg) scale(1.02)}75%{transform:rotate(-3deg) scale(1.01)}}
        @keyframes eggAuto{0%,80%,100%{transform:rotate(0deg)}83%{transform:rotate(-6deg)}87%{transform:rotate(6deg)}91%{transform:rotate(-4deg)}95%{transform:rotate(3deg)}98%{transform:rotate(-1deg)}}
        @keyframes nearHatchGlow{0%,100%{filter:drop-shadow(0 0 8px rgba(218,165,32,0.6)) drop-shadow(0 8px 20px rgba(0,0,0,0.3))}50%{filter:drop-shadow(0 0 22px rgba(218,165,32,1)) drop-shadow(0 8px 20px rgba(0,0,0,0.3))}}
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
        @keyframes cookieFloat{0%{transform:translateY(0) translateX(0) scale(1);opacity:1}25%{transform:translateY(-60px) translateX(20px) scale(1.1)}50%{transform:translateY(-120px) translateX(-15px) scale(1.05)}75%{transform:translateY(-180px) translateX(10px) scale(0.9)}100%{transform:translateY(-240px) translateX(0) scale(0.5);opacity:0}}
        @keyframes arrowWiggle{0%,100%{transform:translateY(0) rotate(-8deg)}50%{transform:translateY(6px) rotate(8deg)}}
        @keyframes dinoPulse{0%,100%{transform:scale(1);box-shadow:0 0 30px rgba(218,165,32,0.8)}50%{transform:scale(1.05);box-shadow:0 0 60px rgba(218,165,32,1)}}
        @keyframes watchPulse{0%,100%{transform:scale(1);box-shadow:0 0 30px rgba(218,165,32,0.8),0 0 60px rgba(139,69,19,0.6)}50%{transform:scale(1.06);box-shadow:0 0 60px rgba(218,165,32,1),0 0 100px rgba(139,69,19,0.9)}}
        @keyframes groundShake{0%,100%{transform:translateX(0)}25%{transform:translateX(-3px)}75%{transform:translateX(3px)}}
        .bob{animation:bobAnim 3.4s ease-in-out infinite}
        .petted{animation:pettedAnim 0.9s ease-in-out}
        .egg-idle{animation:bobAnim 4s ease-in-out infinite,eggAuto 5s ease-in-out infinite;cursor:pointer}
        .egg-near{animation:bobAnim 2s ease-in-out infinite,eggAuto 2.5s ease-in-out infinite,nearHatchGlow 1.2s ease-in-out infinite;cursor:pointer}
        .egg-wiggle{animation:eggWiggle 0.7s ease-in-out,groundShake 0.7s ease-in-out;cursor:pointer}
        .glass{background:rgba(61,43,31,0.72);backdrop-filter:blur(14px);border:1.5px solid rgba(218,165,32,0.25);border-radius:1.75rem}
        .gold-border{border:2.5px solid #DAA520 !important;box-shadow:0 0 28px rgba(218,165,32,0.45)}
        .toggle-track{width:50px;height:28px;border-radius:999px;border:none;cursor:pointer;transition:background 0.3s;position:relative;display:flex;align-items:center;padding:3px}
        .toggle-thumb{width:22px;height:22px;border-radius:50%;background:white;transition:transform 0.3s;box-shadow:0 2px 4px rgba(0,0,0,0.2)}
        input[type=range]{-webkit-appearance:none;width:100%;height:6px;border-radius:3px;background:rgba(218,165,32,0.25);outline:none}
        input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:18px;height:18px;border-radius:50%;background:#DAA520;cursor:pointer;box-shadow:0 2px 6px rgba(0,0,0,0.3)}
      `}</style>

      {/* PREHISTORIC BACKGROUND */}
      <div style={{
        position: "absolute", inset: 0, zIndex: 0,
        backgroundImage: "url('/dinosaurworldbg.png')",
        backgroundSize: "cover", backgroundPosition: "center bottom",
        backgroundRepeat: "no-repeat",
      }} />
      {/* Dark overlay for readability */}
      <div style={{ position: "absolute", inset: 0, zIndex: 1, background: "linear-gradient(180deg, rgba(20,10,0,0.45) 0%, rgba(10,5,0,0.2) 50%, rgba(20,10,0,0.55) 100%)" }} />

      {levelUpStage && <LevelUpOverlay animal={levelUpStage.animal} stageIdx={levelUpStage.stageIdx} onDismiss={() => setLevelUpStage(null)} />}

      {/* DINO WORLD COMPLETE */}
      {showDinoComplete && (
        <div style={{ position: "fixed", inset: 0, zIndex: 700, background: "rgba(20,8,0,0.92)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
          <div onClick={e => e.stopPropagation()} style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", gap: "1.5rem" }}>
            <div style={{ fontFamily: "'Titan One',cursive", fontSize: "clamp(1.8rem,5vw,2.5rem)", color: "#DAA520", textShadow: "0 0 20px rgba(218,165,32,0.9)", textAlign: "center", animation: "shimmer 1.5s ease-in-out infinite" }}>
              🦖 Dinosaur World Complete! 🦕
            </div>
            <div style={{ fontFamily: "Noto Sans TC,sans-serif", fontSize: "1.1rem", color: "rgba(245,230,200,0.85)", textAlign: "center" }}>恐龍世界完成了！</div>
            <button onClick={() => { localStorage.setItem(`mpe_dinocomplete_${code}_${studentName}`, "1"); setShowDinoComplete(false); if (audioRef.current) audioRef.current.volume = volume * 0.5; }}
              style={{ background: "linear-gradient(180deg,#DAA520 0%,#8B6914 50%,#5c4409 100%)", border: "none", borderRadius: "999px", padding: "1.1rem 2.8rem", cursor: "pointer", boxShadow: "0 8px 0px #3d2a04,0 12px 24px rgba(0,0,0,0.5)", fontFamily: "'Titan One',cursive", fontSize: "1.5rem", color: "#1a0a02", textShadow: "0 1px 2px rgba(255,255,255,0.2)" }}>
              Enter a New World! · 進入新世界！
            </button>
          </div>
        </div>
      )}

      {/* LOOK BELOW */}
      {showLookBelow && (
        <div style={{ position: "fixed", inset: 0, zIndex: 600, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem", animation: "popIn 0.35s ease-out" }}>
          <div onClick={e => e.stopPropagation()} style={{ background: "linear-gradient(135deg,#3d2b1f,#6b4a20)", borderRadius: "2.5rem", padding: "2.5rem 2rem", textAlign: "center", maxWidth: 340, width: "100%", border: "3px solid #DAA520", boxShadow: "0 0 60px rgba(218,165,32,0.6),0 20px 60px rgba(0,0,0,0.5)" }}>
            <div style={{ fontSize: "3rem", marginBottom: "0.5rem", animation: "bobAnim 1s ease-in-out infinite" }}>👇</div>
            <div style={{ fontFamily: "'Titan One',cursive", fontSize: "2rem", color: "#DAA520", marginBottom: "0.25rem" }}>Look below!</div>
            <div style={{ fontFamily: "Noto Sans TC,sans-serif", fontSize: "1.1rem", color: "rgba(245,230,200,0.85)", marginBottom: "0.5rem" }}>往下看！</div>
            <div style={{ fontFamily: "'Titan One',cursive", fontSize: "1.1rem", color: "#f5e6c8", marginBottom: "0.25rem" }}>A new dino is waiting!</div>
            <div style={{ fontFamily: "Noto Sans TC,sans-serif", fontSize: "1rem", color: "rgba(245,230,200,0.7)", marginBottom: "1.5rem" }}>新恐龍在等你！</div>
            <button onClick={() => { setShowLookBelow(false); setTimeout(() => collectionRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }), 100); }}
              style={{ background: "linear-gradient(135deg,#DAA520,#8B4513)", border: "none", borderRadius: "999px", color: "white", fontFamily: "'Titan One',cursive", fontSize: "1.3rem", padding: "0.8rem 2.5rem", cursor: "pointer", boxShadow: "0 6px 24px rgba(218,165,32,0.6)" }}>
              Let's go! · 出發！🦕
            </button>
          </div>
        </div>
      )}

      {/* UNLOCK OVERLAY */}
      {showUnlockFor && (() => {
        const a = ANIMALS.find(x => x.id === showUnlockFor);
        if (!a) return null;
        const ov = a.unlockOverlay;
        const dismiss = () => {
          setShowUnlockFor(null);
          setUnlockSeenMap(m => ({ ...m, [a.id]: true }));
          setTimeout(() => { window.scrollTo({ top: 0, behavior: "smooth" }); }, 400);
          localStorage.setItem(`mpe_dino_unlkseen_${a.id}_${code}_${studentName}`, "1");
          setActiveAnimalId(a.id);
          if (lullabyRef.current) { lullabyRef.current.pause(); lullabyRef.current.currentTime = 0; }
          if (audioRef.current) audioRef.current.volume = volume * 0.5;
        };
        return (
          <div style={{ position: "fixed", inset: 0, zIndex: 600, background: "rgba(10,5,0,0.92)", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem", animation: "popIn 0.4s ease-out" }}>
            <div onClick={e => e.stopPropagation()} style={{ position: "relative", zIndex: 10, textAlign: "center", background: ov.bgGradient, borderRadius: "2.5rem", padding: "2.5rem 2rem", maxWidth: 360, width: "100%", border: `3px solid ${ov.borderColor}`, boxShadow: `0 0 80px ${ov.glowColor},0 20px 60px rgba(0,0,0,0.6)` }}>
              <div style={{ position: "absolute", inset: -8, borderRadius: "2.8rem", border: `2px solid ${ov.borderColor}`, animation: "goldPulse 1.5s ease-in-out infinite", pointerEvents: "none" }} />
              <div style={{ fontFamily: "'Titan One',cursive", fontSize: "2.8rem", marginBottom: "0.25rem" }}>{ov.emoji}</div>
              <div style={{ fontFamily: "'Titan One',cursive", fontSize: "2rem", color: "#f5e6c8", textShadow: `0 0 20px ${ov.glowColor}`, marginBottom: "0.1rem" }}>{ov.title}</div>
              <div style={{ fontFamily: "Noto Sans TC,sans-serif", fontSize: "1.1rem", color: "rgba(245,230,200,0.8)", marginBottom: "1rem" }}>{ov.titleZh}</div>
              <div style={{ position: "relative", display: "inline-block", animation: "cReveal 0.8s cubic-bezier(0.34,1.56,0.64,1) 0.3s both" }}>
                <div style={{ position: "absolute", inset: -20, borderRadius: "50%", background: `radial-gradient(circle,${ov.glowColor} 0%,transparent 70%)`, animation: "goldPulse 1s ease-in-out infinite" }} />
                <img src={a.stages[0].img} alt={a.name} style={{ width: 150, height: 140, objectFit: "contain", filter: `drop-shadow(0 0 24px ${ov.glowColor})` }} />
              </div>
              <div style={{ fontFamily: "'Titan One',cursive", fontSize: "1.2rem", color: "#f5e6c8", margin: "0.75rem 0 0.2rem" }}>{ov.eggLine}</div>
              <div style={{ fontFamily: "Noto Sans TC,sans-serif", fontSize: "1rem", color: "rgba(245,230,200,0.7)", marginBottom: "0.5rem" }}>{ov.eggLineZh}</div>
              <div style={{ fontFamily: "Nunito,sans-serif", fontSize: "0.9rem", color: "rgba(245,230,200,0.5)", marginBottom: "1.5rem" }}>{ov.feedLine} · {ov.feedLineZh}</div>
              <button onClick={dismiss} style={{ background: `linear-gradient(135deg,${ov.borderColor},${ov.glowColor})`, border: "none", borderRadius: "999px", color: "white", fontFamily: "'Titan One',cursive", fontSize: "1.4rem", padding: "0.85rem 3rem", cursor: "pointer", boxShadow: `0 6px 24px ${ov.glowColor}` }}>
                {ov.btnText}
              </button>
            </div>
          </div>
        );
      })()}

      {/* DIM OVERLAY */}
      {stageIdx === 3 && !videoWatched && !levelUpStage && (
        <div style={{ position: "fixed", inset: 0, zIndex: 90, background: "rgba(0,0,0,0.65)", pointerEvents: "all", animation: "overlayFadeIn 0.6s ease-out" }} />
      )}

      {/* WATCH BUTTON */}
      {stageIdx === 3 && !showVideo && !videoWatched && !levelUpStage && activeAnimal.video && (
        <div style={{ position: "fixed", top: "50%", left: 0, right: 0, transform: "translateY(-50%)", zIndex: 200, textAlign: "center", pointerEvents: "none" }}>
          <div style={{ fontFamily: "Nunito,sans-serif", fontSize: "1.1rem", color: "#DAA520", marginBottom: "0.6rem", animation: "shimmer 1.5s ease-in-out infinite" }}>
            Watch first! · 先看影片！👇
          </div>
          <button onClick={() => { setShowVideo(true); if (audioRef.current) audioRef.current.volume = 0.02; }}
            style={{ pointerEvents: "all", padding: "1rem 2.5rem", background: "linear-gradient(135deg,#8B4513,#DAA520)", border: "3px solid rgba(218,165,32,0.9)", borderRadius: "999px", color: "white", fontFamily: "'Titan One',cursive", fontSize: "1.5rem", cursor: "pointer", animation: "watchPulse 1.2s ease-in-out infinite", display: "inline-block" }}>
            🎬 Watch {petName || activeAnimal.name}! · 看{petName || activeAnimal.nameZh}！
          </button>
        </div>
      )}

      {/* NAV */}
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, background: "rgba(30,15,5,0.82)", backdropFilter: "blur(14px)", padding: "0.55rem 1rem", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid rgba(218,165,32,0.2)" }}>
        <button onClick={() => navigate("/portal")} style={{ background: "rgba(218,165,32,0.18)", border: "1.5px solid rgba(218,165,32,0.4)", color: "#f5e6c8", fontFamily: "'Titan One',cursive", fontSize: "1rem", padding: "0.42rem 1.1rem", borderRadius: "999px", cursor: "pointer" }}>← Back · 返回</button>
        <span style={{ color: "#DAA520", fontFamily: "'Titan One',cursive", fontSize: "1.1rem", textShadow: "0 2px 8px rgba(218,165,32,0.4)" }}>🦕 My Paradise English</span>
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          {isMaster && <span style={{ background: "linear-gradient(135deg,#DAA520,#8B6914)", color: "#1a0a02", borderRadius: "999px", padding: "0.25rem 0.75rem", fontSize: "0.78rem", fontFamily: "'Titan One',cursive" }}>MASTER</span>}
          <button onClick={() => setShowSettings(s => !s)} style={{ background: "rgba(218,165,32,0.18)", border: "1.5px solid rgba(218,165,32,0.3)", color: "#f5e6c8", fontFamily: "'Titan One',cursive", fontSize: "0.95rem", padding: "0.35rem 0.9rem", borderRadius: "999px", cursor: "pointer" }}>Settings · 設定</button>
        </div>
      </nav>

      {/* SETTINGS */}
      {showSettings && (
        <div onClick={e => e.stopPropagation()} style={{ position: "fixed", top: 62, right: 14, zIndex: 200, background: "rgba(30,15,5,0.95)", backdropFilter: "blur(18px)", borderRadius: "1.4rem", padding: "1.25rem 1.5rem", minWidth: 240, border: "1.5px solid rgba(218,165,32,0.3)", animation: "popIn 0.25s ease-out", boxShadow: "0 8px 32px rgba(0,0,0,0.5)" }}>
          <div style={{ color: "#DAA520", fontFamily: "'Titan One',cursive", fontSize: "1.2rem", marginBottom: "1rem" }}>Settings · 設定</div>
          {[
            { label: "Music · 音樂", on: musicOn, toggle: () => setMusicOn(m => !m) },
            { label: "Sound Effects · 音效", on: sfxOn, toggle: () => setSfxOn(s => !s) },
          ].map((item, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.55rem 0", borderBottom: "1px solid rgba(218,165,32,0.15)" }}>
              <span style={{ color: "#f5e6c8", fontFamily: "'Titan One',cursive", fontSize: "1rem" }}>{item.label}</span>
              <button className="toggle-track" style={{ background: item.on ? "#556B2F" : "rgba(255,255,255,0.15)" }} onClick={item.toggle}>
                <div className="toggle-thumb" style={{ transform: item.on ? "translateX(22px)" : "translateX(0)" }} />
              </button>
            </div>
          ))}
          <div style={{ padding: "0.6rem 0" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.4rem" }}>
              <span style={{ color: "#f5e6c8", fontFamily: "'Titan One',cursive", fontSize: "1rem" }}>Volume · 音量</span>
              <span style={{ color: "rgba(245,230,200,0.6)", fontFamily: "Nunito,sans-serif", fontSize: "0.85rem" }}>{Math.round(volume * 100)}%</span>
            </div>
            <input type="range" min="0" max="1" step="0.05" value={volume} onChange={e => setVolume(parseFloat(e.target.value))} />
          </div>
        </div>
      )}

      {/* DAILY GIFT */}
      {showDailyGift && (
        <div style={{ position: "fixed", inset: 0, zIndex: 300, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
          <div style={{ background: "linear-gradient(135deg,#3d2b1f,#6b4a20)", borderRadius: "2rem", padding: "2.5rem 2rem", textAlign: "center", border: "2px solid rgba(218,165,32,0.5)", maxWidth: 340, width: "100%", animation: "popIn 0.4s ease-out", boxShadow: "0 20px 60px rgba(0,0,0,0.6)" }}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: "0.75rem", animation: "giftBounce 1s ease-in-out infinite" }}>
              <BoneCookie size={80} />
            </div>
            <div style={{ color: "#DAA520", fontFamily: "'Titan One',cursive", fontSize: "2rem", marginBottom: "0.25rem" }}>Daily Bone Cookie! 🦴</div>
            <div style={{ color: "rgba(245,230,200,0.75)", fontFamily: "Nunito,sans-serif", fontSize: "1rem", marginBottom: "0.25rem" }}>每日骨頭餅乾！</div>
            <div style={{ color: "rgba(245,230,200,0.8)", fontFamily: "Nunito,sans-serif", fontSize: "1.05rem", marginBottom: "1.5rem", lineHeight: 1.6 }}>
              {displayName} gets 1 bone cookie today! 🦴<br />
              <span style={{ fontFamily: "'Titan One',cursive", fontSize: "0.95rem" }}>{displayName}今天得到1個骨頭餅乾！</span><br />
              <span style={{ fontSize: "0.85rem", opacity: 0.65 }}>Come back tomorrow! · 明天再來！</span>
            </div>
            <button onClick={claimDailyGift} style={{ background: "linear-gradient(135deg,#DAA520,#8B4513)", border: "none", borderRadius: "999px", color: "white", fontFamily: "'Titan One',cursive", fontSize: "1.3rem", padding: "0.9rem 2.5rem", cursor: "pointer", boxShadow: "0 6px 24px rgba(218,165,32,0.5)" }}>
              Claim +1 Bone Cookie! · 領取！🦴
            </button>
          </div>
        </div>
      )}

      {/* MAIN CONTENT */}
      <div style={{ position: "relative", zIndex: 10, maxWidth: 520, margin: "0 auto", padding: "72px 14px 50px", filter: (stageIdx === 3 && !videoWatched && !levelUpStage) ? "blur(4px)" : "none", transition: "filter 0.3s ease" }}>

        {/* Title */}
        <div style={{ textAlign: "center", marginBottom: "1rem", animation: "fadeUp 0.5s ease-out" }}>
          <div style={{ fontFamily: "'Titan One',cursive", fontSize: "clamp(2rem,6vw,3rem)", color: "#DAA520", textShadow: "0 3px 14px rgba(0,0,0,0.8), 0 0 30px rgba(218,165,32,0.4)", lineHeight: 1.1 }}>
            {displayName}'s Dinosaur World!
          </div>
          <div style={{ display: "inline-block", marginTop: "0.6rem", background: "linear-gradient(135deg,#8B4513,#6b3410)", color: "#f5e6c8", borderRadius: "999px", padding: "0.38rem 1.4rem", fontSize: "1.1rem", fontFamily: "'Titan One',cursive", boxShadow: "0 4px 16px rgba(0,0,0,0.4)", border: "1px solid rgba(218,165,32,0.4)" }}>
            {stage.name} Stage · {stage.nameZh}
          </div>
        </div>

        {/* CREATURE CARD */}
        <div className={`glass ${isMaster ? "gold-border" : ""}`}
          style={{ padding: "1.75rem 1.25rem 1.5rem", marginBottom: "1rem", textAlign: "center", animation: "fadeUp 0.6s ease-out", boxShadow: "0 8px 40px rgba(0,0,0,0.4)", position: "relative", overflow: "visible" }}>

          {justEarned > 0 && (
            <div style={{ position: "absolute", top: 14, right: 14, background: "rgba(218,165,32,0.95)", borderRadius: "999px", padding: "0.3rem 0.9rem", color: "#1a0a02", fontFamily: "'Titan One',cursive", fontSize: "1rem", animation: "earnedPop 2s ease-out forwards", zIndex: 20 }}>
              +{justEarned} treat!
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", position: "relative", zIndex: 20 }}>
            {petName ? <StoneNameTag name={petName} onRename={() => setIsRenaming(true)} /> : <div style={{ height: 8 }} />}
            <PetNamingInput petName={petName} onSave={(n) => { savePetName(n); setIsRenaming(false); }} isRenaming={isRenaming} onCancelRename={() => setIsRenaming(false)} />
          </div>

          {nearHatch && !eggWiggle && (
            <div style={{ background: "rgba(61,43,31,0.95)", borderRadius: "1.2rem", padding: "0.7rem 1.1rem", margin: "0 auto 0.6rem", maxWidth: 260, fontFamily: "Nunito,sans-serif", fontSize: "1rem", color: "#f5e6c8", lineHeight: 1.5, boxShadow: "0 4px 12px rgba(0,0,0,0.3)", position: "relative", border: "1px solid rgba(218,165,32,0.3)" }}>
              I'm almost ready! 🥚<br />
              <span style={{ fontSize: "0.9rem", color: "rgba(245,230,200,0.7)" }}>我快出來了！再給我幾個骨頭！</span>
              <div style={{ position: "absolute", bottom: -8, left: "50%", transform: "translateX(-50%)", width: 0, height: 0, borderLeft: "8px solid transparent", borderRight: "8px solid transparent", borderTop: "8px solid rgba(61,43,31,0.95)" }} />
            </div>
          )}

          <div ref={creatureRef} style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", cursor: "pointer", pointerEvents: "none" }}>
            {hearts.map(h => (
              <div key={h.id} style={{ position: "absolute", left: h.x, top: h.y, pointerEvents: "none", animation: `heartFloat 1.4s ease-out ${h.delay}s forwards`, opacity: 0, zIndex: 50 }}>
                <svg width="22" height="20" viewBox="0 0 24 22">
                  <path d="M12 20.5C12 20.5 2 13.5 2 7C2 4.2 4.2 2 7 2C9.1 2 10.9 3.2 12 5C13.1 3.2 14.9 2 17 2C19.8 2 22 4.2 22 7C22 13.5 12 20.5 12 20.5Z" fill="#DAA520" stroke="#b8860b" strokeWidth="1" />
                </svg>
              </div>
            ))}
            <div
              className={isEgg ? (eggWiggle ? "egg-wiggle" : nearHatch ? "egg-near" : "egg-idle") : (petted ? "petted" : "bob")}
              onClick={isEgg ? handleEggTap : handlePet}
              style={{ width: "min(250px,65vw)", height: "min(210px,55vw)", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", transition: "filter 0.5s ease", pointerEvents: "auto" }}>
              {isEgg && <EggCracks treats={fedTreats} />}
              <img src={creatureImg} alt={stage.name} style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain", filter: "drop-shadow(0 8px 20px rgba(0,0,0,0.5))", transform: activeAnimal.scale && activeAnimal.scale !== 1 && stageIdx > 0 ? `scale(${activeAnimal.scale})` : "none", transformOrigin: "center center" }} draggable={false} />
            </div>

            {isEgg && !nearHatch && (
              <div style={{ color: "rgba(245,230,200,0.85)", fontFamily: "Nunito,sans-serif", fontSize: "1rem", marginTop: "0.4rem", animation: "shimmer 2.2s ease-in-out infinite", textAlign: "center" }}>
                Tap me & say hello! 👆 · 點我打招呼！👆
              </div>
            )}
            {nearHatch && (
              <div style={{ color: "#DAA520", fontFamily: "'Titan One',cursive", fontSize: "1.05rem", marginTop: "0.4rem", animation: "shimmer 1s ease-in-out infinite", textAlign: "center" }}>
                Almost hatching! ✨ · 快出殼了！✨
              </div>
            )}
            {!isEgg && (
              <div style={{ color: "rgba(245,230,200,0.85)", fontFamily: "Nunito,sans-serif", fontSize: "1rem", marginTop: "0.4rem", animation: "shimmer 2.2s ease-in-out infinite", textAlign: "center" }}>
                Pet me to make me happy! · 摸摸我讓我開心！
              </div>
            )}
          </div>

          <div style={{ color: "#f5e6c8", fontFamily: "'Titan One',cursive", fontSize: "1.4rem", marginTop: "0.6rem", textShadow: "0 2px 8px rgba(0,0,0,0.6)" }}>
            {stage.name} {activeAnimal.name}{isMaster ? " (Master)" : ""}
          </div>

          {nextStage && (
            <div style={{ marginTop: "1.1rem", padding: "0 0.5rem" }}>
              <div style={{ position: "relative", height: 30, background: "rgba(0,0,0,0.35)", borderRadius: "999px", border: "2.5px solid rgba(218,165,32,0.25)", overflow: "visible", marginBottom: "0.75rem" }}>
                <div style={{ width: `${progress}%`, height: "100%", borderRadius: "999px", background: "linear-gradient(to right,#DAA520,#8B4513)", transition: "width 1s cubic-bezier(0.34,1.56,0.64,1)", boxShadow: "0 0 12px rgba(218,165,32,0.7)", minWidth: progress > 0 ? "28px" : "0", position: "relative" }}>
                  {progress > 0 && (
                    <div style={{ position: "absolute", right: -14, top: "50%", transform: "translateY(-50%)", fontSize: "1.4rem", filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.4))" }}>🦴</div>
                  )}
                </div>
              </div>
              <div style={{ textAlign: "center", fontFamily: "'Titan One',cursive", fontSize: "1.1rem", color: "#DAA520", textShadow: "0 2px 6px rgba(0,0,0,0.5)", animation: "shimmer 2s ease-in-out infinite" }}>
                {nextStage.min - fedTreats} more bone cookies to {nextStage.name}!<br />
                <span style={{ fontFamily: "Nunito,sans-serif", fontSize: "1rem", opacity: 0.85 }}>還需要 {nextStage.min - fedTreats} 個骨頭餅乾才能變成{nextStage.nameZh}！</span>
              </div>
            </div>
          )}
          {!nextStage && (
            <div style={{ color: "#DAA520", fontFamily: "'Titan One',cursive", fontSize: "1.2rem", marginTop: "0.75rem", textShadow: "0 2px 8px rgba(0,0,0,0.5)" }}>
              {petName ? `${petName} is all grown up!` : `Your ${activeAnimal.name} is all grown up!`}<br />
              <span style={{ fontFamily: "Nunito,sans-serif", fontSize: "1rem", opacity: 0.85 }}>你的{activeAnimal.nameZh}長大了！</span>
            </div>
          )}
        </div>

        {/* FLOATING BONES */}
        {feedingBones.map(c => (
          <div key={c.id} style={{ position: "fixed", left: c.x, top: c.y, zIndex: 400, pointerEvents: "none", animation: "cookieFloat 1s ease-out forwards" }}>
            <BoneCookie size={32} />
          </div>
        ))}

        {/* FEED BUTTON */}
        {!isMaster && (nextStage ? (jarTreats > 0 && (
          <button onClick={handleFeed} style={{ width: "100%", padding: "1.1rem", marginBottom: "1rem", background: "linear-gradient(135deg,#DAA520,#8B4513)", border: "none", borderRadius: "999px", color: "white", fontFamily: "'Titan One',cursive", fontSize: "1.3rem", cursor: "pointer", boxShadow: "0 6px 24px rgba(218,165,32,0.5)", animation: "eF 2s ease-in-out infinite" }}>
            Feed {activeAnimal.nameZh}! ({jarTreats} bone cookie{jarTreats !== 1 ? "s" : ""} ready) 🦴<br />
            <span style={{ fontFamily: "Nunito,sans-serif", fontSize: "1rem", opacity: 0.9 }}>餵{activeAnimal.nameZh}！（{jarTreats}個骨頭餅乾準備好了）</span>
          </button>
        )) : (
          <button onClick={() => playSfx("stomp")} style={{ width: "100%", padding: "1.1rem", marginBottom: "1rem", background: "linear-gradient(135deg,#556B2F,#3d5c1a)", border: "none", borderRadius: "999px", color: "white", fontFamily: "'Titan One',cursive", fontSize: "1.3rem", cursor: "pointer", boxShadow: "0 6px 24px rgba(85,107,47,0.5)", animation: "eF 2s ease-in-out infinite" }}>
            I'm Full! 🦖 · 吃飽了！
          </button>
        ))}

        {/* TREAT JAR */}
        <div className="glass" style={{ padding: "1.5rem", marginBottom: "1rem", animation: "fadeUp 0.7s ease-out" }}>
          <div style={{ color: "#f5e6c8", fontFamily: "'Titan One',cursive", fontSize: "1.15rem", textAlign: "center", marginBottom: "0.85rem" }}>
            {petName ? `${petName} loves bone cookies! ` : `Feed your ${activeAnimal.name} Bone Cookies! `}🦴<br />
            <span style={{ fontFamily: "Nunito,sans-serif", fontSize: "1rem", opacity: 0.8 }}>餵你的{activeAnimal.nameZh}骨頭餅乾！每次餵食讓牠更快長大！</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "2rem" }}>
            <TreatJar treats={jarTreats} nextStage={nextStage} />
            <div style={{ textAlign: "center" }}>
              <div style={{ color: "#f5e6c8", fontFamily: "'Titan One',cursive", fontSize: "2.8rem", lineHeight: 1 }}>
                {stageIdx + 1}<span style={{ fontSize: "1.3rem", opacity: 0.6 }}>/4</span>
              </div>
              <div style={{ color: "rgba(245,230,200,0.7)", fontFamily: "Nunito,sans-serif", fontSize: "0.95rem" }}>
                stages done · 已完成階段
              </div>
              <div style={{ marginTop: "0.75rem", display: "flex", alignItems: "center", gap: "0.4rem", justifyContent: "center" }}>
                <BoneCookie size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* MASTER CONTROLS */}
        {isMaster && (
          <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1rem" }}>
            <button onClick={() => { setJarTreats(j => j + 1); playSfx("treat"); }} style={{ flex: 1, padding: "0.9rem", background: "linear-gradient(135deg,#556B2F,#3d5c1a)", border: "none", borderRadius: "999px", color: "white", fontFamily: "'Titan One',cursive", fontSize: "0.95rem", cursor: "pointer" }}>
              Add Cookie +1
            </button>
            <button onClick={() => { setFedTreatsState({}); setJarTreats(99); setActiveAnimalId("triceratops"); setVideoWatchedMap({}); setUnlockSeenMap({}); localStorage.clear(); ANIMALS.forEach(a => { levelUpFiredRef.current[a.id] = new Set(); }); playSfx("stomp"); }} style={{ flex: 1, padding: "0.9rem", background: "linear-gradient(135deg,#b91c1c,#7f1d1d)", border: "none", borderRadius: "999px", color: "white", fontFamily: "'Titan One',cursive", fontSize: "0.95rem", cursor: "pointer" }}>
              🥚 Reset
            </button>
            <button onClick={handleFeed} disabled={jarTreats <= 0} style={{ flex: 1, padding: "0.9rem", background: jarTreats > 0 ? "linear-gradient(135deg,#DAA520,#8B4513)" : "rgba(255,255,255,0.1)", border: "none", borderRadius: "999px", color: "white", fontFamily: "'Titan One',cursive", fontSize: "0.95rem", cursor: jarTreats > 0 ? "pointer" : "not-allowed" }}>
              Feed {activeAnimal.nameZh}
            </button>
          </div>
        )}

        {/* EARN */}
        <div className="glass" style={{ padding: "1.5rem", marginBottom: "1rem", animation: "fadeUp 0.8s ease-out" }}>
          <div style={{ color: "#f5e6c8", fontFamily: "'Titan One',cursive", fontSize: "1.4rem", marginBottom: "1rem", textAlign: "center" }}>
            Earn Bone Cookies! 🦴<br />
            <span style={{ fontFamily: "Nunito,sans-serif", fontSize: "1rem", opacity: 0.8 }}>賺骨頭餅乾！完成挑戰得到獎勵！</span>
          </div>
          <EarnButtons navigate={navigate} code={code ?? ""} studentName={studentName ?? ""} activeAnimal={activeAnimal} />
        </div>

        {/* COLLECTION */}
        <div className="glass" style={{ padding: "1.5rem", animation: "fadeUp 0.9s ease-out" }}>
          <div style={{ color: "#f5e6c8", fontFamily: "'Titan One',cursive", fontSize: "1.4rem", marginBottom: "1rem", textAlign: "center" }}>
            Dino Collection 🦕<br />
            <span style={{ fontFamily: "Nunito,sans-serif", fontSize: "1rem", opacity: 0.8 }}>恐龍收藏！收集所有恐龍！</span>
          </div>
          {/* Arrow for new unlock */}
          {(() => {
            const showPtero = (fedTreatsState["triceratops"] ?? 0) >= 45 && (videoWatchedMap["triceratops"] ?? false) && !unlockSeenMap["pterodactyl"];
            const showRaptor = (fedTreatsState["pterodactyl"] ?? 0) >= 45 && (videoWatchedMap["pterodactyl"] ?? false) && (unlockSeenMap["pterodactyl"] ?? false) && !unlockSeenMap["raptor"];
            if (!showPtero && !showRaptor) return null;
            const leftPct = showPtero ? "50%" : "83.3%";
            return (
              <div style={{ position: "relative", height: "80px", marginBottom: "0.75rem" }}>
                <div style={{ position: "absolute", left: leftPct, transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <div style={{ fontFamily: "'Titan One',cursive", fontSize: "0.95rem", color: "#DAA520", textAlign: "center", marginBottom: "0.3rem", animation: "shimmer 1s ease-in-out infinite", whiteSpace: "nowrap" }}>
                    ✨ New dino unlocked!<br /><span style={{ fontFamily: "Noto Sans TC,sans-serif", fontSize: "0.85rem" }}>你解鎖了新恐龍！</span>
                  </div>
                  <div style={{ animation: "arrowWiggle 0.7s ease-in-out infinite" }}>
                    <svg width="40" height="36" viewBox="0 0 40 40" style={{ filter: "drop-shadow(0 0 10px rgba(218,165,32,1))" }}>
                      <path d="M20 4 L20 28 M20 28 L10 18 M20 28 L30 18" stroke="#DAA520" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                    </svg>
                  </div>
                </div>
              </div>
            );
          })()}
          <div ref={collectionRef}>
            <DinoCollection fedTreatsMap={fedTreatsState} videoWatchedMap={videoWatchedMap} unlockSeenMap={unlockSeenMap} onAnimalClick={(id) => {
              setShowUnlockFor(id);
              if (audioRef.current) audioRef.current.volume = 0.02;
              if (!lullabyRef.current) lullabyRef.current = new Audio("/lullaby-music.mp3");
              lullabyRef.current.currentTime = 0;
              lullabyRef.current.volume = 0.4;
              lullabyRef.current.play().catch(() => { });
              lullabyRef.current.onended = () => { if (audioRef.current) audioRef.current.volume = volume * 0.5; };
            }} />
          </div>
          <div style={{ color: "rgba(245,230,200,0.45)", fontFamily: "Nunito,sans-serif", fontSize: "0.9rem", marginTop: "0.85rem", textAlign: "center" }}>
            More dinos unlocking soon! · 更多恐龍即將解鎖！
          </div>
        </div>
      </div>

      {/* VIDEO PLAYER */}
      {showVideo && activeAnimal.video && (
        <div style={{ position: "fixed", inset: 0, zIndex: 999, background: "rgba(10,5,0,0.88)", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem", opacity: videoFadingOut ? 0 : 1, transition: "opacity 0.4s ease-out" }}>
          <div onClick={e => e.stopPropagation()} style={{ position: "relative", maxWidth: 420, width: "100%" }}>
            <video autoPlay loop controls
              onTimeUpdate={(e) => { if (!videoWatched && (e.target as HTMLVideoElement).currentTime >= 1) { localStorage.setItem(`mpe_dino_videowatched_${activeAnimalId}_${code}_${studentName}`, "1"); setVideoWatchedMap(m => ({ ...m, [activeAnimalId]: true })); } }}
              style={{ width: "100%", borderRadius: "1rem", border: "4px solid rgba(218,165,32,0.8)", boxShadow: "0 0 40px rgba(218,165,32,0.4)", display: "block", position: "relative", zIndex: 1 }}
              src={activeAnimal.video} />
            <button onClick={closeVideo} style={{ position: "absolute", top: -16, right: -16, zIndex: 3, background: "#8B4513", border: "2px solid #DAA520", borderRadius: "50%", width: 36, height: 36, color: "white", fontSize: "1.1rem", cursor: "pointer", fontWeight: 900 }}>✕</button>
          </div>
        </div>
      )}

      {showSettings && <div style={{ position: "fixed", inset: 0, zIndex: 150 }} onClick={() => setShowSettings(false)} />}
    </div>
  );
};

export default DinosaurWorld;
