import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api/api';

const fmtDate     = d => d ? new Date(d).toLocaleDateString('fr-FR') : '—';
const fmtDateTime = d => d ? new Date(d).toLocaleString('fr-FR') : '—';
const fmtPrice    = p => (p || p === 0) ? parseFloat(p).toLocaleString() + ' MAD' : '—';

const STATUS_LABEL = {
    active:    'En cours',
    completed: 'Terminée',
    cancelled: 'Annulée',
    canceled:  'Annulée',
    pending:   'En attente',
};

const PRICE_TYPE_LABEL = { fixed: 'Forfait', per_day: 'Par jour', per_km: 'Par km' };
const PAYMENT_METHOD_LABEL = { cash: 'Espèces', card: 'Carte', transfer: 'Virement' };

export default function Facture() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [invoice, setInvoice] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError]     = useState('');

    useEffect(() => {
        api.get(`/rentals/${id}/invoice`)
            .then(res => setInvoice(res.data?.data ?? res.data))
            .catch(() => setError('Impossible de charger la facture.'))
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) return (
        <div className="max-w-3xl mx-auto space-y-4">
            <div className="h-7 w-56 bg-stone-200 rounded-sm animate-pulse" />
            <div className="h-96 bg-stone-200 rounded-lg animate-pulse" />
        </div>
    );

    if (error || !invoice) return (
        <div className="flex items-center gap-2 bg-red-50 text-red-600 px-4 py-3 rounded-lg border border-red-200 text-sm">
            <i className="ti ti-alert-circle" /> {error || 'Facture introuvable.'}
        </div>
    );

    const { agency, client, car, rental, extensions = [], services = [], payments = [], summary } = invoice;

    return (
        <div className="max-w-3xl mx-auto">
            {/* Actions (masquées à l'impression) */}
            <div className="flex items-center justify-between mb-5 print:hidden">
                <button
                    type="button"
                    onClick={() => navigate('/reservations')}
                    className="inline-flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-900 transition"
                >
                    <i className="ti ti-arrow-left text-[15px]" /> Retour
                </button>
                <button
                    type="button"
                    onClick={() => window.print()}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium transition shadow-sm"
                >
                    <i className="ti ti-printer text-[15px]" /> Imprimer
                </button>
            </div>

            {/* Facture */}
            <div className="bg-white border border-stone-200 rounded-lg shadow-sm p-8 print:shadow-none print:border-0">
                {/* En-tête */}
                <div className="flex items-start justify-between pb-6 border-b border-stone-200">
                    <div>
                        <p className="text-lg font-bold text-stone-900">{agency?.name}</p>
                        {agency?.address && <p className="text-sm text-stone-500 mt-0.5">{agency.address}</p>}
                        <p className="text-sm text-stone-500 mt-0.5">
                            {[agency?.phone, agency?.email].filter(Boolean).join(' · ') || '—'}
                        </p>
                    </div>
                    <div className="text-right">
                        <h1 className="text-2xl font-bold text-stone-900 tracking-tight">FACTURE</h1>
                        <p className="text-sm text-stone-500 mt-1 font-mono">{invoice.invoiceNumber}</p>
                        <span className="inline-block mt-2 text-xs px-2.5 py-0.5 rounded-full font-medium bg-stone-100 text-stone-600 ring-1 ring-stone-200">
                            {STATUS_LABEL[rental?.status] ?? rental?.status}
                        </span>
                    </div>
                </div>

                {/* Client / Voiture */}
                <div className="grid grid-cols-2 gap-6 py-6 border-b border-stone-200">
                    <div>
                        <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-1.5">Client</p>
                        <p className="text-sm font-medium text-stone-900">{client?.name}</p>
                        <p className="text-sm text-stone-500">{client?.phone || '—'}</p>
                        <p className="text-sm text-stone-500">{client?.email || '—'}</p>
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-1.5">Véhicule</p>
                        <p className="text-sm font-medium text-stone-900">{car?.brand} {car?.model}</p>
                        <p className="text-sm text-stone-500 font-mono">{car?.plateNumber}</p>
                    </div>
                </div>

                {/* Période de location */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-6 border-b border-stone-200 text-sm">
                    <div>
                        <p className="text-xs text-stone-400">Début</p>
                        <p className="text-stone-900 font-medium">{fmtDateTime(rental?.startDate)}</p>
                    </div>
                    <div>
                        <p className="text-xs text-stone-400">Fin prévue</p>
                        <p className="text-stone-900 font-medium">{fmtDate(rental?.expectedEndDate)}</p>
                    </div>
                    <div>
                        <p className="text-xs text-stone-400">Retour effectif</p>
                        <p className="text-stone-900 font-medium">{fmtDate(rental?.actualReturnDate)}</p>
                    </div>
                    <div>
                        <p className="text-xs text-stone-400">Durée</p>
                        <p className="text-stone-900 font-medium">{rental?.days} jour{rental?.days > 1 ? 's' : ''}</p>
                    </div>
                </div>

                {/* Prolongations */}
                {extensions.length > 0 && (
                    <div className="py-6 border-b border-stone-200">
                        <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-3">Prolongations</p>
                        <table className="w-full text-sm">
                            <tbody className="divide-y divide-stone-100">
                                {extensions.map(ext => (
                                    <tr key={ext.id}>
                                        <td className="py-1.5 text-stone-500">Prolongation</td>
                                        <td className="py-1.5 text-stone-900 text-right">
                                            {fmtDate(ext.oldEndDate)} <span className="text-stone-300">→</span> {fmtDate(ext.newEndDate)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Détail */}
                <div className="py-6 border-b border-stone-200">
                    <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-3">Détail</p>
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-xs text-stone-400 uppercase tracking-wider">
                                <th className="text-left font-semibold pb-2">Désignation</th>
                                <th className="text-right font-semibold pb-2">Qté</th>
                                <th className="text-right font-semibold pb-2">P.U.</th>
                                <th className="text-right font-semibold pb-2">Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100">
                            <tr>
                                <td className="py-2 text-stone-900">Location {car?.brand} {car?.model}</td>
                                <td className="py-2 text-right text-stone-600">{rental?.days}</td>
                                <td className="py-2 text-right text-stone-600">{fmtPrice(rental?.pricePerDay)}</td>
                                <td className="py-2 text-right text-stone-900 font-medium">{fmtPrice(summary?.basePrice)}</td>
                            </tr>
                            {services.map(s => (
                                <tr key={s.id}>
                                    <td className="py-2 text-stone-900">
                                        {s.name} <span className="text-xs text-stone-400">({PRICE_TYPE_LABEL[s.priceType] ?? s.priceType})</span>
                                    </td>
                                    <td className="py-2 text-right text-stone-600">{s.quantity}</td>
                                    <td className="py-2 text-right text-stone-600">{fmtPrice(s.unitPrice)}</td>
                                    <td className="py-2 text-right text-stone-900 font-medium">{fmtPrice(s.totalPrice)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Paiements */}
                {payments.length > 0 && (
                    <div className="py-6 border-b border-stone-200">
                        <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-3">Paiements</p>
                        <table className="w-full text-sm">
                            <tbody className="divide-y divide-stone-100">
                                {payments.map(p => (
                                    <tr key={p.id}>
                                        <td className="py-1.5 text-stone-500">{fmtDate(p.paymentDate)}</td>
                                        <td className="py-1.5 text-stone-500">{PAYMENT_METHOD_LABEL[p.paymentMethod] ?? p.paymentMethod}</td>
                                        <td className="py-1.5 text-stone-900 text-right font-medium">{fmtPrice(p.amount)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Résumé */}
                <div className="pt-6 flex justify-end">
                    <div className="w-64 space-y-2 text-sm">
                        <div className="flex justify-between text-stone-500">
                            <span>Prix de base</span>
                            <span>{fmtPrice(summary?.basePrice)}</span>
                        </div>
                        <div className="flex justify-between text-stone-500">
                            <span>Services</span>
                            <span>{fmtPrice(summary?.servicesTotal)}</span>
                        </div>
                        <div className="flex justify-between text-stone-900 font-semibold pt-2 border-t border-stone-200">
                            <span>Total</span>
                            <span>{fmtPrice(summary?.totalPrice)}</span>
                        </div>
                        <div className="flex justify-between text-emerald-600">
                            <span>Payé</span>
                            <span>{fmtPrice(summary?.paidAmount)}</span>
                        </div>
                        <div className="flex justify-between font-semibold pt-2 border-t border-stone-200">
                            <span>Reste à payer</span>
                            <span className={summary?.remainingAmount > 0 ? 'text-emerald-600' : 'text-stone-900'}>
                                {fmtPrice(summary?.remainingAmount)}
                            </span>
                        </div>
                        <div className="pt-2 text-right">
                            <span className={`inline-block text-xs px-2.5 py-0.5 rounded-full font-medium ${
                                summary?.isFullyPaid
                                    ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
                                    : 'bg-amber-50 text-amber-700 ring-1 ring-amber-200'
                            }`}>
                                {summary?.isFullyPaid ? 'Payée en totalité' : 'Paiement partiel'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
