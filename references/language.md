# Designing an illustration language

An illustration language is a **world** drawn by a **hand**. The world is what gets drawn (the things of the product's life). The hand is how (shape, line, fill, texture, color). The two together, plus a few rules, are what make 200 generated images look like one illustrator made them.

## 1. The world: draw the life, not the interface

Bad product illustration draws the product: phones, dashboards, floating UI cards, people pointing at charts. Good product illustration draws the life the product serves.

| Product | Not this | This world |
|---|---|---|
| Shared grocery list | A phone with a checklist | The cupboard: jars, cartons, fruit, a shelf |
| Couple long-distance app | Two phones and a heart | The trip: tickets, a suitcase, two cups, a calendar page |
| Running tracker | A watch with a graph | The street: shoes, a water bottle, puddles, a park bench |
| Personal budget | A pie chart | The table: envelopes, coins, a jar for savings, receipts |
| Team retro tool | People around a whiteboard | Sticky notes, a coffee pot, a clock, a door |

Write 8–12 nouns of that world. Keep the ones that can be drawn with a few shapes and are recognizable as a silhouette. Drop the ones that need detail to read (a specific brand of phone, a face with expression).

**Faces or no faces.** Faces add warmth and identity (great for avatars) but make everything cuter. Decide once, by brand: a consumer app for friends can have them; a medical or financial product usually can't.

## 2. The hand: six decisions

Take each from the brand, not from taste.

| Decision | Options | Read it from |
|---|---|---|
| **Geometry** | Organic and wobbly · soft geometric · hard geometric · isometric | Corner radii (large radii → soft), type (humanist sans → organic, geometric sans → geometric, mono → hard) |
| **Line** | None · uniform ink · variable brush | Type weight and contrast: heavy uniform sans → uniform ink; high-contrast serif → variable |
| **Fill** | Flat · textured (riso, grain, halftone) · none (line only) | Surfaces in the UI: flat cards → flat; paper or warm backgrounds → texture |
| **Color** | 2–3 inks · full palette · monochrome | The UI's palette. Use its exact hex values by role; a language with more colors than the UI looks like it belongs to another product |
| **Density** | One object · a few · a collage | How busy the UI is. Calm UI, sparse illustration |
| **Character** | Faces · objects only · abstract | Brand tone (see above) |

The engine (`templates/engine.mjs`) covers three hands out of the box, so you can show the same motifs three ways in minutes:

- **`riso`**: flat color with paper-colored grain, a slightly wobbly hand, and an ink outline printed slightly out of register. Warm, crafted, friendly. Good for consumer products with warm palettes.
- **`line`**: uniform ink line, no fill, a lighter wobble. Editorial, calm, works on any background and in dark mode. Good for productivity and content products.
- **`blocks`**: hard flat shapes, no outline, no wobble, a solid offset shadow. Bold, playful, poster-like. Good for products with strong, saturated brands.

Other hands you can build with the same primitives: isometric blocks (projected boxes), stamp or woodcut (one ink, rough edges, negative space), halftone (dot patterns as fill), data glyphs (shapes whose size or count comes from the product's numbers).

## 3. The three proposals

The three should differ **in kind**. Good spreads:

- Same world, three hands (riso cupboard · line cupboard · blocks cupboard): use when the world is obvious and the question is tone.
- Three worlds, one hand each (the cupboard · the market · the fridge door with notes and magnets): use when the metaphor itself is the question.
- Safe · fitting · ambitious: the safe one stays close to the UI (line, few colors); the ambitious one has strong character (faces, texture, collage).

Render all three with `specimen.mjs --styles riso,line,blocks` (or one file per world). People choose much better from pictures than from adjectives.

## 4. Rules that hold it together

Write them in `ILLUSTRATION.md`. Typical ones:

- One ink color for all outlines and details. Accents only as fills.
- Every object sits on something (a shelf, the floor, a table line) or floats with a reason (a scatter in a cover, a toss).
- No text inside illustrations, except share images where the title is set in the brand font beside the art, never on it.
- Light comes from the same side, if there is any shading at all.
- Sizes: objects in one composition differ by at most 2× unless the difference means something.
- What changes with the seed (color among accents, small variations, arrangement) and what never changes (proportions, line weight, palette).
