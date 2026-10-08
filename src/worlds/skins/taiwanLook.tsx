// TAIWAN = World 5's settings for the shared new look (newLook.tsx). 2026-10-08.
// Scene = Andy's Gemini art: far.jpg is 16:9 (1376x768) -> scaled to 1000 tall to cover the 1600x1000 box (sides crop a little);
// front.webp (1264x848, cut from magenta) = grass strip + side plants, scaled to the box width.
import { makeLook } from "./newLook";

const W = "/worlds/taiwan";

const TaiwanScene = () => (
  <>
    <img className="sv-bg" src={`${W}/far.jpg`} alt="" style={{ width: 1792, height: 1000, left: -96, bottom: 0 }} />
    <img className="sv-bg" src={`${W}/front.webp`} alt="" style={{ width: 1600, height: 1073, bottom: 0 }} />
  </>
);

export const TAIWAN_LOOK = makeLook({
  title: "Taiwan", titleImg: `${W}/title.webp`, dir: W, fill: `${W}/far.jpg`, Scene: TaiwanScene,   // Andy's Gemini title (2026-10-08, cut from magenta, 784 wide like Savanna)
  music: `${W}/music.mp3`, loadingBg: "#2f5a35",   // Andy 2026-10-08: moonlit-forest (pixabay), trimmed 1.45s start, 1.5s fade out, -22.5 LUFS, 128k; original BACKUPFILES/world3_art/music_originals
  move: "breathe",                 // animals stand on the grass and breathe; eggs wobble
  dy: { "macaque-grown": 30 },     // Andy 2026-10-08 14:32: monkey down so its tail sits just above 'Name your pet!'
});
