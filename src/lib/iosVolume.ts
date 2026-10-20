// iPad / iPhone VOLUME FIX (Andy 2026-10-15): iOS Safari IGNORES audio.volume (every sound plays at full volume and
// .volume always reads 1). The app quiets music by setting a tiny volume (world music under the Badge room, Video Theater,
// celebrations) and fades by stepping the volume down - on iOS that never happened (two songs at once), and a fade that
// WAITS for silence never finished (Grammar game cards needed several taps).
// iOS only (detected by testing, not by device name): the volume we set is remembered (so fades finish), a volume at or
// below 0.05 PAUSES a playing sound, and raising it again resumes only what this fix paused. Computers: nothing changes.
const QUIET = 0.05;
type M = HTMLMediaElement & { __mpeVol?: number; __mpeQuiet?: boolean };

// iPad sound (Andy 10-15): sound effects also play when the iPad is on silent, and every Web Audio sound wakes up on a
// finger LIFT / click / key (iOS only unlocks sound then, not on touchstart). Harmless on computers.
const ALL_CTX: AudioContext[] = []; // every Web Audio channel the app opens (the blocked-sound fallback re-uses a woken one)
function installAudioWake() {
  try {
    const nav = navigator as Navigator & { audioSession?: { type: string } };
    if (nav.audioSession) nav.audioSession.type = "playback";
    const w = window as unknown as { AudioContext?: typeof AudioContext; webkitAudioContext?: typeof AudioContext };
    const AC0 = w.AudioContext || w.webkitAudioContext;
    if (!AC0) return;
    const all = ALL_CTX;
    const ACW = function (o?: AudioContextOptions) { const c = o ? new AC0(o) : new AC0(); all.push(c); return c; } as unknown as typeof AudioContext;
    ACW.prototype = AC0.prototype;
    w.AudioContext = ACW; if (w.webkitAudioContext) w.webkitAudioContext = ACW;
    const wake = () => all.forEach(c => { if (c.state === "suspended" || (c.state as string) === "interrupted") c.resume().catch(() => { }); });
    ["touchend", "click", "keydown", "pointerup", "mousedown"].forEach(t => window.addEventListener(t, wake, true));
  } catch { /* never break the app over sound */ }
}

export function installIosVolumeFix() {
  installAudioWake();
  try {
    if (typeof document === "undefined") return;
    const probe = document.createElement("audio");
    probe.volume = 0.5;
    // iPad/iPhone by name too: a real iPad may read back 0.5 on a blank test sound (no file = nothing to ignore) and still
    // ignore the volume of every real sound - the round-2 test alone may never have switched this fix on (Andy 10-15 23:17).
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && (navigator.maxTouchPoints || 0) > 1);
    if (!ios && Math.abs(probe.volume - 0.5) < 0.01) return; // volume works here (computers) - leave everything alone
    const P = HTMLMediaElement.prototype;
    const d = Object.getOwnPropertyDescriptor(P, "volume");
    if (!d || !d.get || !d.set) return;
    const nativePause = P.pause;
    let ours = false;
    P.pause = function (this: M) { if (!ours) this.__mpeQuiet = false; return nativePause.call(this); }; // a real pause stays paused
    // asked to PLAY while quiet (e.g. the world song's 'start on the next tap' firing while the Badge room is open): stay silent
    // and start when the volume comes up. A muted play + pause keeps the sound allowed to start later (Andy 10-15 23:17).
    const nativePlay = P.play;
    // BLOCKED SOUND FALLBACK (Andy 10-19 iPad: no win music): iOS refuses play() when no finger tap started it (win screens,
    // prize parades - sounds started by a timer). The Web Audio channel below was woken by an earlier tap, so a refused SHORT
    // sound (not looping, not a video, under 12 s) plays through it instead. Music and videos are never touched.
    // 10-20 review: it RE-USES a channel the app already opened and a tap already woke (older iPads limit how many channels a
    // page may open - an extra one could have silenced another sound).
    const bufs = new WeakMap<AudioContext, Map<string, Promise<AudioBuffer>>>();
    const viaWebAudio = (el: M) => {
      try {
        const src = el.currentSrc || el.src;
        if (!src || el.muted || el.loop || el instanceof HTMLVideoElement) return;
        const ctx = ALL_CTX.find(c => c.state === "running");
        if (!ctx) return;
        let m = bufs.get(ctx);
        if (!m) { m = new Map(); bufs.set(ctx, m); }
        let b = m.get(src);
        if (!b) {
          const mm = m;
          b = fetch(src).then(r => r.arrayBuffer()).then(a => new Promise<AudioBuffer>((ok, no) => { ctx.decodeAudioData(a, ok, no); }));
          mm.set(src, b); b.catch(() => mm.delete(src));
        }
        const t0 = performance.now();
        b.then(buf => {
          if (ctx.state !== "running" || buf.duration > 12 || performance.now() - t0 > 1500) return; // late or long = skip (never a stray song)
          const sn = ctx.createBufferSource(), gn = ctx.createGain();
          sn.buffer = buf; gn.gain.value = Math.max(0, Math.min(1, el.__mpeVol ?? 1));
          sn.connect(gn); gn.connect(ctx.destination); sn.start();
        }).catch(() => { });
      } catch { /* never break the app over sound */ }
    };
    P.play = function (this: M) {
      if ((this.__mpeVol ?? 1) > QUIET) {
        const p0 = nativePlay.call(this);
        if (p0 && p0.catch) p0.catch((err: unknown) => { if (err && (err as { name?: string }).name === "NotAllowedError") viaWebAudio(this); });
        return p0;
      }
      this.__mpeQuiet = true;
      const wasMuted = this.muted; this.muted = true;
      const p = nativePlay.call(this);
      p.then(() => {
        if ((this.__mpeVol ?? 1) <= QUIET) { ours = true; try { nativePause.call(this); } finally { ours = false; } }
        this.muted = wasMuted;
      }, () => { this.muted = wasMuted; });
      return p;
    };
    Object.defineProperty(P, "volume", {
      configurable: true, enumerable: d.enumerable,
      get(this: M) { return this.__mpeVol ?? d.get!.call(this); },
      set(this: M, v: number) {
        if (typeof v !== "number" || isNaN(v)) return;
        this.__mpeVol = v;
        try { d.set!.call(this, Math.max(0, Math.min(1, v))); } catch { /* */ }
        if (v <= QUIET) {
          if (!this.paused) { this.__mpeQuiet = true; ours = true; try { nativePause.call(this); } finally { ours = false; } }
        } else if (this.__mpeQuiet) {
          this.__mpeQuiet = false;
          this.play().catch(() => { });
        }
      },
    });
  } catch { /* never break the app over sound */ }
}
