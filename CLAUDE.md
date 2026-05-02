# My Paradise English — CLAUDE.md

## What This Project Is
MyParadiseEnglish is an online English tutoring business run by Andy and Shirley for Taiwanese students. It has group classes (up to 5 kids) and 1-on-1 classes, all on Zoom. The site is a React + TypeScript + Vite + Tailwind app hosted on GitHub Pages, deployed via GitHub Actions.

**Live site:** https://myparadiseenglish.com/
**Project folder:** `~/Desktop/Work/Web Design Journey/MyParadiseEnglish`
**Dev server:** `npm run dev` → localhost:5173 (or 8080)
**Deploy:** Push to `main` → GitHub Actions auto-deploys to GitHub Pages
**Backup:** `cp -r MyParadiseEnglish MyParadiseEnglish_BACKUP_$(date +%Y%m%d)`

---

## Tech Stack
- React + TypeScript + Vite + Tailwind CSS
- SheetDB → Google Sheets (blog posts, class schedules, families, evals, homework, requests)
- SheetDB URL: `https://sheetdb.io/api/v1/9ctz2zljbz6wx`
- Google Sheet tabs: Blog, Classes, Families, Evals, Homework, Requests
- GitHub Pages + GitHub Actions for deployment
- Master portal code: `1006` (unlimited treats, all stages, testing only)

## What's Built
- Landing page (blog + class schedule — do NOT break this)
- Parent portal at `/portal` — family code login via SheetDB
- Kid's World at `/world/:code/:studentName`
- Ocean World with animated SVG background, pet turtle, 4 growth stages
- Daily gift box, music + SFX toggles, sad state with bilingual speech bubble
- Teacher eval tool (standalone HTML file)
- Arcade game hub at `/gametest` — 4 games (Arrow Shoot, Whack-a-Mole, Word Snake, Space Shooter) with Disney-style SVG characters, Press Start 2P font, Book/Unit/Game selection flow

## Oxford Discover Book Data
All 5 books extracted and saved as JSON files:
- `src/data/oxford-discover-book1.json` — 18 units
- `src/data/oxford-discover-book2.json` — 18 units
- `src/data/oxford-discover-book3.json` — 18 units
- `src/data/oxford-discover-book4.json` — 18 units
- `src/data/oxford-discover-book5.json` — 18 units

Each unit contains: unit number, topic, bigQuestion, vocabulary (words array), grammar (point, examples, rules, choices)

---

## Arcade Games — Current State (`src/pages/GameTest.tsx`)

### Flow
Book Select → Unit Select → Difficulty Select → Game Select → Play

### 4 Games
1. **Arrow Shoot** — Balloons float right to left, archer SVG follows mouse/arrow keys, spacebar or click shoots. Up/Down arrows move bow.
2. **Whack-a-Mole** — Underwater theme, SVG critters pop from holes, SVG hammer follows cursor, click to whack.
3. **Word Snake** — Forest theme with fireflies and SVG trees, eat letters in order, D-pad + arrow keys + mouse hover controls.
4. **Space Shooter** — Deep space, SVG rocket + SVG aliens, Left/Right arrows move ship (held = continuous), spacebar or click shoots.

### SVG Characters Built
- ArcherSVG — Disney-style archer with big eyes, bow, follows mouse Y
- BalloonSVG — cute face, wavy SVG bezier string, color matches vocab word
- CritterSVG — 4 color variants, big eyes, ears, gold halo on target word
- HammerSVG — wooden mallet follows cursor, rotates on click
- SnakeHeadSVG — cartoon face with eyes, tongue, nostrils
- RocketSVG — porthole face, fins, flickering flame, striped body
- AlienSVG — 6 color variants, antennae, big eyes, squiggly mouth
- TreeSVG — cartoon trees with fruits for snake background
- CloudSVG — fluffy clouds with faces for arrow game

### Font
**Press Start 2P** (Google Fonts) — injected via useEffect into document.head for reliability. Never use @import inside style tags. Nunito used for small body text only.

### Controls
- Arrow Shoot: ↑↓ move bow, SPACE/click shoots nearest target balloon. Held keys = continuous movement.
- Space Shooter: ←→ move ship (held = continuous via Set of held keys), SPACE/click shoots
- Word Snake: Arrow keys + D-pad buttons + mouse hover over grid steers snake
- Whack-a-Mole: Click/tap holes, SVG hammer cursor follows mouse

### Audio
Web Audio API via useAudio hook. Sounds: correct, wrong, pop, shoot, chomp, laser, win, tick.

---

## Still To Build — Priority Order

### Immediate (Part 2 gameplay juice)
- Held-key movement already done for Space Shooter, needs same for Arrow Shoot bow (currently done — verify)
- Projectile arrow that actually flies as animated SVG across screen
- Hammer slam animation with squish effect on correct hit
- Alien weaving/zigzag descent (not straight lines)
- Screen shake on wrong answer
- Score number pops/bounces when it increments
- Combo flash for 3 correct in a row

### Next
- **Difficulty selector screen** (Easy/Medium/Hard) between Unit and Game selection:
  - Easy: 60s timer, slow speed, hints shown, word visible on targets
  - Medium: 45s timer, medium speed, dimmer hints
  - Hard: 30s timer, fast speed, no hints, NO word shown — only emoji/picture (real learning!)
- **Unit-pair themed world reskins** — same 4 game mechanics, totally different visual world per unit pair:
  - Units 1-2: Cozy Treehouse (warm sunset, fireflies)
  - Units 3-4: Rainbow Reef (current default — keep)
  - Units 5-6: Enchanted Forest (glowing mushrooms, fog)
  - Units 7-8: Sky Kingdom (floating islands, cloud faces)
  - Units 9-10: Candy Kitchen (sugar rush colors)
  - Units 11-12: Sunflower Valley (golden hour, barn reds)
  - Units 13-14: Neon City vs Quiet Hills
  - Units 15-16: Concert Cosmos (space stage, spotlights)
  - Units 17-18: Jungle Canopy (lush greens, mist)
- **Story panel intro** — 3 illustrated comic panels before each unit, sets the scene, max 10 words
- **Pet creature appears in games** — turtle/octopus from KidsWorld cheers from corner during gameplay
- **Grammar boss rounds** — after vocab games cleared, dramatic boss round unlocks for grammar practice
- **Sticker collection** — every 5 correct answers drops a random sticker, stored in localStorage
- **Parent peek** — read-only view showing units played, high scores, struggling words

### Later
- Connect arcade to real student data (SheetDB Families tab assigns which book/unit per student)
- Replace old Wordwall GamePage.tsx with new arcade hub
- Add treat rewards to arcade games
- More units across all 5 books

---

## Design Philosophy — IMPORTANT
- **Disney/Pixar visual style** — NOT 8-bit retro. Fun, colorful, attention-grabbing, character-forward
- **Characters first** — every world has a mascot that REACTS to gameplay
- **3 background layers** — foreground detail, mid-ground action, distant atmosphere (parallax feel)
- **Juice on everything** — buttons squish, scores fly up, wrong answers shake, correct answers spray confetti
- **Reskin system** — same 4 game mechanics, completely different visual world per unit pair
- **Story before game** — emotional investment before gameplay starts
- **NO multiplayer — ever**
- **Bilingual throughout** — English + Traditional Chinese (Taiwan Mandarin, not pinyin)

---

## What's Built (Other)
- Landing page (blog + class schedule — do NOT break this)
- Parent portal at `/portal`
- Kid's World at `/world/:code/:studentName` with turtle pet, ocean world, treat jar, daily gift
- Octopus unlocks after turtle fully grown (images in `public/creatures/`)
- Teacher eval tool (standalone HTML — separate from this project)

## Still To Build (Other)
- World selection screen (for multiple creature worlds)
- Dinosaur World
- Imaginature World
- Homework photo uploads → Google Drive
- Teacher evals → parent portal
- PWA (installable on phone)

---

## How We Work — The Rules

### Before touching any code:
1. Read the relevant files first. Never speculate about code you haven't opened.
2. Write a plan in `tasks/todo.md` with checkable todo items.
3. Check in with Andy. Wait for a green light before writing a single line of code.

### While working:
4. Check off todo items as you complete them.
5. Give a plain-English explanation of every change made — no jargon walls.
6. Keep changes small and surgical. One thing at a time.
7. Touch ONLY what is asked. Nothing else.
8. If it can be done in parallel, do it in parallel.

### After finishing:
9. Add a Review section to `tasks/todo.md` summarizing what changed and why.
10. Run a quick security check: no sensitive info in the frontend, no exposed keys.

---

## Hard Rules
- **No refactors** unless explicitly asked.
- **No assumptions.** If unclear, ask before acting.
- **Don't break the landing page.**
- **Default to reading and recommending**, not implementing.
- **Never guess file paths or API behavior.** Open the file first.
- **All code must be clean, simple, and commit-ready.** KISS always wins.
- **No multiplayer. Ever.**
- **Disney visual style always** — not 8-bit, not flat, not generic AI aesthetic.

---

## Useful Prompts

**Continuing arcade games development:**
> Continuing MPE arcade games. See CLAUDE.md for full context. Current task: [describe what you need].

**Security check:**
> Check all the code you just wrote for security issues.

**Learning mode:**
> Explain what you just built like a senior engineer teaching a junior.