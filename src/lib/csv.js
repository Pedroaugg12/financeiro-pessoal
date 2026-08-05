/**
 * Escapa um campo para CSV. O código antigo fazia `'"' + valor + '"'`, então
 * uma descrição como `Aluguel "casa nova"` fechava as aspas no meio e quebrava
 * a linha inteira no Excel. A regra do RFC 4180 é dobrar as aspas internas.
 */
function campo(valor) {
  const texto = valor === null || valor === undefined ? '' : String(valor)
  return `"${texto.replace(/"/g, '""')}"`
}

/**
 * Gera CSV com `;` (o Excel em português espera ponto e vírgula) e BOM UTF-8,
 * senão acentuação vira caractere quebrado.
 */
export function gerarCSV(colunas, linhas) {
  const cabecalho = colunas.map((c) => campo(c.titulo)).join(';')
  const corpo = linhas.map((linha) => colunas.map((c) => campo(c.valor(linha))).join(';'))
  return '﻿' + [cabecalho, ...corpo].join('\r\n')
}

export function baixarArquivo(nome, conteudo, tipo = 'text/csv;charset=utf-8') {
  const blob = new Blob([conteudo], { type: tipo })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = nome
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  // Sem revoke o blob fica preso na memória até a aba fechar.
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
