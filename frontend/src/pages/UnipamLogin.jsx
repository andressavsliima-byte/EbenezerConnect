import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../api';

function UnipamLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await authAPI.login({ email, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      localStorage.setItem('lastEmail', res.data.user.email || '');
      if (res.data.user.role === 'admin') navigate('/admin');
      else navigate('/catalogo');
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao fazer login. Verifique suas credenciais.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#0f1115]">
      {/* Left banner (desktop only) */}
      <div className="hidden md:flex md:w-1/2 relative">
        <div className="absolute inset-0 bg-white" />
        <div className="relative z-10 flex items-center justify-center w-full h-full">
          <img
            src="/images/unipam-banner.jpg"
            alt="UNIPAM Banner"
            className="w-full h-full object-cover opacity-95"
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
        </div>
      </div>

      {/* Right form */}
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-black rounded-xl shadow p-8">
          <div className="flex flex-col items-center mb-6">
            <img
              src="/images/recicla-ebenezer.png"
              alt="Recicla Ebenezer"
              className="h-32 w-auto object-contain"
              onError={(e) => { e.currentTarget.src = '/images/logo.png'; }}
            />
          </div>

          {error && (
            <div className="mb-4 text-sm text-red-400">{error}</div>
          )}

          <form onSubmit={onSubmit}>
            <label className="block text-sm font-medium text-white">Usuário</label>
            <div className="mt-1 relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-transparent outline-none py-2 border-b border-[#00ff66] focus:border-[#00ff66] text-white placeholder-gray-300"
              />
            </div>

            <label className="block mt-6 text-sm font-medium text-white">Senha</label>
            <div className="mt-1 relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-transparent outline-none py-2 pr-16 border-b border-[#00ff66] focus:border-[#00ff66] text-white placeholder-gray-300"
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-0 top-1/2 -translate-y-1/2 text-white text-sm px-2"
              >
                {showPassword ? 'Ocultar' : 'Mostrar'}
              </button>
            </div>

            {/* Cloudflare-like checkbox */}
            <div className="mt-6">
              <label className="flex items-center gap-3 border rounded-md p-3 bg-[#0f1115] border-gray-700">
                <input type="checkbox" className="w-4 h-4" />
                <div>
                  <div className="text-sm font-medium text-white">Confirme que é humano</div>
                  <div className="text-xs text-gray-400">Privacidade · Termos</div>
                </div>
                <div className="ml-auto text-xs font-semibold text-gray-400">CLOUDFLARE</div>
              </label>
            </div>

            {/* Forgot password link removed per request */}

            <button
              type="submit"
              disabled={loading}
              className={`mt-6 w-full ${loading ? 'bg-green-400' : 'bg-green-600 hover:bg-green-700'} text-white font-semibold py-2 rounded-md shadow-sm`}
            >
              {loading ? 'ENTRANDO...' : 'ENTRAR'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default UnipamLogin;
