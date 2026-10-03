// DINO = settings for the shared new look (newLook.tsx). Step 6, 2026-10-03.
// Approved look = the standalone preview (BACKUPFILES/world3_art/preview/template.html): the original pictures WITH
// their faded dirt patch (no added shadows); dinos DO NOT MOVE (no breathing, wobble or hop); land stages are dropped
// onto the sand path (DY); the pterodactyl young/grown fly (bob) over a faint oval ground shadow.
import { makeLook } from "./newLook";

const W = "/worlds/dino";

const DinoScene = () => (
  <>
    <img className="sv-bg" src={`${W}/far.jpg`} alt="" style={{ height: 1000, bottom: 0 }} />
    <img className="sv-bg" src={`${W}/front.webp`} alt="" style={{ height: 1000, bottom: -140 }} />
  </>
);

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
