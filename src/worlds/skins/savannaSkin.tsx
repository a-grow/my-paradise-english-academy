// SAVANNA = World 3's settings for the shared new look (newLook.tsx).
// Step 6 (2026-10-03): the look itself moved to newLook.tsx unchanged; this file only says what is Savanna's own.
import { makeLook } from "./newLook";

const W = "/worlds/savanna";

const SavannaScene = () => (
  <>
    <img className="sv-bg" src={`${W}/far.jpg`} alt="" />
    <img className="sv-bg" src={`${W}/front.webp`} alt="" />
  </>
);

export const SAVANNA_SKIN = makeLook({
  title: "Savanna", titleImg: `${W}/title.webp`, dir: W, fill: `${W}/far.jpg`, Scene: SavannaScene,
  music: `${W}/music.mp3`, loadingBg: "#2d4a1c",
  move: "breathe",                 // animals stand on the ground and breathe; eggs wobble
});
