import { Icone } from '../Icone'

const VARIANTES = {
  primario:
    'bg-accent text-accent-fg border border-transparent hover:bg-accent-hover disabled:hover:bg-accent',
  secundario:
    'bg-surface text-fg border border-line hover:bg-surface-2 hover:border-line-strong disabled:hover:bg-surface',
  fantasma:
    'bg-transparent text-fg-muted border border-transparent hover:bg-surface-2 hover:text-fg disabled:hover:bg-transparent',
  perigo:
    'bg-transparent text-neg border border-line hover:bg-neg-soft hover:border-neg/40 disabled:hover:bg-transparent',
  perigoSolido: 'bg-neg text-white border border-transparent hover:brightness-110',
}

const TAMANHOS = {
  sm: 'h-7 px-2 text-[12px] gap-1.5 rounded-base',
  md: 'h-8 px-3 text-[12.5px] gap-1.5 rounded-base',
  lg: 'h-9 px-4 text-[13px] gap-2 rounded-base',
  icone: 'h-7 w-7 justify-center rounded-base',
  iconeSm: 'h-6 w-6 justify-center rounded',
}

export function Botao({
  variante = 'secundario',
  tamanho = 'md',
  carregando = false,
  iconeEsq,
  iconeDir,
  className = '',
  children,
  disabled,
  type = 'button',
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled || carregando}
      className={[
        'inline-flex shrink-0 select-none items-center font-medium whitespace-nowrap',
        'transition-colors duration-100 outline-none',
        'disabled:cursor-not-allowed disabled:opacity-50',
        VARIANTES[variante],
        TAMANHOS[tamanho],
        className,
      ].join(' ')}
      {...props}
    >
      {carregando ? <Icone.Carregando size={13} /> : iconeEsq}
      {children}
      {!carregando && iconeDir}
    </button>
  )
}

/** Grupo de botões colados, tipo segmentado. Usado na navegação de mês. */
export function GrupoBotoes({ children, className = '' }) {
  return (
    <div
      className={`inline-flex items-center overflow-hidden rounded-base border border-line bg-surface [&>*]:rounded-none [&>*]:border-0 [&>*+*]:border-l [&>*+*]:border-line ${className}`}
    >
      {children}
    </div>
  )
}

/** Alternador de opções mutuamente exclusivas (Todos / Receitas / Despesas). */
export function Segmentado({ valor, onChange, opcoes, className = '' }) {
  return (
    <div
      role="tablist"
      className={`inline-flex items-center gap-0.5 rounded-base border border-line bg-surface-2 p-0.5 ${className}`}
    >
      {opcoes.map((o) => {
        const ativo = o.valor === valor
        return (
          <button
            key={o.valor}
            role="tab"
            aria-selected={ativo}
            type="button"
            onClick={() => onChange(o.valor)}
            className={[
              'h-6 rounded-[3px] px-2.5 text-[12px] font-medium transition-colors',
              ativo
                ? 'bg-surface text-fg shadow-pane'
                : 'text-fg-muted hover:text-fg',
            ].join(' ')}
          >
            {o.rotulo}
          </button>
        )
      })}
    </div>
  )
}
