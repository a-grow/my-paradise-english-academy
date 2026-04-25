import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const SHEETDB_URL = "https://sheetdb.io/api/v1/9ctz2zljbz6wx";
const MASTER_CODE = "1006";

const STAGES = [
  { name:"Egg",       label:"Sea Turtle Egg",   min:0,   max:14   },
  { name:"Baby",      label:"Baby Sea Turtle",   min:15,  max:29   },
  { name:"Young",     label:"Young Sea Turtle",  min:30,  max:44   },
  { name:"Grown",     label:"Grown Sea Turtle",  min:45,  max:9999 },
];
const getStage = (t:number) => STAGES.findLast(s=>t>=s.min) ?? STAGES[0];
// ── EGG CRACKS ───────────────────────────────────────────────────────────────
const EggCracks = ({treats}:{treats:number}) => {
  const level = treats<=2?0:treats<=5?1:treats<=8?2:treats<=11?3:4;
  if(level===0) return null;
  return (
    <svg viewBox="0 0 200 200" style={{position:"absolute",inset:0,width:"100%",height:"100%",pointerEvents:"none",zIndex:10}}>
      {level>=1&&(
        <path d="M105,55 L112,70 L108,78 L115,92" 
          stroke="#8B5E3C" strokeWidth="2.5" fill="none" strokeLinecap="round"
          style={{filter:"drop-shadow(0 0 3px rgba(255,200,100,0.8))"}}/>
      )}
      {level>=2&&(
        <>
          <path d="M105,55 L112,70 L108,78 L115,92" 
            stroke="#8B5E3C" strokeWidth="2.5" fill="none" strokeLinecap="round"
            style={{filter:"drop-shadow(0 0 3px rgba(255,200,100,0.8))"}}/>
          <path d="M88,70 L80,82 L85,90 L79,102"
            stroke="#8B5E3C" strokeWidth="2" fill="none" strokeLinecap="round"
            style={{filter:"drop-shadow(0 0 3px rgba(255,200,100,0.8))"}}/>
        </>
      )}
      {level>=3&&(
        <>
          <path d="M105,55 L112,70 L108,78 L115,92" 
            stroke="#7a4e2a" strokeWidth="3" fill="none" strokeLinecap="round"
            style={{filter:"drop-shadow(0 0 4px rgba(255,200,100,0.9))"}}/>
          <path d="M88,70 L80,82 L85,90 L79,102"
            stroke="#7a4e2a" strokeWidth="2.5" fill="none" strokeLinecap="round"
            style={{filter:"drop-shadow(0 0 4px rgba(255,200,100,0.9))"}}/>
          <path d="M115,92 L122,100 L118,108"
            stroke="#7a4e2a" strokeWidth="2" fill="none" strokeLinecap="round"
            style={{filter:"drop-shadow(0 0 3px rgba(255,200,100,0.8))"}}/>
          <path d="M100,110 L106,120 L102,128"
            stroke="#7a4e2a" strokeWidth="2" fill="none" strokeLinecap="round"/>
        </>
      )}
      {level>=4&&(
        <>
          <path d="M105,55 L112,70 L108,78 L115,92 L108,102 L114,115" 
            stroke="#5a3010" strokeWidth="3.5" fill="none" strokeLinecap="round"
            style={{filter:"drop-shadow(0 0 6px rgba(255,180,50,1))"}}/>
          <path d="M88,70 L80,82 L85,90 L79,102 L85,112"
            stroke="#5a3010" strokeWidth="3" fill="none" strokeLinecap="round"
            style={{filter:"drop-shadow(0 0 5px rgba(255,180,50,0.9))"}}/>
          <path d="M115,92 L125,98 L120,108 L127,116"
            stroke="#5a3010" strokeWidth="2.5" fill="none" strokeLinecap="round"
            style={{filter:"drop-shadow(0 0 4px rgba(255,180,50,0.8))"}}/>
          <path d="M100,110 L106,122 L100,130 L107,140"
            stroke="#5a3010" strokeWidth="2.5" fill="none" strokeLinecap="round"
            style={{filter:"drop-shadow(0 0 4px rgba(255,180,50,0.8))"}}/>
          <path d="M82,95 L75,105 L80,115"
            stroke="#5a3010" strokeWidth="2" fill="none" strokeLinecap="round"/>
          {/* Golden glow dots at crack tips */}
          {[[114,115],[85,112],[127,116],[107,140]].map(([cx,cy],i)=>(
            <circle key={i} cx={cx} cy={cy} r="3" fill="#ffd700" opacity="0.8"
              style={{animation:`spL ${1+i*0.3}s ease-in-out infinite`}}/>
          ))}
        </>
      )}
    </svg>
  );
};
// ── ROUND FACE COOKIE ─────────────────────────────────────────────────────────
const FaceCookie = ({ size=24 }:{size?:number}) => (
  <svg width={size} height={size} viewBox="0 0 40 40" style={{display:"inline-block",flexShrink:0}}>
    <circle cx="20" cy="20" r="18" fill="#d4b483" stroke="#b8965a" strokeWidth="1.2"/>
    {Array.from({length:10}).map((_,j)=>{
      const angle=(j/10)*Math.PI*2;
      const rx=20+Math.cos(angle)*18;
      const ry=20+Math.sin(angle)*18;
      return <circle key={j} cx={rx} cy={ry} r="1.8" fill="#b8965a" opacity="0.6"/>;
    })}
    <circle cx="15" cy="17" r="2" fill="#7a5c2e" opacity="0.8"/>
    <circle cx="25" cy="17" r="2" fill="#7a5c2e" opacity="0.8"/>
    <path d="M13,23 Q20,29 27,23" stroke="#7a5c2e" strokeWidth="1.8" fill="none" strokeLinecap="round" opacity="0.7"/>
    <ellipse cx="14" cy="10" rx="5" ry="2.5" fill="white" opacity="0.18" transform="rotate(-25,14,10)"/>
  </svg>
);

// ── DISNEY NAME TAG ───────────────────────────────────────────────────────────
const DisneyNameTag = ({ name }:{name:string}) => (
  <div style={{position:"relative",display:"inline-block",marginBottom:"0.5rem"}}>
    <svg viewBox="0 0 240 80" width="240" height="80" overflow="visible">
      <defs>
        <linearGradient id="tBg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ff9de2"/>
          <stop offset="50%" stopColor="#ff6ec7"/>
          <stop offset="100%" stopColor="#e040a0"/>
        </linearGradient>
        <linearGradient id="tBrd" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffd700"/>
          <stop offset="50%" stopColor="#ffaa00"/>
          <stop offset="100%" stopColor="#ff8800"/>
        </linearGradient>
        <filter id="tShadow">
          <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#c020a0" floodOpacity="0.45"/>
        </filter>
      </defs>
      <path d="M88,8 Q70,-5 52,2" stroke="#60b8ff" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      <path d="M152,8 Q170,-5 188,2" stroke="#60b8ff" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      <circle cx="88" cy="8" r="3.5" fill="#ffd700" stroke="#ffaa00" strokeWidth="1"/>
      <circle cx="152" cy="8" r="3.5" fill="#ffd700" stroke="#ffaa00" strokeWidth="1"/>
      <path d="M10,18 L20,10 L220,10 L230,18 L230,62 L220,70 L20,70 L10,62 Z"
        fill="url(#tBg)" filter="url(#tShadow)"/>
      <path d="M10,18 L20,10 L220,10 L230,18 L230,62 L220,70 L20,70 L10,62 Z"
        fill="none" stroke="url(#tBrd)" strokeWidth="3"/>
      <path d="M16,20 L24,14 L216,14 L224,20 L224,60 L216,66 L24,66 L16,60 Z"
        fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5"/>
      <path d="M30,25 L32,19 L34,25 L40,25 L35,29 L37,35 L32,31 L27,35 L29,29 L24,25 Z" fill="#ffd700" opacity="0.9"/>
      <path d="M210,25 L212,19 L214,25 L220,25 L215,29 L217,35 L212,31 L207,35 L209,29 L204,25 Z" fill="#ffd700" opacity="0.9"/>
      <path d="M22,53 L23,50 L24,53 L27,53 L25,55 L26,58 L23,56 L20,58 L21,55 L19,53 Z" fill="#ffd700" opacity="0.7"/>
      <path d="M218,53 L219,50 L220,53 L223,53 L221,55 L222,58 L219,56 L216,58 L217,55 L215,53 Z" fill="#ffd700" opacity="0.7"/>
      {[[55,16],[125,13],[195,18],[50,64],[120,67],[192,60]].map(([cx,cy],i)=>(
        <circle key={i} cx={cx} cy={cy} r="2.2" fill="rgba(255,255,255,0.55)"
          style={{animation:`sTag ${1.5+i*0.3}s ease-in-out infinite ${i*0.2}s`}}/>
      ))}
      <path d="M24,63 Q48,58 72,63 Q96,68 120,63 Q144,58 168,63 Q192,68 216,63"
        stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" fill="none"/>
    </svg>
    <div style={{
      position:"absolute",top:"50%",left:"50%",
      transform:"translate(-50%,-50%) translateY(2px)",
      fontFamily:"'Fredoka One',cursive",fontSize:"1.45rem",
      color:"white",whiteSpace:"nowrap",letterSpacing:"0.06em",
      textShadow:"0 2px 4px rgba(150,0,80,0.6), 0 0 14px rgba(255,150,220,0.5)"
    }}>{name}</div>
  </div>
);

// ── TREAT JAR ─────────────────────────────────────────────────────────────────
const TreatJar = ({treats,nextStage}:{treats:number;nextStage:typeof STAGES[0]|undefined}) => {
  const max = nextStage?.min ?? 50;
  const displayTreats = Math.min(treats, 9999);
  const pct = nextStage ? Math.min((treats/max)*100, 100) : 100;
  const cookieCount = treats===0 ? 0 : Math.min(Math.floor(pct/9)+1, 9);
  const remaining = nextStage ? Math.max(nextStage.min-treats,0) : 0;

  return (
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:"0.4rem"}}>
      <div style={{position:"relative",width:100,height:130}}>
        <svg viewBox="0 0 100 130" width="100" height="130">
          <defs>
            <linearGradient id="jB" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="rgba(200,230,255,0.18)"/>
              <stop offset="40%" stopColor="rgba(255,255,255,0.38)"/>
              <stop offset="100%" stopColor="rgba(200,230,255,0.12)"/>
            </linearGradient>

            <clipPath id="jCP">
              <path d="M16,33 Q13,36 13,43 L13,112 Q13,120 21,120 L79,120 Q87,120 87,112 L87,43 Q87,36 84,33 Z"/>
            </clipPath>
          </defs>
          {/* Lid */}
          <rect x="22" y="17" width="56" height="18" rx="7" fill="#fbbf24" stroke="#f59e0b" strokeWidth="1.5"/>
          <rect x="27" y="20" width="46" height="5" rx="2.5" fill="rgba(255,255,255,0.45)"/>
          <rect x="40" y="12" width="20" height="9" rx="4" fill="#f59e0b" stroke="#d97706" strokeWidth="1"/>
          {/* Jar body */}
          <path d="M16,33 Q13,36 13,43 L13,112 Q13,120 21,120 L79,120 Q87,120 87,112 L87,43 Q87,36 84,33 Z"
            fill="url(#jB)" stroke="rgba(255,255,255,0.5)" strokeWidth="2"/>
          
          {/* Cookies in jar */}
{/* Cookies in jar */}
{cookieCount>0 && Array.from({length:cookieCount}).map((_,i)=>{
  const col = i%3;
  const row = Math.floor(i/3);
  const cx = 28+col*20;
  const cy = 105-row*20;
  return (
    <g key={i} clipPath="url(#jCP)"
      style={{animation:`jF2 ${2+i*0.25}s ease-in-out infinite ${i*0.15}s`}}>
      <circle cx={cx} cy={cy} r="8" fill="#d4b483" stroke="#b8965a" strokeWidth="1"/>
      {Array.from({length:10}).map((_,j)=>{
        const angle=(j/10)*Math.PI*2;
        const rx=cx+Math.cos(angle)*8;
        const ry=cy+Math.sin(angle)*8;
        return <circle key={j} cx={rx} cy={ry} r="1.1" fill="#b8965a" opacity="0.6"/>;
      })}
      <circle cx={cx-3} cy={cy-2} r="1.2" fill="#7a5c2e" opacity="0.8"/>
      <circle cx={cx+3} cy={cy-2} r="1.2" fill="#7a5c2e" opacity="0.8"/>
      <path d={`M${cx-4},${cy+2} Q${cx},${cy+5} ${cx+4},${cy+2}`} stroke="#7a5c2e" strokeWidth="1.2" fill="none" strokeLinecap="round" opacity="0.7"/>
    </g>
  );
})}
          {/* Shine */}
          <path d="M24,42 Q26,76 24,108" stroke="rgba(255,255,255,0.38)" strokeWidth="5" fill="none" strokeLinecap="round"/>
        </svg>
      </div>
      <div style={{fontFamily:"'Fredoka One',cursive",fontSize:"1rem",
        color:"white",textShadow:"0 2px 6px rgba(0,0,0,0.4)",textAlign:"center"}}>
        {displayTreats} treats
      </div>
      {remaining>0&&nextStage&&null}
      {!nextStage&&(
        <div style={{fontFamily:"Nunito,sans-serif",fontSize:"0.78rem",
          color:"#fbbf24",textAlign:"center",
          background:"rgba(0,0,0,0.28)",borderRadius:"999px",
          padding:"0.2rem 0.8rem"}}>
          Max stage!
        </div>
      )}
    </div>
  );
};

// ── LEVEL UP OVERLAY ──────────────────────────────────────────────────────────
const LevelUpOverlay = ({newStage,newImg,onDismiss}:{newStage:typeof STAGES[0];newImg:string;onDismiss:()=>void}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(()=>{
    const canvas=canvasRef.current; if(!canvas) return;
    const ctx=canvas.getContext("2d"); if(!ctx) return;
    canvas.width=window.innerWidth; canvas.height=window.innerHeight;
    const pieces=Array.from({length:130},()=>({
      x:Math.random()*canvas.width, y:-20,
      r:4+Math.random()*8,
      color:["#fbbf24","#f97316","#ec4899","#a855f7","#22d3ee","#4ade80","#f43f5e"][Math.floor(Math.random()*7)],
      vx:(Math.random()-0.5)*5, vy:2+Math.random()*5,
      rot:Math.random()*360, vrot:(Math.random()-0.5)*8,
      shape:Math.floor(Math.random()*3),
    }));
    let frame:number;
    const animate=()=>{
      ctx.clearRect(0,0,canvas.width,canvas.height);
      pieces.forEach(p=>{
        p.x+=p.vx; p.y+=p.vy; p.rot+=p.vrot; p.vy+=0.08;
        ctx.save(); ctx.translate(p.x,p.y); ctx.rotate(p.rot*Math.PI/180);
        ctx.fillStyle=p.color;
        if(p.shape===0){ctx.fillRect(-p.r/2,-p.r/2,p.r,p.r);}
        else if(p.shape===1){ctx.beginPath();ctx.arc(0,0,p.r/2,0,Math.PI*2);ctx.fill();}
        else{ctx.beginPath();ctx.moveTo(0,-p.r);ctx.lineTo(p.r,p.r);ctx.lineTo(-p.r,p.r);ctx.closePath();ctx.fill();}
        ctx.restore();
        if(p.y>canvas.height){p.y=-20;p.x=Math.random()*canvas.width;}
      });
      frame=requestAnimationFrame(animate);
    };
    animate();
    return ()=>cancelAnimationFrame(frame);
  },[]);

  const stageIdx = STAGES.indexOf(newStage);
  const messages = [
    {main:"Your egg hatched!", zh:"蛋孵化了！", sub:"Meet your Baby Sea Turtle!"},
    {main:"Look how you've grown!", zh:"你長大了！", sub:"Now a Young Sea Turtle!"},
    {main:"Fully grown! Amazing!", zh:"完全長大了！", sub:"You raised a Grown Sea Turtle!"},
  ];
  const msg = messages[Math.min(stageIdx-1, 2)] || messages[0];

  return (
    <div style={{position:"fixed",inset:0,zIndex:500,
      background:"rgba(0,0,60,0.82)",
      display:"flex",alignItems:"center",justifyContent:"center",
      flexDirection:"column",padding:"1rem",animation:"popIn 0.4s ease-out"}}>
      <canvas ref={canvasRef} style={{position:"absolute",inset:0,pointerEvents:"none",zIndex:0}}/>
      <div style={{position:"relative",zIndex:10,textAlign:"center",
        background:"linear-gradient(135deg,#0c3460,#1a6e8a)",
        borderRadius:"2.5rem",padding:"2.5rem 2rem",maxWidth:340,width:"100%",
        border:"3px solid rgba(255,215,0,0.65)",
        boxShadow:"0 0 60px rgba(255,215,0,0.4),0 20px 60px rgba(0,0,0,0.5)"}}>
        <div style={{position:"absolute",inset:-8,borderRadius:"2.8rem",
          border:"2px solid rgba(255,215,0,0.3)",
          animation:"goldPulse 1.5s ease-in-out infinite",pointerEvents:"none"}}/>
        {/* Stars */}
        <div style={{marginBottom:"0.5rem"}}>
          {["★","★","★"].map((s,i)=>(
            <span key={i} style={{display:"inline-block",color:"#fbbf24",fontSize:"2rem",
              animation:`sBounce 0.6s ease-out ${i*0.12}s both`}}>{s}</span>
          ))}
        </div>
        <div style={{fontFamily:"'Fredoka One',cursive",fontSize:"2.4rem",
          color:"#fbbf24",textShadow:"0 0 20px rgba(255,215,0,0.9)",
          marginBottom:"0.2rem",lineHeight:1.1}}>WOW!</div>
        <div style={{fontFamily:"'Fredoka One',cursive",fontSize:"1.4rem",
          color:"white",marginBottom:"0.2rem",textShadow:"0 2px 8px rgba(0,0,0,0.4)"}}>
          {msg.main}
        </div>
        <div style={{fontFamily:"Nunito,sans-serif",fontSize:"1rem",
          color:"rgba(255,255,255,0.7)",marginBottom:"1.25rem"}}>{msg.zh}</div>
        {/* Creature reveal */}
        <div style={{position:"relative",display:"inline-block",
          animation:"cReveal 0.8s cubic-bezier(0.34,1.56,0.64,1) 0.3s both"}}>
          <div style={{position:"absolute",inset:-20,borderRadius:"50%",
            background:"radial-gradient(circle,rgba(255,215,0,0.4) 0%,transparent 70%)",
            animation:"goldPulse 1s ease-in-out infinite"}}/>
          <img src={newImg} alt="New stage!"
            style={{width:150,height:130,objectFit:"contain",
              filter:"drop-shadow(0 0 20px rgba(255,215,0,0.9))"}}/>
        </div>
        <div style={{fontFamily:"'Fredoka One',cursive",fontSize:"1.15rem",
          color:"#fbbf24",margin:"0.75rem 0 1.25rem",
          textShadow:"0 2px 6px rgba(0,0,0,0.3)"}}>
          {msg.sub}
        </div>
        <button onClick={onDismiss} style={{
          background:"linear-gradient(135deg,#fbbf24,#f97316)",
          border:"none",borderRadius:"999px",color:"white",
          fontFamily:"'Fredoka One',cursive",fontSize:"1.5rem",
          padding:"0.85rem 3rem",cursor:"pointer",
          boxShadow:"0 6px 24px rgba(251,191,36,0.65)"}}
          onMouseEnter={e=>(e.currentTarget as HTMLElement).style.transform="scale(1.06)"}
          onMouseLeave={e=>(e.currentTarget as HTMLElement).style.transform=""}>
          Yay!!!
        </button>
      </div>
    </div>
  );
};

// ── PET NAMING ────────────────────────────────────────────────────────────────
const PetNamingInput = ({petName,onSave}:{petName:string;onSave:(n:string)=>void}) => {
  const [editing,setEditing]=useState(false);
  const [val,setVal]=useState(petName);
  if(!editing) return (
    <button onClick={()=>setEditing(true)} style={{
      background:"rgba(255,255,255,0.15)",border:"1.5px dashed rgba(255,255,255,0.4)",
      borderRadius:"999px",color:"rgba(255,255,255,0.8)",
      fontFamily:"'Fredoka One',cursive",fontSize:"0.85rem",
      padding:"0.3rem 1rem",cursor:"pointer",marginBottom:"0.5rem"}}>
      {petName?"Rename your pet":"Give your pet a name!"}
    </button>
  );
  return (
    <div style={{display:"flex",gap:"0.5rem",marginBottom:"0.5rem",alignItems:"center"}}>
      <input autoFocus value={val}
        onChange={e=>setVal(e.target.value)}
        onKeyDown={e=>{if(e.key==="Enter"){onSave(val);setEditing(false);}}}
        maxLength={16} placeholder="Enter a name..."
        style={{fontFamily:"'Fredoka One',cursive",fontSize:"1rem",
          padding:"0.4rem 0.9rem",borderRadius:"999px",
          border:"2px solid rgba(255,255,255,0.5)",
          background:"rgba(255,255,255,0.2)",color:"white",outline:"none",width:140}}/>
      <button onClick={()=>{onSave(val);setEditing(false);}} style={{
        background:"#4ade80",border:"none",borderRadius:"999px",
        color:"white",fontFamily:"'Fredoka One',cursive",
        fontSize:"0.9rem",padding:"0.4rem 0.9rem",cursor:"pointer"}}>Save</button>
    </div>
  );
};

// ── UNDERWATER BG ─────────────────────────────────────────────────────────────
const UnderwaterBg = ({sad}:{sad:boolean}) => (
  <svg viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice"
    style={{position:"absolute",inset:0,width:"100%",height:"100%",zIndex:0}}>
    <defs>
      <linearGradient id="wG" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%"  stopColor={sad?"#0d1f2d":"#003d6b"}/>
        <stop offset="45%" stopColor={sad?"#122030":"#0077b6"}/>
        <stop offset="100%" stopColor={sad?"#1a2e1a":"#00b4a0"}/>
      </linearGradient>
      <linearGradient id="sG" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#c8a96e"/>
        <stop offset="100%" stopColor="#96703a"/>
      </linearGradient>
      <radialGradient id="r1" cx="25%" cy="0%"><stop offset="0%" stopColor="white" stopOpacity="0.13"/><stop offset="100%" stopColor="white" stopOpacity="0"/></radialGradient>
      <radialGradient id="r2" cx="55%" cy="0%"><stop offset="0%" stopColor="white" stopOpacity="0.09"/><stop offset="100%" stopColor="white" stopOpacity="0"/></radialGradient>
      <radialGradient id="r3" cx="78%" cy="0%"><stop offset="0%" stopColor="white" stopOpacity="0.07"/><stop offset="100%" stopColor="white" stopOpacity="0"/></radialGradient>
    </defs>
    <rect width="800" height="600" fill="url(#wG)"/>
    <ellipse cx="200" cy="-30" rx="55" ry="420" fill="url(#r1)" style={{animation:"rW 7s ease-in-out infinite"}}/>
    <ellipse cx="440" cy="-30" rx="45" ry="400" fill="url(#r2)" style={{animation:"rW 9s ease-in-out infinite 1.5s"}}/>
    <ellipse cx="624" cy="-30" rx="38" ry="380" fill="url(#r3)" style={{animation:"rW 8s ease-in-out infinite 3s"}}/>
    <ellipse cx="120" cy="530" rx="100" ry="55" fill="#1a3d28" opacity="0.55"/>
    <ellipse cx="680" cy="535" rx="90" ry="50" fill="#1a3d28" opacity="0.5"/>
    <rect x="0" y="568" width="800" height="80" fill="url(#sG)"/>
    <ellipse cx="400" cy="568" rx="420" ry="28" fill="url(#sG)"/>
    {[60,160,260,360,460,560,660,740].map((x,i)=>(
      <ellipse key={i} cx={x} cy="575" rx="32" ry="4" fill="#a08050" opacity="0.35"/>
    ))}
    <g style={{transformOrigin:"70px 565px",animation:"sw 4s ease-in-out infinite"}}>
      <rect x="64" y="498" width="12" height="70" rx="6" fill="#ff5555"/>
      <circle cx="70" cy="495" r="18" fill="#ff3333"/>
      <circle cx="56" cy="508" r="12" fill="#ff5555"/>
      <circle cx="84" cy="506" r="14" fill="#ff4444"/>
    </g>
    {[148,168,190,210].map((x,i)=>(
      <g key={i} style={{transformOrigin:`${x}px 568px`,animation:`sw ${3.2+i*0.8}s ease-in-out infinite ${i*0.4}s`}}>
        <path d={`M${x} 568 Q${x+(i%2===0?-18:16)} ${538-i*5} ${x+(i%2===0?6:-4)} ${510-i*5} Q${x+(i%2===0?-12:14)} ${485-i*4} ${x+(i%2===0?4:-2)} ${462-i*4}`}
          stroke={["#22c55e","#16a34a","#15803d","#166534"][i]} strokeWidth="7" fill="none" strokeLinecap="round"/>
      </g>
    ))}
    <g style={{transformOrigin:"685px 565px",animation:"sw 4.8s ease-in-out infinite 1.2s"}}>
      <rect x="679" y="492" width="12" height="76" rx="6" fill="#a855f7"/>
      <circle cx="685" cy="489" r="20" fill="#9333ea"/>
      <circle cx="670" cy="504" r="13" fill="#a855f7"/>
      <circle cx="700" cy="502" r="15" fill="#c084fc"/>
    </g>
    {[580,602,625,648].map((x,i)=>(
      <g key={i} style={{transformOrigin:`${x}px 568px`,animation:`sw ${3.5+i*0.7}s ease-in-out infinite ${i*0.35}s`}}>
        <path d={`M${x} 568 Q${x+(i%2===0?16:-18)} ${538-i*5} ${x+(i%2===0?-4:6)} ${510-i*5} Q${x+(i%2===0?12:-14)} ${485-i*4} ${x+(i%2===0?-2:4)} ${462-i*4}`}
          stroke={["#10b981","#059669","#047857","#065f46"][i]} strokeWidth="7" fill="none" strokeLinecap="round"/>
      </g>
    ))}
    {[{x:90,s:9,d:9,dl:0},{x:210,s:6,d:12,dl:2.5},{x:330,s:11,d:8,dl:5},
      {x:460,s:7,d:14,dl:1},{x:570,s:9,d:10,dl:3.5},{x:690,s:5,d:8,dl:6.5},
      {x:155,s:7,d:13,dl:4},{x:415,s:10,d:9,dl:7},{x:535,s:6,d:11,dl:2},
    ].map((b,i)=>(
      <circle key={i} cx={b.x} cy="620" r={b.s} fill="none"
        stroke="rgba(255,255,255,0.55)" strokeWidth="1.5"
        style={{animation:`bU ${b.d}s ease-in infinite ${b.dl}s`}}/>
    ))}
    <g style={{animation:"fR 20s linear infinite"}}>
      <ellipse cx="-40" cy="200" rx="18" ry="9" fill="#fbbf24" opacity="0.4"/>
      <polygon points="-58,200 -72,194 -72,206" fill="#fbbf24" opacity="0.4"/>
    </g>
    <g style={{animation:"fL 25s linear infinite 6s"}}>
      <ellipse cx="840" cy="300" rx="14" ry="7" fill="#a78bfa" opacity="0.35"/>
      <polygon points="854,300 866,295 866,305" fill="#a78bfa" opacity="0.35"/>
    </g>
    <style>{`
      @keyframes sw{0%,100%{transform:rotate(-6deg)}50%{transform:rotate(6deg)}}
      @keyframes rW{0%,100%{opacity:.85;transform:skewX(-4deg)}50%{opacity:1;transform:skewX(4deg)}}
      @keyframes bU{0%{transform:translateY(0);opacity:.6}50%{transform:translateY(-310px) translateX(14px);opacity:.35}100%{transform:translateY(-660px) translateX(-12px);opacity:0}}
      @keyframes fR{0%{transform:translateX(0)}100%{transform:translateX(900px)}}
      @keyframes fL{0%{transform:translateX(0) scaleX(-1)}100%{transform:translateX(-900px) scaleX(-1)}}
    `}</style>
  </svg>
);

// ── EARN BUTTONS ──────────────────────────────────────────────────────────────
const EarnButtons = ({navigate,code,studentName}:{navigate:(p:string)=>void;code:string;studentName:string}) => (
  <div style={{display:"flex",flexDirection:"column",gap:"0.85rem"}}>
    {[
      {label:"Play a Game",sub:"Fun English games!",reward:"+2 treats",color:"#f97316",glow:"rgba(249,115,22,0.5)",path:`/game/${code}/${studentName}`},
      {label:"Read & Quiz",sub:"Read a story, answer questions!",reward:"+3 treats",color:"#a855f7",glow:"rgba(168,85,247,0.5)",path:"/quiz"},
      {label:"Visit 5 Days!",sub:"Come back any 5 days to earn a treat!",reward:"+3 treats",color:"#10b981",glow:"rgba(16,185,129,0.5)",path:""},
    ].map((btn,i)=>(
      <button key={i} onClick={()=>btn.path&&navigate(btn.path)} style={{
        width:"100%",padding:"1rem 1.25rem",
        background:`linear-gradient(135deg,${btn.color},${btn.color}cc)`,
        border:"none",borderRadius:"1.4rem",cursor:"pointer",
        boxShadow:`0 6px 20px ${btn.glow}`,
        display:"flex",alignItems:"center",justifyContent:"space-between",
        textAlign:"left",animation:`eF ${2.5+i*0.4}s ease-in-out infinite`}}
        onMouseEnter={e=>{const el=e.currentTarget as HTMLElement;el.style.transform="scale(1.04) translateY(-3px)";el.style.boxShadow=`0 12px 30px ${btn.glow}`;}}
        onMouseLeave={e=>{const el=e.currentTarget as HTMLElement;el.style.transform="";el.style.boxShadow=`0 6px 20px ${btn.glow}`;}}
      >
        <div>
          <div style={{fontFamily:"'Fredoka One',cursive",fontSize:"1.25rem",
            color:"white",lineHeight:1.2}}>{btn.label}</div>
          <div style={{fontFamily:"Nunito,sans-serif",fontSize:"0.8rem",
            color:"rgba(255,255,255,0.85)",marginTop:"0.1rem"}}>{btn.sub}</div>
        </div>
        <div style={{background:"rgba(255,255,255,0.25)",borderRadius:"999px",
          padding:"0.3rem 0.85rem",flexShrink:0,marginLeft:"0.5rem",
          fontFamily:"'Fredoka One',cursive",fontSize:"1rem",color:"white",whiteSpace:"nowrap"}}>
          {btn.reward}
        </div>
      </button>
    ))}
  </div>
);

// ── COLLECTION ────────────────────────────────────────────────────────────────
const COLS=[
  {bg:"#0891b2",border:"rgba(255,215,0,0.6)",glow:"rgba(255,215,0,0.35)"},
  {bg:"#dc2626",border:"rgba(255,120,120,0.5)",glow:"rgba(220,38,38,0.25)"},
  {bg:"#7c3aed",border:"rgba(167,139,250,0.5)",glow:"rgba(124,58,237,0.25)"},
  {bg:"#0d9488",border:"rgba(94,234,212,0.5)",glow:"rgba(13,148,136,0.25)"},
  {bg:"#b45309",border:"rgba(251,191,36,0.5)",glow:"rgba(180,83,9,0.25)"},
  {bg:"#be185d",border:"rgba(249,168,212,0.5)",glow:"rgba(190,24,93,0.25)"},
];

const OceanCollection = ({unlockedCount}:{unlockedCount:number}) => {
  const creatures=[
    {name:"Sea Turtle",img:"/creatures/turtle-baby.png"},
    {name:"Clownfish",img:""},
    {name:"Octopus",img:""},
    {name:"Dolphin",img:""},
    {name:"Seal",img:""},
    {name:"Pufferfish",img:""},
  ];
  return (
    <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"0.75rem"}}>
      {creatures.map((c,i)=>{
        const unlocked=i<unlockedCount;
        const col=COLS[i];
        return (
          <div key={i} style={{
            position:"relative",borderRadius:"1.25rem",
            background:`${col.bg}${unlocked?"33":"18"}`,
            border:`2px solid ${col.border}`,
            padding:"0.85rem 0.5rem",
            boxShadow:`0 0 ${unlocked?20:10}px ${col.glow}`,
            display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
            transition:"all 0.3s"}}>
            {unlocked?(
              <>
                <img src={c.img} alt={c.name}
                  style={{width:62,height:62,objectFit:"contain",
                    filter:"drop-shadow(0 4px 8px rgba(0,0,0,0.3))",
                    display:"block",margin:"0 auto"}}/>
                <div style={{fontFamily:"'Fredoka One',cursive",fontSize:"0.75rem",
                  color:"#fbbf24",marginTop:"0.35rem",textAlign:"center",
                  textShadow:"0 1px 4px rgba(0,0,0,0.4)"}}>{c.name}</div>
                <div style={{position:"absolute",inset:-3,borderRadius:"1.4rem",
                  border:"2px solid rgba(255,215,0,0.4)",
                  animation:"gP 2s ease-in-out infinite",pointerEvents:"none"}}/>
              </>
            ):(
              <>
                <div style={{width:56,height:52,borderRadius:"30% 40% 35% 45%",
                  background:`${col.bg}55`,margin:"0 auto",position:"relative",
                  display:"flex",alignItems:"center",justifyContent:"center",
                  animation:"sL 2.5s ease-in-out infinite"}}>
                  <div style={{width:34,height:30,borderRadius:"40% 35% 45% 30%",
                    background:`${col.bg}88`}}/>
                  <div style={{position:"absolute",top:-6,right:-5,
                    animation:`spL ${1.8+i*0.3}s ease-in-out infinite`}}>
                    <svg width="14" height="14" viewBox="0 0 14 14">
                      <path d="M7 0L8.5 5.5L14 7L8.5 8.5L7 14L5.5 8.5L0 7L5.5 5.5Z"
                        fill="rgba(255,255,255,0.75)"/>
                    </svg>
                  </div>
                  <div style={{position:"absolute",bottom:-4,left:-4,
                    animation:`spL ${2.2+i*0.25}s ease-in-out infinite 0.5s`}}>
                    <svg width="10" height="10" viewBox="0 0 14 14">
                      <path d="M7 0L8.5 5.5L14 7L8.5 8.5L7 14L5.5 8.5L0 7L5.5 5.5Z"
                        fill="rgba(255,255,255,0.55)"/>
                    </svg>
                  </div>
                </div>
                <div style={{fontFamily:"'Fredoka One',cursive",fontSize:"0.72rem",
                  color:col.border,marginTop:"0.4rem",textAlign:"center",opacity:0.75}}>???</div>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
};

// ── MAIN ──────────────────────────────────────────────────────────────────────
const KidsWorld = () => {
  const {code,studentName}=useParams<{code:string;studentName:string}>();
  const {family}=useAuth();
  const navigate=useNavigate();

  const isMaster=code===MASTER_CODE;
if(isMaster){
  localStorage.removeItem(`mpe_game_claimed_${code}_Test_${new Date().toDateString()}`);
  localStorage.removeItem(`mpe_levelup_${code}_Test`);
}
  const [jarTreats,setJarTreats]=useState(()=>isMaster?0:parseInt(localStorage.getItem(`mpe_jar_${code}_${studentName}`)||"0"));
const [fedTreats,setFedTreats]=useState(()=>isMaster?0:parseInt(localStorage.getItem(`mpe_fed_${code}_${studentName}`)||"0"));
const [treats,setTreats]=useState(0);
  const [loading,setLoading]=useState(!isMaster);
  const [hearts,setHearts]=useState<{id:number;x:number;y:number;delay:number}[]>([]);
  const [petted,setPetted]=useState(false);
  const [eggWiggle,setEggWiggle]=useState(false);
  const [showDailyGift,setShowDailyGift]=useState(false);
  const [justEarned,setJustEarned]=useState(0);
  const [showSettings,setShowSettings]=useState(false);
  const sad=false;
  const [petName,setPetName]=useState(()=>localStorage.getItem(`mpe_petname_${code}_${studentName}`)||"");
  const [levelUpStage,setLevelUpStage]=useState<typeof STAGES[0]|null>(null);
  const [musicOn,setMusicOn]=useState(()=>localStorage.getItem("mpe_music")!=="off");
  const [sfxOn,setSfxOn]=useState(()=>localStorage.getItem("mpe_sfx")!=="off");
  const [volume,setVolume]=useState(()=>parseFloat(localStorage.getItem("mpe_volume")||"0.25"));

  const heartId=useRef(0);
  const feedId=useRef(0);
  const [feedingCookies,setFeedingCookies]=useState<{id:number;x:number;y:number}[]>([]);
  const creatureRef=useRef<HTMLDivElement>(null);
  const audioRef=useRef<HTMLAudioElement|null>(null);
  const ctxRef=useRef<AudioContext|null>(null);
  const prevStageRef=useRef(-1);
  const levelUpFiredRef=useRef<Set<number>>(new Set());

  const displayName=(()=>{
    if(isMaster) return "Teacher";
    const n=studentName??"";
    const s=family?.students.find(s=>s.name.toLowerCase()===n.toLowerCase());
    return s?.name??(n.charAt(0).toUpperCase()+n.slice(1));
  })();

  
  const stage=getStage(fedTreats);
  const stageIdx=STAGES.indexOf(stage);
  const nextStage=STAGES[stageIdx+1];
  const isEgg=stageIdx===0;
  const nearHatch=isEgg&&fedTreats>=12;
  const progress=nextStage?Math.round(((fedTreats-stage.min)/(nextStage.min-stage.min))*100):100;

  // Music
  useEffect(()=>{
    if(!audioRef.current){audioRef.current=new Audio("/ocean-music.mp3");audioRef.current.loop=true;}
    audioRef.current.volume=volume*0.5;
    if(musicOn){
      audioRef.current.play().catch(()=>{
        const tryPlay=()=>{audioRef.current?.play().catch(()=>{});};
        document.addEventListener("pointerdown",tryPlay,{once:true});
      });
    }
    else audioRef.current.pause();
    localStorage.setItem("mpe_music",musicOn?"on":"off");
    return ()=>{audioRef.current?.pause();};
  },[musicOn]);
  useEffect(()=>{if(audioRef.current) audioRef.current.volume=volume*0.5;localStorage.setItem("mpe_volume",String(volume));},[volume]);
  useEffect(()=>{localStorage.setItem("mpe_sfx",sfxOn?"on":"off");},[sfxOn]);

  const getCtx=()=>{
    if(!ctxRef.current) ctxRef.current=new (window.AudioContext||(window as any).webkitAudioContext)();
    return ctxRef.current;
  };
  const playSfx=useCallback((type:"chirp"|"hearts"|"levelup"|"daily"|"treat"|"rattle")=>{
    if(!sfxOn) return;
    try{
      const ctx=getCtx();
      const play=(freq:number,time:number,dur:number,vol=0.15,wave:OscillatorType="sine")=>{
        const osc=ctx.createOscillator();const g=ctx.createGain();
        osc.connect(g);g.connect(ctx.destination);
        osc.type=wave;osc.frequency.value=freq;
        g.gain.setValueAtTime(vol,ctx.currentTime+time);
        g.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+time+dur);
        osc.start(ctx.currentTime+time);osc.stop(ctx.currentTime+time+dur+0.01);
      };
      const sounds:Record<string,()=>void>={
        chirp:()=>{play(600,0,.06);play(900,.08,.06);play(1100,.16,.1);},
        hearts:()=>{[523,659,784,1047].forEach((f,i)=>play(f,i*0.09,0.18));},
        levelup:()=>{[523,659,784,1047,1319,1568,2093].forEach((f,i)=>play(f,i*0.09,0.3,0.2));},
        daily:()=>{[440,554,659,880].forEach((f,i)=>play(f,i*0.12,0.22,0.14));},
        treat:()=>{play(660,0,.05);play(880,.07,.05);},
        rattle:()=>{
          [0,0.08,0.16,0.24,0.32].forEach(t=>{
            const buf=ctx.createBuffer(1,ctx.sampleRate*0.05,ctx.sampleRate);
            const data=buf.getChannelData(0);
            for(let i=0;i<data.length;i++) data[i]=(Math.random()*2-1)*0.3;
            const src=ctx.createBufferSource();const g=ctx.createGain();
            src.buffer=buf;src.connect(g);g.connect(ctx.destination);
            g.gain.setValueAtTime(0.4,ctx.currentTime+t);
            g.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+t+0.05);
            src.start(ctx.currentTime+t);
          });
        },
      };
      sounds[type]?.();
    }catch{}
  },[sfxOn]);

  // Level up — fire ONCE per stage transition, never repeat
  useEffect(()=>{
    if(stageIdx>0&&stageIdx!==prevStageRef.current&&!levelUpFiredRef.current.has(stageIdx)){
      levelUpFiredRef.current.add(stageIdx);
localStorage.setItem(`mpe_levelup_${code}_${studentName}`,JSON.stringify([...levelUpFiredRef.current]));
      setLevelUpStage(STAGES[stageIdx]);
      playSfx("levelup");
    }
    prevStageRef.current=stageIdx;
  },[stageIdx]);

  useEffect(()=>{
    if(isMaster) return;
    fetch(`${SHEETDB_URL}?sheet=StudentProgress`)
      .then(r=>r.json())
      .then((data:any[])=>{
        const row=data.find(r=>r.familyCode===code&&r.studentName?.toLowerCase()===studentName?.toLowerCase());
        if(row){setTreats(parseInt(row.treats)||0);}
        setLoading(false);
      }).catch(()=>setLoading(false));
    const lastGift=localStorage.getItem(`mpe_gift_${code}_${studentName}`);
const shownKey=`mpe_gift_shown_${code}_${studentName}_${new Date().toDateString()}`;
if(lastGift!==new Date().toDateString()&&!localStorage.getItem(shownKey)){
  localStorage.setItem(shownKey,"true");
  setTimeout(()=>setShowDailyGift(true),1800);
}
  },[]);

  const savePetName=(name:string)=>{setPetName(name);localStorage.setItem(`mpe_petname_${code}_${studentName}`,name);};

  const handleFeed=()=>{
    if(jarTreats<=0) return;
    const newJar=jarTreats-1;
    const newFed=fedTreats+1;
    setJarTreats(newJar);
    setFedTreats(newFed);
    if(!isMaster){
      localStorage.setItem(`mpe_jar_${code}_${studentName}`,String(newJar));
      localStorage.setItem(`mpe_fed_${code}_${studentName}`,String(newFed));
    }
    playSfx("treat");
    const id=feedId.current++;
    const rect=creatureRef.current?.getBoundingClientRect();
    const jarX=window.innerWidth/2-80;
    const jarY=window.innerHeight/2+100;
    setFeedingCookies(f=>[...f,{id,x:jarX,y:jarY}]);
    setTimeout(()=>{
      setFeedingCookies(f=>f.filter(c=>c.id!==id));
      setPetted(true);
      setTimeout(()=>setPetted(false),1200);
    },1000);
    setJustEarned(1);
    setTimeout(()=>setJustEarned(0),2500);
  };

  const spawnHearts=(cx:number,cy:number)=>{
    const nh=Array.from({length:4},(_,i)=>({id:heartId.current++,x:cx+(Math.random()-0.5)*80,y:cy-20,delay:i*0.15}));
    setHearts(h=>[...h,...nh]);
    setTimeout(()=>setHearts(h=>h.filter(hh=>!nh.find(n=>n.id===hh.id))),2000);
  };

  const handlePet=(e:React.MouseEvent|React.TouchEvent)=>{
    if(isEgg) return;
    const rect=creatureRef.current?.getBoundingClientRect();if(!rect) return;
    const cx='touches' in e?e.touches[0].clientX:e.clientX;
    const cy='touches' in e?e.touches[0].clientY:e.clientY;
    spawnHearts(cx-rect.left,cy-rect.top);
    setPetted(true);playSfx("hearts");
    setTimeout(()=>setPetted(false),1200);
  };

  const handleEggTap=()=>{setEggWiggle(true);playSfx("rattle");setTimeout(()=>setEggWiggle(false),700);};
const claimDailyGift=()=>{
    const newJar=jarTreats+1;
    setJarTreats(newJar);
    setJustEarned(1);
    playSfx("daily");
    setShowDailyGift(false);
    localStorage.setItem(`mpe_gift_${code}_${studentName}`,new Date().toDateString());
    if(!isMaster) localStorage.setItem(`mpe_jar_${code}_${studentName}`,String(newJar));
    setTimeout(()=>setJustEarned(0),2500);
  };

  const creatureImg=stageIdx===0?"/creatures/turtle-egg.png":stageIdx===1?"/creatures/turtle-baby.png":stageIdx===2?"/creatures/turtle-young.png":"/creatures/turtle-grown.png";
  const levelUpImg=levelUpStage?(STAGES.indexOf(levelUpStage)===1?"/creatures/turtle-baby.png":STAGES.indexOf(levelUpStage)===2?"/creatures/turtle-young.png":"/creatures/turtle-grown.png"):"";

  if(loading) return (
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",
      background:"linear-gradient(180deg,#003d6b,#00b4a0)"}}>
      <div style={{fontFamily:"'Fredoka One',cursive",fontSize:"2rem",color:"white",textAlign:"center"}}>
        Loading {displayName}'s World...
      </div>
    </div>
  );

  return (
    <div style={{minHeight:"100vh",position:"relative",overflow:"hidden",
      fontFamily:"'Fredoka One',cursive",userSelect:"none"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka+One&family=Nunito:wght@600;700;800;900&display=swap');
        @keyframes heartFloat{0%{transform:translateY(0) scale(0.5);opacity:1}60%{transform:translateY(-55px) scale(1.1);opacity:1}100%{transform:translateY(-100px) scale(0.8);opacity:0}}
        @keyframes bobAnim{0%,100%{transform:translateY(0) rotate(-0.5deg)}50%{transform:translateY(-14px) rotate(0.5deg)}}
        @keyframes pettedAnim{0%,100%{transform:translateY(0) scale(1)}20%{transform:translateY(-8px) rotate(-4deg) scale(1.06)}40%{transform:translateY(-12px) rotate(4deg) scale(1.08)}60%{transform:translateY(-6px) rotate(-2deg) scale(1.05)}80%{transform:translateY(-3px) rotate(2deg) scale(1.03)}}
        @keyframes eggWiggle{0%,100%{transform:rotate(0deg) scale(1)}15%{transform:rotate(-10deg) scale(1.04)}30%{transform:rotate(10deg) scale(1.04)}45%{transform:rotate(-7deg) scale(1.02)}60%{transform:rotate(7deg) scale(1.02)}75%{transform:rotate(-3deg) scale(1.01)}}
        @keyframes eggAuto{0%,80%,100%{transform:rotate(0deg)}83%{transform:rotate(-6deg)}87%{transform:rotate(6deg)}91%{transform:rotate(-4deg)}95%{transform:rotate(3deg)}98%{transform:rotate(-1deg)}}
        @keyframes nearHatchGlow{0%,100%{filter:drop-shadow(0 0 8px rgba(255,215,0,0.6)) drop-shadow(0 8px 20px rgba(0,0,0,0.3))}50%{filter:drop-shadow(0 0 22px rgba(255,215,0,1)) drop-shadow(0 8px 20px rgba(0,0,0,0.3))}}
        @keyframes giftBounce{0%,100%{transform:translateY(0) rotate(-4deg)}50%{transform:translateY(-18px) rotate(4deg)}}
        @keyframes popIn{0%{transform:scale(0) rotate(-10deg);opacity:0}65%{transform:scale(1.12) rotate(3deg);opacity:1}100%{transform:scale(1) rotate(0deg);opacity:1}}
        @keyframes fadeUp{0%{transform:translateY(24px);opacity:0}100%{transform:translateY(0);opacity:1}}
        @keyframes shimmer{0%,100%{opacity:0.65}50%{opacity:1}}
        @keyframes earnedPop{0%{transform:translateY(0) scale(0.8);opacity:1}60%{transform:translateY(-20px) scale(1.15);opacity:1}100%{transform:translateY(-40px) scale(1);opacity:0}}
        @keyframes eF{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}
        @keyframes goldPulse{0%,100%{opacity:0.4;transform:scale(1)}50%{opacity:0.85;transform:scale(1.02)}}
        @keyframes gP{0%,100%{opacity:0.4}50%{opacity:0.85}}
        @keyframes sL{0%,100%{opacity:0.35}50%{opacity:0.65}}
        @keyframes spL{0%,100%{opacity:0.3;transform:scale(1) rotate(0deg)}50%{opacity:1;transform:scale(1.6) rotate(20deg)}}
        @keyframes jF2{0%,100%{transform:translateY(0)}50%{transform:translateY(-2px)}}
        @keyframes sBounce{0%{transform:scale(0) rotate(-20deg);opacity:0}100%{transform:scale(1) rotate(0deg);opacity:1}}
        @keyframes cReveal{0%{transform:scale(0) rotate(-10deg);opacity:0}70%{transform:scale(1.15) rotate(3deg);opacity:1}100%{transform:scale(1) rotate(0deg);opacity:1}}
        @keyframes sTag{0%,100%{opacity:0.4;transform:scale(0.8)}50%{opacity:1;transform:scale(1.2)}}
        @keyframes sparkTag{0%,100%{opacity:0.4}50%{opacity:1}}
        @keyframes cookieFloat{0%{transform:translateY(0) translateX(0) scale(1);opacity:1}25%{transform:translateY(-60px) translateX(20px) scale(1.1)}50%{transform:translateY(-120px) translateX(-15px) scale(1.05)}75%{transform:translateY(-180px) translateX(10px) scale(0.9)}100%{transform:translateY(-240px) translateX(0) scale(0.5);opacity:0}}
        .bob{animation:bobAnim 3.4s ease-in-out infinite}
        .petted{animation:pettedAnim 0.9s ease-in-out}
        .egg-idle{animation:bobAnim 4s ease-in-out infinite,eggAuto 5s ease-in-out infinite;cursor:pointer}
        .egg-near{animation:bobAnim 2s ease-in-out infinite,eggAuto 2.5s ease-in-out infinite,nearHatchGlow 1.2s ease-in-out infinite;cursor:pointer}
        .egg-wiggle{animation:eggWiggle 0.7s ease-in-out;cursor:pointer}
        .glass{background:rgba(255,255,255,0.12);backdrop-filter:blur(14px);border:1.5px solid rgba(255,255,255,0.25);border-radius:1.75rem}
        .gold-border{border:2.5px solid gold !important;box-shadow:0 0 28px rgba(255,215,0,0.45)}
        .toggle-track{width:50px;height:28px;border-radius:999px;border:none;cursor:pointer;transition:background 0.3s;position:relative;display:flex;align-items:center;padding:3px}
        .toggle-thumb{width:22px;height:22px;border-radius:50%;background:white;transition:transform 0.3s;box-shadow:0 2px 4px rgba(0,0,0,0.2)}
        input[type=range]{-webkit-appearance:none;width:100%;height:6px;border-radius:3px;background:rgba(255,255,255,0.25);outline:none}
        input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:18px;height:18px;border-radius:50%;background:#4ade80;cursor:pointer;box-shadow:0 2px 6px rgba(0,0,0,0.3)}
      `}</style>

      <UnderwaterBg sad={sad}/>
      {levelUpStage&&<LevelUpOverlay newStage={levelUpStage} newImg={levelUpImg} onDismiss={()=>setLevelUpStage(null)}/>}

      {/* NAV */}
      <nav style={{position:"fixed",top:0,left:0,right:0,zIndex:100,
        background:"rgba(0,40,80,0.72)",backdropFilter:"blur(14px)",
        padding:"0.55rem 1rem",display:"flex",alignItems:"center",
        justifyContent:"space-between",borderBottom:"1px solid rgba(255,255,255,0.15)"}}>
        <button onClick={()=>navigate("/portal")} style={{
          background:"rgba(255,255,255,0.18)",border:"1.5px solid rgba(255,255,255,0.35)",
          color:"white",fontFamily:"'Fredoka One',cursive",fontSize:"0.95rem",
          padding:"0.38rem 1rem",borderRadius:"999px",cursor:"pointer"}}>Back</button>
        <span style={{color:"white",fontFamily:"'Fredoka One',cursive",fontSize:"1.1rem",
          textShadow:"0 2px 6px rgba(0,0,0,0.4)"}}>My Paradise English</span>
        <div style={{display:"flex",gap:"0.5rem",alignItems:"center"}}>
          {isMaster&&<span style={{background:"linear-gradient(135deg,#f59e0b,#d97706)",
            color:"white",borderRadius:"999px",padding:"0.25rem 0.75rem",
            fontSize:"0.78rem",fontFamily:"'Fredoka One',cursive"}}>MASTER</span>}
          <button onClick={()=>setShowSettings(s=>!s)} style={{
            background:"rgba(255,255,255,0.18)",border:"1.5px solid rgba(255,255,255,0.3)",
            color:"white",fontFamily:"'Fredoka One',cursive",fontSize:"0.9rem",
            padding:"0.3rem 0.8rem",borderRadius:"999px",cursor:"pointer"}}>Settings</button>
        </div>
      </nav>

      {/* SETTINGS */}
      {showSettings&&(
        <div onClick={e=>e.stopPropagation()} style={{
          position:"fixed",top:62,right:14,zIndex:200,
          background:"rgba(0,30,60,0.93)",backdropFilter:"blur(18px)",
          borderRadius:"1.4rem",padding:"1.25rem 1.5rem",minWidth:240,
          border:"1.5px solid rgba(255,255,255,0.2)",
          animation:"popIn 0.25s ease-out",boxShadow:"0 8px 32px rgba(0,0,0,0.4)"}}>
          <div style={{color:"white",fontFamily:"'Fredoka One',cursive",fontSize:"1.15rem",marginBottom:"1rem"}}>Settings</div>
          {[
            {label:"Music",on:musicOn,toggle:()=>setMusicOn(m=>!m)},
            {label:"Sound Effects",on:sfxOn,toggle:()=>setSfxOn(s=>!s)},
          ].map((item,i)=>(
            <div key={i} style={{display:"flex",alignItems:"center",justifyContent:"space-between",
              padding:"0.55rem 0",borderBottom:"1px solid rgba(255,255,255,0.12)"}}>
              <span style={{color:"white",fontFamily:"'Fredoka One',cursive",fontSize:"0.95rem"}}>{item.label}</span>
              <button className="toggle-track" style={{background:item.on?"#4ade80":"rgba(255,255,255,0.25)"}} onClick={item.toggle}>
                <div className="toggle-thumb" style={{transform:item.on?"translateX(22px)":"translateX(0)"}}/>
              </button>
            </div>
          ))}
          <div style={{padding:"0.6rem 0"}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:"0.4rem"}}>
              <span style={{color:"white",fontFamily:"'Fredoka One',cursive",fontSize:"0.95rem"}}>Volume</span>
              <span style={{color:"rgba(255,255,255,0.6)",fontFamily:"Nunito,sans-serif",fontSize:"0.8rem"}}>{Math.round(volume*100)}%</span>
            </div>
            <input type="range" min="0" max="1" step="0.05" value={volume}
              onChange={e=>setVolume(parseFloat(e.target.value))}/>
          </div>
        </div>
      )}

      {/* DAILY GIFT */}
      {showDailyGift&&(
        <div style={{position:"fixed",inset:0,zIndex:300,background:"rgba(0,0,0,0.65)",
          display:"flex",alignItems:"center",justifyContent:"center",padding:"1rem"}}>
          <div style={{background:"linear-gradient(135deg,#0c3460,#0a6e8a)",
            borderRadius:"2rem",padding:"2.5rem 2rem",textAlign:"center",
            border:"2px solid rgba(255,255,255,0.3)",maxWidth:320,width:"100%",
            animation:"popIn 0.4s ease-out",boxShadow:"0 20px 60px rgba(0,0,0,0.5)"}}>
            <div style={{display:"flex",justifyContent:"center",marginBottom:"0.75rem",
              animation:"giftBounce 1s ease-in-out infinite"}}>
              <FaceCookie size={80}/>
            </div>
            <div style={{color:"white",fontFamily:"'Fredoka One',cursive",fontSize:"1.9rem",marginBottom:"0.3rem"}}>
              Daily Gift!
            </div>
            <div style={{color:"rgba(255,255,255,0.8)",fontFamily:"Nunito,sans-serif",
              fontSize:"1rem",marginBottom:"1.5rem",lineHeight:1.5}}>
              {displayName} gets 1 treat today!<br/>
              <span style={{fontSize:"0.82rem",opacity:0.65}}>Come back tomorrow for more!</span>
            </div>
            <button onClick={claimDailyGift} style={{
              background:"linear-gradient(135deg,#f59e0b,#ef4444)",
              border:"none",borderRadius:"999px",color:"white",
              fontFamily:"'Fredoka One',cursive",fontSize:"1.25rem",
              padding:"0.85rem 2.5rem",cursor:"pointer",
              boxShadow:"0 6px 24px rgba(245,158,11,0.55)"}}>
              Claim +1 Treat!
            </button>
          </div>
        </div>
      )}

      {/* MAIN */}
      <div style={{position:"relative",zIndex:10,maxWidth:520,margin:"0 auto",padding:"72px 14px 50px"}}>

        {/* Title */}
        <div style={{textAlign:"center",marginBottom:"1rem",animation:"fadeUp 0.5s ease-out"}}>
          <div style={{fontFamily:"'Fredoka One',cursive",
            fontSize:"clamp(2rem,6vw,3rem)",color:"white",
            textShadow:"0 3px 14px rgba(0,0,50,0.6)",lineHeight:1.1}}>
            {displayName}'s Ocean World!
          </div>
          <div style={{display:"inline-block",marginTop:"0.6rem",
            background:"linear-gradient(135deg,hsl(350,85%,60%),hsl(330,80%,65%))",
            color:"white",borderRadius:"999px",padding:"0.32rem 1.3rem",
            fontSize:"1.1rem",fontFamily:"'Fredoka One',cursive",
            boxShadow:"0 4px 16px rgba(0,0,0,0.3)"}}>
            {stage.name} Stage
          </div>
        </div>

        {/* CREATURE CARD */}
        <div className={`glass ${isMaster?"gold-border":""}`}
          style={{padding:"1.5rem 1rem 1.25rem",marginBottom:"1rem",textAlign:"center",
            animation:"fadeUp 0.6s ease-out",
            boxShadow:"0 8px 40px rgba(0,0,0,0.25)",position:"relative",overflow:"hidden"}}>

          {justEarned>0&&(
            <div style={{position:"absolute",top:14,right:14,
              background:"rgba(255,200,0,0.95)",borderRadius:"999px",
              padding:"0.28rem 0.85rem",color:"#333",
              fontFamily:"'Fredoka One',cursive",fontSize:"0.9rem",
              animation:"earnedPop 2s ease-out forwards",zIndex:20}}>
              +{justEarned} treats!
            </div>
          )}

          {/* Name tag */}
          <div style={{display:"flex",flexDirection:"column",alignItems:"center"}}>
            {petName?<DisneyNameTag name={petName}/>:<div style={{height:8}}/>}
            <PetNamingInput petName={petName} onSave={savePetName}/>
          </div>

          {/* Near hatch bubble */}
          {nearHatch&&!eggWiggle&&(
            <div style={{background:"rgba(255,255,255,0.95)",borderRadius:"1.2rem",
              padding:"0.6rem 1rem",margin:"0 auto 0.5rem",maxWidth:240,
              fontFamily:"Nunito,sans-serif",fontSize:"0.9rem",color:"#333",lineHeight:1.4,
              boxShadow:"0 4px 12px rgba(0,0,0,0.15)",position:"relative"}}>
              I'm almost ready!<br/>
              <span style={{fontSize:"0.78rem",color:"#666"}}>我快出來了！</span>
              <div style={{position:"absolute",bottom:-8,left:"50%",transform:"translateX(-50%)",
                width:0,height:0,borderLeft:"8px solid transparent",borderRight:"8px solid transparent",
                borderTop:"8px solid rgba(255,255,255,0.95)"}}/>
            </div>
          )}

          {/* Creature */}
          <div ref={creatureRef} style={{position:"relative",display:"inline-block",cursor:"pointer"}}>
            {hearts.map(h=>(
              <div key={h.id} style={{position:"absolute",left:h.x,top:h.y,pointerEvents:"none",
                animation:`heartFloat 1.4s ease-out ${h.delay}s forwards`,opacity:0,zIndex:50}}>
                <svg width="22" height="20" viewBox="0 0 24 22">
                  <path d="M12 20.5C12 20.5 2 13.5 2 7C2 4.2 4.2 2 7 2C9.1 2 10.9 3.2 12 5C13.1 3.2 14.9 2 17 2C19.8 2 22 4.2 22 7C22 13.5 12 20.5 12 20.5Z"
                    fill="#ff6b9d" stroke="#ff4488" strokeWidth="1"/>
                </svg>
              </div>
            ))}
            <div
              className={isEgg?(eggWiggle?"egg-wiggle":nearHatch?"egg-near":"egg-idle"):(petted?"petted":"bob")}
              onClick={isEgg?handleEggTap:handlePet}
              style={{width:"min(250px,65vw)",height:"min(210px,55vw)",
                display:"flex",alignItems:"center",justifyContent:"center",
                filter:sad?"saturate(0.4) brightness(0.75)":"none",
                position:"relative",
                transition:"filter 0.5s ease"}}>
              {isEgg&&<EggCracks treats={fedTreats}/>}
              <img src={creatureImg} alt={isEgg?"Turtle egg":"Sea turtle"}
                style={{maxWidth:"100%",maxHeight:"100%",objectFit:"contain",
                  filter:sad?"none":"drop-shadow(0 8px 20px rgba(0,0,0,0.3))"}}
                draggable={false}/>
            </div>
            {isEgg&&!nearHatch&&(
              <div style={{color:"rgba(255,255,255,0.75)",fontFamily:"Nunito,sans-serif",
                fontSize:"0.85rem",marginTop:"0.3rem",animation:"shimmer 2.2s ease-in-out infinite"}}>
                Tap the egg!
              </div>
            )}
            {nearHatch&&(
              <div style={{color:"#fbbf24",fontFamily:"'Fredoka One',cursive",
                fontSize:"0.95rem",marginTop:"0.3rem",animation:"shimmer 1s ease-in-out infinite"}}>
                Almost hatching!
              </div>
            )}
            {!isEgg&&!sad&&(
              <div style={{color:"rgba(255,255,255,0.75)",fontFamily:"Nunito,sans-serif",
                fontSize:"0.85rem",marginTop:"0.3rem",animation:"shimmer 2.2s ease-in-out infinite"}}>
                Pet me to make me happy!
              </div>
            )}
          </div>

          <div style={{color:"white",fontFamily:"'Fredoka One',cursive",fontSize:"1.3rem",
            marginTop:"0.5rem",textShadow:"0 2px 8px rgba(0,0,0,0.4)"}}>
            {stage.label}{isMaster?" (Master)":""}
          </div>


          {nextStage&&(
            <div style={{marginTop:"1rem",padding:"0 0.5rem"}}>
              {/* Fun progress bar */}
              <div style={{position:"relative",height:28,
                background:"rgba(0,0,0,0.25)",borderRadius:"999px",
                border:"2.5px solid rgba(255,255,255,0.2)",overflow:"visible",
                marginBottom:"0.6rem"}}>
                <div style={{
                  width:`${progress}%`,height:"100%",borderRadius:"999px",
                  background:"linear-gradient(to right,#fbbf24,#f97316)",
                  transition:"width 1s cubic-bezier(0.34,1.56,0.64,1)",
                  boxShadow:"0 0 12px rgba(251,191,36,0.7)",
                  minWidth: progress>0?"28px":"0",
                  position:"relative"}}>
                  {progress>0&&(
                    <div style={{
                      position:"absolute",right:-14,top:"50%",
                      transform:"translateY(-50%)",
                      fontSize:"1.4rem",
                      filter:"drop-shadow(0 2px 4px rgba(0,0,0,0.4))",
                      animation:"bobAnim 2s ease-in-out infinite"}}>
                      🐢
                    </div>
                  )}
                </div>
              </div>
              {/* "X more to Baby!" label */}
              <div style={{
                textAlign:"center",
                fontFamily:"'Fredoka One',cursive",
                fontSize:"1.1rem",
                color:"#fbbf24",
                textShadow:"0 2px 6px rgba(0,0,0,0.4)",
                animation:"shimmer 2s ease-in-out infinite"}}>
                {nextStage.min-fedTreats} more treats to {nextStage.name}!
              </div>
            </div>
          )}
          {!nextStage&&(
            <div style={{color:"#fbbf24",fontFamily:"'Fredoka One',cursive",
              fontSize:"1.15rem",marginTop:"0.6rem",textShadow:"0 2px 8px rgba(0,0,0,0.4)"}}>
              Fully Grown! You are amazing!
            </div>
          )}
        </div>
{/* FLOATING COOKIES */}
        {feedingCookies.map(c=>(
          <div key={c.id} style={{position:"fixed",left:c.x,top:c.y,zIndex:400,pointerEvents:"none",
            animation:"cookieFloat 1s ease-out forwards"}}>
            <FaceCookie size={32}/>
          </div>
        ))}

        {/* FEED BUTTON */}
        {!isMaster&&jarTreats>0&&(
          <button onClick={handleFeed} style={{
            width:"100%",padding:"1rem",marginBottom:"1rem",
            background:"linear-gradient(135deg,#fbbf24,#f97316)",
            border:"none",borderRadius:"999px",color:"white",
            fontFamily:"'Fredoka One',cursive",fontSize:"1.3rem",
            cursor:"pointer",
            boxShadow:"0 6px 24px rgba(251,191,36,0.55)",
            animation:"eF 2s ease-in-out infinite"}}>
            Feed {petName||"your turtle"}! ({jarTreats} treat{jarTreats!==1?"s":""} ready)
          </button>
        )}
        {/* TREAT JAR */}
        <div className="glass" style={{padding:"1.25rem",marginBottom:"1rem",
          animation:"fadeUp 0.7s ease-out"}}>
          <div style={{color:"white",fontFamily:"'Fredoka One',cursive",
            fontSize:"1.1rem",textAlign:"center",marginBottom:"0.75rem"}}>
            Feed your Sea Turtle Treats!
          </div>
          <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:"2rem"}}>
            <TreatJar treats={jarTreats} nextStage={nextStage}/>
            <div style={{textAlign:"center"}}>
              <div style={{color:"white",fontFamily:"'Fredoka One',cursive",fontSize:"2.5rem",lineHeight:1}}>
                {stageIdx+1}<span style={{fontSize:"1.2rem",opacity:0.6}}>/4</span>
              </div>
              <div style={{color:"rgba(255,255,255,0.6)",fontFamily:"Nunito,sans-serif",fontSize:"0.85rem"}}>
                stages done
              </div>
              <div style={{marginTop:"0.75rem",display:"flex",alignItems:"center",gap:"0.4rem",justifyContent:"center"}}>
                <FaceCookie size={22}/>
                <span style={{color:"rgba(255,255,255,0.6)",fontFamily:"Nunito,sans-serif",fontSize:"0.75rem"}}> = Yummy Treat!</span>
              </div>
            </div>
          </div>
        </div>

        {isMaster&&(
          <div style={{display:"flex",gap:"0.75rem",marginBottom:"1rem"}}>
            <button onClick={()=>{
              const newJar=jarTreats+1;
              setJarTreats(newJar);
              playSfx("treat");
            }} style={{
              flex:1,padding:"0.9rem",
              background:"linear-gradient(135deg,#10b981,#059669)",
              border:"none",borderRadius:"999px",color:"white",
              fontFamily:"'Fredoka One',cursive",fontSize:"1rem",
              cursor:"pointer",boxShadow:"0 6px 20px rgba(16,185,129,0.5)"}}>
              Add to Jar +1
            </button>
            <button onClick={handleFeed} disabled={jarTreats<=0} style={{
              flex:1,padding:"0.9rem",
              background:jarTreats>0?"linear-gradient(135deg,#f59e0b,#ef4444)":"rgba(255,255,255,0.1)",
              border:"none",borderRadius:"999px",color:"white",
              fontFamily:"'Fredoka One',cursive",fontSize:"1rem",
              cursor:jarTreats>0?"pointer":"not-allowed",
              boxShadow:jarTreats>0?"0 6px 20px rgba(245,158,11,0.5)":"none"}}>
              Feed Turtle
            </button>
          </div>
        )}

        {/* EARN */}
        <div className="glass" style={{padding:"1.25rem",marginBottom:"1rem",animation:"fadeUp 0.8s ease-out"}}>
          <div style={{color:"white",fontFamily:"'Fredoka One',cursive",
            fontSize:"1.4rem",marginBottom:"1rem",textAlign:"center"}}>
            Earn Treats!
          </div>
          <EarnButtons navigate={navigate} code={code??""} studentName={studentName??""}/>
        </div>

        {/* COLLECTION */}
        <div className="glass" style={{padding:"1.25rem",animation:"fadeUp 0.9s ease-out"}}>
          <div style={{color:"white",fontFamily:"'Fredoka One',cursive",
            fontSize:"1.4rem",marginBottom:"1rem",textAlign:"center"}}>
            Ocean Collection
          </div>
          <OceanCollection unlockedCount={1}/>
          <div style={{color:"rgba(255,255,255,0.4)",fontFamily:"Nunito,sans-serif",
            fontSize:"0.76rem",marginTop:"0.75rem",textAlign:"center"}}>
            More creatures unlocking soon!
          </div>
        </div>
      </div>

      {showSettings&&<div style={{position:"fixed",inset:0,zIndex:150}} onClick={()=>setShowSettings(false)}/>}
    </div>
  );
};

export default KidsWorld;
