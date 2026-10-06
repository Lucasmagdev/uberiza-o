# Seu Próprio Chefe?

Jogo educativo e materiais de uma apresentação sobre uberização e plataformização do trabalho no Brasil. A turma decide quatro situações de um dia de entregas, compara receita, custos e tempo e debate autonomia e proteção.

O jogo é feito em HTML, CSS e JavaScript. Os valores da simulação são fictícios, com regras visíveis. A base conceitual é o artigo de Abílio, Amorim e Grohmann (2021).

## Rodar localmente

Use Node.js 20 ou superior:

```sh
cd app
npm ci
npm start
```

Abra http://localhost:4173. O servidor também pode ser iniciado em segundo plano no Windows com `powershell -NoProfile -ExecutionPolicy Bypass -File scripts/start-local.ps1`, dentro da pasta `app`.

## Publicar no Netlify

Conecte este repositório à sua conta Netlify. O arquivo `netlify.toml` na raiz configura a pasta base `app`, o comando `npm run build` e a publicação de `dist`.

Para publicar manualmente:

```sh
cd app
npm run build
```

Envie a pasta `app/dist` pelo [Netlify Drop](https://app.netlify.com/drop). Os arquivos de acesso de publicações temporárias ficam apenas no computador e são excluídos do Git.

## Jogar sem internet

O comando de build também cria `output/JOGAR-SEM-INTERNET.html`. Abra esse arquivo no navegador para jogar sem servidor ou conexão. A mesma versão está disponível para baixar na tela inicial do site.

## Usar com a turma

1. Selecione **Conduzir com a turma** e projete a tela.
2. Registre a votação inicial por mãos levantadas.
3. Ouça a sala, confirme as quatro decisões e leia as provocações.
4. Compare a conta final e os cenários de afastamento.
5. Registre a votação final e discuta o que mudou.

Cada navegador tem uma partida independente. O modo turma registra votos manualmente no computador do apresentador. As respostas não são sincronizadas entre celulares. O progresso fica no navegador quando o armazenamento está disponível.

## Materiais da apresentação

- [Roadmap dos slides](output/roadmap_slides_uberizacao.txt).
- [Resumo dos 16 slides](output/resumo_slides_uberizacao.txt).
- [Prompt para o Canva](output/prompt_canva_16_slides.txt).
- [Instruções do jogo](app/LEIA-ME.txt).

## Verificação

```sh
cd app
npm test
npm run build
npm start
```

Com o servidor ativo, execute em outro terminal:

```sh
node scripts/browser-check.mjs
node scripts/interface-check.mjs
node scripts/improvements-check.mjs
```

Os testes de navegador usam o Chrome instalado no caminho padrão do Windows. `browser-check` e `improvements-check` aceitam uma URL como argumento para verificar uma publicação. Os testes de cálculo cobrem as 24 combinações de decisões. Os testes de interface verificam partidas individuais e coletivas, votações, retomada, teclado e a versão offline.

`scripts/artifact-check.mjs` verifica os arquivos de uma publicação registrada localmente em `app/.netlify/deployment.json`. Esse registro e suas credenciais são privados e não fazem parte do repositório.

## Referência

ABÍLIO, Ludmila Costhek; AMORIM, Henrique; GROHMANN, Rafael. Uberização e plataformização do trabalho no Brasil: conceitos, processos e formas. *Sociologias*, v. 23, n. 57, p. 26 a 56, 2021. [DOI: 10.1590/15174522-116484](https://doi.org/10.1590/15174522-116484).
