import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AuthProvider, useAuth } from './estado/AuthContext'
import { FinanceProvider, useFinance } from './estado/FinanceContext'
import { ToastProvider } from './estado/ToastContext'
import { Shell, AcaoPrincipal } from './components/layout/Shell'
import { FormularioTransacao } from './components/FormularioTransacao'
import { Login } from './paginas/Login'
import { Inicio } from './paginas/Inicio'
import { Lancamentos } from './paginas/Lancamentos'
import { Categorias } from './paginas/Categorias'
import { Configuracoes } from './paginas/Configuracoes'
import { Icone } from './components/Icone'
import { diasAte, hoje, mesAtual } from './lib/datas'

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <FinanceProvider>
          <Raiz />
        </FinanceProvider>
      </AuthProvider>
    </ToastProvider>
  )
}

function Raiz() {
  const { usuario, carregando: carregandoAuth } = useAuth()

  if (carregandoAuth) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-bg text-fg-muted">
        <Icone.Carregando size={18} />
      </div>
    )
  }

  if (!usuario) return <Login />

  return <Sistema />
}

export function Sistema() {
  const { usuario, sair } = useAuth()
  const { config, salvarConfig, saldoRealizado, transacoes, salvando } = useFinance()

  const [pagina, setPagina] = useState('inicio')
  const [mes, setMes] = useState(mesAtual())
  const [filtroExterno, setFiltroExterno] = useState(null)
  const nonce = useRef(0)

  // formulário de lançamento
  const [formAberto, setFormAberto] = useState(false)
  const [emEdicao, setEmEdicao] = useState(null)
  const [valoresIniciais, setValoresIniciais] = useState(undefined)

  /* ------------------------------------------------------------ aparência */

  // O tema fica no banco (segue a conta em qualquer dispositivo), mas também
  // é espelhado no localStorage: o script do index.html lê de lá para pintar a
  // tela certa antes do React montar, evitando o flash branco no tema escuro.
  useEffect(() => {
    document.documentElement.classList.toggle('dark', config.tema === 'dark')
    localStorage.setItem('fin.tema', config.tema)
  }, [config.tema])

  useEffect(() => {
    document.documentElement.classList.toggle('density-compact', config.densidade === 'compacta')
    localStorage.setItem('fin.densidade', config.densidade)
  }, [config.densidade])

  /* -------------------------------------------------------------- ações */

  /** Ao lançar em outro mês, já sugere uma data daquele mês em vez de hoje. */
  const dataSugerida = useCallback(() => {
    return mes === mesAtual() ? hoje() : `${mes}-01`
  }, [mes])

  const abrirNovo = useCallback(
    (tipo = 'despesa') => {
      setEmEdicao(null)
      setValoresIniciais({ tipo, data: dataSugerida() })
      setFormAberto(true)
    },
    [dataSugerida]
  )

  const abrirEdicao = useCallback((transacao) => {
    setEmEdicao(transacao)
    setValoresIniciais(undefined)
    setFormAberto(true)
  }, [])

  const duplicar = useCallback((transacao) => {
    setEmEdicao(null)
    setValoresIniciais({
      tipo: transacao.tipo,
      descricao: transacao.descricao.replace(/\s*\(\d+\/\d+\)$/, ''),
      valor: String(transacao.valor).replace('.', ','),
      categoriaId: transacao.categoriaId ?? '',
      data: hoje(),
      confirmado: false,
    })
    setFormAberto(true)
  }, [])

  const verLancamentos = useCallback((filtros = {}) => {
    setFiltroExterno({ ...filtros, nonce: ++nonce.current })
    setPagina('lancamentos')
  }, [])

  /* ------------------------------------------------------------- atalhos */

  useEffect(() => {
    function aoTeclar(e) {
      if (formAberto || e.metaKey || e.ctrlKey || e.altKey) return

      const alvo = e.target
      const digitando =
        alvo instanceof HTMLElement &&
        (alvo.tagName === 'INPUT' ||
          alvo.tagName === 'TEXTAREA' ||
          alvo.tagName === 'SELECT' ||
          alvo.isContentEditable)
      if (digitando) return

      if (e.key === 'n' || e.key === 'N') {
        e.preventDefault()
        abrirNovo('despesa')
      }
    }

    window.addEventListener('keydown', aoTeclar)
    return () => window.removeEventListener('keydown', aoTeclar)
  }, [formAberto, abrirNovo])

  /* --------------------------------------------------------------- dados */

  // Contas vencidas ou vencendo em até 3 dias — vira o marcador no menu.
  const pendentesUrgentes = useMemo(
    () =>
      transacoes.filter((t) => !t.confirmado && t.tipo === 'despesa' && diasAte(t.data) <= 3)
        .length,
    [transacoes]
  )

  const conteudo = {
    inicio: (
      <Inicio
        mes={mes}
        aoAbrirNovo={abrirNovo}
        aoEditar={abrirEdicao}
        aoVerLancamentos={verLancamentos}
      />
    ),
    lancamentos: (
      <Lancamentos
        mes={mes}
        aoAbrirNovo={abrirNovo}
        aoEditar={abrirEdicao}
        aoDuplicar={duplicar}
        filtroExterno={filtroExterno}
      />
    ),
    categorias: <Categorias mes={mes} aoVerLancamentos={verLancamentos} />,
    configuracoes: <Configuracoes />,
  }[pagina]

  return (
    <>
      <Shell
        pagina={pagina}
        aoNavegar={setPagina}
        mes={mes}
        aoMudarMes={setMes}
        mostrarSeletorMes={pagina !== 'configuracoes'}
        saldo={saldoRealizado}
        email={usuario?.email ?? ''}
        aoSair={sair}
        contadorPendentes={pendentesUrgentes}
        tema={config.tema}
        aoAlternarTema={() => salvarConfig({ tema: config.tema === 'dark' ? 'light' : 'dark' })}
        salvando={salvando}
        acoes={pagina !== 'configuracoes' && <AcaoPrincipal onClick={() => abrirNovo('despesa')} />}
      >
        {conteudo}
      </Shell>

      <FormularioTransacao
        aberto={formAberto}
        onFechar={() => setFormAberto(false)}
        transacao={emEdicao}
        valoresIniciais={valoresIniciais}
      />
    </>
  )
}
