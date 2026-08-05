import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'

// Exportado para permitir injetar dados de teste sem tocar no Supabase.
export const AuthCtx = createContext(null)
const Ctx = AuthCtx

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null)
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    let vivo = true

    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (!vivo) return
        setUsuario(data.session?.user ?? null)
      })
      .finally(() => {
        if (vivo) setCarregando(false)
      })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_evento, sessao) => {
      if (!vivo) return
      setUsuario(sessao?.user ?? null)
      setCarregando(false)
    })

    return () => {
      vivo = false
      subscription.unsubscribe()
    }
  }, [])

  const valor = useMemo(
    () => ({
      usuario,
      carregando,
      entrar: (email, senha) => supabase.auth.signInWithPassword({ email, password: senha }),
      cadastrar: (email, senha, nome) =>
        supabase.auth.signUp({ email, password: senha, options: { data: { nome } } }),
      recuperarSenha: (email) =>
        supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin }),
      sair: () => supabase.auth.signOut(),
    }),
    [usuario, carregando]
  )

  return <Ctx.Provider value={valor}>{children}</Ctx.Provider>
}

export function useAuth() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useAuth precisa estar dentro de <AuthProvider>')
  return ctx
}
