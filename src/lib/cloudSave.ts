import { supabase } from "./supabase";

export async function saveJarToCloud(code: string, studentName: string, treats: number) {
  try {
    const { error } = await supabase
      .from("student_progress")
      .upsert(
        { code, student_name: studentName, treats },
        { onConflict: "code,student_name" }
      );
    if (error) console.error("[cloudSave] jar save failed:", error.message);
    else { console.log("[cloudSave] jar saved:", code, studentName, treats); await updateLastLogin(code, studentName); }
  } catch (e) {
    console.error("[cloudSave] jar save threw:", e);
  }
}

export async function loadJarFromCloud(code: string, studentName: string): Promise<number | null> {
  try {
    const { data, error } = await supabase
      .from("student_progress")
      .select("treats")
      .eq("code", code)
      .eq("student_name", studentName)
      .maybeSingle();
    if (error) { console.error("[cloudSave] jar load failed:", error.message); return null; }
    return data ? data.treats : null;
  } catch (e) {
    console.error("[cloudSave] jar load threw:", e);
    return null;
  }
}

// ONE JAR (2026-09-29): ask Supabase to add (or take 1) in ONE step inside the database
// (function mpe_add_treats). The first call for a kid also moves their old Dino jar in, once.
// Returns: the new jar total | null = this kid has no row yet | undefined = the call failed.
// delta 0 = just read the total (and do the one-time Dino move).
export async function addTreats(code: string, studentName: string, delta: number): Promise<number | null | undefined> {
  try {
    const { data, error } = await supabase.rpc("mpe_add_treats", { p_code: code, p_name: studentName, p_delta: delta });
    if (error) { console.error("[cloudSave] addTreats failed:", error.message); return undefined; }
    if (data === null || data === undefined) return null;
    console.log("[cloudSave] treats", delta >= 0 ? "+" + delta : delta, "->", data, code, studentName);
    return Number(data);
  } catch (e) {
    console.error("[cloudSave] addTreats threw:", e);
    return undefined;
  }
}

// COINS: add a grammar win's coins (delta 0 = just read). The database (function mpe_add_coins) adds it
// in one step and returns the kid's coin total (won - spent). number = total, null = no row, undefined = failed.
export async function addCoins(code: string, studentName: string, delta: number): Promise<number | null | undefined> {
  try {
    const { data, error } = await supabase.rpc("mpe_add_coins", { p_code: code, p_name: studentName, p_delta: delta });
    if (error) { console.error("[cloudSave] addCoins failed:", error.message); return undefined; }
    if (data === null || data === undefined) return null;
    console.log("[cloudSave] coins +" + delta, "->", data, code, studentName);
    return Number(data);
  } catch (e) {
    console.error("[cloudSave] addCoins threw:", e);
    return undefined;
  }
}

// PRIZES (step 5.4, 2026-10-02): ask the database for a prize by NAME (e.g. "savanna:giraffe:grown").
// The database (function mpe_claim_prize) decides the amounts and pays each prize ONCE per kid.
// Returns {paid, coins, treats, jar} | null = no row yet | undefined = the call failed.
export async function claimPrize(code: string, studentName: string, prize: string): Promise<{ paid: boolean; coins?: number; treats?: number; jar?: number } | null | undefined> {
  try {
    const { data, error } = await supabase.rpc("mpe_claim_prize", { p_code: code, p_name: studentName, p_prize: prize });
    if (error) { console.error("[cloudSave] claimPrize failed:", error.message); return undefined; }
    if (data === null || data === undefined) return null;
    console.log("[cloudSave] prize", prize, "->", data, code, studentName);
    return data as { paid: boolean; coins?: number; treats?: number; jar?: number };
  } catch (e) {
    console.error("[cloudSave] claimPrize threw:", e);
    return undefined;
  }
}

// WINS (badges, 2026-10-15): the kid's game WIN counters (mpe_win adds them) - Vocab Champ / Grammar Star badges at 25.
// Returns {vocab, grammar} | null = no row yet | undefined = could not read. READ ONLY.
export async function loadWins(code: string, studentName: string): Promise<{ vocab: number; grammar: number } | null | undefined> {
  try {
    const { data, error } = await supabase
      .from("student_progress")
      .select("wins_vocab, wins_grammar")
      .eq("code", code)
      .eq("student_name", studentName)
      .maybeSingle();
    if (error) { console.error("[cloudSave] wins load failed:", error.message); return undefined; }
    if (!data) return null;
    return { vocab: Number(data.wins_vocab) || 0, grammar: Number(data.wins_grammar) || 0 };
  } catch (e) {
    console.error("[cloudSave] wins load threw:", e);
    return undefined;
  }
}

// PRIZES: the kid's list of prizes already paid (also = badges won, e.g. "savanna:complete").
// Returns the list | null = no row yet | undefined = could not read.
export async function loadPrizes(code: string, studentName: string): Promise<string[] | null | undefined> {
  try {
    const { data, error } = await supabase
      .from("student_progress")
      .select("prizes_claimed")
      .eq("code", code)
      .eq("student_name", studentName)
      .maybeSingle();
    if (error) { console.error("[cloudSave] prizes load failed:", error.message); return undefined; }
    if (!data) return null;
    return Array.isArray(data.prizes_claimed) ? data.prizes_claimed : [];
  } catch (e) {
    console.error("[cloudSave] prizes load threw:", e);
    return undefined;
  }
}

// DAILY PRIZE (2026-10-03): open today's box (database mpe_claim_daily_prize: one per Taiwan day, any device/world,
// amounts live there). Returns {paid, day, treats, coins, pieces, jar} | null = no row | undefined = failed.
export async function claimDailyPrize(code: string, studentName: string): Promise<{ paid: boolean; day?: number; treats?: number; coins?: number; pieces?: number; jar?: number } | null | undefined> {
  try {
    const { data, error } = await supabase.rpc("mpe_claim_daily_prize", { p_code: code, p_name: studentName });
    if (error) { console.error("[cloudSave] daily prize failed:", error.message); return undefined; }
    if (data === null || data === undefined) return null;
    console.log("[cloudSave] daily prize ->", data, code, studentName);
    return data as { paid: boolean; day?: number; treats?: number; coins?: number; pieces?: number; jar?: number };
  } catch (e) {
    console.error("[cloudSave] daily prize threw:", e);
    return undefined;
  }
}

// DAILY PRIZE status: today's box number (1-7) + already taken today? | null = no row | undefined = could not read.
export async function loadDailyPrize(code: string, studentName: string): Promise<{ day: number; claimedToday: boolean; box: number } | null | undefined> {
  try {
    const { data, error } = await supabase
      .from("student_progress")
      .select("daily_claimed, daily_box")
      .eq("code", code)
      .eq("student_name", studentName)
      .maybeSingle();
    if (error) return undefined;
    if (!data) return null;
    const today = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Taipei" }); // YYYY-MM-DD
    const box = typeof data.daily_box === "number" ? data.daily_box : 0;
    return { day: (box % 7) + 1, claimedToday: data.daily_claimed === today, box }; // box = boxes opened so far (Daily Visitor badge)
  } catch {
    return undefined;
  }
}

// SEEN FLAGS (2026-10-03): things a kid has already seen, e.g. "theater:savanna:giraffe" (red dot off on every device).
export async function loadSeen(code: string, studentName: string): Promise<string[] | null | undefined> {
  try {
    const { data, error } = await supabase
      .from("student_progress")
      .select("seen_flags")
      .eq("code", code)
      .eq("student_name", studentName)
      .maybeSingle();
    if (error) { console.error("[cloudSave] seen load failed:", error.message); return undefined; }
    if (!data) return null;
    return Array.isArray(data.seen_flags) ? data.seen_flags : [];
  } catch (e) {
    console.error("[cloudSave] seen load threw:", e);
    return undefined;
  }
}
// SEEN NAMES must be 3 parts of LETTERS ONLY (live database rule in mpe_mark_seen: ^[a-z]+:[a-z]+:[a-z]+$ - checked 2026-10-14).
// seenWord turns numbers into letters (0=a ... 9=j) and drops anything else: visit5 -> visitf, set 12 -> bc.
export const seenWord = (s: string | number) => String(s).toLowerCase().replace(/[0-9]/g, d => "abcdefghij"[Number(d)]).replace(/[^a-z]/g, "");
export const badgeSeen = (id: string) => `badge:${seenWord(id)}:seen`;                       // e.g. badge:hello:seen
export const cardSeen = (set: number, n: number) => `card:${seenWord(set)}:${seenWord(n)}`;   // e.g. set 3 card 7 = card:d:h
export async function markSeen(code: string, studentName: string, flag: string) {
  try {
    const { error } = await supabase.rpc("mpe_mark_seen", { p_code: code, p_name: studentName, p_flag: flag });
    if (error) console.error("[cloudSave] mark seen failed:", error.message);
    else console.log("[cloudSave] seen", flag, code, studentName);
  } catch (e) {
    console.error("[cloudSave] mark seen threw:", e);
  }
}

// ONE DAILY TREAT per kid per day (Taiwan date), whatever the device or world. The database
// (function mpe_claim_daily) refuses a second claim the same day. Returns the jar total like addTreats.
export async function claimDailyTreat(code: string, studentName: string): Promise<number | null | undefined> {
  try {
    const { data, error } = await supabase.rpc("mpe_claim_daily", { p_code: code, p_name: studentName });
    if (error) { console.error("[cloudSave] daily claim failed:", error.message); return undefined; }
    if (data === null || data === undefined) return null;
    console.log("[cloudSave] daily claim ->", data, code, studentName);
    return Number(data);
  } catch (e) {
    console.error("[cloudSave] daily claim threw:", e);
    return undefined;
  }
}

// Has this kid already had today's daily treat (on ANY device / world)? true / false, undefined = could not check.
export async function dailyClaimedToday(code: string, studentName: string): Promise<boolean | undefined> {
  try {
    const { data, error } = await supabase
      .from("student_progress")
      .select("daily_claimed")
      .eq("code", code)
      .eq("student_name", studentName)
      .maybeSingle();
    if (error) return undefined;
    if (!data) return false;
    const today = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Taipei" }); // YYYY-MM-DD
    return data.daily_claimed === today;
  } catch {
    return undefined;
  }
}

export async function saveDataToCloud(
  code: string,
  studentName: string,
  activePet: string | null,
  data: Record<string, any>
) {
  try {
    // SAVE ONLY ONE WORLD (2026-10-01): the database merges ONLY the sections sent (data = data || parts)
    // in one step - no read-then-write gap, so two devices/worlds can't overwrite each other.
    // No row yet -> the database creates it (device wins first). Also sets last_login. active_pet only if not null.
    const { error } = await supabase.rpc("mpe_save_world", {
      p_code: code, p_name: studentName, p_parts: data, p_active_pet: activePet,
    });
    if (error) console.error("[cloudSave] data save failed:", error.message);
    else console.log("[cloudSave] data saved:", code, studentName);
  } catch (e) {
    console.error("[cloudSave] data save threw:", e);
  }
}

export async function saveDinoJarToCloud(code: string, studentName: string, jar: number) {
  try {
    // Dino jar lives inside data.dino.jar (not the treats column). Read blob, bump only jar, write back.
    const { data: existing } = await supabase
      .from("student_progress")
      .select("data")
      .eq("code", code)
      .eq("student_name", studentName)
      .maybeSingle();
    const blob = { ...(existing?.data ?? {}) };
    blob.dino = { ...(blob.dino ?? {}), jar };
    const { error } = await supabase
      .from("student_progress")
      .upsert(
        { code, student_name: studentName, data: blob },
        { onConflict: "code,student_name" }
      );
    if (error) console.error("[cloudSave] dino jar save failed:", error.message);
    else console.log("[cloudSave] dino jar saved:", code, studentName, jar);
  } catch (e) {
    console.error("[cloudSave] dino jar save threw:", e);
  }
}

export async function loadDataFromCloud(
  code: string,
  studentName: string
): Promise<{ activePet: string | null; data: Record<string, any> | null } | null> {
  try {
    const { data: row, error } = await supabase
      .from("student_progress")
      .select("active_pet, data")
      .eq("code", code)
      .eq("student_name", studentName)
      .maybeSingle();
    if (error) { console.error("[cloudSave] data load failed:", error.message); return null; }
    if (!row) return null;
    return { activePet: row.active_pet ?? null, data: row.data ?? null };
  } catch (e) {
    console.error("[cloudSave] data load threw:", e);
    return null;
  }
}

export async function updateLastLogin(code: string, studentName: string) {
  try {
    const { error } = await supabase
      .from("student_progress")
      .update({ last_login: new Date().toISOString() })
      .eq("code", code)
      .eq("student_name", studentName);
    if (error) console.error("[cloudSave] last_login update failed:", error.message);
    else console.log("[cloudSave] last_login updated:", code, studentName);
  } catch (e) {
    console.error("[cloudSave] last_login update threw:", e);
  }
}

// PUZZLE MIXUP (2026-10-11, database puzzle_step1_20261011.sql). Pieces jar = puzzle_earned - puzzle_used.
// loadPuzzle: where the kid is | null = no row | undefined = could not read.
export async function loadPuzzle(code: string, studentName: string): Promise<{ idx: number; gone: number[]; pieces: number } | null | undefined> {
  try {
    const { data, error } = await supabase
      .from("student_progress")
      .select("puzzle_idx, puzzle_gone, puzzle_earned, puzzle_used")
      .eq("code", code)
      .eq("student_name", studentName)
      .order("id")
      .limit(1)
      .maybeSingle();
    if (error) { console.error("[cloudSave] puzzle load failed:", error.message); return undefined; }
    if (!data) return null;
    return { idx: Number(data.puzzle_idx) || 0, gone: Array.isArray(data.puzzle_gone) ? data.puzzle_gone.map(Number) : [], pieces: (Number(data.puzzle_earned) || 0) - (Number(data.puzzle_used) || 0) };
  } catch (e) {
    console.error("[cloudSave] puzzle load threw:", e);
    return undefined;
  }
}
// puzzlePop: the DATABASE checks the cost + pays the puzzle prize once. ok:false = not enough / out of date (use its numbers).
export type PuzzlePop = { ok: boolean; why?: string; done?: boolean; pieces: number; idx: number; gone: number[]; coins?: number; treats?: number; jar?: number };
export async function puzzlePop(code: string, studentName: string, puzzle: number, cover: number): Promise<PuzzlePop | null | undefined> {
  try {
    const { data, error } = await supabase.rpc("mpe_puzzle_pop", { p_code: code, p_name: studentName, p_puzzle: puzzle, p_cover: cover });
    if (error) { console.error("[cloudSave] puzzle pop failed:", error.message); return undefined; }
    if (data === null || data === undefined) return null;
    console.log("[cloudSave] puzzle pop ->", data, code, studentName);
    return data as PuzzlePop;
  } catch (e) {
    console.error("[cloudSave] puzzle pop threw:", e);
    return undefined;
  }
}
// addPieces: +N pieces (a game win = +1; 0 = just read). Returns pieces to spend | null = no row | undefined = failed.
export async function addPieces(code: string, studentName: string, delta: number): Promise<number | null | undefined> {
  try {
    const { data, error } = await supabase.rpc("mpe_add_pieces", { p_code: code, p_name: studentName, p_delta: delta });
    if (error) { console.error("[cloudSave] add pieces failed:", error.message); return undefined; }
    if (data === null || data === undefined) return null;
    console.log("[cloudSave] pieces +", delta, "->", data, code, studentName);
    return Number(data);
  } catch (e) {
    console.error("[cloudSave] add pieces threw:", e);
    return undefined;
  }
}

// CARD ALBUM + WIN COUNTERS (2026-10-14, database cards_step5_20261013.sql).
// addWin: a game WIN = +1 piece + win counter + remembers which game/level (replaces addPieces(+1) on wins).
// key = 'vocab:<game>' or 'vocab:<game>:<book>-<unit>' or 'grammar:<game>:<level>' (anything else = the DB refuses).
// Returns pieces to spend | null = no row yet | undefined = failed.
export async function addWin(code: string, studentName: string, key: string): Promise<number | null | undefined> {
  try {
    const { data, error } = await supabase.rpc("mpe_win", { p_code: code, p_name: studentName, p_key: key });
    if (error) { console.error("[cloudSave] win failed:", error.message); return undefined; }
    if (data === null || data === undefined) return null;
    console.log("[cloudSave] win", key, "-> pieces", data, code, studentName);
    return Number(data);
  } catch (e) {
    console.error("[cloudSave] win threw:", e);
    return undefined;
  }
}
// openPacks: n packs (1..10). The DATABASE takes 200 coins each, picks the cards and pays set/album prizes ONCE.
// ok:false why 'short' = not enough coins (use its numbers). cards = {"<set>-<n>": how many}.
export type CardDraw = { set: number; n: number; new: boolean; pts: number };
export type CardPacks = { ok: boolean; why?: string; packs?: CardDraw[][]; coins: number; cards: Record<string, number>; swap: number; sets?: number[]; album?: boolean; prizeCoins?: number; prizeTreats?: number; jar?: number | null };
export async function openPacks(code: string, studentName: string, n: number): Promise<CardPacks | null | undefined> {
  try {
    const { data, error } = await supabase.rpc("mpe_open_packs", { p_code: code, p_name: studentName, p_n: n });
    if (error) { console.error("[cloudSave] open packs failed:", error.message); return undefined; }
    if (data === null || data === undefined) return null;
    console.log("[cloudSave] open packs", n, "->", data, code, studentName);
    return data as CardPacks;
  } catch (e) {
    console.error("[cloudSave] open packs threw:", e);
    return undefined;
  }
}
// pickCard: 10 swap points = one MISSING card. ok:false why 'short' (points) | 'have' (already owned). Same prizes as packs.
export type CardPick = { ok: boolean; why?: string; coins: number; cards: Record<string, number>; swap: number; sets?: number[]; album?: boolean; prizeCoins?: number; prizeTreats?: number; jar?: number | null };
export async function pickCard(code: string, studentName: string, set: number, n: number): Promise<CardPick | null | undefined> {
  try {
    const { data, error } = await supabase.rpc("mpe_pick_card", { p_code: code, p_name: studentName, p_set: set, p_n: n });
    if (error) { console.error("[cloudSave] pick card failed:", error.message); return undefined; }
    if (data === null || data === undefined) return null;
    console.log("[cloudSave] pick card", set, n, "->", data, code, studentName);
    return data as CardPick;
  } catch (e) {
    console.error("[cloudSave] pick card threw:", e);
    return undefined;
  }
}
// loadCards: the kid's album (read only) | null = no row | undefined = could not read.
export async function loadCards(code: string, studentName: string): Promise<{ cards: Record<string, number>; swap: number; coins: number; seen: string[] } | null | undefined> {
  try {
    const { data, error } = await supabase
      .from("student_progress")
      .select("cards, card_swap, coins_earned, coins_spent, seen_flags")
      .eq("code", code)
      .eq("student_name", studentName)
      .order("id")
      .limit(1)
      .maybeSingle();
    if (error) { console.error("[cloudSave] cards load failed:", error.message); return undefined; }
    if (!data) return null;
    const cards = data.cards && typeof data.cards === "object" && !Array.isArray(data.cards) ? (data.cards as Record<string, number>) : {};
    return { cards, swap: Number(data.card_swap) || 0, coins: (Number(data.coins_earned) || 0) - (Number(data.coins_spent) || 0), seen: Array.isArray(data.seen_flags) ? data.seen_flags : [] };
  } catch (e) {
    console.error("[cloudSave] cards load threw:", e);
    return undefined;
  }
}
