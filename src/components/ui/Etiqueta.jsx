import { Icone } from '../Icone'

const TONS = {
  neutro: 'bg-surface-2 text-fg-muted border-line',
  positivo: 'bg-pos-soft text-pos border-pos/25',
  negativo: 'bg-neg-soft text-neg border-neg/25',
  alerta: 'bg-warn-soft text-warn border-warn/25',
  acento: 'bg-accent-soft text-accent border-accent/25',
}

export function Etiqueta({ tom = 'neutro', icone, children, className = '', title }) {
  return (
    <span
      title={title}
      className={[
        'inline-flex max-w-full items-center gap-1 rounded-[3px] border px-1.5 py-px',
        'text-[10.5px] leading-[1.5] font-medium whitespace-nowrap',
        TONS[tom],
        className,
      ].join(' ')}
    >
      {icone}
      <span className="truncate">{children}</span>
    </span>
  )
}

/** Etiqueta de categoria: usa a cor escolhida pelo usuário como um ponto, não
 *  como fundo. Fundo colorido em cada linha vira uma tabela arco-íris. */
export function EtiquetaCategoria({ categoria, className = '' }) {
  if (!categoria) {
    return <span className={`text-[11.5px] text-fg-subtle ${className}`}>—</span>
  }
  return (
    <span className={`inline-flex min-w-0 items-center gap-1.5 ${className}`}>
      <span
        className="h-2 w-2 shrink-0 rounded-[2px]"
        style={{ backgroundColor: categoria.cor }}
        aria-hidden="true"
      />
      <span className="truncate text-[12px] text-fg-muted">{categoria.nome}</span>
    </span>
  )
}

/**
 * Receita e despesa não vencem do mesmo jeito: uma despesa "vence", uma receita
 * "entra". Reaproveitar o mesmo texto colocava "Vence logo" no salário.
 */
export function SituacaoTransacao({ transacao, diasAte }) {
  const ehReceita = transacao.tipo === 'receita'

  if (transacao.confirmado) {
    return (
      <Etiqueta tom="positivo" icone={<Icone.Check size={10} />}>
        {ehReceita ? 'Recebido' : 'Pago'}
      </Etiqueta>
    )
  }

  if (diasAte < 0) {
    return ehReceita ? (
      <Etiqueta tom="alerta" icone={<Icone.Relogio size={10} />} title="Data prevista já passou">
        Não recebido
      </Etiqueta>
    ) : (
      <Etiqueta tom="negativo" icone={<Icone.Alerta size={10} />}>
        Atrasado
      </Etiqueta>
    )
  }

  if (diasAte <= 3) {
    return (
      <Etiqueta tom="alerta" icone={<Icone.Relogio size={10} />}>
        {ehReceita ? 'A receber' : 'Vence logo'}
      </Etiqueta>
    )
  }

  return <Etiqueta tom="neutro">Pendente</Etiqueta>
}
