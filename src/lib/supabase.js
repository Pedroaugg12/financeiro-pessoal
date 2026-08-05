import { createClient } from '@supabase/supabase-js'

// A chave "publishable" é pública por design: ela roda no navegador de qualquer
// pessoa que abrir o site. Quem impede um estranho de ler seus lançamentos é o
// RLS (Row Level Security) no banco, não o sigilo desta chave.
// As variáveis de ambiente são opcionais — servem para apontar o app para outro
// projeto Supabase (staging, por exemplo) sem mexer no código.
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://zhlxkvetdkqyvzasglle.supabase.co'

const SUPABASE_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_Z1NrHDPNgS1Y5fV8Dh7QCw_VD1NF6rP'

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})

/**
 * O código antigo fazia `const { data } = await supabase...` e jogava o `error`
 * fora. Quando o banco falhava, a tela mostrava "nenhuma transação" — ou seja,
 * uma falha de rede era exibida como "você não tem despesa nenhuma". Num sistema
 * financeiro isso é o pior tipo de bug: silencioso e convincente.
 * Aqui todo erro vira exceção e sobe para quem chamou.
 */
export function unwrap({ data, error }) {
  if (error) throw error
  return data
}

/** Traduz os erros mais comuns da Supabase para algo que dá para ler na tela. */
export function mensagemErro(err) {
  if (!err) return 'Erro desconhecido.'

  const msg = String(err.message || err)

  const mapa = {
    'Invalid login credentials': 'E-mail ou senha incorretos.',
    'Email not confirmed': 'Confirme seu e-mail antes de entrar. Verifique a caixa de entrada.',
    'User already registered': 'Já existe uma conta com esse e-mail.',
    'Password should be at least 6 characters': 'A senha precisa ter pelo menos 6 caracteres.',
    'Unable to validate email address: invalid format': 'E-mail em formato inválido.',
    'For security purposes, you can only request this after 60 seconds':
      'Aguarde 60 segundos antes de tentar de novo.',
  }
  if (mapa[msg]) return mapa[msg]

  if (err.code === 'PGRST116') return 'Registro não encontrado.'
  if (err.code === '42501' || msg.includes('row-level security'))
    return 'Sem permissão para essa operação. Verifique as políticas de acesso no banco.'
  if (msg.includes('Failed to fetch') || msg.includes('NetworkError'))
    return 'Sem conexão com o servidor. Verifique sua internet.'

  return msg
}
