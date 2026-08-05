import { moeda, porcento } from '../../lib/formato'

const RAIO = 42
const CIRCUNFERENCIA = 2 * Math.PI * RAIO

/**
 * Rosca + legenda tabelada. Anel em vez de pizza: o buraco no meio guarda o
 * total, que é a informação que a pessoa realmente procura.
 */
export function Rosca({ fatias, total, aoClicar, rotuloCentro = 'Total' }) {
  if (!fatias.length || total <= 0) return null

  let acumulado = 0

  return (
    <div className="flex flex-wrap items-center gap-4">
      <div className="relative shrink-0">
        <svg viewBox="0 0 100 100" className="h-[104px] w-[104px] -rotate-90">
          {fatias.map((f) => {
            const proporcao = f.total / total
            const comprimento = proporcao * CIRCUNFERENCIA
            const offset = -acumulado * CIRCUNFERENCIA
            acumulado += proporcao

            return (
              <circle
                key={f.id ?? f.nome}
                cx="50"
                cy="50"
                r={RAIO}
                fill="none"
                stroke={f.cor}
                strokeWidth="13"
                strokeDasharray={`${comprimento} ${CIRCUNFERENCIA - comprimento}`}
                strokeDashoffset={offset}
                className={aoClicar ? 'cursor-pointer transition-opacity hover:opacity-75' : ''}
                onClick={aoClicar ? () => aoClicar(f) : undefined}
              >
                <title>{`${f.nome}: ${moeda(f.total)} (${porcento(f.total, total)})`}</title>
              </circle>
            )
          })}
        </svg>

        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[9.5px] tracking-wide text-fg-muted uppercase">{rotuloCentro}</span>
          <span className="tnum text-[12.5px] font-semibold text-fg">{moeda(total)}</span>
        </div>
      </div>

      <ul className="flex min-w-[160px] flex-1 flex-col gap-1">
        {fatias.slice(0, 6).map((f) => (
          <li key={f.id ?? f.nome}>
            <button
              type="button"
              onClick={aoClicar ? () => aoClicar(f) : undefined}
              disabled={!aoClicar}
              className="flex w-full items-center gap-2 rounded px-1 py-0.5 text-left transition-colors enabled:hover:bg-surface-2"
            >
              <span
                className="h-2 w-2 shrink-0 rounded-[2px]"
                style={{ backgroundColor: f.cor }}
              />
              <span className="min-w-0 flex-1 truncate text-[12px] text-fg">{f.nome}</span>
              <span className="tnum shrink-0 text-[11px] text-fg-subtle">
                {porcento(f.total, total)}
              </span>
              <span className="tnum shrink-0 text-[12px] font-medium text-fg-muted">
                {moeda(f.total)}
              </span>
            </button>
          </li>
        ))}

        {fatias.length > 6 && (
          <li className="px-1 pt-0.5 text-[11px] text-fg-subtle">
            + {fatias.length - 6} outras categorias
          </li>
        )}
      </ul>
    </div>
  )
}
