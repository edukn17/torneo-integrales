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
  GraduationCap,
} from 'lucide-react';

interface ProjectorModeProps {
  integrals: Integral[];
  onExit: () => void;
}

export const ProjectorMode: React.FC<ProjectorModeProps> = ({ integrals, onExit }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showSolution, setShowSolution] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const currentIntegral = integrals[currentIndex] || null;

  const initialTime = currentIntegral ? currentIntegral.time_limit_seconds : 600;
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [isRunning, setIsRunning] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (currentIntegral) {
      setTimeLeft(currentIntegral.time_limit_seconds || 600);
      setIsRunning(false);
      setShowSolution(false);
    }
  }, [currentIndex, currentIntegral]);

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
      <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center text-slate-500 shadow-espol">
        No hay integrales disponibles para proyectar con tu nivel actual.
        <button
          onClick={onExit}
          className="mt-4 block mx-auto px-4 py-2 bg-espol-bright text-white rounded-xl text-xs font-bold"
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
      className="bg-espol-dark text-white rounded-3xl border-2 border-espol-navy p-6 md:p-10 flex flex-col justify-between min-h-[640px] shadow-2xl relative overflow-hidden"
    >
      {/* Cintillo Superior */}
      <div className="flex items-center justify-between z-10 border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-espol-gold font-bold text-xs uppercase tracking-wider">
            <GraduationCap className="w-4 h-4" />
            <span>ESPOL • FCNM</span>
          </div>
          <span className="text-white/20">|</span>
          <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-white/10 text-slate-200 border border-white/15">
            Duelo de Integrales • Ejercicio {currentIndex + 1} de {integrals.length}
          </span>
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-espol-gold text-espol-navy">
            {levelInfo.label}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleFullscreen}
            className="p-2 text-slate-300 hover:text-white bg-white/10 hover:bg-white/20 rounded-xl transition-all"
            title="Pantalla completa"
          >
            {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
          </button>
          <button
            onClick={onExit}
            className="px-3.5 py-1.5 text-xs font-bold text-slate-200 hover:text-white bg-white/10 hover:bg-white/20 rounded-xl transition-all"
          >
            Salir
          </button>
        </div>
      </div>

      {/* Área Central: Pizarra de Proyección */}
      <div className="my-8 text-center z-10 flex flex-col items-center justify-center">
        <h3 className="text-xs font-bold text-espol-gold uppercase tracking-widest mb-4">
          Resuelve la siguiente integral en la pizarra:
        </h3>

        <div className="py-10 px-6 md:px-14 rounded-3xl bg-white text-slate-900 border-4 border-espol-gold shadow-2xl max-w-4xl w-full flex items-center justify-center text-3xl sm:text-4xl md:text-5xl font-serif">
          <MathView math={currentIntegral.latex_code} block={true} />
        </div>

        {/* Solución Revelada para el Jurado */}
        {showSolution && (
          <div className="mt-6 p-6 rounded-2xl bg-emerald-950/70 border-2 border-emerald-400 max-w-2xl w-full text-center animate-fadeIn shadow-xl">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-300 block mb-2">
              Solución Oficial del Jurado MatEs:
            </span>
            <div className="text-2xl sm:text-3xl font-mono text-emerald-200">
              <MathView math={currentIntegral.solution_latex} block={true} />
            </div>
            {currentIntegral.alternative_solutions?.length > 0 && (
              <div className="mt-2 text-xs text-emerald-300/80">
                Formas equivalentes:{' '}
                {currentIntegral.alternative_solutions.map((a, i) => (
                  <span key={i} className="inline-block mx-1 font-mono text-white">
                    <MathView math={a} block={false} />
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Controles de Cronómetro y Navegación */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-white/10 z-10">
        {/* Navegación */}
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-30 text-white transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-xs font-mono text-slate-300 px-2 font-bold">
            {currentIndex + 1} / {integrals.length}
          </span>
          <button
            onClick={handleNext}
            disabled={currentIndex === integrals.length - 1}
            className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-30 text-white transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Cronómetro Digital de Duelo */}
        <div className="flex items-center gap-4">
          <div
            className={`font-mono font-extrabold text-3xl sm:text-4xl tracking-wider px-5 py-2 rounded-2xl border-2 transition-all ${
              isTimeUp
                ? 'bg-rose-900 border-rose-500 text-rose-200 animate-pulse'
                : isTimeCritical
                ? 'bg-amber-900 border-amber-400 text-amber-200'
                : 'bg-white/10 border-white/20 text-white'
            }`}
          >
            {formatTime(timeLeft)}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsRunning(!isRunning)}
              className={`p-3 rounded-xl text-espol-navy font-bold transition-all shadow-lg ${
                isRunning
                  ? 'bg-amber-400 hover:bg-amber-300'
                  : 'bg-espol-gold hover:bg-espol-goldHover'
              }`}
            >
              {isRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </button>
            <button
              onClick={() => {
                setIsRunning(false);
                setTimeLeft(currentIntegral.time_limit_seconds || 600);
              }}
              className="p-3 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 transition-colors"
              title="Reiniciar cronómetro"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Botón de Solución */}
        <div>
          <button
            onClick={() => setShowSolution(!showSolution)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all ${
              showSolution
                ? 'bg-emerald-500 text-espol-navy border-emerald-400 font-extrabold'
                : 'bg-white/10 text-white border-white/20 hover:bg-white/20'
            }`}
          >
            {showSolution ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {showSolution ? 'Ocultar Solución' : 'Revelar al Jurado'}
          </button>
        </div>
      </div>
    </div>
  );
};
