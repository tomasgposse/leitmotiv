// El lenguaje de ilustración de Pantry, una lista de compras compartida (ejemplo ficticio).
// La idea: la casa vista desde la alacena. Cada cosa de la lista, cada conviviente y cada
// estado de la app se dibuja con los mismos objetos, impresos como en riso sobre papel.
// Todo sale de una semilla: el nombre del producto, de la persona o de la lista.

import { canvas, rng, ellipsePts, roundRectPts, polyPts, scatter, mix } from '../../templates/engine.mjs';

export const palette = {
  paper: '#f5f0e6',
  ink: '#2b4636',
  // Tomate, mostaza, cielo, menta, rosa y avena: los colores de una alacena.
  accents: ['#e8603c', '#eab246', '#7fb2dc', '#62b49f', '#f0a59a', '#e3cfa8'],
  font: '"Segoe UI", system-ui, sans-serif',
};
// En modo oscuro cambian el papel y la tinta; los colores de la alacena quedan.
export const paletteDark = { ...palette, paper: '#1f2620', ink: '#efe7d6', dark: true };
const pal = (dark) => (dark ? paletteDark : palette);
const [TOMATO, MUSTARD, SKY, MINT, BLUSH, OAT] = palette.accents;
// Las etiquetas de los frascos son de papel en los dos modos, y lo que se escribe en ellas
// va siempre en tinta oscura.
const PAPER = palette.paper;
const LABEL = { width: 0.7, color: palette.ink };

// --- Los objetos de Pantry: cada uno se dibuja dentro de una caja b = {x, y, w, h} ---

function jar(c, b, r) {
  const fill = r.pick([MUSTARD, TOMATO, MINT, BLUSH]);
  const { x, y, w, h } = b;
  c.shape(roundRectPts(x + w * 0.1, y + h * 0.2, w * 0.8, h * 0.8, w * 0.2), { fill });
  c.shape(roundRectPts(x + w * 0.16, y + h * 0.04, w * 0.68, h * 0.18, w * 0.06), { fill: r.pick([SKY, OAT, TOMATO]) });
  c.shape(roundRectPts(x + w * 0.22, y + h * 0.46, w * 0.56, h * 0.3, w * 0.05), { fill: PAPER });
  c.stroke([[x + w * 0.32, y + h * 0.57], [x + w * 0.68, y + h * 0.57]], LABEL);
  c.stroke([[x + w * 0.32, y + h * 0.66], [x + w * 0.56, y + h * 0.66]], LABEL);
}

function carton(c, b, r) {
  const { x, y, w, h } = b;
  const fill = r.pick([SKY, SKY, MINT]);
  c.shape(polyPts([[x + w * 0.12, y + h * 0.32], [x + w * 0.5, y + h * 0.12], [x + w * 0.88, y + h * 0.32], [x + w * 0.88, y + h], [x + w * 0.12, y + h]], 4), { fill });
  c.shape(roundRectPts(x + w * 0.36, y, w * 0.28, h * 0.17, w * 0.03), { fill: PAPER });
  c.shape(ellipsePts(x + w * 0.5, y + h * 0.64, w * 0.2, w * 0.2, 18), { fill: PAPER });
  // Una gota en la etiqueta.
  c.shape(polyPts([[x + w * 0.5, y + h * 0.55], [x + w * 0.57, y + h * 0.66], [x + w * 0.5, y + h * 0.72], [x + w * 0.43, y + h * 0.66]], 3), { fill: SKY, inkScale: 0.7 });
}

function bottle(c, b, r) {
  const { x, y, w, h } = b;
  const fill = r.pick([MINT, BLUSH, SKY]);
  c.shape(roundRectPts(x + w * 0.18, y + h * 0.34, w * 0.64, h * 0.66, w * 0.18), { fill });
  c.shape(roundRectPts(x + w * 0.36, y + h * 0.16, w * 0.28, h * 0.22, w * 0.06), { fill });
  c.shape(roundRectPts(x + w * 0.32, y + h * 0.04, w * 0.36, h * 0.13, w * 0.05), { fill: TOMATO });
  c.shape(roundRectPts(x + w * 0.28, y + h * 0.56, w * 0.44, h * 0.24, w * 0.05), { fill: PAPER });
  // Burbujas.
  c.shape(ellipsePts(x + w * 0.86, y + h * 0.22, w * 0.07, w * 0.07, 14), { fill: PAPER, inkScale: 0.7 });
  c.shape(ellipsePts(x + w * 0.94, y + h * 0.08, w * 0.04, w * 0.04, 12), { fill: PAPER, inkScale: 0.6 });
}

function banana(c, b) {
  const { x, y, w, h } = b;
  const cx = x + w * 0.5, cy = y - h * 0.35, R = h * 1.15, k = 0.66;
  const outer = [], inner = [];
  for (let i = 0; i <= 14; i++) {
    const t = Math.PI * (0.22 + (0.56 * i) / 14);
    outer.push([cx + Math.cos(t) * R * 0.78, cy + Math.sin(t) * R]);
  }
  for (let i = 14; i >= 0; i--) {
    const t = Math.PI * (0.27 + (0.46 * i) / 14);
    inner.push([cx + Math.cos(t) * R * 0.6, cy + Math.sin(t) * R * k + h * 0.12]);
  }
  c.shape([...outer, ...inner], { fill: MUSTARD });
  const end = outer[outer.length - 1], start = outer[0];
  c.stroke([[start[0], start[1]], [start[0] + w * 0.08, start[1] - h * 0.1]], { width: 1.2 });
  c.dot(end[0], end[1] - h * 0.02, w * 0.035);
}

function fruit(c, b, r, color) {
  const { x, y, w, h } = b;
  const rad = Math.min(w, h) * 0.38;
  const cx = x + w * 0.5, cy = y + h * 0.58;
  c.shape(ellipsePts(cx, cy, rad, rad * 0.94, 26), { fill: color || r.pick([TOMATO, BLUSH, MUSTARD]) });
  c.stroke([[cx, cy - rad * 0.86], [cx + rad * 0.08, cy - rad * 1.22]], { width: 1.1 });
  c.shape(ellipsePts(cx + rad * 0.42, cy - rad * 1.08, rad * 0.36, rad * 0.16, 16, -0.5), { fill: MINT, inkScale: 0.8 });
}

function loaf(c, b, r) {
  const { x, y, w, h } = b;
  c.shape(roundRectPts(x + w * 0.04, y + h * 0.3, w * 0.92, h * 0.7, h * 0.32), { fill: r.pick([OAT, MUSTARD]) });
  for (let i = 0; i < 3; i++) {
    const sx = x + w * (0.28 + i * 0.2);
    c.stroke([[sx, y + h * 0.42], [sx + w * 0.1, y + h * 0.56]], { width: 0.9 });
  }
}

function bag(c, b, r) {
  const { x, y, w, h } = b;
  const fill = r.pick([TOMATO, SKY, MINT]);
  c.shape(polyPts([[x + w * 0.2, y + h * 0.16], [x + w * 0.8, y + h * 0.16], [x + w * 0.9, y + h], [x + w * 0.1, y + h]], 5), { fill });
  c.shape(roundRectPts(x + w * 0.16, y + h * 0.06, w * 0.68, h * 0.14, w * 0.03), { fill: OAT });
  // Un grano de café en la etiqueta.
  const bx = x + w * 0.5, by = y + h * 0.6;
  c.shape(ellipsePts(bx, by, w * 0.15, w * 0.2, 18, 0.4), { fill: PAPER });
  c.stroke([[bx - w * 0.05, by - h * 0.12], [bx + w * 0.02, by], [bx - w * 0.03, by + h * 0.12]], { ...LABEL, width: 0.8 });
}

function can(c, b, r) {
  const { x, y, w, h } = b;
  c.shape(roundRectPts(x + w * 0.14, y + h * 0.14, w * 0.72, h * 0.86, w * 0.08), { fill: r.pick([BLUSH, TOMATO, SKY]) });
  c.shape(roundRectPts(x + w * 0.14, y + h * 0.42, w * 0.72, h * 0.3, w * 0.02), { fill: PAPER });
  c.shape(ellipsePts(x + w * 0.5, y + h * 0.14, w * 0.36, h * 0.07, 20), { fill: OAT, inkScale: 0.8 });
  c.dot(x + w * 0.5, y + h * 0.57, w * 0.06, TOMATO);
}

function leaf(c, b, rot = -0.6) {
  const { x, y, w, h } = b;
  const cx = x + w / 2, cy = y + h / 2;
  c.shape(ellipsePts(cx, cy, w * 0.46, h * 0.2, 18, rot), { fill: MINT, inkScale: 0.8 });
  c.stroke([[cx - Math.cos(rot) * w * 0.4, cy - Math.sin(rot) * w * 0.4], [cx + Math.cos(rot) * w * 0.4, cy + Math.sin(rot) * w * 0.4]], { width: 0.6 });
}

function shelf(c, x, y, w) {
  // Una tabla de madera clara con dos patas cortas.
  const t = c.size * 0.045;
  c.shape(roundRectPts(x, y, w, t, t * 0.35), { fill: OAT });
  c.shape(roundRectPts(x + w * 0.08, y + t * 0.8, t * 0.9, t * 1.6, t * 0.2), { fill: OAT, inkScale: 0.8 });
  c.shape(roundRectPts(x + w * 0.92 - t * 0.9, y + t * 0.8, t * 0.9, t * 1.6, t * 0.2), { fill: OAT, inkScale: 0.8 });
}

const MOTIFS = { jar, carton, bottle, banana, fruit, loaf, bag, can };

// Qué objeto es cada producto de la lista. Palabras en castellano e inglés, sin tildes
// (el nombre se compara sin tildes, así "Café" y "cafe" son lo mismo).
const KINDS = [
  [/leche|milk|\boat\b|yogur|yogurt|crema|cream/, 'carton'],
  [/banana|platano/, 'banana'],
  // Antes que las frutas: "puré de tomate" es una lata, no un tomate.
  [/atun|tuna|\blata\b|\bcan\b|tomato sauce|\bpure\b|garbanzo|chickpea/, 'can'],
  [/manzana|apple|naranja|orange|tomate|tomato|limon|lemon|fruta|fruit|palta|avocado|durazno|peach/, 'fruit'],
  [/\bpan\b|bread|baguette|medialuna|croissant|galleta|cookie/, 'loaf'],
  [/cafe|coffee|\bte\b|\btea\b|yerba/, 'bag'],
  [/jabon|soap|detergente|detergent|lavandina|bleach|shampoo|\bdish/, 'bottle'],
];
export function kindOf(name) {
  const n = String(name).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  return (KINDS.find(([re]) => re.test(n)) || [null, 'jar'])[1];
}

// --- Composiciones: una por cada lugar de la app que necesita imagen ---

// El ícono de un producto de la lista. 48 px en la lista, se ve bien de 24 a 160.
export function itemGlyph(name, { size = 48, style = 'riso', bg = null, dark = false } = {}) {
  const c = canvas({ w: 100, h: 100, size: 100, style, palette: pal(dark), seed: `item:${name}`, inkWidth: 2.6, grainScale: size });
  const kind = kindOf(name);
  const box = kind === 'banana' ? { x: 4, y: 18, w: 92, h: 66 } : kind === 'fruit' ? { x: 12, y: 8, w: 76, h: 84 } : kind === 'loaf' ? { x: 6, y: 26, w: 88, h: 60 } : { x: 18, y: 8, w: 64, h: 86 };
  MOTIFS[kind](c, box, c.r);
  return c.svg({ bg }).replace('width="100" height="100"', `width="${size}" height="${size}"`);
}

// La cara de cada conviviente: una fruta con ojos, del color de esa persona.
// Reemplaza las iniciales, así que tiene que identificar: dentro de una misma casa (among),
// cada persona recibe un color y una fruta distintos. Sin among, salen del nombre.
const PEOPLE_COLORS = [TOMATO, SKY, MINT, MUSTARD, BLUSH];
const FRUITS = ['round', 'pear', 'lemon'];
export function avatar(name, { size = 40, style = 'riso', among = null, dark = false } = {}) {
  const r = rng(`person:${name}`);
  let slot = null;
  if (among && among.includes(name)) {
    // Orden estable por nombre: agregar a alguien a la casa no le cambia el color a los demás.
    const order = [...among].sort((a, b) => rng(`person:${a}`).next() - rng(`person:${b}`).next());
    slot = order.indexOf(name);
  }
  // El color de la persona es la fruta; el fondo es ese mismo color, muy claro.
  const body = slot === null ? r.pick(PEOPLE_COLORS) : PEOPLE_COLORS[slot % PEOPLE_COLORS.length];
  const bg = mix(body, pal(dark).paper, dark ? 0.55 : 0.72);
  const c = canvas({ w: 100, h: 100, size: 100, style, palette: pal(dark), seed: `person:${name}`, inkWidth: 2.6, grainScale: size });
  const cx = 50, cy = 58, rad = 30;
  const kind = slot === null ? r.pick(FRUITS) : FRUITS[(slot + Math.floor(slot / PEOPLE_COLORS.length)) % FRUITS.length];
  let pts;
  if (kind === 'round') pts = ellipsePts(cx, cy, rad, rad * 0.95, 26);
  // Limón: más ancho que alto, con las dos puntas marcadas.
  else if (kind === 'lemon') pts = ellipsePts(cx, cy, rad * 1.08, rad * 0.9, 30).map(([px, py]) => { const t = Math.abs(px - cx) / (rad * 1.08); return [cx + (px - cx) * (1 + 0.1 * t ** 10), cy + (py - cy) * (1 - 0.2 * t ** 6)]; });
  // Pera: angosta arriba, ancha abajo.
  else pts = ellipsePts(cx, cy + 3, rad * 0.95, rad * 1.12, 30).map(([px, py]) => { const k = (py - (cy - rad)) / (rad * 2.3); return [cx + (px - cx) * (0.5 + 0.55 * Math.min(1, Math.max(0, k))), py]; });
  c.shape(pts, { fill: body });
  c.stroke([[cx, cy - rad * 0.95], [cx + 3, cy - rad * 1.3]], { width: 1.1 });
  c.shape(ellipsePts(cx + 12, cy - rad * 1.18, 11, 5, 14, -0.5), { fill: MINT, inkScale: 0.8 });
  const eye = r.float(9, 12);
  c.dot(cx - eye, cy - 2, 3.4); c.dot(cx + eye, cy - 2, 3.4);
  if (r.chance(0.7)) c.stroke([[cx - 6, cy + 8], [cx, cy + 12], [cx + 6, cy + 8]], { width: 0.9 });
  else c.dot(cx, cy + 9, 2.4);
  return c.svg({ bg, round: 50 }).replace('width="100" height="100"', `width="${size}" height="${size}"`);
}

// Estado vacío. mood "empty": la lista recién creada (un estante con un hueco punteado que
// invita a agregar). mood "done": todo comprado (el estante lleno).
export function emptyState({ seed = 'pantry', mood = 'empty', style = 'riso', w = 320, h = 200, dark = false } = {}) {
  const c = canvas({ w, h, size: 200, style, palette: pal(dark), seed: `empty:${seed}:${mood}`, inkWidth: 2.2, grainScale: w, wobbleScale: 0.55 });
  const r = c.r;
  const base = h * 0.78;
  shelf(c, w * 0.08, base, w * 0.84);
  if (mood === 'done') {
    const kinds = r.shuffle(['jar', 'carton', 'bottle', 'can', 'jar', 'bag']).slice(0, 5);
    let x = w * 0.14;
    for (const k of kinds) {
      const bw = w * (k === 'carton' || k === 'bag' ? 0.13 : 0.12), bh = h * r.float(0.36, 0.5);
      MOTIFS[k](c, { x, y: base - bh, w: bw, h: bh }, r.fork(k + x));
      x += bw + w * 0.035;
    }
  } else {
    jar(c, { x: w * 0.2, y: base - h * 0.42, w: w * 0.14, h: h * 0.42 }, r.fork('a'));
    // El hueco: un frasco que todavía no está, punteado.
    c.shape(roundRectPts(w * 0.43, base - h * 0.36, w * 0.13, h * 0.36, w * 0.03), { fill: null, dash: [0.035, 0.03] });
    c.stroke([[w * 0.495, base - h * 0.22], [w * 0.495, base - h * 0.14]], { width: 1, always: true });
    c.stroke([[w * 0.475, base - h * 0.18], [w * 0.515, base - h * 0.18]], { width: 1, always: true });
    fruit(c, { x: w * 0.64, y: base - h * 0.3, w: w * 0.16, h: h * 0.3 }, r.fork('b'), TOMATO);
  }
  return c.svg({ bg: null });
}

// Portada de una lista o de una semana del historial: los productos de esa lista, desparramados.
export function cover(title, { items = [], style = 'riso', w = 600, h = 240, dark = false } = {}) {
  const c = canvas({ w, h, size: 240, style, palette: pal(dark), seed: `cover:${title}`, inkWidth: 2.6, grainScale: w, wobbleScale: 0.7 });
  const r = c.r;
  c.shape(ellipsePts(w * r.float(0.35, 0.65), h * 0.55, w * 0.34, h * 0.48, 30, r.float(-0.2, 0.2)), { fill: mix(OAT, pal(dark).paper, dark ? 0.75 : 0.45), ink: false, wobbleScale: 3 });
  const names = items.length ? items : r.shuffle(['milk', 'banana', 'bread', 'coffee', 'soap', 'tomato', 'rice', 'tuna']).slice(0, 7);
  const boxes = scatter(r, names.length, { x: w * 0.04, y: h * 0.06, w: w * 0.92, h: h * 0.88, min: h * 0.32, max: h * 0.44, pad: 4, tries: 1500 });
  boxes.forEach((b, i) => {
    const kind = kindOf(names[i]);
    const tilt = r.float(-14, 14);
    c.group(`rotate(${tilt.toFixed(1)} ${(b.x + b.w / 2).toFixed(1)} ${(b.y + b.h / 2).toFixed(1)})`, () => {
      MOTIFS[kind](c, kind === 'banana' || kind === 'loaf' ? { x: b.x, y: b.y + b.h * 0.25, w: b.w, h: b.h * 0.7 } : { x: b.x + b.w * 0.15, y: b.y, w: b.w * 0.7, h: b.h }, r.fork(names[i]));
    });
  });
  return c.svg({ bg: pal(dark).paper, round: 16 });
}

// Imagen para compartir el link de invitación (1200 × 630).
export function og({ title = 'Pantry', subtitle = 'La lista de compras de la casa', items, style = 'riso' } = {}) {
  const w = 1200, h = 630;
  const c = canvas({ w, h, size: 630, style, palette, seed: `og:${title}:${subtitle}`, inkWidth: 4.5, grainScale: w, wobbleScale: 0.5 });
  const r = c.r;
  c.shape(ellipsePts(w * 0.74, h * 0.52, w * 0.3, h * 0.44, 34, 0.1), { fill: mix(OAT, PAPER, 0.35), ink: false, wobbleScale: 2 });
  const names = items || ['oat milk', 'bananas', 'coffee beans', 'dish soap', 'bread', 'tomatoes'];
  // Grilla de 3 × 2 con variación: en un formato fijo, ordena mejor que repartir al azar.
  const cols = 3, gx = w * 0.5, gy = h * 0.1, cw = (w * 0.46) / cols, ch = (h * 0.8) / 2;
  names.slice(0, 6).forEach((name, i) => {
    const s2 = Math.min(cw, ch) * r.float(0.72, 0.86);
    const b = { x: gx + (i % cols) * cw + (cw - s2) / 2 + r.float(-12, 12), y: gy + Math.floor(i / cols) * ch + (ch - s2) / 2 + r.float(-12, 12), w: s2, h: s2 };
    const kind = kindOf(name);
    c.group(`rotate(${r.float(-12, 12).toFixed(1)} ${(b.x + b.w / 2).toFixed(1)} ${(b.y + b.h / 2).toFixed(1)})`, () =>
      MOTIFS[kind](c, kind === 'banana' || kind === 'loaf' ? { x: b.x, y: b.y + b.h * 0.25, w: b.w, h: b.h * 0.7 } : { x: b.x + b.w * 0.15, y: b.y, w: b.w * 0.7, h: b.h }, r.fork(name)));
  });
  c.text(title, 80, 300, { size: 96, weight: 800 });
  c.text(subtitle, 80, 370, { size: 34, weight: 400, color: '#5b6b60' });
  return c.svg({ bg: PAPER });
}

// 404: un frasco caído, con la tapa hacia la derecha y los granos saliendo de la boca.
export function notFound({ style = 'riso', w = 320, h = 220, dark = false } = {}) {
  const c = canvas({ w, h, size: 220, style, palette: pal(dark), seed: 'notfound', inkWidth: 2.2, grainScale: w, wobbleScale: 0.55 });
  const r = c.r;
  const floor = h * 0.8;
  c.stroke([[w * 0.05, floor], [w * 0.95, floor]], { width: 1.1 });
  // Acostado: alto del frasco a lo ancho, ancho del frasco a lo alto.
  const jw = h * 0.36, jh = w * 0.3, cx = w * 0.26, cy = floor - jw / 2 - 1;
  c.group(`rotate(90 ${cx.toFixed(1)} ${cy.toFixed(1)})`, () => jar(c, { x: cx - jw / 2, y: cy - jh / 2, w: jw, h: jh }, r.fork('jar')));
  // Los granos: más juntos cerca de la boca, más sueltos lejos.
  for (let i = 0; i < 14; i++) {
    const t = Math.pow(r.next(), 1.6);
    const bx = w * (0.44 + t * 0.46), by = floor - w * 0.012 - r.float(0, 1) * h * 0.06 * (1 - t);
    c.shape(ellipsePts(bx, by, w * 0.017, w * 0.012, 10, r.float(0, 3)), { fill: MUSTARD, ink: false });
  }
  return c.svg({ bg: null });
}

// Lo que muestra la hoja de muestra (specimen.mjs): cada pieza con varias semillas.
export function specimen(style = 'riso', { dark = false } = {}) {
  const products = ['Oat milk', 'Bananas', 'Coffee beans', 'Dish soap', 'Bread', 'Tomatoes', 'Rice', 'Tuna', 'Lentils', 'Yerba'];
  const people = ['Ana', 'Mateo', 'Lu', 'Tomi', 'Sofi', 'Rulo', 'Martín', 'Cami'];
  return [
    { group: 'Productos de la lista', items: products.map((p) => ({ label: p, svg: itemGlyph(p, { size: 72, style, dark }) })) },
    { group: 'Convivientes de una casa', items: people.map((p) => ({ label: p, svg: avatar(p, { size: 72, style, among: people, dark }) })) },
    { group: 'Estados', items: [
      { label: 'Lista vacía', svg: emptyState({ mood: 'empty', style, dark }) },
      { label: 'Todo comprado', svg: emptyState({ mood: 'done', style, dark }) },
      { label: '404', svg: notFound({ style, dark }) },
    ] },
    { group: 'Portadas', items: ['Semana del 6', 'Asado del sábado', 'Mudanza'].map((t) => ({ label: t, svg: cover(t, { style, dark }) })) },
    { group: 'Imagen para compartir', items: [{ label: 'Invitación', svg: og({ style }) }] },
  ];
}
