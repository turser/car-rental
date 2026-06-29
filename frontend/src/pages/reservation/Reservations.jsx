import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/api';

const RENTAL_STATUS = {
    completed: { label: 'Terminée',   cls: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200' },
    active:    { label: 'En cours',   cls: 'bg-blue-50 text-blue-700 ring-1 ring-blue-200' },
    cancelled: { label: 'Annulée',    cls: 'bg-red-50 text-red-600 ring-1 ring-red-200' },
    pending:   { label: 'En attente', cls: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200' },
};

const fmtDate  = d => d ? new Date(d).toLocaleDateString('fr-FR') : '—';
const fmtPrice = p => p ? parseFloat(p).toLocaleString() + ' MAD' : '—';

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
                    <h1 className="text-xl font-semibold text-slate-900">Réservations</h1>
                    <p className="text-sm text-slate-500 mt-0.5">{rentals.length} réservations enregistrées</p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => navigate('/reservations/calendrier')}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-300 text-slate-600 text-sm font-medium hover:bg-slate-50 transition"
                    >
                        <i className="ti ti-calendar-event text-[14px]" />
                        Calendrier
                    </button>
                    <button
                        onClick={() => navigate('/reservations/ajouter')}
                        className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition shadow-sm"
                    >
                        <i className="ti ti-plus text-[14px]" />
                        Ajouter
                    </button>
                </div>
            </div>

            {/* Search */}
            <div className="relative mb-5 max-w-sm">
                <i className="ti ti-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[15px]" />
                <input
                    type="text"
                    placeholder="Rechercher par client, voiture…"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full bg-white border border-slate-300 text-slate-900 placeholder-slate-400 pl-9 pr-3 py-2 rounded-lg text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition"
                />
            </div>

            {/* Table */}
            {filtered.length === 0 ? (
                <div className="text-center py-16 text-slate-400 bg-white border border-slate-200 rounded-xl">
                    Aucune réservation trouvée.
                </div>
            ) : (
                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-slate-200 bg-slate-50">
                                {['Client', 'Voiture', 'Début', 'Fin', 'Prix/jour', 'Total', 'Payé', 'Statut'].map(h => (
                                    <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filtered.map(r => {
                                const rs = RENTAL_STATUS[r.status] || { label: r.status, cls: 'bg-slate-100 text-slate-600 ring-1 ring-slate-200' };
                                return (
                                    <tr key={r.id} className="hover:bg-slate-50/70 transition-colors">
                                        <td className="px-5 py-3.5 font-medium text-slate-900">{r.client?.full_name}</td>
                                        <td className="px-5 py-3.5">
                                            <p className="text-slate-700">{r.car?.brand} {r.car?.model}</p>
                                            <p className="font-mono text-xs text-slate-400">{r.car?.registration_number}</p>
                                        </td>
                                        <td className="px-5 py-3.5 text-slate-600">{fmtDate(r.start_date)}</td>
                                        <td className="px-5 py-3.5 text-slate-600">{fmtDate(r.end_date)}</td>
                                        <td className="px-5 py-3.5 text-slate-600">{fmtPrice(r.price_per_day)}</td>
                                        <td className="px-5 py-3.5 font-semibold text-slate-900">{fmtPrice(r.total_price)}</td>
                                        <td className="px-5 py-3.5 text-slate-600">{fmtPrice(r.paid_amount)}</td>
                                        <td className="px-5 py-3.5">
                                            <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${rs.cls}`}>{rs.label}</span>
                                        </td>
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
