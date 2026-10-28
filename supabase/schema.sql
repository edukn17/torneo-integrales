-- ==============================================================================
-- TORNEO DE INTEGRALES - CLUB MATES / AEFIEC / IEEE-HKN
-- Esquema de Base de Datos y Políticas de Seguridad (Supabase PostgreSQL + RLS)
-- ==============================================================================

-- 1. EXTENSIONES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABLA DE PERFILES (Vinculada a auth.users de Supabase)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL DEFAULT '',
  role TEXT NOT NULL CHECK (role IN ('basico', 'medio', 'dificil', 'admin')) DEFAULT 'basico',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Habilitar RLS en profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Políticas de profiles
CREATE POLICY "Los usuarios pueden ver su propio perfil y perfiles públicos"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Los usuarios pueden actualizar su propio perfil"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Trigger para crear perfil automáticamente al registrarse en auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'basico')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Función auxiliar para obtener el rol del usuario autenticado
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- 3. TABLA DE INTEGRALES (Banco de Ejercicios)
CREATE TABLE IF NOT EXISTS public.integrales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  latex_code TEXT NOT NULL,
  difficulty_level TEXT NOT NULL CHECK (difficulty_level IN ('basico', 'medio', 'dificil')),
  phase TEXT NOT NULL CHECK (phase IN ('fase1_clasificacion', 'fase2_eliminatorias', 'fase3_finales')) DEFAULT 'fase1_clasificacion',
  solution_latex TEXT NOT NULL,
  alternative_solutions TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  source_reference TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  time_limit_seconds INT NOT NULL DEFAULT 600, -- 600s = 10 min (Fase 2), 300s = 5 min (Fase 3)
  status TEXT NOT NULL CHECK (status IN ('propuesta', 'revisada', 'aprobada', 'rechazada')) DEFAULT 'propuesta',
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_by_name TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Habilitar RLS en integrales
ALTER TABLE public.integrales ENABLE ROW LEVEL SECURITY;

-- 4. POLÍTICAS DE ACCESO JERÁRQUICO (RBAC estricto en BD)
-- Básico: Solo ve 'basico'
-- Medio: Ve 'basico' y 'medio'
-- Difícil: Ve 'basico', 'medio' y 'dificil'
-- Admin: Ve todo y gestiona todo

CREATE POLICY "Lectura jerarquica de integrales segun rol del colaborador"
  ON public.integrales FOR SELECT
  TO authenticated
  USING (
    public.current_user_role() = 'admin'
    OR (public.current_user_role() = 'dificil' AND difficulty_level IN ('basico', 'medio', 'dificil'))
    OR (public.current_user_role() = 'medio' AND difficulty_level IN ('basico', 'medio'))
    OR (public.current_user_role() = 'basico' AND difficulty_level = 'basico')
  );

CREATE POLICY "Colaboradores pueden registrar integrales"
  ON public.integrales FOR INSERT
  TO authenticated
  WITH CHECK (
    public.current_user_role() = 'admin'
    OR (public.current_user_role() = 'dificil' AND difficulty_level IN ('basico', 'medio', 'dificil'))
    OR (public.current_user_role() = 'medio' AND difficulty_level IN ('basico', 'medio'))
    OR (public.current_user_role() = 'basico' AND difficulty_level = 'basico')
  );

CREATE POLICY "Colaboradores pueden editar sus propias propuestas o admins"
  ON public.integrales FOR UPDATE
  TO authenticated
  USING (
    public.current_user_role() = 'admin'
    OR (created_by = auth.uid() AND status = 'propuesta')
  );

CREATE POLICY "Admins pueden eliminar integrales"
  ON public.integrales FOR DELETE
  TO authenticated
  USING (public.current_user_role() = 'admin');

-- 5. SEMILLAS DE PRUEBA (Ejercicios iniciales basados en la propuesta)
INSERT INTO public.integrales (
  title,
  latex_code,
  difficulty_level,
  phase,
  solution_latex,
  alternative_solutions,
  tags,
  source_reference,
  notes,
  time_limit_seconds,
  status,
  created_by_name
) VALUES 
(
  'Integral racional con logaritmo y fracciones parciales',
  '\\int \\frac{2x+2}{x^2+2x} \\, dx',
  'basico',
  'fase1_clasificacion',
  '\\ln|x^2+2x| + C',
  ARRAY['\\ln|x| + \\ln|x+2| + C', '\\ln|x(x+2)| + C'],
  ARRAY['sustitución', 'fracciones parciales', 'logaritmo'],
  'Propuesta Oficial MatEs - Ejemplo 1',
  'Aceptar tanto la forma por sustitución u=x^2+2x como la descomposición en fracciones simples 1/x + 1/(x+2).',
  600,
  'aprobada',
  'Comité Académico MatEs'
),
(
  'Integral inmediata con dominio restringido',
  '\\int \\frac{1}{x} \\, dx',
  'basico',
  'fase1_clasificacion',
  '\\ln|x| + C',
  ARRAY['\\log(x) + C'],
  ARRAY['inmediata', 'logaritmo'],
  'Propuesta Oficial MatEs - Reglas de Solución',
  'Válida en (0, \\infty) o con valor absoluto.',
  300,
  'aprobada',
  'Comité Académico MatEs'
),
(
  'Integral trigonométrica por partes',
  '\\int x \\cos(3x) \\, dx',
  'medio',
  'fase2_eliminatorias',
  '\\frac{x}{3}\\sin(3x) + \\frac{1}{9}\\cos(3x) + C',
  ARRAY['\\frac{3x\\sin(3x) + \\cos(3x)}{9} + C'],
  ARRAY['por partes', 'trigonométrica'],
  'Spivak - Cálculo cap. 18',
  'Integral típica para rondas eliminatorias de 16.',
  600,
  'aprobada',
  'Comité Académico MatEs'
),
(
  'Sustitución trigonométrica con radical',
  '\\int \\frac{\\sqrt{4-x^2}}{x^2} \\, dx',
  'medio',
  'fase2_eliminatorias',
  '-\\frac{\\sqrt{4-x^2}}{x} - \\arcsin\\left(\\frac{x}{2}\\right) + C',
  ARRAY['-\\frac{\\sqrt{4-x^2}}{x} - \\sin^{-1}(x/2) + C'],
  ARRAY['sustitución trigonométrica', 'radicales'],
  'Banco MatEs',
  'Usar x = 2 sin(theta).',
  600,
  'aprobada',
  'Comité Académico MatEs'
),
(
  'Integral de alta dificultad con truco de simetría',
  '\\int_{0}^{\\frac{\\pi}{2}} \\frac{\\sqrt{\\sin x}}{\\sqrt{\\sin x} + \\sqrt{\\cos x}} \\, dx',
  'dificil',
  'fase3_finales',
  '\\frac{\\pi}{4}',
  ARRAY['\\pi / 4', '0.25\\pi'],
  ARRAY['truco de King', 'definida', 'simetría'],
  'Almost Impossible Integrals / MIT Bee',
  'Integral clásica de King: I + I = \\int_0^{\\pi/2} 1 dx = \\pi/2 => I = \\pi/4. Ideal para la Gran Final.',
  300,
  'aprobada',
  'Comité Académico MatEs'
);
