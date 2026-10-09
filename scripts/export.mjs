#!/usr/bin/env node
// Exporta una pieza del generador a PNG: para la imagen OG (las redes no aceptan SVG), íconos
// de la app o cualquier lugar donde haga falta un archivo de imagen.
//
// Uso: node export.mjs <generador.mjs> <función> '[argumentos en JSON]' --out public/og.png [--scale 1]
// Ejemplo: node export.mjs pantry-art.mjs og '[{"title":"Pantry"}]' --out public/og.png

import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { open } from './lib/browser.mjs';

const args = process.argv.slice(2);
const opt = (k, d) => (args.includes(k) ? args[args.indexOf(k) + 1] : d);
const [file, fn, json = '[]'] = args.filter((a, i) => !a.startsWith('--') && !args[i - 1]?.startsWith('--'));
const outFile = opt('--out');
if (!file || !fn || !outFile) {
  console.error('Uso: node export.mjs <generador.mjs> <función> \'[argumentos en JSON]\' --out archivo.png [--scale 1]');
  process.exit(1);
}
const art = await import(pathToFileURL(path.resolve(file)).href);
if (typeof art[fn] !== 'function') { console.error(`${file} no exporta ${fn}(). Exporta: ${Object.keys(art).join(', ')}`); process.exit(1); }
const svg = art[fn](...JSON.parse(json));
const m = svg.match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/);
const [w, h] = m ? [Math.round(+m[1]), Math.round(+m[2])] : [1200, 630];
const scale = Number(opt('--scale', 1));

const tmp = path.join(path.dirname(path.resolve(outFile)), `.leitmotiv-export-${process.pid}.html`);
fs.mkdirSync(path.dirname(tmp), { recursive: true });
fs.writeFileSync(tmp, `<!doctype html><meta charset="utf-8"><style>html,body{margin:0;background:transparent}svg{display:block;width:${w}px;height:${h}px}</style>${svg}`);
const page = await open({ width: w, height: h, scale });
try {
  await page.goto(pathToFileURL(tmp).href);
  await page.send('Emulation.setDefaultBackgroundColorOverride', { color: { r: 0, g: 0, b: 0, a: 0 } });
  const { data } = await page.send('Page.captureScreenshot', { format: 'png', clip: { x: 0, y: 0, width: w, height: h, scale: 1 } });
  fs.mkdirSync(path.dirname(path.resolve(outFile)), { recursive: true });
  fs.writeFileSync(outFile, Buffer.from(data, 'base64'));
} finally {
  await page.close();
  fs.rmSync(tmp, { force: true });
}
console.log(`${outFile} · ${w * scale}×${h * scale}`);
