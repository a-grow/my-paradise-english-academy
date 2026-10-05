// Hide the mouse cursor while it isn't being used (Andy 2026-10-05): every game, grammar + vocab.
// It shows again the moment the mouse moves or clicks, and hides after ~2s still.
// Works on the page itself and on a same-origin game iframe (pass its contentDocument). Returns a cleanup.
export function installIdleCursor(doc: Document, ms = 2000): () => void {
  const win = doc.defaultView || window;
  const style = doc.createElement("style");
  style.textContent = "html.mpe-idle-cursor, html.mpe-idle-cursor * { cursor: none !important; }";
  (doc.head || doc.documentElement).appendChild(style);
  const root = doc.documentElement;
  let t = 0;
  const wake = () => {
    root.classList.remove("mpe-idle-cursor");
    win.clearTimeout(t);
    t = win.setTimeout(() => root.classList.add("mpe-idle-cursor"), ms);
  };
  const evs = ["mousemove", "mousedown", "pointerdown", "wheel"];
  evs.forEach(e => doc.addEventListener(e, wake, { passive: true }));
  wake();
  return () => {
    evs.forEach(e => doc.removeEventListener(e, wake));
    win.clearTimeout(t);
    root.classList.remove("mpe-idle-cursor");
    style.remove();
  };
}
