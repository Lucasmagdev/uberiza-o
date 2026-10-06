import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const deployment = JSON.parse(await fs.readFile(path.join(root, '.netlify/deployment.json'), 'utf8'));
const url = process.argv[2] || deployment.site_url.replace(/^http:/, 'https:');
const browser = await chromium.launch({ headless: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
try {
  const context = await browser.newContext({ acceptDownloads: true });
  const page = await context.newPage();
  await page.goto(url);
  if (await page.locator('input[type=password]').count()) {
    assert.equal(new URL(url).hostname, new URL(deployment.site_url).hostname);
    await page.locator('input[type=password]').fill(deployment.password);
    await page.getByRole('button', { name: 'Submit', exact: true }).click();
  }
  await page.getByRole('button', { name: 'Começar meu dia', exact: true }).waitFor();
  const pendingDownload = page.waitForEvent('download');
  await page.getByRole('link', { name: 'Baixar versão para jogar sem internet', exact: true }).click();
  const download = await pendingDownload;
  assert.equal(await download.failure(), null);
  assert.equal(download.suggestedFilename(), 'JOGAR-SEM-INTERNET.html');
  const published = await fs.readFile(await download.path());
  const built = await fs.readFile(path.join(root, 'dist/jogo-offline.html'));
  const handoff = await fs.readFile(path.resolve(root, '../output/JOGAR-SEM-INTERNET.html'));
  assert.deepEqual(published, built);
  assert.deepEqual(handoff, built);
  for (const name of ['index.html', 'styles.css', 'engine.js', 'app.js', 'favicon.svg']) {
    const response = await context.request.get(new URL(name, url.endsWith('/') ? url : url + '/').href);
    assert.equal(response.status(), 200);
    assert.deepEqual(await response.body(), await fs.readFile(path.join(root, 'public', name)));
  }
  const report = { passed: true, url, checks: ['Published assets match the final source.', 'The offline download matches the built game and the file delivered to the user.'], offlineBytes: built.length };
  await fs.mkdir(path.join(root, 'tmp/qa'), { recursive: true });
  await fs.writeFile(path.join(root, 'tmp/qa/artifact-report.json'), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report));
  await context.close();
} catch (error) { console.error(error.message.split('\n')[0]); process.exitCode = 1; }
finally { await browser.close(); }
