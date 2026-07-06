import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../../api/api';

const RENTAL_STATUS = {
    completed: { label: 'Terminée',   cls: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200' },
    active:    { label: 'En cours',   cls: 'bg-blue-50 text-blue-700 ring-1 ring-blue-200' },
    cancelled: { label: 'Annulée',    cls: 'bg-red-50 text-red-600 ring-1 ring-red-200' },
    pending:   { label: 'En attente', cls: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200' },
};

const fmtDate  = d => d ? new Date(d).toLocaleDateString('fr-FR') : '—';
const fmtPrice = p => p ? parseFloat(p).toLocaleString() + ' MAD' : '—';

const IMAGE_BASE = 'https://car-rental-production-59c6.up.railway.app/storage/';

function ReservationCard({ r, navigate, index }) {
    const rs  = RENTAL_STATUS[r.status] || { label: r.status, cls: 'bg-stone-100 text-stone-600 ring-1 ring-stone-200' };
    const img = r.car?.images?.find(i => i.is_primary) || r.car?.images?.[0];
    const initials = r.client?.full_name?.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();

    return (
        <motion.div
            initial={{ opacity: 0, y: 28, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20, delay: index * 0.06 }}
            whileHover={{ y: -6, scale: 1.015 }}
            whileTap={{ scale: 0.985 }}
            className="bg-white border border-stone-200 rounded-lg shadow-sm hover:shadow-lg hover:border-emerald-200 transition-shadow overflow-hidden"
        >
            <div className="flex flex-col sm:flex-row">
                {/* Voiture */}
                <div className="w-full sm:w-44 h-36 sm:h-auto flex-shrink-0 bg-stone-100 sm:border-r border-b sm:border-b-0 border-stone-200 flex items-center justify-center overflow-hidden">
                    {img ? (
                        <img
                            src={IMAGE_BASE + img.image_path}
                            alt={`${r.car?.brand ?? ''} ${r.car?.model ?? ''}`}
                            loading="lazy"
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <i className="ti ti-car text-stone-300 text-5xl" />
                    )}
                </div>

                <div className="flex-1 p-4 flex flex-col min-w-0">
                    <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="min-w-0">
                            <p className="font-bold text-stone-900 text-sm truncate">{r.car?.brand} {r.car?.model}</p>
                            <p className="font-mono text-xs text-stone-400 mt-0.5">{r.car?.registration_number}</p>
                        </div>
                        <span className={`flex-shrink-0 text-xs px-2.5 py-0.5 rounded-full font-medium ${rs.cls}`}>{rs.label}</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                        {/* Client */}
                        <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-semibold flex-shrink-0">
                                {initials || '—'}
                            </div>
                            <div className="min-w-0">
                                <p className="text-sm font-medium text-stone-900 truncate">{r.client?.full_name}</p>
                                <p className="text-xs text-stone-400">{r.client?.phone || '—'}</p>
                            </div>
                        </div>

                        <div className="hidden sm:block w-px h-8 bg-stone-100" />

                        {/* Dates */}
                        <div className="text-xs text-stone-500 space-y-0.5">
                            <p className="flex items-center gap-1.5">
                                <i className="ti ti-calendar-event text-[13px] text-stone-400" />
                                {fmtDate(r.start_date)} <span className="text-stone-300">→</span> {fmtDate(r.end_date)}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-5 mt-3 pt-3 border-t border-stone-100 text-xs text-stone-500">
                        <span>Prix/jour <span className="font-semibold text-stone-700">{fmtPrice(r.price_per_day)}</span></span>
                        <span>Total <span className="font-semibold text-stone-900">{fmtPrice(r.total_price)}</span></span>
                        <span>Payé <span className="font-semibold text-emerald-600">{fmtPrice(r.paid_amount)}</span></span>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

// Liste des réservations (locations) : recherche par client ou voiture.
export default function Reservations() {
    const [rentals, setRentals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError]     = useState('');
    const [search, setSearch]   = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        api.get('/rentals')
            .then(res => setRentals(res.data.data))
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

    if (loading) return (
        <div className="space-y-5">
            <div className="h-7 w-40 bg-stone-200 rounded-sm animate-pulse" />
            <div className="h-9 w-full max-w-sm bg-stone-200 rounded-md animate-pulse" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="bg-white border border-stone-200 rounded-lg overflow-hidden flex">
                        <div className="w-44 h-32 flex-shrink-0 bg-stone-200 animate-pulse" />
                        <div className="flex-1 p-4 space-y-2.5">
                            <div className="h-3.5 bg-stone-200 rounded-sm animate-pulse w-1/2" />
                            <div className="h-3 bg-stone-200 rounded-sm animate-pulse w-1/3" />
                            <div className="h-3 bg-stone-200 rounded-sm animate-pulse w-2/3 mt-4" />
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
                <div className="text-center py-16 text-stone-400 bg-white border border-stone-200 rounded-lg">
                    Aucune réservation trouvée.
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {filtered.map((r, index) => (
                        <ReservationCard key={r.id} r={r} navigate={navigate} index={index} />
                    ))}
                </div>
            )}
        </div>
    );
}
