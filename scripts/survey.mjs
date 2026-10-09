#!/usr/bin/env node
// Relevamiento del proyecto para diseñar su lenguaje de ilustración: los colores y tipografías
// de la marca, las imágenes que ya tiene y, sobre todo, los lugares que hoy piden una imagen
// (estados vacíos, avatares con iniciales, 404, onboarding, imagen para compartir, relleno).
//
// Uso: node survey.mjs <proyecto>
// Imprime un resumen y escribe <proyecto>/.motif/survey.json.

import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(process.argv[2] || '.');
const SKIP = new Set(['node_modules', '.git', '.next', 'dist', 'build', 'out', '.motif', '.vercel', 'coverage', '.turbo', '.cache']);
const CODE = /\.(jsx?|tsx?|vue|svelte|astro|html|mdx?)$/;
const STYLE = /\.(css|scss|sass|less)$/;
const IMG = /\.(svg|png|jpe?g|webp|gif|avif)$/i;

const files = [];
(function walk(dir, depth = 0) {
  if (depth > 8) return;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP.has(e.name) || (e.name.startsWith('.') && e.name !== '.storybook')) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, depth + 1);
    else files.push(p);
  }
})(root);
const rel = (p) => path.relative(root, p);
const read = (p) => { try { return fs.statSync(p).size < 400_000 ? fs.readFileSync(p, 'utf8') : ''; } catch { return ''; } };

// --- Marca: colores, tipografías, radios ---
const colors = new Map();
const fonts = new Set();
const radii = new Map();
for (const f of files.filter((f) => STYLE.test(f) || CODE.test(f) || /tailwind\.config|theme\.(js|ts)/.test(f))) {
  const s = read(f);
  for (const m of s.matchAll(/--([\w-]+)\s*:\s*(#[0-9a-f]{3,8}\b|rgba?\([^)]+\)|hsla?\([^)]+\)|oklch\([^)]+\))/gi)) colors.set(m[1], m[2]);
  for (const m of s.matchAll(/["']?([\w-]+)["']?\s*:\s*["'](#[0-9a-f]{6})["']/gi)) if (!colors.has(m[1])) colors.set(m[1], m[2]);
  for (const m of s.matchAll(/font-family\s*:\s*([^;}{]+)/gi)) fonts.add(m[1].trim().replace(/\s+/g, ' ').slice(0, 80));
  for (const m of s.matchAll(/next\/font\/(?:google|local)['"][^]*?\{\s*([A-Z][\w_]+)/g)) fonts.add(m[1]);
  for (const m of s.matchAll(/border-radius\s*:\s*([\d.]+(px|rem))/gi)) radii.set(m[1], (radii.get(m[1]) || 0) + 1);
}

// --- Imágenes que ya existen ---
const images = files.filter((f) => IMG.test(f)).map(rel);
const brandAssets = images.filter((f) => /logo|brand|mark|icon|mascot|character|illustr/i.test(f));

// --- Lugares que piden ilustración ---
const SLOTS = [
  ['empty', /(no hay|todav[ií]a no|vac[ií][oa]|sin resultados|nada (por|para)|empty|nothing (here|yet|to)|no (items|results|data|entries)|get started by|start by adding)/i],
  ['avatar', /(avatar|initials|iniciales|charAt\(0\)|\[0\]\.toUpperCase|profile-?pic|userImage)/i],
  ['notFound', /(not[-_ ]?found|404|p[aá]gina no encontrada|page not found)/i],
  ['onboarding', /(onboarding|welcome|bienvenid[oa]|get started|empezar|first[-_ ]run)/i],
  ['og', /(og:image|opengraph-image|twitter:image|openGraph\s*:)/i],
  ['error', /(something went wrong|algo sali[oó] mal|error boundary|errorBoundary|try again|reintentar)/i],
  ['placeholder', /(placeholder\.(com|co)|picsum\.photos|unsplash\.com|placehold|lorem ?picsum|dummyimage)/i],
  ['success', /(¡listo|listo!|all done|you'?re all set|success|completad[oa]|enviado)/i],
];
const slots = Object.fromEntries(SLOTS.map(([k]) => [k, []]));
for (const f of files.filter((f) => CODE.test(f) && !/\.test\.|\.spec\.|stories/.test(f))) {
  const lines = read(f).split('\n');
  lines.forEach((line, i) => {
    for (const [k, re] of SLOTS) {
      if (re.test(line) && slots[k].length < 12) slots[k].push({ file: rel(f), line: i + 1, text: line.trim().slice(0, 110) });
    }
  });
}
// Rutas especiales que existen como archivo.
for (const f of files.map(rel)) {
  if (/(^|\/)(not-found|404)\.(t|j)sx?$|404\.html$/.test(f)) slots.notFound.unshift({ file: f, line: 1, text: '(archivo de 404)' });
  if (/opengraph-image|og-image|og\.(png|jpe?g)/i.test(f)) slots.og.unshift({ file: f, line: 1, text: '(imagen OG existente)' });
}

// --- Producto: lo que el proyecto dice de sí mismo ---
const docs = files.filter((f) => /(^|\/)(README|PRODUCT|DESIGN|BRAND|AGENTS|CLAUDE)\.md$/i.test(rel(f))).map(rel);
const pkg = (() => { try { return JSON.parse(read(path.join(root, 'package.json'))); } catch { return null; } })();
const stack = pkg ? Object.keys({ ...pkg.dependencies, ...pkg.devDependencies }).filter((d) => /^(next|react|vue|svelte|astro|@sveltejs\/kit|nuxt|tailwindcss|three|framer-motion|motion|lottie)/.test(d)) : [];

const survey = {
  root, stack, docs,
  brand: { colors: Object.fromEntries([...colors].slice(0, 40)), fonts: [...fonts].slice(0, 10), radii: [...radii].sort((a, b) => b[1] - a[1]).slice(0, 5).map(([v]) => v) },
  images: { total: images.length, brand: brandAssets.slice(0, 20), sample: images.slice(0, 20) },
  slots,
};
fs.mkdirSync(path.join(root, '.motif'), { recursive: true });
fs.writeFileSync(path.join(root, '.motif', 'survey.json'), JSON.stringify(survey, null, 2));

console.log(`\nmotif · ${path.basename(root)}${stack.length ? ' · ' + stack.join(', ') : ''}\n`);
console.log(`Colores (${colors.size}): ${[...colors].slice(0, 12).map(([k, v]) => `${k} ${v}`).join(' · ') || '—'}`);
console.log(`Tipografías: ${[...fonts].slice(0, 4).join(' | ') || '—'}`);
console.log(`Imágenes: ${images.length} (de marca: ${brandAssets.slice(0, 6).join(', ') || 'ninguna'})`);
console.log(`Docs: ${docs.join(', ') || '—'}\n`);
console.log('Lugares que piden ilustración:');
const NAMES = { empty: 'Estados vacíos', avatar: 'Avatares', notFound: '404', onboarding: 'Onboarding', og: 'Imagen para compartir', error: 'Errores', placeholder: 'Imágenes de relleno', success: 'Éxito / listo' };
for (const [k, list] of Object.entries(slots)) {
  console.log(`  ${list.length ? '●' : '○'} ${NAMES[k]}${list.length ? `: ${list.length}` : ''}`);
  for (const s of list.slice(0, 3)) console.log(`      ${s.file}:${s.line}  ${s.text}`);
}
console.log(`\n${path.relative(process.cwd(), path.join(root, '.motif', 'survey.json'))}`);
