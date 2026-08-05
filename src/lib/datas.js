/**
 * Datas aqui trafegam sempre como string 'YYYY-MM-DD' (o mesmo formato da
 * coluna `date` do Postgres). Ao converter para Date usamos meio-dia em vez de
 * meia-noite: às 00:00 o fuso de Brasília (UTC-3) empurra a data para o dia
 * anterior, e um lançamento do dia 1º aparece no mês errado.
 */
const MEIO_DIA = 'T12:00:00'

export function paraDate(iso) {
  return new Date(iso + MEIO_DIA)
}

export function paraISO(date) {
  const ano = date.getFullYear()
  const mes = String(date.getMonth() + 1).padStart(2, '0')
  const dia = String(date.getDate()).padStart(2, '0')
  return `${ano}-${mes}-${dia}`
}

export function hoje() {
  return paraISO(new Date())
}

/** 'YYYY-MM-DD' -> 'YYYY-MM' */
export function chaveMes(iso) {
  return iso ? iso.slice(0, 7) : ''
}

export function mesAtual() {
  return chaveMes(hoje())
}

/** Anda `delta` meses a partir de uma chave 'YYYY-MM'. */
export function navegarMes(chave, delta) {
  const [ano, mes] = chave.split('-').map(Number)
  const d = new Date(ano, mes - 1 + delta, 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

/** 'Março de 2026' */
export function rotuloMes(chave, { curto = false } = {}) {
  const [ano, mes] = chave.split('-').map(Number)
  const d = new Date(ano, mes - 1, 1)
  const txt = d.toLocaleDateString('pt-BR', {
    month: curto ? 'short' : 'long',
    year: 'numeric',
  })
  return txt.charAt(0).toUpperCase() + txt.slice(1).replace('.', '')
}

export function addDias(iso, n) {
  const d = paraDate(iso)
  d.setDate(d.getDate() + n)
  return paraISO(d)
}

/**
 * Soma meses preservando o "fim do mês". Sem isso, 31/01 + 1 mês vira 03/03,
 * porque o JS transborda fevereiro. Uma parcela vencendo dia 31 pularia um mês.
 */
export function addMeses(iso, n) {
  const d = paraDate(iso)
  const diaOriginal = d.getDate()
  d.setDate(1)
  d.setMonth(d.getMonth() + n)
  const ultimoDia = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate()
  d.setDate(Math.min(diaOriginal, ultimoDia))
  return paraISO(d)
}

/** Dias entre hoje e a data. Negativo = já passou. */
export function diasAte(iso) {
  const alvo = paraDate(iso)
  alvo.setHours(0, 0, 0, 0)
  const agora = new Date()
  agora.setHours(0, 0, 0, 0)
  return Math.round((alvo.getTime() - agora.getTime()) / 86400000)
}

/** Últimos `qtd` meses terminando no mês informado (inclusive). */
export function ultimosMeses(chaveFinal, qtd) {
  const lista = []
  for (let i = qtd - 1; i >= 0; i--) lista.push(navegarMes(chaveFinal, -i))
  return lista
}

/** 'Vence hoje', 'Venceu há 3 dias', 'Em 5 dias' */
export function rotuloPrazo(iso) {
  const d = diasAte(iso)
  if (d === 0) return 'Vence hoje'
  if (d === 1) return 'Vence amanhã'
  if (d === -1) return 'Venceu ontem'
  if (d < 0) return `Venceu há ${Math.abs(d)} dias`
  return `Em ${d} dias`
}
