# Referências da simulação de motorista em Belo Horizonte

Valores verificados em 6 de outubro de 2026. O resultado é uma simulação que combina referências de períodos e abrangências diferentes, com escolhas do usuário. Não é uma amostra de rendimentos de BH em 2026.

| Entrada | Referência utilizada | Origem e limite |
| --- | --- | --- |
| Gasolina comum | R$ 6,42/litro em Belo Horizonte | ANP, semana de 27/09 a 03/10/2026, média de 41 postos. |
| Ganhos por hora em viagem | R$ 47 | Cebrap/Amobitec, referência nacional com registros de maio/2023 a abril/2024. Já desconta a taxa do app, inclui gorjetas e promoções, não desconta o veículo nem remunera a espera. |
| Consumo urbano com gasolina | 13,5 km/l | Inmetro, Onix MT 1.0, PBE Veicular 2026, tabela de janeiro, página 1. Medição de laboratório; prefira consumo real medido pelo motorista. |
| Jornada, espera e distância | Escolhas na interface | Cenários de aula, sem alegação de média local. |
| Outros custos | Zero até informar | Despesas de manutenção, seguro, IPVA, desgaste, aluguel e outras precisam ser informadas. O resultado inicial é após gasolina, não lucro completo. |

As fontes são [planilha oficial da ANP](https://www.gov.br/anp/pt-br/assuntos/precos-e-defesa-da-concorrencia/precos/arquivos-lpc/2026/resumo_semanal_lpc_2026-09-27_2026-10-03.xlsx), [apresentação Cebrap/Amobitec, páginas 5 e 16](https://institucional.ifood.com.br/wp-content/uploads/2025/06/Lancamento_CEBRAP_AMOBITEC_25-06-2025.pdf) e [tabela oficial do Inmetro](https://www.gov.br/inmetro/pt-br/assuntos/regulamentacao/avaliacao-da-conformidade/programa-brasileiro-de-etiquetagem/tabelas-de-eficiencia-energetica/veiculos-automotivos-pbe-veicular/mascara-pbev-2026_19_jan-rev01.pdf/@@download/file).

A pesquisa de ganhos foi encomendada pela Amobitec, associação empresarial do setor. A referência histórica não foi atualizada pela inflação e não equivale à tarifa oficial da Uber. O cálculo pode ser feito com o repasse informado pelo motorista, sem usar a média da pesquisa.

## Fórmulas

Horas em corrida = horas no aplicativo × (1 − percentual sem corrida ÷ 100).

Ganhos estimados = horas em corrida × referência de ganhos por hora. Quando há um valor real recebido, ele substitui essa estimativa, inclusive se for zero.

Gasolina = quilômetros totais ÷ consumo em km/l × preço por litro. Inclua também quilômetros sem passageiro.

Valor após custos informados = repasse − gasolina − outros custos informados. A taxa do app não é descontada novamente. Este valor só corresponde ao lucro completo quando todas as despesas pertinentes foram contabilizadas.

Valor por hora = valor após custos ÷ horas totais no aplicativo, incluindo espera. Os cálculos usam precisão completa antes da exibição em reais e centavos.

Exemplo de cenário, não renda observada: 8 horas, 20% sem corrida e 180 km geram estimativa de R$ 300,80 em repasses e R$ 85,60 de combustível. Restam R$ 215,20 antes dos outros custos do carro, ou R$ 26,90 por hora total.

A base conceitual do debate continua sendo [Abílio, Amorim e Grohmann (2021)](https://doi.org/10.1590/15174522-116484). As referências de preços e ganhos não são números retirados desse artigo.
