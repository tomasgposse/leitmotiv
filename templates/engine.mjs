// motif · motor de ilustración generativa.
// Sin dependencias: funciona en el navegador, en Node y en el servidor (SSR, imágenes OG).
// Se copia al proyecto y no se edita: el lenguaje propio del producto vive en otro archivo
// que importa estas piezas (ver el ejemplo en examples/pantry/pantry-art.mjs).

// --- Azar con semilla: la misma semilla da siempre la misma ilustración ---

// cyrb53: convierte cualquier texto (un nombre, un id) en un número estable.
export function hash(str) {
  let h1 = 0xdeadbeef, h2 = 0x41c6ce57;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (h2 >>> 0) * 4096 + (h1 >>> 0) % 4096;
}

// mulberry32 con ayudas. rng('ana') y rng(42) funcionan igual.
export function rng(seed) {
  let a = (typeof seed === 'number' ? seed : hash(String(seed))) >>> 0;
  const next = () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const r = {
    next,
    float: (min = 0, max = 1) => min + next() * (max - min),
    int: (min, max) => Math.floor(min + next() * (max - min + 1)),
    pick: (arr) => arr[Math.floor(next() * arr.length)],
    chance: (p) => next() < p,
    // Variación alrededor de un valor: jitter(10, 0.2) da entre 8 y 12.
    jitter: (v, amount) => v * (1 + (next() * 2 - 1) * amount),
    shuffle: (arr) => { const a2 = [...arr]; for (let i = a2.length - 1; i > 0; i--) { const j = Math.floor(next() * (i + 1)); [a2[i], a2[j]] = [a2[j], a2[i]]; } return a2; },
    // Un rng hijo con su propia secuencia: agregar un detalle no cambia el resto del dibujo.
    fork: (salt) => rng(hash(`${a}:${salt}`)),
  };
  return r;
}

// --- Estilos: el mismo motivo dibujado en tres lenguajes distintos ---
// wobble: cuánto se aparta el trazo de la geometría perfecta (fracción del tamaño).
// fill: si las formas llevan color. ink: si llevan contorno, y de qué grosor (fracción).
// offset: desregistro entre el color y la tinta, como en una impresión riso.
export const STYLES = {
  riso: { wobble: 0.018, fill: true, ink: 0.022, offset: 0.012, grain: true, blend: true },
  line: { wobble: 0.008, fill: false, ink: 0.028, offset: 0, grain: false, blend: false },
  blocks: { wobble: 0, fill: true, ink: 0, offset: 0, grain: false, blend: false, shadow: 0.035 },
};

// --- Geometría: puntos que después se suavizan en curvas ---

const TAU = Math.PI * 2;
const fmt = (n) => (Math.round(n * 10) / 10).toString();

export function ellipsePts(cx, cy, rx, ry, n = 22, rot = 0) {
  const pts = [];
  for (let i = 0; i < n; i++) {
    const t = (i / n) * TAU;
    const x = Math.cos(t) * rx, y = Math.sin(t) * ry;
    pts.push([cx + x * Math.cos(rot) - y * Math.sin(rot), cy + x * Math.sin(rot) + y * Math.cos(rot)]);
  }
  return pts;
}

export function roundRectPts(x, y, w, h, r, perSide = 4) {
  r = Math.min(r, w / 2, h / 2);
  const pts = [];
  const arc = (cx, cy, a0) => { for (let i = 0; i <= 3; i++) { const t = a0 + (i / 3) * (Math.PI / 2); pts.push([cx + Math.cos(t) * r, cy + Math.sin(t) * r]); } };
  const edge = (x0, y0, x1, y1) => { for (let i = 1; i < perSide; i++) pts.push([x0 + ((x1 - x0) * i) / perSide, y0 + ((y1 - y0) * i) / perSide]); };
  arc(x + w - r, y + r, -Math.PI / 2); edge(x + w, y + r, x + w, y + h - r);
  arc(x + w - r, y + h - r, 0); edge(x + w - r, y + h, x + r, y + h);
  arc(x + r, y + h - r, Math.PI / 2); edge(x, y + h - r, x, y + r);
  arc(x + r, y + r, Math.PI); edge(x + r, y, x + w - r, y);
  return pts;
}

// Polígono con aristas subdivididas, para que el temblor no rompa las esquinas.
export function polyPts(points, perSide = 5) {
  const out = [];
  for (let i = 0; i < points.length; i++) {
    const [x0, y0] = points[i], [x1, y1] = points[(i + 1) % points.length];
    for (let k = 0; k < perSide; k++) out.push([x0 + ((x1 - x0) * k) / perSide, y0 + ((y1 - y0) * k) / perSide]);
  }
  return out;
}

// Temblor de mano: desplaza cada punto con ruido suave (vecinos parecidos), no al azar puro.
export function wobble(pts, r, amount, closed = true) {
  if (!amount) return pts;
  const n = pts.length;
  const raw = pts.map(() => [r.float(-1, 1), r.float(-1, 1)]);
  return pts.map(([x, y], i) => {
    const a = raw[(i - 1 + n) % n], b = raw[i], c = raw[(i + 1) % n];
    const k = closed || (i > 0 && i < n - 1) ? 1 : 0.3;
    return [x + ((a[0] + 2 * b[0] + c[0]) / 4) * amount * k, y + ((a[1] + 2 * b[1] + c[1]) / 4) * amount * k];
  });
}

// Catmull-Rom → Bézier: una curva suave que pasa por todos los puntos.
export function smooth(pts, closed = true, tension = 1) {
  const n = pts.length;
  if (n < 2) return '';
  const p = (i) => (closed ? pts[(i + n) % n] : pts[Math.max(0, Math.min(n - 1, i))]);
  let d = `M${fmt(pts[0][0])} ${fmt(pts[0][1])}`;
  const last = closed ? n : n - 1;
  for (let i = 0; i < last; i++) {
    const p0 = p(i - 1), p1 = p(i), p2 = p(i + 1), p3 = p(i + 2);
    const c1 = [p1[0] + ((p2[0] - p0[0]) / 6) * tension, p1[1] + ((p2[1] - p0[1]) / 6) * tension];
    const c2 = [p2[0] - ((p3[0] - p1[0]) / 6) * tension, p2[1] - ((p3[1] - p1[1]) / 6) * tension];
    d += `C${fmt(c1[0])} ${fmt(c1[1])} ${fmt(c2[0])} ${fmt(c2[1])} ${fmt(p2[0])} ${fmt(p2[1])}`;
  }
  return d + (closed ? 'Z' : '');
}

// --- El lienzo: junta formas en capas y aplica el estilo ---
// size es el lado de referencia del dibujo (el temblor y la tinta escalan con él).

// inkWidth: grosor de la tinta en unidades del dibujo (si no, sale de size). grainScale: ancho al
// que se va a mostrar, para que el grano tenga el mismo tamaño en pantalla en piezas grandes y chicas.
// wobbleScale: menos temblor en piezas grandes, donde se nota más.
export function canvas({ w, h, size = Math.min(w, h), style = 'riso', palette, seed = 0, title = null, inkWidth = null, grainScale = null, wobbleScale = 1 }) {
  const S = STYLES[style] || style;
  const r = rng(seed);
  const id = `m${(hash(`${seed}|${w}x${h}|${typeof style === 'string' ? style : 'x'}`) % 1e9).toString(36)}`;
  const fills = [], inks = [], shadows = [], tops = [];
  // Multiplicar (las tintas que se pisan se oscurecen, como en riso) solo sobre papel claro:
  // sobre un fondo oscuro ensucia los colores. Una paleta con dark: true lo apaga.
  const blend = S.blend && !palette.dark;
  const inkW = inkWidth != null && S.ink ? inkWidth * (S.ink / 0.022) : S.ink * size;
  const amp = S.wobble * size * wobbleScale;

  const api = {
    r, S, size, w, h, id, palette,
    // Una forma cerrada: color de relleno y contorno de tinta, según el estilo.
    // layer: 'top' dibuja la forma (relleno y contorno) encima de toda la tinta: el centro de una
    // flor sobre sus pétalos, un sello sobre un sobre.
    shape(pts, { fill = palette.accents[0], ink = true, wobbleScale = 1, closed = true, inkScale = 1, dash = null, layer = null } = {}) {
      const p = wobble(pts, r, amp * wobbleScale, closed);
      const d = smooth(p, closed);
      if (layer === 'top') {
        const iw2 = (S.ink ? inkW : (inkWidth || 0.02 * size)) * inkScale;
        tops.push(`<path d="${d}" fill="${fill || 'none'}"${ink && S.ink > 0 ? ` stroke="${palette.ink}" stroke-width="${fmt(iw2)}" stroke-linejoin="round"` : ''}/>`);
        return api;
      }
      if (S.fill && fill && closed) {
        fills.push(`<path d="${d}" fill="${fill}"/>`);
        if (S.shadow) shadows.push(`<path d="${d}" fill="${palette.ink}" opacity=".9" transform="translate(${fmt(S.shadow * size)} ${fmt(S.shadow * size)})"/>`);
      }
      // Contorno de tinta: en riso va desregistrado sobre el color, en línea es todo el dibujo,
      // en bloques no hay (salvo dash: un hueco punteado se dibuja igual).
      const iw = (S.ink ? inkW : (inkWidth || 0.02 * size)) * inkScale;
      if (ink && (S.ink > 0 || dash)) {
        inks.push(`<path d="${d}" fill="none" stroke="${palette.ink}" stroke-width="${fmt(iw)}" stroke-linecap="round" stroke-linejoin="round"${dash ? ` stroke-dasharray="${dash.map((v) => fmt(v * size)).join(' ')}"` : ''}/>`);
      }
      return api;
    },
    // Un rectángulo exacto, sin temblor (marcos, tarjetas, el fondo de una placa).
    rect(x, y, rw, rh, { fill = palette.paper, rx = 0 } = {}) {
      fills.push(`<rect x="${fmt(x)}" y="${fmt(y)}" width="${fmt(rw)}" height="${fmt(rh)}" rx="${fmt(rx)}" fill="${fill}"/>`);
      return api;
    },
    // Agrupa lo que dibuje fn bajo una transformación (rotar un objeto caído, espejar).
    group(transform, fn) {
      const marks = [fills.length, inks.length, shadows.length, tops.length];
      fn(api);
      [fills, inks, shadows, tops].forEach((arr, i) => {
        const added = arr.splice(marks[i]);
        if (added.length) arr.push(`<g transform="${transform}">${added.join('')}</g>`);
      });
      return api;
    },
    // Un trazo abierto de tinta (detalles: tallos, rayas, brillos).
    stroke(pts, { width = 1, color = palette.ink, wobbleScale = 1, always = false } = {}) {
      if (!S.ink && !always) {
        // En bloques no hay tinta: el detalle se vuelve una forma fina de color.
        fills.push(`<path d="${smooth(wobble(pts, r, amp * wobbleScale, false), false)}" fill="none" stroke="${color === palette.ink ? palette.ink : color}" stroke-width="${fmt(size * 0.02 * width)}" stroke-linecap="round"/>`);
        return api;
      }
      const d = smooth(wobble(pts, r, amp * wobbleScale, false), false);
      inks.push(`<path d="${d}" fill="none" stroke="${color}" stroke-width="${fmt((inkW || (inkWidth || size * 0.02)) * width)}" stroke-linecap="round" stroke-linejoin="round"/>`);
      return api;
    },
    // Un punto sólido (semillas, granos, ojos): siempre se ve, en cualquier estilo.
    dot(x, y, rad, color = palette.ink) {
      (color === palette.ink ? tops : fills).push(`<circle cx="${fmt(x)}" cy="${fmt(y)}" r="${fmt(rad)}" fill="${color}"/>`);
      return api;
    },
    // Texto (solo para placas como imágenes OG): fuera de la ilustración, sin efectos.
    text(str, x, y, { size: fs = 40, weight = 700, color = palette.ink, family = palette.font || 'system-ui, sans-serif', anchor = 'start' } = {}) {
      tops.push(`<text x="${fmt(x)}" y="${fmt(y)}" font-family="${String(family).replace(/"/g, "'")}" font-size="${fmt(fs)}" font-weight="${weight}" fill="${color}" text-anchor="${anchor}">${String(str).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]))}</text>`);
      return api;
    },
    // Termina el dibujo y devuelve el SVG. bg: color de fondo o null para transparente.
    svg({ bg = palette.paper, round = 0 } = {}) {
      const o = fmt(S.offset * size), o2 = fmt(-S.offset * size * 0.6);
      // Grano de riso: puntitos color papel donde la tinta no llegó a cubrir, solo dentro de las formas.
      const grain = S.grain ? `<filter id="${id}g" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="${fmt(0.55 * ((grainScale || w) / w))}" numOctaves="1" seed="${(hash(id) % 997) + 1}" result="n"/><feColorMatrix in="n" type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 -16 5.6" result="s"/><feComposite in="s" in2="SourceAlpha" operator="in" result="g"/><feFlood flood-color="${palette.paper}" result="p"/><feComposite in="p" in2="g" operator="in" result="pg"/><feMerge><feMergeNode in="SourceGraphic"/><feMergeNode in="pg"/></feMerge></filter>` : '';
      const clip = round ? `<clipPath id="${id}c"><rect width="${w}" height="${h}" rx="${round}"/></clipPath>` : '';
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}"${title ? ` role="img" aria-label="${String(title).replace(/"/g, '&quot;')}"` : ' aria-hidden="true"'}>`
        + (grain || clip ? `<defs>${grain}${clip}</defs>` : '')
        + `<g${round ? ` clip-path="url(#${id}c)"` : ''}>`
        + (bg ? `<rect width="${w}" height="${h}" fill="${bg}"/>` : '')
        + (shadows.length ? `<g>${shadows.join('')}</g>` : '')
        + `<g${blend ? ' style="mix-blend-mode:multiply"' : ''}${S.grain ? ` filter="url(#${id}g)"` : ''} opacity="${blend ? 0.94 : 1}">${fills.join('')}</g>`
        + `<g transform="translate(${o} ${o2})">${inks.join('')}</g>`
        + `<g>${tops.join('')}</g>`
        + `</g></svg>`;
    },
  };
  return api;
}

// Mezcla dos colores hex: mix('#e8603c', '#ffffff', 0.7) es un tomate muy claro.
export function mix(a, b, t) {
  const pa = a.replace('#', '').match(/../g).map((v) => parseInt(v, 16));
  const pb = b.replace('#', '').match(/../g).map((v) => parseInt(v, 16));
  return '#' + pa.map((v, i) => Math.round(v + (pb[i] - v) * t).toString(16).padStart(2, '0')).join('');
}

// --- Composición ---

// Reparte n cajas en un área sin que se pisen (prueba posiciones al azar, se queda con las que entran).
export function scatter(r, n, { x = 0, y = 0, w, h, min, max, pad = 4, tries = 400 }) {
  const placed = [];
  for (let t = 0; t < tries && placed.length < n; t++) {
    const s = r.float(min, max);
    const b = { x: r.float(x, x + w - s), y: r.float(y, y + h - s), w: s, h: s };
    if (placed.every((p) => b.x + b.w + pad < p.x || p.x + p.w + pad < b.x || b.y + b.h + pad < p.y || p.y + p.h + pad < b.y)) placed.push(b);
  }
  return placed;
}

// Una fila de objetos apoyados sobre una línea (un estante, una mesa, el piso).
export function row(r, widths, { x, baseline, gap, heights }) {
  let cx = x;
  return widths.map((wd, i) => { const b = { x: cx, y: baseline - heights[i], w: wd, h: heights[i] }; cx += wd + gap * r.float(0.7, 1.3); return b; });
}
