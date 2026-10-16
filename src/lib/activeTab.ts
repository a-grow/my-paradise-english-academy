import { supabase } from "./supabase";

// NEWEST TAB WINS (2026-10-16). Database: BACKUPFILES/newest_tab_step1_20261016.sql (column active_tab, mpe_claim_tab, mpe_tab_ok).
// Opening a world page makes THIS browser tab the kid's active one. If another tab/device opens a world page later,
// this tab stops feeding/saving and shows 'You are playing on another device' (src/components/OtherDevice.tsx).
// TAB_ID is made fresh on every page load (memory only): a reload or a new tab = a new id; page moves inside one tab keep it.
export const TAB_ID = (Math.random().toString(36).slice(2, 12) + Date.now().toString(36)).replace(/[^a-z0-9]/g, "");

const WAIT_MS = 4000; // no answer within 4s = carry on (never lock a kid out)

async function rpcSoft(fn: string, args: Record<string, unknown>): Promise<{ data: unknown; error: unknown } | null> {
  try {
    const call = Promise.resolve(supabase.rpc(fn, args)).then(r => ({ data: r.data as unknown, error: r.error as unknown }));
    const late = new Promise<null>(res => setTimeout(() => res(null), WAIT_MS));
    return await Promise.race([call, late]);
  } catch {
    return null;
  }
}

// This tab is now the active one. No row yet = nothing happens. Failure = ignored.
export async function claimTab(code: string, studentName: string): Promise<void> {
  const r = await rpcSoft("mpe_claim_tab", { p_code: code, p_name: studentName, p_tab: TAB_ID });
  if (!r || r.error) console.warn("[activeTab] claim not confirmed (carry on)");
}

// false ONLY when the database clearly says another tab took over. Any error / no answer = true (keep playing).
export async function tabOk(code: string, studentName: string): Promise<boolean> {
  const r = await rpcSoft("mpe_tab_ok", { p_code: code, p_name: studentName, p_tab: TAB_ID });
  if (!r || r.error) return true;
  return r.data !== false;
}
