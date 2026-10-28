import React, { useState } from 'react';
import { AuthService } from '../lib/supabase';
import { UserProfile } from '../types';
import { X, LogIn, UserPlus, Lock, Mail, User, AlertCircle, CheckCircle2, Hash } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  initialTab?: 'login' | 'register';
  onClose: () => void;
  onAuthSuccess: (user: UserProfile) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  initialTab = 'login',
  onClose,
  onAuthSuccess,
}) => {
  const [tab, setTab] = useState<'login' | 'register'>(initialTab);

  React.useEffect(() => {
    if (isOpen) {
      setTab(initialTab);
      setErrorMsg('');
      setSuccessMsg('');
    }
  }, [isOpen, initialTab]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [matricula, setMatricula] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (tab === 'register') {
      if (!fullName.trim()) {
        setErrorMsg('Por favor ingresa tu nombre y apellido completo.');
        return;
      }
      const cleanMatricula = matricula.trim();
      if (!cleanMatricula || !/^\d{9}$/.test(cleanMatricula)) {
        setErrorMsg('El número de matrícula debe tener exactamente 9 dígitos numéricos (ej: 202204589).');
        return;
      }
    }

    setLoading(true);

    const cleanEmail = email.trim().toLowerCase();

    try {
      if (tab === 'login') {
        const { user, error } = await AuthService.signIn(cleanEmail, password);
        if (error) {
          setErrorMsg(error);
          return;
        }
        if (user) {
          onAuthSuccess(user);
          onClose();
        } else {
          setErrorMsg('No se pudo iniciar sesión. Verifica tu conexión a internet o tus credenciales.');
        }
      } else {
        const { user, error } = await AuthService.signUp(cleanEmail, password, fullName, matricula);
        if (error) {
          setErrorMsg(error);
          return;
        }
        if (user) {
          setSuccessMsg('¡Cuenta registrada con éxito! Iniciando sesión...');
          setTimeout(() => {
            onAuthSuccess(user);
            onClose();
          }, 1200);
        } else {
          setErrorMsg('No se pudo completar el registro. Intenta de nuevo.');
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al procesar la solicitud.';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white border border-purple-100 rounded-3xl max-w-md w-full shadow-2xl overflow-hidden">
        {/* Header con estilo Morado FCNM */}
        <div className="bg-fcnm-dark p-6 text-white flex items-center justify-between border-b border-fcnm">
          <div>
            <h3 className="text-lg font-bold">
              {tab === 'login' ? 'Iniciar Sesión' : 'Registro de Colaborador'}
            </h3>
            <p className="text-xs text-purple-200 mt-0.5">
              Torneo de Integrales • Club MatEs
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-purple-200 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Pestañas Login vs Register */}
        <div className="flex border-b border-purple-100 bg-purple-50/50">
          <button
            onClick={() => {
              setTab('login');
              setErrorMsg('');
            }}
            className={`flex-1 py-3 text-xs font-bold text-center border-b-2 transition-all flex items-center justify-center gap-2 ${
              tab === 'login'
                ? 'border-fcnm text-fcnm bg-white'
                : 'border-transparent text-slate-500 hover:text-fcnm'
            }`}
          >
            <LogIn className="w-4 h-4" /> Ya tengo cuenta
          </button>
          <button
            onClick={() => {
              setTab('register');
              setErrorMsg('');
            }}
            className={`flex-1 py-3 text-xs font-bold text-center border-b-2 transition-all flex items-center justify-center gap-2 ${
              tab === 'register'
                ? 'border-fcnm text-fcnm bg-white'
                : 'border-transparent text-slate-500 hover:text-fcnm'
            }`}
          >
            <UserPlus className="w-4 h-4" /> Crear cuenta
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2 font-medium">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {tab === 'register' && (
            <>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Nombre y Apellidos
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-3 text-purple-400" />
                  <input
                    type="text"
                    required
                    placeholder="Ej: Eduardo Morales"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-slate-50 border border-purple-100 focus:border-fcnm rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none transition-all shadow-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Número de Matrícula (9 dígitos)
                </label>
                <div className="relative">
                  <Hash className="w-4 h-4 absolute left-3.5 top-3 text-purple-400" />
                  <input
                    type="text"
                    required
                    inputMode="numeric"
                    maxLength={9}
                    pattern="[0-9]{9}"
                    placeholder="Ej: 202204589"
                    value={matricula}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '').slice(0, 9);
                      setMatricula(val);
                    }}
                    className="w-full bg-slate-50 border border-purple-100 focus:border-fcnm rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none transition-all shadow-sm font-mono tracking-wider"
                  />
                </div>
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Requerido para control de colaboradores (no participantes del torneo).
                </span>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Correo Electrónico
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-3 text-purple-400" />
              <input
                type="email"
                required
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck="false"
                inputMode="email"
                placeholder="colaborador@espol.edu.ec"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 border border-purple-100 focus:border-fcnm rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none transition-all shadow-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Contraseña
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-3 text-purple-400" />
              <input
                type="password"
                required
                minLength={6}
                autoCapitalize="none"
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 border border-purple-100 focus:border-fcnm rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none transition-all shadow-sm"
              />
            </div>
          </div>

          {tab === 'register' && (
            <p className="text-[11px] text-slate-500 bg-purple-50/70 p-2.5 rounded-xl border border-purple-100">
              ℹ Al registrarte, tu cuenta quedará habilitada para <strong>Nivel Básico</strong>. El administrador podrá asignarte nivel Medio o Difícil.
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-fcnm hover:bg-fcnm-hover text-white text-sm font-bold rounded-xl shadow-md transition-all duration-200 mt-2"
          >
            {loading ? 'Procesando...' : tab === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta'}
          </button>
        </form>
      </div>
    </div>
  );
};
