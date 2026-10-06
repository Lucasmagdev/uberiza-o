import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const base = process.argv[2] || 'http://localhost:4173';
const folder = path.join(root, 'tmp/qa');
await fs.mkdir(folder, { recursive: true });
const browser = await chromium.launch({ headless: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
const reports = [], errors = [];
async function navigate(page) {
  await page.goto(base);
  if (await page.locator('input[type=password]').count()) {
    const d = JSON.parse(await fs.readFile(path.join(root, '.netlify/deployment.json'), 'utf8'));
    assert.equal(new URL(base).hostname, new URL(d.site_url).hostname);
    await page.locator('input[type=password]').fill(d.password);
    await page.getByRole('button', { name: 'Submit', exact: true }).click();
  }
  await page.getByRole('button', { name: 'Jogar sozinho', exact: true }).waitFor();
}
async function choose(page, values = [8, 20, 180]) { for (const v of values) await page.locator(`[data-action=choose][data-value="${v}"]`).click(); }
async function layout(page) { assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'Horizontal overflow'); }
async function fresh(width = 1440, setup) {
  const c = await browser.newContext({ viewport: { width, height: width < 760 ? 844 : 1000 }, permissions: ['clipboard-read', 'clipboard-write'] });
  if (setup) await c.addInitScript(setup);
  const p = await c.newPage();
  p.on('pageerror', (e) => errors.push(e.message));
  await navigate(p);
  return [c, p];
}
try {
  let [context, page] = await fresh();
  await page.screenshot({ path: path.join(folder, 'driver-intro.png'), fullPage: true });
  await page.getByRole('button', { name: 'Fontes', exact: true }).click();
  const source = await page.getByRole('dialog').innerText();
  assert.ok(source.includes('maio/2023 a abril/2024') && source.includes('41 postos') && source.includes('13,5 km/l'));
  await page.getByRole('button', { name: 'Entendi', exact: true }).click();
  await page.getByRole('button', { name: 'Jogar com a turma', exact: false }).click();
  assert.equal(await page.getByRole('spinbutton').count(), 0);
  await page.getByRole('button', { name: /8 horas/ }).click();
  await page.locator('#main').dispatchEvent('keydown', { key: '2', repeat: true, bubbles: true });
  assert.ok((await page.locator('h1').innerText()).includes('sem corrida'));
  await page.getByRole('button', { name: 'Voltar uma escolha', exact: true }).click();
  await page.getByRole('button', { name: /8 horas/ }).click();
  await page.reload();
  assert.ok((await page.locator('h1').innerText()).includes('sem corrida'));
  await page.screenshot({ path: path.join(folder, 'driver-wait.png'), fullPage: true });
  await page.locator('[data-action=choose][data-value="20"]').click();
  await page.locator('[data-action=choose][data-value="180"]').click();
  assert.equal(await page.locator('.result-net').innerText(), 'R$\u00a0215,20');
  assert.ok((await page.locator('.result-heading').innerText()).includes('6h24'));
  assert.ok((await page.locator('.cost-alert').innerText()).includes('ainda não é o lucro completo'));
  await page.screenshot({ path: path.join(folder, 'driver-result.png'), fullPage: true });
  await page.getByRole('button', { name: 'Usar meus valores', exact: true }).click();
  await page.locator('[name=actualIncome]').fill('300');
  await page.locator('[name=otherCosts]').fill('30');
  await page.getByRole('button', { name: 'Calcular com esses valores', exact: true }).click();
  assert.equal(await page.locator('.result-net').innerText(), 'R$\u00a0184,40');
  await page.reload();
  assert.equal(await page.locator('.result-net').innerText(), 'R$\u00a0184,40');
  await page.getByRole('button', { name: 'Usar meus valores', exact: true }).click();
  await page.locator('[name=actualIncome]').fill('0');
  await page.getByRole('button', { name: 'Calcular com esses valores', exact: true }).click();
  assert.equal(await page.locator('.result-net').innerText(), '-R$\u00a0115,60');
  await page.getByRole('button', { name: 'Usar meus valores', exact: true }).click();
  await page.locator('.advanced-settings summary').click();
  await page.locator('[name=efficiency]').fill('0');
  await page.getByRole('button', { name: 'Calcular com esses valores', exact: true }).click();
  assert.equal(await page.getByRole('dialog').count(), 1);
  await page.keyboard.press('Escape');
  for (const title of ['Autonomia', 'Tempo', 'Custos', 'Proteção']) await page.getByRole('button', { name: title, exact: true }).click();
  await page.getByRole('button', { name: 'Compartilhar o jogo', exact: true }).click();
  assert.ok((await page.locator('#toast').innerText()).includes('Link copiado'));
  await page.locator('.brand').click();
  await page.getByRole('button', { name: 'Continuar esta partida', exact: true }).click();
  assert.equal(await page.locator('.result-net').count(), 1);
  await page.getByRole('button', { name: 'Tela cheia', exact: true }).click();
  assert.equal(await page.evaluate(() => !!document.fullscreenElement), true);
  await page.getByRole('button', { name: 'Tela cheia', exact: true }).click();
  reports.push('Three choices complete the classroom flow without voting fields; real data, costs, zero earnings, reload, validation, debates, sharing and fullscreen work.');
  await context.close();
  for (const width of [320, 390, 720, 1920]) {
    [context, page] = await fresh(width);
    await layout(page);
    await page.getByRole('button', { name: 'Jogar sozinho', exact: true }).click();
    for (const v of [8, 20, 180]) { await layout(page); await page.locator(`[data-action=choose][data-value="${v}"]`).click(); }
    await layout(page);
    await page.getByRole('button', { name: 'Usar meus valores', exact: true }).click();
    await layout(page);
    assert.ok(await page.getByRole('dialog').evaluate((el) => el.scrollWidth <= el.clientWidth + 1));
    await page.keyboard.press('Escape');
    await page.locator('#main').focus();
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.screenshot({ path: path.join(folder, `driver-result-${width}.png`), fullPage: true });
    await context.close();
  }
  reports.push('No horizontal overflow at 320, 390, 720 and 1920 pixels, including the real-values form.');
  [context, page] = await fresh(1440, () => { Object.defineProperty(Storage.prototype, 'setItem', { value() { throw new DOMException('Denied'); } }); Object.defineProperty(navigator, 'clipboard', { value: { writeText: async () => { throw new DOMException('Denied'); } } }); });
  await page.getByRole('button', { name: 'Jogar sozinho', exact: true }).click();
  await choose(page);
  assert.equal(await page.locator('#storage-note').count(), 1);
  await page.getByRole('button', { name: 'Compartilhar o jogo', exact: true }).click();
  assert.ok((await page.getByRole('textbox', { name: 'Endereço do jogo', exact: true }).inputValue()).startsWith('http'));
  await context.close();
  reports.push('Blocked storage and clipboard have working fallbacks.');
  context = await browser.newContext({ offline: true, viewport: { width: 390, height: 844 } });
  page = await context.newPage();
  page.on('pageerror', (e) => errors.push(e.message));
  const network = [];
  page.on('request', (r) => { if (r.url().startsWith('http')) network.push(r.url()); });
  await page.goto(pathToFileURL(path.join(root, 'dist/jogo-offline.html')).href);
  await page.getByRole('button', { name: 'Jogar com a turma', exact: false }).click();
  await page.keyboard.press('2'); await page.keyboard.press('2'); await page.keyboard.press('2');
  assert.equal(await page.locator('.result-net').innerText(), 'R$\u00a0215,20');
  await page.getByRole('button', { name: 'Usar meus valores', exact: true }).click();
  await page.locator('[name=actualIncome]').fill('300');
  await page.locator('[name=otherCosts]').fill('30');
  await page.getByRole('button', { name: 'Calcular com esses valores', exact: true }).click();
  await page.reload();
  assert.equal(await page.locator('.result-net').innerText(), 'R$\u00a0184,40');
  await layout(page);
  assert.deepEqual(network, []);
  await context.close();
  assert.deepEqual(errors, []);
  reports.push('Offline game completes with keyboard, real inputs and reload, with no HTTP requests or JavaScript errors.');
  const report = { passed: true, base, checks: reports, errors };
  await fs.writeFile(path.join(folder, 'browser-report.json'), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report));
} catch (error) { console.error(error.message); process.exitCode = 1; }
finally { await browser.close(); }
