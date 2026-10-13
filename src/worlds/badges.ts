// MY BADGES (launch step 6, Andy OK 2026-10-13): 12 badges. EARNED is worked out from what the kid already has (no database
// change): hello = always; hatched / grown / treats from every world's animals (fed); visit5 = 7 Daily Prize boxes opened
// (daily_box); world badges = '<world>:complete' in the prize list. games / grammar need win counters (planned with the Card
// Album database session) - until then never earned. Progress from BEFORE launch counts. Pictures: public/worlds/badges/<id>.webp
// NOTE: the world list is passed in (importing '@/worlds' here would be a circular import through the skins).
import { getAnimalStageIdx } from "./types";
import type { WorldConfig } from "./index";

export type BadgeDef = { id: string; name: string; how: string; plate: string }; // plate = the short engraved line under the badge in the hall
export const FUN_BADGES: BadgeDef[] = [
  { id: "hello", name: "Hello!", how: "Visit your world", plate: "for your first visit" },
  { id: "hatched", name: "First Egg", how: "Hatch your first egg", plate: "for hatching an egg" },
  { id: "grown", name: "All Grown Up", how: "Grow an animal all the way", plate: "for a grown animal" },
  { id: "treats", name: "Treat Feeder", how: "Feed 100 treats", plate: "for feeding 100 treats" },
  { id: "visit5", name: "Daily Visitor", how: "Open 7 Daily Prize boxes", plate: "for 7 Daily Prizes" },
  { id: "games", name: "Vocab Champ", how: "Win 25 vocab games", plate: "for 25 vocab wins" },
  { id: "grammar", name: "Grammar Star", how: "Win 25 grammar games", plate: "for 25 grammar wins" },
];
export const badgeList = (worlds: WorldConfig[]): BadgeDef[] =>
  [...FUN_BADGES, ...worlds.map(w => ({ id: w.id, name: `${w.title} World`, how: `Finish ${w.title} World`, plate: `for finishing ${w.title}` }))];
export const badgeImg = (id: string) => `/worlds/badges/${id.split("~")[0]}.webp`; // "~n" = test copies (?bd=many)
export const TREATS_BADGE = 100, DAILY_BADGE = 7;

export function earnedBadges(o: { worlds: WorldConfig[]; prizes: string[] | null; rowData: any; worldId: string; fed: Record<string, number>; dailyBox: number | null }): string[] {
  const out = ["hello"];
  let hatched = false, grown = false, total = 0;
  for (const w of o.worlds) {
    let fed: Record<string, number> = {};
    if (w.id === o.worldId) fed = o.fed;   // this world = the live numbers
    else if (o.rowData) {
      const S = w.makeSave("", "");
      if (S.hasCloud(o.rowData)) { const r = S.readCloud(o.rowData, null); for (const a of w.animals) fed[a.id] = r.animals[a.id]?.fed ?? 0; }
    }
    for (const a of w.animals) {
      const f = fed[a.id] ?? 0, st = getAnimalStageIdx(a, f);
      total += f;
      if (st >= 1) hatched = true;
      if (st === a.stages.length - 1) grown = true;
    }
  }
  if (hatched) out.push("hatched");
  if (grown) out.push("grown");
  if (total >= TREATS_BADGE) out.push("treats");
  if ((o.dailyBox ?? 0) >= DAILY_BADGE) out.push("visit5");
  for (const w of o.worlds) if ((o.prizes ?? []).includes(`${w.id}:complete`)) out.push(w.id);
  return out;
}
