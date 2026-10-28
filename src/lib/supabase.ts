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
const STORAGE_KEY_MOCK_PROFILES = 'torneo_mock_all_profiles_v1';

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
// SERVICIO DE AUTENTICACIÓN / PERFILES / GESTIÓN DE ROLES
// -------------------------------------------------------------

const INITIAL_MOCK_PROFILES: UserProfile[] = [
  {
    id: 'user-1',
    email: 'organizador@mates-espol.edu.ec',
    full_name: 'Coordinador General MatEs',
    role: 'admin',
    created_at: '2026-10-21T09:00:00Z',
    is_demo: true,
  },
  {
    id: 'user-2',
    email: 'tutor.calculo@espol.edu.ec',
    full_name: 'Docente Tutor de Cálculo',
    role: 'dificil',
    created_at: '2026-10-22T10:00:00Z',
    is_demo: true,
  },
  {
    id: 'user-3',
    email: 'colaborador.fase2@espol.edu.ec',
    full_name: 'Comité Duelos de 16',
    role: 'medio',
    created_at: '2026-10-23T14:30:00Z',
    is_demo: true,
  },
  {
    id: 'user-4',
    email: 'ayudante.fase1@espol.edu.ec',
    full_name: 'Comité Clasificación Escrita',
    role: 'basico',
    created_at: '2026-10-24T16:00:00Z',
    is_demo: true,
  },
];

export const AuthService = {
  getStoredProfile(): UserProfile {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_USER_PROFILE);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.error(e);
    }
    const defaultProfile: UserProfile = INITIAL_MOCK_PROFILES[0];
    localStorage.setItem(STORAGE_KEY_USER_PROFILE, JSON.stringify(defaultProfile));
    return defaultProfile;
  },

  setStoredProfile(profile: UserProfile): void {
    localStorage.setItem(STORAGE_KEY_USER_PROFILE, JSON.stringify(profile));
  },

  async getCurrentUser(): Promise<UserProfile> {
    const client = getSupabaseClient();
    if (!client) {
      return this.getStoredProfile();
    }

    try {
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
        const userProfile: UserProfile = {
          id: profile.id,
          email: profile.email,
          full_name: profile.full_name || session.user.user_metadata?.full_name || 'Colaborador',
          role: profile.role,
          created_at: profile.created_at,
          is_demo: false,
        };
        this.setStoredProfile(userProfile);
        return userProfile;
      }
    } catch (e) {
      console.warn('Error obteniendo sesión de Supabase:', e);
    }

    return this.getStoredProfile();
  },

  async signUp(email: string, password: string, fullName: string): Promise<{ user: UserProfile | null; error: string | null }> {
    const client = getSupabaseClient();

    if (!client) {
      // Mock signup
      const newMockUser: UserProfile = {
        id: 'mock-user-' + Date.now(),
        email: email.trim(),
        full_name: fullName.trim() || 'Nuevo Colaborador',
        role: 'basico',
        created_at: new Date().toISOString(),
        is_demo: true,
      };
      this.setStoredProfile(newMockUser);
      return { user: newMockUser, error: null };
    }

    try {
      const { data, error } = await client.auth.signUp({
        email: email.trim(),
        password: password,
        options: {
          data: {
            full_name: fullName.trim(),
            role: 'basico',
          },
        },
      });

      if (error) {
        return { user: null, error: error.message };
      }

      if (data.user) {
        const newProfile: UserProfile = {
          id: data.user.id,
          email: data.user.email || email,
          full_name: fullName.trim(),
          role: 'basico',
          created_at: new Date().toISOString(),
          is_demo: false,
        };
        this.setStoredProfile(newProfile);
        return { user: newProfile, error: null };
      }

      return { user: null, error: 'Revisa tu correo o intenta iniciar sesión.' };
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Error desconocido al registrar usuario';
      return { user: null, error: errorMsg };
    }
  },

  async signIn(email: string, password: string): Promise<{ user: UserProfile | null; error: string | null }> {
    const client = getSupabaseClient();

    if (!client) {
      const stored = this.getStoredProfile();
      return { user: stored, error: null };
    }

    try {
      const { data, error } = await client.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      if (error) {
        return { user: null, error: error.message };
      }

      if (data.user) {
        const { data: profile } = await client
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        const role = profile?.role || 'basico';
        const userProfile: UserProfile = {
          id: data.user.id,
          email: data.user.email || email,
          full_name: profile?.full_name || data.user.user_metadata?.full_name || 'Colaborador',
          role: role,
          created_at: profile?.created_at,
          is_demo: false,
        };
        this.setStoredProfile(userProfile);
        return { user: userProfile, error: null };
      }

      return { user: null, error: 'Credenciales inválidas' };
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Error desconocido al iniciar sesión';
      return { user: null, error: errorMsg };
    }
  },

  async signOut(): Promise<void> {
    const client = getSupabaseClient();
    if (client) {
      await client.auth.signOut();
    }
    localStorage.removeItem(STORAGE_KEY_USER_PROFILE);
  },

  // Obtener lista de todos los colaboradores registrados para el panel de Admin
  async fetchAllProfiles(): Promise<UserProfile[]> {
    const client = getSupabaseClient();

    if (client) {
      try {
        const { data, error } = await client
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data) {
          return data as UserProfile[];
        }
      } catch (e) {
        console.warn('Error obteniendo perfiles de Supabase:', e);
      }
    }

    // Modo local / Fallback
    try {
      const raw = localStorage.getItem(STORAGE_KEY_MOCK_PROFILES);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.error(e);
    }
    localStorage.setItem(STORAGE_KEY_MOCK_PROFILES, JSON.stringify(INITIAL_MOCK_PROFILES));
    return INITIAL_MOCK_PROFILES;
  },

  // Modificar nivel/rol de un colaborador
  async updateUserRole(userId: string, newRole: UserRole): Promise<void> {
    const client = getSupabaseClient();

    if (client) {
      try {
        const { error } = await client
          .from('profiles')
          .update({ role: newRole, updated_at: new Date().toISOString() })
          .eq('id', userId);

        if (error) throw error;
        return;
      } catch (e) {
        console.warn('Error actualizando rol en Supabase:', e);
      }
    }

    // Modo local
    const raw = localStorage.getItem(STORAGE_KEY_MOCK_PROFILES);
    const list: UserProfile[] = raw ? JSON.parse(raw) : INITIAL_MOCK_PROFILES;
    const updated = list.map((u) => (u.id === userId ? { ...u, role: newRole } : u));
    localStorage.setItem(STORAGE_KEY_MOCK_PROFILES, JSON.stringify(updated));
  }
};
