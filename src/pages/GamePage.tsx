import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import GameTest from "./GameTest";
import { saveJarToCloud, saveDinoJarToCloud } from "@/lib/cloudSave";

const MASTER_CODE = "1006";
const TREATS_BY_DIFF: Record<string, number> = { easy: 1, medium: 2, hard: 3 };
const DAILY_TREAT_CAP = 999999; // no cap (Andy rule)

const GamePage = () => {
  const { world, code, studentName, book } = useParams<{ world?: string; code: string; studentName: string; book: string }>();
  const studentBook = parseInt(book || "1", 10);
  const navigate = useNavigate();
  const isMaster = code === MASTER_CODE;
  const today = new Date().toDateString();

  const gameWorld = world || "ocean";
  const fromDino = gameWorld === "dino";
  const jarKey = gameWorld === "dino" ? `mpe_dino_jar_${code}_${studentName}` : `mpe_jar_${code}_${studentName}`;
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
  const [musicOn, setMusicOn] = useState(() => localStorage.getItem("mpe_music") !== "off");
  const [volume, setVolume] = useState(() => parseFloat(localStorage.getItem("mpe_volume") || "0.18"));

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);

  const treatsCappedToday = false; // no cap (Andy rule)

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio("/game-music.mp3");
      audioRef.current.loop = true;
    }
    if (musicOn) {
      audioRef.current.volume = 0;
      audioRef.current.play().catch(() => {});
      let v = 0;
      const target = volume * 0.25;
      const fade = setInterval(() => {
        v = Math.min(v + target / 40, target);
        if (audioRef.current) audioRef.current.volume = v;
        if (v >= target) clearInterval(fade);
      }, 50);
      return () => { clearInterval(fade); audioRef.current?.pause(); };
    } else {
      audioRef.current.pause();
    }
  }, [musicOn]);

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
      playCelebrate();
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
    // Push fresh jar total to cloud so the World doesn't reload a stale value.
    if (gameWorld === "dino") saveDinoJarToCloud(code, studentName, newJarTotal);
    else saveJarToCloud(code, studentName, newJarTotal);

    // Update state — both updates trigger GameTest re-render with fresh claimState
    setTreatsEarnedToday(newTotal);

    setLastTreats(treats);
    playCelebrate();
    setShowCelebration(true);
  }, [isMaster, capKey, jarKey, playCelebrate]);

  if (!code || !studentName) return null;

  return (
    <div style={{ position: "relative", minHeight: "100vh" }}>



      {/* ARCADE */}
      <GameTest
        onClaim={handleClaim}
        onBackToWorld={() => { sessionStorage.removeItem("mpe_from_dino"); navigate(fromDino ? `/dino/${code}/${studentName}` : `/world/${code}/${studentName}`); }}
        claimedCombos={claimedCombos}
        treatsCappedToday={treatsCappedToday}
        treatsEarnedToday={treatsEarnedToday}
        fromDino={fromDino}
        studentBook={studentBook}
      />

    </div>
  );
};

export default GamePage;
