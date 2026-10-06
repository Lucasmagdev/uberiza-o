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
  await page.locator('.platform-options').waitFor();
}
async function start(page, platform, mode = 'individual') {
  await page.locator(`[data-action=select-platform][data-platform=${platform}]`).click();
  await page.locator(`[data-action=start][data-mode=${mode}]`).click();
}
async function choose(page, platform = 'uber') { for (const v of platform === 'ifood' ? [8, 18, 120] : [8, 20, 180]) await page.locator(`[data-action=choose][data-value="${v}"]`).click(); }
async function layout(page) { assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'Horizontal overflow'); }
async function fresh(width = 1440, setup) {
  const c = await browser.newContext({ viewport: { width, height: width < 760 ? 844 : 1000 }, permissions: ['clipboard-read', 'clipboard-write'] });
  if (setup) await c.addInitScript(setup);
  const p = await c.newPage(); p.on('pageerror', (e) => errors.push(e.message));
  await navigate(p); return [c, p];
}
try {
  let [context, page] = await fresh();
  await page.screenshot({ path: path.join(folder, 'platform-selection.png'), fullPage: true });
  await page.getByRole('button', { name: 'Fontes', exact: true }).click();
  const source = await page.getByRole('dialog').innerText();
  assert.ok(source.includes('41 postos') && source.includes('13,5 km/l') && source.includes('55,3 km/l') && source.includes('7,50') && source.includes('condições controladas'));
  await page.getByRole('button', { name: 'Entendi', exact: true }).click();
  await start(page, 'uber', 'class');
  assert.equal(await page.locator('.receipt-total').innerText(), 'R$\u00a0215,20');
  await page.locator('[data-action=choose][data-value="6"]').click();
  assert.equal(await page.locator('.receipt-total').innerText(), 'R$\u00a0140,00');
  await page.locator('#main').dispatchEvent('keydown', { key: '2', repeat: true, bubbles: true });
  assert.ok((await page.locator('h1').innerText()).includes('sem corrida'));
  await page.getByRole('button', { name: 'Voltar uma escolha', exact: true }).click();
  await choose(page);
  assert.equal(await page.locator('.result-net').innerText(), 'R$\u00a0215,20');
  await page.getByRole('button', { name: 'Usar meus valores', exact: true }).click();
  await page.locator('[name=actualIncome]').fill('300'); await page.locator('[name=otherCosts]').fill('30');
  await page.getByRole('button', { name: 'Calcular com esses valores', exact: true }).click();
  assert.equal(await page.locator('.result-net').innerText(), 'R$\u00a0184,40');
  await page.reload();
  assert.equal(await page.locator('.platform-options').count(), 1); assert.equal(await page.locator('.receipt, .result-net').count(), 0);
  await start(page, 'ifood', 'class');
  assert.equal(await page.locator('.receipt-total').innerText(), 'R$\u00a0121,07');
  assert.ok((await page.locator('.receipt').innerText()).includes('18 entregas'));
  await page.locator('[data-action=choose][data-value="8"]').click();
  assert.ok((await page.locator('h1').innerText()).includes('entregas'));
  await page.locator('[data-action=choose][data-value="12"]').click();
  assert.equal(await page.locator('.receipt-total').innerText(), 'R$\u00a076,07');
  await page.getByRole('button', { name: 'Usar meus valores', exact: true }).click();
  await page.locator('[name=actualIncome]').fill('180'); await page.locator('[name=otherCosts]').fill('25');
  await page.getByRole('button', { name: 'Calcular com esses valores', exact: true }).click();
  assert.equal(await page.locator('.receipt-total').innerText(), 'R$\u00a0141,07');
  assert.ok(!(await page.locator('.receipt-time').innerText()).includes('7,50'));
  await page.screenshot({ path: path.join(folder, 'ifood-preview.png'), fullPage: true });
  await page.locator('[data-action=choose][data-value="120"]').click();
  assert.equal(await page.locator('.result-net').innerText(), 'R$\u00a0141,07');
  assert.ok((await page.locator('.result-heading').innerText()).includes('12 entregas'));
  await page.getByRole('button', { name: 'Usar meus valores', exact: true }).click();
  await page.locator('[name=actualIncome]').fill('0');
  await page.getByRole('button', { name: 'Calcular com esses valores', exact: true }).click();
  assert.equal(await page.locator('.result-net').innerText(), '-R$\u00a038,93');
  await page.getByRole('button', { name: 'Usar meus valores', exact: true }).click();
  await page.locator('.advanced-settings summary').click(); await page.locator('[name=efficiency]').fill('0');
  await page.getByRole('button', { name: 'Calcular com esses valores', exact: true }).click();
  assert.equal(await page.getByRole('dialog').count(), 1); await page.keyboard.press('Escape');
  for (const title of ['Autonomia', 'Tempo', 'Custos', 'Proteção']) await page.getByRole('button', { name: title, exact: true }).click();
  await page.getByRole('button', { name: 'Compartilhar o jogo', exact: true }).click();
  assert.ok((await page.locator('#toast').innerText()).includes('Link copiado'));
  await page.locator('.brand').click(); await page.getByRole('button', { name: 'Continuar esta partida', exact: true }).click();
  assert.equal(await page.locator('.result-net').count(), 1);
  await page.getByRole('button', { name: 'Tela cheia', exact: true }).click(); assert.equal(await page.evaluate(() => !!document.fullscreenElement), true);
  await page.getByRole('button', { name: 'Tela cheia', exact: true }).click();
  await page.getByRole('button', { name: 'Trocar Uber / iFood', exact: true }).click();
  await page.getByRole('button', { name: 'Começar de novo', exact: true }).click();
  await start(page, 'uber'); assert.equal(await page.locator('.receipt-total').innerText(), 'R$\u00a0215,20');
  await page.locator('[data-action=choose][data-value="10"]').click(); await page.reload();
  assert.equal(await page.locator('.platform-options').count(), 1);
  await context.close();
  reports.push('Uber and iFood have isolated formulas and inputs. Preview updates with choices and actual amounts; reload resets from results and mid-game. Zero earnings, validation, keyboard, sharing, debates and fullscreen passed.');
  for (const width of [320, 390, 720, 1920]) for (const platform of ['uber', 'ifood']) {
    [context, page] = await fresh(width); await layout(page);
    if (platform === 'ifood') await page.screenshot({ path: path.join(folder, `selection-${width}.png`), fullPage: true });
    await start(page, platform);
    await layout(page);
    for (const v of platform === 'ifood' ? [8, 18, 120] : [8, 20, 180]) { await layout(page); await page.locator(`[data-action=choose][data-value="${v}"]`).click(); }
    await layout(page); await page.getByRole('button', { name: 'Usar meus valores', exact: true }).click();
    await layout(page); assert.ok(await page.getByRole('dialog').evaluate((el) => el.scrollWidth <= el.clientWidth + 1));
    await page.locator('.advanced-settings summary').click(); await layout(page); await page.keyboard.press('Escape');
    await page.locator('#main').focus(); await page.evaluate(() => window.scrollTo(0, 0));
    await page.screenshot({ path: path.join(folder, `${platform}-result-${width}.png`), fullPage: true });
    await context.close();
  }
  reports.push('Both modules fit at 320, 390, 720 and 1920 pixels, including platform selection and expanded actual-values forms.');
  [context, page] = await fresh(1440, () => {
    localStorage.setItem('seu-proprio-chefe-v2', JSON.stringify({ version: 2, phase: 'result', completed: 3, inputs: { actualIncome: 9999 } }));
    Object.defineProperty(Storage.prototype, 'getItem', { value() { throw new DOMException('Denied'); } });
    Object.defineProperty(Storage.prototype, 'setItem', { value() { throw new DOMException('Denied'); } });
    Object.defineProperty(navigator, 'clipboard', { value: { writeText: async () => { throw new DOMException('Denied'); } } });
  });
  assert.equal(await page.locator('.platform-options').count(), 1); await start(page, 'ifood'); await choose(page, 'ifood');
  await page.getByRole('button', { name: 'Compartilhar o jogo', exact: true }).click();
  assert.ok((await page.getByRole('textbox', { name: 'Endereço do jogo', exact: true }).inputValue()).startsWith('http'));
  await context.close(); reports.push('Legacy saved values and blocked storage do not affect new games; clipboard denial provides a selectable address.');
  context = await browser.newContext({ offline: true, viewport: { width: 390, height: 844 } }); page = await context.newPage();
  page.on('pageerror', (e) => errors.push(e.message)); const network = [];
  page.on('request', (r) => { if (r.url().startsWith('http')) network.push(r.url()); });
  await page.goto(pathToFileURL(path.join(root, 'dist/jogo-offline.html')).href);
  for (const platform of ['ifood', 'uber']) {
    await start(page, platform, 'class'); await page.keyboard.press('2'); await page.keyboard.press('2'); await page.keyboard.press('2');
    assert.equal(await page.locator('.result-net').innerText(), platform === 'ifood' ? 'R$\u00a0121,07' : 'R$\u00a0215,20');
    await layout(page); await page.reload(); assert.equal(await page.locator('.platform-options').count(), 1);
  }
  assert.deepEqual(network, []); await context.close(); assert.deepEqual(errors, []);
  reports.push('Offline file supports both modules and refresh reset without HTTP requests or JavaScript errors.');
  const report = { passed: true, base, checks: reports, errors };
  await fs.writeFile(path.join(folder, 'browser-report.json'), JSON.stringify(report, null, 2)); console.log(JSON.stringify(report));
} catch (error) { console.error(error.message); process.exitCode = 1; }
finally { await browser.close(); }
