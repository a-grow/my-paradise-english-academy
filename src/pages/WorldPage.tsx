import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { saveDataToCloud, loadDataFromCloud, saveJarToCloud, addTreats, addCoins, claimPrize, loadPrizes, claimDailyPrize, loadDailyPrize, claimDailyTreat, dailyClaimedToday } from "@/lib/cloudSave";
import { getAnimalStage, getAnimalStageIdx, type Animal } from "@/worlds/types";
import type { WorldConfig } from "@/worlds";

const MASTER_CODE = "1006";

// WORLD TEMPLATE (step 4, 2026-09-29): ONE brain for every world. useWorldBrain holds ALL the rules
// (saving, cloud read-back, feeding, unlocking, daily treat, visit-5, level-up, world finished).
// Nothing here names an animal, a save key or a color: animals + save places come from the world config
// (src/worlds/index.ts + storage.ts), the LOOK comes from the world's skin (src/worlds/skins/).
// The skins are today's Ocean + Dino pages' looks, copied as-is; the world-page makeover (step d) replaces them.

// ── THE BRAIN (every world) ─────────────────────────────────────────────────────
export const useWorldBrain = (world: WorldConfig) => {
  const ANIMALS = world.animals;
  const K = world.skin; // this world's look + sounds (src/worlds/skins/)
  const { code: rawCode, studentName: rawStudentName } = useParams<{ code: string; studentName: string }>();
  const code = rawCode ? rawCode.toUpperCase() : rawCode;
  const studentName = rawStudentName ? rawStudentName.toLowerCase() : rawStudentName;
  const S = world.makeSave(code ?? "", studentName ?? ""); // this world's save places (exact names, never renamed)
  const { family } = useAuth();
  const navigate = useNavigate();

  const isMaster = code === MASTER_CODE;
  if (isMaster && world.legacyMasterCleanup) { // old Ocean teacher-test cleanup, kept as-is
    localStorage.removeItem(`mpe_game_claimed_${code}_Test_${new Date().toDateString()}`);
    localStorage.removeItem(`mpe_levelup_${code}_Test`);
  }

  // ONE JAR (2026-09-29): every world uses the same jar (treats column / local key mpe_jar_).
  const [jarTreats, setJarTreats] = useState(() => isMaster ? 99 : parseInt(localStorage.getItem(`mpe_jar_${code}_${studentName}`) || "0"));
  // The OLD Dino jar (data.dino.jar) is kept frozen as a record - never changed, never deleted.
  const oldDinoJar = useRef<number>(S.oldDinoJar ? parseInt(localStorage.getItem(S.oldDinoJar) || "0") : 0);
  const visitDaysKey = S.visitDays;
  const visit5ClaimedKey = S.visit5Claimed;
  const getVisitDays = (): string[] => { try { return JSON.parse(localStorage.getItem(visitDaysKey) || "[]"); } catch { return []; } };
  const [visitDaysCount, setVisitDaysCount] = useState<number>(() => { const today = new Date().toDateString(); const days = getVisitDays(); if (!days.includes(today)) { const updated = [...days, today]; localStorage.setItem(visitDaysKey, JSON.stringify(updated)); return updated.length; } return days.length; });
  const [visit5Claimed, setVisit5Claimed] = useState<boolean>(() => { const claimed = parseInt(localStorage.getItem(visit5ClaimedKey) || "0"); const sets = Math.floor(visitDaysCount / 5); return claimed >= sets && sets > 0; });
  const handleVisit5Days = () => { if (isMaster) return; const days = getVisitDays(); const sets = Math.floor(days.length / 5); const claimed = parseInt(localStorage.getItem(visit5ClaimedKey) || "0"); if (sets > claimed) { const newJar = jarTreats + 3; setJarTreats(newJar); localStorage.setItem(`mpe_jar_${code}_${studentName}`, String(newJar)); sendTreats(3); localStorage.setItem(visit5ClaimedKey, String(sets)); setVisit5Claimed(true); playSfx(K.snd.visit5); } };
  const [fedTreatsState, setFedTreatsState] = useState<Record<string, number>>(() =>
    isMaster ? Object.fromEntries((world.masterAllGrown ? ANIMALS : ANIMALS.slice(0, -1)).map(a => [a.id, a.stages[a.stages.length - 1].min])) : // teacher view: grown = the animal's own last stage
      Object.fromEntries(ANIMALS.map(a => [a.id, parseInt(localStorage.getItem(S.fed(a.id)) || "0")]))
  );
  const [loading, setLoading] = useState(!isMaster);
  const [hearts, setHearts] = useState<{ id: number; x: number; y: number; delay: number }[]>([]);
  const [petted, setPetted] = useState(false);
  const [eggWiggle, setEggWiggle] = useState(false);
  const [showDailyGift, setShowDailyGift] = useState(false);
  const [justEarned, setJustEarned] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [petNameMap, setPetNameMap] = useState<Record<string, string>>(() =>
    Object.fromEntries(ANIMALS.map(a => [a.id, localStorage.getItem(S.petName(a.id)) || ""]))
  );
  const [levelUpStage, setLevelUpStage] = useState<{ animal: Animal; stageIdx: number } | null>(null);
  const [showVideo, setShowVideo] = useState(false);
  const [videoButtonSeen, setVideoButtonSeen] = useState(() => S.videoSeen ? localStorage.getItem(S.videoSeen) === "1" : false); // Ocean only
  const [videoWatchedMap, setVideoWatchedMap] = useState<Record<string, boolean>>(() => {
    if (isMaster) return Object.fromEntries((world.masterAllGrown ? ANIMALS : ANIMALS.slice(0, -1)).map(a => [a.id, true]));
    return Object.fromEntries(ANIMALS.map(a => [a.id, localStorage.getItem(S.videoWatched(a.id)) === "1"]));
  });
  const [showUnlockFor, setShowUnlockFor] = useState<string | null>(null);
  const [unlockSeenMap, setUnlockSeenMap] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(ANIMALS.map(a => [a.id, localStorage.getItem(S.unlkseen(a.id)) === "1"]))
  );
  const [videoFadingOut, setVideoFadingOut] = useState(false);
  const [showLookBelow, setShowLookBelow] = useState(false);
  const [showComplete, setShowComplete] = useState(false);
  const [musicOn, setMusicOn] = useState(() => localStorage.getItem(S.music) !== "off");
  const [sfxOn, setSfxOn] = useState(() => localStorage.getItem("mpe_sfx") !== "off");
  const [volume, setVolume] = useState(() => parseFloat(localStorage.getItem("mpe_volume") || "0.25"));
  const musicVol = () => K.musicVolume ?? volume * 0.5; // new look sets its own; Ocean/Dino skins = unchanged
  const [feedingTreats, setFeedingTreats] = useState<{ id: number; x: number; y: number }[]>([]);

  const heartId = useRef(0);
  const feedId = useRef(0);
  const creatureRef = useRef<HTMLDivElement>(null);
  const collectionRef = useRef<HTMLDivElement>(null);
  const pageRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const harpRef = useRef<HTMLAudioElement | null>(null);
  const lullabyRef = useRef<HTMLAudioElement | null>(null);
  const tadaRef = useRef<HTMLAudioElement | null>(null);
  const completeRef = useRef<HTMLAudioElement | null>(null);
  // Waiting "start music on first tap" listeners (browser blocked autoplay). Removed when the page closes,
  // so an old world's music can never start inside the next world after a jump (Ocean -> Dino).
  const tapStartRef = useRef<(() => void)[]>([]);
  const pageClosedRef = useRef(false);
  const waitForTap = (fn: () => void) => {
    if (pageClosedRef.current) return;
    tapStartRef.current.push(fn);
    document.addEventListener("pointerdown", fn, { once: true });
  };
  useEffect(() => {
    pageClosedRef.current = false;
    return () => {
      pageClosedRef.current = true;
      tapStartRef.current.forEach(fn => document.removeEventListener("pointerdown", fn));
      tapStartRef.current = [];
    };
  }, []);
  const ctxRef = useRef<AudioContext | null>(null);
  const prevStageRef = useRef<number | null>(null);
  const levelUpFiredRef = useRef<Record<string, Set<number>>>(
    Object.fromEntries(ANIMALS.map(a => [a.id, new Set<number>(
      JSON.parse(localStorage.getItem(S.levelup(a.id)) || "[]")
    )]))
  );

  const displayName = (() => {
    if (isMaster) return "Teacher";
    const n = studentName ?? "";
    const s = family?.students.find(s => s.name.toLowerCase() === n.toLowerCase());
    return s?.name ?? (n.charAt(0).toUpperCase() + n.slice(1));
  })();

  const [activeAnimalId, setActiveAnimalId] = useState(() => {
    if (isMaster) return ANIMALS[0].id;
    const saved = S.active ? localStorage.getItem(S.active) : null; // Ocean remembers its last animal in its own key
    if (saved && ANIMALS.some(a => a.id === saved)) return saved; // PHANTOM FIX: ignore another world's animal
    let furthest = ANIMALS[0].id;
    for (const a of ANIMALS) { if (localStorage.getItem(S.unlkseen(a.id)) === "1") furthest = a.id; }
    if (S.active && furthest !== ANIMALS[0].id) localStorage.setItem(S.active, furthest);
    return furthest;
  });
  const activeAnimal = ANIMALS.find(a => a.id === activeAnimalId) ?? ANIMALS[0];
  const videoWatched = videoWatchedMap[activeAnimalId] ?? false;
  const fedTreats = fedTreatsState[activeAnimalId] ?? 0;
  const petName = petNameMap[activeAnimalId] ?? "";
  const stage = getAnimalStage(activeAnimal, fedTreats);
  const stageIdx = getAnimalStageIdx(activeAnimal, fedTreats);
  const nextStage = activeAnimal.stages[stageIdx + 1] ?? null;
  const isEgg = stageIdx === 0;
  const nearHatch = isEgg && fedTreats >= (activeAnimal.stages[1]?.min ?? 15) - 3; // 3 treats before hatching (Ocean/Dino: 12 as before)
  const progress = nextStage ? Math.round(((fedTreats - stage.min) / (nextStage.min - stage.min)) * 100) : 100;

  // Music
  useEffect(() => {
    if (!audioRef.current) { audioRef.current = new Audio(K.music); audioRef.current.loop = true; }
    audioRef.current.volume = musicVol();
    if (musicOn) { audioRef.current.play().catch(() => { const tryPlay = () => { audioRef.current?.play().catch(() => { }); }; waitForTap(tryPlay); }); }
    else audioRef.current.pause();
    localStorage.setItem(S.music, musicOn ? "on" : "off");
    return () => { audioRef.current?.pause(); };
  }, [musicOn]);
  useEffect(() => { if (audioRef.current) audioRef.current.volume = musicVol(); localStorage.setItem("mpe_volume", String(volume)); }, [volume]);
  useEffect(() => { localStorage.setItem("mpe_sfx", sfxOn ? "on" : "off"); }, [sfxOn]);

  // LEVEL-UP SAVE FIX (2026-10-02): a level-up bumps this so the save below runs once more with the new stage in
  // levelup (the feed's own save runs BEFORE the level-up is written down, so the LAST stage was never saved).
  const [levelupSaves, setLevelupSaves] = useState(0);
  // Cloud save: mirror this world's progress to Supabase on change (the jar is NOT in here - see ONE JAR below)
  const dataCloudReady = useRef(false);
  const gatherBlob = () => {
    const levelupFor = (id: string) => {
      try { return JSON.parse(localStorage.getItem(S.levelup(id)) || "[]"); }
      catch { return []; }
    };
    return S.buildCloud({
      animals: Object.fromEntries(ANIMALS.map(a => [a.id, { fed: fedTreatsState[a.id] ?? 0, petName: petNameMap[a.id] ?? "", levelup: levelupFor(a.id), videoWatched: !!videoWatchedMap[a.id], unlkseen: !!unlockSeenMap[a.id] }])),
      visitDays: getVisitDays(),
      visit5Claimed: parseInt(localStorage.getItem(visit5ClaimedKey) || "0"),
      activePet: activeAnimalId,
      oldDinoJar: oldDinoJar.current,
      videoSeen: videoButtonSeen,
    });
  };
  useEffect(() => {
    if (isMaster) return;
    if (!dataCloudReady.current) { dataCloudReady.current = true; return; }
    saveDataToCloud(code, studentName, activeAnimalId, gatherBlob());
    // Ocean (keeps its last animal in its own key) never saved on an animal switch; the other worlds keep
    // activePet in their blob, so they do. The list keeps a fixed length: null = never changes.
  }, [fedTreatsState, petNameMap, videoWatchedMap, unlockSeenMap, videoButtonSeen, S.active ? null : activeAnimalId, visitDaysCount, visit5Claimed, levelupSaves]);

  // ONE JAR: same as Ocean - only "+N" / "-1" through the database adder, one call after another.
  const jarQueue = useRef<Promise<unknown>>(Promise.resolve());
  const jarQueued = useRef(0);
  const queueJar = (call: () => Promise<number | null | undefined>) => {
    if (isMaster) return;
    jarQueued.current++;
    jarQueue.current = jarQueue.current.then(async () => {
      const total = await call();
      jarQueued.current--;
      if (typeof total === "number" && jarQueued.current === 0) {
        setJarTreats(total);
        localStorage.setItem(`mpe_jar_${code}_${studentName}`, String(total));
      }
    });
  };
  const sendTreats = (delta: number) => queueJar(() => addTreats(code, studentName, delta));

  // COINS + PRIZES (step 5.4, 2026-10-02). coins = the kid's coin total (null = not read yet / teacher code).
  // claimPrizeNow("savanna:giraffe:grown"): the DATABASE decides the amounts and pays each prize once per kid;
  // it goes through the jar queue so it never races a feed. Teacher code 1006 = nothing saved (queueJar skips it).
  const [coins, setCoins] = useState<number | null>(null);
  // prizes = names of prizes already paid (= badges won, e.g. "savanna:complete"); null = not read yet / teacher code
  const [prizes, setPrizes] = useState<string[] | null>(null);
  useEffect(() => {
    if (isMaster) return;
    addCoins(code, studentName, 0).then(t => { if (typeof t === "number") setCoins(t); }); // 0 = read only
    loadPrizes(code, studentName).then(list => { if (Array.isArray(list)) setPrizes(list); }); // read only
    loadDailyPrize(code, studentName).then(d => { if (d) setDailyPrize(d); }); // read only
  }, []);
  // DAILY PRIZE (2026-10-03, new look): today's box + already taken? null = not read yet / teacher code.
  // claimDailyPrizeNow(): the DATABASE opens today's box (one per day) - through the jar queue like every jar change.
  const [dailyPrize, setDailyPrize] = useState<{ day: number; claimedToday: boolean } | null>(null);
  const claimDailyPrizeNow = (): Promise<{ paid: boolean } | null | undefined> => {
    if (isMaster) return Promise.resolve({ paid: false });
    return new Promise(resolve => queueJar(async () => {
      const res = await claimDailyPrize(code, studentName);
      resolve(res);
      if (!res) return undefined;
      setDailyPrize(d => (d ? { ...d, claimedToday: true } : d)); // paid or already taken: today is done either way
      if (!res.paid) return undefined;
      const t = await addCoins(code, studentName, 0); // read the real coin total back
      if (typeof t === "number") setCoins(t);
      return typeof res.jar === "number" ? res.jar : undefined;
    }));
  };
  const claimPrizeNow = (prize: string) => queueJar(async () => {
    const res = await claimPrize(code, studentName, prize);
    if (!res || !res.paid) return undefined; // not paid (already had it / failed): change nothing
    setPrizes(p => (p ?? []).includes(prize) ? p : [...(p ?? []), prize]);
    const t = await addCoins(code, studentName, 0); // read the real coin total back
    if (typeof t === "number") setCoins(t);
    return typeof res.jar === "number" ? res.jar : undefined;
  });

  // Jar read-back on mount. addTreats(0) = read the one jar (first time also moves the old Dino jar in).
  useEffect(() => {
    if (isMaster) return;
    let cancelled = false;
    jarQueued.current++;
    jarQueue.current = jarQueue.current.then(async () => {
      const cloud = await addTreats(code, studentName, 0);
      jarQueued.current--;
      if (cancelled) return;
      if (cloud === null) {
        // No cloud row yet: push device jar UP first. Device wins. (first time ever only)
        await saveJarToCloud(code, studentName, parseInt(localStorage.getItem(`mpe_jar_${code}_${studentName}`) || "0"));
      } else if (typeof cloud === "number" && jarQueued.current === 0) {
        setJarTreats(cloud);
        localStorage.setItem(`mpe_jar_${code}_${studentName}`, String(cloud));
      }
      // undefined = the call failed: keep the device number, send nothing.
    });
    return () => { cancelled = true; };
  }, []);

  // Cloud read-back on mount (device-wins-first). Runs once.
  // TRAP: never test result.data === null - a kid who only played Ocean has {ocean:...}, not null.
  // Each world's "first time here?" test is ITS OWN key (S.hasCloud). Missing = device wins.
  useEffect(() => {
    if (isMaster) { dataCloudReady.current = true; return; }
    let cancelled = false;
    (async () => {
      const result = await loadDataFromCloud(code, studentName);
      if (cancelled) return;
      if (result === null || !S.hasCloud(result.data)) {
        // This world is not in the cloud yet: push the device's progress UP first. Device wins.
        await saveDataToCloud(code, studentName, activeAnimalId, gatherBlob());
      } else {
        const r = S.readCloud(result.data, result.activePet ?? null);
        const newFed: Record<string, number> = {};
        const newPetNames: Record<string, string> = {};
        const newVideoWatched: Record<string, boolean> = {};
        const newUnlockSeen: Record<string, boolean> = {};
        ANIMALS.forEach(a => {
          const av = r.animals[a.id];
          newFed[a.id] = av.fed;
          newPetNames[a.id] = av.petName;
          newVideoWatched[a.id] = av.videoWatched;
          newUnlockSeen[a.id] = av.unlkseen;
          localStorage.setItem(S.fed(a.id), String(av.fed));
          localStorage.setItem(S.petName(a.id), av.petName);
          localStorage.setItem(S.videoWatched(a.id), av.videoWatched ? "1" : "0");
          localStorage.setItem(S.unlkseen(a.id), av.unlkseen ? "1" : "0");
          // Level-ups already seen = cloud + this device together (merge, never overwrite), and the brain's own list
          // learns them too, so a fresh device never replays an old level-up / party (fix 2026-10-02).
          const seenUps = new Set<number>([...(levelUpFiredRef.current[a.id] ?? []), ...av.levelup]);
          levelUpFiredRef.current[a.id] = seenUps;
          localStorage.setItem(S.levelup(a.id), JSON.stringify([...seenUps]));
        });
        setFedTreatsState(newFed);
        setPetNameMap(newPetNames);
        setVideoWatchedMap(newVideoWatched);
        setUnlockSeenMap(newUnlockSeen);
        // ONE JAR: the old Dino jar is only a record now (the database moved it into the one jar, once).
        if (S.oldDinoJar) { oldDinoJar.current = r.oldDinoJar ?? 0; localStorage.setItem(S.oldDinoJar, String(r.oldDinoJar ?? 0)); }
        // PHANTOM FIX: the active_pet COLUMN is shared by all worlds (Dino writes its dinosaur there).
        // Only take an animal that belongs to THIS world; otherwise use this world's furthest unlocked animal.
        if (r.activePet) {
          let pet = r.activePet;
          if (!ANIMALS.some(a => a.id === pet)) { pet = ANIMALS[0].id; for (const a of ANIMALS) { if (newUnlockSeen[a.id]) pet = a.id; } }
          setActiveAnimalId(pet); if (S.active) localStorage.setItem(S.active, pet);
        }
        if (S.videoSeen) { setVideoButtonSeen(!!r.videoSeen); localStorage.setItem(S.videoSeen, r.videoSeen ? "1" : "0"); }
        const cloudVisitDays = r.visitDays;
        const today = new Date().toDateString();
        const mergedVisitDays = cloudVisitDays.includes(today) ? cloudVisitDays : [...cloudVisitDays, today];
        localStorage.setItem(visitDaysKey, JSON.stringify(mergedVisitDays));
        setVisitDaysCount(mergedVisitDays.length);
        const visit5 = r.visit5Claimed;
        localStorage.setItem(visit5ClaimedKey, String(visit5));
        // A world with a NEXT world (Ocean -> Dino): if the cloud says the LAST animal is grown + its video
        // watched, this world is finished - go straight to the next world (what Ocean did before the template).
        const last = ANIMALS[ANIMALS.length - 1];
        if (world.nextWorld && !isMaster && getAnimalStageIdx(last, newFed[last.id] ?? 0) === 3 && (newVideoWatched[last.id] ?? false)) {
          localStorage.setItem(`mpe_world_${code}_${studentName}`, world.nextWorld.id);
          navigate(`${world.nextWorld.path}/${code}/${studentName}`, { replace: true });
          return;
        }
      }
      dataCloudReady.current = true;
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if ((stageIdx === 3 && !videoWatched && !levelUpStage) || showVideo || showLookBelow || showComplete) {
      document.body.style.overflow = "hidden";
    } else { document.body.style.overflow = ""; }
    return () => { document.body.style.overflow = ""; };
  }, [stageIdx, videoWatched, showVideo, showLookBelow, showComplete]);

  // World complete (its LAST animal grown + video watched) - once per device
  useEffect(() => {
    const last = ANIMALS[ANIMALS.length - 1]; // the world is finished when its LAST animal is grown + video watched
    if (!last) return;
    const lastGrown = getAnimalStageIdx(last, fedTreatsState[last.id] ?? 0) === 3;
    const lastVideoWatched = videoWatchedMap[last.id] ?? false;
    const alreadySeen = localStorage.getItem(S.complete) === "1";
    if (lastGrown && lastVideoWatched && !alreadySeen && !showVideo && !(K.completeWaitsForLevelUp && levelUpStage)) {
      const t = setTimeout(() => {
        setShowComplete(true);
        if (audioRef.current) audioRef.current.volume = 0.02;
        if (!completeRef.current) completeRef.current = new Audio("/completedworld-music.mp3");
        completeRef.current.currentTime = 0;
        completeRef.current.volume = 0.5;
        completeRef.current.play().catch(() => {
          const tryPlay = () => { completeRef.current?.play().catch(() => {}); };
          waitForTap(tryPlay);
        });
      }, K.completeDelayMs);
      return () => clearTimeout(t);
    }
  }, [fedTreatsState, videoWatchedMap, showVideo, K.completeWaitsForLevelUp ? levelUpStage : null]);

  const getCtx = () => {
    if (!ctxRef.current) ctxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    return ctxRef.current;
  };

  // Sound effects: each world's own sounds (its skin's makeSounds)
  const playSfx = useCallback((type: string) => {
    if (!sfxOn) return;
    try { K.makeSounds(getCtx())[type]?.(); } catch { }
  }, [sfxOn]);

  // Close video
  const closeVideo = () => {
    setVideoFadingOut(true);
    setTimeout(() => {
      setShowVideo(false); setVideoFadingOut(false);
      if (audioRef.current) audioRef.current.volume = musicVol();
      if (ANIMALS.slice(1).some(a => !unlockSeenMap[a.id]))
        setTimeout(() => setShowLookBelow(true), 300);
    }, 400);
  };

  // Level up
  useEffect(() => {
    const animalFired = levelUpFiredRef.current[activeAnimalId] ?? new Set<number>();
    if (prevStageRef.current === null) { prevStageRef.current = stageIdx; return; }
    if (stageIdx > 0 && stageIdx !== prevStageRef.current && !animalFired.has(stageIdx)) {
      animalFired.add(stageIdx);
      levelUpFiredRef.current[activeAnimalId] = animalFired;
      localStorage.setItem(S.levelup(activeAnimalId), JSON.stringify([...animalFired]));
      setLevelupSaves(n => n + 1); // save again so the cloud gets this stage too
      setLevelUpStage({ animal: activeAnimal, stageIdx });
      if (K.levelUpMusic) {
        if (!tadaRef.current) tadaRef.current = new Audio(K.levelUpMusic);
        tadaRef.current.currentTime = 0;
        tadaRef.current.volume = 0;
        tadaRef.current.play().catch(() => playSfx(K.snd.levelUp));
        let tv = 0;
        const target = 0.35;
        const tadaFade = setInterval(() => {
          tv = Math.min(tv + target / 20, target);
          if (tadaRef.current) tadaRef.current.volume = tv;
          if (tv >= target) clearInterval(tadaFade);
        }, 25);
      } else playSfx(K.snd.levelUp);
    }
    prevStageRef.current = stageIdx;
  }, [stageIdx]);

  useEffect(() => {
    if (isMaster) return;
    setLoading(false);
    const lastGift = localStorage.getItem(S.gift);
    const shownKey = S.giftShown(new Date().toDateString());
    if (lastGift !== new Date().toDateString() && !localStorage.getItem(shownKey)) {
      // ONE DAILY TREAT: ask the cloud first - if today's treat was already taken on another
      // device or in another world, don't show the gift here. (Can't check = show as before;
      // the database still refuses a second treat.)
      dailyClaimedToday(code, studentName).then(done => {
        if (done === true) { localStorage.setItem(S.gift, new Date().toDateString()); return; }
        localStorage.setItem(shownKey, "true");
        setTimeout(() => { setShowDailyGift(true); }, 1800);
      });
    }
  }, []);

  const savePetName = (name: string) => {
    setPetNameMap(m => ({ ...m, [activeAnimalId]: name }));
    localStorage.setItem(S.petName(activeAnimalId), name);
    if (K.renameMusic) {
      if (!harpRef.current) harpRef.current = new Audio(K.renameMusic);
      harpRef.current.currentTime = 0;
      harpRef.current.volume = 0.3;
      harpRef.current.play().catch(() => { });
    } else playSfx(K.snd.rename);
  };

  const handleFeed = () => {
    if (jarTreats <= 0) return;
    const newJar = jarTreats - 1;
    const newFed = fedTreats + 1;
    setJarTreats(newJar);
    setFedTreatsState(m => ({ ...m, [activeAnimalId]: newFed }));
    if (!isMaster) {
      localStorage.setItem(`mpe_jar_${code}_${studentName}`, String(newJar));
      localStorage.setItem(S.fed(activeAnimalId), String(newFed));
    }
    sendTreats(-1);
    playSfx("treat");
    const id = feedId.current++;
    const jarX = window.innerWidth / 2 - 80;
    const jarY = window.innerHeight / 2 + 100;
    setFeedingTreats(f => [...f, { id, x: jarX, y: jarY }]);
    setTimeout(() => {
      setFeedingTreats(f => f.filter(c => c.id !== id));
      setPetted(true);
      setTimeout(() => setPetted(false), 1200);
    }, 1000);
    setJustEarned(1);
    setTimeout(() => setJustEarned(0), 2500);
  };

  const spawnHearts = (cx: number, cy: number) => {
    const nh = Array.from({ length: 4 }, (_, i) => ({ id: heartId.current++, x: cx + (Math.random() - 0.5) * 80, y: cy - 20, delay: i * 0.15 }));
    setHearts(h => [...h, ...nh]);
    setTimeout(() => setHearts(h => h.filter(hh => !nh.find(n => n.id === hh.id))), 2000);
  };

  const handlePet = (e: React.MouseEvent | React.TouchEvent) => {
    if (isEgg) return;
    const rect = creatureRef.current?.getBoundingClientRect(); if (!rect) return;
    const cx = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const cy = 'touches' in e ? e.touches[0].clientY : e.clientY;
    spawnHearts(cx - rect.left, cy - rect.top);
    setPetted(true); playSfx("hearts");
    setTimeout(() => setPetted(false), 1200);
  };

  const handleEggTap = () => { setEggWiggle(true); playSfx("rattle"); setTimeout(() => setEggWiggle(false), 700); };

  const claimDailyGift = () => {
    const newJar = jarTreats + 1;
    setJarTreats(newJar);
    setJustEarned(1);
    playSfx("daily");
    setShowDailyGift(false);
    localStorage.setItem(S.gift, new Date().toDateString());
    if (!isMaster) localStorage.setItem(`mpe_jar_${code}_${studentName}`, String(newJar));
    queueJar(() => claimDailyTreat(code, studentName)); // database pays at most 1 per day
    setTimeout(() => setJustEarned(0), 2500);
  };

  // ---- handlers the skins call (every save key stays in the brain) ----
  const openVideo = () => {
    setShowVideo(true);
    if (audioRef.current) audioRef.current.volume = 0.02;
    if (S.videoSeen && !videoButtonSeen) { setVideoButtonSeen(true); localStorage.setItem(S.videoSeen, "1"); }
  };
  const onVideoTime = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    if (!videoWatched && (e.target as HTMLVideoElement).currentTime >= 1) { localStorage.setItem(S.videoWatched(activeAnimalId), "1"); setVideoWatchedMap(m => ({ ...m, [activeAnimalId]: true })); }
  };
  const dismissUnlock = (id: string) => {
    setShowUnlockFor(null);
    setUnlockSeenMap(m => ({ ...m, [id]: true }));
    setTimeout(() => { window.scrollTo({ top: 0, behavior: "smooth" }); }, 400);
    localStorage.setItem(S.unlkseen(id), "1");
    setActiveAnimalId(id);
    if (S.active) localStorage.setItem(S.active, id);
    if (lullabyRef.current) { lullabyRef.current.pause(); lullabyRef.current.currentTime = 0; }
    if (audioRef.current) audioRef.current.volume = musicVol();
  };
  const closeComplete = () => {
    localStorage.setItem(S.complete, "1");
    setShowComplete(false);
    if (completeRef.current) { completeRef.current.pause(); completeRef.current.currentTime = 0; }
    if (audioRef.current) audioRef.current.volume = musicVol();
    if (world.nextWorld) { localStorage.setItem(`mpe_world_${code}_${studentName}`, world.nextWorld.id); navigate(`${world.nextWorld.path}/${code}/${studentName}`); }
  };

  const creatureImg = activeAnimal.stages[stageIdx]?.img ?? activeAnimal.stages[0].img;

  return { world, ANIMALS, K, rawCode, rawStudentName, code, studentName, S, family, navigate, isMaster, jarTreats, setJarTreats, oldDinoJar, visitDaysKey, visit5ClaimedKey, getVisitDays, visitDaysCount, setVisitDaysCount, visit5Claimed, setVisit5Claimed, handleVisit5Days, fedTreatsState, setFedTreatsState, loading, setLoading, hearts, setHearts, petted, setPetted, eggWiggle, setEggWiggle, showDailyGift, setShowDailyGift, justEarned, setJustEarned, showSettings, setShowSettings, isRenaming, setIsRenaming, petNameMap, setPetNameMap, levelUpStage, setLevelUpStage, showVideo, setShowVideo, videoButtonSeen, setVideoButtonSeen, videoWatchedMap, setVideoWatchedMap, showUnlockFor, setShowUnlockFor, unlockSeenMap, setUnlockSeenMap, videoFadingOut, setVideoFadingOut, showLookBelow, setShowLookBelow, showComplete, setShowComplete, musicOn, setMusicOn, sfxOn, setSfxOn, volume, setVolume, feedingTreats, setFeedingTreats, heartId, feedId, creatureRef, collectionRef, pageRef, audioRef, harpRef, lullabyRef, tadaRef, completeRef, ctxRef, prevStageRef, levelUpFiredRef, displayName, activeAnimalId, setActiveAnimalId, activeAnimal, videoWatched, fedTreats, petName, stage, stageIdx, nextStage, isEgg, nearHatch, progress, dataCloudReady, gatherBlob, jarQueue, jarQueued, queueJar, sendTreats, getCtx, playSfx, closeVideo, savePetName, handleFeed, spawnHearts, handlePet, handleEggTap, claimDailyGift, openVideo, onVideoTime, dismissUnlock, closeComplete, creatureImg, coins, prizes, claimPrize: claimPrizeNow, dailyPrize, claimDailyPrize: claimDailyPrizeNow };
};

export type WorldView = ReturnType<typeof useWorldBrain>;

const WorldScreen = ({ world }: { world: WorldConfig }) => {
  const v = useWorldBrain(world);
  const K = world.skin;
  if (v.loading) return <K.Loading v={v} />;
  return <K.Page v={v} />;
};

// NAME TAG: a different world or kid = a brand-new page (fresh state + its own cloud read-back).
// Without it React would REUSE the page when e.g. /world (Ocean) jumps to /dino (both are WorldPage).
const WorldPage = ({ world }: { world: WorldConfig }) => {
  const { code, studentName } = useParams<{ code: string; studentName: string }>();
  const tag = `${world.id}_${(code ?? "").toUpperCase()}_${(studentName ?? "").toLowerCase()}`;
  return <WorldScreen key={tag} world={world} />;
};

export default WorldPage;
