// KID HERE (2026-10-23): has a real person tapped / clicked / typed on this page yet?
// Background loaders (e.g. Safari's Reading List keeps an offline copy and quietly reloads it every ~10 min) open
// kid pages with NO real input. Such a load may READ, but must never save, claim the device ("newest tab wins"),
// mark things seen or count play time. Only browser-made (trusted) input events count.
let here = false;
const waiters: Array<() => void> = [];
const EVS = ["pointerdown", "touchstart", "mousedown", "keydown"];
function onInput(e: Event) {
  if (!e.isTrusted || here) return;
  here = true;
  EVS.forEach(n => window.removeEventListener(n, onInput, true));
  waiters.splice(0).forEach(f => { try { f(); } catch { /* */ } });
}
if (typeof window !== "undefined") EVS.forEach(n => window.addEventListener(n, onInput, { capture: true, passive: true }));
export const kidHere = () => here;
export function whenKidHere(): Promise<void> {
  return here ? Promise.resolve() : new Promise<void>(res => { waiters.push(res); });
}
