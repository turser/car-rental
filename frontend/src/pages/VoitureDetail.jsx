import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/api';

const IMAGE_BASE = 'https://car-rental-production-59c6.up.railway.app/storage/';

const STATUS = {
    available:   { label: 'Disponible',   cls: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200' },
    rented:      { label: 'Louée',        cls: 'bg-blue-50 text-blue-700 ring-1 ring-blue-200' },
    maintenance: { label: 'Maintenance',  cls: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200' },
    unavailable: { label: 'Indisponible', cls: 'bg-red-50 text-red-600 ring-1 ring-red-200' },
};

const FUEL = { diesel: 'Diesel', petrol: 'Essence', electric: 'Électrique', hybrid: 'Hybride' };

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

function DataTable({ headers, rows, empty }) {
    if (empty) return <p className="text-sm text-slate-400">{empty}</p>;
    return (
        <table className="w-full text-sm">
            <thead>
                <tr className="border-b border-slate-100">
                    {headers.map(h => <th key={h} className="pb-2.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider pr-4">{h}</th>)}
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">{rows}</tbody>
        </table>
    );
}

export default function VoitureDetail() {
    const { id }   = useParams();
    const navigate = useNavigate();
    const [car, setCar]         = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError]     = useState('');

    useEffect(() => {
        api.get(`/cars/${id}`)
            .then(res => setCar(res.data))
            .catch(() => setError('Voiture introuvable.'))
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) return (
        <div className="space-y-4 max-w-4xl">
            <div className="h-7 w-48 bg-slate-200 rounded animate-pulse" />
            <div className="h-48 bg-slate-200 rounded-xl animate-pulse" />
            {[...Array(3)].map((_, i) => <div key={i} className="h-28 bg-slate-200 rounded-xl animate-pulse" />)}
        </div>
    );

    if (error) return (
        <div className="flex items-center gap-2 bg-red-50 text-red-600 px-4 py-3 rounded-xl border border-red-200 text-sm max-w-md">
            <i className="ti ti-alert-circle" /> {error}
        </div>
    );

    const img    = car.images?.find(i => i.is_primary) || car.images?.[0];
    const status = STATUS[car.status] || { label: car.status, cls: 'bg-slate-100 text-slate-600 ring-1 ring-slate-200' };

    return (
        <div className="max-w-4xl">

            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <button onClick={() => navigate('/voitures')} className="text-sm text-slate-500 hover:text-slate-900 transition flex items-center gap-1.5 font-medium">
                    <i className="ti ti-arrow-left text-[14px]" /> Retour
                </button>
                <div className="w-px h-4 bg-slate-300" />
                <h1 className="text-xl font-semibold text-slate-900">{car.brand} {car.model}</h1>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${status.cls}`}>{status.label}</span>
            </div>

            {/* Main info */}
            <Section>
                <div className="flex gap-6">
                    <div className="w-48 h-36 rounded-xl overflow-hidden flex-shrink-0 bg-slate-100 border border-slate-200 flex items-center justify-center">
                        {img
                            ? <img src={IMAGE_BASE + img.image_path} alt={car.brand} className="w-full h-full object-cover" />
                            : <i className="ti ti-car text-slate-300 text-5xl" />
                        }
                    </div>
                    <div className="flex-1 grid grid-cols-2 gap-x-8 gap-y-4">
                        {[
                            ['Immatriculation', car.registration_number],
                            ['Carburant',       FUEL[car.fuel_type] || car.fuel_type],
                            ['Kilométrage',     car.mileage.toLocaleString() + ' km'],
                            ['Prix / jour',     fmtPrice(car.daily_price)],
                            ["Prix d'achat",    fmtPrice(car.purchase_price)],
                            ["Date d'achat",    fmtDate(car.purchase_date)],
                            ['Agence',          '#' + car.agency_id],
                            ['Ajouté le',       fmtDate(car.created_at)],
                        ].map(([label, value]) => (
                            <div key={label}>
                                <p className="text-xs text-slate-400 mb-0.5">{label}</p>
                                <p className="text-sm font-medium text-slate-800">{value}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </Section>

            {/* Assurances */}
            <Section title="Assurances">
                <DataTable
                    headers={['Compagnie', 'Prix', 'Début', 'Fin']}
                    empty={car.insurances?.length === 0 ? 'Aucune assurance enregistrée.' : null}
                    rows={car.insurances?.map(ins => (
                        <tr key={ins.id}>
                            <td className="py-2.5 pr-4 font-medium text-slate-800">{ins.company}</td>
                            <td className="py-2.5 pr-4 text-slate-600">{fmtPrice(ins.price)}</td>
                            <td className="py-2.5 pr-4 text-slate-600">{fmtDate(ins.start_date)}</td>
                            <td className="py-2.5 text-slate-600">{fmtDate(ins.end_date)}</td>
                        </tr>
                    ))}
                />
            </Section>

            {/* Taxes */}
            <Section title="Taxes">
                <DataTable
                    headers={['Année', 'Montant', 'Échéance', 'Payée']}
                    empty={car.taxes?.length === 0 ? 'Aucune taxe enregistrée.' : null}
                    rows={car.taxes?.map(tax => (
                        <tr key={tax.id}>
                            <td className="py-2.5 pr-4 font-medium text-slate-800">{tax.year}</td>
                            <td className="py-2.5 pr-4 text-slate-600">{fmtPrice(tax.amount)}</td>
                            <td className="py-2.5 pr-4 text-slate-600">{fmtDate(tax.due_date)}</td>
                            <td className="py-2.5">
                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${tax.paid ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200' : 'bg-red-50 text-red-600 ring-1 ring-red-200'}`}>
                                    {tax.paid ? 'Payée' : 'Non payée'}
                                </span>
                            </td>
                        </tr>
                    ))}
                />
            </Section>

            {/* Maintenances */}
            <Section title="Maintenances">
                <DataTable
                    headers={['Type', 'Coût', 'Date', 'Km actuel', 'Prochain Km']}
                    empty={car.maintenances?.length === 0 ? 'Aucune maintenance enregistrée.' : null}
                    rows={car.maintenances?.map(m => (
                        <tr key={m.id}>
                            <td className="py-2.5 pr-4 font-medium text-slate-800">{m.type}</td>
                            <td className="py-2.5 pr-4 text-slate-600">{fmtPrice(m.cost)}</td>
                            <td className="py-2.5 pr-4 text-slate-600">{fmtDate(m.date)}</td>
                            <td className="py-2.5 pr-4 text-slate-600">{m.mileage?.toLocaleString()} km</td>
                            <td className="py-2.5 text-slate-600">{m.next_due_mileage?.toLocaleString()} km</td>
                        </tr>
                    ))}
                />
            </Section>

            {/* Locations */}
            <Section title="Historique des locations">
                <DataTable
                    headers={['Début', 'Fin', 'Prix/jour', 'Total', 'Payé', 'Statut']}
                    empty={car.rentals?.length === 0 ? 'Aucune location enregistrée.' : null}
                    rows={car.rentals?.map(r => {
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
                />
            </Section>

        </div>
    );
}
