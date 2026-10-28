-- ==============================================================================
-- TORNEO DE INTEGRALES - CLUB MATES / AEFIEC / IEEE-HKN (FCNM ESPOL)
-- Esquema de Base de Datos y Políticas de Seguridad (Supabase PostgreSQL + RLS)
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. TABLA DE PERFILES (Vinculada a auth.users de Supabase)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL DEFAULT '',
  matricula TEXT DEFAULT '',
  role TEXT NOT NULL CHECK (role IN ('basico', 'medio', 'dificil', 'admin')) DEFAULT 'basico',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Asegurar columna matricula si la tabla ya existía
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS matricula TEXT DEFAULT '';

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Los usuarios pueden ver su propio perfil y perfiles publicos"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

-- Política para que los usuarios editen su perfil y los admins gestionen roles
DROP POLICY IF EXISTS "Los usuarios pueden actualizar su propio perfil" ON public.profiles;
DROP POLICY IF EXISTS "Admins y usuarios pueden actualizar perfiles" ON public.profiles;
CREATE POLICY "Admins y usuarios pueden actualizar perfiles"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = id OR 
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, matricula, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'matricula', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'basico')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- 2. TABLA DE INTEGRALES (Banco de Ejercicios)
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
  time_limit_seconds INT NOT NULL DEFAULT 600,
  status TEXT NOT NULL CHECK (status IN ('propuesta', 'revisada', 'aprobada', 'rechazada')) DEFAULT 'propuesta',
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_by_name TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.integrales ENABLE ROW LEVEL SECURITY;

-- 3. POLÍTICAS DE ACCESO JERÁRQUICO
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
