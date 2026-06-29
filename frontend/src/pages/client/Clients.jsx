import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/api';

const fmtDate = d => d ? new Date(d).toLocaleDateString('fr-FR') : '—';

export default function Clients() {
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError]     = useState('');
    const [search, setSearch]   = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        api.get('/clients')
            .then(res => setClients(res.data))
            .catch(() => setError('Erreur lors du chargement des clients.'))
            .finally(() => setLoading(false));
    }, []);

    const filtered = clients.filter(c => {
        const q = search.toLowerCase();
        return c.full_name.toLowerCase().includes(q)
            || c.cin.toLowerCase().includes(q)
            || c.phone.toLowerCase().includes(q);
    });

    if (loading) return (
        <div className="space-y-5">
            <div className="h-7 w-28 bg-slate-200 rounded animate-pulse" />
            <div className="h-9 w-full max-w-sm bg-slate-200 rounded-lg animate-pulse" />
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="flex items-center gap-4 px-5 py-3.5 border-b border-slate-100">
                        <div className="w-9 h-9 bg-slate-200 rounded-full animate-pulse" />
                        <div className="flex-1 space-y-1.5">
                            <div className="h-3.5 bg-slate-200 rounded animate-pulse w-1/3" />
                            <div className="h-3 bg-slate-200 rounded animate-pulse w-1/5" />
                        </div>
                        <div className="h-3.5 bg-slate-200 rounded animate-pulse w-24" />
                    </div>
                ))}
            </div>
        </div>
    );

    if (error) return (
        <div className="flex items-center gap-2 bg-red-50 text-red-600 px-4 py-3 rounded-xl border border-red-200 text-sm">
            <i className="ti ti-alert-circle" /> {error}
        </div>
    );

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-xl font-semibold text-slate-900">Clients</h1>
                    <p className="text-sm text-slate-500 mt-0.5">{clients.length} clients enregistrés</p>
                </div>
                <button
                    onClick={() => navigate('/clients/ajouter')}
                    className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition shadow-sm"
                >
                    <i className="ti ti-plus text-[14px]" />
                    Ajouter
                </button>
            </div>

            {/* Search */}
            <div className="relative mb-5 max-w-sm">
                <i className="ti ti-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[15px]" />
                <input
                    type="text"
                    placeholder="Rechercher par nom, CIN, téléphone…"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full bg-white border border-slate-300 text-slate-900 placeholder-slate-400 pl-9 pr-3 py-2 rounded-lg text-sm focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition"
                />
            </div>

            {/* Table */}
            {filtered.length === 0 ? (
                <div className="text-center py-16 text-slate-400 bg-white border border-slate-200 rounded-xl">
                    Aucun client trouvé.
                </div>
            ) : (
                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-slate-200 bg-slate-50">
                                {['Client', 'CIN', 'Permis', 'Expiration permis', 'Téléphone', 'Locations'].map(h => (
                                    <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filtered.map(client => {
                                const initials = client.full_name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
                                return (
                                    <tr
                                        key={client.id}
                                        onClick={() => navigate(`/clients/${client.id}`)}
                                        className="hover:bg-slate-50/70 transition-colors cursor-pointer"
                                    >
                                        <td className="px-5 py-3.5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-xs font-semibold flex-shrink-0">
                                                    {initials}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-slate-900">{client.full_name}</p>
                                                    <p className="text-xs text-slate-400">{client.email || '—'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-3.5 font-mono text-xs text-slate-500">{client.cin}</td>
                                        <td className="px-5 py-3.5 font-mono text-xs text-slate-500">{client.driving_license}</td>
                                        <td className="px-5 py-3.5 text-slate-600">{fmtDate(client.driving_license_expiration)}</td>
                                        <td className="px-5 py-3.5 text-slate-600">{client.phone}</td>
                                        <td className="px-5 py-3.5 text-slate-600">{client.rentals?.length ?? 0}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
