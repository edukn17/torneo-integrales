import React, { useState, useEffect } from 'react';
import { Integral, DifficultyLevel, TournamentPhase, UserRole, ROLE_HIERARCHY } from '../types';
import { MathView } from './MathView';
import { Sparkles, Save, X } from 'lucide-react';

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
      // Por defecto según nivel
      if (allowedLevels.includes('medio')) {
        setDifficulty('medio');
        setPhase('fase2_eliminatorias');
        setTimeLimitSeconds(600);
      } else {
        setDifficulty('basico');
        setPhase('fase1_clasificacion');
        setTimeLimitSeconds(600);
      }
    }
  }, [initialIntegral, allowedLevels]);

  // Sincronizar tiempo sugerido al cambiar fase
  const handlePhaseChange = (newPhase: TournamentPhase) => {
    setPhase(newPhase);
    if (newPhase === 'fase3_finales') {
      setTimeLimitSeconds(300); // 5 min para Fase 3 según propuesta
    } else {
      setTimeLimitSeconds(600); // 10 min para Fase 2
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
      setErrorMsg('Por favor ingresa la solución matemática en formato LaTeX.');
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
        status: 'aprobada',
        created_by_name: 'Colaborador MatEs',
      });
    } catch (err) {
      setErrorMsg('Error al guardar la integral. Intenta nuevamente.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6 shadow-xl max-w-4xl mx-auto">
      <div className="flex items-center justify-between pb-4 border-b border-slate-700">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-400" />
            {initialIntegral ? 'Editar Integral' : 'Registrar Nueva Integral'}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Ingresa la integral en sintaxis LaTeX estándar con su respuesta y notas de equivalencia.
          </p>
        </div>
        <button
          onClick={onCancel}
          className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {errorMsg && (
        <div className="mt-4 p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-red-300 text-sm">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        {/* Title */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
            Título / Descripción del Ejercicio
          </label>
          <input
            type="text"
            required
            placeholder="Ej: Integral racional con fracciones parciales y sustitución"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* LaTeX Input & Live Preview (Split View) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                Fórmula de la Integral (LaTeX)
              </label>
            </div>
            <textarea
              required
              rows={4}
              placeholder="\int \frac{2x+2}{x^2+2x} \, dx"
              value={latexCode}
              onChange={(e) => setLatexCode(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 font-mono text-sm text-emerald-400 placeholder-slate-600 focus:outline-none focus:border-blue-500"
            />

            {/* Quick Math Shortcuts */}
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
                  className="px-2 py-1 bg-slate-900 hover:bg-slate-700 border border-slate-700 rounded text-xs font-mono text-slate-300 hover:text-white transition-colors"
                >
                  {btn.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Previsualización en Vivo (KaTeX)
            </label>
            <div className="h-[120px] bg-slate-950/80 border border-slate-700/80 rounded-xl p-4 flex items-center justify-center overflow-auto shadow-inner">
              <MathView math={latexCode} block={true} className="text-xl" />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Renderizado instantáneo. Los errores sintácticos de TeX se señalan en tiempo real.
            </p>
          </div>
        </div>

        {/* Difficulty Level & Phase Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Nivel de Dificultad
            </label>
            <select
              aria-label="Nivel de Dificultad de la integral"
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as DifficultyLevel)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              {allowedLevels.includes('basico') && (
                <option value="basico">Básico (Fase 1: Clasificación)</option>
              )}
              {allowedLevels.includes('medio') && (
                <option value="medio">Medio (Fase 2: Eliminatorias)</option>
              )}
              {allowedLevels.includes('dificil') && (
                <option value="dificil">Difícil (Fase 3: Semis/Final)</option>
              )}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Fase del Torneo
            </label>
            <select
              aria-label="Fase del Torneo correspondiente"
              value={phase}
              onChange={(e) => handlePhaseChange(e.target.value as TournamentPhase)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="fase1_clasificacion">Fase 1: Clasificación</option>
              <option value="fase2_eliminatorias">Fase 2: Rondas Eliminatorias</option>
              <option value="fase3_finales">Fase 3: Semifinales y Final</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Tiempo Límite (Segundos)
            </label>
            <input
              type="number"
              aria-label="Tiempo límite en segundos"
              min={60}
              max={1800}
              step={30}
              value={timeLimitSeconds}
              onChange={(e) => setTimeLimitSeconds(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
            />
            <span className="text-[11px] text-slate-400 mt-0.5 block">
              {Math.round(timeLimitSeconds / 60)} minutos sugeridos
            </span>
          </div>
        </div>

        {/* Main Solution & Preview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Solución Oficial (LaTeX)
            </label>
            <input
              type="text"
              required
              placeholder="\ln|x^2+2x| + C"
              value={solutionLatex}
              onChange={(e) => setSolutionLatex(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 font-mono text-sm text-emerald-400 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Vista previa de la Solución
            </label>
            <div className="h-[42px] bg-slate-950/80 border border-slate-700/80 rounded-xl px-3 flex items-center justify-center overflow-auto shadow-inner text-sm">
              <MathView math={solutionLatex} block={false} />
            </div>
          </div>
        </div>

        {/* Alternative Solutions (Equivalencias según propuesta) */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
            Formas Algebraicamente Equivalentes Aceptadas (una por línea)
          </label>
          <textarea
            rows={2}
            placeholder={`\\ln|x| + \\ln|x+2| + C\n\\ln|x(x+2)| + C`}
            value={alternativeSolutionsStr}
            onChange={(e) => setAlternativeSolutionsStr(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 font-mono text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500"
          />
          <p className="text-[11px] text-slate-400 mt-1">
            Permite al jurado validar al instante respuestas en distintas formas (ej: ln|x| + ln|x+2| vs ln|x² + 2x|).
          </p>
        </div>

        {/* Source Reference & Notes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Fuente o Referencia Bibliográfica
            </label>
            <input
              type="text"
              placeholder="Ej: Michael Spivak - Cálculo, Cap. 18 / MIT Bee"
              value={sourceReference}
              onChange={(e) => setSourceReference(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Etiquetas (separadas por coma)
            </label>
            <input
              type="text"
              placeholder="sustitución, fracciones parciales, trigonométrica"
              value={tagsStr}
              onChange={(e) => setTagsStr(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Internal Jury / Coordinator Notes */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
            Notas y Criterios Internos para el Jurado
          </label>
          <textarea
            rows={2}
            placeholder="Aclaraciones de dominio, restricciones de variable, trucos permitidos o tips de corrección rápida."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-700">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-semibold rounded-xl shadow-lg shadow-blue-500/20 transition-all"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Guardando...' : initialIntegral ? 'Actualizar Integral' : 'Guardar en el Banco'}
          </button>
        </div>
      </form>
    </div>
  );
};
