// WORLD TEMPLATE (step 1, 2026-09-29): animal types + stage helpers shared by every world.
// Moved unchanged from KidsWorld.tsx / DinosaurWorld.tsx (only unlockCondition became a general pattern).
export interface AnimalStage { name: string; nameZh: string; min: number; img: string; }
export interface Animal {
  id: string; name: string; nameZh: string; emoji: string;
  stages: AnimalStage[];
  unlockCondition: "default" | `${string}_grown_video_watched`;
  collectionBg: string; collectionBorder: string; collectionGlow: string;
  video: string | null; isEggType: boolean; scale?: number;
  accentColor: string; accentGlow: string;
  btnColor: string; btnGlow: string; btn3Color: string; btn3Glow: string;
  feedLabel: string; feedLabelZh: string;
  levelUpMessages: { main: string; zh: string; sub: string; subZh: string }[];
  unlockOverlay: { emoji: string; title: string; titleZh: string; eggLine: string; eggLineZh: string; feedLine: string; feedLineZh: string; btnText: string; glowColor: string; borderColor: string; bgGradient: string; };
}

export const getAnimalStage = (animal: Animal, fed: number): AnimalStage =>
  [...animal.stages].reverse().find(s => fed >= s.min) ?? animal.stages[0];
export const getAnimalStageIdx = (animal: Animal, fed: number): number =>
  animal.stages.indexOf(getAnimalStage(animal, fed));
