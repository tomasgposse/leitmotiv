# Slots: where a product needs images, and what each one is for

`survey.mjs` finds most of these in the code. Not every product needs all of them. Pick the ones the person's users actually see often, and do those well.

| Slot | Typical size | Its job | What to draw | Seed |
|---|---|---|---|---|
| **Item glyph** (list rows, cards) | 24–48 px | Recognize a thing at a glance | The thing itself, from the product's world, chosen by keywords of its name | The item's name or id |
| **Avatar** | 24–48 px | Tell people apart | A character or object per person, with distinct color and shape inside a group | The person's id or name, plus the group (`among`) |
| **Empty state** | 240–360 px wide | Show what will be here and invite the first action | The place where things will go, with one open slot pointing to the action | The container's id (a list, a project) and the mood |
| **Done / success** | 240–360 px | Reward finishing, quietly | The same place, full or complete | Same as empty, mood `done` |
| **Error** | 240–360 px | Say something went wrong without alarm | The world slightly off (a tipped jar, a cut cable). Never a sad face on a serious error | Fixed per error type |
| **404** | 240–360 px | Turn a dead end into a smile and a way back | Something lost or fallen in the product's world | Fixed |
| **Onboarding** | 280–400 px | Show the promise of each step | One scene per step, each with the objects that step is about | The step |
| **Covers** (lists, projects, collections, weeks) | 300–600 px wide | Make each collection recognizable, and nicer than a grey header | A collage of that collection's own contents | The collection's id or title, plus its items |
| **Share image (OG)** | 1200 × 630 | Make a shared link look like the product | Title in the brand font on one side, a cluster of the world on the other | The page or the invite |
| **Placeholders** for user content (no photo yet) | Varies | Hold the space with something better than grey | A cover-like composition from the record's data | The record's id |
| **App icon / favicon** | 16–1024 px | Be the product in a tiny square | One motif, the boldest, at most two colors | Fixed |

## Notes per slot

- **Item glyphs** need a mapping from names to motifs. Use keyword rules in the product's languages, with accents removed before matching. Order matters ("puré de tomate" is a can before it is a tomato), and one default motif covers everything unknown. Test the mapping with real item names from the app's data.
- **Avatars** replace initials only if identity is preserved: distinct per group, stable over time, and the name still available as text.
- **Empty states**: the illustration goes above a heading that says what will appear here, one sentence about why it's useful, and a primary button. The illustration's open slot visually points at that button.
- **Covers** are the slot where seeds shine: every list looks different and stays the same forever. Draw the collection's actual items when you have them.
- **Share images** must be PNG for social networks. Export them at build time, or per page on the server.
- **Don't fill every gap.** A settings screen doesn't need a picture. Illustration everywhere stops being special.
