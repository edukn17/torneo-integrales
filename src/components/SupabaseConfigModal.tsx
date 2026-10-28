import React, { useState } from 'react';
import { X, Database, Check } from 'lucide-react';
import { getSupabaseCredentials, saveSupabaseCredentials } from '../lib/supabase';

interface SupabaseConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const SupabaseConfigModal: React.FC<SupabaseConfigModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const creds = getSupabaseCredentials();
  const [url, setUrl] = useState(creds.url);
  const [anonKey, setAnonKey] = useState(creds.anonKey);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveSupabaseCredentials(url, anonKey);
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      onSuccess();
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white border border-purple-100 rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden">
        <div className="bg-fcnm-dark p-6 text-white flex items-center justify-between border-b border-fcnm">
          <div className="flex items-center gap-2.5">
            <Database className="w-5 h-5 text-espol-gold" />
            <h3 className="text-base font-bold">Credenciales de Supabase</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-purple-200 hover:text-white rounded-lg hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-4">
          <p className="text-xs text-slate-600">
            Asegúrate de copiar el <strong>Project URL</strong> exacto de Supabase en <em>Project Settings &gt; API</em> (debe terminar en <code>.supabase.co</code> sin barras ni rutas al final).
          </p>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Project URL
            </label>
            <input
              type="text"
              required
              placeholder="https://xyzabcdefg.supabase.co"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full bg-slate-50 border border-purple-100 focus:border-fcnm rounded-xl px-3.5 py-2 text-sm text-slate-800 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Anon Public Key
            </label>
            <input
              type="text"
              required
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              value={anonKey}
              onChange={(e) => setAnonKey(e.target.value)}
              className="w-full bg-slate-50 border border-purple-100 focus:border-fcnm rounded-xl px-3.5 py-2 text-sm text-slate-800 font-mono text-xs"
            />
          </div>

          {success && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2 font-bold">
              <Check className="w-4 h-4 text-emerald-600" /> ¡Credenciales guardadas y corregidas con éxito!
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => {
                saveSupabaseCredentials('', '');
                setUrl('');
                setAnonKey('');
                onSuccess();
                onClose();
              }}
              className="text-xs text-slate-400 hover:text-slate-600"
            >
              Borrar credenciales
            </button>

            <button
              type="submit"
              className="px-5 py-2 bg-fcnm hover:bg-fcnm-hover text-white text-xs font-bold rounded-xl shadow-md transition-all"
            >
              Guardar y Reconectar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
