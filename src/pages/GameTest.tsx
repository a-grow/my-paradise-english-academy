import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import book1Data from "@/data/oxford-discover-book1.json";
import book2Data from "@/data/oxford-discover-book2.json";
import book3Data from "@/data/oxford-discover-book3.json";
import book4Data from "@/data/oxford-discover-book4.json";
import book5Data from "@/data/oxford-discover-book5.json";

// ── FONT ──────────────────────────────────────────────────────────────────────
const FONT_URL="https://fonts.googleapis.com/css2?family=Nunito:wght@700;800;900&display=swap";
const F="'Nunito',sans-serif";

// ── FULLSCREEN BUTTON (iPad only) ────────────────────────────────────────────
const FullscreenButton = () => {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const el = document.documentElement as any;
    const canFs = !!(el.requestFullscreen || el.webkitRequestFullscreen);
    const isTouch = window.matchMedia("(pointer: coarse)").matches;
    setShow(canFs && isTouch);
  }, []);
  if (!show) return null;
  const toggle = () => {
    const el = document.documentElement as any;
    const doc = document as any;
    if (doc.fullscreenElement || doc.webkitFullscreenElement) {
      (doc.exitFullscreen || doc.webkitExitFullscreen)?.call(doc);
    } else {
      (el.requestFullscreen || el.webkitRequestFullscreen)?.call(el);
    }
  };
  return (
    <button onClick={toggle} style={{background:"rgba(0,0,0,0.55)",border:"2px solid rgba(255,255,255,0.25)",color:"white",fontFamily:F,fontWeight:800,fontSize:"1.15rem",padding:"0.3rem 0.7rem",borderRadius:999,cursor:"pointer",flexShrink:0,lineHeight:1}}>{"\u26F6\uFE0E"}</button>
  );
};

// ── DATA ──────────────────────────────────────────────────────────────────────
const BOOK_COLORS = ["#f43f5e","#8b5cf6","#f97316","#0ea5e9","#10b981","#e11d48","#7c3aed","#ea580c","#0284c7","#059669","#db2777","#6d28d9","#c2410c","#0369a1","#047857","#be185d","#5b21b6","#9a3412","#075985","#065f46"];
const BOOK_GLOWS = ["rgba(244,63,94,0.6)","rgba(139,92,246,0.6)","rgba(249,115,22,0.6)","rgba(14,165,233,0.6)","rgba(16,185,129,0.6)","rgba(225,29,72,0.6)","rgba(124,58,237,0.6)","rgba(234,88,12,0.6)","rgba(2,132,199,0.6)","rgba(5,150,105,0.6)","rgba(219,39,119,0.6)","rgba(109,40,217,0.6)","rgba(194,65,12,0.6)","rgba(3,105,161,0.6)","rgba(4,120,87,0.6)","rgba(190,24,93,0.6)","rgba(91,33,182,0.6)","rgba(154,52,18,0.6)","rgba(7,89,133,0.6)","rgba(6,95,70,0.6)"];
function getTopicEmoji(topic: string): string {
  const t = topic.toLowerCase();
  if(t.includes("animal")) return "🐾";
  if(t.includes("famil")||t.includes("friend")) return "👨‍👩‍👧";
  if(t.includes("color")||t.includes("colour")||t.includes("art")||t.includes("paint")) return "🎨";
  if(t.includes("ocean")||t.includes("sea")||t.includes("water")||t.includes("fish")) return "🌊";
  if(t.includes("home")||t.includes("house")||t.includes("live")) return "🏠";
  if(t.includes("food")||t.includes("eat")||t.includes("cook")||t.includes("cream")) return "🍎";
  if(t.includes("weather")||t.includes("season")||t.includes("rain")||t.includes("snow")) return "⛅";
  if(t.includes("number")||t.includes("math")||t.includes("count")||t.includes("subtract")||t.includes("addition")) return "🔢";
  if(t.includes("music")||t.includes("instrument")||t.includes("sing")||t.includes("song")) return "🎵";
  if(t.includes("plant")||t.includes("tree")||t.includes("forest")||t.includes("garden")) return "🌳";
  if(t.includes("city")||t.includes("town")||t.includes("street")||t.includes("neighbor")) return "🏙️";
  if(t.includes("travel")||t.includes("transport")||t.includes("airplane")||t.includes("communication")) return "✈️";
  if(t.includes("body")||t.includes("health")||t.includes("doctor")) return "💪";
  if(t.includes("school")||t.includes("class")||t.includes("learn")||t.includes("study")) return "📚";
  if(t.includes("sport")||t.includes("game")||t.includes("play")) return "⚽";
  if(t.includes("space")||t.includes("star")||t.includes("planet")||t.includes("moon")) return "🚀";
  if(t.includes("story")||t.includes("adventure")||t.includes("book")||t.includes("read")) return "📖";
  if(t.includes("world")||t.includes("earth")||t.includes("country")||t.includes("map")) return "🌍";
  if(t.includes("science")||t.includes("made of")||t.includes("solid")||t.includes("liquid")) return "🔬";
  if(t.includes("want")||t.includes("need")||t.includes("buy")||t.includes("market")) return "🛒";
  return "⭐";
}
const BOOK_EMOJIS = ["👨‍👩‍👧","🐾","🎨","🌊","🦅","🌳","🏠","🍎","🐶","🌈","⭐","🎵","🚀","💡","🌍","🎯","🔬","📚","🎪","🌺"];

type UnitData = {unit:number;topic:string;emoji:string;color:string;glow:string;vocab:string[];emojis:string[];chinese:Record<string,string>};
// ── CHINESE TRANSLATIONS (Taiwanese Mandarin, confirmed by Shirley) ───────────
const CHINESE: Record<string,string> = {
  family:"家人", grandmother:"奶奶 / 外婆", grandfather:"爺爺 / 外公",
  father:"爸爸", mother:"媽媽", brother:"哥哥 / 弟弟",
  sister:"姊姊 / 妹妹", friend:"朋友",
  hamster:"倉鼠", goldfish:"金魚", bird:"鳥", rabbit:"兔子", lizard:"蜥蜴", kitten:"小貓",
  yellow:"黃色", red:"紅色", blue:"藍色", green:"綠色",
  purple:"紫色", black:"黑色", brown:"棕色", white:"白色",
  mix:"混合", mural:"壁畫", ocean:"海洋", sand:"沙子",
  seaweed:"海藻", seashell:"貝殼", jellyfish:"水母", starfish:"海星",
  eagle:"老鷹", chick:"小雞", nest:"鳥巢", opossum:"負鼠",
  "tree hollow":"樹洞", honeybee:"蜜蜂", hive:"蜂巢", crab:"螃蟹",
};

function buildUnits(bookData: any): UnitData[] {
  const raw = Array.isArray(bookData) ? bookData : (bookData?.units ?? []);
  // Build topic->emoji map first, ensuring no repeats within this book
  const topicEmojiMap: Record<string,string> = {};
  const usedEmojis = new Set<string>();
  raw.forEach((u: any) => {
    const topic = (u.topic ?? "").trim();
    // Normalize topic for candidate lookup — strip after comma and common suffixes
    const topicNorm = topic.toLowerCase()
      .replace(/,.*$/,"")
      .replace(/the world around us/,"")
      .replace(/moving/,"")
      .replace(/language terms/,"")
      .replace(/health/,"")
      .trim();
    if(!topicEmojiMap[topicNorm] && !topicEmojiMap[topicNorm+"_2"]) {
      const t = topicNorm;
      const candidates = (
        t.includes("animal")||t.includes("insect")||t.includes("bird")||t.includes("mammal") ? ["🐾","🦁","🦋","🐸","🦊","🐧","🐬","🦎","🐘"] :
        t.includes("famil")||t.includes("friend") ? ["👨‍👩‍👧","👪","💝","🤝","😊"] :
        t.includes("universe")||t.includes("space")||t.includes("planet")||t.includes("star")||t.includes("moon") ? ["🌌","🚀","🔭","🪐","⭐"] :
        t.includes("color")||t.includes("colour") ? ["🌈","🎨","🖌️","🎭"] :
        t.includes("art")||t.includes("paint")||t.includes("artist") ? ["🖼️","🎨","✏️","🖌️"] :
        t.includes("ocean")||t.includes("sea") ? ["🌊","🐚","🐠","🦈"] :
        t.includes("water")||t.includes("liquid")||t.includes("solid")||t.includes("made of")||t.includes("science") ? ["🔬","⚗️","🧪","💧"] :
        t.includes("food")||t.includes("eat")||t.includes("cook")||t.includes("cream")||t.includes("farming") ? ["🍎","🥗","🍜","👨‍🍳","🌾"] :
        t.includes("weather")||t.includes("season") ? ["⛅","🌤️","❄️","🌧️"] :
        t.includes("number")||t.includes("math")||t.includes("subtract")||t.includes("addition")||t.includes("time") ? ["🔢","🧮","⏰","📐"] :
        t.includes("music")||t.includes("instrument")||t.includes("sing") ? ["🎵","🎸","🎹","🥁"] :
        t.includes("plant")||t.includes("tree")||t.includes("forest") ? ["🌳","🌿","🌱","🌻"] :
        t.includes("city")||t.includes("town")||t.includes("place")||t.includes("neighbor") ? ["🏙️","🏘️","🗺️","🌆"] :
        t.includes("travel")||t.includes("transport")||t.includes("airplane") ? ["✈️","🚂","🚢","🧳"] :
        t.includes("communication") ? ["📡","📱","📻","✉️"] :
        t.includes("health")||t.includes("doctor")||t.includes("body") ? ["🏥","💊","🩺","💪"] :
        t.includes("school")||t.includes("learn")||t.includes("language") ? ["📚","✏️","🎓","📝"] :
        t.includes("sport")||t.includes("leisure")||t.includes("game")||t.includes("play") ? ["⚽","🏀","🎾","🏊"] :
        t.includes("story")||t.includes("adventure")||t.includes("read") ? ["📖","✍️","🗺️","🧭"] :
        t.includes("world")||t.includes("earth")||t.includes("country") ? ["🌍","🌏","🌎","🗺️"] :
        t.includes("past")||t.includes("discover")||t.includes("history") ? ["🏛️","📜","⚔️","🗿"] :
        t.includes("want")||t.includes("need")||t.includes("buy")||t.includes("market") ? ["🛒","💰","🏪","🎁"] :
        t.includes("natural")||t.includes("force")||t.includes("flood")||t.includes("earthquake")||t.includes("storm")||t.includes("hurricane") ? ["🌪️","⛈️","🌋","❄️","🌊"] :
        t.includes("safety")||t.includes("suppli")||t.includes("emergency") ? ["🔦","💧","🎒","🩺","🏕️"] :
        t.includes("home")||t.includes("house")||t.includes("live") ? ["🏠","🏡","🛖","🏘️"] :
        ["⭐","💡","🎯","🎪","🌺","🔮","🎀","🏆"]
      );
      const pick1 = candidates.find(e => !usedEmojis.has(e)) ?? candidates[0];
      usedEmojis.add(pick1);
      const pick2 = candidates.find(e => !usedEmojis.has(e)) ?? candidates[1] ?? pick1;
      usedEmojis.add(pick2);
      topicEmojiMap[topicNorm] = pick1;
      topicEmojiMap[topicNorm+"_2"] = pick2;
    }
  });
  return raw.map((u: any, i: number) => {
    const pairIndex = Math.floor(i / 2);
    const isSecondInPair = i % 2 === 1;
    const topic = u.topic ?? `Unit ${u.unit}`;
    const topicKey = topic.trim().toLowerCase().replace(/,.*$/,"").replace(/\bthe world around us\b/,"").replace(/\bmoving\b/,"").replace(/\blanguage terms\b/,"").replace(/\bhealth\b/,"").trim();
    return {
      unit: u.unit,
      topic: isSecondInPair ? `${topic} (continued 續)` : topic,
      emoji: (isSecondInPair ? topicEmojiMap[topicKey+"_2"] : topicEmojiMap[topicKey]) ?? "💡",
      color: BOOK_COLORS[pairIndex] ?? "#6b7280",
      glow: BOOK_GLOWS[pairIndex] ?? "rgba(107,114,128,0.6)",
      vocab: (u.vocabulary?.words ?? []).map((w: any) => typeof w === "string" ? w : w.word).filter(Boolean),
      emojis: (u.vocabulary?.words ?? []).map(() => "📖"),
      chinese: Object.fromEntries((u.vocabulary?.words ?? []).map((w: any) => [w.word, CHINESE[w.word] ?? w.definition_zh ?? w.word])),
    };
  });
}

const ALL_BOOKS: Record<number, any> = {1:book1Data,2:book2Data,3:book3Data,4:book4Data,5:book5Data};

// ── DIFFICULTY ─────────────────────────────────────────────────────────────────
type Diff = "easy"|"medium"|"hard";
const DIFF_CONFIG: Record<Diff,{label:string;emoji:string;color:string;spawnMs:number;speedMult:number;timerSec:number;maxOnScreen:number;moleShowMs:number;desc:string}> = {
  easy:   {label:"Easy",   emoji:"🟢", color:"#4ade80", spawnMs:2800, speedMult:0.65, timerSec:180, maxOnScreen:3, moleShowMs:4800, desc:"Slow & relaxed"},
  medium: {label:"Medium", emoji:"🟡", color:"#fbbf24", spawnMs:1600, speedMult:1.0,  timerSec:160, maxOnScreen:6, moleShowMs:3800, desc:"Normal pace"},
  hard:   {label:"Hard",   emoji:"🔴", color:"#ef4444", spawnMs:900,  speedMult:1.65, timerSec:145, maxOnScreen:9, moleShowMs:2400, desc:"Fast & furious"},
};

function shuffle<T>(arr: T[]): T[] { return [...arr].sort(()=>Math.random()-0.5); }

// ── AUDIO ─────────────────────────────────────────────────────────────────────
const useAudio = () => {
  const ctx = useRef<AudioContext|null>(null);
  const getCtx = () => { if(!ctx.current) ctx.current=new (window.AudioContext||(window as any).webkitAudioContext)(); return ctx.current; };
  return useCallback((type:"correct"|"wrong"|"shoot"|"chomp"|"laser"|"win"|"countdown") => {
    try {
      const c=getCtx();
      const osc=(f:number,t:number,d:number,v=0.22,w:OscillatorType="sine")=>{
        const o=c.createOscillator(),g=c.createGain();
        o.connect(g);g.connect(c.destination);o.type=w;o.frequency.value=f;
        g.gain.setValueAtTime(v,c.currentTime+t);
        g.gain.exponentialRampToValueAtTime(0.001,c.currentTime+t+d);
        o.start(c.currentTime+t);o.stop(c.currentTime+t+d+0.01);
      };
      ({
        correct:   ()=>{[523,659,784,1047].forEach((f,i)=>osc(f,i*0.09,0.18,0.22));},
        wrong:     ()=>{osc(220,0,0.25,0.3,"sawtooth");osc(160,0.12,0.2,0.2,"sawtooth");},
        shoot:     ()=>{osc(620,0,0.07,0.18,"square");osc(1200,0.04,0.06,0.1,"square");},
        chomp:     ()=>{osc(520,0,0.04,0.28,"square");osc(320,0.05,0.05,0.18,"square");},
        laser:     ()=>{const o=c.createOscillator(),g=c.createGain();o.connect(g);g.connect(c.destination);o.type="sawtooth";o.frequency.setValueAtTime(820,c.currentTime);o.frequency.exponentialRampToValueAtTime(200,c.currentTime+0.22);g.gain.setValueAtTime(0.22,c.currentTime);g.gain.exponentialRampToValueAtTime(0.001,c.currentTime+0.22);o.start(c.currentTime);o.stop(c.currentTime+0.23);},
        win:       ()=>{[523,659,784,1047,1319,1568].forEach((f,i)=>osc(f,i*0.1,0.32,0.26));},
        countdown: ()=>{osc(460,0,0.16,0.38,"square");},
      } as Record<string,()=>void>)[type]?.();
    } catch{}
  },[]);
};

// ── SPEECH ───────────────────────────────────────────────────────────────────
const speak = (text: string, lang: string) => {
  try {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang;
    speechSynthesis.cancel();
    speechSynthesis.speak(u);
  } catch {}
};

// ── COUNTDOWN OVERLAY ─────────────────────────────────────────────────────────
const CountdownOverlay = ({onDone}:{onDone:()=>void}) => {
  const [n,setN]=useState(3);
  const play=useAudio();
  useEffect(()=>{
    play("countdown");
    const iv=setInterval(()=>{
      setN(prev=>{
        if(prev<=1){clearInterval(iv);setTimeout(onDone,650);return 0;}
        play("countdown");
        return prev-1;
      });
    },950);
    return()=>clearInterval(iv);
  },[]);
  return (
    <div style={{position:"fixed",inset:0,zIndex:200,background:"rgba(0,0,0,0.75)",backdropFilter:"blur(8px)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",pointerEvents:"all"}}>
      <div style={{fontFamily:F,fontWeight:900,fontSize:n===0?"5rem":"9rem",color:n===0?"#4ade80":"#fbbf24",textShadow:`0 0 70px ${n===0?"rgba(74,222,128,0.9)":"rgba(251,191,36,0.9)"}`,animation:"countPop 0.4s cubic-bezier(0.34,1.56,0.64,1)",lineHeight:1}}>
        {n===0?"GO!":n}
      </div>
      <div style={{fontFamily:F,fontWeight:700,fontSize:"1.1rem",color:"rgba(255,255,255,0.5)",marginTop:"0.75rem"}}>{n===0?"Here we go!":"Get ready..."}</div>
      <style>{`@keyframes countPop{0%{transform:scale(0.3);opacity:0}100%{transform:scale(1);opacity:1}}`}</style>
    </div>
  );
};

// ── UNIT CLEAR / WINNER SCREEN ────────────────────────────────────────────────
// Three zones only: celebration → reward → buttons. No stars, no points.
const TREATS_BY_DIFF: Record<string, number> = { easy: 1, medium: 2, hard: 3 };
const UnitClearScreen = ({unit,onBack,onPlay,onClaim,claimState,diff,treatsEarnedToday=0,fromDino=false}:{unit:UnitData;onBack:()=>void;onPlay:()=>void;onClaim?:()=>void;claimState?:"available"|"claimed"|"capped";diff?:string;treatsEarnedToday?:number;fromDino?:boolean}) => {
  const treatCount = TREATS_BY_DIFF[diff??""] ?? 2;
  const play=useAudio();
  useEffect(()=>{play("win");},[]);
  return (
    <div style={{minHeight:"100vh",background:`radial-gradient(ellipse at center, ${unit.color}55 0%, #0f0c29 70%)`,display:"flex",alignItems:"center",justifyContent:"center",padding:"1rem",overflow:"hidden",position:"relative"}}>
      <style>{`
        @keyframes confettiFall{0%{transform:translateY(-20px) rotate(0deg);opacity:1}100%{transform:translateY(100vh) rotate(720deg);opacity:0}}
        @keyframes trophyBounce{0%,100%{transform:translateY(0) scale(1)}50%{transform:translateY(-20px) scale(1.12)}}
        @keyframes clearIn{0%{transform:scale(0.75) translateY(40px);opacity:0}100%{transform:scale(1) translateY(0);opacity:1}}
        @keyframes claimPulse{0%,100%{box-shadow:0 0 20px rgba(251,191,36,0.5),0 6px 24px rgba(0,0,0,0.3)}50%{box-shadow:0 0 50px rgba(251,191,36,1),0 6px 24px rgba(0,0,0,0.3)}}
        @keyframes cookiePop{0%{transform:scale(0) rotate(-15deg);opacity:0}70%{transform:scale(1.2) rotate(5deg);opacity:1}100%{transform:scale(1) rotate(0deg);opacity:1}}
      `}</style>
      {/* Confetti */}
      {[...Array(36)].map((_,i)=>(
        <div key={i} style={{position:"fixed",left:`${(i*137.5)%100}%`,top:"-24px",width:10+i%8,height:10+i%8,borderRadius:i%3===0?"50%":"3px",background:["#fbbf24","#f97316","#ef4444","#a855f7","#3b82f6","#22c55e","#ec4899"][i%7],animation:`confettiFall ${2.2+i%3*0.5}s ease-in ${i*0.1}s both`,pointerEvents:"none"}}/>
      ))}
      <div style={{background:"rgba(255,255,255,0.08)",backdropFilter:"blur(28px)",borderRadius:"2.5rem",padding:"2.5rem 1.5rem",textAlign:"center",maxWidth:380,width:"100%",border:`3px solid ${unit.color}`,boxShadow:`0 0 60px ${unit.glow},0 24px 60px rgba(0,0,0,0.5)`,animation:"clearIn 0.65s cubic-bezier(0.34,1.56,0.64,1)"}}>

        {/* ZONE 1 — Celebration */}
        <div style={{fontSize:"5.5rem",animation:"trophyBounce 1.5s ease-in-out infinite",lineHeight:1}}>🏆</div>
        <div style={{fontFamily:F,fontWeight:900,fontSize:"2.6rem",color:"#fbbf24",textShadow:"0 0 30px rgba(251,191,36,0.9)",margin:"0.4rem 0",lineHeight:1}}>YOU DID IT!</div>
        <div style={{fontFamily:F,fontWeight:700,fontSize:"1rem",color:"rgba(255,255,255,0.6)",marginBottom:"1.5rem"}}>Unit {unit.unit} · {unit.topic}</div>

        {/* ZONE 2 — Reward (only shown when arcade treat logic is active) */}
        {onClaim && (
          <div style={{marginBottom:"1.25rem"}}>
            {claimState==="available" && (
              <button onClick={onClaim} style={{width:"100%",padding:"1.1rem",background:"linear-gradient(135deg,#fbbf24,#f97316)",border:"none",borderRadius:"1.5rem",color:"white",fontFamily:F,fontWeight:900,fontSize:"1.35rem",cursor:"pointer",animation:"claimPulse 1.4s ease-in-out infinite",display:"flex",alignItems:"center",justifyContent:"center",gap:"0.5rem"}}>
                {fromDino
                  ? <svg width="36" height="36" viewBox="0 0 36 36" style={{animation:"cookiePop 0.5s ease-out both",flexShrink:0}}><ellipse cx="18" cy="18" rx="14" ry="7" fill="#e8d5b0" stroke="#b8965a" strokeWidth="1.5"/><ellipse cx="9" cy="18" rx="5" ry="4" fill="#e8d5b0" stroke="#b8965a" strokeWidth="1.5"/><ellipse cx="27" cy="18" rx="5" ry="4" fill="#e8d5b0" stroke="#b8965a" strokeWidth="1.5"/></svg>
                  : <svg width="36" height="36" viewBox="0 0 36 36" style={{animation:"cookiePop 0.5s ease-out both",flexShrink:0}}><circle cx="18" cy="18" r="14" fill="#d4b483" stroke="#b8965a" strokeWidth="1.5"/><circle cx="13" cy="15" r="2" fill="#7a5c2e" opacity="0.85"/><circle cx="23" cy="15" r="2" fill="#7a5c2e" opacity="0.85"/><path d="M12,21 Q18,27 24,21" stroke="#7a5c2e" strokeWidth="2" fill="none" strokeLinecap="round"/></svg>
                }
                <span>+{treatCount} {treatCount === 1 ? "Treat" : "Treats"}!</span>
              </button>
            )}
            {claimState==="claimed" && (
              <div style={{background:"rgba(74,222,128,0.15)",border:"2px solid rgba(74,222,128,0.4)",borderRadius:"1.25rem",padding:"0.85rem 1rem"}}>
                <div style={{fontFamily:F,fontWeight:800,fontSize:"1.1rem",color:"#4ade80",display:"flex",alignItems:"center",justifyContent:"center",gap:"0.4rem"}}>
                  {fromDino
                    ? <svg width="22" height="22" viewBox="0 0 36 36"><ellipse cx="18" cy="18" rx="11" ry="5.5" fill="#e8d5b0" stroke="#b8965a" strokeWidth="1.5"/><ellipse cx="8" cy="18" rx="4" ry="3.5" fill="#e8d5b0" stroke="#b8965a" strokeWidth="1.5"/><ellipse cx="28" cy="18" rx="4" ry="3.5" fill="#e8d5b0" stroke="#b8965a" strokeWidth="1.5"/></svg>
                    : <svg width="22" height="22" viewBox="0 0 36 36"><circle cx="18" cy="18" r="14" fill="#d4b483" stroke="#b8965a" strokeWidth="1.5"/><circle cx="13" cy="15" r="2" fill="#7a5c2e" opacity="0.85"/><circle cx="23" cy="15" r="2" fill="#7a5c2e" opacity="0.85"/><path d="M12,21 Q18,27 24,21" stroke="#7a5c2e" strokeWidth="2" fill="none" strokeLinecap="round"/></svg>
                  }
                  Treats added! · 點心加好了！
                </div>
                <div style={{fontFamily:F,fontWeight:700,fontSize:"0.82rem",color:"rgba(255,255,255,0.5)",marginTop:"0.2rem"}}>Go feed your animal! · 去餵你的動物吧！</div>
              </div>
            )}
            {claimState==="capped" && (
              <div style={{background:"rgba(255,255,255,0.08)",border:"2px solid rgba(255,255,255,0.15)",borderRadius:"1.25rem",padding:"0.85rem 1rem"}}>
                <div style={{fontFamily:F,fontWeight:800,fontSize:"1rem",color:"rgba(255,255,255,0.7)"}}>You got all your treats today! · 今天的點心全部拿到了！</div>
                <div style={{fontFamily:F,fontWeight:700,fontSize:"0.82rem",color:"rgba(255,255,255,0.45)",marginTop:"0.2rem"}}>Come back tomorrow for more! · 明天再來拿更多！</div>
              </div>
            )}
          </div>
        )}

        {/* ZONE 3 — Buttons (no caps, budget row removed) */}
        <div style={{display:"flex",flexDirection:"column",gap:"0.65rem"}}>
          <button onClick={onPlay} disabled={claimState==="available"} style={{padding:"0.9rem",background:claimState==="available"?"rgba(255,255,255,0.12)":`linear-gradient(135deg,${unit.color},${unit.color}99)`,border:"none",borderRadius:999,color:claimState==="available"?"rgba(255,255,255,0.3)":"white",fontFamily:F,fontWeight:800,fontSize:"1rem",cursor:claimState==="available"?"not-allowed":"pointer",boxShadow:claimState==="available"?"none":`0 0 20px ${unit.glow}`,transition:"all 0.3s"}}>
            Play Again! · 再玩一次！
          </button>
          <button onClick={onBack} disabled={claimState==="available"} style={{padding:"0.9rem",background:claimState==="available"?"rgba(255,255,255,0.08)":"linear-gradient(135deg,#6366f1,#a855f7)",border:"none",borderRadius:999,color:claimState==="available"?"rgba(255,255,255,0.3)":"white",fontFamily:F,fontWeight:800,fontSize:"0.95rem",cursor:claimState==="available"?"not-allowed":"pointer",transition:"all 0.3s"}}>
            Choose Game · 選擇遊戲
          </button>
        </div>
      </div>
    </div>
  );
};

// ── RESULT SCREEN (time up / game over) ───────────────────────────────────────
const ResultScreen = ({score,total,onBack,onPlay,reason}:{score:number;total:number;onBack:()=>void;onPlay:()=>void;reason?:"timeout"|"lives"}) => {
  const pct=total>0?Math.round((score/total)*100):0;
  const stars=pct>=80?3:pct>=50?2:1;
  const heading = reason==="timeout" ? "⏰ Out of Time!" : reason==="lives" ? "💔 No More Hearts!" : "Game Over!";
  const msgs=[["Keep going! 💪","繼續加油！"],["Nice try! 🎉","繼續練習！"],["So close! 🌟","快成功了！"]];
  const [msg,zh]=msgs[stars-1];
  return (
    <div style={{minHeight:"100vh",background:"linear-gradient(135deg,#1e1b4b,#312e81,#4c1d95)",display:"flex",alignItems:"center",justifyContent:"center",padding:"1rem"}}>
      <div style={{background:"rgba(255,255,255,0.1)",backdropFilter:"blur(24px)",borderRadius:"2.5rem",padding:"2.5rem 2rem",textAlign:"center",maxWidth:360,width:"100%",border:"2px solid rgba(255,255,255,0.2)",animation:"popIn 0.5s cubic-bezier(0.34,1.56,0.64,1)"}}>
        <div style={{fontFamily:F,fontWeight:900,fontSize:"2rem",color:"white",marginBottom:"0.75rem"}}>{heading}</div>
        <div style={{display:"flex",justifyContent:"center",gap:"0.5rem",marginBottom:"0.75rem"}}>
          {[1,2,3].map(i=><span key={i} style={{fontSize:"2.5rem",filter:i<=stars?"none":"grayscale(1) opacity(0.3)",animation:i<=stars?`starPop2 0.4s ease-out ${i*0.15}s both`:"none"}}>⭐</span>)}
        </div>
        <div style={{fontFamily:F,fontWeight:900,fontSize:"3rem",color:"#fbbf24",lineHeight:1}}>{score}/{total}</div>
        <div style={{fontFamily:F,fontWeight:800,fontSize:"1.3rem",color:"white",margin:"0.75rem 0"}}>{msg}</div>
        <div style={{fontFamily:F,fontWeight:700,fontSize:"1.05rem",color:"rgba(255,255,255,0.65)",marginBottom:"1.5rem"}}>{zh}</div>
        <div style={{display:"flex",flexDirection:"column",gap:"0.75rem"}}>
          <button onClick={onPlay} style={{padding:"0.9rem",background:"linear-gradient(135deg,#4ade80,#22d3ee)",border:"none",borderRadius:999,color:"white",fontFamily:F,fontWeight:800,fontSize:"1rem",cursor:"pointer"}}>Play Again!</button>
          <button onClick={onBack} style={{padding:"0.9rem",background:"linear-gradient(135deg,#f97316,#fbbf24)",border:"none",borderRadius:999,color:"white",fontFamily:F,fontWeight:800,fontSize:"0.95rem",cursor:"pointer"}}>Choose Game</button>
        </div>
      </div>
      <style>{`@keyframes popIn{0%{transform:scale(0.8);opacity:0}100%{transform:scale(1);opacity:1}}@keyframes starPop2{0%{transform:scale(0);opacity:0}100%{transform:scale(1);opacity:1}}`}</style>
    </div>
  );
};

// ── RESTART BUTTON ────────────────────────────────────────────────────────────
// ── HUD PILL ──────────────────────────────────────────────────────────────────
const Pill = ({children,red=false,dark=false}:{children:React.ReactNode;red?:boolean;dark?:boolean}) => (
  <div style={{background:red?"rgba(220,38,38,0.8)":dark?"rgba(0,0,20,0.85)":"rgba(0,0,0,0.55)",borderRadius:999,padding:"0.32rem 0.85rem",fontFamily:F,fontWeight:800,fontSize:"1.1rem",color:"white",display:"flex",alignItems:"center",gap:"0.3rem"}}>{children}</div>
);

// ── SVG CHARACTERS ────────────────────────────────────────────────────────────
const ArcherSVG = ({ouch,svgRef}:{ouch:boolean;svgRef:React.RefObject<SVGSVGElement>}) => (
  <svg ref={svgRef} width="80" height="90" viewBox="0 0 80 90"
    style={{position:"absolute",left:4,top:"50%",transform:"translateY(-50%)",zIndex:40,
      filter:ouch?"drop-shadow(0 0 14px rgba(239,68,68,0.95))":"drop-shadow(2px 4px 8px rgba(0,0,0,0.4))"}}>
    <ellipse cx="32" cy="62" rx="14" ry="18" fill={ouch?"#ef4444":"#f97316"}/>
    <rect x="18" y="68" width="28" height="5" rx="2" fill="#92400e"/><rect x="29" y="66" width="6" height="9" rx="2" fill="#fbbf24"/>
    <circle cx="32" cy="34" r="18" fill="#fde68a"/>
    <ellipse cx="32" cy="18" rx="18" ry="8" fill="#92400e"/>
    <ellipse cx="14" cy="26" rx="5" ry="8" fill="#92400e"/><ellipse cx="50" cy="26" rx="5" ry="8" fill="#92400e"/>
    {ouch?(<>
      <line x1="20" y1="30" x2="29" y2="39" stroke="#1e3a5f" strokeWidth="3" strokeLinecap="round"/>
      <line x1="29" y1="30" x2="20" y2="39" stroke="#1e3a5f" strokeWidth="3" strokeLinecap="round"/>
      <line x1="36" y1="30" x2="45" y2="39" stroke="#1e3a5f" strokeWidth="3" strokeLinecap="round"/>
      <line x1="45" y1="30" x2="36" y2="39" stroke="#1e3a5f" strokeWidth="3" strokeLinecap="round"/>
    </>):(<>
      <circle cx="24" cy="34" r="5" fill="white"/><circle cx="40" cy="34" r="5" fill="white"/>
      <circle cx="25.5" cy="35" r="3" fill="#1e3a5f"/><circle cx="41.5" cy="35" r="3" fill="#1e3a5f"/>
      <circle cx="26.5" cy="34" r="1.2" fill="white"/><circle cx="42.5" cy="34" r="1.2" fill="white"/>
    </>)}
    {ouch
      ?<ellipse cx="32" cy="44" rx="6" ry="4" fill="#92400e"/>
      :<path d="M26 42 Q32 48 38 42" stroke="#92400e" strokeWidth="2" fill="none" strokeLinecap="round"/>}
    <circle cx="20" cy="40" r="4" fill="#fca5a5" opacity="0.6"/><circle cx="44" cy="40" r="4" fill="#fca5a5" opacity="0.6"/>
    {ouch&&(
      <text x="56" y="20" fontFamily={F} fontWeight="900" fontSize="14" fill="#ef4444" stroke="white" strokeWidth="0.5">OW!</text>
    )}
    <rect x="44" y="50" width="6" height="22" rx="3" fill="#fde68a"/>
    <path d="M54 44 Q68 58 54 72" stroke="#92400e" strokeWidth="3.5" fill="none" strokeLinecap="round"/>
    <line x1="54" y1="44" x2="54" y2="72" stroke="#fbbf24" strokeWidth="1.5" strokeDasharray="2,2"/>
    <line x1="54" y1="58" x2="68" y2="58" stroke="#92400e" strokeWidth="2"/>
    <polygon points="68,58 63,55 63,61" fill="#ef4444"/>
    <rect x="22" y="76" width="9" height="14" rx="4" fill={ouch?"#ef4444":"#f97316"}/>
    <rect x="33" y="76" width="9" height="14" rx="4" fill={ouch?"#ef4444":"#f97316"}/>
    <ellipse cx="26" cy="89" rx="7" ry="4" fill="#92400e"/><ellipse cx="37" cy="89" rx="7" ry="4" fill="#92400e"/>
  </svg>
);

const BalloonSVG = ({color,word,onClick}:{color:string;word:string;onClick:()=>void}) => (
  <svg width="110" height="130" viewBox="0 0 110 130" style={{cursor:"pointer",overflow:"visible"}} onClick={onClick}>
    <path d="M55 100 C45 108 65 116 55 124" stroke={color} strokeWidth="2.5" fill="none" strokeLinecap="round"/>
    <ellipse cx="55" cy="50" rx="36" ry="42" fill={color+"dd"}/>
    <ellipse cx="43" cy="28" rx="10" ry="14" fill="rgba(255,255,255,0.45)" transform="rotate(-20,43,28)"/>
    <path d="M47 90 L55 96 L63 90 Q59 94 55 96 Q51 94 47 90Z" fill={color}/>
    <circle cx="46" cy="46" r="5" fill="white"/><circle cx="64" cy="46" r="5" fill="white"/>
    <circle cx="47" cy="47" r="3" fill="#1e293b"/><circle cx="65" cy="47" r="3" fill="#1e293b"/>
    <circle cx="48" cy="46" r="1.2" fill="white"/><circle cx="66" cy="46" r="1.2" fill="white"/>
    <path d="M46 58 Q55 66 64 58" stroke="#1e293b" strokeWidth="2" fill="none" strokeLinecap="round"/>
    <circle cx="39" cy="56" r="5" fill="rgba(255,150,150,0.5)"/><circle cx="71" cy="56" r="5" fill="rgba(255,150,150,0.5)"/>
    <rect x="2" y="62" width="106" height="30" rx="13" fill="rgba(0,0,0,0.62)"/>
    <text x="55" y="83" textAnchor="middle" fontFamily={F} fontWeight="800" fontSize="18" fill="white">{word}</text>
  </svg>
);

const CritterSVG = ({word,isTarget,type}:{word:string;isTarget:boolean;type:number}) => {
  const colors=[{body:"#a78bfa",belly:"#ddd6fe",eye:"#4c1d95"},{body:"#34d399",belly:"#a7f3d0",eye:"#064e3b"},{body:"#f472b6",belly:"#fbcfe8",eye:"#831843"},{body:"#fb923c",belly:"#fed7aa",eye:"#7c2d12"}];
  const c=colors[type%colors.length];
  return (
    <svg width="110" height="80" viewBox="0 0 110 80" style={{overflow:"visible"}}>
      {isTarget&&[0,72,144,216,288].map((a,i)=>(
        <path key={i} d="M55 4 L56.5 8.5 L61 8.5 L57.5 11 L59 15.5 L55 13 L51 15.5 L52.5 11 L49 8.5 L53.5 8.5Z" fill="#fbbf24" transform={`rotate(${a},55,35) translate(0,-22)`} opacity="0.9" style={{animation:"spinHalo 3s linear infinite"}}/>
      ))}
      <ellipse cx="55" cy="50" rx="28" ry="22" fill={c.body}/><ellipse cx="55" cy="54" rx="18" ry="13" fill={c.belly}/>
      <circle cx="55" cy="28" r="24" fill={c.body}/>
      <ellipse cx="34" cy="14" rx="9" ry="12" fill={c.body}/><ellipse cx="34" cy="14" rx="5" ry="8" fill={c.belly}/>
      <ellipse cx="76" cy="14" rx="9" ry="12" fill={c.body}/><ellipse cx="76" cy="14" rx="5" ry="8" fill={c.belly}/>
      <circle cx="46" cy="26" r="7" fill="white"/><circle cx="64" cy="26" r="7" fill="white"/>
      <circle cx="47" cy="27" r="4" fill={c.eye}/><circle cx="65" cy="27" r="4" fill={c.eye}/>
      <circle cx="48" cy="25.5" r="1.8" fill="white"/><circle cx="66" cy="25.5" r="1.8" fill="white"/>
      <ellipse cx="55" cy="35" rx="4" ry="3" fill={c.eye}/>
      <path d="M47 39 Q55 46 63 39" stroke={c.eye} strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      <circle cx="39" cy="36" r="5" fill="rgba(255,150,150,0.45)"/><circle cx="71" cy="36" r="5" fill="rgba(255,150,150,0.45)"/>
      <rect x="0" y="63" width="110" height="18" rx="8" fill="rgba(0,0,0,0.65)"/>
      <text x="55" y="76" textAnchor="middle" fontFamily={F} fontWeight="800" fontSize="16" fill="white">{word}</text>
    </svg>
  );
};

const HammerSVG = ({x,y,slamming}:{x:number;y:number;slamming:boolean}) => (
  <svg width="50" height="70" viewBox="0 0 50 70" style={{position:"fixed",left:x-25,top:y-10,zIndex:80,pointerEvents:"none",transform:slamming?"rotate(30deg) scale(1.2)":"rotate(-15deg)",transformOrigin:"40px 60px",transition:"transform 0.08s",filter:"drop-shadow(2px 4px 8px rgba(0,0,0,0.5))"}}>
    <rect x="22" y="30" width="8" height="40" rx="4" fill="#92400e"/>
    <rect x="6" y="6" width="38" height="28" rx="8" fill="#6b7280"/><rect x="6" y="6" width="38" height="10" rx="8" fill="#9ca3af"/>
    <circle cx="20" cy="20" r="3" fill="#fbbf24" opacity="0.7"/><circle cx="32" cy="20" r="3" fill="#fbbf24" opacity="0.7"/>
  </svg>
);

const SnakeHeadSVG = ({ouch=false}:{ouch?:boolean}) => (
  <svg width="34" height="34" viewBox="0 0 34 34">
    <ellipse cx="17" cy="17" rx="16" ry="14" fill={ouch?"#ef4444":"#4ade80"}/>
    {ouch?(<>
      <line x1="8" y1="10" x2="14" y2="16" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
      <line x1="14" y1="10" x2="8" y2="16" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
      <line x1="20" y1="10" x2="26" y2="16" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
      <line x1="26" y1="10" x2="20" y2="16" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M11 23 Q17 19 23 23" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round"/>
      <text x="17" y="-4" textAnchor="middle" fontFamily={F} fontWeight="900" fontSize="7" fill="#fbbf24">OW!</text>
    </>):(<>
      <circle cx="11" cy="13" r="5" fill="white"/><circle cx="23" cy="13" r="5" fill="white"/>
      <circle cx="12" cy="14" r="3" fill="#166534"/><circle cx="24" cy="14" r="3" fill="#166534"/>
      <circle cx="13" cy="13" r="1.2" fill="white"/><circle cx="25" cy="13" r="1.2" fill="white"/>
      <path d="M11 22 Q17 27 23 22" stroke="#166534" strokeWidth="2" fill="none" strokeLinecap="round"/>
    </>)}
    <path d="M17 26 L17 31" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round"/>
    <path d="M17 31 L14 34 M17 31 L20 34" stroke="#ef4444" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const RocketSVG = ({svgRef}:{svgRef:React.RefObject<SVGSVGElement>}) => (
  <svg ref={svgRef} width="52" height="80" viewBox="0 0 52 80" style={{position:"absolute",left:"50%",bottom:"8%",transform:"translateX(-50%)",zIndex:50,filter:"drop-shadow(0 0 14px rgba(74,222,128,0.9))",pointerEvents:"none"}}>
    <ellipse cx="26" cy="72" rx="10" ry="10" fill="#f97316" opacity="0.9" style={{animation:"flameFlicker 0.1s ease-in-out infinite alternate"}}/>
    <ellipse cx="26" cy="70" rx="7" ry="12" fill="#fbbf24" opacity="0.85" style={{animation:"flameFlicker 0.15s ease-in-out infinite alternate-reverse"}}/>
    <ellipse cx="26" cy="68" rx="4" ry="8" fill="white" opacity="0.7"/>
    <path d="M14 50 Q14 20 26 6 Q38 20 38 50 Z" fill="#e2e8f0"/>
    <path d="M14 50 Q14 20 26 6 Q20 18 18 50 Z" fill="rgba(255,255,255,0.4)"/>
    <path d="M16 42 Q26 40 36 42" stroke="#ef4444" strokeWidth="3" fill="none"/>
    <path d="M15 48 Q26 46 37 48" stroke="#ef4444" strokeWidth="3" fill="none"/>
    <circle cx="26" cy="28" r="9" fill="#93c5fd"/><circle cx="26" cy="28" r="9" fill="none" stroke="#60a5fa" strokeWidth="2"/>
    <circle cx="23" cy="27" r="2.5" fill="#1e3a5f"/><circle cx="29" cy="27" r="2.5" fill="#1e3a5f"/>
    <circle cx="23.8" cy="26.2" r="1" fill="white"/><circle cx="29.8" cy="26.2" r="1" fill="white"/>
    <path d="M22 31 Q26 34 30 31" stroke="#1e3a5f" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
    <path d="M14 50 L4 62 L14 58 Z" fill="#ef4444"/><path d="M38 50 L48 62 L38 58 Z" fill="#ef4444"/>
  </svg>
);

const AlienSVG = ({word,idx}:{word:string;idx:number}) => {
  const alienColors=[{body:"#a78bfa",eye:"#4c1d95"},{body:"#34d399",eye:"#064e3b"},{body:"#f472b6",eye:"#831843"},{body:"#fb923c",eye:"#7c2d12"},{body:"#38bdf8",eye:"#0c4a6e"},{body:"#a3e635",eye:"#365314"}];
  const c=alienColors[idx%alienColors.length];
  return (
    <svg width="110" height="82" viewBox="0 0 110 82" style={{overflow:"visible"}}>
      <line x1="42" y1="12" x2="34" y2="2" stroke={c.body} strokeWidth="2.5" strokeLinecap="round"/><circle cx="33" cy="1" r="4" fill="#fbbf24"/>
      <line x1="68" y1="12" x2="76" y2="2" stroke={c.body} strokeWidth="2.5" strokeLinecap="round"/><circle cx="77" cy="1" r="4" fill="#fbbf24"/>
      <ellipse cx="55" cy="50" rx="20" ry="14" fill={c.body}/>
      <path d="M35 46 Q27 40 29 34" stroke={c.body} strokeWidth="6" fill="none" strokeLinecap="round"/><circle cx="29" cy="33" r="5" fill={c.body}/>
      <path d="M75 46 Q83 40 81 34" stroke={c.body} strokeWidth="6" fill="none" strokeLinecap="round"/><circle cx="81" cy="33" r="5" fill={c.body}/>
      <ellipse cx="55" cy="28" rx="24" ry="20" fill={c.body}/>
      <ellipse cx="45" cy="26" rx="9" ry="10" fill="white"/><ellipse cx="65" cy="26" rx="9" ry="10" fill="white"/>
      <ellipse cx="45" cy="27" rx="6" ry="7" fill={c.eye}/><ellipse cx="65" cy="27" rx="6" ry="7" fill={c.eye}/>
      <circle cx="47" cy="25" r="2.5" fill="white"/><circle cx="67" cy="25" r="2.5" fill="white"/>
      <path d="M45 39 Q50 43 55 39 Q60 35 65 39" stroke={c.eye} strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      <rect x="0" y="56" width="110" height="26" rx="11" fill="rgba(0,0,20,0.85)"/>
      <text x="55" y="74" textAnchor="middle" fontFamily={F} fontWeight="800" fontSize="18" fill="#00ffff">{word}</text>
    </svg>
  );
};

const TreeSVG = ({x,opacity}:{x:number;opacity:number}) => (
  <svg width="60" height="90" viewBox="0 0 60 90" style={{position:"fixed",bottom:0,left:`${x}%`,opacity,zIndex:0,pointerEvents:"none"}}>
    <rect x="24" y="60" width="12" height="30" rx="5" fill="#92400e"/>
    <ellipse cx="30" cy="58" rx="28" ry="22" fill="#15803d"/><ellipse cx="30" cy="40" rx="22" ry="20" fill="#16a34a"/><ellipse cx="30" cy="24" rx="15" ry="16" fill="#22c55e"/>
    <circle cx="40" cy="46" r="4" fill="#ef4444"/><circle cx="18" cy="52" r="3.5" fill="#ef4444"/><circle cx="36" cy="28" r="3" fill="#fbbf24"/>
  </svg>
);

const CloudSVG = ({x,y,scale,delay}:{x:number;y:number;scale:number;delay:number}) => (
  <svg width="160" height="80" viewBox="0 0 160 80" style={{position:"absolute",left:`${x}%`,top:`${y}%`,transform:`scale(${scale})`,zIndex:1,pointerEvents:"none",animation:`cloudDrift ${8+delay}s ease-in-out infinite ${delay}s`}}>
    <ellipse cx="80" cy="52" rx="68" ry="30" fill="rgba(255,255,255,0.9)"/>
    <ellipse cx="55" cy="40" rx="32" ry="28" fill="rgba(255,255,255,0.95)"/><ellipse cx="95" cy="36" rx="28" ry="26" fill="rgba(255,255,255,0.95)"/>
    <ellipse cx="75" cy="30" rx="22" ry="20" fill="white"/>
    <circle cx="68" cy="46" r="3" fill="#93c5fd" opacity="0.6"/><circle cx="84" cy="46" r="3" fill="#93c5fd" opacity="0.6"/>
    <path d="M68 52 Q76 57 84 52" stroke="#93c5fd" strokeWidth="2" fill="none" opacity="0.6" strokeLinecap="round"/>
  </svg>
);

const InstructionBar = ({text,color="#fbbf24"}:{text:string;color?:string}) => (
  <div style={{position:"fixed",bottom:0,left:0,right:0,zIndex:90,background:"rgba(0,0,0,0.7)",backdropFilter:"blur(8px)",borderTop:"1.5px solid rgba(255,255,255,0.1)",padding:"0.4rem 1rem",textAlign:"center",pointerEvents:"none"}}>
    <span style={{fontFamily:F,fontWeight:700,fontSize:"1rem",color}}>{text}</span>
  </div>
);

// ══════════════════════════════════════════════════════════════════════════════
// GAME 1: ARROW SHOOT 🏹
// ══════════════════════════════════════════════════════════════════════════════
const ArrowShoot = ({unit,diff,onBack,onClaim,claimState,treatsEarnedToday=0,fromDino=false,onRestart}:{unit:UnitData;diff:Diff;onBack:()=>void;onClaim?:()=>void;claimState?:"available"|"claimed"|"capped";treatsEarnedToday?:number;fromDino?:boolean;onRestart?:()=>void}) => {
  const play=useAudio();
  const cfg=DIFF_CONFIG[diff];
  type Balloon={id:number;word:string;x:number;y:number;speed:number;color:string};

  const COLOR_MAP:Record<string,string>={yellow:"#fbbf24",red:"#ef4444",blue:"#3b82f6",green:"#22c55e",purple:"#a855f7",black:"#374151",brown:"#92400e",white:"#e5e7eb",mix:"#f472b6",mural:"#fb923c",ocean:"#0ea5e9",sand:"#d97706",seaweed:"#16a34a",seashell:"#e879f9",jellyfish:"#818cf8",starfish:"#f97316",eagle:"#92400e",chick:"#fde68a",nest:"#a16207",opossum:"#94a3b8","tree hollow":"#166534",honeybee:"#fbbf24",hive:"#f59e0b",crab:"#dc2626",family:"#f43f5e",grandmother:"#a855f7",grandfather:"#6366f1",father:"#0ea5e9",mother:"#ec4899",brother:"#22c55e",sister:"#f97316",friend:"#fbbf24",hamster:"#d97706",goldfish:"#f97316",bird:"#38bdf8",rabbit:"#e879f9",lizard:"#4ade80",kitten:"#fb923c"};
  const FALLBACK=["#f472b6","#fb923c","#0ea5e9","#818cf8","#34d399","#f97316","#38bdf8","#a78bfa","#4ade80","#fbbf24"];
  const getBalloonColor=(w:string,i:number)=>COLOR_MAP[w]||FALLBACK[i%FALLBACK.length];

  const TOTAL=unit.vocab.length;
  const [balloons,setBalloons]=useState<Balloon[]>([]);
  const [target,setTarget]=useState(unit.vocab[0]);
  const [score,setScore]=useState(0);
  const [round,setRound]=useState(0);
  const [wordsCleared,setWordsCleared]=useState<Set<string>>(new Set());
  const [done,setDone]=useState(false);
  const [doneReason,setDoneReason]=useState<"timeout"|"lives">("timeout");
  const [timeLeft,setTimeLeft]=useState(cfg.timerSec);
  const [unitClear,setUnitClear]=useState(false);
  const [lives,setLives]=useState(5);
  const [ouch,setOuch]=useState(false);
  const [shots,setShots]=useState<{id:number;fromY:number;toX:number;toY:number}[]>([]);
  const [pops,setPops]=useState<{id:number;x:number;y:number;color:string}[]>([]);
  const [countdown,setCountdown]=useState(false);
  const [paused,setPaused]=useState(false);

  const archerRef=useRef<SVGSVGElement>(null);
  const bowYRef=useRef(50);
  const idR=useRef(0),shotId=useRef(0),popId=useRef(0);
  const animRef=useRef<number>();const lastSpawn=useRef(0);
  const targetRef=useRef(target);targetRef.current=target;
  const balloonsRef=useRef(balloons);balloonsRef.current=balloons;
  const handleClickRef=useRef<(b:Balloon)=>void>(()=>{});
  const ouchRef=useRef(false);
  const doneRef=useRef(done);doneRef.current=done;
  const pausedRef=useRef(paused);pausedRef.current=paused;
  const livesRef=useRef(5);
  const wordsClearedRef=useRef<Set<string>>(new Set());
  const invincibleRef=useRef(false);
  const lastBalloonWordRef=useRef("");

  const nextTarget=useCallback((cleared:Set<string>)=>{
    const remaining=unit.vocab.filter(v=>!cleared.has(v));
    if(!remaining.length) return "";
    const others=remaining.filter(v=>v!==targetRef.current);
    const pool=others.length?others:remaining;
    const w=pool[Math.floor(Math.random()*pool.length)];
    setTarget(w);return w;
  },[unit]);

  useEffect(()=>{
    let raf:number;
    const tick=()=>{if(archerRef.current) archerRef.current.style.top=`${bowYRef.current}%`;raf=requestAnimationFrame(tick);};
    raf=requestAnimationFrame(tick);return()=>cancelAnimationFrame(raf);
  },[]);

  const held=useRef(new Set<string>());
  useEffect(()=>{
    const dn=(e:KeyboardEvent)=>{
      if(["ArrowUp","ArrowDown"].includes(e.key)) e.preventDefault();
      held.current.add(e.key);
      if(e.key==="ArrowUp") bowYRef.current=Math.max(5,bowYRef.current-2);
      if(e.key==="ArrowDown") bowYRef.current=Math.min(92,bowYRef.current+2);
    };
    const up=(e:KeyboardEvent)=>held.current.delete(e.key);
    const iv=setInterval(()=>{
      if(held.current.has("ArrowUp")) bowYRef.current=Math.max(5,bowYRef.current-0.6);
      if(held.current.has("ArrowDown")) bowYRef.current=Math.min(92,bowYRef.current+0.6);
    },16);
    window.addEventListener("keydown",dn);window.addEventListener("keyup",up);
    return()=>{window.removeEventListener("keydown",dn);window.removeEventListener("keyup",up);clearInterval(iv);};
  },[]);

  useEffect(()=>{
    if(done||paused) return;
    const t=setInterval(()=>setTimeLeft(tl=>{if(tl<=1){clearInterval(t);setDoneReason("timeout");setDone(true);return 0;}return tl-1;}),1000);
    return()=>clearInterval(t);
  },[done,paused]);

  useEffect(()=>{
    if(done||paused) return;
    const loop=(ts:number)=>{
      setBalloons(prev=>{
        let next=prev.map(b=>({...b,x:b.x-b.speed})).filter(b=>b.x>-150);
        if(ts-lastSpawn.current>cfg.spawnMs && next.length<cfg.maxOnScreen){
          lastSpawn.current=ts;
          const targetCount=next.filter(b=>b.word===targetRef.current).length;
          // Only force target if none on screen AND 4+ other balloons have spawned without it
          const forceTarget=targetCount===0 && next.length>=Math.min(3,cfg.maxOnScreen-1);
          const word=forceTarget
            ? targetRef.current
            : unit.vocab[Math.floor(Math.random()*unit.vocab.length)];
          lastBalloonWordRef.current=word;
          let y=10+Math.random()*75;
          for(let attempt=0;attempt<8;attempt++){
            const tooClose=next.some(b=>b.x>window.innerWidth*0.6&&Math.abs(b.y-y)<15);
            if(!tooClose) break;
            y=10+Math.random()*75;
          }
          next=[...next,{id:idR.current++,word,x:window.innerWidth+80,y,speed:(1.1+Math.random()*1.1)*cfg.speedMult,color:getBalloonColor(word,unit.vocab.indexOf(word))}];
        }
        if(!ouchRef.current&&!doneRef.current&&!pausedRef.current&&!invincibleRef.current){
          const hit=next.find(b=>b.x<90&&b.x>0&&Math.abs(b.y-bowYRef.current)<12);
          if(hit){
            next=next.filter(b=>b.id!==hit.id);
            ouchRef.current=true;setOuch(true);play("wrong");
            livesRef.current--;setLives(livesRef.current);
            if(livesRef.current<=0){setDoneReason("lives");setDone(true);}
            else{setTimeout(()=>{setPaused(true);setCountdown(true);},1000);}
            setTimeout(()=>{setOuch(false);ouchRef.current=false;},1000);
          }
        }
        return next;
      });
      animRef.current=requestAnimationFrame(loop);
    };
    animRef.current=requestAnimationFrame(loop);
    return()=>{if(animRef.current)cancelAnimationFrame(animRef.current);};
  },[done,paused]);

  const handleClick=(b:Balloon)=>{
    if(ouchRef.current||pausedRef.current) return;
    const sid=shotId.current++;
    const fromY=(bowYRef.current/100)*window.innerHeight;
    play("shoot");
    setShots(s=>[...s,{id:sid,fromY,toX:b.x,toY:(b.y/100)*window.innerHeight}]);
    setTimeout(()=>{
      setShots(s=>s.filter(sh=>sh.id!==sid));
      if(b.word===targetRef.current){
        play("correct");speak(b.word,"en-US");
        const pid=popId.current++;
        setPops(p=>[...p,{id:pid,x:b.x,y:(b.y/100)*window.innerHeight,color:b.color}]);
        setTimeout(()=>setPops(p=>p.filter(pp=>pp.id!==pid)),700);
        setBalloons(prev=>prev.filter(bb=>bb.id!==b.id));
        setScore(s=>s+1);setRound(r=>r+1);
        const newCleared=new Set([...wordsClearedRef.current,b.word]);
        wordsClearedRef.current=newCleared;setWordsCleared(newCleared);
        if(newCleared.size>=TOTAL) setUnitClear(true);
        else nextTarget(newCleared);
      } else play("wrong");
    },350);
  };
  handleClickRef.current=handleClick;

  const doRestart=()=>{
    onRestart?.();
    setScore(0);setRound(0);setTimeLeft(cfg.timerSec);setLives(5);livesRef.current=5;
    setOuch(false);ouchRef.current=false;setDone(false);setUnitClear(false);
    setBalloons([]);bowYRef.current=50;setPaused(false);setCountdown(false);
    wordsClearedRef.current=new Set();setWordsCleared(new Set());
    invincibleRef.current=false;lastBalloonWordRef.current="";
    nextTarget(new Set());
  };

  if(unitClear) return <UnitClearScreen unit={unit} onBack={onBack} onPlay={doRestart} onClaim={onClaim} claimState={claimState} diff={diff} treatsEarnedToday={treatsEarnedToday} fromDino={fromDino}/>;
  if(done) return <ResultScreen score={score} total={Math.max(round,1)} onBack={onBack} onPlay={doRestart} reason={doneReason}/>;

  return (
    <div className="mpe-game-noselect" style={{width:"100%",height:"100vh",position:"relative",overflow:"hidden",cursor:"url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"48\" height=\"48\" viewBox=\"0 0 48 48\"><circle cx=\"24\" cy=\"24\" r=\"10\" fill=\"none\" stroke=\"black\" stroke-width=\"3\"/><circle cx=\"24\" cy=\"24\" r=\"10\" fill=\"none\" stroke=\"white\" stroke-width=\"1.5\"/><line x1=\"24\" y1=\"2\" x2=\"24\" y2=\"16\" stroke=\"black\" stroke-width=\"3\"/><line x1=\"24\" y1=\"2\" x2=\"24\" y2=\"16\" stroke=\"white\" stroke-width=\"1.5\"/><line x1=\"24\" y1=\"32\" x2=\"24\" y2=\"46\" stroke=\"black\" stroke-width=\"3\"/><line x1=\"24\" y1=\"32\" x2=\"24\" y2=\"46\" stroke=\"white\" stroke-width=\"1.5\"/><line x1=\"2\" y1=\"24\" x2=\"16\" y2=\"24\" stroke=\"black\" stroke-width=\"3\"/><line x1=\"2\" y1=\"24\" x2=\"16\" y2=\"24\" stroke=\"white\" stroke-width=\"1.5\"/><line x1=\"32\" y1=\"24\" x2=\"46\" y2=\"24\" stroke=\"black\" stroke-width=\"3\"/><line x1=\"32\" y1=\"24\" x2=\"46\" y2=\"24\" stroke=\"white\" stroke-width=\"1.5\"/></svg>') 24 24, crosshair",paddingBottom:36,background:"linear-gradient(180deg,#4fc3f7 0%,#81d4fa 30%,#b3e5fc 55%,#c8e6c9 75%,#a5d6a7 100%)",userSelect:"none",WebkitTouchCallout:"none"}}>
      <style>{`
        @keyframes bFloat{0%,100%{transform:translateY(0) rotate(-2deg)}50%{transform:translateY(-14px) rotate(2deg)}}
        @keyframes popBurst{0%{transform:scale(1);opacity:1}100%{transform:scale(3.5);opacity:0}}
        @keyframes cloudDrift{0%,100%{transform:translateX(0)}50%{transform:translateX(22px)}}
        @keyframes flameFlicker{0%{transform:scaleY(1)}100%{transform:scaleY(1.3) scaleX(0.85)}}
        @keyframes spinHalo{0%{transform:rotate(0deg) translate(0,-22px)}100%{transform:rotate(360deg) translate(0,-22px)}}
      `}</style>
      <CloudSVG x={6} y={5} scale={1.1} delay={0}/><CloudSVG x={32} y={12} scale={0.8} delay={2}/>
      <CloudSVG x={60} y={4} scale={1} delay={4}/><CloudSVG x={78} y={16} scale={0.85} delay={1}/>
      <div className="mpe-fs-bar" style={{position:"absolute",top:12,left:0,right:0,display:"flex",justifyContent:"space-between",alignItems:"center",padding:"0 12px",zIndex:50,gap:"0.5rem"}}>
        <button onClick={onBack} style={{background:"rgba(0,0,0,0.55)",border:"2px solid rgba(255,255,255,0.25)",color:"white",fontFamily:F,fontWeight:800,fontSize:"0.95rem",padding:"0.3rem 0.85rem",borderRadius:999,cursor:"pointer",flexShrink:0}}>← Back</button>
        <FullscreenButton/>
        <div style={{background:"rgba(0,0,0,0.72)",backdropFilter:"blur(10px)",borderRadius:999,padding:"0.45rem 1.4rem",border:"2px solid rgba(255,255,255,0.25)",flex:1,textAlign:"center",minWidth:0}}>
          <span style={{fontFamily:F,fontWeight:800,fontSize:"1.15rem",color:"white",whiteSpace:"nowrap"}}>🏹 <span style={{color:"#fbbf24",fontSize:"1.8rem"}}>{unit.chinese[target]||target}</span> <button onClick={()=>speak((unit.chinese[target]||target).split("/")[0].trim(),"zh-TW")} style={{background:"none",border:"none",cursor:"pointer",fontSize:"1.4rem",verticalAlign:"middle",padding:"0 0.2rem",lineHeight:1}}>🔊</button></span>
        </div>
        <div style={{display:"flex",gap:"0.4rem",alignItems:"center",flexShrink:0}}>
          <Pill dark red={timeLeft<=10}>⏱{timeLeft}s</Pill>
          <Pill>⭐{score}</Pill>
          <Pill><span style={{color:cfg.color}}>{cfg.emoji}</span>{cfg.label}</Pill>
          <Pill>{"❤️".repeat(Math.max(0,lives))}</Pill>
        </div>
      </div>
      <ArcherSVG ouch={ouch} svgRef={archerRef}/>
      <svg style={{position:"absolute",inset:0,width:"100%",height:"100%",pointerEvents:"none",zIndex:35}}>
        {shots.map(s=>(
          <g key={s.id}>
            <line x1={72} y1={s.fromY} x2={s.toX} y2={s.toY} stroke="#fbbf24" strokeWidth="2" strokeDasharray="6,4" opacity="0.7"/>
            <polygon points={`${s.toX},${s.toY} ${s.toX-12},${s.toY-5} ${s.toX-12},${s.toY+5}`} fill="#ef4444" opacity="0.9"/>
          </g>
        ))}
      </svg>
      {balloons.map(b=>(
        <div key={b.id} style={{position:"fixed",left:b.x-40,top:`${b.y}%`,transform:"translateY(-65px)",cursor:"pointer",zIndex:30,animation:"bFloat 2.5s ease-in-out infinite"}}>
          <BalloonSVG color={b.color} word={b.word} onClick={()=>handleClick(b)}/>
        </div>
      ))}
      {pops.map(p=>(
        <div key={p.id} style={{position:"fixed",left:p.x,top:p.y,transform:"translate(-50%,-50%)",pointerEvents:"none",zIndex:60}}>
          {[...Array(12)].map((_,i)=>{const a=(i/12)*Math.PI*2;return <div key={i} style={{position:"absolute",width:12,height:12,borderRadius:"50%",background:i%2===0?p.color:"#fbbf24",animation:"popBurst 0.65s ease-out forwards",animationDelay:`${i*0.02}s`,transform:`translate(${Math.cos(a)*60}px,${Math.sin(a)*60}px)`}}/>;})  }
          <div style={{position:"absolute",fontSize:"2.5rem",animation:"popBurst 0.4s ease-out forwards",left:-20,top:-20}}>💥</div>
        </div>
      ))}
      <svg style={{position:"absolute",bottom:36,left:0,right:0,width:"100%",height:55,zIndex:5}} viewBox="0 0 800 55" preserveAspectRatio="none">
        <rect x="0" y="15" width="800" height="40" fill="#4a9e4a"/>
        <path d="M0 15 Q100 3 200 13 Q300 2 400 11 Q500 1 600 10 Q700 3 800 13 L800 55 L0 55Z" fill="#5cb85c"/>
      </svg>
      <div style={{position:"absolute",bottom:0,left:0,right:0,paddingBottom:"calc(env(safe-area-inset-bottom) + 90px)",paddingLeft:24,display:"flex",alignItems:"flex-end",justifyContent:"flex-start",zIndex:100,pointerEvents:"none"}}>
        {"ontouchstart" in window ?
          <div style={{display:"flex",flexDirection:"column",gap:16,pointerEvents:"auto"}}>
            <button
              onTouchStart={(e)=>{e.stopPropagation();const iv=setInterval(()=>{bowYRef.current=Math.max(5,bowYRef.current-1.2);},16);(e.currentTarget as any)._iv=iv;}}
              onTouchEnd={(e)=>{e.stopPropagation();clearInterval((e.currentTarget as any)._iv);}}
              style={{width:96,height:72,borderRadius:16,background:"rgba(0,0,0,0.25)",border:"2px solid rgba(255,255,255,0.4)",color:"white",fontSize:"1.8rem",fontFamily:"Fredoka One, sans-serif",cursor:"pointer",userSelect:"none",touchAction:"none"}}>▲</button>
            <button
              onTouchStart={(e)=>{e.stopPropagation();const iv=setInterval(()=>{bowYRef.current=Math.min(92,bowYRef.current+1.2);},16);(e.currentTarget as any)._iv=iv;}}
              onTouchEnd={(e)=>{e.stopPropagation();clearInterval((e.currentTarget as any)._iv);}}
              style={{width:96,height:72,borderRadius:16,background:"rgba(0,0,0,0.25)",border:"2px solid rgba(255,255,255,0.4)",color:"white",fontSize:"1.8rem",fontFamily:"Fredoka One, sans-serif",cursor:"pointer",userSelect:"none",touchAction:"none"}}>▼</button>
          </div>
        :
          <div style={{textAlign:"center",pointerEvents:"none",background:"rgba(0,0,0,0.55)",borderRadius:999,padding:"0.4rem 1.4rem",border:"2px solid rgba(255,255,255,0.15)"}}>
            <div style={{color:"#fbbf24",fontFamily:"Fredoka One, sans-serif",fontSize:"1.3rem",letterSpacing:"0.03em"}}>↑ ↓ Move Archer &nbsp;•&nbsp; Click the Correct Balloon!</div>
            <div style={{color:"#fbbf24",fontFamily:"Nunito, sans-serif",fontSize:"1.1rem",marginTop:2}}>↑ ↓ 移動弓手 • 點擊正確的氣球！</div>
          </div>
        }
      </div>
      {countdown&&<CountdownOverlay onDone={()=>{
        setCountdown(false);setPaused(false);
        setBalloons(prev=>prev.filter(b=>!(b.x<200&&Math.abs(b.y-bowYRef.current)<25)));
        invincibleRef.current=true;
        setTimeout(()=>{invincibleRef.current=false;},2500);
      }}/>}
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// GAME 2: WHACK-A-MOLE 🔨
// ══════════════════════════════════════════════════════════════════════════════
const WhackAMole = ({unit,diff,onBack,onClaim,claimState,treatsEarnedToday=0,fromDino=false,onRestart}:{unit:UnitData;diff:Diff;onBack:()=>void;onClaim?:()=>void;claimState?:"available"|"claimed"|"capped";treatsEarnedToday?:number;fromDino?:boolean;onRestart?:()=>void}) => {
  const play=useAudio();
  const cfg=DIFF_CONFIG[diff];
  const HOLES=9;const TOTAL=unit.vocab.length;
  type Mole={word:string;emoji:string;isTarget:boolean;type:number}|null;
  const [moles,setMoles]=useState<Mole[]>(Array(HOLES).fill(null));
  const [target,setTarget]=useState(unit.vocab[0]);
  const [score,setScore]=useState(0);
  const [round,setRound]=useState(0);
  const [wordsCleared,setWordsCleared]=useState<Set<string>>(new Set());
  const [lives,setLives]=useState(5);
  const [done,setDone]=useState(false);
  const [doneReason,setDoneReason]=useState<"timeout"|"lives">("timeout");
  const [timeLeft,setTimeLeft]=useState(cfg.timerSec);
  const [unitClear,setUnitClear]=useState(false);
  const [hitIdx,setHitIdx]=useState<number|null>(null);
  const [missIdx,setMissIdx]=useState<number|null>(null);
  const [mousePos,setMousePos]=useState({x:0,y:0});
  const [slamming,setSlamming]=useState(false);
  const [countdown,setCountdown]=useState(false);
  const [paused,setPaused]=useState(false);
  const [overUI,setOverUI]=useState(false);
  const timers=useRef<ReturnType<typeof setTimeout>[]>([]);
  const targetRef=useRef(target);targetRef.current=target;
  const wordsClearedRef=useRef<Set<string>>(new Set());
  const pausedRef=useRef(paused);pausedRef.current=paused;

  const pickTarget=useCallback((cleared:Set<string>)=>{
    const remaining=unit.vocab.filter(v=>!cleared.has(v));
    if(!remaining.length) return "";
    const others=remaining.filter(v=>v!==targetRef.current);
    const pool=others.length?others:remaining;
    const w=pool[Math.floor(Math.random()*pool.length)];
    setTarget(w);return w;
  },[unit]);

  const spawnMoles=useCallback((tgt:string,cleared:Set<string>,force=false)=>{
    if(!tgt||(pausedRef.current&&!force)) return;
    timers.current.forEach(clearTimeout);
    const positions=shuffle([...Array(HOLES).keys()]).slice(0,4+Math.floor(cfg.speedMult));
    const newMoles:Mole[]=Array(HOLES).fill(null);
    const others=shuffle(unit.vocab.filter(w=>w!==tgt));
    positions.forEach((pos,i)=>{const word=i===0?tgt:others[i-1]||unit.vocab[i%unit.vocab.length];newMoles[pos]={word,emoji:unit.emojis[unit.vocab.indexOf(word)]||"👾",isTarget:i===0,type:i};});
    setMoles(newMoles);
    const t=setTimeout(()=>{
      setMoles(Array(HOLES).fill(null));
      setTimeout(()=>{if(!pausedRef.current) spawnMoles(targetRef.current,wordsClearedRef.current);},350);
    },cfg.moleShowMs);
    timers.current=[t];
  },[unit,cfg]);

  useEffect(()=>{
    const tgt=pickTarget(new Set());setTimeout(()=>spawnMoles(tgt,new Set()),400);
    const t=setInterval(()=>{
      if(pausedRef.current) return;
      setTimeLeft(tl=>{if(tl<=1){clearInterval(t);timers.current.forEach(clearTimeout);setDoneReason("timeout");setDone(true);return 0;}return tl-1;});
    },1000);
    return()=>{clearInterval(t);timers.current.forEach(clearTimeout);};
  },[]);

  const whack=(i:number)=>{
    if(pausedRef.current) return;
    setSlamming(true);setTimeout(()=>setSlamming(false),180);
    const mole=moles[i];if(!mole) return;
    if(mole.word===targetRef.current){
      play("correct");speak(mole.word,"en-US");setHitIdx(i);setTimeout(()=>setHitIdx(null),350);
      setScore(s=>s+1);setRound(r=>r+1);
      setMoles(Array(HOLES).fill(null));timers.current.forEach(clearTimeout);
      const newCleared=new Set([...wordsClearedRef.current,mole.word]);
      wordsClearedRef.current=newCleared;setWordsCleared(newCleared);
      if(newCleared.size>=TOTAL){setUnitClear(true);return;}
      const tgt=pickTarget(newCleared);setTimeout(()=>spawnMoles(tgt,newCleared),400);
    } else {
      play("wrong");setMissIdx(i);setTimeout(()=>setMissIdx(null),350);
      setLives(l=>{
        const newL=l-1;
        if(newL<=0){setDoneReason("lives");setDone(true);return 0;}
        timers.current.forEach(clearTimeout);
        setMoles(Array(HOLES).fill(null));
        setPaused(true);setCountdown(true);
        return newL;
      });
    }
  };

  const doRestart=()=>{
    onRestart?.();
    setScore(0);setRound(0);setTimeLeft(cfg.timerSec);setLives(5);setDone(false);setUnitClear(false);setPaused(false);setCountdown(false);
    wordsClearedRef.current=new Set();setWordsCleared(new Set());
    setMoles(Array(HOLES).fill(null));const t=pickTarget(new Set());setTimeout(()=>spawnMoles(t,new Set()),400);
  };

  if(unitClear) return <UnitClearScreen unit={unit} onBack={onBack} onPlay={doRestart} onClaim={onClaim} claimState={claimState} diff={diff} treatsEarnedToday={treatsEarnedToday} fromDino={fromDino}/>;
  if(done) return <ResultScreen score={score} total={Math.max(round,1)} onBack={onBack} onPlay={doRestart} reason={doneReason}/>;

  return (
    <div className="mpe-game-noselect" style={{minHeight:"100vh",background:"linear-gradient(180deg,#0c4a6e 0%,#0369a1 40%,#0891b2 70%,#06b6d4 100%)",overflow:"hidden",userSelect:"none",WebkitTouchCallout:"none",cursor:overUI?"pointer":"none",paddingBottom:36}}
      onMouseMove={e=>setMousePos({x:e.clientX,y:e.clientY})} onClick={()=>setSlamming(true)}>
      <style>{`
        @keyframes moleRise{0%{transform:translateY(120%) scaleY(0.6);opacity:0}60%{transform:translateY(-8%) scaleY(1.05)}100%{transform:translateY(0) scaleY(1);opacity:1}}
        @keyframes bubUp{0%{transform:translateY(0);opacity:0.5}100%{transform:translateY(-100vh);opacity:0}}
        @keyframes spinHalo{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}
      `}</style>
      {[...Array(10)].map((_,i)=>(
        <div key={i} style={{position:"fixed",left:`${8+i*9}%`,bottom:-24,width:6+i%4*4,height:6+i%4*4,borderRadius:"50%",border:"1.5px solid rgba(255,255,255,0.5)",background:"rgba(255,255,255,0.08)",animation:`bubUp ${3.5+i*0.6}s ease-in infinite ${i*0.5}s`}}/>
      ))}
      <div style={{padding:"0.75rem 1rem 0",position:"relative",zIndex:20}}>
        <div className="mpe-fs-bar" style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"0.5rem"}}>
          <div style={{display:"flex",gap:"0.5rem",alignItems:"center"}}>
            <button onClick={onBack} onMouseEnter={()=>setOverUI(true)} onMouseLeave={()=>setOverUI(false)} style={{background:"rgba(255,255,255,0.18)",border:"2px solid rgba(255,255,255,0.35)",color:"white",fontFamily:F,fontWeight:800,fontSize:"0.95rem",padding:"0.3rem 0.85rem",borderRadius:999,cursor:"pointer"}}>← Back</button>
            <FullscreenButton/>
          </div>
          <div style={{display:"flex",gap:"0.5rem",alignItems:"center"}}>
            <Pill dark red={timeLeft<=10}>⏱{timeLeft}s</Pill>
            <Pill>⭐{score}</Pill>
            <Pill><span style={{color:cfg.color}}>{cfg.emoji}</span>{cfg.label}</Pill>
              <Pill>{"❤️".repeat(Math.max(0,lives))}</Pill>
            </div>
        </div>
        <div style={{textAlign:"center"}}>
          <div onMouseEnter={()=>setOverUI(true)} onMouseLeave={()=>setOverUI(false)} style={{background:"rgba(0,0,80,0.6)",backdropFilter:"blur(10px)",borderRadius:999,padding:"0.5rem 1.75rem",display:"inline-block",border:"2px solid rgba(255,255,255,0.25)"}}>
            <span style={{fontFamily:F,fontWeight:800,fontSize:"1.2rem",color:"white"}}>🔨 <span style={{color:"#fbbf24",fontSize:"1.8rem"}}>{unit.chinese[target]||target}</span> <button onClick={()=>speak((unit.chinese[target]||target).split("/")[0].trim(),"zh-TW")} style={{background:"none",border:"none",cursor:"pointer",fontSize:"1.4rem",verticalAlign:"middle",padding:"0 0.2rem",lineHeight:1}}>🔊</button></span>
          </div>
        </div>
      </div>
      <div style={{maxWidth:500,margin:"0.75rem auto",padding:"0 1rem",display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"0.85rem",position:"relative",zIndex:10}}>
        {Array(HOLES).fill(null).map((_,i)=>{
          const mole=moles[i],isHit=hitIdx===i,isMiss=missIdx===i;
          return (
            <div key={i} onClick={()=>whack(i)} style={{cursor:"none",userSelect:"none"}}>
              <div style={{height:110,position:"relative",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"flex-end"}}>
                {mole&&(
                  <div style={{position:"absolute",bottom:8,left:"50%",transform:"translateX(-50%)",animation:"moleRise 0.22s cubic-bezier(0.34,1.4,0.64,1)",zIndex:5,pointerEvents:"none"}}>
                    <CritterSVG word={mole.word} isTarget={mole.isTarget} type={mole.type}/>
                  </div>
                )}
                <div style={{width:"90%",height:32,borderRadius:"50%",background:isHit?"rgba(74,222,128,0.35)":isMiss?"rgba(239,68,68,0.35)":"rgba(0,0,30,0.65)",border:`3px solid ${isHit?"#4ade80":isMiss?"#ef4444":"rgba(80,50,20,0.7)"}`,boxShadow:isHit?"0 0 24px rgba(74,222,128,0.7)":isMiss?"0 0 24px rgba(239,68,68,0.6)":"inset 0 6px 18px rgba(0,0,0,0.7)",transition:"all 0.12s",flexShrink:0}}/>
              </div>
            </div>
          );
        })}
      </div>
      {!overUI&&<HammerSVG x={mousePos.x} y={mousePos.y} slamming={slamming}/>}
      <svg style={{position:"fixed",bottom:36,left:0,right:0,width:"100%",height:55,zIndex:5}} viewBox="0 0 800 55" preserveAspectRatio="none">
        <path d="M0 15 Q200 3 400 13 Q600 2 800 11 L800 55 L0 55Z" fill="#b45309"/>
        <path d="M0 22 Q200 12 400 20 Q600 10 800 18 L800 55 L0 55Z" fill="#c8a96e"/>
      </svg>
      <InstructionBar text="Click the character that matches the word shown above!"/>
      {countdown&&<CountdownOverlay onDone={()=>{setCountdown(false);setPaused(false);const tgt=pickTarget(wordsClearedRef.current);spawnMoles(tgt,wordsClearedRef.current,true);}}/>}
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// GAME 3: WORD SNAKE 🐍
// ══════════════════════════════════════════════════════════════════════════════
const WordSnake = ({unit,diff,onBack,onClaim,claimState,treatsEarnedToday=0,fromDino=false,onRestart}:{unit:UnitData;diff:Diff;onBack:()=>void;onClaim?:()=>void;claimState?:"available"|"claimed"|"capped";treatsEarnedToday?:number;fromDino?:boolean;onRestart?:()=>void}) => {
  const play=useAudio();
  const cfg=DIFF_CONFIG[diff];
  const COLS=10,ROWS=10,CELL=38;const TOTAL=unit.vocab.length;
  type Seg={x:number;y:number};
  type Letter={id:number;x:number;y:number;char:string;isWord:boolean};

  const INIT_SNAKE=[{x:4,y:4},{x:3,y:4},{x:2,y:4}];
  const [snake,setSnake]=useState<Seg[]>(INIT_SNAKE);
  const [dir,setDir]=useState<Seg>({x:1,y:0});
  const [letters,setLetters]=useState<Letter[]>([]);
  const [word,setWord]=useState("");
  const [collected,setCollected]=useState<string[]>([]);
  const [score,setScore]=useState(0);
  const [lives,setLives]=useState(5);
  const [done,setDone]=useState(false);
  const [doneReason,setDoneReason]=useState<"lives">("lives");
  const [unitClear,setUnitClear]=useState(false);
  const [flash,setFlash]=useState<"good"|"bad"|null>(null);
  const [round,setRound]=useState(0);
  const [wordsCleared,setWordsCleared]=useState<Set<string>>(new Set());
  const [ouchSnake,setOuchSnake]=useState(false);

  const dirRef=useRef(dir);dirRef.current=dir;
  const wordRef=useRef(word);wordRef.current=word;
  const collectedRef=useRef(collected);collectedRef.current=collected;
  const lettersRef=useRef(letters);lettersRef.current=letters;
  const snakeRef=useRef(snake);snakeRef.current=snake;
  const loop=useRef<ReturnType<typeof setInterval>>();
  const letterIdRef=useRef(0);
  const currentWordRef=useRef("");
  const wordsClearedRef=useRef<Set<string>>(new Set());
  const completingWordRef=useRef(false);
  const ouchSnakeRef=useRef(false);

  const emptyCell=(sn:Seg[],occ:{x:number;y:number}[])=>{
    const used=new Set([...sn,...occ].map(p=>`${p.x},${p.y}`));
    const free=Array.from({length:COLS*ROWS},(_,i)=>({x:i%COLS,y:Math.floor(i/COLS)})).filter(p=>!used.has(`${p.x},${p.y}`));
    return free.length?free[Math.floor(Math.random()*free.length)]:null;
  };

  const buildLetters=(w:string,sn:Seg[]):Letter[]=>{
    const chars=w.toUpperCase().split("");
    const head=sn[0];const d=sn.length>1?{x:sn[0].x-sn[1].x,y:sn[0].y-sn[1].y}:{x:1,y:0};
    const safeZone=[1,2,3].map(i=>({x:(head.x+d.x*i+COLS)%COLS,y:(head.y+d.y*i+ROWS)%ROWS}));
    const placed:{x:number;y:number}[]=[...safeZone];
    const positions:Letter[]=[];
    for(let li=0;li<chars.length;li++){
      let pos=null,tries=0;
      while(!pos&&tries<500){tries++;pos=emptyCell(sn,placed);}
      if(pos){placed.push(pos);positions.push({id:letterIdRef.current++,x:pos.x,y:pos.y,char:chars[li],isWord:true});}
    }
    const uniqueChars=new Set(chars);
    const dist="ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").filter(c=>!uniqueChars.has(c.toLowerCase()));
    shuffle(dist).slice(0,cfg.speedMult<0.7?3:6).forEach(char=>{
      const pos=emptyCell(sn,placed);
      if(pos){placed.push(pos);positions.push({id:letterIdRef.current++,x:pos.x,y:pos.y,char,isWord:false});}
    });
    return positions;
  };

  const newWord=useCallback((sn:Seg[],cleared:Set<string>)=>{
    const remaining=unit.vocab.filter(v=>!cleared.has(v));
    if(!remaining.length) return "";
    const others=remaining.filter(v=>v!==currentWordRef.current);
    const pool=others.length?others:remaining;
    const w=pool[Math.floor(Math.random()*pool.length)];
    currentWordRef.current=w;
    setWord(w);setCollected([]);
    setLetters(buildLetters(w,sn));
    completingWordRef.current=false;
    return w;
  },[unit]);

  useEffect(()=>{newWord(INIT_SNAKE,new Set());return()=>{};},[]);

  useEffect(()=>{
    const k=(e:KeyboardEvent)=>{
      if(e.key==="ArrowUp"&&dirRef.current.y===0) setDir({x:0,y:-1});
      if(e.key==="ArrowDown"&&dirRef.current.y===0) setDir({x:0,y:1});
      if(e.key==="ArrowLeft"&&dirRef.current.x===0) setDir({x:-1,y:0});
      if(e.key==="ArrowRight"&&dirRef.current.x===0) setDir({x:1,y:0});
    };
    window.addEventListener("keydown",k);return()=>window.removeEventListener("keydown",k);
  },[]);

  const snakeSpeed=Math.max(110,Math.round(380/cfg.speedMult));

  const triggerSnakeOuch=()=>{
    if(ouchSnakeRef.current||completingWordRef.current) return;
    ouchSnakeRef.current=true;setOuchSnake(true);
    play("wrong");setFlash("bad");setTimeout(()=>setFlash(null),500);
    setTimeout(()=>{setOuchSnake(false);ouchSnakeRef.current=false;},1200);
  };

  useEffect(()=>{
    if(done) return;
    loop.current=setInterval(()=>{
      setSnake(prev=>{
        const d=dirRef.current;
        const head={x:(prev[0].x+d.x+COLS)%COLS,y:(prev[0].y+d.y+ROWS)%ROWS};
        if(prev.slice(1).some(s=>s.x===head.x&&s.y===head.y)){
          if(completingWordRef.current||ouchSnakeRef.current) return prev;
          triggerSnakeOuch();
          const resetSn=[{x:4,y:4},{x:3,y:4},{x:2,y:4}];
          setCollected([]);
          setLetters(buildLetters(wordRef.current,resetSn));
          setLives(l=>{const newL=l-1;if(newL<=0){setDoneReason("lives");setDone(true);}return Math.max(0,newL);});
          return resetSn;
        }
        const newSn=[head,...prev.slice(0,-1)];
        const hit=lettersRef.current.find(l=>l.x===head.x&&l.y===head.y);
        if(hit){
          const col=collectedRef.current;
          const tw=wordRef.current;
          if(hit.isWord&&hit.char===tw[col.length].toUpperCase()){
            play("chomp");
            const next=[...col,hit.char];
            setCollected(next);
            setLetters(ls=>ls.filter(l=>l.id!==hit.id));
            setSnake(sn=>[...sn,{x:sn[sn.length-1].x,y:sn[sn.length-1].y}]);
            if(next.length===tw.length){
              completingWordRef.current=true;
              play("correct");setFlash("good");setTimeout(()=>setFlash(null),600);
              setScore(s=>s+1);setRound(r=>r+1);
              const newCleared=new Set([...wordsClearedRef.current,tw]);
              wordsClearedRef.current=newCleared;setWordsCleared(newCleared);
              if(newCleared.size>=TOTAL){setTimeout(()=>setUnitClear(true),700);}
              else setTimeout(()=>newWord(snakeRef.current,newCleared),700);
            }
          } else if(hit.isWord&&!completingWordRef.current){
            triggerSnakeOuch();
            setLives(l=>{const newL=l-1;if(newL<=0){setDoneReason("lives");setDone(true);}return Math.max(0,newL);});
          }
        }
        return newSn;
      });
    },snakeSpeed);
    return()=>clearInterval(loop.current);
  },[done]);

  const go=(dx:number,dy:number)=>{
    if(dx!==0&&dirRef.current.x===0) setDir({x:dx,y:0});
    if(dy!==0&&dirRef.current.y===0) setDir({x:0,y:dy});
  };

  const doRestart=()=>{
    onRestart?.();
    setScore(0);setLives(5);setRound(0);setDone(false);setUnitClear(false);
    wordsClearedRef.current=new Set();setWordsCleared(new Set());currentWordRef.current="";completingWordRef.current=false;ouchSnakeRef.current=false;setOuchSnake(false);
    const sn=[{x:4,y:4},{x:3,y:4},{x:2,y:4}];
    setSnake(sn);setDir({x:1,y:0});newWord(sn,new Set());
  };

  if(unitClear) return <UnitClearScreen unit={unit} onBack={onBack} onPlay={doRestart} onClaim={onClaim} claimState={claimState} diff={diff} treatsEarnedToday={treatsEarnedToday} fromDino={fromDino}/>;
  if(done) return <ResultScreen score={score} total={Math.max(round,1)} onBack={onBack} onPlay={doRestart} reason={doneReason}/>;
  const flashBg=flash==="good"?"rgba(74,222,128,0.22)":flash==="bad"?"rgba(239,68,68,0.22)":"transparent";

  return (
    <div className="mpe-game-noselect" style={{minHeight:"100vh",background:"linear-gradient(180deg,#14532d 0%,#15803d 35%,#166534 65%,#052e16 100%)",display:"flex",flexDirection:"column",alignItems:"center",padding:"0.75rem 0.75rem 46px",userSelect:"none",WebkitTouchCallout:"none"}}>
      <style>{`
        @keyframes lPulse{0%,100%{opacity:0.75;transform:scale(1)}50%{opacity:1;transform:scale(1.12)}}
        @keyframes firefly{0%{opacity:0}50%{opacity:1}100%{opacity:0;transform:translate(20px,-30px)}}
        @keyframes spinHalo{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}
      `}</style>
      {[3,14,26,40,54,68,80,91].map((x,i)=><TreeSVG key={i} x={x} opacity={0.14+i%3*0.04}/>)}
      {[...Array(5)].map((_,i)=>(
        <div key={i} style={{position:"fixed",left:`${12+i*17}%`,top:`${22+i*10}%`,width:5,height:5,borderRadius:"50%",background:"#fbbf24",boxShadow:"0 0 8px #fbbf24",animation:`firefly ${3+i*0.7}s ease-in-out infinite ${i*0.5}s`,pointerEvents:"none"}}/>
      ))}
      <div className="mpe-fs-bar" style={{display:"flex",justifyContent:"space-between",width:"100%",marginBottom:"0.5rem",zIndex:10,alignItems:"center"}}>
        <div style={{display:"flex",gap:"0.4rem",alignItems:"center"}}>
          <button onClick={onBack} style={{background:"rgba(255,255,255,0.15)",border:"2px solid rgba(255,255,255,0.25)",color:"white",fontFamily:F,fontWeight:800,fontSize:"0.95rem",padding:"0.28rem 0.8rem",borderRadius:999,cursor:"pointer"}}>← Back</button>
          <FullscreenButton/>
        </div>
        <div style={{display:"flex",gap:"0.4rem",alignItems:"center"}}>
          <Pill>⭐{score}</Pill>
          <Pill><span style={{color:cfg.color}}>{cfg.emoji}</span>{cfg.label}</Pill>
          <Pill>{"❤️".repeat(Math.max(0,lives))}</Pill>
        </div>
      </div>
      <div style={{width:"100%",maxWidth:420,marginBottom:"0.5rem",zIndex:10,background:"rgba(0,0,0,0.7)",borderRadius:16,padding:"0.6rem 1rem",border:"3px solid rgba(74,222,128,0.5)",boxShadow:"0 0 20px rgba(74,222,128,0.3)"}}>
        <div style={{fontFamily:F,fontWeight:800,fontSize:"0.9rem",color:"#4ade80",textAlign:"center",marginBottom:"0.4rem",letterSpacing:1}}>🐍 Spell this word:</div>
        <div style={{display:"flex",gap:"0.3rem",justifyContent:"center",flexWrap:"wrap"}}>
          {word.split("").map((ch,i)=>{
            const isDone=i<collected.length,isNext=i===collected.length;
            return <div key={i} style={{width:34,height:34,borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",background:isDone?"linear-gradient(135deg,#4ade80,#22c55e)":isNext?"linear-gradient(135deg,#fbbf24,#f97316)":"rgba(255,255,255,0.08)",border:`2.5px solid ${isDone?"#22c55e":isNext?"#fbbf24":"rgba(255,255,255,0.2)"}`,fontFamily:F,fontWeight:900,fontSize:"1rem",color:isDone?"#052e16":isNext?"#1e293b":"rgba(255,255,255,0.4)",transition:"all 0.2s",boxShadow:isNext?"0 0 16px rgba(251,191,36,0.8)":"none",transform:isNext?"scale(1.18)":"scale(1)"}}>
              {isDone?ch.toUpperCase():isNext?ch.toUpperCase():"_"}
            </div>;
          })}
        </div>
        {collected.length<word.length&&<div style={{textAlign:"center",marginTop:"0.35rem",fontFamily:F,fontWeight:700,fontSize:"0.88rem",color:"#fbbf24"}}>Eat the golden <span style={{color:"#fde68a",fontWeight:900}}>"{word[collected.length]?.toUpperCase()}"</span> next!</div>}
      </div>
      <div style={{position:"relative",width:COLS*CELL,height:ROWS*CELL,background:flashBg||"rgba(0,20,0,0.4)",borderRadius:14,border:"2.5px solid rgba(255,255,255,0.15)",overflow:"hidden",transition:"background 0.15s",zIndex:10,boxShadow:"inset 0 0 40px rgba(0,0,0,0.4)"}}
        onMouseMove={(e)=>{
          const rect=e.currentTarget.getBoundingClientRect();
          const head=snakeRef.current[0];
          const gx=Math.floor((e.clientX-rect.left)/CELL),gy=Math.floor((e.clientY-rect.top)/CELL);
          const dx=gx-head.x,dy=gy-head.y;
          if(Math.abs(dx)>Math.abs(dy)){
            if(dx>0&&dirRef.current.x===0) setDir({x:1,y:0});
            if(dx<0&&dirRef.current.x===0) setDir({x:-1,y:0});
          } else {
            if(dy>0&&dirRef.current.y===0) setDir({x:0,y:1});
            if(dy<0&&dirRef.current.y===0) setDir({x:0,y:-1});
          }
        }}>
        {Array.from({length:COLS-1}).map((_,i)=><div key={i} style={{position:"absolute",left:(i+1)*CELL,top:0,bottom:0,width:1,background:"rgba(255,255,255,0.04)"}}/>)}
        {Array.from({length:ROWS-1}).map((_,i)=><div key={i} style={{position:"absolute",top:(i+1)*CELL,left:0,right:0,height:1,background:"rgba(255,255,255,0.04)"}}/>)}
        {letters.map(l=>(
          <div key={l.id} style={{position:"absolute",left:l.x*CELL,top:l.y*CELL,width:CELL,height:CELL,display:"flex",alignItems:"center",justifyContent:"center"}}>
            {l.isWord
              ?<div style={{width:CELL-6,height:CELL-6,borderRadius:8,background:"radial-gradient(circle at 35% 35%, rgba(251,191,36,0.45), rgba(180,130,0,0.2))",border:"1.5px solid rgba(251,191,36,0.55)",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:F,fontWeight:900,fontSize:"1rem",color:"#fbbf24",animation:"lPulse 2s ease-in-out infinite",boxShadow:"0 0 8px rgba(251,191,36,0.4)"}}>{l.char}</div>
              :<div style={{fontFamily:F,fontWeight:700,fontSize:"1.05rem",color:"rgba(255,255,255,0.22)"}}>{l.char}</div>
            }
          </div>
        ))}
        {snake.map((seg,i)=>(
          <div key={i} style={{position:"absolute",left:seg.x*CELL+2,top:seg.y*CELL+2,width:CELL-4,height:CELL-4,borderRadius:i===0?10:5,background:i===0?"radial-gradient(circle at 35% 35%, #86efac, #16a34a)":i===1?"#22c55e":i<4?"#16a34a":"#15803d",border:`2px solid ${i===0?"#166534":"#14532d"}`,display:"flex",alignItems:"center",justifyContent:"center",boxShadow:i===0?"0 0 16px rgba(74,222,128,0.8)":"none",transition:`left ${snakeSpeed*0.8}ms ease, top ${snakeSpeed*0.8}ms ease`}}>
            {i===0?<SnakeHeadSVG ouch={ouchSnake}/>:<div style={{width:8,height:8,borderRadius:"50%",background:"rgba(255,255,255,0.3)"}}/>}
          </div>
        ))}
      </div>
      <div style={{marginTop:"0.7rem",display:"grid",gridTemplateColumns:"repeat(3,52px)",gridTemplateRows:"repeat(3,52px)",gap:4,zIndex:10}}>
        {[null,{dx:0,dy:-1,l:"▲︎"},null,{dx:-1,dy:0,l:"◀︎"},null,{dx:1,dy:0,l:"▶︎"},null,{dx:0,dy:1,l:"▼︎"},null].map((b,i)=>
          b?<button key={i} onPointerDown={()=>go(b.dx,b.dy)} style={{background:"rgba(74,222,128,0.2)",border:"2px solid rgba(74,222,128,0.4)",borderRadius:12,color:"#4ade80",fontSize:"1.2rem",cursor:"pointer",touchAction:"none",boxShadow:"0 3px 10px rgba(0,0,0,0.4)"}}>{b.l}</button>
          :<div key={i}/>
        )}
      </div>
      <InstructionBar text="Arrow keys or D-pad to steer · Eat the golden letters in order!"/>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// GAME 4: SPACE SHOOTER 🚀
// ══════════════════════════════════════════════════════════════════════════════
const SpaceShooter = ({unit,diff,onBack,onClaim,claimState,treatsEarnedToday=0,fromDino=false,onRestart}:{unit:UnitData;diff:Diff;onBack:()=>void;onClaim?:()=>void;claimState?:"available"|"claimed"|"capped";treatsEarnedToday?:number;fromDino?:boolean;onRestart?:()=>void}) => {
  const play=useAudio();
  const cfg=DIFF_CONFIG[diff];
  const TOTAL=unit.vocab.length;
  type Alien={id:number;x:number;y:number;word:string;idx:number;speed:number};
  type Bullet={id:number;x:number;y:number};
  type Burst={id:number;x:number;y:number;wrong:boolean};

  const [aliens,setAliens]=useState<Alien[]>([]);
  const [bullets,setBullets]=useState<Bullet[]>([]);
  const [bursts,setBursts]=useState<Burst[]>([]);
  const [shipX,setShipX]=useState(50);
  const [cursorVisible,setCursorVisible]=useState(true);
  const cursorTimer=useRef<ReturnType<typeof setTimeout>|null>(null);
  const handleMouseMove=()=>{
    setCursorVisible(true);
    if(cursorTimer.current) clearTimeout(cursorTimer.current);
    cursorTimer.current=setTimeout(()=>setCursorVisible(false),3000);
  };
  const [target,setTarget]=useState(unit.vocab[0]);
  const [score,setScore]=useState(0);
  const [lives,setLives]=useState(5);
  const [done,setDone]=useState(false);
  const [doneReason,setDoneReason]=useState<"timeout"|"lives">("timeout");
  const [timeLeft,setTimeLeft]=useState(cfg.timerSec);
  const [unitClear,setUnitClear]=useState(false);
  const [round,setRound]=useState(0);
  const [wordsCleared,setWordsCleared]=useState<Set<string>>(new Set());
  const [ouchShip,setOuchShip]=useState(false);
  const [ouchX,setOuchX]=useState(50);
  const [countdown,setCountdown]=useState(false);
  const [paused,setPaused]=useState(false);

  const alienId=useRef(0),bulletId=useRef(0),burstId=useRef(0);
  const heldKeys=useRef(new Set<string>());
  const shipXRef=useRef(50);
  const rocketRef=useRef<SVGSVGElement>(null);
  const animRef=useRef<number>(),lastSpawn=useRef(0);
  const targetRef=useRef(target);targetRef.current=target;
  const doneRef=useRef(done);doneRef.current=done;
  const pausedRef=useRef(paused);pausedRef.current=paused;
  const livesRef=useRef(5);
  const hitCooldown=useRef(false);
  const wordsClearedRef=useRef<Set<string>>(new Set());
  const invincibleRef=useRef(false);
  const lastWordSpawnedRef=useRef("");

  const nextTarget=useCallback((cleared:Set<string>)=>{
    const remaining=unit.vocab.filter(v=>!cleared.has(v));
    if(!remaining.length) return "";
    const others=remaining.filter(v=>v!==targetRef.current);
    const pool=others.length?others:remaining;
    const w=pool[Math.floor(Math.random()*pool.length)];
    setTarget(w);return w;
  },[unit]);

  useEffect(()=>{
    let raf:number;
    const tick=()=>{if(rocketRef.current) rocketRef.current.style.left=`${shipXRef.current}%`;raf=requestAnimationFrame(tick);};
    raf=requestAnimationFrame(tick);return()=>cancelAnimationFrame(raf);
  },[]);

  useEffect(()=>{
    const iv=setInterval(()=>setShipX(shipXRef.current),100);
    return()=>clearInterval(iv);
  },[]);

  useEffect(()=>{
    if(done||paused) return;
    const t=setInterval(()=>setTimeLeft(tl=>{if(tl<=1){setDoneReason("timeout");setDone(true);return 0;}return tl-1;}),1000);
    return()=>clearInterval(t);
  },[done,paused]);

  useEffect(()=>{
    if(done||paused) return;
    const loop=(ts:number)=>{
      if(ts-lastSpawn.current>cfg.spawnMs){
        lastSpawn.current=ts;
        setAliens(prev=>{
          if(prev.length>=cfg.maxOnScreen) return prev;
          const targetOnScreen=prev.filter(a=>a.word===targetRef.current).length;
          // Only force target if none on screen AND enough others exist first
          const forceTarget=targetOnScreen===0 && prev.length>=Math.min(3,cfg.maxOnScreen-1);
          const word=forceTarget
            ? targetRef.current
            : unit.vocab[Math.floor(Math.random()*unit.vocab.length)];
          lastWordSpawnedRef.current=word;
          let x=5+Math.random()*90;
          for(let attempt=0;attempt<8;attempt++){
            const tooClose=prev.some(a=>Math.abs(a.x-x)<18);
            if(!tooClose) break;
            x=5+Math.random()*90;
          }
          return [...prev,{id:alienId.current++,x,y:3,word,idx:unit.vocab.indexOf(word),speed:(0.055+Math.random()*0.04)*cfg.speedMult}];
        });
      }
      setAliens(prev=>{
        const next=prev.map(a=>({...a,y:a.y+a.speed}));
        if(!hitCooldown.current&&!doneRef.current&&!pausedRef.current&&!invincibleRef.current){
          const rocketEl=rocketRef.current;
          if(rocketEl){
            const rRect=rocketEl.getBoundingClientRect();
            const vw=window.innerWidth;const vh=window.innerHeight;
            const rocketNoseX=(rRect.left+rRect.width/2)/vw*100;
            const rocketNoseY=rRect.top/vh*100;
            const reached=next.filter(a=>{
              const prevY=a.y-a.speed;
              const hitY=rocketNoseY-4;
              const crossedNose=(prevY<=hitY&&a.y>=hitY)||(a.y>=hitY&&a.y<hitY+a.speed*3);
              const horizontalMatch=Math.abs(a.x-rocketNoseX)<8;
              return crossedNose&&horizontalMatch;
            });
            if(reached.length){
              hitCooldown.current=true;
              play("wrong");
              const sx=shipXRef.current;
              setOuchX(sx);setOuchShip(true);
              livesRef.current--;setLives(livesRef.current);
              if(livesRef.current<=0){setDoneReason("lives");setDone(true);}
              else{setTimeout(()=>{setOuchShip(false);setPaused(true);setCountdown(true);},1100);}
              setTimeout(()=>{hitCooldown.current=false;},900);
            }
          }
        }
        return next.filter(a=>a.y<=100);
      });
      setBullets(prev=>{
        const moved=prev.map(b=>({...b,y:b.y-2.0})).filter(b=>b.y>0);
        const remaining=[...moved];
        setAliens(als=>{
          let nextAls=[...als];
          remaining.forEach(bullet=>{
            const hit=nextAls.find(a=>Math.abs(a.x-bullet.x)<8&&Math.abs(a.y-bullet.y)<8);
            if(hit){
              const isTarget=hit.word===targetRef.current;
              setBursts(bs=>[...bs,{id:burstId.current++,x:hit.x,y:hit.y,wrong:!isTarget}]);
              if(isTarget){
                play("laser");speak(hit.word,"en-US");setScore(s=>s+1);setRound(r=>r+1);
                const newCleared=new Set([...wordsClearedRef.current,hit.word]);
                wordsClearedRef.current=newCleared;setWordsCleared(newCleared);
                if(newCleared.size>=TOTAL){setTimeout(()=>setUnitClear(true),500);}
                else setTimeout(()=>nextTarget(newCleared),150);
              } else play("wrong");
              nextAls=nextAls.filter(a=>a.id!==hit.id);
              remaining.splice(remaining.indexOf(bullet),1);
            }
          });
          setBullets(remaining);return nextAls;
        });
        return moved;
      });
      animRef.current=requestAnimationFrame(loop);
    };
    animRef.current=requestAnimationFrame(loop);
    return()=>{if(animRef.current)cancelAnimationFrame(animRef.current);};
  },[done,paused]);

  useEffect(()=>{if(bursts.length>0){const t=setTimeout(()=>setBursts([]),900);return()=>clearTimeout(t);}},[bursts]);

  const moveShip=(e:React.MouseEvent<HTMLDivElement>|React.TouchEvent<HTMLDivElement>)=>{
    const rect=e.currentTarget.getBoundingClientRect();
    const cx='touches' in e?e.touches[0].clientX:e.clientX;
    shipXRef.current=Math.max(3,Math.min(97,((cx-rect.left)/rect.width)*100));
  };

  const shoot=useCallback((e:React.MouseEvent|React.TouchEvent)=>{
    e.stopPropagation();play("shoot");
    setBullets(b=>[...b,{id:bulletId.current++,x:shipXRef.current,y:87}]);
  },[]);

  useEffect(()=>{
    const held=heldKeys.current;
    const dn=(e:KeyboardEvent)=>{
      held.add(e.key);
      if(e.key==="ArrowLeft"){e.preventDefault();shipXRef.current=Math.max(3,shipXRef.current-2);}
      if(e.key==="ArrowRight"){e.preventDefault();shipXRef.current=Math.min(97,shipXRef.current+2);}
      if(e.key===" ") e.preventDefault();
    };
    const up=(e:KeyboardEvent)=>held.delete(e.key);
    let lastShot=0;
    const iv=setInterval(()=>{
      if(held.has("ArrowLeft")) shipXRef.current=Math.max(3,shipXRef.current-0.65);
      if(held.has("ArrowRight")) shipXRef.current=Math.min(97,shipXRef.current+0.65);
      if(held.has(" ")){const now=Date.now();if(now-lastShot>280){lastShot=now;play("shoot");setBullets(b=>[...b,{id:bulletId.current++,x:shipXRef.current,y:87}]);}}
    },16);
    window.addEventListener("keydown",dn);window.addEventListener("keyup",up);
    return()=>{window.removeEventListener("keydown",dn);window.removeEventListener("keyup",up);clearInterval(iv);};
  },[]);

  const doRestart=()=>{
    onRestart?.();
    setScore(0);setLives(5);livesRef.current=5;setRound(0);setTimeLeft(cfg.timerSec);
    setDone(false);setUnitClear(false);setOuchShip(false);setPaused(false);setCountdown(false);
    setAliens([]);setBullets([]);setBursts([]);
    shipXRef.current=50;setShipX(50);hitCooldown.current=false;invincibleRef.current=false;lastWordSpawnedRef.current="";
    wordsClearedRef.current=new Set();setWordsCleared(new Set());nextTarget(new Set());
  };

  if(unitClear) return <UnitClearScreen unit={unit} onBack={onBack} onPlay={doRestart} onClaim={onClaim} claimState={claimState} diff={diff} treatsEarnedToday={treatsEarnedToday} fromDino={fromDino}/>;
  if(done) return <ResultScreen score={score} total={Math.max(round,1)} onBack={onBack} onPlay={doRestart} reason={doneReason}/>;

  return (
    <div className="mpe-game-noselect" style={{width:"100%",height:"100vh",background:"#030311",position:"relative",overflow:"hidden",userSelect:"none",WebkitTouchCallout:"none",cursor:cursorVisible?"default":"none",paddingBottom:36}}
      onMouseMove={handleMouseMove} onTouchMove={moveShip} onTouchEnd={shoot}>
      <div style={{position:"absolute",bottom:0,left:0,right:0,height:56,display:"flex",alignItems:"center",justifyContent:"center",zIndex:100,pointerEvents:"none"}}>
        {"ontouchstart" in window ?
          <div style={{display:"flex",gap:24,pointerEvents:"auto"}}>
            <button
              onTouchStart={(e)=>{e.stopPropagation();const iv=setInterval(()=>{shipXRef.current=Math.max(3,shipXRef.current-1.2);},16);(e.currentTarget as any)._iv=iv;}}
              onTouchEnd={(e)=>{e.stopPropagation();clearInterval((e.currentTarget as any)._iv);}}
              style={{width:80,height:48,borderRadius:16,background:"rgba(255,255,255,0.15)",border:"2px solid rgba(255,255,255,0.4)",color:"white",fontSize:"1.8rem",fontFamily:"Fredoka One, sans-serif",cursor:"pointer",userSelect:"none"}}>◀</button>
            <button
              onTouchStart={(e)=>{e.stopPropagation();const iv=setInterval(()=>{shipXRef.current=Math.min(97,shipXRef.current+1.2);},16);(e.currentTarget as any)._iv=iv;}}
              onTouchEnd={(e)=>{e.stopPropagation();clearInterval((e.currentTarget as any)._iv);}}
              style={{width:80,height:48,borderRadius:16,background:"rgba(255,255,255,0.15)",border:"2px solid rgba(255,255,255,0.4)",color:"white",fontSize:"1.8rem",fontFamily:"Fredoka One, sans-serif",cursor:"pointer",userSelect:"none"}}>▶</button>
          </div>
        :
          <div style={{textAlign:"center",pointerEvents:"none"}}>
            <div style={{color:"#fbbf24",fontFamily:"Fredoka One, sans-serif",fontSize:"1.3rem",letterSpacing:"0.03em"}}>← → Move Ship &nbsp;•&nbsp; Space to Shoot!</div>
            <div style={{color:"#fbbf24",fontFamily:"Nunito, sans-serif",fontSize:"1.1rem",marginTop:2}}>← → 移動太空船 • 空白鍵射擊！</div>
          </div>
        }
      </div>
      <style>{`
        @keyframes twinkle{0%,100%{opacity:0.18}50%{opacity:1}}
        @keyframes alienBob{0%,100%{transform:translateY(0) rotate(-3deg)}50%{transform:translateY(-7px) rotate(3deg)}}
        @keyframes explode{0%{transform:scale(0.5);opacity:1}100%{transform:scale(5);opacity:0}}
        @keyframes shipExplode{0%{transform:scale(0.6);opacity:1}70%{transform:scale(1.2);opacity:1}100%{transform:scale(1.4);opacity:0.85}}
        @keyframes flameFlicker{0%{transform:scaleY(1) scaleX(1)}100%{transform:scaleY(1.4) scaleX(0.8)}}
        @keyframes nebulaFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-14px)}}
      `}</style>
      {[...Array(80)].map((_,i)=>(
        <div key={i} style={{position:"absolute",left:`${(i*137.5)%100}%`,top:`${(i*97.3)%100}%`,width:1+i%3,height:1+i%3,background:i%10===0?"#93c5fd":i%7===0?"#fde68a":"white",borderRadius:"50%",animation:`twinkle ${2+i%4}s ease-in-out infinite ${i%3}s`}}/>
      ))}
      <div style={{position:"absolute",top:"8%",left:"12%",width:280,height:180,background:"radial-gradient(ellipse,rgba(139,92,246,0.18) 0%,transparent 80%)",borderRadius:"60% 40% 70% 30%",animation:"nebulaFloat 12s ease-in-out infinite"}}/>
      <div style={{position:"absolute",top:"35%",right:"5%",width:200,height:200,background:"radial-gradient(ellipse,rgba(236,72,153,0.14) 0%,transparent 80%)",borderRadius:"40% 60% 30% 70%",animation:"nebulaFloat 16s ease-in-out infinite 3s"}}/>
      <div className="mpe-fs-bar" style={{position:"absolute",top:12,left:0,right:0,display:"flex",justifyContent:"space-between",padding:"0 12px",zIndex:50,alignItems:"center",gap:"0.5rem"}}>
        <button onClick={(e)=>{e.stopPropagation();onBack();}} style={{background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.2)",color:"white",fontFamily:F,fontWeight:800,fontSize:"0.95rem",padding:"0.3rem 0.85rem",borderRadius:999,cursor:"pointer",flexShrink:0}}>← Back</button>
        <span onClick={(e)=>e.stopPropagation()} style={{flexShrink:0,display:"flex"}}><FullscreenButton/></span>
        <div style={{background:"rgba(0,0,20,0.85)",backdropFilter:"blur(10px)",borderRadius:999,padding:"0.4rem 1.4rem",border:"1.5px solid rgba(0,255,255,0.25)",flex:1,textAlign:"center",minWidth:0}}>
          <span style={{fontFamily:F,fontWeight:800,fontSize:"1.15rem",color:"white",whiteSpace:"nowrap"}}>🚀 <span style={{color:"#00ffff",fontSize:"1.8rem"}}>{unit.chinese[target]||target}</span> <button onClick={()=>speak((unit.chinese[target]||target).split("/")[0].trim(),"zh-TW")} style={{background:"none",border:"none",cursor:"pointer",fontSize:"1.4rem",verticalAlign:"middle",padding:"0 0.2rem",lineHeight:1}}>🔊</button></span>
        </div>
        <div style={{display:"flex",gap:"0.35rem",alignItems:"center",flexShrink:0}}>
          <Pill dark>⭐{score}</Pill>
          <Pill dark><span style={{color:cfg.color}}>{cfg.emoji}</span>{cfg.label}</Pill>
          <Pill dark red={timeLeft<=10}>⏱{timeLeft}s</Pill>
          <Pill dark>{"❤️".repeat(Math.max(0,lives))}</Pill>
        </div>
      </div>
      {aliens.map(a=>(
        <div key={a.id} style={{position:"absolute",left:`${a.x}%`,top:`${a.y}%`,transform:"translate(-50%,-50%)",zIndex:30,pointerEvents:"none",animation:"alienBob 1.4s ease-in-out infinite"}}>
          <AlienSVG word={a.word} idx={a.idx}/>
        </div>
      ))}
      {bullets.map(b=>(
        <div key={b.id} style={{position:"absolute",left:`${b.x}%`,top:`${b.y}%`,transform:"translateX(-50%)",zIndex:40,pointerEvents:"none"}}>
          <div style={{width:3,height:28,background:"linear-gradient(180deg,rgba(251,191,36,0),#fbbf24)",borderRadius:2,opacity:0.5}}/>
          <div style={{width:6,height:18,background:"linear-gradient(180deg,#fde68a,#f97316)",borderRadius:3,boxShadow:"0 0 12px rgba(251,191,36,0.9)",marginTop:-18}}/>
        </div>
      ))}
      {bursts.map(b=>(
        <div key={b.id} style={{position:"absolute",left:`${b.x}%`,top:`${b.y}%`,transform:"translate(-50%,-50%)",zIndex:60,pointerEvents:"none",animation:"explode 0.7s ease-out forwards"}}>
          <svg width="80" height="80" viewBox="0 0 80 80">
            {[0,30,60,90,120,150,180,210,240,270,300,330].map((a,i)=>(
              <line key={i} x1={40} y1={40} x2={40+Math.cos(a*Math.PI/180)*35} y2={40+Math.sin(a*Math.PI/180)*35} stroke={b.wrong?(i%2===0?"#94a3b8":"#64748b"):(i%3===0?"#fbbf24":i%3===1?"#f97316":"#ef4444")} strokeWidth={3+i%3} strokeLinecap="round"/>
            ))}
            <circle cx="40" cy="40" r="12" fill={b.wrong?"#64748b":"#fde68a"}/>
            <circle cx="40" cy="40" r="7" fill={b.wrong?"#94a3b8":"white"}/>
          </svg>
        </div>
      ))}
      {!ouchShip&&<RocketSVG svgRef={rocketRef}/>}
      {ouchShip&&(
        <div style={{position:"absolute",left:`${ouchX}%`,bottom:"6%",transform:"translate(-50%,30%)",zIndex:55,pointerEvents:"none"}}>
          <svg width="160" height="160" viewBox="0 0 160 160" style={{animation:"shipExplode 1.1s ease-out forwards"}}>
            {[0,22,44,66,88,110,132,154,176,198,220,242,264,286,308,330].map((a,i)=>(
              <line key={i} x1={80} y1={80} x2={80+Math.cos(a*Math.PI/180)*68} y2={80+Math.sin(a*Math.PI/180)*68} stroke={i%2===0?"#ef4444":"#fbbf24"} strokeWidth={4+i%3} strokeLinecap="round"/>
            ))}
            <circle cx="80" cy="80" r="35" fill="#f97316"/>
            <circle cx="80" cy="80" r="20" fill="#fde68a"/>
            <text x="80" y="89" textAnchor="middle" fontFamily={F} fontWeight="900" fontSize="18" fill="#1e293b">OW!</text>
          </svg>
        </div>
      )}
      <div style={{position:"absolute",bottom:"7%",left:0,right:0,height:2,background:"linear-gradient(90deg,transparent,rgba(74,222,128,0.6),transparent)"}}/>

      {countdown&&<CountdownOverlay onDone={()=>{
        setCountdown(false);setPaused(false);
        setAliens(prev=>prev.filter(a=>!(a.y>70&&Math.abs(a.x-shipXRef.current)<20)));
        invincibleRef.current=true;
        setTimeout(()=>{invincibleRef.current=false;},2500);
      }}/>}
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// DIFFICULTY PICKER
// ══════════════════════════════════════════════════════════════════════════════
const DiffPicker = ({game,unit,onPick,onBack}:{game:{id:string;name:string;emoji:string};unit:UnitData;onPick:(d:Diff)=>void;onBack:()=>void}) => (
  <div style={{minHeight:"100vh",background:"linear-gradient(135deg,#0f0c29,#302b63,#24243e)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"1.5rem"}}>
    <style>{`@keyframes slideUp{0%{transform:translateY(30px);opacity:0}100%{transform:translateY(0);opacity:1}}@keyframes floatUD{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}`}</style>
    <div style={{fontSize:"3.5rem",animation:"floatUD 2s ease-in-out infinite",marginBottom:"0.5rem"}}>{game.emoji}</div>
    <div style={{fontFamily:F,fontWeight:900,fontSize:"1.4rem",color:"white",marginBottom:"0.2rem"}}>{game.name}</div>
    <div style={{fontFamily:F,fontWeight:700,fontSize:"0.9rem",color:"rgba(255,255,255,0.45)",marginBottom:"1.75rem"}}>Unit {unit.unit} — {unit.topic}</div>
    <div style={{fontFamily:F,fontWeight:800,fontSize:"1rem",color:"rgba(255,255,255,0.7)",marginBottom:"1rem"}}>Choose your difficulty:</div>
    <div style={{display:"flex",flexDirection:"column",gap:"0.75rem",width:"100%",maxWidth:340}}>
      {(["easy","medium","hard"] as Diff[]).map((d,i)=>{
        const dc=DIFF_CONFIG[d];
        return (
          <button key={d} onClick={()=>onPick(d)}
            style={{padding:"1rem 1.5rem",background:`linear-gradient(135deg,${dc.color}25,${dc.color}10)`,border:`2.5px solid ${dc.color}`,borderRadius:"1.25rem",cursor:"pointer",textAlign:"left",display:"flex",alignItems:"center",gap:"1rem",animation:`slideUp 0.4s ease-out ${i*0.1}s both`,boxShadow:`0 0 20px ${dc.color}25`}}>
            <div style={{fontSize:"2rem"}}>{dc.emoji}</div>
            <div style={{flex:1}}>
              <div style={{fontFamily:F,fontWeight:800,fontSize:"1rem",color:"white"}}>{dc.label}</div>
              <div style={{fontFamily:F,fontWeight:700,fontSize:"0.82rem",color:"rgba(255,255,255,0.55)",marginTop:2}}>{dc.desc} · ⏱ {dc.timerSec}s</div>
            </div>
            <div style={{color:dc.color,fontSize:"1.2rem"}}>▶</div>
          </button>
        );
      })}
    </div>
    <button onClick={onBack} style={{marginTop:"1.5rem",background:"rgba(255,255,255,0.08)",border:"1.5px solid rgba(255,255,255,0.2)",color:"rgba(255,255,255,0.6)",fontFamily:F,fontWeight:700,fontSize:"0.9rem",padding:"0.5rem 1.2rem",borderRadius:999,cursor:"pointer"}}>← Back</button>
  </div>
);

// ══════════════════════════════════════════════════════════════════════════════
// ARCADE HUB + MAIN EXPORT
// ══════════════════════════════════════════════════════════════════════════════
const GAMES=[
  {id:"arrow",name:"Arrow Shoot",emoji:"🏹",desc:"Pop the right balloons!",color:"#f97316",glow:"rgba(249,115,22,0.5)"},
  {id:"whack",name:"Whack-a-Mole",emoji:"🔨",desc:"Whack the correct word!",color:"#0ea5e9",glow:"rgba(14,165,233,0.5)"},
  {id:"snake",name:"Word Snake",emoji:"🐍",desc:"Eat letters to spell words!",color:"#10b981",glow:"rgba(16,185,129,0.5)"},
  {id:"space",name:"Space Shooter",emoji:"🚀",desc:"Blast the right aliens!",color:"#a855f7",glow:"rgba(168,85,247,0.5)"},
];
type Screen="books"|"units"|"games"|"diff"|"play";

interface GameTestProps {
  onClaim?: (unitId: number, gameId: string, diff: Diff) => void;
  claimedCombos?: Set<string>;
  treatsCappedToday?: boolean;
  treatsEarnedToday?: number;
  fromDino?: boolean;
  studentBook?: number;
}

const GameTest = ({onClaim, claimedCombos, treatsCappedToday, treatsEarnedToday=0, fromDino=false, studentBook=1}: GameTestProps) => {
  const navigate=useNavigate();
  const [screen,setScreen]=useState<Screen>("books");
  const [justClaimed,setJustClaimed]=useState(false);
  const [unit,setUnit]=useState<UnitData|null>(null);
  const [game,setGame]=useState<typeof GAMES[0]|null>(null);
  const [diff,setDiff]=useState<Diff>("medium");
  const [selectedBook,setSelectedBook]=useState<number>(1);
  const UNITS = buildUnits(ALL_BOOKS[selectedBook] ?? book1Data);

  useEffect(()=>{
    if(!document.getElementById("mpe-fonts")){
      const link=document.createElement("link");link.id="mpe-fonts";link.rel="stylesheet";link.href=FONT_URL;
      document.head.appendChild(link);
    }
  },[]);

  // Compute claimState fresh every render so it's never stale
  const claimState: "available"|"claimed"|"capped"|undefined = (() => {
    if(!onClaim || !unit || !game) return undefined;
    if(justClaimed) return "claimed";
    // NO CAPS - every play pays, parents set the limits
    return "available";
  })();

  const handleClaim = (onClaim && unit && game && claimState==="available")
    ? () => { onClaim(unit.unit, game.id, diff); setJustClaimed(true); }
    : undefined;

  if(screen==="diff"&&unit&&game) return <DiffPicker game={game} unit={unit} onPick={(d)=>{setDiff(d);setScreen("play");}} onBack={()=>setScreen("games")}/>;

  if(screen==="play"&&unit&&game){
    const props={unit,diff,onBack:()=>setScreen("games"),onClaim:handleClaim,claimState,treatsEarnedToday,fromDino,onRestart:()=>setJustClaimed(false)};
    if(game.id==="arrow") return <ArrowShoot {...props}/>;
    if(game.id==="whack") return <WhackAMole {...props}/>;
    if(game.id==="snake") return <WordSnake {...props}/>;
    if(game.id==="space") return <SpaceShooter {...props}/>;
  }

  const back=()=>{
    if(screen==="units") setScreen("books");
    else if(screen==="games") setScreen("units");
    else navigate(-1);
  };

  return (
    <div style={{minHeight:"100vh",background:"linear-gradient(135deg,#0f0c29,#302b63,#24243e)",fontFamily:F,userSelect:"none",overflow:"hidden"}}>
      <style>{`
        @keyframes floatUpDown{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
        @keyframes arcadeGlow{0%,100%{filter:brightness(1)}50%{filter:brightness(1.18)}}
        @keyframes slideUp{0%{transform:translateY(30px);opacity:0}100%{transform:translateY(0);opacity:1}}
        @keyframes twinkStar{0%,100%{opacity:0.15}50%{opacity:0.9}}
        @keyframes hubFloat{0%,100%{transform:translateY(0) rotate(-1deg)}50%{transform:translateY(-10px) rotate(1deg)}}
      `}</style>
      {[...Array(55)].map((_,i)=>(
        <div key={i} style={{position:"fixed",left:`${(i*137.5)%100}%`,top:`${(i*97.3)%100}%`,width:1+i%3,height:1+i%3,background:i%8===0?"#93c5fd":i%5===0?"#fde68a":"white",borderRadius:"50%",animation:`twinkStar ${2+i%4}s ease-in-out infinite ${i%4}s`,pointerEvents:"none"}}/>
      ))}
      <nav style={{position:"fixed",top:0,left:0,right:0,zIndex:100,background:"rgba(0,0,0,0.55)",backdropFilter:"blur(14px)",padding:"0.55rem 1rem",display:"flex",alignItems:"center",justifyContent:"space-between",borderBottom:"1px solid rgba(255,255,255,0.1)"}}>
        <button onClick={back} style={{background:"rgba(255,255,255,0.1)",border:"1.5px solid rgba(255,255,255,0.22)",color:"white",fontFamily:F,fontWeight:800,fontSize:"0.95rem",padding:"0.32rem 0.95rem",borderRadius:999,cursor:"pointer"}}>{screen==="books"?"← Exit":"← Back"}</button>
        <span style={{color:"white",fontFamily:F,fontWeight:900,fontSize:"1.1rem",textShadow:"0 0 20px rgba(168,85,247,0.9)"}}>🎮 MPE Arcade</span>
        <div style={{width:72}}/>
      </nav>
      <div style={{maxWidth:560,margin:"0 auto",padding:"72px 16px 40px",position:"relative",zIndex:10}}>
        {screen==="books"&&(
          <>
            <div style={{textAlign:"center",marginBottom:"2rem",animation:"slideUp 0.5s ease-out"}}>
              <div style={{fontSize:"5rem",animation:"hubFloat 3s ease-in-out infinite",display:"inline-block"}}>🎮</div>
              <div style={{fontFamily:F,fontWeight:900,fontSize:"2rem",color:"white",textShadow:"0 0 30px rgba(168,85,247,0.8)",marginTop:"0.25rem"}}>Choose Your Book!</div>
              <div style={{fontFamily:F,fontWeight:700,fontSize:"0.9rem",color:"rgba(255,255,255,0.5)",marginTop:"0.25rem"}}>Pick a book to start playing</div>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:"1rem"}}>
              {[1,2,3,4,5,6].map((bookNum,i)=>{const unlocked=bookNum<=5;const book={id:bookNum,label:`Book ${bookNum}`,unlocked,color:"#f97316",desc:unlocked?`Units 1–18`:"Coming Soon!"};return(
                <button key={book.id} disabled={!book.unlocked} onClick={()=>{if(book.unlocked){setSelectedBook(book.id);setScreen("units");}}}
                  style={{padding:"1.2rem 1.5rem",background:book.unlocked?`linear-gradient(135deg,${book.color}cc,${book.color}88)`:"rgba(255,255,255,0.04)",border:`2px solid ${book.unlocked?book.color:"rgba(255,255,255,0.08)"}`,borderRadius:"1.5rem",cursor:book.unlocked?"pointer":"not-allowed",display:"flex",alignItems:"center",gap:"1rem",opacity:book.unlocked?1:0.45,animation:book.unlocked?`floatUpDown ${2.5+i*0.3}s ease-in-out infinite ${i*0.2}s`:"none"}}>
                  <div style={{fontSize:"2.8rem"}}>📚</div>
                  <div style={{flex:1,textAlign:"left"}}>
                    <div style={{fontFamily:F,fontWeight:800,fontSize:"1.1rem",color:"white"}}>{book.label}</div>
                    <div style={{fontFamily:F,fontWeight:700,fontSize:"0.85rem",color:"rgba(255,255,255,0.7)",marginTop:2}}>{book.desc}</div>
                  </div>
                  <div style={{fontSize:"1.4rem"}}>{book.unlocked?"▶":"🔒"}</div>
                </button>
              );})}
            </div>
          </>
        )}
        {screen==="units"&&(
          <>
            <div style={{textAlign:"center",marginBottom:"1.5rem",animation:"slideUp 0.4s ease-out"}}>
              <div style={{fontFamily:F,fontWeight:900,fontSize:"1.8rem",color:"white",textShadow:"0 0 20px rgba(168,85,247,0.7)"}}>Choose Your Unit!</div>
              <div style={{fontFamily:F,fontWeight:700,fontSize:"0.9rem",color:"rgba(255,255,255,0.45)",marginTop:4}}>Book {selectedBook} — Units 1–18</div>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:"0.85rem"}}>
              {UNITS.map((u,i)=>(
                <button key={u.unit} onClick={()=>{setUnit(u);setScreen("games");}}
                  style={{padding:"1rem 1.25rem",background:`linear-gradient(135deg,${u.color}cc,${u.color}77)`,border:`2px solid ${u.color}`,borderRadius:"1.5rem",cursor:"pointer",display:"flex",alignItems:"center",gap:"1rem",boxShadow:`0 0 20px ${u.glow},0 8px 24px rgba(0,0,0,0.3)`,animation:`slideUp 0.4s ease-out ${i*0.1}s both`}}>
                  <div style={{fontSize:"2.5rem",animation:`floatUpDown ${2.2+i*0.3}s ease-in-out infinite`}}>{u.emoji}</div>
                  <div style={{flex:1,textAlign:"left"}}>
                    <div style={{fontFamily:F,fontWeight:800,fontSize:"0.95rem",color:"white"}}>Unit {u.unit} — {u.topic}</div>
                    <div style={{fontFamily:F,fontWeight:700,fontSize:"0.8rem",color:"rgba(255,255,255,0.75)",marginTop:3}}>{u.vocab.join(" · ")}</div>
                  </div>
                  <div style={{fontSize:"1.4rem",color:"rgba(255,255,255,0.8)"}}>▶</div>
                </button>
              ))}
            </div>
          </>
        )}
        {screen==="games"&&unit&&(
          <>
            <div style={{textAlign:"center",marginBottom:"1.5rem",animation:"slideUp 0.4s ease-out"}}>
              <div style={{fontSize:"3rem",animation:"hubFloat 2.5s ease-in-out infinite",display:"inline-block"}}>{unit.emoji}</div>
              <div style={{fontFamily:F,fontWeight:900,fontSize:"1.5rem",color:"white",marginTop:"0.25rem"}}>Unit {unit.unit} — {unit.topic}</div>
              <div style={{fontFamily:F,fontWeight:700,fontSize:"0.9rem",color:"rgba(255,255,255,0.5)",marginTop:4}}>Pick your game and let's go!</div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"1rem"}}>
              {GAMES.map((g,i)=>(
                <button key={g.id} onClick={()=>{setGame(g);setScreen("diff");}}
                  style={{padding:"1.25rem 0.75rem",background:`linear-gradient(135deg,${g.color},${g.color}99)`,border:`2.5px solid ${g.color}`,borderRadius:"1.5rem",cursor:"pointer",textAlign:"center",boxShadow:`0 0 22px ${g.glow},0 8px 28px rgba(0,0,0,0.35)`,animation:`slideUp 0.4s ease-out ${i*0.08}s both, arcadeGlow 2.5s ease-in-out infinite ${i*0.4}s`}}>
                  <div style={{fontSize:"3rem",marginBottom:"0.5rem",animation:`floatUpDown ${2+i*0.35}s ease-in-out infinite`}}>{g.emoji}</div>
                  <div style={{fontFamily:F,fontWeight:800,fontSize:"0.95rem",color:"white",lineHeight:1.4}}>{g.name}</div>
                  <div style={{fontFamily:F,fontWeight:700,fontSize:"0.8rem",color:"rgba(255,255,255,0.8)",marginTop:"0.3rem"}}>{g.desc}</div>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default GameTest;
