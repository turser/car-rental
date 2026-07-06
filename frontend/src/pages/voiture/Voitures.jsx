import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../../api/api';

const STATUS = {
    available:   { label: 'Disponible',   cls: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200', dot: 'bg-emerald-500' },
    rented:      { label: 'Louée',        cls: 'bg-blue-50 text-blue-700 ring-1 ring-blue-200',          dot: 'bg-blue-500' },
    maintenance: { label: 'Maintenance',  cls: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',       dot: 'bg-amber-500' },
    unavailable: { label: 'Indisponible', cls: 'bg-red-50 text-red-600 ring-1 ring-red-200',             dot: 'bg-red-500' },
};

const FUEL = {
    diesel:   { label: 'Diesel',     icon: 'ti-droplet' },
    petrol:   { label: 'Essence',    icon: 'ti-gas-station' },
    electric: { label: 'Électrique', icon: 'ti-bolt' },
    hybrid:   { label: 'Hybride',    icon: 'ti-leaf' },
};

const IMAGE_BASE = 'https://car-rental-production-59c6.up.railway.app/storage/';

function FilterSection({ title, open, onToggle, children }) {
    return (
        <div className="border-b border-stone-100 last:border-0">
            <button
                onClick={onToggle}
                className="w-full flex items-center justify-between py-3 text-sm font-semibold text-stone-700 hover:text-stone-900 transition"
            >
                {title}
                <i className={`ti ${open ? 'ti-chevron-up' : 'ti-chevron-down'} text-stone-400 text-[13px]`} />
            </button>
            {open && <div className="pb-3 space-y-2">{children}</div>}
        </div>
    );
}

function FilterCheckbox({ label, checked, onChange, dot }) {
    return (
        <label className="flex items-center gap-2.5 cursor-pointer group">
            <input
                type="checkbox"
                checked={checked}
                onChange={onChange}
                className="w-4 h-4 accent-emerald-600 rounded-sm cursor-pointer"
            />
            <span className="flex items-center gap-1.5 text-sm text-stone-600 group-hover:text-stone-900 transition">
                {dot && <span className={`w-2 h-2 rounded-full flex-shrink-0 ${dot}`} />}
                {label}
            </span>
        </label>
    );
}

function CarListCard({ car, navigate, index }) {
    const img  = car.images?.find(i => i.is_primary) || car.images?.[0];
    const s    = STATUS[car.status] || { label: car.status, cls: 'bg-stone-100 text-stone-600 ring-1 ring-stone-200' };
    const fuel = FUEL[car.fuel_type] || { label: car.fuel_type, icon: 'ti-gas-station' };
    const year = car.purchase_date ? new Date(car.purchase_date).getFullYear() : null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 28, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20, delay: index * 0.06 }}
            whileHover={{ y: -6, scale: 1.015 }}
            whileTap={{ scale: 0.985 }}
            className="bg-white border border-stone-200 rounded-lg shadow-sm hover:shadow-lg hover:border-emerald-200 transition-shadow overflow-hidden"
        >
            <div className="flex">
                <div className="w-52 h-40 flex-shrink-0 bg-stone-100 border-r border-stone-200 flex items-center justify-center overflow-hidden">
                    {img ? (
                        <img
                            src={IMAGE_BASE + img.image_path}
                            alt={`${car.brand} ${car.model}`}
                            loading="lazy"
                            width={208}
                            height={160}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <i className="ti ti-car text-stone-300 text-5xl" />
                    )}
                </div>

                <div className="flex-1 p-4 flex flex-col justify-between min-w-0">
                    <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                            <span className={`inline-block text-[11px] px-2.5 py-0.5 rounded-full font-medium mb-2 ${s.cls}`}>
                                {s.label}
                            </span>
                            <h3 className="font-bold text-stone-900 text-base truncate">{car.brand} {car.model}</h3>
                            <p className="font-mono text-xs text-stone-400 mt-0.5">{car.registration_number}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                            <p className="text-2xl font-bold text-emerald-600 leading-none">
                                {parseFloat(car.daily_price).toLocaleString()}
                            </p>
                            <p className="text-xs text-stone-400 mt-0.5">MAD / jour</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-5 text-xs text-stone-500 mt-3">
                        <span className="flex items-center gap-1.5">
                            <i className={`ti ${fuel.icon} text-[14px] text-stone-400`} />
                            {fuel.label}
                        </span>
                        <span className="flex items-center gap-1.5">
                            <i className="ti ti-road text-[14px] text-stone-400" />
                            {car.mileage?.toLocaleString()} km
                        </span>
                        {year && (
                            <span className="flex items-center gap-1.5">
                                <i className="ti ti-calendar text-[14px] text-stone-400" />
                                {year}
                            </span>
                        )}
                    </div>

                    <div className="flex items-center gap-2 mt-3">
                        <button
                            onClick={() => navigate(`/voitures/${car.id}`)}
                            className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium px-4 py-1.5 rounded-md transition"
                        >
                            <i className="ti ti-eye text-[12px]" />
                            Voir les détails
                        </button>
                        <button
                            onClick={() => navigate(`/voitures/${car.id}/modifier`)}
                            className="inline-flex items-center gap-1.5 border border-stone-300 text-stone-600 hover:bg-stone-50 text-xs font-medium px-3 py-1.5 rounded-md transition"
                        >
                            <i className="ti ti-pencil text-[12px]" />
                            Modifier
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

function CarGridCard({ car, navigate, index }) {
    const img  = car.images?.find(i => i.is_primary) || car.images?.[0];
    const s    = STATUS[car.status] || { label: car.status, cls: 'bg-stone-100 text-stone-600 ring-1 ring-stone-200' };
    const fuel = FUEL[car.fuel_type] || { label: car.fuel_type, icon: 'ti-gas-station' };

    return (
        <motion.button
            initial={{ opacity: 0, y: 28, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20, delay: index * 0.06 }}
            whileHover={{ y: -6, scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate(`/voitures/${car.id}`)}
            className="text-left bg-white border border-stone-200 rounded-lg shadow-sm hover:shadow-lg hover:border-emerald-200 transition-shadow overflow-hidden group w-full"
        >
            <div className="h-36 bg-stone-100 border-b border-stone-200 flex items-center justify-center overflow-hidden">
                {img ? (
                    <img
                        src={IMAGE_BASE + img.image_path}
                        alt={`${car.brand} ${car.model}`}
                        loading="lazy"
                        width={300}
                        height={144}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                ) : (
                    <i className="ti ti-car text-stone-300 text-4xl" />
                )}
            </div>
            <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-1.5">
                    <p className="font-semibold text-stone-900 truncate">{car.brand} {car.model}</p>
                    <span className={`flex-shrink-0 text-[11px] px-2 py-0.5 rounded-full font-medium ${s.cls}`}>{s.label}</span>
                </div>
                <p className="font-mono text-xs text-stone-400 mb-3">{car.registration_number}</p>
                <div className="flex items-center justify-between text-xs text-stone-500">
                    <span className="flex items-center gap-1"><i className={`ti ${fuel.icon} text-[14px]`} /> {fuel.label}</span>
                    <span className="flex items-center gap-1"><i className="ti ti-road text-[14px]" /> {car.mileage?.toLocaleString()} km</span>
                </div>
                <p className="mt-3 text-sm font-bold text-stone-900">
                    {parseFloat(car.daily_price).toLocaleString()} MAD
                    <span className="text-xs font-normal text-stone-400"> / jour</span>
                </p>
            </div>
        </motion.button>
    );
}

export default function Voitures() {
    const [cars, setCars]       = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError]     = useState('');
    const [search, setSearch]   = useState('');
    const [view, setView]       = useState('list');

    const [statusFilter, setStatusFilter] = useState([]);
    const [fuelFilter, setFuelFilter]     = useState([]);
    const [openSections, setOpenSections] = useState({ status: true, fuel: true });

    const navigate = useNavigate();

    useEffect(() => {
        api.get('/cars')
            .then(res => setCars(res.data))
            .catch(() => setError('Erreur lors du chargement des voitures.'))
            .finally(() => setLoading(false));
    }, []);

    const toggleFilter = (setter, value) =>
        setter(prev => prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]);

    const toggleSection = key =>
        setOpenSections(s => ({ ...s, [key]: !s[key] }));

    const hasFilters = statusFilter.length > 0 || fuelFilter.length > 0 || search;

    const filtered = cars.filter(car => {
        const q           = search.toLowerCase();
        const matchSearch = !q || car.brand.toLowerCase().includes(q) || car.model.toLowerCase().includes(q) || car.registration_number.toLowerCase().includes(q);
        const matchStatus = statusFilter.length === 0 || statusFilter.includes(car.status);
        const matchFuel   = fuelFilter.length === 0   || fuelFilter.includes(car.fuel_type);
        return matchSearch && matchStatus && matchFuel;
    });

    const resetFilters = () => { setStatusFilter([]); setFuelFilter([]); setSearch(''); };

    const stats = [
        { label: 'Total',       value: cars.length,                                          icon: 'ti-car',   color: 'text-stone-700',   bg: 'bg-stone-100' },
        { label: 'Disponibles', value: cars.filter(c => c.status === 'available').length,    icon: 'ti-check', color: 'text-emerald-700', bg: 'bg-emerald-50' },
        { label: 'Louées',      value: cars.filter(c => c.status === 'rented').length,       icon: 'ti-key',   color: 'text-blue-700',    bg: 'bg-blue-50' },
        { label: 'Maintenance', value: cars.filter(c => c.status === 'maintenance').length,  icon: 'ti-tool',  color: 'text-amber-700',   bg: 'bg-amber-50' },
    ];

    if (loading) return (
        <div className="space-y-5">
            <div className="flex justify-between">
                <div className="h-7 w-32 bg-stone-200 rounded-sm animate-pulse" />
                <div className="h-9 w-24 bg-stone-200 rounded-md animate-pulse" />
            </div>
            <div className="grid grid-cols-4 gap-3">
                {[...Array(4)].map((_, i) => <div key={i} className="h-16 bg-stone-200 rounded-lg animate-pulse" />)}
            </div>
            <div className="flex gap-6 items-start">
                <div className="flex-1 space-y-3">
                    {[...Array(4)].map((_, i) => <div key={i} className="h-40 bg-stone-200 rounded-lg animate-pulse" />)}
                </div>
                <div className="w-64 h-72 bg-stone-200 rounded-lg animate-pulse flex-shrink-0" />
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
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
                <div>
                    <h1 className="text-xl font-semibold text-stone-900">Voitures</h1>
                    <p className="text-sm text-stone-500 mt-0.5">
                        {filtered.length} résultat{filtered.length !== 1 ? 's' : ''} sur {cars.length} véhicules
                    </p>
                </div>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.94 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                    onClick={() => navigate('/voitures/ajouter')}
                    className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium px-4 py-2 rounded-md transition-colors shadow-sm"
                >
                    <i className="ti ti-plus text-[14px]" />
                    Ajouter
                </motion.button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
                {stats.map((s, index) => (
                    <motion.div
                        key={s.label}
                        initial={{ opacity: 0, y: 20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ type: 'spring', stiffness: 260, damping: 20, delay: index * 0.07 }}
                        whileHover={{ y: -3, scale: 1.03 }}
                        className={`${s.bg} rounded-lg px-4 py-3 flex items-center gap-3`}
                    >
                        <i className={`ti ${s.icon} ${s.color} text-xl`} />
                        <div>
                            <p className={`text-xl font-bold leading-none ${s.color}`}>{s.value}</p>
                            <p className={`text-xs font-medium mt-0.5 ${s.color} opacity-80`}>{s.label}</p>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Search + view toggle */}
            <div className="flex gap-3 mb-5">
                <div className="relative flex-1">
                    <i className="ti ti-search absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-[15px]" />
                    <input
                        type="text"
                        placeholder="Rechercher par marque, modèle, immatriculation…"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full bg-white border border-stone-300 text-stone-900 placeholder-stone-400 pl-9 pr-3 py-2 rounded-md text-sm focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition"
                    />
                </div>
                {hasFilters && (
                    <button
                        onClick={resetFilters}
                        className="inline-flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-800 px-3 py-2 rounded-md border border-stone-300 hover:bg-stone-50 transition"
                    >
                        <i className="ti ti-x text-[12px]" />
                        Réinitialiser
                    </button>
                )}
                <div className="flex items-center bg-white border border-stone-300 rounded-md overflow-hidden">
                    <button
                        onClick={() => setView('list')}
                        title="Vue liste"
                        className={`px-3 py-2 transition ${view === 'list' ? 'bg-emerald-600 text-white' : 'text-stone-500 hover:bg-stone-50'}`}
                    >
                        <i className="ti ti-list text-[15px]" />
                    </button>
                    <button
                        onClick={() => setView('grid')}
                        title="Vue grille"
                        className={`px-3 py-2 transition ${view === 'grid' ? 'bg-emerald-600 text-white' : 'text-stone-500 hover:bg-stone-50'}`}
                    >
                        <i className="ti ti-layout-grid text-[15px]" />
                    </button>
                </div>
            </div>

            {/* Main layout */}
            <div className="flex gap-6 items-start">

                {/* Car list / grid */}
                <div className="flex-1 min-w-0">
                    {filtered.length === 0 ? (
                        <div className="text-center py-16 text-stone-400 bg-white border border-stone-200 rounded-lg">
                            <i className="ti ti-car-off text-4xl mb-3 block" />
                            Aucune voiture trouvée.
                        </div>
                    ) : view === 'list' ? (
                        <div className="space-y-3">
                            {filtered.map((car, index) => (
                                <CarListCard key={car.id} car={car} navigate={navigate} index={index} />
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                            {filtered.map((car, index) => (
                                <CarGridCard key={car.id} car={car} navigate={navigate} index={index} />
                            ))}
                        </div>
                    )}
                </div>

                {/* Filter sidebar */}
                <div className="w-64 flex-shrink-0">
                    <div className="bg-white border border-stone-200 rounded-lg shadow-sm overflow-hidden sticky top-4">
                        <div className="px-4 py-3.5 border-b border-stone-100 flex items-center justify-between">
                            <h3 className="text-sm font-semibold text-stone-800 flex items-center gap-2">
                                <i className="ti ti-adjustments-horizontal text-emerald-500" />
                                Filtrer les véhicules
                            </h3>
                            {hasFilters && (
                                <button
                                    onClick={resetFilters}
                                    className="text-xs text-emerald-600 hover:text-emerald-800 font-medium transition"
                                >
                                    Tout effacer
                                </button>
                            )}
                        </div>

                        <div className="px-4">
                            {/* Statut */}
                            <FilterSection
                                title="Statut"
                                open={openSections.status}
                                onToggle={() => toggleSection('status')}
                            >
                                {Object.entries(STATUS).map(([key, { label, dot }]) => (
                                    <FilterCheckbox
                                        key={key}
                                        label={label}
                                        dot={dot}
                                        checked={statusFilter.includes(key)}
                                        onChange={() => toggleFilter(setStatusFilter, key)}
                                    />
                                ))}
                            </FilterSection>

                            {/* Carburant */}
                            <FilterSection
                                title="Carburant"
                                open={openSections.fuel}
                                onToggle={() => toggleSection('fuel')}
                            >
                                {Object.entries(FUEL).map(([key, { label }]) => (
                                    <FilterCheckbox
                                        key={key}
                                        label={label}
                                        checked={fuelFilter.includes(key)}
                                        onChange={() => toggleFilter(setFuelFilter, key)}
                                    />
                                ))}
                            </FilterSection>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
