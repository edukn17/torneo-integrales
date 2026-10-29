import React, { useState, useEffect } from 'react';
import { Integral, DifficultyLevel, TournamentPhase, UserRole, ExerciseStatus, ROLE_HIERARCHY } from '../types';
import { MathView } from './MathView';
import {
  Sparkles,
  Save,
  X,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

interface IntegralEditorProps {
  initialIntegral?: Integral | null;
  userRole: UserRole;
  onSave: (data: Omit<Integral, 'id' | 'created_at'>) => Promise<void>;
  onCancel: () => void;
}

export const IntegralEditor: React.FC<IntegralEditorProps> = ({
  initialIntegral,
  userRole,
  onSave,
  onCancel,
}) => {
  const allowedLevels = ROLE_HIERARCHY[userRole];

  const [title, setTitle] = useState('');
  const [latexCode, setLatexCode] = useState('\\int ');
  const [difficulty, setDifficulty] = useState<DifficultyLevel>(
    allowedLevels[allowedLevels.length - 1] || 'basico'
  );
  const [phase, setPhase] = useState<TournamentPhase>('fase1_clasificacion');
  const [solutionLatex, setSolutionLatex] = useState('');
  const [alternativeSolutionsStr, setAlternativeSolutionsStr] = useState('');
  const [tagsStr, setTagsStr] = useState('sustitución, cálculo');
  const [sourceReference, setSourceReference] = useState('');
  const [notes, setNotes] = useState('');
  const [timeLimitSeconds, setTimeLimitSeconds] = useState(600);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (initialIntegral) {
      setTitle(initialIntegral.title);
      setLatexCode(initialIntegral.latex_code);
      setDifficulty(initialIntegral.difficulty_level);
      setPhase(initialIntegral.phase);
      setSolutionLatex(initialIntegral.solution_latex);
      setAlternativeSolutionsStr((initialIntegral.alternative_solutions || []).join('\n'));
      setTagsStr((initialIntegral.tags || []).join(', '));
      setSourceReference(initialIntegral.source_reference || '');
      setNotes(initialIntegral.notes || '');
      setTimeLimitSeconds(initialIntegral.time_limit_seconds || 600);
    } else {
      const defaultLevel: DifficultyLevel = allowedLevels[0] || 'basico';
      setDifficulty(defaultLevel);
      if (defaultLevel === 'dificil') {
        setPhase('fase3_finales');
        setTimeLimitSeconds(300);
      } else if (defaultLevel === 'medio') {
        setPhase('fase2_eliminatorias');
        setTimeLimitSeconds(600);
      } else {
        setPhase('fase1_clasificacion');
        setTimeLimitSeconds(600);
      }
    }
  }, [initialIntegral, allowedLevels]);

  const handleDifficultyChange = (newDifficulty: DifficultyLevel) => {
    setDifficulty(newDifficulty);
    if (newDifficulty === 'dificil') {
      setPhase('fase3_finales');
      setTimeLimitSeconds(300);
    } else if (newDifficulty === 'medio') {
      setPhase('fase2_eliminatorias');
      setTimeLimitSeconds(600);
    } else {
      setPhase('fase1_clasificacion');
      setTimeLimitSeconds(600);
    }
  };

  const handlePhaseChange = (newPhase: TournamentPhase) => {
    setPhase(newPhase);
    if (newPhase === 'fase3_finales') {
      setTimeLimitSeconds(300);
    } else {
      setTimeLimitSeconds(600);
    }
  };

  const insertSnippet = (snippet: string) => {
    setLatexCode((prev) => prev + snippet);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg('Por favor ingresa un título descriptivo para la integral.');
      return;
    }
    if (!latexCode.trim()) {
      setErrorMsg('La fórmula de la integral en LaTeX no puede estar vacía.');
      return;
    }
    if (!solutionLatex.trim()) {
      setErrorMsg('Por favor ingresa la solución oficial en formato LaTeX.');
      return;
    }

    setErrorMsg('');
    setSaving(true);

    try {
      const altArray = alternativeSolutionsStr
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean);

      const tagsArray = tagsStr
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      const targetStatus: ExerciseStatus = userRole === 'admin' 
        ? (initialIntegral?.status || 'aprobada')
        : 'propuesta';

      await onSave({
        title: title.trim(),
        latex_code: latexCode.trim(),
        difficulty_level: difficulty,
        phase: phase,
        solution_latex: solutionLatex.trim(),
        alternative_solutions: altArray,
        tags: tagsArray,
        source_reference: sourceReference.trim(),
        notes: notes.trim(),
        time_limit_seconds: Number(timeLimitSeconds) || 600,
        status: targetStatus,
        created_by_name: initialIntegral?.created_by_name || 'Colaborador MatEs',
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al guardar la integral en la base de datos.';
      setErrorMsg(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white border border-purple-100 rounded-3xl p-6 sm:p-8 shadow-fcnm max-w-4xl mx-auto animate-fadeIn">
      {/* Header del Editor */}
      <div className="flex items-center justify-between pb-4 border-b border-purple-100">
        <div>
          <h2 className="text-xl font-bold text-fcnm-dark flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-fcnm" />
            {initialIntegral
              ? userRole === 'admin'
                ? 'Editar Integral'
                : 'Corregir Propuesta de Integral'
              : userRole === 'admin'
              ? 'Publicar Nueva Integral en el Banco'
              : 'Subir Nueva Integral para Revisión'}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {initialIntegral && userRole !== 'admin'
              ? 'Puedes corregir cualquier detalle de tu ejercicio antes de que el administrador lo apruebe.'
              : 'Ingreso y curaduría de problemas para el Torneo de Integrales MatEs.'}
          </p>
        </div>
        <button
          onClick={onCancel}
          className="p-2 text-slate-400 hover:text-slate-600 hover:bg-purple-50 rounded-xl transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {userRole !== 'admin' && (
        <div className="mt-4 p-3.5 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-2.5 text-xs text-amber-900">
          <span className="font-bold text-amber-700 uppercase tracking-wider text-[10px] px-2 py-0.5 bg-amber-100 rounded-md shrink-0">
            Flujo de Aprobación
          </span>
          <span>
            Tu ejercicio se enviará como propuesta. El administrador del torneo revisará la solución y aprobará o rechazará el ejercicio.
          </span>
        </div>
      )}

      {errorMsg && (
        <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-6">
        {/* Título */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
            Título Descriptivo del Ejercicio
          </label>
          <input
            type="text"
            required
            placeholder="Ej: Integral racional con descomposición en fracciones simples"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-slate-50 focus:bg-white border border-purple-100 focus:border-fcnm rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none transition-all shadow-sm"
          />
        </div>

        {/* Editor de LaTeX y Pizarra KaTeX en Split View */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Fórmula de la Integral (LaTeX)
              </label>
            </div>
            <textarea
              required
              rows={4}
              placeholder="\int \frac{2x+2}{x^2+2x} \, dx"
              value={latexCode}
              onChange={(e) => setLatexCode(e.target.value)}
              className="w-full bg-slate-900 text-emerald-400 font-mono text-sm border border-slate-700 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-fcnm/30"
            />

            {/* Barra de Atajos Matemáticos */}
            <div className="flex flex-wrap gap-1 mt-2">
              {[
                { label: '∫', code: '\\int ' },
                { label: '∫ a b', code: '\\int_{a}^{b} ' },
                { label: 'a/b', code: '\\frac{a}{b}' },
                { label: '√x', code: '\\sqrt{x}' },
                { label: 'sin', code: '\\sin(x)' },
                { label: 'cos', code: '\\cos(x)' },
                { label: 'ln|x|', code: '\\ln|x|' },
                { label: 'e^x', code: 'e^{x}' },
                { label: 'dx', code: '\\, dx' },
              ].map((btn, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => insertSnippet(btn.code)}
                  className="px-2.5 py-1 bg-purple-50 hover:bg-purple-100 border border-purple-200/60 rounded-lg text-xs font-mono text-fcnm font-bold transition-colors"
                >
                  {btn.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Pizarra Virtual (Previsualización KaTeX)
            </label>
            <div className="h-[124px] bg-purple-50/30 border border-purple-100 rounded-xl p-4 flex items-center justify-center overflow-auto shadow-inner text-xl font-serif text-slate-900">
              <MathView math={latexCode} block={true} />
            </div>
            <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Renderizado instantáneo en alta resolución.
            </p>
          </div>
        </div>

        {/* Selectores de Nivel, Fase y Tiempo Límite */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Nivel de Dificultad
            </label>
            <select
              aria-label="Nivel de Dificultad"
              value={difficulty}
              disabled={userRole !== 'admin'}
              onChange={(e) => handleDifficultyChange(e.target.value as DifficultyLevel)}
              className="w-full bg-slate-50 border border-purple-100 rounded-xl px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-fcnm cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
            >
              {allowedLevels.includes('basico') && (
                <option value="basico">Básico (Fase 1: Clasificación)</option>
              )}
              {allowedLevels.includes('medio') && (
                <option value="medio">Medio (Fase 2: Eliminatorias)</option>
              )}
              {allowedLevels.includes('dificil') && (
                <option value="dificil">Difícil (Fase 3: Semis y Final)</option>
              )}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Fase del Torneo
            </label>
            <select
              aria-label="Fase del Torneo"
              value={phase}
              disabled={userRole !== 'admin'}
              onChange={(e) => handlePhaseChange(e.target.value as TournamentPhase)}
              className="w-full bg-slate-50 border border-purple-100 rounded-xl px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-fcnm cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
            >
              <option value="fase1_clasificacion">Fase 1: Clasificación</option>
              <option value="fase2_eliminatorias">Fase 2: Eliminatorias</option>
              <option value="fase3_finales">Fase 3: Semifinales y Final</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Tiempo Límite
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                aria-label="Tiempo límite en segundos"
                min={60}
                max={1800}
                step={30}
                value={timeLimitSeconds}
                onChange={(e) => setTimeLimitSeconds(Number(e.target.value))}
                className="w-full bg-slate-50 border border-purple-100 rounded-xl px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-fcnm"
              />
              <span className="text-xs text-slate-500 whitespace-nowrap font-medium">
                {Math.round(timeLimitSeconds / 60)} min
              </span>
            </div>
          </div>
        </div>

        {/* Solución Oficial */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Solución Oficial (LaTeX)
            </label>
            <input
              type="text"
              required
              placeholder="\ln|x^2+2x| + C"
              value={solutionLatex}
              onChange={(e) => setSolutionLatex(e.target.value)}
              className="w-full bg-slate-50 font-mono text-sm border border-purple-100 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-fcnm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Vista previa de la Solución
            </label>
            <div className="h-[42px] bg-purple-50/30 border border-purple-100 rounded-xl px-3 flex items-center justify-center overflow-auto shadow-inner text-sm font-serif">
              <MathView math={solutionLatex} block={false} />
            </div>
          </div>
        </div>

        {/* Formas Algebraicamente Equivalentes Aceptadas */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
            Formas Algebraicamente Equivalentes Aceptadas (una por línea)
          </label>
          <textarea
            rows={2}
            placeholder={`\\ln|x| + \\ln|x+2| + C\n\\ln|x(x+2)| + C`}
            value={alternativeSolutionsStr}
            onChange={(e) => setAlternativeSolutionsStr(e.target.value)}
            className="w-full bg-slate-50 font-mono text-xs border border-purple-100 rounded-xl p-3 text-slate-800 focus:outline-none focus:border-fcnm"
          />
          <p className="text-[11px] text-slate-500 mt-1">
            Garantiza que el jurado valide al instante variantes algebraicas válidas en duelos rápidos.
          </p>
        </div>

        {/* Fuente Bibliográfica & Etiquetas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Fuente o Referencia Bibliográfica
            </label>
            <input
              type="text"
              placeholder="Ej: Michael Spivak - Cálculo, Cap. 18 / MIT Bee"
              value={sourceReference}
              onChange={(e) => setSourceReference(e.target.value)}
              className="w-full bg-slate-50 border border-purple-100 rounded-xl px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-fcnm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Etiquetas Temáticas (separadas por coma)
            </label>
            <input
              type="text"
              placeholder="sustitución, fracciones parciales, trigonométrica"
              value={tagsStr}
              onChange={(e) => setTagsStr(e.target.value)}
              className="w-full bg-slate-50 border border-purple-100 rounded-xl px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-fcnm"
            />
          </div>
        </div>

        {/* Notas y Criterios del Jurado */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
            Criterios de Corrección para el Jurado
          </label>
          <textarea
            rows={2}
            placeholder="Aclaraciones de dominio, trucos requeridos, o advertencias de signos/constantes."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full bg-slate-50 border border-purple-100 rounded-xl p-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-fcnm"
          />
        </div>

        {/* Botones de Acción */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-purple-100">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:text-slate-800 hover:bg-purple-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 bg-fcnm hover:bg-fcnm-hover text-white text-sm font-bold rounded-xl shadow-md transition-all duration-200"
          >
            <Save className="w-4 h-4" />
            {saving
              ? 'Guardando...'
              : initialIntegral
              ? userRole === 'admin'
                ? 'Guardar Cambios'
                : 'Guardar Corrección y Reenviar'
              : userRole === 'admin'
              ? 'Guardar y Publicar en el Banco'
              : 'Enviar para Revisión'}
          </button>
        </div>
      </form>
    </div>
  );
};
