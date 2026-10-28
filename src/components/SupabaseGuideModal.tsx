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
    const sqlText = `-- ==============================================================================
-- TORNEO DE INTEGRALES - CLUB MATES / AEFIEC / IEEE-HKN (ESPOL - FCNM)
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl overflow-hidden">
        {/* Header Institucional */}
        <div className="bg-espol-navy p-6 text-white flex items-center justify-between border-b-2 border-espol-gold">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-white/10 text-espol-gold">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                Conectar con Supabase
              </h3>
              <p className="text-xs text-slate-300">
                Sincronización en tiempo real para el equipo de MatEs / FCNM
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-300 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Pasos */}
        <div className="p-6 sm:p-8 space-y-4">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-800 mb-1">
              <span className="w-5 h-5 rounded-full bg-espol-bright text-white flex items-center justify-center text-xs">
                1
              </span>
              Crea tu proyecto gratuito en Supabase
            </div>
            <p className="text-xs text-slate-600 ml-7">
              Ingresa a{' '}
              <a
                href="https://supabase.com"
                target="_blank"
                rel="noreferrer"
                className="text-espol-bright hover:underline inline-flex items-center gap-1 font-bold"
              >
                supabase.com <ExternalLink className="w-3 h-3" />
              </a>{' '}
              con tu cuenta de GitHub y crea un nuevo proyecto llamado <code>torneo-integrales</code>.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-800 mb-1">
                <span className="w-5 h-5 rounded-full bg-espol-bright text-white flex items-center justify-center text-xs">
                  2
                </span>
                Ejecuta el script SQL en Supabase
              </div>
              <button
                type="button"
                onClick={handleCopySql}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-espol-navy hover:bg-espol-blue text-white text-xs font-bold rounded-lg transition-colors"
              >
                {copiedSql ? <Check className="w-3.5 h-3.5 text-espol-gold" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedSql ? 'Copiado' : 'Copiar Script SQL'}
              </button>
            </div>
            <p className="text-xs text-slate-600 ml-7">
              En Supabase, entra a la pestaña <strong>SQL Editor</strong>, pega el script copiado y haz clic en <strong>Run</strong> para inicializar las tablas y las políticas de seguridad (RLS).
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-800 mb-1">
              <span className="w-5 h-5 rounded-full bg-espol-bright text-white flex items-center justify-center text-xs">
                3
              </span>
              Ingresa las credenciales de tu proyecto
            </div>
            <p className="text-xs text-slate-600 ml-7">
              En Supabase, ve a <strong>Project Settings &gt; API</strong> y copia el <em>Project URL</em> y el <em>anon public key</em>:
            </p>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSave} className="space-y-4 pt-3 border-t border-slate-200">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Project URL de Supabase
              </label>
              <input
                type="text"
                placeholder="https://xyzcompany.supabase.co"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-espol-bright font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Anon Public Key de Supabase
              </label>
              <input
                type="text"
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                value={anonKey}
                onChange={(e) => setAnonKey(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-espol-bright font-mono"
              />
            </div>

            {savedSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2 font-semibold">
                <Check className="w-4 h-4 text-emerald-600" />
                ¡Credenciales guardadas con éxito! Conectando a Supabase...
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={handleResetToMock}
                className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 font-semibold"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Restaurar Modo Local / Demo
              </button>

              <button
                type="submit"
                className="px-5 py-2.5 bg-espol-bright hover:bg-espol-blue text-white font-bold text-sm rounded-xl shadow-md transition-all"
              >
                Guardar y Conectar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
