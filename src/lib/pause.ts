// GAME PAUSE (2026-10-15): while the "Turn your iPad sideways!" screen shows, games freeze (no hearts lost
// behind it). Vocab games read PAUSE.on in their loop; grammar games (iframes) get {type:"MPE_PAUSE", on}.
// Display only: nothing here saves anything.
export const PAUSE = { on: false };
