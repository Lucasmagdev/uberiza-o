import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const base = process.argv[2] || 'http://localhost:4173';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const folder = path.join(root, 'tmp/qa');
await fs.mkdir(folder, { recursive: true });
const browser = await chromium.launch({ headless: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
const errors = [];
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await context.newPage();
page.on('pageerror', (e) => errors.push(e.message));
const report = [];
let deployment;
try { deployment = JSON.parse(await fs.readFile(path.join(root, '.netlify/deployment.json'), 'utf8')); } catch { /* Local tests do not need a deployment. */ }
async function navigate(target) {
  await target.goto(base);
  if (await target.locator('input[type="password"][name="password"]').count()) {
    assert.ok(deployment?.password && new URL(base).hostname === new URL(deployment.site_url).hostname, 'Deployment password unavailable for this site');
    await target.locator('input[type="password"][name="password"]').fill(deployment.password);
    await target.getByRole('button', { name: 'Submit', exact: true }).click();
  }
  await target.getByRole('button', { name: 'Começar meu dia', exact: true }).waitFor();
}
async function checkLayout(label) {
  const dimensions = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, width: window.innerWidth }));
  assert.ok(dimensions.scroll <= dimensions.width + 1, `${label}: horizontal overflow`);
}
async function snapshot(name) { await page.screenshot({ path: path.join(folder, name + '.png'), fullPage: true }); }
async function finishRound(title, expectedNext) {
  await page.getByRole('button', { name: title, exact: false }).click();
  await page.getByRole('button', { name: 'Confirmar escolha', exact: true }).click();
  assert.equal(await page.getByText('PARA PENSAR', { exact: true }).count(), 1);
  await page.getByRole('button', { name: expectedNext, exact: true }).click();
}

try {
  await navigate(page);
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  await page.getByRole('button', { name: 'Começar meu dia', exact: true }).waitFor();
  await checkLayout('desktop intro');
  await snapshot('01-desktop-intro');
  await page.getByRole('button', { name: 'Sobre', exact: true }).click();
  await page.getByRole('dialog').waitFor();
  assert.ok((await page.getByRole('dialog').innerText()).includes('Os valores são fictícios'));
  await page.getByRole('button', { name: 'Entendi', exact: true }).click();
  report.push('Introdução e referência conceitual acessíveis.');

  await page.getByRole('button', { name: 'Começar meu dia', exact: true }).click();
  assert.equal(await page.getByRole('button', { name: 'Vamos trabalhar', exact: true }).isDisabled(), true);
  await page.getByRole('button', { name: '02 Em parte', exact: false }).click();
  await page.getByRole('button', { name: 'Vamos trabalhar', exact: true }).click();
  await page.getByRole('button', { name: /8 horas/ }).click();
  await snapshot('02-desktop-round');
  await page.keyboard.press('Enter');
  await page.getByText('PARA PENSAR', { exact: true }).waitFor();
  await page.getByRole('button', { name: 'Próxima decisão', exact: true }).click();
  await page.reload();
  assert.ok((await page.locator('h1').innerText()).includes('O pedido ainda não está pronto'));
  report.push('Voto inicial, escolha por teclado e retomada após recarregar.');

  await finishRound('Esperar o pedido', 'Próxima decisão');
  await finishRound('Continuar por 2 horas', 'Próxima decisão');
  await finishRound('Cenário sem apoio', 'Ver minha conta');
  assert.equal(await page.locator('.result-net > strong').innerText(), 'R$\u00a0166,00');
  assert.ok((await page.locator('.result-net > p').innerText()).includes('11,5 h'));
  assert.ok((await page.locator('.away-panel > h2').innerText()).includes('14,00'));
  await checkLayout('desktop result');
  await snapshot('03-desktop-result');
  await page.getByRole('button', { name: 'Com apoio hipotético', exact: true }).click();
  assert.equal(await page.locator('.away-panel > h2').innerText(), 'As despesas estariam cobertas.');
  assert.equal(await page.locator('.result-net > strong').innerText(), 'R$\u00a0166,00');
  await page.getByRole('button', { name: 'Consumo', exact: true }).click();
  assert.ok((await page.locator('.debate-section h2').innerText()).includes('rápida e barata'));
  report.push('Partida completa: R$ 166,00 em 11,5 h; apoio muda proteção, preservando rendimento.');

  await page.getByRole('button', { name: 'Responder de novo', exact: true }).click();
  await page.getByRole('button', { name: '03 Não', exact: false }).click();
  await page.getByRole('button', { name: 'Comparar respostas', exact: true }).click();
  assert.equal(await page.locator('.vote-chart').count(), 2);
  await snapshot('04-desktop-reflection');
  await page.getByRole('button', { name: 'Jogar novamente', exact: true }).click();
  await page.getByRole('button', { name: 'Continuar esta partida', exact: true }).click();
  assert.ok((await page.locator('h1').innerText()).includes('A mesma pergunta'));
  await page.getByRole('button', { name: 'Jogar novamente', exact: true }).click();
  await page.getByRole('button', { name: 'Recomeçar', exact: true }).last().click();
  report.push('Votação final, comparação e confirmação de reinício.');

  await page.getByRole('button', { name: 'Conduzir com a turma', exact: true }).click();
  await page.getByRole('spinbutton', { name: 'Votos em Sim', exact: true }).fill('8');
  await page.getByRole('spinbutton', { name: 'Votos em Em parte', exact: true }).fill('12');
  await page.getByRole('spinbutton', { name: 'Votos em Não', exact: true }).fill('10');
  assert.ok((await page.locator('.vote-count').innerText()).includes('30 respostas'));
  await page.getByRole('button', { name: 'Vamos trabalhar', exact: true }).click();
  await page.getByRole('button', { name: /6 horas/ }).click();
  await page.getByRole('button', { name: 'Confirmar escolha', exact: true }).click();
  await page.getByRole('button', { name: 'Mudar esta escolha', exact: true }).click();
  await page.getByRole('button', { name: /12 horas/ }).click();
  await page.getByRole('button', { name: 'Confirmar escolha', exact: true }).click();
  assert.ok((await page.locator('.receipt-total').innerText()).includes('162,00'));
  await page.getByRole('button', { name: 'Próxima decisão', exact: true }).click();
  await page.getByRole('button', { name: 'Voltar', exact: true }).click();
  assert.ok((await page.locator('h1').innerText()).includes('Quanto tempo'));
  await page.getByRole('button', { name: 'Confirmar escolha', exact: true }).click();
  await page.getByRole('button', { name: 'Próxima decisão', exact: true }).click();
  await finishRound('Buscar outra entrega', 'Próxima decisão');
  await finishRound('Encerrar e descansar', 'Próxima decisão');
  await finishRound('Cenário com apoio', 'Ver minha conta');
  await page.getByRole('button', { name: 'Responder de novo', exact: true }).click();
  await page.getByRole('spinbutton', { name: 'Votos em Sim', exact: true }).fill('3');
  await page.getByRole('spinbutton', { name: 'Votos em Em parte', exact: true }).fill('15');
  await page.getByRole('spinbutton', { name: 'Votos em Não', exact: true }).fill('12');
  await page.getByRole('button', { name: 'Comparar respostas', exact: true }).click();
  assert.ok((await page.locator('.vote-chart').first().innerText()).includes('40%'));
  assert.ok((await page.locator('.vote-chart').last().innerText()).includes('50%'));
  report.push('Modo turma: 30 votos, correção de escolhas, retorno de rodada e comparação final.');

  for (const size of [{ width: 390, height: 844 }, { width: 320, height: 740 }, { width: 1920, height: 1080 }]) {
    const mobile = await browser.newContext({ viewport: size });
    const p = await mobile.newPage();
    p.on('pageerror', (e) => errors.push(e.message));
    await navigate(p);
    await p.getByRole('button', { name: 'Começar meu dia', exact: true }).waitFor();
    assert.ok(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
    await p.screenshot({ path: path.join(folder, `05-intro-${size.width}.png`), fullPage: true });
    await p.getByRole('button', { name: 'Começar meu dia', exact: true }).click();
    await p.getByRole('button', { name: '01 Sim', exact: false }).click();
    await p.getByRole('button', { name: 'Vamos trabalhar', exact: true }).click();
    assert.ok(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
    await p.screenshot({ path: path.join(folder, `06-round-${size.width}.png`), fullPage: true });
    for (let i = 0; i < 4; i++) {
      await p.locator('[data-action="choose"]').first().click();
      await p.getByRole('button', { name: 'Confirmar escolha', exact: true }).click();
      await p.locator('[data-action="next-round"]').click();
    }
    assert.ok(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
    await p.screenshot({ path: path.join(folder, `07-result-${size.width}.png`), fullPage: true });
    await mobile.close();
  }
  report.push('Sem rolagem horizontal em 320 px, 390 px e 1920 px; partida funcional nessas telas.');
  assert.deepEqual(errors, []);
  report.push('Nenhum erro de JavaScript ou console.');
  await fs.writeFile(path.join(folder, 'browser-report.json'), JSON.stringify({ base, passed: true, checks: report, errors }, null, 2));
  console.log(JSON.stringify({ passed: true, base, checks: report, screenshots: folder }));
} catch (e) {
  await page.screenshot({ path: path.join(folder, 'failure.png'), fullPage: true });
  console.error('Browser check failed:', e.message);
  process.exitCode = 1;
} finally { await browser.close(); }
