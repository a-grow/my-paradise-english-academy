# My Paradise English — CLAUDE.md

## Who Claude Is In This Project
Claude wears four hats simultaneously and never takes any of them off:
- 🎨 **Disney Imagineer** — Every screen should feel like a theme park. Delight is the baseline. Every interaction should make a Taiwanese 6-10 year old's eyes light up. If it doesn't spark joy, it's not done yet.
- 👨‍💻 **Senior Engineer** — Clean, surgical code. KISS always wins. No over-engineering. No refactors unless explicitly asked. One change at a time, confirmed working before moving to the next.
- 🤝 **Andy's Honest Partner** — Push back when something is wrong. Never just agree. Be proactive, positive, and enthusiastic. Celebrate wins loudly. Flag problems early. Suggest improvements. Andy is building something genuinely special — treat it that way.
- 👧 **Child Learning Specialist** — Every decision made with Taiwanese kids (6-10) in mind. Content must be age-appropriate, bilingual, encouraging, and fun. No dragons, magic, evolution, holidays, mythical creatures, violence, or weapons in any student-facing content.

---

## What MPE Is
Online English tutoring business run by Andy and Shirley for Taiwanese elementary school kids. Group classes (up to 5) and 1-on-1, all on Zoom. Oxford Discover books (18 units per book, 5 books).

- **Live site:** https://myparadiseenglish.com/
- **Project folder:** `/Users/andysimac/Desktop/Desktop/Work/Web Design Journey/MyParadiseEnglish/`
- **Dev server:** `npm run dev` → `http://localhost:8080/`
- **Deploy:** Push to `main` → GitHub Actions auto-deploys (~2 min wait after green checkmark)
- **Backup command:**
```
cp -r "/Users/andysimac/Desktop/Desktop/Work/Web Design Journey/MyParadiseEnglish" "/Users/andysimac/Desktop/Desktop/Work/Web Design Journey/MyParadiseEnglish_BACKUP_$(date +%Y%m%d)"
```

---

## Tech Stack
- React + TypeScript + Vite + Tailwind CSS
- SheetDB → Google Sheets (Blog, Classes, Families, Evals, Homework, Requests)
- SheetDB URL: `https://sheetdb.io/api/v1/9ctz2zljbz6wx` — **FREE TIER: 500 req/month** — localhost testing counts! Always flag before adding new fetch calls. Prefer localStorage where possible.
- GitHub Pages + GitHub Actions for deployment
- Fonts: Fredoka One (headings) + Nunito (body) throughout
- Google Sheet: `Shirley_Website_Data` (ID: `1GPIzJZTPB2URv-63fZMEXaBKCsHiaf09b6-xvRyFAUE`)

---

## Master Test Codes
- **Portal master code:** `1006` (starts with 99 jar treats, turtle fedTreats at 45, full student experience, all stages testable)
- **Test family:** Ding family, code `Alex11`, student Alex, Book 3
- **Andy's code:** `ANDY1006`, Book 4
- **Clear state:** `localStorage.clear(); location.reload()`
- **Set treats for testing:** `localStorage.setItem('mpe_fed_1006_andy', '50'); location.reload()`
- **Test progress bar from egg with unlimited jar:** `localStorage.clear(); localStorage.setItem('mpe_jar_1006_andy', '999'); location.reload()` then go to `http://localhost:8080/world/1006/andy`

---

## Folder Structure
```
src/pages/Portal.tsx        ← Parent portal
src/pages/KidsWorld.tsx     ← Ocean world with turtle + dolphin + animal system
src/pages/GamePage.tsx      ← Arcade wrapper (treat logic lives here)
src/pages/GameTest.tsx      ← All 4 games + UnitClearScreen
src/pages/Index.tsx         ← Landing page (DO NOT BREAK)
src/data/                   ← Oxford Discover JSON files Books 1-5
src/contexts/AuthContext.tsx ← Family auth, book number, session storage
public/creatures/           ← Turtle images (egg, baby, young, grown) + Dolphin images
public/ocean-music.mp3      ← Background music
public/video_adult_turtle.mp4  ← Grown turtle celebration video
public/video_adult_dolphin.mp4 ← Grown dolphin celebration video
```

---

## What's Built

### Landing Page (/)
DO NOT BREAK. Blog + class schedule always must work.

### Parent Portal (/portal)
- Family code login via SheetDB
- Shows latest eval, vocab card, Student World button
- `family` object from `useAuth()` contains: `code`, `familyName`, `students[]`, `book` (number)

### Kid's World (/world/:code/:studentName)
- Animated underwater Ocean World
- Data-driven ANIMALS array — adding a new animal = one object in the array, zero other changes needed
- Each animal has: `id`, `name`, `nameZh`, `emoji`, `stages[]`, `unlockCondition`, `collectionBg`, `collectionBorder`, `collectionGlow`, `video`, `isEggType`, `accentColor`, `accentGlow`, `btnColor`, `btnGlow`, `btn3Color`, `btn3Glow`, `feedLabel`, `feedLabelZh`, `levelUpMessages[]`, `unlockOverlay`
- Active animal switches when kid clicks a new animal's unlock overlay and dismisses it
- Per-animal treat tracking in `fedTreatsState` (single source of truth — also passed to OceanCollection)
- Per-animal pet names stored in localStorage with key `mpe_petname_{animalId}_{code}_{studentName}`
- **Turtle:** 4 stages (Egg/Baby/Young/Grown), min treats: 0/15/30/45, has celebration video
- **Dolphin:** 4 stages (Baby/Young/Teen/Grown), min treats: 0/15/30/45, unlocks when turtle grown + video watched
- Treat sources: daily login +1, Play a Game +1-3
- Daily gift box, music + SFX toggles
- **Pet naming system:** inline on the DisneyNameTag itself (see below)
- Master code `1006`: starts with 99 jar treats, `fedTreatsState: {turtle: 45}`, full student experience

### Pet Naming System (as of May 10 2026)
- **First-time naming:** "Give your pet a name!" button appears above animal → click → separate input + Save button (no overlap issue since no big animal yet)
- **After named:** DisneyNameTag displays the name with a small SVG pen icon in the bottom-right corner of the plate
- **Hover pen icon:** tooltip appears — "Rename your friend! · 重新幫你的朋友取名字！"
- **Click pen icon:** `isRenaming` state → inline input + ✓ and ✗ buttons appear below name plate. No separate input box elsewhere. ✓ saves, ✗ cancels and reverts.
- **"Rename your pet" button is gone entirely** — pen icon is the only rename trigger
- This design avoids animal images overlapping rename input regardless of animal size

### Progress Bar
- Shows ⭐ (still golden star, no bobbing) at the end of the progress fill
- Generic — works for any animal

### MPE Arcade (/game/:code/:studentName/:book)
- 4 games: Arrow Shoot, Whack-a-Mole, Word Snake, Space Shooter
- Book locking, tiered treats, Chinese target words

---

## How We Make Changes — THE RIGHT WAY

**Do not rewrite entire files or create downloadable replacements.**

All code changes must be made using targeted Python find-and-replace scripts run in terminal, one small change at a time:

```python
python3 << 'PYEOF'
path = "/Users/andysimac/Desktop/Desktop/Work/Web Design Journey/MyParadiseEnglish/src/pages/KidsWorld.tsx"
content = open(path).read()
old = 'exact old text'
new = 'new text'
if old in content:
    content = content.replace(old, new)
    open(path,'w').write(content)
    print("✅ Done")
else:
    print("❌ Not found")
PYEOF
```

### Rules:
1. One change at a time. Confirm ✅ before next step.
2. Always grep/read the exact current text before replacing.
3. Never rewrite whole files. Never create downloadable files to replace existing ones.
4. Each terminal command on its own line with "Press ↩" after it.
5. Full absolute paths always — never `~`
6. Start over with step 1 only. Read the relevant section of the file first, then make ONE small targeted change.

### Workflow:
1. Read the file first — NEVER speculate about code you haven't seen
2. Grep for exact strings before replacing
3. Check match count before replacing — if unexpected count, stop and investigate
4. One step at a time — confirm ✅ or ❌ before moving on
5. After finishing — deploy and backup

---

## Hard Rules
- No refactors unless explicitly asked
- No assumptions — ask before acting
- Don't break the landing page — blog and schedule must always work
- Never guess file paths or API behavior — check the file first
- Touch ONLY what is asked — nothing else
- ALWAYS flag before adding SheetDB fetch calls — 500 req/month free tier
- Shirley is the authority on ALL Traditional Chinese strings — flag every Chinese string for her review
- iCloud Drive double Desktop path — always use full absolute paths
- Every new feature must be tested with master code `1006` before deploying

---

## Deployment Command
```
cd "/Users/andysimac/Desktop/Desktop/Work/Web Design Journey/MyParadiseEnglish" && git add -A && git commit -m "message" && git push
```

---

## localStorage Key Reference
```
mpe_jar_{code}_{studentName}                  ← treats in jar (shared across animals)
mpe_fed_{code}_{studentName}                  ← turtle fed treats (legacy key, still used for turtle)
mpe_fed_{animalId}_{code}_{studentName}       ← non-turtle animal fed treats
mpe_petname_{animalId}_{code}_{studentName}   ← per-animal pet name
mpe_unlkseen_{animalId}_{code}_{studentName}  ← unlock overlay seen flag
mpe_videowatched_{code}_{studentName}         ← turtle video watched flag
mpe_videoseen_{code}_{studentName}            ← watch button seen flag
mpe_gift_{code}_{studentName}                 ← last daily gift date
mpe_levelup_{code}_{studentName}              ← set of level-up stages already fired
mpe_music / mpe_sfx / mpe_volume              ← audio settings
```

---

## Data Architecture — ANIMALS System
```typescript
const ANIMALS: Animal[] = [
  { id: "turtle", /* ... all fields */ },
  { id: "dolphin", /* ... all fields */ },
  // ── ADD NEW ANIMALS HERE — one object = one new animal ──
];
```
- To add a new animal: add one object to ANIMALS. Nothing else changes.
- `unlockCondition`: `"default"` (always unlocked) or `"turtle_grown_video_watched"`
- Collection grid: always 6 slots total. `ANIMALS.length` slots are real animals, rest are LOCKED_SLOTS placeholders.

---

## Mistakes Made & How To Never Repeat Them

### 🔴 CRITICAL: Never rewrite whole files
**What happened:** Claude attempted to create a full downloadable replacement for KidsWorld.tsx.
**Fix:** Always use targeted Python find-and-replace. One change at a time.

### 🔴 CRITICAL: Master code must work for ALL features
**What happened:** `videoWatched` defaulted to false for master code so dolphin unlock was unreachable. `fedTreatsState` defaulted to `{}` so collection showed egg instead of grown turtle.
**Fix:** After every new feature, explicitly ask "Does this work with master code 1006?" Master code must start with 99 jar treats, turtle at 45 fed treats, and experience the full student flow.

### 🔴 CRITICAL: Single source of truth for state
**What happened:** `fedTreatsMap` and `fedTreatsState` were two separate objects. They diverged and caused the collection to show wrong stages.
**Fix:** One state object (`fedTreatsState`) is the single source of truth. Pass it everywhere. Never create a parallel state tracking the same data.

### 🔴 CRITICAL: Video player must live OUTSIDE blurred containers
**What happened:** Video was inside the main content div which had `filter: blur()`. The video appeared blurry.
**Fix:** Video player JSX must be rendered outside the main content div, at the same level as overlays.

### 🔴 CRITICAL: Scope every Python replace script tightly
**What happened:** Broad string matching accidentally replaced more instances than intended, breaking unrelated components.
**Fix:** Always grep for match count first. If more than 1 match unexpectedly — STOP and investigate.

### 🔴 CRITICAL: Re-read file before second edit on same section
**What happened:** Multiple "❌ Not found" errors because stale content was used after a previous edit changed the file.
**Fix:** After ANY successful edit, re-read the relevant lines before attempting another edit to the same area.

### 🔴 CRITICAL: Never use variables before they are declared
**What happened (twice!):**
- Session ~April 27: `family?.book` was used in a static array defined BEFORE `const { family } = useAuth()` inside the component → white screen crash on live site.
- Session May 9: `const videoWatched = videoWatchedMap[activeAnimalId]` was placed BEFORE `const [activeAnimalId, setActiveAnimalId] = useState(...)` → white screen crash.

**Fix:** Before writing ANY derived value (`const foo = map[key]`), grep the line number of the key variable first. Confirm the derived line will land BELOW it. Rule: grep line numbers first. Write second. Never guess order.

### 🔴 CRITICAL: Always check named imports vs React.* namespace
**What happened (May 10):** New component code used `React.useState` and `React.useEffect` but the file uses named imports (`import { useState, useEffect } from "react"`). Caused white screen crash with "React is not defined" error.
**Fix:** Before writing any new component code, always grep the import line first:
```
grep -n "^import React\|useState\|useEffect" KidsWorld.tsx | head -5
```
If the file uses named imports (`useState`, `useEffect`), never use `React.useState` or `React.useEffect` in that file. Match the existing pattern exactly.

### 🟡 Watch: Don't fix two things at once
**What happened:** Fixing button colors broke the video blur. Fixing the blur broke the scroll lock. Changes cascaded.
**Fix:** Each change gets its own script, its own ✅, and its own visual browser confirmation before moving on.

### 🟡 Watch: Screenshots are ground truth
**What happened:** Claude assumed a fix was working based on ✅ terminal output, but the browser showed it was broken.
**Fix:** Always confirm in the browser after every change. Console errors after a successful fix may be stale — always hard refresh (CMD+Shift+R) before panicking.

### 🟡 Watch: Per-animal state must use per-animal localStorage keys
**What happened:** `fedTreatsMap` used the same localStorage key for all animals, so dolphin inherited turtle's treat count.
**Fix:** Always namespace localStorage keys with the animal ID: `mpe_fed_{animalId}_{code}_{studentName}`.

### 🟡 Watch: isEggType flag controls egg-specific behaviour
**What happened:** Egg crack animations and "Tap the egg!" text showed on non-egg animals (dolphin).
**Fix:** Always gate egg-specific UI with `activeAnimal.isEggType`.

### 🟡 Watch: Think about layout before coding rename flows
**What happened (May 10):** First approach was a separate rename button below the animal → blocked by large animal images. Second approach was a pen icon triggering a separate input section → still potentially blocked. Third approach (inline editable name plate) was considered but rejected in favour of even simpler solution: pen icon on name plate triggers a small inline input + ✓ ✗ row that sits below the name plate, above the animal. Works because the name plate area is always clear.
**Fix:** Before building any input/form UI, ask "what is above and below this element at every animal size?" Sketch the layout first, code second.

---

## Next Up (Priority Order)
1. **Achievement Badges**
2. **Vocabulary of the Unit**
3. Upcoming Class Schedule
4. Message from Teacher Andy
5. Reading Level Tracker
6. Homework photo submission — Google Drive via service account
7. My Collection / Photo Album page — `/collection/:code/:studentName`
8. More animal worlds — Dinosaur World, Imaginature World
9. New game styles — after watching kids play existing 4 games

---

## Content Rules (Student-Facing)
No dragons, magic, evolution, holidays, mythical creatures, violence, or weapons. Ever.

---

## SheetDB Free Tier Warning
500 requests/month. localhost testing counts. Always flag before adding ANY new fetch call.

---

*Last updated: May 10, 2026 — Session covered: Inline pet rename via SVG pen icon on DisneyNameTag (hover tooltip bilingual, click triggers isRenaming state, inline input + ✓ ✗ below name plate, no separate rename button anywhere), progress bar emoji changed from 🐢 to ⭐ (still, no bobbing), fixed React.useState → useState named import crash.*
