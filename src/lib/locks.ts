// LOCKS (launch step 4, Andy 2026-10-13): Card Album + Puzzle Mixup open after the kid grows animals a few more times.
// Count = stage prizes in the kid's prize list ('<world>:<animal>:baby|young|grown'). A stage prize is only claimed when an
// animal grows DURING a visit on the new look, so only stages grown AFTER launch night count (checked 10-13: every real kid = 0).
// 'puzzle:welcome' and '<world>:complete' do not count. Teacher code 1006 is never locked. One switch: LOCKS_ON.
export const LOCKS_ON = true;
export const LOCK_NEED = { album: 1, puzzle: 2 } as const;   // seasons later: 3
export type LockId = keyof typeof LOCK_NEED;
const STAGE_PRIZE = /^[a-z]+:[a-z]+:(baby|young|grown)$/;
export const stagesGrown = (prizes: string[] | null | undefined) => (prizes ?? []).filter(p => STAGE_PRIZE.test(p)).length;
// How many more stages to grow (0 = open). prizes null = not read yet -> still locked (safe side).
export const lockLeft = (id: LockId, prizes: string[] | null | undefined, isMaster: boolean, pretend?: number) => {
  if (!LOCKS_ON) return 0;
  if (isMaster && pretend === undefined) return 0;
  const grown = pretend !== undefined ? pretend : stagesGrown(prizes);
  return Math.max(0, LOCK_NEED[id] - grown);
};
export const lockLines = (left: number) => [`Grow your animal ${left} more time${left === 1 ? "" : "s"}`, "to unlock me!"];
export const lockText = (left: number) => lockLines(left).join(" ");
export const LOCK_IMG = "/worlds/ui/lock_closed.webp";
export const UNLOCK_IMG = "/worlds/ui/lock_open.webp";
