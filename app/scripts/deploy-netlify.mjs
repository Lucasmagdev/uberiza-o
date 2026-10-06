import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const output = path.join(root, '.netlify');
fs.mkdirSync(output, { recursive: true });
try {
  const raw = execFileSync('npx.cmd', ['--yes', 'netlify-cli', 'deploy', '--allow-anonymous', '--dir', 'dist', '--no-build', '--json'], {
    cwd: root, encoding: 'utf8', shell: true, stdio: ['ignore', 'pipe', 'pipe'], timeout: 180000,
    env: { ...process.env, NETLIFY_TELEMETRY_DISABLED: '1', CI: 'true' },
  });
  const data = JSON.parse(raw);
  if (fs.existsSync(path.join(output, 'deployment.json'))) fs.copyFileSync(path.join(output, 'deployment.json'), path.join(output, 'deployment.previous.json'));
  fs.writeFileSync(path.join(output, 'deployment.json'), raw);
  console.log(JSON.stringify({ url: data.deploy_url || data.url || data.site_url, state: data.state, deploy_id: data.deploy_id, site_id: data.site_id, accessGuide: 'output/ACESSO-AO-JOGO.txt' }));
} catch (error) {
  const text = [error.stdout?.toString(), error.stderr?.toString(), error.message].filter(Boolean).join('\n');
  fs.writeFileSync(path.join(output, 'deploy-error.log'), text);
  console.error('Netlify deploy could not finish. See the local deployment log.');
  process.exitCode = 1;
}
