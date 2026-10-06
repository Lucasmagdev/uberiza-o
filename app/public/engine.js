export const VERSION = 1;
export const money = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
export const hours = (value) => `${new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 }).format(value)} h`;
export const VOTE_LABELS = ['Sim', 'Em parte', 'Não'];
export const PERSONAL_COST_PER_DAY = 60;
export const DAYS_AWAY = 3;

export const ROUNDS = [
  {
    label: 'A jornada', time: '07:00', title: 'Quanto tempo você vai trabalhar?',
    description: 'A conta de hoje começa com uma escolha. Quanto do seu dia você coloca nas entregas?',
    question: 'Escolher o horário também significa escolher quanto você ganha?',
    concept: 'Autogerenciamento subordinado', pages: '40–42',
    rule: 'Receita fictícia de R$ 22/h, custo variável de R$ 7/h e R$ 18 de custos fixos do dia. A receita é uma hipótese do jogo, não uma garantia.',
    options: [
      { id: 'six', title: '6 horas', description: 'Mais tempo fora do trabalho.', gross: 132, variable: 42, fixed: 18, work: 6, wait: 0, support: 0, tag: 'Saldo: R$ 72' },
      { id: 'eight', title: '8 horas', description: 'Uma jornada intermediária.', gross: 176, variable: 56, fixed: 18, work: 8, wait: 0, support: 0, tag: 'Saldo: R$ 102' },
      { id: 'twelve', title: '12 horas', description: 'Mais receita, mais tempo dedicado.', gross: 264, variable: 84, fixed: 18, work: 12, wait: 0, support: 0, tag: 'Saldo: R$ 162' },
    ],
    outcome: (option) => `Você planejou ${hours(option.work)}. A receita do cenário é ${money(option.gross)}, mas ${money(option.variable + option.fixed)} já têm destino: custos do trabalho.`,
  },
  {
    label: 'A espera', time: 'NO MEIO DO DIA', title: 'O pedido ainda não está pronto.',
    description: 'No restaurante, você descobre um atraso. As duas alternativas abaixo são cenários hipotéticos, com resultados visíveis.',
    question: 'Se o seu tempo está ocupado, por que ele nem sempre entra na conta?',
    concept: 'Trabalhador just-in-time', pages: '39–40',
    rule: 'Este imprevisto acrescenta tempo à jornada planejada. O jogo não presume punição por cancelar ou recusar pedidos.',
    options: [
      { id: 'wait', title: 'Esperar o pedido', description: 'Mais 1h30 disponível para concluir essa entrega.', gross: 14, variable: 0, fixed: 0, work: 0, wait: 1.5, support: 0, tag: '+ R$ 14 · + 1h30' },
      { id: 'move', title: 'Buscar outra entrega', description: 'Neste cenário: 30 min a mais e R$ 3 de deslocamento.', gross: 10, variable: 3, fixed: 0, work: 0, wait: 0.5, support: 0, tag: '+ R$ 7 líquidos · + 30 min' },
    ],
    outcome: (option) => `${hours(option.wait)} foram acrescentadas ao seu tempo disponível. A decisão trouxe ${money(option.gross - option.variable)} após o custo extra. O rendimento por hora considera esse tempo também.`,
  },
  {
    label: 'A meta', time: 'FIM DA JORNADA', title: 'Falta pouco para uma bonificação.',
    description: 'O dia planejado terminou. Uma oferta fictícia promete R$ 20 de bônus se você continuar por mais duas horas.',
    question: 'Você decide parar ou a necessidade de fechar a conta decide por você?',
    concept: 'Incentivos e intensificação do trabalho', pages: '39–40 e 43',
    rule: 'Continuar gera R$ 44 em entregas + R$ 20 de bônus, com R$ 14 de custo variável. Encerrar não retira o que você já recebeu.',
    options: [
      { id: 'continue', title: 'Continuar por 2 horas', description: 'A renda aumenta e a jornada se estende.', gross: 64, variable: 14, fixed: 0, work: 2, wait: 0, support: 0, tag: '+ R$ 50 líquidos · + 2 h' },
      { id: 'stop', title: 'Encerrar e descansar', description: 'Preservar o tempo fora do trabalho.', gross: 0, variable: 0, fixed: 0, work: 0, wait: 0, support: 0, tag: 'Saldo preservado · + 0 h' },
    ],
    outcome: (option) => option.id === 'continue' ? 'Mais R$ 50 após os custos e duas horas a mais na jornada. O bônus alterou sua decisão de horário. O jogo não calcula nem diagnostica efeitos sobre a saúde.' : 'Você manteve o saldo e encerrou a jornada. Descansar também é uma escolha que depende das condições de renda.',
  },
  {
    label: 'O imprevisto', time: 'NO DIA SEGUINTE', title: 'E se você precisasse ficar três dias parado?',
    description: 'Neste cenário, você precisa se afastar. As despesas pessoais são R$ 60 por dia. Compare como a proteção muda a mesma conta.',
    question: 'Quando o trabalho para, quem continua pagando a conta?',
    concept: 'Transferência de riscos e proteção', pages: '40–41 e 47',
    rule: 'Despesas simuladas de R$ 180 durante o afastamento. Consideramos apenas o saldo deste dia e o apoio escolhido, sem outras reservas. O apoio é hipotético, não um benefício anunciado por qualquer plataforma.',
    options: [
      { id: 'no-support', title: 'Cenário sem apoio', description: 'O saldo do dia é o único recurso considerado.', gross: 0, variable: 0, fixed: 0, work: 0, wait: 0, support: 0, tag: 'Apoio: R$ 0' },
      { id: 'support', title: 'Cenário com apoio', description: 'Um apoio hipotético cobre R$ 180 do afastamento.', gross: 0, variable: 0, fixed: 0, work: 0, wait: 0, support: 180, tag: 'Apoio hipotético: R$ 180' },
    ],
    outcome: (option) => option.support ? 'Apoio não aumentou o rendimento do trabalho. Ele mudou a proteção disponível durante o afastamento. Compare esse resultado com o cenário sem apoio.' : 'Agora as despesas pessoais dependem apenas do saldo do dia simulado. Essa hipótese não afirma que todos os trabalhadores ou plataformas estejam sem proteção.',
  },
];

export const DEBATES = [
  { title: 'Autonomia', question: 'Você é seu próprio chefe se não decide quanto recebe?', prompt: 'Que proteção deveria acompanhar a liberdade de escolher horários?', concept: 'Autogerenciamento subordinado · p. 40–42' },
  { title: 'Algoritmos', question: 'Um bloqueio pode tirar seu sustento sem você conseguir se defender?', prompt: 'Que explicação, contestação e revisão deveriam existir?', concept: 'Gerenciamento algorítmico · p. 33–34 e 39' },
  { title: 'Consumo', question: 'Quando exigimos entrega rápida e barata, quem assume a pressão?', prompt: 'Que responsabilidades cabem aos consumidores, às empresas e ao poder público?', concept: 'Dinâmicas do consumo e organização coletiva · p. 33 e 48' },
  { title: 'Saúde e futuro', question: 'Se o trabalhador adoecer tentando fechar as contas, quem assume esse custo?', prompt: 'Como repartir riscos e garantir condições de descanso e proteção?', concept: 'Transferência de riscos · p. 40–41 e 47' },
];

export function calculate(choices = []) {
  const account = { gross: 0, variable: 0, fixed: 0, work: 0, wait: 0, support: 0 };
  choices.forEach((id, i) => {
    const option = ROUNDS[i]?.options.find((item) => item.id === id);
    if (!option) return;
    for (const key of Object.keys(account)) account[key] += option[key];
  });
  account.costs = account.variable + account.fixed;
  account.net = account.gross - account.costs;
  account.totalHours = account.work + account.wait;
  account.hourly = account.totalHours ? account.net / account.totalHours : 0;
  account.awayCost = DAYS_AWAY * PERSONAL_COST_PER_DAY;
  account.gap = Math.max(0, account.awayCost - account.net - account.support);
  account.afterAway = account.net + account.support - account.awayCost;
  return account;
}

export function voteTotal(votes) { return votes.reduce((sum, n) => sum + n, 0); }
export function normalizeVotes(votes) {
  return [0, 1, 2].map((i) => Number.isInteger(votes?.[i]) && votes[i] >= 0 && votes[i] <= 999 ? votes[i] : 0);
}
export function initialState() {
  return { version: VERSION, mode: 'individual', phase: 'intro', round: 0, choices: [], selection: null, before: [0, 0, 0], after: [0, 0, 0], debate: 0 };
}
export function normalizeState(raw) {
  const fresh = initialState();
  if (!raw || raw.version !== VERSION || !['intro', 'before', 'round', 'reveal', 'result', 'after', 'reflection'].includes(raw.phase)) return fresh;
  const choices = [];
  for (let i = 0; i < 4; i++) {
    if (!ROUNDS[i].options.some((o) => o.id === raw.choices?.[i])) break;
    choices.push(raw.choices[i]);
  }
  const round = Number.isInteger(raw.round) && raw.round >= 0 && raw.round < 4 ? raw.round : 0;
  const selection = ROUNDS[round].options.some((o) => o.id === raw.selection) ? raw.selection : null;
  const state = { ...fresh, ...raw, mode: raw.mode === 'class' ? 'class' : 'individual', round, choices, selection, before: normalizeVotes(raw.before), after: normalizeVotes(raw.after), debate: Number.isInteger(raw.debate) && raw.debate >= 0 && raw.debate < 4 ? raw.debate : 0 };
  if (['result', 'after', 'reflection'].includes(state.phase) && choices.length !== 4) return fresh;
  if (state.phase === 'reveal' && choices.length !== round + 1) return fresh;
  if (state.phase === 'round' && choices.length !== round) return fresh;
  return state;
}
