import { useEffect, useMemo, useState } from 'react'
import { useFinance } from '../estado/FinanceContext'
import { chaveMes, diasAte, rotuloMes, rotuloPrazo } from '../lib/datas'
import { dataCurta, moeda, numero } from '../lib/formato'
import { baixarArquivo, gerarCSV } from '../lib/csv'
import { useToast } from '../estado/ToastContext'
import { Botao, Segmentado } from '../components/ui/Botao'
import { BuscaRapida, Caixa, Selecao } from '../components/ui/Campo'
import { Painel } from '../components/ui/Painel'
import { Cabecalho, Celula, Col, Linha, Tabela, Valor } from '../components/ui/Tabela'
import { Erro, EsqueletoTabela, Vazio } from '../components/ui/Estados'
import { Confirmacao } from '../components/ui/Modal'
import { EtiquetaCategoria, Etiqueta, SituacaoTransacao } from '../components/ui/Etiqueta'
import { Icone } from '../components/Icone'

const FILTRO_LIMPO = { tipo: 'todos', situacao: 'todos', categoriaId: 'todos', busca: '' }

export function Lancamentos({ mes, aoAbrirNovo, aoEditar, aoDuplicar, filtroExterno }) {
  const {
    transacoes,
    categorias,
    categoriaPorId,
    carregando,
    erro,
    salvando,
    recarregar,
    alternarConfirmado,
    excluirTransacao,
    confirmarVarias,
    excluirVarias,
  } = useFinance()
  const toast = useToast()

  const [filtro, setFiltro] = useState(FILTRO_LIMPO)
  const [ordem, setOrdem] = useState({ campo: 'data', direcao: 'asc' })
  const [selecao, setSelecao] = useState(new Set())
  const [aExcluir, setAExcluir] = useState(null)
  const [excluirSerie, setExcluirSerie] = useState(false)
  const [excluirLote, setExcluirLote] = useState(false)

  // Filtro vindo de outra tela (clique num indicador do início, numa fatia do
  // gráfico ou numa categoria). Cada envio traz um `nonce` novo, então clicar
  // duas vezes no mesmo atalho reaplica o filtro.
  useEffect(() => {
    if (!filtroExterno) return
    const { nonce, ...campos } = filtroExterno
    setFiltro({ ...FILTRO_LIMPO, ...campos })
    setSelecao(new Set())
  }, [filtroExterno])

  const doMes = useMemo(
    () => transacoes.filter((t) => chaveMes(t.data) === mes),
    [transacoes, mes]
  )

  const filtradas = useMemo(() => {
    const busca = filtro.busca.trim().toLowerCase()

    const lista = doMes.filter((t) => {
      if (filtro.tipo !== 'todos' && t.tipo !== filtro.tipo) return false
      if (filtro.situacao === 'pagos' && !t.confirmado) return false
      if (filtro.situacao === 'pendentes' && t.confirmado) return false
      if (filtro.situacao === 'atrasados' && (t.confirmado || diasAte(t.data) >= 0)) return false
      if (filtro.categoriaId === 'sem' && t.categoriaId) return false
      if (
        filtro.categoriaId !== 'todos' &&
        filtro.categoriaId !== 'sem' &&
        t.categoriaId !== filtro.categoriaId
      )
        return false
      if (busca) {
        const nomeCategoria = categoriaPorId.get(t.categoriaId)?.nome ?? ''
        const alvo = `${t.descricao} ${nomeCategoria}`.toLowerCase()
        if (!alvo.includes(busca)) return false
      }
      return true
    })

    const dir = ordem.direcao === 'asc' ? 1 : -1
    return [...lista].sort((a, b) => {
      switch (ordem.campo) {
        case 'descricao':
          return a.descricao.localeCompare(b.descricao, 'pt-BR') * dir
        case 'categoria': {
          const na = categoriaPorId.get(a.categoriaId)?.nome ?? 'zzz'
          const nb = categoriaPorId.get(b.categoriaId)?.nome ?? 'zzz'
          return na.localeCompare(nb, 'pt-BR') * dir
        }
        case 'valor': {
          const va = a.tipo === 'receita' ? a.valor : -a.valor
          const vb = b.tipo === 'receita' ? b.valor : -b.valor
          return (va - vb) * dir
        }
        case 'situacao':
          return (Number(a.confirmado) - Number(b.confirmado)) * dir
        case 'data':
        default:
          // desempate por descrição deixa a ordem estável entre recarregamentos
          return (a.data.localeCompare(b.data) || a.descricao.localeCompare(b.descricao)) * dir
      }
    })
  }, [doMes, filtro, ordem, categoriaPorId])

  const totais = useMemo(() => {
    let receitas = 0
    let despesas = 0
    let pendentes = 0
    for (const t of filtradas) {
      if (t.tipo === 'receita') receitas += t.valor
      else despesas += t.valor
      if (!t.confirmado) pendentes += 1
    }
    return { receitas, despesas, saldo: receitas - despesas, pendentes }
  }, [filtradas])

  const temFiltroAtivo =
    filtro.tipo !== 'todos' ||
    filtro.situacao !== 'todos' ||
    filtro.categoriaId !== 'todos' ||
    filtro.busca.trim() !== ''

  const idsVisiveis = useMemo(() => filtradas.map((t) => t.id), [filtradas])
  const selecionadasVisiveis = idsVisiveis.filter((id) => selecao.has(id))
  const todasSelecionadas =
    idsVisiveis.length > 0 && selecionadasVisiveis.length === idsVisiveis.length

  function ordenarPor(campo) {
    setOrdem((o) =>
      o.campo === campo
        ? { campo, direcao: o.direcao === 'asc' ? 'desc' : 'asc' }
        : { campo, direcao: campo === 'valor' ? 'desc' : 'asc' }
    )
  }

  function alternarSelecao(id) {
    setSelecao((s) => {
      const novo = new Set(s)
      novo.has(id) ? novo.delete(id) : novo.add(id)
      return novo
    })
  }

  function alternarTodas() {
    setSelecao(todasSelecionadas ? new Set() : new Set(idsVisiveis))
  }

  function exportar() {
    if (filtradas.length === 0) {
      toast.info('Não há lançamentos para exportar com os filtros atuais.')
      return
    }

    const csv = gerarCSV(
      [
        { titulo: 'Data', valor: (t) => t.data },
        { titulo: 'Descrição', valor: (t) => t.descricao },
        { titulo: 'Tipo', valor: (t) => (t.tipo === 'receita' ? 'Receita' : 'Despesa') },
        { titulo: 'Categoria', valor: (t) => categoriaPorId.get(t.categoriaId)?.nome ?? '' },
        { titulo: 'Valor', valor: (t) => numero(t.valor) },
        { titulo: 'Situação', valor: (t) => (t.confirmado ? 'Confirmado' : 'Pendente') },
        {
          titulo: 'Parcela',
          valor: (t) => (t.parcelaTotal ? `${t.parcelaAtual}/${t.parcelaTotal}` : ''),
        },
      ],
      filtradas
    )

    baixarArquivo(`lancamentos-${mes}.csv`, csv)
    toast.sucesso(`${filtradas.length} lançamentos exportados.`)
  }

  async function confirmarExclusao() {
    const r = await excluirTransacao(aExcluir, { escopo: excluirSerie ? 'grupo' : 'uma' })
    if (r?.ok) {
      setSelecao((s) => {
        const novo = new Set(s)
        novo.delete(aExcluir.id)
        return novo
      })
      setAExcluir(null)
      setExcluirSerie(false)
    }
  }

  async function confirmarExclusaoLote() {
    const r = await excluirVarias([...selecao])
    if (r?.ok) {
      setSelecao(new Set())
      setExcluirLote(false)
    }
  }

  if (erro) {
    return (
      <Painel semPadding>
        <Erro mensagem={erro} onTentarNovamente={() => recarregar()} />
      </Painel>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {/* barra de ferramentas */}
      <div className="flex flex-wrap items-center gap-2">
        <BuscaRapida
          valor={filtro.busca}
          onChange={(v) => setFiltro((f) => ({ ...f, busca: v }))}
          placeholder="Buscar lançamento..."
          className="w-full min-w-[170px] sm:w-56"
        />

        <Segmentado
          valor={filtro.tipo}
          onChange={(v) => setFiltro((f) => ({ ...f, tipo: v }))}
          opcoes={[
            { valor: 'todos', rotulo: 'Todos' },
            { valor: 'receita', rotulo: 'Receitas' },
            { valor: 'despesa', rotulo: 'Despesas' },
          ]}
        />

        <Selecao
          value={filtro.situacao}
          onChange={(e) => setFiltro((f) => ({ ...f, situacao: e.target.value }))}
          className="w-auto min-w-[112px]"
        >
          <option value="todos">Situação: todas</option>
          <option value="pagos">Confirmados</option>
          <option value="pendentes">Pendentes</option>
          <option value="atrasados">Atrasados</option>
        </Selecao>

        <Selecao
          value={filtro.categoriaId}
          onChange={(e) => setFiltro((f) => ({ ...f, categoriaId: e.target.value }))}
          className="w-auto min-w-[130px]"
        >
          <option value="todos">Categoria: todas</option>
          <option value="sem">Sem categoria</option>
          {categorias.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nome}
            </option>
          ))}
        </Selecao>

        {temFiltroAtivo && (
          <Botao variante="fantasma" onClick={() => setFiltro(FILTRO_LIMPO)}>
            Limpar filtros
          </Botao>
        )}

        <div className="ml-auto flex items-center gap-2">
          <span className="tnum hidden text-[11.5px] text-fg-subtle lg:inline">
            {filtradas.length} de {doMes.length} no mês
          </span>
          <Botao onClick={exportar} iconeEsq={<Icone.Baixar size={13} />}>
            Exportar
          </Botao>
        </div>
      </div>

      {/* ações em lote */}
      {selecao.size > 0 && (
        <div className="anim-slide-in flex flex-wrap items-center gap-2 rounded-base border border-accent/30 bg-accent-soft px-2.5 py-2">
          <span className="text-[12.5px] font-medium text-fg">
            {selecao.size} {selecao.size === 1 ? 'selecionado' : 'selecionados'}
          </span>
          <div className="ml-auto flex flex-wrap items-center gap-1.5">
            <Botao
              onClick={() => confirmarVarias([...selecao], true).then(() => setSelecao(new Set()))}
              disabled={salvando}
              iconeEsq={<Icone.Check size={13} />}
            >
              Marcar como pago
            </Botao>
            <Botao
              onClick={() => confirmarVarias([...selecao], false).then(() => setSelecao(new Set()))}
              disabled={salvando}
            >
              Marcar pendente
            </Botao>
            <Botao variante="perigo" onClick={() => setExcluirLote(true)} disabled={salvando}>
              Excluir
            </Botao>
            <Botao variante="fantasma" onClick={() => setSelecao(new Set())}>
              Cancelar
            </Botao>
          </div>
        </div>
      )}

      {/* tabela */}
      <Painel semPadding className="overflow-hidden">
        {carregando ? (
          <EsqueletoTabela linhas={10} />
        ) : filtradas.length === 0 ? (
          <Vazio
            titulo={
              temFiltroAtivo ? 'Nenhum lançamento com esses filtros' : 'Nenhum lançamento neste mês'
            }
            mensagem={
              temFiltroAtivo
                ? 'Ajuste ou limpe os filtros para ver mais resultados.'
                : `Ainda não há movimentação registrada em ${rotuloMes(mes).toLowerCase()}.`
            }
            acao={
              temFiltroAtivo ? (
                <Botao onClick={() => setFiltro(FILTRO_LIMPO)}>Limpar filtros</Botao>
              ) : (
                <Botao
                  variante="primario"
                  onClick={() => aoAbrirNovo('despesa')}
                  iconeEsq={<Icone.Mais size={13} />}
                >
                  Novo lançamento
                </Botao>
              )
            }
          />
        ) : (
          <Tabela>
            {/* Em telas estreitas as colunas secundárias somem e viram uma
                segunda linha embaixo da descrição. Sem isso a coluna de Valor
                — a que mais importa — ficava fora da tela no celular. */}
            <Cabecalho>
              <Col largura="34px" className="hidden pr-0 sm:table-cell">
                <Caixa
                  marcado={todasSelecionadas}
                  indeterminado={selecionadasVisiveis.length > 0}
                  onChange={alternarTodas}
                />
              </Col>
              <Col campo="data" ordem={ordem} onOrdenar={ordenarPor} largura="68px">
                Data
              </Col>
              <Col campo="descricao" ordem={ordem} onOrdenar={ordenarPor}>
                Descrição
              </Col>
              <Col
                campo="categoria"
                ordem={ordem}
                onOrdenar={ordenarPor}
                largura="160px"
                className="hidden lg:table-cell"
              >
                Categoria
              </Col>
              <Col
                campo="situacao"
                ordem={ordem}
                onOrdenar={ordenarPor}
                largura="112px"
                className="hidden md:table-cell"
              >
                Situação
              </Col>
              <Col campo="valor" ordem={ordem} onOrdenar={ordenarPor} alinhar="right" largura="104px">
                Valor
              </Col>
              <Col largura="76px" alinhar="right">
                <span className="sr-only">Ações</span>
              </Col>
            </Cabecalho>

            <tbody>
              {filtradas.map((t) => {
                const categoria = categoriaPorId.get(t.categoriaId)
                const dias = diasAte(t.data)
                // só despesa "atrasa": receita prevista que não caiu ainda não
                // é motivo para pintar a linha de vermelho
                const ehDespesa = t.tipo === 'despesa'
                const atrasado = !t.confirmado && ehDespesa && dias < 0
                const venceLogo = !t.confirmado && ehDespesa && dias >= 0 && dias <= 3

                return (
                  <Linha key={t.id} selecionada={selecao.has(t.id)} atencao={atrasado || venceLogo}>
                    <Celula className="hidden pr-0 sm:table-cell">
                      <Caixa marcado={selecao.has(t.id)} onChange={() => alternarSelecao(t.id)} />
                    </Celula>

                    <Celula className="tnum whitespace-nowrap text-fg-muted">
                      <span title={rotuloPrazo(t.data)}>{dataCurta(t.data)}</span>
                    </Celula>

                    <Celula className="max-w-0">
                      <div className="flex items-center gap-1.5">
                        {/* No desktop corta com reticências (o title mostra o
                            resto no hover). No celular não existe hover, então
                            deixa quebrar em duas linhas. */}
                        <button
                          type="button"
                          onClick={() => aoEditar(t)}
                          className="line-clamp-2 text-left font-medium break-words text-fg hover:text-accent hover:underline sm:truncate"
                          title={t.descricao}
                        >
                          {t.descricao}
                        </button>
                        {t.parcelaTotal && (
                          <Etiqueta tom="neutro" title="Compra parcelada">
                            {t.parcelaAtual}/{t.parcelaTotal}
                          </Etiqueta>
                        )}
                        {t.recorrencia && (
                          <span
                            className="shrink-0 text-fg-subtle"
                            title={`Lançamento ${t.recorrencia}`}
                          >
                            <Icone.Repetir size={11} />
                          </span>
                        )}
                      </div>

                      {/* o que sai das colunas escondidas reaparece aqui */}
                      <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 lg:hidden">
                        {categoria && (
                          <span className="lg:hidden">
                            <EtiquetaCategoria categoria={categoria} />
                          </span>
                        )}
                        <span className="md:hidden">
                          <SituacaoTransacao transacao={t} diasAte={dias} />
                        </span>
                      </div>
                    </Celula>

                    <Celula className="hidden lg:table-cell">
                      <EtiquetaCategoria categoria={categoria} />
                    </Celula>

                    <Celula className="hidden md:table-cell">
                      <button
                        type="button"
                        onClick={() => alternarConfirmado(t)}
                        title={
                          t.confirmado
                            ? 'Marcar como pendente'
                            : `Marcar como ${t.tipo === 'receita' ? 'recebido' : 'pago'}`
                        }
                        className="transition-opacity hover:opacity-70"
                      >
                        <SituacaoTransacao transacao={t} diasAte={dias} />
                      </button>
                    </Celula>

                    <Celula alinhar="right">
                      <Valor valor={t.valor} tipo={t.tipo} />
                    </Celula>

                    <Celula alinhar="right">
                      {/* ações discretas: aparecem no hover, mas ficam sempre
                          acessíveis via teclado e no toque */}
                      <div className="flex items-center justify-end gap-0.5 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100 max-md:opacity-100">
                        <IconeAcao titulo="Editar" onClick={() => aoEditar(t)}>
                          <Icone.Lapis size={13} />
                        </IconeAcao>
                        <IconeAcao titulo="Duplicar" onClick={() => aoDuplicar(t)} className="hidden sm:inline-flex">
                          <Icone.Copia size={13} />
                        </IconeAcao>
                        <IconeAcao
                          titulo="Excluir"
                          perigo
                          onClick={() => {
                            setAExcluir(t)
                            setExcluirSerie(false)
                          }}
                        >
                          <Icone.Lixeira size={13} />
                        </IconeAcao>
                      </div>
                    </Celula>
                  </Linha>
                )
              })}
            </tbody>
          </Tabela>
        )}

        {/* Totais fora da <tfoot>: como as colunas somem em telas estreitas,
            um rodapé com colSpan fixo desalinharia a tabela no celular. */}
        {!carregando && filtradas.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-t-2 border-line-strong bg-surface-2 px-2.5 py-2">
            <span className="text-[11.5px] text-fg-muted">
              {filtradas.length} {filtradas.length === 1 ? 'lançamento' : 'lançamentos'}
              {totais.pendentes > 0 && ` · ${totais.pendentes} pendente(s)`}
            </span>

            <div className="flex flex-wrap items-center gap-x-5 gap-y-1">
              <span className="flex items-baseline gap-1.5">
                <span className="text-[10.5px] tracking-wide text-fg-muted uppercase">Receitas</span>
                <span className="tnum text-[12.5px] font-medium text-pos">
                  {numero(totais.receitas)}
                </span>
              </span>
              <span className="flex items-baseline gap-1.5">
                <span className="text-[10.5px] tracking-wide text-fg-muted uppercase">Despesas</span>
                <span className="tnum text-[12.5px] font-medium text-neg">
                  {numero(totais.despesas)}
                </span>
              </span>
              <span className="flex items-baseline gap-1.5 border-l border-line pl-5">
                <span className="text-[10.5px] tracking-wide text-fg-muted uppercase">
                  Resultado
                </span>
                <span
                  className={`tnum text-[13.5px] font-semibold ${totais.saldo >= 0 ? 'text-pos' : 'text-neg'}`}
                >
                  {moeda(totais.saldo)}
                </span>
              </span>
            </div>
          </div>
        )}
      </Painel>

      {/* exclusão individual */}
      <Confirmacao
        aberto={!!aExcluir}
        onFechar={() => {
          setAExcluir(null)
          setExcluirSerie(false)
        }}
        onConfirmar={confirmarExclusao}
        processando={salvando}
        destrutivo
        titulo="Excluir lançamento"
        textoConfirmar={excluirSerie ? 'Excluir a série' : 'Excluir'}
        mensagem={
          aExcluir
            ? `"${aExcluir.descricao}" — ${moeda(aExcluir.valor)}. Esta ação não pode ser desfeita.`
            : ''
        }
        extra={
          aExcluir?.grupo ? (
            <label className="flex cursor-pointer items-start gap-2 rounded-base border border-line bg-surface-2 px-2.5 py-2">
              <span className="mt-px">
                <Caixa marcado={excluirSerie} onChange={setExcluirSerie} />
              </span>
              <span className="text-[12px] text-fg">
                Excluir todos os lançamentos desta série
                <span className="mt-0.5 block text-[11.5px] text-fg-muted">
                  {aExcluir.parcelaTotal
                    ? `Apaga as ${aExcluir.parcelaTotal} parcelas, inclusive as de meses futuros.`
                    : 'Apaga todas as repetições criadas junto com esta.'}
                </span>
              </span>
            </label>
          ) : null
        }
      />

      {/* exclusão em lote */}
      <Confirmacao
        aberto={excluirLote}
        onFechar={() => setExcluirLote(false)}
        onConfirmar={confirmarExclusaoLote}
        processando={salvando}
        destrutivo
        titulo={`Excluir ${selecao.size} lançamentos`}
        textoConfirmar="Excluir tudo"
        mensagem="Os lançamentos selecionados serão apagados definitivamente. Esta ação não pode ser desfeita."
      />
    </div>
  )
}

function IconeAcao({ titulo, onClick, perigo = false, className = '', children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={titulo}
      aria-label={titulo}
      className={[
        'rounded p-1 text-fg-subtle transition-colors',
        perigo ? 'hover:bg-neg-soft hover:text-neg' : 'hover:bg-surface-3 hover:text-fg',
        className,
      ].join(' ')}
    >
      {children}
    </button>
  )
}
