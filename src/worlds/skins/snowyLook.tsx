// SNOWY = World 4's settings for the shared new look (newLook.tsx). 2026-10-08.
// Scene = Andy's own art: far.jpg is 16:9 (1376x768) -> scaled to 1000 tall to cover the 1600x1000 box (sides crop a little);
// front.webp (1264x848) moved DOWN 80px (Andy 10-07: icebergs + water show behind the animal, feet land on the snowy clearing).
import { makeLook } from "./newLook";

const W = "/worlds/snowy";

const SnowyScene = () => (
  <>
    <img className="sv-bg" src={`${W}/far.jpg`} alt="" style={{ width: 1792, height: 1000, left: -96, bottom: 0 }} />
    <img className="sv-bg" src={`${W}/front.webp`} alt="" style={{ width: 1600, height: 1073, bottom: -80 }} />
  </>
);

export const SNOWY_LOOK = makeLook({
  title: "Snowy", titleImg: null, dir: W, fill: `${W}/far.jpg`, Scene: SnowyScene,   // titleImg: Andy's title art later
  music: `${W}/music.mp3`, loadingBg: "#2b4a73",   // Andy 2026-10-08: grand_project "a christmas tale" (trimmed, -22.5 LUFS; original in BACKUPFILES/world4_art/originals)
  move: "breathe",                 // animals stand on the snow and breathe; eggs wobble
});
