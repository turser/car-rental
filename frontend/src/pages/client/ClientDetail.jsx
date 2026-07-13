import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../../api/api';

const RENTAL_STATUS = {
    completed: { label: 'Terminée',   cls: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200' },
    active:    { label: 'En cours',   cls: 'bg-blue-50 text-blue-700 ring-1 ring-blue-200' },
    cancelled: { label: 'Annulée',    cls: 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200' },
    pending:   { label: 'En attente', cls: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200' },
};

const fmtDate  = d => d ? new Date(d).toLocaleDateString('fr-FR') : '—';
const fmtPrice = p => p ? parseFloat(p).toLocaleString() + ' MAD' : '—';

function licenseStatus(expiration) {
    if (!expiration) return { label: 'Inconnu', cls: 'bg-stone-100 text-stone-600 border border-stone-200' };
    const days = Math.floor((new Date(expiration) - new Date()) / 86400000);
    if (days < 0)  return { label: 'Expiré',        cls: 'bg-emerald-50 text-emerald-600 border border-emerald-100' };
    if (days <= 30) return { label: 'Expire bientôt', cls: 'bg-amber-50 text-amber-700 border border-amber-100' };
    return { label: 'Valide', cls: 'bg-emerald-50 text-emerald-700 border border-emerald-100' };
}

export default function ClientDetail() {
    const { id }   = useParams();
    const navigate = useNavigate();
    const [client, setClient]   = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError]     = useState('');

    useEffect(() => {
        api.get('/clients')
            .then(res => {
                const data = res.data;
                const list = Array.isArray(data) ? data
                    : Array.isArray(data?.data) ? data.data
                    : Array.isArray(data?.data?.data) ? data.data.data
                    : [];
                const found = list.find(c => String(c.id) === id);
                if (!found) throw new Error();
                setClient(found);
            })
            .catch(() => setError('Client introuvable.'))
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) return (
        <div className="max-w-6xl space-y-4">
            <div className="h-7 w-48 bg-stone-200 rounded-sm animate-pulse" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="h-64 bg-stone-200 rounded-2xl animate-pulse" />
                <div className="lg:col-span-2 h-64 bg-stone-200 rounded-2xl animate-pulse" />
            </div>
        </div>
    );

    if (error) return (
        <div className="flex items-center gap-2 bg-red-50 text-red-600 px-4 py-3 rounded-lg border border-red-200 text-sm max-w-md">
            <i className="ti ti-alert-circle" /> {error}
        </div>
    );

    const initials = client.full_name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
    const rentals  = client.rentals ?? [];
    const totalSpent = rentals.reduce((s, r) => s + (parseFloat(r.total_price) || 0), 0);
    const totalPaid  = rentals.reduce((s, r) => s + (parseFloat(r.paid_amount) || 0), 0);
    const license = licenseStatus(client.driving_license_expiration);

    const kpis = [
        { label: 'Locations',     value: rentals.length,           icon: 'ti-calendar-event', accent: 'text-blue-600 bg-blue-50' },
        { label: 'Total dépensé', value: fmtPrice(totalSpent),     icon: 'ti-cash',            accent: 'text-stone-700 bg-stone-100' },
        { label: 'Total payé',    value: fmtPrice(totalPaid),      icon: 'ti-checkbox',        accent: 'text-emerald-700 bg-emerald-50' },
    ];

    return (
        <div className="max-w-6xl">

            {/* Header */}
            <div className="flex items-center justify-between gap-3 mb-6">
                <div className="flex items-center gap-3 min-w-0">
                    <button
                        onClick={() => navigate('/clients')}
                        className="w-8 h-8 rounded-md border border-stone-200 bg-white flex items-center justify-center text-stone-500 hover:bg-stone-50 transition flex-shrink-0"
                    >
                        <i className="ti ti-arrow-left text-[15px]" />
                    </button>
                    <div className="min-w-0">
                        <h1 className="text-xl font-semibold text-stone-900 truncate">{client.full_name}</h1>
                        <p className="text-sm text-stone-500 mt-0.5">Fiche client et historique des locations</p>
                    </div>
                </div>
                <button
                    onClick={() => navigate(`/clients/${id}/modifier`)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md border border-stone-300 text-stone-600 text-sm font-medium hover:bg-stone-50 transition flex-shrink-0"
                >
                    <i className="ti ti-pencil text-[14px]" /> Modifier
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

                {/* Colonne gauche — identité */}
                <motion.div
                    initial={{ opacity: 0, y: 24, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 22 }}
                    className="lg:col-span-1 bg-white border border-stone-200 rounded-2xl shadow-sm lg:sticky lg:top-8"
                >
                    <div className="relative h-24 rounded-t-2xl overflow-hidden bg-gradient-to-br from-emerald-700 via-emerald-600 to-emerald-500">
                        <div className="absolute inset-0 opacity-20 [background:radial-gradient(circle_at_20%_20%,white,transparent_45%)]" />
                    </div>
                    <div className="px-6 pb-6 text-center relative z-10">
                        <motion.div
                            initial={{ scale: 0, rotate: -20 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 16, delay: 0.15 }}
                            className="w-16 h-16 mx-auto -mt-8 rounded-2xl bg-emerald-700 border-4 border-white shadow-lg flex items-center justify-center text-white text-xl font-bold flex-shrink-0"
                        >
                            {initials}
                        </motion.div>

                        <p className="font-semibold text-stone-900 text-lg mt-3">{client.full_name}</p>
                        <p className="text-sm text-stone-500 font-mono">{client.cin}</p>

                        <div className="flex items-center justify-center gap-2 mt-3">
                            <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium ${license.cls}`}>
                                <i className="ti ti-license text-[13px]" /> Permis {license.label.toLowerCase()}
                            </span>
                        </div>

                        <div className="mt-5 pt-5 border-t border-stone-100 space-y-3 text-left">
                            {[
                                { icon: 'ti-phone',            label: 'Téléphone',         value: client.phone },
                                { icon: 'ti-mail',             label: 'Email',             value: client.email || '—' },
                                { icon: 'ti-map-pin',          label: 'Adresse',           value: client.address || '—' },
                                { icon: 'ti-id-badge-2',       label: 'N° permis',         value: client.driving_license },
                                { icon: 'ti-calendar-time',    label: 'Expiration permis', value: fmtDate(client.driving_license_expiration) },
                            ].map(item => (
                                <div key={item.label} className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-stone-50 border border-stone-100 text-stone-500 flex items-center justify-center flex-shrink-0">
                                        <i className={`ti ${item.icon} text-[14px]`} />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-xs text-stone-400">{item.label}</p>
                                        <p className="text-sm font-medium text-stone-800 truncate">{item.value}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>

                {/* Colonne droite — stats + historique */}
                <div className="lg:col-span-2 space-y-6">

                    {/* KPIs */}
                    <div className="grid grid-cols-3 gap-4">
                        {kpis.map((kpi, index) => (
                            <motion.div
                                key={kpi.label}
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ type: 'spring', stiffness: 280, damping: 24, delay: index * 0.06 }}
                                className="bg-white border border-stone-200 rounded-2xl p-4 shadow-sm"
                            >
                                <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${kpi.accent}`}>
                                    <i className={`ti ${kpi.icon} text-[16px]`} />
                                </div>
                                <p className="text-lg font-semibold text-stone-900 truncate">{kpi.value}</p>
                                <p className="text-xs text-stone-500 mt-0.5">{kpi.label}</p>
                            </motion.div>
                        ))}
                    </div>

                    {/* Historique */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ type: 'spring', stiffness: 260, damping: 22, delay: 0.1 }}
                        className="bg-white border border-stone-200 rounded-2xl shadow-sm overflow-hidden"
                    >
                        <div className="px-6 py-4 border-b border-stone-100">
                            <h2 className="text-sm font-semibold text-stone-700 flex items-center gap-2">
                                <i className="ti ti-history text-emerald-500" /> Historique des locations
                            </h2>
                        </div>

                        {rentals.length === 0 ? (
                            <div className="text-center py-14 text-stone-400">
                                <i className="ti ti-calendar-off text-3xl" />
                                <p className="text-sm mt-2">Aucune location enregistrée.</p>
                            </div>
                        ) : (
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-stone-50 border-b border-stone-100">
                                        {['Début', 'Fin', 'Prix/jour', 'Total', 'Payé', 'Statut'].map(h => (
                                            <th key={h} className="px-6 py-2.5 text-left text-xs font-semibold text-stone-500 uppercase tracking-wider">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-stone-100">
                                    {rentals.map((r, index) => {
                                        const rs = RENTAL_STATUS[r.status] || { label: r.status, cls: 'bg-stone-100 text-stone-600 ring-1 ring-stone-200' };
                                        return (
                                            <motion.tr
                                                key={r.id}
                                                initial={{ opacity: 0, x: -12 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ type: 'spring', stiffness: 300, damping: 26, delay: index * 0.04 }}
                                                className="hover:bg-stone-50/70 transition-colors"
                                            >
                                                <td className="px-6 py-3 text-stone-600">{fmtDate(r.start_date)}</td>
                                                <td className="px-6 py-3 text-stone-600">{fmtDate(r.end_date)}</td>
                                                <td className="px-6 py-3 text-stone-600">{fmtPrice(r.price_per_day)}</td>
                                                <td className="px-6 py-3 font-semibold text-stone-900">{fmtPrice(r.total_price)}</td>
                                                <td className="px-6 py-3 text-stone-600">{fmtPrice(r.paid_amount)}</td>
                                                <td className="px-6 py-3">
                                                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${rs.cls}`}>{rs.label}</span>
                                                </td>
                                            </motion.tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        )}
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
