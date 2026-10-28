import React from 'react';
import { UserProfile, UserRole } from '../types';
import { Database, Shield, MonitorPlay, PlusCircle, BookOpen, SlidersHorizontal } from 'lucide-react';

interface NavbarProps {
  currentTab: 'list' | 'editor' | 'projector';
  onSelectTab: (tab: 'list' | 'editor' | 'projector') => void;
  user: UserProfile;
  onChangeRole: (role: UserRole) => void;
  onOpenConfig: () => void;
  isSupabaseConnected: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  user,
  onChangeRole,
  onOpenConfig,
  isSupabaseConnected,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand & Organizers */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center font-bold text-xl text-white shadow-lg shadow-blue-500/20 border border-blue-400/30">
              ∫
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-blue-300 bg-clip-text text-transparent">
                  Torneo de Integrales
                </span>
                <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  Banco MatEs
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Club MatEs • AEFIEC • IEEE-HKN Nu Zeta (ESPOL)
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => onSelectTab('list')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                currentTab === 'list'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span className="hidden md:inline">Banco de Integrales</span>
            </button>

            <button
              onClick={() => onSelectTab('editor')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                currentTab === 'editor'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <PlusCircle className="w-4 h-4" />
              <span className="hidden md:inline">Subir Integral</span>
            </button>

            <button
              onClick={() => onSelectTab('projector')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                currentTab === 'projector'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
              title="Vista para duelos en pizarras y auditorio"
            >
              <MonitorPlay className="w-4 h-4" />
              <span className="hidden md:inline">Modo Proyector</span>
            </button>
          </nav>

          {/* User Role & Supabase Status */}
          <div className="flex items-center gap-3">
            {/* Supabase Status Pill */}
            <button
              onClick={onOpenConfig}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
                isSupabaseConnected
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                  : 'bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/20'
              }`}
              title="Ver estado de conexión y esquema SQL"
            >
              <Database className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">
                {isSupabaseConnected ? 'Supabase Activo' : 'Modo Local / Demo'}
              </span>
              <SlidersHorizontal className="w-3 h-3 opacity-60" />
            </button>

            {/* Role Selector Pill */}
            <div className="relative flex items-center bg-slate-800/80 border border-slate-700/80 rounded-lg p-1">
              <Shield className="w-3.5 h-3.5 text-slate-400 ml-1.5 mr-1" />
              <span className="text-xs text-slate-400 hidden xl:inline mr-1">Rol:</span>
              <select
                aria-label="Seleccionar rol de colaborador"
                value={user.role}
                onChange={(e) => onChangeRole(e.target.value as UserRole)}
                className="bg-transparent text-xs font-semibold text-slate-200 focus:outline-none cursor-pointer pr-1"
              >
                <option value="admin" className="bg-slate-900 text-slate-100">
                  Admin (Todo)
                </option>
                <option value="dificil" className="bg-slate-900 text-rose-300">
                  Nivel Difícil (D+M+B)
                </option>
                <option value="medio" className="bg-slate-900 text-amber-300">
                  Nivel Medio (M+B)
                </option>
                <option value="basico" className="bg-slate-900 text-emerald-300">
                  Nivel Básico (Solo B)
                </option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
