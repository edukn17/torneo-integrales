import React, { useState, useEffect, useMemo } from 'react';
import { UserProfile, UserRole } from '../types';
import { AuthService } from '../lib/supabase';
import {
  Users,
  Search,
  Check,
  Calendar,
  Info,
} from 'lucide-react';

interface UserManagementProps {
  currentUser: UserProfile;
}

export const UserManagement: React.FC<UserManagementProps> = ({ currentUser }) => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [successId, setSuccessId] = useState<string | null>(null);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await AuthService.fetchAllProfiles();
      setUsers(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    setUpdatingId(userId);
    try {
      await AuthService.updateUserRole(userId, newRole);
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      );
      setSuccessId(userId);
      setTimeout(() => setSuccessId(null), 2000);
    } catch (e) {
      console.error(e);
      alert('Error actualizando el rol del usuario.');
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredUsers = useMemo(() => {
    if (!search.trim()) return users;
    const q = search.toLowerCase();
    return users.filter(
      (u) =>
        u.full_name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q)
    );
  }, [users, search]);

  const stats = useMemo(() => {
    return {
      total: users.length,
      basico: users.filter((u) => u.role === 'basico').length,
      medio: users.filter((u) => u.role === 'medio').length,
      dificil: users.filter((u) => u.role === 'dificil').length,
      admin: users.filter((u) => u.role === 'admin').length,
    };
  }, [users]);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Banner Superior Explicativo */}
      <div className="bg-white rounded-3xl p-6 border border-purple-100 shadow-fcnm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-fcnm-light text-fcnm border border-fcnm-border flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" /> Panel de Control de Colaboradores
              </span>
              <span className="text-xs text-slate-500 font-medium">
                {stats.total} {stats.total === 1 ? 'persona registrada' : 'personas registradas'}
              </span>
            </div>
            <h2 className="text-xl font-bold text-fcnm-dark mt-1.5">
              Gestión de Permisos y Niveles de Acceso
            </h2>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl">
              Cuando un nuevo colaborador se registra en la página web, ingresa automáticamente con nivel{' '}
              <strong className="text-emerald-700">Básico</strong>. Desde este panel puedes cambiar su nivel a{' '}
              <strong className="text-amber-700">Medio</strong>, <strong className="text-fcnm-deep">Difícil</strong> o{' '}
              <strong className="text-purple-900">Administrador</strong> en tiempo real.
            </p>
          </div>

          {/* Tarjetas Rápidas de Conteo */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <div className="bg-purple-50/60 border border-purple-100 rounded-2xl px-3 py-2 text-center">
              <div className="text-[10px] font-bold text-emerald-700 uppercase">Básico</div>
              <div className="text-lg font-bold text-slate-800">{stats.basico}</div>
            </div>
            <div className="bg-purple-50/60 border border-purple-100 rounded-2xl px-3 py-2 text-center">
              <div className="text-[10px] font-bold text-amber-700 uppercase">Medio</div>
              <div className="text-lg font-bold text-slate-800">{stats.medio}</div>
            </div>
            <div className="bg-purple-50/60 border border-purple-100 rounded-2xl px-3 py-2 text-center">
              <div className="text-[10px] font-bold text-fcnm uppercase">Difícil</div>
              <div className="text-lg font-bold text-slate-800">{stats.dificil}</div>
            </div>
            <div className="bg-purple-50/60 border border-purple-100 rounded-2xl px-3 py-2 text-center">
              <div className="text-[10px] font-bold text-purple-900 uppercase">Admin</div>
              <div className="text-lg font-bold text-slate-800">{stats.admin}</div>
            </div>
          </div>
        </div>

        {/* Búsqueda */}
        <div className="mt-5 pt-4 border-t border-purple-50 flex items-center justify-between">
          <div className="relative w-full max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-purple-400" />
            <input
              type="text"
              placeholder="Buscar colaborador por nombre o correo..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-50 hover:bg-purple-50/30 focus:bg-white border border-purple-100 focus:border-fcnm rounded-xl pl-10 pr-4 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none transition-all shadow-sm"
            />
          </div>

          <div className="text-xs text-slate-400 flex items-center gap-1.5 hidden sm:flex">
            <Info className="w-3.5 h-3.5 text-fcnm" /> Los cambios de rol se aplican al instante
          </div>
        </div>
      </div>

      {/* Tabla de Usuarios */}
      <div className="bg-white rounded-3xl border border-purple-100 shadow-fcnm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="w-8 h-8 border-3 border-fcnm border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-xs text-slate-500 font-medium">Cargando lista de colaboradores...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-sm">
            No se encontraron colaboradores que coincidan con la búsqueda.
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-purple-50/60 border-b border-purple-100 text-xs font-bold uppercase tracking-wider text-fcnm-deep">
              <tr>
                <th className="py-3.5 px-6">Colaborador</th>
                <th className="py-3.5 px-6">Correo Institucional</th>
                <th className="py-3.5 px-6">Nivel de Acceso Asignado</th>
                <th className="py-3.5 px-6 text-center">Registro</th>
                <th className="py-3.5 px-6 text-right">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-purple-50">
              {filteredUsers.map((u) => {
                const isCurrentUser = u.id === currentUser.id;
                const isUpdating = updatingId === u.id;
                const isSuccess = successId === u.id;

                return (
                  <tr key={u.id} className="hover:bg-purple-50/30 transition-colors">
                    {/* Nombre e iniciales */}
                    <td className="py-4 px-6 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-fcnm-light to-purple-200 border border-purple-200 flex items-center justify-center font-bold text-fcnm text-xs shadow-sm">
                          {u.full_name
                            ? u.full_name
                                .split(' ')
                                .map((n) => n[0])
                                .slice(0, 2)
                                .join('')
                                .toUpperCase()
                            : 'U'}
                        </div>
                        <div>
                          <div className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                            {u.full_name || 'Sin nombre'}
                            {isCurrentUser && (
                              <span className="text-[10px] bg-purple-100 text-fcnm px-1.5 py-0.2 rounded font-bold">
                                Tú
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-slate-400">ID: {u.id.slice(0, 8)}...</span>
                        </div>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="py-4 px-6 font-mono text-xs text-slate-600 whitespace-nowrap">
                      {u.email}
                    </td>

                    {/* Selector de Nivel */}
                    <td className="py-4 px-6 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <select
                          aria-label={`Cambiar rol de ${u.full_name}`}
                          disabled={isUpdating}
                          value={u.role}
                          onChange={(e) => handleRoleChange(u.id, e.target.value as UserRole)}
                          className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition-all cursor-pointer shadow-sm ${
                            u.role === 'admin'
                              ? 'bg-purple-100 text-purple-900 border-purple-300'
                              : u.role === 'dificil'
                              ? 'bg-fcnm-light text-fcnm-deep border-fcnm-border'
                              : u.role === 'medio'
                              ? 'bg-amber-50 text-amber-900 border-amber-200'
                              : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          }`}
                        >
                          <option value="basico">Nivel Básico (Solo Fase 1)</option>
                          <option value="medio">Nivel Medio (Fase 1 y Fase 2)</option>
                          <option value="dificil">Nivel Difícil (Fase 1, 2 y 3)</option>
                          <option value="admin">Administrador (Total)</option>
                        </select>

                        {isSuccess && (
                          <span className="text-xs text-emerald-600 font-bold flex items-center gap-1 animate-fadeIn">
                            <Check className="w-3.5 h-3.5" /> Actualizado
                          </span>
                        )}
                        {isUpdating && (
                          <div className="w-3.5 h-3.5 border-2 border-fcnm border-t-transparent rounded-full animate-spin" />
                        )}
                      </div>
                    </td>

                    {/* Fecha de Registro */}
                    <td className="py-4 px-6 text-center text-xs text-slate-500 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-purple-300" />
                        {u.created_at
                          ? new Date(u.created_at).toLocaleDateString()
                          : 'Octubre 2026'}
                      </span>
                    </td>

                    {/* Estado */}
                    <td className="py-4 px-6 text-right whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Activo
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
