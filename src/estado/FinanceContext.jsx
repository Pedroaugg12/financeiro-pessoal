import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { mensagemErro, supabase, unwrap } from '../lib/supabase'
import { addDias, addMeses } from '../lib/datas'
import { useAuth } from './AuthContext'
import { useToast } from './ToastContext'

// Exportado para permitir injetar dados de teste sem tocar no Supabase.
export const FinanceCtx = createContext(null)
const Ctx = FinanceCtx

/* --------------------------------------------------------------------------
   Tradução entre as colunas do banco e os nomes usados na interface.
   O schema NÃO muda — nenhum dado existente é tocado.
   -------------------------------------------------------------------------- */

function daLinhaTransacao(l) {
  return {
    id: l.id,
    descricao: l.descricao ?? '',
    tipo: l.tipo,
    valor: Number(l.valor) || 0,
    categoriaId: l.categoria_id ?? null,
    data: l.data,
    confirmado: !!l.confirmado,
    recorrencia: l.recorrencia ?? null,
    parcelaAtual: l.parcela_atual ?? null,
    parcelaTotal: l.parcela_total ?? null,
    grupo: l.parcela_grupo ?? null,
  }
}

function daLinhaCategoria(l) {
  return {
    id: l.id,
    nome: l.nome ?? '',
    cor: l.cor || '#8b939f',
    tipo: l.tipo || 'despesa',
    metaMensal: l.meta_mensal === null || l.meta_mensal === undefined ? null : Number(l.meta_mensal),
  }
}

const CONFIG_PADRAO = { saldoInicial: 0, tema: 'dark', densidade: 'confortavel' }

function daLinhaConfig(l) {
  if (!l) return CONFIG_PADRAO
  return {
    saldoInicial: Number(l.saldo_inicial) || 0,
    tema: l.tema === 'light' ? 'light' : 'dark',
    densidade: l.modo_compacto ? 'compacta' : 'confortavel',
  }
}

/** Um mesmo id de agrupamento para parcelas e para séries recorrentes. */
function novoGrupo() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  // Fallback para contexto sem crypto (http em rede local, por exemplo)
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16)
  })
}

/**
 * Calcula a data da n-ésima ocorrência.
 * O código antigo tinha `rec === 'mensal' ? addMeses(...) : data` — ou seja,
 * "semanal" gerava 12 lançamentos TODOS no mesmo dia. Aqui cada frequência
 * anda de verdade.
 */
function dataDaOcorrencia(dataInicial, frequencia, indice) {
  if (indice === 0) return dataInicial
  if (frequencia === 'semanal') return addDias(dataInicial, 7 * indice)
  return addMeses(dataInicial, indice)
}

/**
 * Divide um valor total em N parcelas sem perder centavo. 100,00 em 3x vira
 * 33,34 + 33,33 + 33,33 — e não 33,33 três vezes (que somaria 99,99).
 */
function dividirParcelas(valorTotal, n) {
  const centavos = Math.round(valorTotal * 100)
  const base = Math.floor(centavos / n)
  const resto = centavos - base * n
  return Array.from({ length: n }, (_, i) => (base + (i < resto ? 1 : 0)) / 100)
}

export function FinanceProvider({ children }) {
  const { usuario } = useAuth()
  const toast = useToast()

  const [transacoes, setTransacoes] = useState([])
  const [categorias, setCategorias] = useState([])
  const [config, setConfig] = useState(CONFIG_PADRAO)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState(null)
  const [salvando, setSalvando] = useState(false)

  const userId = usuario?.id ?? null
  // Usado pelo realtime, que precisa da função mais recente sem se reinscrever.
  const recarregarRef = useRef(null)

  /* ---------------------------------------------------------------- leitura */

  const carregarTransacoes = useCallback(async () => {
    const linhas = unwrap(
      await supabase
        .from('transacoes')
        .select('*')
        .eq('user_id', userId)
        .order('data', { ascending: false })
    )
    setTransacoes((linhas ?? []).map(daLinhaTransacao))
  }, [userId])

  const carregarCategorias = useCallback(async () => {
    const linhas = unwrap(
      await supabase.from('categorias').select('*').eq('user_id', userId).order('nome')
    )
    setCategorias((linhas ?? []).map(daLinhaCategoria))
  }, [userId])

  /**
   * O código antigo usava `.single()`, que dispara erro quando o usuário ainda
   * não tem linha de configuração. O erro era engolido, a config ficava no
   * padrão e todo `update` seguinte não achava linha nenhuma para atualizar —
   * então nada era salvo, sem nenhum aviso. Aqui: se não existe, cria.
   */
  const carregarConfig = useCallback(async () => {
    const linha = unwrap(
      await supabase.from('configuracoes').select('*').eq('user_id', userId).maybeSingle()
    )

    if (linha) {
      setConfig(daLinhaConfig(linha))
      return
    }

    const criada = unwrap(
      await supabase
        .from('configuracoes')
        .insert({
          user_id: userId,
          saldo_inicial: 0,
          tema: 'dark',
          cor_primaria: '#2557d6',
          modo_compacto: false,
        })
        .select()
        .single()
    )
    setConfig(daLinhaConfig(criada))
  }, [userId])

  const recarregar = useCallback(
    async ({ silencioso = false } = {}) => {
      if (!userId) return
      if (!silencioso) setCarregando(true)
      try {
        await Promise.all([carregarTransacoes(), carregarCategorias(), carregarConfig()])
        setErro(null)
      } catch (e) {
        // Antes isso virava uma tela vazia dizendo "Nenhuma transação".
        setErro(mensagemErro(e))
      } finally {
        setCarregando(false)
      }
    },
    [userId, carregarTransacoes, carregarCategorias, carregarConfig]
  )

  recarregarRef.current = recarregar

  useEffect(() => {
    if (!userId) {
      setTransacoes([])
      setCategorias([])
      setConfig(CONFIG_PADRAO)
      setCarregando(false)
      return
    }
    recarregar()
  }, [userId, recarregar])

  /* --------------------------------------------------------------- realtime */

  useEffect(() => {
    if (!userId) return

    const canal = supabase
      .channel(`fin-${userId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'transacoes', filter: `user_id=eq.${userId}` },
        () => recarregarRef.current?.({ silencioso: true })
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'categorias', filter: `user_id=eq.${userId}` },
        () => recarregarRef.current?.({ silencioso: true })
      )
      .subscribe()

    return () => {
      supabase.removeChannel(canal)
    }
  }, [userId])

  /* --------------------------------------------------------------- escritas */

  /** Envolve uma mutação: marca "salvando", trata erro e recarrega. */
  const executar = useCallback(
    async (acao, { sucesso, recarregarDepois = true } = {}) => {
      setSalvando(true)
      try {
        const r = await acao()
        if (recarregarDepois) await recarregar({ silencioso: true })
        if (sucesso) toast.sucesso(sucesso)
        return { ok: true, resultado: r }
      } catch (e) {
        toast.erro(mensagemErro(e))
        return { ok: false, erro: e }
      } finally {
        setSalvando(false)
      }
    },
    [recarregar, toast]
  )

  const criarTransacao = useCallback(
    (dados) => {
      const {
        descricao,
        tipo,
        valor,
        categoriaId,
        data,
        confirmado,
        repeticao, // 'unica' | 'semanal' | 'mensal'
        repeticoes, // quantas ocorrências gerar
        parcelas, // número de parcelas (exclusivo com repeticao)
        valorEhTotal, // no parcelamento, o valor digitado é o total?
      } = dados

      const comum = {
        user_id: userId,
        descricao: descricao.trim(),
        tipo,
        categoria_id: categoriaId || null,
      }

      // --- parcelamento -------------------------------------------------
      if (parcelas > 1) {
        const grupo = novoGrupo()
        const valores = valorEhTotal
          ? dividirParcelas(valor, parcelas)
          : Array.from({ length: parcelas }, () => valor)

        const linhas = valores.map((v, i) => ({
          ...comum,
          descricao: `${comum.descricao} (${i + 1}/${parcelas})`,
          valor: v,
          data: addMeses(data, i),
          confirmado: i === 0 && confirmado,
          parcela_atual: i + 1,
          parcela_total: parcelas,
          parcela_grupo: grupo,
        }))

        return executar(() => supabase.from('transacoes').insert(linhas).then(unwrap), {
          sucesso: `${parcelas} parcelas lançadas.`,
        })
      }

      // --- série recorrente ---------------------------------------------
      if (repeticao && repeticao !== 'unica') {
        const total = Math.max(1, Math.min(Number(repeticoes) || 12, 60))
        // Reaproveita a coluna de agrupamento para permitir excluir a série
        // inteira depois. Antes não havia como: as cópias ficavam soltas.
        const grupo = novoGrupo()

        const linhas = Array.from({ length: total }, (_, i) => ({
          ...comum,
          valor,
          data: dataDaOcorrencia(data, repeticao, i),
          confirmado: i === 0 && confirmado,
          recorrencia: repeticao,
          parcela_grupo: grupo,
        }))

        return executar(() => supabase.from('transacoes').insert(linhas).then(unwrap), {
          sucesso: `${total} lançamentos ${repeticao === 'semanal' ? 'semanais' : 'mensais'} criados.`,
        })
      }

      // --- lançamento único ---------------------------------------------
      return executar(
        () =>
          supabase
            .from('transacoes')
            .insert({ ...comum, valor, data, confirmado })
            .then(unwrap),
        { sucesso: 'Lançamento criado.' }
      )
    },
    [userId, executar]
  )

  const atualizarTransacao = useCallback(
    (id, dados) =>
      executar(
        () =>
          supabase
            .from('transacoes')
            .update({
              descricao: dados.descricao.trim(),
              tipo: dados.tipo,
              valor: dados.valor,
              categoria_id: dados.categoriaId || null,
              data: dados.data,
              confirmado: dados.confirmado,
            })
            .eq('id', id)
            .then(unwrap),
        { sucesso: 'Lançamento atualizado.' }
      ),
    [executar]
  )

  /**
   * `escopo: 'grupo'` apaga a série inteira (parcelamento ou recorrência).
   * Antes o campo de agrupamento era gravado e nunca usado: cancelar uma compra
   * em 12x significava excluir 12 vezes na mão.
   */
  const excluirTransacao = useCallback(
    (transacao, { escopo = 'uma' } = {}) => {
      if (escopo === 'grupo' && transacao.grupo) {
        return executar(
          () =>
            supabase.from('transacoes').delete().eq('parcela_grupo', transacao.grupo).then(unwrap),
          { sucesso: 'Série excluída.' }
        )
      }
      return executar(
        () => supabase.from('transacoes').delete().eq('id', transacao.id).then(unwrap),
        { sucesso: 'Lançamento excluído.' }
      )
    },
    [executar]
  )

  const alternarConfirmado = useCallback(
    (transacao) =>
      executar(
        () =>
          supabase
            .from('transacoes')
            .update({ confirmado: !transacao.confirmado })
            .eq('id', transacao.id)
            .then(unwrap),
        { recarregarDepois: true }
      ),
    [executar]
  )

  /** Uma requisição só. Antes era um `update` por item, em série. */
  const confirmarVarias = useCallback(
    (ids, confirmado = true) =>
      executar(
        () =>
          supabase
            .from('transacoes')
            .update({ confirmado })
            .in('id', [...ids])
            .then(unwrap),
        {
          sucesso: `${ids.length} ${ids.length === 1 ? 'lançamento marcado' : 'lançamentos marcados'} como ${
            confirmado ? 'pago/recebido' : 'pendente'
          }.`,
        }
      ),
    [executar]
  )

  const excluirVarias = useCallback(
    (ids) =>
      executar(
        () =>
          supabase
            .from('transacoes')
            .delete()
            .in('id', [...ids])
            .then(unwrap),
        { sucesso: `${ids.length} ${ids.length === 1 ? 'lançamento excluído' : 'lançamentos excluídos'}.` }
      ),
    [executar]
  )

  /* ------------------------------------------------------------ categorias */

  const salvarCategoria = useCallback(
    (id, dados) => {
      const linha = {
        nome: dados.nome.trim(),
        cor: dados.cor,
        tipo: dados.tipo,
        meta_mensal: dados.metaMensal ?? null,
      }
      if (id) {
        return executar(
          () => supabase.from('categorias').update(linha).eq('id', id).then(unwrap),
          { sucesso: 'Categoria atualizada.' }
        )
      }
      return executar(
        () =>
          supabase
            .from('categorias')
            .insert({ ...linha, user_id: userId })
            .then(unwrap),
        { sucesso: 'Categoria criada.' }
      )
    },
    [userId, executar]
  )

  const excluirCategoria = useCallback(
    (id) =>
      executar(() => supabase.from('categorias').delete().eq('id', id).then(unwrap), {
        sucesso: 'Categoria excluída.',
      }),
    [executar]
  )

  /* ---------------------------------------------------------- configuração */

  const salvarConfig = useCallback(
    async (parcial) => {
      const anterior = config
      const novo = { ...config, ...parcial }
      setConfig(novo) // resposta imediata na interface

      const linha = {}
      if ('saldoInicial' in parcial) linha.saldo_inicial = novo.saldoInicial
      if ('tema' in parcial) linha.tema = novo.tema
      if ('densidade' in parcial) linha.modo_compacto = novo.densidade === 'compacta'
      if (Object.keys(linha).length === 0) return { ok: true }

      try {
        unwrap(await supabase.from('configuracoes').update(linha).eq('user_id', userId))
        return { ok: true }
      } catch (e) {
        setConfig(anterior) // desfaz se o banco recusou
        toast.erro(mensagemErro(e))
        return { ok: false }
      }
    },
    [config, userId, toast]
  )

  /* ------------------------------------------------------------------ saldo */

  const saldoRealizado = useMemo(() => {
    return transacoes.reduce((acc, t) => {
      if (!t.confirmado) return acc
      return t.tipo === 'receita' ? acc + t.valor : acc - t.valor
    }, config.saldoInicial)
  }, [transacoes, config.saldoInicial])

  /** Saldo realizado + o que ainda está pendente. */
  const saldoPrevisto = useMemo(() => {
    return transacoes.reduce((acc, t) => {
      if (t.confirmado) return acc
      return t.tipo === 'receita' ? acc + t.valor : acc - t.valor
    }, saldoRealizado)
  }, [transacoes, saldoRealizado])

  const categoriaPorId = useMemo(() => {
    const mapa = new Map()
    for (const c of categorias) mapa.set(c.id, c)
    return mapa
  }, [categorias])

  const valor = useMemo(
    () => ({
      transacoes,
      categorias,
      categoriaPorId,
      config,
      carregando,
      erro,
      salvando,
      saldoRealizado,
      saldoPrevisto,
      recarregar,
      criarTransacao,
      atualizarTransacao,
      excluirTransacao,
      alternarConfirmado,
      confirmarVarias,
      excluirVarias,
      salvarCategoria,
      excluirCategoria,
      salvarConfig,
    }),
    [
      transacoes,
      categorias,
      categoriaPorId,
      config,
      carregando,
      erro,
      salvando,
      saldoRealizado,
      saldoPrevisto,
      recarregar,
      criarTransacao,
      atualizarTransacao,
      excluirTransacao,
      alternarConfirmado,
      confirmarVarias,
      excluirVarias,
      salvarCategoria,
      excluirCategoria,
      salvarConfig,
    ]
  )

  return <Ctx.Provider value={valor}>{children}</Ctx.Provider>
}

export function useFinance() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useFinance precisa estar dentro de <FinanceProvider>')
  return ctx
}
