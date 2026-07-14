import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../../api/api';

const fmtDate  = d => d ? new Date(d).toLocaleDateString('fr-FR') : '—';
const fmtPrice = p => p ? parseFloat(p).toLocaleString() + ' MAD' : '—';

const STATUS_BADGE = {
    pending:     { label: 'En attente', cls: 'bg-amber-50 text-amber-600' },
    in_progress: { label: 'En cours',   cls: 'bg-blue-50 text-blue-600' },
    completed:   { label: 'Terminée',   cls: 'bg-emerald-50 text-emerald-600' },
};

const STATUS_FILTERS = [
    { value: '',            label: 'Tous les statuts' },
    { value: 'pending',     label: 'En attente' },
    { value: 'in_progress', label: 'En cours' },
    { value: 'completed',   label: 'Terminée' },
];

// Liste des maintenances : recherche par type, accès à la voiture liée.
export default function Maintenances() {
    const [maintenances, setMaintenances] = useState([]);
    const [carsById, setCarsById]         = useState({});
    const [loading, setLoading]           = useState(true);
    const [error, setError]               = useState('');
    const [search, setSearch]             = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [completingId, setCompletingId]   = useState(null);
    const [completeError, setCompleteError] = useState('');
    const [confirmTarget, setConfirmTarget]  = useState(null);
    const navigate = useNavigate();

    const handleComplete = async () => {
        const id = confirmTarget.id;
        setCompletingId(id);
        setCompleteError('');
        try {
            await api.patch(`/maintenances/${id}/complete`);
            setMaintenances(list => list.map(m => m.id === id ? { ...m, status: 'completed' } : m));
            setConfirmTarget(null);
        } catch {
            setCompleteError('Erreur lors de la validation de la maintenance.');
        } finally {
            setCompletingId(null);
        }
    };

    useEffect(() => {
        Promise.all([api.get('/maintenance'), api.get('/cars')])
            .then(([maintRes, carsRes]) => {
                setMaintenances(maintRes.data);
                const carsList = Array.isArray(carsRes.data) ? carsRes.data : carsRes.data?.data ?? [];
                setCarsById(Object.fromEntries(carsList.map(c => [c.id, c])));
            })
            .catch(() => setError('Erreur lors du chargement des maintenances.'))
            .finally(() => setLoading(false));
    }, []);

    const filtered = maintenances.filter(m =>
        (m.maintenanceType || '').toLowerCase().includes(search.toLowerCase())
        && (!statusFilter || m.status === statusFilter)
    );

    if (loading) return (
        <div className="space-y-5">
            <div className="h-7 w-40 bg-stone-200 rounded-sm animate-pulse" />
            <div className="h-9 w-full max-w-sm bg-stone-200 rounded-md animate-pulse" />
            <div className="bg-white border border-stone-200 rounded-lg overflow-hidden">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="flex items-center gap-4 px-5 py-3.5 border-b border-stone-100">
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
                    <h1 className="text-xl font-semibold text-stone-900">Maintenance</h1>
                    <p className="text-sm text-stone-500 mt-0.5">{maintenances.length} maintenances enregistrées</p>
                </div>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.94 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                    onClick={() => navigate('/maintenance/ajouter')}
                    className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium px-4 py-2 rounded-md transition-colors shadow-sm"
                >
                    <i className="ti ti-plus text-[14px]" />
                    Ajouter
                </motion.button>
            </div>

            {/* Search & filtre */}
            <div className="flex items-center gap-3 mb-5">
                <div className="relative max-w-sm flex-1">
                    <i className="ti ti-search absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-[15px]" />
                    <input
                        type="text"
                        placeholder="Rechercher par type…"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full bg-white border border-stone-300 text-stone-900 placeholder-stone-400 pl-9 pr-3 py-2 rounded-md text-sm focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition"
                    />
                </div>
                <select
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value)}
                    className="bg-white border border-stone-300 text-stone-700 px-3 py-2 rounded-md text-sm focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition"
                >
                    {STATUS_FILTERS.map(o => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                </select>
            </div>

            {completeError && (
                <div className="flex items-center gap-2 bg-red-50 text-red-600 px-4 py-3 rounded-lg border border-red-200 text-sm mb-5">
                    <i className="ti ti-alert-circle" /> {completeError}
                </div>
            )}

            {/* Table */}
            {filtered.length === 0 ? (
                <div className="text-center py-16 text-stone-400 bg-white border border-stone-200 rounded-lg">
                    Aucune maintenance trouvée.
                </div>
            ) : (
                <div className="bg-white border border-stone-200 rounded-lg overflow-hidden shadow-sm">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-stone-200 bg-stone-50">
                                {['Type', 'Voiture', 'Statut', 'Coût', 'Date', 'Kilométrage', 'Prochaine maintenance', ''].map(h => (
                                    <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wider">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100">
                            {filtered.map((m, index) => (
                                <motion.tr
                                    key={m.id}
                                    initial={{ opacity: 0, x: -16 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ type: 'spring', stiffness: 300, damping: 26, delay: index * 0.04 }}
                                    whileHover={{ x: 4 }}
                                    onClick={() => navigate(`/voitures/${m.carId}`)}
                                    className="hover:bg-stone-50/70 transition-colors cursor-pointer"
                                >
                                    <td className="px-5 py-3.5 font-medium text-stone-900">{m.maintenanceType}</td>
                                    <td className="px-5 py-3.5 font-mono text-xs text-stone-600">{carsById[m.carId]?.registration_number ?? `#${m.carId}`}</td>
                                    <td className="px-5 py-3.5">
                                        {m.status && (
                                            <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGE[m.status]?.cls ?? 'bg-stone-100 text-stone-500'}`}>
                                                {STATUS_BADGE[m.status]?.label ?? m.status}
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-5 py-3.5 text-stone-600">{fmtPrice(m.cost)}</td>
                                    <td className="px-5 py-3.5 text-stone-600">{fmtDate(m.maintenanceDate)}</td>
                                    <td className="px-5 py-3.5 text-stone-600">{m.kilométrage?.toLocaleString()} km</td>
                                    <td className="px-5 py-3.5 text-stone-600">{fmtDate(m.nextMaintenanceDate)}</td>
                                    <td className="px-5 py-3.5">
                                        <div className="flex items-center justify-end gap-1">
                                            {m.status !== 'completed' && (
                                                <button
                                                    onClick={e => { e.stopPropagation(); setConfirmTarget(m); }}
                                                    disabled={completingId === m.id}
                                                    title="Marquer comme terminée"
                                                    className="w-7 h-7 inline-flex items-center justify-center rounded-md text-stone-400 hover:text-emerald-600 hover:bg-emerald-50 transition disabled:opacity-50"
                                                >
                                                    <i className={`ti ${completingId === m.id ? 'ti-loader-2 animate-spin' : 'ti-check'} text-[14px]`} />
                                                </button>
                                            )}
                                            <button
                                                onClick={e => { e.stopPropagation(); navigate(`/maintenance/${m.id}/modifier`); }}
                                                className="w-7 h-7 inline-flex items-center justify-center rounded-md text-stone-400 hover:text-emerald-600 hover:bg-emerald-50 transition"
                                            >
                                                <i className="ti ti-pencil text-[14px]" />
                                            </button>
                                        </div>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Confirmation de validation */}
            {confirmTarget && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ type: 'spring', stiffness: 320, damping: 26 }}
                        className="bg-white rounded-lg shadow-xl max-w-sm w-full p-6"
                    >
                        <div className="w-11 h-11 rounded-full bg-emerald-50 flex items-center justify-center mb-4">
                            <i className="ti ti-check text-emerald-600 text-[20px]" />
                        </div>
                        <h3 className="text-base font-semibold text-stone-900 mb-1.5">Valider cette maintenance ?</h3>
                        <p className="text-sm text-stone-500 mb-6">
                            « {confirmTarget.maintenanceType} » sera marquée comme terminée. Cette action est irréversible.
                        </p>
                        <div className="flex items-center justify-end gap-3">
                            <button
                                onClick={() => setConfirmTarget(null)}
                                disabled={completingId === confirmTarget.id}
                                className="px-4 py-2 rounded-md border border-stone-300 text-stone-600 text-sm font-medium hover:bg-stone-50 transition disabled:opacity-50"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={handleComplete}
                                disabled={completingId === confirmTarget.id}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white text-sm font-medium transition"
                            >
                                {completingId === confirmTarget.id ? 'Validation…' : 'Confirmer'}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
