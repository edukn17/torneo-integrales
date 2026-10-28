import { useState, useEffect, useCallback } from 'react';
import { Integral, UserProfile, UserRole } from './types';
import { IntegralService, AuthService } from './lib/supabase';
import { Navbar } from './components/Navbar';
import { IntegralList } from './components/IntegralList';
import { IntegralEditor } from './components/IntegralEditor';
import { ProjectorMode } from './components/ProjectorMode';
import { SupabaseGuideModal } from './components/SupabaseGuideModal';
import confetti from 'canvas-confetti';
import { Calendar, Award, Building2 } from 'lucide-react';

export function App() {
  const [user, setUser] = useState<UserProfile>(() => AuthService.getStoredProfile());
  const [integrals, setIntegrals] = useState<Integral[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState<'list' | 'editor' | 'projector'>('list');
  const [editingIntegral, setEditingIntegral] = useState<Integral | null>(null);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [isSupabaseConnected, setIsSupabaseConnected] = useState(false);

  // Cargar integrales según rol
  const loadIntegrals = useCallback(async (role: UserRole) => {
    setLoading(true);
    try {
      const data = await IntegralService.fetchIntegrals(role);
      setIntegrals(data);
    } catch (e) {
      console.error('Error cargando integrales:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setIsSupabaseConnected(IntegralService.isSupabaseConfigured());
    loadIntegrals(user.role);
  }, [user.role, loadIntegrals]);

  const handleRoleChange = (newRole: UserRole) => {
    const updatedUser = { ...user, role: newRole };
    setUser(updatedUser);
    AuthService.setStoredProfile(updatedUser);
    loadIntegrals(newRole);
  };

  const handleSaveIntegral = async (data: Omit<Integral, 'id' | 'created_at'>) => {
    if (editingIntegral) {
      await IntegralService.updateIntegral(editingIntegral.id, data);
    } else {
      await IntegralService.createIntegral(data);
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
      });
    }
    setEditingIntegral(null);
    setCurrentTab('list');
    await loadIntegrals(user.role);
  };

  const handleDeleteIntegral = async (id: string) => {
    if (window.confirm('¿Seguro que deseas eliminar este ejercicio del banco del torneo?')) {
      await IntegralService.deleteIntegral(id);
      await loadIntegrals(user.role);
    }
  };

  const handleEditIntegral = (integral: Integral) => {
    setEditingIntegral(integral);
    setCurrentTab('editor');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 font-sans selection:bg-fcnm selection:text-white">
      {/* Barra de navegación superior */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={(tab) => {
          if (tab === 'editor') setEditingIntegral(null);
          setCurrentTab(tab);
        }}
        user={user}
        onChangeRole={handleRoleChange}
        onOpenConfig={() => setIsConfigOpen(true)}
        isSupabaseConnected={isSupabaseConnected}
        totalIntegralsCount={integrals.length}
      />

      {/* Contenido Principal */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">
        {currentTab === 'list' && (
          <div>
            {loading ? (
              <div className="flex flex-col items-center justify-center min-h-[300px]">
                <div className="w-10 h-10 border-4 border-fcnm border-t-transparent rounded-full animate-spin mb-3" />
                <p className="text-sm font-semibold text-slate-500">Cargando banco de integrales...</p>
              </div>
            ) : (
              <IntegralList
                integrals={integrals}
                userRole={user.role}
                onEdit={handleEditIntegral}
                onDelete={handleDeleteIntegral}
                onAddNew={() => {
                  setEditingIntegral(null);
                  setCurrentTab('editor');
                }}
              />
            )}
          </div>
        )}

        {currentTab === 'editor' && (
          <IntegralEditor
            initialIntegral={editingIntegral}
            userRole={user.role}
            onSave={handleSaveIntegral}
            onCancel={() => {
              setEditingIntegral(null);
              setCurrentTab('list');
            }}
          />
        )}

        {currentTab === 'projector' && (
          <ProjectorMode
            integrals={integrals}
            onExit={() => setCurrentTab('list')}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-purple-100 py-6 mt-12 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-fcnm">Torneo de Integrales ESPOL</span>
            <span>•</span>
            <span>Organizado por Club MatEs, AEFIEC e IEEE-HKN Nu Zeta</span>
          </div>

          <div className="flex items-center gap-4 font-semibold text-slate-600">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-fcnm" /> Diciembre 2026
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5 text-slate-400" /> Auditorio Pedro Franco Dávila
            </span>
            <span>•</span>
            <span className="flex items-center gap-1 text-amber-600">
              <Award className="w-3.5 h-3.5" /> Premio $50 al Ganador
            </span>
          </div>
        </div>
      </footer>

      {/* Modal Guía Supabase */}
      <SupabaseGuideModal
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
        onCredentialsUpdated={() => {
          setIsSupabaseConnected(IntegralService.isSupabaseConfigured());
          loadIntegrals(user.role);
        }}
      />
    </div>
  );
}

export default App;
