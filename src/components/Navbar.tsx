import React from 'react';
import { UserProfile, UserRole } from '../types';
import {
  Database,
  Shield,
  MonitorPlay,
  PlusCircle,
  BookOpen,
  SlidersHorizontal,
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
                Plataforma de Curaduría y Banco de Problemas
              </p>
            </div>
          </div>

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

            <button
              onClick={() => onSelectTab('projector')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-bold transition-all duration-200 ${
                currentTab === 'projector'
                  ? 'bg-fcnm-dark text-white shadow-md shadow-fcnm-dark/40 translate-y-[-1px]'
                  : 'text-slate-600 hover:text-fcnm hover:bg-purple-50'
              }`}
            >
              <MonitorPlay className="w-4 h-4 text-espol-gold" />
              <span className="hidden sm:inline">Modo Proyector</span>
            </button>
          </nav>

          {/* Selector de Rol de Colaborador */}
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-purple-50/70 border border-purple-200/80 rounded-xl px-3 py-1.5 shadow-sm">
              <Shield className="w-4 h-4 text-fcnm mr-1.5" />
              <div className="flex flex-col text-left">
                <span className="text-[10px] uppercase font-bold text-fcnm-deep leading-none">
                  Rol Activo:
                </span>
                <select
                  aria-label="Seleccionar rol de colaborador"
                  value={user.role}
                  onChange={(e) => onChangeRole(e.target.value as UserRole)}
                  className="bg-transparent text-xs font-bold text-fcnm-dark focus:outline-none cursor-pointer pr-1 leading-tight mt-0.5"
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
