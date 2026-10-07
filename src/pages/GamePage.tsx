import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useHowtoSeen } from "@/lib/howtoSeen";
import GameTest from "./GameTest";
import { addTreats, addCoins } from "@/lib/cloudSave";

const MASTER_CODE = "1006";
const TREATS_BY_DIFF: Record<string, number> = { easy: 1, medium: 2, hard: 3 };
const DAILY_TREAT_CAP = 999999; // no cap (Andy rule)

const GamePage = () => {
  const { world, code, studentName, book } = useParams<{ world?: string; code: string; studentName: string; book: string }>();
  const studentBook = parseInt(book || "1", 10);
  const navigate = useNavigate();
  const isMaster = code === MASTER_CODE;
  useHowtoSeen(code, studentName); // How to Play 'seen' list from the cloud (Andy 2026-10-07)
  const today = new Date().toDateString();

  const gameWorld = world || "ocean";
  const fromDino = gameWorld === "dino";
  const jarKey = `mpe_jar_${code}_${studentName}`; // ONE JAR for every world (2026-09-29)
  const capKey = `mpe_arcade_cap_${code}_${studentName}_${today}`;
  const comboKey = (unitId: number, gameId: string, diff: string) =>
    `mpe_arcade_${code}_${studentName}_u${unitId}_${gameId}_${diff}_${today}`;

  const getTreatsEarnedToday = () =>
    parseInt(localStorage.getItem(capKey) || "0");

  const getClaimedCombos = (): Set<string> => {
    if (isMaster) return new Set();
    const claimed = new Set<string>();
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (!k) continue;
      const prefix = `mpe_arcade_${code}_${studentName}_`;
      const suffix = `_${today}`;
      if (k.startsWith(prefix) && k.endsWith(suffix) && !k.includes("_cap_")) {
        const comboId = k.slice(prefix.length, k.length - suffix.length);
        claimed.add(comboId);
      }
    }
    return claimed;
  };

  const [claimedCombos, setClaimedCombos] = useState<Set<string>>(getClaimedCombos);
  const [treatsEarnedToday, setTreatsEarnedToday] = useState(getTreatsEarnedToday);
  const [showCelebration, setShowCelebration] = useState(false);
  const [lastTreats, setLastTreats] = useState(1);
  const [musicOn, setMusicOn] = useState(true); // sound ON by default (Andy 2026-10-04); was the old worlds' shared mpe_music setting
  const [volume, setVolume] = useState(() => parseFloat(localStorage.getItem("mpe_volume") || "0.18"));
  const [track, setTrack] = useState<string | null>(null); // a game's own song (null = the arcade song) - 2026-10-04

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);

  const treatsCappedToday = false; // no cap (Andy rule)

  // MUSIC (Andy 2026-10-04): the arcade song on the menus; a game with its own song (track) plays that instead.
  // Game songs are pre-levelled files like the world songs (~-20 dB) -> played at full volume.
  useEffect(() => {
    if (track === "") return; // "" = silence (a game's win / lose screen) - the last run's cleanup already paused it
    const src = track ?? "/vocab/menu_music.mp3"; // new arcade song for the book/unit/game menus (Andy 2026-10-05, 60% under the old one; old: /game-music.mp3)
    if (!audioRef.current) {
      audioRef.current = new Audio(src);
      audioRef.current.loop = true;
    }
    if (!audioRef.current.src.endsWith(src)) { audioRef.current.pause(); audioRef.current.src = src; }
    if (musicOn) {
      audioRef.current.volume = 0;
      audioRef.current.play().catch(() => {});
      let v = 0;
      const target = 1; // every song file is pre-levelled to ~-22 LUFS (Andy 2026-10-05: equal volume everywhere)
      const fade = setInterval(() => {
        v = Math.min(v + target / 40, target);
        if (audioRef.current) audioRef.current.volume = v;
        if (v >= target) clearInterval(fade);
      }, 50);
      return () => { clearInterval(fade); audioRef.current?.pause(); };
    } else {
      audioRef.current.pause();
    }
  }, [musicOn, track]);
  // The computer voice: games send 'mpe-duck' while a word is spoken -> the music dips to 30% so the voice is clear.
  useEffect(() => {
    const on = (e: Event) => {
      const a = audioRef.current; if (!a || !musicOn) return;
      const full = 1;
      a.volume = (e as CustomEvent).detail ? full * 0.3 : full;
    };
    window.addEventListener("mpe-duck", on);
    return () => window.removeEventListener("mpe-duck", on);
  }, [musicOn, track, volume]);

  const playCelebrate = useCallback(() => {
    try {
      if (!ctxRef.current)
        ctxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      const ctx = ctxRef.current;
      const play = (freq: number, time: number, dur: number, vol = 0.18) => {
        const osc = ctx.createOscillator(); const g = ctx.createGain();
        osc.connect(g); g.connect(ctx.destination);
        osc.type = "sine"; osc.frequency.value = freq;
        g.gain.setValueAtTime(vol, ctx.currentTime + time);
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + time + dur);
        osc.start(ctx.currentTime + time);
        osc.stop(ctx.currentTime + time + dur + 0.01);
      };
      [523, 659, 784, 1047, 1319, 1568].forEach((f, i) => play(f, i * 0.09, 0.28, 0.2));
    } catch {}
  }, []);

  const handleClaim = useCallback((unitId: number, gameId: string, diff: string = "medium") => {
    if (isMaster) {
      const comboId = `u${unitId}_${gameId}_${diff}`;
      setClaimedCombos(prev => new Set([...prev, comboId]));
      setLastTreats(TREATS_BY_DIFF[diff] ?? 2);
      // playCelebrate(); // the win screen has its own sounds now (2026-10-04)
      setShowCelebration(true);
      return;
    }

    const key = comboKey(unitId, gameId, diff);
    const comboId = `u${unitId}_${gameId}_${diff}`;

    // Guards
    const earnedSoFar = getTreatsEarnedToday();
    // if (earnedSoFar >= DAILY_TREAT_CAP) return; // no cap (Andy rule)

    // Write to localStorage
    localStorage.setItem(key, "1");
    const treats = TREATS_BY_DIFF[diff] ?? 2;
    const newTotal = earnedSoFar + treats;
    localStorage.setItem(capKey, String(newTotal));
    const current = parseInt(localStorage.getItem(jarKey) || "0");
    const newJarTotal = current + treats;
    localStorage.setItem(jarKey, String(newJarTotal));
    // ONE JAR: send only "+treats" - the database adds it (never the device's whole number).
    addTreats(code, studentName, treats).then(total => { if (typeof total === "number") localStorage.setItem(jarKey, String(total)); });

    // Update state — both updates trigger GameTest re-render with fresh claimState
    setTreatsEarnedToday(newTotal);

    setLastTreats(treats);
    // playCelebrate(); // the win screen has its own sounds now (2026-10-04)
    setShowCelebration(true);
  }, [isMaster, capKey, jarKey, playCelebrate]);

  // COINS in the vocab games (Andy 2026-10-04): read the kid's total when a game starts (win screen pill);
  // pay "+N" only on a WIN - the database adds it (like the grammar games). Teacher code 1006 pays nothing.
  const coinTotal = useCallback(async () => (isMaster ? 0 : await addCoins(code!, studentName!, 0)), [isMaster, code, studentName]);
  const payCoins = useCallback((n: number) => { if (!isMaster && n > 0) addCoins(code!, studentName!, n); }, [isMaster, code, studentName]);

  // Back to the world the kid came from. Ocean + Dino: as before. A new-look world (savanna...) remembered its own
  // page address in this tab (mpe_return_world, set when its Vocab button was tapped) - only used if it is this kid's.
  const worldHome = () => {
    if (gameWorld !== "ocean" && gameWorld !== "dino") {
      const r = sessionStorage.getItem("mpe_return_world") || "";
      if (r.toLowerCase().includes(`/${(code ?? "").toLowerCase()}/${(studentName ?? "").toLowerCase()}`)) return r;
    }
    return fromDino ? `/dino/${code}/${studentName}` : `/world/${code}/${studentName}`;
  };

  if (!code || !studentName) return null;

  return (
    <div style={{ position: "relative", minHeight: "100vh" }}>



      {/* ARCADE */}
      <GameTest
        onClaim={handleClaim}
        onBackToWorld={() => { sessionStorage.removeItem("mpe_from_dino"); navigate(worldHome()); }}
        claimedCombos={claimedCombos}
        treatsCappedToday={treatsCappedToday}
        treatsEarnedToday={treatsEarnedToday}
        fromDino={fromDino}
        studentBook={studentBook}
        musicOn={musicOn}
        onToggleMusic={() => setMusicOn(m => !m)}
        onMusicTrack={setTrack}
        onCoinTotal={coinTotal}
        onPayCoins={payCoins}
      />

    </div>
  );
};

export default GamePage;
