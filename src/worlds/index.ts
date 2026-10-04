// WORLD TEMPLATE: the list of worlds. One entry per world = its animals + where it saves + its look.
// A NEW world = a new animals file + a skin + one entry here (+ art). The shared page is src/pages/WorldPage.tsx.
import { getAnimalStageIdx, type Animal } from "./types";
import { standardSave, oceanSave, type WorldSave } from "./storage";
import type { WorldSkin } from "./skin";
import { DINO_ANIMALS } from "./dino";
import { OCEAN_ANIMALS } from "./ocean";
// import { DINO_SKIN } from "./skins/dinoSkin";   // old look, kept for rollback (step 6)
// import { OCEAN_SKIN } from "./skins/oceanSkin"; // old look, kept for rollback (step 6)
import { SAVANNA_ANIMALS } from "./savanna";
import { SAVANNA_SKIN } from "./skins/savannaSkin";
import { OCEAN_LOOK } from "./skins/oceanLook";
import { DINO_LOOK } from "./skins/dinoLook";

export interface WorldConfig {
  id: string;                                           // "dino" (cloud blob key + save names)
  title: string;                                        // "Dino" -> "Dino World" (My Worlds, Video Theater)
  path: string;                                         // the world's real page ("/dino"); visits use /visit/<id>/...
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
  title: "Ocean",
  path: "/world",
  animals: OCEAN_ANIMALS,
  makeSave: (code, name) => oceanSave(code, name, OCEAN_ANIMALS.map(a => a.id)),
  gamePath: "/game/ocean",
  skin: OCEAN_LOOK,                                     // step 6 (2026-10-03): new shared look (old: OCEAN_SKIN)
  nextWorld: { id: "dino", path: "/dino" },
  masterAllGrown: true,
  legacyMasterCleanup: true,
};

export const DINO_WORLD: WorldConfig = {
  id: "dino",
  title: "Dino",
  path: "/dino",
  animals: DINO_ANIMALS,
  makeSave: (code, name) => standardSave("dino", code, name, DINO_ANIMALS.map(a => a.id)),
  gamePath: "/game/dino",
  skin: DINO_LOOK,                                      // step 6 (2026-10-03): new shared look (old: DINO_SKIN)
  nextWorld: { id: "savanna", path: "/savanna" },       // step 7 (2026-10-04): Ocean -> Dino -> Savanna
  masterAllGrown: false,
  legacyMasterCleanup: false,
};

// STEP 6 (2026-10-03): Ocean + Dino on the NEW shared look - same animals, same save places, only the look differs.
// Test routes only (/world-test/ocean + /world-test/dino) until the old-vs-new save proof passes; then the real routes switch.
export const OCEAN_WORLD_NEW: WorldConfig = { ...OCEAN_WORLD, skin: OCEAN_LOOK };
export const DINO_WORLD_NEW: WorldConfig = { ...DINO_WORLD, skin: DINO_LOOK };

// WORLD 3 (step 5.3, 2026-10-02): STANDARD storage (mpe_savanna_..., cloud data.savanna). Only on the test route for now.
// gamePath: GamePage has no savanna return yet - check before Play a Game is wired (step 5.4).
export const SAVANNA_WORLD: WorldConfig = {
  id: "savanna",
  title: "Savanna",
  path: "/savanna",
  animals: SAVANNA_ANIMALS,
  makeSave: (code, name) => standardSave("savanna", code, name, SAVANNA_ANIMALS.map(a => a.id)),
  gamePath: "/game/savanna",
  skin: SAVANNA_SKIN,
  nextWorld: null,
  masterAllGrown: false,
  legacyMasterCleanup: false,
};

// STEP 7 (2026-10-04): every world IN ORDER (My Worlds + Video Theater + "which world is the kid on").
// A NEW world = add it here (and its round icon public/worlds/ui/world_<id>.webp) - it then shows up everywhere.
export const ALL_WORLDS: WorldConfig[] = [OCEAN_WORLD, DINO_WORLD, SAVANNA_WORLD];

// A world's state from the kid's cloud row (the data blob): started = its section exists; finished = its LAST animal
// grown + its video watched (the same rule the brain and the database lock use). Reads only.
export const worldState = (w: WorldConfig, data: any): { started: boolean; finished: boolean } => {
  const S = w.makeSave("", "");
  if (!S.hasCloud(data)) return { started: false, finished: false };
  const r = S.readCloud(data, null);
  const last = w.animals[w.animals.length - 1];
  const a = r.animals[last.id];
  return { started: true, finished: getAnimalStageIdx(last, a?.fed ?? 0) === last.stages.length - 1 && !!a?.videoWatched };
};
