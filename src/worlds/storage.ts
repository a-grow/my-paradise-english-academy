// WORLD TEMPLATE step 2 (2026-09-29): every world's SAVE PLACES in ONE spot.
// These are the exact names every kid's progress lives under TODAY. NEVER rename them - a renamed
// key = a kid's animals look "lost". Ocean's are old and odd (the turtle uses bare keys, grandfathered);
// Dino adds "dino_"; any NEW world uses the standard shape (standardSave) automatically.
// Nothing here reads or writes anything by itself - it only knows the names and the cloud shape.

export type AnimalProgress = { fed: number; petName: string; levelup: number[]; videoWatched: boolean; unlkseen: boolean };

/** What a world page gathers before saving to the cloud. */
export type WorldProgress = {
  animals: Record<string, AnimalProgress>;   // one entry per animal id, in the world's animal order
  visitDays: string[];
  visit5Claimed: number;
  activePet: string;                          // the animal on screen
  videoSeen?: boolean;                        // Ocean only (the video button was seen)
  oldDinoJar?: number;                        // Dino only (old jar record, frozen - never changed)
};

/** What the cloud blob says for this world (read-back). */
export type CloudWorld = {
  animals: Record<string, AnimalProgress>;
  visitDays: string[];
  visit5Claimed: number;
  activePet: string | null;                   // Ocean: from the active_pet COLUMN; others: from the blob
  videoSeen?: boolean;
  oldDinoJar?: number;
};

export interface WorldSave {
  world: string;                              // cloud blob key: data.<world>
  // ---- this device (localStorage) ----
  fed(id: string): string;
  videoWatched(id: string): string;
  petName(id: string): string;
  unlkseen(id: string): string;
  levelup(id: string): string;
  visitDays: string;
  visit5Claimed: string;
  gift: string;
  giftShown(day: string): string;
  complete: string;                           // "world finished" screen seen (per device)
  music: string;                              // music on/off setting
  nameNudge: string | null;                   // Ocean only: the "name your pet" nudge was seen
  active: string | null;                      // Ocean only: last animal on screen
  videoSeen: string | null;                   // Ocean only
  oldDinoJar: string | null;                  // Dino only
  // ---- cloud (Supabase data blob) ----
  hasCloud(data: any): boolean;               // FIRST-TIME GUARD: false = this world is not in the cloud yet -> device wins
  buildCloud(p: WorldProgress): Record<string, unknown>;
  readCloud(data: any, activePetColumn: string | null): CloudWorld;
}

// cloud animal record <-> progress (same 5 fields in every world)
const animalsToCloud = (animals: Record<string, AnimalProgress>) => {
  const out: Record<string, any> = {};
  for (const id of Object.keys(animals)) {
    const a = animals[id];
    out[id] = { fed: a.fed ?? 0, petName: a.petName ?? "", levelup: a.levelup, videoWatched: a.videoWatched ? 1 : 0, unlkseen: a.unlkseen ? 1 : 0 };
  }
  return out;
};
const animalsFromCloud = (cloudAnimals: any, ids: string[]) => {
  const out: Record<string, AnimalProgress> = {};
  for (const id of ids) {
    const av = cloudAnimals?.[id] ?? {};
    out[id] = { fed: av.fed ?? 0, petName: av.petName ?? "", levelup: Array.isArray(av.levelup) ? av.levelup : [], videoWatched: av.videoWatched === 1, unlkseen: (av.unlkseen ?? 0) === 1 };
  }
  return out;
};

/** OCEAN - today's odd names, kept exactly. Cloud: data.ocean + data.shared + the active_pet column. */
export function oceanSave(code: string, name: string, animalIds: string[]): WorldSave {
  const cn = `${code}_${name}`;
  return {
    world: "ocean",
    fed: id => (id === "turtle" ? `mpe_fed_${cn}` : `mpe_fed_${id}_${cn}`),
    videoWatched: id => (id === "turtle" ? `mpe_videowatched_${cn}` : `mpe_videowatched_${id}_${cn}`),
    petName: id => `mpe_petname_${id}_${cn}`,
    unlkseen: id => `mpe_unlkseen_${id}_${cn}`,
    levelup: id => `mpe_levelup_${id}_${cn}`,
    visitDays: `mpe_visitdays_${cn}`,
    visit5Claimed: `mpe_visit5claimed_${cn}`,
    gift: `mpe_gift_${cn}`,
    giftShown: day => `mpe_gift_shown_${cn}_${day}`,
    complete: `mpe_oceancomplete_${cn}`,
    music: "mpe_music",
    nameNudge: `mpe_namenudge_${cn}`,
    active: `mpe_active_${cn}`,
    videoSeen: `mpe_videoseen_${cn}`,
    oldDinoJar: null,
    hasCloud: data => data != null && data.ocean != null,
    buildCloud: p => ({
      ocean: { videoSeen: p.videoSeen ? 1 : 0, animals: animalsToCloud(p.animals) },
      shared: { visitDays: p.visitDays, visit5Claimed: p.visit5Claimed },
    }),
    readCloud: (data, activePetColumn) => ({
      animals: animalsFromCloud(data?.ocean?.animals, animalIds),
      visitDays: Array.isArray(data?.shared?.visitDays) ? data.shared.visitDays : [],
      visit5Claimed: data?.shared?.visit5Claimed ?? 0,
      activePet: activePetColumn || null,
      videoSeen: data?.ocean?.videoSeen === 1,
    }),
  };
}

/** DINO and every NEW world - the standard shape: keys mpe_<world>_..., cloud data.<world>.
 *  Dino keeps its two old quirks: "mpe_dinocomplete_" (no underscore) and the frozen old jar in the blob. */
export function standardSave(world: string, code: string, name: string, animalIds: string[]): WorldSave {
  const cn = `${code}_${name}`;
  const isDino = world === "dino";
  return {
    world,
    fed: id => `mpe_${world}_fed_${id}_${cn}`,
    videoWatched: id => `mpe_${world}_videowatched_${id}_${cn}`,
    petName: id => `mpe_${world}_petname_${id}_${cn}`,
    unlkseen: id => `mpe_${world}_unlkseen_${id}_${cn}`,
    levelup: id => `mpe_${world}_levelup_${id}_${cn}`,
    visitDays: `mpe_${world}_visitdays_${cn}`,
    visit5Claimed: `mpe_${world}_visit5claimed_${cn}`,
    gift: `mpe_${world}_gift_${cn}`,
    giftShown: day => `mpe_${world}_gift_shown_${cn}_${day}`,
    complete: isDino ? `mpe_dinocomplete_${cn}` : `mpe_${world}_complete_${cn}`,
    music: `mpe_${world}_music`,
    nameNudge: null,
    active: null,
    videoSeen: null,
    oldDinoJar: isDino ? `mpe_dino_jar_${cn}` : null,
    hasCloud: data => data != null && data[world] != null,   // each world checks ITS OWN key (the Dino trap)
    buildCloud: p => ({
      [world]: {
        ...(isDino ? { jar: p.oldDinoJar ?? 0 } : {}),       // OLD Dino jar record only - kept, never changed
        activePet: p.activePet,
        animals: animalsToCloud(p.animals),
        visitDays: p.visitDays,
        visit5Claimed: p.visit5Claimed,
      },
    }),
    readCloud: data => {
      const w = data?.[world] ?? {};
      return {
        animals: animalsFromCloud(w.animals, animalIds),
        visitDays: Array.isArray(w.visitDays) ? w.visitDays : [],
        visit5Claimed: w.visit5Claimed ?? 0,
        activePet: w.activePet || null,
        ...(isDino ? { oldDinoJar: typeof w.jar === "number" ? w.jar : 0 } : {}),
      };
    },
  };
}
