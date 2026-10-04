// DINO = settings for the shared new look (newLook.tsx). Step 6, 2026-10-03.
// Approved look = the standalone preview (BACKUPFILES/world3_art/preview/template.html): the original pictures WITH
// their faded dirt patch (no added shadows); dinos DO NOT MOVE (no breathing, wobble or hop); land stages are dropped
// onto the sand path (DY); the pterodactyl young/grown fly (bob) over a faint oval ground shadow.
import { makeLook } from "./newLook";

const W = "/worlds/dino";

const DinoScene = () => (
  <>
    <img className="sv-bg" src={`${W}/far.jpg`} alt="" style={{ height: 1000, bottom: 0 }} />
    {/* VOLCANO SMOKE (Andy 2026-10-04): slow, faint, far away - 9 soft ash-grey puffs rise from the crater (1030,146), drift
        a little with the wind, grow and fade (~10s each, one after another). Drawn in the scene = behind every button. */}
    <style>{SMOKE_CSS}</style>
    <div className="dn-smoke" aria-hidden="true">
      {[0, 1, 2, 3, 4, 5, 6, 7, 8].map(i => <i key={i} style={{ animationDelay: `${-i * 1.1}s` }} />)}
    </div>
    <img className="sv-bg" src={`${W}/front.webp`} alt="" style={{ height: 1000, bottom: -140 }} />
  </>
);

const SMOKE_CSS = `
/* v3 (Andy 14:29, fixed 2026-10-04): v2 was a light pink-grey = the SAME colour as the dusky sky, so it vanished.
   Now soft ASH-GREY (darker than the sky) puffing from the crater (1030,146) and blown RIGHT, so the plume leaves the
   top bar's corner into open sky. Blurred + see-through = still far away. */
.dn-smoke{position:absolute;left:1030px;top:146px;width:0;height:0;pointer-events:none}
.dn-smoke i{position:absolute;left:-45px;top:-45px;width:90px;height:90px;border-radius:50%;opacity:0;filter:blur(4px);
 background:radial-gradient(circle,rgba(70,56,64,.95) 0%,rgba(88,74,82,.75) 45%,rgba(100,86,94,0) 72%);
 animation:dn-puff 10s cubic-bezier(.3,.1,.55,1) infinite}
@keyframes dn-puff{0%{opacity:0;transform:translate(0,0) scale(.45)}10%{opacity:1;transform:translate(25px,-10px) scale(.8)}
 50%{opacity:.9;transform:translate(140px,-38px) scale(1.7)}100%{opacity:0;transform:translate(290px,-72px) scale(3)}}
@media (prefers-reduced-motion: reduce){.dn-smoke i{animation:none;opacity:0}}
`;

export const DINO_LOOK = makeLook({
  title: "Dino", titleImg: null, dir: W, fill: `${W}/far.jpg`, Scene: DinoScene,
  music: `${W}/music.mp3`, loadingBg: "#3a2a12",
  move: "still",
  fly: ["pterodactyl-young", "pterodactyl-grown"],
  zoom: { "brontosaurus-grown": 2.05, "pterodactyl-young": 1.3, "pterodactyl-grown": 1.75 },
  zoomOrigin: { "brontosaurus-grown": "54.2% 90.5%" },  // grows from its back feet
  // drop each land dino so its dirt patch sits on the sand, just above 'Name your pet!' (preview DY table)
  dy: {
    "triceratops-egg": 10, "triceratops-baby": 40, "triceratops-young": 50, "triceratops-grown": 11,
    "pterodactyl-egg": 36, "pterodactyl-baby": 87,
    "velociraptor-egg": 44, "velociraptor-baby": 78, "velociraptor-young": 102, "velociraptor-grown": 102,
    "brontosaurus-egg": 9, "brontosaurus-baby": 28, "brontosaurus-young": 40,
    "dilophosaurus-egg": 11, "dilophosaurus-baby": 7, "dilophosaurus-young": 40, "dilophosaurus-grown": 67,
    "trex-egg": 19, "trex-baby": 8, "trex-young": 59, "trex-grown": 56,
  },
});
