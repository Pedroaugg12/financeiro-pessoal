import { useState } from 'react'
import { useAuth } from '../estado/AuthContext'
import { mensagemErro } from '../lib/supabase'
import { Botao } from '../components/ui/Botao'
import { Campo, Entrada } from '../components/ui/Campo'
import { Icone } from '../components/Icone'

const MODOS = {
  login: {
    titulo: 'Entrar',
    descricao: 'Acesse sua conta para ver seus lançamentos.',
    botao: 'Entrar',
  },
  cadastro: {
    titulo: 'Criar conta',
    descricao: 'Leva menos de um minuto.',
    botao: 'Criar conta',
  },
  recuperar: {
    titulo: 'Recuperar senha',
    descricao: 'Enviaremos um link de redefinição para o seu e-mail.',
    botao: 'Enviar link',
  },
}

export function Login() {
  const { entrar, cadastrar, recuperarSenha } = useAuth()

  const [modo, setModo] = useState('login')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [nome, setNome] = useState('')
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState('')
  const [aviso, setAviso] = useState('')

  const cfg = MODOS[modo]

  function trocarModo(novo) {
    setModo(novo)
    setErro('')
    setAviso('')
    setSenha('')
  }

  async function enviar(e) {
    e.preventDefault()
    setErro('')
    setAviso('')
    setEnviando(true)

    try {
      if (modo === 'login') {
        const { error } = await entrar(email.trim(), senha)
        if (error) throw error
        // o AuthProvider detecta a sessão e troca a tela sozinho
      } else if (modo === 'cadastro') {
        const { error } = await cadastrar(email.trim(), senha, nome.trim())
        if (error) throw error
        setModo('login')
        setAviso('Conta criada. Confirme o e-mail que enviamos e depois entre.')
      } else {
        const { error } = await recuperarSenha(email.trim())
        if (error) throw error
        setModo('login')
        setAviso('Link de redefinição enviado. Confira sua caixa de entrada.')
      }
    } catch (err) {
      setErro(mensagemErro(err))
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-bg px-4 py-10">
      <div className="w-full max-w-[352px]">
        {/* marca */}
        <div className="mb-5 flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-base bg-accent text-accent-fg">
            <Icone.Grafico size={15} strokeWidth={2} />
          </span>
          <span className="text-[15px] font-semibold tracking-tight text-fg">Financeiro</span>
        </div>

        <div className="pane shadow-pane p-5">
          <h1 className="text-[15px] font-semibold text-fg">{cfg.titulo}</h1>
          <p className="mt-1 mb-4 text-[12px] text-fg-muted">{cfg.descricao}</p>

          {erro && (
            <div
              role="alert"
              className="mb-3.5 flex items-start gap-2 rounded-base border border-neg/25 bg-neg-soft px-2.5 py-2 text-[12px] text-neg"
            >
              <span className="mt-px shrink-0">
                <Icone.Alerta size={13} />
              </span>
              <span>{erro}</span>
            </div>
          )}

          {aviso && (
            <div
              role="status"
              className="mb-3.5 flex items-start gap-2 rounded-base border border-pos/25 bg-pos-soft px-2.5 py-2 text-[12px] text-pos"
            >
              <span className="mt-px shrink-0">
                <Icone.Check size={13} />
              </span>
              <span>{aviso}</span>
            </div>
          )}

          <form onSubmit={enviar} className="flex flex-col gap-3">
            {modo === 'cadastro' && (
              <Campo rotulo="Nome" obrigatorio>
                <Entrada
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Seu nome"
                  autoComplete="name"
                  required
                />
              </Campo>
            )}

            <Campo rotulo="E-mail" obrigatorio>
              <Entrada
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="voce@exemplo.com"
                autoComplete="email"
                autoFocus
                required
              />
            </Campo>

            {modo !== 'recuperar' && (
              <Campo
                rotulo="Senha"
                obrigatorio
                dica={modo === 'cadastro' ? 'Mínimo de 6 caracteres.' : undefined}
              >
                <div className="relative">
                  <Entrada
                    type={mostrarSenha ? 'text' : 'password'}
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    placeholder="••••••••"
                    autoComplete={modo === 'cadastro' ? 'new-password' : 'current-password'}
                    minLength={6}
                    required
                    className="pr-16"
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarSenha((v) => !v)}
                    className="absolute top-1/2 right-2 -translate-y-1/2 rounded px-1 py-0.5 text-[11px] text-fg-subtle transition-colors hover:text-fg"
                  >
                    {mostrarSenha ? 'ocultar' : 'mostrar'}
                  </button>
                </div>
              </Campo>
            )}

            <Botao
              type="submit"
              variante="primario"
              tamanho="lg"
              carregando={enviando}
              className="mt-1 w-full justify-center"
            >
              {cfg.botao}
            </Botao>
          </form>

          <div className="mt-4 flex flex-col gap-1.5 border-t border-line pt-3.5 text-[12px]">
            {modo === 'login' && (
              <>
                <button
                  type="button"
                  onClick={() => trocarModo('recuperar')}
                  className="text-left text-fg-muted transition-colors hover:text-accent"
                >
                  Esqueci minha senha
                </button>
                <span className="text-fg-muted">
                  Não tem conta?{' '}
                  <button
                    type="button"
                    onClick={() => trocarModo('cadastro')}
                    className="font-medium text-accent hover:underline"
                  >
                    Criar conta
                  </button>
                </span>
              </>
            )}
            {modo !== 'login' && (
              <span className="text-fg-muted">
                Já tem conta?{' '}
                <button
                  type="button"
                  onClick={() => trocarModo('login')}
                  className="font-medium text-accent hover:underline"
                >
                  Entrar
                </button>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
