import React, { useState, useEffect, useRef } from 'react';
import { Integral, LEVEL_LABELS } from '../types';
import { MathView } from './MathView';
import {
  Play,
  Pause,
  RotateCcw,
  Eye,
  EyeOff,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
} from 'lucide-react';

interface ProjectorModeProps {
  integrals: Integral[];
  onExit: () => void;
}

export const ProjectorMode: React.FC<ProjectorModeProps> = ({ integrals, onExit }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showSolution, setShowSolution] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Integrales disponibles
  const currentIntegral = integrals[currentIndex] || null;

  // Cronómetro
  const initialTime = currentIntegral ? currentIntegral.time_limit_seconds : 600;
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [isRunning, setIsRunning] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  // Reiniciar tiempo al cambiar integral
  useEffect(() => {
    if (currentIntegral) {
      setTimeLeft(currentIntegral.time_limit_seconds || 600);
      setIsRunning(false);
      setShowSolution(false);
    }
  }, [currentIndex, currentIntegral]);

  // Intervalo del temporizador
  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isRunning, timeLeft]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remaining = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remaining.toString().padStart(2, '0')}`;
  };

  const handleNext = () => {
    if (currentIndex < integrals.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  if (!currentIntegral) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center text-slate-400">
        No hay integrales disponibles para proyectar con tu nivel actual.
        <button
          onClick={onExit}
          className="mt-4 block mx-auto px-4 py-2 bg-blue-600 text-white rounded-xl text-sm"
        >
          Volver al banco
        </button>
      </div>
    );
  }

  const levelInfo = LEVEL_LABELS[currentIntegral.difficulty_level];
  const isTimeCritical = timeLeft > 0 && timeLeft <= 60;
  const isTimeUp = timeLeft === 0;

  return (
    <div
      ref={containerRef}
      className="bg-slate-950 text-white rounded-3xl border border-slate-800/80 p-6 md:p-10 flex flex-col justify-between min-h-[620px] shadow-2xl relative overflow-hidden"
    >
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-48 bg-blue-500/10 blur-[100px] pointer-events-none rounded-full" />

      {/* Header Bar */}
      <div className="flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
            Duelo MatEs • Integral {currentIndex + 1} de {integrals.length}
          </span>
          <span className={`text-xs font-bold px-3 py-1 rounded-full border ${levelInfo.badge}`}>
            {levelInfo.label}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleFullscreen}
            className="p-2 text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-700/60 rounded-xl transition-all"
            title="Pantalla completa para proyector"
          >
            {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
          </button>
          <button
            onClick={onExit}
            className="px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-700/60 rounded-xl transition-all"
          >
            Cerrar Proyector
          </button>
        </div>
      </div>

      {/* Central Area: Big LaTeX Formula */}
      <div className="my-8 text-center z-10 flex flex-col items-center justify-center">
        <h3 className="text-sm font-medium text-slate-400 uppercase tracking-widest mb-4">
          Resuelve la siguiente integral:
        </h3>

        <div className="py-8 px-6 md:px-12 rounded-3xl bg-slate-900/80 border border-slate-700/70 shadow-2xl max-w-4xl w-full flex items-center justify-center text-3xl sm:text-4xl md:text-5xl font-serif">
          <MathView math={currentIntegral.latex_code} block={true} />
        </div>

        {/* Revealed Solution Drawer */}
        {showSolution && (
          <div className="mt-6 p-6 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 max-w-2xl w-full text-center animate-fadeIn">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 block mb-2">
              Solución Oficial del Jurado:
            </span>
            <div className="text-2xl sm:text-3xl font-mono text-emerald-300">
              <MathView math={currentIntegral.solution_latex} block={true} />
            </div>
            {currentIntegral.alternative_solutions?.length > 0 && (
              <div className="mt-2 text-xs text-slate-400">
                Formas equivalentes:{' '}
                {currentIntegral.alternative_solutions.map((a, i) => (
                  <span key={i} className="inline-block mx-1 font-mono text-emerald-200">
                    <MathView math={a} block={false} />
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer Controls: Big Timer & Navigation */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-800/80 z-10">
        {/* Navigation between Integrals */}
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 disabled:opacity-40 text-slate-200 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-xs font-mono text-slate-400 px-2">
            {currentIndex + 1} / {integrals.length}
          </span>
          <button
            onClick={handleNext}
            disabled={currentIndex === integrals.length - 1}
            className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 disabled:opacity-40 text-slate-200 transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Center: Big Countdown Timer */}
        <div className="flex items-center gap-4">
          <div
            className={`font-mono font-extrabold text-3xl sm:text-4xl tracking-wider px-4 py-1.5 rounded-2xl border transition-all ${
              isTimeUp
                ? 'bg-rose-950/80 border-rose-500 text-rose-400 animate-pulse'
                : isTimeCritical
                ? 'bg-amber-950/80 border-amber-500 text-amber-400'
                : 'bg-slate-900 border-slate-700 text-white'
            }`}
          >
            {formatTime(timeLeft)}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsRunning(!isRunning)}
              className={`p-2.5 rounded-xl text-white font-semibold transition-all shadow-lg ${
                isRunning
                  ? 'bg-amber-600 hover:bg-amber-500 shadow-amber-600/30'
                  : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30'
              }`}
            >
              {isRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </button>
            <button
              onClick={() => {
                setIsRunning(false);
                setTimeLeft(currentIntegral.time_limit_seconds || 600);
              }}
              className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 transition-colors"
              title="Reiniciar cronómetro"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Reveal Solution Button for Jury */}
        <div>
          <button
            onClick={() => setShowSolution(!showSolution)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all ${
              showSolution
                ? 'bg-emerald-600/20 text-emerald-300 border-emerald-500/50'
                : 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800'
            }`}
          >
            {showSolution ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {showSolution ? 'Ocultar Solución' : 'Revelar Solución'}
          </button>
        </div>
      </div>
    </div>
  );
};
