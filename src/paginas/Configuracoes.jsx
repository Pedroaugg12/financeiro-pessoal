import { useEffect, useState } from 'react'
import { useFinance } from '../estado/FinanceContext'
import { useAuth } from '../estado/AuthContext'
import { useToast } from '../estado/ToastContext'
import { lerValor, moeda } from '../lib/formato'
import { baixarArquivo, gerarCSV } from '../lib/csv'
import { Painel, PainelCabecalho } from '../components/ui/Painel'
import { Botao, Segmentado } from '../components/ui/Botao'
import { Campo, EntradaValor } from '../components/ui/Campo'
import { Confirmacao } from '../components/ui/Modal'
import { Icone } from '../components/Icone'

export function Configuracoes() {
  const { usuario, sair } = useAuth()
  const { config, salvarConfig, saldoRealizado, transacoes, categoriaPorId } = useFinance()
  const toast = useToast()

  const [saldoTexto, setSaldoTexto] = useState('')
  const [erroSaldo, setErroSaldo] = useState('')
  const [salvandoSaldo, setSalvandoSaldo] = useState(false)
  const [confirmarSaida, setConfirmarSaida] = useState(false)

  useEffect(() => {
    setSaldoTexto(String(config.saldoInicial ?? 0).replace('.', ','))
  }, [config.saldoInicial])

  const saldoAlterado = lerValor(saldoTexto) !== config.saldoInicial

  async function salvarSaldo() {
    const valor = lerValor(saldoTexto)
    if (!Number.isFinite(valor)) {
      setErroSaldo('Informe um número válido.')
      return
    }
    setErroSaldo('')
    setSalvandoSaldo(true)
    const r = await salvarConfig({ saldoInicial: valor })
    setSalvandoSaldo(false)
    if (r?.ok) toast.sucesso('Saldo inicial atualizado.')
  }

  function exportarTudo() {
    if (transacoes.length === 0) {
      toast.info('Não há lançamentos para exportar.')
      return
    }

    const csv = gerarCSV(
      [
        { titulo: 'Data', valor: (t) => t.data },
        { titulo: 'Descrição', valor: (t) => t.descricao },
        { titulo: 'Tipo', valor: (t) => (t.tipo === 'receita' ? 'Receita' : 'Despesa') },
        { titulo: 'Categoria', valor: (t) => categoriaPorId.get(t.categoriaId)?.nome ?? '' },
        { titulo: 'Valor', valor: (t) => String(t.valor).replace('.', ',') },
        { titulo: 'Situação', valor: (t) => (t.confirmado ? 'Confirmado' : 'Pendente') },
        {
          titulo: 'Parcela',
          valor: (t) => (t.parcelaTotal ? `${t.parcelaAtual}/${t.parcelaTotal}` : ''),
        },
        { titulo: 'Recorrência', valor: (t) => t.recorrencia ?? '' },
      ],
      [...transacoes].sort((a, b) => a.data.localeCompare(b.data))
    )

    baixarArquivo('financeiro-completo.csv', csv)
    toast.sucesso(`${transacoes.length} lançamentos exportados.`)
  }

  return (
    <div className="flex max-w-[720px] flex-col gap-3">
      {/* conta */}
      <Painel semPadding>
        <PainelCabecalho titulo="Conta" />
        <div className="flex flex-col gap-3 p-[var(--pane-p)]">
          <Linha rotulo="E-mail" valor={usuario?.email ?? '—'} />
          <Linha
            rotulo="Nome"
            valor={usuario?.user_metadata?.nome || <span className="text-fg-subtle">Não informado</span>}
          />
          <div className="border-t border-line pt-3">
            <Botao
              variante="perigo"
              onClick={() => setConfirmarSaida(true)}
              iconeEsq={<Icone.Sair size={13} />}
            >
              Sair da conta
            </Botao>
          </div>
        </div>
      </Painel>

      {/* saldo inicial */}
      <Painel semPadding>
        <PainelCabecalho
          titulo="Saldo inicial"
          descricao="Quanto você já tinha antes do primeiro lançamento registrado aqui"
        />
        <div className="p-[var(--pane-p)]">
          <div className="flex flex-wrap items-end gap-2">
            <Campo erro={erroSaldo} className="w-40">
              <EntradaValor
                value={saldoTexto}
                onChange={(e) => setSaldoTexto(e.target.value)}
                erro={erroSaldo}
                onKeyDown={(e) => e.key === 'Enter' && salvarSaldo()}
              />
            </Campo>
            <Botao
              variante={saldoAlterado ? 'primario' : 'secundario'}
              onClick={salvarSaldo}
              carregando={salvandoSaldo}
              disabled={!saldoAlterado}
            >
              Salvar
            </Botao>
          </div>

          <p className="mt-2.5 text-[11.5px] text-fg-muted">
            Saldo atual calculado:{' '}
            <strong className={`tnum font-semibold ${saldoRealizado < 0 ? 'text-neg' : 'text-fg'}`}>
              {moeda(saldoRealizado)}
            </strong>{' '}
            <span className="text-fg-subtle">
              (saldo inicial + receitas confirmadas − despesas confirmadas)
            </span>
          </p>
        </div>
      </Painel>

      {/* aparência */}
      <Painel semPadding>
        <PainelCabecalho titulo="Aparência" />
        <div className="flex flex-col gap-3.5 p-[var(--pane-p)]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[12.5px] font-medium text-fg">Tema</p>
              <p className="text-[11.5px] text-fg-muted">Claro ou escuro.</p>
            </div>
            <Segmentado
              valor={config.tema}
              onChange={(v) => salvarConfig({ tema: v })}
              opcoes={[
                { valor: 'light', rotulo: 'Claro' },
                { valor: 'dark', rotulo: 'Escuro' },
              ]}
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-3.5">
            <div>
              <p className="text-[12.5px] font-medium text-fg">Densidade das tabelas</p>
              <p className="text-[11.5px] text-fg-muted">
                Compacta cabe cerca de 25% mais linhas por tela.
              </p>
            </div>
            <Segmentado
              valor={config.densidade}
              onChange={(v) => salvarConfig({ densidade: v })}
              opcoes={[
                { valor: 'confortavel', rotulo: 'Confortável' },
                { valor: 'compacta', rotulo: 'Compacta' },
              ]}
            />
          </div>
        </div>
      </Painel>

      {/* dados */}
      <Painel semPadding>
        <PainelCabecalho
          titulo="Seus dados"
          descricao="Backup completo em CSV, abre direto no Excel"
        />
        <div className="flex flex-wrap items-center justify-between gap-3 p-[var(--pane-p)]">
          <p className="text-[12px] text-fg-muted">
            <strong className="tnum font-semibold text-fg">{transacoes.length}</strong> lançamentos
            registrados na sua conta.
          </p>
          <Botao onClick={exportarTudo} iconeEsq={<Icone.Baixar size={13} />}>
            Exportar tudo
          </Botao>
        </div>
      </Painel>

      <Confirmacao
        aberto={confirmarSaida}
        onFechar={() => setConfirmarSaida(false)}
        onConfirmar={sair}
        titulo="Sair da conta"
        textoConfirmar="Sair"
        mensagem="Você precisará entrar novamente com e-mail e senha. Seus dados continuam salvos."
      />
    </div>
  )
}

function Linha({ rotulo, valor }) {
  return (
    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
      <span className="w-16 shrink-0 text-[11.5px] text-fg-muted">{rotulo}</span>
      <span className="text-[12.5px] text-fg">{valor}</span>
    </div>
  )
}
