# Seu Próprio Chefe?

Jogo educativo e materiais de uma apresentação sobre uberização e plataformização do trabalho no Brasil. No início, escolha entre motorista da Uber, motorista da 99 e motoboy do iFood em Belo Horizonte. Cada módulo tem três escolhas e uma conta própria para carro ou moto.

O jogo é feito em HTML, CSS e JavaScript. A tela final mostra **entrou − custos = ficou**, com opção de usar os valores reais do trabalhador. As referências são ANP, Inmetro, Cebrap/Amobitec, iFood e Yamaha, com datas e limites explicados em [Fontes dos valores](output/FONTES-DOS-VALORES.md). A base conceitual é o artigo de Abílio, Amorim e Grohmann (2021).

**Jogar online:** https://lucasmagdev.github.io/uberiza-o/

O GitHub Pages publica a pasta `docs` da branch `main`. Antes de enviar mudanças do jogo, execute `npm test` e `npm run build` em `app`: o build atualiza `docs`, o pacote do site e o HTML offline. Envie também os arquivos gerados em `docs`; o Pages atualizará o endereço. Os links temporários antigos do Netlify não acompanham os commits.

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

1. Escolha **Uber**, **99** ou **iFood**, selecione **Jogar com a turma** e projete a tela.
2. Ouça a sala e escolha jornada, espera e distância na Uber/99, ou jornada, entregas e distância no iFood.
3. Compare os ganhos, o combustível e o valor após os custos informados.
4. Em **Usar meus valores**, no resultado, informe o repasse e os custos do trabalhador.
5. Explore as provocações sobre autonomia, tempo, custos e proteção.

Cada navegador tem uma partida independente. O apresentador clica após ouvir a sala. **Recarregar a página começa tudo de novo**, voltando à escolha entre Uber, 99 e iFood. Não recuperamos escolhas nem saldos de partidas anteriores. A conta aparece após as três escolhas e pode ser recalculada ao aplicar novos valores no resultado.

Na Uber e na 99, os ganhos iniciais usam uma referência nacional histórica por hora **em corrida**, sem remunerar a espera. No iFood, multiplicamos as entregas concluídas por uma base ajustável de R$ 7,50, anunciada para rotas de moto ou carro com início em junho/2025. Cada entrega da simulação é uma rota simples com um pedido; pedidos agrupados e programas de ganho por período não são reproduzidos. Distância, gorjetas e adicionais não são somados automaticamente à receita.

O preço do combustível é de BH. Os consumos iniciais são de testes controlados: Onix MT 1.0 para carro, Yamaha Factor 150 para moto. Outros custos começam em zero e a tela avisa que o valor após gasolina ainda não é lucro completo. O repasse real substitui a estimativa, inclusive quando é zero. Nenhuma taxa da plataforma é descontada novamente.

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

Os testes de navegador usam o Chrome instalado no caminho padrão do Windows. `browser-check` aceita uma URL como argumento para verificar uma publicação. Os oito testes de cálculo cobrem 81 combinações, valores recebidos reais, despesas adicionais, espera, resultados negativos e isolamento entre módulos. A verificação de interface inclui a escolha de plataforma, conta final, formulário, reinício ao recarregar, teclado, tela cheia e os três aplicativos offline. Os comandos antigos `interface-check` e `improvements-check` chamam a verificação consolidada.

`scripts/artifact-check.mjs` verifica os arquivos de uma publicação registrada localmente em `app/.netlify/deployment.json`. Esse registro e suas credenciais são privados e não fazem parte do repositório.

## Referência

ABÍLIO, Ludmila Costhek; AMORIM, Henrique; GROHMANN, Rafael. Uberização e plataformização do trabalho no Brasil: conceitos, processos e formas. *Sociologias*, v. 23, n. 57, p. 26 a 56, 2021. [DOI: 10.1590/15174522-116484](https://doi.org/10.1590/15174522-116484).
