import React, { useState } from 'react';
import {
  X,
  Database,
  Copy,
  Check,
  ExternalLink,
  RotateCcw,
} from 'lucide-react';
import {
  getSupabaseCredentials,
  saveSupabaseCredentials,
  IntegralService,
} from '../lib/supabase';

interface SupabaseGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCredentialsUpdated: () => void;
}

export const SupabaseGuideModal: React.FC<SupabaseGuideModalProps> = ({
  isOpen,
  onClose,
  onCredentialsUpdated,
}) => {
  const currentCreds = getSupabaseCredentials();
  const [url, setUrl] = useState(currentCreds.url);
  const [anonKey, setAnonKey] = useState(currentCreds.anonKey);
  const [copiedSql, setCopiedSql] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveSupabaseCredentials(url, anonKey);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onCredentialsUpdated();
      onClose();
    }, 1200);
  };

  const handleResetToMock = () => {
    saveSupabaseCredentials('', '');
    IntegralService.resetToInitialMock();
    setUrl('');
    setAnonKey('');
    onCredentialsUpdated();
    alert('Restaurado a modo local con las integrales de prueba iniciales.');
  };

  const handleCopySql = () => {
    // Schema script
    const sqlText = `-- ==============================================================================
-- TORNEO DE INTEGRALES - CLUB MATES / AEFIEC / IEEE-HKN
-- Esquema de Base de Datos y Políticas de Seguridad (Supabase PostgreSQL + RLS)
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL DEFAULT '',
  role TEXT NOT NULL CHECK (role IN ('basico', 'medio', 'dificil', 'admin')) DEFAULT 'basico',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Los usuarios pueden ver su propio perfil y perfiles publicos"
  ON public.profiles FOR SELECT TO authenticated USING (true);

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

CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

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

CREATE POLICY "Lectura jerarquica de integrales segun rol del colaborador"
  ON public.integrales FOR SELECT TO authenticated
  USING (
    public.current_user_role() = 'admin'
    OR (public.current_user_role() = 'dificil' AND difficulty_level IN ('basico', 'medio', 'dificil'))
    OR (public.current_user_role() = 'medio' AND difficulty_level IN ('basico', 'medio'))
    OR (public.current_user_role() = 'basico' AND difficulty_level = 'basico')
  );

CREATE POLICY "Colaboradores pueden registrar integrales"
  ON public.integrales FOR INSERT TO authenticated
  WITH CHECK (
    public.current_user_role() = 'admin'
    OR (public.current_user_role() = 'dificil' AND difficulty_level IN ('basico', 'medio', 'dificil'))
    OR (public.current_user_role() = 'medio' AND difficulty_level IN ('basico', 'medio'))
    OR (public.current_user_role() = 'basico' AND difficulty_level = 'basico')
  );

CREATE POLICY "Admins pueden eliminar integrales"
  ON public.integrales FOR DELETE TO authenticated
  USING (public.current_user_role() = 'admin');
`;
    navigator.clipboard.writeText(sqlText);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                Configuración de Supabase (Opción A)
              </h3>
              <p className="text-xs text-slate-400">
                Paso a paso para conectar la base de datos en la nube para el equipo de MatEs
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Steps Guide */}
        <div className="mt-6 space-y-4">
          <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60">
            <div className="flex items-center gap-2 text-sm font-bold text-white mb-1">
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs">
                1
              </span>
              Crea tu proyecto gratuito en Supabase
            </div>
            <p className="text-xs text-slate-300 ml-7">
              Ingresa a{' '}
              <a
                href="https://supabase.com"
                target="_blank"
                rel="noreferrer"
                className="text-blue-400 hover:underline inline-flex items-center gap-1 font-medium"
              >
                supabase.com <ExternalLink className="w-3 h-3" />
              </a>{' '}
              e inicia sesión con tu cuenta de GitHub. Haz clic en <strong>New Project</strong> (ej. <em>torneo-integrales</em>).
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-bold text-white mb-1">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs">
                  2
                </span>
                Ejecuta el script SQL en Supabase
              </div>
              <button
                type="button"
                onClick={handleCopySql}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-semibold rounded-lg transition-colors"
              >
                {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedSql ? 'Copiado' : 'Copiar Script SQL'}
              </button>
            </div>
            <p className="text-xs text-slate-300 ml-7">
              En tu proyecto de Supabase, ve a la pestaña <strong>SQL Editor</strong>, pega el código que copiaste arriba y haz clic en <strong>Run</strong>. Esto creará las tablas y las políticas de seguridad (RLS) para que cada nivel solo vea lo que le corresponde.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60">
            <div className="flex items-center gap-2 text-sm font-bold text-white mb-1">
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs">
                3
              </span>
              Copia tus credenciales de API
            </div>
            <p className="text-xs text-slate-300 ml-7">
              En Supabase, dirígete a <strong>Project Settings &gt; API</strong> y copia el <em>Project URL</em> y el <em>anon public key</em>. Pégalos en el formulario a continuación:
            </p>
          </div>
        </div>

        {/* Credentials Form */}
        <form onSubmit={handleSave} className="mt-6 space-y-4 pt-4 border-t border-slate-800">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
              Project URL de Supabase
            </label>
            <input
              type="text"
              placeholder="https://xyzcompany.supabase.co"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-blue-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
              Anon Public Key de Supabase
            </label>
            <input
              type="text"
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              value={anonKey}
              onChange={(e) => setAnonKey(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-blue-500 font-mono"
            />
          </div>

          {savedSuccess && (
            <div className="p-3 bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs rounded-xl flex items-center gap-2">
              <Check className="w-4 h-4" />
              ¡Credenciales guardadas con éxito! Conectando a Supabase...
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={handleResetToMock}
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Usar Modo Local / Demo
            </button>

            <button
              type="submit"
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm rounded-xl shadow-lg shadow-blue-500/20 transition-all"
            >
              Guardar y Conectar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
