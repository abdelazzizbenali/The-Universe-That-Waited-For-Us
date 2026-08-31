/* Discoveries — seven optional things to find in the permanent world.

   None of them is hidden cruelly: each sits in a place worth walking to, and
   each says something. They are found by wandering, not by hunting pixels. */

export interface Discovery {
  id: string;
  label: string;
  /** Normalized position across the hub world. */
  fx: number;
  fy: number;
  lines: string[];
  /** Only visible through the memory camera. */
  cameraOnly?: boolean;
  /** Requires the whole story to have been lived. */
  needsStory?: boolean;
  tint: number;
}

export const DISCOVERIES: Discovery[] = [
  {
    id: "hidden-star",
    label: "a faint star",
    fx: 0.13,
    fy: 0.24,
    tint: 0xd6eeff,
    lines: [
      "A star nobody had gotten around to naming.",
      "It had been up there the whole time, waiting to be looked at properly.",
    ],
  },
  {
    id: "hidden-flower",
    label: "a flower out of season",
    fx: 0.36,
    fy: 0.88,
    tint: 0xf2b8c6,
    lines: [
      "One flower had opened well before the others, and well before it should have.",
      "Nothing in this world has ever been very good at waiting for permission.",
    ],
  },
  {
    id: "camera-fragment",
    label: "something only the camera sees",
    fx: 0.52,
    fy: 0.36,
    tint: 0x9fe3c9,
    cameraOnly: true,
    lines: [
      "Through the viewfinder: two small lights on a bus seat, from a long time ago.",
      "The camera keeps finding things the eye walks straight past.",
    ],
  },
  {
    id: "shy-spirit",
    label: "a spirit, half hidden",
    fx: 0.64,
    fy: 0.6,
    tint: 0x9fe3c9,
    needsStory: true,
    lines: [
      "It had been watching from behind things for the entire story.",
      "Now that everyone had arrived, it finally came out.",
    ],
  },
  {
    id: "constellation-shard",
    label: "a piece of the sky",
    fx: 0.78,
    fy: 0.3,
    tint: 0x93dcbb,
    lines: [
      "A fragment of the constellation, resting low enough to touch.",
      "It fits somewhere. It is in no hurry to be put back.",
    ],
  },
  {
    id: "the-moon",
    label: "the moon",
    fx: 0.9,
    fy: 0.16,
    tint: 0xf4dca8,
    lines: [
      "The moon had watched every single bus ride.",
      "It never said anything. It just kept turning up.",
    ],
  },
  {
    id: "unnamed-star",
    label: "an unnamed star",
    fx: 0.955,
    fy: 0.42,
    tint: 0xeaf2ff,
    needsStory: true,
    lines: [
      "This one has no name and no memory attached to it yet.",
      "It is not broken, and it is not missing anything. It is simply not written.",
    ],
  },
];
