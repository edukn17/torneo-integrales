export type DifficultyLevel = 'basico' | 'medio' | 'dificil';

export type TournamentPhase = 'fase1_clasificacion' | 'fase2_eliminatorias' | 'fase3_finales';

export type UserRole = 'basico' | 'medio' | 'dificil' | 'admin';

export type ExerciseStatus = 'propuesta' | 'revisada' | 'aprobada' | 'rechazada';

export interface Integral {
  id: string;
  title: string;
  latex_code: string;
  difficulty_level: DifficultyLevel;
  phase: TournamentPhase;
  solution_latex: string;
  alternative_solutions: string[];
  tags: string[];
  source_reference: string;
  notes: string;
  time_limit_seconds: number;
  status: ExerciseStatus;
  created_by?: string;
  created_by_name?: string;
  created_at: string;
  updated_at?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  is_demo?: boolean;
}

// Jerarquía de niveles permitidos
export const ROLE_HIERARCHY: Record<UserRole, DifficultyLevel[]> = {
  basico: ['basico'],
  medio: ['basico', 'medio'],
  dificil: ['basico', 'medio', 'dificil'],
  admin: ['basico', 'medio', 'dificil'],
};

export const LEVEL_LABELS: Record<DifficultyLevel, { label: string; color: string; badge: string; phase: string }> = {
  basico: {
    label: 'Básico',
    color: 'emerald',
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold',
    phase: 'Fase 1: Clasificación',
  },
  medio: {
    label: 'Medio',
    color: 'amber',
    badge: 'bg-amber-50 text-amber-800 border-amber-200 font-semibold',
    phase: 'Fase 2: Eliminatorias',
  },
  dificil: {
    label: 'Difícil',
    color: 'rose',
    badge: 'bg-rose-50 text-rose-700 border-rose-200 font-semibold',
    phase: 'Fase 3: Semis y Final',
  },
};

export const PHASE_LABELS: Record<TournamentPhase, string> = {
  fase1_clasificacion: 'Fase 1: Clasificación (Escrito)',
  fase2_eliminatorias: 'Fase 2: Eliminatorias (Duelos 10 min)',
  fase3_finales: 'Fase 3: Semifinales y Final (Auditorio 5 min)',
};
