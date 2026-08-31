import { useState } from "react";
import { COLOR_STAGES } from "../data/blueprint";
import { Section, Reveal, Field, CodeBlock, Chip } from "../components/ui";

/* ---------------- scene graph ---------------- */
const SCENE_FLOW = [
  { name: "BootScene", role: "config · device detect · storage probe", tone: "dim" },
  { name: "PreloadScene", role: "atlas manifests · audio stems · save hydrate", tone: "dim" },
  { name: "TitleScene", role: "the held breath · 'touch to begin' (audio unlock)", tone: "dim" },
  { name: "SceneRouter", role: "reads ProgressState → mounts chapter scene + checkpoint", tone: "our" },
  { name: "Chapter Scenes ×14", role: "hill · quad · buses ×2 · taxi · library ×3 · watching · courtyard · vision · thread · stop · road · desk · clearing · trilogy · call · hub", tone: "blue" },
  { name: "FinaleScene", role: "recognition · long walk · meeting · birthday · wish", tone: "our" },
];

const OVERLAYS = [
  ["UIScene", "HUD · joystick · contextual action · clock/date cards"],
  ["DialogueScene", "typewriter ribbon · narration queue · canon enforcement"],
  ["PhotoScene", "viewfinder overlay · REC dot · fragment reveal"],
  ["ConstellationScene", "sky map · replay gallery · the open star"],
] as const;

const TREE = `src/
  game/
    main.ts               Phaser 4 boot config (renderer, scale, physics: off — steering only)
    scenes/               BootScene PreloadScene TitleScene SceneRouter
                          chapters/{ch00..ch08}/*.ts   FinaleScene.ts
                          overlays/{UI,Dialogue,Photo,Constellation}Scene.ts
    entities/             Player.ts  Companion.ts  Soul.ts  Spirit.ts  Bird.ts
    systems/
      input/              InputAdapter.ts (axis: stick|keys)  VirtualStick.ts  Gesture.ts
      camera/             CameraRig.ts (deadzone·lookahead·focus-pull)  Letterbox.ts
      color/              ColorDirector.ts  stages.ts  OurColor.ts
      companion/          CompanionFSM.ts  Awareness.ts  SafeRadius.ts
      hands/              HandHoldController.ts (offer→reach→contact→hold→release)
      vision/             VisionStack.ts  GlareCones.ts  StrainMeter.ts
      world/              AlivenessDirector.ts  SpawnTables.ts  Awakening.ts
      dialogue/           DialogueRunner.ts  scripts/*.json  canonLint.ts
      memory/             MemoryRegistry.ts  Frames.ts (photo/video collectibles)
      save/              SaveSystem.ts  Checkpoint.ts  OfflineQueue.ts
      audio/              AudioDirector.ts  Stems.ts  Ducking.ts  BreathHeart.ts
    fx/                   shaders/{blur,glare,ourmix}.frag  particles/*
  supabase/               client.ts  progress.ts  wishes.ts
supabase/
  functions/seal-wish/    index.ts   (encrypt + insert · service role)
  functions/reveal-wish/  index.ts   (unlock gate + decrypt once)`;

/* ---------------- constellation svg ---------------- */
const NODES: [number, number][] = [
  [60, 210], [110, 150], [170, 190], [230, 120], [300, 160], [370, 110],
  [430, 170], [360, 230], [280, 260], [200, 250], [130, 240], [90, 300],
  [180, 320], [270, 330], [350, 310], [420, 260], [455, 210],
];
function ConstellationSvg() {
  const pts = NODES.map(([x, y]) => `${x},${y}`).join(" ");
  return (
    <svg viewBox="0 0 500 380" className="w-full">
      <polyline
        points={pts}
        fill="none"
        stroke="rgba(147,220,187,0.5)"
        strokeWidth="1"
        className="constellation-line"
      />
      {NODES.map(([x, y], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r={i === 5 ? 6 : 3} fill={i === 5 ? "#93dcbb" : i % 2 ? "#e0b36a" : "#7fc4ff"} opacity="0.9">
            <animate attributeName="opacity" values="0.5;1;0.5" dur={`${3 + (i % 4)}s`} repeatCount="indefinite" />
          </circle>
          {i === 9 && (
            <circle cx={x} cy={y} r="9" fill="none" stroke="#f2b8c6" strokeWidth="1" strokeDasharray="3 4">
              <animateTransform attributeName="transform" type="rotate" from={`0 ${x} ${y}`} to={`360 ${x} ${y}`} dur="14s" repeatCount="indefinite" />
            </circle>
          )}
        </g>
      ))}
      <text x="300" y="104" textAnchor="middle" fill="#93dcbb" fontSize="9" fontFamily="JetBrains Mono" letterSpacing="2">15.12.2025</text>
      <text x="200" y="276" textAnchor="middle" fill="#f2b8c6" fontSize="9" fontFamily="JetBrains Mono" letterSpacing="1">the open star</text>
    </svg>
  );
}

/* ---------------- color stage lab ---------------- */
function ColorLab() {
  const [stage, setStage] = useState(0);
  const s = COLOR_STAGES[stage];
  const gap = 130 - s.overlap * 1.5;
  return (
    <div className="panel p-6 md:p-9">
      <div className="grid items-center gap-10 md:grid-cols-[1fr_240px]">
        <div>
          <div className="relative mx-auto flex h-44 items-center justify-center md:h-52">
            <div
              className="absolute h-36 w-36 rounded-full transition-all duration-700 md:h-44 md:w-44"
              style={{
                transform: `translateX(-${gap / 2}px)`,
                background: "radial-gradient(circle, rgba(244,220,168,0.95) 0%, rgba(168,142,84,0.55) 45%, rgba(154,171,98,0.2) 65%, transparent 75%)",
                boxShadow: `0 0 ${30 + s.reflect}px rgba(224,179,106,0.35)`,
              }}
            />
            <div
              className="absolute h-36 w-36 rounded-full transition-all duration-700 md:h-44 md:w-44"
              style={{
                transform: `translateX(${gap / 2}px)`,
                background: "radial-gradient(circle, rgba(214,238,255,0.95) 0%, rgba(127,196,255,0.5) 45%, rgba(62,124,196,0.18) 65%, transparent 75%)",
                boxShadow: `0 0 ${30 + s.reflect}px rgba(127,196,255,0.35)`,
              }}
            />
            <div
              className="absolute h-32 w-32 rounded-full mix-blend-screen transition-all duration-700"
              style={{
                opacity: s.overlap / 100,
                background: "radial-gradient(circle, rgba(205,255,229,0.9) 0%, rgba(147,220,187,0.5) 50%, rgba(232,207,143,0.15) 75%, transparent 85%)",
                filter: `blur(${8 - s.overlap * 0.04}px)`,
              }}
            />
          </div>
          <p className="text-center font-mono text-[10px] uppercase tracking-[0.3em] text-ink-faint">
            hazel — base hues never erased — blue
          </p>
        </div>

        <div>
          <p className="kicker mb-2 text-our">Stage {s.stage} / 7</p>
          <p className="display mb-1 text-2xl text-ink">{s.name}</p>
          <p className="mb-6 min-h-[42px] text-[12.5px] leading-relaxed text-ink-dim">{s.desc}</p>
          <input
            type="range"
            min={0}
            max={7}
            step={1}
            value={stage}
            onChange={(e) => setStage(Number(e.target.value))}
            className="stage-slider mb-6"
            aria-label="Color progression stage"
          />
          {[
            ["Reflection intensity", s.reflect, "#7fc4ff"],
            ["Aura overlap", s.overlap, "#e0b36a"],
            ["Environment tint", s.env, "#93dcbb"],
          ].map(([label, v, c]) => (
            <div key={label as string} className="mb-3">
              <div className="mb-1 flex justify-between font-mono text-[9px] uppercase tracking-[0.2em] text-ink-faint">
                <span>{label}</span>
                <span>{v}%</span>
              </div>
              <div className="h-1 overflow-hidden rounded-full bg-white/5">
                <div className="h-full rounded-full transition-all duration-500" style={{ width: `${v}%`, background: c as string }} />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-8 grid gap-3 border-t border-line pt-6 md:grid-cols-3">
        <p className="text-[12px] leading-relaxed text-ink-dim"><Chip tone="our">rule 1</Chip><span className="ml-2">Progression is event-driven only — never time-based. Color must be earned by story.</span></p>
        <p className="text-[12px] leading-relaxed text-ink-dim"><Chip tone="our">rule 2</Chip><span className="ml-2">OUR COLOR is additive. Base hues are immutable; overlap renders in a third channel.</span></p>
        <p className="text-[12px] leading-relaxed text-ink-dim"><Chip tone="our">rule 3</Chip><span className="ml-2">Stage jumps wait for stillness. Blooms never fire during motion or UI noise.</span></p>
      </div>
    </div>
  );
}

/* ---------------- page section ---------------- */
export default function Systems() {
  return (
    <Section
      id="systems"
      index="04"
      kicker="Technical architecture"
      title={
        <>
          The machine underneath,{" "}
          <span className="serif-i text-soul-blue">built like the story</span>
        </>
      }
      lede="TypeScript · Vite · Phaser 4.x for the world render · Supabase for persistence. Modular, data-driven, and testable — every system is named after what it protects: the look, the hand, the light, the waiting."
    >
      {/* scene architecture */}
      <Reveal>
        <div className="mb-4 flex items-baseline gap-4">
          <h3 className="display text-2xl text-ink">Scene architecture</h3>
          <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-ink-faint">Phaser 4 · scene flow + persistent overlays</span>
        </div>
      </Reveal>
      <div className="grid gap-4 lg:grid-cols-[1.15fr_1fr]">
        <Reveal>
          <div className="panel flex h-full flex-col gap-2 p-5">
            {SCENE_FLOW.map((s, i) => (
              <div key={s.name} className="flex items-center gap-3">
                <div
                  className={`min-w-[150px] rounded-lg border px-3.5 py-2.5 font-mono text-[11px] ${
                    s.tone === "our"
                      ? "border-our/50 bg-our/10 text-our"
                      : s.tone === "blue"
                        ? "border-soul-blue/40 bg-soul-blue/[0.07] text-soul-blue"
                        : "border-line bg-white/[0.02] text-ink-dim"
                  }`}
                >
                  {s.name}
                </div>
                <div className="text-[11.5px] leading-snug text-ink-faint">{s.role}</div>
                {i < SCENE_FLOW.length - 1 && <div className="absolute" />}
              </div>
            ))}
            <div className="mt-2 border-t border-line pt-3">
              <p className="kicker mb-2 text-[0.58rem] text-ink-faint">Persistent overlay scenes (parallel)</p>
              <div className="grid gap-1.5 sm:grid-cols-2">
                {OVERLAYS.map(([n, r]) => (
                  <p key={n} className="text-[11.5px] leading-snug text-ink-dim">
                    <span className="font-mono text-[10.5px] text-hazel-gold">{n}</span> — {r}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </Reveal>
        <Reveal delay={80}>
          <CodeBlock code={TREE} />
        </Reveal>
      </div>

      {/* player + companion */}
      <div className="mt-14 grid gap-4 lg:grid-cols-2">
        <Reveal>
          <div className="panel h-full p-6 md:p-7">
            <p className="kicker mb-1 text-soul-blue">Player architecture</p>
            <p className="mb-5 text-[12.5px] text-ink-faint">Her soul. Entity-lite components over a strict FSM; one unified axis pipeline for all input.</p>
            <div className="mb-5 flex flex-wrap items-center gap-1.5">
              {["IDLE", "MOVE", "INTERACT", "SEATED", "REACH", "HOLD", "CINEMATIC"].map((s, i) => (
                <span key={s} className="flex items-center gap-1.5">
                  <span className={`chip ${i >= 4 ? "!text-our !border-our/40" : ""}`}>{s}</span>
                  {i < 6 && <span className="text-ink-faint">→</span>}
                </span>
              ))}
            </div>
            <Field k="Movement">Acceleration 1400u/s², max 240u/s, 8-way normalized, analog magnitude respected from stick; steering only, no physics dependency.</Field>
            <Field k="Input adapter">VirtualStick (touch) and Keyboard feed one <em>axis vector</em>; gestures (hold-gaze, drag-reach) are capabilities registered per scene.</Field>
            <Field k="Interaction">Radius + facing cone + priority scoring; contextual button surfaces the best candidate. Interactables declare their memory id — discovery is free progression data.</Field>
            <Field k="Rendering">Layered sprite: soul core → aura (breathing shader) → reflection motes (stage-driven) → OUR overlay. One material, driven by ColorDirector uniforms.</Field>
          </div>
        </Reveal>
        <Reveal delay={80}>
          <div className="panel h-full p-6 md:p-7">
            <p className="kicker mb-1 text-hazel-gold">Companion architecture</p>
            <p className="mb-5 text-[12.5px] text-ink-faint">His soul. A companion AI whose states encode the relationship itself — some upgrades are permanent unlocks.</p>
            <div className="mb-5 flex flex-wrap items-center gap-1.5">
              {["DISTANT", "AWARE", "FOLLOW", "BESIDE", "PROTECTIVE", "HOLDING", "RESTING"].map((s, i) => (
                <span key={s} className="flex items-center gap-1.5">
                  <span className={`chip ${i === 3 ? "!text-our !border-our/40" : ""}`}>{s}</span>
                  {i < 6 && <span className="text-ink-faint">→</span>}
                </span>
              ))}
            </div>
            <Field k="Permanent unlocks">BESIDE at S4 (taxi — never follows behind again). PROTECTIVE at S7. HOLDING natural from S20. Unlocks persist across scenes and replays.</Field>
            <Field k="Steering">Arrive behavior with player-velocity prediction; BESIDE offsets align shoulders and sync gait; crowd scenes switch to path-claiming (he claims space first).</Field>
            <Field k="Awareness">Gaze tracker answers THE LOOK within 1.5s; the care system (S22) inverts it — she seeks him when his vitals drop. Noticing is coded.</Field>
            <Field k="Safe Radius">Aura radius drives AudioDirector ducking curves, color temperature lerp and worry-meter decay in WAIT scenes. Safety is an engine value.</Field>
          </div>
        </Reveal>
      </div>

      {/* color system */}
      <Reveal className="mt-16">
        <div className="mb-4 flex items-baseline gap-4">
          <h3 className="display text-2xl text-ink">The eye / color system</h3>
          <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-ink-faint">interactive — drag through all eight stages</span>
        </div>
        <ColorLab />
      </Reveal>

      {/* constellation + world reaction */}
      <div className="mt-14 grid gap-4 lg:grid-cols-2">
        <Reveal>
          <div className="panel h-full overflow-hidden p-6">
            <p className="kicker mb-1 text-our">Constellation system</p>
            <p className="mb-4 text-[12.5px] text-ink-faint">A StarGraph of 33 memory nodes; edges draw in story order with tweens. One node is forged open.</p>
            <ConstellationSvg />
            <div className="grid gap-x-6 border-t border-line pt-4 sm:grid-cols-2">
              <Field k="Data">nodes: memory_id · position · stage ink (blue/hazel/our) · replay_link. edges: ordered pairs, animation keyframes.</Field>
              <Field k="Finale rule">Final composition resolves to two souls · two eyes · one world — never previewed early, assembled live from earned stars only.</Field>
            </div>
          </div>
        </Reveal>
        <Reveal delay={80}>
          <div className="panel h-full p-6 md:p-7">
            <p className="kicker mb-1 text-our">World reaction system</p>
            <p className="mb-5 text-[12.5px] text-ink-faint">AlivenessDirector — one global score (0–100) fed by unlocked stars, driving every ecosystem layer.</p>
            <Field k="0–15">Few stars, closed flowers, distant birds, hidden spirits, cold grade (prologue baseline: 8).</Field>
            <Field k="15–45">Stars fill, first flowers open, birds pass overhead, spirit eyes glint and vanish, color temperature warms.</Field>
            <Field k="45–75">Flocks (boids-lite), spirits linger visible, trees sway toward the pair, animals appear at edges.</Field>
            <Field k="75–100">Full celebration: map-wide bloom states retained, night skies dense, ambient OUR motes in all worlds.</Field>
            <Field k="The finale">Score forces 100 and hands control to the scripted Awakening cascade: bird → birds → flowers → trees → spirits → animals → stars — each event spaced, each voiced once.</Field>
          </div>
        </Reveal>
      </div>

      {/* vision + camera */}
      <div className="mt-14 grid gap-4 lg:grid-cols-2">
        <Reveal>
          <div className="panel h-full p-6 md:p-7">
            <p className="kicker mb-1 text-soul-blue">Vision system</p>
            <p className="mb-5 text-[12.5px] text-ink-faint">A post stack that renders his eyes — vulnerability with dignity, and care as optics.</p>
            <Field k="LensBlur">Variable radius 2–10px scene blur; never total — the world stays beautiful, just far away.</Field>
            <Field k="FarDecay">Stars and distance detail fade past a clarity horizon that her presence extends.</Field>
            <Field k="GlareCones">The yellow lights (S19): volumetric cones; gaze-into raises Strain (0–1) → distortion + shimmer sound; avert to recover.</Field>
            <Field k="Anchor">Inside her aura all layers ease toward clarity. Implemented honestly: she steadies the experience; she never cures it.</Field>
          </div>
        </Reveal>
        <Reveal delay={80}>
          <div className="panel h-full p-6 md:p-7">
            <p className="kicker mb-1 text-soul-blue">Camera system</p>
            <p className="mb-5 text-[12.5px] text-ink-faint">One rig, many behaviors — plus the in-world Memory Camera.</p>
            <Field k="Rig">Deadzone 84px, lookahead = 0.35s × velocity, easing critically damped. No screenshake anywhere — this world never hits her.</Field>
            <Field k="Focus-pull">On THE LOOK / milestone thresholds: zoom 1.0→1.18 with DOF softness and a 600ms drift toward the pair.</Field>
            <Field k="Stay rules">The rig obeys narrative custody: it stays with her in S9 (goodbye) and waits, motionless, during every hand-hold.</Field>
            <Field k="Photo mode">Viewport layer with frame guides, REC dot (S14, 8s) and fragment reveal shader (S22). Captures write Memory Frame collectibles to the gallery.</Field>
          </div>
        </Reveal>
      </div>

      {/* dialogue */}
      <Reveal className="mt-14">
        <div className="mb-4 flex items-baseline gap-4">
          <h3 className="display text-2xl text-ink">Dialogue &amp; narration system</h3>
          <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-ink-faint">JSON script DSL · canon enforcement at build time</span>
        </div>
        <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
          <CodeBlock
            code={`{
  "id": "s03_missed_bus",
  "lines": [
    { "type": "narration", "text": "The bus did not come for them today." },
    { "type": "narration", "text": "The next one was crowded enough to vanish in." },
    { "type": "beat",       "system": "MAKE_ROOM", "until": "seated" },
    { "type": "narration", "text": "She was too shy to say it out loud." },
    { "type": "canon-message", "speaker": "her",
      "canonQuote": true,                   "text": "Thank you." },
    { "type": "beat",       "system": "SETTLE", "seconds": 6 }
  ]
}

// canon-lint (CI): any quoted string requires canonQuote:true,
// and its text must match the canonical phrase registry exactly.
// emotional value: faithful — invented wording: build error.`}
          />
          <div className="panel flex h-full flex-col justify-between gap-6 p-6">
            <Field k="Line types">narration · thought · canon-message · beat (system hand-off) · environmental-voice (the finale's spaced whispers).</Field>
            <Field k="Delivery">Typewriter ribbon, 38cps with breath pauses at punctuation; advance on tap; no auto-advance in rest scenes. Max two lines on screen — the world stays primary.</Field>
            <Field k="Voices reserved">"I love you." (mutual, M11) · "Thank you." (M3) · "Give me your hand." (M17) · the finale's recognition lines. Everything else: narration, never fake history.</Field>
          </div>
        </div>
      </Reveal>
    </Section>
  );
}
