import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import api from '../../api/api';

const fmtDate = d => d ? new Date(d).toLocaleDateString('fr-FR') : '—';

const ROLE_LABEL = { owner: 'Propriétaire', admin: 'Administrateur', agent: 'Agent', employee: 'Employé' };
const ROLE_CLS = {
    owner:    'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
    admin:    'bg-purple-50 text-purple-700 ring-1 ring-purple-200',
    agent:    'bg-stone-100 text-stone-600 ring-1 ring-stone-200',
    employee: 'bg-stone-100 text-stone-600 ring-1 ring-stone-200',
};

const extractList = data => {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data?.data?.data)) return data.data.data;
    return [];
};

export default function Utilisateurs() {
    const navigate = useNavigate();
    const currentRole = useSelector(state => state.auth.user?.role);
    const canManage = currentRole === 'owner';
    const [users, setUsers]     = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError]     = useState('');
    const [search, setSearch]   = useState('');
    const [togglingId, setTogglingId] = useState(null);
    const [toggleError, setToggleError] = useState('');

    useEffect(() => {
        api.get('/users')
            .then(res => setUsers(extractList(res.data)))
            .catch(() => setError('Erreur lors du chargement des utilisateurs.'))
            .finally(() => setLoading(false));
    }, []);

    const handleToggleStatus = async (userId) => {
        setTogglingId(userId);
        setToggleError('');
        try {
            const res = await api.get(`/user/${userId}/toggleStatus`);
            const isActive = (res.data?.data ?? res.data)?.isActive;
            setUsers(us => us.map(u => u.id === userId
                ? { ...u, is_active: isActive ?? !u.is_active }
                : u));
        } catch {
            setToggleError('Erreur lors du changement de statut.');
        } finally {
            setTogglingId(null);
        }
    };

    const filtered = users.filter(u => {
        const q = search.toLowerCase();
        return u.name.toLowerCase().includes(q)
            || u.email.toLowerCase().includes(q);
    });

    if (loading) return (
        <div className="space-y-5">
            <div className="h-7 w-40 bg-stone-200 rounded-sm animate-pulse" />
            <div className="h-9 w-full max-w-sm bg-stone-200 rounded-md animate-pulse" />
            <div className="bg-white border border-stone-200 rounded-lg overflow-hidden">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="flex items-center gap-4 px-5 py-3.5 border-b border-stone-100">
                        <div className="w-9 h-9 bg-stone-200 rounded-full animate-pulse" />
                        <div className="flex-1 space-y-1.5">
                            <div className="h-3.5 bg-stone-200 rounded-sm animate-pulse w-1/3" />
                            <div className="h-3 bg-stone-200 rounded-sm animate-pulse w-1/5" />
                        </div>
                        <div className="h-3.5 bg-stone-200 rounded-sm animate-pulse w-24" />
                    </div>
                ))}
            </div>
        </div>
    );

    if (error) return (
        <div className="flex items-center gap-2 bg-red-50 text-red-600 px-4 py-3 rounded-lg border border-red-200 text-sm">
            <i className="ti ti-alert-circle" /> {error}
        </div>
    );

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-xl font-semibold text-stone-900">Utilisateurs</h1>
                    <p className="text-sm text-stone-500 mt-0.5">{users.length} utilisateurs enregistrés</p>
                </div>
                {canManage && (
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.94 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                        onClick={() => navigate('/utilisateurs/ajouter')}
                        className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium px-4 py-2 rounded-md transition-colors shadow-sm"
                    >
                        <i className="ti ti-plus text-[14px]" />
                        Ajouter
                    </motion.button>
                )}
            </div>

            {toggleError && (
                <div className="flex items-center gap-2 bg-red-50 text-red-600 px-4 py-3 rounded-lg border border-red-200 text-sm mb-5">
                    <i className="ti ti-alert-circle" /> {toggleError}
                </div>
            )}

            {/* Search */}
            <div className="relative mb-5 max-w-sm">
                <i className="ti ti-search absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-[15px]" />
                <input
                    type="text"
                    placeholder="Rechercher par nom, email…"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full bg-white border border-stone-300 text-stone-900 placeholder-stone-400 pl-9 pr-3 py-2 rounded-md text-sm focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition"
                />
            </div>

            {/* Table */}
            {filtered.length === 0 ? (
                <div className="text-center py-16 text-stone-400 bg-white border border-stone-200 rounded-lg">
                    Aucun utilisateur trouvé.
                </div>
            ) : (
                <div className="bg-white border border-stone-200 rounded-lg overflow-hidden shadow-sm">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-stone-200 bg-stone-50">
                                {['Utilisateur', 'Email', 'Rôle', 'Statut', 'Créé le', ''].map(h => (
                                    <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wider">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100">
                            {filtered.map((user, index) => {
                                const initials = user.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
                                return (
                                    <motion.tr
                                        key={user.id}
                                        initial={{ opacity: 0, x: -16 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ type: 'spring', stiffness: 300, damping: 26, delay: index * 0.04 }}
                                        className="hover:bg-stone-50/70 transition-colors"
                                    >
                                        <td className="px-5 py-3.5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center text-xs font-semibold flex-shrink-0">
                                                    {initials}
                                                </div>
                                                <p className="font-medium text-stone-900">{user.name}</p>
                                            </div>
                                        </td>
                                        <td className="px-5 py-3.5 text-stone-600">{user.email}</td>
                                        <td className="px-5 py-3.5">
                                            <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${ROLE_CLS[user.role] ?? ROLE_CLS.employee}`}>
                                                {ROLE_LABEL[user.role] ?? user.role}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                                                user.is_active ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200' : 'bg-red-50 text-red-600 ring-1 ring-red-200'
                                            }`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${user.is_active ? 'bg-emerald-500' : 'bg-red-500'}`} />
                                                {user.is_active ? 'Actif' : 'Inactif'}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3.5 text-stone-600">{fmtDate(user.created_at)}</td>
                                        <td className="px-5 py-3.5 text-right">
                                            {canManage && (
                                                <div className="inline-flex items-center gap-1.5">
                                                    <button
                                                        onClick={() => handleToggleStatus(user.id)}
                                                        disabled={togglingId === user.id}
                                                        title={user.is_active ? 'Désactiver' : 'Activer'}
                                                        className="w-8 h-8 rounded-md border border-stone-200 text-stone-400 hover:text-amber-600 hover:bg-amber-50 hover:border-amber-200 transition-colors inline-flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        {togglingId === user.id ? (
                                                            <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                                                <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
                                                            </svg>
                                                        ) : (
                                                            <i className={`ti ${user.is_active ? 'ti-lock' : 'ti-lock-open'} text-[14px]`} />
                                                        )}
                                                    </button>
                                                    <button
                                                        onClick={() => navigate(`/utilisateurs/${user.id}/modifier`)}
                                                        title="Modifier"
                                                        className="w-8 h-8 rounded-md border border-stone-200 text-stone-400 hover:text-emerald-600 hover:bg-emerald-50 hover:border-emerald-200 transition-colors inline-flex items-center justify-center"
                                                    >
                                                        <i className="ti ti-pencil text-[14px]" />
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </motion.tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
