import { useEffect, useMemo, useState } from 'react'
import { useFinance } from '../estado/FinanceContext'
import { useToast } from '../estado/ToastContext'
import { chaveMes, rotuloMes } from '../lib/datas'
import { lerValor, moeda } from '../lib/formato'
import { Botao } from '../components/ui/Botao'
import { Campo, Entrada, EntradaValor, Selecao } from '../components/ui/Campo'
import { Painel } from '../components/ui/Painel'
import { Cabecalho, Celula, Col, Linha, Tabela } from '../components/ui/Tabela'
import { Confirmacao, Modal } from '../components/ui/Modal'
import { Erro, EsqueletoTabela, Vazio } from '../components/ui/Estados'
import { Etiqueta } from '../components/ui/Etiqueta'
import { Icone } from '../components/Icone'

// Paleta de categoria: tons distinguíveis entre si, inclusive para quem tem
// dificuldade de diferenciar vermelho e verde (variam também em luminosidade).
const CORES = [
  '#c0392b',
  '#e67e22',
  '#d4a017',
  '#7f8c3a',
  '#2e8b57',
  '#149c8e',
  '#2980b9',
  '#3f51b5',
  '#7b52ab',
  '#b0417a',
  '#8d6e63',
  '#6b7280',
]

const FORM_VAZIO = { nome: '', cor: CORES[6], tipo: 'despesa', meta: '' }

export function Categorias({ mes, aoVerLancamentos }) {
  const {
    categorias,
    transacoes,
    carregando,
    erro,
    salvando,
    recarregar,
    salvarCategoria,
    excluirCategoria,
  } = useFinance()
  const toast = useToast()

  const [modalAberto, setModalAberto] = useState(false)
  const [editando, setEditando] = useState(null)
  const [form, setForm] = useState(FORM_VAZIO)
  const [erros, setErros] = useState({})
  const [aExcluir, setAExcluir] = useState(null)

  const doMes = useMemo(
    () => transacoes.filter((t) => chaveMes(t.data) === mes),
    [transacoes, mes]
  )

  const linhas = useMemo(() => {
    const usoTotal = new Map()
    for (const t of transacoes) {
      if (!t.categoriaId) continue
      usoTotal.set(t.categoriaId, (usoTotal.get(t.categoriaId) ?? 0) + 1)
    }

    const gastoMes = new Map()
    for (const t of doMes) {
      if (!t.categoriaId) continue
      gastoMes.set(t.categoriaId, (gastoMes.get(t.categoriaId) ?? 0) + t.valor)
    }

    const totalMes = [...gastoMes.values()].reduce((a, v) => a + v, 0)

    return categorias
      .map((c) => {
        const movimentado = gastoMes.get(c.id) ?? 0
        return {
          ...c,
          usos: usoTotal.get(c.id) ?? 0,
          movimentado,
          // fatia sobre tudo que passou por categorias no mês
          fatiaPct: totalMes > 0 ? Math.round((movimentado / totalMes) * 100) : 0,
        }
      })
      .sort((a, b) => b.movimentado - a.movimentado || a.nome.localeCompare(b.nome, 'pt-BR'))
  }, [categorias, transacoes, doMes])

  useEffect(() => {
    if (!modalAberto) return
    setErros({})
    setForm(
      editando
        ? {
            nome: editando.nome,
            cor: editando.cor,
            tipo: editando.tipo,
            meta: editando.metaMensal ? String(editando.metaMensal).replace('.', ',') : '',
          }
        : FORM_VAZIO
    )
  }, [modalAberto, editando])

  function abrirNova() {
    setEditando(null)
    setModalAberto(true)
  }

  function abrirEdicao(categoria) {
    setEditando(categoria)
    setModalAberto(true)
  }

  async function salvar() {
    const novosErros = {}
    if (!form.nome.trim()) novosErros.nome = 'Informe o nome da categoria.'

    const jaExiste = categorias.some(
      (c) =>
        c.id !== editando?.id && c.nome.trim().toLowerCase() === form.nome.trim().toLowerCase()
    )
    if (jaExiste) novosErros.nome = 'Já existe uma categoria com esse nome.'

    const meta = form.meta.trim() ? lerValor(form.meta) : null
    if (meta !== null && (!Number.isFinite(meta) || meta <= 0))
      novosErros.meta = 'Informe um valor maior que zero ou deixe em branco.'

    setErros(novosErros)
    if (Object.keys(novosErros).length > 0) return

    const r = await salvarCategoria(editando?.id ?? null, {
      nome: form.nome,
      cor: form.cor,
      tipo: form.tipo,
      metaMensal: meta,
    })
    if (r?.ok) setModalAberto(false)
  }

  function pedirExclusao(categoria) {
    if (categoria.usos > 0) {
      toast.erro(
        `"${categoria.nome}" está em uso por ${categoria.usos} lançamento(s). Troque a categoria deles antes de excluir.`
      )
      return
    }
    setAExcluir(categoria)
  }

  async function confirmarExclusao() {
    const r = await excluirCategoria(aExcluir.id)
    if (r?.ok) setAExcluir(null)
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
      <div className="flex items-center justify-between gap-2">
        <p className="text-[12px] text-fg-muted">
          Movimentação exibida referente a {rotuloMes(mes).toLowerCase()}.
        </p>
        <Botao variante="primario" onClick={abrirNova} iconeEsq={<Icone.Mais size={13} />}>
          Nova categoria
        </Botao>
      </div>

      <Painel semPadding className="overflow-hidden">
        {carregando ? (
          <EsqueletoTabela linhas={6} />
        ) : linhas.length === 0 ? (
          <Vazio
            icone={<Icone.Etiqueta size={15} />}
            titulo="Nenhuma categoria cadastrada"
            mensagem="Categorias organizam seus lançamentos e permitem definir metas de gasto mensal."
            acao={
              <Botao variante="primario" onClick={abrirNova} iconeEsq={<Icone.Mais size={13} />}>
                Criar primeira categoria
              </Botao>
            }
          />
        ) : (
          <Tabela>
            <Cabecalho>
              <Col>Categoria</Col>
              <Col largura="100px">Tipo</Col>
              <Col largura="120px" alinhar="right">
                No mês
              </Col>
              <Col largura="150px">Meta mensal</Col>
              <Col largura="90px" alinhar="right">
                Lançamentos
              </Col>
              <Col largura="70px" alinhar="right">
                <span className="sr-only">Ações</span>
              </Col>
            </Cabecalho>

            <tbody>
              {linhas.map((c) => {
                const estourou = c.metaMensal && c.movimentado > c.metaMensal
                return (
                  <Linha key={c.id}>
                    <Celula>
                      <button
                        type="button"
                        onClick={() => aoVerLancamentos({ categoriaId: c.id })}
                        className="flex min-w-0 items-center gap-2 text-left"
                        title="Ver lançamentos desta categoria"
                      >
                        <span
                          className="h-2.5 w-2.5 shrink-0 rounded-[3px]"
                          style={{ backgroundColor: c.cor }}
                        />
                        <span className="truncate font-medium text-fg hover:text-accent hover:underline">
                          {c.nome}
                        </span>
                      </button>
                    </Celula>

                    <Celula>
                      <Etiqueta
                        tom={
                          c.tipo === 'receita' ? 'positivo' : c.tipo === 'ambos' ? 'acento' : 'neutro'
                        }
                      >
                        {c.tipo === 'receita' ? 'Receita' : c.tipo === 'ambos' ? 'Ambos' : 'Despesa'}
                      </Etiqueta>
                    </Celula>

                    <Celula alinhar="right">
                      <span className="tnum font-medium text-fg">{moeda(c.movimentado)}</span>
                      {c.fatiaPct > 0 && (
                        <span
                          className="tnum ml-1.5 text-[11px] text-fg-subtle"
                          title="Participação no total movimentado do mês"
                        >
                          {c.fatiaPct}%
                        </span>
                      )}
                    </Celula>

                    <Celula>
                      {c.metaMensal ? (
                        <div className="flex flex-col gap-1">
                          <span
                            className={`tnum text-[11.5px] ${estourou ? 'font-medium text-neg' : 'text-fg-muted'}`}
                          >
                            {moeda(c.metaMensal)}
                            {estourou && ' · estourou'}
                          </span>
                          <div className="h-1 overflow-hidden rounded-full bg-surface-3">
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${Math.min((c.movimentado / c.metaMensal) * 100, 100)}%`,
                                backgroundColor: estourou ? 'var(--app-neg)' : c.cor,
                              }}
                            />
                          </div>
                        </div>
                      ) : (
                        <span className="text-[11.5px] text-fg-subtle">—</span>
                      )}
                    </Celula>

                    <Celula alinhar="right" className="tnum text-fg-muted">
                      {c.usos}
                    </Celula>

                    <Celula alinhar="right">
                      <div className="flex items-center justify-end gap-0.5 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100 max-md:opacity-100">
                        <button
                          type="button"
                          onClick={() => abrirEdicao(c)}
                          title="Editar"
                          aria-label={`Editar ${c.nome}`}
                          className="rounded p-1 text-fg-subtle transition-colors hover:bg-surface-3 hover:text-fg"
                        >
                          <Icone.Lapis size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => pedirExclusao(c)}
                          title={c.usos > 0 ? 'Categoria em uso' : 'Excluir'}
                          aria-label={`Excluir ${c.nome}`}
                          className="rounded p-1 text-fg-subtle transition-colors hover:bg-neg-soft hover:text-neg disabled:opacity-40"
                        >
                          <Icone.Lixeira size={13} />
                        </button>
                      </div>
                    </Celula>
                  </Linha>
                )
              })}
            </tbody>
          </Tabela>
        )}
      </Painel>

      {/* formulário */}
      <Modal
        aberto={modalAberto}
        onFechar={() => setModalAberto(false)}
        titulo={editando ? 'Editar categoria' : 'Nova categoria'}
        largura="sm"
        rodape={
          <>
            <Botao onClick={() => setModalAberto(false)} disabled={salvando}>
              Cancelar
            </Botao>
            <Botao variante="primario" onClick={salvar} carregando={salvando}>
              {editando ? 'Salvar' : 'Criar'}
            </Botao>
          </>
        }
      >
        <form
          onSubmit={(e) => {
            e.preventDefault()
            salvar()
          }}
          className="flex flex-col gap-3.5"
        >
          <Campo rotulo="Nome" obrigatorio erro={erros.nome}>
            <Entrada
              value={form.nome}
              onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
              placeholder="Ex.: Moradia, Transporte"
              erro={erros.nome}
              maxLength={60}
            />
          </Campo>

          <Campo rotulo="Aplica-se a">
            <Selecao
              value={form.tipo}
              onChange={(e) => setForm((f) => ({ ...f, tipo: e.target.value }))}
            >
              <option value="despesa">Despesas</option>
              <option value="receita">Receitas</option>
              <option value="ambos">Ambos</option>
            </Selecao>
          </Campo>

          <Campo
            rotulo="Meta mensal"
            dica="Opcional. Serve para avisar quando o gasto do mês passar do limite."
            erro={erros.meta}
          >
            <EntradaValor
              value={form.meta}
              onChange={(e) => setForm((f) => ({ ...f, meta: e.target.value }))}
              erro={erros.meta}
            />
          </Campo>

          <Campo rotulo="Cor">
            <div className="flex flex-wrap gap-1.5">
              {CORES.map((cor) => {
                const ativa = form.cor === cor
                return (
                  <button
                    key={cor}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, cor }))}
                    aria-label={`Cor ${cor}`}
                    aria-pressed={ativa}
                    className={[
                      'h-6 w-6 rounded-base transition-transform',
                      ativa
                        ? 'ring-2 ring-fg ring-offset-2 ring-offset-surface'
                        : 'hover:scale-110',
                    ].join(' ')}
                    style={{ backgroundColor: cor }}
                  />
                )
              })}
            </div>
          </Campo>

          <button type="submit" className="hidden" aria-hidden="true" tabIndex={-1} />
        </form>
      </Modal>

      <Confirmacao
        aberto={!!aExcluir}
        onFechar={() => setAExcluir(null)}
        onConfirmar={confirmarExclusao}
        processando={salvando}
        destrutivo
        titulo="Excluir categoria"
        textoConfirmar="Excluir"
        mensagem={
          aExcluir
            ? `A categoria "${aExcluir.nome}" será removida. Nenhum lançamento usa ela no momento.`
            : ''
        }
      />
    </div>
  )
}
