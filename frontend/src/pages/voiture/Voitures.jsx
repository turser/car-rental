import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/api';

const STATUS = {
    available:   { label: 'Disponible',   cls: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200' },
    rented:      { label: 'Louée',        cls: 'bg-blue-50 text-blue-700 ring-1 ring-blue-200' },
    maintenance: { label: 'Maintenance',  cls: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200' },
    unavailable: { label: 'Indisponible', cls: 'bg-red-50 text-red-600 ring-1 ring-red-200' },
};

const FUEL = { diesel: 'Diesel', petrol: 'Essence', electric: 'Électrique', hybrid: 'Hybride' };

const IMAGE_BASE = 'https://car-rental-production-59c6.up.railway.app/storage/';

export default function Voitures() {
    const [cars, setCars]         = useState([]);
    const [loading, setLoading]   = useState(true);
    const [error, setError]       = useState('');
    const [search, setSearch]     = useState('');
    const [status, setStatus]     = useState('all');
    const navigate = useNavigate();

    useEffect(() => {
        api.get('/cars')
            .then(res => setCars(res.data))
            .catch(() => setError('Erreur lors du chargement des voitures.'))
            .finally(() => setLoading(false));
    }, []);
    console.log(cars);
    const filtered = cars.filter(car => {
        const q = search.toLowerCase();
        const matchSearch = car.brand.toLowerCase().includes(q) || car.model.toLowerCase().includes(q) || car.registration_number.toLowerCase().includes(q);
        return matchSearch && (status === 'all' || car.status === status);
    });

    if (loading) return (
        <div className="space-y-5">
            <div className="flex justify-between">
                <div className="h-7 w-28 bg-slate-200 rounded animate-pulse" />
                <div className="h-9 w-24 bg-slate-200 rounded-lg animate-pulse" />
            </div>
            <div className="grid grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => <div key={i} className="h-20 bg-slate-200 rounded-xl animate-pulse" />)}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {[...Array(8)].map((_, i) => (
                    <div key={i} className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                        <div className="h-36 bg-slate-200 animate-pulse" />
                        <div className="p-4 space-y-2">
                            <div className="h-4 bg-slate-200 rounded animate-pulse w-2/3" />
                            <div className="h-3 bg-slate-200 rounded animate-pulse w-1/3" />
                            <div className="h-3 bg-slate-200 rounded animate-pulse w-1/2" />
                        </div>
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

    const stats = [
        { label: 'Total',       value: cars.length,                                        color: 'text-slate-700', bg: 'bg-slate-100' },
        { label: 'Disponibles', value: cars.filter(c => c.status === 'available').length,  color: 'text-emerald-700', bg: 'bg-emerald-50' },
        { label: 'Louées',      value: cars.filter(c => c.status === 'rented').length,     color: 'text-blue-700',  bg: 'bg-blue-50' },
        { label: 'Maintenance', value: cars.filter(c => c.status === 'maintenance').length,color: 'text-amber-700', bg: 'bg-amber-50' },
    ];

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-xl font-semibold text-slate-900">Voitures</h1>
                    <p className="text-sm text-slate-500 mt-0.5">{cars.length} véhicules enregistrés</p>
                </div>
                <button
                    onClick={() => navigate('/voitures/ajouter')}
                    className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition shadow-sm"
                >
                    <i className="ti ti-plus text-[14px]" />
                    Ajouter
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
                {stats.map(s => (
                    <div key={s.label} className={`${s.bg} rounded-xl px-4 py-3`}>
                        <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                        <p className={`text-xs font-medium mt-0.5 ${s.color} opacity-80`}>{s.label}</p>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="flex gap-3 mb-5">
                <div className="relative flex-1">
                    <i className="ti ti-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[15px]" />
                    <input
                        type="text"
                        placeholder="Rechercher par marque, modèle, immatriculation…"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full bg-white border border-slate-300 text-slate-900 placeholder-slate-400 pl-9 pr-3 py-2 rounded-lg text-sm focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition"
                    />
                </div>
                <select
                    value={status}
                    onChange={e => setStatus(e.target.value)}
                    className="bg-white border border-slate-300 text-slate-700 px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition"
                >
                    <option value="all">Tous les statuts</option>
                    <option value="available">Disponible</option>
                    <option value="rented">Louée</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="unavailable">Indisponible</option>
                </select>
            </div>

            {/* Cards */}
            {filtered.length === 0 ? (
                <div className="text-center py-16 text-slate-400 bg-white border border-slate-200 rounded-xl">
                    Aucune voiture trouvée.
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filtered.map(car => {
                        const img = car.images?.find(i => i.is_primary) || car.images?.[0];
                        const s   = STATUS[car.status] || { label: car.status, cls: 'bg-slate-100 text-slate-600 ring-1 ring-slate-200' };
                        return (
                            <button
                                key={car.id}
                                onClick={() => navigate(`/voitures/${car.id}`)}
                                className="text-left bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md hover:border-indigo-200 transition overflow-hidden group"
                            >
                                <div className="h-36 bg-slate-100 border-b border-slate-200 flex items-center justify-center overflow-hidden">
                                    {img ? (
                                        <img src={IMAGE_BASE + img.image_path} alt={car.brand} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                                    ) : (
                                        <i className="ti ti-car text-slate-300 text-4xl" />
                                    )}
                                </div>
                                <div className="p-4">
                                    <div className="flex items-start justify-between gap-2 mb-1.5">
                                        <p className="font-semibold text-slate-900 truncate">{car.brand} {car.model}</p>
                                        <span className={`flex-shrink-0 text-[11px] px-2 py-0.5 rounded-full font-medium ${s.cls}`}>{s.label}</span>
                                    </div>
                                    <p className="font-mono text-xs text-slate-400 mb-3">{car.registration_number}</p>
                                    <div className="flex items-center justify-between text-xs text-slate-500">
                                        <span className="flex items-center gap-1"><i className="ti ti-gas-station text-[14px]" /> {FUEL[car.fuel_type] || car.fuel_type}</span>
                                        <span className="flex items-center gap-1"><i className="ti ti-road text-[14px]" /> {car.mileage.toLocaleString()} km</span>
                                    </div>
                                    <p className="mt-3 text-sm font-bold text-slate-900">{parseFloat(car.daily_price).toLocaleString()} MAD<span className="text-xs font-normal text-slate-400"> / jour</span></p>
                                </div>
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
