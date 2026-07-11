import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../../api/api';

const RENTAL_STATUS = {
    completed: { label: 'Terminée',   cls: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200', dot: 'bg-emerald-500' },
    active:    { label: 'En cours',   cls: 'bg-blue-50 text-blue-700 ring-1 ring-blue-200',           dot: 'bg-blue-500' },
    cancelled: { label: 'Annulée',    cls: 'bg-red-50 text-red-600 ring-1 ring-red-200',              dot: 'bg-red-500' },
    pending:   { label: 'En attente', cls: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',        dot: 'bg-amber-500' },
};

const fmtDate  = d => d ? new Date(d).toLocaleDateString('fr-FR') : '—';
const fmtPrice = p => p ? parseFloat(p).toLocaleString() + ' MAD' : '—';

const isToday = (dateStr) => {
    if (!dateStr) return false;
    const d = new Date(dateStr);
    const now = new Date();
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
};

function ReservationCard({ r, navigate, index, carsById }) {
    const rs  = RENTAL_STATUS[r.status] || { label: r.status, cls: 'bg-stone-100 text-stone-600 ring-1 ring-stone-200', dot: 'bg-stone-400' };
    // Le détail de location n'embarque pas toujours les photos de la voiture ;
    // on les récupère depuis /cars (la même source que la page Voitures) par id.
    const images = carsById[r.car?.id]?.images ?? r.car?.images;
    const img = images?.find(i => i.is_primary) || images?.[0];
    const initials = r.client?.full_name?.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
    const endsToday = r.status === 'active' && isToday(r.end_date);

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 280, damping: 24, delay: index * 0.04 }}
            whileHover={{ y: -2 }}
            className={`bg-white border rounded-xl shadow-sm hover:shadow-md transition-all overflow-hidden ${endsToday ? 'border-amber-300 hover:border-amber-400' : 'border-stone-200 hover:border-emerald-200'}`}
        >
            <div className="flex items-stretch h-24">
                {/* Voiture */}
                <div className="relative w-32 flex-shrink-0 bg-stone-100 overflow-hidden">
                    {img ? (
                        <img
                            src={img.image_path}
                            alt={`${r.car?.brand ?? ''} ${r.car?.model ?? ''}`}
                            loading="lazy"
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <i className="ti ti-car text-stone-300 text-3xl" />
                        </div>
                    )}
                    <span className={`absolute top-1.5 left-1.5 inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-medium shadow-sm ${rs.cls}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${rs.dot ?? 'bg-stone-400'}`} />
                        {rs.label}
                    </span>
                    {endsToday && (
                        <span className="absolute bottom-1.5 left-1.5 right-1.5 inline-flex items-center justify-center gap-1 bg-amber-500 text-white text-[9px] font-semibold px-1.5 py-0.5 rounded-full shadow-sm">
                            <i className="ti ti-clock-hour-4 text-[10px]" /> Retour aujourd'hui
                        </span>
                    )}
                </div>

                <div className="flex-1 min-w-0 px-4 flex items-center justify-between gap-4">
                    <div className="min-w-0 flex-shrink-0 w-40">
                        <p className="font-bold text-stone-900 text-sm truncate">{r.car?.brand} {r.car?.model}</p>
                        <p className="font-mono text-xs text-stone-400 truncate">{r.car?.registration_number}</p>
                    </div>

                    <div className="hidden sm:flex items-center gap-2 min-w-0 flex-shrink-0 w-40">
                        <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[11px] font-semibold flex-shrink-0">
                            {initials || '—'}
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-medium text-stone-900 truncate">{r.client?.full_name}</p>
                            <p className="text-xs text-stone-400 truncate">{r.client?.phone || '—'}</p>
                        </div>
                    </div>

                    <div className="hidden md:flex items-center gap-1.5 text-xs text-stone-500 flex-shrink-0">
                        <i className="ti ti-calendar-event text-[13px] text-stone-400" />
                        {fmtDate(r.start_date)} <span className="text-stone-300">→</span> {fmtDate(r.end_date)}
                    </div>

                    <div className="text-right flex-shrink-0">
                        <p className="text-sm font-bold text-emerald-700 leading-none">{fmtPrice(r.total_price)}</p>
                        <p className="text-[10px] text-stone-400 mt-1">Payé {fmtPrice(r.paid_amount)}</p>
                    </div>

                    <button
                        onClick={() => navigate(`/reservations/${r.id}/facture`)}
                        title="Facture"
                        className="w-9 h-9 flex-shrink-0 rounded-lg border border-stone-200 text-stone-500 hover:text-emerald-600 hover:bg-emerald-50 hover:border-emerald-200 flex items-center justify-center transition"
                    >
                        <i className="ti ti-receipt text-[15px]" />
                    </button>
                </div>
            </div>
        </motion.div>
    );
}

// Liste des réservations (locations) : recherche par client ou voiture.
export default function Reservations() {
    const [rentals, setRentals]   = useState([]);
    const [carsById, setCarsById] = useState({});
    const [loading, setLoading]   = useState(true);
    const [error, setError]       = useState('');
    const [search, setSearch]     = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        Promise.all([api.get('/rentals'), api.get('/cars')])
            .then(([rentalsRes, carsRes]) => {
                setRentals(rentalsRes.data.data);
                setCarsById(Object.fromEntries((carsRes.data ?? []).map(c => [c.id, c])));
            })
            .catch(() => setError('Erreur lors du chargement des réservations.'))
            .finally(() => setLoading(false));
    }, []);

    const filtered = rentals.filter(r => {
        const q = search.toLowerCase();
        return r.client?.full_name?.toLowerCase().includes(q)
            || r.car?.brand?.toLowerCase().includes(q)
            || r.car?.model?.toLowerCase().includes(q)
            || r.car?.registration_number?.toLowerCase().includes(q);
    });

    const endingToday = rentals.filter(r => r.status === 'active' && isToday(r.end_date));

    const stats = [
        { label: 'Total',      value: rentals.length,                                            icon: 'ti-calendar-event', color: 'text-stone-700',   bg: 'bg-stone-100' },
        { label: 'En cours',    value: rentals.filter(r => r.status === 'active').length,          icon: 'ti-key',            color: 'text-blue-700',    bg: 'bg-blue-50' },
        { label: 'Terminées',   value: rentals.filter(r => r.status === 'completed').length,       icon: 'ti-check',          color: 'text-emerald-700', bg: 'bg-emerald-50' },
        { label: 'En attente',  value: rentals.filter(r => r.status === 'pending').length,         icon: 'ti-clock',          color: 'text-amber-700',   bg: 'bg-amber-50' },
    ];

    if (loading) return (
        <div className="space-y-5">
            <div className="flex justify-between">
                <div className="h-7 w-40 bg-stone-200 rounded-sm animate-pulse" />
                <div className="h-9 w-48 bg-stone-200 rounded-md animate-pulse" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[...Array(4)].map((_, i) => <div key={i} className="h-16 bg-stone-200 rounded-2xl animate-pulse" />)}
            </div>
            <div className="h-9 w-full max-w-sm bg-stone-200 rounded-md animate-pulse" />
            <div className="space-y-3">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="bg-white border border-stone-200 rounded-xl overflow-hidden flex h-24">
                        <div className="w-32 h-full flex-shrink-0 bg-stone-200 animate-pulse" />
                        <div className="flex-1 p-4 flex items-center gap-6">
                            <div className="h-3.5 bg-stone-200 rounded-sm animate-pulse w-32" />
                            <div className="h-3 bg-stone-200 rounded-sm animate-pulse w-24 hidden sm:block" />
                            <div className="h-3 bg-stone-200 rounded-sm animate-pulse w-28 hidden md:block" />
                        </div>
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
                    <p className="text-sm text-stone-500 mt-0.5">{rentals.length} réservations enregistrées</p>
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
                        Ajouter
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

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
                {stats.map((s, index) => (
                    <motion.div
                        key={s.label}
                        initial={{ opacity: 0, y: 20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ type: 'spring', stiffness: 260, damping: 20, delay: index * 0.07 }}
                        whileHover={{ y: -3, scale: 1.03 }}
                        className={`${s.bg} rounded-2xl px-4 py-3 flex items-center gap-3`}
                    >
                        <i className={`ti ${s.icon} ${s.color} text-xl`} />
                        <div>
                            <p className={`text-xl font-bold leading-none ${s.color}`}>{s.value}</p>
                            <p className={`text-xs font-medium mt-0.5 ${s.color} opacity-80`}>{s.label}</p>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Search */}
            <div className="relative mb-5 max-w-sm">
                <i className="ti ti-search absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-[15px]" />
                <input
                    type="text"
                    placeholder="Rechercher par client, voiture…"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full bg-white border border-stone-300 text-stone-900 placeholder-stone-400 pl-9 pr-3 py-2 rounded-md text-sm focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition"
                />
            </div>

            {/* Cards */}
            {filtered.length === 0 ? (
                <div className="text-center py-16 text-stone-400 bg-white border border-stone-200 rounded-2xl">
                    <i className="ti ti-calendar-off text-4xl mb-3 block" />
                    Aucune réservation trouvée.
                </div>
            ) : (
                <div className="space-y-3">
                    {filtered.map((r, index) => (
                        <ReservationCard key={r.id} r={r} navigate={navigate} index={index} carsById={carsById} />
                    ))}
                </div>
            )}
        </div>
    );
}
