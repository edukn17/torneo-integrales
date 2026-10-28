import React, { useState, useMemo } from 'react';
import { Integral, UserRole, LEVEL_LABELS, PHASE_LABELS, ROLE_HIERARCHY } from '../types';
import { MathView } from './MathView';
import {
  Search,
  Eye,
  EyeOff,
  Copy,
  Check,
  Tag,
  Clock,
  BookOpen,
  Trash2,
  Edit3,
} from 'lucide-react';

interface IntegralListProps {
  integrals: Integral[];
  userRole: UserRole;
  onEdit: (integral: Integral) => void;
  onDelete: (id: string) => void;
  onAddNew: () => void;
}

export const IntegralList: React.FC<IntegralListProps> = ({
  integrals,
  userRole,
  onEdit,
  onDelete,
  onAddNew,
}) => {
  const [search, setSearch] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('todos');
  const [selectedPhase, setSelectedPhase] = useState<string>('todas');
  const [revealedSolutions, setRevealedSolutions] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const allowedLevels = ROLE_HIERARCHY[userRole];

  // Filtrado jerárquico y por búsqueda
  const filteredIntegrals = useMemo(() => {
    return integrals.filter((item) => {
      // 1. Restricción estricta de jerarquía por rol
      if (!allowedLevels.includes(item.difficulty_level)) {
        return false;
      }

      // 2. Filtro de dificultad seleccionado por el usuario
      if (selectedDifficulty !== 'todos' && item.difficulty_level !== selectedDifficulty) {
        return false;
      }

      // 3. Filtro de fase
      if (selectedPhase !== 'todas' && item.phase !== selectedPhase) {
        return false;
      }

      // 4. Búsqueda de texto
      if (search.trim()) {
        const query = search.toLowerCase();
        const inTitle = item.title.toLowerCase().includes(query);
        const inLatex = item.latex_code.toLowerCase().includes(query);
        const inTags = item.tags.some((t) => t.toLowerCase().includes(query));
        const inSource = item.source_reference.toLowerCase().includes(query);
        return inTitle || inLatex || inTags || inSource;
      }

      return true;
    });
  }, [integrals, allowedLevels, selectedDifficulty, selectedPhase, search]);

  const toggleSolution = (id: string) => {
    setRevealedSolutions((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCopyLatex = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Contadores por nivel accesibles
  const stats = useMemo(() => {
    const basicoCount = integrals.filter((i) => i.difficulty_level === 'basico').length;
    const medioCount = integrals.filter((i) => i.difficulty_level === 'medio').length;
    const dificilCount = integrals.filter((i) => i.difficulty_level === 'dificil').length;
    return { basicoCount, medioCount, dificilCount };
  }, [integrals]);

  return (
    <div className="space-y-6">
      {/* Banner Informativo de Acceso Jerárquico */}
      <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-5 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                Acceso Habilitado: Nivel {userRole.toUpperCase()}
              </span>
              <span className="text-xs text-slate-400">
                {filteredIntegrals.length} {filteredIntegrals.length === 1 ? 'integral visible' : 'integrales visibles'}
              </span>
            </div>
            <h2 className="text-xl font-bold text-white mt-1">
              Banco Colaborativo de Ejercicios
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              De acuerdo con tu nivel, puedes explorar y proponer integrales para las fases autorizadas.
              {userRole === 'basico' && ' Tienes acceso exclusivo a las integrales de Fase 1 (Clasificación).'}
              {userRole === 'medio' && ' Tienes acceso a integrales de Fase 1 (Clasificación) y Fase 2 (Eliminatorias).'}
              {userRole === 'dificil' && ' Tienes acceso completo a todas las fases del torneo (Básico, Medio y Difícil).'}
              {userRole === 'admin' && ' Posees permisos de Administrador Académico para auditar y gestionar el banco completo.'}
            </p>
          </div>

          {/* Quick Stats Badges */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <div className="bg-slate-900/80 border border-emerald-500/30 rounded-xl px-3 py-2 text-center">
              <div className="text-[11px] text-emerald-400 font-semibold uppercase">Básico</div>
              <div className="text-lg font-bold text-white">{stats.basicoCount}</div>
            </div>

            <div
              className={`rounded-xl px-3 py-2 text-center border ${
                allowedLevels.includes('medio')
                  ? 'bg-slate-900/80 border-amber-500/30'
                  : 'bg-slate-900/30 border-slate-800 opacity-40'
              }`}
            >
              <div className="text-[11px] text-amber-400 font-semibold uppercase">Medio</div>
              <div className="text-lg font-bold text-white">
                {allowedLevels.includes('medio') ? stats.medioCount : '🔒'}
              </div>
            </div>

            <div
              className={`rounded-xl px-3 py-2 text-center border ${
                allowedLevels.includes('dificil')
                  ? 'bg-slate-900/80 border-rose-500/30'
                  : 'bg-slate-900/30 border-slate-800 opacity-40'
              }`}
            >
              <div className="text-[11px] text-rose-400 font-semibold uppercase">Difícil</div>
              <div className="text-lg font-bold text-white">
                {allowedLevels.includes('dificil') ? stats.dificilCount : '🔒'}
              </div>
            </div>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-5 pt-4 border-t border-slate-700/50">
          {/* Search */}
          <div className="relative col-span-1 sm:col-span-2">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por título, fórmula LaTeX, etiqueta o referencia..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-900/90 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Filter by Difficulty */}
          <div>
            <select
              aria-label="Filtrar por nivel de dificultad"
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="todos">Todos los niveles accesibles</option>
              {allowedLevels.includes('basico') && <option value="basico">Nivel Básico (Fase 1)</option>}
              {allowedLevels.includes('medio') && <option value="medio">Nivel Medio (Fase 2)</option>}
              {allowedLevels.includes('dificil') && <option value="dificil">Nivel Difícil (Fase 3)</option>}
            </select>
          </div>

          {/* Filter by Phase */}
          <div>
            <select
              aria-label="Filtrar por fase del torneo"
              value={selectedPhase}
              onChange={(e) => setSelectedPhase(e.target.value)}
              className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="todas">Todas las fases</option>
              <option value="fase1_clasificacion">Fase 1: Clasificación</option>
              {allowedLevels.includes('medio') && (
                <option value="fase2_eliminatorias">Fase 2: Rondas Eliminatorias</option>
              )}
              {allowedLevels.includes('dificil') && (
                <option value="fase3_finales">Fase 3: Semifinales y Final</option>
              )}
            </select>
          </div>
        </div>
      </div>

      {/* Grid de Ejercicios */}
      {filteredIntegrals.length === 0 ? (
        <div className="bg-slate-800/30 border border-dashed border-slate-700 rounded-2xl p-12 text-center">
          <BookOpen className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-slate-300">No se encontraron integrales</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto mt-1">
            No hay ejercicios registrados que coincidan con los filtros o tu nivel de acceso actual.
          </p>
          <button
            onClick={onAddNew}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-blue-500/20 transition-all"
          >
            Subir una nueva integral
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredIntegrals.map((integral) => {
            const levelInfo = LEVEL_LABELS[integral.difficulty_level];
            const isRevealed = !!revealedSolutions[integral.id];
            const isCopied = copiedId === integral.id;

            return (
              <div
                key={integral.id}
                className="bg-slate-800/80 border border-slate-700/80 hover:border-slate-600 rounded-2xl p-5 shadow-lg flex flex-col justify-between transition-all group"
              >
                <div>
                  {/* Card Header: Level Badge, Phase & Actions */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${levelInfo.badge}`}
                      >
                        {levelInfo.label}
                      </span>
                      <span className="text-[11px] text-slate-400 font-medium">
                        {PHASE_LABELS[integral.phase].split(':')[0]}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleCopyLatex(integral.id, integral.latex_code)}
                        className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700/80 rounded-lg transition-colors"
                        title="Copiar código LaTeX"
                      >
                        {isCopied ? (
                          <Check className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                      {(userRole === 'admin' || integral.status === 'propuesta') && (
                        <>
                          <button
                            onClick={() => onEdit(integral)}
                            className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-slate-700/80 rounded-lg transition-colors"
                            title="Editar integral"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          {userRole === 'admin' && (
                            <button
                              onClick={() => onDelete(integral.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-700/80 rounded-lg transition-colors"
                              title="Eliminar del banco"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="font-semibold text-white text-base leading-snug">
                    {integral.title}
                  </h3>

                  {/* Formula Preview Box (KaTeX) */}
                  <div className="mt-3.5 mb-4 p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-center min-h-[90px] shadow-inner text-xl">
                    <MathView math={integral.latex_code} block={true} />
                  </div>

                  {/* Tags & Meta */}
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {integral.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md bg-slate-700/50 text-slate-300 font-medium"
                      >
                        <Tag className="w-2.5 h-2.5 opacity-60" />
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Reference / Source */}
                  {integral.source_reference && (
                    <p className="text-xs text-slate-400 flex items-center gap-1 mb-2">
                      <BookOpen className="w-3.5 h-3.5 text-blue-400" />
                      <span className="font-medium text-slate-300">Fuente:</span> {integral.source_reference}
                    </p>
                  )}
                </div>

                {/* Card Footer: Solution Drawer & Details */}
                <div className="mt-3 pt-3 border-t border-slate-700/60">
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => toggleSolution(integral.id)}
                      className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all ${
                        isRevealed
                          ? 'bg-blue-600/20 text-blue-300 border-blue-500/40 hover:bg-blue-600/30'
                          : 'bg-slate-700/40 text-slate-300 border-slate-600/40 hover:bg-slate-700/70'
                      }`}
                    >
                      {isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      {isRevealed ? 'Ocultar Solución' : 'Ver Solución Oficial'}
                    </button>

                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {Math.round(integral.time_limit_seconds / 60)} min
                    </span>
                  </div>

                  {/* Collapsible Solution Container */}
                  {isRevealed && (
                    <div className="mt-3 p-3.5 rounded-xl bg-slate-900/90 border border-blue-500/30 text-sm animate-fadeIn space-y-2">
                      <div className="text-xs font-bold uppercase tracking-wider text-blue-400">
                        Respuesta Principal:
                      </div>
                      <div className="py-1 text-emerald-300 font-mono text-base bg-slate-950/60 rounded-lg px-2 border border-slate-800">
                        <MathView math={integral.solution_latex} block={true} />
                      </div>

                      {/* Alternative Solutions */}
                      {integral.alternative_solutions && integral.alternative_solutions.length > 0 && (
                        <div>
                          <div className="text-[11px] font-semibold text-slate-400 uppercase mt-2">
                            Formas algebraicamente equivalentes válidas:
                          </div>
                          <ul className="list-disc list-inside text-xs text-slate-300 space-y-1 mt-1">
                            {integral.alternative_solutions.map((alt, i) => (
                              <li key={i} className="font-mono text-xs text-slate-300">
                                <MathView math={alt} block={false} />
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Notes / Criteria */}
                      {integral.notes && (
                        <div className="text-xs text-slate-400 pt-2 border-t border-slate-800">
                          <span className="font-semibold text-slate-300">Criterio del jurado:</span>{' '}
                          {integral.notes}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
