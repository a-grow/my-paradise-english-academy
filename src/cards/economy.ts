// CARD ALBUM numbers shared by the album page and the world page's album meter (one place, so they can never disagree).
// The REAL price will live in the database pack function (cloud step) - keep this the same number.
export const PACK_PRICE = 200;          // coins per card pack (Andy 2026-10-07: grammar wins pay ~80, plus prizes; lowering later is safe)
export const DEMO_COINS = 640;          // teacher code 1006 pretend coins (display only, nothing saves) = 3 packs ready
// 1006 (Andy 2026-10-14): ONE pretend coin number for the browser tab, shared by the world page wallet and the Card Album
// (213 on one screen and 640 on the other was confusing). Nothing is saved anywhere else.
const DEMO_COINS_KEY = "mpe_demo_coins";
export const demoCoinsGet = () => { try { const n = parseInt(sessionStorage.getItem(DEMO_COINS_KEY) ?? "", 10); return Number.isFinite(n) && n >= 0 ? n : DEMO_COINS; } catch { return DEMO_COINS; } };
export const demoCoinsSet = (n: number) => { try { sessionStorage.setItem(DEMO_COINS_KEY, String(Math.max(0, Math.round(n)))); } catch { /* */ } };
export const ALBUM_FOR_ALL = false;     // false = the Card Album + its meter are only on for 1006 (until the cloud step)
