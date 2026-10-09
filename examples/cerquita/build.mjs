// Arma index.html con el lenguaje de Cerquita y, con --shot, la imagen para el README.
// node build.mjs [--shot]

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { palette, countdown, placeCover, emptyMemories, emptyTrips, avatar, og } from './cerquita-art.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const INK = palette.ink;
const days = [30, 14, 6, 1, 0];
const places = ['Café Martínez', 'Parque Sarmiento', 'Cine Gaumont', 'Parrilla Don Julio'];

const html = `<!doctype html><html lang="es"><meta charset="utf-8"><title>Cerquita · leitmotiv</title>
<style>
  body { margin: 0; background: ${palette.paper}; color: ${INK}; font: 15px/1.45 system-ui, sans-serif; }
  main { max-width: 1180px; margin: 0 auto; padding: 48px 40px 56px; }
  h1, h2 { font-family: ${palette.font}; font-weight: 700; margin: 0; }
  h1 { font-size: 34px; } h2 { font-size: 19px; margin: 40px 0 6px; }
  p.lead { margin: 6px 0 0; color: #4c6b5e; max-width: 720px; }
  p.note { margin: 0 0 16px; color: #4c6b5e; font-size: 14px; }
  .row { display: flex; gap: 14px; flex-wrap: wrap; align-items: flex-end; }
  .cd { box-sizing: border-box; background: #fde3a0; border-radius: 20px; padding: 14px 10px 10px; text-align: center; width: 206px; }
  .cd svg { width: 186px; height: auto; display: block; margin: 0 auto 6px; }
  .cd b { font-family: ${palette.font}; font-size: 17px; }
  figure { margin: 0; } figcaption { font-size: 13px; color: #4c6b5e; margin-top: 6px; }
  .places svg { width: 216px; height: auto; display: block; }
  .two { display: grid; grid-template-columns: 1fr 1fr 1.6fr; gap: 18px; align-items: start; }
  .card { background: #fff; border-radius: 18px; padding: 18px; box-shadow: 0 1px 0 #0001; }
  .card svg { width: 100%; height: auto; display: block; }
  .card h3 { font-family: ${palette.font}; font-size: 16px; margin: 8px 0 2px; }
  .card p { margin: 0; font-size: 13px; color: #4c6b5e; }
  .og > svg { width: 100%; height: auto; display: block; border-radius: 12px; }
  .us { display: flex; gap: 10px; align-items: center; margin-top: 14px; font-family: ${palette.font}; }
</style>
<main>
  <h1>Cerquita</h1>
  <p class="lead">Una app para parejas a distancia. Su mundo es lo que viaja entre dos personas: tazas, pasajes, valijas, cartas y la flor del logo. La mano es la de sus íconos: una línea verde y rellenos suaves, sin textura. Y donde hay un dato que importa, el dibujo lo muestra.</p>

  <h2>El contador, dibujado con el dato</h2>
  <p class="note">Las tazas están más cerca cuanto menos falta. Los puntos son las semanas. El día del encuentro brindan.</p>
  <div class="row">${days.map((d) => `<div class="cd">${countdown(d)}<b>${d ? `Faltan ${d} ${d === 1 ? 'día' : 'días'}` : '¡Hoy nos vemos!'}</b></div>`).join('')}</div>

  <h2>Nuestros lugares</h2>
  <p class="note">Cada lugar guardado tiene su portada, según qué tipo de lugar es. La semilla es el nombre.</p>
  <div class="row places">${places.map((p) => `<figure>${placeCover(p)}<figcaption>${p}</figcaption></figure>`).join('')}</div>

  <h2>Vacíos y para compartir</h2>
  <div class="two">
    <div class="card">${emptyMemories()}<h3>Todavía no hay recuerdos</h3><p>Subí la primera foto de los dos.</p></div>
    <div class="card">${emptyTrips()}<h3>Ningún viaje en el calendario</h3><p>Elegí la fecha del próximo.</p></div>
    <div class="og">${og({ days: 6 })}
      <div class="us">${avatar('Tomi', { size: 34, among: ['Tomi', 'Cami'] })} Tomi ${avatar('Cami', { size: 34, among: ['Tomi', 'Cami'] })} Cami</div>
    </div>
  </div>
</main></html>`;

fs.writeFileSync(path.join(here, 'index.html'), html);
console.log('index.html');

if (process.argv.includes('--shot')) {
  const { open } = await import('../../scripts/lib/browser.mjs');
  const b = await open({ width: 1180, height: 900, scale: 2 });
  await b.goto('file://' + path.join(here, 'index.html'));
  await b.screenshot(path.join(here, '../../docs/cerquita.png'));
  await b.close();
  console.log('docs/cerquita.png');
}
