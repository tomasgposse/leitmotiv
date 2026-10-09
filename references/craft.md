# Craft

What separates a generated illustration system that feels designed from one that feels like a toy.

## One hand

- **One ink.** Every outline and detail uses `palette.ink`. Accents are fills.
- **The UI's exact colors**, by role. If the UI has a green primary, the illustrations use that same hex. An illustration that introduces new colors looks pasted in.
- **Same proportions everywhere.** A jar is the same jar in a 40 px item icon and in a 600 px cover. Only the seed's small variations change (which accent, the label, a slight tilt).
- **Line weight in screen pixels, not in drawing units.** Pass `inkWidth` per composition so a 48 px icon and a 1200 px share image have outlines that look the same weight on screen, and `grainScale` (the display width) so the texture is the same size too. Large pieces want less wobble (`wobbleScale` 0.5–0.7): the same tremble that looks hand-made at 48 px looks crumpled at 600.

## Seeds

- **Seed from stable data**: an id or a name, never an array index or a timestamp. The same list must keep the same cover after a reload, on another device, for another person.
- **Prefix the seed by slot** (`item:`, `person:`, `cover:`) so "Mateo" the person and "Mateo" a list title don't get the same drawing.
- **`r.fork('detail')` for optional details.** Adding a sparkle later shouldn't change every drawing that already exists, because the main sequence of random numbers stays the same.
- **Variation is a budget.** Decide what may vary (accent, small proportions, arrangement, rotation within ±15°) and what never does. Too much variation and it stops looking like a system.

## Identity (avatars and anything that tells things apart)

An avatar's job is to tell people apart; charm comes second. Random colors will eventually give two people in the same group the same look.

- Give the composition the group (`avatar(name, { among: members })`) and assign color and shape by a stable order inside it, so everyone in the group is different and adding someone doesn't repaint the others.
- With more members than colors, combine color and shape (5 colors × 3 shapes = 15 distinct looks) before repeating.
- Keep a text fallback (the name, as `title` or next to it). The avatar never carries the identity alone.

## Small sizes

Item icons and avatars live at 24–48 px. Render them at their real size in the specimen and look:

- One silhouette, readable as a shape alone.
- At most three fills plus ink.
- No detail under ~2 px on screen: label lines, seeds and highlights disappear or turn into noise. Drop them below a size threshold if you have to.
- Faces: two dots and at most a short mouth. Nothing else.

## Composition

- Every object sits on something (a shelf, a table line, the floor) or floats with a clear reason (a scatter on a cover).
- One focal object per empty state; the rest supports it.
- Leave breathing room: illustrations in UI sit next to text and buttons. Fill no more than ~70% of the box.
- Empty states point to the action: the missing thing, the open slot, the "+" (Pantry's dashed jar).

## Accessibility

- **Decorative by default**: `aria-hidden="true"` (the engine does this). The surrounding text says what the screen means.
- **When an illustration carries meaning** (an avatar with no visible name, a status picture), give it a `title` so the engine outputs `role="img"` and an `aria-label`.
- **Never only the illustration**: an empty state still has its heading and button, an avatar still has the name nearby or in the label.
- **Contrast**: ink against paper at least 4.5:1 (the specimen checks it). Fills don't need to pass text contrast, but marks that carry meaning do.
- **Motion**, if you animate (a jar wobbling when added): short, once, and nothing under `prefers-reduced-motion: reduce`.

## Dark mode

Decide one of two strategies and write it in `ILLUSTRATION.md`:

1. **Swap paper and ink** (Pantry): a dark palette with `dark: true` (the engine then turns off multiply blending, which muddies colors on dark backgrounds), light ink, same accents. Anything printed on "paper" inside the drawing (labels) keeps dark marks.
2. **Keep illustrations on their own light card** in dark mode: simpler, and right when the language depends on paper texture.

Check both modes in the specimen (`--dark`) and in the app.

## Weight and performance

- Keep each SVG under ~40 KB (the specimen checks it). Fewer points per shape (`ellipsePts(..., 16)`) and no invisible shapes are the main levers.
- Render on the server when possible; it's a pure function of the seed, so it caches perfectly (by seed, slot and size).
- In long lists, render each distinct item once and reuse it (same seed, same SVG).
- Share images and app icons: export PNGs at build time (`scripts/export.mjs`). Social networks don't accept SVG.
- Inline SVG ids must not collide between different drawings on the same page. The engine namespaces them by seed, size and style. If you add your own `<defs>`, do the same.
