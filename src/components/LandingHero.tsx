import React from 'react';
import {
  LogIn,
  UserPlus,
  CheckCircle2,
  ShieldCheck,
  GraduationCap,
} from 'lucide-react';

interface LandingHeroProps {
  onOpenLogin: () => void;
  onOpenRegister: () => void;
}

export const LandingHero: React.FC<LandingHeroProps> = ({
  onOpenLogin,
  onOpenRegister,
}) => {
  return (
    <div className="space-y-12 animate-fadeIn max-w-5xl mx-auto py-6">
      {/* Sección Principal / Hero */}
      <div className="text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-50 border border-purple-200 text-fcnm text-xs font-bold uppercase tracking-wider shadow-sm">
          <GraduationCap className="w-4 h-4" /> Club MatEs • AEFIEC • IEEE-HKN Nu Zeta (ESPOL)
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-fcnm-dark tracking-tight leading-tight">
          Torneo de Integrales <span className="text-fcnm">2026</span>
        </h1>

        <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Plataforma oficial para la <strong>recolección, curaduría y administración de ejercicios</strong> para el concurso de integración matemática estilo <em>Integration Bee</em> de la ESPOL.
        </p>

        {/* Llamado a la Acción para Colaboradores */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3.5">
          <button
            onClick={onOpenRegister}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 bg-fcnm hover:bg-fcnm-hover text-white text-sm font-bold rounded-2xl shadow-lg shadow-fcnm/25 transition-all duration-200 transform hover:-translate-y-0.5"
          >
            <UserPlus className="w-4 h-4" />
            Registrarme como Colaborador
          </button>

          <button
            onClick={onOpenLogin}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 bg-white hover:bg-purple-50 text-fcnm-deep border border-purple-200 text-sm font-bold rounded-2xl shadow-sm transition-all duration-200"
          >
            <LogIn className="w-4 h-4" />
            Ya tengo cuenta / Iniciar Sesión
          </button>
        </div>

        <p className="text-xs text-slate-400">
          Nota: Los colaboradores registrados con su número de matrícula forman parte del comité organizador y no podrán participar en el concurso.
        </p>
      </div>

      {/* Tarjetas Informativas de las 3 Fases del Torneo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        {/* Fase 1 */}
        <div className="bg-white rounded-3xl p-6 border border-purple-100 shadow-fcnm hover:shadow-fcnm-hover transition-all space-y-3 flex flex-col justify-between">
          <div className="space-y-3">
            <div>
              <span className="inline-flex items-center px-3.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-extrabold text-xs uppercase tracking-wider">
                Fase 1
              </span>
            </div>
            <h3 className="font-bold text-slate-800 text-base">Clasificación Escrita</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Evaluación masiva en aulas con un tiempo límite de 1h30. Quienes resuelvan al menos 10 integrales de dificultad baja clasifican a la siguiente ronda.
            </p>
          </div>
          <div className="pt-2 text-[11px] font-semibold text-emerald-700 flex items-center gap-1.5 border-t border-slate-100">
            <CheckCircle2 className="w-3.5 h-3.5" /> Nivel de Ejercicios: Básico
          </div>
        </div>

        {/* Fase 2 */}
        <div className="bg-white rounded-3xl p-6 border border-purple-100 shadow-fcnm hover:shadow-fcnm-hover transition-all space-y-3 flex flex-col justify-between">
          <div className="space-y-3">
            <div>
              <span className="inline-flex items-center px-3.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 font-extrabold text-xs uppercase tracking-wider">
                Fase 2
              </span>
            </div>
            <h3 className="font-bold text-slate-800 text-base">Duelos Eliminatorios</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Enfrentamientos directos 1 vs 1 en pizarras con proyector. Rondas de 16 y cuartos de final con 10 minutos por integral al mejor de 5 duelos.
            </p>
          </div>
          <div className="pt-2 text-[11px] font-semibold text-amber-800 flex items-center gap-1.5 border-t border-slate-100">
            <CheckCircle2 className="w-3.5 h-3.5" /> Nivel de Ejercicios: Medio
          </div>
        </div>

        {/* Fase 3 */}
        <div className="bg-white rounded-3xl p-6 border border-purple-100 shadow-fcnm hover:shadow-fcnm-hover transition-all space-y-3 flex flex-col justify-between">
          <div className="space-y-3">
            <div>
              <span className="inline-flex items-center px-3.5 py-1 rounded-full bg-purple-50 text-fcnm border border-purple-200 font-extrabold text-xs uppercase tracking-wider">
                Fase 3
              </span>
            </div>
            <h3 className="font-bold text-slate-800 text-base">Semifinales y Gran Final</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Realizadas en el Auditorio Pedro Franco Dávila. Integrales de alta complejidad con 5 minutos por problema ante jurado y público.
            </p>
          </div>
          <div className="pt-2 text-[11px] font-semibold text-fcnm flex items-center gap-1.5 border-t border-slate-100">
            <CheckCircle2 className="w-3.5 h-3.5" /> Nivel de Ejercicios: Difícil
          </div>
        </div>
      </div>

      {/* Banner de Lineamientos para Colaboradores */}
      <div className="bg-gradient-to-br from-fcnm-dark to-purple-900 text-white rounded-3xl p-8 shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 text-espol-gold text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" /> Comité Académico de Curaduría
            </div>
            <h3 className="text-2xl font-bold">
              ¿Cómo funciona la asignación de niveles?
            </h3>
            <p className="text-xs text-purple-200 leading-relaxed">
              Al registrarte con tu matrícula, tu cuenta se habilitará en <strong>Nivel Básico</strong>. El coordinador de MatEs revisará tu usuario y te asignará los permisos correspondientes (Medio, Difícil o Administrador) para que puedas comenzar a subir y clasificar integrales en la plataforma.
            </p>
          </div>

          <button
            onClick={onOpenRegister}
            className="px-5 py-3 rounded-xl bg-espol-gold hover:bg-espol-goldHover text-fcnm-dark text-xs font-extrabold uppercase tracking-wider shadow-md transition-all shrink-0"
          >
            Registrarse ahora
          </button>
        </div>
      </div>
    </div>
  );
};
