import { useEffect, useMemo, useState } from 'react'
import { Modal } from './ui/Modal'
import { Botao, Segmentado } from './ui/Botao'
import { Campo, Caixa, Entrada, EntradaValor, Selecao } from './ui/Campo'
import { Icone } from './Icone'
import { useFinance } from '../estado/FinanceContext'
import { addDias, addMeses, hoje } from '../lib/datas'
import { data as fmtData, lerValor, moeda } from '../lib/formato'

const VAZIO = {
  descricao: '',
  tipo: 'despesa',
  valor: '',
  categoriaId: '',
  data: hoje(),
  confirmado: false,
  modo: 'unico', // 'unico' | 'parcelado' | 'repetido'
  parcelas: '2',
  valorEhTotal: false,
  frequencia: 'mensal', // 'semanal' | 'mensal'
  repeticoes: '12',
}

export function FormularioTransacao({ aberto, onFechar, transacao, valoresIniciais }) {
  const { categorias, criarTransacao, atualizarTransacao, salvando } = useFinance()

  const editando = !!transacao
  const [form, setForm] = useState(VAZIO)
  const [erros, setErros] = useState({})

  useEffect(() => {
    if (!aberto) return
    setErros({})

    if (transacao) {
      setForm({
        ...VAZIO,
        descricao: transacao.descricao,
        tipo: transacao.tipo,
        valor: String(transacao.valor).replace('.', ','),
        categoriaId: transacao.categoriaId ?? '',
        data: transacao.data,
        confirmado: transacao.confirmado,
      })
    } else {
      setForm({ ...VAZIO, ...valoresIniciais })
    }
  }, [aberto, transacao, valoresIniciais])

  function set(campo, valor) {
    setForm((f) => ({ ...f, [campo]: valor }))
    if (erros[campo]) setErros((e) => ({ ...e, [campo]: undefined }))
  }

  const categoriasDisponiveis = useMemo(
    () => categorias.filter((c) => c.tipo === form.tipo || c.tipo === 'ambos'),
    [categorias, form.tipo]
  )

  const valorNumerico = lerValor(form.valor)
  const qtdParcelas = Math.max(2, Math.min(parseInt(form.parcelas, 10) || 2, 48))
  const qtdRepeticoes = Math.max(2, Math.min(parseInt(form.repeticoes, 10) || 12, 60))

  /** Mostra exatamente o que vai ser gravado antes de gravar. */
  const previa = useMemo(() => {
    if (!Number.isFinite(valorNumerico) || valorNumerico <= 0) return null

    if (form.modo === 'parcelado') {
      const porParcela = form.valorEhTotal ? valorNumerico / qtdParcelas : valorNumerico
      const total = form.valorEhTotal ? valorNumerico : valorNumerico * qtdParcelas
      return {
        linhas: qtdParcelas,
        texto: `${qtdParcelas}× de ${moeda(porParcela)} — total ${moeda(total)}`,
        periodo: `${fmtData(form.data)} até ${fmtData(addMeses(form.data, qtdParcelas - 1))}`,
      }
    }

    if (form.modo === 'repetido') {
      const ultima =
        form.frequencia === 'semanal'
          ? addDias(form.data, 7 * (qtdRepeticoes - 1))
          : addMeses(form.data, qtdRepeticoes - 1)
      return {
        linhas: qtdRepeticoes,
        texto: `${qtdRepeticoes}× de ${moeda(valorNumerico)} — total ${moeda(valorNumerico * qtdRepeticoes)}`,
        periodo: `${form.frequencia === 'semanal' ? 'Toda semana' : 'Todo mês'}, de ${fmtData(form.data)} até ${fmtData(ultima)}`,
      }
    }

    return null
  }, [form, valorNumerico, qtdParcelas, qtdRepeticoes])

  function validar() {
    const e = {}
    if (!form.descricao.trim()) e.descricao = 'Informe uma descrição.'
    if (!Number.isFinite(valorNumerico) || valorNumerico <= 0)
      e.valor = 'Informe um valor maior que zero.'
    if (!form.data) e.data = 'Informe a data.'
    setErros(e)
    return Object.keys(e).length === 0
  }

  async function salvar() {
    if (!validar()) return

    const base = {
      descricao: form.descricao,
      tipo: form.tipo,
      valor: valorNumerico,
      categoriaId: form.categoriaId || null,
      data: form.data,
      confirmado: form.confirmado,
    }

    const r = editando
      ? await atualizarTransacao(transacao.id, base)
      : await criarTransacao({
          ...base,
          parcelas: form.modo === 'parcelado' ? qtdParcelas : 0,
          valorEhTotal: form.valorEhTotal,
          repeticao: form.modo === 'repetido' ? form.frequencia : 'unica',
          repeticoes: qtdRepeticoes,
        })

    if (r?.ok) onFechar()
  }

  const ehReceita = form.tipo === 'receita'

  return (
    <Modal
      aberto={aberto}
      onFechar={onFechar}
      titulo={editando ? 'Editar lançamento' : 'Novo lançamento'}
      descricao={
        editando && (transacao?.parcelaTotal || transacao?.recorrencia)
          ? 'Alterações valem apenas para este lançamento da série.'
          : undefined
      }
      rodape={
        <>
          <Botao onClick={onFechar} disabled={salvando}>
            Cancelar
          </Botao>
          <Botao variante="primario" onClick={salvar} carregando={salvando}>
            {editando ? 'Salvar' : previa ? `Criar ${previa.linhas} lançamentos` : 'Criar'}
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
        {/* tipo */}
        <div className="grid grid-cols-2 gap-2">
          {[
            { valor: 'despesa', rotulo: 'Despesa', icone: <Icone.Baixo size={14} /> },
            { valor: 'receita', rotulo: 'Receita', icone: <Icone.Cima size={14} /> },
          ].map((o) => {
            const ativo = form.tipo === o.valor
            const tom =
              o.valor === 'receita'
                ? 'border-pos bg-pos-soft text-pos'
                : 'border-neg bg-neg-soft text-neg'
            return (
              <button
                key={o.valor}
                type="button"
                onClick={() => setForm((f) => ({ ...f, tipo: o.valor, categoriaId: '' }))}
                className={[
                  'flex h-8 items-center justify-center gap-1.5 rounded-base border text-[12.5px] font-medium transition-colors',
                  ativo ? tom : 'border-line bg-surface text-fg-muted hover:bg-surface-2',
                ].join(' ')}
              >
                {o.icone}
                {o.rotulo}
              </button>
            )
          })}
        </div>

        <Campo rotulo="Descrição" obrigatorio erro={erros.descricao}>
          <Entrada
            value={form.descricao}
            onChange={(e) => set('descricao', e.target.value)}
            placeholder={ehReceita ? 'Ex.: Salário, Freela' : 'Ex.: Aluguel, Mercado'}
            erro={erros.descricao}
            maxLength={120}
          />
        </Campo>

        <div className="grid grid-cols-2 gap-3">
          <Campo rotulo="Valor" obrigatorio erro={erros.valor}>
            <EntradaValor
              value={form.valor}
              onChange={(e) => set('valor', e.target.value)}
              erro={erros.valor}
            />
          </Campo>

          <Campo rotulo="Data" obrigatorio erro={erros.data}>
            <Entrada
              type="date"
              value={form.data}
              onChange={(e) => set('data', e.target.value)}
              erro={erros.data}
            />
          </Campo>
        </div>

        <Campo
          rotulo="Categoria"
          dica={
            categoriasDisponiveis.length === 0
              ? `Nenhuma categoria de ${ehReceita ? 'receita' : 'despesa'} cadastrada ainda.`
              : undefined
          }
        >
          <Selecao value={form.categoriaId} onChange={(e) => set('categoriaId', e.target.value)}>
            <option value="">Sem categoria</option>
            {categoriasDisponiveis.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome}
              </option>
            ))}
          </Selecao>
        </Campo>

        {/* repetição — só faz sentido ao criar */}
        {!editando && (
          <div className="rounded-base border border-line bg-surface-2/50 p-2.5">
            <Segmentado
              valor={form.modo}
              onChange={(v) => set('modo', v)}
              opcoes={[
                { valor: 'unico', rotulo: 'Único' },
                { valor: 'parcelado', rotulo: 'Parcelado' },
                { valor: 'repetido', rotulo: 'Repetido' },
              ]}
              className="w-full [&>button]:flex-1"
            />

            {form.modo === 'parcelado' && (
              <div className="mt-2.5 flex flex-col gap-2.5">
                <Campo rotulo="Número de parcelas">
                  <Entrada
                    type="number"
                    min={2}
                    max={48}
                    value={form.parcelas}
                    onChange={(e) => set('parcelas', e.target.value)}
                  />
                </Campo>
                <Segmentado
                  valor={form.valorEhTotal ? 'total' : 'parcela'}
                  onChange={(v) => set('valorEhTotal', v === 'total')}
                  opcoes={[
                    { valor: 'parcela', rotulo: 'Valor por parcela' },
                    { valor: 'total', rotulo: 'Valor total' },
                  ]}
                  className="w-full [&>button]:flex-1"
                />
              </div>
            )}

            {form.modo === 'repetido' && (
              <div className="mt-2.5 grid grid-cols-2 gap-2.5">
                <Campo rotulo="Frequência">
                  <Selecao
                    value={form.frequencia}
                    onChange={(e) => set('frequencia', e.target.value)}
                  >
                    <option value="mensal">Mensal</option>
                    <option value="semanal">Semanal</option>
                  </Selecao>
                </Campo>
                <Campo rotulo="Quantas vezes">
                  <Entrada
                    type="number"
                    min={2}
                    max={60}
                    value={form.repeticoes}
                    onChange={(e) => set('repeticoes', e.target.value)}
                  />
                </Campo>
              </div>
            )}

            {previa && (
              <div className="mt-2.5 flex items-start gap-2 border-t border-line pt-2.5 text-[11.5px]">
                <span className="mt-px shrink-0 text-fg-subtle">
                  <Icone.Repetir size={12} />
                </span>
                <div className="min-w-0">
                  <p className="font-medium text-fg">{previa.texto}</p>
                  <p className="text-fg-muted">{previa.periodo}</p>
                </div>
              </div>
            )}
          </div>
        )}

        <label className="flex cursor-pointer items-center gap-2 rounded-base border border-line bg-surface px-2.5 py-2">
          <Caixa marcado={form.confirmado} onChange={(v) => set('confirmado', v)} />
          <span className="text-[12.5px] text-fg">
            {ehReceita ? 'Já recebido' : 'Já pago'}
            {!editando && form.modo !== 'unico' && (
              <span className="ml-1 text-[11.5px] text-fg-subtle">
                (aplica só ao primeiro lançamento)
              </span>
            )}
          </span>
        </label>

        {/* permite enviar com Enter sem um botão visível a mais */}
        <button type="submit" className="hidden" aria-hidden="true" tabIndex={-1} />
      </form>
    </Modal>
  )
}
