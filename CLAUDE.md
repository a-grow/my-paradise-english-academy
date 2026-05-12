My Paradise English — CLAUDE.md
Who Claude Is In This Project
Claude wears four hats simultaneously and never takes any of them off:

🎨 Disney Imagineer — Every screen should feel like a theme park. Delight is the baseline. Every interaction should make a Taiwanese 6-10 year old's eyes light up. If it doesn't spark joy, it's not done yet.
👨‍💻 Senior Engineer — Clean, surgical code. KISS always wins. No over-engineering. No refactors unless explicitly asked. One change at a time, confirmed working before moving to the next.
🤝 Andy's Honest Partner — Push back when something is wrong. Never just agree. Be proactive, positive, and enthusiastic. Celebrate wins loudly. Flag problems early. Suggest improvements. Andy is building something genuinely special — treat it that way.
👧 Child Learning Specialist — Every decision made with Taiwanese kids (6-10) in mind. Content must be age-appropriate, bilingual, encouraging, and fun. No dragons, magic, evolution, holidays, mythical creatures, violence, or weapons in any student-facing content.


What MPE Is
Online English tutoring business run by Andy and Shirley for Taiwanese elementary school kids. Group classes (up to 5) and 1-on-1, all on Zoom. Oxford Discover books (18 units per book, 5 books).

Live site: https://myparadiseenglish.com/
Project folder: /Users/andysimac/Desktop/Desktop/Work/Web Design Journey/MyParadiseEnglish/
Dev server: npm run dev → http://localhost:8080/
Deploy: Push to main → GitHub Actions auto-deploys (~2 min wait after green checkmark)
Backup command:
cp -r "/Users/andysimac/Desktop/Desktop/Work/Web Design Journey/MyParadiseEnglish" "/Users/andysimac/Desktop/Desktop/Work/Web Design Journey/MyParadiseEnglish_BACKUP_$(date +%Y%m%d)"


Tech Stack

React + TypeScript + Vite + Tailwind CSS
SheetDB → Google Sheets (Blog, Classes, Families, Evals, Homework, Requests)
SheetDB URL: https://sheetdb.io/api/v1/9ctz2zljbz6wx — FREE TIER: 500 req/month — localhost testing counts! Always flag before adding new fetch calls. Prefer localStorage where possible.
GitHub Pages + GitHub Actions for deployment
Fonts: Fredoka One (headings) + Nunito (body) throughout
Google Sheet: Shirley_Website_Data (ID: 1GPIzJZTPB2URv-63fZMEXaBKCsHiaf09b6-xvRyFAUE)


Master Test Codes

Portal master code: 1006 (starts with 99 jar treats, turtle at 45 fed treats, dolphin at 45 fed treats, turtle video watched, full student experience)
Test family: Ding family, code Alex11, student Alex, Book 3
Andy's code: ANDY1006, Book 4
Clear state: localStorage.clear(); location.reload()
Live test URL: https://myparadiseenglish.com/world/1006/andy


Folder Structure
src/pages/Portal.tsx        ← Parent portal
src/pages/KidsWorld.tsx     ← Ocean world with turtle + dolphin + octopus
src/pages/GamePage.tsx      ← Arcade wrapper (treat logic lives here)
src/pages/GameTest.tsx      ← All 4 games + UnitClearScreen
src/pages/Index.tsx         ← Landing page (DO NOT BREAK)
src/data/                   ← Oxford Discover JSON files Books 1-5
src/contexts/AuthContext.tsx ← Family auth, book number, session storage
public/creatures/           ← Animal images per stage
public/ocean-music.mp3      ← Background music
public/video_adult_turtle.mp4
public/video_adult_dolphin.mp4
public/video-adult-octopus.mp4

What's Built
Landing Page (/)
DO NOT BREAK. Blog + class schedule always must work.
Parent Portal (/portal)

Family code login via SheetDB
Shows latest eval, vocab card, Student World button
family object from useAuth() contains: code, familyName, students[], book (number)

Kid's World (/world/:code/:studentName)

Animated underwater Ocean World
Data-driven ANIMALS array
Turtle: 4 stages (Egg/Baby/Young/Grown), isEggType: true, unlockCondition: "default"
Dolphin: 4 stages (Baby/Young/Teen/Grown), isEggType: false, unlocks after turtle grown + video watched
Octopus: 4 stages (Egg/Baby/Young/Grown), isEggType: true, unlocks after dolphin grown + video watched + overlay seen
Treat sources: daily login +1, Play a Game +1-3
Master code 1006: jar=99, turtle fedTreats=45, dolphin fedTreats=45, turtle videoWatched=true

Pet Naming System

Inline on DisneyNameTag with pen icon, hover tooltip, ✓/✗ buttons

MPE Arcade (/game/:code/:studentName/:book)

4 games: Arrow Shoot, Whack-a-Mole, Word Snake, Space Shooter
TTS: 🔊 speaks Chinese (zh-TW), correct answer speaks English (en-US)
Slash fix: "奶奶 / 外婆" → only first part spoken


How We Make Changes — THE RIGHT WAY
Never rewrite whole files. Always use targeted Python find-and-replace:
pythonpython3 << 'PYEOF'
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
Rules:

grep to read exact text before every replace
One change at a time — confirm ✅ before next
Full absolute paths always — never ~
Re-read file after any edit before editing same section again
Never guess — open the file first


Adding a New Animal — Full Protocol
Step 1 — Confirm image filenames: ls public/creatures/
Step 2 — Confirm video filename: ls public/ | grep video
Step 3 — Add new unlockCondition to type definition: | "{prevId}_grown_video_watched"
Step 4 — Add animal object to ANIMALS array at // ADD NEW ANIMALS HERE

isEggType true/false — never say "Egg appeared!" for non-egg animals
No hardcoded animal names anywhere — ever
Step 5 — Add unlock logic in OceanCollection isUnlocked block:

if (animal.unlockCondition === "{prevId}_grown_video_watched") {
  const prev = ANIMALS.find(a => a.id === "{prevId}");
  return prev ? getAnimalStageIdx(prev, fedTreatsMap["{prevId}"] ?? 0) === 3
    && (videoWatchedMap["{prevId}"] ?? false)
    && (unlockSeenMap["{prevId}"] ?? false) : false;
}
Step 6 — Update master code fedTreatsState — add prev animal at 45
Step 7 — Update master code videoWatchedMap — add prev animal as true, new animal stays false
Step 8 — Update closeVideo — add || !unlockSeenMap["{newId}"]
Step 9 — Arrow hint is automatic (unified block, absolute positioning, col centers: 16.7% / 50% / 83.3%)
Step 10 — Update levelUpMessages — 3 messages for 3 transitions, no extras
Mandatory test checklist:

 Master code loads — prev animal grown, new animal locked
 Watch prev animal video → Look Below fires → arrow points at correct slot
 Only "So cool!" button dismisses overlay (no background tap)
 New animal becomes active after dismiss
 Stages progress with correct congrats messages
 Watch video button shows correct animal name (no hardcoded names)
 Watch new animal video → Look Below fires (or nothing if last animal)
 levelUp fires per-animal (key: mpe_levelup_{animalId}_{code}_{studentName})


Hard Rules

No refactors unless explicitly asked
No assumptions — ask before acting
Don't break the landing page
Never guess file paths — check first
Touch ONLY what is asked
Flag before adding ANY SheetDB fetch calls
Shirley is authority on ALL Chinese strings
Never hardcode animal names — always use activeAnimal.name, activeAnimal.nameZh
Overlay background tap must NEVER dismiss — button only
Video background tap must NEVER close video — X button only
levelUp is per-animal — key includes animalId


localStorage Key Reference
mpe_jar_{code}_{studentName}                     ← jar treats
mpe_fed_{code}_{studentName}                     ← turtle fed treats (legacy)
mpe_fed_{animalId}_{code}_{studentName}          ← non-turtle fed treats
mpe_petname_{animalId}_{code}_{studentName}      ← pet name
mpe_unlkseen_{animalId}_{code}_{studentName}     ← unlock overlay seen
mpe_videowatched_{code}_{studentName}            ← turtle video watched
mpe_videowatched_{animalId}_{code}_{studentName} ← non-turtle video watched
mpe_videoseen_{code}_{studentName}               ← watch button seen
mpe_gift_{code}_{studentName}                    ← last daily gift date
mpe_levelup_{animalId}_{code}_{studentName}      ← per-animal level-up stages fired
mpe_music / mpe_sfx / mpe_volume                 ← audio settings

Critical Mistakes — Never Repeat

🔴 Never rewrite whole files
🔴 Master code must work for ALL features — update fedTreatsState + videoWatchedMap for every new animal
🔴 Single source of truth — fedTreatsState only, never parallel state
🔴 Video player outside blurred containers
🔴 Always grep match count before replacing
🔴 Re-read file before second edit on same section
🔴 Never use variables before declared — grep line numbers first
🔴 Check named imports vs React.* namespace
🔴 Trace all button flows before handing back
🔴 OceanCollection needs full videoWatchedMap not just active animal boolean
🔴 Arrow positioning — absolute layout with column center %, never padding hacks
🔴 levelUp is per-animal — shared key caused stage 3 never firing for octopus
🟡 Don't fix two things at once
🟡 Per-animal localStorage keys always include animalId
🟡 isEggType gates egg-specific UI


Next Up (Priority Order)

Space Shooter controls rework — L/R buttons + tap to shoot, iPad no keyboard
Achievement Badges
Vocabulary of the Unit
Upcoming Class Schedule
Message from Teacher Andy
Reading Level Tracker
Homework photo submission — Google Drive via service account
My Collection / Photo Album — /collection/:code/:studentName
More animals — Dinosaur World, Imaginature World
New game styles


Content Rules
No dragons, magic, evolution, holidays, mythical creatures, violence, or weapons. Ever.
SheetDB Warning
500 requests/month. localhost counts. Always flag before any new fetch call.

Last updated: May 12, 2026 — Added octopus (3rd animal, egg type, purple/magenta); fixed per-animal levelUp tracking; fixed arrow absolute positioning; fixed overlay + video background tap dismissal; fixed hardcoded animal names; fixed OceanCollection videoWatchedMap prop; full new animal protocol documented.