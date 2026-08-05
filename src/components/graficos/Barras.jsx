import { moeda, moedaCurta } from '../../lib/formato'

/**
 * Barras agrupadas: receita e despesa lado a lado por mês.
 * Sem eixo Y desenhado — só duas linhas de grade e o valor no topo do maior.
 * Grade pesada rouba atenção do dado.
 */
export function BarrasMensais({ dados, altura = 132 }) {
  const maximo = Math.max(...dados.flatMap((d) => [d.receitas, d.despesas]), 1)
  const larguraGrupo = 100 / dados.length

  return (
    <div className="flex flex-col gap-1.5">
      <div className="relative" style={{ height: altura }}>
        {/* linhas de grade em 50% e 100% */}
        {[0, 0.5].map((p) => (
          <div
            key={p}
            className="absolute inset-x-0 border-t border-dashed border-line"
            style={{ top: `${p * 100}%` }}
          />
        ))}
        <div className="absolute inset-x-0 bottom-0 border-t border-line-strong" />

        <div className="flex h-full items-end">
          {dados.map((d) => (
            <div
              key={d.chave}
              className="flex h-full items-end justify-center gap-[3px] px-1"
              style={{ width: `${larguraGrupo}%` }}
            >
              <Barra
                proporcao={d.receitas / maximo}
                classe="bg-pos"
                titulo={`${d.rotulo} · Receitas ${moeda(d.receitas)}`}
              />
              <Barra
                proporcao={d.despesas / maximo}
                classe="bg-neg"
                titulo={`${d.rotulo} · Despesas ${moeda(d.despesas)}`}
              />
            </div>
          ))}
        </div>
      </div>

      {/* eixo X */}
      <div className="flex">
        {dados.map((d) => (
          <div
            key={d.chave}
            className="flex flex-col items-center gap-0.5 px-1"
            style={{ width: `${larguraGrupo}%` }}
          >
            <span
              className={`truncate text-[10.5px] ${d.atual ? 'font-semibold text-fg' : 'text-fg-muted'}`}
            >
              {d.rotulo}
            </span>
            <span
              className={`tnum truncate text-[10px] ${d.saldo >= 0 ? 'text-pos' : 'text-neg'}`}
              title={moeda(d.saldo)}
            >
              {d.saldo >= 0 ? '+' : '−'}
              {moedaCurta(Math.abs(d.saldo))}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-0.5 flex items-center justify-center gap-3 text-[10.5px] text-fg-muted">
        <Legenda classe="bg-pos" rotulo="Receitas" />
        <Legenda classe="bg-neg" rotulo="Despesas" />
      </div>
    </div>
  )
}

function Barra({ proporcao, classe, titulo }) {
  // 2px mínimo: barra de altura zero some e parece dado faltando
  const altura = proporcao > 0 ? Math.max(proporcao * 100, 2) : 0
  return (
    <div
      title={titulo}
      className={`w-full max-w-3.5 rounded-t-[2px] transition-all ${classe} ${altura === 0 ? 'opacity-0' : 'hover:opacity-80'}`}
      style={{ height: `${altura}%` }}
    />
  )
}

function Legenda({ classe, rotulo }) {
  return (
    <span className="flex items-center gap-1">
      <span className={`h-1.5 w-1.5 rounded-[2px] ${classe}`} />
      {rotulo}
    </span>
  )
}
