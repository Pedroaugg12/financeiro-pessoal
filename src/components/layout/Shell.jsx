import { useEffect, useState } from 'react'
import { BarraLateral, PAGINAS } from './BarraLateral'
import { SeletorMes } from './SeletorMes'
import { Icone } from '../Icone'
import { Botao } from '../ui/Botao'

const CHAVE_RECOLHIDA = 'fin.menuRecolhido'

export function Shell({
  pagina,
  aoNavegar,
  mes,
  aoMudarMes,
  mostrarSeletorMes = true,
  saldo,
  email,
  aoSair,
  contadorPendentes,
  tema,
  aoAlternarTema,
  salvando,
  acoes,
  children,
}) {
  const [recolhida, setRecolhida] = useState(
    () => localStorage.getItem(CHAVE_RECOLHIDA) === '1'
  )
  const [menuMobile, setMenuMobile] = useState(false)

  useEffect(() => {
    localStorage.setItem(CHAVE_RECOLHIDA, recolhida ? '1' : '0')
  }, [recolhida])

  // Fecha a gaveta ao trocar de página no celular
  useEffect(() => {
    setMenuMobile(false)
  }, [pagina])

  const paginaAtual = PAGINAS.find((p) => p.id === pagina)

  const barra = (
    <BarraLateral
      pagina={pagina}
      aoNavegar={aoNavegar}
      recolhida={recolhida}
      aoAlternarRecolhida={() => setRecolhida((v) => !v)}
      saldo={saldo}
      email={email}
      aoSair={aoSair}
      contadorPendentes={contadorPendentes}
    />
  )

  return (
    <div className="flex h-dvh overflow-hidden bg-bg">
      {/* menu fixo — desktop */}
      <div className="hidden shrink-0 md:block">{barra}</div>

      {/* menu em gaveta — celular */}
      {menuMobile && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="absolute inset-0 bg-black/45"
            onClick={() => setMenuMobile(false)}
            aria-hidden="true"
          />
          <div className="anim-slide-in relative">{barra}</div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        {/* topo */}
        <header className="flex h-11 shrink-0 items-center gap-2 border-b border-line bg-surface px-3">
          <button
            type="button"
            onClick={() => setMenuMobile(true)}
            className="rounded-base p-1.5 text-fg-muted transition-colors hover:bg-surface-2 hover:text-fg md:hidden"
            aria-label="Abrir menu"
          >
            <Icone.Menu size={16} />
          </button>

          <h1 className="truncate text-[13px] font-semibold text-fg">{paginaAtual?.rotulo}</h1>

          {/* indicador de gravação — este de fato aparece só quando está salvando */}
          {salvando && (
            <span className="flex items-center gap-1.5 text-[11.5px] text-fg-subtle">
              <Icone.Carregando size={12} />
              <span className="hidden sm:inline">Salvando</span>
            </span>
          )}

          <div className="ml-auto flex items-center gap-1.5">
            {mostrarSeletorMes && (
              <div className="hidden sm:block">
                <SeletorMes mes={mes} aoMudar={aoMudarMes} />
              </div>
            )}

            {acoes}

            <button
              type="button"
              onClick={aoAlternarTema}
              className="rounded-base p-1.5 text-fg-muted transition-colors hover:bg-surface-2 hover:text-fg"
              title={tema === 'dark' ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
            >
              {tema === 'dark' ? <Icone.Sol size={15} /> : <Icone.Lua size={15} />}
            </button>
          </div>
        </header>

        {/* seletor de mês no celular, onde não cabe no topo */}
        {mostrarSeletorMes && (
          <div className="flex shrink-0 items-center justify-center border-b border-line bg-surface px-3 py-1.5 sm:hidden">
            <SeletorMes mes={mes} aoMudar={aoMudarMes} />
          </div>
        )}

        <main className="min-h-0 flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-[1600px] p-3 md:p-4">{children}</div>
        </main>
      </div>
    </div>
  )
}

/** Botão de ação principal do topo. */
export function AcaoPrincipal({ onClick, children = 'Novo lançamento' }) {
  return (
    <Botao variante="primario" onClick={onClick} iconeEsq={<Icone.Mais size={13} />}>
      <span className="hidden sm:inline">{children}</span>
      <span className="sm:hidden">Novo</span>
    </Botao>
  )
}
