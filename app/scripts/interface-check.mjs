import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';

const browser = await chromium.launch({ headless: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, permissions: ['clipboard-read', 'clipboard-write'] });
const page = await context.newPage();
const report = [];
try {
  await page.goto(process.argv[2] || 'http://localhost:4173');
  await page.getByRole('button', { name: 'Tela cheia', exact: true }).click();
  assert.equal(await page.evaluate(() => Boolean(document.fullscreenElement)), true);
  await page.getByRole('button', { name: 'Tela cheia', exact: true }).click();
  assert.equal(await page.evaluate(() => Boolean(document.fullscreenElement)), false);
  report.push('Tela cheia entra e sai corretamente.');
  await page.getByRole('button', { name: 'Conduzir com a turma', exact: true }).click();
  await page.getByRole('spinbutton', { name: 'Votos em Sim', exact: true }).fill('-8');
  await page.getByRole('spinbutton', { name: 'Votos em Em parte', exact: true }).click();
  assert.equal(await page.getByRole('spinbutton', { name: 'Votos em Sim', exact: true }).inputValue(), '0');
  await page.getByRole('spinbutton', { name: 'Votos em Em parte', exact: true }).fill('1');
  await page.getByRole('button', { name: 'Vamos trabalhar', exact: true }).click();
  for (let i = 0; i < 4; i++) {
    await page.keyboard.press('1');
    await page.keyboard.press('Enter');
    await page.getByText('PARA PENSAR', { exact: true }).waitFor();
    await page.keyboard.press('Enter');
  }
  report.push('Contagem rejeita votos negativos; as quatro rodadas funcionam inteiramente pelo teclado.');
  await page.getByRole('button', { name: 'Compartilhar o jogo', exact: true }).click();
  assert.ok((await page.locator('#toast').innerText()).includes('Link copiado'));
  report.push('Compartilhamento copia o link.');
  await page.setViewportSize({ width: 720, height: 450 });
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
  report.push('Layout não transborda na área equivalente a zoom de 200%.');
  await page.getByRole('button', { name: 'Sobre', exact: true }).click();
  await page.keyboard.press('Escape');
  assert.equal(await page.getByRole('dialog').count(), 0);
  report.push('Diálogo fecha com Escape.');
  console.log(JSON.stringify({ passed: true, checks: report }));
} catch (e) { console.error('Interface check failed:', e.message); process.exitCode = 1; }
finally { await browser.close(); }
