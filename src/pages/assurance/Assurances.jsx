import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/api';

const fmtDate  = d => d ? new Date(d).toLocaleDateString('fr-FR') : '—';
const fmtPrice = p => p ? parseFloat(p).toLocaleString() + ' MAD' : '—';

// Liste des assurances : recherche par compagnie / n° de contrat, accès à la voiture liée.
export default function Assurances() {
    const [insurances, setInsurances] = useState([]);
    const [carsById, setCarsById]     = useState({});
    const [loading, setLoading]       = useState(true);
    const [error, setError]           = useState('');
    const [search, setSearch]         = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        Promise.all([api.get('/insurances'), api.get('/cars')])
            .then(([insRes, carsRes]) => {
                setInsurances(insRes.data);
                setCarsById(Object.fromEntries(carsRes.data.map(c => [c.id, c])));
            })
            .catch(() => setError('Erreur lors du chargement des assurances.'))
            .finally(() => setLoading(false));
    }, []);

    const filtered = insurances.filter(ins => {
        const q = search.toLowerCase();
        return ins.company.toLowerCase().includes(q)
            || ins.contract_number.toLowerCase().includes(q);
    });

    if (loading) return (
        <div className="space-y-5">
            <div className="h-7 w-32 bg-slate-200 rounded animate-pulse" />
            <div className="h-9 w-full max-w-sm bg-slate-200 rounded-lg animate-pulse" />
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="flex items-center gap-4 px-5 py-3.5 border-b border-slate-100">
                        <div className="flex-1 space-y-1.5">
                            <div className="h-3.5 bg-slate-200 rounded animate-pulse w-1/3" />
                            <div className="h-3 bg-slate-200 rounded animate-pulse w-1/5" />
                        </div>
                        <div className="h-3.5 bg-slate-200 rounded animate-pulse w-24" />
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

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-xl font-semibold text-slate-900">Assurances</h1>
                    <p className="text-sm text-slate-500 mt-0.5">{insurances.length} assurances enregistrées</p>
                </div>
                <button
                    onClick={() => navigate('/assurance/ajouter')}
                    className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition shadow-sm"
                >
                    <i className="ti ti-plus text-[14px]" />
                    Ajouter
                </button>
            </div>

            {/* Search */}
            <div className="relative mb-5 max-w-sm">
                <i className="ti ti-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[15px]" />
                <input
                    type="text"
                    placeholder="Rechercher par compagnie, n° de contrat…"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full bg-white border border-slate-300 text-slate-900 placeholder-slate-400 pl-9 pr-3 py-2 rounded-lg text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition"
                />
            </div>

            {/* Table */}
            {filtered.length === 0 ? (
                <div className="text-center py-16 text-slate-400 bg-white border border-slate-200 rounded-xl">
                    Aucune assurance trouvée.
                </div>
            ) : (
                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-slate-200 bg-slate-50">
                                {['Compagnie', 'N° de contrat', 'Voiture', 'Prix', 'Début', 'Fin', ''].map(h => (
                                    <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filtered.map(ins => (
                                <tr
                                    key={ins.id}
                                    onClick={() => navigate(`/voitures/${ins.car_id}`)}
                                    className="hover:bg-slate-50/70 transition-colors cursor-pointer"
                                >
                                    <td className="px-5 py-3.5 font-medium text-slate-900">{ins.company}</td>
                                    <td className="px-5 py-3.5 font-mono text-xs text-slate-500">{ins.contract_number}</td>
                                    <td className="px-5 py-3.5 font-mono text-xs text-slate-600">{carsById[ins.car_id]?.registration_number ?? `#${ins.car_id}`}</td>
                                    <td className="px-5 py-3.5 text-slate-600">{fmtPrice(ins.price)}</td>
                                    <td className="px-5 py-3.5 text-slate-600">{fmtDate(ins.start_date)}</td>
                                    <td className="px-5 py-3.5 text-slate-600">{fmtDate(ins.end_date)}</td>
                                    <td className="px-5 py-3.5 text-right">
                                        <button
                                            onClick={e => { e.stopPropagation(); navigate(`/assurance/${ins.id}/modifier`); }}
                                            className="w-7 h-7 inline-flex items-center justify-center rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition"
                                        >
                                            <i className="ti ti-pencil text-[14px]" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
