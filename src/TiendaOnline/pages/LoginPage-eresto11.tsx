import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();

  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const logged = localStorage.getItem('rcco_user_logged');
    if (logged === 'true') {
      const role = localStorage.getItem('rcco_role');
      navigate(role === 'admin' ? '/registradosEvento' : '/materiales');
    }
  }, []);

  const login = (e: React.FormEvent) => {
    e.preventDefault();

    // Login para admin
    if (usuario === 'admin' && password === 'Rcco2025!') {
      localStorage.setItem('rcco_user_logged', 'true');
      localStorage.setItem('rcco_role', 'admin');
      navigate('/registradosEvento');
      return;
    }

    // Login para usuario normal
    if (usuario === 'prueba' && password === 'Rcco2025!') {
      localStorage.setItem('rcco_user_logged', 'true');
      localStorage.setItem('rcco_role', 'user');
      navigate('/materiales');
      return;
    }

    // Si no coincide →
    setError('Usuario o contraseña incorrectos');
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-100 px-6">
      <div className="w-full max-w-md bg-white shadow-xl rounded-2xl p-8 border border-slate-200">
        <h1 className="text-3xl font-bold text-[#0A3C8C] text-center mb-6">
          Acceso al Simposio
        </h1>

        <form onSubmit={login} className="space-y-5">
          <div>
            <label className="text-sm text-slate-700">Usuario</label>
            <input
              type="text"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              className="w-full mt-1 px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 outline-none"
              placeholder="Ingresa tu usuario"
            />
          </div>

          <div>
            <label className="text-sm text-slate-700">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full mt-1 px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 outline-none"
              placeholder="Ingresa tu contraseña"
            />
          </div>

          {error && (
            <p className="text-red-600 text-sm font-medium text-center">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-semibold shadow-lg transition"
          >
            Ingresar
          </button>
        </form>
      </div>
    </main>
  );
};
