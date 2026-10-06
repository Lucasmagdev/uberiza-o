import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const output = path.resolve(root, '../output');
await fs.mkdir(output, { recursive: true });
const text = `SEU PRÓPRIO CHEFE? — UBER OU IFOOD EM BH

JOGAR AGORA
http://localhost:4173

SEM INTERNET
Abra ${path.join(output, 'JOGAR-SEM-INTERNET.html')} no Chrome ou Edge.
O arquivo contém os dois módulos completos.

NA AULA
Escolha Uber ou iFood e clique em Jogar com a turma.
Uber: horário, tempo sem corrida e quilômetros.
iFood: horário, entregas concluídas e quilômetros de moto.
Cada clique avança. No resultado, leia entrou, custos e ficou.
Use Usar meus valores na prévia ou no resultado para informar os dados reais.
Depois, explore Autonomia, Tempo, Custos e Proteção.

RECARREGAR
Recarregar começa tudo de novo, voltando à escolha Uber/iFood.
Escolhas e saldos antigos não são recuperados. A prévia muda com as escolhas
atuais e com os valores aplicados no formulário.

REFERÊNCIAS
Gasolina de BH: R$ 6,42/l, ANP, 27/09 a 03/10/2026.
Uber: Onix MT 1.0, 13,5 km/l, Inmetro. R$ 47 por hora em viagem, referência
nacional Cebrap/Amobitec com dados de maio/2023 a abril/2024, não tarifa atual.
iFood: base de R$ 7,50 por rota simples, conforme anúncio com início em junho/2025.
Factor 150: 55,3 km/l em teste controlado, divulgado pela Yamaha em fevereiro/2026.
Pedidos agrupados e programas de ganho por período não são simulados.
Outros custos precisam ser informados; o resultado inicial desconta gasolina.
Fontes e limites: FONTES-DOS-VALORES.md e botão Fontes no jogo.

PUBLICAR
Repositório: https://github.com/Lucasmagdev/uberiza-o
Conecte-o ao Netlify ou envie ${path.join(output, 'seu-proprio-chefe-netlify.zip')} pelo Netlify Drop.
Os antigos links de publicação temporária são da versão anterior.

INICIAR LOCALMENTE
Na pasta app, execute npm start ou:
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/start-local.ps1
`;
await fs.writeFile(path.join(output, 'ACESSO-AO-JOGO.txt'), text, 'utf8');
await fs.writeFile(path.join(output, 'ABRIR-JOGO-LOCAL.url'), '[InternetShortcut]\nURL=http://localhost:4173\n', 'utf8');
console.log(JSON.stringify({ guide: path.join(output, 'ACESSO-AO-JOGO.txt'), offline: path.join(output, 'JOGAR-SEM-INTERNET.html') }));
