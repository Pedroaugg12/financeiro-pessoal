import { paraDate } from './datas'

const BRL = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

const BRL_SEM_SIMBOLO = new Intl.NumberFormat('pt-BR', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

export function moeda(valor) {
  return BRL.format(Number(valor) || 0)
}

/** Sem "R$" — para tabelas, onde o símbolo repetido 40 vezes é só ruído. */
export function numero(valor) {
  return BRL_SEM_SIMBOLO.format(Number(valor) || 0)
}

/** Versão curta para eixos de gráfico: 12,5 mil / 1,2 mi */
export function moedaCurta(valor) {
  const v = Number(valor) || 0
  const abs = Math.abs(v)
  if (abs >= 1_000_000) return `${(v / 1_000_000).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} mi`
  if (abs >= 1_000) return `${(v / 1_000).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} mil`
  return BRL_SEM_SIMBOLO.format(v)
}

export function data(iso) {
  return iso ? paraDate(iso).toLocaleDateString('pt-BR') : ''
}

const MESES_ABREV = [
  'jan',
  'fev',
  'mar',
  'abr',
  'mai',
  'jun',
  'jul',
  'ago',
  'set',
  'out',
  'nov',
  'dez',
]

/**
 * '05/ago' — cabe em coluna estreita.
 * Montado à mão porque o toLocaleDateString em pt-BR devolve "05 de ago.",
 * que ocupa o dobro do espaço e quebra a linha em colunas apertadas.
 */
export function dataCurta(iso) {
  if (!iso) return ''
  const d = paraDate(iso)
  return `${String(d.getDate()).padStart(2, '0')}/${MESES_ABREV[d.getMonth()]}`
}

export function diaSemana(iso) {
  if (!iso) return ''
  return paraDate(iso).toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '')
}

export function porcento(parte, total) {
  if (!total) return '0%'
  return `${Math.round((parte / total) * 100)}%`
}

/**
 * Lê valor digitado em português. Aceita "1.234,56", "1234,56", "1234.56",
 * "R$ 1.234,56". Retorna NaN se não der para interpretar.
 */
export function lerValor(texto) {
  if (typeof texto === 'number') return texto
  if (!texto) return NaN

  let limpo = String(texto).replace(/[^\d.,-]/g, '')
  if (!limpo) return NaN

  const temVirgula = limpo.includes(',')
  const temPonto = limpo.includes('.')

  if (temVirgula && temPonto) {
    // "1.234,56" -> ponto é separador de milhar
    limpo = limpo.replace(/\./g, '').replace(',', '.')
  } else if (temVirgula) {
    limpo = limpo.replace(',', '.')
  }
  // só ponto: já está no formato que o parseFloat entende

  return parseFloat(limpo)
}

export function iniciais(texto) {
  if (!texto) return '?'
  const partes = texto.trim().split(/[\s@.]+/).filter(Boolean)
  if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase()
  return (partes[0][0] + partes[1][0]).toUpperCase()
}
