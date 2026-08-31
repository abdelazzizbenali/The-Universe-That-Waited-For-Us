/* ============================================================
   THE UNIVERSE THAT WAITED FOR US — Production Blueprint Data
   Canonical content model. Every memory maps to gameplay.
   ============================================================ */

export type Segment = {
  id: string;
  title: string;
  memories: number[];
  objective: string;
  mechanics: string[];
  companion: string;
  eyeFx: string;
  narration: string[];
};

export type Chapter = {
  id: string;
  index: string;
  title: string;
  memorySpan: string;
  purpose: string;
  world: string;
  interactables: string[];
  visual: string;
  audio: string;
  camera: string;
  color: string;
  constellation: string;
  climax: string;
  transition: string;
  segments: Segment[];
};

export const METADATA = {
  title: "THE UNIVERSE THAT WAITED FOR US",
  subtitle: "Two souls. Two colors. One universe created between them.",
  stack: ["TypeScript", "Vite", "Phaser 4.x", "Supabase", "Web Audio"],
  target: "iPhone-class Safari · landscape · 60fps",
  structure: "Prologue · 8 Chapters · Finale — 32 playable segments, ~3.5–5h",
  doc: "Production Blueprint v1.0",
};

export const PILLARS = [
  {
    n: "01",
    title: "Memory must become gameplay",
    body: "No memory is ever delivered as a paragraph. Every real moment is rebuilt as a place you walk through, a mechanic you perform, or an atmosphere you feel. The player should think: I am walking through our story.",
  },
  {
    n: "02",
    title: "Canon is sacred",
    body: "Real-life material supplied is treated as canonical. No invented real-life events. No invented quoted dialogue. Where exact historical wording is unknown, the game uses narration, atmosphere and symbolism — never fabricated quotation. A canon linter in CI enforces this.",
  },
  {
    n: "03",
    title: "The colors are the story",
    body: "Blue and Hazel begin fully separate and earn every stage of overlap. OUR COLOR appears only when the story has created it. The original eye colors never disappear: two people remained themselves and created something that did not exist before them.",
  },
  {
    n: "04",
    title: "The universe is a character",
    body: "Stars, flowers, birds, spirits and animals form one global living system that wakes as the relationship deepens. The player gradually understands: the universe was waiting for these two souls to find one another.",
  },
  {
    n: "05",
    title: "Small things carry the weight",
    body: "A seat. A signal. A written thank-you. A bottle of water. A yellow light. Love was never one huge moment — it was every little moment that kept choosing the other. Small memories are never compressed or cut.",
  },
  {
    n: "06",
    title: "Never rush an emotional moment",
    body: "Hand-holds are held. Goodbyes are quiet. After the project is finished, the game does not advance until she has rested her head on his hand. Pacing is a feature, protected by design rules, not by accident.",
  },
];

/* The master emotional arc (Part VII), compressed to its 29 beats */
export const ARC = [
  "She was tired", "He noticed her", "She noticed him", "He made room for her",
  "Small shared moments", "The library", "Waiting for each other", "The world began watching",
  "They chose each other anyway", "She felt safe", "He felt protective", "She cared for him too",
  "Serious love, spoken about seriously", "The first \"I love you\"", "His vulnerability, witnessed",
  "Distance", "Ordinary life, together", "Mutual support", "Small gestures became precious",
  "Flowers became symbols", "University ended", "Love continued", "The universe remembers",
  "She enters the final world", "The universe recognizes her", "The two souls reunite",
  "OUR COLOR completes", "She leaves a wish for the future", "The universe stays open forever",
];

export const CHAPTERS: Chapter[] = [
  {
    id: "prologue",
    index: "00",
    title: "The World Before You",
    memorySpan: "Atmospheric prelude",
    purpose: "Teach movement and presence. Establish a universe that is beautiful but incomplete — stars too few, flowers closed, birds distant. The player should not yet know what the world is waiting for.",
    world: "A night meadow beneath a hill. Cold palette, sparse sky, muted ambience, hidden spirits asleep in the dark.",
    interactables: ["A single closed flower — interacting yields only: 'Not yet.'"],
    visual: "Deep indigo ground fog, low aliveness score (8/100), desaturated cyan-mint palette, long soft shadows from a low moon.",
    audio: "Wind bed, distant sparse birds, single piano notes with long reverb tail. No melody yet — melody has not been earned.",
    camera: "Opens on sky, slow 6s drift down to the hill. Gentle follow with wide deadzone afterwards.",
    color: "Stage 0 — Hazel soul only, dimmed. A fixed blue point of light sits unreachable on the horizon.",
    constellation: "The sky-map UI is introduced — empty. One star wakes when she reaches the hilltop.",
    climax: "She reaches the hilltop. One star pulses awake. Title card fades in over the sky.",
    transition: "The star brightens until it whites out the screen → campus morning.",
    segments: [
      {
        id: "S0",
        title: "Prologue — The Hill",
        memories: [],
        objective: "Walk to the top of the hill. Nothing else is asked of you.",
        mechanics: ["Movement (stick / WASD)", "Camera follow", "First interaction (the flower that says 'Not yet')"],
        companion: "None. A distant blue light on the horizon — too far to reach.",
        eyeFx: "Hazel aura at 40% intensity. No blue reflection.",
        narration: ["Before there was an us, the sky was mostly quiet.", "The stars were waiting too."],
      },
    ],
  },
  {
    id: "ch1",
    index: "01",
    title: "Before It Had a Name",
    memorySpan: "M1 – M5",
    purpose: "The beginning of the school year. Looks before words, a saved seat, a crowded bus and a written thank-you, a taxi, and the library where strangers stopped feeling like strangers.",
    world: "Dreamy campus quad → school bus interior → crowded passenger bus → golden taxi road → the library (first major explorable world).",
    interactables: ["Bus seat (reserve / take)", "Phone (the written thank-you)", "Book", "Table", "Chair", "Window"],
    visual: "Muted morning light that warms measurably each segment. Her immediate atmosphere starts desaturated while the world around her stays faintly alive.",
    audio: "Campus ambience, bus engine beds (two distinct loops), crowd murmur, library hush + page texture + dust-quiet. First airy piano motif enters in the library.",
    camera: "Focus-pull system introduced: THE LOOK softens background, narrows depth of field, nudges framing toward the pair.",
    color: "Stage 0 → 2. First tiny blue reflection appears inside her hazel aura during S1. Subtle overlap by S5.",
    constellation: "+5 stars: the look, the saved seat, the thank-you, the taxi walk, the library table.",
    climax: "First library conversation. No dramatic confession — recognition. 'This was where strangers slowly stopped feeling like strangers.'",
    transition: "Library window light stretches into evening → the watching world.",
    segments: [
      {
        id: "S1",
        title: "First Noticing",
        memories: [1],
        objective: "Cross the quad. When you notice him, keep noticing (hold gaze toward the blue soul ~1.2s).",
        mechanics: ["THE LOOK — gaze hold triggers focus pull, ambience ducks, hazel aura brightens, first blue reflection appears. Then he looks back."],
        companion: "Distant → Aware. Turns his head only after she has looked long enough. No approach yet.",
        eyeFx: "Hazel +1 blue spark (Stage 1 begins).",
        narration: ["First, there were only looks.", "Enough to make two ordinary days feel less ordinary."],
      },
      {
        id: "S2",
        title: "The Saved Seat",
        memories: [2],
        objective: "Board the school bus. A seat beside him is softly lit — walk the aisle and take it.",
        mechanics: ["MAKE ROOM (passive form) — the space already exists; the gameplay is her choosing it. Sitting triggers the settle: sound softens, camera rests, bus motion calms."],
        companion: "Follows with his eyes; saves the seat via scripted beat before she boards. Slightly nervous idle animation.",
        eyeFx: "Blue and Hazel glows begin reacting to proximity (breathing sync).",
        narration: ["He was already making space for her before either of them knew what that space would become."],
      },
      {
        id: "S3",
        title: "The Missed Bus, The Written Thank-You",
        memories: [3],
        objective: "The passenger bus is packed. Navigate the crowd toward the seat he signals to you.",
        mechanics: ["MAKE ROOM (active form) — soft-collision crowd navigation; his subtle blue glint signals the path. Radius of each passenger is 'soft' — crowd yields gently, never hostile."],
        companion: "Sits ahead, holds the seat, signals discreetly so others won't notice.",
        eyeFx: "On sitting: crowd sound fades, camera closes to two-shot, hazel light warms one full step.",
        narration: ["She was too shy to say it out loud.", "So the phone said it for her: Thank you."],
      },
      {
        id: "S4",
        title: "Taxi / Side by Side",
        memories: [4],
        objective: "Accept the taxi → cinematic → walk to the library. Notice something has changed.",
        mechanics: ["Cinematic transition (window-light streaks, no driving sim). On foot, the companion permanently upgrades: from following behind → walking beside."],
        companion: "State change: FOLLOW_BEHIND → BESIDE. Path offsets now align shoulders, gait syncs to player speed.",
        eyeFx: "Auras now overlap while walking; micro-blend shimmers at the seam.",
        narration: ["From that day on, they did not walk one behind the other.", "They walked beside."],
      },
      {
        id: "S5",
        title: "The Library of First Words",
        memories: [5],
        objective: "Explore the library. Find the book, the table, the chair, the window — then sit with him.",
        mechanics: ["Memory interactables (4 one-line fragments, no paragraph dumps)", "Sit-together finale: first real conversation rendered as warmth, murmur and narration — no invented quoted dialogue."],
        companion: "Already seated; tracks her movement across the room with gentle gaze.",
        eyeFx: "Stage 2 — recognizable reflections embedded in both auras.",
        narration: ["This was where strangers slowly stopped feeling like strangers.", "After that, the end of classes became something to wait for."],
      },
    ],
  },
  {
    id: "ch2",
    index: "02",
    title: "The Watching World",
    memorySpan: "M6 – M9",
    purpose: "Attention becomes atmosphere. An Instagram message asks for invisibility; he answers that love shouldn't live by other people's eyes. Then safety: a shoulder on a crowded bus, a saved morning seat, and a goodbye that reveals how large his presence had become.",
    world: "A symbolic corridor of silhouettes and glances → standing-room school bus → morning bus micro-scene → the stop where he gets off first.",
    interactables: ["The phone (message UI)", "Seat prompt", "Bus pole / standing spot", "Window"],
    visual: "Environmental eyes and whisper-particles that fade as conviction grows. No villains rendered — pressure, not evil. Warmer pockets of light exist only inside the safe radius.",
    audio: "Layered murmurs that duck in real time as the pair walks through them; heartbeat-adjacent low pulse in S7; near-silence for S9.",
    camera: "S6 uses lateral tracking through silhouettes. S9: the camera stays with her — it does not follow him off the bus.",
    color: "Stage 2 → 3 — first recognizable shared tint in the overlap seam; strengthened inside the safe radius.",
    constellation: "+4 stars including 'the shoulder' — a permanent Safe Radius node.",
    climax: "She rests her head on his shoulder for the entire journey. The game holds the shot and does nothing else. It is enough.",
    transition: "The bus window light dissolves upward into a night sky of talking stars.",
    segments: [
      {
        id: "S6",
        title: "The Message / The Watching World",
        memories: [6],
        objective: "Walk the corridor together to the far light, despite the watching.",
        mechanics: ["CONVICTION WALK — the pair advances; silhouettes, glances and whispers fade proportionally to distance travelled together. Stopping lets the noise creep back."],
        companion: "Locks pace at her side; if she hesitates, he waits — never pulls.",
        eyeFx: "The overlap tint (Stage 3) first becomes identifiable here, visible each time a silhouette dissolves.",
        narration: ["The world could look.", "It still did not get to decide."],
      },
      {
        id: "S7",
        title: "The Shoulder (Safe Radius)",
        memories: [7],
        objective: "Stay within his safe radius for the journey. Then — when the world has gone soft — rest.",
        mechanics: ["SAFE RADIUS — inside: warmed color grade, softened audio, stabilized aura. Outside: louder crowd, colder grade, visual pressure. Mid-journey prompt: 'Rest' → 8s unbroken head-on-shoulder hold."],
        companion: "Anchors his body position between her and the crowd (scripted shielding posture from the real memory).",
        eyeFx: "Inside the radius, both auras slow their breathing and sync phase.",
        narration: ["She didn't need the whole world to disappear.", "She only needed to know he was there."],
      },
      {
        id: "S8",
        title: "The Morning Seat",
        memories: [8],
        objective: "A tiny scene: notice what is about to happen, and make room beside you.",
        mechanics: ["Single-context interaction — scoot to free the seat as he crosses the bus. Length: ~90 seconds. Her reaction is the reward (no text)."],
        companion: "Gives up his own seat and crosses the bus — a scripted beat the player witnesses and completes.",
        eyeFx: "Joy sparkle: brief gold-fleck burst inside the hazel aura.",
        narration: ["Some choreography is improvised the moment it's needed."],
      },
      {
        id: "S9",
        title: "The Goodbye",
        memories: [9],
        objective: "Let him leave. Watch the bus continue without him.",
        mechanics: ["No objective input — the only mechanic is staying. Player remains seated; camera remains with her as the bus moves on in quiet."],
        companion: "Exits. His light shrinks through the window and is gone.",
        eyeFx: "A single light-tear particle falls; the hazel aura dims then steadies — love measured by absence.",
        narration: ["Sometimes the size of a goodbye reveals the size of the presence that came before it."],
      },
    ],
  },
  {
    id: "ch3",
    index: "03",
    title: "Serious Love",
    memorySpan: "M10 – M12",
    purpose: "Before 'we' was official: jealousy, affection, and serious conversations about what makes relationships last — about marriage. Then the hinge of the whole story: December 15, 2025. Then the first act of witnessed vulnerability: his eyes.",
    world: "A night-walk of floating topic-lights → a winter courtyard outside of time → VISION WORLD (a starfield path rendered through his eyes).",
    interactables: ["Topic lights (trust · jealousy · future · marriage)", "Proximity threshold", "The star-path anchors"],
    visual: "S11 freezes the world: slow-falling light, held breath, date typography. S12 renders controlled blur, reduced far-field clarity and light sensitivity — tasteful, never broken or ugly.",
    audio: "S11: full mix fades to two instruments and air. S12: spacious atmospheric sound; her proximity audibly 'focuses' a soft tonal center.",
    camera: "S11 — a slow orbit that stops when the player stops. S12 — camera gently drifts unless near her (she steadies it).",
    color: "Stage 3 → 5, the first major jump: OUR COLOR unmistakably blooms at the mutual 'I love you' on 15.12.2025.",
    constellation: "+3 stars. The first 'I love you' star becomes the map's gravitational center; all later constellations route near it.",
    climax: "15.12.2025 — the two souls face each other, ambient world fades, Blue and Hazel intensify, OUR COLOR appears clearly for the first time, and the words arrive from each side: I love you.",
    transition: "The OUR COLOR bloom collapses into a single thread of light stretched across a winter map.",
    segments: [
      {
        id: "S10",
        title: "What We Talked About",
        memories: [10],
        objective: "Walk the night path and visit each topic-light. Move slowly — the chapter enforces a reflective gait.",
        mechanics: ["PACE-LOCKED WALK — the topic lights (trust, jealousy, future, marriage) each trigger two lines of narration. No quiz. The seriousness is carried by weight of attention, not gamified."],
        companion: "Walks slightly closer than usual; conversation-distance is intentionally intimate.",
        eyeFx: "Reflections deepen fractionally per topic visited (Stage 4 pre-loading).",
        narration: ["Before it was official, it was already being taken seriously."],
      },
      {
        id: "S11",
        title: "15.12.2025",
        memories: [11],
        objective: "Approach him. The world will do the rest.",
        mechanics: ["THRESHOLD — a proximity ring appears; crossing it triggers the milestone: full ambient fade, date card 15.12.2025, dual-facing two-shot, the words from each side. Input is only the approach; the moment itself is protected from interruption."],
        companion: "Mirrors her approach step-for-step, closing distance symmetrically.",
        eyeFx: "THE FIRST BLOOM — Blue and Hazel intensify, overlap, and OUR COLOR becomes unmistakable (Stage 5). Base hues remain intact around it.",
        narration: ["December 15, 2025.", "I love you. — from each side."],
      },
      {
        id: "S12",
        title: "Vision World",
        memories: [12],
        objective: "Cross the starfield path together. Let her proximity show you what steady feels like.",
        mechanics: ["VISION SYSTEM — controlled blur, far-star decay, light sensitivity. Her aura is an anchor: inside it, clarity returns. Goal is traversal together, not correction. She does not cure; she stays."],
        companion: "Chooses paths that keep her aura overlapping his; slows when strain rises; stops entirely at the overlook for the promise beat.",
        eyeFx: "Hazel aura becomes a literal lens of clarity in the world — care rendered as optics.",
        narration: ["She could not change everything his eyes experienced.", "She could make sure he would never face it alone."],
      },
    ],
  },
  {
    id: "ch4",
    index: "04",
    title: "Distance and Light",
    memorySpan: "M13 – M16",
    purpose: "Winter break in Constantine — proximity proven independent of geography. The first video ever captured. Ordinary days, exam-tired and happy, in a world that kept changing buses.",
    world: "A split world joined by one glowing thread → golden-hour school bus (REC) → the library during exams → a bus-route montage.",
    interactables: ["Thread motes (shared moments)", "Record button", "Books / desk lamp", "Route signs"],
    visual: "Split composition: her side in gold dusk, his in blue night; the thread is always drawn, in every shot. Montage deliberately desaturates, then restores warmth on arrival.",
    audio: "Two ambient beds (one per side) crossfaded by thread motes. REC segment adds tape-adjacent flutter. Late-night segment: keyboard quiet + hush.",
    camera: "S13 renders both sides simultaneously; zoom relaxes to show the thread as one continuous line.",
    color: "Stage 5 holds. The thread itself renders in early OUR COLOR — the first environment object to wear it.",
    constellation: "+4 stars including the Memory Frame (video) node.",
    climax: "The first video: red dot, moving bus, close framing, warm light — 8 seconds that become a permanent collectible.",
    transition: "Montage headlights converge into the near-empty bus of dusk.",
    segments: [
      {
        id: "S13",
        title: "The Constantine Thread",
        memories: [13],
        objective: "Live a few days apart. Send small moments along the thread.",
        mechanics: ["THREAD WALK — collect 'shared moment' motes on her side; each one visibly travels the thread to his side and lights something there. Distance is shown and dismissed."],
        companion: "Present on the far side — receives each mote with a small light reaction.",
        eyeFx: "The thread pulses in OUR COLOR whenever a mote crosses.",
        narration: ["Distance changed the map.", "It did not change the direction."],
      },
      {
        id: "S14",
        title: "The First Video",
        memories: [14],
        objective: "Sit close. Frame the two of you. Hold the record.",
        mechanics: ["RECORD — photo-mode variant with red dot, 8s window, moving-bus parallax, warm light ramp. Output stored as Memory Frame #1 in the gallery."],
        companion: "Leans in at the right second; au naturel framing rewards patience, not precision.",
        eyeFx: "For the recorded 8s, seam blend is visible in the viewfinder's corner as living light.",
        narration: ["The first memory they ever kept on video."],
      },
      {
        id: "S15",
        title: "Quiet Days / The World Kept Changing",
        memories: [15, 16],
        objective: "Study, rest, watch each other. Then survive the montage of changing buses — and keep talking until sleep.",
        mechanics: ["PEACEFUL CHAPTER — sit, slow-look, page-turn micro-rhythm. Then a soft montage: crowds, waits, fatigue — no fail state, endurance expressed through palette and sound, relieved on arrival."],
        companion: "Studies opposite; the LOOK mechanic is available at any quiet moment — and always acknowledged.",
        eyeFx: "Undisturbed Stage 5 — stability itself is the statement.",
        narration: ["Not every beautiful memory needs something extraordinary to happen.", "Sometimes being there was enough.", "The world kept changing. They kept finding each other."],
      },
    ],
  },
  {
    id: "ch5",
    index: "05",
    title: "Give Me Your Hand",
    memorySpan: "M17 – M19",
    purpose: "The signature chapter. The first time he asked for her hand and a private universe opened inside an ordinary bus. Then the 16:00 bus missed, the long wait to 17:30, and the yellow light she remembered to protect him from.",
    world: "A near-empty bus at dusk → the bus stop across two hours → a night bus with sweeping amber glare.",
    interactables: ["His offered hand", "The stop clock (16:10 → 17:30)", "Stars / leaves / birds (waiting comforts)", "Glare zones"],
    visual: "S17 executes the private-universe effect: bus melts away, stars appear inside the cabin, letterbox closes. S19: volumetric yellow cones the player must respect.",
    audio: "S17 does the full duck: music near-silent → breathing → soft heartbeat. S19: strain has an audible shimmer; averting gaze removes it.",
    camera: "S17: slow push-in that ends on joined hands, then holds. S19: view direction is player-controlled and meaningful.",
    color: "Stage 5 → 6 — OUR COLOR begins affecting environments: the S17 starlight inside the bus is rendered in it.",
    constellation: "+3 stars. The hand-hold star gains a special property: replayable forever from the gallery.",
    climax: "Hand contact. HUD gone. Bus gone. Breathing. Heartbeat. 'The whole world kept moving. But for a little while, nothing mattered except this hand.'",
    transition: "Heartbeats decelerate into the tick of a bus-stop clock.",
    segments: [
      {
        id: "S16",
        title: "Give Me Your Hand",
        memories: [17],
        objective: "He asks: give me your hand. Move yours to his, at your own speed.",
        mechanics: ["HAND SYSTEM (first use) — OFFER → REACH (player drives the final distance, touch-drag or held key) → CONTACT → HOLD. Contact executes: HUD fade, world fade, stars inside the bus, breath + heartbeat. No timer. Permanently replayable."],
        companion: "Offers his hand and waits without impatience — the scene cannot complete without her movement.",
        eyeFx: "Contact: full seam-blend surge; OUR COLOR radiates through the cabin starlight.",
        narration: ["The whole world kept moving.", "But for a little while, nothing mattered except this hand."],
      },
      {
        id: "S17",
        title: "The 17:30 Wait",
        memories: [18],
        objective: "Missed the 16:00. Wait, together, until the 17:30 arrives — and keep the fear small.",
        mechanics: ["WAIT SYSTEM — the clock card ticks 16:10 · 16:30 · 17:00 · 17:20 · 17:30. Optional micro-comforts (spotting stars, leaves, birds, quiet exchanges) lower her worry meter, which spikes at 17:20. Reassurance is playable, not decorative."],
        companion: "Provides reassurances as contextual interactions; his presence alone halves the worry creep rate.",
        eyeFx: "Worry desaturates; each comfort restores warmth — palette as vitals.",
        narration: ["The bus took its time.", "So they gave the time back to each other."],
      },
      {
        id: "S18",
        title: "The Yellow Light",
        memories: [19],
        objective: "The driver switches on the small yellow lights. Do not look into them. She will help you remember.",
        mechanics: ["VISION CHALLENGE — glare cones sweep the cabin; staring raises a strain meter (distortion, clarity loss); averting gaze restores clarity. Her warning whisper and her shading hand are active assistance — care, implemented."],
        companion: "Remembers what the yellow light does to his eyes (canon) and intervenes when strain crosses 70%.",
        eyeFx: "Her aura casts a literal shadow over the glare when she shields him.",
        narration: ["She remembered the light that hurt him.", "Memory, too, can be protection."],
      },
    ],
  },
  {
    id: "ch6",
    index: "06",
    title: "The Little Things",
    memorySpan: "M20 – M25",
    purpose: "The chapter where small gestures are given full size. Her project on his computer and a head resting on his hand. Hand-holding, now natural. The camera she helped him reach. The way she notices when he is not well. Color Hunting. A bottle of water that was never just water.",
    world: "The nearly empty library (co-op desk) → another crowded bus → a photo-reveal overlay on familiar worlds → a meadow for the color hunt → a single seat with a bottle on it.",
    interactables: ["Project components (assemble)", "Hand (one-tap now)", "Camera viewfinder", "Blue & green fragments", "The bottle"],
    visual: "Warm desk-lamp circles, viewfinder frames, fragment sparks in blue and green. S23 renders her joy as a full-screen (brief) bloom of both colors merging.",
    audio: "Lo-fi assembling clicks; camera shutter and film-advance; the merge chord in S23 is the OUR COLOR theme's first full statement.",
    camera: "S20: hands in frame, no UI. S22: camera-as-camera — the viewfinder itself is the viewport.",
    color: "Stage 6 consolidated — post Color-Hunt, OUR COLOR particles drift ambiently in every world.",
    constellation: "+6 stars; the bottle star is deliberately the smallest node on the map and shines disproportionately bright.",
    climax: "The Color Hunt exchange: she gives him blue, he gives her green, and the two colors merge in the air between them — by choice, exchanged as gifts.",
    transition: "The merged light settles into the dark of the evening road.",
    segments: [
      {
        id: "S19",
        title: "Her Project",
        memories: [20],
        objective: "Assemble the project together on his computer. Then, when it's done — don't leave. Stay.",
        mechanics: ["CO-OP ASSEMBLY — drag title, charts and sources into the document together. Completion does not advance the scene: a 'Stay' prompt appears and the head-on-hand rest plays only when the player chooses stillness."],
        companion: "Works the keyboard side; when finished, offers his hand as a pillow — the reward is doing nothing.",
        eyeFx: "Desk-lamp circle renders both auras at rest; seam blend breathes slowly.",
        narration: ["The library was almost empty.", "Free to talk. Free to stay."],
      },
      {
        id: "S20",
        title: "Hands, Naturally",
        memories: [21],
        objective: "Another missed bus, another crowd, another saved seat — but this time, the hand needs no asking.",
        mechanics: ["SYSTEM ECHO — the S3 crowd systems return, shorter and warmer. Hand-holding is now a single untexted tap: the interaction language itself has evolved from 'uncertain' to 'comfortable.'"],
        companion: "Makes room in the crowd for her path; takes her hand without ceremony.",
        eyeFx: "Blend engages instantly on contact — no build-up required anymore.",
        narration: ["What was once a question had quietly become a habit."],
      },
      {
        id: "S21",
        title: "The Memory Camera",
        memories: [22],
        objective: "Unbox the camera she helped him reach. Photograph the world; find what only the viewfinder reveals.",
        mechanics: ["PHOTO MODE — a live viewfinder layer exposing hidden memory fragments (a book, a flower, a bus, the sky, water, a path, a hidden star). Each capture becomes a collectible Memory Frame."],
        companion: "Points out candidate shots; her encouragement (canon: searching, offering, covering delivery) told through cards, not invented quotes.",
        eyeFx: "Viewfinder renders reflections one stage ahead of the world — the camera sees where the relationship is going.",
        narration: ["He wanted a camera to remember the world.", "She wanted to help him keep seeing it."],
      },
      {
        id: "S22",
        title: "When She Notices",
        memories: [23],
        objective: "You are tired today. Move slower. Let yourself be noticed.",
        mechanics: ["CARE INVERSION — player movement is deliberately slowed and the world desaturated. She detects it within seconds, closes distance, and stays. Choosing 'Rest together' slowly restores color. The care is mutual — mechanically."],
        companion: "Her awareness system fires: proximity seek, posture change, refuses to leave until saturation recovers.",
        eyeFx: "Her hazel aura extends over his blue one — the protective direction, reversed.",
        narration: ["Whenever he was not well, she noticed.", "She asked. She thought about him. She stayed."],
      },
      {
        id: "S23",
        title: "Color Hunting",
        memories: [24],
        objective: "Hunt your colors. She seeks blue for him; he seeks green for her. Then exchange.",
        mechanics: ["COLOR HUNT — dual collection fields: blue fragments spawn on her side, green on his; six each, gentle timer. The exchange is a two-button ritual: GIVE BLUE / GIVE GREEN. Merge cinematic follows."],
        companion: "Collects green in parallel; meet point triggers the exchange.",
        eyeFx: "The merge releases the strongest OUR COLOR surge before the finale (Stage 6 firm).",
        narration: ["She chose blue for him.", "He chose green for her.", "Both were right."],
      },
      {
        id: "S24",
        title: "The Bottle of Water",
        memories: [25],
        objective: "On one ordinary seat: a bottle, brought specifically for him.",
        mechanics: ["MICRO-COLLECTIBLE — a single interaction, a 10-second beat, a permanent star. Nothing else. Its smallness is the point."],
        companion: "Offers it silently; watches his reaction.",
        eyeFx: "One gold mote rises and joins the sky.",
        narration: ["It was small.", "The thought wasn't."],
      },
    ],
  },
  {
    id: "ch7",
    index: "07",
    title: "For Her",
    memorySpan: "M26 – M28",
    purpose: "Protection and rescue. Walking the dark road so she would not be alone. The sick-day report finished before the evening bell. And the 07:30 call: research rebuilt and delivered five minutes before her presentation.",
    world: "An unlit evening road → the library against the clock → the morning desk, laptop open, cursor blinking.",
    interactables: ["Path lamps (lit by walking together)", "Report fragments → SUBMIT", "Laptop task sequence", "The phone (07:30)"],
    visual: "S26 executes a gentle but real 5:00 countdown — the only high-energy sequence in the game, immediately followed by a calm so complete it feels like exhale.",
    audio: "Road: footsteps + night insects that hush as lamps light. S26: ticking folded into the music; send-click; then total warm silence.",
    camera: "S26 locks top-down on the desk for intensity; releases to a wide calm two-shot on success.",
    color: "Stage 6 sustained; the delivered file's send-animation trails OUR COLOR.",
    constellation: "+4 stars, including '07:30' — rendered as a small alarm-glow node.",
    climax: "Send. 00:0x on the clock. The call: it's finished. She presented confidently and got a good grade — and her mother's gratitude arrived later as excellent chocolate (canon, no brand).",
    transition: "Morning light floods the desk → and resolves into a bouquet of flowers.",
    segments: [
      {
        id: "S25",
        title: "The Evening Road",
        memories: [26],
        objective: "She goes to university in the evening. Go with her. Light the road by walking it together.",
        mechanics: ["QUIET ESCORT — no enemies, no fail. Presence system: walking side-by-side lights each path lamp in sequence (World Reaction showcase). Slow, talk-friendly pacing."],
        companion: "Keeps to the road-side of her; protective positioning is scripted into pathing.",
        eyeFx: "Each lamp lights first in blue+hazel, settling to OUR tint.",
        narration: ["You didn't have to go.", "You wanted to."],
      },
      {
        id: "S26",
        title: "The Report / The Evening Bell",
        memories: [27],
        objective: "She was sick; the deadline is today. Gather the fragments, assemble, SUBMIT before the bell.",
        mechanics: ["TIMED, GENTLE — collect 4 document fragments, apply structure and corrections, prepare SUBMIT. Timer pressure is soft: the fail state is a retry beat, never a game over. The emotional payload is relief."],
        companion: "Her worry meter is visible; his completed sections visibly lower it.",
        eyeFx: "Relief event: saturation and warmth return in one breath when SUBMIT lands.",
        narration: ["Enough was enough, she said — she'd finish the rest.", "Then the deadline moved to today.", "So he finished it."],
      },
      {
        id: "S27",
        title: "07:30",
        memories: [28],
        objective: "07:30. The phone rings. Open the laptop. Rebuild the research. Send before her presentation.",
        mechanics: ["TIMED SEQUENCE — an ordered task chain (open → rebuild → fix → export → send) against 5:00. Inputs are simple; pressure comes from pace and sound design. Success lands with minutes she'll remember."],
        companion: "Her call opens the chapter; her confident presentation closes it — the player never sees the presentation, only the calm after.",
        eyeFx: "The final send trails a long OUR COLOR comet across the screen.",
        narration: ["You had five minutes.", "She needed certainty.", "You gave it to her."],
      },
    ],
  },
  {
    id: "ch8",
    index: "08",
    title: "Flowers, Then Goodbye For Now",
    memorySpan: "M29 – M33",
    purpose: "The first bouquet she ever received. The borrowed computer and the held hands. The last three days — day one warm, day two lit with graduation, day three hushed, with 'I love you' whispered in her ear and her answer stopped by shyness. The phone call after. Holidays that kept the universe alive.",
    world: "An evening clearing with a hidden bouquet → bus echoes → a three-part day/dusk/night trilogy → two cozy rooms joined by a call → the Holiday Hub of four portals.",
    interactables: ["The bouquet", "Both hands", "Shared laptop", "The 'Speak' prompt (Day Three — designed not to complete)", "Four portals"],
    visual: "The bouquet scene executes the map-wide BLOOM EVENT. Day Three is rendered in forgiving fog (canon: the daytime is not remembered — the game refuses to invent it).",
    audio: "S28 introduces the delicate flower theme. Day Three carries near-silence. The call: two room-tones braided together.",
    camera: "S28 circles once during the hand-kiss. Day Three keeps a close two-shot and refuses wide angles.",
    color: "Stage 6 sustained; the BLOOM EVENT repaints every flower on every map with OUR COLOR reflections.",
    constellation: "+5 stars. The Day Three star is forged INCOMPLETE — a visibly open node that will stay open until the finale.",
    climax: "The bouquet — hands held, hand kissed, universe blooming. And its counterweight: the unfinished star, where love existed even when shyness stopped the words.",
    transition: "Four portal lights rise and arrange themselves into a door — the way back to the hill.",
    segments: [
      {
        id: "S28",
        title: "The First Bouquet",
        memories: [29],
        objective: "Approach her. Take both her hands. Give her the flowers. Hold her hand. Kiss it.",
        mechanics: ["SIGNATURE CINEMATIC — five playable beats (approach → both hands → offer → hold → kiss), each gated by the player's own pacing. Completion fires the BLOOM EVENT: flowers open across all maps, stars surge, hazel aura expands, OUR COLOR spreads farther than ever. Permanently replayable."],
        companion: "She receives; her reaction is the reward. Warmth from her hand is rendered as a heat-shimmer of light.",
        eyeFx: "The bouquet's petals render OUR COLOR for the first time as a physical object.",
        narration: ["The first bouquet she had ever received.", "And he wished he could give her all the flowers in the world."],
      },
      {
        id: "S29",
        title: "Echoes / The Borrowed Computer",
        memories: [30],
        objective: "A short ride: the laptop shared between you, hands held over the keyboard's glow.",
        mechanics: ["MEMORY ECHO — a 2-minute tone piece reusing bus + hand systems at their most comfortable; deliberately small."],
        companion: "Shares the screen; alternates typing and stillness.",
        eyeFx: "Screen-light flickers across both auras.",
        narration: ["Some memories are quiet enough to hold in one hand."],
      },
      {
        id: "S30",
        title: "The Last Three Days",
        memories: [31],
        objective: "Live three days. Day One: stay close, hold hands on the return. Day Two: graduation lights, a morning return, just the two of you. Day Three: the quiet ride, the whisper, the word she couldn't release.",
        mechanics: ["TRILOGY — three micro-days with distinct palettes. Day Three features the SPEAK prompt: a meter that begins and, by design, does not complete — forged as the constellation's INCOMPLETE STAR. Canon protected: the game never claims the words were said that day."],
        companion: "She holds his shoulder; tries; the silence is honored, not punished.",
        eyeFx: "At the whispered 'I love you', her aura flashes — the love is visible even when the words are not.",
        narration: ["I love you — in her ear.", "She held his shoulder, and tried.", "The love existed even when shyness stopped the words."],
      },
      {
        id: "S31",
        title: "The Call Afterward",
        memories: [32],
        objective: "Be home. Call. Talk about the day. Laugh. Stay on the line.",
        mechanics: ["COOLDOWN — two split rooms; orbiting topic-motes; her residual sadness about the unsaid words threads through gently and is met, not fixed."],
        companion: "Voice-presence via the phone light between the rooms.",
        eyeFx: "The phone-light renders as a thin OUR COLOR thread (echo of S13).",
        narration: ["The day ended.", "We didn't."],
      },
      {
        id: "S32",
        title: "The Holiday Hub",
        memories: [33],
        objective: "Holidays. Four small worlds — games together, movies together, late nights, long talks. Visit them in any order.",
        mechanics: ["SYMBOLIC HUB — four 90-second vignette portals (game world / movie world / late-night world / conversation world), each with one micro-interaction. No invented titles — abstraction preserves canon. Completing all four unlocks the door to the Finale."],
        companion: "Co-present in every vignette; hub music is the playful variation of the main theme.",
        eyeFx: "Each completed portal adds an OUR COLOR lantern to the hub sky.",
        narration: ["University paused.", "The universe didn't."],
      },
    ],
  },
  {
    id: "finale",
    index: "∞",
    title: "The Universe That Waited",
    memorySpan: "The Finale · Birthday",
    purpose: "The world recognizes her. The long walk back through everything. The meeting of the souls, the completing of the star, the bouquet returned, the eye reveal, the final constellation, her birthday — and the wish she hides among the stars.",
    world: "One ascending meadow-road through echo-set-pieces of every chapter (the bench, the table, the lamp-road, the clearing), beneath a sky that fills to full aliveness (100/100).",
    interactables: ["The star-door", "The final reach (hand system, final form)", "The incomplete star", "The wish orb"],
    visual: "Recognition cascade: a bird notices → flies → another follows → flowers open one by one → trees sway → spirits appear → animals emerge → the stars ignite. Every prior world is referenced on the path. OUR COLOR becomes environmental.",
    audio: "Silence → a single pulse → themes from earlier chapters return and layer: the library motif, the hand-hold breath, the flower theme, all resolving into the final arrangement. Birthday: warm resolution, then quiet magic for the wish.",
    camera: "The Long Walk uses one continuous, unhurried follow. The Meeting cuts input to a single gesture. The Eye Reveal is a full-screen close-up: blue eye reflecting hazel; hazel reflecting blue.",
    color: "Stage 6 → 7 — OUR COLOR completes. It never replaces Blue or Hazel; it crowns them.",
    constellation: "All 33 memory stars connect into one figure: two souls, two eyes, one world. The incomplete star completes — the symbolism: the love was always there.",
    climax: "Hands meet in silence. The universe exhales. Then: 'Today, the universe is celebrating one thing. The day you arrived in it.' — her name — HAPPY BIRTHDAY.",
    transition: "The wish orb seals and rises. COME BACK NEXT BIRTHDAY. Free Explore unlocks — and one beautiful, deliberately empty place appears on the map: room for another memory.",
    segments: [
      {
        id: "F1",
        title: "The Door in the Hill",
        memories: [],
        objective: "Return to where the sky was mostly quiet. The door is open now.",
        mechanics: ["Entry only. The prologue hill, transformed by everything the player has done since."],
        companion: "Absent — this threshold is crossed by her alone.",
        eyeFx: "Her hazel aura at full strength, reflections alive.",
        narration: ["The world is strangely quiet.", "As if it is holding its breath."],
      },
      {
        id: "F2",
        title: "The Recognition",
        memories: [],
        objective: "Walk in. Let the world see you.",
        mechanics: ["AWAKENING CASCADE — a scripted environmental recognition: bird → birds → flowers → trees → spirits → animals → stars, each reacting to her presence in sequence, each spaced with silence."],
        companion: "Not yet visible.",
        eyeFx: "Every awakened element carries a faint OUR COLOR edge.",
        narration: ["She's here.", "She's finally here.", "We've been waiting.", "We were waiting for both souls."],
      },
      {
        id: "F3",
        title: "The Long Walk",
        memories: [],
        objective: "WALK TO HIM. No challenge. No puzzle. Just the whole journey, celebrating.",
        mechanics: ["THE WALK — the path assembles echo-sets from every chapter as she passes. Environmental voices fire one at a time, spaced by walking distance. Pace-locked: this cannot be rushed."],
        companion: "A silhouette of blue at the path's end, and growing.",
        eyeFx: "Each echo-set flares its stage color as she passes it.",
        narration: ["They looked.", "They waited.", "They stayed.", "They cared.", "They found each other."],
      },
      {
        id: "F4",
        title: "The Meeting",
        memories: [],
        objective: "Reach him. Stop. Reach for his hand — the same gesture the whole story taught you.",
        mechanics: ["HAND SYSTEM, FINAL FORM — no UI prompt, no text: only the gesture, now inevitable. Contact: HUD gone, music to breath, heartbeat, stars gathering, constellations connecting live overhead."],
        companion: "Stands still until she reaches him; mirrors her reach exactly.",
        eyeFx: "Blue in Hazel. Hazel in Blue. OUR COLOR forms between the joined hands.",
        narration: ["He was always going to be at the end of this road."],
      },
      {
        id: "F5",
        title: "The Star Completes",
        memories: [31],
        objective: "Look up. One star has been waiting unfinished.",
        mechanics: ["RESOLUTION — the Day Three incomplete star closes its open edge. No invented words are claimed. The completion is silent and bright."],
        companion: "Watches with her.",
        eyeFx: "The completed star shines in pure Hazel with a Blue core.",
        narration: ["Some things were always said — just not aloud."],
      },
      {
        id: "F6",
        title: "The Bouquet Returns",
        memories: [29],
        objective: "Give her the flowers again — here, where every flower can answer.",
        mechanics: ["REPRISE — the bouquet cinematic replays in the living universe; this time every flower in the world responds. Sky brightens; OUR COLOR spreads to the horizon."],
        companion: "Receives them like the first time — and like she always will.",
        eyeFx: "Full dual-aura bloom; reflections at maximum.",
        narration: ["The first bouquet she ever received.", "Now the whole world is in on it."],
      },
      {
        id: "F7",
        title: "The Eye Reveal",
        memories: [],
        objective: "Look closely.",
        mechanics: ["CLOSE-UP — full-screen: his blue eyes, her hazel eyes, each reflecting the other, OUR COLOR ringing both. Composed as one held image; ends on input."],
        companion: "Present in her pupil; she in his.",
        eyeFx: "The system's thesis rendered literally — differences intact, creation between them.",
        narration: ["We never had to become the same.", "We only had to discover what we could create together."],
      },
      {
        id: "F8",
        title: "The Final Constellation · Birthday · The Wish",
        memories: [],
        objective: "Watch every memory connect. Then leave something for what comes next.",
        mechanics: ["THE FINAL CONSTELLATION — all 33 stars connect (two souls, two eyes, one world). BIRTHDAY — calm reveal: her name, HAPPY BIRTHDAY. THE WISH — she writes inside a star-orb; HIDE MY WISH AMONG THE STARS sends it up as particles; the star seals. Server-sealed; unreadable until next birthday. Ends: COME BACK NEXT BIRTHDAY — Free Explore unlocks, with one beautiful empty space left on the map."],
        companion: "Hands still joined. Yay.",
        eyeFx: "The constellation finishes in Blue, Hazel and OUR — three inks, one drawing.",
        narration: ["Today, the universe is celebrating one thing.", "The day you arrived in it.", "Your wish is safe.", "Some wishes are meant to wait."],
      },
    ],
  },
];

/* ---------- 33-memory canonical mapping ---------- */
export type MemoryRow = {
  m: number;
  name: string;
  segment: string;
  mechanics: string[];
  systems: string[];
  star: string;
};
export const MEMORY_MAP: MemoryRow[] = [
  { m: 1, name: "The beginning of the school year — the looks", segment: "S1 · Ch 1", mechanics: ["THE LOOK"], systems: ["Gaze", "Focus-pull", "ColorDirector"], star: "The Look" },
  { m: 2, name: "Saving her a seat on the school bus", segment: "S2 · Ch 1", mechanics: ["MAKE ROOM (passive)"], systems: ["Interaction", "Seat settle FX"], star: "The Saved Seat" },
  { m: 3, name: "Missing the bus — the written 'thank you'", segment: "S3 · Ch 1", mechanics: ["MAKE ROOM (active)"], systems: ["Crowd soft-collision", "Phone UI"], star: "The Thank-You" },
  { m: 4, name: "The taxi to the university", segment: "S4 · Ch 1", mechanics: ["Cinematic transition"], systems: ["Companion FSM upgrade → BESIDE"], star: "Side by Side" },
  { m: 5, name: "First real conversation in the library", segment: "S5 · Ch 1", mechanics: ["Memory interactables", "Sit together"], systems: ["Dialogue", "Library world"], star: "First Words" },
  { m: 6, name: "The Instagram message — attention vs. conviction", segment: "S6 · Ch 2", mechanics: ["CONVICTION WALK"], systems: ["Watching-world director", "Whisper particles"], star: "Anyway" },
  { m: 7, name: "Protection on the crowded bus — the shoulder", segment: "S7 · Ch 2", mechanics: ["SAFE RADIUS", "Rest"], systems: ["Aura audio/color grade"], star: "The Shoulder" },
  { m: 8, name: "The morning seat exchange", segment: "S8 · Ch 2", mechanics: ["Single-context scoot"], systems: ["Micro-scene runner"], star: "The Morning Seat" },
  { m: 9, name: "The goodbye — she cried after he left", segment: "S9 · Ch 2", mechanics: ["Staying (absence of input)"], systems: ["Camera stays with her"], star: "The Goodbye" },
  { m: 10, name: "Jealousy, love, relationships & marriage talks", segment: "S10 · Ch 3", mechanics: ["PACE-LOCKED WALK"], systems: ["Topic-light narration"], star: "Serious Talks" },
  { m: 11, name: "December 15, 2025 — first mutual 'I love you'", segment: "S11 · Ch 3", mechanics: ["THRESHOLD"], systems: ["Milestone cinematics", "OUR COLOR bloom"], star: "15.12.2025 ★ center" },
  { m: 12, name: "Telling her about his eyes — her promise", segment: "S12 · Ch 3", mechanics: ["VISION traversal"], systems: ["Vision stack", "Companion clarity anchor"], star: "The Promise" },
  { m: 13, name: "Winter break — Constantine, the thread", segment: "S13 · Ch 4", mechanics: ["THREAD WALK"], systems: ["Split world", "Thread renderer"], star: "The Thread" },
  { m: 14, name: "First video together", segment: "S14 · Ch 4", mechanics: ["RECORD"], systems: ["REC overlay", "Memory Frame gallery"], star: "First Video" },
  { m: 15, name: "The library during exams", segment: "S15 · Ch 4", mechanics: ["Peaceful chapter"], systems: ["Slow-look", "Ambience beds"], star: "Quiet Days" },
  { m: 16, name: "Bus changes & daily challenges — talks until sleep", segment: "S15 · Ch 4", mechanics: ["Montage endurance"], systems: ["Palette fatigue/relief"], star: "Changing Routes" },
  { m: 17, name: "'Give me your hand' — the private universe", segment: "S16 · Ch 5", mechanics: ["HAND SYSTEM (first use)"], systems: ["Audio duck → breath/heartbeat", "Replayable"], star: "First Hand ★ replayable" },
  { m: 18, name: "Missing the 16:00 bus — the 17:30 wait", segment: "S17 · Ch 5", mechanics: ["WAIT SYSTEM"], systems: ["Clock cards", "Worry meter"], star: "17:30" },
  { m: 19, name: "The yellow light she remembered", segment: "S18 · Ch 5", mechanics: ["VISION challenge"], systems: ["Glare cones", "Strain meter", "Her shading hand"], star: "The Yellow Light" },
  { m: 20, name: "Her project — head resting on his hand", segment: "S19 · Ch 6", mechanics: ["CO-OP ASSEMBLY", "Stay"], systems: ["Desk co-op"], star: "Her Project" },
  { m: 21, name: "Another crowded bus — holding hands, naturally", segment: "S20 · Ch 6", mechanics: ["System echo"], systems: ["Hand system evolved (no prompt)"], star: "Natural Hands" },
  { m: 22, name: "The camera — her encouragement & delivery help", segment: "S21 · Ch 6", mechanics: ["PHOTO MODE"], systems: ["Viewfinder reveal", "Collectible frames"], star: "The Camera" },
  { m: 23, name: "When she notices he is not well", segment: "S22 · Ch 6", mechanics: ["CARE INVERSION"], systems: ["Companion awareness", "Saturation vitals"], star: "She Notices" },
  { m: 24, name: "Color Hunting — blue for him, green for her", segment: "S23 · Ch 6", mechanics: ["COLOR HUNT"], systems: ["Dual collection", "Exchange ritual", "Merge FX"], star: "Color Hunt" },
  { m: 25, name: "The bottle of water", segment: "S24 · Ch 6", mechanics: ["Micro-collectible"], systems: ["Single-interaction beat"], star: "The Bottle" },
  { m: 26, name: "Going with her to evening university", segment: "S25 · Ch 7", mechanics: ["QUIET ESCORT"], systems: ["Lamps react to togetherness"], star: "The Evening Road" },
  { m: 27, name: "The scientific trip report — sick day, deadline day", segment: "S26 · Ch 7", mechanics: ["TIMED, GENTLE", "SUBMIT"], systems: ["Fragment fetch", "Worry meter"], star: "The Report" },
  { m: 28, name: "The 07:30 research rescue", segment: "S27 · Ch 7", mechanics: ["TIMED SEQUENCE (5:00)"], systems: ["Ordered task chain", "Calm-after storm mix"], star: "07:30" },
  { m: 29, name: "The first bouquet", segment: "S28 · Ch 8", mechanics: ["Five-beat cinematic", "BLOOM EVENT"], systems: ["World-wide flowers", "Replayable"], star: "First Bouquet ★ replayable" },
  { m: 30, name: "Borrowing the computer — hands on the ride", segment: "S29 · Ch 8", mechanics: ["Memory echo"], systems: ["Bus + hand systems at rest"], star: "The Borrowed Laptop" },
  { m: 31, name: "The last three days — the unsaid word", segment: "S30 · Ch 8", mechanics: ["TRILOGY", "SPEAK (by-design incomplete)"], systems: ["INCOMPLETE STAR forging"], star: "The Incomplete Star" },
  { m: 32, name: "The call afterward", segment: "S31 · Ch 8", mechanics: ["Cooldown"], systems: ["Split-room call"], star: "The Call" },
  { m: 33, name: "Holidays — games, movies, late nights, talks", segment: "S32 · Ch 8", mechanics: ["Symbolic hub ×4"], systems: ["Portal vignettes"], star: "The Holidays" },
];

/* ---------- signature mechanics ---------- */
export const MECHANICS = [
  { name: "THE LOOK", from: "M1", input: "Gaze held ~1.2s toward the other soul", body: "Ambience ducks, background softens (DOF pull), camera nudges, her hazel glow lifts, a blue reflection appears. The other soul looks back. Recognition without confession. Recurs passively for the whole game.", reprisals: "S1 · S5 · S15 · finale walk" },
  { name: "MAKE ROOM", from: "M2 · M3 · M21", input: "Walk / soft-navigate / one interaction", body: "Space-making as love language: a saved seat chosen, a crowd gently navigated along his signal, room made at the last second. Crowd collision is soft — people yield like water, never hostile.", reprisals: "S2 · S3 · S8 · S20" },
  { name: "SAFE RADIUS", from: "M7 · M23 · M25", input: "Proximity management", body: "Inside his radius: warmed grade, softened sound, stabilized aura, slowed breathing. Outside: louder, colder, visual pressure. Safety rendered as light and audio, not as a meter to min-max.", reprisals: "S7 · S22 · S25 · road + bus variants" },
  { name: "HAND-HOLDING", from: "M17 → M21 → M29 → Finale", input: "Move her hand to his (drag / held key)", body: "OFFER → REACH (player-driven final centimeters) → CONTACT → HOLD → RELEASE. Contact fades HUD and world to breath and heartbeat. The prompt language decays across the game: explicit → one-tap → no UI at all. Uncertain → comfortable → inevitable.", reprisals: "S16 · S20 · S28 · F4 — permanently replayable" },
  { name: "VISION", from: "M12 · M19", input: "Traversal + gaze aversion", body: "Controlled blur, far-star decay, light sensitivity, a strain meter with audible shimmer. Her proximity anchors clarity; her hand shades the yellow light. She does not cure the eyes — she ensures he never faces them alone.", reprisals: "S12 · S18 · subtle echo in photo mode" },
  { name: "RECORD / PHOTO", from: "M14 · M22", input: "Viewfinder + shutter / 8s REC", body: "A live viewfinder layer. REC captures the first video; PHOTO reveals hidden memory fragments invisible to the naked world (book, flower, bus, sky, water, path, hidden star). Captures become collectible Memory Frames.", reprisals: "S14 · S21 · free-explore secrets" },
  { name: "WAIT / CLOCK", from: "M18", input: "Optional micro-comforts", body: "The clock card ticks 16:10 · 16:30 · 17:00 · 17:20 · 17:30. Stars, leaves, birds and quiet exchanges lower her worry; the 17:20 spike asks for real reassurance. Waiting is treated as a place, not a loading screen.", reprisals: "S17 · softened in montage S15" },
  { name: "COLOR HUNT", from: "M24", input: "Dual collection + GIVE ritual", body: "Blue fragments spawn for her, green for him. Six each, gentle timer. The exchange — she gives blue, he gives green — triggers the merge surge. A real mechanic, not a card: the colors must be found, carried, and given.", reprisals: "S23 · merge FX reused at finale" },
  { name: "TIMED, GENTLE", from: "M27 · M28", input: "Fetch / ordered task chains", body: "Deadlines with soft teeth: the report SUBMIT before the bell; the 5:00 research rebuild at 07:30. Failure is a retry beat, never a game over — the payload is relief, and the calm after 07:30 is engineered like an exhale.", reprisals: "S26 · S27" },
  { name: "WORLD REACTION", from: "Global", input: "Story progress drives an Aliveness score 0–100", body: "One director controls stars, flowers, birds (flocking-lite), spirits (hidden→visible), animals and color temperature. The finale's Recognition cascade is its scripted peak. The world was waiting; the score proves it.", reprisals: "every scene · peak: F2–F3" },
];

/* ---------- color stages ---------- */
export const COLOR_STAGES = [
  { stage: 0, name: "Separate", desc: "Blue and Hazel fully distinct. No reflections.", reflect: 0, overlap: 0, env: 0 },
  { stage: 1, name: "First reflections", desc: "A single blue spark inside hazel after THE LOOK.", reflect: 12, overlap: 4, env: 0 },
  { stage: 2, name: "Subtle overlaps", desc: "Auras breathe in sync on the bus and in the library.", reflect: 24, overlap: 12, env: 0 },
  { stage: 3, name: "Recognizable tint", desc: "A shared seam tint identified for the first time in the watching world.", reflect: 36, overlap: 22, env: 4 },
  { stage: 4, name: "Emotional blending", desc: "Reflections deepen through serious conversations.", reflect: 50, overlap: 34, env: 8 },
  { stage: 5, name: "First unmistakable OUR COLOR", desc: "15.12.2025. The bloom appears — base hues intact around it.", reflect: 64, overlap: 50, env: 14 },
  { stage: 6, name: "OUR COLOR touches the world", desc: "Starlight inside the held-hand bus; ambient motes after Color Hunting.", reflect: 76, overlap: 66, env: 40 },
  { stage: 7, name: "Completion", desc: "The finale: environments wear OUR COLOR. Blue and Hazel remain — crowned, never replaced.", reflect: 90, overlap: 84, env: 100 },
];

/* ---------- Supabase schema ---------- */
export const SCHEMA_SQL = `-- identity ------------------------------------------------------------
create table players (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now()
);

-- progress --------------------------------------------------------------
create table game_progress (
  player_id   uuid primary key references players(id) on delete cascade,
  chapter     smallint  not null default 0,
  segment     smallint  not null default 0,
  checkpoint  jsonb     not null default '{}',
  color_stage smallint  not null default 0,
  aliveness   smallint  not null default 8,
  flags       jsonb     not null default '{}',   -- replay unlocks, speak-star, doors
  updated_at  timestamptz not null default now()
);

create table memory_stars (
  player_id    uuid references players(id) on delete cascade,
  memory_id    text not null,                    -- 'm01' … 'm33', 'finale'
  unlocked_at  timestamptz not null default now(),
  replay_count int  not null default 0,
  primary key (player_id, memory_id)
);

create table collectibles (
  player_id      uuid references players(id) on delete cascade,
  collectible_id text not null,                  -- 'video_01', 'photo_*', 'bottle'
  meta           jsonb not null default '{}',
  found_at       timestamptz not null default now(),
  primary key (player_id, collectible_id)
);

-- the private wish --------------------------------------------------------
create table wishes (
  id            uuid primary key default gen_random_uuid(),
  player_id     uuid not null references players(id) on delete cascade,
  birthday_year smallint not null,               -- 2026, 2027, …
  sealed_body   bytea not null,                  -- AES-GCM ciphertext · server-side only
  created_at    timestamptz not null default now(),
  unlock_at     timestamptz not null,            -- next birthday, 00:00 her local time
  opened_at     timestamptz
);

create table birthday_state (
  player_id     uuid references players(id) on delete cascade,
  birthday_year smallint not null,
  eligible      boolean not null default false,  -- set by reveal-wish when unlock_at passes
  primary key (player_id, birthday_year)
);

-- row level security --------------------------------------------------------
alter table players         enable row level security;
alter table game_progress   enable row level security;
alter table memory_stars    enable row level security;
alter table collectibles    enable row level security;
alter table wishes          enable row level security;
alter table birthday_state  enable row level security;

-- owners may read/write their own journey…
create policy "own progress" on game_progress
  for all using (auth.uid() = player_id) with check (auth.uid() = player_id);
create policy "own stars" on memory_stars
  for all using (auth.uid() = player_id) with check (auth.uid() = player_id);
create policy "own collectibles" on collectibles
  for all using (auth.uid() = player_id) with check (auth.uid() = player_id);
create policy "own birthday state" on birthday_state
  for select using (auth.uid() = player_id);

-- …but NOT the wish. no anon SELECT / INSERT / UPDATE policy on 'wishes'.
-- writes happen exclusively through the seal-wish Edge Function (service role);
-- plaintext reads exclusively through reveal-wish, gated by unlock_at.
-- the service-role key never ships to the client.`;

export const WISH_WRITE_PATH = [
  { t: "She writes", d: "The wish is typed into the star-orb ritual UI — an object in the world, not a form." },
  { t: "Hide my wish among the stars", d: "POST /functions/v1/seal-wish { text, birthday_year } with her anon session." },
  { t: "Edge Function seals", d: "Deno edge fn validates, encrypts AES-GCM with an env-held key, computes unlock_at = next birthday 00:00 (her locale, config-held date — never in the client bundle)." },
  { t: "Stored unreadable", d: "Only ciphertext (bytea) persists. Returns { id, unlock_at } — never the body." },
  { t: "Particles rise", d: "The orb bursts to particles, the star closes, the wish leaves the visible game — and the client discards the plaintext immediately." },
];
export const WISH_READ_PATH = [
  { t: "Next birthday arrives", d: "A locked star in Free Explore begins to glow — eligibility flagged locally by date, verified server-side." },
  { t: "She touches the star", d: "POST /functions/v1/reveal-wish { wish_id }." },
  { t: "Server decides", d: "Edge fn checks unlock_at <= now(). If early → 403, nothing returned. If due → decrypts server-side, sets opened_at, returns the wish once." },
  { t: "2026 → 2027 → …", d: "Each year a new wish can be sealed; each prior wish becomes eligible on its own schedule. The system is year-general by design." },
];

/* ---------- milestones ---------- */
export const MILESTONES = [
  { id: "M0", name: "Foundation", span: "Week 1", out: "Repo · Vite + Phaser 4 + Supabase · input abstraction (stick + WASD) · movement · camera rig · save skeleton · CI with canon-lint", exit: "A soul walks an empty meadow with working save round-trip at 60fps on iPhone Safari." },
  { id: "M1", name: "Vertical Slice", span: "Weeks 2–3", out: "Prologue → First Noticing → First Bus → Missed Bus → Taxi → Library arrival. THE LOOK, MAKE ROOM, companion FSM (distant→aware→beside), ColorDirector Stage 0–1, dialogue, ambience.", exit: "All M1 acceptance criteria pass (see Vertical Slice). It already feels like a game, not a prototype." },
  { id: "M2", name: "Early Relationship", span: "Weeks 4–5", out: "Ch 2–Ch 3 systems: watching world, SAFE RADIUS, goodbye camera, topic-walk, 15.12.2025 milestone, VISION v1. OUR COLOR Stage 5 bloom at the date.", exit: "The hinge of the story lands — playtester reaches the date and feels the world stop." },
  { id: "M3", name: "Deep Memory Systems", span: "Weeks 6–7", out: "HAND SYSTEM, WAIT/clock, glare challenge, RECORD/PHOTO, thread world, color hunt, care inversion. Memory Frame gallery.", exit: "S16 (Give Me Your Hand) is complete and permanently replayable." },
  { id: "M4", name: "Support & Flowers", span: "Weeks 8–9", out: "Co-op assembly, timed-gentle missions, morning 07:30, the First Bouquet BLOOM EVENT, micro-collectibles.", exit: "Bouquet scene triggers world-wide bloom and is replayable from gallery." },
  { id: "M5", name: "University Ending & Holidays", span: "Week 10", out: "Last Three Days trilogy, SPEAK-incomplete forging, the call, Holiday Hub ×4 portals, INCOMPLETE STAR persisted.", exit: "Constellation shows one visibly open node; save carries it forward." },
  { id: "M6", name: "Finale & Birthday & Wish", span: "Weeks 11–12", out: "Recognition cascade, Long Walk, Meeting, star completion, bouquet reprise, eye reveal, final constellation, birthday reveal, seal-wish/reveal-wish Edge Functions + RLS.", exit: "A wish sealed on-device is provably unrecoverable from the client; returns only when due." },
  { id: "M7", name: "Free Explore & Replay", span: "Week 13", out: "Hub world map, replayable memories, persistent world state (flowers stay open, stars stay lit), the Empty Space.", exit: "Post-story world retains full progression; replay never destroys progress." },
  { id: "M8", name: "QA & Ship", span: "Week 14", out: "Device matrix pass, perf budget enforcement (≤150 draw calls), audio loudness pass, accessibility (reduced motion, text scale), security review.", exit: "Full run on iPhone Safari landscape: zero blocking defects. It feels made for her." },
];

export const SLICE_SCOPE = [
  "Prologue hill (movement, camera, first star)",
  "S1 First Noticing — THE LOOK with focus-pull",
  "S2 The Saved Seat — bus interior + seat settle",
  "S3 The Missed Bus — crowd MAKE ROOM + phone thank-you",
  "S4 Taxi cinematic → companion upgrade FOLLOW → BESIDE",
  "S5 Library arrival — 4 interactables + first conversation",
];
export const SLICE_ACCEPTANCE = [
  "Both inputs live: virtual analog joystick (touch) and WASD/arrows, unified axis pipeline",
  "Camera follow with deadzone + lookahead; focus-pull fires on THE LOOK",
  "Companion FSM demonstrates distant → aware → follow → beside across the slice",
  "ColorDirector advances Stage 0 → 1 visibly during S1 (blue spark in hazel aura)",
  "Dialogue system plays typewriter narration from JSON script; canon-lint blocks fake quotes",
  "Save round-trips: quit after S3, reopen, resume at checkpoint with color stage intact",
  "Supabase anonymous session persists progress to game_progress",
  "Audio unlocks on first gesture; ambience ducks correctly in S1 and S3",
  "60fps on iPhone-class Safari in landscape; portrait shows the orientation room",
  "A playtester describes it as 'a game' — unprompted",
];

export const ASSETS = [
  { group: "Souls & spirits", items: ["Hazel soul (w/ brown-green-gold layered aura)", "Blue soul (sky-luminous)", "OUR-blend aura variants ×8 stages", "Hand sprites (offered / held / both)", "Little spirits ×4 (hidden & awake)", "Birds ×3 flight cycles", "Rabbit / deer silhouettes"], n: "≈40 sprites + sheets" },
  { group: "Worlds", items: ["Night hill (prologue/finale)", "Campus quad", "School bus interior", "Passenger bus interior (crowd)", "Taxi-window cinematic plates", "Library (day / exam / empty ×3)", "Watching-world corridor", "Winter courtyard (15.12)", "Vision world star-path", "Constantine split set", "Bus stop (wait)", "Night bus + yellow cones", "Co-op desk", "Color-hunt meadow", "Evening road + lamps", "07:30 desk", "Bouquet clearing", "Trilogy day sets ×3", "Two call rooms", "Holiday hub + 4 portals", "Finale meadow-road + echo sets", "The Empty Space (blank-page glade)"], n: "14 core environments + variants" },
  { group: "VFX", items: ["Star ignite", "Flower bloom (single + map-wide)", "Aura breathing", "Reflection motes", "Light-tear", "Thread pulse", "REC grain", "OUR-merge surge", "Lamp ignite", "Glare volumes", "Wish particles & seal"], n: "≈30 shader/particle FX" },
  { group: "UI", items: ["Joystick ring + contextual button", "Dialogue ribbon", "Phone message UI", "Clock cards", "Date cards (15.12.2025 · 07:30)", "Memory Frame gallery", "Constellation map", "Wish orb ritual", "Orientation room", "Letterbox"], n: "10 screens + HUD" },
  { group: "Audio", items: ["Stems: ambience beds ×6 · piano/air motif · library warmth · crowd beds ×2 · vision space · flower theme · finale arrangement · birthday resolution · wish magic", "One-shots: footsteps ×4 surfaces · bus doors · shutter · page · lamp · sparkles · breath loop · heartbeat loop · send-click"], n: "≈12 stems + ≈30 one-shots" },
];

export const TESTING = {
  unit: ["ColorDirector stage lerps + immutability of base hues", "Save schema versioning & migration", "Wish gating: unlock_at math, year rollover (2026→2027)", "Constellation graph: node/edge integrity, incomplete-star flag", "Canon-lint: quoted strings only where canonQuote === true"],
  integration: ["SceneRouter transitions with progress injection", "Supabase offline queue → reconcile on reconnect", "Replay flow: replaying S16/S28 never mutates progression", "Edge Functions: seal stores ciphertext only; reveal 403s before unlock_at"],
  devices: ["iPhone Safari (primary) · iPhone Chrome", "Android Chrome (mid-tier) landscape", "Desktop Chrome/Safari/Firefox for development parity", "Dynamic viewport + safe-area insets verified on notched devices"],
  experiential: ["Emotional pass per chapter against canon — tone review with the author", "Pacing audits: no auto-advance in rest/hold scenes", "Reduce-motion variant preserves every story beat", "Text-legibility pass at minimum supported size", "Loudness normalization: hand-hold scenes must feel near-silent, never empty"],
};

export const MOBILE_SPECS = [
  { k: "Orientation", v: "Landscape-primary. Portrait shows the Orientation Room — a beautiful held scene, not an error. No forced lock dependency." },
  { k: "Viewport", v: "100dvh + env(safe-area-inset-*) padding; no horizontal overflow; touch-action: none; user-scalable=no." },
  { k: "Controls", v: "Left-half virtual analog stick (dynamic origin, 64px radius, 6px deadzone). Right-bottom single contextual action. No button clutter." },
  { k: "Audio unlock", v: "AudioContext resumes on first gesture (Title 'touch to begin'). Haptics optional — visual/audio feedback is always sufficient." },
  { k: "Performance", v: "≤150 draw calls, atlas-packed textures (2×2048 sprite sheets/area), pooled particles, 60fps target iPhone 11-class." },
];
