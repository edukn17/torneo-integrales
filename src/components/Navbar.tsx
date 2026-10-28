import React from 'react';
import { UserProfile, UserRole } from '../types';
import {
  Database,
  Shield,
  MonitorPlay,
  PlusCircle,
  BookOpen,
  SlidersHorizontal,
  GraduationCap,
  Sparkles,
} from 'lucide-react';

interface NavbarProps {
  currentTab: 'list' | 'editor' | 'projector';
  onSelectTab: (tab: 'list' | 'editor' | 'projector') => void;
  user: UserProfile;
  onChangeRole: (role: UserRole) => void;
  onOpenConfig: () => void;
  isSupabaseConnected: boolean;
  totalIntegralsCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  user,
  onChangeRole,
  onOpenConfig,
  isSupabaseConnected,
  totalIntegralsCount,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-espol">
      {/* Cintillo Superior Institucional ESPOL / FCNM */}
      <div className="bg-espol-navy text-white text-xs px-4 sm:px-6 lg:px-8 py-1.5 flex items-center justify-between border-b-2 border-espol-gold">
        <div className="flex items-center gap-2 tracking-wide font-medium">
          <GraduationCap className="w-3.5 h-3.5 text-espol-gold" />
          <span className="font-bold text-espol-gold">ESPOL</span>
          <span className="text-slate-400">|</span>
          <span className="text-slate-200 hidden sm:inline">Facultad de Ciencias Naturales y Matemáticas (FCNM)</span>
          <span className="text-slate-400 hidden sm:inline">•</span>
          <span className="text-slate-300 hidden md:inline">Club MatEs &amp; AEFIEC &amp; IEEE-HKN</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenConfig}
            className="flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium bg-white/10 hover:bg-white/20 text-slate-200 transition-colors"
          >
            <Database className="w-3 h-3 text-espol-gold" />
            <span className="hidden sm:inline">
              {isSupabaseConnected ? 'Base de Datos: Conectada' : 'Modo: Local / Demo'}
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
            <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-espol-navy via-espol-blue to-espol-bright flex items-center justify-center text-white font-serif text-2xl font-bold shadow-md shadow-espol-bright/20 border border-espol-navy/20">
              ∫
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg sm:text-xl text-espol-navy tracking-tight">
                  Torneo de Integrales
                </span>
                <span className="text-[11px] font-bold tracking-wider uppercase px-2 py-0.5 rounded bg-espol-goldLight text-espol-navy border border-espol-gold/40">
                  MatEs
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Portal de Curación y Banco de Ejercicios
              </p>
            </div>
          </div>

          {/* Botones de Navegación Centrales */}
          <nav className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={() => onSelectTab('list')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                currentTab === 'list'
                  ? 'bg-espol-bright text-white shadow-md shadow-espol-bright/30 translate-y-[-1px]'
                  : 'text-slate-600 hover:text-espol-navy hover:bg-slate-100'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Banco</span>
              <span
                className={`text-xs px-1.5 py-0.2 rounded-full font-bold ${
                  currentTab === 'list'
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-200 text-slate-700'
                }`}
              >
                {totalIntegralsCount}
              </span>
            </button>

            <button
              onClick={() => onSelectTab('editor')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                currentTab === 'editor'
                  ? 'bg-espol-bright text-white shadow-md shadow-espol-bright/30 translate-y-[-1px]'
                  : 'text-slate-600 hover:text-espol-navy hover:bg-slate-100'
              }`}
            >
              <PlusCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Nueva Integral</span>
            </button>

            <button
              onClick={() => onSelectTab('projector')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                currentTab === 'projector'
                  ? 'bg-espol-navy text-white shadow-md shadow-espol-navy/30 translate-y-[-1px]'
                  : 'text-slate-600 hover:text-espol-navy hover:bg-slate-100'
              }`}
            >
              <MonitorPlay className="w-4 h-4 text-espol-gold" />
              <span className="hidden sm:inline">Modo Proyector</span>
            </button>
          </nav>

          {/* Selector de Rol de Colaborador */}
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-slate-100 border border-slate-200 rounded-xl px-2.5 py-1.5 shadow-sm">
              <Shield className="w-4 h-4 text-espol-navy mr-1.5" />
              <div className="flex flex-col text-left">
                <span className="text-[10px] uppercase font-bold text-slate-500 leading-none">
                  Rol Activo:
                </span>
                <select
                  aria-label="Seleccionar rol de colaborador"
                  value={user.role}
                  onChange={(e) => onChangeRole(e.target.value as UserRole)}
                  className="bg-transparent text-xs font-bold text-espol-navy focus:outline-none cursor-pointer pr-1 leading-tight mt-0.5"
                >
                  <option value="admin">Administrador (Todo)</option>
                  <option value="dificil">Nivel Difícil (D + M + B)</option>
                  <option value="medio">Nivel Medio (M + B)</option>
                  <option value="basico">Nivel Básico (Solo B)</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
