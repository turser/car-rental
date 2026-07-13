import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../../api/api';
import { translateError } from '../../utils/translateError';

const RENTAL_STATUS = {
    completed: { label: 'Terminée',   cls: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200', dot: 'bg-emerald-500' },
    active:    { label: 'En cours',   cls: 'bg-blue-50 text-blue-700 ring-1 ring-blue-200',           dot: 'bg-blue-500' },
    cancelled: { label: 'Annulée',    cls: 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200',              dot: 'bg-emerald-500' },
    pending:   { label: 'En attente', cls: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',        dot: 'bg-amber-500' },
};

const TABS = [
    { key: 'all',       label: 'Toutes' },
    { key: 'active',    label: 'En cours' },
    { key: 'pending',   label: 'En attente' },
    { key: 'completed', label: 'Terminées' },
    { key: 'cancelled', label: 'Annulées' },
];

const AVATAR_COLORS = [
    'bg-amber-500', 'bg-rose-500', 'bg-violet-500', 'bg-emerald-500',
    'bg-blue-500', 'bg-orange-500', 'bg-fuchsia-500', 'bg-teal-500',
];

const fmtDay   = d => d ? new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }) : '—';
const fmtPrice = p => p ? parseFloat(p).toLocaleString() + ' MAD' : '—';
const fmtRef   = id => `RES-${String(id).padStart(4, '0')}`;

const isToday = (dateStr) => {
    if (!dateStr) return false;
    const d = new Date(dateStr);
    const now = new Date();
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
};

function ReservationRow({ r, navigate, index, onCancelClick }) {
    const rs = RENTAL_STATUS[r.status] || { label: r.status, cls: 'bg-stone-100 text-stone-600 ring-1 ring-stone-200', dot: 'bg-stone-400' };
    const initials = r.client?.full_name?.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() || '—';
    const avatarColor = AVATAR_COLORS[r.id % AVATAR_COLORS.length];
    const endsToday = r.status === 'active' && isToday(r.end_date);

    return (
        <motion.tr
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 26, delay: index * 0.03 }}
            onClick={() => navigate(`/reservations/${r.id}`)}
            className="group hover:bg-stone-50/70 transition-colors cursor-pointer"
        >
            <td className="px-5 py-3.5 font-semibold text-stone-900 text-sm whitespace-nowrap">{fmtRef(r.id)}</td>
            <td className="px-5 py-3.5">
                <div className="flex items-center gap-2.5">
                    <div className={`w-8 h-8 rounded-full ${avatarColor} text-white flex items-center justify-center text-[11px] font-semibold flex-shrink-0`}>
                        {initials}
                    </div>
                    <span className="text-sm font-medium text-stone-800 truncate">{r.client?.full_name ?? '—'}</span>
                </div>
            </td>
            <td className="px-5 py-3.5">
                <p className="text-sm font-medium text-stone-900 truncate">{r.car?.brand} {r.car?.model}</p>
                <p className="font-mono text-xs text-stone-400">{r.car?.registration_number}</p>
            </td>
            <td className="px-5 py-3.5 text-sm text-stone-600 whitespace-nowrap">
                <p>{fmtDay(r.start_date)}</p>
                <p className="text-stone-400">→ {fmtDay(r.end_date)}</p>
            </td>
            <td className="px-5 py-3.5 font-semibold text-stone-900 text-sm whitespace-nowrap">{fmtPrice(r.total_price)}</td>
            <td className="px-5 py-3.5">
                <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium ${rs.cls}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${rs.dot}`} />
                    {rs.label}
                    {endsToday && <i className="ti ti-clock-hour-4 text-[11px]" title="Retour aujourd'hui" />}
                </span>
            </td>
            <td className="px-5 py-3.5">
                <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={(e) => { e.stopPropagation(); navigate(`/reservations/${r.id}`); }}
                        title="Voir"
                        className="w-8 h-8 inline-flex items-center justify-center rounded-md text-stone-400 hover:text-emerald-600 hover:bg-emerald-50 transition"
                    >
                        <i className="ti ti-eye text-[15px]" />
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); navigate(`/reservations/${r.id}/facture`); }}
                        title="Facture"
                        className="w-8 h-8 inline-flex items-center justify-center rounded-md text-stone-400 hover:text-emerald-600 hover:bg-emerald-50 transition"
                    >
                        <i className="ti ti-receipt text-[15px]" />
                    </button>
                    {(r.status === 'active' || r.status === 'pending') && (
                        <button
                            onClick={(e) => { e.stopPropagation(); onCancelClick(r); }}
                            title="Annuler"
                            className="w-8 h-8 inline-flex items-center justify-center rounded-md text-stone-400 hover:text-red-600 hover:bg-red-50 transition"
                        >
                            <i className="ti ti-ban text-[15px]" />
                        </button>
                    )}
                </div>
            </td>
        </motion.tr>
    );
}

// Liste des réservations (locations) : filtres par statut + recherche par client ou voiture.
export default function Reservations() {
    const [rentals, setRentals]   = useState([]);
    const [loading, setLoading]   = useState(true);
    const [error, setError]       = useState('');
    const [search, setSearch]     = useState('');
    const [tab, setTab]           = useState('all');
    const [cancelTarget, setCancelTarget] = useState(null);
    const [cancelling, setCancelling]     = useState(false);
    const [cancelError, setCancelError]   = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        api.get('/rentals')
            .then(res => setRentals(res.data.data))
            .catch(() => setError('Erreur lors du chargement des réservations.'))
            .finally(() => setLoading(false));
    }, []);

    const closeCancel = () => { setCancelTarget(null); setCancelError(''); };

    const handleCancel = async () => {
        setCancelling(true);
        setCancelError('');
        try {
            const res = await api.patch(`/rentals/${cancelTarget.id}/cancel`);
            const data = res.data?.data ?? res.data;
            setRentals(list => list.map(r => r.id === cancelTarget.id ? { ...r, status: data.status } : r));
            closeCancel();
        } catch (err) {
            setCancelError(translateError(err.response?.data?.message) || "Erreur lors de l'annulation.");
        } finally {
            setCancelling(false);
        }
    };

    const bySearch = rentals.filter(r => {
        const q = search.toLowerCase();
        return r.client?.full_name?.toLowerCase().includes(q)
            || r.car?.brand?.toLowerCase().includes(q)
            || r.car?.model?.toLowerCase().includes(q)
            || r.car?.registration_number?.toLowerCase().includes(q);
    });

    const filtered = tab === 'all' ? bySearch : bySearch.filter(r => r.status === tab);

    const endingToday = rentals.filter(r => r.status === 'active' && isToday(r.end_date));

    const tabCounts = Object.fromEntries(TABS.map(t => [t.key, t.key === 'all' ? rentals.length : rentals.filter(r => r.status === t.key).length]));

    if (loading) return (
        <div className="space-y-5">
            <div className="flex justify-between">
                <div className="h-7 w-40 bg-stone-200 rounded-sm animate-pulse" />
                <div className="h-9 w-48 bg-stone-200 rounded-md animate-pulse" />
            </div>
            <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden">
                <div className="h-14 bg-stone-100 animate-pulse" />
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="flex items-center gap-4 px-5 py-3.5 border-b border-stone-100">
                        <div className="w-8 h-8 bg-stone-200 rounded-full animate-pulse" />
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
                    <h1 className="text-xl font-semibold text-stone-900">Réservations</h1>
                    <p className="text-sm text-stone-500 mt-0.5">{rentals.length} réservations au total</p>
                </div>
                <div className="flex items-center gap-2">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.94 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                        onClick={() => navigate('/reservations/calendrier')}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md border border-stone-300 text-stone-600 text-sm font-medium hover:bg-stone-50 transition-colors"
                    >
                        <i className="ti ti-calendar-event text-[14px]" />
                        Calendrier
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.94 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                        onClick={() => navigate('/reservations/ajouter')}
                        className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium px-4 py-2 rounded-md transition-colors shadow-sm"
                    >
                        <i className="ti ti-plus text-[14px]" />
                        Nouvelle réservation
                    </motion.button>
                </div>
            </div>

            {/* Alerte : retours prévus aujourd'hui */}
            {endingToday.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ type: 'spring', stiffness: 280, damping: 24 }}
                    className="flex items-start gap-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl px-4 py-3 mb-5"
                >
                    <i className="ti ti-alert-triangle text-amber-500 text-lg mt-0.5 flex-shrink-0" />
                    <div className="text-sm min-w-0">
                        <p className="font-semibold">
                            {endingToday.length} réservation{endingToday.length > 1 ? 's' : ''} se termine{endingToday.length > 1 ? 'nt' : ''} aujourd'hui
                        </p>
                        <p className="text-amber-700/80 mt-0.5 truncate">
                            {endingToday.map(r => `${r.car?.brand ?? ''} ${r.car?.model ?? ''} — ${r.client?.full_name ?? ''}`).join(' · ')}
                        </p>
                    </div>
                </motion.div>
            )}

            {/* Tabs + recherche + table */}
            <div className="bg-white border border-stone-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="flex items-center justify-between gap-4 flex-wrap px-5 py-3.5 border-b border-stone-100">
                    <div className="flex items-center gap-1.5 flex-wrap">
                        {TABS.map(t => (
                            <button
                                key={t.key}
                                onClick={() => setTab(t.key)}
                                className={`inline-flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-md transition-colors ${
                                    tab === t.key ? 'bg-emerald-600 text-white' : 'text-stone-600 hover:bg-stone-100'
                                }`}
                            >
                                {t.label}
                                <span className={`text-xs px-1.5 py-0.5 rounded-full ${tab === t.key ? 'bg-white/20' : 'bg-stone-100 text-stone-500'}`}>
                                    {tabCounts[t.key]}
                                </span>
                            </button>
                        ))}
                    </div>
                    <div className="relative w-full sm:w-64">
                        <i className="ti ti-search absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-[15px]" />
                        <input
                            type="text"
                            placeholder="Rechercher…"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full bg-white border border-stone-300 text-stone-900 placeholder-stone-400 pl-9 pr-3 py-2 rounded-md text-sm focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition"
                        />
                    </div>
                </div>

                {filtered.length === 0 ? (
                    <div className="text-center py-16 text-stone-400">
                        <i className="ti ti-calendar-off text-4xl mb-3 block" />
                        Aucune réservation trouvée.
                    </div>
                ) : (
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-stone-50 border-b border-stone-100">
                                {['Réservation', 'Client', 'Véhicule', 'Dates', 'Montant', 'Statut', ''].map(h => (
                                    <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wider">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100">
                            {filtered.map((r, index) => (
                                <ReservationRow key={r.id} r={r} navigate={navigate} index={index} onCancelClick={setCancelTarget} />
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Confirmation annulation */}
            {cancelTarget && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4" onClick={closeCancel}>
                    <div className="bg-white rounded-lg shadow-xl max-w-sm w-full p-5" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
                                <i className="ti ti-alert-triangle text-red-600 text-[18px]" />
                            </div>
                            <h3 className="text-base font-semibold text-stone-900">Annuler cette réservation ?</h3>
                        </div>
                        <p className="text-sm text-stone-500 mb-4">
                            Cette action est irréversible. La réservation {fmtRef(cancelTarget.id)} sera marquée comme annulée.
                        </p>
                        {cancelError && (
                            <div className="flex items-center gap-2 bg-red-50 text-red-600 px-3 py-2 rounded-md border border-red-200 text-xs mb-4">
                                <i className="ti ti-alert-circle" /> {cancelError}
                            </div>
                        )}
                        <div className="flex items-center justify-end gap-2">
                            <button
                                onClick={closeCancel}
                                disabled={cancelling}
                                className="px-4 py-2 rounded-md border border-stone-300 text-stone-600 text-sm font-medium hover:bg-stone-50 transition disabled:opacity-60"
                            >
                                Retour
                            </button>
                            <button
                                onClick={handleCancel}
                                disabled={cancelling}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-red-600 hover:bg-red-500 disabled:opacity-60 text-white text-sm font-medium transition"
                            >
                                {cancelling ? (
                                    <>
                                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                            <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
                                        </svg>
                                        Annulation…
                                    </>
                                ) : 'Confirmer l\'annulation'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
