import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/api';

const RENTAL_STATUS = {
    completed: { label: 'Terminée',   cls: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200' },
    active:    { label: 'En cours',   cls: 'bg-blue-50 text-blue-700 ring-1 ring-blue-200' },
    cancelled: { label: 'Annulée',    cls: 'bg-red-50 text-red-600 ring-1 ring-red-200' },
    pending:   { label: 'En attente', cls: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200' },
};

const fmtDate  = d => d ? new Date(d).toLocaleDateString('fr-FR') : '—';
const fmtPrice = p => p ? parseFloat(p).toLocaleString() + ' MAD' : '—';

function Section({ title, children }) {
    return (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm mb-4 overflow-hidden">
            {title && (
                <div className="px-5 py-3.5 border-b border-slate-100">
                    <h3 className="text-sm font-semibold text-slate-700">{title}</h3>
                </div>
            )}
            <div className="p-5">{children}</div>
        </div>
    );
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
                const found = res.data.find(c => String(c.id) === id);
                if (!found) throw new Error();
                setClient(found);
            })
            .catch(() => setError('Client introuvable.'))
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) return (
        <div className="space-y-4 max-w-3xl">
            <div className="h-7 w-48 bg-slate-200 rounded animate-pulse" />
            <div className="h-40 bg-slate-200 rounded-xl animate-pulse" />
            <div className="h-28 bg-slate-200 rounded-xl animate-pulse" />
        </div>
    );

    if (error) return (
        <div className="flex items-center gap-2 bg-red-50 text-red-600 px-4 py-3 rounded-xl border border-red-200 text-sm max-w-md">
            <i className="ti ti-alert-circle" /> {error}
        </div>
    );

    const initials = client.full_name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();

    return (
        <div className="max-w-3xl">

            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <button onClick={() => navigate('/clients')} className="text-sm text-slate-500 hover:text-slate-900 transition flex items-center gap-1.5 font-medium">
                    <i className="ti ti-arrow-left text-[14px]" /> Retour
                </button>
                <div className="w-px h-4 bg-slate-300" />
                <div className="w-9 h-9 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-xs font-semibold flex-shrink-0">
                    {initials}
                </div>
                <h1 className="text-xl font-semibold text-slate-900">{client.full_name}</h1>
            </div>

            {/* Informations */}
            <Section title="Informations">
                <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                    {[
                        ['CIN',                client.cin],
                        ['Numéro de permis',   client.driving_license],
                        ['Expiration permis',  fmtDate(client.driving_license_expiration)],
                        ['Téléphone',          client.phone],
                        ['Email',              client.email || '—'],
                        ['Adresse',            client.address || '—'],
                    ].map(([label, value]) => (
                        <div key={label}>
                            <p className="text-xs text-slate-400 mb-0.5">{label}</p>
                            <p className="text-sm font-medium text-slate-800">{value}</p>
                        </div>
                    ))}
                </div>
            </Section>

            {/* Locations */}
            <Section title="Historique des locations">
                {client.rentals?.length === 0 ? (
                    <p className="text-sm text-slate-400">Aucune location enregistrée.</p>
                ) : (
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-slate-100">
                                {['Début', 'Fin', 'Prix/jour', 'Total', 'Payé', 'Statut'].map(h => (
                                    <th key={h} className="pb-2.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider pr-4">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {client.rentals?.map(r => {
                                const rs = RENTAL_STATUS[r.status] || { label: r.status, cls: 'bg-slate-100 text-slate-600 ring-1 ring-slate-200' };
                                return (
                                    <tr key={r.id}>
                                        <td className="py-2.5 pr-4 text-slate-600">{fmtDate(r.start_date)}</td>
                                        <td className="py-2.5 pr-4 text-slate-600">{fmtDate(r.end_date)}</td>
                                        <td className="py-2.5 pr-4 text-slate-600">{fmtPrice(r.price_per_day)}</td>
                                        <td className="py-2.5 pr-4 font-semibold text-slate-900">{fmtPrice(r.total_price)}</td>
                                        <td className="py-2.5 pr-4 text-slate-600">{fmtPrice(r.paid_amount)}</td>
                                        <td className="py-2.5">
                                            <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${rs.cls}`}>{rs.label}</span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </Section>

        </div>
    );
}
