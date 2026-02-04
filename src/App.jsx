import { useState, useEffect, useCallback, useMemo } from 'react';
import { createClient } from '@supabase/supabase-js';

// ============================================
// CONFIGURAÇÃO SUPABASE
// ============================================
const supabase = createClient(
  'https://zhlxkvetdkqyvzasglle.supabase.co',
  'sb_publishable_Z1NrHDPNgS1Y5fV8Dh7QCw_VD1NF6rP'
);

// ============================================
// ÍCONES
// ============================================
const I = {
  Plus: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  Up: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>,
  Down: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></svg>,
  Check: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>,
  X: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  Trash: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>,
  Edit: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  Tag: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/></svg>,
  Left: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>,
  Right: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>,
  Wallet: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4h-4z"/></svg>,
  Home: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>,
  List: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>,
  Search: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  Settings: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
  Filter: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>,
  Clock: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  Bar: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/></svg>,
  Copy: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>,
  Download: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
  Sun: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/></svg>,
  Moon: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>,
  Pie: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/></svg>,
  Repeat: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>,
  LogOut: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  Mail: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
  Lock: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
  User: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  Loader: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{animation:'spin 1s linear infinite'}}><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/></svg>,
  Cloud: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/></svg>,
  CloudOff: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="1" y1="1" x2="23" y2="23"/><path d="M18 10h-1.26A8 8 0 0 0 4 14.02"/><path d="M9 20H5a5 5 0 0 1-1-9.9"/><path d="M22 22H9"/></svg>,
};

// ============================================
// TEMAS
// ============================================
const themes = {
  dark: (c) => ({ bg: '#0a0a0c', card: '#141419', hover: '#1c1c24', input: '#1e1e28', primary: c, rec: '#10b981', desp: '#ef4444', warn: '#f59e0b', text: '#fafafa', muted: '#a1a1aa', dim: '#71717a', border: '#27272a' }),
  light: (c) => ({ bg: '#f8fafc', card: '#ffffff', hover: '#f1f5f9', input: '#f1f5f9', primary: c, rec: '#059669', desp: '#dc2626', warn: '#d97706', text: '#1e293b', muted: '#64748b', dim: '#94a3b8', border: '#e2e8f0' }),
};

const CORES_TEMA = ['#6366f1', '#8b5cf6', '#ec4899', '#ef4444', '#f97316', '#22c55e', '#10b981', '#06b6d4', '#3b82f6'];

// ============================================
// UTILITÁRIOS
// ============================================
const u = {
  fmt: (v) => (v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
  fmtD: (d) => d ? new Date(d + 'T12:00').toLocaleDateString('pt-BR') : '',
  mesK: (d) => { const t = new Date(d + 'T12:00'); return t.getFullYear() + '-' + String(t.getMonth() + 1).padStart(2, '0'); },
  hoje: () => new Date().toISOString().split('T')[0],
  mesAt: () => { const h = new Date(); return h.getFullYear() + '-' + String(h.getMonth() + 1).padStart(2, '0'); },
  navM: (m, d) => { const [a, ms] = m.split('-').map(Number); const n = new Date(a, ms - 1 + d, 1); return n.getFullYear() + '-' + String(n.getMonth() + 1).padStart(2, '0'); },
  mesL: (m) => { const [a, ms] = m.split('-').map(Number); return new Date(a, ms - 1, 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }); },
  diasAte: (d) => { const h = new Date(); h.setHours(0, 0, 0, 0); return Math.ceil((new Date(d + 'T12:00').getTime() - h.getTime()) / 864e5); },
  addM: (d, m) => { const t = new Date(d + 'T12:00'); t.setMonth(t.getMonth() + m); return t.toISOString().split('T')[0]; },
};

// ============================================
// COMPONENTE TOAST
// ============================================
const Toast = ({ t, th }) => t.length === 0 ? null : (
  <div style={{ position: 'fixed', top: 80, right: 16, zIndex: 100, display: 'flex', flexDirection: 'column', gap: 8 }}>
    {t.map(x => (
      <div key={x.id} style={{ background: x.t === 's' ? '#059669' : x.t === 'e' ? '#dc2626' : '#3b82f6', color: '#fff', padding: '12px 16px', borderRadius: 12, boxShadow: '0 8px 32px rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', gap: 10, animation: 'slideIn .3s ease', fontSize: 14 }}>
        {x.t === 's' ? <I.Check /> : <I.Cloud />}
        <span>{x.m}</span>
      </div>
    ))}
  </div>
);

// ============================================
// TELA DE LOGIN
// ============================================
const LoginScreen = ({ th, onLogin, r }) => {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [nome, setNome] = useState('');
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');
  const [msg, setMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');
    setMsg('');
    setLoading(true);

    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password: senha });
        if (error) throw error;
      } else if (mode === 'cadastro') {
        const { error } = await supabase.auth.signUp({ 
          email, 
          password: senha,
          options: { data: { nome } }
        });
        if (error) throw error;
        setMsg('Conta criada! Verifique seu email para confirmar.');
        setMode('login');
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email);
        if (error) throw error;
        setMsg('Email de recuperação enviado!');
        setMode('login');
      }
    } catch (err) {
      setErro(err.message === 'Invalid login credentials' ? 'Email ou senha incorretos' : err.message);
    }
    setLoading(false);
  };

  const s = {
    inp: { width: '100%', background: th.input, border: '1px solid ' + th.border, borderRadius: r.md, padding: '14px 16px', color: th.text, fontSize: '1rem', outline: 'none', boxSizing: 'border-box' },
    btn: { width: '100%', background: th.primary, color: '#fff', border: 'none', borderRadius: r.md, padding: '14px', fontWeight: 600, cursor: 'pointer', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 },
  };

  return (
    <div style={{ minHeight: '100vh', background: th.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: th.card, borderRadius: r.lg, border: '1px solid ' + th.border, padding: '2rem', maxWidth: 400, width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ width: 60, height: 60, background: th.primary, borderRadius: r.md, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', color: '#fff' }}><I.Wallet /></div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0, color: th.text }}>Finanças</h1>
          <p style={{ color: th.muted, marginTop: 4 }}>{mode === 'login' ? 'Entre na sua conta' : mode === 'cadastro' ? 'Crie sua conta' : 'Recuperar senha'}</p>
        </div>

        {erro && <div style={{ background: th.desp + '20', color: th.desp, padding: 12, borderRadius: r.md, marginBottom: 16, fontSize: 14 }}>{erro}</div>}
        {msg && <div style={{ background: th.rec + '20', color: th.rec, padding: 12, borderRadius: r.md, marginBottom: 16, fontSize: 14 }}>{msg}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {mode === 'cadastro' && (
            <div>
              <label style={{ fontSize: 13, color: th.muted, display: 'block', marginBottom: 6 }}>Nome</label>
              <div style={{ position: 'relative' }}>
                <input type="text" value={nome} onChange={e => setNome(e.target.value)} placeholder="Seu nome" required style={{ ...s.inp, paddingLeft: 44 }} />
                <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: th.muted }}><I.User /></div>
              </div>
            </div>
          )}

          <div>
            <label style={{ fontSize: 13, color: th.muted, display: 'block', marginBottom: 6 }}>Email</label>
            <div style={{ position: 'relative' }}>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="seu@email.com" required style={{ ...s.inp, paddingLeft: 44 }} />
              <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: th.muted }}><I.Mail /></div>
            </div>
          </div>

          {mode !== 'recuperar' && (
            <div>
              <label style={{ fontSize: 13, color: th.muted, display: 'block', marginBottom: 6 }}>Senha</label>
              <div style={{ position: 'relative' }}>
                <input type="password" value={senha} onChange={e => setSenha(e.target.value)} placeholder="••••••••" required minLength={6} style={{ ...s.inp, paddingLeft: 44 }} />
                <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: th.muted }}><I.Lock /></div>
              </div>
            </div>
          )}

          <button type="submit" disabled={loading} style={{ ...s.btn, opacity: loading ? 0.7 : 1 }}>
            {loading ? <I.Loader /> : mode === 'login' ? 'Entrar' : mode === 'cadastro' ? 'Criar conta' : 'Enviar email'}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: 14 }}>
          {mode === 'login' && (
            <>
              <p style={{ color: th.muted }}>Não tem conta? <button onClick={() => setMode('cadastro')} style={{ background: 'none', border: 'none', color: th.primary, cursor: 'pointer', fontWeight: 600 }}>Criar conta</button></p>
              <button onClick={() => setMode('recuperar')} style={{ background: 'none', border: 'none', color: th.muted, cursor: 'pointer', marginTop: 8 }}>Esqueci minha senha</button>
            </>
          )}
          {mode !== 'login' && (
            <p style={{ color: th.muted }}>Já tem conta? <button onClick={() => setMode('login')} style={{ background: 'none', border: 'none', color: th.primary, cursor: 'pointer', fontWeight: 600 }}>Entrar</button></p>
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================
// COMPONENTE PRINCIPAL
// ============================================
export default function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [trans, setTrans] = useState([]);
  const [cats, setCats] = useState([]);
  const [cfg, setCfg] = useState({ saldo_inicial: 0, tema: 'dark', cor_primaria: '#6366f1', modo_compacto: false });
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [tab, setTab] = useState('dash');
  const [mes, setMes] = useState(u.mesAt());
  const [filtro, setFiltro] = useState({ tipo: 'todos', status: 'todos', cat: 'todos', busca: '' });
  const [showFiltro, setShowFiltro] = useState(false);
  const [modal, setModal] = useState(null);
  const [edit, setEdit] = useState(null);
  const [sel, setSel] = useState(new Set());
  const [form, setForm] = useState({ desc: '', tipo: 'despesa', valor: '', cat: '', data: u.hoje(), conf: false, rec: '', parc: '' });
  const [formCat, setFormCat] = useState({ nome: '', cor: '#6366f1', tipo: 'despesa', meta: '' });
  const [toasts, setToasts] = useState([]);

  const th = themes[cfg.tema](cfg.cor_primaria);
  const r = { sm: '8px', md: '12px', lg: '16px' };

  const toast = useCallback((m, t = 'i') => {
    const id = Date.now().toString();
    setToasts(ts => [...ts, { id, m, t }]);
    setTimeout(() => setToasts(ts => ts.filter(x => x.id !== id)), 3000);
  }, []);

  // Verificar autenticação
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Carregar dados quando logado
  useEffect(() => {
    if (user) loadData();
  }, [user]);

  // Realtime subscription
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('db-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'transacoes', filter: `user_id=eq.${user.id}` }, () => loadTrans())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'categorias', filter: `user_id=eq.${user.id}` }, () => loadCats())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    await Promise.all([loadTrans(), loadCats(), loadCfg()]);
    setLoading(false);
  };

  const loadTrans = async () => {
    const { data } = await supabase.from('transacoes').select('*').eq('user_id', user.id).order('data', { ascending: false });
    if (data) setTrans(data.map(t => ({ ...t, desc: t.descricao, cat: t.categoria_id, conf: t.confirmado, rec: t.recorrencia, pAtual: t.parcela_atual, pTotal: t.parcela_total, pGrupo: t.parcela_grupo })));
  };

  const loadCats = async () => {
    const { data } = await supabase.from('categorias').select('*').eq('user_id', user.id);
    if (data) setCats(data);
  };

  const loadCfg = async () => {
    const { data } = await supabase.from('configuracoes').select('*').eq('user_id', user.id).single();
    if (data) setCfg(data);
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  const saldoReal = useMemo(() => {
    const c = trans.filter(t => t.conf);
    return (cfg.saldo_inicial || 0) + c.filter(t => t.tipo === 'receita').reduce((a, t) => a + Number(t.valor), 0) - c.filter(t => t.tipo === 'despesa').reduce((a, t) => a + Number(t.valor), 0);
  }, [trans, cfg.saldo_inicial]);

  const transMes = useMemo(() => trans.filter(t => u.mesK(t.data) === mes), [trans, mes]);

  const transFilt = useMemo(() => {
    let l = transMes.filter(t => {
      if (filtro.tipo !== 'todos' && t.tipo !== filtro.tipo) return false;
      if (filtro.status === 'conf' && !t.conf) return false;
      if (filtro.status === 'pend' && t.conf) return false;
      if (filtro.cat !== 'todos' && t.cat !== filtro.cat) return false;
      if (filtro.busca && !t.desc?.toLowerCase().includes(filtro.busca.toLowerCase())) return false;
      return true;
    });
    return l.sort((a, b) => new Date(a.data) - new Date(b.data));
  }, [transMes, filtro]);

  const proxVenc = useMemo(() => trans.filter(t => !t.conf && t.tipo === 'despesa' && u.diasAte(t.data) >= 0 && u.diasAte(t.data) <= 7).sort((a, b) => new Date(a.data) - new Date(b.data)).slice(0, 4), [trans]);

  const met = useMemo(() => {
    const rec = transMes.filter(t => t.tipo === 'receita'), desp = transMes.filter(t => t.tipo === 'despesa');
    const tR = rec.reduce((a, t) => a + Number(t.valor), 0), tD = desp.reduce((a, t) => a + Number(t.valor), 0);
    const porCat = {};
    desp.forEach(t => { const cat = cats.find(c => c.id === t.cat); const n = cat?.nome || 'Sem', cor = cat?.cor || '#78716c'; if (!porCat[t.cat || 'sem']) porCat[t.cat || 'sem'] = { total: 0, cor, nome: n, catId: t.cat }; porCat[t.cat || 'sem'].total += Number(t.valor); });
    return { tR, tD, saldo: tR - tD, cats: Object.values(porCat).sort((a, b) => b.total - a.total) };
  }, [transMes, cats]);

  const evol = useMemo(() => { const m = []; const h = new Date(); for (let i = 5; i >= 0; i--) { const d = new Date(h.getFullYear(), h.getMonth() - i, 1); const k = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0'); const l = d.toLocaleDateString('pt-BR', { month: 'short' }); const t = trans.filter(x => u.mesK(x.data) === k); m.push({ mes: l, r: t.filter(x => x.tipo === 'receita').reduce((a, x) => a + Number(x.valor), 0), d: t.filter(x => x.tipo === 'despesa').reduce((a, x) => a + Number(x.valor), 0) }); } return m; }, [trans]);

  const abrirNova = (tipo) => { setForm({ desc: '', tipo: tipo || 'despesa', valor: '', cat: '', data: u.hoje(), conf: false, rec: '', parc: '' }); setEdit(null); setModal('trans'); };
  const abrirEdit = (t) => { setForm({ desc: t.desc, tipo: t.tipo, valor: String(t.valor), cat: t.cat || '', data: t.data, conf: t.conf, rec: '', parc: '' }); setEdit(t); setModal('trans'); };
  const duplicar = (t) => { setForm({ desc: t.desc, tipo: t.tipo, valor: String(t.valor), cat: t.cat || '', data: u.hoje(), conf: false, rec: '', parc: '' }); setEdit(null); setModal('trans'); };

  const salvarTrans = async () => {
    if (!form.desc.trim()) { toast('Informe a descrição', 'e'); return; }
    const v = parseFloat(form.valor.replace(',', '.'));
    if (isNaN(v) || v <= 0) { toast('Valor inválido', 'e'); return; }

    setSyncing(true);
    try {
      if (edit) {
        await supabase.from('transacoes').update({
          descricao: form.desc,
          tipo: form.tipo,
          valor: v,
          categoria_id: form.cat || null,
          data: form.data,
          confirmado: form.conf
        }).eq('id', edit.id);
        toast('Atualizado!', 's');
      } else {
        const np = parseInt(form.parc) || 0;
        if (np > 1) {
          const grupo = crypto.randomUUID();
          const inserts = [];
          for (let i = 0; i < np; i++) {
            inserts.push({
              user_id: user.id,
              descricao: form.desc + ' (' + (i + 1) + '/' + np + ')',
              tipo: form.tipo,
              valor: v,
              categoria_id: form.cat || null,
              data: u.addM(form.data, i),
              confirmado: i === 0 && form.conf,
              parcela_atual: i + 1,
              parcela_total: np,
              parcela_grupo: grupo
            });
          }
          await supabase.from('transacoes').insert(inserts);
          toast(np + ' parcelas criadas!', 's');
        } else if (form.rec) {
          const inserts = [];
          for (let i = 0; i < 12; i++) {
            inserts.push({
              user_id: user.id,
              descricao: form.desc,
              tipo: form.tipo,
              valor: v,
              categoria_id: form.cat || null,
              data: form.rec === 'mensal' ? u.addM(form.data, i) : form.data,
              confirmado: i === 0 && form.conf,
              recorrencia: form.rec
            });
          }
          await supabase.from('transacoes').insert(inserts);
          toast('Recorrência criada!', 's');
        } else {
          await supabase.from('transacoes').insert({
            user_id: user.id,
            descricao: form.desc,
            tipo: form.tipo,
            valor: v,
            categoria_id: form.cat || null,
            data: form.data,
            confirmado: form.conf
          });
          toast('Criado!', 's');
        }
      }
      await loadTrans();
      setModal(null);
    } catch (err) {
      toast('Erro ao salvar', 'e');
    }
    setSyncing(false);
  };

  const excluir = async (t) => {
    if (!confirm('Excluir esta transação?')) return;
    setSyncing(true);
    await supabase.from('transacoes').delete().eq('id', t.id);
    await loadTrans();
    toast('Excluído!', 's');
    setSyncing(false);
  };

  const toggleConf = async (t) => {
    setSyncing(true);
    await supabase.from('transacoes').update({ confirmado: !t.conf }).eq('id', t.id);
    await loadTrans();
    setSyncing(false);
  };

  const confSel = async () => {
    setSyncing(true);
    for (const id of sel) {
      await supabase.from('transacoes').update({ confirmado: true }).eq('id', id);
    }
    await loadTrans();
    toast(sel.size + ' confirmado(s)!', 's');
    setSel(new Set());
    setSyncing(false);
  };

  const toggleSel = (id) => { const n = new Set(sel); n.has(id) ? n.delete(id) : n.add(id); setSel(n); };

  const exportCSV = () => { const h = ['Data', 'Descrição', 'Tipo', 'Categoria', 'Valor', 'Confirmado']; const rows = transFilt.map(t => [u.fmtD(t.data), t.desc, t.tipo, cats.find(c => c.id === t.cat)?.nome || '', String(t.valor).replace('.', ','), t.conf ? 'Sim' : 'Não']); const csv = [h, ...rows].map(r => r.map(c => '"' + c + '"').join(';')).join('\n'); const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' }); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'financeiro_' + mes + '.csv'; a.click(); toast('CSV exportado!', 's'); };

  const abrirNovaCat = () => { setFormCat({ nome: '', cor: '#6366f1', tipo: 'despesa', meta: '' }); setEdit(null); setModal('cat'); };
  const abrirEditCat = (c) => { setFormCat({ nome: c.nome, cor: c.cor, tipo: c.tipo, meta: c.meta_mensal ? String(c.meta_mensal) : '' }); setEdit(c); setModal('cat'); };

  const salvarCat = async () => {
    if (!formCat.nome.trim()) { toast('Nome obrigatório', 'e'); return; }
    setSyncing(true);
    try {
      const meta = parseFloat(formCat.meta) || null;
      if (edit) {
        await supabase.from('categorias').update({ nome: formCat.nome, cor: formCat.cor, tipo: formCat.tipo, meta_mensal: meta }).eq('id', edit.id);
      } else {
        await supabase.from('categorias').insert({ user_id: user.id, nome: formCat.nome, cor: formCat.cor, tipo: formCat.tipo, meta_mensal: meta });
      }
      await loadCats();
      setModal(null);
      toast('Salvo!', 's');
    } catch (err) {
      toast('Erro ao salvar', 'e');
    }
    setSyncing(false);
  };

  const excluirCat = async (id) => {
    if (trans.some(t => t.cat === id)) { toast('Categoria em uso!', 'e'); return; }
    if (!confirm('Excluir categoria?')) return;
    setSyncing(true);
    await supabase.from('categorias').delete().eq('id', id);
    await loadCats();
    toast('Excluído!', 's');
    setSyncing(false);
  };

  const salvarCfg = async (novosCfg) => {
    setCfg(novosCfg);
    await supabase.from('configuracoes').update(novosCfg).eq('user_id', user.id);
  };

  const getCat = (id) => cats.find(c => c.id === id);
  const filtrosAtivos = filtro.tipo !== 'todos' || filtro.status !== 'todos' || filtro.cat !== 'todos';

  const s = {
    box: { minHeight: '100vh', background: th.bg, color: th.text, fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" },
    card: { background: th.card, borderRadius: r.lg, border: '1px solid ' + th.border, padding: cfg.modo_compacto ? '1rem' : '1.25rem' },
    inp: { width: '100%', background: th.input, border: '1px solid ' + th.border, borderRadius: r.md, padding: '0.875rem', color: th.text, fontSize: '1rem', outline: 'none', boxSizing: 'border-box' },
    btn1: { background: th.primary, color: '#fff', border: 'none', borderRadius: r.md, padding: '0.75rem 1.25rem', fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8 },
    btn2: { background: th.input, color: th.text, border: '1px solid ' + th.border, borderRadius: r.md, padding: '0.625rem 1rem', fontWeight: 500, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8 },
    btnR: { background: th.rec + '18', color: th.rec, border: '1px solid ' + th.rec + '40', borderRadius: r.md, padding: '0.875rem 1.5rem', fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8 },
    btnD: { background: th.desp + '18', color: th.desp, border: '1px solid ' + th.desp + '40', borderRadius: r.md, padding: '0.875rem 1.5rem', fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8 },
    ovl: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 50 },
    mdl: { background: th.card, borderRadius: '24px 24px 0 0', padding: '1.5rem', maxWidth: 500, width: '100%', maxHeight: '90vh', overflowY: 'auto' },
  };

  const css = `@keyframes slideIn{from{transform:translateX(100%);opacity:0}to{transform:translateX(0);opacity:1}}@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}button:active{transform:scale(.97)}input:focus,select:focus{border-color:${th.primary}!important}`;

  // Loading inicial de auth
  if (authLoading) return (
    <div style={{ minHeight: '100vh', background: '#0a0a0c', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <I.Loader />
    </div>
  );

  // Tela de login
  if (!user) return <LoginScreen th={th} r={r} />;

  // Loading de dados
  if (loading) return (
    <div style={s.box}>
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
        <I.Loader />
        <p style={{ color: th.muted }}>Carregando seus dados...</p>
      </div>
    </div>
  );

  const Pie = ({ data }) => { const t = data.reduce((a, d) => a + d.total, 0); if (t === 0) return <p style={{ color: th.muted, textAlign: 'center', padding: '2rem' }}>Sem despesas</p>; let ac = 0; return (<div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}><svg viewBox="-110 -110 220 220" style={{ width: 130, height: 130 }}>{data.map((d, i) => { const p = d.total / t, st = ac; ac += p; const x1 = Math.cos(2 * Math.PI * st) * 100, y1 = Math.sin(2 * Math.PI * st) * 100, x2 = Math.cos(2 * Math.PI * ac) * 100, y2 = Math.sin(2 * Math.PI * ac) * 100; return <path key={i} d={`M0,0 L${x1},${y1} A100,100 0 ${p > .5 ? 1 : 0},1 ${x2},${y2} Z`} fill={d.cor} style={{ cursor: 'pointer' }} onClick={() => { setFiltro({ ...filtro, cat: d.catId || 'todos' }); setTab('trans'); }} />; })}</svg><div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1, minWidth: 140 }}>{data.slice(0, 5).map((d, i) => (<div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }} onClick={() => { setFiltro({ ...filtro, cat: d.catId || 'todos' }); setTab('trans'); }}><div style={{ width: 10, height: 10, borderRadius: 3, background: d.cor }} /><span style={{ fontSize: 13, flex: 1 }}>{d.nome}</span><span style={{ fontSize: 12, color: th.muted }}>{u.fmt(d.total)}</span></div>))}</div></div>); };

  return (
    <div style={s.box}>
      <style>{css}</style>
      <Toast t={toasts} th={th} />

      <header style={{ background: th.card, borderBottom: '1px solid ' + th.border, padding: '0.875rem 1.25rem', position: 'sticky', top: 0, zIndex: 40 }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, background: th.primary, borderRadius: r.md, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}><I.Wallet /></div>
            <div><h1 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0 }}>Finanças</h1><p style={{ fontSize: 12, color: th.muted, margin: 0, display: 'flex', alignItems: 'center', gap: 4 }}>{syncing ? <I.Cloud /> : <I.Cloud />} {u.fmt(saldoReal)}</p></div>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <button onClick={() => salvarCfg({ ...cfg, tema: cfg.tema === 'dark' ? 'light' : 'dark' })} style={{ ...s.btn2, padding: 8, borderRadius: '50%' }}>{cfg.tema === 'dark' ? <I.Sun /> : <I.Moon />}</button>
            <button onClick={logout} style={{ ...s.btn2, padding: 8, borderRadius: '50%' }} title="Sair"><I.LogOut /></button>
          </div>
        </div>
      </header>

      <nav style={{ background: th.card, borderBottom: '1px solid ' + th.border, position: 'sticky', top: 66, zIndex: 30 }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', overflowX: 'auto' }}>
          {[{ id: 'dash', l: 'Início', i: <I.Home /> }, { id: 'trans', l: 'Transações', i: <I.List /> }, { id: 'cats', l: 'Categorias', i: <I.Tag /> }, { id: 'cfg', l: 'Config', i: <I.Settings /> }].map(x => (
            <button key={x.id} onClick={() => setTab(x.id)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0.75rem 1.25rem', background: 'transparent', border: 'none', borderBottom: tab === x.id ? '2px solid ' + th.primary : '2px solid transparent', color: tab === x.id ? th.text : th.muted, fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap' }}>{x.i}<span>{x.l}</span></button>
          ))}
        </div>
      </nav>

      <main style={{ maxWidth: 900, margin: '0 auto', padding: '1rem', paddingBottom: 100 }}>
        {tab === 'dash' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button onClick={() => abrirNova('receita')} style={s.btnR}><I.Up /> Receita</button>
              <button onClick={() => abrirNova('despesa')} style={s.btnD}><I.Down /> Despesa</button>
            </div>

            <div style={{ ...s.card, background: `linear-gradient(135deg, ${th.primary}18, ${th.primary}08)`, borderColor: th.primary + '30' }}>
              <p style={{ color: th.muted, fontSize: 13 }}>Saldo atual</p>
              <p style={{ fontSize: '1.875rem', fontWeight: 700, color: saldoReal >= 0 ? th.rec : th.desp, margin: 0 }}>{u.fmt(saldoReal)}</p>
            </div>

            {proxVenc.length > 0 && (
              <div style={{ ...s.card, borderColor: th.warn + '40', background: th.warn + '08', padding: '1rem' }}>
                <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8, color: th.warn }}><I.Clock /> Vence em breve</h3>
                {proxVenc.map(t => (<div key={t.id} onClick={() => abrirEdit(t)} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 10px', background: th.card, borderRadius: r.sm, cursor: 'pointer', marginBottom: 4 }}><span>{t.desc} <span style={{ fontSize: 11, color: th.dim }}>({u.diasAte(t.data)}d)</span></span><span style={{ fontWeight: 600, color: th.desp }}>{u.fmt(t.valor)}</span></div>))}
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
              <button onClick={() => setMes(u.navM(mes, -1))} style={{ ...s.btn2, padding: 6, borderRadius: '50%' }}><I.Left /></button>
              <h2 style={{ fontSize: '1rem', fontWeight: 600, textTransform: 'capitalize', minWidth: 150, textAlign: 'center', margin: 0 }}>{u.mesL(mes)}</h2>
              <button onClick={() => setMes(u.navM(mes, 1))} style={{ ...s.btn2, padding: 6, borderRadius: '50%' }}><I.Right /></button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
              <div style={{ ...s.card, padding: '0.875rem', cursor: 'pointer' }} onClick={() => { setFiltro({ ...filtro, tipo: 'receita' }); setTab('trans'); }}><p style={{ color: th.muted, fontSize: 11 }}>Receitas</p><p style={{ fontSize: '1.05rem', fontWeight: 700, color: th.rec, margin: 0 }}>{u.fmt(met.tR)}</p></div>
              <div style={{ ...s.card, padding: '0.875rem', cursor: 'pointer' }} onClick={() => { setFiltro({ ...filtro, tipo: 'despesa' }); setTab('trans'); }}><p style={{ color: th.muted, fontSize: 11 }}>Despesas</p><p style={{ fontSize: '1.05rem', fontWeight: 700, color: th.desp, margin: 0 }}>{u.fmt(met.tD)}</p></div>
              <div style={{ ...s.card, padding: '0.875rem' }}><p style={{ color: th.muted, fontSize: 11 }}>Saldo</p><p style={{ fontSize: '1.05rem', fontWeight: 700, color: met.saldo >= 0 ? th.rec : th.desp, margin: 0 }}>{u.fmt(met.saldo)}</p></div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '0.75rem' }}>
              <div style={s.card}>
                <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}><I.Bar /> Evolução</h3>
                {evol.map((x, i) => { const mx = Math.max(...evol.map(e => Math.max(e.r, e.d)), 1); return (<div key={i} style={{ marginBottom: 8 }}><div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}><span style={{ fontSize: 12, color: th.muted, textTransform: 'capitalize' }}>{x.mes}</span><span style={{ fontSize: 12, fontWeight: 600, color: x.r - x.d >= 0 ? th.rec : th.desp }}>{x.r - x.d >= 0 ? '+' : ''}{u.fmt(x.r - x.d)}</span></div><div style={{ display: 'flex', gap: 2, height: 5 }}><div style={{ width: (x.r / mx) * 100 + '%', background: th.rec, borderRadius: '2px 0 0 2px' }} /><div style={{ width: (x.d / mx) * 100 + '%', background: th.desp, borderRadius: '0 2px 2px 0' }} /></div></div>); })}
              </div>
              <div style={s.card}>
                <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}><I.Pie /> Por categoria</h3>
                <Pie data={met.cats} />
              </div>
            </div>
          </div>
        )}

        {tab === 'trans' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <button onClick={() => setMes(u.navM(mes, -1))} style={{ ...s.btn2, padding: 6 }}><I.Left /></button>
                <span style={{ fontWeight: 600, textTransform: 'capitalize', minWidth: 110, textAlign: 'center', fontSize: 14 }}>{u.mesL(mes)}</span>
                <button onClick={() => setMes(u.navM(mes, 1))} style={{ ...s.btn2, padding: 6 }}><I.Right /></button>
              </div>
              <button onClick={() => abrirNova()} style={{ ...s.btn1, padding: '10px 16px' }}><I.Plus /> Nova</button>
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <div style={{ flex: 1, position: 'relative' }}>
                <input type="text" placeholder="Buscar..." value={filtro.busca} onChange={e => setFiltro({ ...filtro, busca: e.target.value })} style={{ ...s.inp, paddingLeft: 40 }} />
                <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: th.muted }}><I.Search /></div>
              </div>
              <button onClick={() => setShowFiltro(!showFiltro)} style={{ ...s.btn2, background: filtrosAtivos ? th.primary + '18' : s.btn2.background, borderColor: filtrosAtivos ? th.primary : th.border, color: filtrosAtivos ? th.primary : th.text, padding: 10 }}><I.Filter /></button>
              <button onClick={exportCSV} style={{ ...s.btn2, padding: 10 }}><I.Download /></button>
            </div>

            {showFiltro && (
              <div style={{ ...s.card, padding: '0.875rem', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <select value={filtro.tipo} onChange={e => setFiltro({ ...filtro, tipo: e.target.value })} style={{ ...s.inp, width: 'auto', padding: '8px 12px' }}><option value="todos">Todos</option><option value="receita">Receitas</option><option value="despesa">Despesas</option></select>
                <select value={filtro.status} onChange={e => setFiltro({ ...filtro, status: e.target.value })} style={{ ...s.inp, width: 'auto', padding: '8px 12px' }}><option value="todos">Status</option><option value="conf">Confirmados</option><option value="pend">Pendentes</option></select>
                <select value={filtro.cat} onChange={e => setFiltro({ ...filtro, cat: e.target.value })} style={{ ...s.inp, width: 'auto', padding: '8px 12px' }}><option value="todos">Categoria</option>{cats.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}</select>
                {filtrosAtivos && <button onClick={() => setFiltro({ tipo: 'todos', status: 'todos', cat: 'todos', busca: '' })} style={{ ...s.btn2, padding: '8px 12px', color: th.desp }}>Limpar</button>}
              </div>
            )}

            <div style={{ display: 'flex', gap: 12 }}>
              <div style={{ flex: 1, padding: '10px 14px', background: th.card, borderRadius: r.md, border: '1px solid ' + th.border }}><p style={{ fontSize: 11, color: th.muted }}>Receitas</p><p style={{ fontSize: 15, fontWeight: 600, color: th.rec, margin: 0 }}>{u.fmt(met.tR)}</p></div>
              <div style={{ flex: 1, padding: '10px 14px', background: th.card, borderRadius: r.md, border: '1px solid ' + th.border }}><p style={{ fontSize: 11, color: th.muted }}>Despesas</p><p style={{ fontSize: 15, fontWeight: 600, color: th.desp, margin: 0 }}>{u.fmt(met.tD)}</p></div>
              <div style={{ flex: 1, padding: '10px 14px', background: th.card, borderRadius: r.md, border: '1px solid ' + th.border }}><p style={{ fontSize: 11, color: th.muted }}>Saldo</p><p style={{ fontSize: 15, fontWeight: 600, color: met.saldo >= 0 ? th.rec : th.desp, margin: 0 }}>{u.fmt(met.saldo)}</p></div>
            </div>

            {sel.size > 0 && (
              <div style={{ display: 'flex', gap: 8, padding: '10px 14px', background: th.primary + '15', borderRadius: r.md, alignItems: 'center', border: '1px solid ' + th.primary + '30' }}>
                <span style={{ flex: 1, fontWeight: 500 }}>{sel.size} selecionado(s)</span>
                <button onClick={confSel} style={{ ...s.btn1, padding: '8px 14px' }}><I.Check /> Confirmar</button>
                <button onClick={() => setSel(new Set())} style={{ ...s.btn2, padding: '8px 12px' }}>×</button>
              </div>
            )}

            {transFilt.length === 0 ? (
              <div style={{ ...s.card, textAlign: 'center', padding: '3rem' }}><I.List /><p style={{ marginTop: 16, color: th.muted }}>Nenhuma transação</p><button onClick={() => abrirNova()} style={{ ...s.btn1, marginTop: 16 }}><I.Plus /> Adicionar</button></div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: cfg.modo_compacto ? 4 : 8 }}>
                {transFilt.map(t => { const c = getCat(t.cat); const d = u.diasAte(t.data); const venc = !t.conf && d >= 0 && d <= 3; return (
                  <div key={t.id} style={{ ...s.card, padding: cfg.modo_compacto ? '10px' : '14px', display: 'flex', alignItems: 'center', gap: 10, borderColor: venc ? th.warn + '50' : sel.has(t.id) ? th.primary + '50' : th.border, background: sel.has(t.id) ? th.primary + '08' : th.card }}>
                    <input type="checkbox" checked={sel.has(t.id)} onChange={() => toggleSel(t.id)} style={{ width: 16, height: 16, accentColor: th.primary }} />
                    <button onClick={() => toggleConf(t)} style={{ width: 24, height: 24, borderRadius: 6, border: '2px solid ' + (t.conf ? th.rec : th.border), background: t.conf ? th.rec : 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>{t.conf && <I.Check />}</button>
                    <div style={{ flex: 1, minWidth: 0, cursor: 'pointer' }} onClick={() => abrirEdit(t)}>
                      <div style={{ fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.desc}</span>{t.rec && <I.Repeat />}{t.pTotal && <span style={{ fontSize: 10, padding: '2px 6px', background: th.primary + '20', color: th.primary, borderRadius: 4 }}>{t.pAtual}/{t.pTotal}</span>}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>{c && <span style={{ fontSize: 11, padding: '2px 8px', background: c.cor + '20', color: c.cor, borderRadius: 4 }}>{c.nome}</span>}<span style={{ fontSize: 12, color: venc ? th.warn : th.dim }}>{u.fmtD(t.data)}</span></div>
                    </div>
                    <span style={{ fontSize: '1rem', fontWeight: 600, color: t.tipo === 'receita' ? th.rec : th.desp }}>{t.tipo === 'receita' ? '+' : '-'}{u.fmt(t.valor)}</span>
                    <button onClick={() => duplicar(t)} style={{ ...s.btn2, padding: 6 }}><I.Copy /></button>
                    <button onClick={() => excluir(t)} style={{ ...s.btn2, padding: 6, color: th.desp }}><I.Trash /></button>
                  </div>
                ); })}
              </div>
            )}
          </div>
        )}

        {tab === 'cats' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}><h2 style={{ fontSize: '1rem', fontWeight: 600, margin: 0 }}>Categorias</h2><button onClick={abrirNovaCat} style={{ ...s.btn1, padding: '10px 16px' }}><I.Plus /> Nova</button></div>
            {met.cats.length > 0 && (
              <div style={s.card}><h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 10 }}>Gastos do mês</h3>{met.cats.map((x, i) => (<div key={i} onClick={() => { setFiltro({ ...filtro, cat: x.catId }); setTab('trans'); }} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 8, background: th.input, borderRadius: r.sm, cursor: 'pointer', marginBottom: 6 }}><div style={{ width: 10, height: 10, borderRadius: 3, background: x.cor }} /><span style={{ flex: 1, fontWeight: 500 }}>{x.nome}</span><span style={{ fontWeight: 600, color: th.desp }}>{u.fmt(x.total)}</span></div>))}</div>
            )}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 10 }}>
              {cats.map(cat => { const g = transMes.filter(t => t.cat === cat.id && t.tipo === 'despesa').reduce((a, t) => a + Number(t.valor), 0); const ultra = cat.meta_mensal && g > cat.meta_mensal; return (
                <div key={cat.id} style={{ ...s.card, padding: '1rem', borderLeft: '3px solid ' + cat.cor }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><div style={{ flex: 1 }}><div style={{ fontWeight: 600 }}>{cat.nome}</div><div style={{ fontSize: 12, color: th.muted }}>{cat.tipo}</div></div><button onClick={() => abrirEditCat(cat)} style={{ ...s.btn2, padding: 6 }}><I.Edit /></button><button onClick={() => excluirCat(cat.id)} style={{ ...s.btn2, padding: 6, color: th.desp }}><I.Trash /></button></div>
                  {cat.meta_mensal && (<div style={{ marginTop: 10 }}><div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 3 }}><span style={{ color: th.muted }}>Meta</span><span style={{ color: ultra ? th.desp : th.text }}>{u.fmt(g)} / {u.fmt(cat.meta_mensal)}</span></div><div style={{ height: 4, background: th.input, borderRadius: 2, overflow: 'hidden' }}><div style={{ width: Math.min((g / cat.meta_mensal) * 100, 100) + '%', height: '100%', background: ultra ? th.desp : cat.cor }} /></div></div>)}
                </div>
              ); })}
            </div>
          </div>
        )}

        {tab === 'cfg' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem', maxWidth: 400 }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 600, margin: 0 }}>Configurações</h2>

            <div style={s.card}>
              <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 10 }}>Conta</h3>
              <p style={{ fontSize: 13, color: th.muted, marginBottom: 8 }}>{user?.email}</p>
              <button onClick={logout} style={{ ...s.btn2, color: th.desp }}><I.LogOut /> Sair da conta</button>
            </div>

            <div style={s.card}><h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 10 }}>Aparência</h3>
              <button onClick={() => salvarCfg({ ...cfg, tema: cfg.tema === 'dark' ? 'light' : 'dark' })} style={{ ...s.btn2, width: '100%', justifyContent: 'space-between', marginBottom: 10 }}><span>Tema {cfg.tema === 'dark' ? 'escuro' : 'claro'}</span>{cfg.tema === 'dark' ? <I.Moon /> : <I.Sun />}</button>
              <button onClick={() => salvarCfg({ ...cfg, modo_compacto: !cfg.modo_compacto })} style={{ ...s.btn2, width: '100%', justifyContent: 'space-between', marginBottom: 10 }}><span>Modo {cfg.modo_compacto ? 'compacto' : 'normal'}</span></button>
              <p style={{ fontSize: 12, color: th.muted, marginBottom: 8 }}>Cor principal</p>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>{CORES_TEMA.map(cor => (<button key={cor} onClick={() => salvarCfg({ ...cfg, cor_primaria: cor })} style={{ width: 28, height: 28, borderRadius: 8, background: cor, border: cfg.cor_primaria === cor ? '2px solid #fff' : '2px solid transparent', cursor: 'pointer' }} />))}</div>
            </div>

            <div style={s.card}><h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 10 }}>Saldo inicial</h3>
              <input type="text" inputMode="decimal" value={String(cfg.saldo_inicial || 0)} onChange={e => { const v = parseFloat(e.target.value.replace(',', '.')) || 0; salvarCfg({ ...cfg, saldo_inicial: v }); }} style={{ ...s.inp, marginBottom: 10 }} />
              <div style={{ padding: 10, background: th.input, borderRadius: r.md }}><p style={{ fontSize: 12, color: th.muted }}>Saldo atual</p><p style={{ fontSize: '1.125rem', fontWeight: 700, color: saldoReal >= 0 ? th.rec : th.desp, margin: 0 }}>{u.fmt(saldoReal)}</p></div>
            </div>
          </div>
        )}
      </main>

      {tab !== 'cfg' && (<button onClick={() => abrirNova()} style={{ position: 'fixed', bottom: 24, right: 24, width: 56, height: 56, borderRadius: '50%', background: th.primary, color: '#fff', border: 'none', cursor: 'pointer', boxShadow: '0 4px 20px ' + th.primary + '50', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 30 }}><I.Plus /></button>)}

      {modal === 'trans' && (
        <div style={s.ovl} onClick={() => setModal(null)}>
          <div style={s.mdl} onClick={e => e.stopPropagation()}>
            <div style={{ width: 40, height: 4, background: th.border, borderRadius: 2, margin: '0 auto 1rem' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}><h3 style={{ fontSize: '1.05rem', fontWeight: 600, margin: 0 }}>{edit ? 'Editar' : 'Nova'}</h3><button onClick={() => setModal(null)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: th.muted }}><I.X /></button></div>
            <div style={{ display: 'flex', gap: 8, marginBottom: '1rem' }}>{['receita', 'despesa'].map(tipo => (<button key={tipo} onClick={() => setForm({ ...form, tipo, cat: '' })} style={{ flex: 1, padding: 12, borderRadius: r.md, border: '2px solid ' + (form.tipo === tipo ? (tipo === 'receita' ? th.rec : th.desp) : th.border), background: form.tipo === tipo ? (tipo === 'receita' ? th.rec : th.desp) + '15' : 'transparent', color: form.tipo === tipo ? (tipo === 'receita' ? th.rec : th.desp) : th.muted, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>{tipo === 'receita' ? <I.Up /> : <I.Down />}{tipo === 'receita' ? 'Receita' : 'Despesa'}</button>))}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div><label style={{ fontSize: 12, color: th.muted }}>Descrição *</label><input type="text" value={form.desc} onChange={e => setForm({ ...form, desc: e.target.value })} style={s.inp} autoFocus /></div>
              <div><label style={{ fontSize: 12, color: th.muted }}>Valor *</label><input type="text" inputMode="decimal" value={form.valor} onChange={e => setForm({ ...form, valor: e.target.value.replace(/[^0-9.,]/g, '') })} style={s.inp} /></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <div><label style={{ fontSize: 12, color: th.muted }}>Categoria</label><select value={form.cat} onChange={e => setForm({ ...form, cat: e.target.value })} style={s.inp}><option value="">Selecione</option>{cats.filter(c => c.tipo === form.tipo || c.tipo === 'ambos').map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}</select></div>
                <div><label style={{ fontSize: 12, color: th.muted }}>Data</label><input type="date" value={form.data} onChange={e => setForm({ ...form, data: e.target.value })} style={s.inp} /></div>
              </div>
              {!edit && (<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}><div><label style={{ fontSize: 12, color: th.muted }}>Recorrência</label><select value={form.rec} onChange={e => setForm({ ...form, rec: e.target.value, parc: '' })} style={s.inp} disabled={!!form.parc}><option value="">Única</option><option value="semanal">Semanal</option><option value="mensal">Mensal</option></select></div><div><label style={{ fontSize: 12, color: th.muted }}>Parcelas</label><input type="number" min="2" max="48" value={form.parc} onChange={e => setForm({ ...form, parc: e.target.value, rec: '' })} style={s.inp} disabled={!!form.rec} /></div></div>)}
              <label onClick={() => setForm({ ...form, conf: !form.conf })} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', padding: 10, background: th.input, borderRadius: r.md }}><div style={{ width: 20, height: 20, borderRadius: 5, border: '2px solid ' + (form.conf ? th.rec : th.border), background: form.conf ? th.rec : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>{form.conf && <I.Check />}</div><span>Já pago/recebido</span></label>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: '1.25rem' }}><button onClick={() => setModal(null)} style={{ ...s.btn2, flex: 1 }}>Cancelar</button><button onClick={salvarTrans} disabled={syncing} style={{ ...s.btn1, flex: 1, opacity: syncing ? 0.7 : 1 }}>{syncing ? <I.Loader /> : edit ? 'Salvar' : 'Criar'}</button></div>
          </div>
        </div>
      )}

      {modal === 'cat' && (
        <div style={s.ovl} onClick={() => setModal(null)}>
          <div style={s.mdl} onClick={e => e.stopPropagation()}>
            <div style={{ width: 40, height: 4, background: th.border, borderRadius: 2, margin: '0 auto 1rem' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}><h3 style={{ fontSize: '1.05rem', fontWeight: 600, margin: 0 }}>{edit ? 'Editar' : 'Nova'} categoria</h3><button onClick={() => setModal(null)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: th.muted }}><I.X /></button></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div><label style={{ fontSize: 12, color: th.muted }}>Nome *</label><input type="text" value={formCat.nome} onChange={e => setFormCat({ ...formCat, nome: e.target.value })} style={s.inp} autoFocus /></div>
              <div><label style={{ fontSize: 12, color: th.muted }}>Tipo</label><select value={formCat.tipo} onChange={e => setFormCat({ ...formCat, tipo: e.target.value })} style={s.inp}><option value="despesa">Despesa</option><option value="receita">Receita</option><option value="ambos">Ambos</option></select></div>
              <div><label style={{ fontSize: 12, color: th.muted }}>Meta mensal</label><input type="text" inputMode="decimal" value={formCat.meta} onChange={e => setFormCat({ ...formCat, meta: e.target.value.replace(/[^0-9.,]/g, '') })} style={s.inp} /></div>
              <div><label style={{ fontSize: 12, color: th.muted }}>Cor</label><div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 6 }}>{['#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16', '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6', '#ec4899', '#78716c'].map(cor => (<button key={cor} onClick={() => setFormCat({ ...formCat, cor })} style={{ width: 28, height: 28, borderRadius: 8, background: cor, border: formCat.cor === cor ? '2px solid #fff' : '2px solid transparent', cursor: 'pointer' }} />))}</div></div>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: '1.25rem' }}><button onClick={() => setModal(null)} style={{ ...s.btn2, flex: 1 }}>Cancelar</button><button onClick={salvarCat} disabled={syncing} style={{ ...s.btn1, flex: 1, opacity: syncing ? 0.7 : 1 }}>{syncing ? <I.Loader /> : edit ? 'Salvar' : 'Criar'}</button></div>
          </div>
        </div>
      )}
    </div>
  );
}
