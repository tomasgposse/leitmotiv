// Navegador headless (Chrome o Edge) por el protocolo de DevTools, sin dependencias (Node 22+).
// Alcanza para abrir una página, esperar a que cargue y capturarla.

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';

const CANDIDATES = [
  process.env.MOTIF_BROWSER,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
  '/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser', '/opt/pw-browsers/chromium',
].filter(Boolean);

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function findBrowser() {
  const p = CANDIDATES.find((c) => fs.existsSync(c));
  if (!p) throw new Error('No encontré Chrome ni Edge. Indicá la ruta con MOTIF_BROWSER.');
  return p;
}

export async function open({ width = 1280, height = 900, scale = 2, dark = false } = {}) {
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'motif-'));
  const proc = spawn(findBrowser(), [
    '--headless=new', '--hide-scrollbars', '--no-first-run', '--no-default-browser-check',
    '--disable-background-networking', '--disable-component-update',
    '--remote-debugging-port=0', `--user-data-dir=${profile}`,
    ...(process.getuid?.() === 0 ? ['--no-sandbox'] : []), 'about:blank',
  ], { stdio: 'ignore' });
  let target;
  for (let i = 0; i < 75 && !target; i++) {
    await sleep(200);
    try {
      const port = fs.readFileSync(path.join(profile, 'DevToolsActivePort'), 'utf8').split('\n')[0].trim();
      target = (await (await fetch(`http://127.0.0.1:${port}/json/list`)).json()).find((t) => t.type === 'page');
    } catch {}
  }
  if (!target) { proc.kill(); throw new Error('El navegador no respondió.'); }
  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((r, j) => { ws.onopen = r; ws.onerror = j; });
  let id = 0;
  const pending = new Map();
  ws.onmessage = (e) => {
    const m = JSON.parse(e.data);
    if (m.id && pending.has(m.id)) { const { resolve, reject } = pending.get(m.id); pending.delete(m.id); m.error ? reject(new Error(m.error.message)) : resolve(m.result); }
  };
  const send = (method, params = {}) => new Promise((resolve, reject) => { const n = ++id; pending.set(n, { resolve, reject }); ws.send(JSON.stringify({ id: n, method, params })); });
  await send('Page.enable');
  await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: scale, mobile: false });
  if (dark) await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: 'dark' }] });
  const evaluate = async (expression) => (await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true })).result?.value;
  return {
    send, evaluate,
    async goto(url) {
      await send('Page.navigate', { url });
      for (let i = 0; i < 50; i++) { if ((await evaluate('document.readyState')) === 'complete') break; await sleep(100); }
      await sleep(300);
    },
    // Captura la página entera (o hasta maxHeight).
    async screenshot(file, { full = true, maxHeight = 14000, format = 'png' } = {}) {
      if (full) {
        const h = await evaluate('document.documentElement.scrollHeight');
        await send('Emulation.setDeviceMetricsOverride', { width, height: Math.min(h, maxHeight), deviceScaleFactor: scale, mobile: false });
        await sleep(250);
      }
      const { data } = await send('Page.captureScreenshot', { format, ...(format === 'jpeg' ? { quality: 88 } : {}) });
      fs.writeFileSync(file, Buffer.from(data, 'base64'));
    },
    async close() { try { ws.close(); } catch {} proc.kill(); await sleep(200); try { fs.rmSync(profile, { recursive: true, force: true }); } catch {} },
  };
}
