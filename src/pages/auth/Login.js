import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LogIn, Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(email, password);

      if (result.success) {
        console.log('✅ Login sucesso, usuário:', result.user);

        if (result.user?.role === 'ADMIN') {
          navigate('/admin/dashboard');
        } else if (result.user?.role === 'CORRETOR') {
          navigate('/corretor/dashboard');
        } else {
          setError('Tipo de usuário não autorizado');
        }
      } else {
        setError(result.message || 'Email ou senha incorretos');
      }
    } catch (err) {
      console.error('❌ Erro no login:', err);
      setError('Erro ao fazer login. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F7] flex items-center justify-center p-4">

      {/* Blobs decorativos */}
      <div className="fixed top-[-20%] left-[-10%] w-[480px] h-[480px] bg-blue-300/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="fixed bottom-[-20%] right-[-10%] w-[480px] h-[480px] bg-indigo-300/20 rounded-full blur-[100px] pointer-events-none" />

      <div className="bg-white rounded-2xl shadow-xl shadow-black/[0.07] border border-gray-100 p-8 w-full max-w-md relative">

        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-black tracking-tight text-gray-900 leading-none">MOVV</h1>
          <p className="text-[11px] font-semibold tracking-[0.25em] text-gray-400 uppercase mt-1">Software</p>
          <p className="text-gray-500 text-sm mt-3">Acesse o painel de corretores</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Campo Email */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
              E-mail
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 disabled:opacity-50 transition-all"
              placeholder="seu@email.com"
              required
              autoComplete="email"
              disabled={loading}
            />
          </div>

          {/* Campo Senha */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
              Senha
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 pr-11 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 disabled:opacity-50 transition-all"
                placeholder="••••••••"
                required
                autoComplete="current-password"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Mensagem de Erro */}
          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm flex items-start gap-2">
              <span className="mt-0.5">⚠</span>
              <span>{error}</span>
            </div>
          )}

          {/* Botão de Login */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gray-900 hover:bg-gray-800 active:scale-[0.98] text-white font-semibold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-gray-900/20 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <LogIn size={18} />
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-gray-100" />
          <span className="text-[10px] font-medium text-gray-300 uppercase tracking-widest">acesso restrito</span>
          <div className="flex-1 h-px bg-gray-100" />
        </div>

      

        <div className="mt-4 text-center text-xs text-gray-400">
          <p>Acesso para Administradores e Corretores</p>
        </div>
      </div>
    </div>
  );
};

export default Login;