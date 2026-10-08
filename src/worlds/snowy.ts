// SNOWY WORLD (World 4) animals, order = unlock order (Andy 2026-10-07/08). Snowy owl = LAST animal (finishes the world;
// must go into the database lock list BEFORE kids can finish it). English only (no Chinese). Penguin on purpose (North + South Pole mix).
// STAGE PRICES (Andy 2026-10-07): treats per stage arctic fox 25, polar bear 30, penguin 30, seal 35, walrus 35, snowy owl 40
// (stage mins 0, p, 2p, 3p). Snowy owl grown = 120 = the database lock's 'snowy finished' number - change BOTH together.
// Videos: none yet (Andy) -> video null (a kid can't unlock the next animal until videos exist; 1006 display is fine).
// Pictures: public/worlds/snowy/<id>-<egg|baby|young|grown>(-t).webp, cut 2026-10-08 from Andy's Gemini sprite sheets.
import type { Animal } from "./types";

const P = "/worlds/snowy";
const ICE = { collectionBg: "#4f7fb8", collectionBorder: "rgba(190,225,255,0.8)", collectionGlow: "rgba(190,225,255,0.4)",
  accentColor: "#38bdf8", accentGlow: "rgba(56,189,248,0.5)", btnColor: "#38bdf8", btnGlow: "rgba(56,189,248,0.5)",
  btn3Color: "#16a34a", btn3Glow: "rgba(22,163,74,0.5)" };

export const SNOWY_ANIMALS: Animal[] = [
  {
    id: "arcticfox", name: "Arctic Fox", nameZh: "", emoji: "",
    stages: [
      { name: "Blanket", nameZh: "", min: 0, img: `${P}/arcticfox-egg.webp` },
      { name: "Baby", nameZh: "", min: 25, img: `${P}/arcticfox-baby.webp` },
      { name: "Young", nameZh: "", min: 50, img: `${P}/arcticfox-young.webp` },
      { name: "Grown", nameZh: "", min: 75, img: `${P}/arcticfox-grown.webp` },
    ],
    unlockCondition: "default",
    ...ICE, video: null, isEggType: false, scale: 1,
    feedLabel: "arctic fox", feedLabelZh: "",
    levelUpMessages: [
      { main: "Welcome, little one!", zh: "", sub: "Meet your Baby Arctic Fox!", subZh: "" },
      { main: "Look how you've grown!", zh: "", sub: "Now a Young Arctic Fox!", subZh: "" },
      { main: "Fully grown! Amazing!", zh: "", sub: "You raised a Grown Arctic Fox!", subZh: "" },
    ],
    unlockOverlay: { emoji: "", title: "Arctic Fox!", titleZh: "", eggLine: "An Arctic Fox baby appeared!", eggLineZh: "", feedLine: "Feed it treats to help it grow!", feedLineZh: "", btnText: "Let's go!", glowColor: "rgba(56,189,248,0.6)", borderColor: "rgba(56,189,248,0.8)", bgGradient: "linear-gradient(135deg,#1e3a5f,#4f7fb8)" },
  },
  {
    id: "polarbear", name: "Polar Bear", nameZh: "", emoji: "",
    stages: [
      { name: "Blanket", nameZh: "", min: 0, img: `${P}/polarbear-egg.webp` },
      { name: "Baby", nameZh: "", min: 30, img: `${P}/polarbear-baby.webp` },
      { name: "Young", nameZh: "", min: 60, img: `${P}/polarbear-young.webp` },
      { name: "Grown", nameZh: "", min: 90, img: `${P}/polarbear-grown.webp` },
    ],
    unlockCondition: "arcticfox_grown_video_watched",
    ...ICE, video: null, isEggType: false, scale: 1,
    feedLabel: "polar bear", feedLabelZh: "",
    levelUpMessages: [
      { main: "Welcome, little one!", zh: "", sub: "Meet your Baby Polar Bear!", subZh: "" },
      { main: "Look how you've grown!", zh: "", sub: "Now a Young Polar Bear!", subZh: "" },
      { main: "Fully grown! Amazing!", zh: "", sub: "You raised a Grown Polar Bear!", subZh: "" },
    ],
    unlockOverlay: { emoji: "", title: "Polar Bear!", titleZh: "", eggLine: "A Polar Bear baby appeared!", eggLineZh: "", feedLine: "Feed it treats to help it grow!", feedLineZh: "", btnText: "Let's go!", glowColor: "rgba(56,189,248,0.6)", borderColor: "rgba(56,189,248,0.8)", bgGradient: "linear-gradient(135deg,#1e3a5f,#4f7fb8)" },
  },
  {
    id: "penguin", name: "Penguin", nameZh: "", emoji: "",
    stages: [
      { name: "Egg", nameZh: "", min: 0, img: `${P}/penguin-egg.webp` },
      { name: "Baby", nameZh: "", min: 30, img: `${P}/penguin-baby.webp` },
      { name: "Young", nameZh: "", min: 60, img: `${P}/penguin-young.webp` },
      { name: "Grown", nameZh: "", min: 90, img: `${P}/penguin-grown.webp` },
    ],
    unlockCondition: "polarbear_grown_video_watched",
    ...ICE, video: null, isEggType: true, scale: 1,
    feedLabel: "penguin", feedLabelZh: "",
    levelUpMessages: [
      { main: "Welcome, little one!", zh: "", sub: "Meet your Baby Penguin!", subZh: "" },
      { main: "Look how you've grown!", zh: "", sub: "Now a Young Penguin!", subZh: "" },
      { main: "Fully grown! Amazing!", zh: "", sub: "You raised a Grown Penguin!", subZh: "" },
    ],
    unlockOverlay: { emoji: "", title: "Penguin!", titleZh: "", eggLine: "A Penguin Egg appeared!", eggLineZh: "", feedLine: "Feed it treats to help it grow!", feedLineZh: "", btnText: "Let's go!", glowColor: "rgba(56,189,248,0.6)", borderColor: "rgba(56,189,248,0.8)", bgGradient: "linear-gradient(135deg,#1e3a5f,#4f7fb8)" },
  },
  {
    id: "seal", name: "Seal", nameZh: "", emoji: "",
    stages: [
      { name: "Blanket", nameZh: "", min: 0, img: `${P}/seal-egg.webp` },
      { name: "Baby", nameZh: "", min: 35, img: `${P}/seal-baby.webp` },
      { name: "Young", nameZh: "", min: 70, img: `${P}/seal-young.webp` },
      { name: "Grown", nameZh: "", min: 105, img: `${P}/seal-grown.webp` },
    ],
    unlockCondition: "penguin_grown_video_watched",
    ...ICE, video: null, isEggType: false, scale: 1,
    feedLabel: "seal", feedLabelZh: "",
    levelUpMessages: [
      { main: "Welcome, little one!", zh: "", sub: "Meet your Baby Seal!", subZh: "" },
      { main: "Look how you've grown!", zh: "", sub: "Now a Young Seal!", subZh: "" },
      { main: "Fully grown! Amazing!", zh: "", sub: "You raised a Grown Seal!", subZh: "" },
    ],
    unlockOverlay: { emoji: "", title: "Seal!", titleZh: "", eggLine: "A Seal baby appeared!", eggLineZh: "", feedLine: "Feed it treats to help it grow!", feedLineZh: "", btnText: "Let's go!", glowColor: "rgba(56,189,248,0.6)", borderColor: "rgba(56,189,248,0.8)", bgGradient: "linear-gradient(135deg,#1e3a5f,#4f7fb8)" },
  },
  {
    id: "walrus", name: "Walrus", nameZh: "", emoji: "",
    stages: [
      { name: "Blanket", nameZh: "", min: 0, img: `${P}/walrus-egg.webp` },
      { name: "Baby", nameZh: "", min: 35, img: `${P}/walrus-baby.webp` },
      { name: "Young", nameZh: "", min: 70, img: `${P}/walrus-young.webp` },
      { name: "Grown", nameZh: "", min: 105, img: `${P}/walrus-grown.webp` },
    ],
    unlockCondition: "seal_grown_video_watched",
    ...ICE, video: null, isEggType: false, scale: 1,
    feedLabel: "walrus", feedLabelZh: "",
    levelUpMessages: [
      { main: "Welcome, little one!", zh: "", sub: "Meet your Baby Walrus!", subZh: "" },
      { main: "Look how you've grown!", zh: "", sub: "Now a Young Walrus!", subZh: "" },
      { main: "Fully grown! Amazing!", zh: "", sub: "You raised a Grown Walrus!", subZh: "" },
    ],
    unlockOverlay: { emoji: "", title: "Walrus!", titleZh: "", eggLine: "A Walrus baby appeared!", eggLineZh: "", feedLine: "Feed it treats to help it grow!", feedLineZh: "", btnText: "Let's go!", glowColor: "rgba(56,189,248,0.6)", borderColor: "rgba(56,189,248,0.8)", bgGradient: "linear-gradient(135deg,#1e3a5f,#4f7fb8)" },
  },
  {
    id: "snowyowl", name: "Snowy Owl", nameZh: "", emoji: "",
    stages: [
      { name: "Egg", nameZh: "", min: 0, img: `${P}/snowyowl-egg.webp` },
      { name: "Baby", nameZh: "", min: 40, img: `${P}/snowyowl-baby.webp` },
      { name: "Young", nameZh: "", min: 80, img: `${P}/snowyowl-young.webp` },
      { name: "Grown", nameZh: "", min: 120, img: `${P}/snowyowl-grown.webp` },
    ],
    unlockCondition: "walrus_grown_video_watched",
    ...ICE, video: null, isEggType: true, scale: 1,
    feedLabel: "snowy owl", feedLabelZh: "",
    levelUpMessages: [
      { main: "Welcome, little one!", zh: "", sub: "Meet your Baby Snowy Owl!", subZh: "" },
      { main: "Look how you've grown!", zh: "", sub: "Now a Young Snowy Owl!", subZh: "" },
      { main: "Fully grown! Amazing!", zh: "", sub: "You raised a Grown Snowy Owl!", subZh: "" },
    ],
    unlockOverlay: { emoji: "", title: "Snowy Owl!", titleZh: "", eggLine: "A Snowy Owl Egg appeared!", eggLineZh: "", feedLine: "Feed it treats to help it grow!", feedLineZh: "", btnText: "Let's go!", glowColor: "rgba(56,189,248,0.6)", borderColor: "rgba(56,189,248,0.8)", bgGradient: "linear-gradient(135deg,#1e3a5f,#4f7fb8)" },
  },
];
