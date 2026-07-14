import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../api/api';
import { translateError } from '../../utils/translateError';

const STATUS = {
    available:   { label: 'Disponible',   cls: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200' },
    rented:      { label: 'Louée',        cls: 'bg-blue-50 text-blue-700 ring-1 ring-blue-200' },
    maintenance: { label: 'Maintenance',  cls: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200' },
    unavailable: { label: 'Indisponible', cls: 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200' },
};

const FUEL = { diesel: 'Diesel', petrol: 'Essence', electric: 'Électrique', hybrid: 'Hybride' };

const RENTAL_STATUS = {
    completed: { label: 'Terminée',   cls: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200' },
    active:    { label: 'En cours',   cls: 'bg-blue-50 text-blue-700 ring-1 ring-blue-200' },
    canceled: { label: 'Annulée',    cls: 'bg-red-50 text-red-600 ring-1 ring-red-200' },
    pending:   { label: 'En attente', cls: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200' },
};

const fmtDate  = d => d ? new Date(d).toLocaleDateString('fr-FR') : '—';
const fmtPrice = p => p ? parseFloat(p).toLocaleString() + ' MAD' : '—';

const inputCls = 'w-full bg-white border border-stone-300 text-stone-900 placeholder-stone-400 px-3 py-2 rounded-md text-sm focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition';

function Section({ title, action, children, className = '' }) {
    return (
        <div className={`bg-white border border-stone-200 rounded-2xl shadow-sm mb-5 overflow-hidden ${className}`}>
            {title && (
                <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between gap-3">
                    <h3 className="text-sm font-semibold text-stone-700">{title}</h3>
                    {action}
                </div>
            )}
            <div className="p-6">{children}</div>
        </div>
    );
}

function AddSectionButton({ onClick, label }) {
    return (
        <button
            type="button"
            onClick={onClick}
            title={label}
            className="w-7 h-7 flex-shrink-0 rounded-md bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-100 flex items-center justify-center transition"
        >
            <i className="ti ti-plus text-[15px]" />
        </button>
    );
}

// Galerie photo : image principale cliquable (ouvre un lightbox plein écran) + bande de miniatures.
// Gère plusieurs photos par voiture sans dépendance externe (navigation clavier incluse).
function CarGallery({ images, alt }) {
    const list = images ?? [];
    const [active, setActive] = useState(0);
    const [lightbox, setLightbox] = useState(false);

    const go = (delta) => setActive(i => (i + delta + list.length) % list.length);

    useEffect(() => {
        if (!lightbox) return;
        const onKey = (e) => {
            if (e.key === 'Escape') setLightbox(false);
            if (e.key === 'ArrowRight') go(1);
            if (e.key === 'ArrowLeft') go(-1);
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [lightbox, list.length]);

    if (list.length === 0) {
        return (
            <div className="h-72 rounded-2xl bg-stone-100 border border-stone-200 flex items-center justify-center">
                <i className="ti ti-car text-stone-300 text-6xl" />
            </div>
        );
    }

    const current = list[active];

    return (
        <div>
            <button
                type="button"
                onClick={() => setLightbox(true)}
                className="relative w-full h-72 rounded-2xl overflow-hidden bg-stone-100 border border-stone-200 block group"
            >
                <img src={current.image_path} alt={alt} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition flex items-center justify-center">
                    <span className="opacity-0 group-hover:opacity-100 transition inline-flex items-center gap-1.5 bg-white/90 backdrop-blur px-3 py-1.5 rounded-full text-xs font-medium text-stone-800">
                        <i className="ti ti-zoom-in text-[14px]" /> Agrandir
                    </span>
                </div>
                {current.is_primary && (
                    <span className="absolute top-3 left-3 inline-flex items-center gap-1 bg-emerald-600 text-white text-[11px] px-2.5 py-1 rounded-full font-medium shadow-sm">
                        <i className="ti ti-star-filled text-[11px]" /> Principale
                    </span>
                )}
                {list.length > 1 && (
                    <span className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-2.5 py-1 rounded-full font-medium">
                        {active + 1} / {list.length}
                    </span>
                )}
            </button>

            {list.length > 1 && (
                <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
                    {list.map((image, i) => (
                        <button
                            key={image.id ?? i}
                            type="button"
                            onClick={() => setActive(i)}
                            className={`relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition ${i === active ? 'border-emerald-500' : 'border-transparent opacity-70 hover:opacity-100'}`}
                        >
                            <img src={image.image_path} alt="" loading="lazy" className="w-full h-full object-cover" />
                        </button>
                    ))}
                </div>
            )}

            <AnimatePresence>
                {lightbox && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setLightbox(false)}
                        className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center px-4"
                    >
                        <button
                            onClick={() => setLightbox(false)}
                            className="absolute top-5 right-5 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
                        >
                            <i className="ti ti-x text-[20px]" />
                        </button>
                        {list.length > 1 && (
                            <>
                                <button
                                    onClick={e => { e.stopPropagation(); go(-1); }}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
                                >
                                    <i className="ti ti-chevron-left text-[22px]" />
                                </button>
                                <button
                                    onClick={e => { e.stopPropagation(); go(1); }}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
                                >
                                    <i className="ti ti-chevron-right text-[22px]" />
                                </button>
                            </>
                        )}
                        <motion.img
                            key={active}
                            initial={{ opacity: 0, scale: 0.97 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                            src={current.image_path}
                            alt={alt}
                            onClick={e => e.stopPropagation()}
                            className="max-w-full max-h-[85vh] rounded-lg object-contain"
                        />
                        {list.length > 1 && (
                            <span className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/10 text-white text-xs px-3 py-1.5 rounded-full">
                                {active + 1} / {list.length}
                            </span>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

const MODALS = {
    insurance: {
        title: 'Ajouter une assurance',
        icon: 'ti-shield-plus',
        endpoint: '/insurances',
        fields: [
            { name: 'insuranceCompany',  label: 'Compagnie',           type: 'text',   required: true, full: true },
            { name: 'contractNumber',    label: 'N° de contrat',       type: 'text',   required: true },
            { name: 'insurancePrice',    label: 'Prix (MAD)',          type: 'number', required: true },
            { name: 'coverageStartDate', label: 'Début de couverture', type: 'date',   required: true },
            { name: 'coverageEndDate',   label: 'Fin de couverture',   type: 'date',   required: true },
        ],
    },
    tax: {
        title: 'Ajouter un impôt',
        icon: 'ti-receipt-tax',
        endpoint: '/taxes',
        fields: [
            { name: 'année',              label: 'Année',            type: 'number', required: true, full: true },
            { name: 'montant',            label: 'Montant (MAD)',    type: 'number', required: true },
            { name: 'datedéchéance',      label: 'Échéance',         type: 'date',   required: true },
            { name: 'payé',               label: 'Déjà payé',        type: 'checkbox' },
        ],
    },
    maintenance: {
        title: 'Ajouter une maintenance',
        icon: 'ti-tool',
        endpoint: '/maintenance',
        fields: [
            { name: 'maintenanceType',  label: 'Type',           type: 'text',   required: true, full: true },
            { name: 'maintenanceCost', label: 'Coût (MAD)',      type: 'number', required: true },
            { name: 'maintenanceDate', label: 'Date',            type: 'date',   required: true },
            { name: 'currentMileage',  label: 'Km actuel',       type: 'number', required: true },
            { name: 'nextDueMileage',  label: 'Prochain Km',     type: 'number', required: true },
        ],
    },
    sale: {
        title: 'Vendre la voiture',
        icon: 'ti-cash-banknote',
        endpoint: '/carsale',
        confirm: true,
        fields: [
            { name: 'saleDate',     label: 'Date de vente',          type: 'date',   required: true },
            { name: 'salePrice',    label: 'Prix de vente (MAD)',    type: 'number', required: true },
            { name: 'buyerName',    label: "Nom de l'acheteur",      type: 'text',   required: true, full: true },
            { name: 'buyerContact', label: "Contact de l'acheteur",  type: 'text',   required: true, full: true },
        ],
    },
};

function AddRecordModal({ config, submitting, error, onClose, onSubmit }) {
    const [values, setValues] = useState(() =>
        Object.fromEntries(config.fields.map(f => [f.name, f.type === 'checkbox' ? false : '']))
    );
    const [confirming, setConfirming] = useState(false);
    const set = (name, val) => setValues(v => ({ ...v, [name]: val }));

    const handleSubmit = e => {
        e.preventDefault();
        if (config.confirm && !confirming) {
            setConfirming(true);
            return;
        }
        onSubmit(values);
    };

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100">
                    <h3 className="text-base font-semibold text-stone-900 flex items-center gap-2">
                        <i className={`ti ${config.icon} text-emerald-500`} /> {config.title}
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

                    {confirming ? (
                        <div>
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center flex-shrink-0">
                                    <i className="ti ti-alert-triangle text-emerald-600 text-[18px]" />
                                </div>
                                <p className="text-sm text-stone-600">Cette action est irréversible. Vérifiez les informations avant de confirmer.</p>
                            </div>
                            <div className="bg-stone-50 border border-stone-100 rounded-lg divide-y divide-stone-100">
                                {config.fields.map(field => (
                                    <div key={field.name} className="flex items-center justify-between px-3.5 py-2 text-sm">
                                        <span className="text-stone-500">{field.label}</span>
                                        <span className="font-medium text-stone-900">
                                            {field.type === 'checkbox' ? (values[field.name] ? 'Oui' : 'Non') : (values[field.name] || '—')}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-4">
                            {config.fields.map(field => (
                                <div key={field.name} className={field.full ? 'col-span-2' : ''}>
                                    {field.type === 'checkbox' ? (
                                        <label className="flex items-center gap-2.5 cursor-pointer mt-5">
                                            <input
                                                type="checkbox"
                                                checked={values[field.name]}
                                                onChange={e => set(field.name, e.target.checked)}
                                                className="w-4 h-4 accent-emerald-600 rounded-sm cursor-pointer"
                                            />
                                            <span className="text-sm text-stone-600">{field.label}</span>
                                        </label>
                                    ) : (
                                        <div>
                                            <label className="block text-xs font-medium text-stone-600 mb-1.5">
                                                {field.label}{field.required && <span className="text-emerald-500 ml-0.5">*</span>}
                                            </label>
                                            <input
                                                type={field.type}
                                                step={field.type === 'number' ? '0.01' : undefined}
                                                required={field.required}
                                                value={values[field.name]}
                                                onChange={e => set(field.name, e.target.value)}
                                                className={inputCls}
                                            />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="flex items-center justify-end gap-2 pt-2">
                        <button
                            type="button"
                            onClick={confirming ? () => setConfirming(false) : onClose}
                            disabled={submitting}
                            className="px-4 py-2 rounded-md border border-stone-300 text-stone-600 text-sm font-medium hover:bg-stone-50 transition disabled:opacity-60"
                        >
                            {confirming ? 'Retour' : 'Annuler'}
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
                                    {confirming ? 'Envoi…' : 'Ajout…'}
                                </>
                            ) : confirming ? 'Confirmer la vente' : config.confirm ? 'Continuer' : 'Ajouter'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function DataTable({ headers, rows, empty, icon }) {
    if (empty) return (
        <div className="text-center py-8 text-stone-400">
            {icon && <i className={`ti ${icon} text-2xl mb-2 block`} />}
            <p className="text-sm">{empty}</p>
        </div>
    );
    return (
        <div className="-mx-6 overflow-x-auto">
            <table className="w-full text-sm min-w-[480px]">
                <thead>
                    <tr className="bg-stone-50 border-y border-stone-100">
                        {headers.map(h => <th key={h} className="py-2.5 px-6 text-left text-xs font-semibold text-stone-500 uppercase tracking-wider">{h}</th>)}
                    </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">{rows}</tbody>
            </table>
        </div>
    );
}

export default function VoitureDetail() {
    const { id }   = useParams();
    const navigate = useNavigate();
    const isOwner  = useSelector(state => state.auth.user?.role === 'owner');
    const [car, setCar]               = useState(null);
    const [loading, setLoading]       = useState(true);
    const [error, setError]           = useState('');

    const [modal, setModal]                     = useState(null);
    const [modalSubmitting, setModalSubmitting] = useState(false);
    const [modalError, setModalError]           = useState('');

    const fetchCar = () => api.get(`/cars/${id}`).then(res => setCar(res.data));

    useEffect(() => {
        fetchCar()
            .catch(() => setError('Voiture introuvable.'))
            .finally(() => setLoading(false));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const closeModal = () => { setModal(null); setModalError(''); };

    const handleAddRecord = async (values) => {
        setModalSubmitting(true);
        setModalError('');
        try {
            await api.post(MODALS[modal].endpoint, { carId: Number(id), ...values });
            if (modal === 'sale') {
                navigate('/voitures/vendues');
                return;
            }
            await fetchCar();
            setModal(null);
        } catch (err) {
            const errors = err.response?.data?.errors;
            setModalError(
                errors
                    ? Object.values(errors).flat().join(' — ')
                    : translateError(err.response?.data?.message) || "Erreur lors de l'ajout."
            );
        } finally {
            setModalSubmitting(false);
        }
    };

    if (loading) return (
        <div className="space-y-4 max-w-5xl">
            <div className="h-7 w-48 bg-stone-200 rounded-sm animate-pulse" />
            <div className="h-96 bg-stone-200 rounded-2xl animate-pulse" />
            {[...Array(3)].map((_, i) => <div key={i} className="h-28 bg-stone-200 rounded-2xl animate-pulse" />)}
        </div>
    );

    if (error) return (
        <div className="flex items-center gap-2 bg-red-50 text-red-600 px-4 py-3 rounded-lg border border-red-200 text-sm max-w-md">
            <i className="ti ti-alert-circle" /> {error}
        </div>
    );

    const status = STATUS[car.status] || { label: car.status, cls: 'bg-stone-100 text-stone-600 ring-1 ring-stone-200' };

    const specs = [
        { label: 'Immatriculation', value: car.registration_number,               icon: 'ti-license' },
        { label: 'Carburant',       value: FUEL[car.fuel_type] || car.fuel_type,  icon: 'ti-gas-station' },
        { label: 'Kilométrage',     value: car.mileage.toLocaleString() + ' km',  icon: 'ti-road' },
        { label: 'Prix / jour',     value: fmtPrice(car.daily_price),             icon: 'ti-cash' },
        { label: "Prix d'achat",    value: fmtPrice(car.purchase_price),          icon: 'ti-receipt' },
        { label: "Date d'achat",    value: fmtDate(car.purchase_date),            icon: 'ti-calendar' },
        { label: 'Agence',          value: '#' + car.agency_id,                   icon: 'ti-building' },
        { label: 'Ajouté le',       value: fmtDate(car.created_at),               icon: 'ti-clock' },
    ];

    return (
        <div className="max-w-5xl">

            {/* Header */}
            <div className="flex items-center justify-between gap-3 mb-6">
                <div className="flex items-center gap-3 min-w-0">
                    <button
                        onClick={() => navigate('/voitures')}
                        className="w-8 h-8 rounded-md border border-stone-200 bg-white flex items-center justify-center text-stone-500 hover:bg-stone-50 transition flex-shrink-0"
                    >
                        <i className="ti ti-arrow-left text-[15px]" />
                    </button>
                    <div className="min-w-0">
                        <div className="flex items-center gap-2.5">
                            <h1 className="text-xl font-semibold text-stone-900 truncate">{car.brand} {car.model}</h1>
                            <span className={`flex-shrink-0 text-xs px-2.5 py-1 rounded-full font-medium ${status.cls}`}>{status.label}</span>
                        </div>
                        <p className="text-sm text-stone-500 mt-0.5 font-mono">{car.registration_number}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                    {isOwner && (
                        <button
                            onClick={() => setModal('sale')}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md border border-stone-300 text-stone-600 text-sm font-medium hover:bg-stone-50 transition"
                        >
                            <i className="ti ti-cash-banknote text-[14px]" /> Vendre
                        </button>
                    )}
                    <button
                        onClick={() => navigate(`/voitures/${id}/modifier`)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md border border-stone-300 text-stone-600 text-sm font-medium hover:bg-stone-50 transition"
                    >
                        <i className="ti ti-pencil text-[14px]" /> Modifier
                    </button>
                </div>
            </div>

            {/* Galerie + caractéristiques */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 260, damping: 22 }}
                className="bg-white border border-stone-200 rounded-2xl shadow-sm mb-5 p-6"
            >
                <CarGallery images={car.images} alt={`${car.brand} ${car.model}`} />

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
                    {specs.map((s, index) => (
                        <motion.div
                            key={s.label}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 26, delay: index * 0.04 }}
                            className="flex items-center gap-3 bg-stone-50 border border-stone-100 rounded-xl px-3.5 py-3"
                        >
                            <div className="w-9 h-9 rounded-lg bg-white border border-stone-200 text-emerald-600 flex items-center justify-center flex-shrink-0">
                                <i className={`ti ${s.icon} text-[16px]`} />
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs text-stone-500">{s.label}</p>
                                <p className="text-sm font-medium text-stone-900 truncate">{s.value}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </motion.div>

            {/* Assurances */}
            <Section title="Assurances" action={<AddSectionButton label="Ajouter une assurance" onClick={() => setModal('insurance')} />}>
                <DataTable
                    icon="ti-shield-off"
                    headers={['Compagnie', 'Prix', 'Début', 'Fin']}
                    empty={car.insurances?.length === 0 ? 'Aucune assurance enregistrée.' : null}
                    rows={car.insurances?.map(ins => (
                        <tr key={ins.id} className="hover:bg-stone-50/70 transition-colors">
                            <td className="py-3 px-6 font-medium text-stone-800">{ins.company}</td>
                            <td className="py-3 px-6 text-stone-600">{fmtPrice(ins.price)}</td>
                            <td className="py-3 px-6 text-stone-600">{fmtDate(ins.start_date)}</td>
                            <td className="py-3 px-6 text-stone-600">{fmtDate(ins.end_date)}</td>
                        </tr>
                    ))}
                />
            </Section>

            {/* Taxes */}
            <Section title="Taxes" action={<AddSectionButton label="Ajouter un impôt" onClick={() => setModal('tax')} />}>
                <DataTable
                    icon="ti-receipt-off"
                    headers={['Année', 'Montant', 'Échéance', 'Payée']}
                    empty={car.taxes?.length === 0 ? 'Aucune taxe enregistrée.' : null}
                    rows={car.taxes?.map(tax => (
                        <tr key={tax.id} className="hover:bg-stone-50/70 transition-colors">
                            <td className="py-3 px-6 font-medium text-stone-800">{tax.year}</td>
                            <td className="py-3 px-6 text-stone-600">{fmtPrice(tax.amount)}</td>
                            <td className="py-3 px-6 text-stone-600">{fmtDate(tax.due_date)}</td>
                            <td className="py-3 px-6">
                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${tax.paid ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200' : 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200'}`}>
                                    {tax.paid ? 'Payée' : 'Non payée'}
                                </span>
                            </td>
                        </tr>
                    ))}
                />
            </Section>

            {/* Maintenances */}
            <Section title="Maintenances" action={<AddSectionButton label="Ajouter une maintenance" onClick={() => setModal('maintenance')} />}>
                <DataTable
                    icon="ti-tool"
                    headers={['Type', 'Coût', 'Date', 'Km actuel', 'Prochain Km']}
                    empty={car.maintenances?.length === 0 ? 'Aucune maintenance enregistrée.' : null}
                    rows={car.maintenances?.map(m => (
                        <tr key={m.id} className="hover:bg-stone-50/70 transition-colors">
                            <td className="py-3 px-6 font-medium text-stone-800">{m.type}</td>
                            <td className="py-3 px-6 text-stone-600">{fmtPrice(m.cost)}</td>
                            <td className="py-3 px-6 text-stone-600">{fmtDate(m.date)}</td>
                            <td className="py-3 px-6 text-stone-600">{m.mileage?.toLocaleString()} km</td>
                            <td className="py-3 px-6 text-stone-600">{m.next_due_mileage?.toLocaleString()} km</td>
                        </tr>
                    ))}
                />
            </Section>

            {/* Locations */}
            <Section title="Historique des locations">
                <DataTable
                    icon="ti-calendar-off"
                    headers={['Début', 'Fin', 'Prix/jour', 'Total', 'Payé', 'Statut']}
                    empty={car.rentals?.length === 0 ? 'Aucune location enregistrée.' : null}
                    rows={car.rentals?.map(r => {
                        const rs = RENTAL_STATUS[r.status] || { label: r.status, cls: 'bg-stone-100 text-stone-600 ring-1 ring-stone-200' };
                        return (
                            <tr key={r.id} className="hover:bg-stone-50/70 transition-colors">
                                <td className="py-3 px-6 text-stone-600">{fmtDate(r.start_date)}</td>
                                <td className="py-3 px-6 text-stone-600">{fmtDate(r.end_date)}</td>
                                <td className="py-3 px-6 text-stone-600">{fmtPrice(r.price_per_day)}</td>
                                <td className="py-3 px-6 font-semibold text-stone-900">{fmtPrice(r.total_price)}</td>
                                <td className="py-3 px-6 text-stone-600">{fmtPrice(r.paid_amount)}</td>
                                <td className="py-3 px-6">
                                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${rs.cls}`}>{rs.label}</span>
                                </td>
                            </tr>
                        );
                    })}
                />
            </Section>

            {/* Ajout assurance / impôt / maintenance */}
            {modal && (
                <AddRecordModal
                    config={MODALS[modal]}
                    submitting={modalSubmitting}
                    error={modalError}
                    onClose={closeModal}
                    onSubmit={handleAddRecord}
                />
            )}

        </div>
    );
}
