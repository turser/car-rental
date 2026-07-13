import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../../api/api';
import { translateError } from '../../utils/translateError';

const fmtPrice = p => p ? parseFloat(p).toLocaleString() + ' MAD' : '—';

const PRICE_TYPE_LABELS = {
    fixed:   'Fixe',
    per_km:  'Par km',
    per_day: 'Par jour',
};

// Liste des services : recherche par nom.
export default function Services() {
    const [services, setServices] = useState([]);
    const [loading, setLoading]   = useState(true);
    const [error, setError]       = useState('');
    const [search, setSearch]     = useState('');
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleting, setDeleting]         = useState(false);
    const [deleteError, setDeleteError]   = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        api.get('/services')
            .then(res => setServices(res.data))
            .catch(() => setError('Erreur lors du chargement des services.'))
            .finally(() => setLoading(false));
    }, []);

    const filtered = services.filter(s => (s.serviceName || '').toLowerCase().includes(search.toLowerCase()));

    const closeDelete = () => { setDeleteTarget(null); setDeleteError(''); };

    const handleDelete = async () => {
        setDeleting(true);
        setDeleteError('');
        try {
            await api.delete(`/services/${deleteTarget.id}`);
            setServices(list => list.filter(s => s.id !== deleteTarget.id));
            closeDelete();
        } catch (err) {
            const rentalsCount = err.response?.data?.data?.rentalsCount;
            const base = translateError(err.response?.data?.message) || 'Erreur lors de la suppression.';
            setDeleteError(rentalsCount ? `${base} (${rentalsCount} location${rentalsCount > 1 ? 's' : ''})` : base);
        } finally {
            setDeleting(false);
        }
    };

    if (loading) return (
        <div className="space-y-5">
            <div className="h-7 w-28 bg-stone-200 rounded-sm animate-pulse" />
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
                    <h1 className="text-xl font-semibold text-stone-900">Services</h1>
                    <p className="text-sm text-stone-500 mt-0.5">{services.length} services enregistrés</p>
                </div>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.94 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                    onClick={() => navigate('/services/ajouter')}
                    className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium px-4 py-2 rounded-md transition-colors shadow-sm"
                >
                    <i className="ti ti-plus text-[14px]" />
                    Ajouter
                </motion.button>
            </div>

            {/* Search */}
            <div className="relative mb-5 max-w-sm">
                <i className="ti ti-search absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-[15px]" />
                <input
                    type="text"
                    placeholder="Rechercher par nom…"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full bg-white border border-stone-300 text-stone-900 placeholder-stone-400 pl-9 pr-3 py-2 rounded-md text-sm focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition"
                />
            </div>

            {/* Table */}
            {filtered.length === 0 ? (
                <div className="text-center py-16 text-stone-400 bg-white border border-stone-200 rounded-lg">
                    Aucun service trouvé.
                </div>
            ) : (
                <div className="bg-white border border-stone-200 rounded-lg overflow-hidden shadow-sm">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-stone-200 bg-stone-50">
                                {['Nom', 'Type de prix', 'Prix', ''].map(h => (
                                    <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wider">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100">
                            {filtered.map((s, index) => (
                                <motion.tr
                                    key={s.id}
                                    initial={{ opacity: 0, x: -16 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ type: 'spring', stiffness: 300, damping: 26, delay: index * 0.04 }}
                                    whileHover={{ x: 4 }}
                                    className="hover:bg-stone-50/70 transition-colors"
                                >
                                    <td className="px-5 py-3.5 font-medium text-stone-900">{s.serviceName}</td>
                                    <td className="px-5 py-3.5 text-stone-600">{PRICE_TYPE_LABELS[s.priceType] || s.priceType}</td>
                                    <td className="px-5 py-3.5 text-stone-600">{fmtPrice(s.price)}</td>
                                    <td className="px-5 py-3.5 text-right">
                                        <div className="inline-flex items-center gap-1">
                                            <button
                                                onClick={() => navigate(`/services/${s.id}/modifier`)}
                                                className="w-7 h-7 inline-flex items-center justify-center rounded-md text-stone-400 hover:text-emerald-600 hover:bg-emerald-50 transition"
                                            >
                                                <i className="ti ti-pencil text-[14px]" />
                                            </button>
                                            <button
                                                onClick={() => setDeleteTarget(s)}
                                                className="w-7 h-7 inline-flex items-center justify-center rounded-md text-stone-400 hover:text-red-600 hover:bg-red-50 transition"
                                            >
                                                <i className="ti ti-trash text-[14px]" />
                                            </button>
                                        </div>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Confirmation suppression */}
            {deleteTarget && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4" onClick={closeDelete}>
                    <div className="bg-white rounded-lg shadow-xl max-w-sm w-full p-5" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
                                <i className="ti ti-alert-triangle text-red-600 text-[18px]" />
                            </div>
                            <h3 className="text-base font-semibold text-stone-900">Supprimer ce service ?</h3>
                        </div>
                        <p className="text-sm text-stone-500 mb-4">
                            Voulez-vous vraiment supprimer le service <span className="font-medium text-stone-900">{deleteTarget.serviceName}</span> ?
                        </p>
                        {deleteError && (
                            <div className="flex items-center gap-2 bg-red-50 text-red-600 px-3 py-2 rounded-md border border-red-200 text-xs mb-4">
                                <i className="ti ti-alert-circle" /> {deleteError}
                            </div>
                        )}
                        <div className="flex items-center justify-end gap-2">
                            <button
                                onClick={closeDelete}
                                disabled={deleting}
                                className="px-4 py-2 rounded-md border border-stone-300 text-stone-600 text-sm font-medium hover:bg-stone-50 transition disabled:opacity-60"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={deleting}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-red-600 hover:bg-red-500 disabled:opacity-60 text-white text-sm font-medium transition"
                            >
                                {deleting ? (
                                    <>
                                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                            <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
                                        </svg>
                                        Suppression…
                                    </>
                                ) : 'Supprimer'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
