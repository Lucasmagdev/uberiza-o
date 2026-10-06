import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const base = process.argv[2] || 'http://localhost:4173';
const browser = await chromium.launch({ headless: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
const reports = [];
let failure = false;

async function check(name, run) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  try {
    await page.goto(base);
    if (await page.locator('input[type=password]').count()) {
      const deployment = JSON.parse(await fs.readFile(path.join(root, '.netlify/deployment.json'), 'utf8'));
      assert.equal(new URL(base).hostname, new URL(deployment.site_url).hostname);
      await page.locator('input[type=password]').fill(deployment.password);
      await page.getByRole('button', { name: 'Submit', exact: true }).click();
    }
    await page.getByRole('button', { name: 'Começar meu dia', exact: true }).waitFor();
    await run(page, context);
    reports.push({ name, passed: true });
  } catch (e) { reports.push({ name, passed: false, error: e.message.split('\n')[0] }); failure = true; }
  finally { await context.close(); }
}
async function start(page, classMode = false) {
  await page.getByRole('button', { name: classMode ? 'Conduzir com a turma' : 'Começar meu dia', exact: true }).click();
  if (classMode) await page.getByRole('spinbutton', { name: 'Votos em Sim', exact: true }).fill('1');
  else await page.getByRole('button', { name: '01 Sim', exact: false }).click();
  await page.getByRole('button', { name: 'Vamos trabalhar', exact: true }).click();
}

await check('Keyboard repeat cannot skip the consequence screen', async (page) => {
  await start(page);
  await page.keyboard.press('1');
  await page.keyboard.press('Enter');
  await page.getByText('PARA PENSAR', { exact: true }).waitFor();
  await page.locator('#main').dispatchEvent('keydown', { key: 'Enter', code: 'Enter', repeat: true, bubbles: true });
  assert.equal(await page.getByText('PARA PENSAR', { exact: true }).count(), 1);
});

await check('Brand navigation offers a restart instead of silently reloading', async (page) => {
  await start(page);
  await page.locator('.brand').click();
  assert.equal(await page.getByRole('dialog').count(), 1);
  await page.getByRole('button', { name: 'Continuar esta partida', exact: true }).click();
  assert.ok((await page.locator('h1').innerText()).includes('Quanto tempo'));
});

await check('Mobile controls retain accessible names', async (page) => {
  await page.setViewportSize({ width: 390, height: 844 });
  assert.equal(await page.getByRole('button', { name: 'Tela cheia', exact: true }).count(), 1);
  assert.equal(await page.getByRole('button', { name: 'Sobre', exact: true }).count(), 1);
});

await check('Classroom mode enlarges the financial and voting text', async (page) => {
  await start(page, true);
  assert.ok(await page.locator('.ledger').evaluate((el) => parseFloat(getComputedStyle(el).fontSize) >= 16));
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
});

await check('Storage failure keeps the full game usable and explains persistence', async (page, context) => {
  await context.addInitScript(() => { Object.defineProperty(Storage.prototype, 'setItem', { value() { throw new DOMException('Unavailable', 'QuotaExceededError'); } }); });
  await page.reload();
  await start(page);
  assert.equal(await page.getByText('Partida nesta aba: o navegador não permitiu salvar.', { exact: true }).count(), 1);
  for (let i = 0; i < 4; i++) {
    await page.locator('[data-action=choose]').first().click();
    await page.getByRole('button', { name: 'Confirmar escolha', exact: true }).click();
    await page.locator('[data-action=next-round]').click();
  }
  assert.equal(await page.locator('.result-net > strong').count(), 1);
});

await check('Invalid saved JSON recovers and saves the next game normally', async (page) => {
  await page.evaluate(() => localStorage.setItem('seu-proprio-chefe-v1', '{broken'));
  await page.reload();
  await start(page);
  assert.equal(await page.locator('#storage-note').isVisible(), false);
  await page.reload();
  assert.ok((await page.locator('h1').innerText()).includes('Quanto tempo'));
});

await check('Denied storage reads also keep gameplay available', async (page, context) => {
  await context.addInitScript(() => { Object.defineProperty(Storage.prototype, 'getItem', { value() { throw new DOMException('Denied', 'SecurityError'); } }); });
  await page.reload();
  await start(page);
  assert.equal(await page.locator('#storage-note').isVisible(), true);
  await page.locator('[data-action=choose]').first().click();
  await page.locator('[data-action=confirm]').click();
  assert.equal(await page.getByText('PARA PENSAR', { exact: true }).count(), 1);
});

await check('Copy denial gives a selectable link', async (page, context) => {
  await context.addInitScript(() => { Object.defineProperty(navigator, 'clipboard', { value: { writeText: async () => { throw new DOMException('Denied', 'NotAllowedError'); } } }); });
  await page.reload();
  await start(page);
  for (let i = 0; i < 4; i++) {
    await page.locator('[data-action=choose]').first().click();
    await page.locator('[data-action=confirm]').click();
    await page.locator('[data-action=next-round]').click();
  }
  await page.getByRole('button', { name: 'Compartilhar o jogo', exact: true }).click();
  assert.equal(await page.getByRole('dialog').count(), 1);
  assert.ok((await page.getByRole('textbox', { name: 'Endereço do jogo', exact: true }).inputValue()).startsWith('http'));
});

try {
  const context = await browser.newContext({ offline: true, viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  const errors = [];
  const httpRequests = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('request', (request) => { if (request.url().startsWith('http')) httpRequests.push(request.url()); });
  await page.goto(pathToFileURL(path.join(root, 'dist/jogo-offline.html')).href);
  await start(page);
  for (let i = 0; i < 4; i++) {
    await page.locator('[data-action=choose]').first().click();
    await page.locator('[data-action=confirm]').click();
    await page.locator('[data-action=next-round]').click();
  }
  await page.getByRole('button', { name: 'Responder de novo', exact: true }).click();
  await page.getByRole('button', { name: '03 Não', exact: false }).click();
  await page.getByRole('button', { name: 'Comparar respostas', exact: true }).click();
  assert.equal(await page.locator('.vote-chart').count(), 2);
  await page.getByRole('button', { name: 'Jogar novamente', exact: true }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Recomeçar', exact: true }).click();
  await start(page, true);
  await page.screenshot({ path: path.join(root, 'tmp/qa/offline-class-mobile.png'), fullPage: true });
  for (let i = 0; i < 4; i++) {
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
    await page.locator('[data-action=choose]').first().click();
    await page.locator('[data-action=confirm]').click();
    await page.locator('[data-action=next-round]').click();
  }
  await page.getByRole('button', { name: 'Compartilhar o jogo', exact: true }).click();
  assert.equal(await page.getByRole('heading', { name: 'Compartilhar a versão offline', exact: true }).count(), 1);
  assert.equal(await page.getByRole('textbox').count(), 0);
  await page.getByRole('dialog').getByRole('button', { name: 'Fechar', exact: true }).last().click();
  await page.getByRole('button', { name: 'Responder de novo', exact: true }).click();
  await page.getByRole('spinbutton', { name: 'Votos em Não', exact: true }).fill('1');
  await page.getByRole('button', { name: 'Comparar respostas', exact: true }).click();
  assert.equal(await page.locator('.vote-chart').count(), 2);
  await page.reload();
  assert.equal(await page.locator('.vote-chart').count(), 2);
  assert.deepEqual(errors, []);
  assert.deepEqual(httpRequests, []);
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
  await context.close();
  reports.push({ name: 'Standalone HTML completes individual and classroom games, sharing and vote comparison without internet or a server', passed: true });
} catch (e) { reports.push({ name: 'Standalone offline HTML', passed: false, error: e.message.split('\n')[0] }); failure = true; }
await browser.close();
await fs.mkdir(path.join(root, 'tmp/qa'), { recursive: true });
await fs.writeFile(path.join(root, 'tmp/qa/improvements-report.json'), JSON.stringify({ base, passed: !failure, checks: reports }, null, 2));
console.log(JSON.stringify({ passed: !failure, checks: reports }));
process.exitCode = failure ? 1 : 0;
