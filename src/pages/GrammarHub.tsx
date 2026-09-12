import { useParams, useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";

const F = "'Nunito',sans-serif";

// 12 grammar levels — locked list, easiest → hardest. English only for now.
const LEVELS = [
  { n: 1, topic: "Nouns & a/an", emoji: "🍎" },
  { n: 2, topic: "Plurals", emoji: "🐱" },
  { n: 3, topic: "Be-verbs (am/are/is)", emoji: "⭐" },
  { n: 4, topic: "Pronouns & this/that", emoji: "👉" },
  { n: 5, topic: "Possessives & Wh-Questions", emoji: "🔑" },
  { n: 6, topic: "There is/are, some/any", emoji: "🧺" },
  { n: 7, topic: "Adjectives & adverbs", emoji: "🌈" },
  { n: 8, topic: "Present tenses", emoji: "🏃" },
  { n: 9, topic: "Have/has, can, prepositions", emoji: "🎁" },
  { n: 10, topic: "Past", emoji: "🕰️" },
  { n: 11, topic: "Future", emoji: "🚀" },
  { n: 12, topic: "Advanced", emoji: "🏆" },
];

export default function GrammarHub() {
  const { code, studentName } = useParams();
  const navigate = useNavigate();
  const kidCode = (code || "").toUpperCase();
  const kidName = (studentName || "").toLowerCase();

  const [level, setLevel] = useState<number | null>(null);

  const selected = LEVELS.find((l) => l.n === level);

  // ----- background music (hub only, 40% volume, starts on first tap) -----
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [muted, setMuted] = useState(false);

  // one persistent audio element on document.body — survives screen swaps,
  // so music plays continuously across level -> game select.
  useEffect(() => {
    let a = document.getElementById("grammar-bgm") as HTMLAudioElement | null;
    if (!a) {
      a = document.createElement("audio");
      a.id = "grammar-bgm";
      a.src = "/grammar-music.mp3";
      a.loop = true;
      a.volume = 0.4;
      document.body.appendChild(a);
    }
    audioRef.current = a;
    const start = () => {
      if (!muted) a!.play().catch(() => {});
      window.removeEventListener("pointerdown", start);
    };
    window.addEventListener("pointerdown", start);
    // when leaving the hub entirely, stop + remove the music
    return () => {
      window.removeEventListener("pointerdown", start);
      const el = document.getElementById("grammar-bgm") as HTMLAudioElement | null;
      if (el) { el.pause(); el.remove(); }
    };
  }, [muted]);

  const toggleMute = () => {
    const a = audioRef.current;
    if (!a) return;
    if (muted) { a.play().catch(() => {}); setMuted(false); }
    else { a.pause(); setMuted(true); }
  };

  // fade the music out, then run a callback (used when launching a game)
  const fadeOutThen = (cb: () => void) => {
    const a = audioRef.current;
    if (!a) { cb(); return; }
    const step = a.volume / 12;
    const iv = setInterval(() => {
      a.volume = Math.max(0, a.volume - step);
      if (a.volume <= 0.02) { clearInterval(iv); a.pause(); cb(); }
    }, 40);
  };

  // ---------- SCREEN 2: Choose Your Game (castle background) ----------
  if (selected) {
    const playGame = (id: string) => {
      fadeOutThen(() => {
        if (id === "run") navigate(`/grammar-run/${kidCode}/${kidName}/${selected.n}`);
        if (id === "swim") navigate(`/grammar-swim/${kidCode}/${kidName}`);
      });
    };

    // all four games as full-size cards
    const cards = [
      {
        id: "run",
        title: "TEACHER ANDY,\nRUN!",
        img: "/grammar-run-btn.png",
        ready: true,
        titleFont: "'Bangers','Nunito',cursive",
        gradient: "linear-gradient(180deg,#fff7cc 0%,#fde047 35%,#f97316 80%,#c2410c 100%)",
        italic: false,
        titleSize: "clamp(2.3rem, 8vw, 4rem)",
      },
      {
        id: "swim",
        title: "Teacher Andy,\nSwim!",
        img: "/grammar-swim-btn.png",
        ready: true,
        titleFont: "'Luckiest Guy','Nunito',cursive",
        gradient: "linear-gradient(180deg,#e0f2fe 0%,#67e8f9 40%,#0ea5e9 80%,#0369a1 100%)",
        italic: false,
        titleSize: "clamp(1.7rem, 6vw, 2.9rem)",
      },
      { id: "order", title: "Sentence Order", ready: false, emoji: "🧩" },
      { id: "adaptive", title: "Brain Boost", ready: false, emoji: "🧠" },
    ];

    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          fontFamily: F,
          userSelect: "none",
          backgroundImage: "url('/grammar-bg.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          overflow: "auto",
        }}
      >
        {/* title fonts */}
        <link
          href="https://fonts.googleapis.com/css2?family=Bangers&family=Luckiest+Guy&display=swap"
          rel="stylesheet"
        />
        <div style={{ position: "absolute", inset: 0, background: "rgba(20,16,60,0.35)" }} />

        <button
          onClick={toggleMute}
          style={{
            position: "fixed",
            top: 14,
            right: 14,
            zIndex: 20,
            background: "rgba(255,255,255,0.1)",
            border: "1.5px solid rgba(255,255,255,0.22)",
            fontSize: "1.2rem",
            padding: "0.35rem 0.7rem",
            borderRadius: 999,
            cursor: "pointer",
          }}
        >
          {muted ? "🔇" : "🔊"}
        </button>

        <button
          onClick={() => setLevel(null)}
          style={{
            position: "fixed",
            top: 14,
            left: 14,
            zIndex: 20,
            background: "rgba(255,255,255,0.1)",
            border: "1.5px solid rgba(255,255,255,0.22)",
            color: "white",
            fontFamily: F,
            fontWeight: 800,
            fontSize: "0.95rem",
            padding: "0.4rem 1rem",
            borderRadius: 999,
            cursor: "pointer",
          }}
        >
          ← Back
        </button>

        <div
          style={{
            position: "relative",
            zIndex: 10,
            maxWidth: 640,
            margin: "0 auto",
            padding: "72px 16px 40px",
          }}
        >
          <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
            <div
              style={{
                fontFamily: F,
                fontWeight: 900,
                fontSize: "2rem",
                color: "white",
                textShadow: "0 2px 12px rgba(0,0,0,0.7), 0 0 30px rgba(253,224,71,0.5)",
              }}
            >
              Level {selected.n} – {selected.topic}
            </div>
            <div
              style={{
                fontFamily: F,
                fontWeight: 700,
                fontSize: "0.95rem",
                color: "rgba(255,255,255,0.85)",
                marginTop: 4,
                textShadow: "0 1px 6px rgba(0,0,0,0.8)",
              }}
            >
              Choose your game!
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>
            {cards.map((c) => (
              <button
                key={c.id}
                disabled={!c.ready}
                onClick={() => c.ready && playGame(c.id)}
                style={{
                  position: "relative",
                  padding: 0,
                  border: c.ready
                    ? "3px solid rgba(253,224,71,0.9)"
                    : "3px solid rgba(255,255,255,0.15)",
                  borderRadius: "1.25rem",
                  cursor: c.ready ? "pointer" : "not-allowed",
                  overflow: "hidden",
                  aspectRatio: "16 / 8",
                  backgroundImage: c.ready ? `url('${c.img}')` : "none",
                  backgroundColor: c.ready ? "transparent" : "rgba(30,25,70,0.55)",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  boxShadow: c.ready ? "0 8px 26px rgba(0,0,0,0.45)" : "none",
                  opacity: c.ready ? 1 : 0.5,
                }}
              >
                {c.ready ? (
                  <>
                    {/* gradient veil so title reads over the art */}
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        background:
                          "linear-gradient(90deg, rgba(0,0,0,0) 32%, rgba(0,0,0,0.5) 100%)",
                      }}
                    />
                    <div
                      style={{
                        position: "absolute",
                        right: "11%",
                        top: "50%",
                        transform: "translateY(-50%)",
                        textAlign: "right",
                        maxWidth: "62%",
                      }}
                    >
                      <span
                        style={{
                          fontFamily: c.titleFont,
                          fontSize: c.titleSize,
                          lineHeight: 1.02,
                          letterSpacing: "1px",
                          whiteSpace: "pre-line",
                          paddingRight: "0.35em",
                          boxSizing: "border-box",
                          fontStyle: c.italic ? "italic" : "normal",
                          display: "inline-block",
                          backgroundImage: c.gradient,
                          WebkitBackgroundClip: "text",
                          backgroundClip: "text",
                          WebkitTextFillColor: "transparent",
                          filter:
                            "drop-shadow(2px 2px 0 rgba(60,20,5,0.95)) drop-shadow(0 0 10px rgba(0,0,0,0.5))",
                        }}
                      >
                        {c.title}
                      </span>
                    </div>
                  </>
                ) : (
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <div style={{ fontSize: "2.6rem" }}>{c.emoji}</div>
                    <div
                      style={{
                        fontFamily: F,
                        fontWeight: 800,
                        fontSize: "1.15rem",
                        color: "white",
                        marginTop: 6,
                      }}
                    >
                      {c.title}
                    </div>
                    <div
                      style={{
                        fontFamily: F,
                        fontWeight: 700,
                        fontSize: "0.85rem",
                        color: "rgba(255,255,255,0.8)",
                        marginTop: 2,
                      }}
                    >
                      🔒 Coming Soon!
                    </div>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ---------- SCREEN 1: Choose Your Level ----------
  return (
    <div
      style={{
        minHeight: "100vh",
        fontFamily: F,
        userSelect: "none",
        backgroundImage: "url('/grammar-bg.png')",
        backgroundSize: "cover",
        backgroundPosition: "center top",
        backgroundAttachment: "fixed",
      }}
    >
      <div style={{ position: "fixed", inset: 0, background: "rgba(20,16,60,0.55)", pointerEvents: "none" }} />

      <button
        onClick={toggleMute}
        style={{
          position: "fixed",
          top: 14,
          right: 14,
          zIndex: 200,
          background: "rgba(255,255,255,0.1)",
          border: "1.5px solid rgba(255,255,255,0.22)",
          fontSize: "1.2rem",
          padding: "0.35rem 0.7rem",
          borderRadius: 999,
          cursor: "pointer",
        }}
      >
        {muted ? "🔇" : "🔊"}
      </button>
      <nav
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          background: "rgba(0,0,0,0.55)",
          backdropFilter: "blur(14px)",
          padding: "0.55rem 1rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        <button
          onClick={() => navigate(`/world/${kidCode}/${kidName}`)}
          style={{
            background: "rgba(255,255,255,0.1)",
            border: "1.5px solid rgba(255,255,255,0.22)",
            color: "white",
            fontFamily: F,
            fontWeight: 800,
            fontSize: "0.95rem",
            padding: "0.32rem 0.95rem",
            borderRadius: 999,
            cursor: "pointer",
          }}
        >
          ← Exit
        </button>
        <span
          style={{
            color: "white",
            fontFamily: F,
            fontWeight: 900,
            fontSize: "1.1rem",
            textShadow: "0 0 20px rgba(168,85,247,0.9)",
          }}
        >
          📖 Grammar
        </span>
        <div style={{ width: 72 }} />
      </nav>

      <div style={{ position: "relative", zIndex: 10, maxWidth: 560, margin: "0 auto", padding: "72px 16px 40px" }}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{ fontSize: "4.5rem", display: "inline-block" }}>📖</div>
          <div
            style={{
              fontFamily: F,
              fontWeight: 900,
              fontSize: "2rem",
              color: "white",
              textShadow: "0 2px 12px rgba(0,0,0,0.8), 0 0 30px rgba(168,85,247,0.8)",
              marginTop: "0.25rem",
            }}
          >
            Choose Your Level!
          </div>
          <div
            style={{
              fontFamily: F,
              fontWeight: 700,
              fontSize: "0.9rem",
              color: "rgba(255,255,255,0.8)",
              marginTop: "0.25rem",
              textShadow: "0 1px 6px rgba(0,0,0,0.8)",
            }}
          >
            Easy at the top, harder as you go
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
          {LEVELS.map((l) => (
            <button
              key={l.n}
              onClick={() => setLevel(l.n)}
              style={{
                padding: "1rem 1.25rem",
                background: "linear-gradient(135deg,#a855f7,#6d28d9)",
                border: "2px solid #a855f7",
                borderRadius: "1.5rem",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "1rem",
                boxShadow: "0 0 20px rgba(168,85,247,0.4),0 8px 24px rgba(0,0,0,0.3)",
              }}
            >
              <div style={{ fontSize: "2.3rem" }}>{l.emoji}</div>
              <div style={{ flex: 1, textAlign: "left" }}>
                <div
                  style={{
                    fontFamily: F,
                    fontWeight: 800,
                    fontSize: "0.98rem",
                    color: "white",
                  }}
                >
                  Level {l.n}
                </div>
                <div
                  style={{
                    fontFamily: F,
                    fontWeight: 700,
                    fontSize: "0.82rem",
                    color: "rgba(255,255,255,0.8)",
                    marginTop: 3,
                  }}
                >
                  {l.topic}
                </div>
              </div>
              <div style={{ fontSize: "1.4rem", color: "rgba(255,255,255,0.85)" }}>▶</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}