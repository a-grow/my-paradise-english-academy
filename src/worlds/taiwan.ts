// TAIWAN WORLD (World 5) animals, order = unlock order (Andy 2026-10-08). Black bear = LAST animal (finishes the world;
// must go into the database lock list BEFORE kids can finish it). English only (no Chinese).
// STAGE PRICES (Andy 2026-10-08): treats per stage mikado pheasant 25, leopard cat 30, pangolin 30, macaque 35, sika deer 35,
// black bear 40 (stage mins 0, p, 2p, 3p). Black bear grown = 120 = the database lock's 'taiwan finished' number - change BOTH together.
// Videos: all 6 from Andy 2026-10-09 (public/worlds/taiwan/<id>-video.mp4; originals BACKUPFILES/world5_art/originals).
// Pictures: public/worlds/taiwan/<id>-<egg|baby|young|grown>(-t).webp, cut 2026-10-08 from Andy's Gemini sprite sheets
// (BACKUPFILES/world3_art/tools/cut_taiwan.py + contacts_taiwan.json; originals BACKUPFILES/world5_art/originals).
import type { Animal } from "./types";

const P = "/worlds/taiwan";
const FOREST = { collectionBg: "#3f7d4f", collectionBorder: "rgba(205,240,190,0.8)", collectionGlow: "rgba(205,240,190,0.4)",
  accentColor: "#22c55e", accentGlow: "rgba(34,197,94,0.5)", btnColor: "#22c55e", btnGlow: "rgba(34,197,94,0.5)",
  btn3Color: "#f59e0b", btn3Glow: "rgba(245,158,11,0.5)" };

export const TAIWAN_ANIMALS: Animal[] = [
  {
    id: "mikadopheasant", name: "Mikado Pheasant", nameZh: "", emoji: "",
    stages: [
      { name: "Egg", nameZh: "", min: 0, img: `${P}/mikadopheasant-egg.webp` },
      { name: "Baby", nameZh: "", min: 25, img: `${P}/mikadopheasant-baby.webp` },
      { name: "Young", nameZh: "", min: 50, img: `${P}/mikadopheasant-young.webp` },
      { name: "Grown", nameZh: "", min: 75, img: `${P}/mikadopheasant-grown.webp` },
    ],
    unlockCondition: "default",
    ...FOREST, video: `${P}/mikadopheasant-video.mp4`, isEggType: true, scale: 1,
    feedLabel: "mikado pheasant", feedLabelZh: "",
    levelUpMessages: [
      { main: "Welcome, little one!", zh: "", sub: "Meet your Baby Mikado Pheasant!", subZh: "" },
      { main: "Look how you've grown!", zh: "", sub: "Now a Young Mikado Pheasant!", subZh: "" },
      { main: "Fully grown! Amazing!", zh: "", sub: "You raised a Grown Mikado Pheasant!", subZh: "" },
    ],
    unlockOverlay: { emoji: "", title: "Mikado Pheasant!", titleZh: "", eggLine: "A Mikado Pheasant Egg appeared!", eggLineZh: "", feedLine: "Feed it treats to help it grow!", feedLineZh: "", btnText: "Let's go!", glowColor: "rgba(34,197,94,0.6)", borderColor: "rgba(34,197,94,0.8)", bgGradient: "linear-gradient(135deg,#14532d,#3f7d4f)" },
  },
  {
    id: "leopardcat", name: "Leopard Cat", nameZh: "", emoji: "",
    stages: [
      { name: "Blanket", nameZh: "", min: 0, img: `${P}/leopardcat-egg.webp` },
      { name: "Baby", nameZh: "", min: 30, img: `${P}/leopardcat-baby.webp` },
      { name: "Young", nameZh: "", min: 60, img: `${P}/leopardcat-young.webp` },
      { name: "Grown", nameZh: "", min: 90, img: `${P}/leopardcat-grown.webp` },
    ],
    unlockCondition: "mikadopheasant_grown_video_watched",
    ...FOREST, video: `${P}/leopardcat-video.mp4`, isEggType: false, scale: 1,
    feedLabel: "leopard cat", feedLabelZh: "",
    levelUpMessages: [
      { main: "Welcome, little one!", zh: "", sub: "Meet your Baby Leopard Cat!", subZh: "" },
      { main: "Look how you've grown!", zh: "", sub: "Now a Young Leopard Cat!", subZh: "" },
      { main: "Fully grown! Amazing!", zh: "", sub: "You raised a Grown Leopard Cat!", subZh: "" },
    ],
    unlockOverlay: { emoji: "", title: "Leopard Cat!", titleZh: "", eggLine: "A Leopard Cat baby appeared!", eggLineZh: "", feedLine: "Feed it treats to help it grow!", feedLineZh: "", btnText: "Let's go!", glowColor: "rgba(34,197,94,0.6)", borderColor: "rgba(34,197,94,0.8)", bgGradient: "linear-gradient(135deg,#14532d,#3f7d4f)" },
  },
  {
    id: "pangolin", name: "Pangolin", nameZh: "", emoji: "",
    stages: [
      { name: "Blanket", nameZh: "", min: 0, img: `${P}/pangolin-egg.webp` },
      { name: "Baby", nameZh: "", min: 30, img: `${P}/pangolin-baby.webp` },
      { name: "Young", nameZh: "", min: 60, img: `${P}/pangolin-young.webp` },
      { name: "Grown", nameZh: "", min: 90, img: `${P}/pangolin-grown.webp` },
    ],
    unlockCondition: "leopardcat_grown_video_watched",
    ...FOREST, video: `${P}/pangolin-video.mp4`, isEggType: false, scale: 1,
    feedLabel: "pangolin", feedLabelZh: "",
    levelUpMessages: [
      { main: "Welcome, little one!", zh: "", sub: "Meet your Baby Pangolin!", subZh: "" },
      { main: "Look how you've grown!", zh: "", sub: "Now a Young Pangolin!", subZh: "" },
      { main: "Fully grown! Amazing!", zh: "", sub: "You raised a Grown Pangolin!", subZh: "" },
    ],
    unlockOverlay: { emoji: "", title: "Pangolin!", titleZh: "", eggLine: "A Pangolin baby appeared!", eggLineZh: "", feedLine: "Feed it treats to help it grow!", feedLineZh: "", btnText: "Let's go!", glowColor: "rgba(34,197,94,0.6)", borderColor: "rgba(34,197,94,0.8)", bgGradient: "linear-gradient(135deg,#14532d,#3f7d4f)" },
  },
  {
    id: "macaque", name: "Macaque", nameZh: "", emoji: "",
    stages: [
      { name: "Blanket", nameZh: "", min: 0, img: `${P}/macaque-egg.webp` },
      { name: "Baby", nameZh: "", min: 35, img: `${P}/macaque-baby.webp` },
      { name: "Young", nameZh: "", min: 70, img: `${P}/macaque-young.webp` },
      { name: "Grown", nameZh: "", min: 105, img: `${P}/macaque-grown.webp` },
    ],
    unlockCondition: "pangolin_grown_video_watched",
    ...FOREST, video: `${P}/macaque-video.mp4`, isEggType: false, scale: 1,
    feedLabel: "macaque", feedLabelZh: "",
    levelUpMessages: [
      { main: "Welcome, little one!", zh: "", sub: "Meet your Baby Macaque!", subZh: "" },
      { main: "Look how you've grown!", zh: "", sub: "Now a Young Macaque!", subZh: "" },
      { main: "Fully grown! Amazing!", zh: "", sub: "You raised a Grown Macaque!", subZh: "" },
    ],
    unlockOverlay: { emoji: "", title: "Macaque!", titleZh: "", eggLine: "A Macaque baby appeared!", eggLineZh: "", feedLine: "Feed it treats to help it grow!", feedLineZh: "", btnText: "Let's go!", glowColor: "rgba(34,197,94,0.6)", borderColor: "rgba(34,197,94,0.8)", bgGradient: "linear-gradient(135deg,#14532d,#3f7d4f)" },
  },
  {
    id: "sikadeer", name: "Sika Deer", nameZh: "", emoji: "",
    stages: [
      { name: "Blanket", nameZh: "", min: 0, img: `${P}/sikadeer-egg.webp` },
      { name: "Baby", nameZh: "", min: 35, img: `${P}/sikadeer-baby.webp` },
      { name: "Young", nameZh: "", min: 70, img: `${P}/sikadeer-young.webp` },
      { name: "Grown", nameZh: "", min: 105, img: `${P}/sikadeer-grown.webp` },
    ],
    unlockCondition: "macaque_grown_video_watched",
    ...FOREST, video: `${P}/sikadeer-video.mp4`, isEggType: false, scale: 1,
    feedLabel: "sika deer", feedLabelZh: "",
    levelUpMessages: [
      { main: "Welcome, little one!", zh: "", sub: "Meet your Baby Sika Deer!", subZh: "" },
      { main: "Look how you've grown!", zh: "", sub: "Now a Young Sika Deer!", subZh: "" },
      { main: "Fully grown! Amazing!", zh: "", sub: "You raised a Grown Sika Deer!", subZh: "" },
    ],
    unlockOverlay: { emoji: "", title: "Sika Deer!", titleZh: "", eggLine: "A Sika Deer baby appeared!", eggLineZh: "", feedLine: "Feed it treats to help it grow!", feedLineZh: "", btnText: "Let's go!", glowColor: "rgba(34,197,94,0.6)", borderColor: "rgba(34,197,94,0.8)", bgGradient: "linear-gradient(135deg,#14532d,#3f7d4f)" },
  },
  {
    id: "blackbear", name: "Black Bear", nameZh: "", emoji: "",
    stages: [
      { name: "Blanket", nameZh: "", min: 0, img: `${P}/blackbear-egg.webp` },
      { name: "Baby", nameZh: "", min: 40, img: `${P}/blackbear-baby.webp` },
      { name: "Young", nameZh: "", min: 80, img: `${P}/blackbear-young.webp` },
      { name: "Grown", nameZh: "", min: 120, img: `${P}/blackbear-grown.webp` },
    ],
    unlockCondition: "sikadeer_grown_video_watched",
    ...FOREST, video: `${P}/blackbear-video.mp4`, isEggType: false, scale: 1,
    feedLabel: "black bear", feedLabelZh: "",
    levelUpMessages: [
      { main: "Welcome, little one!", zh: "", sub: "Meet your Baby Black Bear!", subZh: "" },
      { main: "Look how you've grown!", zh: "", sub: "Now a Young Black Bear!", subZh: "" },
      { main: "Fully grown! Amazing!", zh: "", sub: "You raised a Grown Black Bear!", subZh: "" },
    ],
    unlockOverlay: { emoji: "", title: "Black Bear!", titleZh: "", eggLine: "A Black Bear baby appeared!", eggLineZh: "", feedLine: "Feed it treats to help it grow!", feedLineZh: "", btnText: "Let's go!", glowColor: "rgba(34,197,94,0.6)", borderColor: "rgba(34,197,94,0.8)", bgGradient: "linear-gradient(135deg,#14532d,#3f7d4f)" },
  },
];
