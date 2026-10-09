#!/usr/bin/env node
// Arma index.html: la app de Pantry con su lenguaje de ilustración aplicado, al lado de cómo
// estaba antes (la última captura de designdiff). Las ilustraciones se generan acá, en Node,
// y quedan escritas en el HTML: el mismo código sirve en el navegador o en el servidor.
//
// Uso: node build.mjs

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { itemGlyph, avatar, emptyState, cover, og, notFound } from './pantry-art.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const house = ['Ana', 'Mateo', 'Lu'];
const list = [['Oat milk ×2', 'Ana'], ['Bananas', 'Mateo'], ['Dish soap', 'Lu'], ['Coffee beans', 'Ana']];
const bought = [['Bread', 'Mateo']];
const weeks = [
  ['Semana del 6', ['oat milk', 'bananas', 'coffee', 'bread', 'tomatoes', 'soap']],
  ['Asado del sábado', ['tomatoes', 'bread', 'lemon', 'tuna', 'rice']],
  ['Semana del 29', ['oat milk', 'coffee', 'lentils', 'apple', 'yerba']],
];

const phone = (inner, cls = '') => `<div class="phone ${cls}"><div class="screen">${inner}</div></div>`;
const tabbar = (active) => `<nav>${['List', 'History', 'Home'].map((t) => `<span${t === active ? ' class="on"' : ''}>${t}</span>`).join('')}</nav>`;

const listScreen = phone(`
  <header><h1>Pantry</h1>
    <p class="who"><span class="stack">${house.map((p) => avatar(p, { size: 28, among: house })).join('')}</span>4 to buy · Ana, Mateo and Lu</p></header>
  <div class="pill">Daily summary at 6 pm <span>On</span></div>
  <ul class="items">
    ${list.map(([item, who]) => `<li><span class="box"></span><span class="glyph">${itemGlyph(item, { size: 40 })}</span><span class="name">${item}</span>${avatar(who, { size: 30, among: house })}</li>`).join('')}
    ${bought.map(([item, who]) => `<li class="done"><span class="box on"></span><span class="glyph">${itemGlyph(item, { size: 40 })}</span><span class="name">${item} · bought by ${who}</span>${avatar(who, { size: 30, among: house })}</li>`).join('')}
  </ul>
  <button class="fab">+</button>
  ${tabbar('List')}`);

const emptyScreen = phone(`
  <header><h1>Departamento nuevo</h1><p class="who"><span class="stack">${avatar('Tomi', { size: 28 })}</span>Solo vos, por ahora</p></header>
  <div class="empty">
    ${emptyState({ seed: 'Departamento nuevo', mood: 'empty' })}
    <h2>Todavía no falta nada</h2>
    <p>Cuando algo se termine en la casa, anotalo acá y le avisamos a todos.</p>
    <button class="cta">Agregar lo primero</button>
  </div>
  ${tabbar('List')}`);

const historyScreen = phone(`
  <header><h1>History</h1><p class="who">Lo que compraron juntos</p></header>
  <div class="weeks">${weeks.map(([t, items]) => `<article>${cover(t, { items, w: 600, h: 240 })}<h3>${t}</h3><p>${items.length} cosas · ${['Ana', 'Mateo', 'Lu'][t.length % 3]} hizo la compra</p></article>`).join('')}</div>
  ${tabbar('History')}`);

const html = `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Pantry · lenguaje de ilustración</title>
<style>
  :root { --paper: #f5f0e6; --ink: #2b4636; --ink2: #6f6a5e; --line: #e2d9c8; --bg: #ebe5d8; }
  * { box-sizing: border-box; }
  body { margin: 0; background: var(--bg); color: #1f2a22; font: 15px/1.45 "Segoe UI", system-ui, sans-serif; }
  main { max-width: 1340px; margin: 0 auto; padding: 48px 24px 72px; }
  .kicker { font: 600 12px ui-monospace, monospace; letter-spacing: .14em; text-transform: uppercase; color: var(--ink2); }
  .lead h1 { font-size: 40px; line-height: 1.05; margin: 8px 0 10px; color: var(--ink); letter-spacing: -.02em; }
  .lead p { max-width: 62ch; color: #4d4a42; margin: 0; }
  .row { display: flex; gap: 20px; align-items: flex-start; margin-top: 36px; flex-wrap: wrap; }
  .col { display: flex; flex-direction: column; gap: 10px; }
  .label { font-size: 13px; color: var(--ink2); }
  .phone { width: 300px; height: 650px; border-radius: 40px; background: #1d1f1c; padding: 10px; box-shadow: 0 30px 60px -30px rgba(40,40,30,.45); }
  .screen { position: relative; height: 100%; border-radius: 31px; overflow: hidden; background: var(--paper); padding: 34px 18px 0; }
  .before img { width: 100%; height: 100%; object-fit: cover; object-position: top; display: block; }
  .before .screen { padding: 0; }
  header h1 { font-size: 28px; margin: 18px 0 4px; letter-spacing: -.02em; color: #1f2a22; }
  .who { margin: 0 0 14px; color: var(--ink2); font-size: 13px; display: flex; align-items: center; gap: 8px; }
  .stack { display: inline-flex; } .stack svg { margin-right: -8px; border-radius: 50%; box-shadow: 0 0 0 2px var(--paper); }
  .stack svg:last-child { margin-right: 0; }
  .pill { background: #ebe3d3; border-radius: 14px; padding: 12px 14px; font-size: 14px; display: flex; justify-content: space-between; margin-bottom: 4px; }
  .pill span { color: var(--ink2); }
  .items { list-style: none; margin: 0; padding: 0; }
  .items li { display: flex; align-items: center; gap: 10px; padding: 9px 0; border-bottom: 1px solid var(--line); }
  .items .box { width: 20px; height: 20px; border: 2px solid #c4b8a3; border-radius: 6px; flex: none; }
  .items .box.on { background: var(--ink); border-color: var(--ink); }
  .items .glyph { flex: none; display: flex; } .items .name { flex: 1; font-size: 15px; }
  .items li.done .name { color: #9a9284; text-decoration: line-through; }
  .items li.done .glyph { opacity: .55; }
  .items li > svg:last-child { flex: none; border-radius: 50%; }
  .fab { position: absolute; right: 18px; bottom: 72px; width: 54px; height: 54px; border-radius: 50%; border: 0; background: var(--ink); color: #fff; font-size: 28px; }
  nav { position: absolute; left: 0; right: 0; bottom: 0; display: flex; justify-content: space-around; padding: 14px 0 18px; border-top: 1px solid var(--line); background: var(--paper); font-size: 12px; color: var(--ink2); }
  nav .on { color: var(--ink); font-weight: 600; }
  .empty { text-align: center; margin-top: 40px; } .empty svg { width: 100%; height: auto; }
  .empty h2 { font-size: 19px; margin: 6px 0 6px; color: #1f2a22; } .empty p { color: var(--ink2); font-size: 14px; margin: 0 12px 18px; }
  .cta { border: 0; background: var(--ink); color: #fff; font: 600 15px inherit; padding: 13px 20px; border-radius: 14px; width: 100%; }
  .weeks { display: flex; flex-direction: column; gap: 14px; }
  .weeks svg { width: 100%; height: auto; display: block; border-radius: 12px; }
  .weeks h3 { font-size: 15px; margin: 8px 0 0; } .weeks p { margin: 0; color: var(--ink2); font-size: 12px; }
  .share { display: flex; gap: 28px; margin-top: 40px; flex-wrap: wrap; align-items: flex-start; }
  .og { width: 600px; max-width: 100%; border-radius: 14px; overflow: hidden; box-shadow: 0 20px 40px -24px rgba(40,40,30,.4); background: #fff; }
  .og svg { width: 100%; height: auto; display: block; } .og .meta { padding: 10px 14px 12px; font-size: 13px; color: #555; } .og b { color: #222; display: block; font-size: 14px; }
  .nf { width: 360px; background: var(--paper); border-radius: 14px; padding: 18px; text-align: center; } .nf svg { width: 100%; height: auto; }
  .nf h3 { margin: 0; font-size: 22px; } .nf p { margin: 4px 0 0; color: var(--ink2); font-size: 13px; }
</style></head><body><main>
  <div class="lead"><span class="kicker">motif · ejemplo</span>
    <h1>Pantry, con su propio lenguaje de ilustración</h1>
    <p>La casa vista desde la alacena: frascos, cartones y frutas impresos como en riso. Cada producto de la lista, cada conviviente, la lista vacía, el historial y la imagen para compartir salen del mismo generador, a partir de su nombre. Sin stock, sin imágenes generadas con IA, siempre iguales para la misma semilla.</p></div>
  <div class="row">
    <div class="col"><span class="label">Antes · la última versión en designdiff</span>${phone('<img src="antes-designdiff.png" alt="Pantry antes: iniciales en círculos de color, sin ilustraciones">', 'before')}</div>
    <div class="col"><span class="label">Después · la lista</span>${listScreen}</div>
    <div class="col"><span class="label">Una lista nueva, vacía</span>${emptyScreen}</div>
    <div class="col"><span class="label">El historial</span>${historyScreen}</div>
  </div>
  <div class="share">
    <div class="col"><span class="label">Al compartir la invitación</span><div class="og">${og({ title: 'Pantry', subtitle: 'Ana te invitó a la lista de la casa' })}<div class="meta"><b>Sumate a la lista de la casa</b>pantry.app/invite/ana</div></div></div>
    <div class="col"><span class="label">404</span><div class="nf">${notFound()}<h3>Acá no hay nada</h3><p>Esta página se cayó del estante.</p></div></div>
  </div>
</main></body></html>`;

fs.writeFileSync(path.join(here, 'index.html'), html);
console.log(`index.html · ${(Buffer.byteLength(html) / 1024).toFixed(0)} KB`);
