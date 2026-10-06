import { ROUNDS, DEBATES, VOTE_LABELS, money, hours, calculate, voteTotal, normalizeVotes, initialState, normalizeState } from './engine.js';

const root = document.querySelector('#app');
const STORAGE_KEY = 'seu-proprio-chefe-v1';
const offline = window.location.protocol === 'file:';
let storageAvailable = true;
let state;
let savedState = null;
try { savedState = localStorage.getItem(STORAGE_KEY); } catch { storageAvailable = false; }
try { state = normalizeState(JSON.parse(savedState)); } catch { state = initialState(); }
let toastTimer;

const icon = (name) => {
  const paths = {
    question: '<path d="M9 9a3 3 0 1 1 5 2.2c-1.3.9-2 1.3-2 2.8"/><path d="M12 17h.01"/><circle cx="12" cy="12" r="10"/>',
    expand: '<path d="M8 3H3v5M16 3h5v5M3 16v5h5M21 16v5h-5"/>',
    reset: '<path d="M3 11a9 9 0 1 1 2.6 7M3 4v7h7"/>',
    check: '<path d="m5 12 4 4L19 6"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    share: '<path d="M12 16V3m-4 4 4-4 4 4M5 12v8h14v-8"/>',
    book: '<path d="M12 6c-3-2-6-2-9-1v14c3-1 6-1 9 1 3-2 6-2 9-1V5c-3-1-6-1-9 1Zm0 0v14"/>',
    close: '<path d="m6 6 12 12M6 18 18 6"/>',
  };
  return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.question}</svg>`;
};

function save() {
  if (!storageAvailable) return;
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
  catch {
    storageAvailable = false;
    const note = document.querySelector('#storage-note');
    if (note) { note.hidden = false; note.textContent = 'Partida nesta aba: o navegador não permitiu salvar.'; }
  }
}
function change(patch, focus = true) { Object.assign(state, patch); save(); render(focus); }

function header() {
  const active = state.phase !== 'intro';
  return `<header class="header">
    <button class="brand" data-action="${active ? 'restart' : 'home'}" aria-label="Seu Próprio Chefe? Página inicial"><span class="brand-symbol">?</span><span>seu próprio<br><strong>chefe?</strong></span></button>
    <div class="header-center">UM DIA DE ENTREGAS <span>·</span> QUATRO DECISÕES</div>
    <nav class="tools" aria-label="Ferramentas do jogo">
      ${active ? `<button class="tool" data-action="restart" aria-label="Recomeçar" title="Recomeçar">${icon('reset')}<span>Recomeçar</span></button>` : ''}
      <button class="tool" data-action="fullscreen" aria-label="Tela cheia" title="Tela cheia (F)">${icon('expand')}<span>Tela cheia</span></button>
      <button class="tool" data-action="sources" aria-label="Sobre" title="Sobre a simulação">${icon('book')}<span>Sobre</span></button>
    </nav>
  </header>`;
}

function footer() {
  return `<footer class="footer"><span><span class="simulation-dot"></span>Valores fictícios para discussão em aula.</span><span>Inspirado em Abílio, Amorim e Grohmann (2021).</span><span id="storage-note" role="status" ${storageAvailable ? 'hidden' : ''}>${storageAvailable ? '' : 'Partida nesta aba: o navegador não permitiu salvar.'}</span></footer>`;
}

function receipt(choices = state.choices, preview = false) {
  const a = calculate(choices);
  const started = choices.length > 0;
  return `<aside class="receipt" aria-label="Conta do dia${preview ? ', prévia da escolha' : ''}">
    <div class="receipt-top"><span>CONTA DO DIA</span><span>${preview ? 'PRÉVIA' : 'SIMULAÇÃO'}</span></div>
    <h2>${started ? 'O que sobra.' : 'A conta é sua.'}</h2>
    <div class="receipt-total">${money(a.net)}</div>
    <p class="receipt-sub">${started ? 'após os custos do trabalho' : 'o dia ainda não começou'}</p>
    <div class="receipt-divider"></div>
    <dl class="ledger">
      <div><dt>Recebido em entregas e bônus</dt><dd>${money(a.gross)}</dd></div>
      <div><dt>Combustível e custos variáveis</dt><dd>− ${money(a.variable)}</dd></div>
      <div><dt>Custos fixos do dia</dt><dd>− ${money(a.fixed)}</dd></div>
      <div class="ledger-net"><dt>Saldo do trabalho</dt><dd>${money(a.net)}</dd></div>
    </dl>
    <div class="receipt-divider"></div>
    <div class="time-pair"><div><span>Tempo dedicado</span><strong>${hours(a.totalHours)}</strong></div><div><span>Rendimento / hora</span><strong>${money(a.hourly)}</strong></div></div>
    ${a.wait ? `<p class="receipt-note">Inclui ${hours(a.wait)} de disponibilidade extra no imprevisto.</p>` : `<p class="receipt-note">Receita e saldo são coisas diferentes.</p>`}
    <div class="receipt-bottom"><span>TRABALHO SOB DEMANDA</span><span>SPC / 2021</span></div>
  </aside>`;
}

function intro() {
  return `<main id="main" class="layout intro" tabindex="-1">
    <section class="intro-copy">
      <div class="eyebrow"><span class="small-rule"></span>UMA SIMULAÇÃO PARA JOGAR E DEBATER</div>
      <h1>Seu próprio<br><em>chefe?</em></h1>
      <p class="intro-lead">Você escolhe os horários.<br>Mas escolhe as condições?</p>
      <p class="intro-description">Viva quatro decisões de um dia de entregas.<br>Depois, descubra quanto tempo custou o que sobrou.</p>
      <div class="start-actions"><button class="button primary" data-action="start" data-mode="individual">Começar meu dia</button><button class="button secondary" data-action="start" data-mode="class">Conduzir com a turma</button></div>
      <div class="intro-meta"><span>${icon('clock')}5–8 min de jogo</span><span>Uma conta. Muitas perguntas.</span></div>
      <p class="offline-link">${offline ? 'Versão offline · pronta para jogar sem internet.' : '<a href="./jogo-offline.html" download="JOGAR-SEM-INTERNET.html">Baixar versão para jogar sem internet</a>'}</p>
    </section>
    <div class="intro-side">${receipt()}<p class="side-caption">A moto é sua. As regras também?</p></div>
  </main>`;
}

function progress() {
  return `<ol class="steps" aria-label="Rodadas">${ROUNDS.map((r, i) => `<li class="${i === state.round ? 'current' : i < state.round ? 'done' : ''}" ${i === state.round ? 'aria-current="step"' : ''}><span>${i < state.round ? icon('check') : `0${i + 1}`}</span><span>${r.label}</span></li>`).join('')}</ol>`;
}

function survey(isAfter = false) {
  const votes = isAfter ? state.after : state.before;
  const total = voteTotal(votes);
  const isClass = state.mode === 'class';
  return `<main id="main" class="survey-screen" tabindex="-1">
    <div class="eyebrow">${isAfter ? 'DEPOIS DE FECHAR A CONTA' : 'ANTES DE LIGAR O APLICATIVO'}</div>
    <h1>${isAfter ? 'Mudou alguma coisa?' : 'Primeiro, uma pergunta.'}</h1>
    <p class="survey-question">Trabalhar por aplicativo significa<br>ser seu próprio chefe?</p>
    <p class="survey-instruction">${isClass ? 'Peça para a turma levantar a mão e registre quantas pessoas escolheram cada resposta.' : 'Escolha a resposta que faz mais sentido para você agora.'}</p>
    <div class="vote-options">${VOTE_LABELS.map((label, i) => isClass ? `<label class="vote-input"><span><b>0${i + 1}</b>${label}</span><input type="number" inputmode="numeric" min="0" max="999" step="1" value="${votes[i]}" data-vote="${i}" aria-label="Votos em ${label}"></label>` : `<button class="vote-choice ${votes[i] ? 'selected' : ''}" data-action="vote" data-vote="${i}" aria-pressed="${Boolean(votes[i])}"><b>0${i + 1}</b><span>${label}</span>${votes[i] ? icon('check') : ''}</button>`).join('')}</div>
    ${isClass ? `<p class="vote-count" aria-live="polite">${total} resposta${total === 1 ? '' : 's'} registrada${total === 1 ? '' : 's'} neste navegador</p>` : ''}
    <div class="survey-actions"><button class="button primary" data-action="survey-next" ${total ? '' : 'disabled'}>${isAfter ? 'Comparar respostas' : 'Vamos trabalhar'}</button><button class="text-button" data-action="${isAfter ? 'result' : 'home'}">${isAfter ? 'Voltar ao resultado' : 'Voltar'}</button></div>
    ${isClass ? '<p class="small-note">As escolhas da partida são feitas por você, após ouvir a turma. Cada navegador tem sua própria partida.</p>' : ''}
  </main>`;
}

function roundScreen() {
  const round = ROUNDS[state.round];
  const reveal = state.phase === 'reveal';
  const option = round.options.find((o) => o.id === (reveal ? state.choices[state.round] : state.selection));
  const choices = !reveal && option ? [...state.choices, option.id] : state.choices;
  return `<main id="main" class="game-screen" tabindex="-1">
    ${progress()}
    <div class="layout round-layout"><section class="round-copy">
      <div class="eyebrow"><span class="round-stamp">RODADA 0${state.round + 1}</span><span>${round.time}</span></div>
      <h1>${round.title}</h1>
      <p class="round-description">${round.description}</p>
      ${reveal ? `<div class="outcome"><div class="outcome-label">${icon('check')} ESCOLHA REGISTRADA: ${option.title}</div><p>${round.outcome(option)}</p></div><div class="provocation"><span>PARA PENSAR</span><h2>${round.question}</h2><p>${round.concept} <span>· p. ${round.pages}</span></p></div>` : `<div class="choice-list">${round.options.map((o, i) => `<button class="choice ${state.selection === o.id ? 'selected' : ''}" data-action="choose" data-choice="${o.id}" aria-pressed="${state.selection === o.id}"><span class="choice-number">${i + 1}</span><span class="choice-text"><strong>${o.title}</strong><span>${o.description}</span></span><span class="choice-tag">${o.tag}</span>${state.selection === o.id ? icon('check') : ''}</button>`).join('')}</div>`}
      <details class="rules"><summary>Regras deste cenário</summary><p>${round.rule}</p></details>
      <div class="round-actions"><button class="button primary" data-action="${reveal ? 'next-round' : 'confirm'}" ${!reveal && !option ? 'disabled' : ''}>${reveal ? state.round === 3 ? 'Ver minha conta' : 'Próxima decisão' : 'Confirmar escolha'}</button><button class="text-button" data-action="${reveal ? 'edit-choice' : 'back'}">${reveal ? 'Mudar esta escolha' : 'Voltar'}</button></div>
      <p class="keyboard-hint">${state.mode === 'class' ? 'Ouça a turma e selecione a decisão coletiva. ' : ''}${reveal ? 'Enter avança' : 'Teclas 1–3 escolhem · Enter confirma'}</p>
    </section>${receipt(choices, !reveal && Boolean(option))}</div>
  </main>`;
}

function resultScreen() {
  const a = calculate(state.choices);
  const hasSupport = state.choices[3] === 'support';
  return `<main id="main" class="result-screen" tabindex="-1">
    <div class="result-head"><div><div class="eyebrow">O DIA TERMINOU</div><h1>Fechou o dia.<br><em>E a conta?</em></h1></div><div class="result-net"><span>SALDO DO TRABALHO</span><strong>${money(a.net)}</strong><p>${hours(a.totalHours)} dedicadas · ${money(a.hourly)} por hora</p></div></div>
    <div class="result-grid"><section class="result-decisions"><h2>O caminho que você escolheu</h2><ol>${state.choices.slice(0, 3).map((id, i) => `<li><span>0${i + 1}</span><div><strong>${ROUNDS[i].options.find((o) => o.id === id).title}</strong><p>${ROUNDS[i].label}</p></div></li>`).join('')}</ol><p class="cost-summary">Dos ${money(a.gross)} recebidos, ${money(a.costs)} cobriram os custos do trabalho.</p><button class="text-button" data-action="replay">Refazer as decisões</button></section>
    <section class="away-panel"><div class="eyebrow">TRÊS DIAS DE AFASTAMENTO</div><h2>${a.gap ? `Faltariam ${money(a.gap)}.` : 'As despesas estariam cobertas.'}</h2><p>Despesas pessoais simuladas: <strong>${money(a.awayCost)}</strong>. Consideramos apenas o saldo deste dia + apoio escolhido.</p><div class="support-switch" role="group" aria-label="Comparar apoio durante afastamento"><button data-action="support" data-support="no-support" class="${!hasSupport ? 'active' : ''}" aria-pressed="${!hasSupport}">Sem apoio</button><button data-action="support" data-support="support" class="${hasSupport ? 'active' : ''}" aria-pressed="${hasSupport}">Com apoio hipotético</button></div><dl class="away-ledger"><div><dt>Saldo do trabalho</dt><dd>${money(a.net)}</dd></div><div><dt>Apoio hipotético</dt><dd>${money(a.support)}</dd></div><div><dt>Despesas do afastamento</dt><dd>− ${money(a.awayCost)}</dd></div><div class="away-balance"><dt>Após essas despesas</dt><dd>${money(a.afterAway)}</dd></div></dl><p class="small-note">Compare os cenários. Apoio não aumenta o rendimento do trabalho; altera a proteção no afastamento.</p></section></div>
    <section class="debate-section"><div class="debate-heading"><div class="eyebrow">AGORA, A PROVOCAÇÃO</div><div class="debate-tabs" role="group" aria-label="Escolher tema do debate">${DEBATES.map((d, i) => `<button class="${state.debate === i ? 'active' : ''}" data-action="debate" data-debate="${i}" aria-pressed="${state.debate === i}">${d.title}</button>`).join('')}</div></div><h2>${DEBATES[state.debate].question}</h2><p>${DEBATES[state.debate].prompt}</p><span class="concept-caption">${DEBATES[state.debate].concept}</span></section>
    <div class="result-actions"><button class="button primary" data-action="after">Responder de novo</button><button class="button secondary" data-action="share">${icon('share')}Compartilhar o jogo</button><p class="small-note">Uma partida ilustra escolhas. Não representa a renda de toda uma categoria.</p></div>
  </main>`;
}

function voteBars(votes, label) {
  const total = voteTotal(votes);
  return `<section class="vote-chart"><h2>${label}</h2>${VOTE_LABELS.map((name, i) => { const pct = total ? Math.round(votes[i] / total * 100) : 0; return `<div class="bar-row"><div><span>${name}</span><strong>${pct}% <small>(${votes[i]})</small></strong></div><div class="bar-track"><div style="width:${pct}%"></div></div></div>`; }).join('')}<p class="small-note">${total} resposta${total === 1 ? '' : 's'}</p></section>`;
}

function reflectionScreen() {
  return `<main id="main" class="reflection-screen" tabindex="-1"><div class="eyebrow">ANTES E DEPOIS</div><h1>A mesma pergunta.<br><em>Outra leitura?</em></h1><p class="survey-question">Trabalhar por aplicativo significa ser seu próprio chefe?</p><div class="comparison">${voteBars(state.before, 'Antes da partida')}${voteBars(state.after, 'Depois da partida')}</div>${voteTotal(state.before) !== voteTotal(state.after) ? '<p class="small-note">A quantidade de respostas mudou. Os percentuais descrevem cada votação, sem identificar quem mudou de opinião.</p>' : ''}<div class="closing-question"><span>PARA FECHAR O DEBATE</span><h2>Quem decide, quem recebe<br>e quem assume os riscos?</h2><p>Proponha uma mudança concreta. Quem deveria colocá-la em prática?</p></div><div class="result-actions"><button class="button primary" data-action="result">Voltar à conta</button><button class="button secondary" data-action="restart">Jogar novamente</button></div><p class="small-note">As respostas ficam apenas neste navegador. A votação é um recurso de aula, não uma pesquisa representativa.</p></main>`;
}

function dialogs() {
  return `<dialog id="sources-dialog" class="dialog"><div class="dialog-header"><h2>Sobre esta simulação</h2><button class="icon-button" data-action="close-dialog" aria-label="Fechar">${icon('close')}</button></div><div class="dialog-body"><p>Um jogo educativo para discutir uberização e plataformização do trabalho a partir de escolhas, tempo, renda e proteção.</p><h3>Os valores são fictícios</h3><p>R$ 22 por hora de receita, R$ 7 por hora de custo variável, R$ 18 de custos fixos, bônus e resultados de entregas foram escolhidos para tornar as contas visíveis. Não são dados do artigo ou da entrevista, nem previsões de uma plataforma real.</p><p>As consequências são predeterminadas e informadas. O jogo não simula punição por recusar entregas, não diagnostica saúde mental e não afirma que todos os trabalhadores estejam sem proteção.</p><h3>Para jogar com a turma</h3><p>Projete a tela, ouça as escolhas da sala e avance. Nas votações inicial e final, registre manualmente as mãos levantadas. As partidas de celulares diferentes são independentes.</p><h3>Referência conceitual</h3><p>ABÍLIO, Ludmila Costhek; AMORIM, Henrique; GROHMANN, Rafael. <em>Uberização e plataformização do trabalho no Brasil: conceitos, processos e formas.</em> Sociologias, v. 23, n. 57, p. 26–56, 2021.</p><a class="source-link" href="https://doi.org/10.1590/15174522-116484" target="_blank" rel="noopener noreferrer">Ler o artigo · DOI 10.1590/15174522-116484</a><p>Autogerenciamento subordinado: p. 40–42. Gerenciamento algorítmico: p. 33–34 e 39. Trabalho sob demanda: p. 39–40. Transferência de riscos: p. 40–41 e 47. Organização coletiva: p. 48–49.</p><p>As provocações sobre consumo, revisão de bloqueios e proteção são pontos de discussão. O texto analisa relações de trabalho em 2021; esta simulação não apresenta a legislação vigente.</p><h3>Como a conta funciona</h3><p>Saldo do trabalho = receita − custos variáveis − custos fixos. Rendimento por hora = saldo ÷ todo o tempo dedicado no jogo. O cenário de afastamento compara esse saldo + apoio hipotético com R$ 180 de despesas pessoais. Não considera reservas anteriores nem outras fontes de renda.</p></div><button class="button primary" data-action="close-dialog">Entendi</button></dialog>
  <dialog id="restart-dialog" class="dialog small-dialog"><div class="dialog-header"><h2>Começar outra partida?</h2></div><p>As escolhas e votações desta partida serão apagadas neste navegador.</p><div class="dialog-actions"><button class="button secondary" data-action="close-dialog">Continuar esta partida</button><button class="button primary" data-action="reset-confirmed">Recomeçar</button></div></dialog>
  <dialog id="share-dialog" class="dialog small-dialog"><div class="dialog-header"><h2>${offline ? 'Compartilhar a versão offline' : 'Compartilhar o jogo'}</h2><button class="icon-button" data-action="close-dialog" aria-label="Fechar">${icon('close')}</button></div>${offline ? '<p>Envie este arquivo HTML para os colegas. Eles podem abrir uma cópia no navegador e jogar sem internet.</p>' : '<p>Selecione e copie o endereço abaixo. Cada pessoa joga sua própria partida.</p><input class="share-address" type="text" readonly aria-label="Endereço do jogo"><p class="small-note">No computador, use Ctrl+C. No celular, toque e segure para copiar.</p>'}<div class="dialog-actions"><button class="button primary" data-action="close-dialog">Fechar</button></div></dialog>`;
}

function render(focus = true) {
  const screens = { intro, before: () => survey(false), round: roundScreen, reveal: roundScreen, result: resultScreen, after: () => survey(true), reflection: reflectionScreen };
  document.body.dataset.mode = state.mode;
  document.body.dataset.phase = state.phase;
  root.innerHTML = header() + screens[state.phase]() + footer() + dialogs() + '<div id="toast" class="toast" role="status"></div>';
  if (focus) { document.querySelector('#main')?.focus({ preventScroll: true }); window.scrollTo({ top: 0, behavior: 'instant' }); }
}

function toast(message) {
  const target = document.querySelector('#toast');
  clearTimeout(toastTimer);
  target.textContent = message;
  target.classList.add('visible');
  toastTimer = setTimeout(() => target.classList.remove('visible'), 3500);
}

function closeDialogs() { document.querySelectorAll('dialog[open]').forEach((d) => d.close()); }

async function action(button) {
  const name = button.dataset.action;
  if (name === 'start') return change({ ...initialState(), mode: button.dataset.mode === 'class' ? 'class' : 'individual', phase: 'before' });
  if (name === 'home') return change(initialState());
  if (name === 'vote') {
    const index = Number(button.dataset.vote);
    const key = state.phase === 'after' ? 'after' : 'before';
    const votes = [0, 0, 0]; votes[index] = 1;
    change({ [key]: votes }, false);
    document.querySelector(`[data-action="vote"][data-vote="${index}"]`)?.focus({ preventScroll: true });
  }
  if (name === 'survey-next') {
    const votes = state.phase === 'after' ? state.after : state.before;
    if (!voteTotal(votes)) return;
    return change({ phase: state.phase === 'after' ? 'reflection' : 'round', selection: null });
  }
  if (name === 'choose') {
    const id = button.dataset.choice;
    if (!ROUNDS[state.round].options.some((o) => o.id === id)) return;
    change({ selection: id }, false);
    document.querySelector(`[data-choice="${id}"]`)?.focus({ preventScroll: true });
  }
  if (name === 'confirm' && state.selection) return change({ choices: [...state.choices.slice(0, state.round), state.selection], phase: 'reveal' });
  if (name === 'next-round') return change(state.round === 3 ? { phase: 'result', selection: null } : { round: state.round + 1, phase: 'round', selection: null });
  if (name === 'edit-choice') return change({ phase: 'round', selection: state.choices[state.round], choices: state.choices.slice(0, state.round) });
  if (name === 'back') return change(state.round === 0 ? { phase: 'before' } : { round: state.round - 1, phase: 'round', selection: state.choices[state.round - 1], choices: state.choices.slice(0, state.round - 1) });
  if (name === 'replay') return change({ round: 0, phase: 'round', choices: [], selection: null, after: [0, 0, 0] });
  if (name === 'result') return change({ phase: 'result' });
  if (name === 'after') return change({ phase: 'after' });
  if (name === 'debate') {
    const index = Number(button.dataset.debate);
    change({ debate: index }, false);
    document.querySelector(`[data-debate="${index}"]`)?.focus({ preventScroll: true });
  }
  if (name === 'support') {
    const support = button.dataset.support;
    if (!['support', 'no-support'].includes(support)) return;
    change({ choices: [...state.choices.slice(0, 3), support] }, false);
    document.querySelector(`[data-support="${support}"]`)?.focus({ preventScroll: true });
  }
  if (name === 'sources') return document.querySelector('#sources-dialog').showModal();
  if (name === 'restart') return document.querySelector('#restart-dialog').showModal();
  if (name === 'close-dialog') return closeDialogs();
  if (name === 'reset-confirmed') return change(initialState());
  if (name === 'fullscreen') {
    try { if (document.fullscreenElement) await document.exitFullscreen(); else await document.documentElement.requestFullscreen(); }
    catch { toast('Use F11 no navegador para projetar em tela cheia.'); }
  }
  if (name === 'share') {
    const dialog = document.querySelector('#share-dialog');
    if (offline) return dialog.showModal();
    const address = new URL('./', window.location.href).href;
    try { await navigator.clipboard.writeText(address); toast('Link copiado. Cada pessoa joga sua própria partida.'); }
    catch {
      const field = dialog.querySelector('input');
      field.value = address;
      dialog.showModal();
      field.focus();
      field.select();
    }
  }
}

root.addEventListener('click', (event) => {
  const button = event.target.closest('button[data-action]');
  if (button && !button.disabled) action(button).catch(() => toast('Não foi possível concluir essa ação. Tente novamente.'));
  if (event.target.tagName === 'DIALOG') {
    const rect = event.target.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) event.target.close();
  }
});

root.addEventListener('input', (event) => {
  if (!event.target.matches('input[data-vote]')) return;
  const index = Number(event.target.dataset.vote);
  const key = state.phase === 'after' ? 'after' : 'before';
  const value = Number(event.target.value);
  state[key][index] = Number.isFinite(value) ? Math.min(999, Math.max(0, Math.trunc(value))) : 0;
  save();
  const total = voteTotal(state[key]);
  document.querySelector('.vote-count').textContent = `${total} resposta${total === 1 ? '' : 's'} registrada${total === 1 ? '' : 's'} neste navegador`;
  document.querySelector('[data-action="survey-next"]').disabled = !total;
});
root.addEventListener('change', (event) => {
  if (event.target.matches('input[data-vote]')) {
    const key = state.phase === 'after' ? 'after' : 'before';
    event.target.value = normalizeVotes(state[key])[Number(event.target.dataset.vote)];
  }
});

document.addEventListener('keydown', (event) => {
  if (event.ctrlKey || event.altKey || event.metaKey || document.querySelector('dialog[open]') || event.target.matches('input, textarea, select, [contenteditable]')) return;
  if (event.repeat && (event.key === 'Enter' || /^[1-3]$/.test(event.key) || event.key.toLowerCase() === 'f')) { event.preventDefault(); return; }
  if (event.key.toLowerCase() === 'f') { event.preventDefault(); document.querySelector('[data-action="fullscreen"]')?.click(); }
  if (state.phase === 'round' && /^[1-3]$/.test(event.key)) {
    const option = ROUNDS[state.round].options[Number(event.key) - 1];
    if (option) { event.preventDefault(); document.querySelector(`[data-choice="${option.id}"]`)?.click(); }
  }
  if (event.key === 'Enter' && (state.phase === 'round' && event.target.closest('[data-action="choose"]') || !event.target.closest('button, a, summary'))) {
    const button = document.querySelector('main .button.primary:not(:disabled)');
    if (button) { event.preventDefault(); button.click(); }
  }
});

render(false);
