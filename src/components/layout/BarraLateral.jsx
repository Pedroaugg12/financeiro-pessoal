import { Icone } from '../Icone'
import { iniciais, moeda } from '../../lib/formato'

export const PAGINAS = [
  { id: 'inicio', rotulo: 'Início', icone: Icone.Painel },
  { id: 'lancamentos', rotulo: 'Lançamentos', icone: Icone.Lista },
  { id: 'categorias', rotulo: 'Categorias', icone: Icone.Etiqueta },
  { id: 'configuracoes', rotulo: 'Configurações', icone: Icone.Engrenagem },
]

export function BarraLateral({
  pagina,
  aoNavegar,
  recolhida,
  aoAlternarRecolhida,
  saldo,
  email,
  aoSair,
  contadorPendentes = 0,
}) {
  return (
    <aside
      className={[
        'flex h-full flex-col border-r border-line bg-surface',
        'transition-[width] duration-150',
        recolhida ? 'w-[52px]' : 'w-52',
      ].join(' ')}
    >
      {/* marca */}
      <div
        className={`flex h-11 shrink-0 items-center gap-2 border-b border-line ${recolhida ? 'justify-center px-0' : 'px-3'}`}
      >
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-base bg-accent text-accent-fg">
          <Icone.Grafico size={13} strokeWidth={2} />
        </span>
        {!recolhida && (
          <span className="truncate text-[13px] font-semibold tracking-tight text-fg">
            Financeiro
          </span>
        )}
      </div>

      {/* navegação */}
      <nav className="flex-1 overflow-y-auto p-2">
        <ul className="flex flex-col gap-0.5">
          {PAGINAS.map((p) => {
            const IconePagina = p.icone
            const ativo = pagina === p.id
            const badge = p.id === 'lancamentos' && contadorPendentes > 0 ? contadorPendentes : null

            return (
              <li key={p.id}>
                <button
                  type="button"
                  onClick={() => aoNavegar(p.id)}
                  title={recolhida ? p.rotulo : undefined}
                  aria-current={ativo ? 'page' : undefined}
                  className={[
                    'relative flex w-full items-center gap-2.5 rounded-base text-[12.5px] font-medium',
                    'transition-colors duration-100',
                    recolhida ? 'h-8 justify-center px-0' : 'h-8 px-2.5',
                    ativo
                      ? 'bg-accent-soft text-accent'
                      : 'text-fg-muted hover:bg-surface-2 hover:text-fg',
                  ].join(' ')}
                >
                  <IconePagina size={15} />
                  {!recolhida && <span className="flex-1 truncate text-left">{p.rotulo}</span>}
                  {badge !== null &&
                    (recolhida ? (
                      <span className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-warn" />
                    ) : (
                      <span className="tnum rounded-[3px] bg-warn-soft px-1 text-[10.5px] font-semibold text-warn">
                        {badge}
                      </span>
                    ))}
                </button>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* saldo sempre à vista */}
      {!recolhida && (
        <div className="mx-2 mb-2 rounded-base border border-line bg-surface-2 px-2.5 py-2">
          <p className="text-[10.5px] font-medium tracking-wide text-fg-muted uppercase">
            Saldo atual
          </p>
          <p
            className={`tnum mt-0.5 text-[14.5px] font-semibold ${saldo < 0 ? 'text-neg' : 'text-fg'}`}
          >
            {moeda(saldo)}
          </p>
        </div>
      )}

      {/* usuário */}
      <div className="border-t border-line p-2">
        <div className={`flex items-center gap-2 ${recolhida ? 'justify-center' : ''}`}>
          <span
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-surface-3 text-[10px] font-semibold text-fg-muted"
            title={email}
          >
            {iniciais(email)}
          </span>
          {!recolhida && (
            <>
              <span className="min-w-0 flex-1 truncate text-[11.5px] text-fg-muted" title={email}>
                {email}
              </span>
              <button
                type="button"
                onClick={aoSair}
                title="Sair da conta"
                className="rounded p-1 text-fg-subtle transition-colors hover:bg-surface-2 hover:text-neg"
              >
                <Icone.Sair size={14} />
              </button>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={aoAlternarRecolhida}
          className={[
            'mt-1.5 hidden w-full items-center gap-2 rounded-base px-2 py-1.5 md:flex',
            'text-[11.5px] text-fg-subtle transition-colors hover:bg-surface-2 hover:text-fg',
            recolhida ? 'justify-center' : '',
          ].join(' ')}
          title={recolhida ? 'Expandir menu' : 'Recolher menu'}
        >
          <Icone.Recolher size={14} />
          {!recolhida && <span>Recolher</span>}
        </button>
      </div>
    </aside>
  )
}
