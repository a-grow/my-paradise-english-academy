// WORLD TEMPLATE: the list of worlds. One entry per world = its animals + where it saves + its look.
// A NEW world = a new animals file + a skin + one entry here (+ art). The shared page is src/pages/WorldPage.tsx.
import type { Animal } from "./types";
import { standardSave, oceanSave, type WorldSave } from "./storage";
import type { WorldSkin } from "./skin";
import { DINO_ANIMALS } from "./dino";
import { OCEAN_ANIMALS } from "./ocean";
import { DINO_SKIN } from "./skins/dinoSkin";
import { OCEAN_SKIN } from "./skins/oceanSkin";
import { SAVANNA_ANIMALS } from "./savanna";
import { SAVANNA_SKIN } from "./skins/savannaSkin";

export interface WorldConfig {
  id: string;                                           // "dino" (cloud blob key + save names)
  animals: Animal[];                                    // in unlock order; the LAST one finishes the world
  makeSave: (code: string, name: string) => WorldSave;  // this world's save places (never renamed)
  gamePath: string;                                     // "Play a Game" route prefix
  skin: WorldSkin;                                      // the look (src/worlds/skins/)
  nextWorld: { id: string; path: string } | null;      // where "finished" leads (Ocean -> Dino); null = none yet
  masterAllGrown: boolean;                              // teacher code 1006 shows every animal grown (else all but the last)
  legacyMasterCleanup: boolean;                         // old Ocean teacher-test cleanup (Ocean only)
}

export const OCEAN_WORLD: WorldConfig = {
  id: "ocean",
  animals: OCEAN_ANIMALS,
  makeSave: (code, name) => oceanSave(code, name, OCEAN_ANIMALS.map(a => a.id)),
  gamePath: "/game/ocean",
  skin: OCEAN_SKIN,
  nextWorld: { id: "dino", path: "/dino" },
  masterAllGrown: true,
  legacyMasterCleanup: true,
};

export const DINO_WORLD: WorldConfig = {
  id: "dino",
  animals: DINO_ANIMALS,
  makeSave: (code, name) => standardSave("dino", code, name, DINO_ANIMALS.map(a => a.id)),
  gamePath: "/game/dino",
  skin: DINO_SKIN,
  nextWorld: null,
  masterAllGrown: false,
  legacyMasterCleanup: false,
};

// WORLD 3 (step 5.3, 2026-10-02): STANDARD storage (mpe_savanna_..., cloud data.savanna). Only on the test route for now.
// gamePath: GamePage has no savanna return yet - check before Play a Game is wired (step 5.4).
export const SAVANNA_WORLD: WorldConfig = {
  id: "savanna",
  animals: SAVANNA_ANIMALS,
  makeSave: (code, name) => standardSave("savanna", code, name, SAVANNA_ANIMALS.map(a => a.id)),
  gamePath: "/game/savanna",
  skin: SAVANNA_SKIN,
  nextWorld: null,
  masterAllGrown: false,
  legacyMasterCleanup: false,
};
