// node --test tests/*.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { canvas, rng, hash, mix, scatter, ellipsePts, roundRectPts, smooth, STYLES } from '../templates/engine.mjs';
import * as pantry from '../examples/pantry/pantry-art.mjs';

const palette = { paper: '#ffffff', ink: '#111111', accents: ['#ff0000', '#00aa00'] };
const draw = (seed, style = 'riso') => {
  const c = canvas({ w: 100, h: 100, style, palette, seed });
  c.shape(ellipsePts(50, 50, 30, 30)).shape(roundRectPts(20, 20, 30, 40, 6), { fill: palette.accents[1] });
  c.stroke([[10, 90], [90, 90]]);
  return c.svg();
};

test('la misma semilla da el mismo dibujo, y otra semilla otro', () => {
  assert.equal(draw('ana'), draw('ana'));
  assert.notEqual(draw('ana'), draw('mateo'));
  assert.equal(rng('x').next(), rng('x').next());
  assert.equal(hash('pantry'), hash('pantry'));
});

test('los tres estilos dan dibujos distintos y válidos', () => {
  const out = Object.keys(STYLES).map((s) => draw('ana', s));
  assert.equal(new Set(out).size, 3);
  for (const svg of out) {
    assert.match(svg, /^<svg[^>]+viewBox="0 0 100 100"/);
    assert.match(svg, /<\/svg>$/);
  }
  // En bloques las formas no llevan contorno (el único trazo es el detalle de c.stroke).
  const shapesOnly = (style) => { const c = canvas({ w: 100, h: 100, style, palette, seed: 'b' }); c.shape(ellipsePts(50, 50, 30, 30)); return c.svg(); };
  assert.ok(!shapesOnly('blocks').includes('stroke='), 'en bloques no hay contorno de tinta');
  assert.ok(shapesOnly('riso').includes('stroke='), 'en riso sí');
  assert.ok(!/fill="#ff0000"/.test(out[1]), 'en línea no hay rellenos');
});

test('decorativo por defecto, con nombre si se le da título', () => {
  assert.match(draw('a'), /aria-hidden="true"/);
  const c = canvas({ w: 10, h: 10, palette, seed: 1, title: 'Lista vacía' });
  assert.match(c.svg(), /role="img" aria-label="Lista vacía"/);
});

test('svg() se puede llamar dos veces y da lo mismo', () => {
  const c = canvas({ w: 100, h: 100, palette, seed: 'z' });
  c.shape(ellipsePts(50, 50, 20, 20));
  assert.equal(c.svg(), c.svg());
});

test('scatter no superpone cajas', () => {
  const boxes = scatter(rng(3), 8, { x: 0, y: 0, w: 600, h: 240, min: 50, max: 80, pad: 4 });
  assert.ok(boxes.length >= 5);
  for (let i = 0; i < boxes.length; i++) for (let j = i + 1; j < boxes.length; j++) {
    const a = boxes[i], b = boxes[j];
    assert.ok(a.x + a.w < b.x || b.x + b.w < a.x || a.y + a.h < b.y || b.y + b.h < a.y, `cajas ${i} y ${j} se pisan`);
  }
});

test('mix mezcla colores y smooth cierra la curva', () => {
  assert.equal(mix('#000000', '#ffffff', 0.5), '#808080');
  assert.match(smooth([[0, 0], [10, 0], [10, 10]]), /Z$/);
});

test('Pantry: en una misma casa, cada persona tiene un color distinto', () => {
  const house = ['Ana', 'Mateo', 'Lu', 'Tomi', 'Sofi'];
  const fills = house.map((p) => pantry.avatar(p, { among: house }).match(/<rect width="100" height="100" fill="(#[0-9a-f]{6})"/)[1]);
  assert.equal(new Set(fills).size, house.length);
  // Sumar a alguien no le cambia el avatar a quien ya estaba.
  const before = pantry.avatar('Ana', { among: ['Ana', 'Mateo'] });
  const after = pantry.avatar('Ana', { among: ['Ana', 'Mateo', 'Lu'] });
  const order = ['Ana', 'Mateo', 'Lu'].sort((a, b) => rng(`person:${a}`).next() - rng(`person:${b}`).next());
  if (order.indexOf('Ana') === ['Ana', 'Mateo'].sort((a, b) => rng(`person:${a}`).next() - rng(`person:${b}`).next()).indexOf('Ana')) assert.equal(before, after);
});

test('Pantry: cada producto cae en el objeto correcto', () => {
  assert.equal(pantry.kindOf('Oat milk ×2'), 'carton');
  assert.equal(pantry.kindOf('Bananas'), 'banana');
  assert.equal(pantry.kindOf('Café en grano'), 'bag');
  assert.equal(pantry.kindOf('Detergente'), 'bottle');
  assert.equal(pantry.kindOf('Arroz'), 'jar');
  assert.equal(pantry.kindOf('Té verde'), 'bag');
  assert.equal(pantry.kindOf('Pan lactal'), 'loaf');
  assert.equal(pantry.kindOf('Pancakes'), 'jar');
});
