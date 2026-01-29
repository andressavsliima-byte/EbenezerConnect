import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../api';

function UnipamLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [captchaToken, setCaptchaToken] = useState('');
  const [turnstileReady, setTurnstileReady] = useState(false);
  const widgetRef = useRef(null);
  const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY || '1x00000000000000000000AA';

  useEffect(() => {
    const prevBody = document.body.style.backgroundColor;
    const prevHtml = document.documentElement.style.backgroundColor;
    try {
      document.body.style.backgroundColor = '#dce6b0';
      document.documentElement.style.backgroundColor = '#dce6b0';
    } catch {}
    return () => {
      try {
        document.body.style.backgroundColor = prevBody || '';
        document.documentElement.style.backgroundColor = prevHtml || '';
      } catch {}
    };
  }, []);

  // Load Cloudflare Turnstile widget once
  useEffect(() => {
    if (!siteKey) return;

    let widgetId = null;
    let scriptEl = document.querySelector('script[data-turnstile]');

    const renderWidget = () => {
      if (!window.turnstile || widgetId !== null || !widgetRef.current) return;
      widgetId = window.turnstile.render(widgetRef.current, {
        sitekey: siteKey,
        theme: 'light',
        callback: (token) => {
          setCaptchaToken(token);
          setError('');
        },
        'expired-callback': () => setCaptchaToken(''),
        'error-callback': () => setCaptchaToken(''),
      });
      setTurnstileReady(true);
    };

    if (window.turnstile) {
      renderWidget();
    } else {
      if (!scriptEl) {
        scriptEl = document.createElement('script');
        scriptEl.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
        scriptEl.async = true;
        scriptEl.defer = true;
        scriptEl.dataset.turnstile = 'true';
        scriptEl.onload = renderWidget;
        document.body.appendChild(scriptEl);
      } else {
        scriptEl.onload = renderWidget;
      }
    }

    return () => {
      if (window.turnstile && widgetId !== null) {
        try {
          window.turnstile.reset(widgetId);
        } catch {}
      }
      // do not remove script to avoid reloading for other pages
    };
  }, [siteKey]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!captchaToken) {
      setError('Por favor, confirme que é humano antes de entrar.');
      return;
    }
    setLoading(true);
    try {
      const res = await authAPI.login({ email, password, turnstileToken: captchaToken });
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
    <div className="min-h-screen flex bg-[#dce6b0]">
      {/* Left banner (desktop only) */}
      <div className="hidden md:flex md:w-1/2 relative">
        <div
          className="absolute inset-0 bg-white bg-cover bg-center"
          style={{ backgroundImage: 'url(/images/Arte%20para%20ar%C3%A9a%20de%20login%202.jpg)' }}
          aria-label="Ilustração da área de login"
        />
        <Link
          to="/"
          className="absolute top-6 left-6 z-10 inline-flex items-center gap-2 text-gray-800 hover:text-green-700 font-semibold"
          aria-label="Voltar para a página inicial"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="h-6 w-6"
            aria-hidden="true"
          >
            <path d="M15.75 19.5a.75.75 0 0 1-.53-.22l-6-6a.75.75 0 0 1 0-1.06l6-6a.75.75 0 0 1 1.06 1.06L10.81 12l5.47 5.47a.75.75 0 0 1-.53 1.28Z" />
          </svg>
          <span>Voltar</span>
        </Link>
      </div>

      {/* Right form */}
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-md rounded-xl shadow p-8" style={{ backgroundColor: '#4b6b36' }}>
          <div className="flex flex-col items-center mb-6">
            <img
              src="/images/recicla-ebenezer.png"
              alt="Recicla Ebenezer"
              className="h-32 w-auto object-contain"
              loading="eager"
              fetchpriority="high"
              decoding="sync"
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

            <div className="mt-6">
              {siteKey ? (
                <div
                  ref={widgetRef}
                  className="turnstile-widget"
                  aria-label="Desafio Cloudflare Turnstile"
                />
              ) : (
                <div className="text-sm text-red-200 bg-red-800/30 border border-red-700 rounded-md p-3">
                  Configure a variável VITE_TURNSTILE_SITE_KEY para habilitar o desafio de segurança.
                </div>
              )}
            </div>

            {/* Forgot password link removed per request */}

            <button
              type="submit"
              disabled={loading || !captchaToken || !turnstileReady}
              className={`mt-6 w-full ${loading || !captchaToken || !turnstileReady ? 'bg-[#75b528] cursor-not-allowed' : 'bg-[#75b528] hover:bg-[#6aa323]'} text-white font-semibold py-2 rounded-md shadow-sm`}
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
