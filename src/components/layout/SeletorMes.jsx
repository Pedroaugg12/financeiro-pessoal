import { mesAtual, navegarMes, rotuloMes } from '../../lib/datas'
import { Icone } from '../Icone'

export function SeletorMes({ mes, aoMudar }) {
  const ehMesAtual = mes === mesAtual()

  return (
    <div className="inline-flex h-8 items-center overflow-hidden rounded-base border border-line bg-surface">
      <button
        type="button"
        onClick={() => aoMudar(navegarMes(mes, -1))}
        className="flex h-full w-7 items-center justify-center text-fg-muted transition-colors hover:bg-surface-2 hover:text-fg"
        aria-label="Mês anterior"
      >
        <Icone.Esquerda size={14} />
      </button>

      <span className="flex h-full min-w-[124px] items-center justify-center border-x border-line px-2 text-[12.5px] font-medium text-fg">
        {rotuloMes(mes)}
      </span>

      <button
        type="button"
        onClick={() => aoMudar(navegarMes(mes, 1))}
        className="flex h-full w-7 items-center justify-center text-fg-muted transition-colors hover:bg-surface-2 hover:text-fg"
        aria-label="Próximo mês"
      >
        <Icone.Direita size={14} />
      </button>

      {!ehMesAtual && (
        <button
          type="button"
          onClick={() => aoMudar(mesAtual())}
          className="h-full border-l border-line px-2 text-[11.5px] text-accent transition-colors hover:bg-accent-soft"
          title="Voltar para o mês atual"
        >
          Hoje
        </button>
      )}
    </div>
  )
}
