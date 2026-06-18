import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';

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
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="flex items-center gap-4 px-5 py-3.5 border-b border-slate-100">
                        <div className="w-10 h-10 bg-slate-200 rounded-lg animate-pulse" />
                        <div className="flex-1 space-y-1.5">
                            <div className="h-3.5 bg-slate-200 rounded animate-pulse w-1/3" />
                            <div className="h-3 bg-slate-200 rounded animate-pulse w-1/5" />
                        </div>
                        <div className="h-3.5 bg-slate-200 rounded animate-pulse w-20" />
                        <div className="h-5 bg-slate-200 rounded-full animate-pulse w-20" />
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

            {/* Table */}
            {filtered.length === 0 ? (
                <div className="text-center py-16 text-slate-400 bg-white border border-slate-200 rounded-xl">
                    Aucune voiture trouvée.
                </div>
            ) : (
                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-slate-200 bg-slate-50">
                                {['Voiture', 'Immatriculation', 'Carburant', 'Kilométrage', 'Prix / jour', 'Statut', ''].map(h => (
                                    <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filtered.map(car => {
                                const img = car.images?.find(i => i.is_primary) || car.images?.[0];
                                const s   = STATUS[car.status] || { label: car.status, cls: 'bg-slate-100 text-slate-600 ring-1 ring-slate-200' };
                                return (
                                    <tr key={car.id} className="hover:bg-slate-50/70 transition-colors">
                                        <td className="px-5 py-3.5">
                                            <div className="flex items-center gap-3">
                                                {img ? (
                                                    <img src={IMAGE_BASE + img.image_path} alt={car.brand} className="w-10 h-10 rounded-lg object-cover border border-slate-200 flex-shrink-0" />
                                                ) : (
                                                    <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center flex-shrink-0">
                                                        <i className="ti ti-car text-slate-400 text-[18px]" />
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="font-medium text-slate-900">{car.brand} {car.model}</p>
                                                    <p className="text-xs text-slate-400">{car.purchase_date}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-3.5 font-mono text-xs text-slate-500">{car.registration_number}</td>
                                        <td className="px-5 py-3.5 text-slate-600">{FUEL[car.fuel_type] || car.fuel_type}</td>
                                        <td className="px-5 py-3.5 text-slate-600">{car.mileage.toLocaleString()} km</td>
                                        <td className="px-5 py-3.5 font-semibold text-slate-900">{parseFloat(car.daily_price).toLocaleString()} MAD</td>
                                        <td className="px-5 py-3.5">
                                            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${s.cls}`}>{s.label}</span>
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <div className="flex items-center gap-3">
                                                <button onClick={() => navigate(`/voitures/${car.id}`)} className="text-xs font-medium text-indigo-600 hover:text-indigo-800 transition">Voir</button>
                                                <button className="text-xs font-medium text-slate-500 hover:text-slate-800 transition">Modifier</button>
                                                <button className="text-xs font-medium text-slate-400 hover:text-red-600 transition">Supprimer</button>
                                            </div>
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
