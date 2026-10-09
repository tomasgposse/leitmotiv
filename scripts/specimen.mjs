#!/usr/bin/env node
// Hoja de muestra de un lenguaje de ilustración: renderiza todo lo que exporta specimen() del
// generador, en uno o varios estilos, lo captura y revisa que el sistema se porte bien.
//
// Uso: node specimen.mjs <generador.mjs> [--styles riso,line,blocks] [--out .motif] [--dark]
// --dark pide specimen(style, { dark: true }) y muestra la hoja sobre fondo oscuro.
// Escribe <out>/specimen.html, <out>/specimen.png y <out>/checks.json.

import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { open } from './lib/browser.mjs';

const args = process.argv.slice(2);
const opt = (k, d) => (args.includes(k) ? args[args.indexOf(k) + 1] : d);
const file = args.find((a) => a.endsWith('.mjs') || a.endsWith('.js'));
if (!file) { console.error('Uso: node specimen.mjs <generador.mjs> [--styles riso,line,blocks] [--out .motif] [--dark]'); process.exit(1); }
const styles = opt('--styles', 'riso').split(',');
const out = path.resolve(opt('--out', '.motif'));
fs.mkdirSync(out, { recursive: true });

const art = await import(pathToFileURL(path.resolve(file)).href);
if (typeof art.specimen !== 'function') { console.error(`${file} no exporta specimen(style).`); process.exit(1); }

// --- Revisiones ---
const checks = [];
const check = (ok, what, detail = '') => checks.push({ ok, what, detail });

const dark = args.includes('--dark');
const sheets = styles.map((style) => ({ style, groups: art.specimen(style, { dark }) }));

// La misma semilla tiene que dar siempre el mismo dibujo.
const again = JSON.stringify(art.specimen(styles[0], { dark }));
check(again === JSON.stringify(sheets[0].groups), 'Determinista', 'la misma semilla da el mismo SVG');

// Dentro de cada grupo, semillas distintas tienen que dar dibujos distintos.
for (const g of sheets[0].groups) {
  const uniq = new Set(g.items.map((i) => i.svg)).size;
  check(uniq === g.items.length || g.items.length < 2, `Variedad: ${g.group}`, `${uniq} distintos de ${g.items.length}`);
}

// Los ids internos (filtros, recortes) no pueden chocar entre dibujos distintos en la misma página.
const owner = new Map();
let clash = 0;
for (const s of sheets) for (const g of s.groups) for (const it of g.items) {
  for (const m of it.svg.matchAll(/id="([^"]+)"/g)) {
    const prev = owner.get(m[1]);
    if (prev && prev !== it.svg) clash++;
    owner.set(m[1], it.svg);
  }
}
check(clash === 0, 'Ids únicos', clash ? `${clash} ids repetidos entre dibujos distintos` : 'sin choques');

// Peso: una ilustración de interfaz no debería pesar más que una foto chica.
const sizes = sheets.flatMap((s) => s.groups.flatMap((g) => g.items.map((i) => ({ label: `${s.style} · ${i.label}`, kb: Buffer.byteLength(i.svg) / 1024 }))));
const heavy = sizes.filter((x) => x.kb > 40);
check(!heavy.length, 'Peso', heavy.length ? heavy.map((x) => `${x.label}: ${x.kb.toFixed(0)} KB`).join(', ') : `máx ${Math.max(...sizes.map((x) => x.kb)).toFixed(1)} KB`);

// Contraste entre la tinta y el papel (si el generador exporta su paleta).
if (art.palette?.ink && art.palette?.paper) {
  const lum = (hex) => { const c = hex.replace('#', '').match(/../g).map((v) => parseInt(v, 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; };
  const [a, b] = [lum(art.palette.ink), lum(art.palette.paper)].sort((x, y) => y - x);
  const ratio = (a + 0.05) / (b + 0.05);
  check(ratio >= 4.5, 'Contraste tinta/papel', `${ratio.toFixed(1)}:1`);
}

// --- La página ---
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const html = `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>motif · hoja de muestra</title>
<style>
  :root { color-scheme: light; --bg: #fbfaf7; --ink: #1d1d1b; --ink2: #66645e; --line: #e7e3da; }
  @media (prefers-color-scheme: dark) { :root { color-scheme: dark; --bg: #1b1b1a; --ink: #f4f2ec; --ink2: #b4b1a8; --line: #34332f; } }
  * { box-sizing: border-box; } body { margin: 0; background: var(--bg); color: var(--ink); font: 14px/1.5 system-ui, sans-serif; }
  main { max-width: 1240px; margin: 0 auto; padding: 40px 24px 64px; }
  h1 { font-size: 28px; margin: 0 0 4px; } .sub { color: var(--ink2); margin: 0 0 8px; }
  .checks { display: flex; flex-wrap: wrap; gap: 8px; margin: 16px 0 8px; padding: 0; list-style: none; }
  .checks li { border: 1px solid var(--line); border-radius: 99px; padding: 4px 12px; font-size: 13px; }
  .checks li.bad { border-color: #d0453b; color: #d0453b; }
  .style { margin-top: 40px; } .style > h2 { font-size: 20px; margin: 0 0 4px; text-transform: capitalize; }
  h3 { font-size: 13px; color: var(--ink2); font-weight: 600; margin: 24px 0 10px; letter-spacing: .02em; }
  .grid { display: flex; flex-wrap: wrap; gap: 16px; align-items: flex-end; }
  figure { margin: 0; } figure svg { display: block; max-width: 100%; height: auto; }
  figcaption { font-size: 12px; color: var(--ink2); margin-top: 6px; }
  .big svg { width: 560px; } .wide svg { width: 600px; } .og svg { width: 720px; }
  .small { display: flex; gap: 10px; align-items: center; margin-top: 8px; }
</style></head><body><main>
<h1>Hoja de muestra</h1>
<p class="sub">${esc(path.basename(file))} · ${styles.join(' · ')}</p>
<ul class="checks">${checks.map((c) => `<li class="${c.ok ? '' : 'bad'}">${c.ok ? '✓' : '✗'} ${esc(c.what)} <span style="color:var(--ink2)">${esc(c.detail)}</span></li>`).join('')}</ul>
${sheets.map((s) => `<section class="style"><h2>${esc(s.style)}</h2>
${s.groups.map((g) => {
  const w = g.items[0]?.svg.match(/viewBox="0 0 (\d+) (\d+)"/);
  const cls = w && +w[1] >= 1000 ? 'og' : w && +w[1] >= 500 ? 'wide' : w && +w[1] >= 300 ? 'big' : '';
  return `<h3>${esc(g.group)}</h3><div class="grid">${g.items.map((it) => `<figure class="${cls}">${it.svg}<figcaption>${esc(it.label)}</figcaption></figure>`).join('')}</div>`
    + (g.small ? '' : '');
}).join('')}
</section>`).join('')}
</main></body></html>`;
fs.writeFileSync(path.join(out, 'specimen.html'), html);
fs.writeFileSync(path.join(out, 'checks.json'), JSON.stringify(checks, null, 2));

// --- Captura ---
const page = await open({ width: 1280, height: 900, scale: 1, dark });
try {
  await page.goto(pathToFileURL(path.join(out, 'specimen.html')).href);
  await page.screenshot(path.join(out, 'specimen.png'));
} finally {
  await page.close();
}

for (const c of checks) console.log(`${c.ok ? '✓' : '✗'} ${c.what}: ${c.detail}`);
console.log(`\n${path.relative(process.cwd(), path.join(out, 'specimen.png'))}`);
process.exitCode = checks.every((c) => c.ok) ? 0 : 1;
