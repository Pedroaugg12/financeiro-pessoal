import { useMemo } from 'react'
import { useFinance } from '../estado/FinanceContext'
import { chaveMes, diasAte, rotuloMes, ultimosMeses } from '../lib/datas'
import { dataCurta, moeda, porcento } from '../lib/formato'
import { Painel, PainelCabecalho, Indicador } from '../components/ui/Painel'
import { Carregando, Erro, Vazio } from '../components/ui/Estados'
import { BarrasMensais } from '../components/graficos/Barras'
import { Rosca } from '../components/graficos/Rosca'
import { Botao } from '../components/ui/Botao'
import { Etiqueta } from '../components/ui/Etiqueta'
import { Icone } from '../components/Icone'

export function Inicio({ mes, aoAbrirNovo, aoEditar, aoVerLancamentos }) {
  const {
    transacoes,
    categorias,
    categoriaPorId,
    carregando,
    erro,
    recarregar,
    saldoRealizado,
  } = useFinance()

  const doMes = useMemo(
    () => transacoes.filter((t) => chaveMes(t.data) === mes),
    [transacoes, mes]
  )

  const resumo = useMemo(() => {
    let receitas = 0
    let despesas = 0
    let receitasPendentes = 0
    let despesasPendentes = 0

    for (const t of doMes) {
      if (t.tipo === 'receita') {
        receitas += t.valor
        if (!t.confirmado) receitasPendentes += t.valor
      } else {
        despesas += t.valor
        if (!t.confirmado) despesasPendentes += t.valor
      }
    }

    return {
      receitas,
      despesas,
      resultado: receitas - despesas,
      receitasPendentes,
      despesasPendentes,
    }
  }, [doMes])

  /**
   * Seis meses terminando no mês selecionado.
   * O gráfico antigo era sempre relativo a hoje: navegar até março e continuar
   * vendo os últimos seis meses a partir de agosto não fazia sentido nenhum.
   */
  const evolucao = useMemo(() => {
    const meses = ultimosMeses(mes, 6)
    const acumulado = new Map(meses.map((m) => [m, { receitas: 0, despesas: 0 }]))

    for (const t of transacoes) {
      const balde = acumulado.get(chaveMes(t.data))
      if (!balde) continue
      if (t.tipo === 'receita') balde.receitas += t.valor
      else balde.despesas += t.valor
    }

    return meses.map((m) => {
      const b = acumulado.get(m)
      return {
        chave: m,
        rotulo: rotuloMes(m, { curto: true }).split(' ')[0],
        receitas: b.receitas,
        despesas: b.despesas,
        saldo: b.receitas - b.despesas,
        atual: m === mes,
      }
    })
  }, [transacoes, mes])

  const despesasPorCategoria = useMemo(() => {
    const mapa = new Map()

    for (const t of doMes) {
      if (t.tipo !== 'despesa') continue
      const chave = t.categoriaId ?? 'sem'
      const categoria = categoriaPorId.get(t.categoriaId)
      const atual = mapa.get(chave) ?? {
        id: chave,
        nome: categoria?.nome ?? 'Sem categoria',
        cor: categoria?.cor ?? '#8b939f',
        total: 0,
      }
      atual.total += t.valor
      mapa.set(chave, atual)
    }

    return [...mapa.values()].sort((a, b) => b.total - a.total)
  }, [doMes, categoriaPorId])

  /** Contas a vencer nos próximos 14 dias + tudo que já está atrasado. */
  const aVencer = useMemo(() => {
    return transacoes
      .filter((t) => !t.confirmado && t.tipo === 'despesa' && diasAte(t.data) <= 14)
      .sort((a, b) => a.data.localeCompare(b.data))
      .slice(0, 8)
  }, [transacoes])

  const metas = useMemo(() => {
    return categorias
      .filter((c) => c.metaMensal && c.metaMensal > 0)
      .map((c) => {
        const gasto = doMes
          .filter((t) => t.tipo === 'despesa' && t.categoriaId === c.id)
          .reduce((a, t) => a + t.valor, 0)
        return { ...c, gasto, proporcao: gasto / c.metaMensal }
      })
      .sort((a, b) => b.proporcao - a.proporcao)
  }, [categorias, doMes])

  if (erro) {
    return (
      <Painel semPadding>
        <Erro mensagem={erro} onTentarNovamente={() => recarregar()} />
      </Painel>
    )
  }

  if (carregando) {
    return (
      <Painel semPadding>
        <Carregando texto="Carregando seus lançamentos..." />
      </Painel>
    )
  }

  const atrasados = aVencer.filter((t) => diasAte(t.data) < 0)

  return (
    <div className="flex flex-col gap-3">
      {/* indicadores */}
      <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
        <Indicador
          rotulo="Saldo atual"
          valor={moeda(saldoRealizado)}
          detalhe="Somente lançamentos confirmados"
          cor={saldoRealizado < 0 ? 'negativo' : 'neutro'}
        />
        <Indicador
          rotulo="Receitas do mês"
          valor={moeda(resumo.receitas)}
          detalhe={
            resumo.receitasPendentes > 0
              ? `${moeda(resumo.receitasPendentes)} a receber`
              : 'Tudo recebido'
          }
          cor="positivo"
          onClick={() => aoVerLancamentos({ tipo: 'receita' })}
        />
        <Indicador
          rotulo="Despesas do mês"
          valor={moeda(resumo.despesas)}
          detalhe={
            resumo.despesasPendentes > 0
              ? `${moeda(resumo.despesasPendentes)} a pagar`
              : 'Tudo pago'
          }
          cor="negativo"
          onClick={() => aoVerLancamentos({ tipo: 'despesa' })}
        />
        <Indicador
          rotulo="Resultado do mês"
          valor={moeda(resumo.resultado)}
          detalhe={
            resumo.receitas > 0
              ? `${porcento(resumo.resultado > 0 ? resumo.resultado : 0, resumo.receitas)} da receita sobrou`
              : 'Sem receita registrada'
          }
          cor={resumo.resultado >= 0 ? 'positivo' : 'negativo'}
        />
      </div>

      {/* alerta de atraso — só aparece quando existe atraso de verdade */}
      {atrasados.length > 0 && (
        <div className="flex items-center gap-2 rounded-base border border-neg/30 bg-neg-soft px-3 py-2">
          <span className="text-neg">
            <Icone.Alerta size={14} />
          </span>
          <p className="flex-1 text-[12.5px] text-fg">
            <strong className="font-semibold">
              {atrasados.length} {atrasados.length === 1 ? 'conta atrasada' : 'contas atrasadas'}
            </strong>{' '}
            somando {moeda(atrasados.reduce((a, t) => a + t.valor, 0))}.
          </p>
          <Botao
            variante="secundario"
            tamanho="sm"
            onClick={() => aoVerLancamentos({ situacao: 'atrasados' })}
          >
            Ver
          </Botao>
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-3">
        {/* evolução */}
        <Painel semPadding className="xl:col-span-2">
          <PainelCabecalho
            titulo="Evolução"
            descricao={`Seis meses até ${rotuloMes(mes).toLowerCase()}`}
          />
          <div className="p-[var(--pane-p)]">
            <BarrasMensais dados={evolucao} />
          </div>
        </Painel>

        {/* a vencer */}
        <Painel semPadding>
          <PainelCabecalho
            titulo="A pagar"
            descricao="Próximos 14 dias e atrasados"
            acoes={
              aVencer.length > 0 && (
                <Botao
                  variante="fantasma"
                  tamanho="sm"
                  onClick={() => aoVerLancamentos({ situacao: 'pendentes', tipo: 'despesa' })}
                >
                  Ver todos
                </Botao>
              )
            }
          />
          {aVencer.length === 0 ? (
            <Vazio
              compacto
              icone={<Icone.Check size={15} />}
              titulo="Nada a pagar por enquanto"
              mensagem="Nenhuma despesa pendente nos próximos 14 dias."
            />
          ) : (
            <ul className="divide-y divide-line">
              {aVencer.map((t) => {
                const dias = diasAte(t.data)
                return (
                  <li key={t.id}>
                    <button
                      type="button"
                      onClick={() => aoEditar(t)}
                      className="flex w-full items-center gap-2 px-[var(--pane-p)] py-1.5 text-left transition-colors hover:bg-surface-2"
                    >
                      <span className="tnum w-11 shrink-0 whitespace-nowrap text-[11.5px] text-fg-muted">
                        {dataCurta(t.data)}
                      </span>
                      <span className="min-w-0 flex-1 truncate text-[12px] text-fg">
                        {t.descricao}
                      </span>
                      {dias < 0 ? (
                        <Etiqueta tom="negativo">{Math.abs(dias)}d atrás</Etiqueta>
                      ) : dias <= 3 ? (
                        <Etiqueta tom="alerta">{dias === 0 ? 'hoje' : `${dias}d`}</Etiqueta>
                      ) : (
                        <span className="tnum shrink-0 text-[11px] text-fg-subtle">{dias}d</span>
                      )}
                      <span className="tnum shrink-0 text-[12px] font-medium text-neg">
                        {moeda(t.valor)}
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </Painel>
      </div>

      {/* items-start: painéis com alturas naturais em vez de esticados até o
          mais alto da linha, que deixava um vazio grande embaixo do gráfico */}
      <div className="grid grid-cols-1 items-start gap-3 xl:grid-cols-3">
        {/* categorias */}
        <Painel semPadding className="xl:col-span-2">
          <PainelCabecalho titulo="Despesas por categoria" descricao={rotuloMes(mes)} />
          <div className="p-[var(--pane-p)]">
            {despesasPorCategoria.length === 0 ? (
              <Vazio
                compacto
                icone={<Icone.Etiqueta size={15} />}
                titulo="Nenhuma despesa no mês"
                mensagem="Assim que houver despesas registradas, a distribuição aparece aqui."
                acao={
                  <Botao onClick={() => aoAbrirNovo('despesa')} iconeEsq={<Icone.Mais size={13} />}>
                    Lançar despesa
                  </Botao>
                }
              />
            ) : (
              <Rosca
                fatias={despesasPorCategoria}
                total={resumo.despesas}
                rotuloCentro="Despesas"
                aoClicar={(f) => aoVerLancamentos({ categoriaId: f.id, tipo: 'despesa' })}
              />
            )}
          </div>
        </Painel>

        {/* metas */}
        <Painel semPadding>
          <PainelCabecalho titulo="Metas do mês" descricao="Limite definido por categoria" />
          {metas.length === 0 ? (
            <Vazio
              compacto
              icone={<Icone.Grafico size={15} />}
              titulo="Nenhuma meta definida"
              mensagem="Defina um limite mensal nas categorias para acompanhar aqui."
            />
          ) : (
            <ul className="flex flex-col gap-2.5 p-[var(--pane-p)]">
              {metas.map((m) => {
                const estourou = m.gasto > m.metaMensal
                const largura = Math.min(m.proporcao * 100, 100)
                return (
                  <li key={m.id}>
                    <div className="mb-1 flex items-baseline justify-between gap-2">
                      <span className="flex min-w-0 items-center gap-1.5">
                        <span
                          className="h-2 w-2 shrink-0 rounded-[2px]"
                          style={{ backgroundColor: m.cor }}
                        />
                        <span className="truncate text-[12px] text-fg">{m.nome}</span>
                      </span>
                      <span
                        className={`tnum shrink-0 text-[11.5px] ${estourou ? 'font-medium text-neg' : 'text-fg-muted'}`}
                      >
                        {moeda(m.gasto)} / {moeda(m.metaMensal)}
                      </span>
                    </div>
                    <div className="h-1 overflow-hidden rounded-full bg-surface-3">
                      <div
                        className={`h-full rounded-full transition-all ${estourou ? 'bg-neg' : ''}`}
                        style={{
                          width: `${largura}%`,
                          backgroundColor: estourou ? undefined : m.cor,
                        }}
                      />
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </Painel>
      </div>
    </div>
  )
}
