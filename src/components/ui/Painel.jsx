export function Painel({ children, className = '', semPadding = false }) {
  return (
    <section className={`pane shadow-pane ${semPadding ? '' : 'p-[var(--pane-p)]'} ${className}`}>
      {children}
    </section>
  )
}

export function PainelCabecalho({ titulo, descricao, acoes, className = '' }) {
  return (
    <header
      className={`flex items-center justify-between gap-3 border-b border-line px-[var(--pane-p)] py-2.5 ${className}`}
    >
      <div className="min-w-0">
        <h2 className="truncate text-[12.5px] font-semibold text-fg">{titulo}</h2>
        {descricao && <p className="mt-0.5 truncate text-[11.5px] text-fg-muted">{descricao}</p>}
      </div>
      {acoes && <div className="flex shrink-0 items-center gap-1.5">{acoes}</div>}
    </header>
  )
}

/**
 * Indicador numérico. Sem card gigante, sem gradiente: rótulo pequeno em cima,
 * número grande embaixo, borda fina. É o formato que cabe 5 lado a lado.
 */
export function Indicador({
  rotulo,
  valor,
  detalhe,
  cor = 'neutro',
  icone,
  onClick,
  className = '',
}) {
  const CORES = {
    neutro: 'text-fg',
    positivo: 'text-pos',
    negativo: 'text-neg',
    alerta: 'text-warn',
    acento: 'text-accent',
  }

  const Tag = onClick ? 'button' : 'div'

  return (
    <Tag
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={[
        'pane shadow-pane flex min-w-0 flex-col gap-1 px-3 py-2.5 text-left',
        onClick ? 'cursor-pointer transition-colors hover:border-line-strong hover:bg-surface-2' : '',
        className,
      ].join(' ')}
    >
      <span className="flex items-center gap-1.5 text-[11px] font-medium tracking-wide text-fg-muted uppercase">
        {icone}
        <span className="truncate">{rotulo}</span>
      </span>
      <span className={`tnum truncate text-[19px] leading-tight font-semibold ${CORES[cor]}`}>
        {valor}
      </span>
      {detalhe && <span className="truncate text-[11.5px] text-fg-subtle">{detalhe}</span>}
    </Tag>
  )
}
