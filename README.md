# Seu Próprio Chefe?

Jogo educativo e materiais de uma apresentação sobre uberização e plataformização do trabalho no Brasil. A turma simula um dia como motorista em Belo Horizonte com três escolhas: jornada, tempo sem corrida e quilômetros rodados.

O jogo é feito em HTML, CSS e JavaScript. A tela final mostra **entrou − custos = ficou**, com opção de usar valores reais do motorista. As referências são ANP, Inmetro e Cebrap/Amobitec, com datas e limites explicados em [Fontes dos valores](output/FONTES-DOS-VALORES.md). A base conceitual é o artigo de Abílio, Amorim e Grohmann (2021).

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

1. Selecione **Jogar com a turma** e projete a tela.
2. Ouça a sala e clique em uma opção de jornada, espera e distância.
3. Compare os ganhos, o combustível e o valor após os custos informados.
4. Em **Usar meus valores**, informe o repasse e os custos do motorista.
5. Explore as provocações sobre autonomia, tempo, custos e proteção.

Cada navegador tem uma partida independente. O apresentador clica após ouvir a sala. O progresso fica no navegador quando o armazenamento está disponível.

Os ganhos iniciais usam uma referência nacional histórica por hora **em corrida**, sem remunerar a espera. O preço do combustível é de BH e o consumo inicial é de laboratório. Outros custos começam em zero e a tela avisa que o valor após gasolina ainda não é lucro completo. A taxa do aplicativo já foi descontada do indicador de ganhos e não é retirada novamente.

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
```

Os testes de navegador usam o Chrome instalado no caminho padrão do Windows. `browser-check` aceita uma URL como argumento para verificar uma publicação. Os testes de cálculo cobrem as 27 combinações, valores recebidos reais, despesas adicionais, espera e resultados negativos. A verificação de interface inclui as três escolhas, formulário, retomada, teclado, tela cheia e versão offline. Os comandos antigos `interface-check` e `improvements-check` chamam a verificação consolidada.

`scripts/artifact-check.mjs` verifica os arquivos de uma publicação registrada localmente em `app/.netlify/deployment.json`. Esse registro e suas credenciais são privados e não fazem parte do repositório.

## Referência

ABÍLIO, Ludmila Costhek; AMORIM, Henrique; GROHMANN, Rafael. Uberização e plataformização do trabalho no Brasil: conceitos, processos e formas. *Sociologias*, v. 23, n. 57, p. 26 a 56, 2021. [DOI: 10.1590/15174522-116484](https://doi.org/10.1590/15174522-116484).
