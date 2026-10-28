import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Integral, UserProfile, UserRole, ROLE_HIERARCHY } from '../types';
import { INITIAL_INTEGRALS } from './mockData';

// Configuración de Supabase
const ENV_SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const ENV_SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Permitir guardar en localStorage para configurar desde la interfaz sin redeploy
const STORAGE_KEY_URL = 'torneo_supabase_url';
const STORAGE_KEY_KEY = 'torneo_supabase_anon_key';
const STORAGE_KEY_MOCK_INTEGRALS = 'torneo_mock_integrales_v1';
const STORAGE_KEY_USER_PROFILE = 'torneo_mock_user_profile_v1';

export function getSupabaseCredentials(): { url: string; anonKey: string } {
  const localUrl = localStorage.getItem(STORAGE_KEY_URL);
  const localKey = localStorage.getItem(STORAGE_KEY_KEY);
  return {
    url: localUrl || ENV_SUPABASE_URL,
    anonKey: localKey || ENV_SUPABASE_ANON_KEY,
  };
}

export function saveSupabaseCredentials(url: string, anonKey: string) {
  if (url && anonKey) {
    localStorage.setItem(STORAGE_KEY_URL, url.trim());
    localStorage.setItem(STORAGE_KEY_KEY, anonKey.trim());
  } else {
    localStorage.removeItem(STORAGE_KEY_URL);
    localStorage.removeItem(STORAGE_KEY_KEY);
  }
}

let supabaseInstance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  const { url, anonKey } = getSupabaseCredentials();
  if (!url || !anonKey || url === 'TU_SUPABASE_URL_AQUI') {
    return null;
  }
  if (!supabaseInstance) {
    try {
      supabaseInstance = createClient(url, anonKey);
    } catch (e) {
      console.warn('Error inicializando cliente de Supabase:', e);
      return null;
    }
  }
  return supabaseInstance;
}

// -------------------------------------------------------------
// SERVICIO DE INTEGRALES (Soporta Supabase Real y Modo Local/Demo)
// -------------------------------------------------------------

function getStoredMockIntegrals(): Integral[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_MOCK_INTEGRALS);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Error leyendo integrales locales:', e);
  }
  localStorage.setItem(STORAGE_KEY_MOCK_INTEGRALS, JSON.stringify(INITIAL_INTEGRALS));
  return INITIAL_INTEGRALS;
}

function saveStoredMockIntegrals(integrals: Integral[]) {
  localStorage.setItem(STORAGE_KEY_MOCK_INTEGRALS, JSON.stringify(integrals));
}

export const IntegralService = {
  isSupabaseConfigured(): boolean {
    return getSupabaseClient() !== null;
  },

  async fetchIntegrals(userRole: UserRole): Promise<Integral[]> {
    const client = getSupabaseClient();
    const allowedLevels = ROLE_HIERARCHY[userRole] || ['basico'];

    if (client) {
      try {
        const { data, error } = await client
          .from('integrales')
          .select('*')
          .in('difficulty_level', allowedLevels)
          .order('created_at', { ascending: false });

        if (error) {
          console.warn('Supabase fetch error, cayendo a modo local:', error);
          throw error;
        }
        return data as Integral[];
      } catch (err) {
        console.warn('Fallo Supabase, usando banco local:', err);
      }
    }

    // Modo local / Fallback
    const localAll = getStoredMockIntegrals();
    return localAll.filter((int) => allowedLevels.includes(int.difficulty_level));
  },

  async createIntegral(integral: Omit<Integral, 'id' | 'created_at'>): Promise<Integral> {
    const client = getSupabaseClient();

    if (client) {
      try {
        const { data, error } = await client
          .from('integrales')
          .insert([integral])
          .select()
          .single();

        if (error) throw error;
        return data as Integral;
      } catch (err) {
        console.warn('Fallo al insertar en Supabase, guardando en local:', err);
      }
    }

    // Guardado local
    const newIntegral: Integral = {
      ...integral,
      id: 'local-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      created_at: new Date().toISOString(),
    };

    const current = getStoredMockIntegrals();
    const updated = [newIntegral, ...current];
    saveStoredMockIntegrals(updated);
    return newIntegral;
  },

  async updateIntegral(id: string, updates: Partial<Integral>): Promise<Integral> {
    const client = getSupabaseClient();

    if (client) {
      try {
        const { data, error } = await client
          .from('integrales')
          .update(updates)
          .eq('id', id)
          .select()
          .single();

        if (error) throw error;
        return data as Integral;
      } catch (err) {
        console.warn('Fallo al actualizar en Supabase, actualizando en local:', err);
      }
    }

    const current = getStoredMockIntegrals();
    const updated = current.map((item) => (item.id === id ? { ...item, ...updates } : item));
    saveStoredMockIntegrals(updated);
    const found = updated.find((i) => i.id === id);
    if (!found) throw new Error('Integral no encontrada');
    return found;
  },

  async deleteIntegral(id: string): Promise<void> {
    const client = getSupabaseClient();

    if (client) {
      try {
        const { error } = await client.from('integrales').delete().eq('id', id);
        if (error) throw error;
        return;
      } catch (err) {
        console.warn('Fallo al eliminar en Supabase, eliminando en local:', err);
      }
    }

    const current = getStoredMockIntegrals();
    const updated = current.filter((item) => item.id !== id);
    saveStoredMockIntegrals(updated);
  },

  resetToInitialMock(): void {
    localStorage.setItem(STORAGE_KEY_MOCK_INTEGRALS, JSON.stringify(INITIAL_INTEGRALS));
  }
};

// -------------------------------------------------------------
// SERVICIO DE AUTENTICACIÓN / PERFILES
// -------------------------------------------------------------

export const AuthService = {
  getStoredProfile(): UserProfile {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_USER_PROFILE);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.error(e);
    }
    // Usuario por defecto: Administrador del Club MatEs
    const defaultProfile: UserProfile = {
      id: 'demo-admin-1',
      email: 'organizador@mates-espol.edu.ec',
      full_name: 'Colaborador MatEs',
      role: 'admin',
      is_demo: true,
    };
    localStorage.setItem(STORAGE_KEY_USER_PROFILE, JSON.stringify(defaultProfile));
    return defaultProfile;
  },

  setStoredProfile(profile: UserProfile): void {
    localStorage.setItem(STORAGE_KEY_USER_PROFILE, JSON.stringify(profile));
  },

  async getCurrentUser(): Promise<UserProfile | null> {
    const client = getSupabaseClient();
    if (!client) {
      return this.getStoredProfile();
    }

    const { data: { session } } = await client.auth.getSession();
    if (!session?.user) {
      return this.getStoredProfile();
    }

    const { data: profile } = await client
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();

    if (profile) {
      return {
        id: profile.id,
        email: profile.email,
        full_name: profile.full_name,
        role: profile.role,
        is_demo: false,
      };
    }

    return {
      id: session.user.id,
      email: session.user.email || '',
      full_name: session.user.user_metadata?.full_name || 'Colaborador',
      role: 'basico',
      is_demo: false,
    };
  },

  async signOut(): Promise<void> {
    const client = getSupabaseClient();
    if (client) {
      await client.auth.signOut();
    }
  }
};
