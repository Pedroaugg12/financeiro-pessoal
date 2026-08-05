/**
 * Harness de conferência visual. NÃO faz parte do sistema — serve só para abrir
 * as telas com dados falsos, sem autenticar e sem tocar no Supabase.
 * Acesse em /preview.html com o `npm run dev` rodando.
 */
import React, { useMemo, useState } from 'react'
import ReactDOM from 'react-dom/client'
import { Sistema } from '../App'
import { AuthCtx } from '../estado/AuthContext'
import { FinanceCtx } from '../estado/FinanceContext'
import { ToastProvider } from '../estado/ToastContext'
import { addMeses, hoje, navegarMes } from '../lib/datas'
import '../index.css'

const CATEGORIAS = [
  { id: 'c1', nome: 'Moradia', cor: '#2980b9', tipo: 'despesa', metaMensal: 2500 },
  { id: 'c2', nome: 'Alimentação', cor: '#e67e22', tipo: 'despesa', metaMensal: 1200 },
  { id: 'c3', nome: 'Transporte', cor: '#7b52ab', tipo: 'despesa', metaMensal: 600 },
  { id: 'c4', nome: 'Saúde', cor: '#149c8e', tipo: 'despesa', metaMensal: null },
  { id: 'c5', nome: 'Lazer', cor: '#b0417a', tipo: 'despesa', metaMensal: 400 },
  { id: 'c6', nome: 'Salário', cor: '#2e8b57', tipo: 'receita', metaMensal: null },
  { id: 'c7', nome: 'Freelance', cor: '#d4a017', tipo: 'receita', metaMensal: null },
]

function gerar() {
  const lista = []
  let n = 0
  const add = (t) => lista.push({ id: `t${++n}`, ...t })

  for (let m = 5; m >= 0; m--) {
    const base = addMeses(`${hoje().slice(0, 8)}01`, -m)
    const mes = base.slice(0, 7)
    const passado = m > 0

    add({
      descricao: 'Salário',
      tipo: 'receita',
      valor: 7400,
      categoriaId: 'c6',
      data: `${mes}-05`,
      confirmado: passado,
      recorrencia: 'mensal',
      parcelaAtual: null,
      parcelaTotal: null,
      grupo: 'g-sal',
    })
    add({
      descricao: 'Aluguel',
      tipo: 'despesa',
      valor: 2350,
      categoriaId: 'c1',
      data: `${mes}-10`,
      confirmado: passado,
      recorrencia: 'mensal',
      parcelaAtual: null,
      parcelaTotal: null,
      grupo: 'g-alu',
    })
    add({
      descricao: 'Supermercado',
      tipo: 'despesa',
      valor: 890 + m * 40,
      categoriaId: 'c2',
      data: `${mes}-12`,
      confirmado: passado,
      recorrencia: null,
      parcelaAtual: null,
      parcelaTotal: null,
      grupo: null,
    })
    add({
      descricao: 'Combustível',
      tipo: 'despesa',
      valor: 420,
      categoriaId: 'c3',
      data: `${mes}-18`,
      confirmado: passado,
      recorrencia: null,
      parcelaAtual: null,
      parcelaTotal: null,
      grupo: null,
    })
    add({
      descricao: 'Plano de saúde',
      tipo: 'despesa',
      valor: 512.9,
      categoriaId: 'c4',
      data: `${mes}-20`,
      confirmado: passado,
      recorrencia: 'mensal',
      parcelaAtual: null,
      parcelaTotal: null,
      grupo: 'g-sau',
    })
  }

  const mesAtual = hoje().slice(0, 7)
  const anterior = navegarMes(mesAtual, -1)

  // parcelamento em andamento
  for (let i = 0; i < 6; i++) {
    const data = addMeses(`${anterior}-08`, i)
    add({
      descricao: `Notebook (${i + 1}/6)`,
      tipo: 'despesa',
      valor: 641.5,
      categoriaId: 'c5',
      data,
      confirmado: i < 2,
      recorrencia: null,
      parcelaAtual: i + 1,
      parcelaTotal: 6,
      grupo: 'g-note',
    })
  }

  // conta atrasada
  add({
    descricao: 'Conta de luz',
    tipo: 'despesa',
    valor: 287.44,
    categoriaId: 'c1',
    data: `${mesAtual}-01`,
    confirmado: false,
    recorrencia: null,
    parcelaAtual: null,
    parcelaTotal: null,
    grupo: null,
  })
  // vence logo
  add({
    descricao: 'Internet fibra',
    tipo: 'despesa',
    valor: 129.9,
    categoriaId: 'c1',
    data: `${mesAtual}-07`,
    confirmado: false,
    recorrencia: null,
    parcelaAtual: null,
    parcelaTotal: null,
    grupo: null,
  })
  add({
    descricao: 'Projeto freelance — landing page',
    tipo: 'receita',
    valor: 3200,
    categoriaId: 'c7',
    data: `${mesAtual}-22`,
    confirmado: false,
    recorrencia: null,
    parcelaAtual: null,
    parcelaTotal: null,
    grupo: null,
  })
  add({
    descricao: 'Jantar aniversário',
    tipo: 'despesa',
    valor: 340,
    categoriaId: 'c5',
    data: `${mesAtual}-15`,
    confirmado: false,
    recorrencia: null,
    parcelaAtual: null,
    parcelaTotal: null,
    grupo: null,
  })
  add({
    descricao: 'Farmácia',
    tipo: 'despesa',
    valor: 96.7,
    categoriaId: null,
    data: `${mesAtual}-03`,
    confirmado: true,
    recorrencia: null,
    parcelaAtual: null,
    parcelaTotal: null,
    grupo: null,
  })

  return lista
}

const TRANSACOES = gerar()

function Preview() {
  const [config, setConfig] = useState({
    saldoInicial: 4200,
    tema: 'dark',
    densidade: 'confortavel',
  })

  const auth = useMemo(
    () => ({
      usuario: { id: 'u1', email: 'pedro@exemplo.com', user_metadata: { nome: 'Pedro' } },
      carregando: false,
      sair: () => alert('sair (preview)'),
    }),
    []
  )

  const financeiro = useMemo(() => {
    const categoriaPorId = new Map(CATEGORIAS.map((c) => [c.id, c]))

    const saldoRealizado = TRANSACOES.reduce(
      (a, t) => (t.confirmado ? (t.tipo === 'receita' ? a + t.valor : a - t.valor) : a),
      config.saldoInicial
    )
    const saldoPrevisto = TRANSACOES.reduce(
      (a, t) => (!t.confirmado ? (t.tipo === 'receita' ? a + t.valor : a - t.valor) : a),
      saldoRealizado
    )

    const noop = async () => ({ ok: true })

    return {
      transacoes: TRANSACOES,
      categorias: CATEGORIAS,
      categoriaPorId,
      config,
      carregando: false,
      erro: null,
      salvando: false,
      saldoRealizado,
      saldoPrevisto,
      recarregar: noop,
      criarTransacao: noop,
      atualizarTransacao: noop,
      excluirTransacao: noop,
      alternarConfirmado: noop,
      confirmarVarias: noop,
      excluirVarias: noop,
      salvarCategoria: noop,
      excluirCategoria: noop,
      salvarConfig: async (p) => {
        setConfig((c) => ({ ...c, ...p }))
        return { ok: true }
      },
    }
  }, [config])

  return (
    <ToastProvider>
      <AuthCtx.Provider value={auth}>
        <FinanceCtx.Provider value={financeiro}>
          <Sistema />
        </FinanceCtx.Provider>
      </AuthCtx.Provider>
    </ToastProvider>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Preview />
  </React.StrictMode>
)
