export const VERSION = 2;
export const money = (n) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(n);
export const number = (n) => new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 2 }).format(n);
export const hours = (n) => { const m = Math.round(n * 60); return m % 60 ? `${Math.floor(m / 60)}h${String(m % 60).padStart(2, '0')}` : `${Math.floor(m / 60)}h`; };
export const REFERENCES = {
  fuel: { value: 6.42, period: '27/09 a 03/10/2026', url: 'https://www.gov.br/anp/pt-br/assuntos/precos-e-defesa-da-concorrencia/precos/arquivos-lpc/2026/resumo_semanal_lpc_2026-09-27_2026-10-03.xlsx' },
  earnings: { value: 47, period: 'maio/2023 a abril/2024', url: 'https://institucional.ifood.com.br/wp-content/uploads/2025/06/Lancamento_CEBRAP_AMOBITEC_25-06-2025.pdf' },
  car: { value: 13.5, name: 'Chevrolet Onix MT 1.0', url: 'https://www.gov.br/inmetro/pt-br/assuntos/regulamentacao/avaliacao-da-conformidade/programa-brasileiro-de-etiquetagem/tabelas-de-eficiencia-energetica/veiculos-automotivos-pbe-veicular/mascara-pbev-2026_19_jan-rev01.pdf/@@download/file' },
  article: 'https://doi.org/10.1590/15174522-116484',
};
export const DEFAULTS = { hours: 8, idlePercent: 20, km: 180, fuelPrice: 6.42, efficiency: 13.5, hourlyRate: 47, otherCosts: 0, actualIncome: null };
export const STEPS = [
  { key: 'hours', label: 'Seu horário', title: 'Quantas horas você fica no aplicativo?', description: 'Escolha a duração do seu dia. Esse tempo inclui as corridas e a espera por passageiros.', options: [{ value: 6, title: '6 horas', detail: 'Um dia mais curto' }, { value: 8, title: '8 horas', detail: 'Um dia intermediário' }, { value: 10, title: '10 horas', detail: 'Mais tempo na rua' }], question: 'Você escolhe o horário. Mas escolhe quanto vai receber?' },
  { key: 'idlePercent', label: 'A espera', title: 'Quanto tempo fica sem corrida?', description: 'Nem toda hora no aplicativo vira dinheiro. Escolha um cenário de espera entre corridas.', options: [{ value: 10, title: 'Pouca espera', detail: '10% do dia sem corrida' }, { value: 20, title: 'Alguma espera', detail: '20% do dia sem corrida' }, { value: 30, title: 'Muita espera', detail: '30% do dia sem corrida' }], question: 'Quem paga pelo tempo esperando a próxima corrida?' },
  { key: 'km', label: 'O trajeto', title: 'Quantos quilômetros você rodou?', description: 'Conte tudo: buscar passageiros, fazer as corridas e voltar sem passageiro. Escolha uma distância para testar.', options: [{ value: 120, title: '120 km', detail: 'Menos quilômetros no dia' }, { value: 180, title: '180 km', detail: 'Uma distância intermediária' }, { value: 240, title: '240 km', detail: 'Mais quilômetros no dia' }], question: 'O carro é seu. Quem paga a gasolina e o desgaste?' },
];
export const DEBATES = [
  { title: 'Autonomia', question: 'Escolher o horário é o mesmo que controlar o trabalho?', prompt: 'Que decisões ficaram com você e quais condições vieram da plataforma?', source: 'Autogerenciamento subordinado. Abílio, Amorim e Grohmann (2021), p. 40 a 42.' },
  { title: 'Tempo', question: 'Se você ficou na rua, por que parte do seu tempo não gerou renda?', prompt: 'Compare o tempo em corrida com o tempo total no aplicativo.', source: 'Trabalho sob demanda. Abílio, Amorim e Grohmann (2021), p. 39 a 40.' },
  { title: 'Custos', question: 'O valor do aplicativo é o dinheiro que fica com você?', prompt: 'Gasolina, manutenção, seguro e desgaste precisam entrar na conversa.', source: 'Transferência de custos e riscos. Abílio, Amorim e Grohmann (2021), p. 40 a 41 e 47.' },
  { title: 'Proteção', question: 'Se você adoecer e precisar parar, quem mantém sua renda?', prompt: 'Que proteção deveria acompanhar a flexibilidade de escolher horários?', source: 'Riscos e organização coletiva. Abílio, Amorim e Grohmann (2021), p. 47 a 49.' },
];
const bounds = { hours: [0.5, 24], idlePercent: [0, 100], km: [0, 2000], fuelPrice: [0.01, 30], efficiency: [1, 100], hourlyRate: [0, 1000], otherCosts: [0, 10000], actualIncome: [0, 100000] };
export function normalizeInputs(raw = {}) {
  const inputs = { ...DEFAULTS };
  for (const [key, limits] of Object.entries(bounds)) {
    if (key === 'actualIncome' && (raw?.[key] === null || raw?.[key] === undefined || raw?.[key] === '')) { inputs[key] = null; continue; }
    const value = typeof raw?.[key] === 'number' ? raw[key] : NaN;
    if (Number.isFinite(value)) inputs[key] = Math.min(limits[1], Math.max(limits[0], value));
  }
  return inputs;
}
export function calculate(raw = DEFAULTS) {
  const inputs = normalizeInputs(raw);
  const activeHours = inputs.hours * (1 - inputs.idlePercent / 100);
  const idleHours = inputs.hours - activeHours;
  const income = inputs.actualIncome ?? activeHours * inputs.hourlyRate;
  const litres = inputs.km / inputs.efficiency;
  const fuel = litres * inputs.fuelPrice;
  const costs = fuel + inputs.otherCosts;
  const balance = income - costs;
  return { ...inputs, activeHours, idleHours, income, litres, fuel, costs, balance, perHour: balance / inputs.hours, hasActualIncome: inputs.actualIncome !== null };
}
export function initialState() { return { version: VERSION, phase: 'intro', mode: 'individual', step: 0, completed: 0, inputs: { ...DEFAULTS }, debate: 0 }; }
export function normalizeState(raw) {
  const fresh = initialState();
  if (!raw || raw.version !== VERSION || !['intro', 'play', 'result'].includes(raw.phase)) return fresh;
  const completed = Number.isInteger(raw.completed) ? Math.max(0, Math.min(3, raw.completed)) : 0;
  if (raw.phase === 'result' && completed < 3) return fresh;
  const step = Number.isInteger(raw.step) ? Math.max(0, Math.min(2, completed, raw.step)) : 0;
  return { ...fresh, phase: raw.phase, mode: raw.mode === 'class' ? 'class' : 'individual', step, completed, inputs: normalizeInputs(raw.inputs), debate: Number.isInteger(raw.debate) ? Math.max(0, Math.min(3, raw.debate)) : 0 };
}
