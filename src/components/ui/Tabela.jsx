import { moeda, numero } from '../../lib/formato'

export function Tabela({ children, className = '' }) {
  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="w-full border-collapse text-left">{children}</table>
    </div>
  )
}

export function Cabecalho({ children }) {
  return (
    <thead className="th-sticky border-b border-line">
      <tr>{children}</tr>
    </thead>
  )
}

/**
 * Coluna de cabeçalho. Quando `campo` é informado, vira botão de ordenação.
 * A seta só aparece na coluna ativa — indicador em toda coluna vira poluição.
 */
export function Col({
  children,
  campo,
  ordem,
  onOrdenar,
  alinhar = 'left',
  largura,
  className = '',
}) {
  const ativo = campo && ordem?.campo === campo
  const alinhamento =
    alinhar === 'right' ? 'text-right' : alinhar === 'center' ? 'text-center' : 'text-left'

  const conteudo = (
    <>
      {children}
      {ativo && (
        <span className="ml-1 inline-block text-[9px] text-fg-muted" aria-hidden="true">
          {ordem.direcao === 'asc' ? '▲' : '▼'}
        </span>
      )}
    </>
  )

  return (
    <th
      scope="col"
      style={largura ? { width: largura } : undefined}
      className={[
        'border-b border-line px-2.5 py-1.5 text-[11px] font-semibold tracking-wide',
        'text-fg-muted uppercase select-none',
        alinhamento,
        className,
      ].join(' ')}
      aria-sort={ativo ? (ordem.direcao === 'asc' ? 'ascending' : 'descending') : undefined}
    >
      {campo ? (
        <button
          type="button"
          onClick={() => onOrdenar(campo)}
          className={[
            'inline-flex w-full items-center gap-0.5 transition-colors hover:text-fg',
            alinhar === 'right' ? 'justify-end' : alinhar === 'center' ? 'justify-center' : '',
            ativo ? 'text-fg' : '',
          ].join(' ')}
        >
          {conteudo}
        </button>
      ) : (
        conteudo
      )}
    </th>
  )
}

export function Linha({ children, selecionada = false, atencao = false, className = '', ...props }) {
  return (
    <tr
      className={[
        'group border-b border-line transition-colors last:border-b-0',
        selecionada ? 'bg-accent-soft' : atencao ? 'bg-warn-soft/40' : 'hover:bg-surface-2',
        className,
      ].join(' ')}
      {...props}
    >
      {children}
    </tr>
  )
}

export function Celula({ children, alinhar = 'left', className = '', ...props }) {
  const alinhamento =
    alinhar === 'right' ? 'text-right' : alinhar === 'center' ? 'text-center' : 'text-left'
  return (
    <td
      className={`h-[var(--row-h)] px-2.5 py-[var(--cell-py)] align-middle text-[12.5px] ${alinhamento} ${className}`}
      {...props}
    >
      {children}
    </td>
  )
}

export function Rodape({ children }) {
  return (
    <tfoot className="border-t-2 border-line-strong bg-surface-2 font-medium">
      <tr>{children}</tr>
    </tfoot>
  )
}

/**
 * Dinheiro com sinal e cor semântica.
 * `comSimbolo=false` numa tabela: repetir "R$" em 40 linhas é ruído puro,
 * o cabeçalho já diz que a coluna é de valor.
 */
export function Valor({
  valor,
  tipo,
  comSinal = true,
  comSimbolo = false,
  neutro = false,
  className = '',
}) {
  const v = Number(valor) || 0
  const ehReceita = tipo ? tipo === 'receita' : v >= 0

  const cor = neutro
    ? v < 0
      ? 'text-neg'
      : 'text-fg'
    : ehReceita
      ? 'text-pos'
      : 'text-neg'

  const sinal = comSinal ? (ehReceita ? '+' : '−') : ''
  const texto = comSimbolo ? moeda(Math.abs(v)) : numero(Math.abs(v))

  return (
    <span className={`tnum font-medium whitespace-nowrap ${cor} ${className}`}>
      {sinal}
      {sinal ? ' ' : ''}
      {texto}
    </span>
  )
}
