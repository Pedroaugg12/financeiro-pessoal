# Financeiro

Sistema de controle financeiro pessoal. React + Vite no front, Supabase (Postgres + Auth) no back, deploy na Vercel.

Cada conta enxerga apenas os próprios dados — o isolamento é garantido por RLS no banco, não pelo código do front.

## Rodando localmente

```bash
npm install
npm run dev
```

Abre em `http://localhost:5173`.

| Comando           | O que faz                                  |
| ----------------- | ------------------------------------------ |
| `npm run dev`     | Servidor de desenvolvimento com hot reload |
| `npm run build`   | Build de produção em `dist/`               |
| `npm run preview` | Serve o build de produção localmente       |

### Conferência visual sem banco

`http://localhost:5173/preview.html` abre o sistema inteiro com dados falsos, sem
login e sem tocar no Supabase. Serve para conferir layout, tema claro/escuro e
responsividade rapidamente. Não vai para produção — o build só empacota o
`index.html`.

## Configuração

A URL e a chave `publishable` do Supabase têm valor padrão em `src/lib/supabase.js`.
Essa chave é **pública por design**: ela roda no navegador de qualquer visitante.
Quem impede um estranho de ler seus lançamentos é o RLS, não o sigilo dela.

Para apontar para outro projeto Supabase, crie um `.env.local` (veja `.env.example`):

```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

## Estrutura

```
src/
  lib/          supabase (cliente + tratamento de erro), datas, formato, csv
  estado/       AuthContext, FinanceContext, ToastContext
  components/
    ui/         Botao, Campo, Painel, Modal, Tabela, Etiqueta, Estados
    layout/     Shell, BarraLateral, SeletorMes
    graficos/   Barras, Rosca
  paginas/      Login, Inicio, Lancamentos, Categorias, Configuracoes
  __preview__/  harness de conferência visual (fora do build)
```

## Banco de dados

Três tabelas, todas com `user_id` e RLS ligado.

**`transacoes`** — `id`, `user_id`, `descricao`, `tipo` (`receita`|`despesa`), `valor`,
`categoria_id`, `data`, `confirmado`, `recorrencia`, `parcela_atual`, `parcela_total`,
`parcela_grupo`.

`parcela_grupo` é o identificador da série: um parcelamento em 12x e uma
recorrência de 12 meses compartilham o mesmo grupo, e é isso que permite excluir
a série inteira de uma vez.

**`categorias`** — `id`, `user_id`, `nome`, `cor`, `tipo` (`receita`|`despesa`|`ambos`), `meta_mensal`.

**`configuracoes`** — `user_id`, `saldo_inicial`, `tema`, `cor_primaria`, `modo_compacto`.
Uma linha por usuário, criada automaticamente no primeiro acesso.

### RLS

Cada tabela precisa de política para **as quatro operações** (SELECT, INSERT,
UPDATE, DELETE), todas com `auth.uid() = user_id`. Só com SELECT protegido,
qualquer pessoa consegue gravar no banco usando a chave pública.

## Deploy

Push na `main` → a Vercel builda e publica sozinha. Nada a configurar.

## Como o saldo é calculado

- **Saldo atual** = saldo inicial + receitas **confirmadas** − despesas **confirmadas**
- **Saldo previsto** = saldo atual + tudo que ainda está pendente

Um lançamento só entra no saldo atual quando é marcado como pago/recebido.

## Atalhos

| Tecla   | Ação                          |
| ------- | ----------------------------- |
| `N`     | Novo lançamento               |
| `Esc`   | Fecha o formulário aberto     |
