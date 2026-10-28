import React from 'react';
import { UserProfile } from '../types';
import {
  PlusCircle,
  BookOpen,
  Users,
  LogOut,
  LogIn,
} from 'lucide-react';

interface NavbarProps {
  currentTab: 'list' | 'editor' | 'users';
  onSelectTab: (tab: 'list' | 'editor' | 'users') => void;
  user: UserProfile | null;
  onOpenLogin: () => void;
  onOpenRegister: () => void;
  onSignOut: () => void;
  totalIntegralsCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  user,
  onOpenLogin,
  onOpenRegister,
  onSignOut,
  totalIntegralsCount,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-purple-100 shadow-fcnm">
      {/* Cintillo Superior Delgado en Morado FCNM */}
      <div className="bg-fcnm-dark text-purple-200 text-xs px-4 sm:px-6 lg:px-8 py-1.5 flex items-center justify-between border-b border-fcnm/40">
        <div className="flex items-center gap-2 tracking-wide font-medium">
          <span className="font-extrabold text-espol-gold tracking-wider">MATES</span>
          <span className="text-purple-400">|</span>
          <span className="text-purple-200">Torneo de Integrales</span>
          <span className="text-purple-400 hidden sm:inline">•</span>
          <span className="text-purple-300/80 hidden sm:inline">AEFIEC &amp; IEEE-HKN Nu Zeta</span>
        </div>

        <div className="text-[11px] text-purple-300 font-medium">
          Edición 2026
        </div>
      </div>

      {/* Barra de Navegación Principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Brand & Título */}
          <div className="flex items-center gap-2.5 sm:gap-3.5">
            <div className="h-9 w-9 sm:h-11 sm:w-11 rounded-xl bg-gradient-to-br from-fcnm-dark via-fcnm to-fcnm-violet flex items-center justify-center text-white font-serif text-xl sm:text-2xl font-bold shadow-md shadow-fcnm/30 border border-fcnm-border/40 shrink-0">
              ∫
            </div>
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="font-extrabold text-base sm:text-xl text-fcnm-dark tracking-tight">
                  Torneo de Integrales
                </span>
                <span className="text-[10px] sm:text-[11px] font-bold tracking-wider uppercase px-1.5 sm:px-2 py-0.5 rounded-full bg-fcnm-light text-fcnm border border-fcnm-border">
                  ESPOL
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-500 font-medium hidden sm:block">
                Portal de Curación y Banco de Ejercicios
              </p>
            </div>
          </div>

          {/* Si el usuario ha iniciado sesión: Mostrar pestañas de trabajo */}
          {user ? (
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Botones de Navegación Centrales (Desktop) */}
              <nav className="hidden md:flex items-center gap-1.5 sm:gap-2">
                <button
                  onClick={() => onSelectTab('list')}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-bold transition-all duration-200 ${
                    currentTab === 'list'
                      ? 'bg-fcnm text-white shadow-md shadow-fcnm/30 translate-y-[-1px]'
                      : 'text-slate-600 hover:text-fcnm hover:bg-purple-50'
                  }`}
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Banco</span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                      currentTab === 'list'
                        ? 'bg-white/20 text-white'
                        : 'bg-purple-100 text-fcnm'
                    }`}
                  >
                    {totalIntegralsCount}
                  </span>
                </button>

                <button
                  onClick={() => onSelectTab('editor')}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-bold transition-all duration-200 ${
                    currentTab === 'editor'
                      ? 'bg-fcnm text-white shadow-md shadow-fcnm/30 translate-y-[-1px]'
                      : 'text-slate-600 hover:text-fcnm hover:bg-purple-50'
                  }`}
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Subir Integral</span>
                </button>

                {/* Pestaña de Gestión de Colaboradores exclusiva para Admin */}
                {user.role === 'admin' && (
                  <button
                    onClick={() => onSelectTab('users')}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-bold transition-all duration-200 ${
                      currentTab === 'users'
                        ? 'bg-fcnm text-white shadow-md shadow-fcnm/30 translate-y-[-1px]'
                        : 'text-slate-600 hover:text-fcnm hover:bg-purple-50'
                    }`}
                    title="Administrar roles de colaboradores"
                  >
                    <Users className="w-4 h-4" />
                    <span>Colaboradores</span>
                  </button>
                )}
              </nav>

              {/* Carnet de Usuario y Rol */}
              <div className="flex items-center gap-2 sm:pl-2 sm:border-l sm:border-purple-100">
                {/* Desktop User Info */}
                <div className="flex flex-col text-right hidden md:block">
                  <span className="text-xs font-bold text-slate-800 leading-tight">
                    {user.full_name || user.email}
                  </span>
                  <div className="flex items-center justify-end gap-1.5 mt-0.5">
                    {user.matricula && (
                      <span className="text-[10px] font-mono text-purple-600 font-bold bg-purple-50 px-1.5 py-0.2 rounded border border-purple-200">
                        {user.matricula}
                      </span>
                    )}
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.2 rounded-full border ${
                        user.role === 'admin'
                          ? 'bg-purple-100 text-purple-900 border-purple-300'
                          : user.role === 'dificil'
                          ? 'bg-fcnm-light text-fcnm border-fcnm-border'
                          : user.role === 'medio'
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      }`}
                    >
                      {user.role === 'admin' ? 'Admin' : `Nivel ${user.role}`}
                    </span>
                  </div>
                </div>

                {/* Mobile Compact User Badge */}
                <div className="md:hidden flex items-center gap-1.5">
                  <span
                    className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                      user.role === 'admin'
                        ? 'bg-purple-100 text-purple-900 border-purple-300'
                        : user.role === 'dificil'
                        ? 'bg-fcnm-light text-fcnm border-fcnm-border'
                        : user.role === 'medio'
                        ? 'bg-amber-50 text-amber-800 border-amber-200'
                        : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    }`}
                  >
                    {user.role === 'admin' ? 'Admin' : user.role}
                  </span>
                </div>

                <button
                  onClick={onSignOut}
                  className="flex items-center gap-1.5 p-2 rounded-xl text-xs font-bold text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  title="Cerrar sesión"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            /* Si no ha iniciado sesión: Mostrar botones de Acceso */
            <div className="flex items-center gap-1.5 sm:gap-2.5">
              <button
                onClick={onOpenLogin}
                className="flex items-center gap-1 px-2.5 sm:px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-fcnm hover:bg-purple-50 transition-colors"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">Iniciar Sesión</span>
                <span className="xs:hidden">Entrar</span>
              </button>

              <button
                onClick={onOpenRegister}
                className="flex items-center gap-1 px-3 sm:px-4 py-2 rounded-xl text-xs font-bold bg-fcnm hover:bg-fcnm-hover text-white shadow-sm transition-all"
              >
                <span className="hidden xs:inline">Registrarme</span>
                <span className="xs:hidden">Registro</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Barra de Navegación Inferior Fija para Móviles (Solo con sesión iniciada) */}
      {user && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-purple-100 px-3 py-1.5 flex items-center justify-around shadow-[0_-4px_20px_rgba(107,33,168,0.08)]">
          <button
            onClick={() => onSelectTab('list')}
            className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl text-[11px] font-bold transition-all ${
              currentTab === 'list' ? 'text-fcnm' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <div className="relative">
              <BookOpen className="w-5 h-5" />
              <span className="absolute -top-1 -right-2 text-[9px] px-1 py-0.1 bg-fcnm text-white rounded-full font-bold">
                {totalIntegralsCount}
              </span>
            </div>
            <span>Banco</span>
          </button>

          <button
            onClick={() => onSelectTab('editor')}
            className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl text-[11px] font-bold transition-all ${
              currentTab === 'editor' ? 'text-fcnm' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <PlusCircle className="w-5 h-5" />
            <span>Subir</span>
          </button>

          {user.role === 'admin' && (
            <button
              onClick={() => onSelectTab('users')}
              className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl text-[11px] font-bold transition-all ${
                currentTab === 'users' ? 'text-fcnm' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <Users className="w-5 h-5" />
              <span>Colaboradores</span>
            </button>
          )}
        </div>
      )}
    </header>
  );
};
