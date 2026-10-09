---
name: leitmotiv
description: Art-directs and builds a product's own illustration language as code. Reads the whole project (what the product is about, its brand tokens, copy and assets), finds the places that need images (empty states, avatars, 404, onboarding, success, covers, share images, placeholders), proposes three illustration languages drawn from the product's own world, lets the person choose, then builds a dependency-free generator inside the project that draws every one of those images from a seed (a name, an id), so each list, person or item gets its own consistent illustration with no stock and no AI-generated look. Verifies it with a specimen sheet and in the real app. Use when someone wants illustrations, empty states, avatars, OG images or covers for their app, says the product feels generic or lifeless, uses initials or placeholder images, or asks for a visual identity beyond logo and colors.
---

# leitmotiv

Most products get their illustrations from three places: a stock pack that looks like every other app, AI image generators that look like every other AI app, or nothing (initials in circles, a grey placeholder, an empty screen that says "No items"). leitmotiv does what an illustrator and an art director would do together: find the **world** the product belongs to, design an illustration **language** from it, and write that language as **code** inside the project. From then on every image the product needs is drawn by that code, from a seed, in the same hand.

The person is the art director. You propose, they choose, you build. Talk to them in their language; write code comments in the project's existing style.

## The flow

1. **Survey** the project with the script.
2. **Read** it like an art director.
3. **Propose** three illustration languages, with a specimen of each.
4. **The person chooses.** Never build the full system before they do.
5. **Build** the generator in the project.
6. **Check** it with the specimen sheet.
7. **Wire** it into the app's slots.
8. **Verify** in the real app and **hand back** with evidence and `ILLUSTRATION.md`.

`<skill>` is the folder this file lives in. Scripts need Node 22+ and Chrome or Edge for screenshots (or a path in `LEITMOTIV_BROWSER`). No npm install.

### 1. Survey

```bash
node <skill>/scripts/survey.mjs <project>
```

Prints and writes `<project>/.leitmotiv/survey.json` (add `.leitmotiv/` to `.gitignore`): brand colors, fonts and radii, existing images and brand assets, docs, and the **slots**: every place in the code that asks for an image today (empty-state copy, initials avatars, not-found pages, onboarding, error and success states, OG metadata, placeholder services like picsum or unsplash).

### 2. Read

The survey gives facts. Now look. Read the product docs, the main screens and the copy; open the brand assets and screenshots and look at them. Then write, for yourself, short answers:

- **What is this, for whom, in one sentence?**
- **What is its world?** The physical things, places and gestures of the life this product lives in, not of the UI. A grocery list lives in a kitchen cupboard: jars, cartons, fruit, a shelf. A running app lives on streets and in weather. A budgeting app lives in envelopes, coins, a kitchen table. Write 8–12 nouns.
- **What does the brand already say about shape?** Corner radius, type weight and style, how many colors and how saturated, how much ornament. Illustrations have to look like they were made by the same hand as the UI.
- **What does it forbid?** A serious finance tool forbids cute faces. A calm health app forbids loud saturated color.
- **Which slots matter most**, and what must each one make someone feel or do? (Read [`references/slots.md`](references/slots.md).)

### 3. Propose three languages

Read [`references/language.md`](references/language.md) first. Present exactly three, different from each other in kind: a different metaphor or a different hand, not three color variations. For each:

- **Name**: two to four words.
- **The idea**: two sentences. What world it draws, in what hand.
- **Why it belongs here**: which answer from step 2 it comes from. If you can't point to one, drop it.
- **Grammar**: shapes, line, fill, texture, color roles, faces or not, density.
- **Motifs**: the 6–10 things it draws.
- **In each slot**: one line per important slot (what the empty list shows, what an avatar is).
- **Risks**: where it could go wrong (too cute, too busy, illegible at 24 px, clashes with photos).

**Show, don't describe.** Prototype the motifs quickly in one file with the engine, render the three with `specimen.mjs` and show the person the image (the engine's `riso`, `line` and `blocks` styles give three hands for free; a different metaphor needs different motifs). Recommend one and say why; say plainly which is the safe one and which the ambitious one. If the product doesn't need illustration at all (a dense data tool, a brand built on photography), say so instead of forcing three.

### 4. The person chooses

Wait. Adjust what they ask for. A name, a motif or a color can change here cheaply; after step 5 it costs more.

### 5. Build

1. Copy `<skill>/templates/engine.mjs` into the project (for example `src/lib/leitmotiv/engine.mjs`). Don't edit it: the product's language goes in its own file.
2. Write `<product>-art.mjs` next to it, like [`examples/pantry/pantry-art.mjs`](examples/pantry/pantry-art.mjs):
   - **The palette** from the project's tokens, by role: `paper`, `ink`, `accents`. Same hex values as the UI, never "close enough" ones.
   - **The motifs**: one function per thing in the world, drawing inside a box `{x, y, w, h}` with `c.shape`, `c.stroke` and `c.dot`. Vary details with the seeded `r`, never with `Math.random()`.
   - **A composition per slot**: `itemGlyph(name)`, `avatar(name, { among })`, `emptyState({ mood })`, `cover(title)`, `og({ title })`, `notFound()`… Each takes the product's own data (a name, an id) as its seed.
   - **`specimen(style)`**: every composition with a few seeds, for the specimen sheet.
3. Follow [`references/craft.md`](references/craft.md): legibility at small sizes, identity (two people in the same group never look alike), accessibility, dark mode, weight.

### 6. Check

```bash
node <skill>/scripts/specimen.mjs <project>/src/lib/leitmotiv/<product>-art.mjs --out <project>/.leitmotiv
```

It renders everything, screenshots it, and checks that the same seed gives the same drawing, different seeds give different drawings, ids don't clash on a page, each SVG stays under 40 KB, and ink has enough contrast against paper. **Open the PNG and look at it like an art director**, not like a test runner:

- Does it look like one hand drew all of it? Does any piece look like it belongs to another product?
- Are avatars and item glyphs readable at their real size (24–48 px)?
- Is anything muddy, crowded or accidental? Does the empty state point to the action?

Fix and render again until the answer is yes. Expect several rounds; that is the job.

### 7. Wire it into the slots

Use it where the survey found slots, in the project's own components. Render on the server when the framework allows it (the generator is plain JS that returns an SVG string), cache per seed if a list renders many. For share images and app icons, export PNGs:

```bash
node <skill>/scripts/export.mjs <product>-art.mjs og '[{"title":"…"}]' --out public/og.png
```

Replace, don't decorate: an avatar replaces the initials, an empty state replaces the "No items" line. Keep the text that explains and the button that acts; the illustration supports them, it never carries information alone.

### 8. Verify and hand back

Run the app and screenshot the real screens with the illustrations in place, in light and dark mode and on a phone. Then hand back:

- The specimen sheet and the screenshots.
- What you wired where, file by file.
- **`ILLUSTRATION.md`** in the project: the world, the grammar, the motifs, the palette roles, what each slot shows, the rules, and how to add a motif. That keeps the next session (or the next person) drawing in the same hand.
- What you'd draw next (a slot you didn't cover, a seasonal variant, motion).
