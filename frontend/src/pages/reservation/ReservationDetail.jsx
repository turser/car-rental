import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../api/api';
import { translateError } from '../../utils/translateError';

const inputCls = 'w-full bg-white border border-stone-300 text-stone-900 placeholder-stone-400 px-3 py-2 rounded-md text-sm focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition';

const todayISO = () => new Date().toISOString().slice(0, 10);

function ReturnCarModal({ submitting, error, onClose, onSubmit }) {
    const [actualReturnDate, setActualReturnDate] = useState(todayISO());
    const [finalPayment, setFinalPayment]         = useState('');
    const [paymentMethod, setPaymentMethod]       = useState('cash');

    const handleSubmit = e => {
        e.preventDefault();
        onSubmit({
            actualReturnDate,
            ...(finalPayment !== '' ? { finalPayment: Number(finalPayment), paymentMethod } : {}),
        });
    };

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100">
                    <h3 className="text-base font-semibold text-stone-900 flex items-center gap-2">
                        <i className="ti ti-key text-emerald-500" /> Retourner la voiture
                    </h3>
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-7 h-7 rounded-md flex items-center justify-center text-stone-400 hover:bg-stone-100 hover:text-stone-600 transition"
                    >
                        <i className="ti ti-x text-[15px]" />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="p-5 space-y-4">
                    {error && (
                        <div className="flex items-center gap-2 bg-red-50 text-red-600 px-3 py-2 rounded-md border border-red-200 text-xs">
                            <i className="ti ti-alert-circle flex-shrink-0" /> {error}
                        </div>
                    )}
                    <div>
                        <label className="block text-xs font-medium text-stone-600 mb-1.5">
                            Date de retour<span className="text-emerald-500 ml-0.5">*</span>
                        </label>
                        <input
                            type="date"
                            required
                            value={actualReturnDate}
                            onChange={e => setActualReturnDate(e.target.value)}
                            className={inputCls}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-stone-600 mb-1.5">Paiement final (MAD)</label>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                placeholder="0.00"
                                value={finalPayment}
                                onChange={e => setFinalPayment(e.target.value)}
                                className={inputCls}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-stone-600 mb-1.5">Moyen de paiement</label>
                            <select
                                value={paymentMethod}
                                onChange={e => setPaymentMethod(e.target.value)}
                                disabled={finalPayment === ''}
                                className={`${inputCls} disabled:opacity-50 disabled:cursor-not-allowed`}
                            >
                                <option value="cash">Espèces</option>
                                <option value="card">Carte</option>
                                <option value="transfer">Virement</option>
                            </select>
                        </div>
                    </div>
                    <div className="flex items-center justify-end gap-2 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={submitting}
                            className="px-4 py-2 rounded-md border border-stone-300 text-stone-600 text-sm font-medium hover:bg-stone-50 transition disabled:opacity-60"
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white text-sm font-medium transition"
                        >
                            {submitting ? (
                                <>
                                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                        <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
                                    </svg>
                                    Retour…
                                </>
                            ) : 'Confirmer le retour'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function AddPaymentModal({ submitting, error, onClose, onSubmit }) {
    const [amount, setAmount]             = useState('');
    const [paymentMethod, setPaymentMethod] = useState('cash');
    const [paymentDate, setPaymentDate]   = useState(todayISO());

    const handleSubmit = e => {
        e.preventDefault();
        onSubmit({ amount: Number(amount), paymentMethod, paymentDate });
    };

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100">
                    <h3 className="text-base font-semibold text-stone-900 flex items-center gap-2">
                        <i className="ti ti-cash-plus text-emerald-500" /> Ajouter un paiement
                    </h3>
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-7 h-7 rounded-md flex items-center justify-center text-stone-400 hover:bg-stone-100 hover:text-stone-600 transition"
                    >
                        <i className="ti ti-x text-[15px]" />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="p-5 space-y-4">
                    {error && (
                        <div className="flex items-center gap-2 bg-red-50 text-red-600 px-3 py-2 rounded-md border border-red-200 text-xs">
                            <i className="ti ti-alert-circle flex-shrink-0" /> {error}
                        </div>
                    )}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-stone-600 mb-1.5">
                                Montant (MAD)<span className="text-emerald-500 ml-0.5">*</span>
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                required
                                placeholder="0.00"
                                value={amount}
                                onChange={e => setAmount(e.target.value)}
                                className={inputCls}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-stone-600 mb-1.5">
                                Moyen de paiement<span className="text-emerald-500 ml-0.5">*</span>
                            </label>
                            <select
                                value={paymentMethod}
                                onChange={e => setPaymentMethod(e.target.value)}
                                className={inputCls}
                            >
                                <option value="cash">Espèces</option>
                                <option value="card">Carte</option>
                                <option value="transfer">Virement</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-stone-600 mb-1.5">
                            Date de paiement<span className="text-emerald-500 ml-0.5">*</span>
                        </label>
                        <input
                            type="date"
                            required
                            value={paymentDate}
                            onChange={e => setPaymentDate(e.target.value)}
                            className={inputCls}
                        />
                    </div>
                    <div className="flex items-center justify-end gap-2 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={submitting}
                            className="px-4 py-2 rounded-md border border-stone-300 text-stone-600 text-sm font-medium hover:bg-stone-50 transition disabled:opacity-60"
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white text-sm font-medium transition"
                        >
                            {submitting ? (
                                <>
                                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                        <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
                                    </svg>
                                    Enregistrement…
                                </>
                            ) : 'Ajouter le paiement'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function AddExtensionModal({ currentEndDate, submitting, error, onClose, onSubmit }) {
    const [newEndDate, setNewEndDate] = useState('');
    const [extendServices, setExtendServices] = useState(false);

    const handleSubmit = e => {
        e.preventDefault();
        onSubmit({ newEndDate, extendServices });
    };

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100">
                    <h3 className="text-base font-semibold text-stone-900 flex items-center gap-2">
                        <i className="ti ti-calendar-plus text-emerald-500" /> Prolonger la location
                    </h3>
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-7 h-7 rounded-md flex items-center justify-center text-stone-400 hover:bg-stone-100 hover:text-stone-600 transition"
                    >
                        <i className="ti ti-x text-[15px]" />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="p-5 space-y-4">
                    {error && (
                        <div className="flex items-center gap-2 bg-red-50 text-red-600 px-3 py-2 rounded-md border border-red-200 text-xs">
                            <i className="ti ti-alert-circle flex-shrink-0" /> {error}
                        </div>
                    )}
                    <div>
                        <label className="block text-xs font-medium text-stone-600 mb-1.5">
                            Nouvelle date de fin<span className="text-emerald-500 ml-0.5">*</span>
                        </label>
                        <input
                            type="date"
                            required
                            min={currentEndDate}
                            value={newEndDate}
                            onChange={e => setNewEndDate(e.target.value)}
                            className={inputCls}
                        />
                        {currentEndDate && (
                            <p className="text-xs text-stone-400 mt-1">Doit être postérieure au {new Date(currentEndDate).toLocaleDateString('fr-FR')}.</p>
                        )}
                    </div>
                    <label className="flex items-center gap-2.5 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={extendServices}
                            onChange={e => setExtendServices(e.target.checked)}
                            className="w-4 h-4 accent-emerald-600 rounded-sm cursor-pointer"
                        />
                        <span className="text-sm text-stone-600">Étendre aussi les services facturés à la journée</span>
                    </label>
                    <div className="flex items-center justify-end gap-2 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={submitting}
                            className="px-4 py-2 rounded-md border border-stone-300 text-stone-600 text-sm font-medium hover:bg-stone-50 transition disabled:opacity-60"
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white text-sm font-medium transition"
                        >
                            {submitting ? (
                                <>
                                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                        <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
                                    </svg>
                                    Enregistrement…
                                </>
                            ) : 'Prolonger'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

const RENTAL_STATUS = {
    completed: { label: 'Terminée',   cls: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200', dot: 'bg-emerald-500' },
    active:    { label: 'En cours',   cls: 'bg-blue-50 text-blue-700 ring-1 ring-blue-200',           dot: 'bg-blue-500' },
    canceled: { label: 'Annulée',    cls: 'bg-red-50 text-red-600 ring-1 ring-red-200',  dot: 'bg-red-500' },
    pending:   { label: 'En attente', cls: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',        dot: 'bg-amber-500' },
};

const FUEL_LABEL = { gasoline: 'Essence', diesel: 'Diesel', electric: 'Électrique', hybrid: 'Hybride' };
const PAYMENT_METHOD_LABEL = { cash: 'Espèces', card: 'Carte', transfer: 'Virement' };
const PRICE_TYPE_LABEL = { fixed: 'Forfait', per_day: 'Par jour', per_km: 'Par km' };

const fmtDate  = d => d ? new Date(d).toLocaleDateString('fr-FR') : '—';
const fmtDateTime = d => d ? new Date(d).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';
const fmtPrice = p => (p || p === 0) ? parseFloat(p).toLocaleString() + ' MAD' : '—';

export default function ReservationDetail() {
    const { id }   = useParams();
    const navigate = useNavigate();
    const [rental, setRental]     = useState(null);
    const [carImages, setCarImages] = useState([]);
    const [loading, setLoading]   = useState(true);
    const [error, setError]       = useState('');

    const [showReturnModal, setShowReturnModal] = useState(false);
    const [returnSubmitting, setReturnSubmitting] = useState(false);
    const [returnError, setReturnError] = useState('');

    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [paymentSubmitting, setPaymentSubmitting] = useState(false);
    const [paymentError, setPaymentError] = useState('');

    const [showExtensionModal, setShowExtensionModal] = useState(false);
    const [extensionSubmitting, setExtensionSubmitting] = useState(false);
    const [extensionError, setExtensionError] = useState('');

    const [showCancelConfirm, setShowCancelConfirm] = useState(false);
    const [cancelling, setCancelling] = useState(false);
    const [cancelError, setCancelError] = useState('');

    useEffect(() => {
        api.get(`/rentals/${id}`)
            .then(res => {
                const data = res.data?.data ?? res.data;
                setRental(data);
                // Le détail de location n'embarque pas les URLs d'images du véhicule ;
                // on les récupère depuis /cars/:id (même source que la fiche voiture).
                if (data?.car?.id) {
                    api.get(`/cars/${data.car.id}`)
                        .then(carRes => setCarImages(carRes.data?.images ?? []))
                        .catch(() => {});
                }
            })
            .catch(err => setError(
                err.response?.status === 404
                    ? 'Réservation introuvable.'
                    : 'Erreur du serveur lors du chargement de cette réservation. Réessayez plus tard.'
            ))
            .finally(() => setLoading(false));
    }, [id]);

    const handleReturn = async (values) => {
        setReturnSubmitting(true);
        setReturnError('');
        try {
            const res = await api.post(`/rentals/${id}/return`, values);
            const data = res.data?.data ?? res.data;
            setRental(r => ({
                ...r,
                status: data.status,
                actualReturnDate: data.actualReturnDate,
                priceSummary: {
                    ...r.priceSummary,
                    totalPrice: data.totalPrice,
                    paidAmount: data.paidAmount,
                    remainingAmount: data.remainingAmount,
                    isFullyPaid: data.isFullyPaid,
                },
            }));
            setShowReturnModal(false);
        } catch (err) {
            const errors = err.response?.data?.errors;
            setReturnError(
                errors
                    ? Object.values(errors).flat().join(' — ')
                    : translateError(err.response?.data?.message) || 'Erreur lors du retour.'
            );
        } finally {
            setReturnSubmitting(false);
        }
    };

    const handleAddPayment = async (values) => {
        setPaymentSubmitting(true);
        setPaymentError('');
        try {
            const res = await api.post(`/rentals/${id}/payments`, values);
            const data = res.data?.data ?? res.data;
            setRental(r => ({
                ...r,
                priceSummary: {
                    ...r.priceSummary,
                    totalPrice: data.totalPrice,
                    paidAmount: data.paidAmount,
                    remainingAmount: data.remainingAmount,
                    isFullyPaid: data.isFullyPaid,
                },
                payments: [...(r.payments ?? []), {
                    id: data.paymentId,
                    amount: data.amount,
                    paymentMethod: data.paymentMethod,
                    paymentDate: data.paymentDate,
                }],
            }));
            setShowPaymentModal(false);
        } catch (err) {
            const errors = err.response?.data?.errors;
            setPaymentError(
                errors
                    ? Object.values(errors).flat().join(' — ')
                    : translateError(err.response?.data?.message) || "Erreur lors de l'ajout du paiement."
            );
        } finally {
            setPaymentSubmitting(false);
        }
    };

    const handleAddExtension = async (values) => {
        setExtensionSubmitting(true);
        setExtensionError('');
        try {
            const res = await api.post(`/rental/${id}/extension`, values);
            const data = res.data?.data ?? res.data;
            setRental(r => ({
                ...r,
                expectedEndDate: data.newEndDate,
                finalEndDate: data.newEndDate,
                days: data.newDays,
                priceSummary: {
                    ...r.priceSummary,
                    pricePerDay: data.pricePerDay,
                    basePrice: data.newBasePrice,
                    servicesTotal: data.servicesTotal,
                    totalPrice: data.newTotalPrice,
                    remainingAmount: data.newTotalPrice - (r.priceSummary?.paidAmount ?? 0),
                    isFullyPaid: (r.priceSummary?.paidAmount ?? 0) >= data.newTotalPrice,
                },
                extensions: [...(r.extensions ?? []), {
                    id: Date.now(),
                    oldEndDate: data.oldEndDate,
                    newEndDate: data.newEndDate,
                }],
            }));
            setShowExtensionModal(false);
        } catch (err) {
            const errors = err.response?.data?.errors;
            setExtensionError(
                errors
                    ? Object.values(errors).flat().join(' — ')
                    : translateError(err.response?.data?.message) || "Erreur lors de la prolongation."
            );
        } finally {
            setExtensionSubmitting(false);
        }
    };

    const handleCancel = async () => {
        setCancelling(true);
        setCancelError('');
        try {
            const res = await api.patch(`/rentals/${id}/cancel`);
            const data = res.data?.data ?? res.data;
            setRental(r => ({
                ...r,
                status: data.status,
                car: r.car ? { ...r.car, status: data.carStatus } : r.car,
            }));
            setShowCancelConfirm(false);
        } catch (err) {
            setCancelError(translateError(err.response?.data?.message) || "Erreur lors de l'annulation.");
        } finally {
            setCancelling(false);
        }
    };

    if (loading) return (
        <div className="max-w-6xl space-y-4">
            <div className="h-7 w-48 bg-stone-200 rounded-sm animate-pulse" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="h-80 bg-stone-200 rounded-2xl animate-pulse" />
                <div className="lg:col-span-2 h-80 bg-stone-200 rounded-2xl animate-pulse" />
            </div>
        </div>
    );

    if (error || !rental) return (
        <div className="flex items-center gap-2 bg-red-50 text-red-600 px-4 py-3 rounded-lg border border-red-200 text-sm max-w-md">
            <i className="ti ti-alert-circle" /> {error || 'Réservation introuvable.'}
        </div>
    );

    const { status, startDate, expectedEndDate, finalEndDate, actualReturnDate, days,
            agency, client, car, priceSummary, services = [], extensions = [], payments = [] } = rental;

    const rs = RENTAL_STATUS[status] || { label: status, cls: 'bg-stone-100 text-stone-600 ring-1 ring-stone-200', dot: 'bg-stone-400' };
    const clientInitials = client?.name?.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() || '—';
    const carImage = carImages.find(i => i.is_primary)?.image_path
        || carImages[0]?.image_path
        || car?.primaryImage
        || car?.images?.find(i => i.isPrimary)?.url
        || car?.images?.[0]?.url;
    const paidPct = priceSummary?.totalPrice > 0
        ? Math.min(100, Math.round((parseFloat(priceSummary.paidAmount) / parseFloat(priceSummary.totalPrice)) * 100))
        : 0;

    return (
        <div className="max-w-6xl">

            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate('/reservations')}
                        className="w-8 h-8 rounded-md border border-stone-200 bg-white flex items-center justify-center text-stone-500 hover:bg-stone-50 transition flex-shrink-0"
                    >
                        <i className="ti ti-arrow-left text-[15px]" />
                    </button>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-xl font-semibold text-stone-900">Réservation #{rental.rentalId ?? id}</h1>
                            <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-0.5 rounded-full font-medium ${rs.cls}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${rs.dot}`} /> {rs.label}
                            </span>
                        </div>
                        <p className="text-sm text-stone-500 mt-0.5">{car?.brand} {car?.model} · {client?.name}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {(status === 'active' || status === 'pending') && (
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.94 }}
                            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                            onClick={() => setShowCancelConfirm(true)}
                            className="inline-flex items-center gap-1.5 bg-white border border-red-200 hover:bg-red-50 text-red-600 text-sm font-medium px-4 py-2 rounded-md transition-colors shadow-sm"
                        >
                            <i className="ti ti-ban text-[14px]" /> Annuler
                        </motion.button>
                    )}
                    {status === 'active' && (
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.94 }}
                            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                            onClick={() => setShowReturnModal(true)}
                            className="inline-flex items-center gap-1.5 bg-white border border-stone-300 hover:bg-stone-50 text-stone-700 text-sm font-medium px-4 py-2 rounded-md transition-colors shadow-sm"
                        >
                            <i className="ti ti-key text-[14px]" /> Retourner la voiture
                        </motion.button>
                    )}
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.94 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                        onClick={() => navigate(`/reservations/${id}/facture`)}
                        className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium px-4 py-2 rounded-md transition-colors shadow-sm"
                    >
                        <i className="ti ti-receipt text-[14px]" /> Facture
                    </motion.button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

                {/* Colonne gauche — voiture + client */}
                <div className="lg:col-span-1 space-y-6 lg:sticky lg:top-8">
                    <motion.div
                        initial={{ opacity: 0, y: 24, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ type: 'spring', stiffness: 260, damping: 22 }}
                        className="bg-white border border-stone-200 rounded-2xl shadow-sm overflow-hidden"
                    >
                        <div className="relative h-36 bg-stone-100">
                            {carImage ? (
                                <img src={carImage} alt={`${car?.brand} ${car?.model}`} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <i className="ti ti-car text-stone-300 text-4xl" />
                                </div>
                            )}
                        </div>
                        <div className="p-5">
                            <p className="font-semibold text-stone-900">{car?.brand} {car?.model}</p>
                            <p className="text-sm text-stone-500 font-mono">{car?.registrationNumber}</p>

                            <div className="mt-4 pt-4 border-t border-stone-100 space-y-3">
                                {[
                                    { icon: 'ti-gas-station', label: 'Carburant', value: FUEL_LABEL[car?.fuelType] ?? car?.fuelType ?? '—' },
                                    { icon: 'ti-road',        label: 'Kilométrage', value: car?.mileage != null ? `${car.mileage.toLocaleString()} km` : '—' },
                                    { icon: 'ti-steering-wheel', label: 'Statut véhicule', value: car?.status ?? '—' },
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

                    <motion.div
                        initial={{ opacity: 0, y: 24, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ type: 'spring', stiffness: 260, damping: 22, delay: 0.05 }}
                        className="bg-white border border-stone-200 rounded-2xl shadow-sm p-5"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-xl bg-emerald-700 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                                {clientInitials}
                            </div>
                            <div className="min-w-0">
                                <p className="font-semibold text-stone-900 truncate">{client?.name || '—'}</p>
                                <p className="text-xs text-stone-500">Client</p>
                            </div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-stone-100 space-y-3">
                            {[
                                { icon: 'ti-phone',         label: 'Téléphone',         value: client?.phone || '—' },
                                { icon: 'ti-mail',          label: 'Email',             value: client?.email || '—' },
                                { icon: 'ti-calendar-time', label: 'Expiration permis', value: fmtDate(client?.drivingLicenseExpiration) },
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
                    </motion.div>
                </div>

                {/* Colonne droite — période, agence, paiement, services */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Période + agence */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ type: 'spring', stiffness: 260, damping: 22 }}
                        className="bg-white border border-stone-200 rounded-2xl shadow-sm p-5"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-sm font-semibold text-stone-700 flex items-center gap-2">
                                <i className="ti ti-calendar-event text-emerald-500" /> Période de location
                            </h2>
                            {status === 'active' && (
                                <button
                                    onClick={() => setShowExtensionModal(true)}
                                    className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md border border-stone-300 text-stone-600 font-medium hover:bg-stone-50 transition"
                                >
                                    <i className="ti ti-calendar-plus text-[12px]" /> Prolonger
                                </button>
                            )}
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                            <div>
                                <p className="text-xs text-stone-400">Début</p>
                                <p className="text-stone-900 font-medium">{fmtDateTime(startDate)}</p>
                            </div>
                            <div>
                                <p className="text-xs text-stone-400">Fin prévue</p>
                                <p className="text-stone-900 font-medium">{fmtDateTime(expectedEndDate)}</p>
                            </div>
                            <div>
                                <p className="text-xs text-stone-400">Fin réelle</p>
                                <p className="text-stone-900 font-medium">{fmtDateTime(finalEndDate)}</p>
                            </div>
                            <div>
                                <p className="text-xs text-stone-400">Retour effectif</p>
                                <p className="text-stone-900 font-medium">{fmtDateTime(actualReturnDate)}</p>
                            </div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-stone-100 flex items-center justify-between text-sm">
                            <div>
                                <p className="text-xs text-stone-400">Durée</p>
                                <p className="text-stone-900 font-medium">{days} jour{days > 1 ? 's' : ''}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-stone-400">Agence</p>
                                <p className="text-stone-900 font-medium">{agency?.name || '—'}</p>
                                <p className="text-xs text-stone-500">{[agency?.phone, agency?.email].filter(Boolean).join(' · ') || '—'}</p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Paiement */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ type: 'spring', stiffness: 260, damping: 22, delay: 0.05 }}
                        className="bg-white border border-stone-200 rounded-2xl shadow-sm p-5"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-sm font-semibold text-stone-700 flex items-center gap-2">
                                <i className="ti ti-cash text-emerald-500" /> Paiement
                            </h2>
                            <div className="flex items-center gap-2">
                                <span className={`inline-block text-xs px-2.5 py-0.5 rounded-full font-medium ${
                                    priceSummary?.isFullyPaid
                                        ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
                                        : 'bg-amber-50 text-amber-700 ring-1 ring-amber-200'
                                }`}>
                                    {priceSummary?.isFullyPaid ? 'Payée en totalité' : 'Paiement partiel'}
                                </span>
                                {!priceSummary?.isFullyPaid && (
                                    <button
                                        onClick={() => setShowPaymentModal(true)}
                                        className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md border border-stone-300 text-stone-600 font-medium hover:bg-stone-50 transition"
                                    >
                                        <i className="ti ti-plus text-[12px]" /> Paiement
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm mb-4">
                            <div>
                                <p className="text-xs text-stone-400">Prix/jour</p>
                                <p className="text-stone-900 font-medium">{fmtPrice(priceSummary?.pricePerDay)}</p>
                            </div>
                            <div>
                                <p className="text-xs text-stone-400">Base</p>
                                <p className="text-stone-900 font-medium">{fmtPrice(priceSummary?.basePrice)}</p>
                            </div>
                            <div>
                                <p className="text-xs text-stone-400">Services</p>
                                <p className="text-stone-900 font-medium">{fmtPrice(priceSummary?.servicesTotal)}</p>
                            </div>
                            <div>
                                <p className="text-xs text-stone-400">Total</p>
                                <p className="text-stone-900 font-semibold">{fmtPrice(priceSummary?.totalPrice)}</p>
                            </div>
                        </div>

                        <div className="w-full h-2 rounded-full bg-stone-100 overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${paidPct}%` }}
                                transition={{ type: 'spring', stiffness: 120, damping: 20, delay: 0.15 }}
                                className="h-full bg-emerald-500 rounded-full"
                            />
                        </div>
                        <div className="flex items-center justify-between mt-2 text-xs">
                            <span className="text-emerald-600 font-medium">Payé {fmtPrice(priceSummary?.paidAmount)}</span>
                            <span className="text-stone-500">Reste {fmtPrice(priceSummary?.remainingAmount)}</span>
                        </div>

                        {payments.length > 0 && (
                            <div className="mt-4 pt-4 border-t border-stone-100">
                                <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2">Historique des paiements</p>
                                <div className="divide-y divide-stone-100">
                                    {payments.map(p => (
                                        <div key={p.id} className="flex items-center justify-between py-2 text-sm">
                                            <span className="text-stone-500">{fmtDate(p.paymentDate)} · {PAYMENT_METHOD_LABEL[p.paymentMethod] ?? p.paymentMethod}</span>
                                            <span className="text-stone-900 font-medium">{fmtPrice(p.amount)}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </motion.div>

                    {/* Services */}
                    {services.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ type: 'spring', stiffness: 260, damping: 22, delay: 0.1 }}
                            className="bg-white border border-stone-200 rounded-2xl shadow-sm overflow-hidden"
                        >
                            <div className="px-5 py-4 border-b border-stone-100">
                                <h2 className="text-sm font-semibold text-stone-700 flex items-center gap-2">
                                    <i className="ti ti-list-details text-emerald-500" /> Services additionnels
                                </h2>
                            </div>
                            <table className="w-full text-sm">
                                <tbody className="divide-y divide-stone-100">
                                    {services.map(s => (
                                        <tr key={s.id}>
                                            <td className="px-5 py-2.5 text-stone-900">
                                                {s.name} <span className="text-xs text-stone-400">({PRICE_TYPE_LABEL[s.priceType] ?? s.priceType})</span>
                                            </td>
                                            <td className="px-5 py-2.5 text-right text-stone-600">×{s.quantity}</td>
                                            <td className="px-5 py-2.5 text-right font-medium text-stone-900">{fmtPrice(s.totalPrice)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </motion.div>
                    )}

                    {/* Prolongations */}
                    {extensions.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ type: 'spring', stiffness: 260, damping: 22, delay: 0.15 }}
                            className="bg-white border border-stone-200 rounded-2xl shadow-sm overflow-hidden"
                        >
                            <div className="px-5 py-4 border-b border-stone-100">
                                <h2 className="text-sm font-semibold text-stone-700 flex items-center gap-2">
                                    <i className="ti ti-calendar-plus text-emerald-500" /> Prolongations
                                </h2>
                            </div>
                            <table className="w-full text-sm">
                                <tbody className="divide-y divide-stone-100">
                                    {extensions.map(ext => (
                                        <tr key={ext.id}>
                                            <td className="px-5 py-2.5 text-stone-500">Prolongation</td>
                                            <td className="px-5 py-2.5 text-right text-stone-900 font-medium">
                                                {fmtDate(ext.oldEndDate)} <span className="text-stone-300">→</span> {fmtDate(ext.newEndDate)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </motion.div>
                    )}
                </div>
            </div>

            <AnimatePresence>
                {showReturnModal && (
                    <ReturnCarModal
                        submitting={returnSubmitting}
                        error={returnError}
                        onClose={() => { setShowReturnModal(false); setReturnError(''); }}
                        onSubmit={handleReturn}
                    />
                )}
                {showPaymentModal && (
                    <AddPaymentModal
                        submitting={paymentSubmitting}
                        error={paymentError}
                        onClose={() => { setShowPaymentModal(false); setPaymentError(''); }}
                        onSubmit={handleAddPayment}
                    />
                )}
                {showExtensionModal && (
                    <AddExtensionModal
                        currentEndDate={expectedEndDate}
                        submitting={extensionSubmitting}
                        error={extensionError}
                        onClose={() => { setShowExtensionModal(false); setExtensionError(''); }}
                        onSubmit={handleAddExtension}
                    />
                )}
            </AnimatePresence>

            {/* Confirmation annulation */}
            {showCancelConfirm && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4" onClick={() => setShowCancelConfirm(false)}>
                    <div className="bg-white rounded-lg shadow-xl max-w-sm w-full p-5" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
                                <i className="ti ti-alert-triangle text-red-600 text-[18px]" />
                            </div>
                            <h3 className="text-base font-semibold text-stone-900">Annuler cette réservation ?</h3>
                        </div>
                        <p className="text-sm text-stone-500 mb-4">
                            Voulez-vous vraiment annuler cette réservation ?
                        </p>
                        {cancelError && (
                            <div className="flex items-center gap-2 bg-red-50 text-red-600 px-3 py-2 rounded-md border border-red-200 text-xs mb-4">
                                <i className="ti ti-alert-circle" /> {cancelError}
                            </div>
                        )}
                        <div className="flex items-center justify-end gap-2">
                            <button
                                onClick={() => setShowCancelConfirm(false)}
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
