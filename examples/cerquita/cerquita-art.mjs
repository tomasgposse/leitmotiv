// El lenguaje de ilustración de Cerquita, una app para parejas a distancia (Córdoba – Buenos Aires).
// La idea: lo que viaja entre dos personas. Dos tazas, un pasaje, una valija, una carta, la flor
// del logo, los lugares que comparten. Dibujado como sus íconos: una línea verde, rellenos suaves,
// sin textura. Y donde hay un dato que importa (los días que faltan), el dibujo lo muestra.

import { canvas, rng, ellipsePts, roundRectPts, polyPts, mix } from '../../templates/engine.mjs';

export const palette = {
  paper: '#fdf7ec',
  ink: '#1d4a3a',
  // Manteca, flor, rosa, salvia, cielo: los de la tarjeta del contador y los fondos de la app.
  accents: ['#fde3a0', '#f5c518', '#f4d2cc', '#cfe0c9', '#d6e6f2'],
  font: 'Georgia, "Times New Roman", serif',
};
const [BUTTER, FLOWER, BLUSH, SAGE, SKY] = palette.accents;
const PAPER = palette.paper;

// Una mano propia: la línea de los íconos de la app, con rellenos planos y un temblor mínimo.
export const HAND = { wobble: 0.009, fill: true, ink: 0.02, offset: 0, grain: false, blend: false };
const STYLE = (style) => (style === 'line' || style === 'blocks' || style === 'riso' ? style : HAND);

// --- Lo que viaja entre dos personas ---

function mug(c, b, { fill = BUTTER, flip = false, steam = true } = {}) {
  const { x, y, w, h } = b;
  const bx = flip ? x + w * 0.22 : x;
  c.shape(roundRectPts(bx, y + h * 0.3, w * 0.78, h * 0.7, w * 0.12), { fill });
  // Asa del lado de afuera.
  const hx = flip ? bx : bx + w * 0.78;
  const dir = flip ? -1 : 1;
  c.stroke([[hx, y + h * 0.45], [hx + dir * w * 0.17, y + h * 0.47], [hx + dir * w * 0.19, y + h * 0.66], [hx, y + h * 0.75]], { width: 1 });
  if (steam) for (let i = 0; i < 2; i++) {
    const sx = bx + w * (0.28 + i * 0.24);
    c.stroke([[sx, y + h * 0.24], [sx - w * 0.05, y + h * 0.15], [sx + w * 0.03, y + h * 0.07], [sx - w * 0.02, y]], { width: 0.8 });
  }
}

export function flower(c, cx, cy, rad, { fill = FLOWER, petals = 5, rot = 0 } = {}) {
  for (let i = 0; i < petals; i++) {
    const a = rot + (i / petals) * Math.PI * 2;
    c.shape(ellipsePts(cx + Math.cos(a) * rad * 0.52, cy + Math.sin(a) * rad * 0.52, rad * 0.5, rad * 0.3, 14, a), { fill, inkScale: 0.8 });
  }
  c.shape(ellipsePts(cx, cy, rad * 0.26, rad * 0.26, 12), { fill: mix(FLOWER, '#c98a00', 0.35), inkScale: 0.8, layer: 'top' });
}

function ticket(c, b, r) {
  const { x, y, w, h } = b;
  c.shape(roundRectPts(x, y + h * 0.2, w, h * 0.6, h * 0.08), { fill: r.pick([SKY, BLUSH, BUTTER]) });
  c.stroke([[x + w * 0.68, y + h * 0.24], [x + w * 0.68, y + h * 0.76]], { width: 0.7 });
  c.stroke([[x + w * 0.1, y + h * 0.4], [x + w * 0.5, y + h * 0.4]], { width: 0.8 });
  c.stroke([[x + w * 0.1, y + h * 0.56], [x + w * 0.38, y + h * 0.56]], { width: 0.8 });
  // Avioncito o colectivo, según la semilla: una flecha alcanza.
  c.stroke([[x + w * 0.76, y + h * 0.5], [x + w * 0.9, y + h * 0.5], [x + w * 0.85, y + h * 0.42]], { width: 0.9 });
}

function suitcase(c, b, r) {
  const { x, y, w, h } = b;
  const fill = r.pick([BLUSH, SAGE, SKY]);
  c.shape(roundRectPts(x + w * 0.32, y, w * 0.36, h * 0.2, w * 0.06), { fill: null });
  c.shape(roundRectPts(x, y + h * 0.14, w, h * 0.8, w * 0.1), { fill });
  c.stroke([[x + w * 0.3, y + h * 0.2], [x + w * 0.3, y + h * 0.9]], { width: 0.8 });
  c.stroke([[x + w * 0.7, y + h * 0.2], [x + w * 0.7, y + h * 0.9]], { width: 0.8 });
  c.dot(x + w * 0.15, y + h * 0.97, w * 0.05); c.dot(x + w * 0.85, y + h * 0.97, w * 0.05);
}

function pin(c, b, fill = BLUSH) {
  const { x, y, w, h } = b;
  const cx = x + w / 2;
  c.shape([[cx, y + h], ...ellipsePts(cx, y + h * 0.36, w * 0.36, h * 0.34, 18).filter(([px, py]) => py < y + h * 0.56)].sort((a, bb) => Math.atan2(a[1] - (y + h * 0.4), a[0] - cx) - Math.atan2(bb[1] - (y + h * 0.4), bb[0] - cx)), { fill });
  c.shape(ellipsePts(cx, y + h * 0.36, w * 0.12, w * 0.12, 12), { fill: PAPER, inkScale: 0.8 });
}

function envelope(c, b, { open = false, fill = PAPER } = {}) {
  const { x, y, w, h } = b;
  c.shape(roundRectPts(x, y + h * 0.25, w, h * 0.75, w * 0.04), { fill });
  if (open) c.shape(polyPts([[x, y + h * 0.27], [x + w / 2, y - h * 0.12], [x + w, y + h * 0.27]], 4), { fill: mix(fill, BUTTER, 0.5) });
  c.stroke([[x + w * 0.02, y + h * 0.3], [x + w / 2, y + h * 0.66], [x + w * 0.98, y + h * 0.3]], { width: 0.9 });
}

function calendar(c, b, day) {
  const { x, y, w, h } = b;
  c.shape(roundRectPts(x, y + h * 0.1, w, h * 0.9, w * 0.08), { fill: PAPER });
  c.shape(roundRectPts(x, y + h * 0.1, w, h * 0.26, w * 0.08), { fill: BLUSH });
  c.stroke([[x + w * 0.28, y], [x + w * 0.28, y + h * 0.2]], { width: 1 });
  c.stroke([[x + w * 0.72, y], [x + w * 0.72, y + h * 0.2]], { width: 1 });
  if (day != null) c.text(String(day), x + w / 2, y + h * 0.82, { size: h * 0.42, weight: 700, anchor: 'middle' });
}

function table(c, x, y, w) {
  c.stroke([[x, y], [x + w, y]], { width: 1.1 });
}

// --- Composiciones ---

// El contador de la home, dibujado con el dato: dos tazas que se acercan a medida que faltan
// menos días. A 30 días o más están en las puntas; el día del encuentro se tocan, con la flor.
export function countdown(days, { style = 'cerquita', w = 360, h = 150, inkWidth = 2.2 } = {}) {
  const c = canvas({ w, h, size: 150, style: STYLE(style), palette, seed: `countdown:${days}`, inkWidth, grainScale: w, wobbleScale: 0.6 });
  const t = Math.max(0, Math.min(1, days / 30));
  const base = h * 0.86, mw = w * 0.17, mh = h * 0.42;
  const gap = (w * 0.66 - 2 * mw) * t; // distancia entre las tazas
  const left = (w - (2 * mw + gap)) / 2;
  table(c, w * 0.04, base, w * 0.92);
  // El día del encuentro las tazas se inclinan una hacia la otra: un brindis.
  const tilt = days <= 0 ? 10 : 0;
  c.group(`rotate(${tilt} ${left + mw} ${base})`, () => mug(c, { x: left, y: base - mh, w: mw, h: mh }, { fill: BUTTER, steam: true }));
  c.group(`rotate(${-tilt} ${left + mw + gap} ${base})`, () => mug(c, { x: left + mw + gap, y: base - mh, w: mw, h: mh }, { fill: BLUSH, flip: true, steam: true }));
  if (days <= 0) flower(c, w / 2, base - mh * 1.25, h * 0.13, { rot: 0.3 });
  else {
    // Puntos suspensivos entre las dos: tantos como semanas faltan (máximo 4).
    const dots = Math.min(4, Math.ceil(days / 7));
    for (let i = 0; i < dots && gap > w * 0.06; i++) c.dot(left + mw + gap * ((i + 1) / (dots + 1)), base - mh * 0.45, h * 0.012);
  }
  return c.svg({ bg: null });
}

// Portada de cada lugar guardado ("Nuestros lugares"): el objeto del tipo de lugar sobre un fondo suave.
const PLACE = [[/cafe|café|bar|bodegon/, 'cafe'], [/parque|plaza|rio|río|lago|playa|sierra/, 'park'], [/cine|teatro|museo|recital/, 'show'], [/resto|restaurant|parrilla|pizzeria|pizza/, 'food']];
export function placeCover(name, { kind = null, style = 'cerquita', w = 300, h = 180 } = {}) {
  const k = kind || (PLACE.find(([re]) => re.test(name.toLowerCase())) || [null, 'cafe'])[1];
  const c = canvas({ w, h, size: 180, style: STYLE(style), palette, seed: `place:${name}`, inkWidth: 2, grainScale: w, wobbleScale: 0.7 });
  const r = c.r;
  const bg = r.pick([BUTTER, BLUSH, SAGE, SKY]);
  c.shape(ellipsePts(w * r.float(0.42, 0.58), h * 0.56, w * 0.36, h * 0.4, 28, r.float(-0.3, 0.3)), { fill: mix(bg, PAPER, 0.15), ink: false, wobbleScale: 3 });
  if (k === 'cafe') { mug(c, { x: w * 0.32, y: h * 0.32, w: w * 0.17, h: h * 0.42 }); mug(c, { x: w * 0.53, y: h * 0.32, w: w * 0.17, h: h * 0.42 }, { fill: BLUSH, flip: true }); }
  if (k === 'park') { flower(c, w * 0.38, h * 0.48, h * 0.16); flower(c, w * 0.6, h * 0.38, h * 0.12, { fill: BLUSH, rot: 0.6 }); c.stroke([[w * 0.38, h * 0.62], [w * 0.4, h * 0.82]], { width: 1 }); c.stroke([[w * 0.6, h * 0.48], [w * 0.58, h * 0.82]], { width: 1 }); table(c, w * 0.22, h * 0.82, w * 0.56); }
  if (k === 'show') { ticket(c, { x: w * 0.3, y: h * 0.26, w: w * 0.4, h: h * 0.42 }, r); ticket(c, { x: w * 0.36, y: h * 0.44, w: w * 0.4, h: h * 0.42 }, r.fork('b')); }
  if (k === 'food') { c.shape(ellipsePts(w / 2, h * 0.6, w * 0.22, h * 0.14, 22), { fill: PAPER }); c.shape(ellipsePts(w / 2, h * 0.57, w * 0.13, h * 0.08, 18), { fill: BLUSH }); c.stroke([[w * 0.22, h * 0.42], [w * 0.22, h * 0.78]], { width: 1 }); c.stroke([[w * 0.78, h * 0.42], [w * 0.78, h * 0.78]], { width: 1 }); }
  pin(c, { x: w * 0.78, y: h * 0.1, w: w * 0.09, h: h * 0.22 }, FLOWER);
  return c.svg({ bg: PAPER, round: 14 });
}

// Recuerdos vacíos: un sobre abierto, una flor, y el marco punteado de la primera foto.
export function emptyMemories({ style = 'cerquita', w = 320, h = 200 } = {}) {
  const c = canvas({ w, h, size: 200, style: STYLE(style), palette, seed: 'memories', inkWidth: 2.2, grainScale: w, wobbleScale: 0.6 });
  table(c, w * 0.06, h * 0.86, w * 0.88);
  envelope(c, { x: w * 0.12, y: h * 0.5, w: w * 0.3, h: h * 0.36 }, { open: true, fill: PAPER });
  c.group(`rotate(-6 ${w * 0.62} ${h * 0.5})`, () => c.shape(roundRectPts(w * 0.5, h * 0.2, w * 0.26, h * 0.6, 6), { fill: null, dash: [0.035, 0.03] }));
  c.stroke([[w * 0.63, h * 0.43], [w * 0.63, h * 0.57]], { width: 1, always: true });
  c.stroke([[w * 0.59, h * 0.5], [w * 0.67, h * 0.5]], { width: 1, always: true });
  flower(c, w * 0.86, h * 0.72, h * 0.09, { fill: BLUSH, rot: 0.4 });
  return c.svg({ bg: null });
}

// Viajes vacíos: valija y pasaje esperando la fecha.
export function emptyTrips({ style = 'cerquita', w = 320, h = 200 } = {}) {
  const c = canvas({ w, h, size: 200, style: STYLE(style), palette, seed: 'trips', inkWidth: 2.2, grainScale: w, wobbleScale: 0.6 });
  const r = c.r;
  table(c, w * 0.06, h * 0.86, w * 0.88);
  suitcase(c, { x: w * 0.18, y: h * 0.36, w: w * 0.26, h: h * 0.47 }, r);
  c.group(`rotate(-8 ${w * 0.66} ${h * 0.62})`, () => ticket(c, { x: w * 0.5, y: h * 0.48, w: w * 0.32, h: h * 0.3 }, r.fork('t')));
  calendar(c, { x: w * 0.72, y: h * 0.14, w: w * 0.14, h: h * 0.24 });
  return c.svg({ bg: null });
}

// Los dos, como flores del logo: cada uno su color.
export function avatar(name, { size = 40, style = 'cerquita', among = null } = {}) {
  const colors = [FLOWER, BLUSH, SKY, SAGE];
  let i = rng(`person:${name}`).int(0, colors.length - 1);
  if (among?.includes(name)) i = [...among].sort().indexOf(name) % colors.length;
  const c = canvas({ w: 100, h: 100, size: 100, style: STYLE(style), palette, seed: `person:${name}`, inkWidth: 3, grainScale: size });
  flower(c, 50, 52, 30, { fill: colors[i], rot: rng(`r:${name}`).float(0, 1) });
  return c.svg({ bg: mix(colors[i], PAPER, 0.75), round: 50 }).replace('width="100" height="100"', `width="${size}" height="${size}"`);
}

// Imagen para compartir el contador: "Faltan 6 días", con las tazas a esa distancia.
export function og({ days = 6, title = null, subtitle = 'Córdoba – Buenos Aires', style = 'cerquita' } = {}) {
  const w = 1200, h = 630;
  const c = canvas({ w, h, size: 630, style: STYLE(style), palette, seed: `og:${days}`, inkWidth: 4, grainScale: w, wobbleScale: 0.5 });
  c.rect(60, 60, w - 120, h - 120, { fill: BUTTER, rx: 36 });
  flower(c, 128, 128, 26);
  c.text('Cerquita', 168, 140, { size: 34, weight: 700 });
  c.text(title || (days > 0 ? `Faltan ${days} días` : '¡Hoy nos vemos!'), 120, 330, { size: 92, weight: 700 });
  c.text(subtitle, 124, 392, { size: 34, weight: 400, color: '#4c6b5e', family: 'system-ui, sans-serif' });
  const cd = countdown(days, { style, w: 600, h: 250, inkWidth: 4 });
  return c.svg({ bg: PAPER }).replace('</g></svg>', `<g transform="translate(540 300)">${cd.replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '')}</g></g></svg>`);
}

export function specimen(style = 'cerquita') {
  return [
    { group: 'El contador, dibujado con el dato', items: [30, 21, 14, 6, 1, 0].map((d) => ({ label: d ? `${d} días` : 'Hoy', svg: countdown(d, { style }) })) },
    { group: 'Nuestros lugares', items: ['Café Martínez', 'Parque Sarmiento', 'Cine Gaumont', 'Parrilla Don Julio', 'Plaza España'].map((p) => ({ label: p, svg: placeCover(p, { style }) })) },
    { group: 'Vacíos', items: [{ label: 'Recuerdos', svg: emptyMemories({ style }) }, { label: 'Viajes', svg: emptyTrips({ style }) }] },
    { group: 'Los dos', items: ['Tomi', 'Cami'].map((p) => ({ label: p, svg: avatar(p, { size: 72, style, among: ['Tomi', 'Cami'] }) })) },
    { group: 'Imagen para compartir', items: [{ label: 'Faltan 6 días', svg: og({ days: 6, style }) }] },
  ];
}
