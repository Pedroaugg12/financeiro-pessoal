import { Icone } from '../Icone'
import { Botao } from './Botao'

export function Vazio({ titulo, mensagem, acao, icone, compacto = false }) {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center ${compacto ? 'px-4 py-8' : 'px-6 py-14'}`}
    >
      <div className="mb-2.5 flex h-8 w-8 items-center justify-center rounded-base border border-line bg-surface-2 text-fg-subtle">
        {icone ?? <Icone.Lista size={15} />}
      </div>
      <p className="text-[12.5px] font-medium text-fg">{titulo}</p>
      {mensagem && <p className="mt-1 max-w-[34ch] text-[11.5px] text-fg-muted">{mensagem}</p>}
      {acao && <div className="mt-3.5">{acao}</div>}
    </div>
  )
}

/**
 * Estado de erro visível. O sistema antigo não tinha nada disso: falha de banco
 * era exibida como "nenhuma transação encontrada", que é a pior mentira
 * possível num controle financeiro.
 */
export function Erro({ mensagem, onTentarNovamente, compacto = false }) {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center ${compacto ? 'px-4 py-8' : 'px-6 py-14'}`}
    >
      <div className="mb-2.5 flex h-8 w-8 items-center justify-center rounded-base border border-neg/30 bg-neg-soft text-neg">
        <Icone.Alerta size={15} />
      </div>
      <p className="text-[12.5px] font-medium text-fg">Não foi possível carregar os dados</p>
      <p className="mt-1 max-w-[46ch] text-[11.5px] text-fg-muted">{mensagem}</p>
      <p className="mt-2 max-w-[46ch] text-[11.5px] text-fg-subtle">
        Seus lançamentos continuam salvos no servidor — isso é uma falha de leitura, não de
        gravação.
      </p>
      {onTentarNovamente && (
        <Botao className="mt-3.5" variante="secundario" onClick={onTentarNovamente}>
          Tentar novamente
        </Botao>
      )}
    </div>
  )
}

export function Carregando({ texto = 'Carregando...', className = '' }) {
  return (
    <div
      className={`flex items-center justify-center gap-2 py-14 text-[12px] text-fg-muted ${className}`}
    >
      <Icone.Carregando size={14} />
      {texto}
    </div>
  )
}

export function Esqueleto({ className = '' }) {
  return <div className={`anim-pulse rounded bg-surface-3 ${className}`} />
}

/** Placeholder de tabela — evita o "pisca vazio" antes dos dados chegarem. */
const LARGURAS_ESQUELETO = ['w-16', 'flex-1', 'w-24', 'w-20', 'w-14']

export function EsqueletoTabela({ linhas = 8 }) {
  return (
    <div className="divide-y divide-line">
      {Array.from({ length: linhas }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-3 py-2.5">
          {LARGURAS_ESQUELETO.map((largura, j) => (
            <Esqueleto key={j} className={`h-3 ${largura}`} />
          ))}
        </div>
      ))}
    </div>
  )
}
