import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/api';

const fmtDate  = d => d ? new Date(d).toLocaleDateString('fr-FR') : '—';
const fmtPrice = p => p ? parseFloat(p).toLocaleString() + ' MAD' : '—';

// Liste des maintenances : recherche par type, accès à la voiture liée.
export default function Maintenances() {
    const [maintenances, setMaintenances] = useState([]);
    const [carsById, setCarsById]         = useState({});
    const [loading, setLoading]           = useState(true);
    const [error, setError]               = useState('');
    const [search, setSearch]             = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        Promise.all([api.get('/maintenance'), api.get('/cars')])
            .then(([maintRes, carsRes]) => {
                setMaintenances(maintRes.data);
                setCarsById(Object.fromEntries(carsRes.data.map(c => [c.id, c])));
            })
            .catch(() => setError('Erreur lors du chargement des maintenances.'))
            .finally(() => setLoading(false));
    }, []);

    const filtered = maintenances.filter(m => (m.maintenanceType || '').toLowerCase().includes(search.toLowerCase()));

    if (loading) return (
        <div className="space-y-5">
            <div className="h-7 w-40 bg-slate-200 rounded animate-pulse" />
            <div className="h-9 w-full max-w-sm bg-slate-200 rounded-lg animate-pulse" />
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="flex items-center gap-4 px-5 py-3.5 border-b border-slate-100">
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
                    <h1 className="text-xl font-semibold text-slate-900">Maintenance</h1>
                    <p className="text-sm text-slate-500 mt-0.5">{maintenances.length} maintenances enregistrées</p>
                </div>
                <button
                    onClick={() => navigate('/maintenance/ajouter')}
                    className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition shadow-sm"
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
                    placeholder="Rechercher par type…"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full bg-white border border-slate-300 text-slate-900 placeholder-slate-400 pl-9 pr-3 py-2 rounded-lg text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition"
                />
            </div>

            {/* Table */}
            {filtered.length === 0 ? (
                <div className="text-center py-16 text-slate-400 bg-white border border-slate-200 rounded-xl">
                    Aucune maintenance trouvée.
                </div>
            ) : (
                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-slate-200 bg-slate-50">
                                {['Type', 'Voiture', 'Coût', 'Date', 'Kilométrage', 'Prochaine maintenance', ''].map(h => (
                                    <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filtered.map(m => (
                                <tr
                                    key={m.id}
                                    onClick={() => navigate(`/voitures/${m.carId}`)}
                                    className="hover:bg-slate-50/70 transition-colors cursor-pointer"
                                >
                                    <td className="px-5 py-3.5 font-medium text-slate-900">{m.maintenanceType}</td>
                                    <td className="px-5 py-3.5 font-mono text-xs text-slate-600">{carsById[m.carId]?.registration_number ?? `#${m.carId}`}</td>
                                    <td className="px-5 py-3.5 text-slate-600">{fmtPrice(m.cost)}</td>
                                    <td className="px-5 py-3.5 text-slate-600">{fmtDate(m.maintenanceDate)}</td>
                                    <td className="px-5 py-3.5 text-slate-600">{m.kilométrage?.toLocaleString()} km</td>
                                    <td className="px-5 py-3.5 text-slate-600">{fmtDate(m.nextMaintenanceDate)}</td>
                                    <td className="px-5 py-3.5 text-right">
                                        <button
                                            onClick={e => { e.stopPropagation(); navigate(`/maintenance/${m.id}/modifier`); }}
                                            className="w-7 h-7 inline-flex items-center justify-center rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition"
                                        >
                                            <i className="ti ti-pencil text-[14px]" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
