import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const files = ['index.html', 'styles.css', 'engine.js', 'app.js', 'favicon.svg'];
await fs.mkdir(path.join(root, 'dist'), { recursive: true });
for (const name of files) await fs.copyFile(path.join(root, 'public', name), path.join(root, 'dist', name));
const [html, css, engine, app, favicon] = await Promise.all(files.map((name) => fs.readFile(path.join(root, 'public', name), 'utf8')));
const script = engine.replace(/^export /gm, '') + '\n' + app.replace(/^import[^\n]+\n/, '');
const offline = html
  .replace('href="./favicon.svg"', `href="data:image/svg+xml;base64,${Buffer.from(favicon).toString('base64')}"`)
  .replace('<link rel="stylesheet" href="./styles.css">', () => `<style>${css.replace(/^@charset[^\n]+\n/, '')}</style>`)
  .replace('<script type="module" src="./app.js"></script>', () => `<script>\n(() => {\n${script.replace(/<\/script/gi, '<\\/script')}\n})();\n</script>`);
await fs.writeFile(path.join(root, 'dist/jogo-offline.html'), offline, 'utf8');
const output = path.resolve(root, '../output');
await fs.mkdir(output, { recursive: true });
await fs.writeFile(path.join(output, 'JOGAR-SEM-INTERNET.html'), offline, 'utf8');
console.log(`Build OK: ${files.length + 1} static files, including a standalone offline game.`);
