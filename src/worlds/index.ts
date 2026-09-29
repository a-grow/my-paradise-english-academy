// WORLD TEMPLATE: the list of worlds. One entry per world = its animals + where it saves + its game link.
// A NEW world = a new animals file + one entry here (+ art). The shared page is src/pages/WorldPage.tsx.
import type { Animal } from "./types";
import { standardSave, type WorldSave } from "./storage";
import { DINO_ANIMALS } from "./dino";

export interface WorldConfig {
  id: string;                                           // "dino" (cloud blob key + save names)
  animals: Animal[];                                    // in unlock order; the LAST one finishes the world
  makeSave: (code: string, name: string) => WorldSave;  // this world's save places (never renamed)
  gamePath: string;                                     // "Play a Game" route prefix
}

export const DINO_WORLD: WorldConfig = {
  id: "dino",
  animals: DINO_ANIMALS,
  makeSave: (code, name) => standardSave("dino", code, name, DINO_ANIMALS.map(a => a.id)),
  gamePath: "/game/dino",
};
