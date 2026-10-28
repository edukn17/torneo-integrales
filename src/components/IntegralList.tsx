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
  LayoutGrid,
  List,
  Lock,
  Unlock,
  PlusCircle,
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
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
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

      // 3. Búsqueda de texto
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
  }, [integrals, allowedLevels, selectedDifficulty, search]);

  const toggleSolution = (id: string) => {
    setRevealedSolutions((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCopyLatex = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  // Contadores por fase/nivel
  const stats = useMemo(() => {
    const basicoCount = integrals.filter((i) => i.difficulty_level === 'basico').length;
    const medioCount = integrals.filter((i) => i.difficulty_level === 'medio').length;
    const dificilCount = integrals.filter((i) => i.difficulty_level === 'dificil').length;
    return { basicoCount, medioCount, dificilCount };
  }, [integrals]);

  return (
    <div className="space-y-6">
      {/* Panel Superior: Tarjetas de Estado por Fase (Estilo FCNM ESPOL) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card Fase 1 - Básico */}
        <div
          onClick={() => setSelectedDifficulty(selectedDifficulty === 'basico' ? 'todos' : 'basico')}
          className={`cursor-pointer bg-white rounded-2xl p-4 border transition-all duration-300 shadow-espol hover:shadow-espol-hover ${
            selectedDifficulty === 'basico'
              ? 'border-emerald-500 ring-2 ring-emerald-500/20'
              : 'border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1.5">
              <Unlock className="w-3 h-3 text-emerald-600" /> Nivel Básico
            </span>
            <span className="text-2xl font-extrabold text-slate-800">{stats.basicoCount}</span>
          </div>
          <h4 className="font-bold text-slate-800 text-sm mt-3">Fase 1: Clasificación</h4>
          <p className="text-xs text-slate-500 mt-0.5">
            Examen escrito masivo (tiempo límite 1h30). Mínimo 10 para clasificar.
          </p>
        </div>

        {/* Card Fase 2 - Medio */}
        <div
          onClick={() => {
            if (allowedLevels.includes('medio')) {
              setSelectedDifficulty(selectedDifficulty === 'medio' ? 'todos' : 'medio');
            }
          }}
          className={`rounded-2xl p-4 border transition-all duration-300 shadow-espol ${
            allowedLevels.includes('medio')
              ? 'bg-white cursor-pointer hover:shadow-espol-hover border-slate-200'
              : 'bg-slate-100/70 opacity-60 border-dashed border-slate-300 cursor-not-allowed'
          } ${
            selectedDifficulty === 'medio' ? 'border-amber-500 ring-2 ring-amber-500/20' : ''
          }`}
        >
          <div className="flex items-center justify-between">
            <span
              className={`text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border flex items-center gap-1.5 ${
                allowedLevels.includes('medio')
                  ? 'text-amber-800 bg-amber-50 border-amber-200'
                  : 'text-slate-500 bg-slate-200 border-slate-300'
              }`}
            >
              {allowedLevels.includes('medio') ? (
                <Unlock className="w-3 h-3 text-amber-600" />
              ) : (
                <Lock className="w-3 h-3 text-slate-500" />
              )}{' '}
              Nivel Medio
            </span>
            <span className="text-2xl font-extrabold text-slate-800">
              {allowedLevels.includes('medio') ? stats.medioCount : '🔒'}
            </span>
          </div>
          <h4 className="font-bold text-slate-800 text-sm mt-3">Fase 2: Eliminatorias</h4>
          <p className="text-xs text-slate-500 mt-0.5">
            Duelos de 16 y 8 en pizarra con proyector (10 min por integral).
          </p>
        </div>

        {/* Card Fase 3 - Difícil */}
        <div
          onClick={() => {
            if (allowedLevels.includes('dificil')) {
              setSelectedDifficulty(selectedDifficulty === 'dificil' ? 'todos' : 'dificil');
            }
          }}
          className={`rounded-2xl p-4 border transition-all duration-300 shadow-espol ${
            allowedLevels.includes('dificil')
              ? 'bg-white cursor-pointer hover:shadow-espol-hover border-slate-200'
              : 'bg-slate-100/70 opacity-60 border-dashed border-slate-300 cursor-not-allowed'
          } ${
            selectedDifficulty === 'dificil' ? 'border-rose-500 ring-2 ring-rose-500/20' : ''
          }`}
        >
          <div className="flex items-center justify-between">
            <span
              className={`text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border flex items-center gap-1.5 ${
                allowedLevels.includes('dificil')
                  ? 'text-rose-700 bg-rose-50 border-rose-200'
                  : 'text-slate-500 bg-slate-200 border-slate-300'
              }`}
            >
              {allowedLevels.includes('dificil') ? (
                <Unlock className="w-3 h-3 text-rose-600" />
              ) : (
                <Lock className="w-3 h-3 text-slate-500" />
              )}{' '}
              Nivel Difícil
            </span>
            <span className="text-2xl font-extrabold text-slate-800">
              {allowedLevels.includes('dificil') ? stats.dificilCount : '🔒'}
            </span>
          </div>
          <h4 className="font-bold text-slate-800 text-sm mt-3">Fase 3: Semis &amp; Gran Final</h4>
          <p className="text-xs text-slate-500 mt-0.5">
            Auditorio Pedro Franco Dávila (5 min por integral).
          </p>
        </div>
      </div>

      {/* Barra de Filtros, Búsqueda y Modos de Vista */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-espol space-y-4">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Input de Búsqueda */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por fórmula LaTeX, título, autor, fuente o etiqueta..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 focus:border-espol-bright rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none transition-all"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-600"
              >
                Limpiar
              </button>
            )}
          </div>

          {/* Selector de Nivel en Píldoras */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => setSelectedDifficulty('todos')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedDifficulty === 'todos'
                  ? 'bg-espol-navy text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Todos ({filteredIntegrals.length})
            </button>
            {allowedLevels.includes('basico') && (
              <button
                onClick={() => setSelectedDifficulty('basico')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  selectedDifficulty === 'basico'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200/60'
                }`}
              >
                Básicas
              </button>
            )}
            {allowedLevels.includes('medio') && (
              <button
                onClick={() => setSelectedDifficulty('medio')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  selectedDifficulty === 'medio'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-200/60'
                }`}
              >
                Medias
              </button>
            )}
            {allowedLevels.includes('dificil') && (
              <button
                onClick={() => setSelectedDifficulty('dificil')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  selectedDifficulty === 'dificil'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-200/60'
                }`}
              >
                Difíciles
              </button>
            )}
          </div>

          {/* Conmutador de Vista (Cuadrícula vs Tabla) */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 self-end lg:self-auto">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg text-xs font-medium transition-all ${
                viewMode === 'grid'
                  ? 'bg-white text-espol-navy shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
              title="Vista en Tarjetas"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs font-medium transition-all ${
                viewMode === 'table'
                  ? 'bg-white text-espol-navy shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
              title="Vista Compacta en Tabla"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Grid de Ejercicios */}
      {filteredIntegrals.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-slate-200 rounded-3xl p-12 text-center shadow-sm">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-700">No se encontraron integrales</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            No hay ejercicios registrados que coincidan con los criterios de búsqueda o tu nivel de acceso.
          </p>
          <button
            onClick={onAddNew}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-espol-bright hover:bg-espol-blue text-white text-xs font-bold rounded-xl shadow-md transition-all"
          >
            <PlusCircle className="w-4 h-4" /> Registrar una integral
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        /* Vista en Cuadrícula de Tarjetas Institucionales */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredIntegrals.map((integral) => {
            const levelInfo = LEVEL_LABELS[integral.difficulty_level];
            const isRevealed = !!revealedSolutions[integral.id];
            const isCopied = copiedId === integral.id;

            return (
              <div
                key={integral.id}
                className="bg-white border border-slate-200 hover:border-espol-bright/40 rounded-2xl p-5 shadow-espol hover:shadow-espol-hover transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  {/* Header de Tarjeta */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${levelInfo.badge}`}
                      >
                        {levelInfo.label}
                      </span>
                      <span className="text-[11px] text-slate-500 font-medium bg-slate-100 px-2 py-0.5 rounded-md">
                        {PHASE_LABELS[integral.phase].split(':')[0]}
                      </span>
                    </div>

                    {/* Acciones de Tarjeta */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleCopyLatex(integral.id, integral.latex_code)}
                        className="p-1.5 text-slate-400 hover:text-espol-bright hover:bg-slate-100 rounded-lg transition-colors"
                        title="Copiar código LaTeX"
                      >
                        {isCopied ? (
                          <Check className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                      {(userRole === 'admin' || integral.status === 'propuesta') && (
                        <>
                          <button
                            onClick={() => onEdit(integral)}
                            className="p-1.5 text-slate-400 hover:text-espol-bright hover:bg-slate-100 rounded-lg transition-colors"
                            title="Editar integral"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          {userRole === 'admin' && (
                            <button
                              onClick={() => onDelete(integral.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-lg transition-colors"
                              title="Eliminar del banco"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  {/* Título */}
                  <h3 className="font-bold text-slate-800 text-sm leading-snug">
                    {integral.title}
                  </h3>

                  {/* Lienzo KaTeX Matemático FCNM */}
                  <div className="mt-3.5 mb-3.5 p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-center min-h-[95px] text-xl font-serif text-slate-900 group-hover:bg-blue-50/20 group-hover:border-espol-bright/30 transition-all">
                    <MathView math={integral.latex_code} block={true} />
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {integral.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-medium"
                      >
                        <Tag className="w-2.5 h-2.5 opacity-50" />
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Fuente / Referencia */}
                  {integral.source_reference && (
                    <p className="text-xs text-slate-500 flex items-center gap-1.5 mb-2">
                      <BookOpen className="w-3.5 h-3.5 text-espol-bright" />
                      <span className="font-semibold text-slate-700">Fuente:</span>{' '}
                      {integral.source_reference}
                    </p>
                  )}
                </div>

                {/* Footer de Tarjeta: Solución y Tiempo */}
                <div className="mt-3 pt-3 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => toggleSolution(integral.id)}
                      className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg border transition-all ${
                        isRevealed
                          ? 'bg-espol-bright/10 text-espol-bright border-espol-bright/30'
                          : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                      }`}
                    >
                      {isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      {isRevealed ? 'Ocultar Solución' : 'Ver Solución Oficial'}
                    </button>

                    <span className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {Math.round(integral.time_limit_seconds / 60)} min
                    </span>
                  </div>

                  {/* Desplegable de Solución */}
                  {isRevealed && (
                    <div className="mt-3 p-3.5 rounded-xl bg-slate-50 border border-espol-bright/30 text-sm animate-fadeIn space-y-2">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-espol-bright">
                        Respuesta Oficial:
                      </div>
                      <div className="py-1 text-slate-900 font-mono text-base bg-white rounded-lg px-3 border border-slate-200 shadow-sm">
                        <MathView math={integral.solution_latex} block={true} />
                      </div>

                      {integral.alternative_solutions?.length > 0 && (
                        <div>
                          <div className="text-[11px] font-bold text-slate-600 uppercase mt-2">
                            Formas algebraicamente equivalentes válidas:
                          </div>
                          <ul className="list-disc list-inside text-xs text-slate-700 space-y-1 mt-1">
                            {integral.alternative_solutions.map((alt, i) => (
                              <li key={i} className="font-mono text-xs">
                                <MathView math={alt} block={false} />
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {integral.notes && (
                        <div className="text-xs text-slate-600 pt-2 border-t border-slate-200">
                          <span className="font-bold text-slate-800">Criterio del jurado:</span>{' '}
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
      ) : (
        /* Vista Compacta en Tabla (Ideal para revisión rápida del equipo) */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-espol overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="py-3 px-4">Nivel / Fase</th>
                <th className="py-3 px-4">Integral</th>
                <th className="py-3 px-4">Título &amp; Fuente</th>
                <th className="py-3 px-4 text-center">Tiempo</th>
                <th className="py-3 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredIntegrals.map((integral) => {
                const levelInfo = LEVEL_LABELS[integral.difficulty_level];
                const isCopied = copiedId === integral.id;

                return (
                  <tr key={integral.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded border ${levelInfo.badge}`}>
                        {levelInfo.label}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-serif text-base text-slate-900 min-w-[180px]">
                      <MathView math={integral.latex_code} block={false} />
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-800 text-xs">{integral.title}</div>
                      <div className="text-[11px] text-slate-500">{integral.source_reference}</div>
                    </td>
                    <td className="py-3 px-4 text-center text-xs text-slate-500 font-medium">
                      {Math.round(integral.time_limit_seconds / 60)} min
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleCopyLatex(integral.id, integral.latex_code)}
                          className="p-1.5 text-slate-400 hover:text-espol-bright rounded"
                          title="Copiar LaTeX"
                        >
                          {isCopied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => onEdit(integral)}
                          className="p-1.5 text-slate-400 hover:text-espol-bright rounded"
                          title="Editar"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
