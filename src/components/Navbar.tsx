import React from 'react';
import { UserProfile } from '../types';
import {
  Database,
  PlusCircle,
  BookOpen,
  SlidersHorizontal,
  Users,
  LogOut,
  LogIn,
} from 'lucide-react';

interface NavbarProps {
  currentTab: 'list' | 'editor' | 'users';
  onSelectTab: (tab: 'list' | 'editor' | 'users') => void;
  user: UserProfile | null;
  onOpenConfig: () => void;
  onOpenLogin: () => void;
  onOpenRegister: () => void;
  onSignOut: () => void;
  isSupabaseConnected: boolean;
  totalIntegralsCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  user,
  onOpenConfig,
  onOpenLogin,
  onOpenRegister,
  onSignOut,
  isSupabaseConnected,
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

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenConfig}
            className="flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-medium bg-white/10 hover:bg-white/20 text-purple-100 transition-colors"
          >
            <Database className="w-3 h-3 text-espol-gold" />
            <span className="hidden sm:inline">
              {isSupabaseConnected ? 'Supabase Conectado' : 'Modo Demo / Local'}
            </span>
            <SlidersHorizontal className="w-2.5 h-2.5 opacity-70" />
          </button>
        </div>
      </div>

      {/* Barra de Navegación Principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Brand & Título */}
          <div className="flex items-center gap-3.5">
            <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-fcnm-dark via-fcnm to-fcnm-violet flex items-center justify-center text-white font-serif text-2xl font-bold shadow-md shadow-fcnm/30 border border-fcnm-border/40">
              ∫
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg sm:text-xl text-fcnm-dark tracking-tight">
                  Torneo de Integrales
                </span>
                <span className="text-[11px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-fcnm-light text-fcnm border border-fcnm-border">
                  ESPOL
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Portal de Curación y Banco de Ejercicios
              </p>
            </div>
          </div>

          {/* Si el usuario ha iniciado sesión: Mostrar pestañas de trabajo */}
          {user ? (
            <div className="flex items-center gap-3">
              {/* Botones de Navegación Centrales */}
              <nav className="flex items-center gap-1.5 sm:gap-2">
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
                  <span className="hidden sm:inline">Subir Integral</span>
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
                    <span className="hidden sm:inline">Colaboradores</span>
                  </button>
                )}
              </nav>

              {/* Carnet de Usuario y Rol */}
              <div className="flex items-center gap-2 pl-2 border-l border-purple-100">
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
            <div className="flex items-center gap-2.5">
              <button
                onClick={onOpenLogin}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-fcnm hover:bg-purple-50 transition-colors"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Iniciar Sesión</span>
              </button>

              <button
                onClick={onOpenRegister}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-fcnm hover:bg-fcnm-hover text-white shadow-sm transition-all"
              >
                <span>Registrarme</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
