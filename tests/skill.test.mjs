// El encabezado de SKILL.md tiene que cargar: YAML válido y descripción de hasta 1024 caracteres.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

test('SKILL.md: nombre y descripción cargables', () => {
  const skill = fs.readFileSync(path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'SKILL.md'), 'utf8');
  const fm = skill.split('---')[1];
  assert.equal(fm.match(/^name: (.+)$/m)?.[1], 'motif');
  const desc = fm.match(/^description: (.+)$/m)?.[1];
  assert.ok(desc && desc.length <= 1024, `descripción de ${desc?.length} caracteres`);
  assert.ok(!/: /.test(desc) && !/ #/.test(desc), 'la descripción no puede tener ": " ni " #"');
});
