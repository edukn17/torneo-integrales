-- ==============================================================================
-- TORNEO DE INTEGRALES - CLUB MATES / AEFIEC / IEEE-HKN (FCNM ESPOL)
-- Esquema de Base de Datos y Políticas de Seguridad Blindadas (PostgreSQL + RLS)
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

-- Validaciones de integridad en perfiles
ALTER TABLE public.profiles 
  DROP CONSTRAINT IF EXISTS matricula_format_check,
  ADD CONSTRAINT matricula_format_check CHECK (matricula = '' OR matricula ~ '^[0-9]{9}$');

ALTER TABLE public.profiles 
  DROP CONSTRAINT IF EXISTS full_name_length_check,
  ADD CONSTRAINT full_name_length_check CHECK (length(full_name) <= 150);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Función segura para obtener el rol del usuario autenticado (con search_path blindado)
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS TEXT 
SECURITY DEFINER
SET search_path = public, pg_temp
LANGUAGE sql STABLE AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

-- Trigger de registro blindado (fuerza siempre 'basico' para evitar escalación vía metadata)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public, pg_temp
LANGUAGE plpgsql AS $$
DECLARE
  v_matricula TEXT;
BEGIN
  v_matricula := COALESCE(NEW.raw_user_meta_data->>'matricula', '');
  IF v_matricula <> '' AND NOT (v_matricula ~ '^[0-9]{9}$') THEN
    v_matricula := '';
  END IF;

  INSERT INTO public.profiles (id, email, full_name, matricula, role)
  VALUES (
    NEW.id,
    NEW.email,
    SUBSTRING(COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)) FROM 1 FOR 150),
    v_matricula,
    'basico' -- Protección: NUNCA asignar rol desde metadatos del cliente
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Políticas RLS para perfiles
DROP POLICY IF EXISTS "Los usuarios pueden ver su propio perfil y perfiles publicos" ON public.profiles;
CREATE POLICY "Lectura de perfiles por colaboradores autenticados"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Admins y usuarios pueden actualizar perfiles" ON public.profiles;
DROP POLICY IF EXISTS "Los usuarios pueden actualizar su propio perfil" ON public.profiles;
DROP POLICY IF EXISTS "Usuarios actualizan sus propios datos pero no su rol" ON public.profiles;
DROP POLICY IF EXISTS "Solo admins actualizan roles" ON public.profiles;

-- Política 1: El usuario puede modificar su nombre o matrícula, pero NUNCA su rol
CREATE POLICY "Usuarios actualizan sus propios datos pero no su rol"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id AND 
    role = (SELECT role FROM public.profiles WHERE id = auth.uid())
  );

-- Política 2: Solo administradores pueden modificar los roles y perfiles de los demás
CREATE POLICY "Solo admins actualizan roles"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (public.current_user_role() = 'admin')
  WITH CHECK (public.current_user_role() = 'admin');


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

-- Restricciones de integridad en integrales
ALTER TABLE public.integrales
  DROP CONSTRAINT IF EXISTS time_limit_check,
  ADD CONSTRAINT time_limit_check CHECK (time_limit_seconds BETWEEN 30 AND 7200);

ALTER TABLE public.integrales
  DROP CONSTRAINT IF EXISTS latex_length_check,
  ADD CONSTRAINT latex_length_check CHECK (length(latex_code) <= 10000 AND length(solution_latex) <= 15000);

ALTER TABLE public.integrales ENABLE ROW LEVEL SECURITY;

-- 3. POLÍTICAS DE ACCESO JERÁRQUICO BLINDADAS PARA INTEGRALES

-- SELECT: Jerarquía de acceso al banco de integrales
DROP POLICY IF EXISTS "Lectura jerarquica de integrales segun rol del colaborador" ON public.integrales;
CREATE POLICY "Lectura jerarquica de integrales segun rol del colaborador"
  ON public.integrales FOR SELECT
  TO authenticated
  USING (
    public.current_user_role() = 'admin'
    OR (public.current_user_role() = 'dificil' AND difficulty_level IN ('basico', 'medio', 'dificil'))
    OR (public.current_user_role() = 'medio' AND difficulty_level IN ('basico', 'medio'))
    OR (public.current_user_role() = 'basico' AND difficulty_level = 'basico')
  );

-- INSERT: Registro seguro (fuerza created_by = usuario autenticado y status = 'propuesta' a menos que sea admin)
DROP POLICY IF EXISTS "Colaboradores pueden registrar integrales" ON public.integrales;
CREATE POLICY "Colaboradores pueden registrar integrales"
  ON public.integrales FOR INSERT
  TO authenticated
  WITH CHECK (
    created_by = auth.uid()
    AND (public.current_user_role() = 'admin' OR status = 'propuesta')
    AND (
      public.current_user_role() = 'admin'
      OR (public.current_user_role() = 'dificil' AND difficulty_level IN ('basico', 'medio', 'dificil'))
      OR (public.current_user_role() = 'medio' AND difficulty_level IN ('basico', 'medio'))
      OR (public.current_user_role() = 'basico' AND difficulty_level = 'basico')
    )
  );

-- UPDATE: Edición restringida
DROP POLICY IF EXISTS "Colaboradores pueden editar sus propias propuestas o admins" ON public.integrales;
CREATE POLICY "Colaboradores pueden editar sus propias propuestas o admins"
  ON public.integrales FOR UPDATE
  TO authenticated
  USING (
    public.current_user_role() = 'admin'
    OR (created_by = auth.uid() AND status = 'propuesta')
  )
  WITH CHECK (
    public.current_user_role() = 'admin'
    OR (
      created_by = auth.uid() 
      AND status = 'propuesta'
      AND (
        (public.current_user_role() = 'dificil' AND difficulty_level IN ('basico', 'medio', 'dificil'))
        OR (public.current_user_role() = 'medio' AND difficulty_level IN ('basico', 'medio'))
        OR (public.current_user_role() = 'basico' AND difficulty_level = 'basico')
      )
    )
  );

-- DELETE: Solo administradores
DROP POLICY IF EXISTS "Admins pueden eliminar integrales" ON public.integrales;
CREATE POLICY "Admins pueden eliminar integrales"
  ON public.integrales FOR DELETE
  TO authenticated
  USING (public.current_user_role() = 'admin');
