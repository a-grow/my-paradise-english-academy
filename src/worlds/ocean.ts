// OCEAN WORLD animals (order = unlock order). Moved unchanged from KidsWorld.tsx (world template step 1).
import type { Animal } from "./types";

export const OCEAN_ANIMALS: Animal[] = [
  {
    id: "turtle", name: "Sea Turtle", nameZh: "海龜", emoji: "🐢",
    stages: [
      { name: "Egg",   nameZh: "蛋",      min: 0,  img: "/creatures/turtle-egg.webp" },
      { name: "Baby",  nameZh: "小海龜",   min: 15, img: "/creatures/turtle-baby.webp" },
      { name: "Young", nameZh: "少年海龜", min: 30, img: "/creatures/turtle-young.webp" },
      { name: "Grown", nameZh: "成年海龜", min: 45, img: "/creatures/turtle-grown.webp" },
    ],
    unlockCondition: "default",
    collectionBg: "#0891b2", collectionBorder: "rgba(255,215,0,0.6)", collectionGlow: "rgba(255,215,0,0.35)",
    video: "/video_adult_turtle.mp4", isEggType: true, scale: 1,
    accentColor: "#f97316", accentGlow: "rgba(249,115,22,0.5)",
    btnColor: "#f97316", btnGlow: "rgba(249,115,22,0.5)", btn3Color: "#10b981", btn3Glow: "rgba(16,185,129,0.5)",
    feedLabel: "turtle", feedLabelZh: "海龜",
    levelUpMessages: [
      { main: "Welcome Home!",          zh: "歡迎回家！",           sub: "Meet your Baby Sea Turtle!",     subZh: "快來認識你的小海龜！" },
      { main: "Look how you've grown!", zh: "你長大了！",           sub: "Now a Young Sea Turtle!",        subZh: "現在是少年海龜了！" },
      { main: "Fully grown! Amazing!",  zh: "完全長大了！太棒了！", sub: "You raised a Grown Sea Turtle!", subZh: "你養大了一隻成年海龜！" },
    ],
    unlockOverlay: { emoji: "🐢", title: "Sea Turtle!", titleZh: "海龜！", eggLine: "A Sea Turtle appeared!", eggLineZh: "海龜出現了！", feedLine: "Feed it treats to help it grow!", feedLineZh: "餵他點心讓他長大！", btnText: "Let's go! · 出發！🎉", glowColor: "rgba(255,215,0,0.6)", borderColor: "rgba(255,215,0,0.7)", bgGradient: "linear-gradient(135deg,#0c3460,#1a6e8a)" },
  },
  {
    id: "dolphin", name: "Dolphin", nameZh: "海豚", emoji: "🐬",
    stages: [
      { name: "Blanket", nameZh: "小毯子",     min: 0,  img: "/creatures/dolphin-blanket.webp" },
      { name: "Young", nameZh: "少年海豚", min: 15, img: "/creatures/dolphin-baby.webp" },
      { name: "Teen",  nameZh: "少年海豚", min: 30, img: "/creatures/dolphin-young.webp" },
      { name: "Grown", nameZh: "成年海豚", min: 45, img: "/creatures/dolphin-grown.webp" },
    ],
    unlockCondition: "turtle_grown_video_watched",
    collectionBg: "#0077b6", collectionBorder: "rgba(100,200,255,0.7)", collectionGlow: "rgba(100,200,255,0.4)",
    video: "/video_adult_dolphin.mp4", isEggType: false, scale: 1.6,
    accentColor: "#f472b6", accentGlow: "rgba(244,114,182,0.5)",
    btnColor: "#22d3ee", btnGlow: "rgba(34,211,238,0.5)", btn3Color: "#f472b6", btn3Glow: "rgba(244,114,182,0.5)",
    feedLabel: "dolphin", feedLabelZh: "海豚",
    levelUpMessages: [
      { main: "Welcome Home!",          zh: "歡迎回家！",           sub: "Meet your Baby Dolphin!",     subZh: "快來認識你的小海豚！" },
      { main: "Look how you've grown!", zh: "你長大了！",           sub: "Now a Young Dolphin!",        subZh: "現在是少年海豚了！" },
      { main: "Fully grown! Amazing!",  zh: "完全長大了！太棒了！", sub: "You raised a Grown Dolphin!", subZh: "你養大了一隻成年海豚！" },
    ],
    unlockOverlay: { emoji: "🐬", title: "New Friend!", titleZh: "新朋友來了！", eggLine: "A Dolphin appeared!", eggLineZh: "海豚出現了！", feedLine: "Feed it treats to help it grow!", feedLineZh: "餵他點心讓他長大！", btnText: "So cool! · 太酷了！🎉", glowColor: "rgba(100,200,255,0.6)", borderColor: "rgba(100,200,255,0.7)", bgGradient: "linear-gradient(135deg,#003d7a,#0077b6,#00b4d8)" },
  },
  // ── ADD NEW ANIMALS HERE — one object = one new animal (octopus before shark) ───
  {
    id: "octopus", name: "Octopus", nameZh: "章魚", emoji: "🐙",
    stages: [
      { name: "Egg",   nameZh: "",   min: 0,  img: "/creatures/octopus-egg.webp" },
      { name: "Baby",  nameZh: "小章魚",   min: 15, img: "/creatures/octopus-egg-baby.webp" },
      { name: "Young", nameZh: "少年章魚", min: 30, img: "/creatures/octopus-young.webp" },
      { name: "Grown", nameZh: "成年章魚", min: 45, img: "/creatures/octopus-grown.webp" },
    ],
    unlockCondition: "dolphin_grown_video_watched",
    collectionBg: "#581c87", collectionBorder: "rgba(216,180,254,0.7)", collectionGlow: "rgba(168,85,247,0.5)",
    video: "/video-adult-octopus.mp4", isEggType: true, scale: 1.4,
    accentColor: "#e879f9", accentGlow: "rgba(232,121,249,0.5)",
    btnColor: "#a855f7", btnGlow: "rgba(168,85,247,0.5)", btn3Color: "#e879f9", btn3Glow: "rgba(232,121,249,0.5)",
    feedLabel: "octopus", feedLabelZh: "章魚",
    levelUpMessages: [
      { main: "Hello little one!",       zh: "你好小寶貝！",         sub: "A Baby Octopus appeared!",       subZh: "小章魚出現了！" },
      { main: "Growing so fast!",        zh: "長得好快！",           sub: "Now a Young Octopus!",           subZh: "現在是少年章魚了！" },
      { main: "Magnificent! Amazing!",   zh: "太壯觀了！太棒了！",   sub: "You raised a Grown Octopus!",    subZh: "你養大了一隻成年章魚！" },
    ],
    unlockOverlay: { emoji: "🐙", title: "New Friend!", titleZh: "新朋友來了！", eggLine: "An Octopus Egg appeared!", eggLineZh: "出現了一顆章魚蛋！", feedLine: "Feed it treats to help it grow!", feedLineZh: "餵他點心讓他長大！", btnText: "So cool! · 太酷了！🎉", glowColor: "rgba(168,85,247,0.6)", borderColor: "rgba(216,180,254,0.7)", bgGradient: "linear-gradient(135deg,#2e1065,#581c87,#7e22ce)" },
  },
  {
    id: "shark", name: "Great White Shark", nameZh: "大白鯊", emoji: "🦈",
    stages: [
      { name: "Blanket", nameZh: "小毯子",     min: 0,  img: "/creatures/shark-blanket.webp" },
      { name: "Baby",  nameZh: "小鯊魚",   min: 15, img: "/creatures/shark-baby.webp" },
      { name: "Young", nameZh: "少年鯊魚", min: 30, img: "/creatures/shark-young.webp" },
      { name: "Grown", nameZh: "成年鯊魚", min: 45, img: "/creatures/shark-grown.webp" },
    ],
    unlockCondition: "octopus_grown_video_watched",
    collectionBg: "#1e3a5f", collectionBorder: "rgba(200,220,255,0.7)", collectionGlow: "rgba(96,165,250,0.4)",
    video: "/video_adult_shark.mp4", isEggType: false, scale: 1.6,
    accentColor: "#60a5fa", accentGlow: "rgba(96,165,250,0.5)",
    btnColor: "#60a5fa", btnGlow: "rgba(96,165,250,0.5)", btn3Color: "#3b82f6", btn3Glow: "rgba(59,130,246,0.5)",
    feedLabel: "shark", feedLabelZh: "鯊魚",
    levelUpMessages: [
      { main: "Hello little one!",      zh: "你好小寶貝！",       sub: "A Baby Shark appeared!",        subZh: "小鯊魚出現了！" },
      { main: "Growing so fast!",       zh: "長得好快！",         sub: "Now a Young Shark!",            subZh: "現在是少年鯊魚了！" },
      { main: "Magnificent! Amazing!",  zh: "太壯觀了！太棒了！", sub: "You raised a Grown Shark!",     subZh: "你養大了一隻成年鯊魚！" },
    ],
    unlockOverlay: { emoji: "🦈", title: "New Friend!", titleZh: "新朋友來了！", eggLine: "A Shark Egg appeared!", eggLineZh: "出現了一顆鯊魚蛋！", feedLine: "Feed it treats to help it grow!", feedLineZh: "餵他點心讓他長大！", btnText: "So cool! · 太酷了！🎉", glowColor: "rgba(96,165,250,0.6)", borderColor: "rgba(200,220,255,0.7)", bgGradient: "linear-gradient(135deg,#0f2744,#1e3a5f,#2d5a8e)" },
  },
  {
    id: "clownfish", name: "Clownfish", nameZh: "小丑魚", emoji: "🐠",
    stages: [
      { name: "Egg",   nameZh: "",     min: 0,  img: "/creatures/clownfish-egg.webp" },
      { name: "Baby",  nameZh: "小小丑魚", min: 15, img: "/creatures/clownfish-baby.webp" },
      { name: "Young", nameZh: "少年小丑魚", min: 30, img: "/creatures/clownfish-young.webp" },
      { name: "Grown", nameZh: "成年小丑魚", min: 45, img: "/creatures/clownfish-grown.webp" },
    ],
    unlockCondition: "shark_grown_video_watched",
    collectionBg: "#c2410c", collectionBorder: "rgba(251,146,60,0.7)", collectionGlow: "rgba(249,115,22,0.45)",
    video: "/video_adult_clownfish.mp4", isEggType: true, scale: 1.0,
    accentColor: "#fb923c", accentGlow: "rgba(251,146,60,0.5)",
    btnColor: "#ea580c", btnGlow: "rgba(234,88,12,0.5)", btn3Color: "#f97316", btn3Glow: "rgba(249,115,22,0.5)",
    feedLabel: "clownfish", feedLabelZh: "小丑魚",
    levelUpMessages: [
      { main: "Hello little one!",      zh: "你好小寶貝！",         sub: "A Baby Clownfish appeared!",      subZh: "小小丑魚出現了！" },
      { main: "Growing so fast!",       zh: "長得好快！",           sub: "Now a Young Clownfish!",          subZh: "現在是少年小丑魚了！" },
      { main: "Magnificent! Amazing!",  zh: "太壯觀了！太棒了！",   sub: "You raised a Grown Clownfish!",   subZh: "你養大了一隻成年小丑魚！" },
    ],
    unlockOverlay: { emoji: "🐠", title: "New Friend!", titleZh: "新朋友來了！", eggLine: "A Clownfish Egg appeared!", eggLineZh: "出現了一顆小丑魚蛋！", feedLine: "Feed it treats to help it grow!", feedLineZh: "餵他點心讓他長大！", btnText: "So cool! · 太酷了！🎉", glowColor: "rgba(249,115,22,0.6)", borderColor: "rgba(251,146,60,0.7)", bgGradient: "linear-gradient(135deg,#7c1d0c,#c2410c,#ea580c)" },
  },
  {
    id: "mantaray", name: "Manta Ray", nameZh: "魟魚", emoji: "🐟",
    stages: [
      { name: "Blanket", nameZh: "小毯子",       min: 0,  img: "/creatures/mantaray-blanket.webp" },
      { name: "Baby",    nameZh: "小魟魚",     min: 15, img: "/creatures/mantaray-baby.webp" },
      { name: "Young",   nameZh: "少年魟魚",   min: 30, img: "/creatures/mantaray-young.webp" },
      { name: "Grown",   nameZh: "成年魟魚",   min: 45, img: "/creatures/mantaray-grown.webp" },
    ],
    unlockCondition: "clownfish_grown_video_watched",
    collectionBg: "#1e3a8a", collectionBorder: "rgba(147,197,253,0.7)", collectionGlow: "rgba(96,165,250,0.45)",
    video: "/video_adult_mantaray.mp4", isEggType: false, scale: 1.6,
    accentColor: "#818cf8", accentGlow: "rgba(129,140,248,0.5)",
    btnColor: "#3b82f6", btnGlow: "rgba(59,130,246,0.5)", btn3Color: "#818cf8", btn3Glow: "rgba(129,140,248,0.5)",
    feedLabel: "mantaray", feedLabelZh: "魟魚",
    levelUpMessages: [
      { main: "Hello little one!",      zh: "你好小寶貝！",         sub: "A Baby Manta Ray appeared!",      subZh: "小魟魚出現了！" },
      { main: "Growing so fast!",       zh: "長得好快！",           sub: "Now a Young Manta Ray!",          subZh: "現在是少年魟魚了！" },
      { main: "Magnificent! Amazing!",  zh: "太壯觀了！太棒了！",   sub: "You raised a Grown Manta Ray!",   subZh: "你養大了一隻成年魟魚！" },
    ],
    unlockOverlay: { emoji: "🐟", title: "New Friend!", titleZh: "新朋友來了！", eggLine: "A Manta Ray appeared!", eggLineZh: "魟魚出現了！", feedLine: "Feed it treats to help it grow!", feedLineZh: "餵他點心讓他長大！", btnText: "So cool! · 太酷了！🎉", glowColor: "rgba(96,165,250,0.6)", borderColor: "rgba(147,197,253,0.7)", bgGradient: "linear-gradient(135deg,#0f172a,#1e3a8a,#2563eb)" },
  },
];

// locked placeholder slots (fills collection grid to 6 total)
export const OCEAN_LOCKED_SLOTS = [
  { collectionBg: "#7c3aed", collectionBorder: "rgba(167,139,250,0.5)", collectionGlow: "rgba(124,58,237,0.25)" },
  { collectionBg: "#0d9488", collectionBorder: "rgba(94,234,212,0.5)",  collectionGlow: "rgba(13,148,136,0.25)" },
  { collectionBg: "#b45309", collectionBorder: "rgba(251,191,36,0.5)",  collectionGlow: "rgba(180,83,9,0.25)"  },
  { collectionBg: "#be185d", collectionBorder: "rgba(249,168,212,0.5)", collectionGlow: "rgba(190,24,93,0.25)" },
];
