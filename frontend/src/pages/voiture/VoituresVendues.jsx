import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../../api/api';

const fmtDate  = d => d ? new Date(d).toLocaleDateString('fr-FR') : '—';
const fmtPrice = p => (p || p === 0) ? parseFloat(p).toLocaleString() + ' MAD' : '—';

const extractList = data => {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data?.data?.data)) return data.data.data;
    return [];
};

// Liste des voitures vendues : recherche par acheteur ou véhicule.
export default function VoituresVendues() {
    const [sales, setSales]     = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError]     = useState('');
    const [search, setSearch]   = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        api.get('/carsale')
            .then(res => setSales(extractList(res.data)))
            .catch(() => setError('Erreur lors du chargement des ventes.'))
            .finally(() => setLoading(false));
    }, []);

    const filtered = sales.filter(s => {
        const q = search.toLowerCase();
        return s.buyerName?.toLowerCase().includes(q)
            || s.car?.brand?.toLowerCase().includes(q)
            || s.car?.model?.toLowerCase().includes(q)
            || s.car?.plateNumber?.toLowerCase().includes(q);
    });

    if (loading) return (
        <div className="space-y-5">
            <div className="h-7 w-40 bg-stone-200 rounded-sm animate-pulse" />
            <div className="h-9 w-full max-w-sm bg-stone-200 rounded-md animate-pulse" />
            <div className="bg-white border border-stone-200 rounded-lg overflow-hidden">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="flex items-center gap-4 px-5 py-3.5 border-b border-stone-100">
                        <div className="w-9 h-9 bg-stone-200 rounded-lg animate-pulse" />
                        <div className="flex-1 space-y-1.5">
                            <div className="h-3.5 bg-stone-200 rounded-sm animate-pulse w-1/3" />
                            <div className="h-3 bg-stone-200 rounded-sm animate-pulse w-1/5" />
                        </div>
                        <div className="h-3.5 bg-stone-200 rounded-sm animate-pulse w-24" />
                    </div>
                ))}
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
            <div className="flex items-center gap-3 mb-6">
                <button
                    onClick={() => navigate('/voitures')}
                    className="w-8 h-8 rounded-md border border-stone-200 bg-white flex items-center justify-center text-stone-500 hover:bg-stone-50 transition flex-shrink-0"
                >
                    <i className="ti ti-arrow-left text-[15px]" />
                </button>
                <div>
                    <h1 className="text-xl font-semibold text-stone-900">Voitures vendues</h1>
                    <p className="text-sm text-stone-500 mt-0.5">{sales.length} voiture{sales.length !== 1 ? 's' : ''} vendue{sales.length !== 1 ? 's' : ''}</p>
                </div>
            </div>

            {/* Search */}
            <div className="relative mb-5 max-w-sm">
                <i className="ti ti-search absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-[15px]" />
                <input
                    type="text"
                    placeholder="Rechercher par acheteur, voiture…"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full bg-white border border-stone-300 text-stone-900 placeholder-stone-400 pl-9 pr-3 py-2 rounded-md text-sm focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition"
                />
            </div>

            {/* Table */}
            {filtered.length === 0 ? (
                <div className="text-center py-16 text-stone-400 bg-white border border-stone-200 rounded-lg">
                    Aucune vente trouvée.
                </div>
            ) : (
                <div className="bg-white border border-stone-200 rounded-lg overflow-hidden shadow-sm">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-stone-200 bg-stone-50">
                                {['Voiture', 'Acheteur', 'Date de vente', 'Prix de vente', 'Profit'].map(h => (
                                    <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wider">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100">
                            {filtered.map((s, index) => (
                                <motion.tr
                                    key={s.saleId}
                                    initial={{ opacity: 0, x: -16 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ type: 'spring', stiffness: 300, damping: 26, delay: index * 0.04 }}
                                    className="hover:bg-stone-50/70 transition-colors"
                                >
                                    <td className="px-5 py-3.5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-lg bg-stone-100 overflow-hidden flex-shrink-0 flex items-center justify-center">
                                                {s.car?.image ? (
                                                    <img src={s.car.image} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <i className="ti ti-car text-stone-300 text-[16px]" />
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-medium text-stone-900">{s.car?.brand} {s.car?.model}</p>
                                                <p className="font-mono text-xs text-stone-400">{s.car?.plateNumber}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-5 py-3.5 text-stone-600">{s.buyerName}</td>
                                    <td className="px-5 py-3.5 text-stone-600">{fmtDate(s.saleDate)}</td>
                                    <td className="px-5 py-3.5 font-semibold text-stone-900">{fmtPrice(s.salePrice)}</td>
                                    <td className="px-5 py-3.5">
                                        <span className={`font-semibold ${s.profit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                            {s.profit >= 0 ? '+' : ''}{fmtPrice(s.profit)}
                                        </span>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
