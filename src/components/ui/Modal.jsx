import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { Icone } from '../Icone'
import { Botao } from './Botao'

const LARGURAS = {
  sm: 'max-w-[380px]',
  md: 'max-w-[520px]',
  lg: 'max-w-[720px]',
}

export function Modal({ aberto, onFechar, titulo, descricao, largura = 'md', rodape, children }) {
  const caixaRef = useRef(null)

  useEffect(() => {
    if (!aberto) return

    const aoTeclar = (e) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        onFechar()
      }
    }

    // Trava o scroll do fundo sem deixar a página "pular" quando a barra some.
    const larguraBarra = window.innerWidth - document.documentElement.clientWidth
    const overflowAnterior = document.body.style.overflow
    const paddingAnterior = document.body.style.paddingRight
    document.body.style.overflow = 'hidden'
    if (larguraBarra > 0) document.body.style.paddingRight = `${larguraBarra}px`

    document.addEventListener('keydown', aoTeclar)

    // Foca o primeiro campo, para dar para digitar sem tocar no mouse.
    const t = setTimeout(() => {
      const alvo = caixaRef.current?.querySelector(
        'input:not([type=hidden]):not([disabled]), select, textarea'
      )
      alvo?.focus()
    }, 30)

    return () => {
      document.removeEventListener('keydown', aoTeclar)
      document.body.style.overflow = overflowAnterior
      document.body.style.paddingRight = paddingAnterior
      clearTimeout(t)
    }
  }, [aberto, onFechar])

  if (!aberto) return null

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/45 p-4 pt-[8vh] pb-8"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onFechar()
      }}
    >
      <div
        ref={caixaRef}
        role="dialog"
        aria-modal="true"
        aria-label={titulo}
        className={`anim-pop-in pane w-full shadow-pop ${LARGURAS[largura]}`}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <header className="flex items-start justify-between gap-4 border-b border-line px-4 py-3">
          <div className="min-w-0">
            <h2 className="text-[13.5px] font-semibold text-fg">{titulo}</h2>
            {descricao && <p className="mt-0.5 text-[11.5px] text-fg-muted">{descricao}</p>}
          </div>
          <button
            type="button"
            onClick={onFechar}
            className="-mt-0.5 rounded p-1 text-fg-subtle transition-colors hover:bg-surface-2 hover:text-fg"
            aria-label="Fechar"
          >
            <Icone.X size={14} />
          </button>
        </header>

        <div className="px-4 py-3.5">{children}</div>

        {rodape && (
          <footer className="flex items-center justify-end gap-2 border-t border-line bg-surface-2/60 px-4 py-2.5">
            {rodape}
          </footer>
        )}
      </div>
    </div>,
    document.body
  )
}

/**
 * Substitui o `window.confirm()`. Além de feio, o confirm nativo trava a aba
 * inteira e não deixa explicar as opções — o que importa aqui, porque excluir
 * uma parcela e excluir as 12 são coisas bem diferentes.
 */
export function Confirmacao({
  aberto,
  onFechar,
  onConfirmar,
  titulo,
  mensagem,
  textoConfirmar = 'Confirmar',
  destrutivo = false,
  processando = false,
  extra,
}) {
  return (
    <Modal
      aberto={aberto}
      onFechar={onFechar}
      titulo={titulo}
      largura="sm"
      rodape={
        <>
          <Botao onClick={onFechar} disabled={processando}>
            Cancelar
          </Botao>
          <Botao
            variante={destrutivo ? 'perigoSolido' : 'primario'}
            onClick={onConfirmar}
            carregando={processando}
          >
            {textoConfirmar}
          </Botao>
        </>
      }
    >
      <p className="text-[12.5px] leading-relaxed text-fg-muted">{mensagem}</p>
      {extra && <div className="mt-3">{extra}</div>}
    </Modal>
  )
}
