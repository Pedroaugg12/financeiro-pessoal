import { useId } from 'react'
import { Icone } from '../Icone'

const BASE_CONTROLE =
  'w-full rounded-base border border-line bg-surface text-fg placeholder:text-fg-subtle ' +
  'transition-colors outline-none hover:border-line-strong ' +
  'focus:border-accent focus:ring-2 focus:ring-accent/25 ' +
  'disabled:cursor-not-allowed disabled:bg-surface-2 disabled:text-fg-subtle'

const ALTURA = 'h-8 px-2.5 text-[12.5px]'

export function Campo({ rotulo, dica, erro, obrigatorio, children, className = '' }) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {rotulo && (
        <label className="text-[11.5px] font-medium text-fg-muted">
          {rotulo}
          {obrigatorio && <span className="ml-0.5 text-neg">*</span>}
        </label>
      )}
      {children}
      {erro ? (
        <p className="flex items-center gap-1 text-[11.5px] text-neg">
          <Icone.Alerta size={11} />
          {erro}
        </p>
      ) : dica ? (
        <p className="text-[11.5px] text-fg-subtle">{dica}</p>
      ) : null}
    </div>
  )
}

export function Entrada({ prefixo, sufixo, erro, className = '', ...props }) {
  if (!prefixo && !sufixo) {
    return (
      <input
        className={`${BASE_CONTROLE} ${ALTURA} ${erro ? 'border-neg focus:border-neg focus:ring-neg/25' : ''} ${className}`}
        {...props}
      />
    )
  }

  return (
    <div
      className={[
        'flex items-center rounded-base border border-line bg-surface transition-colors',
        'focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/25',
        erro ? 'border-neg focus-within:border-neg focus-within:ring-neg/25' : '',
        className,
      ].join(' ')}
    >
      {prefixo && (
        <span className="pl-2.5 text-[12px] text-fg-subtle select-none">{prefixo}</span>
      )}
      <input
        className="h-8 min-w-0 flex-1 bg-transparent px-2 text-[12.5px] text-fg outline-none placeholder:text-fg-subtle"
        {...props}
      />
      {sufixo && <span className="pr-2.5 text-[12px] text-fg-subtle select-none">{sufixo}</span>}
    </div>
  )
}

/** Campo de dinheiro: alinhado à direita, com "R$" fixo e fonte tabular. */
export function EntradaValor({ erro, className = '', ...props }) {
  return (
    <Entrada
      inputMode="decimal"
      prefixo="R$"
      placeholder="0,00"
      erro={erro}
      className={className}
      {...props}
      style={{ ...props.style }}
    />
  )
}

export function Selecao({ erro, className = '', children, ...props }) {
  return (
    <div className="relative">
      <select
        className={[
          BASE_CONTROLE,
          ALTURA,
          'cursor-pointer appearance-none pr-7',
          erro ? 'border-neg focus:border-neg focus:ring-neg/25' : '',
          className,
        ].join(' ')}
        {...props}
      >
        {children}
      </select>
      <span className="pointer-events-none absolute top-1/2 right-2 -translate-y-1/2 text-fg-subtle">
        <svg width="9" height="9" viewBox="0 0 12 12" fill="none" aria-hidden="true">
          <path
            d="M3 4.5L6 7.5L9 4.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    </div>
  )
}

export function BuscaRapida({ valor, onChange, placeholder = 'Buscar...', className = '' }) {
  return (
    <div className={`relative ${className}`}>
      <span className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-fg-subtle">
        <Icone.Busca size={13} />
      </span>
      <input
        type="search"
        value={valor}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`${BASE_CONTROLE} h-8 pr-7 pl-[30px] text-[12.5px]`}
      />
      {valor && (
        <button
          type="button"
          onClick={() => onChange('')}
          className="absolute top-1/2 right-1.5 -translate-y-1/2 rounded p-0.5 text-fg-subtle hover:bg-surface-2 hover:text-fg"
          aria-label="Limpar busca"
        >
          <Icone.X size={12} />
        </button>
      )}
    </div>
  )
}

export function Caixa({ marcado, onChange, indeterminado = false, rotulo, className = '' }) {
  const id = useId()
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <input
        id={id}
        type="checkbox"
        checked={!!marcado}
        ref={(el) => el && (el.indeterminate = indeterminado && !marcado)}
        onChange={(e) => onChange(e.target.checked)}
        className="h-3.5 w-3.5 cursor-pointer rounded-[3px] border-line-strong accent-accent"
      />
      {rotulo && (
        <label htmlFor={id} className="cursor-pointer text-[12.5px] text-fg select-none">
          {rotulo}
        </label>
      )}
    </span>
  )
}

export function Interruptor({ ligado, onChange, rotulo, descricao }) {
  const id = useId()
  return (
    <div className="flex items-center justify-between gap-4 py-1.5">
      <div className="min-w-0">
        <label htmlFor={id} className="cursor-pointer text-[12.5px] font-medium text-fg">
          {rotulo}
        </label>
        {descricao && <p className="mt-0.5 text-[11.5px] text-fg-muted">{descricao}</p>}
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={ligado}
        onClick={() => onChange(!ligado)}
        className={[
          'relative h-[18px] w-8 shrink-0 rounded-full transition-colors',
          ligado ? 'bg-accent' : 'bg-line-strong',
        ].join(' ')}
      >
        <span
          className={[
            'absolute top-0.5 h-3.5 w-3.5 rounded-full bg-white shadow-sm transition-transform',
            ligado ? 'translate-x-4' : 'translate-x-0.5',
          ].join(' ')}
        />
      </button>
    </div>
  )
}
