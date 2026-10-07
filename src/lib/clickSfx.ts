// CLICK SOUND on every button a kid taps (Andy 2026-10-07: close / back / continue buttons etc.), the same click as the
// world page (public/worlds/ui/click.mp3, which already plays it on its own .sv-tap buttons).
// useClickSfx(on): while the page is mounted, any tap on a <button> (or anything with a pointer cursor) clicks.
// Skips disabled buttons and anything inside [data-noclick] (buttons that play their own sound).
import { useEffect, useRef } from "react";

const URL = "/worlds/ui/click.mp3";
let pool: HTMLAudioElement[] = [];
let n = 0;
export const playClick = () => {
  try {
    if (!pool.length) pool = [0, 1, 2].map(() => { const a = new Audio(URL); a.volume = 0.5; return a; });
    const a = pool[n++ % pool.length];
    a.currentTime = 0; a.play().catch(() => { });
  } catch { /* */ }
};

const tappable = (start: EventTarget | null) => {
  let el = start instanceof Element ? start : null;
  if (!el || el.closest("[data-noclick]")) return false;
  for (let i = 0; el && i < 6; i++, el = el.parentElement) {
    if (el.tagName === "BUTTON") return !(el as HTMLButtonElement).disabled;
    if (el.getAttribute("role") === "button") return true;
    if (getComputedStyle(el).cursor === "pointer") return true;
  }
  return false;
};

// CLOSE BEEP (Andy 2026-10-07): a red X button (the rb_exit picture, or anything marked data-closex) plays this beep
// INSTEAD of the click.
let beeps: HTMLAudioElement[] = [];
let bn = 0;
export const playCloseBeep = () => {
  try {
    if (!beeps.length) beeps = [0, 1].map(() => { const a = new Audio("/worlds/ui/close_beep.mp3"); a.volume = 0.6; return a; });
    const a = beeps[bn++ % beeps.length];
    a.currentTime = 0; a.play().catch(() => { });
  } catch { /* */ }
};
export const isCloseBtn = (start: EventTarget | null) => {
  const el = start instanceof Element ? start : null;
  if (!el) return false;
  if (el.closest("[data-closex]")) return true;
  if (el.tagName === "IMG" && (el as HTMLImageElement).src.includes("rb_exit")) return true;
  const host = el.closest("button,[role=button],.sv-tap,.ca-tap");
  return !!host && !!host.querySelector(':scope > img[src*="rb_exit"]');
};

export function useClickSfx(on: boolean) {
  const onRef = useRef(on); onRef.current = on;
  useEffect(() => {
    const h = (e: PointerEvent) => {
      if (!onRef.current || e.isPrimary === false) return;
      if (isCloseBtn(e.target)) playCloseBeep(); else if (tappable(e.target)) playClick();
    };
    document.addEventListener("pointerdown", h, true);
    return () => document.removeEventListener("pointerdown", h, true);
  }, []);
}
