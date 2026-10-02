// WORLD TEMPLATE step 4 (2026-09-29): what a world's LOOK (skin) provides. The shared brain
// (src/pages/WorldPage.tsx) does all the rules + saving and hands everything to the skin's Page.
import type { ComponentType } from "react";
import type { WorldView } from "@/pages/WorldPage";

export interface WorldSkin {
  Loading: ComponentType<{ v: WorldView }>;      // loading screen
  Page: ComponentType<{ v: WorldView }>;         // the whole world page
  makeSounds: (ctx: AudioContext) => Record<string, () => void>; // sound effects by name
  music: string;                                 // background music file
  musicVolume?: number;                          // fixed music volume 0-1 (new look); unset = the old volume * 0.5
  snd: { visit5: string; levelUp: string; rename: string }; // which sound the brain plays for these
  levelUpMusic: string | null;                   // music file on level-up (null = snd.levelUp)
  renameMusic: string | null;                    // music file after naming a pet (null = snd.rename)
  completeDelayMs: number;                       // wait before the world-finished screen
  completeWaitsForLevelUp: boolean;              // hold the finished screen while a level-up shows
}
