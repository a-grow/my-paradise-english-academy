// SAVANNA WORLD (World 3) animals, order = unlock order (Andy 2026-10-01 21:21). Zebra = last animal (finishes the world;
// also in the database lock list). English only this version (no Chinese). Only fields the new look uses really matter;
// the old-skin fields are filled with plain values.
// STAGE PRICES (Andy 2026-10-03 13:27): treats per stage giraffe 25, hippo 30, ostrich 30, elephant 35, lion 35, zebra 40
// (stage mins 0, p, 2p, 3p). Zebra grown = 120 = the database lock's 'savanna finished' number - change BOTH together. Videos: elephant/lion/zebra still missing (launch blocker).
import type { Animal } from "./types";

const P = "/worlds/savanna";

export const SAVANNA_ANIMALS: Animal[] = [
  {
    id: "giraffe", name: "Giraffe", nameZh: "", emoji: "",
    stages: [
      { name: "Blanket", nameZh: "", min: 0, img: `${P}/giraffe-egg.webp` },
      { name: "Baby", nameZh: "", min: 25, img: `${P}/giraffe-baby.webp` },
      { name: "Young", nameZh: "", min: 50, img: `${P}/giraffe-young.webp` },
      { name: "Grown", nameZh: "", min: 75, img: `${P}/giraffe-grown.webp` },
    ],
    unlockCondition: "default",
    collectionBg: "#c98a2b", collectionBorder: "rgba(255,200,80,0.8)", collectionGlow: "rgba(255,200,80,0.4)",
    video: `${P}/giraffe-video.mp4`, isEggType: false, scale: 1,
    accentColor: "#f59e0b", accentGlow: "rgba(245,158,11,0.5)",
    btnColor: "#f59e0b", btnGlow: "rgba(245,158,11,0.5)", btn3Color: "#16a34a", btn3Glow: "rgba(22,163,74,0.5)",
    feedLabel: "giraffe", feedLabelZh: "",
    levelUpMessages: [
      { main: "Welcome, little one!", zh: "", sub: "Meet your Baby Giraffe!", subZh: "" },
      { main: "Look how you've grown!", zh: "", sub: "Now a Young Giraffe!", subZh: "" },
      { main: "Fully grown! Amazing!", zh: "", sub: "You raised a Grown Giraffe!", subZh: "" },
    ],
    unlockOverlay: { emoji: "", title: "Giraffe!", titleZh: "", eggLine: "A Giraffe baby appeared!", eggLineZh: "", feedLine: "Feed it treats to help it grow!", feedLineZh: "", btnText: "Let's go!", glowColor: "rgba(245,158,11,0.6)", borderColor: "rgba(245,158,11,0.8)", bgGradient: "linear-gradient(135deg,#7c4a1a,#c98a2b)" },
  },
  {
    id: "hippo", name: "Hippo", nameZh: "", emoji: "",
    stages: [
      { name: "Blanket", nameZh: "", min: 0, img: `${P}/hippo-egg.webp` },
      { name: "Baby", nameZh: "", min: 30, img: `${P}/hippo-baby.webp` },
      { name: "Young", nameZh: "", min: 60, img: `${P}/hippo-young.webp` },
      { name: "Grown", nameZh: "", min: 90, img: `${P}/hippo-grown.webp` },
    ],
    unlockCondition: "giraffe_grown_video_watched",
    collectionBg: "#c98a2b", collectionBorder: "rgba(255,200,80,0.8)", collectionGlow: "rgba(255,200,80,0.4)",
    video: `${P}/hippo-video.mp4`, isEggType: false, scale: 1,
    accentColor: "#f59e0b", accentGlow: "rgba(245,158,11,0.5)",
    btnColor: "#f59e0b", btnGlow: "rgba(245,158,11,0.5)", btn3Color: "#16a34a", btn3Glow: "rgba(22,163,74,0.5)",
    feedLabel: "hippo", feedLabelZh: "",
    levelUpMessages: [
      { main: "Welcome, little one!", zh: "", sub: "Meet your Baby Hippo!", subZh: "" },
      { main: "Look how you've grown!", zh: "", sub: "Now a Young Hippo!", subZh: "" },
      { main: "Fully grown! Amazing!", zh: "", sub: "You raised a Grown Hippo!", subZh: "" },
    ],
    unlockOverlay: { emoji: "", title: "Hippo!", titleZh: "", eggLine: "A Hippo baby appeared!", eggLineZh: "", feedLine: "Feed it treats to help it grow!", feedLineZh: "", btnText: "Let's go!", glowColor: "rgba(245,158,11,0.6)", borderColor: "rgba(245,158,11,0.8)", bgGradient: "linear-gradient(135deg,#7c4a1a,#c98a2b)" },
  },
  {
    id: "ostrich", name: "Ostrich", nameZh: "", emoji: "",
    stages: [
      { name: "Egg", nameZh: "", min: 0, img: `${P}/ostrich-egg.webp` },
      { name: "Baby", nameZh: "", min: 30, img: `${P}/ostrich-baby.webp` },
      { name: "Young", nameZh: "", min: 60, img: `${P}/ostrich-young.webp` },
      { name: "Grown", nameZh: "", min: 90, img: `${P}/ostrich-grown.webp` },
    ],
    unlockCondition: "hippo_grown_video_watched",
    collectionBg: "#c98a2b", collectionBorder: "rgba(255,200,80,0.8)", collectionGlow: "rgba(255,200,80,0.4)",
    video: `${P}/ostrich-video.mp4`, isEggType: true, scale: 1,
    accentColor: "#f59e0b", accentGlow: "rgba(245,158,11,0.5)",
    btnColor: "#f59e0b", btnGlow: "rgba(245,158,11,0.5)", btn3Color: "#16a34a", btn3Glow: "rgba(22,163,74,0.5)",
    feedLabel: "ostrich", feedLabelZh: "",
    levelUpMessages: [
      { main: "Welcome, little one!", zh: "", sub: "Meet your Baby Ostrich!", subZh: "" },
      { main: "Look how you've grown!", zh: "", sub: "Now a Young Ostrich!", subZh: "" },
      { main: "Fully grown! Amazing!", zh: "", sub: "You raised a Grown Ostrich!", subZh: "" },
    ],
    unlockOverlay: { emoji: "", title: "Ostrich!", titleZh: "", eggLine: "A Ostrich Egg appeared!", eggLineZh: "", feedLine: "Feed it treats to help it grow!", feedLineZh: "", btnText: "Let's go!", glowColor: "rgba(245,158,11,0.6)", borderColor: "rgba(245,158,11,0.8)", bgGradient: "linear-gradient(135deg,#7c4a1a,#c98a2b)" },
  },
  {
    id: "elephant", name: "Elephant", nameZh: "", emoji: "",
    stages: [
      { name: "Blanket", nameZh: "", min: 0, img: `${P}/elephant-egg.webp` },
      { name: "Baby", nameZh: "", min: 35, img: `${P}/elephant-baby.webp` },
      { name: "Young", nameZh: "", min: 70, img: `${P}/elephant-young.webp` },
      { name: "Grown", nameZh: "", min: 105, img: `${P}/elephant-grown.webp` },
    ],
    unlockCondition: "ostrich_grown_video_watched",
    collectionBg: "#c98a2b", collectionBorder: "rgba(255,200,80,0.8)", collectionGlow: "rgba(255,200,80,0.4)",
    video: null, isEggType: false, scale: 1,
    accentColor: "#f59e0b", accentGlow: "rgba(245,158,11,0.5)",
    btnColor: "#f59e0b", btnGlow: "rgba(245,158,11,0.5)", btn3Color: "#16a34a", btn3Glow: "rgba(22,163,74,0.5)",
    feedLabel: "elephant", feedLabelZh: "",
    levelUpMessages: [
      { main: "Welcome, little one!", zh: "", sub: "Meet your Baby Elephant!", subZh: "" },
      { main: "Look how you've grown!", zh: "", sub: "Now a Young Elephant!", subZh: "" },
      { main: "Fully grown! Amazing!", zh: "", sub: "You raised a Grown Elephant!", subZh: "" },
    ],
    unlockOverlay: { emoji: "", title: "Elephant!", titleZh: "", eggLine: "A Elephant baby appeared!", eggLineZh: "", feedLine: "Feed it treats to help it grow!", feedLineZh: "", btnText: "Let's go!", glowColor: "rgba(245,158,11,0.6)", borderColor: "rgba(245,158,11,0.8)", bgGradient: "linear-gradient(135deg,#7c4a1a,#c98a2b)" },
  },
  {
    id: "lion", name: "Lion", nameZh: "", emoji: "",
    stages: [
      { name: "Blanket", nameZh: "", min: 0, img: `${P}/lion-egg.webp` },
      { name: "Baby", nameZh: "", min: 35, img: `${P}/lion-baby.webp` },
      { name: "Young", nameZh: "", min: 70, img: `${P}/lion-young.webp` },
      { name: "Grown", nameZh: "", min: 105, img: `${P}/lion-grown.webp` },
    ],
    unlockCondition: "elephant_grown_video_watched",
    collectionBg: "#c98a2b", collectionBorder: "rgba(255,200,80,0.8)", collectionGlow: "rgba(255,200,80,0.4)",
    video: null, isEggType: false, scale: 1,
    accentColor: "#f59e0b", accentGlow: "rgba(245,158,11,0.5)",
    btnColor: "#f59e0b", btnGlow: "rgba(245,158,11,0.5)", btn3Color: "#16a34a", btn3Glow: "rgba(22,163,74,0.5)",
    feedLabel: "lion", feedLabelZh: "",
    levelUpMessages: [
      { main: "Welcome, little one!", zh: "", sub: "Meet your Baby Lion!", subZh: "" },
      { main: "Look how you've grown!", zh: "", sub: "Now a Young Lion!", subZh: "" },
      { main: "Fully grown! Amazing!", zh: "", sub: "You raised a Grown Lion!", subZh: "" },
    ],
    unlockOverlay: { emoji: "", title: "Lion!", titleZh: "", eggLine: "A Lion baby appeared!", eggLineZh: "", feedLine: "Feed it treats to help it grow!", feedLineZh: "", btnText: "Let's go!", glowColor: "rgba(245,158,11,0.6)", borderColor: "rgba(245,158,11,0.8)", bgGradient: "linear-gradient(135deg,#7c4a1a,#c98a2b)" },
  },
  {
    id: "zebra", name: "Zebra", nameZh: "", emoji: "",
    stages: [
      { name: "Blanket", nameZh: "", min: 0, img: `${P}/zebra-egg.webp` },
      { name: "Baby", nameZh: "", min: 40, img: `${P}/zebra-baby.webp` },
      { name: "Young", nameZh: "", min: 80, img: `${P}/zebra-young.webp` },
      { name: "Grown", nameZh: "", min: 120, img: `${P}/zebra-grown.webp` },
    ],
    unlockCondition: "lion_grown_video_watched",
    collectionBg: "#c98a2b", collectionBorder: "rgba(255,200,80,0.8)", collectionGlow: "rgba(255,200,80,0.4)",
    video: null, isEggType: false, scale: 1,
    accentColor: "#f59e0b", accentGlow: "rgba(245,158,11,0.5)",
    btnColor: "#f59e0b", btnGlow: "rgba(245,158,11,0.5)", btn3Color: "#16a34a", btn3Glow: "rgba(22,163,74,0.5)",
    feedLabel: "zebra", feedLabelZh: "",
    levelUpMessages: [
      { main: "Welcome, little one!", zh: "", sub: "Meet your Baby Zebra!", subZh: "" },
      { main: "Look how you've grown!", zh: "", sub: "Now a Young Zebra!", subZh: "" },
      { main: "Fully grown! Amazing!", zh: "", sub: "You raised a Grown Zebra!", subZh: "" },
    ],
    unlockOverlay: { emoji: "", title: "Zebra!", titleZh: "", eggLine: "A Zebra baby appeared!", eggLineZh: "", feedLine: "Feed it treats to help it grow!", feedLineZh: "", btnText: "Let's go!", glowColor: "rgba(245,158,11,0.6)", borderColor: "rgba(245,158,11,0.8)", bgGradient: "linear-gradient(135deg,#7c4a1a,#c98a2b)" },
  },
];
