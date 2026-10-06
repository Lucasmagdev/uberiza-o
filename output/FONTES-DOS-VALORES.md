# Referências das simulações Uber, 99 e iFood em Belo Horizonte

Valores verificados em 6 de outubro de 2026. O resultado é uma simulação que combina referências de períodos e abrangências diferentes, com escolhas do usuário. Não é uma amostra de rendimentos de BH em 2026.

| Entrada | Referência utilizada | Origem e limite |
| --- | --- | --- |
| Gasolina comum | R$ 6,42/litro em Belo Horizonte | ANP, semana de 27/09 a 03/10/2026, média de 41 postos. |
| Uber/99: ganhos por hora em viagem | R$ 47 | Cebrap/Amobitec, referência nacional com registros de maio/2023 a abril/2024. Já desconta a taxa do app, inclui gorjetas e promoções, não desconta o veículo nem remunera a espera. |
| Uber/99: consumo urbano com gasolina | 13,5 km/l | Inmetro, Onix MT 1.0, PBE Veicular 2026, tabela de janeiro, página 1. Medição de laboratório; prefira consumo real medido pelo motorista. |
| iFood: base por rota simples de moto | R$ 7,50 | Mínimo por rota de moto ou carro anunciado pelo iFood em abril/2025, com início em 01/06/2025. Base ajustável, não média atual de ganhos. Cada entrega simulada corresponde a uma rota simples com um pedido. |
| iFood: consumo da moto com gasolina | 55,3 km/l | Yamaha Factor 150, linha 2026. Publicação do fabricante em 24/02/2026, citando teste do Instituto Mauá de Tecnologia em circuito urbano simulado e condições controladas. Não é consumo observado em entregas em BH. |
| Jornada, espera, entregas e distância | Escolhas na interface | Cenários de aula, sem alegação de média local. |
| Outros custos | Zero até informar | Despesas de manutenção, seguro, IPVA, desgaste, aluguel e outras precisam ser informadas. O resultado inicial é após gasolina, não lucro completo. |

As fontes são [planilha oficial da ANP](https://www.gov.br/anp/pt-br/assuntos/precos-e-defesa-da-concorrencia/precos/arquivos-lpc/2026/resumo_semanal_lpc_2026-09-27_2026-10-03.xlsx), [apresentação Cebrap/Amobitec, páginas 5 e 16](https://institucional.ifood.com.br/wp-content/uploads/2025/06/Lancamento_CEBRAP_AMOBITEC_25-06-2025.pdf) e [tabela oficial do Inmetro](https://www.gov.br/inmetro/pt-br/assuntos/regulamentacao/avaliacao-da-conformidade/programa-brasileiro-de-etiquetagem/tabelas-de-eficiencia-energetica/veiculos-automotivos-pbe-veicular/mascara-pbev-2026_19_jan-rev01.pdf/@@download/file).

A pesquisa de ganhos foi encomendada pela Amobitec, associação empresarial do setor. A referência histórica não foi atualizada pela inflação e não equivale à tarifa oficial da Uber ou da 99. O mesmo indicador nacional é usado nas simulações de Uber e 99; não comparamos tarifas das duas empresas. O cálculo pode ser feito com o repasse informado pelo motorista, sem usar a média da pesquisa.

As referências novas são o [anúncio do reajuste pelo iFood](https://institucional.ifood.com.br/entregadores/reajuste-dos-entregadores/) e a [publicação oficial da Yamaha sobre a Factor 2026](https://www.yamaha-motor.com.br/noticia/163/yamaha-factor-chega-a-linha-2026). O iFood também descreve o [programa +Entregas](https://institucional.ifood.com.br/entregadores/mais-entregas-entregador-ifood/), com outra forma de composição dos ganhos. A simulação não implementa esse programa nem pedidos agrupados. Não soma automaticamente quilômetros remunerados, promoções, gorjetas ou adicionais à receita. A quilometragem total inclui deslocamentos sem pedido e só entra no combustível; não equivale à distância remunerada de cada rota.

## Fórmulas

Horas em corrida = horas no aplicativo × (1 − percentual sem corrida ÷ 100).

Uber/99: ganhos estimados = horas em corrida × referência de ganhos por hora.

iFood: ganhos estimados = entregas concluídas × valor ajustável por rota simples. O número de horas muda o rendimento por hora, sem criar pedidos adicionais automaticamente. Não inferimos tempo ativo ou de espera a partir da quantidade de entregas.

Quando há um valor real recebido, ele substitui a estimativa de qualquer módulo, inclusive se for zero.

Gasolina = quilômetros totais ÷ consumo em km/l × preço por litro. Inclua também quilômetros sem passageiro ou sem pedido.

Valor após custos informados = repasse − gasolina − outros custos informados. A taxa do app não é descontada novamente. Este valor só corresponde ao lucro completo quando todas as despesas pertinentes foram contabilizadas.

Valor por hora = valor após custos ÷ horas totais no aplicativo, incluindo espera. Os cálculos usam precisão completa antes da exibição em reais e centavos.

Exemplo de cenário, não renda observada: 8 horas, 20% sem corrida e 180 km geram estimativa de R$ 300,80 em repasses e R$ 85,60 de combustível. Restam R$ 215,20 antes dos outros custos do carro, ou R$ 26,90 por hora total.

Exemplo iFood, também simulado: 8 horas, 18 rotas simples e 120 km geram R$ 135,00 pela base de R$ 7,50. O consumo de referência da Factor gera R$ 13,93 de gasolina. Restam R$ 121,07 antes dos outros custos da moto, ou R$ 15,13 por hora total. A conta usa precisão completa antes de arredondar a exibição.

## Recarregamento e resultado

Recarregar volta à escolha Uber/99/iFood e começa uma nova partida. Escolhas e saldos não são recuperados do armazenamento. Cada módulo começa com seus próprios valores. A conta aparece após as três escolhas. No resultado, **Usar meus valores** permite recalcular o saldo com ganhos e despesas informados.

A base conceitual do debate continua sendo [Abílio, Amorim e Grohmann (2021)](https://doi.org/10.1590/15174522-116484). As referências de preços e ganhos não são números retirados desse artigo.
