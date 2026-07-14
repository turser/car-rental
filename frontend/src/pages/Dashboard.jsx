import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../api/api';

const fmtPrice   = p => (p || p === 0) ? parseFloat(p).toLocaleString() + ' MAD' : '—';
const fmtDay     = d => d ? new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }) : '—';
const fmtDateFull = d => d ? new Date(d).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }) : '—';

const PERIOD_OPTIONS = [
    { value: 'daily',   label: 'Jour' },
    { value: 'monthly', label: 'Mois' },
    { value: 'yearly',  label: 'Année' },
];
const PERIOD_TITLE = { daily: 'Activité du jour', monthly: 'Activité du mois', yearly: "Activité de l'année" };

// Les clés des séries du graphique varient selon la période (heure/jour/mois) et leur format exact
// dépend du backend ; on tente un parsing Date et on retombe sur la clé brute si ça échoue.
const fmtChartLabel = (key, period) => {
    const d = new Date(period === 'yearly' && /^\d+$/.test(key) ? `2000-${String(key).padStart(2, '0')}-01` : key);
    if (isNaN(d)) return String(key);
    if (period === 'daily') return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    if (period === 'yearly') return d.toLocaleDateString('fr-FR', { month: 'short' });
    return fmtDay(key);
};

const SERIES = {
    Réservations: { stroke: '#059669', dot: '#059669' }, // emerald-600
    Paiements:    { stroke: '#2563eb', dot: '#2563eb' }, // blue-600
};

const FUEL_OPTIONS = [
    { value: '',        label: 'Tous carburants' },
    { value: 'essence', label: 'Essence' },
    { value: 'diesel',  label: 'Diesel' },
    { value: 'electric', label: 'Électrique' },
    { value: 'hybrid',  label: 'Hybride' },
];

// Valeurs réelles de fuel_type en base (incohérentes entre "petrol" et "gasoline" pour l'essence).
const FUEL_MATCH = {
    essence: ['petrol', 'gasoline', 'essence'],
    diesel: ['diesel'],
    electric: ['electric'],
    hybrid: ['hybrid'],
};

const FUEL_ICON = {
    diesel:   { label: 'Diesel',     icon: 'ti-droplet' },
    petrol:   { label: 'Essence',    icon: 'ti-gas-station' },
    gasoline: { label: 'Essence',    icon: 'ti-gas-station' },
    electric: { label: 'Électrique', icon: 'ti-bolt' },
    hybrid:   { label: 'Hybride',    icon: 'ti-leaf' },
};

const ALERT_DEFS = [
    { key: 'rentalsEndingToday',    icon: 'ti-clock-hour-4', label: 'Retours prévus aujourd\'hui' },
    { key: 'rentalsEndingSoon',     icon: 'ti-calendar-due',  label: 'Retours prévus bientôt' },
    { key: 'unpaidRentals',         icon: 'ti-receipt-off',   label: 'Réservations impayées' },
    { key: 'insuranceExpiringSoon', icon: 'ti-shield-off',    label: 'Assurances qui expirent' },
    { key: 'taxExpiringSoon',       icon: 'ti-file-alert',    label: 'Impôts qui expirent' },
    { key: 'longMaintenance',       icon: 'ti-tool',          label: 'Maintenances longues' },
];

const inputCls = 'w-full bg-white border border-stone-300 text-stone-900 placeholder-stone-400 px-3 py-2 rounded-md text-sm focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition';

function AvailableCarsModal({ dates, onClose, navigate }) {
    const [filters, setFilters] = useState({ brand: '', fuelType: '', minPrice: '', maxPrice: '', maxMileage: '' });
    const [results, setResults] = useState(null);
    const [searching, setSearching] = useState(false);
    const [searchError, setSearchError] = useState('');
    const [imagesById, setImagesById] = useState({});

    const setFilter = (key, val) => setFilters(f => ({ ...f, [key]: val }));

    const runSearch = async (activeFilters) => {
        setSearching(true);
        setSearchError('');
        try {
            // fuelType filtré côté client : /available valide "essence" mais les voitures stockent
            // fuel_type en "petrol"/"gasoline", donc le filtre serveur renvoie 0 résultat à tort.
            const { fuelType, ...apiFilters } = activeFilters;
            const params = Object.fromEntries(Object.entries({ ...dates, ...apiFilters }).filter(([, v]) => v !== ''));
            const res = await api.get('/available', { params });
            let cars = res.data?.data ?? [];
            if (fuelType) {
                const matches = FUEL_MATCH[fuelType] ?? [fuelType];
                cars = cars.filter(c => matches.includes((c.fuelType || '').toLowerCase()));
            }
            setResults(cars);
        } catch {
            setSearchError('Erreur lors de la recherche.');
            setResults(null);
        } finally {
            setSearching(false);
        }
    };

    useEffect(() => {
        runSearch(filters);
        // /available ne renvoie pas les photos des voitures ; on les récupère depuis /cars (même source que la page Voitures).
        api.get('/cars')
            .then(res => {
                const carsList = Array.isArray(res.data) ? res.data : res.data?.data ?? [];
                const map = Object.fromEntries(carsList.map(c => {
                    const img = c.images?.find(i => i.is_primary) || c.images?.[0];
                    return [c.id, img?.image_path ?? null];
                }));
                setImagesById(map);
            })
            .catch(() => {});
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const handleFilter = (e) => {
        e.preventDefault();
        runSearch(filters);
    };

    const reserve = (car) => navigate('/reservations/ajouter', {
        state: { carId: car.id, startDate: dates.startDate, expectedReturnDate: dates.endDate },
    });

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[85vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100 flex-shrink-0">
                    <div>
                        <h3 className="text-base font-semibold text-stone-900 flex items-center gap-2">
                            <i className="ti ti-car-suv text-emerald-500" /> Voitures disponibles
                        </h3>
                        <p className="text-xs text-stone-500 mt-0.5">{fmtDay(dates.startDate)} → {fmtDay(dates.endDate)}</p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-7 h-7 rounded-md flex items-center justify-center text-stone-400 hover:bg-stone-100 hover:text-stone-600 transition"
                    >
                        <i className="ti ti-x text-[15px]" />
                    </button>
                </div>

                <div className="flex flex-1 min-h-0">
                    {/* Voitures */}
                    <div className="flex-1 overflow-y-auto p-5">
                        {searchError && (
                            <div className="flex items-center gap-2 bg-red-50 text-red-600 px-3 py-2 rounded-md border border-red-200 text-xs mb-4">
                                <i className="ti ti-alert-circle" /> {searchError}
                            </div>
                        )}

                        {results && (
                            results.length === 0 ? (
                                <div className="text-center py-8 text-stone-400 text-sm">
                                    <i className="ti ti-car-off text-2xl mb-1.5 block" />
                                    Aucune voiture disponible pour ces critères.
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {results.map((car, index) => {
                                        const img = car.image ?? imagesById[car.id];
                                        const fuel = FUEL_ICON[(car.fuelType || '').toLowerCase()] ?? { label: car.fuelType, icon: 'ti-gas-station' };
                                        return (
                                            <motion.div
                                                key={car.id}
                                                initial={{ opacity: 0, y: 16, scale: 0.97 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                transition={{ type: 'spring', stiffness: 280, damping: 24, delay: index * 0.05 }}
                                                whileHover={{ y: -3 }}
                                                className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg hover:border-emerald-200 transition-all"
                                            >
                                                <div className="relative h-32 bg-stone-100">
                                                    {img ? (
                                                        <img src={img} alt={`${car.brand} ${car.model}`} loading="lazy" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center">
                                                            <i className="ti ti-car text-stone-300 text-4xl" />
                                                        </div>
                                                    )}
                                                    <div className="absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />
                                                    <span className="absolute bottom-2.5 right-2.5 inline-flex items-baseline gap-1 bg-white/95 backdrop-blur text-stone-900 text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">
                                                        {fmtPrice(car.dailyPrice)}
                                                        <span className="font-normal text-stone-500 text-[10px]">/j</span>
                                                    </span>
                                                </div>
                                                <div className="p-3.5">
                                                    <p className="font-semibold text-stone-900 text-sm truncate">{car.brand} {car.model}</p>
                                                    <p className="font-mono text-xs text-stone-400 mt-0.5">{car.registrationNumber}</p>
                                                    <div className="flex items-center gap-1.5 mt-2.5 flex-wrap">
                                                        <span className="inline-flex items-center gap-1 bg-stone-50 border border-stone-100 rounded-full px-2 py-0.5 text-[11px] text-stone-600">
                                                            <i className={`ti ${fuel.icon} text-[12px]`} /> {fuel.label}
                                                        </span>
                                                        <span className="inline-flex items-center gap-1 bg-stone-50 border border-stone-100 rounded-full px-2 py-0.5 text-[11px] text-stone-600">
                                                            <i className="ti ti-road text-[12px]" /> {car.mileage?.toLocaleString() ?? 0} km
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-stone-400 mt-2">Total séjour : <span className="font-semibold text-stone-600">{fmtPrice(car.estimatedTotal)}</span></p>
                                                    <motion.button
                                                        whileHover={{ scale: 1.02 }}
                                                        whileTap={{ scale: 0.97 }}
                                                        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                                                        onClick={() => reserve(car)}
                                                        className="w-full mt-3 inline-flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold py-2 rounded-lg transition shadow-sm"
                                                    >
                                                        <i className="ti ti-calendar-plus text-[13px]" /> Réserver
                                                    </motion.button>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            )
                        )}
                    </div>

                    {/* Filtres */}
                    <div className="w-60 flex-shrink-0 border-l border-stone-100 p-5 overflow-y-auto">
                        <form onSubmit={handleFilter} className="space-y-3">
                            <div>
                                <label className="block text-xs font-medium text-stone-600 mb-1.5">Marque</label>
                                <input type="text" placeholder="ex : Dacia" value={filters.brand} onChange={e => setFilter('brand', e.target.value)} className={inputCls} />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-stone-600 mb-1.5">Carburant</label>
                                <select value={filters.fuelType} onChange={e => setFilter('fuelType', e.target.value)} className={inputCls}>
                                    {FUEL_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-stone-600 mb-1.5">Kilométrage max</label>
                                <input type="number" min="0" placeholder="km" value={filters.maxMileage} onChange={e => setFilter('maxMileage', e.target.value)} className={inputCls} />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-stone-600 mb-1.5">Prix min</label>
                                <input type="number" min="0" placeholder="MAD" value={filters.minPrice} onChange={e => setFilter('minPrice', e.target.value)} className={inputCls} />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-stone-600 mb-1.5">Prix max</label>
                                <input type="number" min="0" placeholder="MAD" value={filters.maxPrice} onChange={e => setFilter('maxPrice', e.target.value)} className={inputCls} />
                            </div>
                            <button
                                type="submit"
                                disabled={searching}
                                className="w-full inline-flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-medium px-4 py-2 rounded-md transition-colors shadow-sm h-[38px]"
                            >
                                <i className="ti ti-filter text-[14px]" />
                                {searching ? 'Recherche…' : 'Filtrer'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

function AvailableCarsSearch() {
    const navigate = useNavigate();
    const [dates, setDates] = useState({ startDate: '', endDate: '' });
    const [modalDates, setModalDates] = useState(null);

    const setDate = (key, val) => setDates(d => ({ ...d, [key]: val }));

    const handleSearch = (e) => {
        e.preventDefault();
        if (!dates.startDate || !dates.endDate) return;
        setModalDates(dates);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 22, delay: 0.08 }}
            className="bg-white border border-stone-200 rounded-2xl shadow-sm p-5 mb-5"
        >
            <h2 className="text-sm font-semibold text-stone-700 flex items-center gap-2 mb-4">
                <i className="ti ti-car-suv text-emerald-500" /> Rechercher une voiture disponible
            </h2>
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row items-stretch gap-3">
                <div className="flex-1 min-w-0">
                    <label className="block text-xs font-medium text-stone-600 mb-1.5">Début <span className="text-emerald-500">*</span></label>
                    <div className="relative">
                        <i className="ti ti-calendar-event absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 text-[15px] pointer-events-none" />
                        <input
                            type="date"
                            required
                            value={dates.startDate}
                            onChange={e => setDate('startDate', e.target.value)}
                            style={{ height: 44, boxSizing: 'border-box' }}
                            className="w-full bg-stone-50 border border-stone-200 text-stone-900 pl-10 pr-3 rounded-xl text-sm focus:outline-none focus:bg-white focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition"
                        />
                    </div>
                </div>
                <div className="flex-1 min-w-0">
                    <label className="block text-xs font-medium text-stone-600 mb-1.5">Fin <span className="text-emerald-500">*</span></label>
                    <div className="relative">
                        <i className="ti ti-calendar-event absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 text-[15px] pointer-events-none" />
                        <input
                            type="date"
                            required
                            value={dates.endDate}
                            onChange={e => setDate('endDate', e.target.value)}
                            style={{ height: 44, boxSizing: 'border-box' }}
                            className="w-full bg-stone-50 border border-stone-200 text-stone-900 pl-10 pr-3 rounded-xl text-sm focus:outline-none focus:bg-white focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition"
                        />
                    </div>
                </div>
                <div className="flex-1 min-w-0">
                    <label className="hidden sm:block text-xs font-medium text-transparent mb-1.5 select-none">·</label>
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.97 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                        type="submit"
                        disabled={!dates.startDate || !dates.endDate}
                        style={{ height: 44, boxSizing: 'border-box' }}
                        className="w-full inline-flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
                    >
                        <i className="ti ti-search text-[15px]" />
                        Rechercher
                    </motion.button>
                </div>
            </form>

            <AnimatePresence>
                {modalDates && (
                    <AvailableCarsModal dates={modalDates} onClose={() => setModalDates(null)} navigate={navigate} />
                )}
            </AnimatePresence>
        </motion.div>
    );
}

function ChartTooltip({ active, payload, label }) {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-white border border-stone-200 rounded-lg shadow-lg px-3.5 py-2.5 text-xs">
            <p className="font-semibold text-stone-900 mb-1.5">{label}</p>
            <div className="space-y-1">
                {payload.map(p => (
                    <div key={p.name} className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: p.color }} />
                        <span className="text-stone-500">{p.name}</span>
                        <span className="font-semibold text-stone-900 ml-auto">{p.value}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default function Dashboard() {
    const user = useSelector(state => state.auth.user);
    const isAdmin = user?.role === 'admin';
    const navigate = useNavigate();

    const [data, setData]       = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError]     = useState('');
    const [period, setPeriod]   = useState('monthly');
    const [date, setDate]       = useState(() => new Date().toISOString().slice(0, 10));

    useEffect(() => {
        setLoading(true);
        api.get('/dashboard', { params: { period, date } })
            .then(res => setData(res.data?.data ?? res.data))
            .catch(() => setError('Erreur lors du chargement du tableau de bord.'))
            .finally(() => setLoading(false));
    }, [period, date]);

    if (loading) return (
        <div className="space-y-5">
            <div className="h-7 w-56 bg-stone-200 rounded-sm animate-pulse" />
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-stone-200 rounded-2xl animate-pulse" />)}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                <div className="lg:col-span-2 h-80 bg-stone-200 rounded-2xl animate-pulse" />
                <div className="h-80 bg-stone-200 rounded-2xl animate-pulse" />
            </div>
        </div>
    );

    if (error || !data) return (
        <div className="flex items-center gap-2 bg-red-50 text-red-600 px-4 py-3 rounded-lg border border-red-200 text-sm max-w-md">
            <i className="ti ti-alert-circle" /> {error || 'Aucune donnée disponible.'}
        </div>
    );

    const { general, financial, charts, latestRentals = [], alerts = {} } = data;

    const chartData = Object.keys(charts?.rentals ?? {}).map(key => ({
        date: fmtChartLabel(key, period),
        Réservations: charts.rentals[key],
        Paiements: charts.payments?.[key] ?? 0,
    }));
    const tickInterval = Math.max(0, Math.ceil(chartData.length / 8) - 1);

    const kpis = [
        { label: 'Véhicules disponibles', value: `${general.cars.available}/${general.cars.total}`, icon: 'ti-car',          accent: 'text-emerald-700 bg-emerald-50' },
        { label: 'Réservations en cours', value: general.rentals.active,                             icon: 'ti-key',          accent: 'text-blue-700 bg-blue-50' },
        ...(isAdmin ? [{ label: 'Revenus (période)', value: fmtPrice(financial.totalRevenue), icon: 'ti-cash', accent: 'text-stone-700 bg-stone-100' }] : []),
        { label: 'Reste à encaisser',     value: fmtPrice(financial.totalRemaining),                  icon: 'ti-hourglass',    accent: 'text-amber-700 bg-amber-50' },
    ];

    const fleet = [
        { label: 'Disponibles',  value: general.cars.available,   bar: 'bg-emerald-500', text: 'text-emerald-700' },
        { label: 'Louées',       value: general.cars.rented,      bar: 'bg-blue-500',    text: 'text-blue-700' },
        { label: 'Maintenance',  value: general.cars.maintenance, bar: 'bg-amber-500',   text: 'text-amber-700' },
    ];
    const fleetTotal = general.cars.total || 1;

    const activeAlerts = ALERT_DEFS.map(a => ({ ...a, count: alerts[a.key] ?? 0 })).filter(a => a.count > 0);

    return (
        <div className="max-w-7xl">

            {/* Header */}
            <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
                <div>
                    <h1 className="text-xl font-semibold text-stone-900">
                        Bonjour{user?.name ? `, ${user.name.split(' ')[0]}` : ''}
                    </h1>
                    <p className="text-sm text-stone-500 mt-0.5 capitalize">{fmtDateFull(new Date())}</p>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                    {(data.from && data.to) && (
                        <span className="hidden sm:inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-white border border-stone-200 text-stone-500 font-medium">
                            <i className="ti ti-calendar text-[13px]" />
                            {fmtDay(data.from)} → {fmtDay(data.to)}
                        </span>
                    )}
                    <input
                        type="date"
                        value={date}
                        onChange={e => setDate(e.target.value)}
                        className="bg-white border border-stone-200 text-stone-700 text-xs font-medium px-2.5 py-1.5 rounded-md focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition"
                    />
                    <div className="inline-flex rounded-md border border-stone-200 overflow-hidden bg-white">
                        {PERIOD_OPTIONS.map(opt => (
                            <button
                                key={opt.value}
                                type="button"
                                onClick={() => setPeriod(opt.value)}
                                className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                                    period === opt.value ? 'bg-emerald-600 text-white' : 'text-stone-500 hover:bg-stone-50'
                                }`}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* KPIs */}
            <div className={`grid grid-cols-2 gap-4 mb-5 ${kpis.length >= 4 ? 'lg:grid-cols-4' : 'lg:grid-cols-3'}`}>
                {kpis.map((kpi, index) => (
                    <motion.div
                        key={kpi.label}
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ type: 'spring', stiffness: 260, damping: 22, delay: index * 0.06 }}
                        whileHover={{ y: -3 }}
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

            {/* Recherche de voiture disponible */}
            <AvailableCarsSearch />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">

                {/* Chart activité */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 22, delay: 0.1 }}
                    className="lg:col-span-2 bg-white border border-stone-200 rounded-2xl shadow-sm p-5"
                >
                    <div className="flex items-center justify-between mb-1 flex-wrap gap-3">
                        <h2 className="text-sm font-semibold text-stone-700 flex items-center gap-2">
                            <i className="ti ti-chart-line text-emerald-500" /> {PERIOD_TITLE[period]}
                        </h2>
                        <div className="flex items-center gap-4">
                            {Object.entries(SERIES).map(([name, c]) => (
                                <span key={name} className="inline-flex items-center gap-1.5 text-xs text-stone-500">
                                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: c.dot }} />
                                    {name}
                                </span>
                            ))}
                        </div>
                    </div>
                    <div className="h-64 mt-3 -ml-2">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                                <CartesianGrid vertical={false} stroke="#f1f0ef" />
                                <XAxis
                                    dataKey="date"
                                    interval={tickInterval}
                                    tick={{ fontSize: 11, fill: '#a8a29e' }}
                                    axisLine={{ stroke: '#e7e5e4' }}
                                    tickLine={false}
                                />
                                <YAxis
                                    allowDecimals={false}
                                    width={28}
                                    tick={{ fontSize: 11, fill: '#a8a29e' }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <Tooltip content={<ChartTooltip />} cursor={{ stroke: '#e7e5e4', strokeWidth: 1 }} />
                                <Line
                                    type="monotone"
                                    dataKey="Réservations"
                                    stroke={SERIES.Réservations.stroke}
                                    strokeWidth={2}
                                    dot={false}
                                    activeDot={{ r: 5, strokeWidth: 2, stroke: '#fff' }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="Paiements"
                                    stroke={SERIES.Paiements.stroke}
                                    strokeWidth={2}
                                    dot={false}
                                    activeDot={{ r: 5, strokeWidth: 2, stroke: '#fff' }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* Colonne droite — flotte + alertes */}
                <div className="space-y-5">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ type: 'spring', stiffness: 260, damping: 22, delay: 0.12 }}
                        className="bg-white border border-stone-200 rounded-2xl shadow-sm p-5"
                    >
                        <h2 className="text-sm font-semibold text-stone-700 flex items-center gap-2 mb-4">
                            <i className="ti ti-car text-emerald-500" /> État du parc
                        </h2>
                        <div className="flex w-full h-2.5 rounded-full overflow-hidden bg-stone-100 mb-4">
                            {fleet.map(f => (
                                <div
                                    key={f.label}
                                    className={`${f.bar} h-full transition-all`}
                                    style={{ width: `${(f.value / fleetTotal) * 100}%` }}
                                />
                            ))}
                        </div>
                        <div className="space-y-2.5">
                            {fleet.map(f => (
                                <div key={f.label} className="flex items-center justify-between text-sm">
                                    <span className="flex items-center gap-2 text-stone-600">
                                        <span className={`w-2 h-2 rounded-full ${f.bar}`} /> {f.label}
                                    </span>
                                    <span className={`font-semibold ${f.text}`}>{f.value}</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ type: 'spring', stiffness: 260, damping: 22, delay: 0.16 }}
                        className="bg-white border border-stone-200 rounded-2xl shadow-sm p-5"
                    >
                        <h2 className="text-sm font-semibold text-stone-700 flex items-center gap-2 mb-4">
                            <i className="ti ti-bell text-amber-500" /> Alertes
                        </h2>
                        {activeAlerts.length === 0 ? (
                            <div className="text-center py-6 text-stone-400">
                                <i className="ti ti-mood-smile text-2xl" />
                                <p className="text-xs mt-1.5">Rien à signaler.</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {activeAlerts.map((a, index) => (
                                    <motion.div
                                        key={a.key}
                                        initial={{ opacity: 0, x: 12 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ type: 'spring', stiffness: 300, damping: 26, delay: index * 0.05 }}
                                        className="flex items-center gap-3 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2.5"
                                    >
                                        <div className="w-7 h-7 rounded-md bg-amber-100 text-amber-700 flex items-center justify-center flex-shrink-0">
                                            <i className={`ti ${a.icon} text-[14px]`} />
                                        </div>
                                        <span className="text-xs text-amber-800 flex-1">{a.label}</span>
                                        <span className="text-sm font-bold text-amber-700">{a.count}</span>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </motion.div>
                </div>
            </div>

            {/* Dernières réservations */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 260, damping: 22, delay: 0.2 }}
                className="bg-white border border-stone-200 rounded-2xl shadow-sm overflow-hidden mt-5"
            >
                <div className="px-5 py-4 border-b border-stone-100">
                    <h2 className="text-sm font-semibold text-stone-700 flex items-center gap-2">
                        <i className="ti ti-calendar-event text-emerald-500" /> Dernières réservations
                    </h2>
                </div>
                {latestRentals.length === 0 ? (
                    <div className="text-center py-10 text-stone-400 text-sm">Aucune réservation récente.</div>
                ) : (
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-stone-50 border-b border-stone-100">
                                {['Véhicule', 'Client', 'Période', 'Total', 'Reste'].map(h => (
                                    <th key={h} className="px-5 py-2.5 text-left text-xs font-semibold text-stone-500 uppercase tracking-wider">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100">
                            {latestRentals.map((r, index) => (
                                <motion.tr
                                    key={r.id}
                                    initial={{ opacity: 0, x: -12 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ type: 'spring', stiffness: 300, damping: 26, delay: index * 0.05 }}
                                    onClick={() => navigate(`/reservations/${r.id}`)}
                                    className="hover:bg-stone-50/70 transition-colors cursor-pointer"
                                >
                                    <td className="px-5 py-3 font-medium text-stone-900">{r.car || '—'}</td>
                                    <td className="px-5 py-3 text-stone-500">{r.client || '—'}</td>
                                    <td className="px-5 py-3 text-stone-600 whitespace-nowrap">{fmtDay(r.startDate)} → {fmtDay(r.endDate)}</td>
                                    <td className="px-5 py-3 font-semibold text-stone-900">{fmtPrice(r.totalPrice)}</td>
                                    <td className="px-5 py-3">
                                        <span className={r.remaining > 0 ? 'text-amber-700 font-medium' : 'text-emerald-600 font-medium'}>
                                            {fmtPrice(r.remaining)}
                                        </span>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </motion.div>
        </div>
    );
}
