import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'
import { Icone } from '../components/Icone'

const Ctx = createContext(null)

export function ToastProvider({ children }) {
  const [itens, setItens] = useState([])
  // Date.now() repete quando dois toasts saem no mesmo milissegundo, e chaves
  // duplicadas fazem o React embaralhar os elementos. Contador não repete.
  const seq = useRef(0)

  const remover = useCallback((id) => {
    setItens((lista) => lista.filter((t) => t.id !== id))
  }, [])

  const push = useCallback(
    (mensagem, tipo = 'info', duracao = 3500) => {
      const id = ++seq.current
      setItens((lista) => [...lista, { id, mensagem, tipo }])
      if (duracao > 0) setTimeout(() => remover(id), duracao)
      return id
    },
    [remover]
  )

  const api = useMemo(
    () => ({
      sucesso: (m) => push(m, 'sucesso'),
      erro: (m) => push(m, 'erro', 6000), // erro fica mais tempo: dá tempo de ler
      info: (m) => push(m, 'info'),
      remover,
    }),
    [push, remover]
  )

  return (
    <Ctx.Provider value={api}>
      {children}
      <Palco itens={itens} onFechar={remover} />
    </Ctx.Provider>
  )
}

export function useToast() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useToast precisa estar dentro de <ToastProvider>')
  return ctx
}

const ESTILO = {
  sucesso: {
    barra: 'bg-pos',
    icone: <Icone.Check size={14} />,
    cor: 'text-pos',
  },
  erro: {
    barra: 'bg-neg',
    icone: <Icone.Alerta size={14} />,
    cor: 'text-neg',
  },
  info: {
    barra: 'bg-accent',
    icone: <Icone.Info size={14} />,
    cor: 'text-accent',
  },
}

function Palco({ itens, onFechar }) {
  if (itens.length === 0) return null

  return (
    <div
      className="pointer-events-none fixed right-4 bottom-4 z-[100] flex w-[min(22rem,calc(100vw-2rem))] flex-col gap-2"
      role="status"
      aria-live="polite"
    >
      {itens.map((t) => {
        const e = ESTILO[t.tipo] ?? ESTILO.info
        return (
          <div
            key={t.id}
            className="anim-slide-in pointer-events-auto flex items-start gap-2.5 overflow-hidden rounded-base border border-line bg-surface pr-2 shadow-pop"
          >
            <div className={`w-0.5 self-stretch ${e.barra}`} />
            <div className={`pt-2.5 ${e.cor}`}>{e.icone}</div>
            <p className="flex-1 py-2.5 text-[12.5px] leading-snug text-fg">{t.mensagem}</p>
            <button
              type="button"
              onClick={() => onFechar(t.id)}
              className="mt-2 rounded p-1 text-fg-subtle transition-colors hover:bg-surface-2 hover:text-fg"
              aria-label="Fechar aviso"
            >
              <Icone.X size={13} />
            </button>
          </div>
        )
      })}
    </div>
  )
}
